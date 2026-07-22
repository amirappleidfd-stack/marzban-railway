"""
MHRV Tunnel Panel - Backend API
FastAPI backend for managing tunnel configurations, sessions, and traffic monitoring.
"""

import os
import sqlite3
import secrets
import time
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

# ── Database ──────────────────────────────────────────────────────────────

DB_PATH = os.environ.get("DB_PATH", "/app/data/tunnel.db")


def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """Initialize database tables."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            protocol TEXT NOT NULL DEFAULT 'tcp',
            destination TEXT NOT NULL DEFAULT '',
            source_ip TEXT NOT NULL DEFAULT '0.0.0.0',
            connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            traffic_bytes INTEGER DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'active'
        );

        CREATE TABLE IF NOT EXISTS traffic (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            download_bytes INTEGER DEFAULT 0,
            upload_bytes INTEGER DEFAULT 0,
            hour_of_day INTEGER DEFAULT 0,
            day_of_month INTEGER DEFAULT 0,
            month INTEGER DEFAULT 0,
            year INTEGER DEFAULT 2025
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Insert default settings
    defaults = {
        "tunnel_name": "mhrv-tunnel",
        "domain": "",
        "railway_domain": "",
        "port": "8080",
        "max_connections": "100",
        "tcp_enabled": "true",
        "udp_enabled": "true",
        "tunnel_auth_key": secrets.token_hex(12),
        "auth_enabled": "false",
        "rate_limit_enabled": "false",
        "firewall_enabled": "false",
        "ip_block_enabled": "false",
        "endpoint_tunnel": "/tunnel",
        "endpoint_batch": "/batch",
        "endpoint_health": "/health",
        "timeout": "30",
        "buffer_size": "8192",
        "batch_size": "100",
    }

    for key, value in defaults.items():
        cursor.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
            (key, value),
        )

    # Seed some demo traffic data
    now = datetime.now()
    existing = cursor.execute("SELECT COUNT(*) FROM traffic").fetchone()[0]
    if existing == 0:
        for i in range(24):
            dl = secrets.randbelow(50_000_000) + 1_000_000
            ul = secrets.randbelow(20_000_000) + 500_000
            cursor.execute(
                "INSERT INTO traffic (download_bytes, upload_bytes, hour_of_day, day_of_month, month, year) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (dl, ul, i, now.day, now.month, now.year),
            )

    # Seed demo sessions
    existing_sessions = cursor.execute("SELECT COUNT(*) FROM sessions").fetchone()[0]
    if existing_sessions == 0:
        demo_sessions = [
            ("sess-001", "tcp", "example.com:443", "192.168.1.10", "active", 1024000),
            ("sess-002", "tcp", "cdn.example.com:443", "10.0.0.5", "active", 2048000),
            ("sess-003", "udp", "media.example.com:8080", "172.16.0.1", "active", 512000),
            ("sess-004", "tcp", "api.example.com:443", "192.168.2.20", "idle", 256000),
            ("sess-005", "tcp", "ws.example.com:443", "10.1.1.1", "active", 768000),
        ]
        for sid, proto, dest, ip, status, traffic in demo_sessions:
            cursor.execute(
                "INSERT INTO sessions (id, protocol, destination, source_ip, status, traffic_bytes) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (sid, proto, dest, ip, status, traffic),
            )

    conn.commit()
    conn.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


# ── App ───────────────────────────────────────────────────────────────────

app = FastAPI(
    title="MHRV Tunnel Panel",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ────────────────────────────────────────────────────────────────


class ConfigUpdate(BaseModel):
    tunnel_name: Optional[str] = None
    domain: Optional[str] = None
    railway_domain: Optional[str] = None
    port: Optional[str] = None
    max_connections: Optional[str] = None
    tcp_enabled: Optional[str] = None
    udp_enabled: Optional[str] = None
    auth_enabled: Optional[str] = None
    rate_limit_enabled: Optional[str] = None
    firewall_enabled: Optional[str] = None
    ip_block_enabled: Optional[str] = None
    endpoint_tunnel: Optional[str] = None
    endpoint_batch: Optional[str] = None
    endpoint_health: Optional[str] = None
    timeout: Optional[str] = None
    buffer_size: Optional[str] = None
    batch_size: Optional[str] = None


class SecurityUpdate(BaseModel):
    auth_enabled: Optional[str] = None
    rate_limit_enabled: Optional[str] = None
    firewall_enabled: Optional[str] = None
    ip_block_enabled: Optional[str] = None


class SecretResponse(BaseModel):
    secret: str
    env_line: str


# ── API Routes ────────────────────────────────────────────────────────────


@app.get("/api/status")
def get_status():
    """Get tunnel status and system metrics."""
    conn = get_db()

    # Count active sessions
    active_tcp = conn.execute(
        "SELECT COUNT(*) FROM sessions WHERE status='active' AND protocol='tcp'"
    ).fetchone()[0]
    active_udp = conn.execute(
        "SELECT COUNT(*) FROM sessions WHERE status='active' AND protocol='udp'"
    ).fetchone()[0]

    # Total traffic
    total = conn.execute(
        "SELECT COALESCE(SUM(download_bytes), 0) + COALESCE(SUM(upload_bytes), 0) FROM traffic"
    ).fetchone()[0]

    conn.close()

    # Simulated system metrics (in production, use psutil/procfs)
    uptime_seconds = int(time.time() - app.state.start_time) if hasattr(app.state, "start_time") else 0
    hours = uptime_seconds // 3600
    minutes = (uptime_seconds % 3600) // 60

    return {
        "status": "online",
        "uptime": f"{hours}h {minutes}m",
        "cpu_usage": 23.5,
        "ram_usage": 41.2,
        "ram_total": "512 MB",
        "active_tcp": active_tcp,
        "active_udp": active_udp,
        "total_traffic": total,
    }


@app.get("/api/config")
def get_config():
    """Get all configuration settings."""
    conn = get_db()
    rows = conn.execute("SELECT key, value FROM settings").fetchall()
    conn.close()
    return {row["key"]: row["value"] for row in rows}


@app.post("/api/config")
def update_config(update: ConfigUpdate):
    """Update configuration settings."""
    conn = get_db()
    updates = update.model_dump(exclude_none=True)
    for key, value in updates.items():
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
            (key, value),
        )
    conn.commit()
    conn.close()
    return {"status": "ok", "updated": list(updates.keys())}


@app.post("/api/generate-secret")
def generate_secret():
    """Generate a new random tunnel authentication key."""
    new_secret = secrets.token_hex(12)
    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('tunnel_auth_key', ?, CURRENT_TIMESTAMP)",
        (new_secret,),
    )
    conn.commit()
    conn.close()
    return SecretResponse(
        secret=new_secret,
        env_line=f"TUNNEL_AUTH_KEY={new_secret}",
    )


@app.get("/api/traffic")
def get_traffic(period: str = Query("daily", regex="^(hourly|daily|monthly)$")):
    """Get traffic data for charts."""
    conn = get_db()

    if period == "hourly":
        rows = conn.execute(
            "SELECT hour_of_day as label, download_bytes as download, upload_bytes as upload "
            "FROM traffic ORDER BY id DESC LIMIT 24"
        ).fetchall()
    elif period == "daily":
        rows = conn.execute(
            "SELECT day_of_month as label, SUM(download_bytes) as download, SUM(upload_bytes) as upload "
            "FROM traffic GROUP BY day_of_month ORDER BY day_of_month DESC LIMIT 30"
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT month as label, SUM(download_bytes) as download, SUM(upload_bytes) as upload "
            "FROM traffic GROUP BY month ORDER BY month DESC LIMIT 12"
        ).fetchall()

    # Get totals
    totals = conn.execute(
        "SELECT COALESCE(SUM(download_bytes), 0) as dl, COALESCE(SUM(upload_bytes), 0) as ul FROM traffic"
    ).fetchone()

    # Today vs this month
    today = datetime.now().day
    today_data = conn.execute(
        "SELECT COALESCE(SUM(download_bytes), 0) as dl, COALESCE(SUM(upload_bytes), 0) as ul "
        "FROM traffic WHERE day_of_month = ?",
        (today,),
    ).fetchone()

    month_data = conn.execute(
        "SELECT COALESCE(SUM(download_bytes), 0) as dl, COALESCE(SUM(upload_bytes), 0) as ul "
        "FROM traffic WHERE month = ?",
        (datetime.now().month,),
    ).fetchone()

    conn.close()

    return {
        "chart": [dict(row) for row in reversed(rows)],
        "summary": {
            "today": {"download": today_data["dl"], "upload": today_data["ul"]},
            "this_month": {"download": month_data["dl"], "upload": month_data["ul"]},
            "total": {"download": totals["dl"], "upload": totals["ul"]},
        },
    }


@app.get("/api/sessions")
def get_sessions():
    """Get all tunnel sessions."""
    conn = get_db()
    rows = conn.execute("SELECT * FROM sessions ORDER BY connected_at DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.delete("/api/session/{session_id}")
def delete_session(session_id: str):
    """Close/kill a specific session."""
    conn = get_db()
    cursor = conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Session not found")
    conn.commit()
    conn.close()
    return {"status": "deleted", "id": session_id}


@app.delete("/api/sessions")
def kill_all_sessions():
    """Kill all active sessions."""
    conn = get_db()
    cursor = conn.execute("DELETE FROM sessions")
    count = cursor.rowcount
    conn.commit()
    conn.close()
    return {"status": "deleted_all", "count": count}


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}


# ── Serve Frontend ────────────────────────────────────────────────────────

FRONTEND_DIR = "/app/frontend/dist"

if os.path.isdir(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for all non-API routes."""
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))


# ── Startup ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

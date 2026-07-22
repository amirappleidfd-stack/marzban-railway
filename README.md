# 🚀 MHRV Tunnel Panel

> Modern cyberpunk management panel for tunnel nodes — built for Railway deployment.

![License](https://img.shields.io/badge/license-MIT-green)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Railway](https://img.shields.io/badge/railway-deploy-purple)

## 🌟 Features

- **Dashboard** — Real-time tunnel status, CPU/RAM monitoring, traffic charts
- **Setup Wizard** — Configure tunnels without terminal, domain/port/TCP/UDP
- **Traffic Monitor** — Hourly/daily/monthly bandwidth analytics with charts
- **Session Manager** — View, manage, and kill active connections
- **Security** — Authentication, rate limiting, firewall, IP blocking
- **Settings** — Endpoint configuration, buffer size, timeouts
- **Secret Generator** — Generate secure tunnel authentication keys
- **Docker Command Generator** — Get ready-to-run docker commands

## 📁 Project Structure

```
mhrv-tunnel-panel/
├── Dockerfile              # Multi-stage build (frontend + backend)
├── docker-compose.yml      # Docker compose config
├── railway.toml            # Railway deployment config
├── .env.example            # Environment variables template
│
├── backend/
│   ├── main.py             # FastAPI backend (serves UI + API)
│   └── requirements.txt    # Python dependencies
│
└── frontend/
    ├── package.json        # React + Vite + TypeScript
    ├── tailwind.config.js  # Cyber theme colors
    ├── vite.config.ts      # Vite config
    ├── tsconfig.json       # TypeScript config
    └── src/
        ├── main.tsx        # React entry with QueryClient
        ├── App.tsx         # Main layout with sidebar
        ├── index.css       # Tailwind + custom glow styles
        ├── components/
        │   ├── Sidebar.tsx
        │   ├── StatusCard.tsx
        │   └── TrafficChart.tsx
        ├── pages/
        │   ├── Dashboard.tsx
        │   ├── Setup.tsx
        │   ├── Traffic.tsx
        │   ├── Sessions.tsx
        │   ├── Security.tsx
        │   └── Settings.tsx
        └── utils/
            └── format.ts   # Number formatting helpers
```

## 🚀 Quick Start

### Docker (Recommended)

```bash
# Build and run
docker compose up -d

# Access panel
open http://localhost:8080
```

### Development (Local)

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
# → http://localhost:8080
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173 (proxies /api to backend)
```

## 🐳 Docker Commands

```bash
# Build image
docker build -t mhrv-tunnel-panel .

# Run container
docker run -d \
  --name mhrv-tunnel \
  --restart unless-stopped \
  -p 8080:8080 \
  -e TUNNEL_AUTH_KEY=your_secret_here \
  -e MAX_CONNECTIONS=100 \
  mhrv-tunnel-panel

# View logs
docker logs -f mhrv-tunnel

# Stop
docker stop mhrv-tunnel
```

## ☁️ Deploy to Railway

1. Push to GitHub
2. Go to [Railway](https://railway.app)
3. Click **New Project** → **Deploy from GitHub**
4. Select your repository
5. Railway auto-detects `Dockerfile` via `railway.toml`
6. Set environment variables (optional):
   - `TUNNEL_AUTH_KEY` — will be auto-generated if empty
   - `DOMAIN` — your custom domain
   - `MAX_CONNECTIONS` — connection limit (default: 100)
7. Deploy! 🎉

### Railway Config (`railway.toml`)

```toml
[build]
builder = "DOCKERFILE"

[deploy]
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[service]
internalPort = 8080
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/status` | System status, CPU, RAM, connections |
| `GET` | `/api/config` | All configuration settings |
| `POST` | `/api/config` | Update configuration |
| `POST` | `/api/generate-secret` | Generate new auth key |
| `GET` | `/api/traffic` | Traffic data (hourly/daily/monthly) |
| `GET` | `/api/sessions` | List active sessions |
| `DELETE` | `/api/session/{id}` | Kill specific session |
| `DELETE` | `/api/sessions` | Kill all sessions |
| `GET` | `/api/health` | Health check |

## 🎨 Theme

The UI uses a **Dark Cyber** theme:
- Primary: `#00ff41` (Neon Green)
- Secondary: `#00aaff` (Cyber Blue)
- Background: `#0a0a0f` (Deep Black)
- Accents: Glowing borders, neon effects, glass panels

## 🛡️ Security

- Rate limiting support (configurable)
- IP blocking capability
- Authentication toggle
- Auto-generated tunnel secrets (24-char hex)
- SQLite database (persistent across restarts)

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `TUNNEL_AUTH_KEY` | auto-generated | Tunnel authentication key |
| `DOMAIN` | — | Custom domain |
| `MAX_CONNECTIONS` | `100` | Max concurrent connections |
| `ENABLE_TCP` | `true` | Enable TCP protocol |
| `ENABLE_UDP` | `true` | Enable UDP protocol |
| `DB_PATH` | `/app/data/tunnel.db` | SQLite database path |

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

**MHRV Tunnel Panel** — Secure. Fast. Deployed. 🚀

import { useState } from 'react'
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  BarChart2,
  Activity,
  Shield,
  Server,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  activePage: 'dashboard' | 'setup' | 'traffic' | 'sessions' | 'security' | 'settings'
  onNavigate: (page: 'dashboard' | 'setup' | 'traffic' | 'sessions' | 'security' | 'settings') => void
  isOpen: boolean
}

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'setup' as const, label: 'Setup Wizard', icon: SettingsIcon },
  { id: 'traffic' as const, label: 'Traffic Monitor', icon: BarChart2 },
  { id: 'sessions' as const, label: 'Sessions', icon: Activity },
  { id: 'security' as const, label: 'Security', icon: Shield },
  { id: 'settings' as const, label: 'Settings', icon: Server },
]

export default function Sidebar({ activePage, onNavigate, isOpen }: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-cyber-dark border-r border-cyber-border z-40 transition-transform duration-300 ease-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-5 border-b border-cyber-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-green to-cyber-blue flex items-center justify-center glow-green">
              <Server className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-mono text-cyber-green font-bold text-lg tracking-wider">MHRV</h1>
              <p className="text-xs text-cyber-muted font-mono">TUNNEL PANEL</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-cyber-green/10 to-cyber-blue/10 text-cyber-green border border-cyber-green/30 glow-green'
                    : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-gray/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyber-green' : ''}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer - Version & Status */}
        <div className="p-4 border-t border-cyber-border">
          <div className="flex items-center justify-between text-xs text-cyber-muted">
            <span className="font-mono">v1.0.0</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
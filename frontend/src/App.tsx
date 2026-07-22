import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Setup from './pages/Setup'
import Traffic from './pages/Traffic'
import Sessions from './pages/Sessions'
import Security from './pages/Security'
import SettingsPage from './pages/Settings'

export type Page = 'dashboard' | 'setup' | 'traffic' | 'sessions' | 'security' | 'settings'

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />
      case 'setup':
        return <Setup />
      case 'traffic':
        return <Traffic />
      case 'sessions':
        return <Sessions />
      case 'security':
        return <Security />
      case 'settings':
        return <SettingsPage />
    }
  }

  return (
    <div className="flex h-screen bg-cyber-black overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page)
          setSidebarOpen(false)
        }}
        isOpen={sidebarOpen}
      />

      <main className="flex-1 overflow-y-auto lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-cyber-border bg-cyber-dark/80 backdrop-blur-sm sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-cyber-muted hover:text-cyber-green transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-mono text-cyber-green font-bold text-sm tracking-wider">
            MHRV TUNNEL
          </span>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Settings, Server, Activity } from 'lucide-react'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [config, setConfig] = useState<any>({})
  const [isEditing, setIsEditing] = useState(false)

  const { data: currentConfig, isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const res = await fetch('/api/config')
      return res.json()
    },
  })

  const { data: status } = useQuery({
    queryKey: ['status'],
    queryFn: async () => {
      const res = await fetch('/api/status')
      return res.json()
    },
  })

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig)
    }
  }, [currentConfig])

  const handleSave = async () => {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['config'] })
      setIsEditing(false)
    }
  }

  const SettingsCard = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="p-6 bg-cyber-dark border border-cyber-border rounded-lg">
      <h3 className="text-cyber-green font-semibold mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5" />
        {title}
      </h3>
      {children}
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-cyber-green/30 border-t-cyber-green rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-cyber-green mb-2 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            System Settings
          </h1>
          <p className="text-cyber-muted">Manage application and tunnel settings</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-cyber-green/20 text-cyber-green border border-cyber-green/50 rounded-lg hover:bg-cyber-green/30 transition-colors"
          >
            Edit Settings
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-cyber-gray/30 text-cyber-muted rounded-lg hover:bg-cyber-gray/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-cyber-green text-black font-semibold rounded-lg hover:shadow-neon-green/30 hover:shadow-lg transition-all duration-200"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <SettingsCard title="Endpoint Configuration" icon={Server}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['endpoint_tunnel', 'endpoint_batch', 'endpoint_health'].map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-cyber-muted mb-2">
                {key.replace('endpoint_', '').toUpperCase()}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={config[key] || ''}
                  onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                  className="w-full px-3 py-2 bg-cyber-gray/30 border border-cyber-border text-cyber-text rounded-lg focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/50 transition-colors"
                />
              ) : (
                <div className="px-3 py-2 font-mono text-cyber-green bg-cyber-gray/30 rounded-lg">
                  {config[key] || '---'}
                </div>
              )}
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Network Settings" icon={Activity}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['port', 'buffer_size', 'batch_size', 'timeout'].map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-cyber-muted mb-2">
                {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={config[key] || ''}
                  onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                  className="w-full px-3 py-2 bg-cyber-gray/30 border border-cyber-border text-cyber-text rounded-lg focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/50 transition-colors"
                />
              ) : (
                <div className="px-3 py-2 font-mono text-cyber-blue bg-cyber-gray/30 rounded-lg">
                  {config[key] || '---'}
                </div>
              )}
            </div>
          ))}
        </div>
      </SettingsCard>

      <div className="p-6 bg-cyber-dark border border-cyber-border rounded-lg">
        <h3 className="text-cyber-green font-semibold mb-4 flex items-center gap-2">
          <Server className="w-5 h-5" />
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-cyber-muted">Version:</span>
              <span className="font-mono text-cyber-green">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyber-muted">Framework:</span>
              <span className="font-mono text-cyber-text">FastAPI + React</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyber-muted">Database:</span>
              <span className="font-mono text-cyber-text">SQLite</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-cyber-muted">Status:</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
                <span className="text-cyber-green">Online</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyber-muted">Uptime:</span>
              <span className="font-mono text-cyber-text">{status?.uptime || '00:00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyber-muted">Port:</span>
              <span className="font-mono text-cyber-text">{config?.port || '8080'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

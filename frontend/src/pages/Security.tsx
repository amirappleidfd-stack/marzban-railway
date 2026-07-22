import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react'

export default function Security() {
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState({
    auth_enabled: 'false',
    rate_limit_enabled: 'false',
    firewall_enabled: 'false',
    ip_block_enabled: 'false',
  })

  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const res = await fetch('/api/config')
      return res.json()
    },
  })

  const { mutate: updateConfig } = useMutation({
    mutationFn: async (updates: any) => {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] })
    },
  })

  const configCards = [
    {
      icon: Lock,
      title: 'Authentication',
      description: 'Require authentication for tunnel access',
      key: 'auth_enabled' as const,
      colors: 'green',
    },
    {
      icon: FileText,
      title: 'Rate Limiting',
      description: 'Limit connections per IP address',
      key: 'rate_limit_enabled' as const,
      colors: 'blue',
    },
    {
      icon: Shield,
      title: 'Firewall',
      description: 'Enable firewall rules',
      key: 'firewall_enabled' as const,
      colors: 'green',
    },
    {
      icon: CheckCircle,
      title: 'IP Blocking',
      description: 'Block malicious IP addresses',
      key: 'ip_block_enabled' as const,
      colors: 'red',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cyber-green mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Security Settings
        </h1>
        <p className="text-cyber-muted">Configure security measures and access controls</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configCards.map((card) => {
          const Icon = card.icon
          const isEnabled = settings[card.key] === 'true'

          const handleToggle = () => {
            const newValue = isEnabled ? 'false' : 'true'
            const newSettings = { ...settings, [card.key]: newValue }
            setSettings(newSettings)
            updateConfig({ [card.key]: newValue })
          }

          return (
            <div key={card.key} className="p-6 bg-cyber-dark border border-cyber-border rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-cyber-${card.colors}/20 flex items-center justify-center border border-cyber-${card.colors}/30`}>
                    <Icon className={`w-5 h-5 text-cyber-${card.colors}`} />
                  </div>
                  <div>
                    <h3 className="text-cyber-green font-semibold">{card.title}</h3>
                    <p className="text-sm text-cyber-muted">{card.description}</p>
                  </div>
                </div>

                <button
                  onClick={handleToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyber-green focus:ring-offset-2 focus:ring-offset-cyber-dark ${
                    isEnabled ? 'bg-cyber-green' : 'bg-cyber-gray/50'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 p-3 bg-cyber-gray/30 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyber-muted">Status:</span>
                  <span className={`font-mono ${isEnabled ? 'text-cyber-green' : 'text-cyber-muted'}`}>
                    {isEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-6 bg-cyber-dark border border-cyber-border rounded-lg">
        <h3 className="text-cyber-green font-semibold mb-3">Current Configuration</h3>
        <div className="font-mono text-xs bg-black/50 p-4 rounded-lg overflow-x-auto">
          {Object.entries(config || {}).map(([key, value]) => (
            <div key={key} className="text-cyber-text">
              {key.toUpperCase()}={String(value)}
            </div>
          ))}
        </div>
        <p className="text-xs text-cyber-muted mt-3">
          These settings are stored in the database and apply immediately after changes.
        </p>
      </div>
    </div>
  )
}

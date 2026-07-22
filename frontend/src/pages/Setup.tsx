import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SettingsIcon, Save, KeyRound, Globe, CheckCircle, AlertTriangle } from 'lucide-react'

export default function Setup() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    tunnel_name: '',
    domain: '',
    railway_domain: '',
    port: '8080',
    max_connections: '100',
    tcp_enabled: 'true',
    udp_enabled: 'true',
  })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [passwordError, setPasswordError] = useState('')

  // Fetch current config
  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const res = await fetch('/api/config')
      return res.json()
    },
  })

  // Update config mutation
  const { mutate: updateConfig, isPending: isUpdating } = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] })
    },
  })

  // Generate secret mutation
  const { mutate: generateSecret, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/generate-secret', { method: 'POST' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] })
    },
  })

  useEffect(() => {
    if (config) {
      setFormData({
        tunnel_name: config.tunnel_name || '',
        domain: config.domain || '',
        railway_domain: config.railway_domain || '',
        port: config.port || '8080',
        max_connections: config.max_connections || '100',
        tcp_enabled: config.tcp_enabled || 'true',
        udp_enabled: config.udp_enabled || 'true',
      })
      setPassword('')
      setConfirmPassword('')
      setPasswordError('')
    }
  }, [config])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match')
        return
      }
      if (password.length < 8) {
        setPasswordError('Password must be at least 8 characters')
        return
      }
      setPasswordError('')
    }

    updateConfig(formData)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cyber-green mb-2 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          Setup Wizard
        </h1>
        <p className="text-cyber-muted">Configure your tunnel and security settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tunnel Configuration */}
        <div className="p-6 bg-cyber-dark border border-cyber-border rounded-lg">
          <h3 className="text-cyber-green font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Tunnel Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-2">Tunnel Name</label>
              <input
                type="text"
                value={formData.tunnel_name}
                onChange={(e) => setFormData({ ...formData, tunnel_name: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-gray/30 border border-cyber-border text-cyber-text rounded-lg focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/50 transition-colors"
                placeholder="mhrv-tunnel"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-2">Domain</label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-gray/30 border border-cyber-border text-cyber-text rounded-lg focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/50 transition-colors"
                placeholder="example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-2">Railway Domain</label>
              <input
                type="text"
                value={formData.railway_domain}
                onChange={(e) => setFormData({ ...formData, railway_domain: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-gray/30 border border-cyber-border text-cyber-text rounded-lg focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/50 transition-colors"
                placeholder="your-app.railway.app"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-2">Port</label>
              <input
                type="text"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-gray/30 border border-cyber-border text-cyber-text rounded-lg focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/50 transition-colors"
                placeholder="8080"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-2">Max Connections</label>
              <input
                type="text"
                value={formData.max_connections}
                onChange={(e) => setFormData({ ...formData, max_connections: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-gray/30 border border-cyber-border text-cyber-text rounded-lg focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/50 transition-colors"
                placeholder="100"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-cyber-muted">Protocols</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tcp_enabled === 'true'}
                    onChange={(e) => setFormData({ ...formData, tcp_enabled: e.target.checked ? 'true' : 'false' })}
                    className="w-4 h-4 text-cyber-green bg-cyber-gray/30 border-cyber-border rounded focus:ring-cyber-green focus:ring-2"
                  />
                  <span className="text-sm text-cyber-text">TCP</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.udp_enabled === 'true'}
                    onChange={(e) => setFormData({ ...formData, udp_enabled: e.target.checked ? 'true' : 'false' })}
                    className="w-4 h-4 text-cyber-blue bg-cyber-gray/30 border-cyber-border rounded focus:ring-cyber-blue focus:ring-2"
                  />
                  <span className="text-sm text-cyber-text">UDP</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="p-6 bg-cyber-dark border border-cyber-border rounded-lg">
          <h3 className="text-cyber-green font-semibold mb-4 flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Security Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-cyber-gray/30 border border-cyber-border text-cyber-text rounded-lg focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/50 transition-colors"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-cyber-gray/30 border border-cyber-border text-cyber-text rounded-lg focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/50 transition-colors"
                placeholder="Confirm password"
              />
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-2">Authentication Key</label>
              <div className="flex gap-3">
                <div className="flex-1 px-3 py-2 bg-cyber-gray/30 border border-cyber-border rounded-lg text-cyber-green font-mono text-sm">
                  {config?.tunnel_auth_key && `${config.tunnel_auth_key.slice(0, 8)}...${config.tunnel_auth_key.slice(-8)}`}
                </div>
                <button
                  type="button"
                  onClick={() => generateSecret()}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-cyber-green/20 text-cyber-green border border-cyber-green/50 rounded-lg hover:bg-cyber-green/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Regenerate'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-3 bg-gradient-to-r from-cyber-green to-cyber-blue text-black font-semibold rounded-lg hover:shadow-neon-green/30 hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isUpdating ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  )
}
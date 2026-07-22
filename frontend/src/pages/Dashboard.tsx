import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, Globe, Cpu, HardDrive, Clock, TrendingUp } from 'lucide-react'
import { formatNumber } from '../utils/format'
import { StatusCard } from '../components/StatusCard'
import { TrafficChart } from '../components/TrafficChart'

export default function Dashboard() {

  // Fetch system status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['status'],
    queryFn: async () => {
      const res = await fetch('/api/status')
      return res.json()
    },
  })

  // Fetch traffic data
  const { data: trafficData, isLoading: trafficLoading } = useQuery({
    queryKey: ['traffic'],
    queryFn: async () => {
      const res = await fetch('/api/traffic?period=daily')
      return res.json()
    },
  })

  // Fetch config
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const res = await fetch('/api/config')
      return res.json()
    },
  })

  const SecretDisplay = ({ secret }: { secret: string }) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    return (
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-green/30 to-cyber-blue/30 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="relative flex items-center gap-3 px-5 py-4 bg-cyber-dark border border-cyber-border rounded-lg hover:bg-cyber-gray/30 transition-colors">
          <div className="font-mono text-cyber-green text-lg font-semibold">
            {secret && secret.slice(0, 8)}...{secret && secret.slice(-8)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 text-cyber-muted hover:text-cyber-green transition-colors rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H8zM8 5H4" />
              </svg>
            </button>
          </div>
          {copied && (
            <span className="text-xs text-cyber-green">Copied!</span>
          )}
        </div>
      </div>
    )
  }

  if (statusLoading || trafficLoading || configLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-cyber-green/30 border-t-cyber-green rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Server Status"
          value={status?.status || 'unknown'}
          icon={Activity}
          color="green"
        />
        <StatusCard
          title="Active TCP"
          value={status?.active_tcp || 0}
          icon={Globe}
          color="blue"
        />
        <StatusCard
          title="CPU Usage"
          value={status?.cpu_usage || 0}
          suffix="%"
          icon={Cpu}
          color="green"
        />
        <StatusCard
          title="Memory"
          value={status?.ram_usage || 0}
          suffix="%"
          icon={HardDrive}
          color="blue"
        />
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-5 bg-cyber-dark border border-cyber-border rounded-lg">
            <h3 className="text-cyber-green font-semibold mb-3">Tunnel Configuration</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-cyber-muted">Tunnel Name:</span>
                <span className="font-mono text-cyber-text">{config?.tunnel_name || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">Domain:</span>
                <span className="font-mono text-cyber-text">{config?.domain || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">Port:</span>
                <span className="font-mono text-cyber-text">{config?.port || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">Max Connections:</span>
                <span className="font-mono text-cyber-text">{config?.max_connections || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">Protocol:</span>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-cyber-green/20 text-cyber-green border border-cyber-green/50">
                    TCP {config?.tcp_enabled === 'true' ? 'ON' : 'OFF'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/50">
                    UDP {config?.udp_enabled === 'true' ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-cyber-dark border border-cyber-border rounded-lg">
            <h3 className="text-cyber-green font-semibold mb-3">System Uptime</h3>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-cyber-green" />
              <span className="font-mono text-xl text-cyber-text">{status?.uptime || '00:00'}</span>
            </div>
            <div className="mt-3 text-xs text-cyber-muted">
              Server started and running smoothly
            </div>
          </div>
        </div>

        <TrafficChart data={trafficData?.summary?.today || {download: 0, upload: 0}} />
      </div>

      {/* Tunnel Authentication */}
      <div className="p-6 bg-cyber-dark border border-cyber-border rounded-lg">
        <h3 className="text-cyber-green font-semibold mb-4">Tunnel Authentication</h3>
        <SecretDisplay secret={config?.tunnel_auth_key || ''} />
        <p className="text-xs text-cyber-muted mt-2">
          This secret key is used to authenticate tunnel connections. Keep it secure!
        </p>
      </div>
    </div>
  )
}
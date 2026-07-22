import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Activity, Clock, Download, Wifi, XCircle, Power } from 'lucide-react'

export default function Sessions() {
  const queryClient = useQueryClient()
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await fetch('/api/sessions')
      return res.json()
    },
  })

  const { mutate: deleteSession } = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`/api/session/${sessionId}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['status'] })
    },
  })

  const { mutate: killAllSessions } = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/sessions', { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['status'] })
    },
  })

  const StatCard = ({ title, value, icon: Icon, color = 'green' }: any) => (
    <div className="p-4 bg-cyber-dark border border-cyber-border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-cyber-muted">{title}</span>
        <Icon className={`w-5 h-5 text-cyber-${color}`} />
      </div>
      <div className="font-mono text-xl font-bold text-cyber-text">{value}</div>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cyber-green mb-2 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Session Manager
        </h1>
        <p className="text-cyber-muted">Manage active tunnel sessions and connections</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Sessions"
          value={sessions?.length || 0}
          icon={Wifi}
          color="green"
        />
        <StatCard
          title="Active"
          value={sessions?.filter((s: any) => s.status === 'active').length || 0}
          icon={Power}
          color="green"
        />
        <StatCard
          title="Total Traffic"
          value={sessions?.reduce((sum: number, s: any) => sum + (s.traffic_bytes || 0), 0) || 0}
          icon={Download}
          color="blue"
          suffix=" bytes"
        />
      </div>

      {/* Sessions Table */}
      <div className="bg-cyber-dark border border-cyber-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-cyber-border flex justify-between items-center">
          <h3 className="text-cyber-green font-semibold">Active Sessions</h3>
          <button
            onClick={() => killAllSessions()}
            className="px-3 py-1.5 bg-red-900/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-900/30 transition-colors text-sm flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Kill All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyber-gray/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-mono text-cyber-muted uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-cyber-muted uppercase tracking-wider">Protocol</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-cyber-muted uppercase tracking-wider">Destination</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-cyber-muted uppercase tracking-wider">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-cyber-muted uppercase tracking-wider">Connected</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-cyber-muted uppercase tracking-wider">Traffic</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-cyber-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-cyber-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              {sessions?.map((session: any) => (
                <tr key={session.id} className="hover:bg-cyber-gray/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-cyber-text">{session.id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${session.protocol === 'tcp' ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/50' : 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/50'}`}>                    {session.protocol.toUpperCase()}                  </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-cyber-muted">{session.destination}</td>
                  <td className="px-4 py-3 font-mono text-sm text-cyber-text">{session.source_ip}</td>
                  <td className="px-4 py-3 text-sm text-cyber-muted">
                    {new Date(session.connected_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-cyber-text">{session.traffic_bytes.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                      session.status === 'active'
                        ? 'bg-green-900/20 text-green-400 border border-green-500/30'
                        : 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/30'
                    }`}>                      <span className={`w-1.5 h-1.5 rounded-full ${session.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`} />                      {session.status}                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="p-1.5 text-cyber-muted hover:text-red-400 transition-colors rounded"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sessions?.length === 0 && (
          <div className="p-8 text-center text-cyber-muted">
            No active sessions found
          </div>
        )}
      </div>
    </div>
  )
}
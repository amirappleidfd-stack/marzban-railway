import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, Download, Upload } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function Traffic() {
  const [period, setPeriod] = useState('daily')

  const { data: trafficData, isLoading } = useQuery({
    queryKey: ['traffic', period],
    queryFn: async () => {
      const res = await fetch(`/api/traffic?period=${period}`)
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

  const StatCard = ({ title, value, icon: Icon, color = 'green', suffix = '' }: any) => (
    <div className="p-4 bg-cyber-dark border border-cyber-border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-cyber-muted">{title}</span>
        <Icon className={`w-5 h-5 text-cyber-${color}`} />
      </div>
      <div className="font-mono text-2xl font-bold text-cyber-text">
        {value}{suffix}
      </div>
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
          Traffic Monitor
        </h1>
        <p className="text-cyber-muted">Monitor and analyze tunnel traffic patterns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Today"
          value={trafficData?.summary?.today?.download || 0}
          icon={Download}
          color="green"
          suffix="B"
        />
        <StatCard
          title="Today Upload"
          value={trafficData?.summary?.today?.upload || 0}
          icon={Upload}
          color="blue"
          suffix="B"
        />
        <StatCard
          title="This Month"
          value={status?.total_traffic || 0}
          icon={Activity}
          color="green"
          suffix="B"
        />
      </div>

      {/* Chart Controls */}
      <div className="flex gap-2 p-1 bg-cyber-gray/30 rounded-lg w-fit">
        {['hourly', 'daily', 'monthly'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              period === p
                ? 'bg-cyber-green text-black'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-gray/50'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="p-6 bg-cyber-dark border border-cyber-border rounded-lg">
        <h3 className="text-cyber-green font-semibold mb-4">Traffic Chart</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trafficData?.chart || []}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff41" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00aaff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00aaff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis
                dataKey="label"
                stroke="#8b949e"
                fontSize={12}
                interval={period === 'hourly' ? 5 : period === 'daily' ? 2 : 0}
              />
              <YAxis
                stroke="#8b949e"
                fontSize={12}
                tickFormatter={(value) => `${Math.round(value / 1024 / 1024)}MB`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="download"
                stroke="#00ff41"
                fill="url(#downloadGradient)"
                name="Download"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="upload"
                stroke="#00aaff"
                fill="url(#uploadGradient)"
                name="Upload"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
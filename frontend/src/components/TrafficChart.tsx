import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface TrafficChartProps {
  data: {
    download: number
    upload: number
  }
}

export function TrafficChart({ data }: TrafficChartProps) {
  const chartData = [
    { name: 'Download', value: data.download },
    { name: 'Upload', value: data.upload },
  ]

  const COLORS = ['#00ff41', '#00aaff']

  const total = data.download + data.upload
  const downloadMb = Math.round(data.download / (1024 * 1024))
  const uploadMb = Math.round(data.upload / (1024 * 1024))

  return (
    <div className="p-5 bg-cyber-dark border border-cyber-border rounded-lg">
      <h3 className="text-cyber-green font-semibold mb-3">Traffic Overview</h3>
      <div className="flex items-center gap-6">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyber-green" />
            <div>
              <div className="text-xs text-cyber-muted">Download</div>
              <div className="font-mono text-sm text-cyber-text">{downloadMb.toLocaleString()} MB</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyber-blue" />
            <div>
              <div className="text-xs text-cyber-muted">Upload</div>
              <div className="font-mono text-sm text-cyber-text">{uploadMb.toLocaleString()} MB</div>
            </div>
          </div>
          <div className="pt-2 border-t border-cyber-border">
            <div className="text-xs text-cyber-muted">Total Traffic Today</div>
            <div className="font-mono text-sm text-cyber-green">{(total / (1024 * 1024 * 1024)).toFixed(2)} GB</div>
          </div>
        </div>
      </div>
    </div>
  )
}

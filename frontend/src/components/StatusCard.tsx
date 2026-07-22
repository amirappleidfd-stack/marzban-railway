interface StatusCardProps {
  title: string
  value: string | number
  icon: any
  color: string
  suffix?: string
}

export function StatusCard({ title, value, icon: Icon, color, suffix = '' }: StatusCardProps) {
  return (
    <div className="p-5 bg-cyber-dark border border-cyber-border rounded-lg relative overflow-hidden group">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-cyber-${color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-cyber-muted uppercase tracking-wider">{title}</span>
          <Icon className={`w-5 h-5 text-cyber-${color}`} />
        </div>
        <div className="font-mono text-2xl font-bold text-cyber-text">
          {value}{suffix}
        </div>
        <div className="mt-2 h-1 bg-cyber-gray/50 rounded-full overflow-hidden">
          <div
            className={`h-full bg-cyber-${color} rounded-full transition-all duration-500`}
            style={{ width: `${typeof value === 'number' ? Math.min(value, 100) : 50}%` }}
          />
        </div>
      </div>
    </div>
  )
}

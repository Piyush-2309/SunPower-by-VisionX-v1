import type { ReactNode } from 'react'

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: ReactNode
  accentColor: 'green' | 'yellow' | 'blue' | 'purple'
  placeholder?: boolean
}

const accents = {
  green: { bg: 'bg-forest-50', iconBg: 'bg-forest-100', iconText: 'text-forest-600', border: 'border-forest-200' },
  yellow: { bg: 'bg-solar-50', iconBg: 'bg-solar-100', iconText: 'text-solar-600', border: 'border-solar-200' },
  blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconText: 'text-blue-600', border: 'border-blue-200' },
  purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconText: 'text-purple-600', border: 'border-purple-200' },
}

export default function KpiCard({ title, value, subtitle, icon, accentColor, placeholder }: KpiCardProps) {
  const a = accents[accentColor]
  return (
    <div className={`bg-white rounded-xl border ${a.border} p-5 transition-shadow hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[13px] font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg ${a.iconBg} flex items-center justify-center ${a.iconText}`}>
          {icon}
        </div>
      </div>
      {placeholder && (
        <div className="mt-3 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[11px] text-amber-600 font-medium">Placeholder — connect API</span>
        </div>
      )}
    </div>
  )
}

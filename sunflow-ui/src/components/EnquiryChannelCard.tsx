import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface ChannelCardProps {
  icon: ReactNode
  name: string
  description: string
  available: boolean
  linkTo?: string
}

export default function EnquiryChannelCard({ icon, name, description, available, linkTo }: ChannelCardProps) {
  const content = (
    <div
      className={`bg-white rounded-xl border p-5 transition-all duration-150
        ${available
          ? 'border-forest-200 hover:border-forest-300 hover:shadow-md cursor-pointer'
          : 'border-gray-200 opacity-70'
        }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0
          ${available ? 'bg-forest-100 text-forest-600' : 'bg-gray-100 text-gray-400'}
        `}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900">{name}</h4>
            {available ? (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full">
                Active
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
        {available && (
          <ArrowRight size={16} className="text-forest-400 shrink-0 mt-1" />
        )}
      </div>
    </div>
  )

  if (available && linkTo) {
    return <Link to={linkTo}>{content}</Link>
  }
  return content
}

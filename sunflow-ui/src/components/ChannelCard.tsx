import type { ReactNode } from 'react'

interface ChannelCardProps {
  icon: ReactNode
  iconColor: 'amber' | 'emerald' | 'slate'
  name: string
  description: string
  available: boolean
}

export default function ChannelCard({
  icon,
  iconColor,
  name,
  description,
  available,
}: ChannelCardProps) {
  return (
    <div className={`channel-card ${available ? 'available' : ''}`}>
      <div className={`channel-icon-wrapper ${iconColor}`}>{icon}</div>
      <h3 className="channel-name">{name}</h3>
      <p className="channel-description">{description}</p>
      <span className={`channel-status ${available ? 'available' : 'coming-soon'}`}>
        {available ? '● Available' : '○ Coming Soon'}
      </span>
    </div>
  )
}

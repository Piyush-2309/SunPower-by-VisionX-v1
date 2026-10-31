import { useLocation } from 'react-router-dom'
import { Menu, Bell, User } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/overview': 'Solar Operations Overview',
  '/leads': 'Lead Management',
  '/enquiries': 'Customer Enquiries',
  '/surveys': 'Site Surveys',
  '/quotations': 'Quotations',
  '/orders': 'Orders',
  '/inventory': 'Inventory',
  '/installations': 'Installations',
  '/service': 'Service & Warranty',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'SunFlow 360'

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-solar-500" />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center">
            <User size={16} className="text-forest-700" />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">Admin</span>
        </button>
      </div>
    </header>
  )
}

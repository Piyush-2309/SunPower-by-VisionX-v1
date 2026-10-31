import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  MessageSquarePlus,
  ClipboardCheck,
  FileText,
  ShoppingCart,
  Package,
  Wrench,
  Shield,
  BarChart3,
  Settings,
  Sun,
  X,
} from 'lucide-react'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  active: boolean
}

const navItems: NavItem[] = [
  { label: 'Overview', path: '/overview', icon: <LayoutDashboard size={18} />, active: true },
  { label: 'Leads', path: '/leads', icon: <Users size={18} />, active: true },
  { label: 'Enquiries', path: '/enquiries', icon: <MessageSquarePlus size={18} />, active: true },
  { label: 'Site Surveys', path: '/surveys', icon: <ClipboardCheck size={18} />, active: true },
  { label: 'Quotations', path: '/quotations', icon: <FileText size={18} />, active: false },
  { label: 'Orders', path: '/orders', icon: <ShoppingCart size={18} />, active: false },
  { label: 'Inventory', path: '/inventory', icon: <Package size={18} />, active: false },
  { label: 'Installations', path: '/installations', icon: <Wrench size={18} />, active: false },
  { label: 'Service & Warranty', path: '/service', icon: <Shield size={18} />, active: false },
  { label: 'Analytics', path: '/analytics', icon: <BarChart3 size={18} />, active: false },
  { label: 'Settings', path: '/settings', icon: <Settings size={18} />, active: false },
]

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-forest-950 text-white
          flex flex-col transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-forest-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-solar-400 to-solar-600 flex items-center justify-center">
              <Sun size={16} className="text-white" />
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight">
                Sun<span className="text-solar-400">Flow</span> 360
              </span>
            </div>
          </div>
          <button
            className="lg:hidden p-1 rounded hover:bg-forest-800 transition-colors"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150
                ${isActive
                  ? 'nav-item-active'
                  : 'text-forest-300 hover:text-white hover:bg-forest-800/60'
                }
                ${!item.active && !isActive ? 'opacity-60' : ''}
                `
              }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {!item.active && (
                <span className="text-[10px] font-semibold bg-forest-800 text-forest-400 px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-forest-800/60">
          <p className="text-[11px] text-forest-500 text-center">
            VisionX &middot; Odoo × GCET Hackathon
          </p>
        </div>
      </aside>
    </>
  )
}


import { useState, useEffect, useCallback, useTransition } from 'react'
import {
  Users,
  Search,
  Plus,
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Globe,
  MessageCircle,
  Mic,
  Zap,
  MapPin,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getLeads, updateLeadStatus } from '../services/api'
import LeadDetailsModal from '../components/LeadDetailsModal'
import type {
  LeadResponse,
  LeadStatus,
  EnquiryChannel,
  SpringPage,
} from '../types/lead'

const STATUS_FILTERS: { value: LeadStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'DISQUALIFIED', label: 'Disqualified' },
  { value: 'CONVERTED', label: 'Converted' },
]

const CHANNEL_FILTERS: { value: EnquiryChannel | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Channels' },
  { value: 'WEB_FORM', label: 'Web Form' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'VOICE', label: 'Voice' },
]

const STATUS_BADGES: Record<LeadStatus, { label: string; bg: string; text: string; border: string }> = {
  NEW: { label: 'New', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  CONTACTED: { label: 'Contacted', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  QUALIFIED: { label: 'Qualified', bg: 'bg-forest-50', text: 'text-forest-700', border: 'border-forest-200' },
  DISQUALIFIED: { label: 'Disqualified', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  CONVERTED: { label: 'Converted', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
}

export default function LeadsPage() {
  // Query state
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'ALL'>('ALL')
  const [selectedChannel, setSelectedChannel] = useState<EnquiryChannel | 'ALL'>('ALL')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Data state
  const [pageData, setPageData] = useState<SpringPage<LeadResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Details modal
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  // Inline status updating indicator map
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setCurrentPage(0) // Reset to page 0 on search change
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch leads
  useEffect(() => {
    let ignore = false

    const loadLeads = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getLeads({
          search: debouncedSearch || undefined,
          status: selectedStatus === 'ALL' ? undefined : selectedStatus,
          channel: selectedChannel === 'ALL' ? undefined : selectedChannel,
          page: currentPage,
          size: pageSize,
          sort: 'createdAt,desc',
        })
        if (!ignore) {
          startTransition(() => {
            setPageData(data)
          })
        }
      } catch (err: unknown) {
        if (!ignore) {
          let msg = 'Failed to load leads from backend server. Please verify backend connectivity.'
          if (err && typeof err === 'object' && 'response' in err) {
            const axiosErr = err as { response?: { data?: { message?: string } } }
            if (axiosErr.response?.data?.message) {
              msg = axiosErr.response.data.message
            }
          }
          setError(msg)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadLeads()

    return () => {
      ignore = true
    }
  }, [debouncedSearch, selectedStatus, selectedChannel, currentPage, pageSize, refreshKey])

  const fetchLeads = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  // Quick inline status change handler
  const handleQuickStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setUpdatingId(leadId)
    try {
      await updateLeadStatus(leadId, newStatus)
      await fetchLeads()
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update lead status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const renderChannelBadge = (channel: EnquiryChannel) => {
    switch (channel) {
      case 'WEB_FORM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
            <Globe size={11} className="text-forest-600" /> Web Form
          </span>
        )
      case 'WHATSAPP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700">
            <MessageCircle size={11} /> WhatsApp
          </span>
        )
      case 'VOICE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
            <Mic size={11} /> Voice
          </span>
        )
      default:
        return <span className="text-xs text-gray-500">{channel}</span>
    }
  }

  const totalPages = pageData?.totalPages ?? 0
  const totalElements = pageData?.totalElements ?? 0
  const leads = pageData?.content ?? []

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Solar Lead Management</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time omnichannel intake records from PostgreSQL database (`sunflow_dev`).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLeads()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            to="/enquiries"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-forest-600 text-white text-xs font-semibold hover:bg-forest-700 transition-colors shadow-xs"
          >
            <Plus size={15} />
            New Enquiry
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search leads by customer name or phone..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as LeadStatus | 'ALL')
                setCurrentPage(0)
              }}
              className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 cursor-pointer"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

            {/* Channel Filter */}
            <select
              value={selectedChannel}
              onChange={(e) => {
                setSelectedChannel(e.target.value as EnquiryChannel | 'ALL')
                setCurrentPage(0)
              }}
              className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 cursor-pointer"
            >
              {CHANNEL_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-900">Failed to load leads</h4>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchLeads()}
            className="px-3 py-1.5 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Leads Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Table Head & Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading && leads.length === 0 ? (
                // Loading Skeleton Rows
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="h-4 bg-gray-200 rounded w-28 mb-1"></div>
                      <div className="h-3 bg-gray-100 rounded w-20"></div>
                    </td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 rounded w-24"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 rounded w-20"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 rounded w-16"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 rounded w-16"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-18"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 rounded w-20"></div></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-6 bg-gray-200 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : leads.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <Users size={22} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">No solar leads found</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      {debouncedSearch || selectedStatus !== 'ALL' || selectedChannel !== 'ALL'
                        ? 'No leads match the active search filters. Try clearing filters.'
                        : 'No leads registered in PostgreSQL yet. Submit an enquiry via the web form to get started.'}
                    </p>
                    <Link
                      to="/enquiries"
                      className="inline-flex items-center gap-1.5 mt-4 px-3.5 py-1.5 rounded-lg bg-forest-600 text-white text-xs font-semibold hover:bg-forest-700 transition-colors shadow-xs"
                    >
                      <Plus size={14} /> Submit New Enquiry
                    </Link>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const badge = STATUS_BADGES[lead.status] || STATUS_BADGES.NEW
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLeadId(lead.id)}
                    >
                      {/* Name & Initial Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-forest-100 text-forest-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {lead.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 group-hover:text-forest-700 transition-colors">
                              {lead.fullName}
                            </span>
                            {lead.propertyType && (
                              <p className="text-[10px] text-gray-400">{lead.propertyType}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono text-gray-700">
                        {lead.phone}
                      </td>

                      {/* City */}
                      <td className="py-3 px-4 text-gray-600">
                        {lead.city ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} className="text-gray-400" />
                            {lead.city}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Requested Capacity */}
                      <td className="py-3 px-4 font-semibold text-forest-700">
                        {lead.requestedCapacityKw != null ? (
                          <span className="inline-flex items-center gap-1">
                            <Zap size={12} className="text-amber-500" />
                            {lead.requestedCapacityKw} kW
                          </span>
                        ) : (
                          <span className="text-gray-300 font-normal">—</span>
                        )}
                      </td>

                      {/* Channel */}
                      <td className="py-3 px-4">
                        {renderChannelBadge(lead.channel)}
                      </td>

                      {/* Status + Quick Select */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            value={lead.status}
                            disabled={updatingId === lead.id}
                            onChange={(e) => handleQuickStatusChange(lead.id, e.target.value as LeadStatus)}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border} focus:outline-none cursor-pointer disabled:opacity-50`}
                          >
                            <option value="NEW">NEW</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="QUALIFIED">QUALIFIED</option>
                            <option value="DISQUALIFIED">DISQUALIFIED</option>
                            <option value="CONVERTED">CONVERTED</option>
                          </select>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} className="text-gray-400" />
                          {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-forest-700 hover:text-forest-800 bg-forest-50 hover:bg-forest-100 rounded-lg transition-colors"
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalElements > 0 && (
          <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <div>
              Showing{' '}
              <strong className="font-semibold text-gray-900">
                {currentPage * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="font-semibold text-gray-900">
                {Math.min((currentPage + 1) * pageSize, totalElements)}
              </strong>{' '}
              of <strong className="font-semibold text-gray-900">{totalElements}</strong> total leads
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-gray-500">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(0)
                  }}
                  className="px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-700"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0 || loading}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="px-2 font-medium text-gray-700">
                  {currentPage + 1} / {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1 || loading}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Slide-Over / Modal */}
      {selectedLeadId && (
        <LeadDetailsModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onStatusUpdated={() => {
            fetchLeads()
          }}
        />
      )}
    </div>
  )
}

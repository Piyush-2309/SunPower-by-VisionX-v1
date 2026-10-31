import { useState, useEffect } from 'react'
import {
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  Zap,
  IndianRupee,
  Home,
  Languages,
  CheckCircle2,
  Calendar,
  Clock,
  Globe,
  MessageCircle,
  Mic,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Tag,
} from 'lucide-react'
import { getLeadById, updateLeadStatus } from '../services/api'
import type { LeadResponse, LeadStatus } from '../types/lead'

interface LeadDetailsModalProps {
  leadId: string | null
  onClose: () => void
  onStatusUpdated?: (updatedLead: LeadResponse) => void
}

const ALL_STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'NEW', label: 'New Enquiry', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'QUALIFIED', label: 'Qualified', color: 'bg-forest-100 text-forest-800 border-forest-200' },
  { value: 'DISQUALIFIED', label: 'Disqualified', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'CONVERTED', label: 'Converted', color: 'bg-purple-100 text-purple-800 border-purple-200' },
]

export default function LeadDetailsModal({ leadId, onClose, onStatusUpdated }: LeadDetailsModalProps) {
  const [lead, setLead] = useState<LeadResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState(false)

  useEffect(() => {
    if (!leadId) return

    let isMounted = true

    const fetchLeadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getLeadById(leadId)
        if (isMounted) {
          setLead(data)
        }
      } catch (err: unknown) {
        if (isMounted) {
          let msg = 'Failed to fetch lead details.'
          if (err && typeof err === 'object' && 'response' in err) {
            const axiosErr = err as { response?: { data?: { message?: string } } }
            if (axiosErr.response?.data?.message) msg = axiosErr.response.data.message
          }
          setError(msg)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void fetchLeadData()

    return () => {
      isMounted = false
    }
  }, [leadId])

  if (!leadId) return null

  const handleCopyId = () => {
    if (lead?.id) {
      navigator.clipboard.writeText(lead.id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || updatingStatus || lead.status === newStatus) return

    setUpdatingStatus(true)
    setStatusMessage(null)

    try {
      const updated = await updateLeadStatus(lead.id, newStatus)
      setLead(updated)
      setStatusMessage(`Status updated to ${newStatus}`)
      if (onStatusUpdated) {
        onStatusUpdated(updated)
      }
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (err: unknown) {
      let msg = 'Failed to update status.'
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        if (axiosErr.response?.data?.message) msg = axiosErr.response.data.message
      }
      setError(msg)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const channelIcon = (channel: string) => {
    switch (channel) {
      case 'WEB_FORM':
        return <Globe size={14} className="text-forest-600" />
      case 'WHATSAPP':
        return <MessageCircle size={14} className="text-emerald-600" />
      case 'VOICE':
        return <Mic size={14} className="text-blue-600" />
      default:
        return <Globe size={14} />
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Lead Record Overview</h3>
            <p className="text-xs text-gray-400">Detailed technical profile and enquiry audit record</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400">
              <Loader2 size={32} className="animate-spin text-forest-600 mb-2" />
              <p className="text-xs">Loading lead details...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {lead && !loading && (
            <>
              {/* Primary Identity Card */}
              <div className="p-4 rounded-xl bg-forest-50/50 border border-forest-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{lead.fullName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 inline-flex items-center gap-1.5">
                      {lead.id}
                      <button
                        onClick={handleCopyId}
                        className="hover:text-forest-600 focus:outline-none"
                        title="Copy UUID"
                      >
                        {copiedId ? <Check size={12} className="text-forest-600" /> : <Copy size={12} />}
                      </button>
                    </span>
                  </div>
                </div>

                {/* Status Transition Control */}
                <div className="flex flex-col items-start sm:items-end gap-1.5">
                  <span className="text-[11px] font-medium text-gray-500">Current Status:</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={lead.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 cursor-pointer disabled:opacity-60"
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label} ({st.value})
                        </option>
                      ))}
                    </select>
                    {updatingStatus && <Loader2 size={14} className="animate-spin text-forest-600" />}
                  </div>
                  {statusMessage && (
                    <span className="text-[10px] text-forest-600 font-semibold animate-pulse">
                      {statusMessage}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <Phone size={13} /> Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2.5">
                    <Phone size={15} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400">Phone</p>
                      <a href={`tel:${lead.phone}`} className="font-semibold text-gray-900 hover:text-forest-600">
                        {lead.phone}
                      </a>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2.5">
                    <Mail size={15} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400">Email</p>
                      <span className="font-semibold text-gray-900">
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="hover:text-forest-600">
                            {lead.email}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2.5 sm:col-span-2">
                    <MapPin size={15} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400">Location</p>
                      <span className="font-semibold text-gray-900">
                        {[lead.address, lead.city].filter(Boolean).join(', ') || 'No address specified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Solar Specifications */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <Zap size={13} /> Solar Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Building size={12} /> Property Type
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">{lead.propertyType || 'RESIDENTIAL'}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Zap size={12} /> System Topology
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">{lead.systemType || 'ON_GRID'}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Zap size={12} /> Requested Capacity
                    </p>
                    <p className="font-semibold text-forest-700 mt-1">
                      {lead.requestedCapacityKw != null ? `${lead.requestedCapacityKw} kW` : 'Not specified'}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <IndianRupee size={12} /> Monthly Bill
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {lead.monthlyBill != null ? `₹${lead.monthlyBill.toLocaleString('en-IN')}` : 'Not provided'}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Home size={12} /> Roof Area
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {lead.roofAreaSqft != null ? `${lead.roofAreaSqft} sq. ft.` : 'Not provided'}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Subsidy Interest
                    </p>
                    <p className="font-semibold mt-1">
                      {lead.subsidyInterest ? (
                        <span className="text-forest-600 font-bold">Yes (Interested)</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Consultation & Channel Info */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <Tag size={13} /> Intake Channel & Audit
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400">Channel</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {channelIcon(lead.channel)}
                        <span className="font-semibold text-gray-900">{lead.channel}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Language</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-1 mt-0.5">
                        <Languages size={12} /> {lead.preferredLanguage || 'English'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Calendar size={12} /> Created At
                    </p>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {new Date(lead.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>

                  {lead.qualificationNotes && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 sm:col-span-2">
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-1">
                        <Clock size={12} /> Qualification Notes
                      </p>
                      <p className="text-xs text-gray-700 italic bg-white p-2 rounded border border-gray-200">
                        "{lead.qualificationNotes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  )
}

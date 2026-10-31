import { useState, useEffect, type FormEvent } from 'react'
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
} from 'lucide-react'
import { createSurvey, getLeads } from '../services/api'
import type { LeadResponse } from '../types/lead'
import type { SurveyCreateRequest, SurveyResponse } from '../types/survey'

interface ScheduleSurveyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (survey: SurveyResponse) => void
  preselectedLeadId?: string
}

interface FormErrors {
  leadId?: string
  surveyorName?: string
  surveyorPhone?: string
  scheduledAt?: string
  siteAddress?: string
  notes?: string
  general?: string
}

const getTomorrowDateString = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yyyy = tomorrow.getFullYear()
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const dd = String(tomorrow.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function ScheduleSurveyModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedLeadId,
}: ScheduleSurveyModalProps) {
  // Leads for selection dropdown
  const [leads, setLeads] = useState<LeadResponse[]>([])
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [leadsError, setLeadsError] = useState<string | null>(null)

  // Form inputs
  const [selectedLeadId, setSelectedLeadId] = useState<string>(preselectedLeadId || '')
  const [surveyorName, setSurveyorName] = useState('')
  const [surveyorPhone, setSurveyorPhone] = useState('')
  const [scheduledDate, setScheduledDate] = useState(getTomorrowDateString)
  const [scheduledTime, setScheduledTime] = useState('10:00')
  const [siteAddress, setSiteAddress] = useState('')
  const [notes, setNotes] = useState('')

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load leads when modal opens
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const loadLeadOptions = async () => {
      setLoadingLeads(true)
      setLeadsError(null)
      try {
        const data = await getLeads({ size: 50, sort: 'createdAt,desc' })
        if (isMounted) {
          setLeads(data.content)
          if (preselectedLeadId) {
            const found = data.content.find((l) => l.id === preselectedLeadId)
            if (found) {
              setSelectedLeadId(found.id)
              const addressParts = [found.address, found.city].filter(Boolean)
              setSiteAddress(addressParts.join(', '))
            }
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          let msg = 'Failed to load leads for selection.'
          if (err && typeof err === 'object' && 'response' in err) {
            const axiosErr = err as { response?: { data?: { message?: string } } }
            if (axiosErr.response?.data?.message) msg = axiosErr.response.data.message
          }
          setLeadsError(msg)
        }
      } finally {
        if (isMounted) {
          setLoadingLeads(false)
        }
      }
    }

    void loadLeadOptions()

    return () => {
      isMounted = false
    }
  }, [isOpen, preselectedLeadId])

  // When a lead is selected, auto-populate address
  const handleLeadChange = (leadId: string) => {
    setSelectedLeadId(leadId)
    if (errors.leadId) setErrors({ ...errors, leadId: undefined })

    const found = leads.find((l) => l.id === leadId)
    if (found) {
      const addressParts = [found.address, found.city].filter(Boolean)
      setSiteAddress(addressParts.join(', '))
    }
  }

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!selectedLeadId) {
      newErrors.leadId = 'Please select a customer lead.'
    }

    if (!surveyorName.trim()) {
      newErrors.surveyorName = 'Surveyor name is required.'
    } else if (surveyorName.trim().length > 100) {
      newErrors.surveyorName = 'Surveyor name must not exceed 100 characters.'
    }

    if (surveyorPhone.trim() && surveyorPhone.trim().length > 20) {
      newErrors.surveyorPhone = 'Phone number must not exceed 20 characters.'
    }

    if (!scheduledDate) {
      newErrors.scheduledAt = 'Scheduled date is required.'
    } else {
      const combinedDateTime = new Date(`${scheduledDate}T${scheduledTime || '09:00'}:00`)
      if (isNaN(combinedDateTime.getTime())) {
        newErrors.scheduledAt = 'Invalid date and time.'
      } else {
        const now = new Date()
        now.setMinutes(now.getMinutes() - 5) // allow small grace window
        if (combinedDateTime < now) {
          newErrors.scheduledAt = 'Survey cannot be scheduled in the past.'
        }
      }
    }

    if (siteAddress.length > 500) {
      newErrors.siteAddress = 'Site address must not exceed 500 characters.'
    }

    if (notes.length > 2000) {
      newErrors.notes = 'Notes must not exceed 2000 characters.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate() || submitting) return

    setSubmitting(true)
    setErrors({})
    setSuccessMessage(null)

    const scheduledIso = new Date(`${scheduledDate}T${scheduledTime || '09:00'}:00`).toISOString()

    const payload: SurveyCreateRequest = {
      leadId: selectedLeadId,
      surveyorName: surveyorName.trim(),
      surveyorPhone: surveyorPhone.trim() ? surveyorPhone.trim() : undefined,
      scheduledAt: scheduledIso,
      siteAddress: siteAddress.trim() ? siteAddress.trim() : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
    }

    try {
      const created = await createSurvey(payload)
      setSuccessMessage(`Site survey scheduled successfully for ${created.customerName || 'customer'}!`)
      setTimeout(() => {
        onSuccess(created)
        onClose()
      }, 900)
    } catch (err: unknown) {
      let msg = 'Failed to schedule site survey. Please try again.'
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        if (axiosErr.response?.data?.message) {
          msg = axiosErr.response.data.message
        }
      }
      setErrors({ general: msg })
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const selectedLead = leads.find((l) => l.id === selectedLeadId)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-forest-50/50 to-solar-50/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-600 text-white flex items-center justify-center shadow-xs">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Schedule Site Survey</h3>
              <p className="text-xs text-gray-500">Dispatch technical surveyor for rooftop assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* General Error Banner */}
          {errors.general && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{errors.general}</p>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-200 flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-forest-600 shrink-0 mt-0.5" />
              <p className="text-xs text-forest-700 font-semibold">{successMessage}</p>
            </div>
          )}

          {/* Customer / Lead Selection */}
          <div>
            <label htmlFor="leadSelect" className="block text-xs font-semibold text-gray-700 mb-1">
              Select Customer Lead <span className="text-red-500">*</span>
            </label>
            {loadingLeads ? (
              <div className="py-2 px-3 text-xs text-gray-400 flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200">
                <Loader2 size={14} className="animate-spin text-forest-600" />
                Loading leads from PostgreSQL...
              </div>
            ) : leadsError ? (
              <p className="text-xs text-red-600">{leadsError}</p>
            ) : (
              <select
                id="leadSelect"
                value={selectedLeadId}
                onChange={(e) => handleLeadChange(e.target.value)}
                className={`w-full px-3 py-2 text-xs border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 cursor-pointer ${
                  errors.leadId ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-forest-500'
                }`}
              >
                <option value="">-- Choose a lead to survey --</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.fullName} &middot; {lead.phone} {lead.city ? `(${lead.city})` : ''} &middot; [Status: {lead.status}]
                  </option>
                ))}
              </select>
            )}
            {errors.leadId && <p className="text-[11px] text-red-600 mt-1">{errors.leadId}</p>}

            {/* Selected Lead Info Preview */}
            {selectedLead && (
              <div className="mt-2 p-2.5 rounded-lg bg-forest-50/60 border border-forest-100 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-gray-900">{selectedLead.fullName}</span>
                  <p className="text-[11px] text-gray-500">
                    {selectedLead.propertyType || 'RESIDENTIAL'} &middot; {selectedLead.phone}
                  </p>
                </div>
                {selectedLead.requestedCapacityKw != null && (
                  <span className="inline-flex items-center gap-1 font-semibold text-forest-700 bg-white px-2 py-1 rounded border border-forest-200 text-[11px]">
                    <Zap size={12} className="text-amber-500" />
                    Req: {selectedLead.requestedCapacityKw} kW
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Surveyor Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="surveyorName" className="block text-xs font-semibold text-gray-700 mb-1">
                Surveyor Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={14} />
                </div>
                <input
                  id="surveyorName"
                  type="text"
                  value={surveyorName}
                  onChange={(e) => {
                    setSurveyorName(e.target.value)
                    if (errors.surveyorName) setErrors({ ...errors, surveyorName: undefined })
                  }}
                  placeholder="e.g. Anand Verma"
                  maxLength={100}
                  className={`w-full pl-8 pr-3 py-2 text-xs border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 ${
                    errors.surveyorName ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-forest-500'
                  }`}
                />
              </div>
              {errors.surveyorName && <p className="text-[11px] text-red-600 mt-1">{errors.surveyorName}</p>}
            </div>

            <div>
              <label htmlFor="surveyorPhone" className="block text-xs font-semibold text-gray-700 mb-1">
                Surveyor Phone <span className="text-gray-400 text-[10px]">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone size={14} />
                </div>
                <input
                  id="surveyorPhone"
                  type="tel"
                  value={surveyorPhone}
                  onChange={(e) => {
                    setSurveyorPhone(e.target.value)
                    if (errors.surveyorPhone) setErrors({ ...errors, surveyorPhone: undefined })
                  }}
                  placeholder="e.g. 9823456789"
                  maxLength={20}
                  className={`w-full pl-8 pr-3 py-2 text-xs border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 ${
                    errors.surveyorPhone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-forest-500'
                  }`}
                />
              </div>
              {errors.surveyorPhone && <p className="text-[11px] text-red-600 mt-1">{errors.surveyorPhone}</p>}
            </div>
          </div>

          {/* Scheduled Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="surveyDate" className="block text-xs font-semibold text-gray-700 mb-1">
                Survey Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Calendar size={14} />
                </div>
                <input
                  id="surveyDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => {
                    setScheduledDate(e.target.value)
                    if (errors.scheduledAt) setErrors({ ...errors, scheduledAt: undefined })
                  }}
                  className={`w-full pl-8 pr-3 py-2 text-xs border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 ${
                    errors.scheduledAt ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-forest-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="surveyTime" className="block text-xs font-semibold text-gray-700 mb-1">
                Survey Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Clock size={14} />
                </div>
                <input
                  id="surveyTime"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => {
                    setScheduledTime(e.target.value)
                    if (errors.scheduledAt) setErrors({ ...errors, scheduledAt: undefined })
                  }}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
                />
              </div>
            </div>
          </div>
          {errors.scheduledAt && <p className="text-[11px] text-red-600 mt-1">{errors.scheduledAt}</p>}

          {/* Site Address */}
          <div>
            <label htmlFor="siteAddress" className="block text-xs font-semibold text-gray-700 mb-1">
              Site / Property Address <span className="text-gray-400 text-[10px]">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MapPin size={14} />
              </div>
              <input
                id="siteAddress"
                type="text"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                placeholder="Installation address, landmark, pin code"
                maxLength={500}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
              />
            </div>
          </div>

          {/* Pre-Visit Notes */}
          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-gray-700 mb-1">
              Scheduling / Site Visit Notes <span className="text-gray-400 text-[10px]">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Client requested morning arrival, inspect 3-phase meter board, check shading from adjacent trees."
                maxLength={2000}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-forest-600 text-white text-xs font-semibold hover:bg-forest-700 transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Scheduling Survey...
                </>
              ) : (
                <>
                  <Calendar size={14} />
                  Confirm Survey Schedule
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

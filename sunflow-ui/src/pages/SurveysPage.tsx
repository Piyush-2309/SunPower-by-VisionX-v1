import { useState, useEffect, useCallback, useTransition } from 'react'
import {
  ClipboardCheck,
  Calendar,
  Clock,
  User,
  Phone,
  Search,
  Filter,
  RefreshCw,
  Plus,
  AlertCircle,
  MapPin,
  Zap,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { getSurveys } from '../services/api'
import ScheduleSurveyModal from '../components/ScheduleSurveyModal'
import type {
  SurveyResponse,
  SurveyStatus,
  SpringPage,
} from '../types/survey'

interface SurveyMetrics {
  total: number
  scheduled: number
  inProgress: number
  completed: number
}

const STATUS_FILTERS: { value: SurveyStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Surveys' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RESCHEDULED', label: 'Rescheduled' },
]

const STATUS_BADGES: Record<SurveyStatus, { label: string; bg: string; text: string; border: string }> = {
  SCHEDULED: { label: 'Scheduled', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  COMPLETED: { label: 'Completed', bg: 'bg-forest-50', text: 'text-forest-700', border: 'border-forest-200' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  RESCHEDULED: { label: 'Rescheduled', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
}

export default function SurveysPage() {
  // Query state
  const [selectedStatus, setSelectedStatus] = useState<SurveyStatus | 'ALL'>('ALL')
  const [surveyorSearch, setSurveyorSearch] = useState('')
  const [debouncedSurveyor, setDebouncedSurveyor] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [refreshKey, setRefreshKey] = useState(0)

  // Data state
  const [pageData, setPageData] = useState<SpringPage<SurveyResponse> | null>(null)
  const [metrics, setMetrics] = useState<SurveyMetrics>({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Scheduling modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [, startTransition] = useTransition()

  // Debounce surveyor search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSurveyor(surveyorSearch)
      setCurrentPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [surveyorSearch])

  // Fetch surveys and metrics
  useEffect(() => {
    let ignore = false

    const loadSurveys = async () => {
      setLoading(true)
      setError(null)
      try {
        // 1. Fetch paginated surveys for the active filter
        const data = await getSurveys({
          status: selectedStatus === 'ALL' ? undefined : selectedStatus,
          surveyor: debouncedSurveyor || undefined,
          page: currentPage,
          size: pageSize,
          sort: 'scheduledAt,asc',
        })

        // 2. Fetch real counts by status for metrics cards safely
        const [totalRes, schedRes, inProgRes, compRes] = await Promise.all([
          getSurveys({ page: 0, size: 1 }),
          getSurveys({ status: 'SCHEDULED', page: 0, size: 1 }),
          getSurveys({ status: 'IN_PROGRESS', page: 0, size: 1 }),
          getSurveys({ status: 'COMPLETED', page: 0, size: 1 }),
        ])

        if (!ignore) {
          startTransition(() => {
            setPageData(data)
            setMetrics({
              total: totalRes.totalElements,
              scheduled: schedRes.totalElements,
              inProgress: inProgRes.totalElements,
              completed: compRes.totalElements,
            })
          })
        }
      } catch (err: unknown) {
        if (!ignore) {
          let msg = 'Failed to load site surveys from backend.'
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

    void loadSurveys()

    return () => {
      ignore = true
    }
  }, [selectedStatus, debouncedSurveyor, currentPage, pageSize, refreshKey])

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const surveys = pageData?.content ?? []
  const totalElements = pageData?.totalElements ?? 0
  const totalPages = pageData?.totalPages ?? 0

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Site Surveys & Feasibility</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Schedule on-site technical visits, evaluate rooftop conditions, and determine optimal solar capacity.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh survey records"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-forest-600 text-white text-xs font-semibold hover:bg-forest-700 transition-colors shadow-xs"
          >
            <Plus size={15} />
            Schedule Survey
          </button>
        </div>
      </div>

      {/* Summary Cards: Values derived directly from backend counts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Surveys */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Total Surveys</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{loading ? '...' : metrics.total}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">All customer sites</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center shrink-0">
            <ClipboardCheck size={20} />
          </div>
        </div>

        {/* Scheduled Surveys */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Scheduled</p>
            <h3 className="text-2xl font-bold text-amber-700 mt-1">{loading ? '...' : metrics.scheduled}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Awaiting site visit</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar size={20} />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">In Progress</p>
            <h3 className="text-2xl font-bold text-blue-700 mt-1">{loading ? '...' : metrics.inProgress}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Active field inspection</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Completed</p>
            <h3 className="text-2xl font-bold text-forest-700 mt-1">{loading ? '...' : metrics.completed}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Ready for quotation</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Filters / Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            <Filter size={14} className="text-gray-400 shrink-0 mr-1" />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setSelectedStatus(f.value)
                  setCurrentPage(0)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedStatus === f.value
                    ? 'bg-forest-600 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Surveyor Search */}
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={surveyorSearch}
              onChange={(e) => setSurveyorSearch(e.target.value)}
              placeholder="Filter by surveyor name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
            />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-900">Failed to load surveys</h4>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Surveys Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-3 px-4">Customer Lead</th>
                <th className="py-3 px-4">Assigned Surveyor</th>
                <th className="py-3 px-4">Scheduled Date & Time</th>
                <th className="py-3 px-4">Site Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assessment / Rec. kW</th>
                <th className="py-3 px-4 text-right">Feasibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading && surveys.length === 0 ? (
                // Loading Skeleton Rows
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-28 mb-1"></div><div className="h-3 bg-gray-100 rounded w-20"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 rounded w-24"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 rounded w-28"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 rounded w-24"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 rounded w-16"></div></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-5 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : surveys.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <ClipboardCheck size={22} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">No site surveys found</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      {selectedStatus !== 'ALL' || debouncedSurveyor
                        ? 'No surveys match the active filter criteria. Try clearing filters.'
                        : 'No surveys have been scheduled yet. Click below to schedule a technical visit.'}
                    </p>
                    <button
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="inline-flex items-center gap-1.5 mt-4 px-3.5 py-1.5 rounded-lg bg-forest-600 text-white text-xs font-semibold hover:bg-forest-700 transition-colors shadow-xs"
                    >
                      <Plus size={14} /> Schedule First Survey
                    </button>
                  </td>
                </tr>
              ) : (
                surveys.map((survey) => {
                  const badge = STATUS_BADGES[survey.status] || STATUS_BADGES.SCHEDULED
                  return (
                    <tr key={survey.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Customer Name & Phone */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-forest-100 text-forest-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {(survey.customerName || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">
                              {survey.customerName || 'Lead Ref: ' + survey.leadId?.substring(0, 8)}
                            </span>
                            {survey.customerPhone && (
                              <p className="text-[10px] text-gray-400 font-mono">{survey.customerPhone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Surveyor */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-medium text-gray-900 flex items-center gap-1">
                            <User size={12} className="text-gray-400" />
                            {survey.surveyorName}
                          </span>
                          {survey.surveyorPhone && (
                            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                              <Phone size={10} /> {survey.surveyorPhone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Scheduled Date & Time */}
                      <td className="py-3 px-4 text-gray-700">
                        <div className="space-y-0.5">
                          <span className="font-medium flex items-center gap-1">
                            <Calendar size={12} className="text-gray-400" />
                            {new Date(survey.scheduledAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(survey.scheduledAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Site Address */}
                      <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">
                        {survey.siteAddress ? (
                          <span className="inline-flex items-center gap-1" title={survey.siteAddress}>
                            <MapPin size={12} className="text-gray-400 shrink-0" />
                            <span className="truncate">{survey.siteAddress}</span>
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Assessment / Rec. kW */}
                      <td className="py-3 px-4 font-semibold">
                        {survey.recommendedCapacityKw != null ? (
                          <span className="inline-flex items-center gap-1 text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                            <Zap size={12} className="text-amber-500" />
                            {survey.recommendedCapacityKw} kW
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px] font-normal italic">
                            {survey.status === 'COMPLETED' ? 'No kW recorded' : 'Pending visit'}
                          </span>
                        )}
                      </td>

                      {/* Feasibility */}
                      <td className="py-3 px-4 text-right">
                        {survey.feasibility === 'FEASIBLE' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={11} /> Feasible
                          </span>
                        ) : survey.feasibility === 'FEASIBLE_WITH_CONDITIONS' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            <AlertTriangle size={11} /> Conditional
                          </span>
                        ) : survey.feasibility === 'NOT_FEASIBLE' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                            <XCircle size={11} /> Unfeasible
                          </span>
                        ) : (
                          <span className="text-gray-300 text-[11px]">—</span>
                        )}
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
              of <strong className="font-semibold text-gray-900">{totalElements}</strong> total surveys
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

      {/* Schedule Survey Modal */}
      <ScheduleSurveyModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={() => {
          handleRefresh()
        }}
      />
    </div>
  )
}

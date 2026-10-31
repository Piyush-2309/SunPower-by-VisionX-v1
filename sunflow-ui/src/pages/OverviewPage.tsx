import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  MessageSquarePlus,
  UserCheck,
  TrendingUp,
  Globe,
  MessageCircle,
  Mic,
  Clock,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  MapPin,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import KpiCard from '../components/KpiCard'
import EnquiryChannelCard from '../components/EnquiryChannelCard'
import LeadDetailsModal from '../components/LeadDetailsModal'
import { getLeads } from '../services/api'
import type { LeadResponse } from '../types/lead'

interface DashboardMetrics {
  totalLeads: number
  newEnquiries: number
  qualifiedLeads: number
  convertedLeads: number
  conversionRate: string
}

export default function OverviewPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    newEnquiries: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    conversionRate: '0.0%',
  })

  const [recentLeads, setRecentLeads] = useState<LeadResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const recentPage = await getLeads({ page: 0, size: 5, sort: 'createdAt,desc' })
        const total = recentPage.totalElements

        const [newRes, qualRes, convRes] = await Promise.all([
          getLeads({ status: 'NEW', page: 0, size: 1 }),
          getLeads({ status: 'QUALIFIED', page: 0, size: 1 }),
          getLeads({ status: 'CONVERTED', page: 0, size: 1 }),
        ])

        const newCount = newRes.totalElements
        const qualCount = qualRes.totalElements
        const convCount = convRes.totalElements

        const rate = total > 0 ? ((convCount / total) * 100).toFixed(1) + '%' : '0.0%'

        if (!ignore) {
          setMetrics({
            totalLeads: total,
            newEnquiries: newCount,
            qualifiedLeads: qualCount,
            convertedLeads: convCount,
            conversionRate: rate,
          })
          setRecentLeads(recentPage.content)
        }
      } catch (err: unknown) {
        if (!ignore) {
          let msg = 'Failed to fetch overview metrics from backend.'
          if (err && typeof err === 'object' && 'response' in err) {
            const axiosErr = err as { response?: { data?: { message?: string } } }
            if (axiosErr.response?.data?.message) msg = axiosErr.response.data.message
          }
          setError(msg)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      ignore = true
    }
  }, [refreshKey])

  const loadDashboardData = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Solar Operations Overview</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time pipeline metrics and live enquiry activity backed by PostgreSQL.
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh Metrics
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-900">Failed to load live metrics</h4>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards: Live values derived from backend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Leads"
          value={loading ? '...' : metrics.totalLeads.toString()}
          subtitle="All-time ingested leads"
          icon={<Users size={20} />}
          accentColor="green"
          placeholder={false}
        />
        <KpiCard
          title="New Enquiries"
          value={loading ? '...' : metrics.newEnquiries.toString()}
          subtitle="Status = NEW (Pending review)"
          icon={<MessageSquarePlus size={20} />}
          accentColor="yellow"
          placeholder={false}
        />
        <KpiCard
          title="Qualified Leads"
          value={loading ? '...' : metrics.qualifiedLeads.toString()}
          subtitle="Status = QUALIFIED (Ready for survey)"
          icon={<UserCheck size={20} />}
          accentColor="blue"
          placeholder={false}
        />
        <KpiCard
          title="Conversion Rate"
          value={loading ? '...' : metrics.conversionRate}
          subtitle={`${metrics.convertedLeads} converted of ${metrics.totalLeads} total`}
          icon={<TrendingUp size={20} />}
          accentColor="purple"
          placeholder={false}
        />
      </div>

      {/* Two-column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries: Connected to actual backend response */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Recent Customer Enquiries</h3>
              <p className="text-xs text-gray-400">Latest submissions across all intake channels</p>
            </div>
            <Link
              to="/leads"
              className="text-xs font-semibold text-forest-700 hover:text-forest-800 inline-flex items-center gap-1"
            >
              View All in CRM <ArrowRight size={13} />
            </Link>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                <RefreshCw size={24} className="animate-spin text-forest-600 mb-2" />
                <p className="text-xs">Loading recent enquiries...</p>
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                  <Clock size={22} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">No enquiries recorded yet</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Submit a solar customer enquiry via the website form to start populating your pipeline.
                </p>
                <Link
                  to="/enquiries"
                  className="mt-4 px-3 py-1.5 rounded-lg bg-forest-600 text-white text-xs font-semibold hover:bg-forest-700 transition-colors"
                >
                  Create First Enquiry
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="py-3 px-2 flex items-center justify-between hover:bg-gray-50/80 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {lead.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 group-hover:text-forest-700 transition-colors">
                          {lead.fullName}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span className="font-mono">{lead.phone}</span>
                          {lead.city && (
                            <span className="inline-flex items-center gap-0.5">
                              &middot; <MapPin size={11} className="text-gray-400" /> {lead.city}
                            </span>
                          )}
                          {lead.requestedCapacityKw != null && (
                            <span className="inline-flex items-center gap-0.5 text-forest-700 font-medium">
                              &middot; <Zap size={11} className="text-amber-500" /> {lead.requestedCapacityKw} kW
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {lead.status}
                      </span>
                      <span className="text-[11px] text-gray-400 hidden sm:inline">
                        {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <ArrowRight size={13} className="text-gray-400 group-hover:text-forest-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enquiry Channels Section */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Enquiry Channels</h3>
            <p className="text-xs text-gray-400">Omnichannel ingestion pathways</p>
          </div>
          <div className="space-y-3">
            <EnquiryChannelCard
              icon={<Globe size={20} />}
              name="Website Enquiry"
              description="Active structured web form for solar installation customer intake."
              available={true}
              linkTo="/enquiries"
            />
            <EnquiryChannelCard
              icon={<MessageCircle size={20} />}
              name="WhatsApp AI Agent"
              description="Conversational lead intake via WhatsApp Business API (Stage 4)."
              available={false}
            />
            <EnquiryChannelCard
              icon={<Mic size={20} />}
              name="Voice AI Agent"
              description="Regional language voice assistant for phone enquiries (Stage 4)."
              available={false}
            />
          </div>
        </div>
      </div>

      {/* Lead Details Modal */}
      {selectedLeadId && (
        <LeadDetailsModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onStatusUpdated={() => {
            loadDashboardData()
          }}
        />
      )}
    </div>
  )
}

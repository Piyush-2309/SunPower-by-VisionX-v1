import { Globe, MessageCircle, Mic } from 'lucide-react'
import EnquiryChannelCard from '../components/EnquiryChannelCard'
import WebsiteEnquiryForm from '../components/WebsiteEnquiryForm'

export default function EnquiriesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Customer Enquiries & Intake</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Submit and ingest customer solar installation enquiries across available omnichannel pathways.
        </p>
      </div>

      {/* Channel selection cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Omnichannel Intake Gateways
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EnquiryChannelCard
            icon={<Globe size={20} />}
            name="Website Enquiry Form"
            description="Active web form for structured solar customer intake directly into PostgreSQL CRM."
            available={true}
          />
          <EnquiryChannelCard
            icon={<MessageCircle size={20} />}
            name="WhatsApp AI Agent"
            description="Requires WhatsApp Business Cloud API & Webhook verification (Stage 4)."
            available={false}
          />
          <EnquiryChannelCard
            icon={<Mic size={20} />}
            name="Voice AI Agent"
            description="Requires regional telephony & speech-to-text integration (Stage 4)."
            available={false}
          />
        </div>
      </div>

      {/* Active Form */}
      <div>
        <WebsiteEnquiryForm />
      </div>
    </div>
  )
}

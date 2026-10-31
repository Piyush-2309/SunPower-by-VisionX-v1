import { Zap, Globe, MessageCircle, Mic } from 'lucide-react'
import ConnectionStatus from '../components/ConnectionStatus'
import ChannelCard from '../components/ChannelCard'

const WORKFLOW_STEPS = [
  'Enquiry',
  'Lead Qualification',
  'Site Survey',
  'Quotation & BOM',
  'Sales Order',
  'Inventory',
  'Installation',
  'Warranty',
  'Service',
  'Dashboard',
]

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-overline">
          <Zap size={14} />
          AI-Powered Solar Operations
        </div>
        <h2 className="hero-title">
          Manage your solar business <em>end to end</em>
        </h2>
        <p className="hero-description">
          From customer enquiry to installation, warranty, and service &mdash;
          SunFlow 360 streamlines every step of your solar installation business
          with intelligent automation.
        </p>
      </section>

      {/* Backend Connection */}
      <ConnectionStatus />

      {/* Enquiry Channels */}
      <section>
        <div className="section-header">
          <h3 className="section-title">Customer Enquiry Channels</h3>
          <p className="section-subtitle">
            Three ways for customers to reach you &mdash; all feeding into a
            unified lead management system.
          </p>
        </div>
        <div className="channels-grid">
          <ChannelCard
            icon={<Globe size={24} />}
            iconColor="amber"
            name="Website Enquiry Form"
            description="Customers submit their solar enquiry through a structured web form. Leads are automatically created and qualified."
            available={true}
          />
          <ChannelCard
            icon={<MessageCircle size={24} />}
            iconColor="emerald"
            name="WhatsApp Assistant"
            description="AI-powered WhatsApp chatbot collects customer information through natural conversation. Requires WhatsApp Business API credentials."
            available={false}
          />
          <ChannelCard
            icon={<Mic size={24} />}
            iconColor="slate"
            name="Voice AI Assistant"
            description="Voice-based assistant supporting regional languages for customers who prefer phone interaction. Requires speech-to-text API."
            available={false}
          />
        </div>
      </section>

      {/* Workflow Overview */}
      <section>
        <div className="section-header">
          <h3 className="section-title">End-to-End Workflow</h3>
          <p className="section-subtitle">
            The complete lifecycle managed in one platform.
          </p>
        </div>
        <div className="workflow-card">
          <div className="workflow-steps">
            {WORKFLOW_STEPS.map((step, i) => (
              <div className="workflow-step" key={step}>
                <span className="workflow-step-number">{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

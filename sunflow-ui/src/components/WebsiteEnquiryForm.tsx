import { useState, type FormEvent } from 'react'
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Zap,
  IndianRupee,
  Home,
  Languages,
  CheckSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { createLead } from '../services/api'
import type {
  LeadCreateRequest,
  LeadResponse,
  PropertyType,
  SystemType,
} from '../types/lead'

interface FormErrors {
  fullName?: string
  phone?: string
  email?: string
  requestedCapacityKw?: string
  monthlyBill?: string
  roofAreaSqft?: string
  general?: string
}

interface WebsiteEnquiryFormProps {
  onSuccess?: (newLead: LeadResponse) => void
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'RESIDENTIAL', label: 'Residential (Home / Villa / Apartment)' },
  { value: 'COMMERCIAL', label: 'Commercial (Office / Retail / Mall)' },
  { value: 'INDUSTRIAL', label: 'Industrial (Factory / Warehouse)' },
  { value: 'INSTITUTIONAL', label: 'Institutional (School / Hospital / Govt)' },
  { value: 'OTHER', label: 'Other Property Type' },
]

const SYSTEM_TYPES: { value: SystemType; label: string }[] = [
  { value: 'ON_GRID', label: 'On-Grid (Connected to Power Grid with Net Metering)' },
  { value: 'OFF_GRID', label: 'Off-Grid (Standalone System with Battery Storage)' },
]

export default function WebsiteEnquiryForm({ onSuccess }: WebsiteEnquiryFormProps) {
  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [propertyType, setPropertyType] = useState<PropertyType>('RESIDENTIAL')
  const [requestedCapacityKw, setRequestedCapacityKw] = useState('')
  const [systemType, setSystemType] = useState<SystemType>('ON_GRID')
  const [monthlyBill, setMonthlyBill] = useState('')
  const [roofAreaSqft, setRoofAreaSqft] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState('English')
  const [subsidyInterest, setSubsidyInterest] = useState(true)
  const [qualificationNotes, setQualificationNotes] = useState('')

  // UI state
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submittedLead, setSubmittedLead] = useState<LeadResponse | null>(null)

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.'
    } else if (fullName.trim().length > 200) {
      newErrors.fullName = 'Full name must not exceed 200 characters.'
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.'
    } else if (phone.trim().length > 20) {
      newErrors.phone = 'Phone number must not exceed 20 characters.'
    } else if (!/^[0-9+\s\-()]{7,20}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (digits only or standard phone format).'
    }

    if (email.trim()) {
      if (email.trim().length > 255) {
        newErrors.email = 'Email must not exceed 255 characters.'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address.'
      }
    }

    if (requestedCapacityKw) {
      const cap = parseFloat(requestedCapacityKw)
      if (isNaN(cap) || cap <= 0) {
        newErrors.requestedCapacityKw = 'Capacity must be a positive number (e.g. 5.0).'
      }
    }

    if (monthlyBill) {
      const bill = parseFloat(monthlyBill)
      if (isNaN(bill) || bill <= 0) {
        newErrors.monthlyBill = 'Monthly electricity bill must be a positive number.'
      }
    }

    if (roofAreaSqft) {
      const area = parseFloat(roofAreaSqft)
      if (isNaN(area) || area <= 0) {
        newErrors.roofAreaSqft = 'Roof area must be a positive number.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFullName('')
    setPhone('')
    setEmail('')
    setAddress('')
    setCity('')
    setPropertyType('RESIDENTIAL')
    setRequestedCapacityKw('')
    setSystemType('ON_GRID')
    setMonthlyBill('')
    setRoofAreaSqft('')
    setPreferredLanguage('English')
    setSubsidyInterest(true)
    setQualificationNotes('')
    setErrors({})
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate() || submitting) {
      return
    }

    setSubmitting(true)
    setErrors({})

    const payload: LeadCreateRequest = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() ? email.trim() : undefined,
      address: address.trim() ? address.trim() : undefined,
      city: city.trim() ? city.trim() : undefined,
      propertyType,
      requestedCapacityKw: requestedCapacityKw ? parseFloat(requestedCapacityKw) : undefined,
      systemType,
      monthlyBill: monthlyBill ? parseFloat(monthlyBill) : undefined,
      roofAreaSqft: roofAreaSqft ? parseFloat(roofAreaSqft) : undefined,
      preferredLanguage: preferredLanguage.trim() ? preferredLanguage.trim() : undefined,
      subsidyInterest,
      channel: 'WEB_FORM', // Strictly matching EnquiryChannel.WEB_FORM
      qualificationNotes: qualificationNotes.trim() ? qualificationNotes.trim() : undefined,
    }

    try {
      const created = await createLead(payload)
      setSubmittedLead(created)
      resetForm()
      if (onSuccess) {
        onSuccess(created)
      }
    } catch (err: unknown) {
      let message = 'Failed to submit enquiry. Please check the network connection and try again.'
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string> } } }
        if (axiosErr.response?.data?.message) {
          message = axiosErr.response.data.message
        }
      }
      setErrors((prev) => ({ ...prev, general: message }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
      {/* Form Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-forest-50/50 to-solar-50/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center shadow-xs">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Website Solar Enquiry Form</h3>
            <p className="text-xs text-gray-500">
              Captures structured solar requirements and registers the lead into SunFlow 360 CRM.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-forest-100 text-forest-700">
          <Sparkles size={13} />
          Channel: WEB_FORM
        </span>
      </div>

      {/* Success Notification Banner */}
      {submittedLead && (
        <div className="m-6 p-5 rounded-xl bg-forest-50 border border-forest-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={22} className="text-forest-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-forest-900">
                Enquiry Successfully Registered! (HTTP 201 Created)
              </h4>
              <p className="text-xs text-forest-700 mt-1">
                Lead for <strong className="font-semibold text-forest-900">{submittedLead.fullName}</strong> has been created with status{' '}
                <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-forest-200 text-forest-800 text-[11px]">
                  {submittedLead.status}
                </span>.
              </p>
              <div className="mt-2 text-[11px] text-forest-600 font-mono bg-white/70 px-2.5 py-1.5 rounded border border-forest-200 inline-block">
                UUID: {submittedLead.id}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  to="/leads"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 hover:text-forest-900 bg-forest-200 hover:bg-forest-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  View in Leads CRM <ArrowRight size={13} />
                </Link>
                <button
                  type="button"
                  onClick={() => setSubmittedLead(null)}
                  className="text-xs font-medium text-forest-700 hover:underline"
                >
                  Dismiss banner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Error Banner */}
      {errors.general && (
        <div className="m-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-900">Submission Failed</h4>
            <p className="text-xs text-red-700 mt-0.5">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Customer Contact Details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <User size={16} className="text-forest-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Customer Contact Information
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name (Required) */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    if (errors.fullName) setErrors({ ...errors, fullName: undefined })
                  }}
                  placeholder="e.g. Ramesh Chandra"
                  maxLength={200}
                  required
                  className={`w-full px-3.5 py-2 text-sm border rounded-lg bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-500/20 ${
                    errors.fullName ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-forest-500'
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
            </div>

            {/* Phone Number (Required) */}
            <div>
              <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone size={15} />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (errors.phone) setErrors({ ...errors, phone: undefined })
                  }}
                  placeholder="e.g. 9876543210"
                  maxLength={20}
                  required
                  className={`w-full pl-9 pr-3.5 py-2 text-sm border rounded-lg bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-500/20 ${
                    errors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-forest-500'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
            </div>

            {/* Email (Optional) */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email Address <span className="text-gray-400 text-[11px]">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={15} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors({ ...errors, email: undefined })
                  }}
                  placeholder="e.g. ramesh@example.com"
                  maxLength={255}
                  className={`w-full pl-9 pr-3.5 py-2 text-sm border rounded-lg bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-500/20 ${
                    errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-forest-500'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* City / Locality (Optional) */}
            <div>
              <label htmlFor="city" className="block text-xs font-medium text-gray-700 mb-1">
                City / Locality <span className="text-gray-400 text-[11px]">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <MapPin size={15} />
                </div>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Hyderabad, Ahmedabad, Bengaluru"
                  maxLength={100}
                  className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
                />
              </div>
            </div>

            {/* Full Street Address (Optional) */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">
                Installation Address <span className="text-gray-400 text-[11px]">(Optional)</span>
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plot/Flat number, Building name, Street, Landmark"
                maxLength={500}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Property & Technical Requirements */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Building size={16} className="text-forest-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Property & Solar Technical Profile
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Property Type Dropdown */}
            <div>
              <label htmlFor="propertyType" className="block text-xs font-medium text-gray-700 mb-1">
                Property Category
              </label>
              <select
                id="propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
              >
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* System Type Dropdown */}
            <div>
              <label htmlFor="systemType" className="block text-xs font-medium text-gray-700 mb-1">
                System Grid Topology
              </label>
              <select
                id="systemType"
                value={systemType}
                onChange={(e) => setSystemType(e.target.value as SystemType)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
              >
                {SYSTEM_TYPES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Requested Capacity (kW) */}
            <div>
              <label htmlFor="capacity" className="block text-xs font-medium text-gray-700 mb-1">
                Requested Capacity (kW) <span className="text-gray-400 text-[11px]">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Zap size={15} />
                </div>
                <input
                  id="capacity"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={requestedCapacityKw}
                  onChange={(e) => {
                    setRequestedCapacityKw(e.target.value)
                    if (errors.requestedCapacityKw) setErrors({ ...errors, requestedCapacityKw: undefined })
                  }}
                  placeholder="e.g. 5.0"
                  className={`w-full pl-9 pr-12 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 ${
                    errors.requestedCapacityKw ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-forest-500'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-gray-400 font-medium">
                  kW
                </div>
              </div>
              {errors.requestedCapacityKw && (
                <p className="text-[11px] text-red-600 mt-1">{errors.requestedCapacityKw}</p>
              )}
            </div>

            {/* Monthly Electricity Bill (₹) */}
            <div>
              <label htmlFor="monthlyBill" className="block text-xs font-medium text-gray-700 mb-1">
                Average Monthly Electricity Bill (₹) <span className="text-gray-400 text-[11px]">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <IndianRupee size={15} />
                </div>
                <input
                  id="monthlyBill"
                  type="number"
                  step="50"
                  min="1"
                  value={monthlyBill}
                  onChange={(e) => {
                    setMonthlyBill(e.target.value)
                    if (errors.monthlyBill) setErrors({ ...errors, monthlyBill: undefined })
                  }}
                  placeholder="e.g. 4500"
                  className={`w-full pl-9 pr-3.5 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 ${
                    errors.monthlyBill ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-forest-500'
                  }`}
                />
              </div>
              {errors.monthlyBill && <p className="text-[11px] text-red-600 mt-1">{errors.monthlyBill}</p>}
            </div>

            {/* Roof Area (Sq Ft) */}
            <div>
              <label htmlFor="roofArea" className="block text-xs font-medium text-gray-700 mb-1">
                Available Roof Area <span className="text-gray-400 text-[11px]">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Home size={15} />
                </div>
                <input
                  id="roofArea"
                  type="number"
                  step="10"
                  min="10"
                  value={roofAreaSqft}
                  onChange={(e) => {
                    setRoofAreaSqft(e.target.value)
                    if (errors.roofAreaSqft) setErrors({ ...errors, roofAreaSqft: undefined })
                  }}
                  placeholder="e.g. 800"
                  className={`w-full pl-9 pr-14 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 ${
                    errors.roofAreaSqft ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-forest-500'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-gray-400 font-medium">
                  sq. ft.
                </div>
              </div>
              {errors.roofAreaSqft && <p className="text-[11px] text-red-600 mt-1">{errors.roofAreaSqft}</p>}
            </div>

            {/* Preferred Language */}
            <div>
              <label htmlFor="prefLang" className="block text-xs font-medium text-gray-700 mb-1">
                Preferred Consultation Language
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Languages size={15} />
                </div>
                <input
                  id="prefLang"
                  type="text"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  placeholder="e.g. English, Hindi, Gujarati"
                  maxLength={30}
                  className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Subsidy & Qualification Notes */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare size={16} className="text-forest-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Government Subsidy & Additional Notes
            </h4>
          </div>

          {/* Subsidy Checkbox */}
          <div className="bg-forest-50/60 border border-forest-100 rounded-lg p-3.5 flex items-start gap-3 mb-4">
            <input
              id="subsidy"
              type="checkbox"
              checked={subsidyInterest}
              onChange={(e) => setSubsidyInterest(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-forest-600 focus:ring-forest-500"
            />
            <label htmlFor="subsidy" className="text-xs text-gray-700 cursor-pointer select-none">
              <span className="font-semibold text-gray-900">
                Interested in PM Surya Ghar / State Central Financial Assistance (CFA) Subsidy
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Check this if the client wants assistance with subsidy eligibility assessment and online portal submission.
              </p>
            </label>
          </div>

          {/* Qualification Notes */}
          <div>
            <label htmlFor="notes" className="block text-xs font-medium text-gray-700 mb-1">
              Specific Requirements or Qualification Notes <span className="text-gray-400 text-[11px]">(Optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              value={qualificationNotes}
              onChange={(e) => setQualificationNotes(e.target.value)}
              placeholder="e.g. Inquiring for 3-phase connection, interested in bifacial panels, wants site visit on weekends."
              maxLength={500}
              className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Channel will be dispatched as <code className="text-forest-700 font-bold">WEB_FORM</code>
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-forest-600 text-white text-sm font-medium hover:bg-forest-700 transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting Enquiry...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Solar Enquiry
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

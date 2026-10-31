import { Construction } from 'lucide-react'

interface ComingSoonPageProps {
  title: string
}

export default function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-solar-100 flex items-center justify-center mb-5">
        <Construction size={28} className="text-solar-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 leading-relaxed">
        This module is planned for a future stage of development.
        It is not yet implemented and does not contain any functionality.
      </p>
      <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wide text-solar-600 bg-solar-50 border border-solar-200 px-3 py-1 rounded-full">
        Coming Soon
      </span>
    </div>
  )
}

import { CheckCircle } from 'lucide-react'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Спасибо за ответы!</h1>
        <p className="text-slate-500 leading-relaxed">
          Ваш отклик анонимен и поможет сделать компанию лучше. Мы ценим вашу честность.
        </p>
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-sm text-slate-400">
            Результаты опроса будут проанализированы HR-командой с использованием AI-аналитики.
          </p>
        </div>
      </div>
    </div>
  )
}

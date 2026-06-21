'use client'
import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

interface Props {
  surveyId: string
}

export default function AIReport({ surveyId }: Props) {
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch('/api/ai-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ surveyId }),
        })

        if (!res.ok) {
          setError('Недостаточно данных для анализа. Соберите хотя бы несколько ответов.')
          setLoading(false)
          return
        }

        const data = await res.json()
        setReport(data.text || '')
      } catch {
        setError('Ошибка генерации отчёта')
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [surveyId])

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">AI-отчёт</h3>
          <p className="text-xs text-slate-400">Автоматический анализ данных опроса</p>
        </div>
        {loading && (
          <span className="ml-auto text-xs text-indigo-500 animate-pulse font-medium">Анализирую данные...</span>
        )}
      </div>

      <div className="px-6 py-5">
        {error && (
          <div className="text-slate-500 text-sm bg-slate-50 rounded-xl p-4 border border-slate-200">{error}</div>
        )}

        {loading && !error && (
          <div className="space-y-3">
            {[90, 70, 80, 55, 75, 60].map((w, i) => (
              <div key={i} className="h-3 bg-slate-100 rounded-full animate-pulse" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {!loading && !error && report && (
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
            {report}
          </div>
        )}
      </div>
    </div>
  )
}

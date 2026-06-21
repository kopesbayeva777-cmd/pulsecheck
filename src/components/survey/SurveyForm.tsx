'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QUESTIONS, BLOCKS, SCALE_LABELS } from '@/lib/questions'

interface Props {
  surveyId: string
  surveyTitle: string
}

type Answers = Record<string, number | string | null>

const initialAnswers: Answers = Object.fromEntries(
  QUESTIONS.map(q => [q.id, null])
)

export default function SurveyForm({ surveyId, surveyTitle }: Props) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const blockGroups = Object.entries(BLOCKS).map(([key, label]) => ({
    key,
    label,
    questions: QUESTIONS.filter(q => q.block === key),
  }))

  const answered = QUESTIONS.filter(q => q.type !== 'text' && answers[q.id] !== null).length
  const total = QUESTIONS.filter(q => q.type !== 'text').length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const unanswered = QUESTIONS.filter(q => q.type !== 'text' && answers[q.id] === null)
    if (unanswered.length > 0) {
      setError(`Пожалуйста, ответьте на все вопросы (осталось ${unanswered.length})`)
      return
    }

    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const payload: Record<string, number | string | null> = { survey_id: surveyId }
    for (let i = 1; i <= 19; i++) {
      payload[`q${i}`] = answers[`q${i}`] as number
    }
    payload.comment = (answers.q20 as string) || null

    const { error: insertError } = await supabase.from('responses').insert(payload)

    if (insertError) {
      setError('Ошибка отправки. Попробуйте ещё раз.')
      setSubmitting(false)
      return
    }

    router.push(`/survey/${surveyId}/thank-you`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            PulseCheck
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{surveyTitle}</h1>
          <p className="text-slate-500 mt-2 text-sm">Анонимный опрос · {total} вопросов</p>
          <div className="mt-4 bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(answered / total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">{answered} из {total}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {blockGroups.map(({ key, label, questions }) => (
            <div key={key} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-3">
                <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">{label}</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {questions.map(q => (
                  <div key={q.id} className="px-6 py-5">
                    <p className="text-slate-800 font-medium mb-4 leading-snug">
                      <span className="text-slate-400 font-normal mr-2">{q.num}.</span>
                      {q.text}
                    </p>

                    {q.type === 'nps' && (
                      <div>
                        <div className="flex gap-1.5 flex-wrap">
                          {Array.from({ length: 11 }, (_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setAnswers(a => ({ ...a, [q.id]: i }))}
                              className={`w-10 h-10 rounded-lg text-sm font-semibold border-2 transition-all ${
                                answers[q.id] === i
                                  ? i >= 9
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : i >= 7
                                    ? 'bg-amber-500 border-amber-500 text-white'
                                    : 'bg-rose-500 border-rose-500 text-white'
                                  : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                              }`}
                            >
                              {i}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-400">
                          <span>Точно нет</span>
                          <span>Точно да</span>
                        </div>
                      </div>
                    )}

                    {q.type === 'scale' && (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAnswers(a => ({ ...a, [q.id]: val }))}
                            title={SCALE_LABELS[val]}
                            className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                              answers[q.id] === val
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    )}

                    {q.type === 'text' && (
                      <textarea
                        value={(answers[q.id] as string) || ''}
                        onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                        placeholder="Ваш ответ (необязательно)..."
                        rows={3}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-4 rounded-2xl transition-colors text-lg shadow-sm"
          >
            {submitting ? 'Отправка...' : 'Отправить ответы'}
          </button>

          <p className="text-center text-xs text-slate-400 pb-8">
            Ваши ответы полностью анонимны и не содержат личной информации
          </p>
        </form>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import { CheckCircle, ClipboardList } from 'lucide-react'

const INDUSTRIES = [
  'IT и технологии',
  'Финансы и банки',
  'Ритейл и торговля',
  'Производство',
  'Строительство и недвижимость',
  'Образование',
  'Здравоохранение',
  'Консалтинг',
  'Транспорт и логистика',
  'Маркетинг и реклама',
  'Госсектор',
  'Другое',
]

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

interface CreatedSurvey {
  id: string
  title: string
  code: string
}

export default function NewSurveyPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<CreatedSurvey | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let code = generateCode()
    let attempts = 0

    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('surveys')
        .select('id')
        .eq('code', code)
        .single()
      if (!existing) break
      code = generateCode()
      attempts++
    }

    const insertData: Record<string, string> = { title: title.trim(), code, owner_id: user.id }
    if (industry) insertData.industry = industry

    const { data, error: insertError } = await supabase
      .from('surveys')
      .insert(insertData)
      .select()
      .single()

    if (insertError || !data) {
      setError('Ошибка создания опроса. Попробуйте ещё раз.')
      setLoading(false)
      return
    }

    setCreated({ id: data.id, title: data.title, code: data.code })
    setLoading(false)
  }

  if (created) {
    const origin = typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    const surveyUrl = `${origin}/survey/${created.code}`

    return (
      <div className="max-w-lg">
        <div className="mb-8">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 text-sm">
            ← Назад
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Опрос создан!</h1>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-7 h-7 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">{created.title}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Код: {created.code}</p>
            </div>
          </div>

          <div className="bg-[#F8F9FB] border border-[#E8ECF0] rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 mb-1">Ссылка для сотрудников</p>
            <p className="text-sm font-mono text-indigo-600 break-all">{surveyUrl}</p>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <p className="text-xs text-slate-500 font-medium self-start">QR-код для распечатки</p>
            <div className="p-4 bg-white border border-[#E8ECF0] rounded-xl inline-block">
              <QRCode value={surveyUrl} size={160} />
            </div>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Разместите QR-код в офисе или отправьте сотрудникам — они смогут пройти опрос с телефона
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href={`/dashboard/surveys/${created.id}`}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm text-center transition-colors"
            >
              Посмотреть результаты
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 border border-[#E8ECF0] hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-xl text-sm text-center transition-colors"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 text-sm">
          ← Назад
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Новый опрос</h1>
        <p className="text-slate-500 text-sm mt-1">Стандартный опрос PulseCheck из 20 вопросов будет создан автоматически</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Название опроса
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Пульс-опрос Q2 2025"
              required
              autoFocus
              className="w-full border border-[#E8ECF0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            />
            <p className="text-xs text-slate-400 mt-1.5">Сотрудники увидят это название в начале опроса</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Отрасль <span className="text-slate-400 font-normal">(необязательно)</span>
            </label>
            <select
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="w-full border border-[#E8ECF0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-700"
            >
              <option value="">Выберите отрасль...</option>
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1.5">Помогает сравнивать результаты с отраслевыми бенчмарками</p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-800">
            <div className="flex items-center gap-2 font-medium mb-2">
              <ClipboardList className="w-4 h-4" />
              В опрос включено 20 вопросов:
            </div>
            <ul className="space-y-1 text-indigo-700 text-xs">
              <li>• eNPS компании и руководителя (шкала 0–10)</li>
              <li>• Вовлечённость, Руководство, Развитие, Баланс (шкала 1–5)</li>
              <li>• Мотивационный профиль (шкала 1–5)</li>
              <li>• Открытый вопрос для комментариев</li>
            </ul>
          </div>

          {error && <p className="text-rose-600 text-sm bg-rose-50 border border-rose-100 px-3 py-2.5 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Создание...' : 'Создать опрос'}
          </button>
        </form>
      </div>
    </div>
  )
}

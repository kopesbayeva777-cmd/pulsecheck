'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import { CheckCircle, ClipboardList, Share2, Check, Download } from 'lucide-react'

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

const BTN: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 100, cursor: 'pointer',
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(0,0,0,0.08)',
  color: '#111827',
  transition: 'background 0.15s',
}

export default function NewSurveyPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<CreatedSurvey | null>(null)
  const [copied, setCopied] = useState(false)

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

    const copyLink = async () => {
      const text = `PulseCheck — анонимный опрос команды\n\nПожалуйста, пройдите короткий опрос — это займёт 3–5 минут. Ваши ответы анонимны и помогут улучшить работу команды.\n\nСсылка на опрос:\n${surveyUrl}`
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    const downloadQR = () => {
      const svg = document.getElementById('new-survey-qr')
      if (!svg) return
      const canvas = document.createElement('canvas')
      const size = 400
      canvas.width = size
      canvas.height = size + 140
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const code = created!.code
      const svgData = new XMLSerializer().serializeToString(svg)
      const img = new Image()
      img.onload = () => {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, size, size)
        ctx.fillStyle = '#111827'; ctx.font = 'bold 18px Inter, Arial'; ctx.textAlign = 'center'
        ctx.fillText('PulseCheck — анонимный опрос команды', size / 2, size + 30)
        ctx.fillStyle = '#6B7280'; ctx.font = '13px Inter, Arial'
        ctx.fillText('Пройдите короткий опрос — это займёт 3–5 минут.', size / 2, size + 55)
        ctx.fillText('Ваши ответы анонимны и помогут улучшить', size / 2, size + 75)
        ctx.fillText('работу команды.', size / 2, size + 95)
        ctx.fillStyle = '#5B5BD6'; ctx.font = '12px Inter, Arial'
        ctx.fillText(surveyUrl, size / 2, size + 125)
        const link = document.createElement('a')
        link.download = `qr-опрос-${code}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    }

    return (
      <div className="max-w-2xl">
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

          {/* Скрытый QR для скачивания */}
          <div style={{ position: 'absolute', left: -9999, top: -9999 }}>
            <QRCode id="new-survey-qr" value={surveyUrl} size={400} />
          </div>

          {/* Инструкция */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3 text-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="font-semibold text-slate-900">Опрос готов к запуску!</span>
            </div>

            <div>
              <p className="font-medium text-slate-800 mb-1">Как поделиться с сотрудниками:</p>
              <ul className="text-slate-600 space-y-1 text-xs">
                <li>• Отправьте ссылку через мессенджер — кнопка «Поделиться ссылкой»</li>
                <li>• Или распечатайте QR-код — кнопка «Скачать QR с описанием»</li>
              </ul>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                <button
                  onClick={copyLink}
                  style={BTN}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.95)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.7)')}
                >
                  {copied ? <Check size={14} color="#059669" /> : <Share2 size={14} />}
                  {copied ? 'Скопировано!' : 'Поделиться ссылкой на опрос'}
                </button>
                <button
                  onClick={downloadQR}
                  style={BTN}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.95)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.7)')}
                >
                  <Download size={14} />
                  Скачать QR с описанием
                </button>
              </div>
            </div>

            <div>
              <p className="font-medium text-slate-800 mb-1">Как провести опрос:</p>
              <ul className="text-slate-600 space-y-1 text-xs">
                <li>• Рекомендуем установить дедлайн и заранее предупредить команду</li>
                <li>• После сбора ответов закройте опрос в настройках — получите результаты и проанализируйте данные с помощью ИИ</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-slate-800 mb-1">Достоверность ответов:</p>
              <ul className="text-slate-600 space-y-1 text-xs">
                <li>• Система ограничивает одно прохождение опроса с одного устройства раз в 24 часа</li>
              </ul>
            </div>
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

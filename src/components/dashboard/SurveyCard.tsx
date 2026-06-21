'use client'
import { useState } from 'react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import { Users, Share2, QrCode, Check, Download } from 'lucide-react'

interface Survey {
  id: string
  title: string
  code: string
  is_active: boolean
  created_at: string
}

interface Props {
  survey: Survey
  origin: string
  responseCount: number
}

export default function SurveyCard({ survey, origin, responseCount }: Props) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const surveyUrl = `${origin}/survey/${survey.code}`

  async function copyLink() {
    const text = `PulseCheck — анонимный опрос команды\n\nПожалуйста, пройдите короткий опрос — это займёт 3–5 минут. Ваши ответы анонимны и помогут улучшить работу команды.\n\nСсылка на опрос:\n${surveyUrl}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadQR() {
    const svg = document.getElementById(`qr-${survey.code}`)
    if (!svg) return
    const canvas = document.createElement('canvas')
    const size = 400
    canvas.width = size
    canvas.height = size + 140
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, size, size)

      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PulseCheck — анонимный опрос команды', size / 2, size + 30)

      ctx.fillStyle = '#64748b'
      ctx.font = '13px Arial'
      ctx.fillText('Пройдите короткий опрос — это займёт 3–5 минут.', size / 2, size + 55)
      ctx.fillText('Ваши ответы анонимны и помогут улучшить', size / 2, size + 75)
      ctx.fillText('работу команды.', size / 2, size + 95)

      ctx.fillStyle = '#6366f1'
      ctx.font = '12px Arial'
      ctx.fillText(surveyUrl, size / 2, size + 125)

      const link = document.createElement('a')
      link.download = `qr-опрос-${survey.code}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-semibold text-slate-900">{survey.title}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              survey.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {survey.is_active ? 'Активен' : 'Закрыт'}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
              <Users className="w-3.5 h-3.5" />
              {responseCount} сотрудников прошли опрос
            </span>
            <span className="text-slate-400 text-xs">
              Код: <span className="font-mono font-medium text-slate-600">{survey.code}</span>
              {' · '}
              {new Date(survey.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1 font-mono break-all">{surveyUrl}</p>
        </div>

        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <button
            onClick={() => setShowQR(v => !v)}
            title="QR-код"
            className={`flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-lg transition-colors font-medium ${
              showQR
                ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                : 'bg-white border-[#E8ECF0] text-slate-600 hover:bg-slate-50'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            QR
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 bg-white border border-[#E8ECF0] text-slate-600 hover:bg-slate-50 text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Скопировано!' : 'Поделиться ссылкой на опрос'}
          </button>
          <Link
            href={`/dashboard/surveys/${survey.id}`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Результаты
          </Link>
        </div>
      </div>

      {showQR && (
        <div className="mt-4 pt-4 border-t border-[#E8ECF0] flex items-start gap-6">
          <div className="p-3 bg-white border border-[#E8ECF0] rounded-xl inline-block">
            <QRCode id={`qr-${survey.code}`} value={surveyUrl} size={140} />
          </div>
          <div className="text-sm text-slate-500 pt-1">
            <p className="font-medium text-slate-700 mb-1">QR-код для опроса</p>
            <p className="text-xs leading-relaxed mb-3">Распечатайте или разместите этот QR-код, чтобы сотрудники могли легко пройти опрос с телефона.</p>
            <button
              onClick={downloadQR}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Скачать QR с описанием
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
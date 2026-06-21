'use client'
import { useEffect, useState } from 'react'
import { Sparkles, Download } from 'lucide-react'

interface Motivation {
  salary: number
  recognition: number
  development: number
  stability: number
  team: number
  autonomy: number
}

interface Props {
  surveyId: string
  surveyTitle?: string
  responseCount?: number
  companyNPS?: number
  managerNPS?: number
  promotersPercent?: number
  passivesPercent?: number
  detractorsPercent?: number
  engagement?: number
  management?: number
  growth?: number
  balance?: number
  motivation?: Motivation
  comments?: string[]
}

export default function AIReport({
  surveyId,
  surveyTitle = '',
  responseCount = 0,
  companyNPS = 0,
  managerNPS = 0,
  promotersPercent = 0,
  passivesPercent = 0,
  detractorsPercent = 0,
  engagement = 0,
  management = 0,
  growth = 0,
  balance = 0,
  motivation = { salary: 0, recognition: 0, development: 0, stability: 0, team: 0, autonomy: 0 },
  comments = [],
}: Props) {
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
          setError('Недостаточно данных для анализа.')
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

  function downloadPDF() {
    const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    const npsSign = (v: number) => (v > 0 ? '+' + v : '' + v)
    const mot = motivation
    const commentsHtml = comments.length > 0
      ? '<h2>Комментарии сотрудников (' + comments.length + ')</h2>' +
        comments.slice(0, 15).map(c => '<div class="comment">&laquo;' + c + '&raquo;</div>').join('')
      : ''
    const aiReportHtml = report
      ? '<h2>AI-отчёт</h2><div class="ai-report">' + report.replace(/\n/g, '<br>') + '</div>'
      : ''
    const html = '<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>' + surveyTitle + '</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;max-width:820px;margin:40px auto;padding:0 24px}.header{border-bottom:3px solid #6366f1;padding-bottom:16px;margin-bottom:24px}.logo{display:inline-block;background:#6366f1;color:white;font-weight:bold;font-size:13px;padding:4px 10px;border-radius:6px;margin-bottom:10px}h1{font-size:22px;font-weight:bold}.meta{color:#64748b;font-size:12px;margin-top:6px}h2{font-size:14px;font-weight:bold;color:#4338ca;margin:24px 0 12px;text-transform:uppercase;border-bottom:1px solid #e2e8f0;padding-bottom:6px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:8px}.card{border:1px solid #e2e8f0;border-radius:10px;padding:14px;background:#f8fafc}.card-label{font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase}.card-value{font-size:26px;font-weight:bold;margin-top:6px}.card-sub{font-size:11px;color:#94a3b8;margin-top:2px}.enps-row{display:flex;gap:8px;margin-bottom:8px}.enps-badge{flex:1;text-align:center;border-radius:8px;padding:10px;font-size:12px;font-weight:600}.enps-promoter{background:#dcfce7;color:#166534}.enps-passive{background:#fef9c3;color:#854d0e}.enps-detractor{background:#fee2e2;color:#991b1b}.motiv-row{display:flex;align-items:center;gap:12px;margin-bottom:8px}.motiv-label{width:120px;font-size:12px;color:#475569}.motiv-bar-bg{flex:1;background:#e2e8f0;border-radius:4px;height:8px}.motiv-bar{background:#6366f1;border-radius:4px;height:8px}.motiv-val{width:32px;text-align:right;font-size:12px;font-weight:600}.comment{background:#f8fafc;border-left:3px solid #6366f1;padding:10px 14px;margin-bottom:8px;font-size:12px;color:#475569;line-height:1.5}.ai-report{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;font-size:12px;color:#475569;line-height:1.7}.footer{margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:11px;text-align:center}</style></head><body>' +
      '<div class="header"><div class="logo">PulseCheck</div><h1>' + surveyTitle + '</h1><div class="meta">Отчёт: ' + date + ' · Ответов: ' + responseCount + '</div></div>' +
      '<h2>Ключевые показатели</h2><div class="grid">' +
      '<div class="card"><div class="card-label">eNPS компании</div><div class="card-value">' + npsSign(companyNPS) + '</div><div class="card-sub">бенчмарк: +20</div></div>' +
      '<div class="card"><div class="card-label">eNPS руководителя</div><div class="card-value">' + npsSign(managerNPS) + '</div><div class="card-sub">бенчмарк: +30</div></div>' +
      '<div class="card"><div class="card-label">Вовлечённость</div><div class="card-value">' + engagement + '/5</div><div class="card-sub">бенчмарк: 3.8</div></div>' +
      '<div class="card"><div class="card-label">Руководство</div><div class="card-value">' + management + '/5</div><div class="card-sub">бенчмарк: 3.7</div></div>' +
      '<div class="card"><div class="card-label">Развитие</div><div class="card-value">' + growth + '/5</div><div class="card-sub">бенчмарк: 3.5</div></div>' +
      '<div class="card"><div class="card-label">Баланс</div><div class="card-value">' + balance + '/5</div><div class="card-sub">бенчмарк: 3.6</div></div>' +
      '</div><h2>Распределение eNPS</h2><div class="enps-row">' +
      '<div class="enps-badge enps-promoter">Промоутеры<br><strong>' + promotersPercent + '%</strong></div>' +
      '<div class="enps-badge enps-passive">Пассивные<br><strong>' + passivesPercent + '%</strong></div>' +
      '<div class="enps-badge enps-detractor">Критики<br><strong>' + detractorsPercent + '%</strong></div>' +
      '</div><h2>Мотивационный профиль</h2>' +
      [['Зарплата', mot.salary], ['Признание', mot.recognition], ['Развитие', mot.development], ['Стабильность', mot.stability], ['Команда', mot.team], ['Автономия', mot.autonomy]]
        .map(([l, v]) => '<div class="motiv-row"><div class="motiv-label">' + l + '</div><div class="motiv-bar-bg"><div class="motiv-bar" style="width:' + (Number(v)/5*100) + '%"></div></div><div class="motiv-val">' + v + '</div></div>').join('') +
      aiReportHtml + commentsHtml +
      '<div class="footer">Сгенерировано в PulseCheck · pulsecheck-jade.vercel.app</div></body></html>'

    const win = window.open('', '_blank')
    if (!win) { alert('Разрешите всплывающие окна'); return }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 300)
  }

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
        {loading && <span className="ml-auto text-xs text-indigo-500 animate-pulse font-medium">Анализирую...</span>}
        {!loading && !error && report && (
          <button onClick={downloadPDF} className="ml-auto flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg font-medium transition-colors bg-white">
            <Download className="w-3.5 h-3.5" />
            Скачать PDF
          </button>
        )}
      </div>
      <div className="px-6 py-5">
        {error && <div className="text-slate-500 text-sm bg-slate-50 rounded-xl p-4 border border-slate-200">{error}</div>}
        {loading && !error && (
          <div className="space-y-3">
            {[90, 70, 80, 55, 75, 60].map((w, i) => (
              <div key={i} className="h-3 bg-slate-100 rounded-full animate-pulse" style={{ width: w + '%' }} />
            ))}
          </div>
        )}
        {!loading && !error && report && (
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">{report}</div>
        )}
      </div>
    </div>
  )
}
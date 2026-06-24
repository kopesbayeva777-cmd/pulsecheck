'use client'
import { Download } from 'lucide-react'

interface Motivation {
  salary: number
  recognition: number
  development: number
  stability: number
  team: number
  autonomy: number
}

interface Props {
  surveyTitle: string
  responseCount: number
  companyNPS: number
  managerNPS: number
  promotersPercent: number
  passivesPercent: number
  detractorsPercent: number
  engagement: number
  management: number
  growth: number
  balance: number
  motivation: Motivation
  comments: string[]
  aiReport?: string
}

export default function DownloadPDFButton({
  surveyTitle,
  responseCount,
  companyNPS,
  managerNPS,
  promotersPercent,
  passivesPercent,
  detractorsPercent,
  engagement,
  management,
  growth,
  balance,
  motivation,
  comments,
  aiReport,
}: Props) {
  function downloadPDF() {
    const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    const npsSign = (v: number) => (v > 0 ? `+${v}` : `${v}`)

    const commentsHtml =
      comments.length > 0
        ? `<h2>Комментарии сотрудников (${comments.length})</h2>
           ${comments.slice(0, 15).map(c => `<div class="comment">&laquo;${c}&raquo;</div>`).join('')}`
        : ''

    const aiReportHtml = aiReport
      ? `<h2>AI-отчёт</h2><div class="ai-report">${aiReport.replace(/\n/g, '<br>')}</div>`
      : ''

    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>${surveyTitle} — Отчёт PulseCheck</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1e293b; max-width: 820px; margin: 40px auto; padding: 0 24px; }
  .header { border-bottom: 3px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 22px; font-weight: bold; color: #1e293b; }
  .header .meta { color: #64748b; font-size: 12px; margin-top: 6px; }
  .logo { display: inline-block; background: #6366f1; color: white; font-weight: bold; font-size: 13px; padding: 4px 10px; border-radius: 6px; margin-bottom: 10px; }
  h2 { font-size: 14px; font-weight: bold; color: #4338ca; margin: 24px 0 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 8px; }
  .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #f8fafc; }
  .card-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
  .card-value { font-size: 26px; font-weight: bold; color: #1e293b; margin-top: 6px; }
  .card-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
  .enps-row { display: flex; gap: 8px; margin-bottom: 8px; }
  .enps-badge { flex: 1; text-align: center; border-radius: 8px; padding: 10px; font-size: 12px; font-weight: 600; }
  .enps-promoter { background: #dcfce7; color: #166534; }
  .enps-passive { background: #fef9c3; color: #854d0e; }
  .enps-detractor { background: #fee2e2; color: #991b1b; }
  .motiv-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .motiv-label { width: 120px; font-size: 12px; color: #475569; }
  .motiv-bar-bg { flex: 1; background: #e2e8f0; border-radius: 4px; height: 8px; }
  .motiv-bar { background: #6366f1; border-radius: 4px; height: 8px; }
  .motiv-val { width: 32px; text-align: right; font-size: 12px; font-weight: 600; color: #1e293b; }
  .comment { background: #f8fafc; border-left: 3px solid #6366f1; border-radius: 4px; padding: 10px 14px; margin-bottom: 8px; font-size: 12px; color: #475569; line-height: 1.5; }
  .ai-report { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; font-size: 12px; color: #475569; line-height: 1.7; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; text-align: center; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<div class="header">
  <div class="logo">PulseCheck</div>
  <h1>${surveyTitle}</h1>
  <div class="meta">Отчёт сформирован: ${date} · Количество ответов: ${responseCount}</div>
</div>

<h2>Ключевые показатели</h2>
<div class="grid">
  <div class="card"><div class="card-label">eNPS компании</div><div class="card-value">${npsSign(companyNPS)}</div><div class="card-sub">бенчмарк: +20</div></div>
  <div class="card"><div class="card-label">eNPS руководителя</div><div class="card-value">${npsSign(managerNPS)}</div><div class="card-sub">бенчмарк: +30</div></div>
  <div class="card"><div class="card-label">Вовлечённость</div><div class="card-value">${engagement}<span style="font-size:14px;color:#94a3b8">/5</span></div><div class="card-sub">бенчмарк: 3.8</div></div>
  <div class="card"><div class="card-label">Руководство</div><div class="card-value">${management}<span style="font-size:14px;color:#94a3b8">/5</span></div><div class="card-sub">бенчмарк: 3.7</div></div>
  <div class="card"><div class="card-label">Развитие</div><div class="card-value">${growth}<span style="font-size:14px;color:#94a3b8">/5</span></div><div class="card-sub">бенчмарк: 3.5</div></div>
  <div class="card"><div class="card-label">Баланс</div><div class="card-value">${balance}<span style="font-size:14px;color:#94a3b8">/5</span></div><div class="card-sub">бенчмарк: 3.6</div></div>
</div>

<h2>Распределение eNPS компании</h2>
<div class="enps-row">
  <div class="enps-badge enps-promoter">Промоутеры<br><strong>${promotersPercent}%</strong></div>
  <div class="enps-badge enps-passive">Пассивные<br><strong>${passivesPercent}%</strong></div>
  <div class="enps-badge enps-detractor">Критики<br><strong>${detractorsPercent}%</strong></div>
</div>

<h2>Мотивационный профиль</h2>
${[
  ['Зарплата', motivation.salary],
  ['Признание', motivation.recognition],
  ['Развитие', motivation.development],
  ['Стабильность', motivation.stability],
  ['Команда', motivation.team],
  ['Автономия', motivation.autonomy],
].map(([label, val]) => `
  <div class="motiv-row">
    <div class="motiv-label">${label}</div>
    <div class="motiv-bar-bg"><div class="motiv-bar" style="width:${((val as number) / 5) * 100}%"></div></div>
    <div class="motiv-val">${val}</div>
  </div>`).join('')}

${aiReportHtml}
${commentsHtml}

<div class="footer">Сгенерировано в PulseCheck · pulsecheck-jade.vercel.app</div>
</body>
</html>`

    const win = window.open('', '_blank')
    if (!win) { alert('Разрешите всплывающие окна для скачивания PDF'); return }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 300)
  }

  return (
    <button
      onClick={downloadPDF}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 100, cursor: 'pointer',
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(0,0,0,0.08)',
        color: '#111827',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.95)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.7)')}
    >
      <Download className="w-4 h-4" />
      Скачать PDF
    </button>
  )
}
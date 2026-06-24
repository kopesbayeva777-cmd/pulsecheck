import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculateMetrics } from '@/lib/calculations'
import { BENCHMARKS, getScoreColor, getScoreBg } from '@/lib/benchmarks'
import ENPSChart from '@/components/dashboard/ENPSChart'
import BlockChart from '@/components/dashboard/BlockChart'
import MotivationChart from '@/components/dashboard/MotivationChart'
import AIReport from '@/components/dashboard/AIReport'
import AIAssistant from '@/components/dashboard/AIAssistant'
import Link from 'next/link'
import type { SurveyResponse } from '@/types'
import CopyLinkButton from './CopyLinkButton'
import ToggleActiveButton from './ToggleActiveButton'
import DeleteSurveyButton from './DeleteSurveyButton'
import DownloadPDFButton from '@/components/dashboard/DownloadPDFButton'
import { Users, ClipboardList } from 'lucide-react'

interface Props {
  params: { id: string }
}

export default async function SurveyAnalyticsPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: survey } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single()

  if (!survey) notFound()

  const { data: responses } = await supabase
    .from('responses')
    .select('*')
    .eq('survey_id', survey.id)

  const metrics = calculateMetrics((responses || []) as SurveyResponse[])
  const hasData = metrics.responseCount > 0
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const surveyUrl = `${origin}/survey/${survey.code}`

  const statCards = [
    { label: 'Ответов', value: metrics.responseCount, unit: '', color: 'text-slate-900', bg: 'bg-white border-[#E8ECF0]' },
    { label: 'eNPS компании', value: metrics.companyNPS > 0 ? `+${metrics.companyNPS}` : metrics.companyNPS, unit: '', color: getScoreColor(metrics.companyNPS, BENCHMARKS.enps, true), bg: getScoreBg(metrics.companyNPS, BENCHMARKS.enps, true) },
    { label: 'Вовлечённость', value: metrics.engagement, unit: '/5', color: getScoreColor(metrics.engagement, BENCHMARKS.engagement), bg: getScoreBg(metrics.engagement, BENCHMARKS.engagement) },
    { label: 'Руководство', value: metrics.management, unit: '/5', color: getScoreColor(metrics.management, BENCHMARKS.management), bg: getScoreBg(metrics.management, BENCHMARKS.management) },
    { label: 'Развитие', value: metrics.growth, unit: '/5', color: getScoreColor(metrics.growth, BENCHMARKS.growth), bg: getScoreBg(metrics.growth, BENCHMARKS.growth) },
    { label: 'Баланс', value: metrics.balance, unit: '/5', color: getScoreColor(metrics.balance, BENCHMARKS.balance), bg: getScoreBg(metrics.balance, BENCHMARKS.balance) },
  ]

  // Map Tailwind color class → pastel hex + badge label
  const scoreStyle = (colorClass: string): { hex: string; badge: string; badgeBg: string; badgeColor: string } => {
    if (colorClass.includes('emerald')) return { hex: '#34D399', badge: '▲ Хорошо',   badgeBg: 'rgba(52,211,153,0.12)',  badgeColor: '#059669' }
    if (colorClass.includes('amber'))   return { hex: '#FBBF24', badge: '→ Норма',    badgeBg: 'rgba(251,191,36,0.12)',  badgeColor: '#B45309' }
    if (colorClass.includes('rose'))    return { hex: '#F87171', badge: '▼ Критично', badgeBg: 'rgba(248,113,113,0.12)', badgeColor: '#B91C1C' }
    return { hex: '#111827', badge: '', badgeBg: '', badgeColor: '' }
  }

  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.85)',
    borderRadius: 20,
    boxShadow: '0 4px 24px rgba(100,80,200,0.07)',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Link href="/dashboard" style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            ← Мои опросы
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.025em', marginTop: 6, marginBottom: 10 }}>
            {survey.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              ...(survey.is_active
                ? { background: 'rgba(52,211,153,0.13)', color: '#059669' }
                : { background: 'rgba(107,114,128,0.1)', color: '#6B7280' }),
            }}>
              {survey.is_active ? '● Активен' : '○ Закрыт'}
            </span>
            {hasData && (
              <span style={{ fontSize: 13, fontWeight: 500, color: '#5B5BD6', background: 'rgba(91,91,214,0.1)', padding: '3px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Users className="w-3.5 h-3.5" />
                {metrics.responseCount} сотрудников прошли опрос
              </span>
            )}
            <span style={{ fontSize: 12, color: '#D1D5DB', fontFamily: 'monospace' }}>{surveyUrl}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <CopyLinkButton url={surveyUrl} />
          <ToggleActiveButton surveyId={survey.id} isActive={survey.is_active} />
          {hasData && (
            <DownloadPDFButton
              surveyTitle={survey.title}
              responseCount={metrics.responseCount}
              companyNPS={metrics.companyNPS}
              managerNPS={metrics.managerNPS}
              promotersPercent={metrics.promotersPercent}
              passivesPercent={metrics.passivesPercent}
              detractorsPercent={metrics.detractorsPercent}
              engagement={metrics.engagement}
              management={metrics.management}
              growth={metrics.growth}
              balance={metrics.balance}
              motivation={metrics.motivation}
              comments={metrics.comments}
            />
          )}
          <DeleteSurveyButton surveyId={survey.id} />
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 28 }}>
        {statCards.map((card, i) => {
          const { hex, badge, badgeBg, badgeColor } = scoreStyle(card.color)
          return (
            <div key={card.label} style={{ ...glass, padding: '20px 18px 18px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                {card.label}
              </p>
              <p style={{ fontSize: 32, fontWeight: 800, color: hex, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {hasData ? card.value : '—'}
                {hasData && card.unit && <span style={{ fontSize: 15, fontWeight: 400, color: '#9CA3AF', marginLeft: 2 }}>{card.unit}</span>}
              </p>
              {hasData && badge && (
                <span style={{ display: 'inline-block', marginTop: 10, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: badgeBg, color: badgeColor }}>
                  {badge}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {!hasData && (
        <div style={{ ...glass, padding: '48px 24px', textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(91,91,214,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList style={{ width: 24, height: 24, color: '#5B5BD6' }} />
            </div>
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Ждём первые ответы</h2>
          <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 16 }}>Поделитесь ссылкой с сотрудниками, чтобы начать сбор данных</p>
          <code style={{ fontSize: 13, color: '#5B5BD6', background: 'rgba(91,91,214,0.08)', padding: '6px 14px', borderRadius: 10, fontFamily: 'monospace' }}>{surveyUrl}</code>
        </div>
      )}

      {hasData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ENPSChart
              promoters={metrics.promotersPercent}
              passives={metrics.passivesPercent}
              detractors={metrics.detractorsPercent}
              nps={metrics.companyNPS}
              title="eNPS компании"
            />
            <ENPSChart
              promoters={metrics.managerPromotersPercent}
              passives={metrics.managerPassivesPercent}
              detractors={metrics.managerDetractorsPercent}
              nps={metrics.managerNPS}
              title="eNPS руководителя"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BlockChart metrics={metrics} />
            <MotivationChart motivation={metrics.motivation} />
          </div>

          <div className="mb-8">
            <AIReport
              surveyId={survey.id}
              surveyTitle={survey.title}
              responseCount={metrics.responseCount}
              companyNPS={metrics.companyNPS}
              managerNPS={metrics.managerNPS}
              promotersPercent={metrics.promotersPercent}
              passivesPercent={metrics.passivesPercent}
              detractorsPercent={metrics.detractorsPercent}
              engagement={metrics.engagement}
              management={metrics.management}
              growth={metrics.growth}
              balance={metrics.balance}
              motivation={metrics.motivation}
              comments={metrics.comments}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <AIAssistant surveyId={survey.id} />
            {metrics.comments.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-sm p-6">
                <h3 className="font-semibold text-slate-700 mb-4">
                  Комментарии сотрудников
                  <span className="ml-2 text-xs font-normal text-slate-400">({metrics.comments.length})</span>
                </h3>
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {metrics.comments.map((comment, i) => (
                    <div key={i} className="bg-[#F8F9FB] border border-[#E8ECF0] rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed">
                      "{comment}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
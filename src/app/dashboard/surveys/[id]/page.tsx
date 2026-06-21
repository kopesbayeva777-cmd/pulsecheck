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

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 text-sm">
            ← Мои опросы
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{survey.title}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              survey.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {survey.is_active ? 'Активен' : 'Закрыт'}
            </span>
            {hasData && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
                <Users className="w-3.5 h-3.5" />
                {metrics.responseCount} сотрудников прошли опрос
              </span>
            )}
            <span className="text-slate-400 text-sm font-mono">{surveyUrl}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <CopyLinkButton url={surveyUrl} />
          <ToggleActiveButton surveyId={survey.id} isActive={survey.is_active} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 lg:grid-cols-6">
        {statCards.map(card => (
          <div key={card.label} className={`rounded-2xl border p-5 shadow-sm ${card.bg}`}>
            <p className="text-xs text-slate-500 font-medium mb-2">{card.label}</p>
            <p className={`text-3xl font-black leading-none ${card.color}`}>
              {hasData ? card.value : '—'}
              {hasData && card.unit && <span className="text-base font-normal ml-0.5">{card.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {!hasData && (
        <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-sm p-12 text-center mb-8">
          <div className="flex justify-center mb-3">
            <ClipboardList className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Ждём первые ответы</h2>
          <p className="text-slate-400 text-sm mb-4">Поделитесь ссылкой с сотрудниками, чтобы начать сбор данных</p>
          <code className="text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg text-sm font-mono">{surveyUrl}</code>
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
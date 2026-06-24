import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import AnimatedCardList from '@/components/dashboard/AnimatedCardList'
import DashboardHero from '@/components/dashboard/DashboardHero'
import { ClipboardList, Shield, BarChart2, Download } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name')
    .eq('id', user.id)
    .single()

  const { data: surveys } = await supabase
    .from('surveys')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const surveyIds = surveys?.map(s => s.id) ?? []
  let countMap: Record<string, number> = {}
  let avgEnps: number | null = null

  if (surveyIds.length > 0) {
    const { data: allResponses } = await supabase
      .from('responses')
      .select('survey_id, q1')
      .in('survey_id', surveyIds)

    const responsesBySurvey: Record<string, number[]> = {}
    for (const r of allResponses ?? []) {
      if (!responsesBySurvey[r.survey_id]) responsesBySurvey[r.survey_id] = []
      responsesBySurvey[r.survey_id].push(r.q1)
      countMap[r.survey_id] = (countMap[r.survey_id] || 0) + 1
    }

    const npsValues = Object.values(responsesBySurvey).map(q1s => {
      const promoters  = q1s.filter(s => s >= 9).length
      const detractors = q1s.filter(s => s <= 6).length
      return Math.round(((promoters - detractors) / q1s.length) * 100)
    })
    if (npsValues.length > 0) {
      avgEnps = Math.round(npsValues.reduce((a, b) => a + b, 0) / npsValues.length)
    }
  }

  const activeSurveys = (surveys ?? []).filter(s => s.is_active).length
  const totalResponses = Object.values(countMap).reduce((a, b) => a + b, 0)
  const lastSurveyDate = surveys?.[0]?.created_at ?? null

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div>
      <DashboardHero
        companyName={profile?.company_name ?? null}
        activeSurveys={activeSurveys}
        totalResponses={totalResponses}
        lastSurveyDate={lastSurveyDate}
        avgEnps={avgEnps}
      />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold" style={{ color: '#1A1A2E' }}>Мои опросы</h2>
        <Link
          href="/dashboard/surveys/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, color: '#5B5BD6', textDecoration: 'none',
            padding: '8px 20px', borderRadius: 100,
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(91,91,214,0.3)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          + Новый опрос
        </Link>
      </div>

      {!surveys || surveys.length === 0 ? (
        <div
          className="p-16 text-center"
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            border: '1px solid #ECECF3',
          }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#F0F0FD' }}>
              <ClipboardList className="w-7 h-7" style={{ color: '#5B5BD6' }} />
            </div>
          </div>
          <h2 className="text-base font-semibold mb-2" style={{ color: '#1A1A2E' }}>Пока нет опросов</h2>
          <p className="text-sm mb-6" style={{ color: '#9999BB' }}>Создайте первый опрос и поделитесь ссылкой с командой</p>
          <Link
            href="/dashboard/surveys/new"
            style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none',
              padding: '10px 24px', borderRadius: 100,
              background: 'linear-gradient(135deg, #5B5BD6, #7C4DDB)',
              boxShadow: '0 4px 20px rgba(91,91,214,0.35)',
            }}
          >
            Создать опрос
          </Link>
        </div>
      ) : (
        <AnimatedCardList surveys={surveys} origin={origin} countMap={countMap} />
      )}

      <div className="mt-12 bg-white rounded-2xl border border-[#ECECF3] p-8">
        <h2 className="text-base font-bold text-slate-800 mb-6">Как работает PulseCheck</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-start gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm">1</div>
            <div>
              <p className="font-semibold text-slate-700 text-sm mb-1">Создайте опрос</p>
              <p className="text-slate-400 text-xs leading-relaxed">Задайте название, выберите отрасль — опрос из 20 вопросов будет сгенерирован автоматически.</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm">2</div>
            <div>
              <p className="font-semibold text-slate-700 text-sm mb-1">Поделитесь ссылкой</p>
              <p className="text-slate-400 text-xs leading-relaxed">Отправьте уникальную ссылку или QR-код сотрудникам — опрос анонимный и занимает 3–5 минут.</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm">3</div>
            <div>
              <p className="font-semibold text-slate-700 text-sm mb-1">Получите аналитику</p>
              <p className="text-slate-400 text-xs leading-relaxed">Смотрите eNPS, вовлечённость, мотивационный профиль и сравнивайте с отраслевыми бенчмарками.</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 font-bold text-sm">AI</div>
            <div>
              <p className="font-semibold text-slate-700 text-sm mb-1">AI-анализ и рекомендации</p>
              <p className="text-slate-400 text-xs leading-relaxed">Искусственный интеллект автоматически составит отчёт и ответит на ваши вопросы о данных.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E8ECF0] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 mt-0.5 text-slate-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-700 text-sm">Полная анонимность</p>
              <p className="text-slate-400 text-xs mt-0.5">Имена сотрудников не собираются. Только агрегированные данные.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BarChart2 className="w-5 h-5 mt-0.5 text-slate-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-700 text-sm">Отраслевые бенчмарки</p>
              <p className="text-slate-400 text-xs mt-0.5">Сравнивайте показатели компании с рыночными стандартами.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 mt-0.5 text-slate-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-700 text-sm">Экспорт в PDF</p>
              <p className="text-slate-400 text-xs mt-0.5">Скачивайте готовый отчёт для презентации руководству.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Educational section */}
      <div className="mt-8 space-y-6">

        {/* eNPS explainer */}
        <div className="bg-white rounded-2xl border border-[#ECECF3] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8ECF0]" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: '#534AB7' }}>
              eN
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Что такое eNPS?</h3>
              <p className="text-xs text-slate-500 mt-0.5">Employee Net Promoter Score — индекс лояльности сотрудников</p>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              eNPS основан на одном ключевом вопросе: <span className="font-medium text-slate-800">«С какой вероятностью вы порекомендуете компанию как место работы?»</span> — по шкале от 0 до 10. Метрика показывает реальный уровень лояльности быстрее и честнее, чем длинные анкеты.
            </p>

            {/* Formula */}
            <div className="rounded-xl border border-[#E8ECF0] bg-[#F8F9FB] px-5 py-4 mb-5 flex items-center justify-center gap-3 flex-wrap">
              <span className="text-slate-500 text-sm">eNPS</span>
              <span className="text-slate-400 text-lg">=</span>
              <span className="text-sm font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">% Промоутеров</span>
              <span className="text-slate-400 text-lg font-bold">−</span>
              <span className="text-sm font-semibold text-rose-700 bg-rose-100 px-3 py-1 rounded-lg">% Критиков</span>
            </div>

            {/* Three groups */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-full">9 – 10</span>
                  <span className="text-xs font-semibold text-emerald-800">Промоутеры</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">Лояльные сотрудники. Активно рекомендуют компанию и вносят наибольший вклад.</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">7 – 8</span>
                  <span className="text-xs font-semibold text-amber-800">Пассивные</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">Нейтральные. Не вредят репутации, но могут уйти при лучшем предложении.</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-rose-700 bg-rose-200 px-2 py-0.5 rounded-full">0 – 6</span>
                  <span className="text-xs font-semibold text-rose-800">Критики</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">Недовольные. Риск увольнения и негативного влияния на команду.</p>
              </div>
            </div>

            {/* Score interpretation */}
            <div className="rounded-xl border border-[#E8ECF0] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#F8F9FB] border-b border-[#E8ECF0]">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Как читать результат</p>
              </div>
              <div className="divide-y divide-[#E8ECF0]">
                <div className="flex items-center gap-4 px-4 py-3">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg w-20 text-center flex-shrink-0">выше +30</span>
                  <p className="text-xs text-slate-600">Отличный результат. Сотрудники лояльны и вовлечены.</p>
                </div>
                <div className="flex items-center gap-4 px-4 py-3">
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg w-20 text-center flex-shrink-0">0 до +30</span>
                  <p className="text-xs text-slate-600">Хорошо, но есть над чем работать. Изучите зоны роста.</p>
                </div>
                <div className="flex items-center gap-4 px-4 py-3">
                  <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg w-20 text-center flex-shrink-0">ниже 0</span>
                  <p className="text-xs text-slate-600">Тревожный сигнал. Критиков больше, чем промоутеров — нужны срочные действия.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Motivation profile */}
          <div className="bg-white rounded-2xl border border-[#ECECF3] overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8ECF0]" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: '#534AB7' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Мотивационный профиль</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                6 дополнительных вопросов показывают, <span className="font-medium text-slate-800">что важно именно вашим сотрудникам</span>. Это помогает понять не только что идёт плохо, но и куда направить усилия.
              </p>
              <div className="space-y-2.5">
                {[
                  { label: 'Зарплата', desc: 'Уровень и справедливость вознаграждения', color: 'bg-violet-100 text-violet-700' },
                  { label: 'Признание', desc: 'Обратная связь и ценность вклада', color: 'bg-indigo-100 text-indigo-700' },
                  { label: 'Развитие', desc: 'Рост, обучение, карьерный путь', color: 'bg-blue-100 text-blue-700' },
                  { label: 'Стабильность', desc: 'Уверенность в завтрашнем дне', color: 'bg-cyan-100 text-cyan-700' },
                  { label: 'Команда', desc: 'Атмосфера и отношения с коллегами', color: 'bg-teal-100 text-teal-700' },
                  { label: 'Автономия', desc: 'Самостоятельность и доверие', color: 'bg-emerald-100 text-emerald-700' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg w-24 text-center flex-shrink-0 ${item.color}`}>{item.label}</span>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: frequency + how to work */}
          <div className="space-y-6">

            {/* Frequency */}
            <div className="bg-white rounded-2xl border border-[#ECECF3] overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8ECF0]" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: '#534AB7' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Как часто проводить?</h3>
              </div>
              <div className="p-5">
                <div className="flex gap-3 mb-3">
                  <div className="flex-1 rounded-xl border border-[#E8ECF0] bg-[#F8F9FB] p-3 text-center">
                    <p className="text-xs font-bold text-slate-700">Раз в квартал</p>
                    <p className="text-xs text-slate-400 mt-1">Для динамичных команд и активных изменений</p>
                  </div>
                  <div className="flex-1 rounded-xl border border-[#E8ECF0] bg-[#F8F9FB] p-3 text-center">
                    <p className="text-xs font-bold text-slate-700">Раз в полгода</p>
                    <p className="text-xs text-slate-400 mt-1">Оптимально для большинства компаний</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Повторите опрос через 3–6 месяцев после внедрения изменений — так вы увидите реальную динамику и поймёте, что сработало.
                </p>
              </div>
            </div>

            {/* How to work with results */}
            <div className="bg-white rounded-2xl border border-[#ECECF3] overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8ECF0]" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: '#534AB7' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Как работать с результатами?</h3>
              </div>
              <div className="p-5">
                <ol className="space-y-3">
                  {[
                    { n: '1', text: 'Изучите зоны риска — блоки с баллом ниже 3.0' },
                    { n: '2', text: 'Прочитайте AI-анализ — конкретные причины и рекомендации' },
                    { n: '3', text: 'Поговорите с командой — данные это точка для диалога, не приговор' },
                    { n: '4', text: 'Внедрите 1–2 изменения — не пытайтесь исправить всё сразу' },
                    { n: '5', text: 'Повторите опрос через квартал — отследите динамику' },
                  ].map(item => (
                    <li key={item.n} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: '#534AB7' }}>
                        {item.n}
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">{item.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

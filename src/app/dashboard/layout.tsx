import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'
import { ClipboardList, Plus } from 'lucide-react'

const HR_TIPS = [
  'Проводите 1-on-1 встречи минимум раз в месяц — это снижает текучку на 25%',
  'eNPS ниже 0 — сигнал для немедленного разговора с командой',
  'Признание важнее премии: публичная благодарность повышает вовлечённость',
  'Запускайте опрос анонимно — честность ответов вырастает на 40%',
  'После опроса расскажите команде что изменится — иначе доверие падает',
  'Текучка стоит 50-200% годовой зарплаты — считайте ROI удержания',
  'Лучший момент для опроса — через 3 месяца после изменений в компании',
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name, email')
    .eq('id', user.id)
    .single()

  const { data: surveys, count: surveysCount } = await supabase
    .from('surveys')
    .select('id', { count: 'exact' })
    .eq('owner_id', user.id)

  let responsesCount = 0
  const surveyIds = surveys?.map(s => s.id) ?? []
  if (surveyIds.length > 0) {
    const { count } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .in('survey_id', surveyIds)
    responsesCount = count ?? 0
  }

  const day = new Date().getDay()
  const tip = HR_TIPS[day]

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex">
      <aside className="w-56 bg-white border-r border-[#E8ECF0] flex flex-col fixed h-full">

        {/* Logo */}
        <div className="px-5 py-6 border-b border-[#E8ECF0] flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <span className="text-slate-900 font-semibold">PulseCheck</span>
          </Link>
          <p className="text-slate-400 text-xs mt-2 truncate">{profile?.company_name || profile?.email}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition-colors"
          >
            <ClipboardList className="w-4 h-4 flex-shrink-0" /> Мои опросы
          </Link>
          <Link
            href="/dashboard/surveys/new"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4 flex-shrink-0" /> Новый опрос
          </Link>

          {/* Stats widget */}
          <div className="mt-2 rounded-xl bg-[#F8F9FB] border border-[#E8ECF0] p-3">
            <p className="text-indigo-600 text-[10px] font-semibold uppercase tracking-wider mb-2.5">
              Статистика
            </p>
            <div className="flex items-center">
              <div className="flex-1 text-center">
                <p className="text-slate-900 text-2xl font-bold leading-none">{surveysCount ?? 0}</p>
                <p className="text-slate-400 text-[10px] mt-1">опросов</p>
              </div>
              <div className="w-px h-8 bg-[#E8ECF0]" />
              <div className="flex-1 text-center">
                <p className="text-slate-900 text-2xl font-bold leading-none">{responsesCount}</p>
                <p className="text-slate-400 text-[10px] mt-1">ответов</p>
              </div>
            </div>
          </div>

          {/* Daily HR Tip */}
          <div className="rounded-xl bg-[#F8F9FB] border border-[#E8ECF0] p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.995.356-1.93.938-2.664C13.443 10.773 13.562 10.356 13.562 10a3 3 0 10-6 0c0 .356.12.773.562 1.336.582.734.923 1.669.938 2.664h4z" />
              </svg>
              <p className="text-indigo-600 text-[10px] font-semibold uppercase tracking-wider">Совет дня</p>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">{tip}</p>
          </div>
        </nav>

        {/* Mascot */}
        <div className="flex-shrink-0 px-2 pb-2">
          <img src="/mascot.png" alt="mascot" className="w-full object-contain" style={{maxHeight: '160px'}} />
        </div>

        {/* Logout */}
        <div className="flex-shrink-0 px-3 py-3 border-t border-[#E8ECF0]">
          <LogoutButton />
        </div>
      </aside>

      <main className="ml-56 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}

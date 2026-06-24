import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/dashboard/DashboardShell'

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

  const tip = HR_TIPS[new Date().getDay()]

  return (
    <DashboardShell
      companyName={profile?.company_name ?? null}
      email={profile?.email ?? null}
      surveysCount={surveysCount ?? 0}
      responsesCount={responsesCount}
      tip={tip}
    >
      {children}
    </DashboardShell>
  )
}

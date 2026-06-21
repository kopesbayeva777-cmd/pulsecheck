import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SurveyForm from '@/components/survey/SurveyForm'

interface Props {
  params: { code: string }
}

export default async function SurveyPage({ params }: Props) {
  const supabase = createClient()

  const { data: survey } = await supabase
    .from('surveys')
    .select('id, title, is_active')
    .eq('code', params.code.toUpperCase())
    .single()

  if (!survey || !survey.is_active) notFound()

  return <SurveyForm surveyId={survey.id} surveyTitle={survey.title} />
}

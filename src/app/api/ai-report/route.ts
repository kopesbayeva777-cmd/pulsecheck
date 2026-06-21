import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateMetrics } from '@/lib/calculations'
import { BENCHMARKS } from '@/lib/benchmarks'
import type { SurveyResponse } from '@/types'

const client = new Anthropic()

export async function POST(req: Request) {
  const { surveyId } = await req.json()

  const supabase = createAdminClient()
  const { data: responses, error } = await supabase
    .from('responses')
    .select('*')
    .eq('survey_id', surveyId)

  if (error || !responses || responses.length === 0) {
    return new Response('Нет данных для анализа', { status: 400 })
  }

  const m = calculateMetrics(responses as SurveyResponse[])
  const commentSample = m.comments.slice(0, 5).join('\n- ')

  const prompt = `Ты — аналитик HR. Проанализируй результаты опроса вовлечённости сотрудников и составь структурированный отчёт на русском языке. Пиши только чистый текст без каких-либо символов разметки — никаких ##, никаких **, никаких |---|, никаких ---. Структурируй текст только с помощью нумерованных разделов.

ДАННЫЕ ОПРОСА (${m.responseCount} ответов):

eNPS компании: ${m.companyNPS} (бенчмарк: +${BENCHMARKS.enps})
Промоутеры: ${m.promotersPercent}%, Пассивные: ${m.passivesPercent}%, Критики: ${m.detractorsPercent}%
eNPS руководителя: ${m.managerNPS}

Вовлечённость: ${m.engagement}/5 (бенчмарк: ${BENCHMARKS.engagement})
Руководство: ${m.management}/5 (бенчмарк: ${BENCHMARKS.management})
Развитие: ${m.growth}/5 (бенчмарк: ${BENCHMARKS.growth})
Баланс: ${m.balance}/5 (бенчмарк: ${BENCHMARKS.balance})

Мотивационный профиль (средние оценки важности 1-5):
Зарплата: ${m.motivation.salary}
Признание: ${m.motivation.recognition}
Развитие: ${m.motivation.development}
Стабильность: ${m.motivation.stability}
Команда: ${m.motivation.team}
Автономия: ${m.motivation.autonomy}

${m.comments.length > 0 ? `Комментарии сотрудников (выборка):\n- ${commentSample}` : ''}

Составь отчёт строго в следующем формате:

1. Общая оценка
Краткая оценка текущего состояния компании с ключевыми цифрами. 2-3 предложения.

2. Сильные стороны
Перечисли показатели выше бенчмарка. Для каждого укажи: название показателя, значение vs бенчмарк и одно предложение с объяснением.

3. Зоны роста
Перечисли показатели ниже бенчмарка или близко к нему. Для каждого: статус (Критично или Внимание), название, значение vs бенчмарк, одно предложение о причине.

4. Мотивационный профиль
Топ-3 приоритета сотрудников и краткая рекомендация как их использовать.

5. ТОП-3 рекомендации
Три конкретных действия с ожидаемым эффектом.

ВАЖНО: только русский язык, кратко и по делу, абсолютно никаких символов markdown.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return Response.json({ text })
  } catch {
    return new Response('Ошибка генерации отчёта', { status: 500 })
  }
}

import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateMetrics } from '@/lib/calculations'
import { BENCHMARKS } from '@/lib/benchmarks'
import type { SurveyResponse } from '@/types'

const client = new Anthropic()

export async function POST(req: Request) {
  const { surveyId, question } = await req.json()

  const supabase = createAdminClient()
  const { data: responses, error } = await supabase
    .from('responses')
    .select('*')
    .eq('survey_id', surveyId)

  if (error || !responses) {
    return new Response('Ошибка загрузки данных', { status: 500 })
  }

  const m = calculateMetrics(responses as SurveyResponse[])
  const commentSample = m.comments.slice(0, 10).join('\n- ')

  const systemPrompt = `Ты — HR-аналитик. Отвечай на вопросы об опросе вовлечённости на основе данных ниже. Пиши кратко, конкретно, на русском языке.

ДАННЫЕ (${m.responseCount} ответов):
eNPS компании: ${m.companyNPS} (бенчмарк: +${BENCHMARKS.enps}) | Промоутеры: ${m.promotersPercent}%, Критики: ${m.detractorsPercent}%
eNPS руководителя: ${m.managerNPS}
Вовлечённость: ${m.engagement}/5 (бенчмарк: ${BENCHMARKS.engagement})
Руководство: ${m.management}/5 (бенчмарк: ${BENCHMARKS.management})
Развитие: ${m.growth}/5 (бенчмарк: ${BENCHMARKS.growth})
Баланс: ${m.balance}/5 (бенчмарк: ${BENCHMARKS.balance})
Мотивация: Зарплата ${m.motivation.salary} | Признание ${m.motivation.recognition} | Развитие ${m.motivation.development} | Стабильность ${m.motivation.stability} | Команда ${m.motivation.team} | Автономия ${m.motivation.autonomy}
${m.comments.length > 0 ? `Комментарии:\n- ${commentSample}` : 'Комментариев нет.'}`

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const messageStream = client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
      })

      for await (const event of messageStream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

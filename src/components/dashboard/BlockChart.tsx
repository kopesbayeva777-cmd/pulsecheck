'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import { BENCHMARKS } from '@/lib/benchmarks'
import type { Metrics } from '@/types'

interface Props {
  metrics: Metrics
}

export default function BlockChart({ metrics }: Props) {
  const data = [
    { name: 'Вовлечённость', score: metrics.engagement, benchmark: BENCHMARKS.engagement },
    { name: 'Руководство', score: metrics.management, benchmark: BENCHMARKS.management },
    { name: 'Развитие', score: metrics.growth, benchmark: BENCHMARKS.growth },
    { name: 'Баланс', score: metrics.balance, benchmark: BENCHMARKS.balance },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="font-semibold text-slate-700 mb-4">Блоки опроса (vs бенчмарк)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toFixed(1),
              name === 'score' ? 'Ваш результат' : 'Бенчмарк',
            ]}
          />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-slate-600">
                {value === 'score' ? 'Ваш результат' : 'Бенчмарк'}
              </span>
            )}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]} name="score">
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.score >= entry.benchmark ? '#6366f1' : '#f43f5e'}
              />
            ))}
          </Bar>
          <Bar dataKey="benchmark" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="benchmark" />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 italic mt-2 px-1">
        * Бенчмарки основаны на данных Gallup Global Workplace Report 2024 и Culture Amp Industry Benchmarks 2023. Рекомендуем ориентироваться на динамику ваших собственных результатов — сравнивайте каждый новый опрос с предыдущим.
      </p>
    </div>
  )
}

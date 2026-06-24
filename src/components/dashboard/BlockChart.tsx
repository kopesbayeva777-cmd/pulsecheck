'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from 'recharts'
import { BENCHMARKS } from '@/lib/benchmarks'
import type { Metrics } from '@/types'

interface Props {
  metrics: Metrics
}

export default function BlockChart({ metrics }: Props) {
  const data = [
    { name: 'Вовлечённость', score: metrics.engagement, benchmark: BENCHMARKS.engagement },
    { name: 'Руководство',   score: metrics.management,  benchmark: BENCHMARKS.management },
    { name: 'Развитие',      score: metrics.growth,      benchmark: BENCHMARKS.growth },
    { name: 'Баланс',        score: metrics.balance,     benchmark: BENCHMARKS.balance },
  ]

  return (
    <div style={{
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.85)',
      borderRadius: 20,
      boxShadow: '0 4px 24px rgba(100,80,200,0.07)',
      padding: '24px',
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
        Блоки опроса (vs бенчмарк)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toFixed(1),
              name === 'score' ? 'Ваш результат' : 'Бенчмарк',
            ]}
            contentStyle={{
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(255,255,255,0.9)',
              borderRadius: 10,
              fontSize: 13,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                {value === 'score' ? 'Ваш результат' : 'Бенчмарк'}
              </span>
            )}
          />
          <Bar dataKey="score" radius={[6, 6, 0, 0]} name="score">
            {data.map((_, index) => (
              <Cell key={index} fill="#5B5BD6" />
            ))}
          </Bar>
          <Bar dataKey="benchmark" fill="#E5E7EB" radius={[6, 6, 0, 0]} name="benchmark" />
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginTop: 8, paddingLeft: 4, lineHeight: 1.5 }}>
        * Бенчмарки основаны на данных Gallup Global Workplace Report 2024 и Culture Amp Industry Benchmarks 2023.
      </p>
    </div>
  )
}

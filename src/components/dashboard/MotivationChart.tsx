'use client'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts'
import type { Metrics } from '@/types'

interface Props {
  motivation: Metrics['motivation']
}

export default function MotivationChart({ motivation }: Props) {
  const data = [
    { subject: 'Зарплата', value: motivation.salary },
    { subject: 'Признание', value: motivation.recognition },
    { subject: 'Развитие', value: motivation.development },
    { subject: 'Стабильность', value: motivation.stability },
    { subject: 'Команда', value: motivation.team },
    { subject: 'Автономия', value: motivation.autonomy },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="font-semibold text-slate-700 mb-1">Мотивационный профиль</h3>
      <p className="text-xs text-slate-400 mb-4">Что важно сотрудникам (средний балл 1–5)</p>
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          <Radar
            name="Важность"
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip formatter={(value: number) => [value.toFixed(1), 'Важность']} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

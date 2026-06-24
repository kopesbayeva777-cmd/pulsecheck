'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  promoters: number
  passives: number
  detractors: number
  nps: number
  title: string
}

export default function ENPSChart({ promoters, passives, detractors, nps, title }: Props) {
  const data = [
    { name: 'Промоутеры', value: promoters,  color: '#34D399' },
    { name: 'Пассивные',  value: passives,   color: '#FBBF24' },
    { name: 'Критики',    value: detractors, color: '#F87171' },
  ].filter(d => d.value > 0)

  const npsColor = nps >= 20 ? '#34D399' : nps >= 0 ? '#FBBF24' : '#F87171'
  const npsBadge = nps >= 20
    ? { label: '▲ Хорошо',   bg: 'rgba(52,211,153,0.12)',  color: '#059669' }
    : nps >= 0
    ? { label: '→ Норма',    bg: 'rgba(251,191,36,0.12)',  color: '#B45309' }
    : { label: '▼ Критично', bg: 'rgba(248,113,113,0.12)', color: '#B91C1C' }

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
      <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        {title}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 44, fontWeight: 800, color: npsColor, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {nps > 0 ? '+' : ''}{nps}
        </span>
        <span style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>eNPS</span>
      </div>
      <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: npsBadge.bg, color: npsBadge.color, marginBottom: 12 }}>
        {npsBadge.label}
      </span>

      <ResponsiveContainer width="100%" height={170}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value}%`, '']}
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
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

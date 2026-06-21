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
    { name: 'Промоутеры', value: promoters, color: '#10b981' },
    { name: 'Пассивные', value: passives, color: '#f59e0b' },
    { name: 'Критики', value: detractors, color: '#f43f5e' },
  ].filter(d => d.value > 0)
  const npsColor = nps >= 20 ? '#10b981' : nps >= 0 ? '#f59e0b' : '#f43f5e'
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
      <div className="flex items-center gap-1 mb-4">
        <span className="text-3xl font-bold" style={{ color: npsColor }}>
          {nps > 0 ? '+' : ''}{nps}
        </span>
        <span className="text-slate-400 text-sm mt-1">eNPS</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value}%`, '']} />
          <Legend
            formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

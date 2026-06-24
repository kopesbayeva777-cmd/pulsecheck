'use client'

import { motion, type Variants } from 'framer-motion'
import { ClipboardList, Users, BarChart3, CalendarDays } from 'lucide-react'

interface Props {
  companyName: string | null
  activeSurveys: number
  totalResponses: number
  lastSurveyDate: string | null
  avgEnps: number | null
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}

const card: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.42, ease: 'easeOut' } },
}

const kpiConfig = [
  {
    key: 'active',
    label: 'Активные опросы',
    icon: ClipboardList,
    iconColor: '#5B5BD6',
    iconBg: 'linear-gradient(145deg, #EEF0FF 0%, #DDE0FF 100%)',
    shadow: 'rgba(91,91,214,0.18)',
  },
  {
    key: 'responses',
    label: 'Всего ответов',
    icon: Users,
    iconColor: '#059669',
    iconBg: 'linear-gradient(145deg, #ECFDF5 0%, #C6F6E4 100%)',
    shadow: 'rgba(5,150,105,0.16)',
  },
  {
    key: 'enps',
    label: 'Средний eNPS',
    icon: BarChart3,
    iconColor: '#D97706',
    iconBg: 'linear-gradient(145deg, #FFFBEB 0%, #FDE9A2 100%)',
    shadow: 'rgba(217,119,6,0.16)',
    sub: 'ENPS_PLACEHOLDER',
  },
  {
    key: 'last',
    label: 'Последний опрос',
    icon: CalendarDays,
    iconColor: '#7C3AED',
    iconBg: 'linear-gradient(145deg, #F5F3FF 0%, #E5D9FF 100%)',
    shadow: 'rgba(124,58,237,0.16)',
  },
]

export default function DashboardHero({ companyName, activeSurveys, totalResponses, lastSurveyDate, avgEnps }: Props) {
  const values: Record<string, string | number> = {
    active:    activeSurveys,
    responses: totalResponses,
    enps: avgEnps !== null ? (avgEnps > 0 ? `+${avgEnps}` : avgEnps) : '—',
    last: lastSurveyDate
      ? new Date(lastSurveyDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      : '—',
  }

  return (
    <div style={{ marginBottom: 40 }}>

      {/* ── Greeting ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{
          fontSize: 36, fontWeight: 800, color: '#111827',
          letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0,
        }}>
          {companyName || 'Ваш дашборд'}
        </h1>
      </motion.div>

      {/* ── KPI grid ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}
      >
        {kpiConfig.map(({ key, label, icon: Icon, iconColor, iconBg, shadow, sub: rawSub }) => {
          const sub = rawSub === 'ENPS_PLACEHOLDER'
            ? (avgEnps === null ? 'Смотрите в результатах' : undefined)
            : rawSub
          return (
          <motion.div
            key={key}
            variants={card}
            whileHover={{ y: -5, scale: 1.025, transition: { duration: 0.18 } }}
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.85)',
              borderRadius: 24,
              padding: '24px 22px 22px',
              boxShadow: '0 8px 32px rgba(100,80,200,0.08)',
              display: 'flex', flexDirection: 'column', gap: 18,
              cursor: 'default',
            }}
          >
            {/* Icon square */}
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 6px 16px ${shadow}`,
              flexShrink: 0,
            }}>
              <Icon size={26} color={iconColor} strokeWidth={1.75} />
            </div>

            {/* Number + label */}
            <div>
              <p style={{
                fontSize: 44, fontWeight: 800, color: '#111827',
                letterSpacing: '-0.04em', lineHeight: 1, margin: 0,
              }}>
                {values[key]}
              </p>
              <p style={{
                fontSize: 13, fontWeight: 500, color: '#9CA3AF',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                marginTop: 8,
              }}>
                {label}
              </p>
              {sub && (
                <p style={{ fontSize: 11, color: '#C4B5FD', marginTop: 3 }}>{sub}</p>
              )}
            </div>
          </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

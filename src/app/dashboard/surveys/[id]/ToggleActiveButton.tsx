'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  surveyId: string
  isActive: boolean
}

const BTN: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 100, cursor: 'pointer',
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(0,0,0,0.08)',
  color: '#111827',
  transition: 'background 0.15s',
}

export default function ToggleActiveButton({ surveyId, isActive }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('surveys').update({ is_active: !isActive }).eq('id', surveyId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{ ...BTN, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
      onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.95)' }}
      onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.7)' }}
    >
      {loading ? '...' : isActive ? 'Закрыть опрос' : 'Открыть опрос'}
    </button>
  )
}

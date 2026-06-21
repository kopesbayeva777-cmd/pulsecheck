'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  surveyId: string
  isActive: boolean
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
      className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${
        isActive
          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
      }`}
    >
      {loading ? '...' : isActive ? 'Закрыть опрос' : 'Открыть опрос'}
    </button>
  )
}

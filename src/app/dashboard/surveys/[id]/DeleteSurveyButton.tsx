'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Trash2, AlertTriangle } from 'lucide-react'

export default function DeleteSurveyButton({ surveyId }: { surveyId: string }) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading]     = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    setLoading(true)
    await supabase.from('responses').delete().eq('survey_id', surveyId)
    await supabase.from('surveys').delete().eq('id', surveyId)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 100,
          background: '#FEF3F2', color: '#B42318',
          border: '1px solid #FECDCA', cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#FEE4E2')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#FEF3F2')}
      >
        <Trash2 size={14} />
        Удалить опрос
      </button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => !loading && setShowModal(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(17,24,39,0.45)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />

            {/* Dialog */}
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{   opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 101, width: 420, maxWidth: 'calc(100vw - 32px)',
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.9)',
                borderRadius: 24,
                padding: '32px 28px 28px',
                boxShadow: '0 24px 60px rgba(17,24,39,0.18)',
              }}
            >
              {/* Icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: '#FEF3F2', border: '1px solid #FECDCA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <AlertTriangle size={22} color="#B42318" />
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 10, letterSpacing: '-0.015em' }}>
                Удалить опрос?
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65, marginBottom: 28 }}>
                Все данные и ответы сотрудников будут удалены навсегда.&nbsp;
                <span style={{ fontWeight: 600, color: '#B42318' }}>Это действие нельзя отменить.</span>
              </p>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  style={{
                    fontSize: 14, fontWeight: 600, padding: '9px 20px', borderRadius: 100,
                    background: 'rgba(0,0,0,0.05)', color: '#374151',
                    border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer',
                    transition: 'background 0.15s',
                    opacity: loading ? 0.5 : 1,
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.09)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)')}
                >
                  Отмена
                </button>

                <button
                  onClick={handleDelete}
                  disabled={loading}
                  style={{
                    fontSize: 14, fontWeight: 600, padding: '9px 20px', borderRadius: 100,
                    background: loading ? '#f87171' : '#DC2626', color: '#fff',
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(220,38,38,0.3)',
                    transition: 'background 0.15s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#B91C1C' }}
                  onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#DC2626' }}
                >
                  {loading ? 'Удаляем…' : <><Trash2 size={14} /> Удалить</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

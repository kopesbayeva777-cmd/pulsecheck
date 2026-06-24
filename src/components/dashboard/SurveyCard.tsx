'use client'
import { useState } from 'react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Share2, QrCode, Check, Download, ArrowRight } from 'lucide-react'

interface Survey {
  id: string
  title: string
  code: string
  is_active: boolean
  created_at: string
}

interface Props {
  survey: Survey
  origin: string
  responseCount: number
}

export default function SurveyCard({ survey, origin, responseCount }: Props) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const surveyUrl = `${origin}/survey/${survey.code}`

  async function copyLink() {
    const text = `PulseCheck — анонимный опрос команды\n\nПожалуйста, пройдите короткий опрос — это займёт 3–5 минут. Ваши ответы анонимны и помогут улучшить работу команды.\n\nСсылка на опрос:\n${surveyUrl}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadQR() {
    const svg = document.getElementById(`qr-${survey.code}`)
    if (!svg) return
    const canvas = document.createElement('canvas')
    const size = 400
    canvas.width = size
    canvas.height = size + 140
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, size, size)
      ctx.fillStyle = '#111827'; ctx.font = 'bold 18px Inter, Arial'; ctx.textAlign = 'center'
      ctx.fillText('PulseCheck — анонимный опрос команды', size / 2, size + 30)
      ctx.fillStyle = '#6B7280'; ctx.font = '13px Inter, Arial'
      ctx.fillText('Пройдите короткий опрос — это займёт 3–5 минут.', size / 2, size + 55)
      ctx.fillText('Ваши ответы анонимны и помогут улучшить', size / 2, size + 75)
      ctx.fillText('работу команды.', size / 2, size + 95)
      ctx.fillStyle = '#5B5BD6'; ctx.font = '12px Inter, Arial'
      ctx.fillText(surveyUrl, size / 2, size + 125)
      const link = document.createElement('a')
      link.download = `qr-опрос-${survey.code}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -3,
        background: 'rgba(255,255,255,0.9)',
        boxShadow: '0 16px 48px rgba(100,80,200,0.14)',
        transition: { duration: 0.2 },
      }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.8)',
        borderRadius: 24,
        padding: '24px 26px',
        boxShadow: '0 8px 32px rgba(100,80,200,0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>

        {/* ── Left ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.3 }}>
              {survey.title}
            </h2>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              ...(survey.is_active
                ? { background: 'rgba(5,150,105,0.12)', color: '#059669' }
                : { background: 'rgba(107,114,128,0.1)', color: '#6B7280' }),
            }}>
              {survey.is_active ? '● Активен' : '○ Закрыт'}
            </span>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 13, fontWeight: 500,
              background: 'rgba(91,91,214,0.1)', color: '#5B5BD6',
              padding: '3px 10px', borderRadius: 20,
            }}>
              <Users size={13} />
              {responseCount} ответов
            </span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              {new Date(survey.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
            <span style={{ fontSize: 11, color: '#D1D5DB', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
              {surveyUrl}
            </span>
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* QR toggle */}
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowQR(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 100, cursor: 'pointer',
              border: '1px solid rgba(91,91,214,0.2)',
              transition: 'all 0.15s',
              ...(showQR
                ? { background: 'rgba(91,91,214,0.12)', color: '#5B5BD6' }
                : { background: 'rgba(255,255,255,0.8)', color: '#5B5BD6' }),
            }}
          >
            <QrCode size={14} /> QR
          </motion.button>

          {/* Copy */}
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={copyLink}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 100, cursor: 'pointer',
              background: 'rgba(255,255,255,0.8)', color: '#5B5BD6',
              border: '1px solid rgba(91,91,214,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            {copied
              ? <><Check size={14} color="#059669" />Скопировано!</>
              : <><Share2 size={14} />Поделиться</>}
          </motion.button>

          {/* Results CTA */}
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={`/dashboard/surveys/${survey.id}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 13, fontWeight: 600, padding: '8px 20px', borderRadius: 100,
                background: 'linear-gradient(135deg, #5B5BD6, #7C4DDB)',
                color: '#fff', textDecoration: 'none', border: 'none',
                boxShadow: '0 4px 16px rgba(91,91,214,0.35)',
              }}
            >
              Результаты <ArrowRight size={13} />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── QR panel ── */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.8)',
              display: 'flex', alignItems: 'flex-start', gap: 20,
            }}>
              <div style={{
                padding: 10, background: 'rgba(255,255,255,0.9)', borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.9)', flexShrink: 0,
                boxShadow: '0 4px 16px rgba(100,80,200,0.08)',
              }}>
                <QRCode id={`qr-${survey.code}`} value={surveyUrl} size={130} />
              </div>
              <div style={{ paddingTop: 4 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
                  QR-код для опроса
                </p>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>
                  Распечатайте или разместите этот QR-код — сотрудники смогут пройти опрос с телефона за 3–5 минут.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={downloadQR}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 100,
                    background: 'linear-gradient(135deg, #5B5BD6, #7C4DDB)',
                    color: '#fff', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(91,91,214,0.3)',
                  }}
                >
                  <Download size={14} /> Скачать QR с описанием
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

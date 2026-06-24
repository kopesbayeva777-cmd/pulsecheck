'use client'
import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

const BTN: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 100, cursor: 'pointer',
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(0,0,0,0.08)',
  color: '#111827',
  transition: 'background 0.15s',
}

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    const text = `PulseCheck — анонимный опрос команды\n\nПожалуйста, пройдите короткий опрос — это займёт 3–5 минут. Ваши ответы анонимны и помогут улучшить работу команды.\n\nСсылка на опрос:\n${url}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      style={BTN}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.95)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.7)')}
    >
      {copied ? <Check size={14} color="#059669" /> : <Share2 size={14} />}
      {copied ? 'Скопировано!' : 'Поделиться ссылкой на опрос'}
    </button>
  )
}

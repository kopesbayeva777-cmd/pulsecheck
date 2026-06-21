'use client'
import { useState } from 'react'
import { Share2, Check, MessageSquare } from 'lucide-react'

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const [copiedMsg, setCopiedMsg] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function copyMessage() {
    const text = `PulseCheck — анонимный опрос команды\n\nПожалуйста, пройдите короткий опрос — это займёт 3–5 минут. Ваши ответы анонимны и помогут улучшить работу команды.\n\nСсылка на опрос:\n${url}`
    await navigator.clipboard.writeText(text)
    setCopiedMsg(true)
    setTimeout(() => setCopiedMsg(false), 2000)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={copyMessage}
        className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
      >
        {copiedMsg ? <Check className="w-4 h-4 text-emerald-500" /> : <MessageSquare className="w-4 h-4" />}
        {copiedMsg ? 'Скопировано' : 'Скопировать сообщение'}
      </button>
      <button
        onClick={copy}
        className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
        {copied ? 'Скопировано' : 'Скопировать ссылку'}
      </button>
    </div>
  )
}
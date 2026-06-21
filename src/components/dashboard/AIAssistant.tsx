'use client'
import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Sparkles } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  surveyId: string
}

const SUGGESTIONS = [
  'Почему низкий балл по руководству?',
  'Что мотивирует сотрудников больше всего?',
  'Какие главные риски выгорания?',
  'Как улучшить вовлечённость команды?',
]

function AssistantMessage({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  if (!content && isStreaming) return <span className="text-slate-400">...</span>
  if (!content) return null

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <p className="font-bold text-slate-900 mb-1">{children}</p>,
        h2: ({ children }) => <p className="font-bold text-slate-800 mb-1">{children}</p>,
        h3: ({ children }) => <p className="font-semibold text-slate-800 mb-0.5">{children}</p>,
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 space-y-0.5 pl-3 list-decimal">{children}</ol>,
        li: ({ children }) => (
          <li className="flex gap-1.5">
            <span className="text-indigo-400 flex-shrink-0 mt-0.5">•</span>
            <span>{children}</span>
          </li>
        ),
        strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        hr: () => <hr className="my-2 border-slate-300" />,
        code: ({ children }) => (
          <code className="bg-slate-200 text-indigo-700 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default function AIAssistant({ surveyId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(question: string) {
    if (!question.trim() || loading) return
    const q = question.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId, question: q }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let assistantMsg = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantMsg += decoder.decode(value, { stream: true })
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: assistantMsg },
        ])
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Ошибка. Попробуйте ещё раз.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[500px]">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-700 text-sm">HR-ассистент</h3>
          <p className="text-xs text-slate-400">Задайте вопрос о данных опроса</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium">Попробуйте спросить:</p>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full text-left text-sm text-slate-600 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-2 rounded-lg transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}
            >
              {m.role === 'user' ? (
                m.content
              ) : (
                <AssistantMessage
                  content={m.content}
                  isStreaming={loading && i === messages.length - 1}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ваш вопрос..."
            disabled={loading}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {loading ? '...' : 'Спросить'}
          </button>
        </div>
      </div>
    </div>
  )
}

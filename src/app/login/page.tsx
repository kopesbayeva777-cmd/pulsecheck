'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'forgot') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
      })
      if (resetError) { setError(resetError.message); setLoading(false); return }
      setSuccess('Письмо отправлено! Проверьте почту.')
      setLoading(false)
      return
    }

    if (mode === 'register') {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      if (data.user && companyName) {
        await supabase.from('profiles').update({ company_name: companyName }).eq('id', data.user.id)
      }
      setSuccess('Проверьте почту для подтверждения регистрации')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) { setError('Неверный email или пароль'); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-md">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">PulseCheck</h1>
          <p className="text-slate-500 mt-1 text-sm">HR-опросы с AI-аналитикой</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E8ECF0] p-8">
          {mode !== 'forgot' && (
            <div className="flex bg-[#F8F9FB] rounded-xl p-1 mb-6 border border-[#E8ECF0]">
              {(['login', 'register'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccess('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === m ? 'bg-white shadow-sm text-slate-900 border border-[#E8ECF0]' : 'text-slate-500'
                  }`}
                >
                  {m === 'login' ? 'Войти' : 'Регистрация'}
                </button>
              ))}
            </div>
          )}

          {mode === 'forgot' && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Восстановление пароля</h2>
              <p className="text-sm text-slate-500 mt-1">Введите email — пришлём ссылку для сброса пароля</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Название компании</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="ООО Ромашка"
                  required
                  className="w-full border border-[#E8ECF0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="hr@company.com"
                required
                className="w-full border border-[#E8ECF0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>
            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full border border-[#E8ECF0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                />
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}
                    className="text-xs text-indigo-600 hover:underline mt-1.5 float-right"
                  >
                    Забыли пароль?
                  </button>
                )}
              </div>
            )}

            {error && <p className="text-rose-600 text-sm bg-rose-50 border border-rose-100 px-3 py-2.5 rounded-xl">{error}</p>}
            {success && <p className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-100 px-3 py-2.5 rounded-xl">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : mode === 'register' ? 'Создать аккаунт' : 'Отправить письмо'}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                className="w-full text-sm text-slate-500 hover:text-slate-700 mt-2"
              >
                ← Вернуться к входу
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

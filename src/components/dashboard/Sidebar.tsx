'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Plus, LogOut, Lightbulb } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  companyName: string | null
  email: string | null
  surveysCount: number
  responsesCount: number
  tip: string
}

const navItems = [
  { href: '/dashboard', label: 'Мои опросы', icon: LayoutGrid },
  { href: '/dashboard/surveys/new', label: 'Новый опрос', icon: Plus },
]

export default function Sidebar({ companyName, email, tip }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const displayName = companyName || email || 'Аккаунт'
  const initial = displayName[0].toUpperCase()

  return (
    <aside style={{
      width: 240, height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.8)',
      boxShadow: '4px 0 24px rgba(100,80,200,0.06)',
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: '22px 20px 18px' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #5B5BD6 0%, #9B59D6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0,
            boxShadow: '0 4px 12px rgba(91,91,214,0.35)',
          }}>P</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#111827', letterSpacing: '-0.02em' }}>
            PulseCheck
          </span>
        </Link>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 0' }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: '#9CA3AF',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '0 8px', marginBottom: 6,
        }}>Навигация</p>

        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 12, marginBottom: 2,
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              transition: 'all 0.15s ease',
              color: active ? '#5B5BD6' : '#374151',
              background: active ? 'rgba(91,91,214,0.1)' : 'transparent',
              boxShadow: active ? '0 2px 8px rgba(91,91,214,0.12)' : 'none',
            }}
              onMouseEnter={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(255,255,255,0.6)'
                  el.style.boxShadow  = '0 2px 8px rgba(0,0,0,0.06)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'transparent'
                  el.style.boxShadow  = 'none'
                }
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}

        {/* ── Tip ── */}
        <div style={{
          marginTop: 20, borderRadius: 16, padding: '14px 16px',
          background: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 4px 16px rgba(100,80,200,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Lightbulb size={13} color="#5B5BD6" />
            <p style={{
              fontSize: 10, fontWeight: 700, color: '#5B5BD6',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Совет дня</p>
          </div>
          <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>{tip}</p>
        </div>
      </nav>

      {/* ── User footer ── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.8)',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #5B5BD6, #9B59D6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
          boxShadow: '0 2px 8px rgba(91,91,214,0.3)',
        }}>{initial}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 13, fontWeight: 600, color: '#111827',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{companyName || 'Мой аккаунт'}</p>
          {email && (
            <p style={{
              fontSize: 11, color: '#9CA3AF',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{email}</p>
          )}
        </div>

        <button onClick={logout} title="Выйти" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#9CA3AF', padding: 6, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'color 0.15s, background 0.15s',
        }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.color = '#374151'
            el.style.background = 'rgba(0,0,0,0.05)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.color = '#9CA3AF'
            el.style.background = 'none'
          }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronLeft, ChevronRight, LayoutGrid, Plus, LogOut, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  companyName: string | null
  email: string | null
  surveysCount: number
  responsesCount: number
  tip: string
  children: React.ReactNode
}

const FULL_W  = 240
const MINI_W  = 48
const EASE    = [0.25, 0.46, 0.45, 0.94] as const
const DURATION = 0.26

const navItems = [
  { href: '/dashboard',             label: 'Мои опросы',  icon: LayoutGrid },
  { href: '/dashboard/surveys/new', label: 'Новый опрос', icon: Plus },
]

/* ─── Sidebar content (shared between desktop & mobile drawer) ─── */
function SidebarContent({
  companyName, email, tip,
  collapsed, onToggle, onClose,
}: {
  companyName: string | null
  email: string | null
  tip: string
  collapsed: boolean
  onToggle: () => void
  onClose?: () => void
}) {
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
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.8)',
      boxShadow: '4px 0 24px rgba(100,80,200,0.06)',
      overflow: 'hidden',
    }}>

      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 0' : '22px 20px 18px', flexShrink: 0 }}>
        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 10, textDecoration: 'none',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, filter: 'drop-shadow(0 4px 8px rgba(91,91,214,0.35))' }}>
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5B5BD6"/>
                <stop offset="1" stopColor="#9B59D6"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="10" fill="url(#logo-grad)"/>
            <polyline points="4,16 8,16 11,9 14,22 17,13 20,19 23,16 28,16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: 16, color: '#111827', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              PulseCheck
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '4px 6px 0' : '4px 12px 0' }}>
        {!collapsed && (
          <p style={{
            fontSize: 10, fontWeight: 700, color: '#9CA3AF',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '0 8px', marginBottom: 6,
          }}>Навигация</p>
        )}

        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href}
              onClick={onClose}
              title={collapsed ? label : undefined}
              style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px 0' : '8px 12px',
                borderRadius: 12, marginBottom: 2,
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
              <Icon size={16} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </Link>
          )
        })}

        {/* Tip — only when expanded */}
        {!collapsed && (
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
        )}
      </nav>

      {/* Toggle button — inside sidebar, below nav */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, margin: '8px 12px',
          padding: '8px', borderRadius: 10,
          background: 'rgba(91,91,214,0.07)',
          border: '1px solid rgba(91,91,214,0.12)',
          cursor: 'pointer', color: '#5B5BD6',
          fontSize: 13, fontWeight: 500,
          transition: 'background 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(91,91,214,0.13)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(91,91,214,0.07)')}
      >
        <AnimatePresence mode="wait" initial={false}>
          {collapsed
            ? <motion.span key="right" initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 4 }} transition={{ duration: 0.14 }} style={{ display: 'flex' }}>
                <ChevronRight size={16} />
              </motion.span>
            : <motion.span key="left"  initial={{ opacity: 0, x:  4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }} transition={{ duration: 0.14 }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ChevronLeft size={16} />
                <span>Свернуть</span>
              </motion.span>
          }
        </AnimatePresence>
      </button>

      {/* User footer */}
      {!collapsed && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.8)',
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #5B5BD6, #9B59D6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
            boxShadow: '0 2px 8px rgba(91,91,214,0.3)',
          }}>{initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {companyName || 'Мой аккаунт'}
            </p>
            {email && (
              <p style={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {email}
              </p>
            )}
          </div>
          <button onClick={logout} title="Выйти" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9CA3AF', padding: 6, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.15s, background 0.15s',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#374151'; el.style.background = 'rgba(0,0,0,0.05)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#9CA3AF'; el.style.background = 'none' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      )}

      {/* Collapsed: just logout icon */}
      {collapsed && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.8)',
          padding: '12px 0', display: 'flex', justifyContent: 'center', flexShrink: 0,
        }}>
          <button onClick={logout} title="Выйти" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9CA3AF', padding: 8, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#374151')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9CA3AF')}
          >
            <LogOut size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Shell ─── */
export default function DashboardShell({ companyName, email, surveysCount, responsesCount, tip, children }: Props) {
  const [collapsed, setCollapsed] = useState(false)  // desktop: expanded
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
      if (e.matches) setMobileOpen(false)
    }
    handler(mq)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const sidebarWidth = isMobile ? 0 : collapsed ? MINI_W : FULL_W

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* ══ DESKTOP sidebar (always in flow) ══ */}
      {!isMobile && (
        <motion.div
          animate={{ width: collapsed ? MINI_W : FULL_W }}
          transition={{ duration: DURATION, ease: EASE }}
          style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, overflow: 'hidden', flexShrink: 0 }}
        >
          <SidebarContent
            companyName={companyName} email={email} tip={tip}
            collapsed={collapsed}
            onToggle={() => setCollapsed(v => !v)}
          />
        </motion.div>
      )}

      {/* ══ MOBILE overlay ══ */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(17,24,39,0.38)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              zIndex: 40,
            }}
          />
        )}
      </AnimatePresence>

      {/* ══ MOBILE drawer ══ */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            key="drawer"
            initial={{ x: -FULL_W }} animate={{ x: 0 }} exit={{ x: -FULL_W }}
            transition={{ duration: DURATION, ease: EASE }}
            style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: FULL_W, zIndex: 50 }}
          >
            <SidebarContent
              companyName={companyName} email={email} tip={tip}
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Main ══ */}
      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: DURATION, ease: EASE }}
        style={{ flex: 1, minHeight: '100vh', padding: '28px 40px 40px' }}
      >
        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 24,
          }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 2px 12px rgba(100,80,200,0.12)',
                cursor: 'pointer',
              }}
              aria-label="Открыть меню"
            >
              <Menu size={17} color="#5B5BD6" />
            </button>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#111827', letterSpacing: '-0.02em' }}>
              PulseCheck
            </span>
          </div>
        )}

        {children}
      </motion.main>
    </div>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PulseCheck — HR-опросы вовлечённости',
  description: 'Анонимные опросы сотрудников с AI-аналитикой',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}

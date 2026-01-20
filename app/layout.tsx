import type { Metadata } from 'next'
import { Oswald } from 'next/font/google'
import './globals.css'

// 폰트: Oswald Bold
const oswald = Oswald({
  subsets: ['latin'],
  weight: '700',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GUIDEON - System Preparing',
  description: 'Interactive Kiosk Admin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={oswald.className}>{children}</body>
    </html>
  )
}
import type { Metadata } from 'next'
import { DM_Sans, Outfit, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Elevex — Internship Management',
  description: 'Professional internship lifecycle management system',
}

/**
 * Root Layout
 *
 * Wraps every page with global providers.
 * Fonts, TanStack Query, Sonner toasts all live here.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${dmSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

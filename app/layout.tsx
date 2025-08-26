import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/layout/ClientLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lab Service System',
  description: 'Modern Lab Service System with Invoice Generation',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ProtectedRoute>
            <ClientLayout>
              {children}
            </ClientLayout>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  )
}

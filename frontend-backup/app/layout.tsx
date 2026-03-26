import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'FastMeals - Sistema de Gestao de Pedidos e Entregas',
  description: 'Dashboard analitico para gerenciamento de pedidos, produtos e entregas em tempo real.',
  generator: 'Vinicius Prudencio - VynnyTech',
  keywords: ['delivery', 'gestao', 'pedidos', 'entregas', 'restaurante', 'dashboard'],
  authors: [{ name: 'FastMeals Team' }],
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              background: 'oklch(0.16 0.005 285)',
              border: '1px solid oklch(0.25 0.005 285)',
              color: 'oklch(0.95 0 0)',
            },
          }}
        />
      </body>
    </html>
  )
}

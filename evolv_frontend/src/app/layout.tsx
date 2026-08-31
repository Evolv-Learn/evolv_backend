import type { Metadata } from 'next'
import { Open_Sans, Poppins } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

const openSans = Open_Sans({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

const poppins = Poppins({ 
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-heading',
})

export const metadata: Metadata = {
  title: 'EvolvLearn — Research Training for African Scientists',
  description: 'Practical, affordable research methods training for students and researchers across Africa. Start with R for quantitative data analysis.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} ${poppins.variable}`}>
        <Header />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Footer />
      </body>
    </html>
  )
}

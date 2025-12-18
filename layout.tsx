import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from './components/ClientLayout' // Импортируем нашу обертку

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

// Теперь метаданные работают корректно, так как нет "use client"
export const metadata: Metadata = {
  title: 'StuJob — Стажировки для студентов МАДИ',
  description: 'Платформа для поиска стажировок и работы для студентов Московского автомобильно-дорожного университета',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-[#0A0A0B] text-white min-h-screen antialiased`}>
        {/* Вся клиентская логика и контексты теперь живут здесь */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
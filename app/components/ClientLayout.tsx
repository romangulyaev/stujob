'use client'

import { UserProviderSupabase } from '@/app/lib/UserContextSupabase'
import Header from './Header'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProviderSupabase>
      <Header />
      <main className="pt-16">
        {children}
      </main>
    </UserProviderSupabase>
  )
}
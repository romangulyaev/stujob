// app/components/AuthGuard.tsx
'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserSupabase } from '../lib/UserContextSupabase'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function AuthGuard({ 
  children, 
  requireAuth = true,
  redirectTo = '/register' 
}: AuthGuardProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useUserSupabase()

  useEffect(() => {
    if (!isLoading && requireAuth && !user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, requireAuth, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null // Будет редирект в useEffect
  }

  return <>{children}</>
}
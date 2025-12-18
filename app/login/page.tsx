// app/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserSupabase } from '@/app/lib/UserContextSupabase'
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, user, isLoading } = useUserSupabase()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Если пользователь уже авторизован — перенаправляем в личный кабинет
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Заполните все поля')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const result = await login(email, password)
      
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Ошибка входа')
      }
    } catch (error: any) {
      setError('Произошла ошибка при входе')
      console.error('Login error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (user) {
    return null // Будет редирект в useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass w-full max-w-md p-8 glow-primary">
        <h1 className="text-3xl font-bold mb-2">Вход в StuJob</h1>
        <p className="text-gray-400 mb-8">Войдите в свой аккаунт для доступа к вакансиям</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-gray-400 mb-2 flex items-center gap-2">
              <Mail size={18} /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass px-4 py-3 rounded-xl"
              placeholder="student@madi.ru"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2 flex items-center gap-2">
              <Lock size={18} /> Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass px-4 py-3 rounded-xl"
              placeholder="Введите пароль"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Вход...' : 'Войти'} <LogIn size={20} />
          </button>
        </form>
        
        <div className="text-center mt-8 space-y-4">
          <p className="text-gray-500 text-sm">
            Нет аккаунта?{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-cyan-400 hover:text-cyan-300 transition"
            >
              Зарегистрироваться
            </button>
          </p>
          
          <p className="text-gray-500 text-sm">
            Забыли пароль?{' '}
            <button
              onClick={() => router.push('/reset-password')}
              className="text-purple-400 hover:text-purple-300 transition"
            >
              Восстановить
            </button>
          </p>
          
          <button
            onClick={() => router.push('/migrate-account')}
            className="w-full mt-6 py-3 glass rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2"
          >
            <ArrowRight size={20} /> Привязать локальный аккаунт
          </button>
        </div>
      </div>
    </div>
  )
}
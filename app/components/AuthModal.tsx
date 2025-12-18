'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserSupabase } from '@/app/lib/UserContextSupabase'
import { X, Mail, Lock, Loader2, AlertCircle, LogIn } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter()
  const { login } = useUserSupabase()
  
  // Мы всегда начинаем в режиме входа. 
  // Если пользователь хочет зарегистрироваться, мы перенаправляем его на /register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Сброс полей при открытии/закрытии
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setEmail('')
      setPassword('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
  
    try {
      const result = await login(email, password)
      
      if (result.success) {
        onClose()
        // Можно добавить небольшой delay для обновления состояния
        setTimeout(() => {
          window.location.reload()
        }, 100)
      } else {
        // Просто показываем ошибку (уже без проверки на подтверждение email)
        setError(result.error || 'Неверный email или пароль')
      }
    } catch (err) {
      setError('Произошла ошибка при попытке входа')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterRedirect = () => {
    onClose()
    router.push('/register')
  }

  // Закрытие по клику на фон
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md p-8 mx-4 glass rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Кнопка закрытия */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 ring-1 ring-white/20">
            <LogIn className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Вход в StuJob
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            Войдите, чтобы управлять своим профилем и откликами
          </p>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition duration-300" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@madi.ru"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition duration-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Пароль</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition duration-300" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition duration-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-xl font-bold text-white shadow-lg shadow-purple-900/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Вход...
              </>
            ) : (
              'Войти'
            )}
          </button>
        </form>

        <div className="text-center pt-6 mt-6 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            Нет аккаунта?{' '}
            <button
              type="button"
              onClick={handleRegisterRedirect}
              className="text-cyan-400 hover:text-cyan-300 transition font-medium hover:underline decoration-cyan-400/30 underline-offset-4"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
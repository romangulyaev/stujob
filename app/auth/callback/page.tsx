// app/auth/callback/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      
      try {
        // Получаем токен из URL
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session) {
          // Обновляем профиль студента - помечаем email как подтвержденный
          await supabase
            .from('students')
            .update({ 
              email_confirmed: true,
              profile_completion: 70, // Увеличиваем процент заполнения
              updated_at: new Date().toISOString()
            })
            .eq('user_id', session.user.id)
          
          setStatus('success')
          setMessage('Email успешно подтвержден!')
          
          // Перенаправляем в кабинет через 2 секунды
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          throw new Error('Сессия не найдена')
        }
      } catch (error: any) {
        setStatus('error')
        setMessage(`Ошибка: ${error.message}`)
      }
    }
    
    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass w-full max-w-md p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin mx-auto text-cyan-400 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Подтверждение email</h1>
            <p className="text-gray-400">Проверяем вашу ссылку...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Успешно!</h1>
            <p className="text-gray-300 mb-4">{message}</p>
            <p className="text-gray-500 text-sm">Перенаправляем в личный кабинет...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Ошибка</h1>
            <p className="text-gray-300 mb-4">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold mt-4"
            >
              Перейти к входу
            </button>
          </>
        )}
      </div>
    </div>
  )
}
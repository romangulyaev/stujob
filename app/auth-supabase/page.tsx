// app/api/auth-supabase/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase/client'

export default function AuthSupabasePage() {
  const [email, setEmail] = useState('test@madi.ru')
  const [password, setPassword] = useState('test123456')
  const [name, setName] = useState('Иван Тестовый')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  const handleSignUp = async () => {
    setLoading(true)
    setMessage('')
    try {
      // 1. Регистрация в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            university: 'МАДИ'
          }
        }
      })
      
      if (authError) throw authError
      
      if (authData.user) {
        // 2. Создание профиля в таблице students
        const { error: profileError } = await supabase
          .from('students')
          .insert([{
            user_id: authData.user.id,
            name,
            email,
            university: 'МАДИ',
            major_code: '09.03.02',
            course: 3,
            skills: ['JavaScript', 'React', 'TypeScript'],
            profile_completion: 50
          }])
        
        if (profileError) throw profileError
        
        setMessage(`✅ Регистрация успешна! Пользователь: ${authData.user.email}`)
        setUser(authData.user)
      }
    } catch (error: any) {
      setMessage(`❌ Ошибка: ${error.message}`)
      console.error('Sign up error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    setLoading(true)
    setMessage('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      setMessage(`✅ Вход успешен! Пользователь: ${data.user.email}`)
      setUser(data.user)
      
      // Загружаем профиль студента
      const { data: profile } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', data.user.id)
        .single()
      
      console.log('Профиль студента:', profile)
      
    } catch (error: any) {
      setMessage(`❌ Ошибка: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setMessage('✅ Выход успешен')
      setUser(null)
    } catch (error: any) {
      setMessage(`❌ Ошибка выхода: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setMessage(session ? `✅ Есть сессия: ${session.user.email}` : '❌ Нет сессии')
    setUser(session?.user || null)
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Тест авторизации Supabase</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Форма */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">
            {user ? `Привет, ${user.email}` : 'Авторизация'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass px-4 py-2 rounded"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass px-4 py-2 rounded"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass px-4 py-2 rounded"
                disabled={loading}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSignUp}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl disabled:opacity-50"
              >
                {loading ? 'Загрузка...' : 'Регистрация'}
              </button>
              
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="px-4 py-2 glass rounded-xl disabled:opacity-50"
              >
                Вход
              </button>
              
              {user && (
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl disabled:opacity-50"
                >
                  Выйти
                </button>
              )}
              
              <button
                onClick={checkSession}
                className="px-4 py-2 bg-gray-500/20 rounded-xl"
              >
                Проверить сессию
              </button>
            </div>
          </div>
        </div>

        {/* Информация */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Информация</h2>
          
          <div className="space-y-4">
            <div className={`p-3 rounded ${message.includes('✅') ? 'bg-green-500/20' : message.includes('❌') ? 'bg-red-500/20' : 'bg-gray-500/20'}`}>
              <p className={message.includes('✅') ? 'text-green-400' : message.includes('❌') ? 'text-red-400' : ''}>
                {message || 'Готов к тесту...'}
              </p>
            </div>
            
            {user && (
              <div>
                <h3 className="font-bold">Данные пользователя:</h3>
                <p className="text-sm">Email: {user.email}</p>
                <p className="text-sm">ID: {user.id.substring(0, 8)}...</p>
                <p className="text-sm">Создан: {new Date(user.created_at).toLocaleString()}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-bold">Что тестируем:</h3>
              <ul className="text-sm space-y-1">
                <li>• Регистрация в Supabase Auth</li>
                <li>• Создание профиля в таблице students</li>
                <li>• Вход по email/password</li>
                <li>• Проверка сессии</li>
                <li>• Выход из системы</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
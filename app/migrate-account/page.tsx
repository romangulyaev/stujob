// app/migrate-account/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '../lib/UserContext'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function MigrateAccountPage() {
  const { user: localUser, updateProfile } = useUser()
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [supabaseProfile, setSupabaseProfile] = useState<any>(null)
  const [email, setEmail] = useState(localUser?.email || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState<'check' | 'form' | 'success'>('check')
  
  const router = useRouter()
  const supabase = createClient()

  // Проверяем статус при загрузке
  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      // 1. Проверяем Supabase сессию
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setSupabaseUser(session.user)
        
        // 2. Проверяем есть ли профиль студента
        const { data: profile } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        if (profile) {
          setSupabaseProfile(profile)
          setStep('success')
          
          // 3. Синхронизируем локального пользователя
          if (localUser && localUser.id !== profile.id) {
            updateProfile({
              id: profile.id,
              name: profile.name || localUser.name,
              email: profile.email || localUser.email,
              major: profile.major_code || localUser.major,
              course: profile.course || localUser.course,
              skills: profile.skills || localUser.skills
            })
            
            // Сохраняем связь
            localStorage.setItem('supabase_user_id', session.user.id)
          }
        } else {
          setStep('form')
        }
      } else {
        setStep('form')
      }
    } catch (error) {
      console.error('Ошибка проверки статуса:', error)
      setStep('form')
    }
  }

  const handleMigrate = async () => {
    if (!localUser) {
      setMessage('❌ Сначала зарегистрируйтесь локально')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const userEmail = localUser.email || email
      const userPassword = password || `TempPass${Date.now().toString().slice(-6)}`
      
      if (!userEmail) {
        setMessage('❌ Введите email')
        setLoading(false)
        return
      }

      // 1. Регистрация/вход в Supabase Auth
      let authUser = null
      
      // Сначала пробуем войти (если пользователь уже есть)
      if (password) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: password
        })
        
        if (!signInError) {
          authUser = signInData.user
          setMessage('✅ Успешный вход в существующий аккаунт')
        }
      }
      
      // Если не удалось войти, регистрируем
      if (!authUser) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password: userPassword,
          options: {
            data: {
              name: localUser.name || 'Студент МАДИ',
              university: localUser.university || 'МАДИ'
            }
          }
        })
        
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setMessage('❌ Этот email уже зарегистрирован. Введите правильный пароль.')
            setLoading(false)
            return
          } else if (signUpError.message.includes('For security purposes')) {
            setMessage('⏳ Подождите минуту перед повторной попыткой')
            setLoading(false)
            return
          }
          throw signUpError
        }
        
        authUser = signUpData.user
        setMessage('✅ Аккаунт создан! Проверьте email для подтверждения.')
      }

      if (!authUser) {
        throw new Error('Не удалось создать или войти в аккаунт')
      }

      // 2. Создаём профиль студента (если ещё нет)
      const { data: existingProfile } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', authUser.id)
        .single()

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('students')
          .insert([{
            user_id: authUser.id,
            name: localUser.name || authUser.user_metadata?.name || 'Студент',
            email: authUser.email,
            university: localUser.university || authUser.user_metadata?.university || 'МАДИ',
            major_code: localUser.major || '09.03.02',
            course: localUser.course || 1,
            skills: localUser.skills || [],
            profile_completion: 80,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (profileError) {
          console.warn('Ошибка создания профиля (возможно уже создан):', profileError)
          // Не прерываем процесс, продолжаем
        }
      }

      // 3. Сохраняем связь и обновляем локального пользователя
      localStorage.setItem('supabase_user_id', authUser.id)
      
      updateProfile({
        id: authUser.id, // Важно: заменяем ID на Supabase ID
        email: authUser.email
      })

      // 4. Обновляем состояние
      setSupabaseUser(authUser)
      setStep('success')
      setMessage('✅ Аккаунт успешно привязан! Синхронизация...')

      // 5. Перезагружаем страницу для полной синхронизации
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error: any) {
      console.error('Ошибка миграции:', error)
      setMessage(`❌ ${error.message || 'Неизвестная ошибка'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('supabase_user_id')
      setSupabaseUser(null)
      setSupabaseProfile(null)
      setStep('form')
      setMessage('✅ Вышли из Supabase аккаунта')
    } catch (error: any) {
      setMessage(`❌ Ошибка выхода: ${error.message}`)
    }
  }

  if (step === 'check') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-cyan-400 mb-4" />
          <p>Проверяем статус аккаунта...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Миграция на Supabase</h1>
          <p className="text-gray-400">Привяжите локальный аккаунт к облачной базе данных</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Преимущества */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Преимущества Supabase</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-cyan-400 text-2xl mb-2">💾</div>
                  <h3 className="font-bold mb-1">Сохранение данных</h3>
                  <p className="text-sm text-gray-400">Резюме и история откликов не потеряются</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-purple-400 text-2xl mb-2">📱</div>
                  <h3 className="font-bold mb-1">Доступ везде</h3>
                  <p className="text-sm text-gray-400">Войдите с телефона или компьютера</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-green-400 text-2xl mb-2">🔔</div>
                  <h3 className="font-bold mb-1">Уведомления</h3>
                  <p className="text-sm text-gray-400">Новые вакансии по вашему направлению</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-yellow-400 text-2xl mb-2">🚀</div>
                  <h3 className="font-bold mb-1">Быстрый поиск</h3>
                  <p className="text-sm text-gray-400">Актуальные вакансии из базы данных</p>
                </div>
              </div>
            </div>

            {/* Форма миграции или статус */}
            <div className="glass rounded-2xl p-6">
              {step === 'success' ? (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-green-400">✅ Аккаунт привязан!</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                      <p className="font-bold">Supabase аккаунт активен</p>
                      <p className="text-sm text-gray-300">Email: {supabaseUser?.email}</p>
                      {supabaseProfile && (
                        <p className="text-sm text-gray-300">
                          Профиль: {supabaseProfile.name}, {supabaseProfile.major_code}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold"
                      >
                        Перейти в кабинет
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="px-6 py-3 glass rounded-xl hover:bg-white/10"
                      >
                        Отвязать аккаунт
                      </button>
                      <button
                        onClick={() => router.push('/check-status')}
                        className="px-6 py-3 glass rounded-xl hover:bg-white/10"
                      >
                        Проверить статус
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-4">Привязка аккаунта</h2>
                  
                  {!localUser ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">Сначала зарегистрируйтесь локально</p>
                      <button
                        onClick={() => router.push('/register')}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl"
                      >
                        Зарегистрироваться
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Информация о локальном аккаунте */}
                      <div className="p-4 bg-white/5 rounded-xl">
                        <p className="font-bold mb-2">Локальный аккаунт</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Имя</p>
                            <p>{localUser.name || 'Не указано'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Email</p>
                            <p>{localUser.email || 'Не указан'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Направление</p>
                            <p>{localUser.major || 'Не указано'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Курс</p>
                            <p>{localUser.course || 'Не указан'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Форма */}
                      <div className="space-y-4">
                        {!localUser.email && (
                          <div>
                            <label className="block text-gray-400 mb-2">Email *</label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="student@madi.ru"
                              className="w-full glass px-4 py-3 rounded-xl"
                              required
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-gray-400 mb-2">
                            Пароль для Supabase *
                          </label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Минимум 6 символов"
                            className="w-full glass px-4 py-3 rounded-xl"
                            required
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            Если email уже зарегистрирован в Supabase - введите пароль от него.
                            Если нет - придумайте новый пароль.
                          </p>
                        </div>

                        <button
                          onClick={handleMigrate}
                          disabled={loading || (!localUser.email && !email) || !password}
                          className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Обработка...
                            </>
                          ) : (
                            'Привязать аккаунт к Supabase'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Сообщения */}
              {message && (
                <div className={`mt-6 p-4 rounded-xl ${
                  message.includes('✅') ? 'bg-green-500/20 border border-green-500/30' :
                  message.includes('❌') ? 'bg-red-500/20 border border-red-500/30' :
                  message.includes('⏳') ? 'bg-yellow-500/20 border border-yellow-500/30' :
                  'bg-gray-500/20 border border-gray-500/30'
                }`}>
                  <p className={
                    message.includes('✅') ? 'text-green-400' :
                    message.includes('❌') ? 'text-red-400' :
                    message.includes('⏳') ? 'text-yellow-400' : ''
                  }>
                    {message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка - статус */}
          <div className="space-y-6">
            {/* Статус миграции */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Статус миграции</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Локальный аккаунт</span>
                  <span className={localUser ? 'text-green-400' : 'text-red-400'}>
                    {localUser ? '✅' : '❌'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Supabase аккаунт</span>
                  <span className={supabaseUser ? 'text-green-400' : 'text-red-400'}>
                    {supabaseUser ? '✅' : '❌'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Профиль студента</span>
                  <span className={supabaseProfile ? 'text-green-400' : 'text-yellow-400'}>
                    {supabaseProfile ? '✅' : '⚠️'}
                  </span>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400">
                    {step === 'success' 
                      ? 'Все системы синхронизированы' 
                      : 'Требуется привязка аккаунта'}
                  </p>
                </div>
              </div>
            </div>

            {/* Что происходит */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Что происходит</h2>
              <ol className="space-y-3 list-decimal pl-5 text-sm">
                <li>Создаётся учётная запись в Supabase Auth</li>
                <li>Данные профиля копируются в таблицу students</li>
                <li>Локальный ID заменяется на Supabase ID</li>
                <li>Все страницы получают доступ к базе данных</li>
                <li>Данные сохраняются на защищённом сервере</li>
              </ol>
            </div>

            {/* Ссылки */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Полезные ссылки</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/check-status')}
                  className="w-full text-left p-3 glass rounded-xl hover:bg-white/10 transition"
                >
                  Проверить статус
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full text-left p-3 glass rounded-xl hover:bg-white/10 transition"
                >
                  Личный кабинет
                </button>
                <button
                  onClick={() => router.push('/vacancies')}
                  className="w-full text-left p-3 glass rounded-xl hover:bg-white/10 transition"
                >
                  Вакансии из базы
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
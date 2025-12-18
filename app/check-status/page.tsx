// app/check-status/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useUser } from '../lib/UserContext'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CheckStatusPage() {
  const { user: localUser } = useUser()
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [supabaseProfile, setSupabaseProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      setLoading(true)
      
      // 1. Проверяем Supabase сессию
      const { data: { session } } = await supabase.auth.getSession()
      setSupabaseUser(session?.user || null)
      
      // 2. Если есть сессия, загружаем профиль
      if (session?.user) {
        const { data: profile } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        setSupabaseProfile(profile)
      }
      
    } catch (error) {
      console.error('Ошибка проверки статуса:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Проверка статуса аккаунта</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Локальный пользователь */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${localUser ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Локальный аккаунт
            </h2>
            
            {localUser ? (
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">ID</p>
                  <p className="font-mono text-sm">{localUser.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Имя</p>
                  <p>{localUser.name || 'Не указано'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p>{localUser.email || 'Не указан'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Направление</p>
                  <p>{localUser.major || 'Не указано'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Навыки</p>
                  <p>{localUser.skills?.length || 0} навыков</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Не авторизован</p>
            )}
          </div>

          {/* Supabase пользователь */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${supabaseUser ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Supabase аккаунт
            </h2>
            
            {supabaseUser ? (
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Supabase ID</p>
                  <p className="font-mono text-sm">{supabaseUser.id.substring(0, 16)}...</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p>{supabaseUser.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Создан</p>
                  <p>{new Date(supabaseUser.created_at).toLocaleString('ru-RU')}</p>
                </div>
                
                {supabaseProfile ? (
                  <>
                    <div className="border-t border-white/10 pt-3 mt-3">
                      <p className="text-gray-400 text-sm">Профиль в students</p>
                      <p className="text-green-400">✅ Создан</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Имя: {supabaseProfile.name}, 
                        Навыков: {supabaseProfile.skills?.length || 0}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <p className="text-gray-400 text-sm">Профиль в students</p>
                    <p className="text-yellow-400">⚠️ Не найден</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">Не привязан</p>
            )}
          </div>
        </div>

        {/* Сравнение ID */}
        {localUser && supabaseUser && (
          <div className="glass rounded-2xl p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">Сравнение ID</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Локальный ID:</p>
                <p className="font-mono text-sm bg-white/5 p-2 rounded">{localUser.id}</p>
              </div>
              <div>
                <p className="text-gray-400">Supabase ID:</p>
                <p className="font-mono text-sm bg-white/5 p-2 rounded">{supabaseUser.id}</p>
              </div>
              <div>
                <p className={`font-bold ${
                  localUser.id === supabaseUser.id ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {localUser.id === supabaseUser.id 
                    ? '✅ ID совпадают (синхронизировано)' 
                    : '⚠️ ID разные (нужна синхронизация)'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={checkStatus}
            className="px-6 py-3 glass rounded-xl"
          >
            Обновить статус
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl"
          >
            Личный кабинет
          </button>
          <button
            onClick={() => router.push('/migrate-account')}
            className="px-6 py-3 border border-cyan-500/30 rounded-xl"
          >
            Миграция аккаунта
          </button>
        </div>
      </div>
    </div>
  )
}
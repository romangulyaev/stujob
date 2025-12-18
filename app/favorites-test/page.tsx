// app/favorites-test/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { useUserSupabase } from '../lib/UserContextSupabase' // ← ИЗМЕНЕНО

export default function FavoritesTestPage() {
  const { user: supabaseUser, isLoading } = useUserSupabase()
  const [vacancies, setVacancies] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  // Загружаем вакансии
  useEffect(() => {
    loadVacancies()
  }, [])

  // Загружаем избранное если пользователь авторизован
  useEffect(() => {
    if (supabaseUser) {
      loadFavorites()
    } else {
      setLoading(false)
    }
  }, [supabaseUser])

  const loadVacancies = async () => {
    try {
      const { data, error } = await supabase
        .from('vacancies')
        .select(`
          *,
          companies (*)
        `)
        .limit(5)
      
      if (error) throw error
      setVacancies(data || [])
    } catch (error) {
      console.error('Ошибка загрузки вакансий:', error)
    }
  }

  const loadFavorites = async () => {
    if (!supabaseUser) return
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          vacancies (*)
        `)
        .eq('student_id', supabaseUser.user_id) // ← изменить поле на user_id
      
      if (error) throw error
      setFavorites(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error)
      setLoading(false)
    }
  }

  const toggleFavorite = async (vacancyId: string) => {
    if (!supabaseUser) {
      alert('Сначала войдите через Supabase')
      return
    }

    try {
      // Проверяем есть ли уже в избранном
      const { data: existing } = await supabase
        .from('favorites')
        .select('*')
        .eq('student_id', supabaseUser.user_id) // ← изменить поле на user_id
        .eq('vacancy_id', vacancyId)
        .single()

      if (existing) {
        // Удаляем из избранного
        await supabase
          .from('favorites')
          .delete()
          .eq('student_id', supabaseUser.user_id) // ← изменить поле на user_id
          .eq('vacancy_id', vacancyId)
        
        alert('Удалено из избранного')
      } else {
        // Добавляем в избранное
        await supabase
          .from('favorites')
          .insert([{
            student_id: supabaseUser.user_id, // ← изменить поле на user_id
            vacancy_id: vacancyId
          }])
        
        alert('Добавлено в избранное')
      }

      // Обновляем список
      loadFavorites()
    } catch (error) {
      console.error('Ошибка избранного:', error)
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
      <h1 className="text-3xl font-bold mb-6">Тест избранного (Supabase)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Информация */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Статус</h2>
          <div className="space-y-2">
            <p>Supabase пользователь: {supabaseUser?.email || '❌ Не авторизован'}</p>
            <p>ID пользователя: {supabaseUser?.user_id ? `${supabaseUser.user_id.substring(0, 8)}...` : 'Нет'}</p>
            <p>Избранных: {favorites.length}</p>
            <p>Вакансий загружено: {vacancies.length}</p>
            <div className="mt-4">
              {!supabaseUser && (
                <button
                  onClick={() => window.location.href = '/register'}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl"
                >
                  Зарегистрироваться
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Вакансии */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Вакансии</h2>
          {vacancies.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-gray-400 mb-4">Нет доступных вакансий</p>
              <button
                onClick={loadVacancies}
                className="px-4 py-2 glass rounded-xl hover:bg-white/10"
              >
                Загрузить вакансии
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {vacancies.map((vacancy) => {
                const isFavorite = favorites.some(f => f.vacancy_id === vacancy.id)
                
                return (
                  <div key={vacancy.id} className="glass rounded-xl p-4 hover:glow-primary transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{vacancy.title}</h3>
                        <p className="text-cyan-400">{vacancy.companies?.name || vacancy.company_id}</p>
                      </div>
                      <button
                        onClick={() => toggleFavorite(vacancy.id)}
                        className={`px-4 py-2 rounded ${isFavorite ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                        disabled={!supabaseUser}
                      >
                        {isFavorite ? '❤️ Убрать' : '🤍 В избранное'}
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                      {vacancy.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {vacancy.requirements?.slice(0, 3).map((skill: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                      <span>💰 {vacancy.salary_min ? `${vacancy.salary_min.toLocaleString()} ₽` : 'З/П не указана'}</span>
                      <span>📍 {vacancy.location || 'Не указано'}</span>
                      <span>🏢 {vacancy.format || 'Не указано'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Инструкция */}
      <div className="glass rounded-2xl p-6 mt-8">
        <h3 className="text-xl font-bold mb-4">Инструкция по тестированию</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-xl">
            <h4 className="font-bold mb-2">1. Проверка подключения</h4>
            <p className="text-sm text-gray-400">
              Убедитесь что в Supabase созданы таблицы: vacancies, companies, favorites
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <h4 className="font-bold mb-2">2. Авторизация</h4>
            <p className="text-sm text-gray-400">
              Зарегистрируйтесь или войдите через Supabase для работы с избранным
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <h4 className="font-bold mb-2">3. Тест избранного</h4>
            <p className="text-sm text-gray-400">
              Нажмите "В избранное" на вакансии. Запись добавится в таблицу favorites
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <h4 className="font-bold mb-2">4. Проверка данных</h4>
            <p className="text-sm text-gray-400">
              Проверьте таблицу favorites в Supabase Dashboard чтобы убедиться что данные сохраняются
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
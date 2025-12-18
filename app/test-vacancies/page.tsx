// app/test-vacancies/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function TestVacanciesPage() {
  const [vacancies, setVacancies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadVacancies()
  }, [])

  const loadVacancies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vacancies-new')
      const data = await response.json()
      
      if (response.ok) {
        setVacancies(data.vacancies)
      } else {
        setError(data.error || 'Ошибка загрузки')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Тест новых вакансий из Supabase</h1>
      
      <div className="glass rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Статус:</h2>
        {loading && <p className="text-yellow-400">⏳ Загрузка...</p>}
        {error && <p className="text-red-400">❌ {error}</p>}
        {!loading && !error && (
          <p className="text-green-400">✅ Успешно! Загружено {vacancies.length} вакансий</p>
        )}
      </div>

      {vacancies.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Вакансии из Supabase:</h2>
          <div className="space-y-4">
            {vacancies.map((vacancy) => (
              <div key={vacancy.id} className="p-4 bg-white/5 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{vacancy.title}</h3>
                    <p className="text-cyan-400">{vacancy.companies?.name}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                    {vacancy.salary_min?.toLocaleString()} ₽
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">{vacancy.description}</p>
                <div className="flex gap-2 mt-3">
                  {vacancy.requirements?.slice(0, 3).map((skill: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={loadVacancies}
        className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold"
      >
        Обновить
      </button>
    </div>
  )
}
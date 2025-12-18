// app/test-final/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'

export default function TestFinalPage() {
  const [result, setResult] = useState('')
  const [vacancies, setVacancies] = useState<any[]>([])

  const test = async () => {
    const supabase = createClient()
    
    try {
      // Пробуем получить вакансии
      const { data, error } = await supabase
        .from('vacancies')
        .select(`
          *,
          companies (*)
        `)
        .limit(3)

      if (error) {
        setResult(`❌ Ошибка: ${error.message}`)
        console.error('Supabase error:', error)
      } else if (data && data.length > 0) {
        setResult(`✅ Успех! Найдено ${data.length} вакансий`)
        setVacancies(data)
      } else {
        setResult('✅ Подключение есть, но вакансий нет')
      }
    } catch (err: any) {
      setResult(`❌ Исключение: ${err.message}`)
      console.error('Exception:', err)
    }
  }

  useEffect(() => {
    test()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Тест базы данных</h1>
      
      <div className="glass rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Статус:</h2>
        <p className={`text-2xl font-bold ${
          result.includes('✅') ? 'text-green-400' : 
          result.includes('❌') ? 'text-red-400' : 
          'text-yellow-400'
        }`}>
          {result || 'Проверяем...'}
        </p>
      </div>

      {vacancies.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Вакансии из базы:</h2>
          <div className="space-y-4">
            {vacancies.map((vacancy) => (
              <div key={vacancy.id} className="p-4 bg-white/5 rounded-xl">
                <h3 className="font-bold text-lg">{vacancy.title}</h3>
                <p className="text-cyan-400">{vacancy.companies?.name}</p>
                <p className="text-gray-400 text-sm mt-2">{vacancy.description}</p>
                <div className="flex gap-2 mt-3">
                  {vacancy.requirements.slice(0, 3).map((skill: string, i: number) => (
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
        onClick={test}
        className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold"
      >
        Обновить
      </button>
    </div>
  )
}
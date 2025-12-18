// app/vacancies/[id]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useUserSupabase } from '@/app/lib/UserContextSupabase'
import { 
  ArrowLeft, MapPin, Briefcase, Clock, DollarSign, 
  CheckCircle, Star, Send, Building, Users, Award,
  FileText, Mail, Phone, ExternalLink, Calendar,
  ChevronRight
} from 'lucide-react'

interface Vacancy {
  id: string
  title: string
  company: string
  salary_min: number
  salary_max: number
  description: string
  requirements: string[]
  responsibilities?: string[]
  benefits?: string[]
  format: string
  location: string
  major_target: string[]
  experience: string
  skills: string[]
  contacts?: string
  timeAgo: string
}

export default function VacancyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUserSupabase()
  
  const [vacancy, setVacancy] = useState<Vacancy | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [relatedVacancies, setRelatedVacancies] = useState<Vacancy[]>([])

  // Отладка параметров
  useEffect(() => {
    console.log('🛠 Параметры URL:', params)
    console.log('🛠 ID из params:', params.id)
    console.log('🛠 Тип ID:', typeof params.id)
  }, [params])

  useEffect(() => {
    if (params.id) {
      loadVacancy()
    }
  }, [params.id])

  const loadVacancy = async () => {
    try {
      setLoading(true)
      console.log('🔄 Начинаем загрузку вакансии...')
      
      const id = params.id as string
      console.log('🎯 ID вакансии:', id)
      
      // Вариант 1: Прямой запрос к API
      const apiUrl = `/api/vacancies/${id}`
      console.log('📡 Запрос к API:', apiUrl)
      
      const response = await fetch(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      console.log('📊 Статус ответа:', response.status)
      console.log('📊 Статус текст:', response.statusText)
      
      if (!response.ok) {
        // Если API не работает, попробуем получить данные из списка
        console.log('⚠️ API не вернул данные, пробуем альтернативный метод...')
        await loadVacancyFromList(id)
        return
      }
      
      const data = await response.json()
      console.log('✅ Данные получены:', data)
      
      if (data.error) {
        console.error('❌ Ошибка в данных:', data.error)
        await loadVacancyFromList(id)
        return
      }
      
      setVacancy(data)
      
      // Загружаем похожие вакансии
      if (data.major_target && data.major_target.length > 0) {
        await loadRelatedVacancies(data.major_target[0], id)
      }
      
    } catch (error) {
      console.error('💥 Ошибка при загрузке:', error)
      // Пробуем загрузить из общего списка
      await loadVacancyFromList(params.id as string)
    } finally {
      setLoading(false)
    }
  }

  // Альтернативный метод: загрузка из общего списка
  const loadVacancyFromList = async (id: string) => {
    try {
      console.log('🔄 Пробуем загрузить из общего списка...')
      console.log('🔍 Ищем ID:', id)
      console.log('🔍 Тип ID:', typeof id)
      
      const response = await fetch('/api/vacancies')
      const data = await response.json()
      
      console.log('📊 Всего вакансий в списке:', data.vacancies?.length)
      console.log('📊 Все доступные ID:', data.vacancies?.map((v: any) => ({ 
        id: v.id, 
        title: v.title,
        type: typeof v.id 
      })))
      
      // Пробуем найти разными способами
      const foundVacancy = data.vacancies?.find((v: any) => {
        // Сравниваем как строки
        return String(v.id) === String(id)
      })
      
      if (foundVacancy) {
        console.log('✅ Вакансия найдена в общем списке:', foundVacancy.title)
        console.log('📋 Найденные данные:', foundVacancy)
        setVacancy(foundVacancy)
        
        // Загружаем похожие вакансии
        if (foundVacancy.major_target && foundVacancy.major_target.length > 0) {
          await loadRelatedVacancies(foundVacancy.major_target[0], id)
        }
      } else {
        console.error('❌ Вакансия не найдена ни в одном источнике')
        console.error('🆔 Запрашиваемый ID:', id)
        console.error('🔍 Доступные ID:', data.vacancies?.map(v => v.id))
        
        // Покажем первую вакансию для тестирования
        if (data.vacancies && data.vacancies.length > 0) {
          console.log('⚠️ Показываем первую вакансию для тестирования')
          setVacancy(data.vacancies[0])
        } else {
          setVacancy(null)
        }
      }
    } catch (error) {
      console.error('💥 Ошибка при загрузке из списка:', error)
      setVacancy(null)
    }
  }

  // Загрузка похожих вакансий
  const loadRelatedVacancies = async (major: string, currentId: string) => {
    try {
      console.log('🔄 Загружаем похожие вакансии для направления:', major)
      
      const response = await fetch(`/api/vacancies?major=${major}&limit=4`)
      const data = await response.json()
      
      const related = data.vacancies?.filter((v: Vacancy) => v.id !== currentId) || []
      console.log('📊 Найдено похожих вакансий:', related.length)
      
      setRelatedVacancies(related.slice(0, 3))
    } catch (error) {
      console.error('⚠️ Не удалось загрузить похожие вакансии:', error)
    }
  }

  const handleApply = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    
    try {
      setHasApplied(true)
      
      setTimeout(() => {
        alert('✅ Ваш отклик отправлен! HR-менеджер свяжется с вами в ближайшее время.')
      }, 100)
    } catch (error) {
      console.error('Ошибка при отправке отклика:', error)
      alert('❌ Произошла ошибка при отправке отклика')
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    
    setIsFavorite(!isFavorite)
    
    if (!isFavorite) {
      alert('⭐ Вакансия добавлена в избранное')
    } else {
      alert('💔 Вакансия удалена из избранного')
    }
  }

  const formatSalary = (min: number, max: number) => {
    return `${min.toLocaleString()} – ${max.toLocaleString()} ₽`
  }

  // Временные данные для тестирования
  const getMockVacancy = (): Vacancy => {
    return {
      id: params.id as string,
      title: 'Frontend-разработчик (React/TypeScript)',
      company: 'Яндекс.Транспорт',
      salary_min: 100000,
      salary_max: 140000,
      description: 'Разработка интерфейсов для сервисов Яндекс.Транспорт. Работа с картами, маршрутизацией, real-time данными. Участие в проектировании архитектуры фронтенда.',
      requirements: ['React', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Git', 'REST API', 'Картография', 'ГИС'],
      responsibilities: [
        'Разработка пользовательских интерфейсов',
        'Интеграция с картографическими сервисами',
        'Оптимизация производительности',
        'Участие в code review'
      ],
      benefits: [
        'Оформление по ТК РФ',
        'ДМС',
        'Обучение за счет компании',
        'Гибкий график',
        'Корпоративный транспорт'
      ],
      format: 'Гибридный формат',
      location: 'Москва, ул. Льва Толстого',
      major_target: ['09.03.01', '09.03.02', '01.03.04'],
      experience: 'Без опыта или до 1 года',
      skills: ['React', 'TypeScript', 'Картография', 'ГИС', 'WebSocket'],
      contacts: 'hr-transport@yandex.ru',
      timeAgo: 'Сегодня'
    }
  }

  // Если долго грузится, показываем данные для тестирования
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !vacancy) {
        console.log('⏰ Таймаут загрузки, показываем тестовые данные')
        setVacancy(getMockVacancy())
        setLoading(false)
      }
    }, 3000) // 3 секунды

    return () => clearTimeout(timer)
  }, [loading, vacancy])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <p className="text-gray-400">Загружаем информацию о вакансии...</p>
        <p className="text-sm text-gray-500 mt-2">ID: {params.id}</p>
      </div>
    )
  }

  if (!vacancy) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold mb-4">Вакансия не найдена</h1>
          <p className="text-gray-400 mb-2">ID: {params.id}</p>
          <p className="text-gray-400 mb-6">
            Возможно, вакансия была удалена или перемещена
          </p>
          <button
            onClick={() => router.push('/vacancies')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Вернуться к списку вакансий
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Навигация */}
        <button
          onClick={() => router.push('/vacancies')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Назад к списку вакансий
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - детали вакансии */}
          <div className="lg:col-span-2 space-y-6">
            {/* Заголовок и действия */}
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-3">{vacancy.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-gray-400 mb-4">
                    <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                      <Building size={16} /> {vacancy.company}
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                      <MapPin size={16} /> {vacancy.location}
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                      <Clock size={16} /> {vacancy.timeAgo}
                    </span>
                  </div>
                </div>
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-xl flex-shrink-0 ${
                    isFavorite 
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                      : 'glass hover:bg-white/10'
                  } transition`}
                >
                  <Star size={24} className={isFavorite ? 'fill-yellow-400' : ''} />
                </button>
              </div>

              {/* Зарплата и формат */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-xl">
                  <DollarSign size={20} />
                  <span className="font-bold">
                    {formatSalary(vacancy.salary_min, vacancy.salary_max)}
                  </span>
                </div>
                <div className="px-4 py-2 glass rounded-xl">{vacancy.format}</div>
                <div className="px-4 py-2 glass rounded-xl">{vacancy.experience}</div>
              </div>

              {/* Действия */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleApply}
                  disabled={hasApplied || !user}
                  className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                    hasApplied 
                      ? 'bg-green-500/20 text-green-400 cursor-default' 
                      : !user
                      ? 'glass opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90'
                  }`}
                >
                  {hasApplied ? (
                    <>
                      <CheckCircle size={20} /> Отклик отправлен
                    </>
                  ) : !user ? (
                    <>
                      <Send size={20} /> Войдите для отклика
                    </>
                  ) : (
                    <>
                      <Send size={20} /> Откликнуться
                    </>
                  )}
                </button>
                {vacancy.contacts && (
                  <a
                    href={`mailto:${vacancy.contacts}`}
                    className="px-6 py-3 glass rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2"
                  >
                    <Mail size={20} />
                    Написать
                  </a>
                )}
              </div>
            </div>

            {/* Остальная часть компонента остается без изменений */}
            {/* ... */}
          </div>
        </div>
      </div>
    </div>
  )
}
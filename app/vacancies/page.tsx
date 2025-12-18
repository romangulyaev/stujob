// app/vacancies/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserSupabase } from '@/app/lib/UserContextSupabase'
import { MADI_MAJORS, WORK_FORMATS } from '@/app/lib/data'
import VacancyCard from '../components/VacancyCard'
import {
  Search, Filter, MapPin, DollarSign, Calendar,
  ChevronLeft, ChevronRight, X, SlidersHorizontal
} from 'lucide-react'

interface Vacancy {
  id: string
  title: string
  company: string
  salary_min: number
  salary_max: number
  description: string
  requirements: string[]
  format: string
  location: string
  major_target: string[]
  experience: string
  skills: string[]
  timeAgo: string
}

export default function VacanciesPage() {
  const router = useRouter()
  const { user, isLoading } = useUserSupabase()
  
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [filteredVacancies, setFilteredVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Фильтры
  const [filters, setFilters] = useState({
    major: 'all',
    format: 'all',
    location: '',
    minSalary: '',
    experience: 'all'
  })
  
  // Пагинация
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  // Синхронизация направления пользователя с фильтром
  useEffect(() => {
    if (user?.major_code) {
      setFilters(prev => ({
        ...prev,
        major: user.major_code
      }))
    }
  }, [user])

  // Загрузка вакансий
  useEffect(() => {
    loadVacancies()
  }, [page, filters])

  const loadVacancies = async () => {
    setLoading(true)
    try {
      // Используем API endpoint
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        ...(filters.major !== 'all' && { major: filters.major }),
        ...(filters.format !== 'all' && { format: filters.format }),
        ...(filters.minSalary && { minSalary: filters.minSalary }),
        ...(searchQuery && { search: searchQuery })
      })

      console.log('🔄 Загружаем вакансии с параметрами:', params.toString())
      
      const response = await fetch(`/api/vacancies?${params}`)
      const data = await response.json()
      
      console.log('✅ Данные получены от API:')
      console.log('   Всего вакансий:', data.total)
      console.log('   Загружено вакансий:', data.vacancies?.length)
      console.log('   Первые 3 ID:', data.vacancies?.slice(0, 3).map(v => ({ 
        id: v.id, 
        title: v.title,
        type: typeof v.id 
      })))
      
      if (data.error) {
        console.error('❌ Ошибка API:', data.error)
        setVacancies([])
        setFilteredVacancies([])
      } else {
        // Преобразуем данные для VacancyCard
        const formattedVacancies = data.vacancies.map((v: any) => {
          console.log('📋 Обрабатываем вакансию:', {
            rawId: v.id,
            idType: typeof v.id,
            title: v.title
          })
          
          return {
            ...v,
            // Преобразуем зарплату в строку для старого формата
            salary: v.salary_min ? 
              `${v.salary_min.toLocaleString()} – ${v.salary_max?.toLocaleString()} ₽` : 
              'Не указана',
            // Обеспечиваем backward compatibility
            majorTarget: v.major_target || [],
            location: v.location || 'Не указано'
          }
        })
        
        console.log('📊 Форматированные вакансии готовы:', formattedVacancies.length)
        
        setVacancies(formattedVacancies)
        setFilteredVacancies(formattedVacancies)
        setTotalPages(data.totalPages)
        setTotalResults(data.total)
      }
    } catch (error) {
      console.error('💥 Ошибка загрузки вакансий:', error)
      setVacancies([])
      setFilteredVacancies([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadVacancies()
  }

  const clearFilters = () => {
    setFilters({
      major: 'all',
      format: 'all',
      location: '',
      minSalary: '',
      experience: 'all'
    })
    setSearchQuery('')
    setPage(1)
  }

  // Показываем лоадер, пока проверяем сессию
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  // Если пользователь не авторизован — предлагаем регистрацию
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Доступ к вакансиям</h2>
          <p className="text-gray-400 mb-6">
            Зарегистрируйтесь, чтобы видеть подборку вакансий под ваше направление
          </p>
          <button
            onClick={() => router.push('/register')}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Зарегистрироваться
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full mt-3 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition"
          >
            Войти
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок и поиск */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Вакансии для студентов МАДИ</h1>
          <p className="text-gray-400 mb-6">
            Найдено {totalResults} вакансий
            {filters.major !== 'all' && ' по вашему направлению'}
          </p>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Поиск */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по вакансиям или компаниям..."
                  className="w-full glass pl-12 pr-4 py-3 rounded-xl"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                )}
              </div>
            </form>
            
            {/* Кнопка фильтров (мобильная) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-6 py-3 glass rounded-xl flex items-center gap-2"
            >
              <SlidersHorizontal size={20} />
              Фильтры
            </button>
            
            {/* Кнопка сброса */}
            <button
              onClick={clearFilters}
              className="px-6 py-3 glass rounded-xl hover:bg-white/10 transition"
            >
              Сбросить
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Фильтры (десктоп) */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="glass rounded-2xl p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Filter /> Фильтры
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-2"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Направление */}
                <div>
                  <label className="block text-gray-400 mb-3 flex items-center gap-2">
                    <Calendar size={16} /> Направление
                  </label>
                  <select
                    value={filters.major}
                    onChange={(e) => handleFilterChange('major', e.target.value)}
                    className="w-full glass px-4 py-3 rounded-xl"
                  >
                    <option value="all">Все направления</option>
                    {MADI_MAJORS.map((major) => (
                      <option key={major.id} value={major.code}>
                        {major.code} — {major.name.split('(')[0]}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Формат работы */}
                <div>
                  <label className="block text-gray-400 mb-3">Формат работы</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        checked={filters.format === 'all'}
                        onChange={() => handleFilterChange('format', 'all')}
                        className="w-4 h-4"
                      />
                      <span>Все форматы</span>
                    </label>
                    {WORK_FORMATS.slice(0, 4).map((format) => (
                      <label key={format} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="format"
                          checked={filters.format === format}
                          onChange={() => handleFilterChange('format', format)}
                          className="w-4 h-4"
                        />
                        <span>{format}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Зарплата */}
                <div>
                  <label className="block text-gray-400 mb-3 flex items-center gap-2">
                    <DollarSign size={16} /> Минимальная зарплата
                  </label>
                  <select
                    value={filters.minSalary}
                    onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                    className="w-full glass px-4 py-3 rounded-xl"
                  >
                    <option value="">Не важно</option>
                    <option value="50000">от 50 000 ₽</option>
                    <option value="70000">от 70 000 ₽</option>
                    <option value="90000">от 90 000 ₽</option>
                    <option value="110000">от 110 000 ₽</option>
                  </select>
                </div>
                
                {/* Локация */}
                <div>
                  <label className="block text-gray-400 mb-3 flex items-center gap-2">
                    <MapPin size={16} /> Локация
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Москва, Санкт-Петербург..."
                    className="w-full glass px-4 py-3 rounded-xl"
                  />
                </div>
                
                <button
                  onClick={loadVacancies}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Применить фильтры
                </button>
              </div>
            </div>
          </div>

          {/* Список вакансий */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                <p className="mt-4 text-gray-400">Загружаем вакансии...</p>
              </div>
            ) : filteredVacancies.length > 0 ? (
              <>
                <div className="space-y-6">
                  {filteredVacancies.map((vacancy) => {
                    console.log('🎯 Рендерим карточку вакансии:', {
                      id: vacancy.id,
                      title: vacancy.title,
                      rawId: vacancy.id,
                      idType: typeof vacancy.id
                    })
                    
                    return (
                      <VacancyCard
                        key={vacancy.id}
                        id={vacancy.id}
                        title={vacancy.title}
                        company={vacancy.company}
                        salary={vacancy.salary_min ? 
                          `${vacancy.salary_min.toLocaleString()} – ${vacancy.salary_max?.toLocaleString()} ₽` : 
                          'Не указана'
                        }
                        description={vacancy.description}
                        requirements={vacancy.requirements}
                        format={vacancy.format}
                        location={vacancy.location}
                        timeAgo={vacancy.timeAgo}
                        onApply={() => {
                          alert(`Отклик отправлен на вакансию: ${vacancy.title}`)
                        }}
                      />
                    )
                  })}
                </div>
                
                {/* Пагинация */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="p-2 glass rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                    >
                      <ChevronLeft />
                    </button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-lg transition ${page === pageNum ? 'bg-cyan-500' : 'glass hover:bg-white/10'}`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                      className="p-2 glass rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                    >
                      <ChevronRight />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 glass rounded-2xl">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">Вакансий не найдено</h3>
                <p className="text-gray-400 mb-6">
                  Попробуйте изменить параметры поиска или фильтры
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
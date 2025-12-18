// app/page.tsx (в корне проекта)
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserSupabase } from './lib/UserContextSupabase' // Используем только Supabase контекст
import { 
  Sparkles, Rocket, Target, Zap, 
  ArrowRight, CheckCircle, Users, Briefcase 
} from 'lucide-react'

interface Vacancy {
  id: string
  title: string
  company: string
  salary?: string
  description: string
  requirements: string[]
  format: string
  location?: string
  timeAgo: string
}

export default function Home() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useUserSupabase() // Получаем isAuthenticated
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(true)

  // Загружаем несколько вакансий для превью из Supabase
  useEffect(() => {
    async function loadVacancies() {
      try {
        const response = await fetch('/api/vacancies?limit=3')
        const data = await response.json()
        
        if (data.vacancies && data.vacancies.length > 0) {
          setVacancies(data.vacancies)
        } else {
          // Fallback на мок данные если API не вернул
          setVacancies([
            {
              id: '1',
              title: 'Frontend-разработчик (React)',
              company: 'Яндекс',
              salary: '100 000 ₽',
              description: 'Разработка интерфейсов для внутренних сервисов.',
              requirements: ['React', 'TypeScript', 'JavaScript'],
              format: 'Удалённо',
              location: 'Москва',
              timeAgo: 'Сегодня'
            }
          ])
        }
      } catch (error) {
        console.error('Ошибка загрузки вакансий:', error)
        setVacancies([])
      } finally {
        setLoading(false)
      }
    }
    
    loadVacancies()
  }, [])

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Персонализация',
      description: 'Подбор вакансий именно под ваше направление в МАДИ',
      color: 'text-cyan-400'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Мгновенные уведомления',
      description: 'Узнавайте о новых стажировках первыми',
      color: 'text-purple-400'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Прямой контакт',
      description: 'Общайтесь с компаниями без посредников',
      color: 'text-green-400'
    }
  ]

  const stats = [
    { value: '22', label: 'Направления МАДИ' },
    { value: '50+', label: 'Компаний-партнёров' },
    { value: '156', label: 'Активных вакансий' },
    { value: '89', label: 'Студентов нашли работу' }
  ]

  return (
    <div className="min-h-screen text-white">
      {/* Герой-секция */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6 animate-pulse-glow">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Только для студентов МАДИ</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient-primary">Стажировки</span>
              <br />
              <span className="text-3xl md:text-5xl font-normal text-gray-300">для будущих инженеров</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Найди стажировку по своему направлению. Укажи специальность — получи подборку вакансий от топ-компаний.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-lg flex items-center gap-3 justify-center hover:scale-105 transition"
                >
                  <Rocket /> Перейти в личный кабинет
                </button>
              ) : (
                <button
                  onClick={() => router.push('/register')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-lg flex items-center gap-3 justify-center hover:scale-105 transition"
                >
                  Начать бесплатно <ArrowRight />
                </button>
              )}
              
              <button
                onClick={() => router.push(user ? '/vacancies' : '/register')}
                className="px-8 py-4 glass rounded-xl font-semibold text-lg hover:bg-white/10 transition"
              >
                {user ? 'Смотреть вакансии' : 'Зарегистрироваться для доступа'}
              </button>
            </div>

            {/* Информация о статусе пользователя */}
            {user && (
              <div className="mt-6 text-sm text-gray-400">
                Вы вошли как <span className="text-cyan-400">{user.name}</span> • 
                {user.major_code ? ` ${user.major_code}` : ' Направление не указано'} • 
                Заполненность профиля: <span className="text-green-400">{user.profile_completion || 0}%</span>
                {isAuthenticated && (
                  <span className="ml-2 text-purple-400">• Supabase</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Декоративные элементы */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </section>

      {/* Преимущества */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Почему <span className="text-gradient-primary">StuJob</span>?
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Специализированная платформа, созданная студентами МАДИ для студентов МАДИ
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <div key={index} className="card p-8 hover:glow-primary transition group">
                <div className={`mb-6 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <CheckCircle className="w-5 h-5 text-green-400 inline mr-2" />
                  <span className="text-sm text-gray-400">Включено бесплатно</span>
                </div>
              </div>
            ))}
          </div>

          {/* Статистика */}
          <div className="glass rounded-2xl p-8 mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl font-bold text-gradient-primary mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Превью вакансий */}
      <section className="py-20 bg-gradient-to-b from-transparent to-black/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold mb-2">
                Горячие <span className="text-gradient-primary">вакансии</span>
              </h2>
              <p className="text-gray-400">Специально для студентов МАДИ</p>
            </div>
            <button
              onClick={() => router.push(user ? '/vacancies' : '/register')} // ← ДОБАВИТЬ ПРОВЕРКУ
              className="px-6 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition flex items-center gap-2"
              disabled={!user} // ← ДОБАВИТЬ DISABLED
            >
              {user ? 'Все вакансии' : 'Зарегистрируйтесь'} <ArrowRight size={20} />
            </button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-6 bg-white/10 rounded mb-4"></div>
                  <div className="h-4 bg-white/10 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded mb-4"></div>
                  <div className="h-10 bg-white/10 rounded"></div>
                </div>
              ))}
            </div>
          ) : vacancies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vacancies.map((vacancy) => (
                <div key={vacancy.id} className="card p-6 hover:glow-primary transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{vacancy.title}</h3>
                      <p className="text-cyan-400">{vacancy.company}</p>
                    </div>
                    {vacancy.salary && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                        {vacancy.salary}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{vacancy.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {vacancy.requirements.slice(0, 2).map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => router.push(user ? '/vacancies' : '/register')} // ← ДОБАВИТЬ ПРОВЕРКУ
                    className="w-full py-3 glass rounded-lg hover:bg-white/10 transition"
                  >
                    {user ? 'Подробнее' : 'Зарегистрироваться для доступа'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass rounded-2xl">
              <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-400">Загрузка вакансий...</p>
            </div>
          )}
        </div>
      </section>

      {/* Призыв к действию */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass rounded-2xl p-12 text-center max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
            
            <div className="relative">
              <h2 className="text-4xl font-bold mb-6">
                {user ? 'Продолжайте карьерный рост!' : 'Готов начать карьеру?'} {/* ← ИЗМЕНИТЬ ТЕКСТ */}
              </h2>
              <p className="text-gray-400 text-xl mb-10">
                {user 
                  ? `Присоединяйтесь к тысячам студентов МАДИ, которые уже нашли работу мечты, ${user.name}!`
                  : 'Присоединяйтесь к тысячам студентов МАДИ, которые уже нашли работу мечты'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push(user ? '/dashboard' : '/register')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-lg hover:scale-105 transition"
                >
                  {user ? 'Открыть кабинет' : 'Создать профиль'}
                </button>
                <button
                  onClick={() => router.push('/about')}
                  className="px-8 py-4 glass rounded-xl font-semibold text-lg hover:bg-white/10 transition"
                >
                  {user ? 'Наши партнёры' : 'Узнать больше'}
                </button>
              </div>
              
              <p className="text-gray-500 text-sm mt-8">
                Это бесплатно. Никаких скрытых платежей.
              </p>

              {/* Дополнительная информация для зарегистрированных пользователей */}
              {user && (
                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-cyan-400 font-bold">{user.skills?.length || 0}</div>
                      <div className="text-gray-500">Навыков</div>
                    </div>
                    <div>
                      <div className="text-purple-400 font-bold">{user.course || '?'}</div>
                      <div className="text-gray-500">Курс</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-bold">{user.profile_completion || 0}%</div>
                      <div className="text-gray-500">Профиль</div>
                    </div>
                    <div>
                      <div className="text-yellow-400 font-bold">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : 'Новый'}
                      </div>
                      <div className="text-gray-500">С нами с</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
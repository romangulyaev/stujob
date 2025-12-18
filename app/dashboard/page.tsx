'use client'

import { useRouter } from 'next/navigation'
import { useUserSupabase } from '@/app/lib/UserContextSupabase'
import { 
  Briefcase, Calendar, CheckCircle, Clock, 
  TrendingUp, User, FileText, Settings,
  Bell, Star, Award, Target
} from 'lucide-react'
import { useEffect } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useUserSupabase() // ← Добавили isAuthenticated из контекста

  // Если пользователь не зарегистрирован — на регистрацию
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/register')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!user) {
    return null // Перенаправление произойдет в useEffect
  }

  const stats = [
    { label: 'Новые вакансии', value: '12', icon: Briefcase, color: 'text-cyan-400' },
    { label: 'Мои отклики', value: '5', icon: CheckCircle, color: 'text-green-400' },
    { label: 'Приглашения', value: '2', icon: Calendar, color: 'text-purple-400' },
    { label: 'В избранном', value: '8', icon: Star, color: 'text-yellow-400' },
  ]

  const quickActions = [
    { label: 'Обновить резюме', icon: FileText, href: '/profile' },
    { label: 'Настройки профиля', icon: Settings, href: '/profile' },
    { label: 'Уведомления', icon: Bell, href: '#' },
    { label: 'Карьерный план', icon: Target, href: '#' },
  ]

  const recommendedVacancies = [
    { title: 'Backend-разработчик (Node.js)', company: 'Тинькофф', match: '95%' },
    { title: 'Инженер-проектировщик', company: 'Мосинжпроект', match: '88%' },
    { title: 'Data Analyst', company: 'Сбер', match: '82%' },
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Приветствие */}
        <div className="glass rounded-2xl p-8 mb-8 glow-primary">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold">
                Добро пожаловать, <span className="text-cyan-400">{user?.name || 'Студент'}</span>!
              </h1>
              <p className="text-gray-400 mt-2">
                {user?.major_code ? `${user.major_code}` : 'Направление не указано'} • 
                Курс {user?.course || 'не указан'} • 
                {user?.skills?.length || 0} навыков
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-white/10 rounded-full">
                  Заполненность профиля: {user?.profile_completion || 0}%
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isAuthenticated ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {isAuthenticated ? 'Подключён к Supabase' : 'Локальный аккаунт'} {/* ← Используем isAuthenticated из контекста */}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-400 rounded-2xl flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0) || 'М'}
              </div>
              <div>
                <p className="text-sm text-gray-400">Рейтинг профиля</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="font-bold">4.8</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="glass rounded-2xl p-6 hover:glow-primary transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-gray-400 mt-2">{stat.label}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="mt-4">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                    style={{ width: `${Math.min(100, parseInt(stat.value) * 10)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка: Быстрые действия и навыки */}
          <div className="lg:col-span-1 space-y-8">
            {/* Быстрые действия */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clock /> Быстрые действия
              </h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => router.push(action.href)}
                    className="w-full flex items-center gap-3 p-3 glass rounded-xl hover:bg-white/10 transition text-left"
                  >
                    <action.icon size={20} />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Навыки */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Award /> Ваши навыки
              </h3>
              <div className="flex flex-wrap gap-2">
                {user?.skills?.slice(0, 8).map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
                {user?.skills && user.skills.length > 8 && (
                  <span className="px-3 py-1 bg-white/5 rounded-full text-sm">
                    +{user.skills.length - 8}
                  </span>
                )}
                {(!user?.skills || user.skills.length === 0) && (
                  <p className="text-gray-400">Добавьте навыки в профиле</p>
                )}
              </div>
              <button 
                onClick={() => router.push('/profile')}
                className="w-full mt-4 py-2 glass rounded-xl hover:bg-white/10 transition"
              >
                Редактировать навыки
              </button>
            </div>

            {/* Миграция аккаунта */}
            {!isAuthenticated && ( // ← Используем isAuthenticated из контекста
              <div className="glass rounded-2xl p-6 border border-yellow-500/30">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  ⚠️ Миграция аккаунта
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Ваш аккаунт хранится локально. Для сохранения данных и доступа с других устройств привяжите к Supabase.
                </p>
                <button 
                  onClick={() => router.push('/migrate-account')}
                  className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-500 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Привязать к Supabase
                </button>
              </div>
            )}
          </div>

          {/* Правая колонка: Рекомендации и активность */}
          <div className="lg:col-span-2 space-y-8">
            {/* Рекомендованные вакансии */}
            <div className="glass rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp /> Рекомендованные для вас
                </h3>
                <button 
                  onClick={() => router.push('/vacancies')}
                  className="text-cyan-400 hover:text-cyan-300 transition"
                >
                  Смотреть все →
                </button>
              </div>
              
              <div className="space-y-4">
                {recommendedVacancies.map((vacancy, index) => (
                  <div key={index} className="p-4 glass rounded-xl hover:glow-primary transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">{vacancy.title}</h4>
                        <p className="text-cyan-400 text-sm">{vacancy.company}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-300 flex items-center justify-center text-white font-bold">
                          {vacancy.match}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-4">
                      <button 
                        onClick={() => router.push('/vacancies')}
                        className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg hover:opacity-90 transition"
                      >
                        Откликнуться
                      </button>
                      <button className="px-4 py-2 glass rounded-lg hover:bg-white/10">
                        <Star size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Недавняя активность */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6">📈 Недавняя активность</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 glass rounded-xl">
                  <CheckCircle className="text-green-400" />
                  <div className="flex-1">
                    <p>Отклик на вакансию "Frontend-разработчик"</p>
                    <p className="text-sm text-gray-400">Сегодня, 14:30</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    Отправлено
                  </span>
                </div>
                
                <div className="flex items-center gap-4 p-3 glass rounded-xl">
                  <Briefcase className="text-cyan-400" />
                  <div className="flex-1">
                    <p>Добавлено в избранное: "Инженер-проектировщик"</p>
                    <p className="text-sm text-gray-400">Вчера, 11:20</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 glass rounded-xl">
                  <User className="text-purple-400" />
                  <div className="flex-1">
                    <p>Обновлен профиль: добавлено 3 новых навыка</p>
                    <p className="text-sm text-gray-400">2 дня назад</p>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 py-3 glass rounded-xl hover:bg-white/10 transition">
                Показать всю историю
              </button>
            </div>

            {/* Быстрые ссылки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">🚀 Ускорьте поиск</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/vacancies?filter=new')}
                    className="w-full p-3 glass rounded-xl hover:bg-white/10 transition text-left"
                  >
                    Новые вакансии за неделю
                  </button>
                  <button 
                    onClick={() => router.push('/vacancies?filter=remote')}
                    className="w-full p-3 glass rounded-xl hover:bg-white/10 transition text-left"
                  >
                    Удалённая работа
                  </button>
                  <button 
                    onClick={() => router.push('/profile')}
                    className="w-full p-3 glass rounded-xl hover:bg-white/10 transition text-left"
                  >
                    Загрузить резюме
                  </button>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">📊 Ваш прогресс</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Заполнение профиля</span>
                      <span className="text-sm font-bold">{user?.profile_completion || 0}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                        style={{ width: `${user?.profile_completion || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Соответствие вакансиям</span>
                      <span className="text-sm font-bold">78%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push('/profile')}
                    className="w-full mt-4 py-2 glass rounded-xl hover:bg-white/10 transition"
                  >
                    Улучшить профиль
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserSupabase } from '@/app/lib/UserContextSupabase'
import { MADI_MAJORS, ALL_SKILLS, MADI_FACULTIES } from '@/app/lib/data'
import {
  User, Mail, GraduationCap, BookOpen, Briefcase,
  Upload, Save, Clock, CheckCircle, XCircle,
  Edit, Download, Trash2, Plus
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateProfile, isLoading } = useUserSupabase()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    major: MADI_MAJORS[0].code,
    faculty: MADI_FACULTIES[0],
    course: 3,
    skills: [] as string[],
    telegram: '',
    about: ''
  })

  // Обновить форму когда загрузится пользователь
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        major: user.major_code || MADI_MAJORS[0].code,
        faculty: MADI_FACULTIES[0],
        course: user.course || 3,
        skills: user.skills || [],
        telegram: user.telegram || '',
        about: user.about || ''
      })
    }
  }, [user])

  // Если загрузка
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  // Если пользователь не авторизован — на регистрацию
  if (!user) {
    router.push('/register')
    return null
  }

  const handleSkillToggle = (skill: string) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleSave = async () => {
    try {
      await updateProfile({
        name: form.name,
        email: form.email,
        major_code: form.major,
        course: form.course,
        skills: form.skills,
        telegram: form.telegram,
        about: form.about
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error)
      alert('Не удалось сохранить изменения')
    }
  }

  // История откликов (mock данные)
  const applications = [
    { id: 1, title: 'Frontend-разработчик', company: 'Яндекс', date: '2025-03-15', status: 'pending' },
    { id: 2, title: 'Data Science стажёр', company: 'Сбер', date: '2025-03-10', status: 'reviewed' },
    { id: 3, title: 'Инженер-проектировщик', company: 'Мосинжпроект', date: '2025-03-05', status: 'rejected' },
    { id: 4, title: 'Backend-разработчик', company: 'Тинькофф', date: '2025-03-01', status: 'accepted' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-400 bg-green-400/10'
      case 'rejected': return 'text-red-400 bg-red-400/10'
      case 'reviewed': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle size={16} />
      case 'rejected': return <XCircle size={16} />
      case 'reviewed': return <Clock size={16} />
      default: return <Clock size={16} />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Приглашение'
      case 'rejected': return 'Отказ'
      case 'reviewed': return 'Просмотрено'
      default: return 'Ожидает'
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок и кнопки */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Мой профиль</h1>
            <p className="text-gray-400">Управляйте вашими данными и отслеживайте отклики</p>
          </div>
          <div className="flex gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 glass rounded-xl hover:bg-white/10 transition"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold flex items-center gap-2"
                >
                  <Save size={20} /> Сохранить
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 glass rounded-xl hover:bg-white/10 transition flex items-center gap-2"
              >
                <Edit size={20} /> Редактировать
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка: Информация профиля */}
          <div className="lg:col-span-2 space-y-8">
            {/* Основная информация */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User /> Основная информация
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">ФИО</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full glass px-4 py-3 rounded-xl"
                    />
                  ) : (
                    <div className="glass px-4 py-3 rounded-xl">{user.name || 'Не указано'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      className="w-full glass px-4 py-3 rounded-xl"
                    />
                  ) : (
                    <div className="glass px-4 py-3 rounded-xl">{user.email || 'Не указан'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Telegram</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.telegram}
                      onChange={(e) => setForm({...form, telegram: e.target.value})}
                      className="w-full glass px-4 py-3 rounded-xl"
                      placeholder="@username"
                    />
                  ) : (
                    <div className="glass px-4 py-3 rounded-xl text-gray-400">
                      {form.telegram || 'Не указан'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Курс</label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((course) => (
                        <button
                          key={course}
                          type="button"
                          onClick={() => setForm({...form, course})}
                          className={`flex-1 py-3 rounded-xl ${form.course === course ? 'bg-cyan-600' : 'glass hover:bg-white/10'}`}
                        >
                          {course}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="glass px-4 py-3 rounded-xl">Курс {user.course || 'Не указан'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Образование */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <GraduationCap /> Образование
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-400 mb-2">Направление подготовки</label>
                  {isEditing ? (
                    <select
                      value={form.major}
                      onChange={(e) => setForm({...form, major: e.target.value})}
                      className="w-full glass px-4 py-3 rounded-xl"
                    >
                      {MADI_MAJORS.map((major) => (
                        <option key={major.id} value={major.code}>
                          {major.code} — {major.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="glass px-4 py-3 rounded-xl">
                      {MADI_MAJORS.find(m => m.code === user.major_code)?.name || user.major_code || 'Не указано'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Навыки</label>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {ALL_SKILLS.slice(0, 15).map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleSkillToggle(skill)}
                          className={`px-3 py-1 rounded-full text-sm ${form.skills.includes(skill) ? 'bg-cyan-500/30 border border-cyan-500/50' : 'glass hover:bg-white/10'}`}
                        >
                          {skill} {form.skills.includes(skill) && '✓'}
                        </button>
                      ))}
                      <button className="px-3 py-1 glass rounded-full text-sm flex items-center gap-1">
                        <Plus size={14} /> Ещё
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.skills?.map((skill, index) => (
                        <span key={index} className="px-3 py-1 glass rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                      {(!user.skills || user.skills.length === 0) && (
                        <span className="text-gray-400">Навыки не добавлены</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">О себе</label>
                  {isEditing ? (
                    <textarea
                      value={form.about}
                      onChange={(e) => setForm({...form, about: e.target.value})}
                      className="w-full glass px-4 py-3 rounded-xl min-h-[100px]"
                      placeholder="Расскажите о своих проектах, достижениях, интересах..."
                    />
                  ) : (
                    <div className="glass px-4 py-3 rounded-xl min-h-[100px]">
                      {user.about || 'Расскажите о себе в разделе редактирования...'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* История откликов */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Briefcase /> История откликов
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-white/10">
                      <th className="pb-3">Вакансия</th>
                      <th className="pb-3">Компания</th>
                      <th className="pb-3">Дата</th>
                      <th className="pb-3">Статус</th>
                      <th className="pb-3">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-b border-white/5">
                        <td className="py-4">
                          <div className="font-medium">{app.title}</div>
                        </td>
                        <td className="py-4 text-cyan-400">{app.company}</td>
                        <td className="py-4 text-gray-400">{app.date}</td>
                        <td className="py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            {getStatusText(app.status)}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button className="p-2 glass rounded-lg hover:bg-white/10">
                              <Download size={16} />
                            </button>
                            <button className="p-2 glass rounded-lg hover:bg-white/10 text-red-400">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <button className="w-full mt-6 py-3 glass rounded-xl hover:bg-white/10 transition">
                Показать все отклики
              </button>
            </div>
          </div>

          {/* Правая колонка: Резюме и статистика */}
          <div className="space-y-8">
            {/* Резюме */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">📄 Резюме</h2>
              
              <div className="space-y-4">
                <div className="p-4 glass rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Резюме_{user.name?.split(' ')[0] || 'Студент'}.pdf</div>
                      <div className="text-sm text-gray-400">
                        {user.resume_url ? `Обновлено ${new Date().toLocaleDateString()}` : 'Файл не загружен'}
                      </div>
                    </div>
                    <button className="p-2 glass rounded-lg hover:bg-white/10">
                      <Download size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-400 mb-2">Перетащите PDF файл сюда</p>
                  <p className="text-sm text-gray-500 mb-4">или</p>
                  <button className="px-6 py-2 glass rounded-xl hover:bg-white/10 transition">
                    Выберите файл
                  </button>
                  <p className="text-xs text-gray-500 mt-4">Макс. размер: 5 MB</p>
                </div>
              </div>
              
              <button className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold">
                Обновить резюме
              </button>
            </div>

            {/* Статистика профиля */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">📊 Статистика</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Заполненность профиля</span>
                  <span className="font-bold">{user.profile_completion || 0}%</span>
                </div>
                <div className="h-2 glass rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" 
                    style={{ width: `${user.profile_completion || 0}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 glass rounded-xl">
                    <div className="text-2xl font-bold text-cyan-400">12</div>
                    <div className="text-sm text-gray-400">Откликов</div>
                  </div>
                  <div className="text-center p-3 glass rounded-xl">
                    <div className="text-2xl font-bold text-green-400">4</div>
                    <div className="text-sm text-gray-400">Собеседований</div>
                  </div>
                  <div className="text-center p-3 glass rounded-xl">
                    <div className="text-2xl font-bold text-purple-400">8</div>
                    <div className="text-sm text-gray-400">В избранном</div>
                  </div>
                  <div className="text-center p-3 glass rounded-xl">
                    <div className="text-2xl font-bold text-yellow-400">78%</div>
                    <div className="text-sm text-gray-400">Совпадение</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Быстрые настройки */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">⚙️ Настройки</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Email-уведомления</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-12 h-6 bg-white/10 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition"></div>
                  </div>
                </label>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Telegram-уведомления</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" />
                    <div className="w-12 h-6 bg-white/10 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition"></div>
                  </div>
                </label>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Публичный профиль</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-12 h-6 bg-white/10 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition"></div>
                  </div>
                </label>
              </div>
              
              <button className="w-full mt-6 py-3 glass rounded-xl hover:bg-white/10 transition">
                Все настройки
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// app/register/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserSupabase } from '@/app/lib/UserContextSupabase'
import { MADI_MAJORS, ALL_SKILLS, MADI_FACULTIES } from '@/app/lib/data'
import { 
  User, Mail, GraduationCap, BookOpen, Briefcase, Lock,
  Check, ArrowRight 
} from 'lucide-react'

type FormData = {
  name: string
  email: string
  password: string
  major: string
  faculty: string
  course: number
  skills: string[]
  telegram: string
  about: string
}

const INITIAL_FORM: FormData = {
  name: '',
  email: '',
  password: '',
  major: MADI_MAJORS[0].code,
  faculty: MADI_FACULTIES[0],
  course: 3,
  skills: [],
  telegram: '',
  about: ''
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, user, isLoading } = useUserSupabase()
  
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)

  // Загружаем форму из sessionStorage при монтировании
  useEffect(() => {
    const savedForm = sessionStorage.getItem('stujob_registration_form')
    const savedStep = sessionStorage.getItem('stujob_registration_step')
    
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm)
        setForm(parsedForm)
      } catch (error) {
        console.error('Ошибка загрузки формы:', error)
      }
    }
    
    if (savedStep) {
      setStep(Number(savedStep))
    }
  }, [])

  // Сохраняем форму и шаг в sessionStorage при любом изменении
  useEffect(() => {
    sessionStorage.setItem('stujob_registration_form', JSON.stringify(form))
    sessionStorage.setItem('stujob_registration_step', step.toString())
  }, [form, step])

  // Если пользователь уже авторизован — перенаправляем в личный кабинет
  useEffect(() => {
    if (user && !registrationComplete) {
      router.push('/dashboard')
    }
  }, [user, router, registrationComplete])

  // Функция для обновления формы
  const updateFormField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSkillToggle = (skill: string) => {
    setForm(prev => {
      const newSkills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
      
      return { ...prev, skills: newSkills }
    })
  }

  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Валидация перед переходом на следующий шаг
    if (step === 1) {
      if (!form.name.trim()) {
        alert('Введите ваше имя')
        return
      }
      if (!form.email.trim()) {
        alert('Введите email')
        return
      }
      if (!form.email.includes('@')) {
        alert('Введите корректный email')
        return
      }
      if (!form.password.trim()) {
        alert('Введите пароль')
        return
      }
      if (form.password.length < 6) {
        alert('Пароль должен быть не менее 6 символов')
        return
      }
    }
    
    if (step === 2) {
      if (!form.major) {
        alert('Выберите направление подготовки')
        return
      }
    }
    
    setStep(prev => prev + 1)
  }

  const handlePrevStep = () => {
    setStep(prev => prev - 1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step < 3) {
      e.preventDefault()
      handleNextStep()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting || registrationComplete) return
    
    setIsSubmitting(true)
    
    try {
      // Финальная валидация (только на шаге 3!)
      if (step !== 3) {
        setStep(3)
        setIsSubmitting(false)
        return
      }
      
      if (form.skills.length === 0) {
        alert('Выберите хотя бы один навык')
        setIsSubmitting(false)
        return
      }
      
      // Использовать register из Supabase контекста
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        major_code: form.major,
        course: form.course,
        skills: form.skills
      })
      
      if (result.success) {
        setRegistrationComplete(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        sessionStorage.removeItem('stujob_registration_form')
        sessionStorage.removeItem('stujob_registration_step')
        router.push('/dashboard')
      } else {
        alert(`Ошибка регистрации: ${result.error}`)
        setIsSubmitting(false)
      }
      
    } catch (error: any) {
      console.error('Ошибка регистрации:', error)
      alert('Произошла ошибка при регистрации')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (user && !registrationComplete) {
    return null
  }

  // Экран успешной регистрации
  if (registrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass w-full max-w-2xl p-12 text-center glow-primary">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check size={48} className="text-white" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Регистрация успешно завершена!</h1>
          <p className="text-xl text-gray-300 mb-6">
            Добро пожаловать, <span className="text-cyan-400 font-bold">{form.name}</span>!
          </p>
          
          <div className="glass p-6 rounded-2xl mb-8 text-left">
            <p className="mb-2">🎓 <span className="font-bold">Направление:</span> {MADI_MAJORS.find(m => m.code === form.major)?.name || form.major}</p>
            <p className="mb-2">📧 <span className="font-bold">Email:</span> {form.email}</p>
            <p className="mb-2">📚 <span className="font-bold">Навыки:</span> {form.skills.length} выбрано</p>
            <p className="text-sm text-gray-400 mt-4">
              Ваш профиль сохранён. Теперь вы можете искать вакансии по вашему направлению.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-lg"
            >
              Перейти в личный кабинет
            </button>
            <button
              onClick={() => router.push('/vacancies')}
              className="px-8 py-3 glass rounded-xl font-semibold text-lg hover:bg-white/10"
            >
              Смотреть вакансии
            </button>
          </div>
          
          <p className="text-gray-500 text-sm mt-8">
            Перенаправление на главную страницу...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass w-full max-w-2xl p-8 glow-primary">
        {/* Шаги */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= num ? 'bg-cyan-500' : 'bg-white/10'}`}>
                {step > num ? <Check size={24} /> : <span>{num}</span>}
              </div>
              <span className="mt-2 text-sm text-gray-400">
                {num === 1 && 'Основное'}
                {num === 2 && 'Образование'}
                {num === 3 && 'Навыки'}
              </span>
            </div>
          ))}
        </div>

        <h1 className="text-3xl font-bold mb-2">Регистрация студента МАДИ</h1>
        <p className="text-gray-400 mb-8">
          Шаг {step} из 3: {
            step === 1 ? 'Основная информация' :
            step === 2 ? 'Образование' : 'Навыки'
          }
        </p>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
          {/* Шаг 1: Основная информация */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-gray-400 mb-2 flex items-center gap-2">
                  <User size={18} /> ФИО *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  className="w-full glass px-4 py-3 rounded-xl"
                  placeholder="Иванов Иван Иванович"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2 flex items-center gap-2">
                  <Mail size={18} /> Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateFormField('email', e.target.value)}
                  className="w-full glass px-4 py-3 rounded-xl"
                  placeholder="student@madi.ru"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2 flex items-center gap-2">
                  <Lock size={18} /> Пароль *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateFormField('password', e.target.value)}
                  className="w-full glass px-4 py-3 rounded-xl"
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Telegram (опционально)</label>
                <input
                  type="text"
                  value={form.telegram}
                  onChange={(e) => updateFormField('telegram', e.target.value)}
                  className="w-full glass px-4 py-3 rounded-xl"
                  placeholder="@username"
                />
              </div>
            </div>
          )}

          {/* Шаг 2: Образование */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-gray-400 mb-2 flex items-center gap-2">
                  <GraduationCap size={18} /> Факультет
                </label>
                <select
                  value={form.faculty}
                  onChange={(e) => updateFormField('faculty', e.target.value)}
                  className="w-full glass px-4 py-3 rounded-xl"
                >
                  {MADI_FACULTIES.map((faculty) => (
                    <option key={faculty} value={faculty}>{faculty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 flex items-center gap-2">
                  <BookOpen size={18} /> Направление подготовки *
                </label>
                <select
                  value={form.major}
                  onChange={(e) => updateFormField('major', e.target.value)}
                  className="w-full glass px-4 py-3 rounded-xl"
                  required
                >
                  {MADI_MAJORS.map((major) => (
                    <option key={major.id} value={major.code}>
                      {major.code} — {major.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Курс</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((course) => (
                    <button
                      key={course}
                      type="button"
                      onClick={() => updateFormField('course', course)}
                      className={`flex-1 py-3 rounded-xl ${form.course === course ? 'bg-cyan-600' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      {course}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Шаг 3: Навыки */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <label className="block text-gray-400 mb-4 flex items-center gap-2">
                <Briefcase size={18} /> Выберите ваши навыки *
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {ALL_SKILLS.slice(0, 30).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className={`p-3 rounded-xl text-left transition ${form.skills.includes(skill) ? 'bg-cyan-500/30 border border-cyan-500/50' : 'glass hover:bg-white/10'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{skill}</span>
                      {form.skills.includes(skill) && <Check size={16} />}
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-gray-400 mb-2">О себе (опционально)</label>
                <textarea
                  value={form.about}
                  onChange={(e) => updateFormField('about', e.target.value)}
                  className="w-full glass px-4 py-3 rounded-xl min-h-[100px]"
                  placeholder="Расскажите о своих достижениях, проектах, интересах..."
                />
              </div>
            </div>
          )}

          {/* Кнопки навигации */}
          <div className="flex justify-between pt-6 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 glass rounded-xl hover:bg-white/10 transition"
              >
                Назад
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold flex items-center gap-2"
              >
                Дальше <ArrowRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Сохранение...' : 'Завершить регистрацию'}
              </button>
            )}
          </div>
        </form>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Уже есть аккаунт?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-cyan-400 hover:text-cyan-300 transition"
            >
              Войти
            </button>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Нажимая "Завершить регистрацию", вы соглашаетесь с обработкой данных
          </p>
        </div>
      </div>
    </div>
  )
}
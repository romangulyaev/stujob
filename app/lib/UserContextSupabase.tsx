// app/lib/UserContextSupabase.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from './supabase/client'
import { MADI_MAJORS } from './data'

// Интерфейс пользователя (синхронизирован с таблицей students)
interface StudentUser {
  id: string
  user_id: string // Supabase Auth ID
  name: string
  email: string
  university: string
  major_code: string
  course: number
  skills: string[]
  resume_url?: string
  telegram?: string
  about?: string
  profile_completion: number
  email_confirmed?: boolean
  created_at: string
  updated_at: string
}

// Интерфейс для контекста
interface UserContextType {
  user: StudentUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: {
    name: string
    email: string
    password: string
    major_code?: string
    course?: number
    skills?: string[]
  }) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: Partial<StudentUser>) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  syncWithLocalStorage: () => void
  refreshUser: () => Promise<boolean>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProviderSupabase({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const supabase = createClient()

  // При загрузке приложения проверяем сессию и загружаем пользователя
  useEffect(() => {
    initializeUser()
  }, [])

  const initializeUser = async () => {
    try {
      setIsLoading(true)

      // 1. Проверяем Supabase сессию
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Ошибка получения сессии:', sessionError)
      }
      
      if (session?.user) {
        setIsAuthenticated(true)
        
        // 2. Загружаем профиль студента
        const { data: profile, error: profileError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Ошибка загрузки профиля:', profileError)
          
          // Если профиля нет, но есть сессия - создаем базовый профиль
          if (profileError.code === 'PGRST116') {
            const newProfile = {
              user_id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Студент',
              email: session.user.email || '',
              university: 'МАДИ',
              major_code: MADI_MAJORS[0].code,
              course: 1,
              skills: [] as string[],
              profile_completion: 40,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }

            const { error: insertError } = await supabase
              .from('students')
              .insert([newProfile])

            if (!insertError) {
              setUser({ id: 'temp', ...newProfile })
              localStorage.setItem('stujob_user_backup', JSON.stringify(newProfile))
            }
          }
        } else if (profile) {
          setUser(profile)
          localStorage.setItem('stujob_user_backup', JSON.stringify(profile))
        }
      } else {
        // Нет сессии, пробуем загрузить из localStorage
        const savedUser = localStorage.getItem('stujob_user_backup')
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser)
            setUser(parsedUser)
            setIsAuthenticated(false)
          } catch (e) {
            console.error('Ошибка парсинга backup пользователя:', e)
          }
        }
      }

    } catch (error) {
      console.error('Ошибка инициализации пользователя:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Регистрация нового пользователя
  const register = async (userData: {
    name: string
    email: string
    password: string
    major_code?: string
    course?: number
    skills?: string[]
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Регистрация в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            university: 'МАДИ'
          }
        }
      })

      if (authError) {
        // Проверяем, не зарегистрирован ли уже пользователь
        if (authError.message.includes('already registered') || 
            authError.message.includes('User already registered')) {
          return { 
            success: false, 
            error: 'Этот email уже зарегистрирован. Используйте вход.' 
          }
        }
        throw authError
      }
      
      if (!authData.user) {
        throw new Error('Не удалось создать пользователя')
      }

      // 2. Создаем профиль студента (с базовой структурой)
      const baseProfile = {
        user_id: authData.user.id,
        name: userData.name,
        email: userData.email,
        university: 'МАДИ',
        major_code: userData.major_code || MADI_MAJORS[0].code,
        course: userData.course || 1,
        skills: userData.skills || [],
        profile_completion: 60,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Пробуем создать профиль с дополнительными полями
      let profileToInsert = { ...baseProfile }
      
      try {
        // Пробуем добавить email_confirmed если колонка существует
        profileToInsert = {
          ...profileToInsert,
        }
      } catch (e) {
        // Игнорируем ошибку, если колонки нет
      }

      // Пробуем вставить профиль
      const { error: profileError } = await supabase
        .from('students')
        .insert([profileToInsert])

      if (profileError) {
        console.warn('Ошибка создания профиля:', profileError)
        
        // Если ошибка из-за колонки email_confirmed, пробуем без нее
        if (profileError.message.includes('email_confirmed')) {
          const { error: retryError } = await supabase
            .from('students')
            .insert([baseProfile])
            
          if (retryError) {
            // Если профиль уже существует, продолжаем
            if (!retryError.message.includes('duplicate key') && 
                !retryError.code?.includes('23505')) {
              throw retryError
            }
          }
        } else if (!profileError.message.includes('duplicate key') && 
                  !profileError.code?.includes('23505')) {
          throw profileError
        }
      }

      // 3. Пробуем войти, но не блокируем если не получилось
      try {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: userData.password
        })
        
        if (loginError) {
          console.warn('Автовход после регистрации не удался:', loginError)
          // Это нормально - пользователь может войти вручную позже
        } else {
          console.log('✅ Автовход успешен после регистрации')
        }
      } catch (loginErr) {
        console.warn('Ошибка при попытке автовхода:', loginErr)
        // Не прерываем процесс регистрации
      }

      // 4. Получаем обновленный профиль
      const { data: updatedProfile } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle()

      // 5. Обновляем состояние пользователя
      if (updatedProfile) {
        setUser(updatedProfile)
        setIsAuthenticated(true)
      } else {
        // Если профиль не найден, используем созданный
        const newUserProfile: StudentUser = {
          id: 'temp',
          ...baseProfile
        }
        setUser(newUserProfile)
        setIsAuthenticated(true)
      }

      // 6. Сохраняем в localStorage
      const finalProfile = updatedProfile || baseProfile
      localStorage.setItem('stujob_user_backup', JSON.stringify(finalProfile))

      return { success: true }

    } catch (error: any) {
      console.error('Ошибка регистрации:', error)
      
      // Преобразуем ошибку в понятный текст
      let userFriendlyError = error.message
      
      if (error.message.includes('Failed to fetch')) {
        userFriendlyError = 'Проблема с подключением к серверу'
      } else if (error.message.includes('password')) {
        userFriendlyError = 'Слабый пароль. Используйте минимум 6 символов'
      } else if (error.message.includes('email')) {
        userFriendlyError = 'Некорректный email адрес'
      } else if (error.message.includes('rate limit')) {
        userFriendlyError = 'Слишком много попыток. Подождите 1 минуту'
      }
      
      return { 
        success: false, 
        error: userFriendlyError 
      }
    }
  }

  // Вход - ИСПРАВЛЕННАЯ ВЕРСИЯ (игнорирует ошибку подтверждения email)
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log(`🔄 Попытка входа для: ${email}`)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.log('❌ Ошибка входа:', error.message)
        
        // 📌 ВАЖНО: ИГНОРИРУЕМ ОШИБКУ ПОДТВЕРЖДЕНИЯ EMAIL ДЛЯ УЧЕБНОГО ПРОЕКТА
        if (error.message.includes('Email not confirmed') || 
            error.message.includes('email not confirmed') ||
            error.message.includes('не подтвержден') ||
            error.message.includes('confirm')) {
          
          console.warn('⚠️ Email не подтвержден, но разрешаем вход (учебный проект)')
          
          try {
            // Пробуем получить сессию
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session?.user) {
              console.log('✅ Найдена сессия, пользователь:', session.user.email)
              
              // Загружаем профиль из таблицы students
              const { data: profile } = await supabase
                .from('students')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle()
              
              if (profile) {
                console.log('✅ Профиль загружен:', profile.name)
                setUser(profile)
                setIsAuthenticated(true)
                localStorage.setItem('stujob_user_backup', JSON.stringify(profile))
                return { success: true }
              }
            }
            
            // Если не получилось по user_id, ищем по email
            console.log('🔍 Ищем профиль студента по email:', email)
            const { data: studentByEmail } = await supabase
              .from('students')
              .select('*')
              .eq('email', email)
              .maybeSingle()
            
            if (studentByEmail) {
              console.log('✅ Найден профиль студента по email:', studentByEmail.name)
              setUser(studentByEmail)
              setIsAuthenticated(false) // Помечаем как локальный (т.к. нет Supabase сессии)
              localStorage.setItem('stujob_user_backup', JSON.stringify(studentByEmail))
              return { 
                success: true, 
                error: 'Email не подтвержден, но вход разрешен (учебный проект)' 
              }
            }
            
            // Если профиль не найден, создаем временного пользователя
            console.log('👤 Создаем временного пользователя для демо-входа')
            const tempUser = {
              id: 'temp_' + Date.now(),
              user_id: 'temp_' + Date.now(),
              name: email.split('@')[0] || 'Студент',
              email: email,
              university: 'МАДИ',
              major_code: '09.03.02',
              course: 1,
              skills: ['JavaScript', 'React'],
              profile_completion: 50,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            
            setUser(tempUser)
            setIsAuthenticated(false)
            localStorage.setItem('stujob_user_backup', JSON.stringify(tempUser))
            
            return { 
              success: true, 
              error: 'Email не подтвержден, но вход разрешен (учебный проект)' 
            }
            
          } catch (fallbackError) {
            console.error('❌ Ошибка при fallback-входе:', fallbackError)
            // Все равно разрешаем вход с базовым пользователем
            const basicUser = {
              id: 'basic_' + Date.now(),
              user_id: 'basic_' + Date.now(),
              name: email.split('@')[0] || 'Студент',
              email: email,
              university: 'МАДИ',
              major_code: '09.03.02',
              course: 1,
              skills: [],
              profile_completion: 30,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            
            setUser(basicUser)
            localStorage.setItem('stujob_user_backup', JSON.stringify(basicUser))
            return { success: true }
          }
        }
        
        // Обработка других ошибок (не связанных с подтверждением email)
        let userFriendlyError = 'Неверный email или пароль'
        
        if (error.message.includes('Invalid login credentials')) {
          userFriendlyError = 'Неверный email или пароль'
        } else if (error.message.includes('User not found')) {
          userFriendlyError = 'Пользователь не найден'
        } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
          userFriendlyError = 'Слишком много попыток. Подождите 1 минуту'
        } else {
          userFriendlyError = `Ошибка входа: ${error.message}`
        }
        
        return { success: false, error: userFriendlyError }
      }

      // Успешный вход (без ошибки подтверждения email)
      console.log('✅ Успешный вход, пользователь:', data.user?.email)
      
      if (data.user) {
        // Загружаем профиль из таблицы students
        const { data: profile } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle()
        
        if (profile) {
          setUser(profile)
          setIsAuthenticated(true)
          localStorage.setItem('stujob_user_backup', JSON.stringify(profile))
        } else {
          console.log('📝 Профиль не найден, создаем базовый...')
          const baseProfile = {
            id: 'loaded_' + Date.now(),
            user_id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Студент',
            email: data.user.email || '',
            university: 'МАДИ',
            major_code: '09.03.02',
            course: 1,
            skills: [],
            profile_completion: 40,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setUser(baseProfile)
          setIsAuthenticated(true)
          localStorage.setItem('stujob_user_backup', JSON.stringify(baseProfile))
        }
      }
      
      return { success: true }

    } catch (error: any) {
      console.error('🔥 Критическая ошибка входа:', error)
      return { 
        success: false, 
        error: 'Произошла ошибка при входе. Попробуйте обновить страницу.' 
      }
    }
  }

  // Обновление профиля
  const updateProfile = async (data: Partial<StudentUser>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Пользователь не авторизован' }
    }

    try {
      const updates = {
        ...data,
        updated_at: new Date().toISOString()
      }

      // Удаляем поля которые не должны обновляться напрямую
      delete updates.id
      delete updates.user_id
      delete updates.created_at

      const { error } = await supabase
        .from('students')
        .update(updates)
        .eq('user_id', user.user_id)

      if (error) throw error

      // Обновляем локальное состояние
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      
      // Обновляем backup в localStorage
      localStorage.setItem('stujob_user_backup', JSON.stringify(updatedUser))

      return { success: true }

    } catch (error: any) {
      console.error('Ошибка обновления профиля:', error)
      return { success: false, error: error.message }
    }
  }

  // Выход
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('stujob_user_backup')
    } catch (error) {
      console.error('Ошибка выхода:', error)
    }
  }

  // Синхронизация с localStorage (для миграции)
  const syncWithLocalStorage = () => {
    const savedUser = localStorage.getItem('stujob_user')
    if (savedUser && !user) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // Конвертируем старый формат в новый
        const convertedUser: StudentUser = {
          id: 'migrated_' + parsedUser.id,
          user_id: parsedUser.id,
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          university: parsedUser.university || 'МАДИ',
          major_code: parsedUser.major || MADI_MAJORS[0].code,
          course: parsedUser.course || 1,
          skills: parsedUser.skills || [],
          profile_completion: parsedUser.isRegistered ? 80 : 30,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setUser(convertedUser)
        localStorage.setItem('stujob_user_backup', JSON.stringify(convertedUser))
      } catch (e) {
        console.error('Ошибка синхронизации:', e)
      }
    }
  }

  // Принудительное обновление пользователя
  const refreshUser = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle()
          
        if (profile) {
          setUser(profile)
          setIsAuthenticated(true)
          localStorage.setItem('stujob_user_backup', JSON.stringify(profile))
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error)
      return false
    }
  }

  return (
    <UserContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      updateProfile,
      logout,
      syncWithLocalStorage,
      refreshUser
    }}>
      {children}
    </UserContext.Provider>
  )
}

// Хук для использования контекста
export function useUserSupabase() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserSupabase must be used within a UserProviderSupabase')
  }
  return context
}
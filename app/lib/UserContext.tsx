// app/lib/UserContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { MADI_MAJORS, SKILLS } from './data'

interface User {
  id: string
  name: string
  email: string
  university: string
  major: string
  course: number
  skills: string[]
  resumeUrl?: string
  telegram?: string
  isRegistered: boolean
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  updateProfile: (data: Partial<User>) => void
  logout: () => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Загружаем пользователя из localStorage при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('stujob_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error)
      }
    }
    setIsLoading(false)
  }, [])

  // Сохраняем пользователя в localStorage при изменении
  useEffect(() => {
    if (user) {
      localStorage.setItem('stujob_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('stujob_user')
    }
  }, [user])

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data })
    } else {
      // Создаём нового пользователя
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name || '',
        email: data.email || '',
        university: 'МАДИ',
        major: data.major || MADI_MAJORS[0].code,
        course: data.course || 1,
        skills: data.skills || [],
        isRegistered: true
      }
      setUser(newUser)
    }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, setUser, updateProfile, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

// Хук для использования контекста
export function useUser() {
  const context = useContext(UserContext)
  
  if (context === undefined) {
    // Временное решение: возвращаем mock данные
    console.warn('⚠️ useUser: Контекст не найден, возвращаем mock данные')
    
    // Создаём полный mock контекст
    const mockContext: UserContextType = {
      user: {
        id: 'temp-mock-user',
        name: 'Тестовый Студент',
        email: 'student@madi.ru',
        university: 'МАДИ',
        major: '09.03.02',
        course: 3,
        skills: ['JavaScript', 'React'],
        isRegistered: false
      },
      setUser: () => {
        console.log('Mock: setUser вызван')
      },
      updateProfile: () => {
        console.log('Mock: updateProfile вызван')
      },
      logout: () => {
        console.log('Mock: logout вызван')
      },
      isLoading: false
    }
    
    return mockContext
  }
  
  return context
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useUserSupabase } from '@/app/lib/UserContextSupabase'
import AuthModal from './AuthModal'

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  
  const { user, logout, isAuthenticated } = useUserSupabase()

  const navItems = [
    { href: '/', label: 'Главная' },
    { href: '/vacancies', label: 'Вакансии' },
    { href: '/dashboard', label: 'Личный кабинет' },
    { href: '/about', label: 'О проекте' },
    { href: '/contacts', label: 'Контакты' },
  ]

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    await logout()
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 p-4 z-40">
        <div className="container mx-auto flex justify-between items-center">
          {/* Логотип */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-400 rounded-xl flex items-center justify-center text-white font-bold">
              М
            </div>
            <div>
              <span className="text-xl font-bold block">StuJob</span>
              <span className="text-xs text-gray-400">для МАДИ</span>
            </div>
          </Link>

          {/* Десктопная навигация */}
          <nav className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition ${isActive(item.href) ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Мобильное меню кнопка */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Кнопки авторизации (десктоп) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-400 rounded-full flex items-center justify-center text-sm font-bold">
                    {user.name?.charAt(0) || 'М'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400">Курс {user.course}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition flex items-center gap-2"
                >
                  <LogOut size={16} /> Выйти
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 glass rounded-xl hover:bg-white/10 transition flex items-center gap-2"
                >
                  <User size={18} /> Войти
                </button>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Регистрация
                </button>
              </>
            )}
            
            {/* Кнопка миграции */}
            {user && !isAuthenticated && (
              <Link
                href="/migrate-account"
                className="px-4 py-2 bg-gradient-to-r from-yellow-600/30 to-orange-500/30 border border-yellow-500/30 rounded-xl hover:bg-white/10 transition text-sm"
                title="Привязать к Supabase"
              >
                🔗 Привязать
              </Link>
            )}
          </div>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-2 px-4 rounded-lg transition ${isActive(item.href) ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-white/20 flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="p-3 glass rounded-lg">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="py-2 px-4 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setAuthModalOpen(true)
                        setMobileMenuOpen(false)
                      }}
                      className="py-2 px-4 glass rounded-lg hover:bg-white/10"
                    >
                      Войти
                    </button>
                    <button
                      onClick={() => {
                        setAuthModalOpen(true)
                        setMobileMenuOpen(false)
                      }}
                      className="py-2 px-4 bg-gradient-to-r from-purple-600 to-cyan-400 rounded-lg font-semibold"
                    >
                      Регистрация
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Модальное окно авторизации */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  )
}
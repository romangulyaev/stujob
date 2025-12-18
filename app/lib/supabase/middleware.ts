// app/lib/supabase/middleware.ts (проверенный)
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Получаем пользователя
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Защищенные маршруты (требуют авторизации)
  const protectedRoutes = ['/dashboard', '/profile', '/vacancies']
  
  // Маршруты только для неавторизованных
  const authRoutes = ['/login', '/register']

  const currentPath = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => 
    currentPath.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    currentPath.startsWith(route)
  )

  // === ПРАВИЛА ЗАЩИТЫ МАРШРУТОВ ===

  // 1. Если пользователь НЕ авторизован и пытается попасть на защищенный маршрут
  if (!user && isProtectedRoute) {
    // Перенаправляем на регистрацию с возвратом на текущую страницу
    const redirectUrl = new URL('/register', request.url)
    redirectUrl.searchParams.set('redirect', currentPath)
    return NextResponse.redirect(redirectUrl)
  }
  if (user && isAuthRoute && currentPath !== '/migrate-account') {
    // Перенаправляем в личный кабинет
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  // 2. Если пользователь АВТОРИЗОВАН и пытается попасть на страницы входа/регистрации
  if (user && isAuthRoute) {
    // Перенаправляем в личный кабинет
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Возвращаем ответ (сессия будет обновлена автоматически)
  return response
}
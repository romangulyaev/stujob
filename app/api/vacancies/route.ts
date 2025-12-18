// app/api/vacancies/route.ts
import { NextResponse } from 'next/server'
import { ALL_VACANCIES } from '@/app/lib/data'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const major = searchParams.get('major')
    const format = searchParams.get('format')
    const search = searchParams.get('search')?.toLowerCase()
    const minSalary = searchParams.get('minSalary')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Валидация
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Некорректные параметры пагинации' },
        { status: 400 }
      )
    }

    // ВСЕ 16 вакансий из data.ts
    let filtered = [...ALL_VACANCIES]

    // Фильтр по направлению
    if (major && major !== 'all') {
      filtered = filtered.filter(v => 
        v.major_target?.includes(major)
      )
    }

    // Фильтр по формату
    if (format && format !== 'all') {
      const formatLower = format.toLowerCase()
      filtered = filtered.filter(v => 
        v.format?.toLowerCase().includes(formatLower)
      )
    }

    // Поиск
    if (search) {
      filtered = filtered.filter(v => 
        v.title?.toLowerCase().includes(search) ||
        v.company?.toLowerCase().includes(search)
      )
    }

    // Фильтр по зарплате
    if (minSalary) {
      const minSalaryNum = parseInt(minSalary)
      if (!isNaN(minSalaryNum)) {
        filtered = filtered.filter(v => 
          v.salary_min && v.salary_min >= minSalaryNum
        )
      }
    }

    // Пагинация
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginated = filtered.slice(startIndex, endIndex)

    return NextResponse.json({
      vacancies: paginated,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit),
      hasMore: endIndex < filtered.length,
      limit
    })
  } catch (error) {
    console.error('Error in vacancies API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
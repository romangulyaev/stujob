// app/api/vacancies-new/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Получаем параметры
    const major = searchParams.get('major')
    const format = searchParams.get('format')
    const search = searchParams.get('search')
    const minSalary = searchParams.get('minSalary')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '6')

    // Базовый запрос
    let query = supabase
      .from('vacancies')
      .select(`
        *,
        companies (*)
      `, { count: 'exact' })
      .eq('is_active', true)

    // Фильтры
    if (major && major !== 'all') {
      query = query.contains('major_target', [major])
    }

    if (format && format !== 'all') {
      query = query.eq('format', format)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,companies.name.ilike.%${search}%`)
    }

    if (minSalary) {
      query = query.gte('salary_min', parseInt(minSalary))
    }

    // Пагинация
    const offset = (page - 1) * limit
    const { data: vacancies, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      vacancies: vacancies || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: offset + limit < (count || 0)
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
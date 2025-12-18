// app/api/vacancies/[id]/route.ts (альтернативный вариант)
import { NextResponse } from 'next/server'
import { ALL_VACANCIES } from '@/app/lib/data'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Для Next.js 15+ params это Promise
    const params = await context.params
    const id = params.id
    
    console.log('Запрос вакансии ID:', id)
    
    const vacancy = ALL_VACANCIES.find(v => v.id === id)
    
    if (!vacancy) {
      return NextResponse.json(
        { 
          error: 'Вакансия не найдена',
          requestedId: id,
          availableIds: ALL_VACANCIES.map(v => v.id),
          totalVacancies: ALL_VACANCIES.length
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(vacancy)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    )
  }
}
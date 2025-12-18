// components/VacancyCard.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface VacancyCardProps {
  id: string // ← ДОБАВЬТЕ ЭТО ПОЛЕ
  title: string
  company: string
  salary?: string
  description: string
  requirements: string[]
  format: string
  location?: string
  timeAgo: string
  onApply: () => void
}

export default function VacancyCard({
  id, // ← ДОБАВЬТЕ ЭТО
  title,
  company,
  salary,
  description,
  requirements,
  format,
  location,
  timeAgo,
  onApply
}: VacancyCardProps) {
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    console.log('🎯 Переходим к вакансии:')
    console.log('   ID:', id)
    console.log('   Тип ID:', typeof id)
    console.log('   Название:', title)
    router.push(`/vacancies/${id}`)
  }

  return (
    <div 
      onClick={handleCardClick}
      className="glass rounded-2xl p-6 hover:bg-white/5 transition cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1">{title}</h3>
          <p className="text-cyan-400">{company}</p>
        </div>
        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
          {timeAgo}
        </span>
      </div>
      
      {salary && (
        <div className="mb-4">
          <span className="text-lg font-bold">{salary}</span>
        </div>
      )}
      
      <p className="text-gray-300 mb-4 line-clamp-2">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
          {format}
        </span>
        {location && (
          <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
            {location}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {requirements.slice(0, 3).map((req, index) => (
          <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
            {req}
          </span>
        ))}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation() // Останавливаем всплытие
            onApply()
          }}
          className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Откликнуться
        </button>
        <Link
          href={`/vacancies/${id}`}
          onClick={(e) => e.stopPropagation()}
          className="px-4 py-3 glass rounded-xl hover:bg-white/10 transition flex items-center"
        >
          Подробнее →
        </Link>
      </div>
    </div>
  )
}
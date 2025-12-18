// app/components/StudentForm.tsx
'use client'

import { useState } from 'react'
import { GraduationCap, Mail, User, BookOpen } from 'lucide-react'

export default function StudentForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    university: 'МАДИ',
    major: '09.03.02 - Информационные системы',
    course: 3,
    skills: ['JavaScript', 'React']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Профиль сохранен! Добро пожаловать, ${form.name}!`)
    // Здесь будет отправка на API
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User /> Создайте профиль студента
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-400 mb-2">Имя</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
            placeholder="Иван Иванов"
            required
          />
        </div>

        <div>
          <label className="block text-gray-400 mb-2 flex items-center gap-2">
            <Mail size={16} /> Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
            placeholder="student@madi.ru"
            required
          />
        </div>

        <div>
          <label className="block text-gray-400 mb-2 flex items-center gap-2">
            <GraduationCap size={16} /> ВУЗ
          </label>
          <select
            value={form.university}
            onChange={(e) => setForm({...form, university: e.target.value})}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
          >
            <option value="МАДИ">МАДИ</option>
            <option value="МГТУ">МГТУ</option>
            <option value="МГУ">МГУ</option>
            <option value="МИФИ">МИФИ</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-400 mb-2 flex items-center gap-2">
            <BookOpen size={16} /> Направление
          </label>
          <select
            value={form.major}
            onChange={(e) => setForm({...form, major: e.target.value})}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
          >
            <option value="09.03.02 - Информационные системы">09.03.02 - Информационные системы</option>
            <option value="23.03.01 - Технология транспортных процессов">23.03.01 - Технология транспортных процессов</option>
            <option value="08.03.01 - Строительство">08.03.01 - Строительство</option>
            <option value="27.03.04 - Управление в технических системах">27.03.04 - Управление в технических системах</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-400 mb-2">Курс</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((course) => (
              <button
                key={course}
                type="button"
                onClick={() => setForm({...form, course})}
                className={`flex-1 py-3 rounded-xl ${form.course === course ? 'bg-cyan-600' : 'bg-white/10 hover:bg-white/20'}`}
              >
                {course}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl text-lg font-semibold hover:opacity-90 transition"
        >
          Сохранить профиль и начать поиск
        </button>
      </form>
    </div>
  )
}
// app/contacts/page.tsx
'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'

export default function ContactsPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    type: 'student',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Здесь будет отправка формы
    console.log('Форма отправлена:', form)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setForm({ name: '', email: '', type: 'student', message: '' })
  }

  const contactInfo = [
    {
      icon: <Mail />,
      title: 'Email',
      details: ['support@stujob-madi.ru', 'partners@stujob-madi.ru'],
      description: 'Отвечаем в течение 24 часов'
    },
    {
      icon: <Phone />,
      title: 'Телефон',
      details: ['+7 (495) 123-45-67'],
      description: 'Пн-Пт с 10:00 до 18:00'
    },
    {
      icon: <MapPin />,
      title: 'Адрес',
      details: ['Москва, Ленинградский проспект, 64', 'МАДИ, корпус 1, ауд. 210'],
      description: 'Карьерный центр МАДИ'
    },
    {
      icon: <Clock />,
      title: 'Часы работы',
      details: ['Понедельник - Пятница: 9:00 - 18:00', 'Суббота: 10:00 - 15:00'],
      description: 'Воскресенье - выходной'
    }
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Контакты <span className="text-cyan-400">StuJob</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Свяжитесь с нами по любым вопросам: от помощи в поиске стажировки до сотрудничества с компаниями
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Контактная информация */}
          <div>
            <h2 className="text-3xl font-bold mb-8">📞 Как с нами связаться</h2>
            
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="glass rounded-2xl p-6 hover:glow-primary transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-400 rounded-xl flex items-center justify-center">
                      <div className="text-white">{info.icon}</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{info.title}</h3>
                      <div className="space-y-1">
                        {info.details.map((detail, i) => (
                          <p key={i} className="text-gray-300">{detail}</p>
                        ))}
                      </div>
                      <p className="text-gray-400 mt-2">{info.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Социальные сети */}
            <div className="glass rounded-2xl p-6 mt-8">
              <h3 className="text-xl font-bold mb-4">🌐 Мы в социальных сетях</h3>
              <div className="flex gap-4">
                {[
                  { name: 'Telegram', color: 'bg-blue-500', link: 'https://t.me/stujob_madi' },
                  { name: 'VK', color: 'bg-blue-600', link: 'https://vk.com/stujob_madi' },
                  { name: 'YouTube', color: 'bg-red-600', link: '#' }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.color} text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition`}
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Форма обратной связи */}
          <div>
            <div className="glass rounded-2xl p-8 sticky top-24">
              <h2 className="text-3xl font-bold mb-6">✉️ Напишите нам</h2>
              
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Сообщение отправлено!</h3>
                  <p className="text-gray-400">Мы свяжемся с вами в ближайшее время</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-400 mb-2">Ваше имя</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full glass px-4 py-3 rounded-xl"
                      placeholder="Иван Иванов"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      className="w-full glass px-4 py-3 rounded-xl"
                      placeholder="example@madi.ru"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2">Вы</label>
                    <div className="flex gap-4">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="student"
                          checked={form.type === 'student'}
                          onChange={(e) => setForm({...form, type: e.target.value})}
                          className="sr-only"
                        />
                        <div className={`p-4 rounded-xl text-center ${form.type === 'student' ? 'bg-cyan-500/30 border border-cyan-500/50' : 'glass hover:bg-white/10'}`}>
                          👨‍🎓 Студент
                        </div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="company"
                          checked={form.type === 'company'}
                          onChange={(e) => setForm({...form, type: e.target.value})}
                          className="sr-only"
                        />
                        <div className={`p-4 rounded-xl text-center ${form.type === 'company' ? 'bg-purple-500/30 border border-purple-500/50' : 'glass hover:bg-white/10'}`}>
                          🏢 Компания
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2">Сообщение</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({...form, message: e.target.value})}
                      className="w-full glass px-4 py-3 rounded-xl min-h-[150px]"
                      placeholder="Опишите ваш вопрос или предложение..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
                  >
                    <Send size={20} /> Отправить сообщение
                  </button>

                  <p className="text-center text-gray-500 text-sm">
                    Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Карта */}
        <div className="glass rounded-2xl p-8 mt-16">
          <h2 className="text-3xl font-bold mb-6">📍 Мы находимся в МАДИ</h2>
          <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-xl font-bold">Московский автомобильно-дорожный государственный технический университет</p>
              <p className="text-gray-400 mt-2">Ленинградский проспект, 64, Москва</p>
              <div className="mt-6 flex gap-4 justify-center">
                <a 
                  href="https://yandex.ru/maps/-/CDqVJNci" 
                  target="_blank"
                  className="px-6 py-3 glass rounded-xl hover:bg-white/10 transition"
                >
                  Яндекс.Карты
                </a>
                <a 
                  href="https://www.google.com/maps?q=мади" 
                  target="_blank"
                  className="px-6 py-3 glass rounded-xl hover:bg-white/10 transition"
                >
                  Google Карты
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
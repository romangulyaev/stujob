// app/about/page.tsx
import { Users, Target, Award, Heart, Rocket, GraduationCap } from 'lucide-react'

export default function AboutPage() {
  const features = [
    {
      icon: <Target />,
      title: 'Миссия',
      description: 'Помогаем студентам МАДИ находить стажировки и работу по специальности ещё во время учёбы.'
    },
    {
      icon: <Users />,
      title: 'Для студентов',
      description: 'Персонализированный подбор вакансий под ваше направление, курс и навыки.'
    },
    {
      icon: <Award />,
      title: 'Для компаний',
      description: 'Прямой доступ к талантливым студентам технических специальностей.'
    },
    {
      icon: <Heart />,
      title: 'Бесплатно',
      description: 'Полностью бесплатно для студентов. Развиваем сообщество МАДИ.'
    }
  ]

  const team = [
    { name: 'Команда StuJob', role: 'Студенты МАДИ', desc: '09.03.02 - Информационные системы' },
    { name: 'Карьерный центр МАДИ', role: 'Партнёр', desc: 'Официальная поддержка' },
    { name: 'Выпускники МАДИ', role: 'Менторы', desc: 'Помощь в трудоустройстве' }
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Герой */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            О проекте <span className="text-cyan-400">StuJob</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Специализированная платформа для поиска стажировок и работы для студентов 
            Московского автомобильно-дорожного государственного технического университета
          </p>
        </div>

        {/* История */}
        <div className="glass rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6">📖 Наша история</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              StuJob родился как студенческий проект в рамках дисциплины "Технологии разработки интернет-приложений" 
              на факультете информационных систем и технологий МАДИ.
            </p>
            <p>
              Мы сами столкнулись с проблемой поиска стажировок, которые соответствовали бы нашему направлению обучения 
              и учитывали специфику транспортно-дорожного комплекса.
            </p>
            <p>
              В 2025 году проект прошёл в финал конкурса "Я в деле" Федеральной программы по развитию молодёжного предпринимательства.
            </p>
            <p className="text-cyan-400 font-semibold">
              Наша цель — чтобы каждый студент МАДИ нашёл работу мечты ещё до выпуска.
            </p>
          </div>
        </div>

        {/* Особенности */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-10 text-center">✨ Что делает StuJob уникальным</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="glass rounded-2xl p-6 text-center hover:glow-primary transition">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-400 rounded-2xl mb-4">
                  <div className="text-2xl">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Команда */}
        <div className="glass rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold mb-8">👥 Кто стоит за проектом</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-600 to-cyan-400 rounded-2xl flex items-center justify-center text-3xl mb-4">
                  {index === 0 ? '🚀' : index === 1 ? '🎓' : '💼'}
                </div>
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-cyan-400 mb-2">{member.role}</p>
                <p className="text-gray-400">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Статистика */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-8">📊 StuJob в цифрах</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">22</div>
              <div className="text-gray-400">Направления МАДИ</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-gray-400">Компаний-партнёров</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">156</div>
              <div className="text-gray-400">Активных вакансий</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">100%</div>
              <div className="text-gray-400">Бесплатно для студентов</div>
            </div>
          </div>
        </div>

        {/* Призыв к действию */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 text-2xl font-bold mb-6">
            <Rocket className="text-cyan-400" />
            Присоединяйтесь к StuJob!
          </div>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Независимо от того, ищете ли вы стажировку или хотите предложить вакансию — 
            StuJob создан для вас.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register" 
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold"
            >
              Зарегистрироваться как студент
            </a>
            <a 
              href="/contacts" 
              className="px-8 py-3 glass rounded-xl font-semibold hover:bg-white/10"
            >
              Стать партнёром
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
// app/admin/supabase-check/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { Loader2, Database, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

type TableInfo = {
  name: string
  columns: string[]
  rowCount: number
  rlsEnabled: boolean
  exists: boolean
}

type ConnectionInfo = {
  url: string
  anonKey: string
  connected: boolean
}

export default function SupabaseCheckPage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [connection, setConnection] = useState<ConnectionInfo>({
    url: '',
    anonKey: '',
    connected: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'tables' | 'connection' | 'data'>('tables')

  const supabase = createClient()

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    try {
      setLoading(true)
      
      // Проверяем подключение
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Не задан'
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
        ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` 
        : 'Не задан'
      
      // Проверяем базовое подключение
      const { data: sessionData } = await supabase.auth.getSession()
      const connected = !!sessionData.session

      setConnection({
        url,
        anonKey,
        connected
      })

      // Проверяем таблицы
      const tableNames = ['vacancies', 'companies', 'students', 'favorites', 'applications']
      const results: TableInfo[] = []

      for (const tableName of tableNames) {
        try {
          // Пробуем сделать простой запрос
          const { data, error: tableError, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
            .limit(1)

          if (tableError) {
            // Таблица не существует или нет доступа
            results.push({
              name: tableName,
              columns: [],
              rowCount: 0,
              rlsEnabled: false,
              exists: false
            })
            continue
          }

          // Таблица существует, получаем одну запись для определения колонок
          const { data: sampleData } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
            .maybeSingle() // Используем maybeSingle чтобы не падать если нет данных

          const columns = sampleData ? Object.keys(sampleData) : ['Нет данных для определения колонок']

          // Проверяем RLS через попытку вставки (только для непустых таблиц)
          let rlsEnabled = false
          if (tableName === 'students' || tableName === 'favorites' || tableName === 'applications') {
            // Для этих таблиц проверяем RLS через SELECT политики
            try {
              // Пробуем вставить тестовые данные (они должны быть отброшены RLS если нет прав)
              const testData: any = { test_field: 'test_value' }
              
              // Добавляем обязательные поля если они есть в таблице
              if (tableName === 'students') {
                testData.user_id = 'test_user_id_' + Date.now()
                testData.email = 'test@test.com'
              }
              
              if (tableName === 'favorites' || tableName === 'applications') {
                testData.student_id = 'test_student_id'
                testData.vacancy_id = 'test_vacancy_id'
              }

              const { error: insertError } = await supabase
                .from(tableName)
                .insert([testData])
                .select()

              // Если ошибка содержит RLS - значит политики включены
              if (insertError?.message?.includes('row-level security') || 
                  insertError?.message?.includes('violates row level security')) {
                rlsEnabled = true
              } else if (!insertError) {
                // Если вставка прошла успешно - RLS выключены или у нас есть права
                rlsEnabled = false
                // Удаляем тестовую запись
                await supabase
                  .from(tableName)
                  .delete()
                  .eq('test_field', 'test_value')
              }
            } catch (rlserr) {
              // В случае ошибки считаем что RLS включены
              rlsEnabled = true
            }
          }

          results.push({
            name: tableName,
            columns,
            rowCount: count || 0,
            rlsEnabled,
            exists: true
          })

        } catch (tableError: any) {
          results.push({
            name: tableName,
            columns: [`Ошибка: ${tableError.message}`],
            rowCount: 0,
            rlsEnabled: false,
            exists: false
          })
        }
      }

      setTables(results)
      setError('')

    } catch (err: any) {
      setError(`Ошибка проверки: ${err.message}`)
      console.error('Ошибка проверки БД:', err)
    } finally {
      setLoading(false)
    }
  }

  // Функция для добавления демо-данных
  const addDemoData = async (tableName: string) => {
    try {
      if (tableName === 'companies') {
        const { error } = await supabase
          .from('companies')
          .insert([
            {
              name: 'Яндекс',
              description: 'Крупнейшая IT-компания России',
              website: 'https://yandex.ru',
              logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Yandex_icon.svg/1200px-Yandex_icon.svg.png'
            },
            {
              name: 'Сбер',
              description: 'Крупнейший банк России',
              website: 'https://sber.ru',
              logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sberbank_Logo_2020.svg/2560px-Sberbank_Logo_2020.svg.png'
            },
            {
              name: 'Газпром',
              description: 'Государственная газовая компания',
              website: 'https://gazprom.ru',
              logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Gazprom-Logo.svg/2560px-Gazprom-Logo.svg.png'
            }
          ])

        if (error) throw error
        alert('✅ Демо-компании добавлены!')
      }

      if (tableName === 'vacancies') {
        // Сначала убедимся что есть компании
        const { data: companies } = await supabase
          .from('companies')
          .select('id')
          .limit(1)

        if (!companies || companies.length === 0) {
          alert('❌ Сначала добавьте компании!')
          return
        }

        const companyId = companies[0].id

        const { error } = await supabase
          .from('vacancies')
          .insert([
            {
              title: 'Frontend-разработчик (React)',
              company_id: companyId,
              description: 'Разработка интерфейсов для внутренних сервисов. Работа в команде с опытными разработчиками.',
              salary_min: 80000,
              salary_max: 120000,
              format: 'Удалённо',
              location: 'Москва',
              requirements: ['React', 'TypeScript', 'JavaScript', 'HTML/CSS'],
              major_target: ['09.03.02'],
              is_active: true
            },
            {
              title: 'Инженер-проектировщик автодорог',
              company_id: companyId,
              description: 'Проектирование автомобильных дорог и транспортных развязок.',
              salary_min: 70000,
              salary_max: 100000,
              format: 'Офис',
              location: 'Москва',
              requirements: ['AutoCAD', 'СНиП', 'Черчение'],
              major_target: ['08.03.01'],
              is_active: true
            }
          ])

        if (error) throw error
        alert('✅ Демо-вакансии добавлены!')
      }

      // Обновляем данные
      await checkDatabase()
    } catch (err: any) {
      alert(`❌ Ошибка: ${err.message}`)
    }
  }

  // Функция для просмотра данных таблицы
  const viewTableData = async (tableName: string) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(10)

      if (error) throw error
      
      setActiveTab('data')
      alert(`Данные таблицы ${tableName}:\n\n${JSON.stringify(data, null, 2)}`)
    } catch (err: any) {
      alert(`❌ Ошибка загрузки данных: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Database className="w-12 h-12 text-cyan-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Проверка Supabase</h1>
          </div>
          <p className="text-gray-400">Диагностика подключения и структуры базы данных</p>
        </div>

        {/* Карточки статуса */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className={`w-8 h-8 ${connection.connected ? 'text-green-400' : 'text-red-400'}`} />
              <h3 className="text-xl font-bold">Подключение</h3>
            </div>
            <p className={connection.connected ? 'text-green-400' : 'text-red-400'}>
              {connection.connected ? '✅ Активно' : '❌ Не активно'}
            </p>
            <p className="text-sm text-gray-400 mt-2 break-all">
              URL: {connection.url}
            </p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-purple-400" />
              <h3 className="text-xl font-bold">RLS Политики</h3>
            </div>
            <p className="text-gray-400">
              {tables.filter(t => t.exists && t.rlsEnabled).length} из {tables.filter(t => t.exists).length} таблиц
            </p>
            <p className="text-sm text-gray-400 mt-2">С RLS защитой</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-400" />
              <h3 className="text-xl font-bold">Статус</h3>
            </div>
            <p className={error ? 'text-red-400' : 'text-green-400'}>
              {error ? '❌ Есть ошибки' : '✅ Всё в порядке'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {tables.filter(t => t.exists).length} таблиц доступно
            </p>
          </div>
        </div>

        {/* Табы */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-6 py-3 font-medium ${activeTab === 'tables' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            Таблицы
          </button>
          <button
            onClick={() => setActiveTab('connection')}
            className={`px-6 py-3 font-medium ${activeTab === 'connection' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            Подключение
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-6 py-3 font-medium ${activeTab === 'data' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            Данные
          </button>
        </div>

        {/* Контент табов */}
        {activeTab === 'tables' && (
          <div className="glass rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Таблицы базы данных</h2>
              <button
                onClick={checkDatabase}
                disabled={loading}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔄 Обновить'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-cyan-400 mb-4" />
                <p className="text-gray-400">Проверяем базу данных...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <XCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={checkDatabase}
                  className="px-6 py-3 glass rounded-xl hover:bg-white/10"
                >
                  Попробовать снова
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {tables.map((table) => (
                  <div key={table.name} className="border border-white/10 rounded-xl p-5 hover:border-cyan-500/30 transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          {table.exists ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          {table.name}
                          <span className="text-sm text-gray-400 font-normal">
                            ({table.rowCount} записей)
                          </span>
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs ${table.exists ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {table.exists ? 'Существует' : 'Не найдена'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs ${table.rlsEnabled ? 'bg-purple-500/20 text-purple-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            RLS: {table.rlsEnabled ? 'ВКЛ' : 'ВЫКЛ'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {table.exists && (
                          <>
                            <button
                              onClick={() => viewTableData(table.name)}
                              className="px-4 py-2 glass rounded-xl hover:bg-white/10 text-sm"
                            >
                              Просмотр
                            </button>
                            {(table.name === 'companies' || table.name === 'vacancies') && table.rowCount === 0 && (
                              <button
                                onClick={() => addDemoData(table.name)}
                                className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 text-sm"
                              >
                                + Демо-данные
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {table.exists && table.columns.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Колонки:</p>
                        <div className="flex flex-wrap gap-2">
                          {table.columns.slice(0, 10).map((col, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white/10 rounded-lg text-xs">
                              {col}
                            </span>
                          ))}
                          {table.columns.length > 10 && (
                            <span className="px-3 py-1 bg-white/5 rounded-lg text-xs">
                              +{table.columns.length - 10} ещё
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {!table.exists && (
                      <p className="text-gray-400 text-sm">
                        Таблица не существует в базе данных или нет прав доступа
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'connection' && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">Информация о подключении</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-2">Переменные окружения</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">NEXT_PUBLIC_SUPABASE_URL</p>
                    <div className="glass px-4 py-3 rounded-xl font-mono text-sm break-all">
                      {connection.url}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
                    <div className="glass px-4 py-3 rounded-xl font-mono text-sm break-all">
                      {connection.anonKey}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Тест подключения</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={checkDatabase}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold"
                  >
                    Проверить подключение
                  </button>
                  <div>
                    <p className={connection.connected ? 'text-green-400' : 'text-red-400'}>
                      {connection.connected ? '✅ Подключение активно' : '❌ Нет подключения'}
                    </p>
                    <p className="text-sm text-gray-400">Проверено: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Инструкция по настройке</h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-400">
                  <li>Зайдите на <a href="https://supabase.com/dashboard" className="text-cyan-400 hover:underline" target="_blank">Supabase Dashboard</a></li>
                  <li>Создайте новый проект или откройте существующий</li>
                  <li>В настройках проекта найдите раздел "API"</li>
                  <li>Скопируйте URL и anon key в файл .env.local</li>
                  <li>Перезапустите приложение</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">Просмотр данных</h2>
            <p className="text-gray-400 mb-6">
              Выберите таблицу для просмотра данных (максимум 10 записей)
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {tables.filter(t => t.exists).map((table) => (
                <button
                  key={table.name}
                  onClick={() => viewTableData(table.name)}
                  className="p-4 glass rounded-xl hover:bg-white/10 transition text-center"
                >
                  <div className="font-bold mb-1">{table.name}</div>
                  <div className="text-sm text-gray-400">{table.rowCount} записей</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Инструкция */}
        <div className="mt-8 glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">📋 Что делать если есть проблемы:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="font-bold mb-2">Таблицы не найдены</h4>
              <p className="text-sm text-gray-400">Создайте таблицы через SQL Editor в Supabase Dashboard</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="font-bold mb-2">Нет подключения</h4>
              <p className="text-sm text-gray-400">Проверьте .env.local файл и перезапустите dev сервер</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
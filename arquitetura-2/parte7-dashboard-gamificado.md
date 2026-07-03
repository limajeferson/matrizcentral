Sidebar do Usuário
┌─────────────────────────────────────────┐
│     SEU PROGRESSO                       │
├─────────────────────────────────────────┤
│                                         │
│ Nível 3: 🎯 Praticante                 │
│ ━━━━━━━━━━━━━━━━━━━                    │
│ 380/1200 XP para Nível 4                │
│                                         │
│ Badges: 7 conquistados                 │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐              │
│ │🧠│ │📖│ │✅│ │🔥│ │⭐│              │
│ └──┘ └──┘ └──┘ └──┘ └──┘              │
│ [Próximos: 🥇 🎓]                      │
│                                         │
│ 🔥 Streak: 8 dias                      │
│ (Continue para 🏆 Fogo Semanal!)       │
│                                         │
│ 📊 Ranking                             │
│ Sua Posição: #42 global                │
│ [Ver leaderboard ↗]                    │
│                                         │
│ 🎯 Próximos Desafios                   │
│ ├─ ⭐ Diário: Complete 2 Quizzes       │
│ │  Progress: 1/2 ✓                     │
│ │                                      │
│ ├─ 🥇 Semanal: Leia 2 Ebooks           │
│ │  Progress: 1/2 (XP: 200)             │
│ │                                      │
│ └─ 🏆 Mensal: Jornada Completa         │
│    Progress: 4/6 (XP: 500)             │
│                                         │
│ 📜 Certificados                        │
│ ✅ LLM Local Setup (Dec 15)            │
│ ✅ Claude Code Python (Dec 22)        │
│ [Baixar | Compartilhar]                │
│                                         │
└─────────────────────────────────────────┘
___
```
Componente React (Dashboard)
// components/UserProgress.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function UserProgress({ userId, token }) {
  const [data, setData] = useState({
    xp: 0,
    level: 1,
    badges: [],
    streak: 0,
    ranking: 0,
    certificates: [],
    challenges: []
  })

  useEffect(() => {
    loadProgressData()
  }, [userId])

  const loadProgressData = async () => {
    // 1. XP + Level
    const { data: userData } = await supabase
      .from('users')
      .select('total_xp, current_level, study_streak, badges')
      .eq('id', userId)
      .single()

    // 2. Badges
    const { data: badgesData } = await supabase
      .from('badges_earned')
      .select('*, badge:badge_id(*)')
      .eq('user_id', userId)

    // 3. Ranking
    const { data: rankingData } = await supabase
      .from('leaderboard')
      .select('rank_all_time')
      .eq('user_id', userId)
      .single()

    // 4. Certificados
    const { data: certificatesData } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false })

    // 5. Desafios
    const { data: challengesData } = await supabase
      .from('challenges_progress')
      .select('*, challenge:challenge_id(*)')
      .eq('user_id', userId)
      .eq('is_completed', false)

    setData({
      xp: userData.total_xp,
      level: userData.current_level,
      badges: badgesData.map(b => b.badge),
      streak: userData.study_streak,
      ranking: rankingData.rank_all_time,
      certificates: certificatesData,
      challenges: challengesData.map(c => c.challenge)
    })
  }

  const xpToNextLevel = getXpToNextLevel(data.level, data.xp)
  const progressPercent = (data.xp / (xpToNextLevel + data.xp)) * 100

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      {/* LEVEL + XP */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">
            Nível {data.level}: {getLevelName(data.level)}
          </h3>
          <span className="text-sm text-gray-600">{data.xp} XP total</span>
        </div>
        
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          >
            <span className="absolute right-2 top-1 text-white text-xs font-bold">
              {data.xp % 1000} / {xpToNextLevel}
            </span>
          </div>
        </div>
      </div>

      {/* STREAK */}
      <div className="mb-6 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
        <p className="text-sm font-semibold">
          🔥 Streak: {data.streak} dias
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {data.streak === 7 && '✨ Você desbloqueou: Fogo Semanal!'}
          {data.streak === 30 && '✨ Você desbloqueou: Maratonista!'}
          {data.streak < 7 && `${7 - data.streak} dias para Fogo Semanal`}
        </p>
      </div>

      {/* BADGES */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Badges Conquistadas ({data.badges.length})</h4>
        <div className="flex flex-wrap gap-2">
          {data.badges.map(badge => (
            <div
              key={badge.id}
              className="group relative"
              title={badge.name}
            >
              <span className="text-3xl cursor-pointer hover:scale-110 transition">
                {badge.icon}
              </span>
              
              {/* Tooltip */}
              <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                {badge.name}
                <br />
                <span className="text-orange-400">+{badge.xp_reward} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RANKING */}
      <div className="mb-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm font-semibold">
          📊 Ranking Global: <span className="text-blue-600">#{data.ranking}</span>
        </p>
        <button className="text-xs text-blue-600 mt-1 hover:underline">
          Ver leaderboard completo →
        </button>
      </div>

      {/* DESAFIOS ATIVOS */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Desafios Ativos</h4>
        {data.challenges.map(challenge => (
          <div key={challenge.id} className="mb-3 p-2 bg-gray-50 rounded">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold">{challenge.title}</p>
                <p className="text-xs text-gray-600">{challenge.description}</p>
              </div>
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                +{challenge.xp_reward} XP
              </span>
            </div>
            
            {/* Progresso */}
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${challenge.progress_percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {challenge.progress_percentage}% completo
            </p>
          </div>
        ))}
      </div>

      {/* CERTIFICADOS */}
      <div>
        <h4 className="font-semibold mb-2">Certificados ({data.certificates.length})</h4>
        {data.certificates.length === 0 ? (
          <p className="text-sm text-gray-600">
            Complete um ebook e seu quiz para ganhar certificados!
          </p>
        ) : (
          data.certificates.map(cert => (
            <div key={cert.id} className="p-2 bg-green-50 rounded mb-2 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold">✅ {cert.title}</p>
                <p className="text-xs text-gray-600">{formatDate(cert.issued_at)}</p>
              </div>
              <div className="flex gap-1">
                <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                  Baixar
                </button>
                <button className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                  Compartilhar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```
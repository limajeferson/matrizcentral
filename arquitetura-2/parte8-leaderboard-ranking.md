// pages/leaderboard.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [tab, setTab] = useState('all_time') // all_time | weekly | monthly

  useEffect(() => {
    loadLeaderboard()
  }, [tab])

  const loadLeaderboard = async () => {
    const column = tab === 'weekly' ? 'rank_weekly' : 'rank_all_time'
    const xpColumn = tab === 'weekly' ? 'week_xp' : 'total_xp'

    const { data } = await supabase
      .from('leaderboard')
      .select('*, user:user_id(*, profile:profiles(name))')
      .order(xpColumn, { ascending: false })
      .limit(100)

    setLeaderboard(data)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🏆 Leaderboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('all_time')}
          className={`px-4 py-2 rounded ${
            tab === 'all_time'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200'
          }`}
        >
          Todos os Tempos
        </button>
        <button
          onClick={() => setTab('weekly')}
          className={`px-4 py-2 rounded ${
            tab === 'weekly'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200'
          }`}
        >
          Esta Semana
        </button>
      </div>

      {/* Ranking Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">#</th>
              <th className="px-4 py-3 text-left font-semibold">Usuário</th>
              <th className="px-4 py-3 text-left font-semibold">Level</th>
              <th className="px-4 py-3 text-right font-semibold">XP</th>
              <th className="px-4 py-3 text-right font-semibold">Badges</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, idx) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="text-lg font-bold">
                    {idx === 0 && '🥇'}
                    {idx === 1 && '🥈'}
                    {idx === 2 && '🥉'}
                    {idx > 2 && `#${idx + 1}`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold">{user.user.profile.name}</p>
                    <p className="text-xs text-gray-600">@{user.user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold">Level {user.level}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    {tab === 'weekly' ? user.week_xp : user.total_xp}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {user.badges_count} 🎖️
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sua Posição */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <p className="text-sm">
          <span className="font-semibold">Sua Posição:</span> #42 Global | 1,250 XP
        </p>
      </div>
    </div>
  )
}
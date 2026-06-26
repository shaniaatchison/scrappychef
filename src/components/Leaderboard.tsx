import React, { useEffect, useState } from 'react'
import { getLeaderboard } from '../lib/recipeEngine'

interface LeaderboardEntry {
  scrappy_score: number
  total_money_saved: number
  profiles: {
    username: string
    avatar_url: string
  }
}

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await getLeaderboard()
        setEntries(data as any)
      } catch (err) {
        console.error('Error loading leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLeaderboard()
  }, [])

  if (loading) return <div className="p-4 text-center">Loading Hall of Fame...</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🏆</span>
        <h1 className="text-2xl font-bold">Scrappy Hall of Fame</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="grid grid-cols-[3rem_1fr_6rem_6rem] gap-4 p-4 bg-emerald-50 text-emerald-800 font-semibold text-sm">
          <div>Rank</div>
          <div>Scrapper</div>
          <div className="text-right">Score</div>
          <div className="text-right">Saved</div>
        </div>

        {entries.map((entry, index) => (
          <div 
            key={index} 
            className={`grid grid-cols-[3rem_1fr_6rem_6rem] gap-4 p-4 border-t items-center ${
              index === 0 ? 'bg-amber-50' : ''
            }`}
          >
            <div className="font-bold text-gray-500">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
            </div>
            <div className="flex items-center gap-3">
              <img 
                src={entry.profiles.avatar_url || `https://ui-avatars.com/api/?name=${entry.profiles.username}`}
                alt=""
                className="w-8 h-8 rounded-full border bg-gray-100"
              />
              <span className="font-medium truncate">{entry.profiles.username || 'Anonymous Scrapper'}</span>
            </div>
            <div className="text-right font-bold text-emerald-600">
              {entry.scrappy_score}
            </div>
            <div className="text-right text-gray-600">
              ${entry.total_money_saved.toFixed(2)}
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No scrappers yet. Be the first!
          </div>
        )}
      </div>
    </div>
  )
}

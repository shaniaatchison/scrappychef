import { useState, useEffect } from 'react'
import { getStats, getProfile } from '../lib/recipeEngine'
import { PiggyBank, Leaf, ChefHat, Award, Star } from 'lucide-react'
import { ShareCard } from './ShareCard'
import confetti from 'canvas-confetti'

export default function StatsDisplay() {
  const [stats, setStats] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentRank, setCurrentRank] = useState<string>('')

  const getRank = (meals: number) => {
    if (meals >= 10) return 'Scrappy Pro'
    if (meals >= 5) return 'Kitchen Hero'
    return 'Scrappy Scout'
  }

  useEffect(() => {
    loadData()
    
    const handleRefresh = () => loadData()
    window.addEventListener('refresh-stats', handleRefresh)
    return () => window.removeEventListener('refresh-stats', handleRefresh)
  }, [])

  useEffect(() => {
    if (stats) {
      const newRank = getRank(stats.recipes_cooked_count)
      const rankLevels: Record<string, number> = {
        'Scrappy Scout': 0,
        'Kitchen Hero': 1,
        'Scrappy Pro': 2
      }
      
      const lastCelebrated = localStorage.getItem('scrappy_last_celebrated_rank') || 'Scrappy Scout'
      
      if (rankLevels[newRank] > rankLevels[lastCelebrated]) {
        fireConfetti()
        localStorage.setItem('scrappy_last_celebrated_rank', newRank)
      }
      
      setCurrentRank(newRank)
    }
  }, [stats?.recipes_cooked_count])

  const fireConfetti = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)
  }

  async function loadData() {
    try {
      const [statsData, profileData] = await Promise.all([
        getStats(),
        getProfile()
      ])
      setStats(statsData)
      setProfile(profileData)
    } catch (error: any) {
      console.error('Error loading stats:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) return null

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-green-200 transition-all">
          <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mb-2">
            <PiggyBank size={20} />
          </div>
          <span className="text-xl font-black text-gray-900">${stats.total_money_saved.toFixed(2)}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Money Saved</span>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-orange-200 transition-all">
          <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-2">
            <Leaf size={20} />
          </div>
          <span className="text-xl font-black text-gray-900">{stats.total_lbs_waste_avoided.toFixed(1)} lbs</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waste Avoided</span>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-blue-200 transition-all col-span-2 flex-row justify-around py-6">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-2">
              <Star size={20} />
            </div>
            <span className="text-3xl font-black text-emerald-600">{stats.scrappy_score || 0}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scrappy Score</span>
          </div>

          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 transition-colors ${
              currentRank === 'Scrappy Pro' ? 'bg-amber-100 text-amber-600' : 
              currentRank === 'Kitchen Hero' ? 'bg-blue-100 text-blue-600' : 'bg-orange-50 text-orange-500'
            }`}>
              <Award size={20} />
            </div>
            <span className={`text-2xl font-black transition-colors ${
              currentRank === 'Scrappy Pro' ? 'text-amber-600' : 
              currentRank === 'Kitchen Hero' ? 'text-blue-600' : 'text-gray-900'
            }`}>{currentRank}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Rank</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 mb-2">
              <ChefHat size={20} />
            </div>
            <span className="text-3xl font-black text-gray-900">{stats.recipes_cooked_count}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Meals Cooked</span>
          </div>
        </div>
      </div>

      <ShareCard 
        username={profile?.username || 'Scrapper'}
        score={stats.scrappy_score || 0}
        moneySaved={stats.total_money_saved}
        lbsDiverted={stats.total_lbs_waste_avoided}
        streak={stats.consecutive_days_streak || 0}
        mealsCooked={stats.recipes_cooked_count}
        referralCode={profile?.referral_code || ''}
        rank={currentRank}
      />
    </div>
  )
}

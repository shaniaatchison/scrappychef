import { useState, useEffect } from 'react'
import { getProfile, updateProfile, claimReferral, getUserTier } from '../lib/recipeEngine'
import { Bell, CreditCard, User, LogOut, Loader2, Trophy, Gift, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [claiming, setClaiming] = useState(false)
  const [userTier, setUserTier] = useState<{ tier: string; isBetaTester: boolean }>({ tier: 'free', isBetaTester: false })
  const navigate = useNavigate()

  useEffect(() => {
    loadProfile()
    loadTier()
  }, [])

  async function loadTier() {
    try {
      const info = await getUserTier()
      setUserTier(info)
    } catch (e) {
      console.error(e)
    }
  }

  async function loadProfile() {
    try {
      const data = await getProfile()
      setProfile(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleClaimReferral() {
    if (!referralCode) return
    setClaiming(true)
    try {
      await claimReferral(referralCode)
      alert('Referral bonus claimed! +25 points awarded.')
      loadProfile()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setClaiming(false)
      setReferralCode('')
    }
  }

  async function toggleNotifications() {
    try {
      setSaving(true)
      const newValue = !profile.notifications_enabled
      await updateProfile({ notifications_enabled: newValue })
      setProfile({ ...profile, notifications_enabled: newValue })
      if (newValue) {
        alert('Expiring-soon alerts enabled! (Mock push notification)')
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpgrade() {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session')
      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (e: any) {
      alert('Error creating checkout session: ' + e.message)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
          <User size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">{profile?.email?.split('@')[0]}</h2>
          <p className="text-gray-500 text-sm">{profile?.email}</p>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black uppercase">
            {profile?.is_premium ? 'Premium Member' : 'Free Member'}
          </div>
          {userTier.isBetaTester && (
            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase">
              <Star size={10} />
              Beta Tester
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest px-1">Community</h3>
        
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <button 
            onClick={() => navigate('/leaderboard')}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                <Trophy size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Hall of Fame</p>
                <p className="text-xs text-gray-400">See top scrappers worldwide</p>
              </div>
            </div>
            <div className="text-gray-300">→</div>
          </button>

          <div className="h-px bg-gray-50 mx-6" />

          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center">
                <Gift size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Refer a Friend</p>
                <p className="text-xs text-gray-400">Get +50 points per signup</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Friend's Code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-pink-200 outline-none"
              />
              <button 
                onClick={handleClaimReferral}
                disabled={claiming || !referralCode}
                className="bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
              >
                {claiming ? '...' : 'Claim'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest px-1">Settings</h3>
        
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Expiring Alerts</p>
                <p className="text-xs text-gray-400">Notify me when food is about to rot</p>
              </div>
            </div>
            <button 
              onClick={toggleNotifications}
              disabled={saving}
              className={`w-12 h-6 rounded-full transition-colors relative ${profile?.notifications_enabled ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile?.notifications_enabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="h-px bg-gray-50 mx-6" />

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Subscription</p>
                <p className="text-xs text-gray-400">{profile?.is_premium ? 'Pro plan active' : 'Basic plan'}</p>
              </div>
            </div>
            {!profile?.is_premium && (
                  <button 
                    onClick={handleUpgrade}
                    className="text-orange-500 font-bold text-sm"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            {!profile?.is_premium && (
              <p className="px-6 pb-6 text-[9px] text-gray-400 leading-tight">
                🤖 AI-generated recipes are for inspiration only. Always inspect ingredients for freshness and check for allergens before cooking.
              </p>
            )}
            </div>
            </div>

      <button 
        onClick={() => supabase.auth.signOut()}
        className="w-full py-4 border-2 border-red-50 text-red-500 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
      >
        <LogOut size={20} />
        Sign Out
      </button>

      <div className="text-center">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">ScrappyChef v1.0.0</p>
      </div>
    </div>
  )
}

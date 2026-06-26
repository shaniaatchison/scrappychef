import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Bell, AlertTriangle, X, Check, Lock } from 'lucide-react'

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [alerts, setAlerts] = useState<any[]>([])
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    fetchProfileAndAlerts()
  }, [])

  async function fetchProfileAndAlerts() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single()

    setIsPremium(profile?.is_premium || false)
    
    if (profile?.is_premium) {
      await fetchExpiringItems(user.id)
    }
  }

  async function fetchExpiringItems(userId: string) {
    const { data } = await supabase
      .from('user_pantries')
      .select('id, custom_name, expiration_date, ingredients(name)')
      .eq('user_id', userId)

    if (data) {
      const expiring = data.filter(item => {
        if (!item.expiration_date) return false
        const diff = new Date(item.expiration_date).getTime() - new Date().getTime()
        const days = Math.ceil(diff / (1000 * 3600 * 24))
        return days <= 2
      }).map(item => ({
        id: item.id,
        name: (Array.isArray(item.ingredients) ? (item.ingredients[0] as any)?.name : (item.ingredients as any)?.name) || item.custom_name,
        days: Math.ceil((new Date(item.expiration_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
      }))
      setAlerts(expiring)
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

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-orange-500 transition-colors"
      >
        <Bell size={24} />
        {isPremium && alerts.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white">
            {alerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest">Alerts</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {!isPremium ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto">
                    <Lock size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900">Premium Feature</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Upgrade to Pro to get real-time alerts for expiring ingredients.
                    </p>
                  </div>
                  <button 
                    onClick={handleUpgrade}
                    className="w-full py-2 bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-orange-100"
                  >
                    Upgrade Now
                  </button>
                </div>
              ) : alerts.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {alerts.map(alert => (
                    <div key={alert.id} className="p-4 space-y-1 group hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-red-500" />
                        <span className="font-bold text-gray-900 text-sm">{alert.name}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {alert.days <= 0 ? 'Expired today!' : `Expires in ${alert.days} days`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-2">
                  <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <Check size={20} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">All good!</p>
                  <p className="text-xs text-gray-400">No items expiring soon.</p>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-gray-50 border-t border-gray-50 text-center">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-black text-orange-500 uppercase tracking-widest"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

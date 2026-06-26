import { useState, useEffect } from 'react'
import { getCookingHistory } from '../lib/recipeEngine'
import { History, Calendar, ChevronRight, ChefHat, Loader2 } from 'lucide-react'

export default function CookingHistory() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    try {
      setLoading(true)
      const data = await getCookingHistory()
      setHistory(data)
    } catch (error: any) {
      console.error('Error loading history:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Loading your journey...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Cooking History</h2>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          {history.length} Saved Meals
        </div>
      </div>

      <div className="space-y-4">
        {history.map((item, i) => (
          <div 
            key={i}
            className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-green-200 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 overflow-hidden">
                {item.recipes?.image_url ? (
                  <img src={item.recipes.image_url} alt={item.recipes.title} className="w-full h-full object-cover" />
                ) : (
                  <ChefHat size={32} />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{item.recipes?.title || 'Unknown Recipe'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-green-500 mt-1 uppercase tracking-tighter">
                  Successfully Rescued
                </p>
              </div>
            </div>
            <ChevronRight className="text-gray-300" size={20} />
          </div>
        ))}

        {history.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="text-gray-300 w-8 h-8" />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">No history yet</h3>
            <p className="text-gray-400 text-sm">Start cooking from your suggestions to see your progress here!</p>
          </div>
        )}
      </div>
    </div>
  )
}

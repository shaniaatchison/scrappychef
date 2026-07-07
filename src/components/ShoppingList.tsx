import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getProfile } from '../lib/recipeEngine'
import { ShoppingCart, CheckCircle2, Circle, Loader2, Lock, Apple, Milk, Beef, Package, Sparkles, Snowflake } from 'lucide-react'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  produce: <Apple className="w-4 h-4" />,
  dairy: <Milk className="w-4 h-4" />,
  meat: <Beef className="w-4 h-4" />,
  pantry: <Package className="w-4 h-4" />,
  spices: <Sparkles className="w-4 h-4" />,
  frozen: <Snowflake className="w-4 h-4" />,
  other: <Package className="w-4 h-4" />,
}

const CATEGORY_COLORS: Record<string, string> = {
  produce: 'bg-green-50 text-green-600',
  dairy: 'bg-blue-50 text-blue-600',
  meat: 'bg-red-50 text-red-600',
  pantry: 'bg-amber-50 text-amber-600',
  spices: 'bg-purple-50 text-purple-600',
  frozen: 'bg-cyan-50 text-cyan-600',
  other: 'bg-gray-50 text-gray-600',
}

interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  checked: boolean
}

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    checkAccess()
    loadItems()
  }, [])

  async function checkAccess() {
    try {
      const profile = await getProfile()
      const tier = profile?.tier || 'free'
      if (tier !== 'pro' && tier !== 'lifetime') {
        setShowPaywall(true)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function loadItems() {
    try {
      // Pull ingredients from user's pantry + meal plan
      const { data: pantry, error } = await supabase
        .from('user_pantries')
        .select(`
          id,
          custom_name,
          quantity,
          unit,
          ingredients (name, category)
        `)

      if (error) throw error

      const shoppingItems: ShoppingItem[] = (pantry || []).map((item: any) => {
        const ingName = item.ingredients?.[0]?.name || item.custom_name || 'Unknown'
        const category = item.ingredients?.[0]?.category || 'other'
        return {
          id: item.id,
          name: ingName,
          quantity: item.quantity || 1,
          unit: item.unit || 'pcs',
          category,
          checked: false,
        }
      })

      // Group by category, sort alphabetically
      shoppingItems.sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category)
        return a.name.localeCompare(b.name)
      })

      setItems(shoppingItems)
    } catch (e) {
      console.error('Error loading shopping list:', e)
    } finally {
      setLoading(false)
    }
  }

  function toggleCheck(id: string) {
    setItems(items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const groupedItems = items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const checkedCount = items.filter(i => i.checked).length
  const totalCount = items.length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Building your list...</p>
      </div>
    )
  }

  if (showPaywall) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Pro Feature</h2>
        <p className="text-gray-500 text-sm mb-6 max-w-xs">
          Auto-generated shopping lists are available on Scrappy Pro and Lifetime plans.
        </p>
        <Link
          to="/pricing"
          className="bg-orange-500 text-white font-black px-8 py-3 rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
        >
          View Plans
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Shopping List</h2>
          <p className="text-sm text-gray-400 mt-1">
            {checkedCount}/{totalCount} items checked
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Pro
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
        />
      </div>

      {/* Items by category */}
      {Object.entries(groupedItems).length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="text-gray-300 w-8 h-8" />
          </div>
          <h3 className="text-gray-900 font-bold mb-1">Your list is empty</h3>
          <p className="text-gray-400 text-sm">Add ingredients to your inventory to build a shopping list.</p>
        </div>
      ) : (
        Object.entries(groupedItems).map(([category, categoryItems]) => {
          const catChecked = categoryItems.filter(i => i.checked).length
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${CATEGORY_COLORS[category] || 'bg-gray-50 text-gray-600'}`}>
                    {CATEGORY_ICONS[category] || <Package className="w-4 h-4" />}
                  </span>
                  <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest capitalize">
                    {category}
                  </h3>
                </div>
                <span className="text-xs text-gray-400 font-bold">
                  {catChecked}/{categoryItems.length}
                </span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {categoryItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`w-full flex items-center gap-3 p-4 text-left transition-all hover:bg-gray-50 ${
                      item.checked ? 'opacity-50' : ''
                    }`}
                  >
                    {item.checked ? (
                      <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`flex-1 font-medium text-sm ${
                      item.checked ? 'line-through text-gray-400' : 'text-gray-900'
                    }`}>
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-400 font-bold">
                      {item.quantity} {item.unit}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        })
      )}

      {/* Reset button */}
      {checkedCount > 0 && (
        <button
          onClick={() => setItems(items.map(i => ({ ...i, checked: false })))}
          className="w-full py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
        >
          Reset All
        </button>
      )}
    </div>
  )
}
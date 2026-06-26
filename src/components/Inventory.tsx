import { useState, useEffect } from 'react'
import { Refrigerator, Trash2, Plus, Calendar, Tag, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import StatsDisplay from './StatsDisplay'
import { updateStreak } from '../lib/recipeEngine'

interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  expiry_date: string
  category: string
}

const QUICK_ADD_ITEMS = [
  { name: 'Spinach', category: 'Greens', shelfLife: 4 },
  { name: 'Milk', category: 'Dairy', shelfLife: 7 },
  { name: 'Bread', category: 'Grains', shelfLife: 5 },
  { name: 'Chicken', category: 'Proteins', shelfLife: 3 },
  { name: 'Cilantro', category: 'Herbs', shelfLife: 4 },
  { name: 'Apples', category: 'Fruits', shelfLife: 14 }
]

export default function Inventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newQty, setNewQty] = useState(1)
  const [newExpiry, setNewExpiry] = useState('')

  useEffect(() => {
    fetchIngredients()
    updateStreak().catch(console.error)
  }, [])

  async function fetchIngredients() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_pantries')
        .select(`
          id,
          custom_name,
          quantity,
          unit,
          expiration_date,
          ingredients (
            name,
            category
          )
        `)
        .order('expiration_date', { ascending: true })

      if (error) throw error

      const formattedData = data.map((item: any) => ({
        id: item.id,
        name: item.ingredients?.name || item.custom_name,
        quantity: item.quantity,
        unit: item.unit,
        expiry_date: item.expiration_date,
        category: item.ingredients?.category || 'Misc'
      }))

      setIngredients(formattedData)
    } catch (error: any) {
      console.error('Error fetching ingredients:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function addIngredient(name: string, shelfLife?: number) {
    try {
      let expiryDate = newExpiry
      if (shelfLife && !expiryDate) {
        const d = new Date()
        d.setDate(d.getDate() + shelfLife)
        expiryDate = d.toISOString().split('T')[0]
      }

      // 1. Check if ingredient exists in master list
      const { data: masterData } = await supabase
        .from('ingredients')
        .select('id')
        .eq('name', name)
        .maybeSingle()

      let ingredientId = masterData?.id

      // 2. If not, we'll just use custom_name for now
      const { error } = await supabase
        .from('user_pantries')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ingredient_id: ingredientId,
          custom_name: ingredientId ? null : name,
          quantity: newQty,
          unit: 'pcs',
          expiration_date: expiryDate || null
        })

      if (error) throw error
      
      setIsAdding(false)
      setNewName('')
      setNewExpiry('')
      fetchIngredients()
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function deleteIngredient(id: string) {
    try {
      const { error } = await supabase
        .from('user_pantries')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      setIngredients(ingredients.filter(i => i.id !== id))
    } catch (error: any) {
      alert(error.message)
    }
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState(1)

  async function updateQuantity(id: string, newQty: number) {
    try {
      const { error } = await supabase
        .from('user_pantries')
        .update({ quantity: newQty })
        .eq('id', id)
      
      if (error) throw error
      setIngredients(ingredients.map(i => i.id === id ? { ...i, quantity: newQty } : i))
      setEditingId(null)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const getDaysRemaining = (dateStr: string) => {
    if (!dateStr) return null
    const diff = new Date(dateStr).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 3600 * 24))
  }

  return (
    <section className="space-y-6">
      <StatsDisplay />
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Your Fridge</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-orange-500 text-white p-2 rounded-full shadow-lg hover:bg-orange-600 transition-transform hover:scale-110 active:scale-95"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Quick Add Chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_ADD_ITEMS.map(item => (
          <button
            key={item.name}
            onClick={() => addIngredient(item.name, item.shelfLife)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-orange-500 hover:text-orange-500 transition-colors shadow-sm"
          >
            + {item.name}
          </button>
        ))}
      </div>

      {isAdding && (
        <div className="bg-white p-4 rounded-xl shadow-md border border-orange-100 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ingredient Name</label>
              <input 
                type="text" 
                placeholder="e.g. Avocado"
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-orange-400"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Qty</label>
              <input 
                type="number" 
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-orange-400"
                value={newQty}
                onChange={e => setNewQty(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Expiry</label>
              <input 
                type="date" 
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-orange-400 text-sm"
                value={newExpiry}
                onChange={e => setNewExpiry(e.target.value)}
              />
            </div>
          </div>
          <button 
            onClick={() => addIngredient(newName)}
            className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg shadow-md hover:bg-orange-600 transition-colors"
          >
            Add to Inventory
          </button>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm font-medium">Loading your pantry...</p>
          </div>
        ) : ingredients.length > 0 ? (
          ingredients.map(item => {
            const days = getDaysRemaining(item.expiry_date)
            const isExpiring = days !== null && days <= 2
            
            return (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex items-center justify-between group hover:border-orange-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isExpiring ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                    <Tag size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            className="w-12 p-1 border border-orange-200 rounded outline-none"
                            value={editQty}
                            onChange={e => setEditQty(Number(e.target.value))}
                            onBlur={() => updateQuantity(item.id, editQty)}
                            autoFocus
                          />
                          <span>{item.unit}</span>
                        </div>
                      ) : (
                        <span 
                          className="cursor-pointer hover:text-orange-500 transition-colors"
                          onClick={() => {
                            setEditingId(item.id)
                            setEditQty(item.quantity)
                          }}
                        >
                          {item.quantity} {item.unit}
                        </span>
                      )}
                      {item.expiry_date && (
                        <span className={`flex items-center gap-1 ${isExpiring ? 'text-red-500 font-bold' : ''}`}>
                          <Calendar size={12} />
                          {isExpiring ? (days <= 0 ? 'Expired' : `Expires in ${days}d`) : item.expiry_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteIngredient(item.id)}
                  className="text-gray-300 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Refrigerator className="text-gray-300 w-8 h-8" />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">Your fridge is empty</h3>
            <p className="text-gray-400 text-sm max-w-[200px] mx-auto">Add some ingredients to start getting recipe suggestions!</p>
          </div>
        )}
      </div>
    </section>
  )
}

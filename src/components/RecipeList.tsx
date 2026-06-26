import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getSuggestedRecipes, markRecipeAsCooked, generateAiRecipe, getProfile, queueVideo } from '../lib/recipeEngine'
import type { MatchResult } from '../lib/recipeEngine'
import { ChefHat, Clock, AlertTriangle, CheckCircle2, ChevronRight, Loader2, Sparkles, CalendarDays, Lock, X, Share2 } from 'lucide-react'

export default function RecipeList() {
  const [recipes, setRecipes] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<MatchResult | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [mealPlan, setMealPlan] = useState<any[] | null>(null)

  useEffect(() => {
    loadRecipes()
    loadProfile()
  }, [])

  async function loadRecipes() {
    try {
      setLoading(true)
      const data = await getSuggestedRecipes()
      setRecipes(data)
    } catch (error: any) {
      console.error('Error loading recipes:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadProfile() {
    try {
      const p = await getProfile()
      setProfile(p)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleGenerateAi() {
    try {
      setAiLoading(true)
      // Extract names of ingredients the user actually has
      const userIngs = recipes.length > 0 ? recipes[0].ingredients_json.map(i => i.name) : ['any leftovers']
      
      const recipe = await generateAiRecipe(userIngs)
      setSelectedRecipe({
        ...recipe,
        id: 'ai-' + Date.now(),
        matchPercentage: 100,
        expiringMatchCount: 0,
        missingIngredients: [],
        ingredients_json: recipe.ingredients,
        steps_json: recipe.steps
      })
      loadProfile() // Refresh generation count
    } catch (error: any) {
      if (error.message === 'FREE_LIMIT_REACHED') {
        setShowPaywall(true)
      } else {
        alert(error.message)
      }
    } finally {
      setAiLoading(false)
    }
  }

  async function handleMealPlan() {
    if (!profile?.is_premium) {
      setShowPaywall(true)
      return
    }
    // Simple 3-day meal plan logic: pick top 3 suggested recipes
    const plan = recipes.slice(0, 3).map((r, i) => ({
      day: i + 1,
      recipe: r
    }))
    setMealPlan(plan)
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
        <p className="font-medium">Finding the best matches...</p>
      </div>
    )
  }

  if (showPaywall) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 relative animate-in zoom-in duration-300">
          <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
          <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto">
            <Lock size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">Unlock ScrappyChef Pro</h2>
            <p className="text-gray-500 text-sm">Get unlimited AI recipes, 3-day meal planning, and expiring-soon push alerts.</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-2xl">
            <span className="text-3xl font-black text-orange-600">$9.99</span>
            <span className="text-orange-900/40 font-bold ml-1">/ month</span>
          </div>
          <button 
            className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
            onClick={handleUpgrade}
          >
            Upgrade Now
          </button>
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Cancel anytime</p>
          <p className="text-[9px] text-gray-400 leading-tight">
            🤖 AI-generated recipes are for inspiration only. Always inspect ingredients for freshness and check for allergens before cooking.
          </p>
        </div>
      </div>
    )
  }

  if (mealPlan) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <button onClick={() => setMealPlan(null)} className="text-orange-500 font-bold flex items-center gap-1">
          ← Back to Suggestions
        </button>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your 3-Day Plan</h2>
        <div className="space-y-4">
          {mealPlan.map(item => (
            <div key={item.day} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Day {item.day}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{item.recipe.title}</h3>
              <p className="text-gray-500 text-sm">{item.recipe.description}</p>
              <button 
                onClick={() => {
                  setSelectedRecipe(item.recipe)
                  setMealPlan(null)
                }}
                className="w-full py-3 bg-gray-50 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-all"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (selectedRecipe) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <button 
          onClick={() => setSelectedRecipe(null)}
          className="text-orange-500 font-bold flex items-center gap-1 mb-2"
        >
          ← Back to List
        </button>

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          {selectedRecipe.image_url && (
            <img src={selectedRecipe.image_url} alt={selectedRecipe.title} className="w-full h-48 object-cover" />
          )}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900">{selectedRecipe.title}</h2>
              <p className="text-gray-500 mt-1">{selectedRecipe.description}</p>
            </div>

            <div className="flex gap-4 text-sm font-bold">
              <div className="flex items-center gap-1 text-gray-400">
                <Clock size={16} />
                <span>{selectedRecipe.prep_time} mins</span>
              </div>
              <div className="flex items-center gap-1 text-orange-500 capitalize">
                <ChefHat size={16} />
                <span>{selectedRecipe.difficulty}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Ingredients</h3>
              <ul className="grid grid-cols-1 gap-2">
                {selectedRecipe.ingredients_json.map((ing, i) => (
                  <li key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <span className="font-medium text-gray-700">{ing.name}</span>
                    <span className="text-gray-400 font-bold">{ing.quantity} {ing.unit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Steps</h3>
              <ol className="space-y-4">
                {selectedRecipe.steps_json.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-black">
                      {i + 1}
                    </span>
                    <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            <button 
              className="w-full py-4 bg-green-500 text-white font-black rounded-2xl shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
              onClick={async () => {
                try {
                  await markRecipeAsCooked(selectedRecipe.id)
                  window.dispatchEvent(new CustomEvent('refresh-stats'))
                  alert('Recipe marked as cooked! Your savings stats have been updated.')
                  setSelectedRecipe(null)
                  loadRecipes()
                } catch (e: any) {
                  alert(e.message)
                }
              }}
            >
              <CheckCircle2 size={20} />
              I Cooked This!
            </button>

            {!selectedRecipe.id.startsWith('ai-') && (
              <button 
                className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                onClick={async () => {
                  try {
                    setAiLoading(true)
                    await queueVideo(selectedRecipe.id, `Check out this zero-waste ${selectedRecipe.title}! #ScrappyChef #ZeroWaste`)
                    alert('Video generation queued! It will be posted to our social media once ready.')
                  } catch (e: any) {
                    alert(e.message)
                  } finally {
                    setAiLoading(false)
                  }
                }}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 size={20} />}
                Generate & Post Video
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleGenerateAi}
          disabled={aiLoading}
          className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-3xl text-white flex flex-col items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
        >
          {aiLoading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
          <span className="text-xs font-black uppercase tracking-widest">Magic AI</span>
        </button>

        <button 
          onClick={handleMealPlan}
          className="bg-white p-4 rounded-3xl text-gray-900 border border-gray-100 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          <CalendarDays size={24} className="text-orange-500" />
          <span className="text-xs font-black uppercase tracking-widest">3-Day Plan</span>
        </button>
      </div>

      <p className="text-[10px] text-gray-400 text-center px-4">
        🤖 AI-generated recipes are for inspiration only. Always inspect ingredients for freshness and check for allergens before cooking.
      </p>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Cook Now</h2>
        <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          {recipes.length} Suggestions
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {recipes.map(recipe => (
          <div 
            key={recipe.id}
            onClick={() => setSelectedRecipe(recipe)}
            className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-orange-200 cursor-pointer transition-all active:scale-98"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 relative">
                <ChefHat size={32} />
                {recipe.expiringMatchCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                    !
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{recipe.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-400">
                    <Clock size={12} />
                    <span>{recipe.prep_time}m</span>
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${recipe.matchPercentage >= 80 ? 'text-green-500' : 'text-orange-400'}`}>
                    {recipe.matchPercentage.toFixed(0)}% Match
                  </div>
                </div>
                {recipe.expiringMatchCount > 0 && (
                  <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1 uppercase">
                    <AlertTriangle size={10} />
                    Uses {recipe.expiringMatchCount} expiring item{recipe.expiringMatchCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" size={20} />
          </div>
        ))}

        {recipes.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="text-gray-300 w-8 h-8" />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">No recipes found</h3>
            <p className="text-gray-400 text-sm">Add more ingredients to your inventory to unlock suggestions.</p>
          </div>
        )}
      </div>
    </div>
  )
}

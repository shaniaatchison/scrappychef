import { supabase } from './supabase'

export interface Recipe {
  id: string
  title: string
  description: string
  ingredients_json: { name: string; quantity: number; unit: string }[]
  steps_json: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  prep_time: number
  image_url?: string
}

export interface MatchResult extends Recipe {
  matchPercentage: number
  expiringMatchCount: number
  missingIngredients: string[]
}

export async function getSuggestedRecipes() {
  // 1. Fetch user inventory
  const { data: pantryItems, error: pantryError } = await supabase
    .from('user_pantries')
    .select(`
      id,
      custom_name,
      expiration_date,
      ingredients (
        name
      )
    `)

  if (pantryError) throw pantryError

  const userIngredientNames = pantryItems.map(item => {
    const ingName = Array.isArray(item.ingredients) 
      ? item.ingredients[0]?.name 
      : (item.ingredients as any)?.name
    return (ingName || item.custom_name || '').toLowerCase()
  })

  const expiringIngredientNames = pantryItems
    .filter(item => {
      if (!item.expiration_date) return false
      const diff = new Date(item.expiration_date).getTime() - new Date().getTime()
      const days = Math.ceil(diff / (1000 * 3600 * 24))
      return days <= 2
    })
    .map(item => {
      const ingName = Array.isArray(item.ingredients) 
        ? item.ingredients[0]?.name 
        : (item.ingredients as any)?.name
      return (ingName || item.custom_name || '').toLowerCase()
    })

  // 2. Fetch all recipes
  const { data: recipes, error: recipeError } = await supabase
    .from('recipes')
    .select('*')

  if (recipeError) throw recipeError

  // 3. Match and Rank
  const matchedRecipes: MatchResult[] = recipes.map(recipe => {
    const requiredIngredients = recipe.ingredients_json as { name: string }[]
    const requiredNames = requiredIngredients.map(i => i.name.toLowerCase())
    
    const matches = requiredNames.filter(name => 
      userIngredientNames.some(userIng => userIng.includes(name) || name.includes(userIng))
    )

    const expiringMatches = requiredNames.filter(name => 
      expiringIngredientNames.some(expIng => expIng.includes(name) || name.includes(expIng))
    )

    const missingIngredients = requiredNames.filter(name => 
      !userIngredientNames.some(userIng => userIng.includes(name) || name.includes(userIng))
    )

    const matchPercentage = (matches.length / requiredNames.length) * 100

    return {
      ...recipe,
      matchPercentage,
      expiringMatchCount: expiringMatches.length,
      missingIngredients
    }
  })

  // Rank by:
  // 1. Has expiring matches (highest priority)
  // 2. Match percentage
  return matchedRecipes.sort((a, b) => {
    if (b.expiringMatchCount !== a.expiringMatchCount) {
      return b.expiringMatchCount - a.expiringMatchCount
    }
    return b.matchPercentage - a.matchPercentage
  })
}

export async function markRecipeAsCooked(recipeId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // 1. Get current stats
  const { data: stats, error: statsError } = await supabase
    .from('saved_statistics')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (statsError && statsError.code !== 'PGRST116') throw statsError

  const recipesCooked = (stats?.recipes_cooked_count || 0) + 1
  const dollarsSaved = (stats?.total_money_saved || 0) + 2.50 // Default $2.50 per recipe
  const lbsDiverted = (stats?.total_lbs_waste_avoided || 0) + 0.8 // Default 0.8 lbs
  const streak = stats?.consecutive_days_streak || 0
  
  // Formula: (DollarsSaved * 10) + (LbsWasteDiverted * 5) + (ConsecutiveDaysLogged * 2) + (RecipesCooked * 3)
  const scrappyScore = Math.floor((dollarsSaved * 10) + (lbsDiverted * 5) + (streak * 2) + (recipesCooked * 3))

  const newStats = {
    user_id: user.id,
    recipes_cooked_count: recipesCooked,
    total_money_saved: dollarsSaved,
    total_lbs_waste_avoided: lbsDiverted,
    scrappy_score: scrappyScore,
    updated_at: new Date().toISOString()
  }

  // 2. Update stats
  const { error: updateError } = await supabase
    .from('saved_statistics')
    .upsert(newStats)

  if (updateError) throw updateError

  // 3. Log the cooking event
  await supabase.from('ai_generations_log').insert({
    user_id: user.id,
    ingredients_used: [], 
    generated_recipe_id: recipeId
  })

  return newStats
}

export async function updateStreak() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: stats, error } = await supabase
    .from('saved_statistics')
    .select('consecutive_days_streak, last_logged_date')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  const today = new Date().toISOString().split('T')[0]
  const lastDate = stats?.last_logged_date

  if (lastDate === today) return // Already updated today

  let newStreak = 1
  if (lastDate) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    if (lastDate === yesterdayStr) {
      newStreak = (stats?.consecutive_days_streak || 0) + 1
    }
  }

  await supabase
    .from('saved_statistics')
    .update({ 
      consecutive_days_streak: newStreak,
      last_logged_date: today 
    })
    .eq('user_id', user.id)
}

export async function getCookingHistory() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('ai_generations_log')
    .select(`
      timestamp,
      recipes (
        title,
        description,
        image_url
      )
    `)
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false })

  if (error) throw error
  return data
}

export async function getStats() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('saved_statistics')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function generateAiRecipe(ingredients: string[]) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // 1. Check premium status and generation count
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_premium, ai_generation_count')
    .eq('id', user.id)
    .single()

  if (profileError) throw profileError

  if (!profile.is_premium && profile.ai_generation_count >= 3) {
    throw new Error('FREE_LIMIT_REACHED')
  }

  // 2. Call Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('generate-recipe', {
    body: { ingredients }
  })

  if (error) throw error

  // 3. Increment generation count
  await supabase
    .from('profiles')
    .update({ ai_generation_count: profile.ai_generation_count + 1 })
    .eq('id', user.id)

  return data
}

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('saved_statistics')
    .select(`
      scrappy_score,
      total_money_saved,
      profiles (
        username,
        avatar_url
      )
    `)
    .order('scrappy_score', { ascending: false })
    .limit(100)

  if (error) throw error
  return data
}

export async function claimReferral(code: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // 1. Find referrer
  const { data: referrer, error: referrerError } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', code)
    .single()

  if (referrerError) throw new Error('Invalid referral code')
  if (referrer.id === user.id) throw new Error('Cannot refer yourself')

  // 2. Update user's referred_by
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ referred_by_user_id: referrer.id })
    .eq('id', user.id)
    .is('referred_by_user_id', null) // Only allow claiming once

  if (updateError) throw updateError

  // 3. Award points
  // Referrer gets +50, User gets +25
  await awardPoints(referrer.id, 50)
  await awardPoints(user.id, 25)

  return { bonus: 25 }
}

async function awardPoints(userId: string, points: number) {
  const { data: stats } = await supabase
    .from('saved_statistics')
    .select('scrappy_score')
    .eq('user_id', userId)
    .single()

  await supabase
    .from('saved_statistics')
    .update({ scrappy_score: (stats?.scrappy_score || 0) + points })
    .eq('user_id', userId)
}

export async function updateProfile(updates: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) throw error
}

export async function queueVideo(recipeId: string, caption: string) {
  const { data, error } = await supabase
    .from('video_queue')
    .insert({
      recipe_id: recipeId,
      caption: caption,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ===== TIER & USAGE TRACKING =====

export async function getUserTier(): Promise<{ tier: string; scanCount: number; scanLimit: number; isBetaTester: boolean }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { tier: 'free', scanCount: 0, scanLimit: 15, isBetaTester: false }

  const { data, error } = await supabase
    .from('profiles')
    .select('tier, scan_count, scan_limit, is_beta_tester')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  
  return {
    tier: data?.tier || 'free',
    scanCount: data?.scan_count || 0,
    scanLimit: data?.scan_limit || 15,
    isBetaTester: data?.is_beta_tester || false,
  }
}

export async function incrementScanCount(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('scan_count, scan_month, tier')
    .eq('id', user.id)
    .single()

  const currentMonth = new Date().toISOString().slice(0, 7)
  const newCount = (profile?.scan_count || 0) + 1

  await supabase
    .from('profiles')
    .update({ scan_count: newCount, scan_month: currentMonth })
    .eq('id', user.id)
}

export async function checkFeatureAccess(_feature: 'shopping_list' | 'cooking_timer' | 'substitution_ai' | 'meal_plan'): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  const tier = profile?.tier || 'free'
  
  // Free tier gets basic features only
  if (tier === 'free' || tier === 'core') {
    return false // These are Pro+ features
  }
  
  // Pro and Lifetime get everything
  return tier === 'pro' || tier === 'lifetime'
}

// ===== SUBSTITUTION-AWARE RECIPE GENERATION =====

export async function generateAiRecipeWithSubstitutions(ingredients: string[]) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Check Pro access for substitution feature
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, ai_generation_count')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')

  const tier = profile.tier || 'free'
  const includeSubstitutions = tier === 'pro' || tier === 'lifetime'

  // Free tier limit check
  if (tier === 'free' && profile.ai_generation_count >= 3) {
    throw new Error('FREE_LIMIT_REACHED')
  }

  // Call Edge Function with substitution flag
  const { data, error } = await supabase.functions.invoke('generate-recipe', {
    body: { ingredients, includeSubstitutions }
  })

  if (error) throw error

  // Increment count
  await supabase
    .from('profiles')
    .update({ ai_generation_count: (profile.ai_generation_count || 0) + 1 })
    .eq('id', user.id)

  return data
}

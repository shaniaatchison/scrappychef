import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedTestAccount() {
  console.log('Setting up test account...')
  
  // Try to sign up the test user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'tester@example.com',
    password: 'password123',
    options: {
      data: {
        username: 'tester',
      }
    }
  })

  if (authError) {
    if (authError.message === 'User already registered') {
       console.log('User already registered, proceeding to find profile...')
    } else if (authError.status === 429) {
       console.warn('Rate limit exceeded for signup, checking if profile exists...')
    } else {
       console.error('Auth error:', authError)
       return
    }
  }

  // Get the profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', 'tester')
    .single()

  if (profileError || !profile) {
    console.error('Could not find profile for user \"tester\". Please ensure the user is signed up.')
    return
  }

  const userId = profile.id

  const { error: statsError } = await supabase
    .from('saved_statistics')
    .update({ 
      scrappy_score: 732,
      total_money_saved: 45.50,
      total_lbs_waste_avoided: 12.2,
      recipes_cooked_count: 15,
      consecutive_days_streak: 5
    })
    .eq('user_id', userId)

  if (statsError) {
    console.error('Error updating stats:', statsError)
  } else {
    console.log('Successfully seeded test account with Scrappy Score 732.')
  }
}

seedTestAccount()

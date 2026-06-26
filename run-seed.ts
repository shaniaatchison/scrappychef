import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://iynmkpdqvbyrrdbvqrra.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bm1rcGRxdmJ5cnJkYnZxcnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMjU1MzIsImV4cCI6MjA5NjkwMTUzMn0.arD_wItkp9JByri8UZ-ZZULB-Q3sYzWsa3pM5C7JayY'
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

  if (authError && authError.message !== 'User already registered') {
    console.error('Auth error:', authError)
    // Even if it fails, maybe the user already exists, let's try to sign in
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'tester@example.com',
    password: 'password123',
  })

  if (signInError) {
    console.error('SignIn error:', signInError)
    return
  }

  const userId = signInData.user.id
  console.log('User ID:', userId)

  // Update stats
  // Note: we might need to use the session token for this if RLS is enabled
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
    // If update fails, try insert
    const { error: insertError } = await supabase
      .from('saved_statistics')
      .insert({
        user_id: userId,
        scrappy_score: 732,
        total_money_saved: 45.50,
        total_lbs_waste_avoided: 12.2,
        recipes_cooked_count: 15,
        consecutive_days_streak: 5
      })
    if (insertError) {
        console.error('Insert error:', insertError)
    } else {
        console.log('Successfully inserted stats.')
    }
  } else {
    console.log('Successfully updated stats.')
  }
}

seedTestAccount()

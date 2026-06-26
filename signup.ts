import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function signup() {
  const { data, error } = await supabase.auth.signUp({
    email: 'tester2@example.com',
    password: 'password123',
    options: {
      data: {
        username: 'tester2',
      }
    }
  })

  if (error) {
    console.error('Signup error:', error.message)
    return
  }

  console.log('SUCCESS: User signed up')
  console.log('ACCESS_TOKEN=' + data.session?.access_token)
}

signup()

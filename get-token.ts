import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function getToken() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'tester@example.com',
    password: 'password123',
  })

  if (error) {
    console.error('Login error:', error.message)
    return
  }

  console.log('ACCESS_TOKEN=' + data.session.access_token)
}

getToken()

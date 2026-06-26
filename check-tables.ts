import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('--- START TABLE CHECK ---')
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  if (error) {
    console.error('Error selecting from profiles:', error)
  } else {
    console.log('Profiles table exists, data:', data)
  }

  const { data: statsData, error: statsError } = await supabase.from('saved_statistics').select('*').limit(1)
  if (statsError) {
    console.error('Error selecting from saved_statistics:', statsError)
  } else {
    console.log('Saved_statistics table exists, data:', statsData)
  }
  console.log('--- END TABLE CHECK ---')
}

checkTables()

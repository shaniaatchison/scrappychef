import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bm1rcGRxdmJ5cnJkYnZxcnJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTMyNTUzMiwiZXhwIjoyMDk2OTAxNTMyfQ.hudz1xkDIgktd86NfuctZKeX_8zjvf42ZOyBGvXE8oQ'
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function updatePassword() {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('List users error:', listError.message)
    return
  }

  console.log('Found users:', users.users.map(u => u.email))
  const user = users.users.find(u => u.email === 'tester@example.com')
  if (!user) {
    console.error('User not found')
    return
  }

  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: 'password123', email_confirm: true }
  )

  if (error) {
    console.error('Update error:', error.message)
    return
  }

  console.log('SUCCESS: Password updated and email confirmed')
}

updatePassword()

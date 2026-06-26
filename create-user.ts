import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bm1rcGRxdmJ5cnJkYnZxcnJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTMyNTUzMiwiZXhwIjoyMDk2OTAxNTMyfQ.hudz1xkDIgktd86NfuctZKeX_8zjvf42ZOyBGvXE8oQ'
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function createUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test-user@example.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { username: 'testuser' }
  })

  if (error) {
    console.error('Create error:', error.message)
    return
  }

  console.log('SUCCESS: User created')
  console.log('ID=' + data.user.id)
}

createUser()

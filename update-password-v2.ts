import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bm1rcGRxdmJ5cnJkYnZxcnJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTMyNTUzMiwiZXhwIjoyMDk2OTAxNTMyfQ.hudz1xkDIgktd86NfuctZKeX_8zjvf42ZOyBGvXE8oQ'
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function updatePassword() {
  const userId = '37c323c8-59cc-48c2-828d-d7b6704dc5a2'
  const { data, error } = await supabase.auth.admin.updateUserById(
    userId,
    { password: 'password123', email_confirm: true }
  )

  if (error) {
    console.error('Update error:', error.message)
    return
  }

  console.log('SUCCESS: Password updated and email confirmed')
}

updatePassword()

import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for the browser
// These are public keys - safe to expose in the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if we have the required values
// This prevents build errors when env vars aren't available during static generation
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

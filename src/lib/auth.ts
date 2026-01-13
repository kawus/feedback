// Authentication helpers for Supabase magic link auth

import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

// Send magic link to user's email
export async function sendMagicLink(email: string, redirectTo?: string): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error('Service unavailable') }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: email.toLowerCase().trim(),
    options: {
      emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
    },
  })

  return { error: error ? new Error(error.message) : null }
}

// Get current logged-in user
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null

  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Sign out current user
export async function signOut(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signOut()
}

// Subscribe to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!supabase) return { unsubscribe: () => {} }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session?.user ?? null)
    }
  )

  return { unsubscribe: () => subscription.unsubscribe() }
}

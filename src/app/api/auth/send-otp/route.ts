import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client with service role
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const supabaseAdmin = getSupabaseAdmin()

    // Send OTP email via Supabase
    // This sends an email containing a 6-digit code
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        // Don't create a new user if they don't exist - we just want to verify email
        shouldCreateUser: true,
      },
    })

    if (error) {
      console.error("Failed to send OTP:", error)

      // Handle rate limiting gracefully
      if (error.message.includes("rate") || error.status === 429) {
        return NextResponse.json(
          { error: "Too many requests. Please wait a moment before trying again." },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: "Failed to send verification code. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email"
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

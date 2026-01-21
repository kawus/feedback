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
    const { email, token } = body

    // Validate inputs
    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
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

    // Token should be 6 digits
    const tokenClean = token.toString().trim()
    if (!/^\d{6}$/.test(tokenClean)) {
      return NextResponse.json(
        { error: "Invalid code format. Please enter the 6-digit code." },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const supabaseAdmin = getSupabaseAdmin()

    // Verify the OTP with Supabase
    const { error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      email: normalizedEmail,
      token: tokenClean,
      type: "email",
    })

    if (verifyError) {
      console.error("OTP verification failed:", verifyError)

      // Common error cases
      if (verifyError.message.includes("expired")) {
        return NextResponse.json(
          { error: "Code has expired. Please request a new one." },
          { status: 400 }
        )
      }

      if (verifyError.message.includes("invalid") || verifyError.message.includes("Token")) {
        return NextResponse.json(
          { error: "Invalid code. Please check and try again." },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: "Verification failed. Please try again." },
        { status: 400 }
      )
    }

    // OTP verified! Now record this in our verified_emails table
    // Calculate expiry (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Upsert the verification record (update if exists, insert if not)
    const { error: upsertError } = await supabaseAdmin
      .from("verified_emails")
      .upsert(
        {
          email: normalizedEmail,
          verified_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        },
        {
          onConflict: "email",
        }
      )

    if (upsertError) {
      console.error("Failed to record verification:", upsertError)
      // Still return success since OTP was valid - just couldn't record it
      // User can try again if needed
    }

    // Sign out the session we just created (we don't want full auth, just verification)
    // This keeps the app "login-last" - users aren't fully logged in just for voting
    await supabaseAdmin.auth.signOut()

    return NextResponse.json({
      verified: true,
      email: normalizedEmail,
      expiresAt: expiresAt.toISOString(),
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client with service role (bypasses RLS)
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, voterEmail } = body

    // Validate required fields
    if (!postId || !voterEmail) {
      return NextResponse.json(
        { error: "postId and voterEmail are required" },
        { status: 400 }
      )
    }

    const normalizedEmail = voterEmail.trim().toLowerCase()
    const supabaseAdmin = getSupabaseAdmin()

    // Verify the email is in verified_emails (proves ownership)
    const { data: verification, error: verifyError } = await supabaseAdmin
      .from("verified_emails")
      .select("email")
      .eq("email", normalizedEmail)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (verifyError || !verification) {
      return NextResponse.json(
        { error: "Email not verified" },
        { status: 403 }
      )
    }

    // Delete the vote
    const { error: deleteError } = await supabaseAdmin
      .from("votes")
      .delete()
      .eq("post_id", postId)
      .eq("voter_email", normalizedEmail)

    if (deleteError) {
      console.error("Failed to delete vote:", deleteError)
      return NextResponse.json(
        { error: "Failed to remove vote" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client with service role
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

// Client to get current user from request
function getSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const authHeader = request.headers.get("authorization")
  const accessToken = authHeader?.replace("Bearer ", "")

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, authorEmail, content } = body

    // Validate required fields
    if (!postId || !authorEmail || !content) {
      return NextResponse.json(
        { error: "Missing required fields: postId, authorEmail, content" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(authorEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate content length
    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 }
      )
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { error: "Comment too long (max 2000 characters)" },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const supabaseClient = getSupabaseClient(request)
    const normalizedEmail = authorEmail.trim().toLowerCase()

    // Check if user is authenticated (signed in via magic link)
    const { data: { user } } = await supabaseClient.auth.getUser()
    const isAuthenticatedUser = user?.email?.toLowerCase() === normalizedEmail

    // If not authenticated with this email, check OTP verification
    if (!isAuthenticatedUser) {
      const { data: verification, error: verifyError } = await supabaseAdmin
        .from("verified_emails")
        .select("expires_at")
        .eq("email", normalizedEmail)
        .single()

      if (verifyError || !verification) {
        return NextResponse.json(
          { error: "Please verify your email before commenting" },
          { status: 403 }
        )
      }

      // Check if verification has expired
      if (new Date(verification.expires_at) < new Date()) {
        return NextResponse.json(
          { error: "Email verification has expired. Please verify again." },
          { status: 403 }
        )
      }
    }

    // Verify the post exists
    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Create the comment
    const { data: comment, error: insertError } = await supabaseAdmin
      .from("comments")
      .insert({
        post_id: postId,
        author_email: normalizedEmail,
        content: content.trim(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Failed to create comment:", insertError)
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      )
    }

    return NextResponse.json(comment, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

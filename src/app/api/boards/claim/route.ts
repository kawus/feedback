import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client with service role for admin operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

// Client to get current user from request
function getSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Get access token from cookie or authorization header
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
    const { slug, claimToken } = body

    // Validate input
    if (!slug || !claimToken) {
      return NextResponse.json(
        { error: "Missing slug or claimToken" },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const supabaseClient = getSupabaseClient(request)

    // Get current user from session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Find the board by slug
    const { data: board, error: boardError } = await supabaseAdmin
      .from("boards")
      .select("id, claim_token, user_id")
      .eq("slug", slug)
      .single()

    if (boardError || !board) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      )
    }

    // Check if board is already claimed
    if (board.user_id) {
      return NextResponse.json(
        { error: "Board already claimed" },
        { status: 400 }
      )
    }

    // Verify the claim token
    if (board.claim_token !== claimToken) {
      return NextResponse.json(
        { error: "Invalid claim token" },
        { status: 403 }
      )
    }

    // Claim the board: set user_id and remove expires_at
    const { error: updateError } = await supabaseAdmin
      .from("boards")
      .update({
        user_id: user.id,
        expires_at: null,
      })
      .eq("id", board.id)

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to claim board" },
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

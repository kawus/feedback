import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client with service role
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

// Get current user from request
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, claimToken } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const supabaseClient = getSupabaseClient(request)

    // Get current user (may be null for unclaimed boards)
    const { data: { user } } = await supabaseClient.auth.getUser()

    // Find the board
    const { data: board, error: boardError } = await supabaseAdmin
      .from("boards")
      .select("id, claim_token, user_id")
      .eq("id", id)
      .single()

    if (boardError || !board) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      )
    }

    // Check authorization: either via claim token or authenticated user
    const hasValidToken = claimToken && board.claim_token === claimToken
    const hasValidAuth = user && board.user_id === user.id

    if (!hasValidToken && !hasValidAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Update the board name
    const { error: updateError } = await supabaseAdmin
      .from("boards")
      .update({ name: name.trim() })
      .eq("id", id)

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update board" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, name: name.trim() })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { claimToken } = body

    const supabaseAdmin = getSupabaseAdmin()
    const supabaseClient = getSupabaseClient(request)

    // Get current user (may be null for unclaimed boards)
    const { data: { user } } = await supabaseClient.auth.getUser()

    // Find the board
    const { data: board, error: boardError } = await supabaseAdmin
      .from("boards")
      .select("id, claim_token, user_id")
      .eq("id", id)
      .single()

    if (boardError || !board) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      )
    }

    // Check authorization: either via claim token or authenticated user
    const hasValidToken = claimToken && board.claim_token === claimToken
    const hasValidAuth = user && board.user_id === user.id

    if (!hasValidToken && !hasValidAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Delete related data first (cascade should handle this, but being explicit)
    // Delete changelog entries
    await supabaseAdmin
      .from("changelog_entries")
      .delete()
      .eq("board_id", id)

    // Delete votes for all posts in this board
    const { data: posts } = await supabaseAdmin
      .from("posts")
      .select("id")
      .eq("board_id", id)

    if (posts && posts.length > 0) {
      const postIds = posts.map(p => p.id)
      await supabaseAdmin
        .from("votes")
        .delete()
        .in("post_id", postIds)
    }

    // Delete posts
    await supabaseAdmin
      .from("posts")
      .delete()
      .eq("board_id", id)

    // Delete board
    const { error: deleteError } = await supabaseAdmin
      .from("boards")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete board" },
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

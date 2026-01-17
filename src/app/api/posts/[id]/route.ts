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
    const { status, claimToken } = body

    // Validate status
    if (!status) {
      return NextResponse.json(
        { error: "Missing status" },
        { status: 400 }
      )
    }

    const validStatuses = ["open", "planned", "in_progress", "done"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const supabaseClient = getSupabaseClient(request)

    // Get current user (may be null for unclaimed boards)
    const { data: { user } } = await supabaseClient.auth.getUser()

    // Get the post and its board
    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .select("id, board_id")
      .eq("id", id)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Get the board to verify ownership
    const { data: board, error: boardError } = await supabaseAdmin
      .from("boards")
      .select("claim_token, user_id")
      .eq("id", post.board_id)
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

    // Update the post status
    const { error: updateError } = await supabaseAdmin
      .from("posts")
      .update({ status })
      .eq("id", id)

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update status" },
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

    // Get the post and its board
    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .select("id, board_id")
      .eq("id", id)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Get the board to verify ownership
    const { data: board, error: boardError } = await supabaseAdmin
      .from("boards")
      .select("claim_token, user_id")
      .eq("id", post.board_id)
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

    // Delete votes for this post first
    await supabaseAdmin
      .from("votes")
      .delete()
      .eq("post_id", id)

    // Delete the post
    const { error: deleteError } = await supabaseAdmin
      .from("posts")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete post" },
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

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { claimToken, authorEmail } = body

    const supabaseAdmin = getSupabaseAdmin()
    const supabaseClient = getSupabaseClient(request)

    // Get current user (may be null)
    const { data: { user } } = await supabaseClient.auth.getUser()

    // Get the comment and its related post/board
    const { data: comment, error: commentError } = await supabaseAdmin
      .from("comments")
      .select("id, post_id, author_email")
      .eq("id", id)
      .single()

    if (commentError || !comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }

    // Get the post to find the board
    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .select("id, board_id")
      .eq("id", comment.post_id)
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

    // Check authorization:
    // 1. Board owner via claim token
    // 2. Board owner via authenticated user
    // 3. Comment author (matching email)
    const isBoardOwnerViaToken = claimToken && board.claim_token === claimToken
    const isBoardOwnerViaAuth = user && board.user_id === user.id
    const isCommentAuthor = authorEmail &&
      comment.author_email.toLowerCase() === authorEmail.toLowerCase()

    if (!isBoardOwnerViaToken && !isBoardOwnerViaAuth && !isCommentAuthor) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Delete the comment
    const { error: deleteError } = await supabaseAdmin
      .from("comments")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete comment" },
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

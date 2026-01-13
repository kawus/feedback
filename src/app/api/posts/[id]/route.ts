import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client with service role
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, claimToken } = body

    // Validate input
    if (!status || !claimToken) {
      return NextResponse.json(
        { error: "Missing status or claimToken" },
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

    const supabase = getSupabaseAdmin()

    // Get the post and its board
    const { data: post, error: postError } = await supabase
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

    // Verify the claim token matches the board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select("claim_token")
      .eq("id", post.board_id)
      .single()

    if (boardError || !board) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      )
    }

    if (board.claim_token !== claimToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Update the post status
    const { error: updateError } = await supabase
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

    if (!claimToken) {
      return NextResponse.json(
        { error: "Missing claimToken" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Get the post and its board
    const { data: post, error: postError } = await supabase
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

    // Verify the claim token matches the board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select("claim_token")
      .eq("id", post.board_id)
      .single()

    if (boardError || !board) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      )
    }

    if (board.claim_token !== claimToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Delete votes for this post first
    await supabase
      .from("votes")
      .delete()
      .eq("post_id", id)

    // Delete the post
    const { error: deleteError } = await supabase
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

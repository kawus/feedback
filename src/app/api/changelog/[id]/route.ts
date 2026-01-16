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
    const { title, content, claimToken } = body

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    if (!claimToken) {
      return NextResponse.json(
        { error: "Missing claimToken" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Get the changelog entry and its board
    const { data: entry, error: entryError } = await supabase
      .from("changelog_entries")
      .select("id, board_id")
      .eq("id", id)
      .single()

    if (entryError || !entry) {
      return NextResponse.json(
        { error: "Changelog entry not found" },
        { status: 404 }
      )
    }

    // Verify the claim token matches the board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select("claim_token")
      .eq("id", entry.board_id)
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

    // Update the changelog entry
    const { error: updateError } = await supabase
      .from("changelog_entries")
      .update({
        title: title.trim(),
        content: content?.trim() || null,
      })
      .eq("id", id)

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update changelog entry" },
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

    // Get the changelog entry and its board
    const { data: entry, error: entryError } = await supabase
      .from("changelog_entries")
      .select("id, board_id")
      .eq("id", id)
      .single()

    if (entryError || !entry) {
      return NextResponse.json(
        { error: "Changelog entry not found" },
        { status: 404 }
      )
    }

    // Verify the claim token matches the board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select("claim_token")
      .eq("id", entry.board_id)
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

    // Delete the changelog entry
    const { error: deleteError } = await supabase
      .from("changelog_entries")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete changelog entry" },
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

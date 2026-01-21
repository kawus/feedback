"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Comment } from "@/types/database"
import { getBoardToken } from "@/lib/board-tokens"
import { getVoterEmail } from "@/lib/voter-email"
import { supabase } from "@/lib/supabase"

interface CommentItemProps {
  comment: Comment
  boardSlug: string
  isOwner: boolean
  onDelete?: () => void
}

export function CommentItem({
  comment,
  boardSlug,
  isOwner,
  onDelete,
}: CommentItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Check if current user is the comment author
  const voterEmail = getVoterEmail()
  const isAuthor = voterEmail &&
    comment.author_email.toLowerCase() === voterEmail.toLowerCase()

  // Can delete if owner OR author
  const canDelete = isOwner || isAuthor

  const date = new Date(comment.created_at)
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  // Mask email for display: show first 2 chars + domain
  const emailParts = comment.author_email.split("@")
  const maskedEmail = emailParts[0].length > 2
    ? `${emailParts[0].slice(0, 2)}...@${emailParts[1]}`
    : comment.author_email

  const handleDelete = async () => {
    if (!supabase) return

    setDeleting(true)
    const claimToken = getBoardToken(boardSlug)

    // Get auth token for claimed boards
    const { data: { session } } = await supabase.auth.getSession()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`/api/comments/${comment.id}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({
        claimToken,
        authorEmail: voterEmail,
      }),
    })

    if (response.ok) {
      onDelete?.()
    } else {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (confirmDelete) {
    return (
      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-sm text-destructive font-medium">Delete this comment?</p>
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirmDelete(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{maskedEmail}</span>
          <span>·</span>
          <span>{formattedDate}</span>
          {isAuthor && (
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium">
              You
            </span>
          )}
        </div>
        {canDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="opacity-0 group-hover:opacity-100 text-xs text-destructive hover:underline transition-opacity"
          >
            Delete
          </button>
        )}
      </div>
      <p className="text-sm text-foreground mt-1 leading-relaxed">
        {comment.content}
      </p>
    </div>
  )
}

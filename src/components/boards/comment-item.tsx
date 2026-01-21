"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

// Generate consistent color from email
const avatarColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
]

function getAvatarColor(email: string): string {
  // Simple hash based on email characters
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function getEmailPrefix(email: string): string {
  return email.split("@")[0]
}

function getInitial(email: string): string {
  return email.charAt(0).toUpperCase()
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

  const emailPrefix = getEmailPrefix(comment.author_email)
  const avatarColor = getAvatarColor(comment.author_email)
  const initial = getInitial(comment.author_email)

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
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-sm text-destructive font-medium">Delete this comment?</p>
        <div className="flex gap-2 mt-3">
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
    <div className="flex gap-3 py-4">
      {/* Avatar */}
      <Avatar size="sm" className="mt-0.5 flex-shrink-0">
        <AvatarFallback className={`${avatarColor} text-white text-xs font-medium`}>
          {initial}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header: name, date, badges, actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {emailPrefix}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formattedDate}
            </span>
            {isAuthor && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium flex-shrink-0">
                You
              </span>
            )}
          </div>

          {/* Actions dropdown */}
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                    />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setConfirmDelete(true)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  Delete comment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Comment content */}
        <p className="text-sm text-foreground mt-1 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  )
}

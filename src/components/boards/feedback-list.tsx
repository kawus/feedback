"use client"

import { useState } from "react"
import { Post } from "@/types/database"
import { VoteButton } from "./vote-button"
import { StatusSelector } from "./status-selector"
import { getBoardToken } from "@/lib/board-tokens"

interface FeedbackListProps {
  posts: Post[]
  boardSlug: string
  isOwner: boolean
  onVoteChange?: () => void
}

export function FeedbackList({ posts, boardSlug, isOwner, onVoteChange }: FeedbackListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        {/* Simple inbox icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground/60"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"
              />
            </svg>
          </div>
        </div>
        <p className="text-lg font-medium text-foreground">No feedback yet</p>
        <p className="text-sm mt-1 max-w-xs mx-auto">
          {isOwner
            ? "Share this board with your users to start collecting ideas."
            : "Be the first to share an idea!"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FeedbackItem
          key={post.id}
          post={post}
          boardSlug={boardSlug}
          isOwner={isOwner}
          onVoteChange={onVoteChange}
        />
      ))}
    </div>
  )
}

interface FeedbackItemProps {
  post: Post
  boardSlug: string
  isOwner: boolean
  onVoteChange?: () => void
}

function FeedbackItem({ post, boardSlug, isOwner, onVoteChange }: FeedbackItemProps) {
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Format the date nicely
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  const handleDelete = async () => {
    const claimToken = getBoardToken(boardSlug)
    if (!claimToken) return

    setDeleting(true)

    const response = await fetch(`/api/posts/${post.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimToken }),
    })

    if (response.ok) {
      onVoteChange?.()
    }
    setDeleting(false)
    setShowConfirm(false)
  }

  return (
    <div className="group bg-card border rounded-lg p-4 shadow-[var(--shadow-sm)] transition-all duration-200 ease-out hover:shadow-[var(--shadow-md)] hover:border-border/80 hover:-translate-y-0.5">
      <div className="flex gap-4">
        {/* Vote button */}
        <VoteButton
          postId={post.id}
          voteCount={post.vote_count}
          onVoteChange={onVoteChange}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground tracking-tight">
            {post.title}
          </h3>
          {post.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {post.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
            {isOwner && (
              <>
                {!showConfirm ? (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                ) : (
                  <span className="text-xs flex items-center gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-destructive hover:underline"
                    >
                      {deleting ? "Deleting..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      disabled={deleting}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Status: selector for owner, badge for others */}
        {isOwner ? (
          <StatusSelector
            postId={post.id}
            boardSlug={boardSlug}
            currentStatus={post.status}
            onStatusChange={onVoteChange}
          />
        ) : (
          <StatusBadge status={post.status} />
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: Post["status"] }) {
  const styles = {
    open: "bg-muted text-muted-foreground",
    planned: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    in_progress:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    done: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  }

  const labels = {
    open: "Open",
    planned: "Planned",
    in_progress: "In Progress",
    done: "Done",
  }

  // Don't show badge for "open" status (default state)
  if (status === "open") return null

  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-md self-start cursor-default select-none ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

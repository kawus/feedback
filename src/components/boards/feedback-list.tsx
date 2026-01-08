"use client"

import { Post } from "@/types/database"
import { VoteButton } from "./vote-button"
import { StatusSelector } from "./status-selector"

interface FeedbackListProps {
  posts: Post[]
  boardSlug: string
  isOwner: boolean
  onVoteChange?: () => void
}

export function FeedbackList({ posts, boardSlug, isOwner, onVoteChange }: FeedbackListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No feedback yet</p>
        <p className="text-sm mt-1">Be the first to submit a feature request!</p>
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
  // Format the date nicely
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  return (
    <div className="bg-card border rounded-lg p-4 shadow-[var(--shadow-sm)]">
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
          <p className="text-xs text-muted-foreground mt-2">{formattedDate}</p>
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
      className={`text-xs font-medium px-2 py-1 rounded-md self-start ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

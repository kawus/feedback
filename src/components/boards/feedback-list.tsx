"use client"

import { Post } from "@/types/database"

interface FeedbackListProps {
  posts: Post[]
}

export function FeedbackList({ posts }: FeedbackListProps) {
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
        <FeedbackItem key={post.id} post={post} />
      ))}
    </div>
  )
}

function FeedbackItem({ post }: { post: Post }) {
  // Format the date nicely
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  return (
    <div className="bg-card border rounded-lg p-4 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <div className="flex gap-4">
        {/* Vote count placeholder - will be clickable in future */}
        <div className="flex flex-col items-center justify-center min-w-[48px] py-2 px-3 bg-muted rounded-md">
          <span className="text-lg font-semibold text-foreground">
            {post.vote_count}
          </span>
          <span className="text-xs text-muted-foreground">votes</span>
        </div>

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

        {/* Status badge */}
        <StatusBadge status={post.status} />
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

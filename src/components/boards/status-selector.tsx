"use client"

import { useState } from "react"
import { PostStatus } from "@/types/database"
import { getBoardToken } from "@/lib/board-tokens"

interface StatusSelectorProps {
  postId: string
  boardSlug: string
  currentStatus: PostStatus
  onStatusChange?: () => void
}

const statusOptions: { value: PostStatus; label: string; color: string }[] = [
  { value: "open", label: "Open", color: "bg-muted" },
  { value: "planned", label: "Planned", color: "bg-blue-100 dark:bg-blue-900/30" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-100 dark:bg-amber-900/30" },
  { value: "done", label: "Done", color: "bg-green-100 dark:bg-green-900/30" },
]

export function StatusSelector({
  postId,
  boardSlug,
  currentStatus,
  onStatusChange,
}: StatusSelectorProps) {
  const [status, setStatus] = useState<PostStatus>(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (newStatus: PostStatus) => {
    if (newStatus === status) return

    const claimToken = getBoardToken(boardSlug)
    if (!claimToken) return

    setLoading(true)

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, claimToken }),
      })

      if (response.ok) {
        setStatus(newStatus)
        onStatusChange?.()
      }
    } catch {
      // Silently fail - status will remain unchanged
    } finally {
      setLoading(false)
    }
  }

  const currentOption = statusOptions.find((opt) => opt.value === status)

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as PostStatus)}
        disabled={loading}
        className={`appearance-none text-xs font-medium px-2 py-1 pr-6 rounded-md cursor-pointer border-0 outline-none focus:ring-2 focus:ring-primary/50 ${
          currentOption?.color
        } ${loading ? "opacity-50" : ""}`}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

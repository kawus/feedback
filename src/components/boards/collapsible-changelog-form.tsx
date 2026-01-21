"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"

interface CollapsibleChangelogFormProps {
  boardId: string
  onSuccess?: () => void
}

export function CollapsibleChangelogForm({
  boardId,
  onSuccess,
}: CollapsibleChangelogFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!supabase) {
      setError("Service unavailable. Please try again later.")
      setLoading(false)
      return
    }

    const { error: supabaseError } = await supabase
      .from("changelog_entries")
      .insert({
        board_id: boardId,
        title: title.trim(),
        content: content.trim() || null,
        published_at: new Date().toISOString(),
      })

    setLoading(false)

    if (supabaseError) {
      setError("Something went wrong. Please try again.")
      return
    }

    // Reset form and collapse
    setTitle("")
    setContent("")
    setIsOpen(false)

    onSuccess?.()
  }

  const handleClose = () => {
    setIsOpen(false)
    setError("")
  }

  // Collapsed state - just the button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground bg-muted/50 hover:bg-muted border border-border border-dashed rounded-lg transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Post Update
      </button>
    )
  }

  // Expanded state - the form
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header with close button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div>
          <h3 className="text-sm font-medium text-foreground">Post an Update</h3>
          <p className="text-xs text-muted-foreground">Only you can post updates (admin)</p>
        </div>
        <button
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close form"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            What shipped?
          </label>
          <Input
            id="title"
            type="text"
            placeholder="e.g., Dark mode is here!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            maxLength={200}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="content"
            className="text-sm font-medium text-foreground"
          >
            Details{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            id="content"
            placeholder="Describe what changed and why it matters..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            rows={3}
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !title.trim()}
            className="flex-1"
          >
            {loading ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </form>
    </div>
  )
}

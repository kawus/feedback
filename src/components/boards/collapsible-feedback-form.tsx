"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { getVoterEmail, saveVoterEmail } from "@/lib/voter-email"

interface CollapsibleFeedbackFormProps {
  boardId: string
  onSuccess?: () => void
}

export function CollapsibleFeedbackForm({
  boardId,
  onSuccess,
}: CollapsibleFeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Pre-fill email from localStorage if previously saved
  useEffect(() => {
    const storedEmail = getVoterEmail()
    if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!supabase) {
      setError("Service unavailable. Please try again later.")
      setLoading(false)
      return
    }

    const { error: supabaseError } = await supabase.from("posts").insert({
      board_id: boardId,
      title: title.trim(),
      description: description.trim() || null,
      author_email: email.trim().toLowerCase(),
    })

    setLoading(false)

    if (supabaseError) {
      setError("Something went wrong. Please try again.")
      return
    }

    // Save email for future submissions and votes
    saveVoterEmail(email.trim().toLowerCase())

    // Reset form and collapse
    setTitle("")
    setDescription("")
    setIsOpen(false)

    // Notify parent to refresh list
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
        Add Feedback
      </button>
    )
  }

  // Expanded state - the form
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header with close button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-medium text-foreground">Submit Feedback</h3>
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
        <p className="text-xs text-muted-foreground">
          Anyone can submit feedback — no account required.
        </p>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Your email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Used to notify you of updates. Not shared publicly.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Feature request
          </label>
          <Input
            id="title"
            type="text"
            placeholder="e.g., Add dark mode support"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-foreground"
          >
            Details{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            id="description"
            placeholder="Describe why this would be useful..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            disabled={loading || !email.trim() || !title.trim()}
            className="flex-1"
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  )
}

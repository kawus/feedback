"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getVoterEmail, saveVoterEmail } from "@/lib/voter-email"

interface AddCommentFormProps {
  postId: string
  onSuccess?: () => void
}

export function AddCommentForm({ postId, onSuccess }: AddCommentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Pre-fill email from localStorage
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

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        authorEmail: email.trim().toLowerCase(),
        content: content.trim(),
      }),
    })

    setLoading(false)

    if (!response.ok) {
      const data = await response.json()
      setError(data.error || "Failed to post comment")
      return
    }

    // Save email for future use
    saveVoterEmail(email.trim().toLowerCase())

    // Reset and close
    setContent("")
    setIsOpen(false)

    onSuccess?.()
  }

  // Collapsed state - just a button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
      >
        Add a comment...
      </button>
    )
  }

  // Expanded state - the form
  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-muted/30 rounded-lg">
      <div className="space-y-1">
        <label htmlFor={`comment-email-${postId}`} className="text-xs font-medium text-muted-foreground">
          Your email
        </label>
        <Input
          id={`comment-email-${postId}`}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor={`comment-content-${postId}`} className="text-xs font-medium text-muted-foreground">
          Comment
        </label>
        <Textarea
          id={`comment-content-${postId}`}
          placeholder="Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={loading}
          rows={2}
          className="text-sm resize-none"
          autoFocus
        />
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false)
            setError("")
          }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={loading || !email.trim() || !content.trim()}
        >
          {loading ? "Posting..." : "Post"}
        </Button>
      </div>
    </form>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { getVoterEmail, saveVoterEmail } from "@/lib/voter-email"

interface SubmitFeedbackFormProps {
  boardId: string
  onSuccess?: () => void
}

export function SubmitFeedbackForm({
  boardId,
  onSuccess,
}: SubmitFeedbackFormProps) {
  const [email, setEmail] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

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

    // Reset form and show success
    setTitle("")
    setDescription("")
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)

    // Notify parent to refresh list
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Thanks! Your feedback has been submitted.
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || !email.trim() || !title.trim()}
        className="w-full"
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  )
}

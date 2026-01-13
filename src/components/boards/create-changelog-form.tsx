"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"

interface CreateChangelogFormProps {
  boardId: string
  onSuccess?: () => void
}

export function CreateChangelogForm({
  boardId,
  onSuccess,
}: CreateChangelogFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

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

    // Reset form and show success
    setTitle("")
    setContent("")
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)

    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Update published!
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || !title.trim()}
        className="w-full"
      >
        {loading ? "Publishing..." : "Publish Update"}
      </Button>
    </form>
  )
}

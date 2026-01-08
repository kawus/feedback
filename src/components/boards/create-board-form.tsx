"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { saveBoardToken } from "@/lib/board-tokens"

// Generate a URL-friendly slug from board name + random suffix
function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dashes
    .replace(/^-|-$/g, "") // Trim leading/trailing dashes
    .substring(0, 30) // Limit length

  // Add 4-char random suffix for uniqueness
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${base}-${suffix}`
}

// Generate a secure claim token
function generateClaimToken(): string {
  return `fb_claim_${crypto.randomUUID()}`
}

export function CreateBoardForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Check if Supabase is configured
    if (!supabase) {
      setError("Service unavailable. Please try again later.")
      setLoading(false)
      return
    }

    const slug = generateSlug(name)
    const claimToken = generateClaimToken()

    // Insert board into Supabase
    const { error: supabaseError } = await supabase.from("boards").insert({
      name: name.trim(),
      slug,
      claim_token: claimToken,
    })

    if (supabaseError) {
      setLoading(false)
      // Handle rare slug collision
      if (supabaseError.code === "23505") {
        setError("Please try again (name collision).")
      } else {
        setError("Something went wrong. Please try again.")
      }
      return
    }

    // Save the claim token to localStorage (proves ownership)
    saveBoardToken(slug, claimToken)

    // Redirect to the new board
    router.push(`/b/${slug}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="board-name"
          className="text-sm font-medium text-foreground"
        >
          Board name
        </label>
        <Input
          id="board-name"
          type="text"
          placeholder="e.g., Acme App Feedback"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          maxLength={100}
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          This is the name users will see. You can change it later.
        </p>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button type="submit" disabled={loading || !name.trim()} className="w-full">
        {loading ? "Creating..." : "Create Board"}
      </Button>
    </form>
  )
}

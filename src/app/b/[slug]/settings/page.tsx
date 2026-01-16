"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { isMyBoard, getBoardToken, removeBoardToken } from "@/lib/board-tokens"
import { useAuth } from "@/components/auth/auth-provider"
import { Board } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { sendMagicLink } from "@/lib/auth"
import { toast } from "@/components/ui/sonner"

export default function SettingsPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user } = useAuth()

  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [claimEmail, setClaimEmail] = useState("")
  const [claimLoading, setClaimLoading] = useState(false)
  const [claimError, setClaimError] = useState("")
  const [claimSuccess, setClaimSuccess] = useState(false)

  // Edit name state
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState("")

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    const { data: boardData, error: boardError } = await supabase
      .from("boards")
      .select("id, user_id, name, slug, expires_at, created_at")
      .eq("slug", slug)
      .single()

    if (boardError || !boardData) {
      setNotFoundState(true)
      setLoading(false)
      return
    }

    setBoard(boardData)

    // Check ownership
    const hasToken = isMyBoard(slug)
    const ownsViaAuth = user && boardData.user_id === user.id
    setIsOwner(hasToken || !!ownsViaAuth)

    setLoading(false)
  }, [slug, user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    setClaimLoading(true)
    setClaimError("")

    const claimToken = getBoardToken(slug)
    const redirectUrl = `${window.location.origin}/auth/callback?claim=${slug}&token=${claimToken}`

    const { error } = await sendMagicLink(claimEmail, redirectUrl)

    setClaimLoading(false)

    if (error) {
      setClaimError(error.message)
      return
    }

    setClaimSuccess(true)
  }

  const handleDelete = async () => {
    if (!board || !supabase) return

    setDeleting(true)

    const claimToken = getBoardToken(slug)

    const response = await fetch(`/api/boards/${board.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimToken }),
    })

    if (response.ok) {
      removeBoardToken(slug)
      router.push("/")
    } else {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleSaveName = async () => {
    if (!board || !newName.trim() || !supabase) return

    setSavingName(true)
    setNameError("")

    const claimToken = getBoardToken(slug)

    // Get auth token for claimed boards
    const { data: { session } } = await supabase.auth.getSession()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`/api/boards/${board.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ name: newName.trim(), claimToken }),
    })

    if (response.ok) {
      setBoard({ ...board, name: newName.trim() })
      setEditingName(false)
      toast.success("Board name updated")
    } else {
      const data = await response.json()
      setNameError(data.error || "Failed to update name")
    }

    setSavingName(false)
  }

  const startEditingName = () => {
    if (board) {
      setNewName(board.name)
      setEditingName(true)
      setNameError("")
    }
  }

  if (notFoundState) {
    notFound()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="mx-auto max-w-3xl px-6 py-4">
            <div className="h-8 w-32 rounded animate-shimmer" />
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="h-8 w-48 rounded animate-shimmer mb-8" />
          <div className="h-64 rounded-lg animate-shimmer" />
        </main>
      </div>
    )
  }

  if (!board) return null

  // Not owner - redirect or show error
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-semibold">F</span>
              </div>
              <span className="font-semibold text-foreground tracking-tight">FeedbackApp</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="text-center py-16">
            <p className="text-muted-foreground">You don&apos;t have access to these settings.</p>
            <Link href={`/b/${slug}`} className="text-primary hover:underline text-sm mt-4 inline-block">
              ← Back to board
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const createdDate = new Date(board.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-semibold">F</span>
            </div>
            <span className="font-semibold text-foreground tracking-tight">FeedbackApp</span>
          </Link>
          <Link
            href={`/b/${slug}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to board
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">{board.name}</p>
        </div>

        <div className="space-y-6">
          {/* Board Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Board Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground">Name</p>
                {editingName ? (
                  <div className="space-y-2 mt-1">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Board name"
                      disabled={savingName}
                      autoFocus
                    />
                    {nameError && (
                      <p className="text-destructive text-xs">{nameError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveName}
                        disabled={savingName || !newName.trim()}
                      >
                        {savingName ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingName(false)}
                        disabled={savingName}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{board.name}</p>
                    <button
                      onClick={startEditingName}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">URL</p>
                <p className="text-sm text-muted-foreground font-mono">
                  woerk.vercel.app/b/{board.slug}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Created</p>
                <p className="text-sm text-muted-foreground">{createdDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Status</p>
                <p className="text-sm text-muted-foreground">
                  {board.user_id ? (
                    <span className="text-green-600 dark:text-green-400">Claimed</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">Unclaimed (browser-only)</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Claim Board - only show for unclaimed boards */}
          {!board.user_id && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">Claim This Board</CardTitle>
                <CardDescription>
                  Link this board to your account to access it from any device.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {claimSuccess ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="font-semibold text-green-800 dark:text-green-200 text-sm">
                      Check your email!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      We sent a link to <strong>{claimEmail}</strong>. Click it to claim this board.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleClaim} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="claim-email" className="text-sm font-medium text-foreground">
                        Your email
                      </label>
                      <Input
                        id="claim-email"
                        type="email"
                        placeholder="you@example.com"
                        value={claimEmail}
                        onChange={(e) => setClaimEmail(e.target.value)}
                        required
                        disabled={claimLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        We&apos;ll send you a magic link. No password needed.
                      </p>
                    </div>
                    {claimError && (
                      <p className="text-destructive text-sm">{claimError}</p>
                    )}
                    <Button type="submit" disabled={claimLoading || !claimEmail}>
                      {claimLoading ? "Sending..." : "Send magic link"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                These actions are permanent and cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!confirmDelete ? (
                <Button
                  variant="destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete this board
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-destructive font-medium">
                    Are you sure? This will permanently delete:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>The board and all settings</li>
                    <li>All feedback posts</li>
                    <li>All votes</li>
                    <li>All changelog entries</li>
                  </ul>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Yes, delete everything"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

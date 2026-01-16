"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { PoweredByBadge } from "@/components/boards/powered-by-badge"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { isMyBoard, getBoardToken } from "@/lib/board-tokens"
import { useAuth } from "@/components/auth/auth-provider"
import { Board, ChangelogEntry } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CreateChangelogForm } from "@/components/boards/create-changelog-form"

export default function ChangelogPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()

  const [board, setBoard] = useState<Board | null>(null)
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

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

    // Check ownership: either via claim token (localStorage) or logged-in user
    const hasToken = isMyBoard(slug)
    const ownsViaAuth = user && boardData.user_id === user.id
    setIsOwner(hasToken || !!ownsViaAuth)

    // Fetch changelog entries, newest first
    const { data: entriesData } = await supabase
      .from("changelog_entries")
      .select("*")
      .eq("board_id", boardData.id)
      .order("published_at", { ascending: false })

    setEntries(entriesData || [])
    setLoading(false)
  }, [slug, user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (notFoundState) {
    notFound()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="mx-auto max-w-3xl px-6 py-4">
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (!board) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-semibold">
                F
              </span>
            </div>
            <span className="font-semibold text-foreground tracking-tight">
              FeedbackApp
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/b/${slug}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Feedback
            </Link>
            <Link
              href={`/b/${slug}/roadmap`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Roadmap
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
            {board.name}
          </h1>
          <p className="text-muted-foreground mt-1">Changelog</p>
        </div>

        {/* Admin form to add changelog entry */}
        {isOwner && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Post an Update</CardTitle>
              <p className="text-xs text-muted-foreground">Only you can post updates (admin)</p>
            </CardHeader>
            <CardContent>
              <CreateChangelogForm boardId={board.id} onSuccess={fetchData} />
            </CardContent>
          </Card>
        )}

        {/* Changelog entries */}
        {entries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No updates yet</p>
            <p className="text-sm mt-1">
              Check back soon for product announcements.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {entries.map((entry) => (
              <ChangelogCard
                key={entry.id}
                entry={entry}
                isOwner={isOwner}
                boardSlug={slug}
                onUpdate={fetchData}
              />
            ))}
          </div>
        )}

        <PoweredByBadge />
      </main>
    </div>
  )
}

function ChangelogCard({
  entry,
  isOwner,
  boardSlug,
  onUpdate,
}: {
  entry: ChangelogEntry
  isOwner: boolean
  boardSlug: string
  onUpdate: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(entry.title)
  const [editContent, setEditContent] = useState(entry.content || "")
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const date = new Date(entry.published_at)
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handleSave = async () => {
    if (!editTitle.trim() || !supabase) return

    setSaving(true)
    const claimToken = getBoardToken(boardSlug)

    // Get auth token for claimed boards
    const { data: { session } } = await supabase.auth.getSession()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`/api/changelog/${entry.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        title: editTitle.trim(),
        content: editContent.trim() || null,
        claimToken,
      }),
    })

    if (response.ok) {
      setEditing(false)
      onUpdate()
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    if (!supabase) return

    setDeleting(true)
    const claimToken = getBoardToken(boardSlug)

    // Get auth token for claimed boards
    const { data: { session } } = await supabase.auth.getSession()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`/api/changelog/${entry.id}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ claimToken }),
    })

    if (response.ok) {
      onUpdate()
    } else {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const startEditing = () => {
    setEditTitle(entry.title)
    setEditContent(entry.content || "")
    setEditing(true)
  }

  if (editing) {
    return (
      <article className="relative pl-6 border-l-2 border-border">
        <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary" />
        <time className="text-sm text-muted-foreground">{formattedDate}</time>

        <div className="space-y-3 mt-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title"
            disabled={saving}
            autoFocus
          />
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Content (optional)"
            disabled={saving}
            rows={3}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving || !editTitle.trim()}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="relative pl-6 border-l-2 border-border group">
      {/* Timeline dot */}
      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary" />

      {/* Date + Admin controls */}
      <div className="flex items-center gap-3">
        <time className="text-sm text-muted-foreground">{formattedDate}</time>
        {isOwner && !confirmDelete && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
            <button
              onClick={startEditing}
              className="text-xs text-primary hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-destructive hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive font-medium">Delete this update?</p>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Title */}
      {!confirmDelete && (
        <>
          <h2 className="text-lg font-semibold text-foreground mt-1 tracking-tight">
            {entry.title}
          </h2>

          {/* Content */}
          {entry.content && (
            <p className="text-muted-foreground mt-2 leading-relaxed">
              {entry.content}
            </p>
          )}
        </>
      )}
    </article>
  )
}

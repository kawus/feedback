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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CollapsibleChangelogForm } from "@/components/boards/collapsible-changelog-form"

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
            <div className="h-8 w-32 rounded animate-shimmer" />
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="h-8 w-48 rounded animate-shimmer mb-8" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-lg animate-shimmer" />
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
          <div className="flex items-center gap-1">
            <Link
              href={`/b/${slug}`}
              className="text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 py-1.5 rounded-md transition-colors"
            >
              Feedback
            </Link>
            <Link
              href={`/b/${slug}/roadmap`}
              className="text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 py-1.5 rounded-md transition-colors"
            >
              Roadmap
            </Link>
            <span className="text-sm font-medium text-foreground px-3 py-1.5 rounded-md bg-muted">
              Changelog
            </span>
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
          <div className="mb-8">
            <CollapsibleChangelogForm boardId={board.id} onSuccess={fetchData} />
          </div>
        )}

        {/* Changelog entries */}
        {entries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {/* Megaphone icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground/60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
                  />
                </svg>
              </div>
            </div>
            <p className="text-lg font-medium text-foreground">No updates yet</p>
            <p className="text-sm mt-1 max-w-xs mx-auto">
              {isOwner
                ? "Post your first update to keep users informed."
                : "Check back soon for product announcements."}
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

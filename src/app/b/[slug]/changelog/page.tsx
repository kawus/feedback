"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { PoweredByBadge } from "@/components/boards/powered-by-badge"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { isMyBoard } from "@/lib/board-tokens"
import { Board, ChangelogEntry } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateChangelogForm } from "@/components/boards/create-changelog-form"

export default function ChangelogPage() {
  const params = useParams()
  const slug = params.slug as string

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
    setIsOwner(isMyBoard(slug))

    // Fetch changelog entries, newest first
    const { data: entriesData } = await supabase
      .from("changelog_entries")
      .select("*")
      .eq("board_id", boardData.id)
      .order("published_at", { ascending: false })

    setEntries(entriesData || [])
    setLoading(false)
  }, [slug])

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
              <CardTitle className="text-lg">Add Update</CardTitle>
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
              <ChangelogCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        <PoweredByBadge />
      </main>
    </div>
  )
}

function ChangelogCard({ entry }: { entry: ChangelogEntry }) {
  const date = new Date(entry.published_at)
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <article className="relative pl-6 border-l-2 border-border">
      {/* Timeline dot */}
      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary" />

      {/* Date */}
      <time className="text-sm text-muted-foreground">{formattedDate}</time>

      {/* Title */}
      <h2 className="text-lg font-semibold text-foreground mt-1 tracking-tight">
        {entry.title}
      </h2>

      {/* Content */}
      {entry.content && (
        <p className="text-muted-foreground mt-2 leading-relaxed">
          {entry.content}
        </p>
      )}
    </article>
  )
}

"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { PoweredByBadge } from "@/components/boards/powered-by-badge"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Board, Post, PostStatus } from "@/types/database"

const columns: { status: PostStatus; label: string; color: string }[] = [
  { status: "planned", label: "Planned", color: "bg-blue-500" },
  { status: "in_progress", label: "In Progress", color: "bg-amber-500" },
  { status: "done", label: "Done", color: "bg-green-500" },
]

export default function RoadmapPage() {
  const params = useParams()
  const slug = params.slug as string

  const [board, setBoard] = useState<Board | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)

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

    // Fetch posts that are not "open" (only roadmap items)
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("board_id", boardData.id)
      .in("status", ["planned", "in_progress", "done"])
      .order("vote_count", { ascending: false })

    setPosts(postsData || [])
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
          <div className="mx-auto max-w-6xl px-6 py-4">
            <div className="h-8 w-32 rounded animate-shimmer" />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">
          <div className="h-8 w-48 rounded animate-shimmer mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-lg animate-shimmer" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (!board) return null

  const getPostsByStatus = (status: PostStatus) =>
    posts.filter((post) => post.status === status)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
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
            <span className="text-sm font-medium text-foreground px-3 py-1.5 rounded-md bg-muted">
              Roadmap
            </span>
            <Link
              href={`/b/${slug}/changelog`}
              className="text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 py-1.5 rounded-md transition-colors"
            >
              Changelog
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
            {board.name}
          </h1>
          <p className="text-muted-foreground mt-1">Product Roadmap</p>
        </div>

        {/* Kanban columns */}
        <div className="grid md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.status} className="flex flex-col">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h2 className="font-semibold text-foreground">
                  {column.label}
                </h2>
                <span className="text-sm text-muted-foreground">
                  ({getPostsByStatus(column.status).length})
                </span>
              </div>

              {/* Column cards */}
              <div className="space-y-3 flex-1">
                {getPostsByStatus(column.status).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg bg-muted/20">
                    <div className="flex gap-1 mb-3">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                    </div>
                    <p className="text-sm text-muted-foreground">Nothing here yet</p>
                  </div>
                ) : (
                  getPostsByStatus(column.status).map((post) => (
                    <RoadmapCard key={post.id} post={post} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <PoweredByBadge />
      </main>
    </div>
  )
}

function RoadmapCard({ post }: { post: Post }) {
  return (
    <div className="bg-card border rounded-lg p-4 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <h3 className="font-medium text-foreground text-sm">{post.title}</h3>
      {post.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {post.description}
        </p>
      )}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-muted-foreground">
          {post.vote_count} {post.vote_count === 1 ? "vote" : "votes"}
        </span>
      </div>
    </div>
  )
}

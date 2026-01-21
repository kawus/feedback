"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signOut } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

interface BoardSummary {
  id: string
  name: string
  slug: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [loadingBoards, setLoadingBoards] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
    }
  }, [user, authLoading, router])

  // Fetch user's claimed boards
  useEffect(() => {
    async function fetchBoards() {
      if (!supabase || !user) {
        setLoadingBoards(false)
        return
      }

      const { data } = await supabase
        .from("boards")
        .select("id, name, slug")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (data) {
        setBoards(data)
      }
      setLoadingBoards(false)
    }

    if (user) {
      fetchBoards()
    }
  }, [user])

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    // Reload to clear all cached state
    window.location.href = "/"
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-xl px-6 py-12">
          <div className="h-8 w-32 rounded animate-shimmer mb-8" />
          <div className="h-48 rounded-lg animate-shimmer" />
        </main>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-8">
          Profile
        </h1>

        {/* Account Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-foreground font-medium">{user.email}</p>
            </div>
            {user.created_at && (
              <div>
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="text-foreground">{formatDate(user.created_at)}</p>
              </div>
            )}
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Boards Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Boards</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBoards ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-8 rounded animate-shimmer" />
                ))}
              </div>
            ) : boards.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You haven&apos;t claimed any boards yet.
              </p>
            ) : (
              <div className="space-y-2">
                {boards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/b/${board.slug}`}
                    className="flex items-center gap-2 p-2 -mx-2 rounded-md hover:bg-muted transition-colors group"
                  >
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {board.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-foreground group-hover:text-primary transition-colors">
                      {board.name}
                    </span>
                  </Link>
                ))}
                {boards.length > 0 && (
                  <Link
                    href="/my-boards"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mt-2"
                  >
                    View all boards →
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

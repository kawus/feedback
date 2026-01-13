"use client"

import { useState } from "react"
import { useAuth } from "./auth-provider"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export function UserMenu() {
  const { user, loading } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  if (loading) return null
  if (!user) return null

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    // Reload to clear any cached state
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground hidden sm:inline">
        {user.email}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        disabled={signingOut}
      >
        {signingOut ? "..." : "Sign out"}
      </Button>
    </div>
  )
}

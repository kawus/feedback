import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BoardNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-4">
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
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-foreground tracking-tight mb-4">
            Board not found
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            This feedback board doesn't exist or may have expired. Unclaimed
            boards are removed after 30 days.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/">Go home</Link>
            </Button>
            <Button asChild>
              <Link href="/create">Create a board</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreateBoardForm } from "@/components/boards/create-board-form"

export default function CreateBoardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
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

      {/* Main content */}
      <main className="mx-auto max-w-md px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Create a feedback board</CardTitle>
            <CardDescription>
              Set up in seconds. No account required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateBoardForm />
          </CardContent>
        </Card>

        {/* Info text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Your board link will be saved to this browser.
          <br />
          Sign up later to access it from anywhere.
        </p>
      </main>
    </div>
  )
}

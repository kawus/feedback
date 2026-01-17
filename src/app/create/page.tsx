import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreateBoardForm } from "@/components/boards/create-board-form"
import { SiteHeader } from "@/components/layout/site-header"

export default function CreateBoardPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

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

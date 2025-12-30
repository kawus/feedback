"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-foreground tracking-tight">Design System</h1>
            <p className="text-sm text-muted-foreground">FeedbackApp Component Library</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Colors Section */}
        <Section title="Colors" description="Semantic color tokens using OKLCH color space">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="Background" variable="--background" className="bg-background border" />
            <ColorSwatch name="Foreground" variable="--foreground" className="bg-foreground" />
            <ColorSwatch name="Primary" variable="--primary" className="bg-primary" />
            <ColorSwatch name="Secondary" variable="--secondary" className="bg-secondary border" />
            <ColorSwatch name="Muted" variable="--muted" className="bg-muted border" />
            <ColorSwatch name="Accent" variable="--accent" className="bg-accent border" />
            <ColorSwatch name="Destructive" variable="--destructive" className="bg-destructive" />
            <ColorSwatch name="Border" variable="--border" className="bg-border" />
          </div>

          <h4 className="font-semibold text-foreground tracking-tight mt-8 mb-4">Chart Colors</h4>
          <div className="flex gap-2">
            <div className="w-12 h-12 rounded-md bg-[var(--chart-1)]" title="Chart 1" />
            <div className="w-12 h-12 rounded-md bg-[var(--chart-2)]" title="Chart 2" />
            <div className="w-12 h-12 rounded-md bg-[var(--chart-3)]" title="Chart 3" />
            <div className="w-12 h-12 rounded-md bg-[var(--chart-4)]" title="Chart 4" />
            <div className="w-12 h-12 rounded-md bg-[var(--chart-5)]" title="Chart 5" />
          </div>
        </Section>

        {/* Typography Section */}
        <Section title="Typography" description="Geist font family with size and weight scale">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Font Sizes</p>
              <div className="space-y-2">
                <p className="text-xs text-foreground">text-xs (12px) - Extra small text</p>
                <p className="text-sm text-foreground">text-sm (14px) - Small text</p>
                <p className="text-base text-foreground">text-base (16px) - Base text</p>
                <p className="text-lg text-foreground">text-lg (18px) - Large text</p>
                <p className="text-xl text-foreground">text-xl (20px) - Extra large</p>
                <p className="text-2xl text-foreground">text-2xl (24px) - 2X large</p>
                <p className="text-4xl text-foreground tracking-tight">text-4xl (36px) - Headlines</p>
                <p className="text-5xl text-foreground tracking-tight">text-5xl (48px) - Hero</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Font Weights</p>
              <div className="space-y-1">
                <p className="font-normal text-foreground">font-normal (400) - Regular body text</p>
                <p className="font-medium text-foreground">font-medium (500) - Medium emphasis</p>
                <p className="font-semibold text-foreground">font-semibold (600) - Headlines and labels</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Letter Spacing (Tracking)</p>
              <div className="space-y-1">
                <p className="text-2xl tracking-tighter text-foreground">tracking-tighter - Very tight</p>
                <p className="text-2xl tracking-tight text-foreground">tracking-tight - Headlines</p>
                <p className="text-2xl tracking-normal text-foreground">tracking-normal - Default</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Line Height (Leading)</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-2">leading-tight (1.25)</p>
                  <p className="leading-tight text-foreground">Used for headlines. Tighter line height creates more compact, impactful headings.</p>
                </div>
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-2">leading-relaxed (1.625)</p>
                  <p className="leading-relaxed text-foreground">Used for body text. More breathing room improves readability for longer content.</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Monospace</p>
              <p className="font-mono text-foreground">font-mono - Geist Mono for code</p>
            </div>
          </div>
        </Section>

        {/* Shadows Section */}
        <Section title="Shadows" description="Layered shadow system for natural depth">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ShadowExample name="shadow-sm" shadow="var(--shadow-sm)" />
            <ShadowExample name="shadow-md" shadow="var(--shadow-md)" />
            <ShadowExample name="shadow-lg" shadow="var(--shadow-lg)" />
            <ShadowExample name="shadow-hover" shadow="var(--shadow-hover)" />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Shadows use multiple layers with low opacity for subtle, premium depth. Dark mode uses higher opacity values.
          </p>
        </Section>

        {/* Spacing Section */}
        <Section title="Spacing" description="8px base grid system">
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <SpacingBlock size={1} label="4px" />
              <SpacingBlock size={2} label="8px" />
              <SpacingBlock size={3} label="12px" />
              <SpacingBlock size={4} label="16px" />
              <SpacingBlock size={6} label="24px" />
              <SpacingBlock size={8} label="32px" />
              <SpacingBlock size={12} label="48px" />
              <SpacingBlock size={16} label="64px" />
            </div>
            <p className="text-sm text-muted-foreground">
              Prefer 8px multiples: 8, 16, 24, 32, 48, 64. Use 4px and 12px sparingly for fine adjustments.
            </p>
          </div>
        </Section>

        {/* Border Radius Section */}
        <Section title="Border Radius" description="6px base radius (Linear-style)">
          <div className="flex items-end gap-4">
            <RadiusExample name="sm" size="2px" className="rounded-sm" />
            <RadiusExample name="md" size="4px" className="rounded-md" />
            <RadiusExample name="lg" size="6px" className="rounded-lg" />
            <RadiusExample name="xl" size="10px" className="rounded-xl" />
            <RadiusExample name="2xl" size="14px" className="rounded-2xl" />
            <RadiusExample name="full" size="9999px" className="rounded-full" />
          </div>
        </Section>

        {/* Buttons Section */}
        <Section title="Buttons" description="6 variants, 3 sizes, with hover lift animation">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Variants</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">Sizes</p>
              <div className="flex items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">States</p>
              <div className="flex gap-3">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </Section>

        {/* Inputs Section */}
        <Section title="Inputs" description="Form inputs with focus and error states">
          <div className="max-w-md space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Default</label>
              <Input placeholder="Enter your email..." />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">With value</label>
              <Input defaultValue="hello@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Disabled</label>
              <Input placeholder="Disabled input" disabled />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Error state</label>
              <Input placeholder="Invalid input" aria-invalid="true" />
              <p className="text-destructive text-sm mt-1">This field is required</p>
            </div>
          </div>
        </Section>

        {/* Badges Section */}
        <Section title="Badges" description="4 variants for labels and status indicators">
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </Section>

        {/* Cards Section */}
        <Section title="Cards" description="Container component with header, content, and footer">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here with supporting text.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Card content area. Use for main content, forms, or other UI elements.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>

            <div className="bg-muted rounded-lg p-6 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
              <h3 className="font-semibold text-foreground tracking-tight mb-2">Interactive Card</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Cards with hover lift effect. Used for clickable items like feature cards.</p>
            </div>
          </div>
        </Section>

        {/* Planned Components Section */}
        <Section title="Planned Components" description="Future additions to the design system">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PlannedComponent name="Modal/Dialog" />
            <PlannedComponent name="Dropdown Menu" />
            <PlannedComponent name="Toast" />
            <PlannedComponent name="Select" />
            <PlannedComponent name="Checkbox" />
            <PlannedComponent name="Radio Group" />
            <PlannedComponent name="Tabs" />
            <PlannedComponent name="Avatar" />
          </div>
        </Section>

        {/* Transitions Section */}
        <Section title="Transitions" description="Animation timing tokens">
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="font-medium text-foreground mb-1">Fast (150ms)</p>
                <p className="text-sm text-muted-foreground">Quick feedback for hover states</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="font-medium text-foreground mb-1">Base (200ms)</p>
                <p className="text-sm text-muted-foreground">Standard transitions</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="font-medium text-foreground mb-1">Spring</p>
                <p className="text-sm text-muted-foreground">Bouncy overshoot for transforms</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Easing: <code className="bg-muted px-1 rounded">ease-out</code> for standard,
              <code className="bg-muted px-1 rounded ml-1">cubic-bezier(0.34, 1.56, 0.64, 1)</code> for spring.
            </p>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-sm text-muted-foreground">
            Design system based on Linear/Notion-inspired functional minimalism.
          </p>
        </div>
      </footer>
    </div>
  )
}

// Helper Components

function Section({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-16">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-1">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function ColorSwatch({
  name,
  variable,
  className
}: {
  name: string
  variable: string
  className: string
}) {
  return (
    <div>
      <div className={`h-16 rounded-md ${className}`} />
      <p className="text-sm font-medium text-foreground mt-2">{name}</p>
      <p className="text-xs text-muted-foreground font-mono">{variable}</p>
    </div>
  )
}

function ShadowExample({
  name,
  shadow
}: {
  name: string
  shadow: string
}) {
  return (
    <div className="text-center">
      <div
        className="h-20 bg-card rounded-md border"
        style={{ boxShadow: shadow }}
      />
      <p className="text-sm font-medium text-foreground mt-2">{name}</p>
    </div>
  )
}

function SpacingBlock({
  size,
  label
}: {
  size: number
  label: string
}) {
  const height = size * 4
  return (
    <div className="text-center">
      <div
        className="w-8 bg-primary rounded-sm"
        style={{ height: `${height}px` }}
      />
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

function RadiusExample({
  name,
  size,
  className
}: {
  name: string
  size: string
  className: string
}) {
  return (
    <div className="text-center">
      <div className={`w-16 h-16 bg-primary ${className}`} />
      <p className="text-sm font-medium text-foreground mt-2">{name}</p>
      <p className="text-xs text-muted-foreground">{size}</p>
    </div>
  )
}

function PlannedComponent({ name }: { name: string }) {
  return (
    <div className="p-4 border border-dashed border-border rounded-md bg-muted/50">
      <p className="text-sm text-muted-foreground">{name}</p>
    </div>
  )
}

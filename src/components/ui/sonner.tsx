"use client"

import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      data-slot="toaster"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-[var(--shadow-lg)] group-[.toaster]:rounded-lg",
          title: "group-[.toast]:font-semibold group-[.toast]:tracking-tight",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:font-medium group-[.toast]:shadow-[var(--shadow-sm)] group-[.toast]:transition-all group-[.toast]:duration-200 group-[.toast]:hover:shadow-[var(--shadow-md)] group-[.toast]:hover:-translate-y-0.5",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md group-[.toast]:font-medium",
          error:
            "group-[.toaster]:bg-destructive group-[.toaster]:text-white group-[.toaster]:border-destructive",
          success:
            "group-[.toaster]:border-green-500/20 group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 dark:group-[.toaster]:bg-green-950 dark:group-[.toaster]:text-green-100",
          warning:
            "group-[.toaster]:border-yellow-500/20 group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-900 dark:group-[.toaster]:bg-yellow-950 dark:group-[.toaster]:text-yellow-100",
          info: "group-[.toaster]:border-blue-500/20 group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 dark:group-[.toaster]:bg-blue-950 dark:group-[.toaster]:text-blue-100",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }

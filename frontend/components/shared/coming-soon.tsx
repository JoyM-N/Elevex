import { Construction } from 'lucide-react'

/**
 * Lightweight placeholder for routes not yet built in later phases.
 */
export function ComingSoon({
  title,
  description = 'This section is coming in a later phase.',
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm shadow-primary/10 transition-transform duration-300 hover:scale-105">
        <Construction className="size-6" />
      </div>
      <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      <span className="mt-4 rounded-md bg-accent/70 px-2.5 py-1 text-xs font-medium text-accent-foreground">
        Coming soon
      </span>
    </div>
  )
}

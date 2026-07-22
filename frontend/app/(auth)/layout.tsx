/**
 * Auth Layout
 *
 * Brand-forward ambient shell for login / forgot / reset.
 * Completely separate from the dashboard layout.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-mesh relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Soft floating orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-primary/15 blur-3xl animate-pulse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-16 size-80 rounded-full bg-orange/20 blur-3xl"
        style={{ animation: 'pulse 4s ease-in-out infinite' }}
      />

      <div className="relative z-10 w-full max-w-md page-enter">
        <div className="text-center mb-8">
          <h1 className="font-heading text-5xl font-bold tracking-tight text-primary">
            Elevex
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Internship management, elevated.
          </p>
        </div>

        <div className="transition-transform duration-300 hover:translate-y-[-1px]">
          {children}
        </div>
      </div>
    </div>
  )
}

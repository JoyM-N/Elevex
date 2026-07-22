'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-svh items-center justify-center bg-background px-4 text-foreground">
        <div className="max-w-md space-y-4 text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Elevex ran into a problem
          </h2>
          <p className="text-sm text-muted-foreground">
            Please try again. If it keeps happening, refresh the page.
          </p>
          <Button onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  )
}

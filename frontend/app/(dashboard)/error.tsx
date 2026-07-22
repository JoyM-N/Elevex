'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div>
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Something went wrong
        </h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          This page hit an unexpected error. You can try again or head back to
          your dashboard.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => router.push('/')}>
          Go home
        </Button>
      </div>
    </div>
  )
}

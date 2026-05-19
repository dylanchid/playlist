'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Route Segment Error:', error)
  }, [error])

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center rounded-xl bg-muted/30 border border-border/50 my-8 mx-auto max-w-2xl">
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Failed to load content</h2>
      <p className="text-muted-foreground mb-6">
        There was a problem loading this section of the app. Please try refreshing the page.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
      </div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // In a production app, log this error to an APM service like Sentry
    console.error('Global Application Error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Something went wrong!</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            We&apos;ve encountered an unexpected error. Our team has been notified and is looking into it.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => reset()} variant="default">
              Try again
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Return Home
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}

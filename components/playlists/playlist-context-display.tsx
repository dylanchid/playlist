'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlaylistContextDisplayProps {
  contextStory: string
  className?: string
  maxLength?: number
  showIcon?: boolean
  variant?: 'default' | 'compact' | 'featured'
}

export const PlaylistContextDisplay: React.FC<PlaylistContextDisplayProps> = ({
  contextStory,
  className,
  maxLength = 120,
  showIcon = true,
  variant = 'default'
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (!contextStory) return null

  const shouldTruncate = contextStory.length > maxLength
  const displayText = shouldTruncate && !isExpanded 
    ? `${contextStory.substring(0, maxLength)}...` 
    : contextStory

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return "text-xs bg-muted/50 p-2 rounded-md"
      case 'featured':
        return "text-sm bg-primary/5 p-4 rounded-lg border-l-4 border-primary"
      default:
        return "text-sm bg-muted/30 p-3 rounded-md"
    }
  }

  return (
    <div className={cn(getVariantStyles(), className)}>
      <div className="flex items-start gap-2">
        {showIcon && (
          <Quote className={cn(
            "flex-shrink-0 text-muted-foreground mt-0.5",
            variant === 'compact' ? "w-3 h-3" : "w-4 h-4"
          )} />
        )}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "leading-relaxed",
            variant === 'featured' ? "font-medium" : "text-muted-foreground"
          )}>
            {displayText}
          </p>
          
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "h-auto p-0 mt-1 text-xs font-medium hover:bg-transparent",
                variant === 'featured' ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Alternative compact version for card previews
export const CompactContextDisplay: React.FC<{
  contextStory: string
  className?: string
}> = ({ contextStory, className }) => {
  if (!contextStory) return null
  
  const previewText = contextStory.length > 60 
    ? `${contextStory.substring(0, 60)}...` 
    : contextStory

  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <MessageCircle className="w-3 h-3 flex-shrink-0" />
      <span className="truncate italic">&quot;{previewText}&quot;</span>
    </div>
  )
} 
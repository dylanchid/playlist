'use client'

import React, { useState } from 'react'
import { Flame, Target, Lightbulb, Zap, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { toggleReaction } from '@/app/actions/social'
import type { ReactionType } from '@/types/database'
import { toast } from 'sonner'

interface ReactionPickerProps {
  playlistId: string
  initialReactions?: Record<ReactionType, number>
  userReaction?: ReactionType | null
  className?: string
}

const REACTION_CONFIG: Record<ReactionType, { icon: React.ReactNode, label: string, color: string, bgColor: string }> = {
  fire: { 
    icon: <Flame className="w-4 h-4" />, 
    label: 'Fire', 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-50 dark:bg-orange-950/20' 
  },
  perfect: { 
    icon: <Target className="w-4 h-4" />, 
    label: 'Perfect', 
    color: 'text-green-500', 
    bgColor: 'bg-green-50 dark:bg-green-950/20' 
  },
  thoughtful: { 
    icon: <Lightbulb className="w-4 h-4" />, 
    label: 'Thoughtful', 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-50 dark:bg-blue-950/20' 
  },
  energy: { 
    icon: <Zap className="w-4 h-4" />, 
    label: 'Energy', 
    color: 'text-yellow-500', 
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20' 
  }
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  playlistId,
  initialReactions = { fire: 0, perfect: 0, thoughtful: 0, energy: 0 },
  userReaction: initialUserReaction = null,
  className
}) => {
  const [reactions, setReactions] = useState(initialReactions)
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialUserReaction)
  const [isPending, setIsPending] = useState(false)

  const handleToggle = async (type: ReactionType) => {
    if (isPending) return
    setIsPending(true)

    // Optimistic update
    const isRemoving = userReaction === type
    setUserReaction(isRemoving ? null : type)
    setReactions(prev => ({
      ...prev,
      [type]: isRemoving ? prev[type] - 1 : prev[type] + 1,
      // If switching from another reaction, decrement the old one
      ...(userReaction && userReaction !== type ? { [userReaction]: prev[userReaction] - 1 } : {})
    }))

    try {
      await toggleReaction(playlistId, type)
    } catch {
      // Revert on error
      setUserReaction(initialUserReaction)
      setReactions(initialReactions)
      toast.error('Failed to update reaction. Database might be missing required tables.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
      {/* Display active reactions with counts */}
      {(Object.keys(REACTION_CONFIG) as ReactionType[]).map(type => {
        const count = reactions[type]
        if (count === 0 && userReaction !== type) return null

        const config = REACTION_CONFIG[type]
        const isActive = userReaction === type

        return (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2 rounded-full border transition-all duration-200",
              isActive ? cn("border-primary/50", config.bgColor) : "bg-muted/30 border-transparent hover:border-muted-foreground/20",
              config.color
            )}
            onClick={() => handleToggle(type)}
            disabled={isPending}
          >
            <span className="mr-1.5">{config.icon}</span>
            <span className="text-xs font-bold">{count}</span>
          </Button>
        )
      })}

      {/* Add new reaction button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full bg-muted/30 hover:bg-muted/50 p-0 text-muted-foreground"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-1" align="start">
          <div className="flex items-center gap-1">
            {(Object.keys(REACTION_CONFIG) as ReactionType[]).map(type => {
              const config = REACTION_CONFIG[type]
              const isActive = userReaction === type
              
              return (
                <Button
                  key={type}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-md transition-all duration-200",
                    isActive ? config.bgColor : "hover:bg-muted/50",
                    config.color
                  )}
                  onClick={() => handleToggle(type)}
                  title={config.label}
                  disabled={isPending}
                >
                  {config.icon}
                </Button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 

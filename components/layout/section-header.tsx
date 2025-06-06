'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  showViewAll?: boolean
  onViewAll?: () => void
  showNavigation?: boolean
  onPrevious?: () => void
  onNext?: () => void
  rightActions?: React.ReactNode
  className?: string
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  showViewAll = false,
  onViewAll,
  showNavigation = false,
  onPrevious,
  onNext,
  rightActions,
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold mb-1">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {showNavigation && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="h-8 w-8 p-0"
              disabled={!onPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              className="h-8 w-8 p-0"
              disabled={!onNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {rightActions}
        
        {showViewAll && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewAll}
          >
            View All →
          </Button>
        )}
      </div>
    </div>
  )
} 
'use client'

import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ContextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  minLength?: number
  maxLength?: number
  className?: string
  error?: string
  disabled?: boolean
}

export const ContextInput: React.FC<ContextInputProps> = ({
  value,
  onChange,
  placeholder = "Tell us the story behind this playlist. Why did you create it? What's it perfect for?",
  label = "Playlist Story",
  required = true,
  minLength = 10,
  maxLength = 500,
  className,
  error,
  disabled = false
}) => {
  const currentLength = value.length
  const isValid = currentLength >= minLength && currentLength <= maxLength
  const isAtMinimum = currentLength >= minLength

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="context-input" className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <span className={cn(
          "text-xs",
          currentLength < minLength ? "text-muted-foreground" : 
          isValid ? "text-green-600" : "text-red-500"
        )}>
          {currentLength}/{maxLength}
        </span>
      </div>
      
      <Textarea
        id="context-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "min-h-[100px] resize-none",
          error && "border-red-500 focus-visible:ring-red-500",
          isAtMinimum && "border-green-500 focus-visible:ring-green-500"
        )}
        maxLength={maxLength}
      />
      
      <div className="flex items-center justify-between text-xs">
        <div className="space-y-1">
          {currentLength < minLength && (
            <p className="text-amber-600">
              Need at least {minLength - currentLength} more characters
            </p>
          )}
          {error && (
            <p className="text-red-500">{error}</p>
          )}
          {isAtMinimum && !error && (
            <p className="text-green-600">Perfect! Your story looks great.</p>
          )}
        </div>
      </div>
      
      {required && (
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
          <p className="font-medium mb-1">💡 Why we ask for context:</p>
          <p>
            Your story helps friends understand why this playlist is special and when to listen to it. 
            This is what makes PlaylistShare different from other platforms!
          </p>
        </div>
      )}
    </div>
  )
} 
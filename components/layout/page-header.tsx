'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface PageHeaderProps {
  title: string
  icon?: React.ReactNode
  gradient?: string
  showSearch?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  rightActions?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon,
  gradient = "from-purple-500 to-pink-500",
  showSearch = false,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  rightActions,
  className = ""
}) => {
  return (
    <header className={`bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Title and Icon */}
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}>
                {icon}
              </div>
            )}
            <h1 className={`text-2xl font-bold bg-gradient-to-r ${gradient.replace('to-br', 'to-r')} bg-clip-text text-transparent`}>
              {title}
            </h1>
          </div>
          
          {/* Center - Search (if enabled) */}
          {showSearch && (
            <div className="flex-1 max-w-md mx-8 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                className="pl-10 rounded-full"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          )}
          
          {/* Right side - Actions */}
          <div className="flex items-center gap-4">
            {rightActions}
          </div>
        </div>
      </div>
    </header>
  )
} 
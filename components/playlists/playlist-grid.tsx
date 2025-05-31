'use client'

import React, { useState } from 'react'
import { PlaylistCard } from './playlist-card'
import { User } from '@/types/playlist'
import { PlaylistWithUser, PlaylistFilters } from '@/types/database'
import { usePlaylists, usePlaylistMutations } from '@/hooks/use-playlists'
import { useAuth } from '@/contexts/auth-context'

interface PlaylistGridProps {
  filters?: PlaylistFilters
  onLike?: (playlistId: string) => void
  onShare?: (playlist: PlaylistWithUser) => void
  isLiked?: (playlistId: string) => boolean
  emptyMessage?: string
  className?: string
  showMockData?: boolean // Keep for backward compatibility
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({
  filters = {},
  onLike,
  onShare,
  isLiked,
  emptyMessage = "No playlists found",
  className = "",
  showMockData = false
}) => {
  // Get authenticated user
  const { user } = useAuth()
  
  // Fetch real data from Supabase
  const { 
    data: playlists = [], 
    isLoading, 
    error, 
    refetch 
  } = usePlaylists(filters)
  
  const { toggleLike } = usePlaylistMutations()
  
  // State for optimistic updates
  const [optimisticLikes, setOptimisticLikes] = useState<Record<string, boolean>>({})

  // Handle like functionality with real database updates
  const handleLike = onLike || (async (playlistId: string) => {
    if (!user) {
      // Redirect to login or show login modal
      alert('Please sign in to like playlists')
      return
    }

    try {
      // Optimistic update
      setOptimisticLikes(prev => ({
        ...prev,
        [playlistId]: !prev[playlistId]
      }))
      
      // Update in database
      await toggleLike.mutateAsync({ playlistId, userId: user.id })
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticLikes(prev => ({
        ...prev,
        [playlistId]: !prev[playlistId]
      }))
      console.error('Failed to toggle like:', error)
    }
  })

  const handleShare = onShare || ((playlist: PlaylistWithUser) => {
    const url = `${window.location.origin}/playlists/${playlist.id}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      // You might want to add a toast notification here
      alert('Playlist link copied to clipboard!')
    }
  })

  const checkIsLiked = isLiked || ((playlistId: string) => {
    // Check optimistic state first, then fall back to server data
    if (playlistId in optimisticLikes) {
      return optimisticLikes[playlistId]
    }
    // This would need to be implemented with user context
    return false
  })

  // Loading state
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <PlaylistCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-red-500 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Failed to load playlists
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-4">
          There was an error loading the playlists. Please try again.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Empty state
  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Discover amazing playlists from the community or create your own to get started.
        </p>
      </div>
    )
  }

  // Render playlists
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {playlists.map((playlist) => {
        // The data from Supabase already includes user_profiles data
        const user: User = {
          id: playlist.user_profiles?.id || playlist.user_id,
          username: playlist.user_profiles?.username || 'Unknown User',
          avatar_url: playlist.user_profiles?.avatar_url || undefined,
          bio: '',
          followers_count: 0,
          following_count: 0,
          playlists_count: 0,
          created_at: '',
          updated_at: ''
        }
        
        return (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            user={user}
            onLike={handleLike}
            onShare={handleShare}
            isLiked={checkIsLiked(playlist.id)}
          />
        )
      })}
    </div>
  )
}

// Loading skeleton component (improved with better accessibility)
const PlaylistCardSkeleton: React.FC = () => {
  return (
    <div 
      className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden animate-pulse"
      role="status"
      aria-label="Loading playlist"
    >
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
        
        <div className="flex items-center gap-4 mb-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8" />
        </div>
        
        <div className="flex gap-1 mb-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-14" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
} 
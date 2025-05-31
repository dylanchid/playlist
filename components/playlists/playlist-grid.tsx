'use client'

import React, { useState } from 'react'
import { PlaylistCard } from './playlist-card'
import { Playlist, User } from '@/types/playlist'
import { mockPlaylists, mockUsers } from '@/lib/mockData'

interface PlaylistGridProps {
  playlists?: Playlist[]
  onLike?: (playlistId: string) => void
  onShare?: (playlist: Playlist) => void
  isLiked?: (playlistId: string) => boolean
  loading?: boolean
  emptyMessage?: string
  className?: string
  showMockData?: boolean
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({
  playlists,
  onLike,
  onShare,
  isLiked,
  loading = false,
  emptyMessage = "No playlists found",
  className = "",
  showMockData = false
}) => {
  // State for demo functionality when using mock data
  const [likedPlaylists, setLikedPlaylists] = useState(new Set<string>())

  // Use mock data if no playlists provided or if explicitly requested
  const displayPlaylists = playlists || (showMockData ? mockPlaylists : [])
  
  // Helper function to get user by ID
  const getUserById = (userId: string): User | undefined => {
    return mockUsers.find(user => user.id === userId)
  }
  
  // Default handlers for mock data demo
  const handleLike = onLike || ((playlistId: string) => {
    setLikedPlaylists(prev => {
      const newSet = new Set(prev)
      if (newSet.has(playlistId)) {
        newSet.delete(playlistId)
      } else {
        newSet.add(playlistId)
      }
      return newSet
    })
  })

  const handleShare = onShare || ((playlist: Playlist) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Check out this playlist: ${playlist.name}`)
      alert('Playlist link copied to clipboard!')
    }
  })

  const checkIsLiked = isLiked || ((playlistId: string) => likedPlaylists.has(playlistId))

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <PlaylistCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (displayPlaylists.length === 0) {
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

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {displayPlaylists.map((playlist) => {
        const user = getUserById(playlist.user_id)
        if (!user) return null
        
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

// Loading skeleton component
const PlaylistCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden animate-pulse">
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
    </div>
  )
} 
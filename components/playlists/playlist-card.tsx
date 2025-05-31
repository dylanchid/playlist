'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Heart, Play, Share2, Music, Clock, Eye, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PlaylistCardProps, formatDuration } from '@/types/playlist'

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ 
  playlist, 
  user,
  onLike, 
  onShare, 
  isLiked 
}) => {
  const [localLikes, setLocalLikes] = useState(playlist.likes_count || 0)
  const [liked, setLiked] = useState(isLiked)

  const handleLike = () => {
    setLiked(!liked)
    setLocalLikes(prev => liked ? prev - 1 : prev + 1)
    onLike(playlist.id)
  }

  const handleShare = () => {
    onShare(playlist)
  }

  const handleExternalLink = () => {
    if (playlist.external_url) {
      window.open(playlist.external_url, '_blank', 'noopener,noreferrer')
    } else {
      // For now, we'll just copy the playlist link to clipboard
      const playlistUrl = `${window.location.origin}/playlist/${playlist.id}`
      navigator.clipboard.writeText(playlistUrl)
    }
  }

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform) {
      case 'spotify':
        return 'bg-green-500 text-white hover:bg-green-600'
      case 'apple':
        return 'bg-gray-900 text-white hover:bg-gray-800'
      case 'custom':
        return 'bg-blue-500 text-white hover:bg-blue-600'
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600'
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'spotify':
        return 'Spotify'
      case 'apple':
        return 'Apple Music'
      case 'custom':
        return 'Custom'
      default:
        return platform
    }
  }

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center relative">
          {playlist.cover_image_url ? (
            <Image 
              src={playlist.cover_image_url} 
              alt={playlist.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <Music className="w-16 h-16 text-white opacity-80" />
          )}
        </div>
        
        <div className="absolute top-3 right-3">
          <Badge className={getPlatformBadgeColor(playlist.platform)}>
            {getPlatformName(playlist.platform)}
          </Badge>
        </div>
        
        <Button
          size="sm"
          className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-800 shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Play className="w-4 h-4" />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">
            {playlist.name}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`transition-colors ${
              liked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        {playlist.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {playlist.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Music className="w-4 h-4" />
            {playlist.track_count} tracks
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDuration(playlist.duration_ms)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {playlist.plays_count || 0}
          </span>
        </div>
        
        {playlist.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {playlist.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {playlist.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{playlist.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage 
                src={user.avatar_url} 
                alt={user.username}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user.username}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {localLikes} likes
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExternalLink}
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
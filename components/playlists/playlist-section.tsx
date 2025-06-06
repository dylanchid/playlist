'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Heart, Share2, Music2, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface PlaylistData {
  id: string
  name: string
  description: string
  coverUrl: string
  user: {
    username: string
    avatar_url: string
  }
  trackCount: number
  likes: number
  genre: string
  platform: string
  duration?: string
}

interface PlaylistSectionProps {
  title: string
  subtitle?: string
  playlists: PlaylistData[]
  layout?: 'carousel' | 'grid' | 'list'
  showViewAll?: boolean
  itemsPerRow?: number
  onPlaylistClick?: (playlist: PlaylistData) => void
  onLike?: (playlistId: string) => void
  onShare?: (playlist: PlaylistData) => void
}

export const PlaylistSection: React.FC<PlaylistSectionProps> = ({
  title,
  subtitle,
  playlists,
  layout = 'carousel',
  showViewAll = true,
  itemsPerRow = 4,
  onPlaylistClick,
  onLike,
  onShare
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedPlaylists, setLikedPlaylists] = useState<Set<string>>(new Set())

  const handleLike = (playlistId: string) => {
    setLikedPlaylists(prev => {
      const newSet = new Set(prev)
      if (newSet.has(playlistId)) {
        newSet.delete(playlistId)
      } else {
        newSet.add(playlistId)
      }
      return newSet
    })
    onLike?.(playlistId)
  }

  const handleShare = (playlist: PlaylistData) => {
    navigator.clipboard.writeText(`Check out this playlist: ${playlist.name}`)
    alert('Playlist link copied!')
    onShare?.(playlist)
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Spotify': return 'bg-green-500'
      case 'Apple Music': return 'bg-red-500'
      case 'Custom': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const nextSlide = () => {
    if (layout === 'carousel') {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(playlists.length / itemsPerRow))
    }
  }

  const prevSlide = () => {
    if (layout === 'carousel') {
      setCurrentIndex((prev) => (prev - 1 + Math.ceil(playlists.length / itemsPerRow)) % Math.ceil(playlists.length / itemsPerRow))
    }
  }

  const getVisiblePlaylists = () => {
    if (layout === 'carousel') {
      const startIndex = currentIndex * itemsPerRow
      return playlists.slice(startIndex, startIndex + itemsPerRow)
    }
    return playlists
  }

  const PlaylistCard = ({ playlist }: { playlist: PlaylistData }) => (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      onClick={() => onPlaylistClick?.(playlist)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={playlist.coverUrl} 
          alt={playlist.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <Button 
            size="lg" 
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-black hover:bg-gray-100"
          >
            <Play className="w-5 h-5 mr-2" />
            Play
          </Button>
        </div>
        <Badge className={`absolute top-2 right-2 ${getPlatformColor(playlist.platform)} text-white border-0`}>
          {playlist.platform}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{playlist.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{playlist.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={playlist.user.avatar_url} />
            <AvatarFallback className="text-xs">{playlist.user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">@{playlist.user.username}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Music2 className="w-3 h-3" />
              {playlist.trackCount}
            </span>
            {playlist.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {playlist.duration}
              </span>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {playlist.genre}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleLike(playlist.id)
            }}
            className={`h-8 px-2 ${likedPlaylists.has(playlist.id) ? 'text-red-500' : ''}`}
          >
            <Heart className={`w-4 h-4 mr-1 ${likedPlaylists.has(playlist.id) ? 'fill-current' : ''}`} />
            {playlist.likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleShare(playlist)
            }}
            className="h-8 px-2"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const ListItem = ({ playlist }: { playlist: PlaylistData }) => (
    <div 
      className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
      onClick={() => onPlaylistClick?.(playlist)}
    >
      <img 
        src={playlist.coverUrl} 
        alt={playlist.name}
        className="w-16 h-16 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{playlist.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{playlist.description}</p>
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Avatar className="h-4 w-4">
              <AvatarImage src={playlist.user.avatar_url} />
              <AvatarFallback className="text-xs">{playlist.user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            @{playlist.user.username}
          </span>
          <span className="flex items-center gap-1">
            <Music2 className="w-3 h-3" />
            {playlist.trackCount} tracks
          </span>
          <Badge variant="outline" className="text-xs">
            {playlist.genre}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleLike(playlist.id)
          }}
          className={`h-8 px-2 ${likedPlaylists.has(playlist.id) ? 'text-red-500' : ''}`}
        >
          <Heart className={`w-4 h-4 mr-1 ${likedPlaylists.has(playlist.id) ? 'fill-current' : ''}`} />
          {playlist.likes}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleShare(playlist)
          }}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <section className="w-full py-8">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {layout === 'carousel' && playlists.length > itemsPerRow && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevSlide}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextSlide}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            {showViewAll && (
              <Button variant="ghost" size="sm">
                View All →
              </Button>
            )}
          </div>
        </div>

        {layout === 'list' ? (
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <ListItem key={playlist.id} playlist={playlist} />
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${itemsPerRow} gap-6`}>
            {getVisiblePlaylists().map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}

        {layout === 'carousel' && playlists.length > itemsPerRow && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.ceil(playlists.length / itemsPerRow) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex 
                    ? 'bg-primary' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
} 
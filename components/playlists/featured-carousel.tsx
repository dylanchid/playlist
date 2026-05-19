'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play, Heart, Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { FeaturedPlaylistItem } from '@/lib/playlists/map-for-ui'

interface FeaturedCarouselProps {
  playlists: FeaturedPlaylistItem[]
  isLoading?: boolean
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  playlists,
  isLoading = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedPlaylists, setLikedPlaylists] = useState<Set<string>>(new Set())

  useEffect(() => {
    setCurrentIndex(0)
  }, [playlists.length])

  const nextSlide = () => {
    if (playlists.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % playlists.length)
  }

  const prevSlide = () => {
    if (playlists.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + playlists.length) % playlists.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

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
  }

  const handleShare = (playlist: FeaturedPlaylistItem) => {
    const url = `${window.location.origin}/playlists/${playlist.id}`
    navigator.clipboard.writeText(url)
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Spotify': return 'bg-green-500'
      case 'Apple Music': return 'bg-red-500'
      case 'Custom': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="h-full">
        <h2 className="text-2xl font-bold mb-4">Featured Playlists</h2>
        <Card className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading featured playlists…</p>
        </Card>
      </div>
    )
  }

  if (playlists.length === 0) {
    return (
      <div className="h-full">
        <h2 className="text-2xl font-bold mb-4">Featured Playlists</h2>
        <Card className="h-80 flex items-center justify-center p-6 text-center">
          <p className="text-muted-foreground text-sm">
            No playlists to feature yet. Check back after the community shares music.
          </p>
        </Card>
      </div>
    )
  }

  const currentPlaylist = playlists[currentIndex]

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Featured Playlists</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            className="h-8 w-8 p-0"
            disabled={playlists.length <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            className="h-8 w-8 p-0"
            disabled={playlists.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden h-80 relative group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
        
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500 bg-muted"
          style={currentPlaylist.coverUrl ? { backgroundImage: `url(${currentPlaylist.coverUrl})` } : undefined}
        />
        
        <CardContent className="relative z-20 h-full flex flex-col justify-end p-6 text-white">
          <div className="absolute top-4 right-4">
            <Badge className={`${getPlatformColor(currentPlaylist.platform)} text-white border-0`}>
              {currentPlaylist.platform}
            </Badge>
          </div>

          <Badge variant="secondary" className="w-fit mb-3 bg-white/20 text-white border-0">
            {currentPlaylist.genre}
          </Badge>

          <h3 className="text-2xl font-bold mb-2">{currentPlaylist.title}</h3>
          <p className="text-gray-200 mb-4 line-clamp-2">{currentPlaylist.description}</p>
          
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentPlaylist.curator.avatar_url || undefined} />
              <AvatarFallback>{currentPlaylist.curator.username[0]?.toUpperCase() ?? '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">@{currentPlaylist.curator.username}</p>
              <p className="text-xs text-gray-300">{currentPlaylist.trackCount} tracks</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-white text-black hover:bg-gray-100" asChild>
              <Link href={`/playlists/${currentPlaylist.id}`}>
                <Play className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(currentPlaylist.id)}
              className={`text-white hover:bg-white/20 ${
                likedPlaylists.has(currentPlaylist.id) ? 'text-red-400' : ''
              }`}
            >
              <Heart className={`h-4 w-4 mr-1 ${likedPlaylists.has(currentPlaylist.id) ? 'fill-current' : ''}`} />
              {currentPlaylist.likes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare(currentPlaylist)}
              className="text-white hover:bg-white/20"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              asChild
            >
              <Link href={`/playlists/${currentPlaylist.id}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {playlists.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {playlists.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-primary' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

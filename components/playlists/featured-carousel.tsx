'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Heart, Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'


// Mock data for featured playlists
const featuredPlaylists = [
  {
    id: 1,
    title: 'Indie Chill',
    description: 'Relaxed indie tracks for a perfect day.',
    curator: {
      name: 'Chris L.',
      username: 'chrisl',
      avatar_url: null
    },
    trackCount: 50,
    coverUrl: null,
    tags: ['chill', 'indie', 'acoustic'],
    platform: 'Spotify',
    genre: 'Indie',
    likes: 1234
  },
  {
    id: 2,
    title: 'Lo-fi Beats',
    description: 'Beats to study, relax, or sleep to.',
    curator: {
      name: 'Sarah J.',
      username: 'sarahj',
      avatar_url: null
    },
    trackCount: 120,
    coverUrl: null,
    tags: ['lo-fi', 'hip-hop', 'study'],
    platform: 'Spotify',
    genre: 'Lo-fi',
    likes: 5678
  },
  {
    id: 3,
    title: 'Mountain Drive',
    description: 'Upbeat tracks for your next adventure.',
    curator: {
      name: 'Mike D.',
      username: 'miked',
      avatar_url: null
    },
    trackCount: 30,
    coverUrl: null,
    tags: ['driving', 'upbeat', 'electronic'],
    platform: 'Apple Music',
    genre: 'Electronic',
    likes: 2345
  },
  {
    id: 4,
    title: 'Summer Vibes',
    description: 'The ultimate summer playlist.',
    curator: {
      name: 'Alex R.',
      username: 'alexr',
      avatar_url: null
    },
    trackCount: 75,
    coverUrl: null,
    tags: ['summer', 'pop', 'feel-good'],
    platform: 'Custom',
    genre: 'Pop',
    likes: 3456
  }
];

export const FeaturedCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedPlaylists, setLikedPlaylists] = useState<Set<string>>(new Set())

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredPlaylists.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredPlaylists.length) % featuredPlaylists.length)
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

  const handleShare = (playlist: { title: string }) => {
    navigator.clipboard.writeText(`Check out this playlist: ${playlist.title}`)
    // Replace with toast notification in production
    alert('Playlist link copied to clipboard!')
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Spotify': return 'bg-green-500'
      case 'Apple Music': return 'bg-red-500'
      case 'Custom': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const currentPlaylist = featuredPlaylists[currentIndex]

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
        </div>
      </div>

      <Card className="overflow-hidden h-80 relative group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={currentPlaylist.coverUrl ? { backgroundImage: `url(${currentPlaylist.coverUrl})` } : {}}
        />
        
        <CardContent className="relative z-20 h-full flex flex-col justify-end p-6 text-white">
          {/* Platform Badge */}
          <div className="absolute top-4 right-4">
            <Badge className={`${getPlatformColor(currentPlaylist.platform)} text-white border-0`}>
              {currentPlaylist.platform}
            </Badge>
          </div>

          {/* Genre Badge */}
          <Badge variant="secondary" className="w-fit mb-3 bg-white/20 text-white border-0">
            {currentPlaylist.genre}
          </Badge>

          {/* Playlist Info */}
          <h3 className="text-2xl font-bold mb-2">{currentPlaylist.title}</h3>
          <p className="text-gray-200 mb-4 line-clamp-2">{currentPlaylist.description}</p>
          
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentPlaylist.curator.avatar_url || undefined} />
              <AvatarFallback>{currentPlaylist.curator.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">@{currentPlaylist.curator.username}</p>
              <p className="text-xs text-gray-300">{currentPlaylist.trackCount} tracks</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-white text-black hover:bg-gray-100">
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(currentPlaylist.id.toString())}
              className={`text-white hover:bg-white/20 ${
                likedPlaylists.has(currentPlaylist.id.toString()) ? 'text-red-400' : ''
              }`}
            >
              <Heart className={`h-4 w-4 mr-1 ${likedPlaylists.has(currentPlaylist.id.toString()) ? 'fill-current' : ''}`} />
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
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Carousel Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {featuredPlaylists.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex 
                ? 'bg-primary' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
} 
'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Heart, Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

// Mock data for featured playlists
const mockFeaturedPlaylists = [
  {
    id: '1',
    name: 'Indie Rock Vibes',
    description: 'Perfect blend of indie and alternative rock',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    user: {
      username: 'musiclover23',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
    },
    trackCount: 32,
    likes: 1245,
    genre: 'Indie Rock',
    platform: 'Spotify'
  },
  {
    id: '2',
    name: 'Chill Lo-Fi Study',
    description: 'Focus music for productive work sessions',
    coverUrl: 'https://images.unsplash.com/photo-1518972734183-c78f6c0b5b23?w=400&h=400&fit=crop',
    user: {
      username: 'studybeats',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop'
    },
    trackCount: 48,
    likes: 2103,
    genre: 'Lo-Fi',
    platform: 'Apple Music'
  },
  {
    id: '3',
    name: 'Summer Road Trip',
    description: 'Feel-good hits for long drives',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    user: {
      username: 'roadtripper',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    trackCount: 25,
    likes: 892,
    genre: 'Pop Rock',
    platform: 'Custom'
  },
  {
    id: '4',
    name: 'Late Night Jazz',
    description: 'Smooth jazz for evening relaxation',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    user: {
      username: 'jazzcat',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    },
    trackCount: 19,
    likes: 654,
    genre: 'Jazz',
    platform: 'Spotify'
  }
]

export const FeaturedCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedPlaylists, setLikedPlaylists] = useState<Set<string>>(new Set())

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % mockFeaturedPlaylists.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + mockFeaturedPlaylists.length) % mockFeaturedPlaylists.length)
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

  const handleShare = (playlist: any) => {
    navigator.clipboard.writeText(`Check out this playlist: ${playlist.name}`)
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

  const currentPlaylist = mockFeaturedPlaylists[currentIndex]

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
          style={{ backgroundImage: `url(${currentPlaylist.coverUrl})` }}
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
          <h3 className="text-2xl font-bold mb-2">{currentPlaylist.name}</h3>
          <p className="text-gray-200 mb-4 line-clamp-2">{currentPlaylist.description}</p>
          
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentPlaylist.user.avatar_url} />
              <AvatarFallback>{currentPlaylist.user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">@{currentPlaylist.user.username}</p>
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
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Carousel Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {mockFeaturedPlaylists.map((_, index) => (
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
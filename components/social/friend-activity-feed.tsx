'use client'

import React from 'react'
import { Heart, Music2, UserPlus, MessageCircle, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface FriendActivity {
  id: string
  user: {
    username: string
    avatar_url: string
  }
  type: 'like' | 'playlist_create' | 'follow' | 'comment'
  target?: {
    name: string
    coverUrl?: string
  }
  targetUser?: {
    username: string
  }
  message?: string
  timestamp: string
}

// Mock friend activity data
const mockActivities: FriendActivity[] = [
  {
    id: '1',
    user: {
      username: 'sarah_music',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop'
    },
    type: 'like',
    target: {
      name: 'Indie Rock Vibes',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop'
    },
    timestamp: '2h ago'
  },
  {
    id: '2',
    user: {
      username: 'mike_beats',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    type: 'playlist_create',
    target: {
      name: 'Morning Coffee Vibes',
      coverUrl: 'https://images.unsplash.com/photo-1518972734183-c78f6c0b5b23?w=80&h=80&fit=crop'
    },
    timestamp: '4h ago'
  },
  {
    id: '3',
    user: {
      username: 'emma_tunes',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
    },
    type: 'follow',
    targetUser: {
      username: 'alex_dj'
    },
    timestamp: '6h ago'
  },
  {
    id: '4',
    user: {
      username: 'alex_dj',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    },
    type: 'comment',
    target: {
      name: 'Summer Road Trip',
      coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=80&fit=crop'
    },
    message: 'Perfect driving playlist! 🚗✨',
    timestamp: '8h ago'
  },
  {
    id: '5',
    user: {
      username: 'chill_vibes',
      avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop'
    },
    type: 'like',
    target: {
      name: 'Late Night Jazz',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop'
    },
    timestamp: '1d ago'
  },
  {
    id: '6',
    user: {
      username: 'beat_master',
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop'
    },
    type: 'playlist_create',
    target: {
      name: 'Electronic Dreams',
      coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=80&h=80&fit=crop'
    },
    timestamp: '1d ago'
  }
]

export const FriendActivityFeed: React.FC = () => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like': 
        return <Heart className="w-4 h-4 text-red-500" />
      case 'playlist_create': 
        return <Music2 className="w-4 h-4 text-green-500" />
      case 'follow': 
        return <UserPlus className="w-4 h-4 text-blue-500" />
      case 'comment': 
        return <MessageCircle className="w-4 h-4 text-purple-500" />
      default: 
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityText = (activity: FriendActivity) => {
    switch (activity.type) {
      case 'like':
        return (
          <span className="text-sm">
            <span className="font-medium">liked</span> "{activity.target?.name}"
          </span>
        )
      case 'playlist_create':
        return (
          <span className="text-sm">
            <span className="font-medium">created</span> "{activity.target?.name}"
          </span>
        )
      case 'follow':
        return (
          <span className="text-sm">
            <span className="font-medium">started following</span> @{activity.targetUser?.username}
          </span>
        )
      case 'comment':
        return (
          <div className="text-sm">
            <div>
              <span className="font-medium">commented on</span> "{activity.target?.name}"
            </div>
            {activity.message && (
              <div className="text-muted-foreground italic mt-1">
                "{activity.message}"
              </div>
            )}
          </div>
        )
      default:
        return <span className="text-sm">had some activity</span>
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'like': return 'border-l-red-500'
      case 'playlist_create': return 'border-l-green-500'
      case 'follow': return 'border-l-blue-500'
      case 'comment': return 'border-l-purple-500'
      default: return 'border-l-gray-500'
    }
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Friend Activity</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Live
          </Badge>
          <Button variant="ghost" size="sm" className="text-xs">
            View All
          </Button>
        </div>
      </div>

      <Card className="h-80">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Updates</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {mockActivities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 p-3 rounded-lg border-l-2 ${getActivityColor(activity.type)} bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer`}
              >
                {/* User Avatar */}
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={activity.user.avatar_url} />
                  <AvatarFallback>
                    {activity.user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">@{activity.user.username}</span>
                        {getActivityIcon(activity.type)}
                      </div>
                      {getActivityText(activity)}
                    </div>
                    
                    {/* Playlist/Target Image */}
                    {activity.target?.coverUrl && (
                      <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0 ml-2">
                        <img 
                          src={activity.target.coverUrl} 
                          alt={activity.target.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <UserPlus className="w-4 h-4 mr-2" />
          Find Friends
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Music2 className="w-4 h-4 mr-2" />
          Share Playlist
        </Button>
      </div>
    </div>
  )
} 
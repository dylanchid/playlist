'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Heart, Music2, UserPlus, MessageCircle, Clock, TrendingUp, Share2, Flame, Target, Lightbulb, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getFriendActivities, ReactionType } from '@/app/actions/social'
import { formatDistanceToNow } from 'date-fns'

interface ActivityMetadata {
  share_context?: string
  share_type?: string
  reaction_type?: ReactionType
  comment_text?: string
}

interface Activity {
  id: string
  user_id: string
  activity_type: string
  playlist_id?: string
  target_user_id?: string
  activity_metadata: ActivityMetadata
  created_at: string
  user_profiles?: {
    username: string
    avatar_url: string | null
  }
  playlists?: {
    name: string
    cover_image_url: string | null
  }
  target_profiles?: {
    username: string
  }
}

export const FriendActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getFriendActivities()
        setActivities(data as unknown as Activity[])
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const getActivityIcon = (type: string, metadata?: ActivityMetadata) => {
    switch (type) {
      case 'shared_playlist':
        return <Share2 className="w-4 h-4 text-blue-500" />
      case 'reacted':
        const reactionType = metadata?.reaction_type
        if (reactionType === 'fire') return <Flame className="w-4 h-4 text-orange-500" />
        if (reactionType === 'perfect') return <Target className="w-4 h-4 text-green-500" />
        if (reactionType === 'thoughtful') return <Lightbulb className="w-4 h-4 text-blue-500" />
        if (reactionType === 'energy') return <Zap className="w-4 h-4 text-yellow-500" />
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

  const getActivityText = (activity: Activity) => {
    const playlistName = activity.playlists?.name || 'a playlist'
    const targetUsername = activity.target_profiles?.username

    switch (activity.activity_type) {
      case 'shared_playlist':
        return (
          <span className="text-sm">
            <span className="font-medium">shared</span> &quot;{playlistName}&quot; {targetUsername ? `with @${targetUsername}` : ''}
            {activity.activity_metadata?.share_context && (
              <div className="text-muted-foreground italic mt-1 border-l-2 border-primary/20 pl-2">
                &quot;{activity.activity_metadata.share_context}&quot;
              </div>
            )}
          </span>
        )
      case 'reacted':
        const reactionType = activity.activity_metadata?.reaction_type || 'liked'
        return (
          <span className="text-sm">
            <span className="font-medium">reacted with {reactionType}</span> to &quot;{playlistName}&quot;
          </span>
        )
      case 'playlist_create':
        return (
          <span className="text-sm">
            <span className="font-medium">created</span> &quot;{playlistName}&quot;
          </span>
        )
      case 'follow':
        return (
          <span className="text-sm">
            <span className="font-medium">started following</span> @{targetUsername || 'someone'}
          </span>
        )
      case 'comment':
        return (
          <div className="text-sm">
            <div>
              <span className="font-medium">commented on</span> &quot;{playlistName}&quot;
            </div>
            {activity.activity_metadata?.comment_text && (
              <div className="text-muted-foreground italic mt-1">
                &quot;{activity.activity_metadata.comment_text}&quot;
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
      case 'shared_playlist': return 'border-l-blue-500'
      case 'reacted': return 'border-l-orange-500'
      case 'playlist_create': return 'border-l-green-500'
      case 'follow': return 'border-l-blue-500'
      case 'comment': return 'border-l-purple-500'
      default: return 'border-l-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <Card className="h-80">
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 bg-muted rounded"></div>
                  <div className="h-4 w-3/4 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
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
            Refresh
          </Button>
        </div>
      </div>

      <Card className="h-80">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Updates</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {activities.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Music2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>No activity yet. Follow friends to see their updates!</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-l-2 ${getActivityColor(activity.activity_type)} bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer`}
                >
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={activity.user_profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {activity.user_profiles?.username?.[0].toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">@{activity.user_profiles?.username}</span>
                          {getActivityIcon(activity.activity_type, activity.activity_metadata)}
                        </div>
                        {getActivityText(activity)}
                      </div>
                      
                      {activity.playlists?.cover_image_url && (
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0 ml-2 relative">
                          <Image
                            src={activity.playlists.cover_image_url} 
                            alt={activity.playlists.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <UserPlus className="w-4 h-4 mr-2" />
          Find Friends
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Share2 className="w-4 h-4 mr-2" />
          Share Playlist
        </Button>
      </div>
    </div>
  )
}

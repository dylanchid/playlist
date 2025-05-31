'use client'

import React, { useState } from 'react'
import { Users, UserPlus, Heart, MessageCircle, Music2, TrendingUp, Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlaylistCard } from '@/components/playlists/playlist-card'
import { PlaylistGrid } from '@/components/playlists/playlist-grid'
import { mockUsers, mockPlaylists } from '@/lib/mockData'
import type { User as UserData, Playlist } from '@/types/playlist'

interface FriendActivity {
  id: string
  user: UserData
  type: 'like' | 'playlist_create' | 'follow' | 'comment'
  target?: Playlist
  targetUser?: UserData
  message?: string
  timestamp: string
}

// Mock activity data
const mockActivities: FriendActivity[] = [
  {
    id: '1',
    user: mockUsers[0],
    type: 'like',
    target: mockPlaylists[0],
    timestamp: '2h ago'
  },
  {
    id: '2',
    user: mockUsers[1],
    type: 'playlist_create',
    target: mockPlaylists[1],
    timestamp: '4h ago'
  },
  {
    id: '3',
    user: mockUsers[2],
    type: 'follow',
    targetUser: mockUsers[3],
    timestamp: '6h ago'
  },
  {
    id: '4',
    user: mockUsers[3],
    type: 'comment',
    target: mockPlaylists[2],
    message: 'Amazing collection! Love the flow 🎵',
    timestamp: '1d ago'
  }
]

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [followedUsers, setFollowedUsers] = useState(new Set<string>(['1', '2']))
  const [likedPlaylists, setLikedPlaylists] = useState(new Set<string>())

  const handleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
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

  const handleShare = (playlist: Playlist) => {
    navigator.clipboard.writeText(`Check out this playlist: ${playlist.name}`)
    // Could be replaced with toast notification
    alert('Playlist link copied to clipboard!')
  }

  const friends = mockUsers.filter(user => followedUsers.has(user.id))
  const suggestions = mockUsers.filter(user => !followedUsers.has(user.id)).slice(0, 4)
  const friendsPlaylists = mockPlaylists.filter(playlist => 
    followedUsers.has(playlist.user_id)
  ).slice(0, 6)

  // For future search functionality
  // const filteredUsers = mockUsers.filter(user =>
  //   user.username.toLowerCase().includes(searchQuery.toLowerCase())
  // )

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />
      case 'playlist_create': return <Music2 className="w-4 h-4 text-green-500" />
      case 'follow': return <UserPlus className="w-4 h-4 text-blue-500" />
      case 'comment': return <MessageCircle className="w-4 h-4 text-purple-500" />
      default: return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityText = (activity: FriendActivity) => {
    switch (activity.type) {
      case 'like':
        return `liked playlist "${activity.target?.name}"`
      case 'playlist_create':
        return `created new playlist "${activity.target?.name}"`
      case 'follow':
        return `started following ${activity.targetUser?.username}`
      case 'comment':
        return `commented on "${activity.target?.name}"`
      default:
        return 'had some activity'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Friends
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search friends..."
                  className="pl-10 rounded-full w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{friends.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Friends</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{mockActivities.filter(a => a.timestamp.includes('h')).length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">New Activities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{friendsPlaylists.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Friend Playlists</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{suggestions.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Suggestions</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          {/* Activity Feed */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockActivities.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={activity.user.avatar_url} />
                          <AvatarFallback>{activity.user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{activity.user.username}</span>
                            {getActivityIcon(activity.type)}
                            <span className="text-sm text-gray-500">{activity.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getActivityText(activity)}
                          </p>
                                                     {activity.message && (
                             <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 italic">
                               &ldquo;{activity.message}&rdquo;
                             </p>
                           )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Friend Updates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {friends.slice(0, 4).map(friend => (
                      <div key={friend.id} className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{friend.username}</p>
                          <p className="text-xs text-gray-500">Active 2h ago</p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Add</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {suggestions.slice(0, 3).map(suggestion => (
                      <div key={suggestion.id} className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={suggestion.avatar_url} />
                          <AvatarFallback>{suggestion.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{suggestion.username}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFollow(suggestion.id)}
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Friends List */}
          <TabsContent value="friends">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map(friend => (
                <Card key={friend.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={friend.avatar_url} />
                        <AvatarFallback className="text-lg">{friend.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{friend.username}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{friend.bio}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>{friend.playlists_count} playlists</span>
                          <span>{friend.followers_count} followers</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFollow(friend.id)}
                        className="flex-1"
                      >
                        Following
                      </Button>
                      <Button variant="outline" size="sm">
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Friends' Playlists */}
          <TabsContent value="playlists">
            <PlaylistGrid 
              emptyMessage="No playlists from friends yet. Follow some friends to see their playlists!"
            />
          </TabsContent>

          {/* Friend Suggestions */}
          <TabsContent value="suggestions">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map(suggestion => (
                <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={suggestion.avatar_url} />
                        <AvatarFallback className="text-lg">{suggestion.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{suggestion.username}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.bio}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">Similar taste</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {suggestion.playlists_count} playlists • {suggestion.followers_count} followers
                    </div>
                    <Button
                      onClick={() => handleFollow(suggestion.id)}
                      className="w-full"
                      variant={followedUsers.has(suggestion.id) ? "outline" : "default"}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {followedUsers.has(suggestion.id) ? 'Following' : 'Follow'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 
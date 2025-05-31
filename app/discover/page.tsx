'use client';

import React, { useState } from 'react';
import { Music, Search, Plus } from 'lucide-react';
import { PlaylistCard } from '@/components/playlists/playlist-card';
import { UserProfile } from '@/components/users/user-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUsers, mockPlaylists } from '@/lib/mockData';
import type { User as UserData, Playlist } from '@/types/playlist';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [likedPlaylists, setLikedPlaylists] = useState(new Set<string>());
  const [followedUsers, setFollowedUsers] = useState(new Set<string>());
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLike = (playlistId: string) => {
    setLikedPlaylists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playlistId)) {
        newSet.delete(playlistId);
      } else {
        newSet.add(playlistId);
      }
      return newSet;
    });
  };

  const handleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleShare = (playlist: Playlist) => {
    navigator.clipboard.writeText(`Check out this playlist: ${playlist.name}`);
    // You could replace this with a toast notification
    alert('Playlist link copied to clipboard!');
  };

  const filteredUsers = mockUsers.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserPlaylists = (userId: string) => {
    return mockPlaylists.filter(playlist => playlist.user_id === userId);
  };

  const getUserById = (userId: string) => {
    return mockUsers.find(user => user.id === userId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                PlaylistShare
              </h1>
            </div>
            
            <div className="flex-1 max-w-md mx-8 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search users, playlists, or tags..."
                className="pl-10 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Playlist
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {selectedUser ? (
          <div>
            <Button 
              variant="ghost"
              onClick={() => setSelectedUser(null)}
              className="mb-6 text-purple-600 hover:text-purple-800"
            >
              ← Back to discover
            </Button>
            <UserProfile 
              user={selectedUser} 
              onFollow={handleFollow}
              isFollowing={followedUsers.has(selectedUser.id)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getUserPlaylists(selectedUser.id).map(playlist => {
                const playlistUser = getUserById(playlist.user_id);
                if (!playlistUser) return null;
                
                return (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    user={playlistUser}
                    onLike={handleLike}
                    onShare={handleShare}
                    isLiked={likedPlaylists.has(playlist.id)}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Discover Amazing Playlists
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Find and share the perfect soundtrack for every moment
              </p>
            </div>

            {/* Featured Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{mockPlaylists.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Playlists</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-pink-600">{mockUsers.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {mockPlaylists.reduce((sum, playlist) => sum + playlist.track_count, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Songs Shared</div>
                </CardContent>
              </Card>
            </div>

            {/* Trending Tags */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Trending Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(mockPlaylists.flatMap(p => p.tags)))
                  .slice(0, 10)
                  .map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900"
                      onClick={() => setSearchQuery(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* User Profiles and Playlists */}
            <div className="space-y-8">
              {filteredUsers.map(user => (
                <div key={user.id}>
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar_url} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                          {user.username}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.followers_count} followers
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost"
                      onClick={() => setSelectedUser(user)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      View Profile →
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getUserPlaylists(user.id).map(playlist => (
                      <PlaylistCard
                        key={playlist.id}
                        playlist={playlist}
                        user={user}
                        onLike={handleLike}
                        onShare={handleShare}
                        isLiked={likedPlaylists.has(playlist.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Connect Your Music</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Link your Spotify or Apple Music account to start sharing playlists.
              </p>
              <div className="space-y-3">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                  <Music className="w-5 h-5 mr-2" />
                  Connect Spotify
                </Button>
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  <Music className="w-5 h-5 mr-2" />
                  Connect Apple Music
                </Button>
              </div>
              <Button 
                variant="ghost"
                onClick={() => setShowCreateModal(false)}
                className="w-full mt-4"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 
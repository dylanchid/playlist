'use client';

import React, { useState } from 'react';
import { Music, Search, Plus } from 'lucide-react';
import { PlaylistGrid } from '@/components/playlists/playlist-grid';
import { UserProfile } from '@/components/users/user-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePlaylists } from '@/hooks/use-playlists';
import { PlaylistFilters } from '@/types';
import type { User as UserData } from '@/types/playlist';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create filters based on search and selections
  const filters: PlaylistFilters = {
    ...(searchQuery && { search: searchQuery }),
    ...(selectedTag && { tags: [selectedTag] }),
    ...(selectedUser && { user_id: selectedUser.id }),
  };

  // Fetch playlists for stats (without filters)
  const { data: allPlaylists = [] } = usePlaylists({});
  
  // Common tags from all playlists
  const allTags = Array.from(
    new Set(allPlaylists.flatMap(p => p.tags || []))
  ).slice(0, 10);

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
    setSearchQuery(''); // Clear search when selecting tag
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag('');
    setSelectedUser(null);
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
                placeholder="Search playlists..."
                className="pl-10 rounded-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedTag(''); // Clear tag when searching
                }}
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
              <div className="text-2xl font-bold text-purple-600">{allPlaylists.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Playlists</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">
                {Array.from(new Set(allPlaylists.map(p => p.user_id))).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {allPlaylists.reduce((sum, playlist) => sum + (playlist.track_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Songs Shared</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Trending Tags
            </h3>
            {(searchQuery || selectedTag || selectedUser) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge 
                key={tag} 
                variant={selectedTag === tag ? "default" : "secondary"}
                className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900"
                onClick={() => handleTagClick(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || selectedTag) && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <span>Filtering by:</span>
                {searchQuery && (
                  <Badge variant="outline">Search: "{searchQuery}"</Badge>
                )}
                {selectedTag && (
                  <Badge variant="outline">Tag: #{selectedTag}</Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Playlist Grid with Real Data */}
        <PlaylistGrid
          filters={filters}
          emptyMessage={
            searchQuery || selectedTag
              ? "No playlists match your filters. Try adjusting your search or tags."
              : "No playlists found. Be the first to create one!"
          }
          className="mb-8"
        />
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
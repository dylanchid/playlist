'use client';

import React, { useState } from 'react';
import { Music, Plus, Filter, TrendingUp, Clock, Users, Heart } from 'lucide-react';
import { PlaylistGrid } from '@/components/playlists/playlist-grid';
import { PlaylistSection } from '@/components/playlists/playlist-section';
import { PageHeader } from '@/components/common/page-header';
import { SectionHeader } from '@/components/common/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  ).slice(0, 15);

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
    setSearchQuery(''); // Clear search when selecting tag
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag('');
    setSelectedUser(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedTag(''); // Clear tag when searching
  };

  // Transform data for PlaylistSection component
  const transformPlaylistData = (playlist: any) => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description || '',
    coverUrl: playlist.cover_image_url || '/api/placeholder/300/300',
    user: {
      username: playlist.user_profiles?.username || 'Unknown',
      avatar_url: playlist.user_profiles?.avatar_url || ''
    },
    trackCount: playlist.track_count || 0,
    likes: playlist.likes_count || 0,
    genre: playlist.tags?.[0] || 'Mixed',
    platform: playlist.platform || 'Custom',
    duration: playlist.duration_ms ? `${Math.floor(playlist.duration_ms / 60000)}min` : '0min'
  });

  // Transform real data for different sections
  const trendingPlaylists = allPlaylists.slice(0, 8).map(transformPlaylistData);
  const newReleases = allPlaylists.slice(8, 16).map(transformPlaylistData);
  const recommendedPlaylists = allPlaylists.slice(16, 24).map(transformPlaylistData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header using PageHeader component */}
      <PageHeader
        title="Discover"
        icon={<Music className="w-6 h-6 text-white" />}
        gradient="from-purple-500 to-pink-500"
        showSearch={true}
        searchPlaceholder="Search playlists..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        rightActions={
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Playlist
          </Button>
        }
      />

      {/* Main Content with 60/40 Layout */}
      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Content Area (60%) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Welcome Section */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Discover Amazing Playlists</h2>
              <p className="text-muted-foreground mb-6">
                Find and share the perfect soundtrack for every moment
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Music className="w-5 h-5 text-purple-500 mr-2" />
                      <div className="text-2xl font-bold text-purple-600">{allPlaylists.length}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Total Playlists</div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-5 h-5 text-pink-500 mr-2" />
                      <div className="text-2xl font-bold text-pink-600">
                        {Array.from(new Set(allPlaylists.map(p => p.user_id))).length}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="w-5 h-5 text-blue-500 mr-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {allPlaylists.reduce((sum, playlist) => sum + (playlist.track_count || 0), 0)}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Songs Shared</div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Active Filters Display */}
            {(searchQuery || selectedTag) && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <Filter className="w-4 h-4" />
                    <span>Filtering by:</span>
                                         {searchQuery && (
                       <Badge variant="outline" className="bg-white dark:bg-blue-900">
                         Search: &quot;{searchQuery}&quot;
                       </Badge>
                     )}
                    {selectedTag && (
                      <Badge variant="outline" className="bg-white dark:bg-blue-900">
                        Tag: #{selectedTag}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </div>
            )}

            {/* Content Sections using PlaylistSection */}
            {(!searchQuery && !selectedTag) ? (
                             <>
                 {/* Trending Section */}
                 <div className="mb-8">
                   <PlaylistSection
                     title="Trending Now"
                     subtitle="What's popular on PlaylistShare"
                     playlists={trendingPlaylists}
                     layout="carousel"
                     showViewAll={true}
                   />
                 </div>

                 {/* New Releases Section */}
                 <div className="mb-8">
                   <PlaylistSection
                     title="Fresh Beats"
                     subtitle="Recently added playlists"
                     playlists={newReleases}
                     layout="grid"
                     itemsPerRow={2}
                     showViewAll={true}
                   />
                 </div>

                 {/* Recommended Section */}
                 <div className="mb-8">
                   <PlaylistSection
                     title="Recommended for You"
                     subtitle="Handpicked playlists based on popular trends"
                     playlists={recommendedPlaylists}
                     layout="list"
                     showViewAll={true}
                   />
                 </div>
               </>
            ) : (
              /* Filtered Results */
              <div>
                <SectionHeader
                  title="Search Results"
                  subtitle={
                    searchQuery 
                      ? `Results for &quot;${searchQuery}&quot;` 
                      : `Playlists tagged with #${selectedTag}`
                  }
                />
                <PlaylistGrid
                  filters={filters}
                  emptyMessage={
                    searchQuery || selectedTag
                      ? "No playlists match your filters. Try adjusting your search or tags."
                      : "No playlists found. Be the first to create one!"
                  }
                  className="mt-6"
                />
              </div>
            )}
          </div>

          {/* Sidebar (40%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold">Filters & Tags</h3>
                </div>

                {/* Genre Tags */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                      Popular Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant={selectedTag === tag ? "default" : "secondary"}
                          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                            selectedTag === tag 
                              ? "bg-purple-500 hover:bg-purple-600" 
                              : "hover:bg-purple-100 dark:hover:bg-purple-900"
                          }`}
                          onClick={() => handleTagClick(tag)}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Platform Filter */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                      Platform
                    </h4>
                    <div className="space-y-2">
                      <Badge className="bg-green-500 text-white cursor-pointer hover:bg-green-600 transition-colors">
                        <Music className="w-3 h-3 mr-1" />
                        Spotify
                      </Badge>
                      <Badge className="bg-gray-900 text-white cursor-pointer hover:bg-gray-800 transition-colors ml-2">
                        <Music className="w-3 h-3 mr-1" />
                        Apple Music
                      </Badge>
                      <Badge className="bg-purple-500 text-white cursor-pointer hover:bg-purple-600 transition-colors ml-2">
                        <Music className="w-3 h-3 mr-1" />
                        Custom
                      </Badge>
                    </div>
                  </div>
                </div>

                {(searchQuery || selectedTag || selectedUser) && (
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="w-full mt-4"
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Create Playlist CTA */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Share Your Music</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your music accounts and start sharing your favorite playlists with the community.
                </p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Community Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Most Popular Genre</span>
                    <Badge variant="outline">{allTags[0] || 'Hip-hop'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Today</span>
                    <span className="text-sm font-medium">{Math.floor(allPlaylists.length * 0.3)} users</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New This Week</span>
                    <span className="text-sm font-medium">{Math.floor(allPlaylists.length * 0.2)} playlists</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Connect Your Music</h3>
              <p className="text-muted-foreground mb-6">
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
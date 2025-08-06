"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Music, Clock, Users, Lock } from "lucide-react";
import { useSpotifyPlaylists } from "@/lib/spotify/queries";
import { PlaylistSelection } from "../post-playlist-modal";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SpotifyPlaylistListProps {
  onSelect: (selection: PlaylistSelection) => void;
  selectedPlaylist: PlaylistSelection | null;
}

export function SpotifyPlaylistList({ onSelect, selectedPlaylist }: SpotifyPlaylistListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: playlistsData, isLoading, error } = useSpotifyPlaylists();

  // Extract playlists from infinite query structure
  const playlists = playlistsData?.pages?.flatMap(page => page?.items || []) || [];

  const filteredPlaylists = playlists?.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatDuration = (totalMs: number) => {
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const isSelected = (playlistId: string) => {
    return selectedPlaylist?.type === "spotify" && 
           selectedPlaylist?.spotifyPlaylist?.id === playlistId;
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Playlists</h3>
        <p className="text-gray-400 mb-4">
          We couldn't fetch your Spotify playlists. Please try again.
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Your Spotify Playlists</h3>
        <p className="text-sm text-gray-400">
          Choose a playlist to import and share with your friends
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search your playlists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      {/* Playlist List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isLoading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-gray-900 border border-gray-800">
                <div className="flex gap-3">
                  <Skeleton className="w-14 h-14 rounded-lg bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-gray-700" />
                    <Skeleton className="h-3 w-1/2 bg-gray-700" />
                    <Skeleton className="h-3 w-1/4 bg-gray-700" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : filteredPlaylists.length === 0 ? (
          <div className="text-center py-8">
            <Music className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">
              {searchQuery ? "No playlists match your search" : "No playlists found"}
            </p>
          </div>
        ) : (
          filteredPlaylists.map((playlist) => (
            <Button
              key={playlist.id}
              variant="ghost"
              onClick={() => onSelect({
                type: "spotify",
                spotifyPlaylist: playlist
              })}
              className={cn(
                "w-full h-auto p-4 justify-start gap-3 hover:bg-gray-800 border border-transparent",
                isSelected(playlist.id) && "border-blue-500 bg-blue-500/10"
              )}
            >
              {/* Playlist Cover */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                {playlist.images?.[0] ? (
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Playlist Info */}
              <div className="flex-1 text-left space-y-1">
                <div className="font-medium truncate text-white">
                  {playlist.name}
                </div>
                
                {playlist.description && (
                  <div className="text-sm text-gray-400 line-clamp-1">
                    {playlist.description}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    <span>{playlist.tracks.total} tracks</span>
                  </div>
                  
                  {playlist.public !== undefined && (
                    <div className="flex items-center gap-1">
                      {playlist.public ? (
                        <Users className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                      <span>{playlist.public ? "Public" : "Private"}</span>
                    </div>
                  )}
                </div>
              </div>
            </Button>
          ))
        )}
      </div>

      {filteredPlaylists.length > 0 && (
        <div className="text-xs text-gray-500 text-center pt-2">
          {filteredPlaylists.length} playlist{filteredPlaylists.length !== 1 ? 's' : ''} available
        </div>
      )}
    </div>
  );
}
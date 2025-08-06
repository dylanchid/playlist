"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { createClient } from "@/lib/supabase/client";
import { fetchPlaylistById } from "@/lib/supabase/playlists";
import { PlaylistWithUser } from "@/types/database";

interface PlaylistPageProps {
  params: Promise<{ id: string }>;
}

export default function PlaylistPage({ params }: PlaylistPageProps) {
  const router = useRouter();
  const [playlist, setPlaylist] = useState<PlaylistWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlaylist() {
      try {
        const { id } = await params;
        
        if (!id) {
          setError("Playlist ID not provided");
          return;
        }

        const supabase = createClient();
        const playlistData = await fetchPlaylistById(supabase, id);
        
        if (!playlistData) {
          setError("Playlist not found");
          return;
        }

        setPlaylist(playlistData);
      } catch (err) {
        console.error("Error fetching playlist:", err);
        setError("Failed to load playlist");
      } finally {
        setLoading(false);
      }
    }

    loadPlaylist();
  }, [params]);

  const handleGoBack = () => {
    router.back();
  };

  const handleDiscoverMore = () => {
    router.push('/discover');
  };

  const handleOpenExternal = () => {
    if (playlist?.external_url) {
      window.open(playlist.external_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Playlist Not Found</h1>
              <p className="text-muted-foreground mb-6">
                {error || "The playlist you're looking for doesn't exist."}
              </p>
              <button 
                onClick={handleDiscoverMore}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                Discover Playlists
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{playlist.name} | PlaylistShare</title>
        <meta 
          name="description" 
          content={playlist.description || playlist.context_story || "View and enjoy this shared playlist on PlaylistShare"} 
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
            <p className="text-muted-foreground">
              by {playlist.user_profiles?.username || 'Unknown User'}
            </p>
          </div>

          {/* Playlist Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Cover Image Section */}
            <div className="relative h-64 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
              {playlist.cover_image_url && (
                <img
                  src={playlist.cover_image_url}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-end">
                <div className="p-8 text-white">
                  <h2 className="text-4xl font-bold mb-2">{playlist.name}</h2>
                  <p className="text-lg opacity-90">
                    {playlist.track_count || 0} tracks
                    {playlist.platform && (
                      <span className="ml-2 px-2 py-1 bg-white/20 rounded text-sm">
                        {playlist.platform.charAt(0).toUpperCase() + playlist.platform.slice(1)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-8">
              {/* Context Story */}
              {playlist.context_story && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Context Story</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300">{playlist.context_story}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {playlist.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{playlist.description}</p>
                </div>
              )}

              {/* Tags */}
              {playlist.tags && playlist.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {playlist.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Coming Soon Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                <h3 className="font-medium mb-3">Coming Soon</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Track listing and playback</li>
                  <li>• Social reactions and comments</li>
                  <li>• Share with friends</li>
                  <li>• Spotify/Apple Music integration</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={handleGoBack}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  ← Go Back
                </button>
                <button 
                  onClick={handleDiscoverMore}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  Discover More Playlists
                </button>
                {playlist.external_url && (
                  <button 
                    onClick={handleOpenExternal}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Open in {playlist.platform === 'spotify' ? 'Spotify' : 'Music App'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
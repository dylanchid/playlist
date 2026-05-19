"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchPlaylistById } from "@/lib/supabase/playlists";
import { openPlaylistPlayer } from "@/lib/playlists/open-playlist";
import { PlaylistWithUser } from "@/types/database";
import { ReactionPicker } from "@/components/social/reaction-picker";
import { ShareModal } from "@/components/playlists/share-modal";
import { PlaylistComments } from "@/components/playlists/playlist-comments";
import { sharePlaylist } from "@/app/actions/social";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PlaylistPageProps {
  params: Promise<{ id: string }>;
}

export default function PlaylistPage({ params }: PlaylistPageProps) {
  const router = useRouter();
  const [playlist, setPlaylist] = useState<PlaylistWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

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

  const handleShareWithContext = async (
    context: string,
    targetFriends?: string[],
    shareType?: "friend" | "public",
  ) => {
    if (!playlist) return;
    await sharePlaylist(
      playlist.id,
      targetFriends || [],
      context,
      shareType,
    );
    toast.success("Playlist shared!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Playlist Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "The playlist you're looking for doesn't exist."}
            </p>
            <Button onClick={() => router.push("/discover")}>
              Discover Playlists
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-64 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
              {playlist.cover_image_url && (
                <Image
                  src={playlist.cover_image_url}
                  alt={playlist.name}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-end">
                <div className="p-8 text-white w-full">
                  <h1 className="text-4xl font-bold mb-2">{playlist.name}</h1>
                  <p className="text-lg opacity-90">
                    by {playlist.user_profiles?.username || "Unknown User"} ·{" "}
                    {playlist.track_count || 0} tracks
                    {playlist.platform && (
                      <span className="ml-2 px-2 py-1 bg-white/20 rounded text-sm">
                        {playlist.platform.charAt(0).toUpperCase() +
                          playlist.platform.slice(1)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => openPlaylistPlayer(playlist)}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Play
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowShareModal(true)}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <ReactionPicker
                  playlistId={playlist.id}
                  initialReactions={playlist.reactions}
                  userReaction={playlist.user_reaction}
                />
              </div>

              {playlist.context_story && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Context Story</h2>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      {playlist.context_story}
                    </p>
                  </div>
                </div>
              )}

              {playlist.description && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Description</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {playlist.description}
                  </p>
                </div>
              )}

              {playlist.tags && playlist.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {playlist.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <PlaylistComments
                playlistId={playlist.id}
                hasContextStory={Boolean(playlist.context_story?.trim())}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              ← Go Back
            </Button>
            <Button onClick={() => router.push("/discover")}>
              Discover More
            </Button>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        playlist={playlist}
        onShare={handleShareWithContext}
      />
    </div>
  );
}

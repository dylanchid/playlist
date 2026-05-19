"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Music, Plus } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useSpotifyConnectionStatus } from "@/lib/spotify/queries";
import { ConnectMusicPanel } from "./post-playlist-modal/connect-music-panel";
import { SpotifyPlaylistList } from "./post-playlist-modal/spotify-playlist-list";
import { PlaylistDetailsForm } from "./post-playlist-modal/playlist-details-form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { SpotifyPlaylist } from "@/types/spotify";

export interface PlaylistSelection {
  type: "spotify" | "custom";
  spotifyPlaylist?: SpotifyPlaylist;
}

interface PostPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (playlistId: string) => void;
}

export function PostPlaylistModal({ isOpen, onClose, onSuccess }: PostPlaylistModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { data: spotifyConnection } = useSpotifyConnectionStatus();
  
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistSelection | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPlaylist(null);
      setIsCreating(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  const handlePlaylistSelect = (selection: PlaylistSelection) => {
    setSelectedPlaylist(selection);
  };

  const handleCreateSuccess = (playlistId: string) => {
    onSuccess?.(playlistId);
    onClose();
    // Show success notification
    toast.success("Playlist posted successfully! Redirecting...");
    // Navigate to the new playlist page
    router.push(`/playlists/${playlistId}`);
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-6xl h-[85vh] max-h-[600px] p-0 gap-0 bg-transparent border-none">
        {/* Modal container - wider rectangle */}
        <div className="w-full h-full flex rounded-lg overflow-hidden shadow-2xl">
            {/* Left Panel - Black */}
            <div className="w-1/2 h-full bg-black text-white flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <Music className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-semibold">Post Playlist</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white"
                  disabled={isCreating}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Music Platform Integration */}
              <div className="flex-1 overflow-y-auto p-6">
                {!spotifyConnection?.connected ? (
                  <ConnectMusicPanel onConnect={() => window.location.reload()} />
                ) : (
                  <SpotifyPlaylistList 
                    onSelect={handlePlaylistSelect}
                    selectedPlaylist={selectedPlaylist}
                  />
                )}

                {/* Create Custom Playlist Option */}
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <Button
                    variant="outline"
                    onClick={() => handlePlaylistSelect({ type: "custom" })}
                    className={cn(
                      "w-full justify-start gap-3 h-16 border-gray-700 bg-transparent text-white hover:bg-gray-900",
                      selectedPlaylist?.type === "custom" && "border-blue-500 bg-blue-500/10"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Create Custom Playlist</div>
                      <div className="text-sm text-gray-400">Start from scratch</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Panel - White */}
            <div className="w-1/2 h-full bg-white flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedPlaylist ? "Playlist Details" : "Select a playlist to continue"}
                </h3>
                {selectedPlaylist && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedPlaylist.type === "spotify" 
                      ? "Import and share your Spotify playlist" 
                      : "Create a new custom playlist"
                    }
                  </p>
                )}
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto">
                {selectedPlaylist ? (
                  <PlaylistDetailsForm
                    selection={selectedPlaylist}
                    onSuccess={handleCreateSuccess}
                    isCreating={isCreating}
                    setIsCreating={setIsCreating}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <Music className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Ready to share your music?</p>
                      <p>Choose a playlist from the left to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}

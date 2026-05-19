"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, Music } from "lucide-react";
import { useSpotifyConnect } from "@/lib/spotify/queries";
import { toast } from "sonner";

interface ConnectMusicPanelProps {
  onConnect: () => void;
}

export function ConnectMusicPanel({ onConnect }: ConnectMusicPanelProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const spotifyConnect = useSpotifyConnect();

  const handleSpotifyConnect = async () => {
    try {
      setIsConnecting(true);
      await spotifyConnect.mutateAsync();
      // Note: The mutation handles the redirect, so we won't reach this point
      // in normal flow, but it's here for completeness
      onConnect();
    } catch {
      toast.error("Failed to connect to Spotify");
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Connect Your Music</h3>
        <p className="text-gray-400">
          Import your existing playlists and share them with context
        </p>
      </div>

      {/* Spotify Connection */}
      <div className="space-y-4">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-2">Spotify</h4>
              <p className="text-sm text-gray-400 mb-4">
                Access your Spotify playlists and import them with full metadata and track information.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure OAuth authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>Import existing playlists</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  <span>Full track metadata sync</span>
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={handleSpotifyConnect}
            disabled={isConnecting}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
          >
            {isConnecting ? "Connecting..." : "Connect Spotify"}
          </Button>
        </div>

        {/* Coming Soon - Apple Music */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 opacity-60">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-600 flex items-center justify-center flex-shrink-0">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-2">Apple Music</h4>
              <p className="text-sm text-gray-400 mb-4">
                Apple Music integration coming soon. Import and share your Apple Music playlists.
              </p>
            </div>
          </div>
          <Button disabled className="w-full mt-4" variant="outline">
            Coming Soon
          </Button>
        </div>
      </div>

      {/* Manual Option */}
      <div className="text-center pt-4 border-t border-gray-800">
        <p className="text-sm text-gray-500 mb-3">
          Don&apos;t want to connect? You can still create custom playlists manually.
        </p>
        <Button 
          variant="outline" 
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
          onClick={() => onConnect()}
        >
          Skip for Now
        </Button>
      </div>
    </div>
  );
}
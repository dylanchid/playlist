"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Music, ExternalLink, X, Plus } from "lucide-react";
import { PlaylistSelection } from "../post-playlist-modal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PlaylistDetailsFormProps {
  selection: PlaylistSelection;
  onSuccess: (playlistId: string) => void;
  isCreating: boolean;
  setIsCreating: (creating: boolean) => void;
}

const COMMON_TAGS = [
  "chill", "workout", "focus", "party", "road trip", "study", "relax", 
  "energetic", "nostalgic", "upbeat", "mellow", "emotional", "happy", "sad"
];

export function PlaylistDetailsForm({ 
  selection, 
  onSuccess, 
  isCreating, 
  setIsCreating 
}: PlaylistDetailsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contextStory: "",
    isPublic: true,
    tags: [] as string[],
    customTag: ""
  });

  // Auto-populate form when Spotify playlist is selected
  useEffect(() => {
    if (selection.type === "spotify" && selection.spotifyPlaylist) {
      const spotify = selection.spotifyPlaylist;
      setFormData(prev => ({
        ...prev,
        name: spotify.name,
        description: spotify.description || "",
      }));
    } else {
      // Reset for custom playlist
      setFormData(prev => ({
        ...prev,
        name: "",
        description: "",
      }));
    }
  }, [selection]);

  const handleAddTag = (tag: string) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAddCustomTag = () => {
    const tag = formData.customTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        customTag: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.contextStory.trim().length < 10) {
      toast.error("Please provide a context story (minimum 10 characters)");
      return;
    }

    setIsCreating(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        context_story: formData.contextStory.trim(),
        is_public: formData.isPublic,
        tags: formData.tags,
        ...(selection.type === "spotify" && selection.spotifyPlaylist && {
          platform: "spotify",
          external_id: selection.spotifyPlaylist.id,
          external_url: selection.spotifyPlaylist.external_urls.spotify,
          cover_image_url: selection.spotifyPlaylist.images?.[0]?.url,
        })
      };

      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || json.message || "Unknown error");
      }

      toast.success("Playlist posted successfully!");
      onSuccess(json.data.id);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create playlist");
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = formData.name.trim().length >= 3 && 
                    formData.contextStory.trim().length >= 10;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Preview Section */}
      {selection.type === "spotify" && selection.spotifyPlaylist && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
              {selection.spotifyPlaylist.images?.[0] ? (
                <img
                  src={selection.spotifyPlaylist.images[0].url}
                  alt={selection.spotifyPlaylist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{selection.spotifyPlaylist.name}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {selection.spotifyPlaylist.tracks.total} tracks
              </p>
              <a
                href={selection.spotifyPlaylist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-2"
              >
                <ExternalLink className="w-3 h-3" />
                View on Spotify
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Basic Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Playlist Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Give your playlist a name"
            required
            minLength={3}
            maxLength={100}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="What's this playlist about? (optional)"
            maxLength={500}
            rows={3}
            className="mt-1"
          />
        </div>
      </div>

      {/* Context Story - Primary Focus */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="mb-3">
          <Label htmlFor="contextStory" className="text-blue-900 font-medium">
            Context Story *
          </Label>
          <p className="text-sm text-blue-700 mt-1">
            This is the heart of your post - tell people why this playlist matters
          </p>
        </div>
        <Textarea
          id="contextStory"
          value={formData.contextStory}
          onChange={(e) => setFormData(prev => ({ ...prev, contextStory: e.target.value }))}
          placeholder="Share the story behind this playlist... What inspired it? When should people listen? What mood does it capture?"
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          className="border-blue-300 focus:border-blue-500"
        />
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-blue-600">
            Minimum 10 characters required
          </div>
          <div className="text-xs text-gray-500">
            {formData.contextStory.length}/1000
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label className="mb-3 block">Tags (up to 5)</Label>
        <div className="space-y-3">
          {/* Selected Tags */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTag(tag)}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Common Tags */}
          {formData.tags.length < 5 && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Quick add:</div>
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.filter(tag => !formData.tags.includes(tag)).slice(0, 8).map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTag(tag)}
                    className="h-7 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Tag Input */}
          {formData.tags.length < 5 && (
            <div className="flex gap-2">
              <Input
                value={formData.customTag}
                onChange={(e) => setFormData(prev => ({ ...prev, customTag: e.target.value }))}
                placeholder="Add custom tag..."
                maxLength={20}
                className="text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomTag}
                disabled={!formData.customTag.trim()}
              >
                Add
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="isPublic" className="font-medium">Make Public</Label>
          <p className="text-sm text-gray-600">
            Allow others to discover and share your playlist
          </p>
        </div>
        <Switch
          id="isPublic"
          checked={formData.isPublic}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t">
        <Button
          type="submit"
          disabled={!isFormValid || isCreating}
          className="w-full"
        >
          {isCreating ? "Posting..." : "Post Playlist"}
        </Button>
      </div>
    </form>
  );
}
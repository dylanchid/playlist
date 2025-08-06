"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

export function CreatePlaylistForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contextStory: "",
    isPublic: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a playlist");
      return;
    }

    if (formData.contextStory.trim().length < 10) {
      toast.error("Please provide a context story (min 10 characters).");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          context_story: formData.contextStory,
          is_public: formData.isPublic,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || json.message || "Unknown error");
      }

      toast.success("Playlist created successfully!");
      router.push(`/playlists/${json.data.id}`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("Error creating playlist:", error);
      toast.error(error.message ?? "Failed to create playlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Playlist Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="My Awesome Playlist"
          required
          minLength={3}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What's this playlist about? (optional)"
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contextStory">Context Story<span className="text-destructive">*</span></Label>
        <Textarea
          id="contextStory"
          value={formData.contextStory}
          onChange={(e) => setFormData({ ...formData, contextStory: e.target.value })}
          placeholder="Share the story or mood behind this playlist (min 10 characters)."
          required
          minLength={10}
          maxLength={1000}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={!formData.isPublic}
          onChange={(e) => setFormData({ ...formData, isPublic: !e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="isPublic">Make this playlist private</Label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating..." : "Create Playlist"}
      </Button>
    </form>
  );
} 
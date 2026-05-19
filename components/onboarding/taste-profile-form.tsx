'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { updateTasteProfileAction } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { GenreGrid } from './genre-grid';
import { MoodSelector } from './mood-selector';

// --- Main Form Component ---

export function TasteProfileForm() {
  const [isPending, startTransition] = useTransition();

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [discoveryPreference, setDiscoveryPreference] = useState<'similar' | 'diverse' | 'open'>('open');

  const handleGenreSelect = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleMoodSelect = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedGenres.length === 0 || selectedGenres.length > 5) {
      toast.error('Please select between 1 and 5 genres.');
      return;
    }

    if (selectedMoods.length === 0 || selectedMoods.length > 3) {
      toast.error('Please select between 1 and 3 moods.');
      return;
    }

    startTransition(async () => {
      const result = await updateTasteProfileAction({
        genres: selectedGenres.slice(0, 5),
        moods: selectedMoods.slice(0, 3),
        discovery_preferences: discoveryPreference,
      });

      if (result?.error) {
        toast.error('Failed to update profile', { description: result.error });
      } else {
        toast.success('Profile updated successfully! Redirecting...');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Customize Your Taste Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="genres">Select up to 5 of your favorite genres</Label>
            <GenreGrid selected={selectedGenres} onSelect={handleGenreSelect} limit={5} />
            <p className="text-sm text-muted-foreground">{selectedGenres.length} / 5 selected</p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="moods">Select up to 3 moods you create playlists for</Label>
            <MoodSelector selected={selectedMoods} onSelect={handleMoodSelect} limit={3} />
             <p className="text-sm text-muted-foreground">{selectedMoods.length} / 3 selected</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discovery">Discovery Preferences</Label>
            <Select onValueChange={(value) => setDiscoveryPreference(value as 'similar' | 'diverse' | 'open')} value={discoveryPreference}>
              <SelectTrigger>
                <SelectValue placeholder="How should we recommend new music?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open to all genres</SelectItem>
                <SelectItem value="similar">Recommend music similar to my taste</SelectItem>
                <SelectItem value="diverse">Surprise me with diverse genres</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save and Continue'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
} 
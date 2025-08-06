'use client';

import { Button } from '@/components/ui/button';

// In a real app, this would likely come from a central constants file or an API
const ALL_GENRES = [
  'Rock', 'Pop', 'Hip Hop', 'Jazz', 'Blues', 'Country', 
  'Electronic', 'R&B', 'Classical', 'Reggae', 'Indie', 'Metal',
  'Folk', 'Punk', 'Alternative', 'Funk'
];

interface GenreGridProps {
  selected: string[];
  onSelect: (genre: string) => void;
  limit: number;
}

export function GenreGrid({ selected, onSelect, limit }: GenreGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {ALL_GENRES.map((genre) => {
        const isSelected = selected.includes(genre);
        return (
          <Button
            key={genre}
            type="button"
            variant={isSelected ? 'default' : 'outline'}
            onClick={() => onSelect(genre)}
            disabled={!isSelected && selected.length >= limit}
          >
            {genre}
          </Button>
        );
      })}
    </div>
  );
} 
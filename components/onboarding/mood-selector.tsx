'use client';

import { Button } from '@/components/ui/button';

// In a real app, this would likely come from a central constants file or an API
const ALL_MOODS = [
    'Focus', 'Workout', 'Chill', 'Party', 'Sad', 'Happy', 
    'Romantic', 'Energetic', 'Mellow', 'Driving'
];


interface MoodSelectorProps {
  selected: string[];
  onSelect: (mood: string) => void;
  limit: number;
}

export function MoodSelector({ selected, onSelect, limit }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {ALL_MOODS.map((mood) => {
        const isSelected = selected.includes(mood);
        return (
          <Button
            key={mood}
            type="button"
            variant={isSelected ? 'default' : 'outline'}
            onClick={() => onSelect(mood)}
            disabled={!isSelected && selected.length >= limit}
          >
            {mood}
          </Button>
        );
      })}
    </div>
  );
} 
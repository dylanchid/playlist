'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  skipGenreSelectionAction,
  updateUserGenresAction,
} from '@/app/actions/onboarding';
import { useFormState, useFormStatus } from 'react-dom';

const genres = [
  'Rock', 'Pop', 'Hip Hop', 'Jazz', 'Blues', 'Country', 'Electronic',
  'R&B', 'Reggae', 'Classical', 'Metal', 'Folk', 'Indie', 'Punk', 'Funk',
  'Soul', 'Alternative', 'Ambient',
];

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving..." : "Continue"}
        </Button>
    )
}

export default function OnboardingSelectGenresPage() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, formAction] = useFormState(updateUserGenresAction.bind(null, selectedGenres), undefined)

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mx-auto w-full max-w-2xl p-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Select Your Genres</CardTitle>
            <CardDescription>
              Choose a few genres you love. This helps us recommend friends with
              similar tastes. (Optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-2">
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                  onClick={() => toggleGenre(genre)}
                  className="rounded-full"
                >
                  {genre}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <form action={formAction} className="w-full">
                <SubmitButton />
            </form>
            <form action={skipGenreSelectionAction} className="w-full">
                <Button type="submit" variant="link" className="w-full">
                    Skip for Now
                </Button>
            </form>
            {error && <p className='text-red-500 text-sm'>{error.error}</p>}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 
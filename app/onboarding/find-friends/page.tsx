'use client';

import { followUserAction } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getFriendSuggestionsAction } from '@/app/actions/suggestions';
import { useEffect, useState, useTransition } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

type Suggestion = {
  id: string;
  display_name: string | null;
  bio: string | null;
};

function FollowButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [isFollowed, setIsFollowed] = useState(false);

  const handleFollow = () => {
    startTransition(async () => {
      const result = await followUserAction(userId);
      if (result.success) {
        setIsFollowed(true);
      } else {
        // Handle error, maybe show a toast
        console.error(result.error);
      }
    });
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={isPending || isFollowed}
      size="sm"
    >
      {isPending ? 'Following...' : isFollowed ? 'Followed' : 'Follow'}
    </Button>
  );
}

export default function OnboardingFindFriendsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    getFriendSuggestionsAction().then((res) => {
      setSuggestions(res.suggestions || []);
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mx-auto w-full max-w-lg p-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Find Your People</CardTitle>
            <CardDescription>
              Follow a few people to get your feed started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${user.display_name}`} />
                    <AvatarFallback>{user.display_name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.display_name}</p>
                    <p className="text-sm text-gray-500">{user.bio}</p>
                  </div>
                </div>
                <FollowButton userId={user.id} />
              </div>
            ))}
          </CardContent>
          <CardContent className="flex justify-center">
             <Link href="/melo-home" passHref>
                <Button>Finish Onboarding</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
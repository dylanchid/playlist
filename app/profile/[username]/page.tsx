import { UserProfileDisplay } from "@/components/profile/user-profile-display";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('username, display_name, bio, avatar_url')
      .eq('username', username)
      .single();

    if (!profile) {
      return {
        title: `User @${username} not found`,
        description: "This user profile does not exist.",
      };
    }

    const displayName = profile.display_name || profile.username;
    const title = `${displayName} (@${profile.username})`;
    const description = profile.bio || `Check out ${displayName}'s playlists on PlaylistShare`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: profile.avatar_url ? [profile.avatar_url] : [],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: profile.avatar_url ? [profile.avatar_url] : [],
      },
    };
  } catch {
    return {
      title: `@${username}`,
      description: "User profile on PlaylistShare",
    };
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  return <UserProfileDisplay username={username} />;
} 
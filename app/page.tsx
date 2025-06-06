import Link from "next/link";
import { FeaturedCarousel } from "@/components/playlists/featured-carousel";
import { FriendActivityFeed } from "@/components/social/friend-activity-feed";
import { PlaylistSection } from "@/components/playlists/playlist-section";
import { 
  mockTrendingPlaylists, 
  mockChillPlaylists, 
  mockWorkoutPlaylists, 
  mockGenrePlaylists,
  mockFriendRecommendations
} from "@/lib/mock-homepage-data";

export default function Home() {
  return (
    <>
      <div className="flex-1 w-full">
        {/* Main Content Area - Top Section */}
        <section className="w-full py-8 border-b">
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-auto lg:h-96">
              {/* Featured Carousel - Left Side (60%) */}
              <div className="lg:col-span-3">
                <FeaturedCarousel />
              </div>
              
              {/* Friend Activity Feed - Right Side (40%) */}
              <div className="lg:col-span-2">
                <FriendActivityFeed />
              </div>
            </div>
          </div>
        </section>

        {/* Scrollable Content Sections */}
        
        {/* Friend Recommendations */}
        <PlaylistSection
          title="Because Your Friends Like..."
          subtitle="Discover music through your social network"
          playlists={mockFriendRecommendations}
          layout="carousel"
          itemsPerRow={2}
        />

        {/* Trending Now */}
        <PlaylistSection
          title="Trending Now"
          subtitle="What's popular on PlaylistShare"
          playlists={mockTrendingPlaylists}
          layout="grid"
          itemsPerRow={4}
        />

        {/* Mood-Based Sections */}
        <PlaylistSection
          title="Chill & Study Vibes"
          subtitle="Perfect for focus and relaxation"
          playlists={mockChillPlaylists}
          layout="carousel"
          itemsPerRow={3}
        />

        <PlaylistSection
          title="Workout Energy"
          subtitle="Pump up your fitness routine"
          playlists={mockWorkoutPlaylists}
          layout="list"
        />

        {/* Genre Exploration */}
        <PlaylistSection
          title="Explore by Genre"
          subtitle="Dive deep into your favorite musical styles"
          playlists={mockGenrePlaylists}
          layout="grid"
          itemsPerRow={4}
        />
      </div>

      <footer className="w-full border-t py-8">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            © 2024 PlaylistShare. Powered by{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              className="font-medium hover:text-foreground transition-colors"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

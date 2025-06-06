import { PlaylistGrid } from "@/components/playlists/playlist-grid";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex-1 w-full">
        {/* Hero Section */}
        <section className="w-full py-16 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-5 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Discover & Share Amazing Playlists
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with music lovers, discover new playlists, and share your favorite tracks 
              from Spotify, Apple Music, and custom collections.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link 
                href="/auth/sign-up"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
              <Link 
                href="/demo"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ✨ Try Context Demo
              </Link>
              <Link 
                href="/discover"
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Browse Playlists
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Playlists */}
        <section className="w-full py-16">
          <div className="max-w-7xl mx-auto px-5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Playlists</h2>
                <p className="text-muted-foreground">
                  Discover the most popular playlists from our community
                </p>
              </div>
              <Link 
                href="/playlists"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            
            {/* Always show playlists - real data from Supabase */}
            <PlaylistGrid 
              emptyMessage="No playlists found. Be the first to create one!"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-5">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose PlaylistShare?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎵</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Multi-Platform</h3>
                <p className="text-muted-foreground">
                  Import and share playlists from Spotify, Apple Music, or create custom ones
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Social Discovery</h3>
                <p className="text-muted-foreground">
                  Follow friends, like playlists, and discover new music through our community
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
                <p className="text-muted-foreground">
                  Find playlists by genre, mood, artist, or browse by tags and popularity
                </p>
              </div>
            </div>
          </div>
        </section>
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

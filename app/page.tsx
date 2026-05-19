import Link from "next/link";
import { HomePageContent } from "@/components/home/home-page-content";

export default function Home() {
  return (
    <>
      <HomePageContent />

      <footer className="w-full border-t py-8">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} PlaylistShare. Powered by{" "}
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

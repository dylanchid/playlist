"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatePlaylistPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main page and open the modal
    // This is handled by navigation state now
    router.push("/?openPlaylistModal=true");
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-muted-foreground">
          Opening the enhanced playlist creation experience...
        </p>
      </div>
    </div>
  );
} 
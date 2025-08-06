"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export function DebugAuthState() {
  // 🔧 Set this to true to show debug component, false to hide it
  const SHOW_DEBUG = false;
  
  const { user, profile, loading, authError, refreshProfile } = useAuth();
  
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const handleRefreshProfile = async () => {
    console.log('🔄 [DEBUG] Manual profile refresh triggered');
    await refreshProfile();
  };
  
  // Early return if debug is disabled
  if (!SHOW_DEBUG) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-4 p-4 bg-black/80 text-white text-xs rounded-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">🐛 Auth Debug</h3>
      <div>Supabase URL: {hasSupabaseUrl ? "✅" : "❌"}</div>
      <div>Supabase Key: {hasSupabaseKey ? "✅" : "❌"}</div>
      <div>Loading: {loading ? "Yes" : "No"}</div>
      <div>User: {user ? `Yes (${user.email})` : "No"}</div>
      <div>Profile: {profile ? `Yes (${profile.username})` : "No"}</div>
      <div>Error: {authError || "None"}</div>
      <div className="font-bold">Should show button: {(!user && !loading) ? "✅ YES" : "❌ NO"}</div>
      <div className="font-bold">Should show username: {(user && profile && !loading) ? "✅ YES" : "❌ NO"}</div>
      {user && !profile && (
        <Button 
          onClick={handleRefreshProfile}
          size="sm"
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
        >
          🔄 Retry Profile
        </Button>
      )}
    </div>
  );
}
// Browser debugging utilities for authentication
export function debugAuthState() {
  console.group('🔍 [BROWSER_DEBUG] Authentication State Analysis');
  
  // Check localStorage
  console.log('📦 Local Storage Items:');
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
      console.log(`  ${key}:`, localStorage.getItem(key));
    }
  });

  // Check sessionStorage
  console.log('📦 Session Storage Items:');
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
      console.log(`  ${key}:`, sessionStorage.getItem(key));
    }
  });

  // Check cookies
  console.log('🍪 Relevant Cookies:');
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.trim().split('=');
    if (name.includes('supabase') || name.includes('auth') || name.includes('sb-')) {
      console.log(`  ${cookie.trim()}`);
    }
  });

  // Check current URL and referrer
  console.log('🌐 Navigation Context:');
  console.log('  Current URL:', window.location.href);
  console.log('  Referrer:', document.referrer);
  console.log('  User Agent:', navigator.userAgent);

  console.groupEnd();
}

export function clearAuthStorage() {
  console.log('🧹 [BROWSER_DEBUG] Clearing all auth-related storage...');
  
  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
      console.log(`Removing localStorage: ${key}`);
      localStorage.removeItem(key);
    }
  });

  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
      console.log(`Removing sessionStorage: ${key}`);
      sessionStorage.removeItem(key);
    }
  });

  console.log('✅ [BROWSER_DEBUG] Storage cleared');
}

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).debugAuthState = debugAuthState;
  (window as any).clearAuthStorage = clearAuthStorage;
  console.log('🔧 [BROWSER_DEBUG] Debug functions available: debugAuthState(), clearAuthStorage()');
} 
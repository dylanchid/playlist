# Authentication Debugging Guide

This document explains how to debug authentication issues using the comprehensive logging system we've implemented.

## What's Been Added

### 1. Enhanced Logging in Components

- **Auth Form** (`components/auth/unified-auth-form.tsx`): Detailed login flow tracking
- **Auth Context** (`contexts/auth-context.tsx`): User state and profile tracking 
- **Navbar** (`components/navigation/navbar.tsx`): UI state changes
- **Auth Modal** (`components/auth/unified-auth-modal.tsx`): Modal open/close events

### 2. Debug Utilities

- **Auth Debugger** (`utils/auth-debug.ts`): Tracks login timing and events
- **Browser Debug** (`utils/browser-debug.ts`): Storage and browser state inspection

## How to Debug Login Issues

### Step 1: Open Browser Console
Open your browser's developer tools and go to the Console tab.

### Step 2: Clear Previous State (Optional)
If you suspect storage issues, run:
```javascript
clearAuthStorage()
```

### Step 3: Attempt Login
Try logging in and watch the console output. You should see logs like:

```
🔐 [AUTH] Login process started
🔐 [AUTH] Calling supabase.auth.signInWithPassword...
🔐 [AUTH] Login response: { success: true, user: "...", session: true }
✅ [AUTH] Login successful, calling callbacks and redirecting...
🔄 [AUTH_PROVIDER] Setting session and user state...
👤 [AUTH_PROVIDER] User found, fetching profile...
✅ [PROFILE] Profile fetched successfully: { username: "...", displayName: "..." }
🏠 [NAVBAR] Auth state changed: { user: true, profile: true, shouldShowProfile: true }
```

### Step 4: Analyze Issues

#### Issue: Login succeeds but navbar doesn't update
Look for these patterns:

1. **User but no profile**:
   ```
   ⚠️ [NAVBAR] User exists but no profile found!
   ```
   → Check if profile creation failed

2. **Profile fetch fails**:
   ```
   ❌ [PROFILE] Database error during profile fetch
   ```
   → Check database permissions/connection

3. **Timing issues**:
   ```
   🏁 [AUTH_DEBUG] Login flow completed in XXXXms
   ```
   → If timing is very long, there might be network issues

#### Issue: Login window closes but nothing happens
Check for:
```
🎉 [AUTH_MODAL] Success callback triggered, closing modal
```
If this appears but navbar doesn't update, the issue is in state propagation.

### Step 5: Inspect Browser State
Run this command to see all auth-related storage:
```javascript
debugAuthState()
```

This will show:
- Local storage items
- Session storage items  
- Relevant cookies
- Navigation context

### Step 6: Check Auth Context State
Look for these logs to understand state flow:
```
📊 [AUTH_PROVIDER] State changed: { hasUser: true, hasProfile: true, loading: false }
```

## Common Issues and Solutions

### Issue: Profile not loading
**Symptoms**: User exists but profile is null
**Solution**: Check database schema and permissions

### Issue: Auth state not propagating  
**Symptoms**: Login succeeds but UI doesn't update
**Solution**: Check if React context is properly wrapping components

### Issue: Timing problems
**Symptoms**: Intermittent failures, race conditions
**Solution**: Check network requests and add delays if needed

### Issue: Storage corruption
**Symptoms**: Inconsistent behavior, logout loops
**Solution**: Run `clearAuthStorage()` and try again

## Debug Commands Available in Console

- `debugAuthState()` - Shows all auth-related browser storage
- `clearAuthStorage()` - Clears all auth-related storage
- `authDebugger.dumpDebugInfo()` - Shows detailed timing info
- `authDebugger.reset()` - Resets debug state

## Log Prefixes Explained

- `🔐 [AUTH]` - Authentication form events
- `🏠 [NAVBAR]` - Navbar state changes  
- `📊 [AUTH_PROVIDER]` - Auth context state changes
- `✅ [PROFILE]` - Profile operations
- `🎉 [AUTH_MODAL]` - Modal events
- `🚀 [AUTH_DEBUG]` - Debug utility events
- `🔍 [BROWSER_DEBUG]` - Browser state inspection 
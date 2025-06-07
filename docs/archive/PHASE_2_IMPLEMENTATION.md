# Phase 2: User Profile Management - Implementation Guide

## Overview

Phase 2 introduces comprehensive user profile management with a unified authentication experience, profile customization, and individual user profile pages.

## 🚀 Key Features Implemented

### 1. Unified Authentication System
- **Single "Sign Up / Log In" button** in navigation
- **Unified modal** with expandable signup form
- **Social authentication** (Google, Apple)
- **Username validation** with real-time availability checking
- **Automatic profile creation** for social auth users

### 2. Enhanced User Profiles
- **User profile table** with comprehensive fields
- **Avatar upload** functionality with file validation
- **Profile privacy settings** (public/private)
- **Profile completion tracking**
- **Username uniqueness** with 3-14 character validation

### 3. Profile Management
- **Profile editing interface** with form validation
- **Real-time username checking**
- **Avatar upload with preview**
- **Bio and display name customization**
- **Privacy toggle**

### 4. User Profile Pages
- **Dynamic profile routes** (`/profile/[username]`)
- **Profile statistics** (playlists, followers, following)
- **User playlist display**
- **Privacy respect** (private profile handling)
- **SEO optimization** with dynamic metadata

## 📁 File Structure

```
components/
├── auth/
│   └── unified-auth-modal.tsx          # Unified authentication modal
├── navigation/
│   └── navbar.tsx                      # Navigation with auth integration
├── profile/
│   ├── profile-edit-form.tsx           # Profile editing form
│   └── user-profile-display.tsx        # User profile display
└── users/
    └── user-avatar.tsx                 # Avatar component

app/
├── auth/
│   └── callback/
│       └── route.ts                    # OAuth callback handler
├── profile/
│   ├── [username]/
│   │   └── page.tsx                    # Dynamic user profile page
│   └── edit/
│       └── page.tsx                    # Profile edit page

hooks/
└── use-profile.ts                      # Profile management hooks

contexts/
└── auth-context.tsx                    # Enhanced auth context with profiles

types/
└── database.ts                         # Updated with profile types

scripts/
└── user-profiles-migration.sql         # Database migration
```

## 🗄️ Database Schema

The user profiles table includes:

```sql
CREATE TABLE public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username varchar(14) UNIQUE NOT NULL CHECK (length(username) >= 3 AND username ~ '^[a-zA-Z0-9_]+$'),
  display_name varchar(50),
  bio text CHECK (length(bio) <= 500),
  avatar_url text,
  is_private boolean DEFAULT false,
  spotify_id varchar(255),
  apple_music_id varchar(255),
  spotify_access_token text,
  spotify_refresh_token text,
  spotify_token_expires_at timestamp,
  profile_completed boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

## ⚙️ Setup Instructions

### 1. Database Migration

Run the SQL migration in your Supabase SQL editor:

```bash
# Copy and execute the contents of:
scripts/user-profiles-migration.sql
```

### 2. Storage Setup

Create an avatar storage bucket in Supabase:

1. Go to Storage in Supabase dashboard
2. Create a new bucket named `avatars`
3. Set it as public
4. Configure upload policies for authenticated users

### 3. OAuth Configuration

Configure OAuth providers in Supabase:

1. **Google OAuth:**
   - Go to Auth > Settings > Auth Providers
   - Enable Google provider
   - Add your Google OAuth credentials

2. **Apple OAuth:**
   - Enable Apple provider
   - Add your Apple OAuth credentials

### 4. Environment Variables

Ensure your `.env.local` includes:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 Technical Implementation

### Authentication Flow

1. **Standard Login/Signup:**
   - User clicks "Sign Up / Log In" button
   - Modal opens with email/password fields
   - For signup: expands to include username and confirm password
   - Real-time username validation
   - Profile created automatically on successful signup

2. **Social Authentication:**
   - User clicks Google/Apple button
   - Redirects to OAuth provider
   - Returns to `/auth/callback` route
   - Automatic profile creation with generated username
   - Redirects to original page

### Profile Management

1. **Profile Loading:**
   - Auth context automatically loads profile data
   - Profile data cached with React Query
   - Loading states handled gracefully

2. **Profile Updates:**
   - Form validation with Zod schema
   - Optimistic UI updates
   - Real-time username availability checking
   - Avatar upload with file validation

### Privacy System

- **Public profiles:** Visible to everyone
- **Private profiles:** Only visible to profile owner
- **Profile access control:** Built into database RLS policies

## 🎨 UI/UX Features

### Navigation
- **Authenticated state:** Shows user avatar and dropdown menu
- **Unauthenticated state:** Shows "Sign Up / Log In" button
- **Mobile responsive:** Collapsible menu with auth integration

### Profile Display
- **User information:** Avatar, username, display name, bio
- **Statistics:** Playlist count, followers, following
- **Playlist grid:** User's public playlists
- **Privacy indicators:** Lock icon for private profiles

### Forms
- **Real-time validation:** Username availability, field constraints
- **File upload:** Avatar upload with preview
- **Error handling:** Clear error messages and loading states

## 🔒 Security Features

### Row Level Security (RLS)
- **Profile visibility:** Public profiles viewable by all, private by owner only
- **Profile modification:** Users can only modify their own profiles
- **Data isolation:** User data properly isolated

### Input Validation
- **Username format:** 3-14 characters, alphanumeric + underscores
- **Bio length:** Maximum 500 characters
- **File validation:** Image files only, 5MB limit
- **XSS protection:** All user inputs properly sanitized

## 🚦 Usage Examples

### Checking Profile in Components
```tsx
import { useAuth } from '@/contexts/auth-context';

function MyComponent() {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return <div>Welcome, {profile?.display_name || profile?.username}!</div>;
}
```

### Using Profile Hooks
```tsx
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';

function ProfileComponent({ username }: { username: string }) {
  const { data: profile, isLoading } = useProfile(username);
  const updateProfile = useUpdateProfile();
  
  // Component logic...
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Profile not loading:**
   - Check if user_profiles table exists
   - Verify RLS policies are correctly set
   - Ensure user has a profile record

2. **Avatar upload failing:**
   - Check if avatars bucket exists in Supabase Storage
   - Verify bucket is public
   - Check file size and type restrictions

3. **Username validation errors:**
   - Ensure regex validation in database matches client-side
   - Check for proper error handling in username checking

### Debug Steps

1. Check browser console for errors
2. Verify Supabase connection and auth state
3. Check database logs in Supabase dashboard
4. Verify storage bucket configuration

## 🔄 Next Steps

Phase 2 sets the foundation for:
- **Social features** (following, playlist sharing)
- **Enhanced playlist management**
- **Activity feeds and notifications**
- **Advanced profile customization**

The authentication and profile system is now ready to support these advanced features in future phases. 
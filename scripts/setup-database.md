# Database Setup Guide

## Prerequisites
- Supabase project created
- Environment variables set in `.env.local`

## Steps to Set Up Database

1. **Open Supabase Dashboard**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Database Schema**
   - Copy the contents of `scripts/database-setup.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

4. **Verify Tables Created**
   - Go to "Database" → "Tables" in the sidebar
   - You should see the following tables:
     - `user_profiles`
     - `playlists`
     - `playlist_tracks`
     - `playlist_likes`
     - `user_follows`
     - `playlist_plays`

5. **Test Authentication**
   - The tables should automatically connect to the existing auth system
   - Users created through the app will be able to create profiles

## Next Steps After Database Setup
1. Test the authentication flow
2. Create user profiles for existing users
3. Test playlist creation and social features
4. Implement API routes for playlist management 
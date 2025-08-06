'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // emailRedirectTo is not needed for this flow since we are handling the session
      // on the server and redirecting manually.
      // The user will be logged in immediately.
    },
  });

  if (error) {
    // TODO: Handle different errors more gracefully, e.g., user already exists.
    console.error('Sign up error:', error.message);
    // Redirecting to an error page or showing a message on the same page
    // would be a good improvement. For now, we redirect back to the sign-up page.
    return redirect(`/auth/error?message=${encodeURIComponent(error.message)}`);
  }

  // After successful sign-up, Supabase automatically logs the user in
  // by setting the session cookie. We can now proceed to the next step.
  return redirect('/onboarding/connect-spotify');
}
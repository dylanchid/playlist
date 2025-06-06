"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Apple, Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { authDebugger } from "@/utils/auth-debug";

type AuthMode = 'login' | 'signup' | 'forgot-password';

interface UnifiedAuthFormProps {
  mode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  redirectTo?: string;
  className?: string;
  showSocialAuth?: boolean;
  showModeToggle?: boolean;
  showHeader?: boolean;
  onSuccess?: () => void;
}

export function UnifiedAuthForm({
  mode = 'login',
  onModeChange,
  redirectTo,
  className,
  showSocialAuth = true,
  showModeToggle = true,
  showHeader = true,
  onSuccess,
  ...props
}: UnifiedAuthFormProps & React.ComponentPropsWithoutRef<"div">) {
  const [currentMode, setCurrentMode] = useState<AuthMode>(mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();
  const supabase = useSupabase();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && redirectTo) {
      router.push(redirectTo);
    }
  }, [user, redirectTo, router]);

  // Handle mode changes
  const handleModeChange = (newMode: AuthMode) => {
    setCurrentMode(newMode);
    setError(null);
    setSuccess(null);
    onModeChange?.(newMode);
    resetForm();
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setError(null);
    setSuccess(null);
    setUsernameAvailable(null);
  };

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3 || username.length > 14) {
      setUsernameAvailable(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();

      setUsernameAvailable(!data && !error);
    } catch {
      setUsernameAvailable(true); // If error, assume available
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (value.length >= 3) {
      const timeoutId = setTimeout(() => checkUsernameAvailability(value), 500);
      return () => clearTimeout(timeoutId);
    } else {
      setUsernameAvailable(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    authDebugger.startLoginFlow();
    console.log('🔐 [AUTH] Login process started', { email, hasPassword: !!password });
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 [AUTH] Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔐 [AUTH] Login response:', { 
        success: !error, 
        user: data?.user?.id, 
        email: data?.user?.email,
        session: !!data?.session,
        error: error?.message 
      });

      if (error) throw error;

      console.log('✅ [AUTH] Login successful, calling callbacks and redirecting...');
      console.log('🔐 [AUTH] Current user from response:', data?.user);
      console.log('🔐 [AUTH] Current session from response:', data?.session);
      authDebugger.logEvent('SUPABASE_LOGIN_SUCCESS', { userId: data?.user?.id });
      
      // Wait a bit for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      onSuccess?.();
      authDebugger.logEvent('SUCCESS_CALLBACK_TRIGGERED');
      console.log('🔐 [AUTH] Refreshing router...');
      router.refresh();
      console.log('🔐 [AUTH] Redirecting to:', redirectTo || "/");
      router.push(redirectTo || "/");
      authDebugger.endLoginFlow();
    } catch (error: unknown) {
      console.error('❌ [AUTH] Login error:', error);
      authDebugger.logEvent('LOGIN_ERROR', { error: error instanceof Error ? error.message : String(error) });
      setError(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
      console.log('🔐 [AUTH] Login process completed');
      authDebugger.dumpDebugInfo();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!usernameAvailable) {
      setError("Username is not available");
      setIsLoading(false);
      return;
    }

    try {
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            username: username.toLowerCase(),
            profile_completed: true,
          });

        if (profileError) throw profileError;

        console.log('Sign up successful, refreshing and redirecting...');
        onSuccess?.();
        router.refresh();
        router.push(redirectTo || "/");
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) throw error;
      
      setSuccess("Check your email for a password reset link");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?redirect=${redirectTo}` : ''}`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Social authentication failed");
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (currentMode) {
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Reset Password';
      default: return 'Welcome Back';
    }
  };

  const getDescription = () => {
    switch (currentMode) {
      case 'signup': return 'Create a new account to get started';
      case 'forgot-password': return 'Enter your email to receive a reset link';
      default: return 'Sign in to your account';
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="text-2xl">{getTitle()}</CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          {/* Social Authentication */}
          {showSocialAuth && currentMode !== 'forgot-password' && (
            <>
              <div className="flex flex-col gap-3 mb-6">
                <Button
                  variant="outline"
                  onClick={() => handleSocialAuth('google')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialAuth('apple')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Apple className="mr-2 h-4 w-4" />
                  Continue with Apple
                </Button>
              </div>
              <div className="relative mb-6">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    or continue with email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={currentMode === 'login' ? handleLogin : currentMode === 'signup' ? handleSignUp : handleForgotPassword}>
            <div className="flex flex-col gap-4">
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Username (signup only) */}
              {currentMode === 'signup' && (
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="username"
                    required
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className={cn(
                      usernameAvailable === false && "border-red-500",
                      usernameAvailable === true && "border-green-500"
                    )}
                  />
                  {checkingUsername && (
                    <p className="text-xs text-muted-foreground">Checking availability...</p>
                  )}
                  {usernameAvailable === false && (
                    <p className="text-xs text-red-500">Username is not available</p>
                  )}
                  {usernameAvailable === true && (
                    <p className="text-xs text-green-500">Username is available</p>
                  )}
                </div>
              )}

              {/* Password */}
              {currentMode !== 'forgot-password' && (
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {currentMode === 'login' && showModeToggle && (
                      <button
                        type="button"
                        onClick={() => handleModeChange('forgot-password')}
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Confirm Password (signup only) */}
              {currentMode === 'signup' && (
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              {/* Error/Success Messages */}
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-500">{success}</p>}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentMode === 'login' && (isLoading ? 'Signing in...' : 'Sign In')}
                {currentMode === 'signup' && (isLoading ? 'Creating account...' : 'Create Account')}
                {currentMode === 'forgot-password' && (isLoading ? 'Sending...' : 'Send Reset Link')}
              </Button>
            </div>

            {/* Mode Toggle */}
            {showModeToggle && (
              <div className="mt-4 text-center text-sm">
                {currentMode === 'login' && (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange('signup')}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Sign up
                    </button>
                  </>
                )}
                {currentMode === 'signup' && (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange('login')}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Sign in
                    </button>
                  </>
                )}
                {currentMode === 'forgot-password' && (
                  <>
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange('login')}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
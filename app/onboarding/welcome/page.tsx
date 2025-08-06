import { signUpAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OnboardingWelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mx-auto w-full max-w-md p-8">
        <h1 className="mb-6 text-center text-4xl font-bold text-gray-800">
          PlaylistShare
        </h1>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Discover music the way you should - through friends who get your
              taste.
            </CardDescription>
          </CardHeader>
          <form action={signUpAction}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Sign Up & Continue
              </Button>
            </CardFooter>
          </form>
        </Card>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/auth/login" className="font-medium text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
} 
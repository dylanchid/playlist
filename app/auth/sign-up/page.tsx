import { UnifiedAuthForm } from "@/components/auth/unified-auth-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTo = next?.startsWith("/") ? next : undefined;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UnifiedAuthForm mode="signup" redirectTo={redirectTo} />
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthErrorFromHash } from "@/components/auth/auth-error-from-hash";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_code?: string; error_description?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {params?.error ? (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Query error:</span>{" "}
                  {params.error}
                </p>
              ) : null}
              {params?.error_description ? (
                <p className="text-sm text-muted-foreground">
                  {decodeURIComponent(String(params.error_description).replace(/\+/g, " "))}
                </p>
              ) : null}
              <AuthErrorFromHash />
              {!params?.error ? (
                <p className="text-sm text-muted-foreground">
                  If you used social login, details may appear above (from the URL hash).
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

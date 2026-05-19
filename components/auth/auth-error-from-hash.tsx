"use client";

import { useEffect, useState } from "react";

/**
 * Supabase often returns OAuth errors in the URL hash (e.g. #error=access_denied&error_description=...),
 * which the server cannot read. This client reads the hash once on mount.
 */
export function AuthErrorFromHash() {
  const [details, setDetails] = useState<{
    error: string | null;
    code: string | null;
    description: string | null;
  } | null>(null);

  useEffect(() => {
    const raw = window.location.hash?.replace(/^#/, "");
    if (!raw) return;
    const p = new URLSearchParams(raw);
    const error = p.get("error");
    const code = p.get("error_code");
    const description = p.get("error_description");
    if (error || code || description) {
      setDetails({
        error,
        code,
        description: description ? decodeURIComponent(description.replace(/\+/g, " ")) : null,
      });
    }
  }, []);

  if (!details || (!details.error && !details.code && !details.description)) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2 rounded-md border border-border bg-muted/40 p-3 text-sm">
      {details.code ? (
        <p>
          <span className="font-medium">Error code:</span> {details.code}
        </p>
      ) : null}
      {details.error ? (
        <p>
          <span className="font-medium">Error:</span> {details.error}
        </p>
      ) : null}
      {details.description ? (
        <p className="text-muted-foreground">{details.description}</p>
      ) : null}
      {details.code === "provider_email_needs_verification" ? (
        <div className="space-y-3 border-t border-border pt-3 text-muted-foreground">
          <p className="font-medium text-foreground">What this means</p>
          <p>
            Supabase will not finish Spotify sign-in until the email address Spotify shares is
            marked confirmed. Supabase sends a confirmation link to that inbox.
          </p>
          <p className="font-medium text-foreground">What you can do</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              On the machine where you read mail for your Spotify account, open the inbox (and
              spam), find the message from Supabase, and click the confirmation link. Then try
              &quot;Continue with Spotify&quot; again.
            </li>
            <li>
              If you are the project admin and this is dev / you trust OAuth emails: in{" "}
              <strong>Supabase Dashboard</strong> go to{" "}
              <strong>Authentication → Providers → Email</strong> and turn off{" "}
              <strong>Confirm email</strong>, then save. (Production apps often keep confirmations
              on and rely on users clicking the link.)
            </li>
            <li>
              Still stuck? In <strong>Authentication → Users</strong>, find the user (if partially
              created) or try again after changing the setting.
            </li>
          </ol>
          <p className="text-xs">
            Docs:{" "}
            <a
              className="underline text-foreground hover:text-foreground/80"
              href="https://supabase.com/docs/guides/auth/general-configuration#email-confirmations"
              target="_blank"
              rel="noreferrer"
            >
              Email confirmations (Supabase)
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}

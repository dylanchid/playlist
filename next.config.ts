import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "";

const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  {
    protocol: "https",
    hostname: "i.scdn.co",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "mosaic.scdn.co",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "seed-mix-image.spotifycdn.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "**.scdn.co",
    pathname: "/**",
  },
];

if (supabaseUrl) {
  remotePatterns.push({
    protocol: "https",
    hostname: supabaseUrl,
    pathname: "/storage/**",
  });
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.spotify.com https://*.spotify.com https://spclient.wg.spotify.com blob: data:; style-src 'self' 'unsafe-inline' https://accounts.spotify.com https://*.spotify.com; frame-src 'self' https://accounts.spotify.com https://*.spotify.com https://${supabaseUrl}; img-src 'self' https://i.scdn.co https://*.scdn.co data: blob:; connect-src 'self' https://api.spotify.com https://accounts.spotify.com https://*.spotify.com https://spclient.wg.spotify.com https://${supabaseUrl} wss://${supabaseUrl}; worker-src 'self' https://*.scdn.co https://spclient.wg.spotify.com blob: data:; object-src 'none'; base-uri 'self'; frame-ancestors 'self';`,
          },
        ],
      },
    ];
  },
  // Ensure Supabase can access the site
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
};

export default nextConfig;

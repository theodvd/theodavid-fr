/** @type {import('next').NextConfig} */
const nextConfig = {
  // Relais PostHog (mesure d'audience) : le navigateur parle à /ingest sur ce
  // domaine, Vercel transmet à PostHog EU ; les bloqueurs de pub ne le coupent pas.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: '/ingest/static/:path*', destination: 'https://eu-assets.i.posthog.com/static/:path*' },
      { source: '/ingest/array/:path*', destination: 'https://eu-assets.i.posthog.com/array/:path*' },
      { source: '/ingest/:path*', destination: 'https://eu.i.posthog.com/:path*' },
    ];
  },
  reactStrictMode: true,
  // Verification builds (NEXT_DIST_DIR=.next-verify) use a separate output
  // dir so they never corrupt the dev server's .next cache. Vercel and
  // `npm run dev` use the default.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;

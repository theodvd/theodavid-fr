/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Verification builds (NEXT_DIST_DIR=.next-verify) use a separate output
  // dir so they never corrupt the dev server's .next cache. Vercel and
  // `npm run dev` use the default.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;

# theodavid.fr

Personal portfolio — Théo David. Monochrome dark identity, WebGL particle hero ("Order from Noise"), editorial scroll.

## Stack

Next.js 14 (App Router) · TypeScript · Three.js · GSAP + ScrollTrigger · Lenis · Tailwind CSS. No CMS, no database — all content is static (`data/projects.ts`).

## Run locally

```bash
npm install
npm run dev   # http://localhost:3000
```

## Deploy

```bash
vercel --prod
```

Then point the `theodavid.fr` domain to the project in the Vercel dashboard (Settings → Domains).

## Where things live

- `data/projects.ts` — project rows (the only content "database")
- `components/three/createHeroScene.ts` — the hero particle system & shaders
- `tailwind.config.ts` — the five-grey monochrome palette
- `fonts/` — self-hosted Clash Display & Satoshi (Fontshare licence)

Accessibility: every animated system (Lenis, GSAP reveals, WebGL loop) is disabled under `prefers-reduced-motion`; the hero then renders one static resolved frame.

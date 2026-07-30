import { projects, type Project } from "@/data/projects";
import { planets, type PlanetSpec } from "@/data/planets";

/**
 * /astres-only project data.
 *
 * Établi is real but deliberately framed as EARLY STAGE (an idea, a method
 * and a live landing — no product yet). It earns a planet in the experimental
 * system without touching data/projects.ts, so the production home page and
 * the /project routes stay exactly as they are. If Établi matures into a full
 * case study, move this entry into data/projects.ts and delete it here.
 */

const etabli: Project = {
  slug: "etabli",
  index: "05",
  title: "Établi",
  context: "Venture — early stage",
  year: "2026 — in progress",
  role: "Founder — positioning, brand & build",
  description:
    "AI consulting without the consultants: a B2B product that guides non-technical teams to scope their own AI projects and get an honest go/no-go. Today it is exactly what it looks like — a sharp idea, a proven method and a live landing page.",
  tags: ["B2B SaaS", "AI scoping", "0 → 1"],
  stack: ["Next.js", "Tailwind", "Claude API", "Supabase", "Vercel", "Figma"],
  stats: [
    ["Live", "landing at etabli.ai"],
    ["5 gates", "honest feasibility verdict"],
    ["70–95%", "of AI pilots fail — the problem"],
  ],
  challenge:
    "Mid-market companies burn five-figure consulting budgets on AI projects that often shouldn't exist: consultants build in your place, bill their presence and leave with the know-how. Most AI pilots die in \"pilot purgatory\" for lack of honest scoping. The bet behind Établi: productize the scoping itself — including the honest \"no\" a consultant is never incentivized to give.",
  built: [
    "A scoping method battle-tested by hand before any product: a guided interview that ends in a 5-gate automatability verdict — automate now, under conditions, or not worth it — plus the smallest testable deliverable and a pre-registered decision rule.",
    "Positioning and ICP work sharpened against the real alternative (five-figure consulting): self-serve B2B SaaS, bought by the ops decision-maker, used by the business teams.",
    "A complete brand system — naming, logo, design tokens, type scale — designed in Figma and shipped as reusable React components.",
    "A live landing page at etabli.ai: Next.js, custom design system, deployed on Vercel.",
  ],
  results: [
    "Honest status: this is an idea with a landing page — the scoping engine itself is only entering development.",
    "The method already proved itself informally, scoping real automation ideas with colleagues at Finary before a line of product code existed.",
    "Next milestone: a working scoping interview in front of real non-technical users.",
  ],
  links: [{ label: "etabli.ai", href: "https://etabli.ai" }],
};

export const astresProjects: Project[] = [...projects, etabli];

export const astresPlanets: Record<string, PlanetSpec> = {
  ...planets,
  etabli: {
    name: "Jupiter", // the reserved giant — banded tan-gold, barely tilted
    colorA: "#EDB05C",
    colorB: "#7A4418",
    ring: false,
    moons: 2,
    tilt: 0.05,
    bandFreq: 10,
    accent: "237 176 92",
    glow: "247 216 166",
  },
};

/** Slugs that have a real /project/[slug] page on the classic site. */
export const sitePageSlugs = new Set(projects.map((p) => p.slug));

/**
 * The sun's own panel — who Théo is. Same copy as the classic About / Now /
 * Contact sections, so the two experiences never tell different stories.
 */
export const sunProfile = {
  title: "Théo David",
  subtitle: "Operator first. Builder by default.",
  availability:
    "Open — 6-month internship · fintech / scale-up · from January 2027",
  bio: [
    "I'm a business operator who ships. Third-year BBA student at Audencia × Centrale Nantes, currently the solo DRI for Growth Data & Automation at Finary — pipelines, dashboards and AI systems the product team actually uses.",
    "On the side I co-founded Tiro, a B2B venture I ran as COO — prospecting, GTM and onboarding-to-delivery — to real revenue. The thread through everything: I use AI and automation to compress months of work into days, for products used by real people.",
    "What I'm building toward — product and growth leadership at an early-stage fintech. The discipline comes from elsewhere: four-plus years in the gym, climbing walls and long hikes.",
  ],
  now: [
    "Scaling growth-data systems at Finary",
    "Building the next billion-dollar startup",
    "Out climbing — or on a long hike",
  ],
  specs: [
    ["Education", "BBA Big Data, AI & Mgmt — Audencia × Centrale Nantes, 2027"],
    ["Currently", "Growth Data & Automation — Finary (solo DRI)"],
    ["Venture", "Co-founder & COO — Tiro"],
    ["Open to", "6-month internship — fintech / scale-up · from January 2027"],
    ["Exchanges", "Shenzhen, 5 mo · Casablanca, 3 mo"],
    ["Elsewhere", "Climbing · Long hikes · Gym, 4+ years"],
  ] as [string, string][],
  email: "theo.david@audencia.com",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/theodavid-tiro" },
    { label: "GitHub", href: "https://github.com/theodvd" },
    { label: "Tiro", href: "https://tiro.agency" },
  ],
};

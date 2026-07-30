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
  context: "Venture · early stage",
  year: "2026 · in progress",
  role: "Founder · positioning, brand & build",
  description:
    "AI consulting without the consultants: a B2B product that guides non-technical teams to scope their own AI projects and get an honest go/no-go. Today it is exactly what it looks like: a sharp idea, a proven method and a live landing page.",
  tags: ["B2B SaaS", "AI scoping", "0 → 1"],
  stack: ["Next.js", "Tailwind", "Claude API", "Supabase", "Vercel", "Figma"],
  stats: [
    ["Live", "landing at etabli.ai"],
    ["5 gates", "honest feasibility verdict"],
    ["70-95%", "of AI pilots fail (the problem)"],
  ],
  challenge:
    "Mid-market companies burn five-figure consulting budgets on AI projects that often shouldn't exist: consultants build in your place, bill their presence and leave with the know-how. Most AI pilots die in \"pilot purgatory\" for lack of honest scoping. The bet behind Établi: productize the scoping itself, including the honest \"no\" a consultant is never incentivized to give.",
  built: [
    "A scoping method battle-tested by hand before any product: a guided interview that ends in a 5-gate automatability verdict (automate now, under conditions, or not worth it) plus the smallest testable deliverable and a pre-registered decision rule.",
    "Positioning and ICP work sharpened against the real alternative (five-figure consulting): self-serve B2B SaaS, bought by the ops decision-maker, used by the business teams.",
    "A complete brand system (naming, logo, design tokens, type scale) designed in Figma and shipped as reusable React components.",
    "A live landing page at etabli.ai: Next.js, custom design system, deployed on Vercel.",
  ],
  results: [
    "Honest status: this is an idea with a landing page; the scoping engine itself is only entering development.",
    "The method already proved itself informally, scoping real automation ideas with colleagues at Finary before a line of product code existed.",
    "Next milestone: a working scoping interview in front of real non-technical users.",
  ],
  links: [{ label: "etabli.ai", href: "https://etabli.ai" }],
};

/**
 * Content Engine — Finary work, astres-only for now. Confidentiality rule:
 * process metrics only (pillars, retrofit count, cadence), no corporate KPIs,
 * no internal names, repos or infra details. Facts sourced from the finary
 * brain (projects/content-engine.md, 2026-07-30).
 */
const contentEngine: Project = {
  slug: "content-engine",
  index: "06",
  title: "Content Engine",
  context: "Finary · Growth",
  year: "2026 · ongoing",
  role: "Solo DRI · audit, standards & build",
  description:
    "The machinery behind Finary's expert financial content: a full editorial audit, one unified GEO standard, a sourced knowledge base and a partially automated pipeline that keeps the tax experts in the loop, scaling quality instead of trading it away.",
  tags: ["GEO", "Knowledge base", "Experts in the loop"],
  stack: [
    "Claude API",
    "PostgreSQL + pgvector",
    "Python",
    "GitHub Actions",
    "Notion",
    "Webflow",
  ],
  stats: [
    ["12+", "sourced knowledge pillars"],
    ["18/18", "articles rebuilt to one GEO standard"],
    ["1/day", "expert-gated publishing cadence"],
  ],
  challenge:
    "High-stakes financial content does not forgive errors: one stale tax rate published with confidence does real damage. Production relied on experts' scarce time, while search itself is shifting toward AI assistants: content now has to be structured to be found and cited by them (GEO, generative engine optimization). Full automation would scale the output and lose the trust; the real problem was scaling both.",
  built: [
    "A full audit of the editorial system and its generative-search performance, condensed into one unified GEO content standard, then 18 historical articles rebuilt to match it.",
    "A sourced knowledge base as the single source of truth: every tax figure dated and traced to a primary source, plus the brand's editorial voice: the deterministic ground the AI drafts from, with no perishable market data ingested by design.",
    "A partially automated pipeline (brief → knowledge refresh → AI draft → deterministic compliance lint → expert review → publication), versioned as code with CI and tests, not a personal workflow.",
    "Purpose-built review skills for the experts in the loop, so their gate gets faster instead of heavier: fact-checking happens per claim, at review time, with pending items tracked explicitly.",
    "A measurement loop on AI visibility, to verify the standard against reality over the following weeks: the standard is a bet; the loop is the test.",
  ],
  results: [
    "The pipeline shipped its first article end to end (validated brief to production) with the expert gate intact.",
    "Editorial operations became versioned, tested code that colleagues can run and audit, instead of knowledge living in one person's head.",
    "Ongoing: the AI-visibility readout and the production deployment of the always-on service are the next milestones.",
  ],
};

export const astresProjects: Project[] = [...projects, etabli, contentEngine];

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
  "content-engine": {
    name: "Mercury", // the messenger, for the content machinery — cratered grey
    colorA: "#CFC9BC",
    colorB: "#575044",
    ring: false,
    moons: 0,
    tilt: 0.01,
    bandFreq: 6,
    accent: "207 201 188",
    glow: "232 226 214",
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
    "Open · 6-month internship · fintech / scale-up · from January 2027",
  bio: [
    "I'm a business operator who ships. Third-year BBA student at Audencia × Centrale Nantes, currently the solo DRI for Growth Data & Automation at Finary: pipelines, dashboards and AI systems the product team actually uses.",
    "On the side I co-founded Tiro, a B2B venture I ran as COO (prospecting, GTM and onboarding-to-delivery) to real revenue. The thread through everything: I use AI and automation to compress months of work into days, for products used by real people.",
    "What I'm building toward: product and growth leadership at an early-stage fintech. The discipline comes from elsewhere: four-plus years in the gym, climbing walls and long hikes.",
  ],
  now: [
    "Scaling growth-data systems at Finary",
    "Building the next billion-dollar startup",
    "Out climbing, or on a long hike",
  ],
  specs: [
    ["Education", "BBA Big Data, AI & Mgmt · Audencia × Centrale Nantes, 2027"],
    ["Currently", "Growth Data & Automation · Finary (solo DRI)"],
    ["Venture", "Co-founder & COO · Tiro"],
    ["Open to", "6-month internship · fintech / scale-up · from January 2027"],
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

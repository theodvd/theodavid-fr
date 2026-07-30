/**
 * Static project content — the only "database" of the site.
 * Ordered by impact; rendered as rows in Work and as full case-study
 * pages at /project/[slug].
 *
 * Confidentiality: no absolute Finary AUM/client/corporate figures anywhere.
 * Only process metrics (time saved, build cadence) and public facts.
 */
export type Project = {
  slug: string;
  index: string;
  title: string;
  context: string;
  year: string;
  role: string;
  description: string;
  tags: string[];
  stack: string[];
  stats: [string, string][];
  challenge: string;
  built: string[];
  results: string[];
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "multi-agent-fact-checker",
    index: "01",
    title: "Multi-Agent Fact-Checker",
    context: "Case study",
    year: "2026",
    role: "Designer & builder",
    description:
      "Two AI agents argue every claim and a confidence-weighted arbiter settles it with live web evidence, cutting video fact-checking from 7h to 1h.",
    tags: ["Multi-agent", "Claude + GPT-4", "Tavily"],
    stack: ["Claude API", "GPT-4", "Tavily", "Notion webhooks"],
    stats: [
      ["7h → 1h", "per video fact-checked"],
      ["−86%", "verification time"],
      ["~10h", "saved per week"],
    ],
    challenge:
      "Fact-checking a long-form video script meant about seven hours of manual source-hunting per video, roughly ten hours a week. A single LLM can't be trusted to do it: it hallucinates with confidence and cites nothing. The real question was whether two models could keep each other honest.",
    built: [
      "A claim-extraction stage that splits a script into individually verifiable statements.",
      "Two competing agents, Claude and GPT-4, that verify each claim independently and score their own confidence.",
      "Live evidence retrieval through the Tavily search API, so every verdict cites current sources rather than training data.",
      "A confidence-weighted arbiter that resolves disagreements between the two agents instead of trusting either blindly.",
      "A Notion trigger: paste a script, get back an annotated report (claim, verdict, confidence, sources) in the team's existing workspace.",
    ],
    results: [
      "Fact-checking dropped from ~7 hours to ~1 hour per video: an 86% cut, roughly ten hours back every week, with sources attached to every verdict.",
      "The adversarial setup beat single-model checking: disagreement between the two models is exactly where human attention belongs.",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/theodvd/finary-fact-checker" },
    ],
  },
  {
    slug: "newsletter-studio",
    index: "02",
    title: "Newsletter Studio",
    context: "Product",
    year: "2026",
    role: "Solo · product, build & deploy",
    description:
      "The productized version of Growfin: I turned a fintech brief I'd automated for myself into an app anyone can use: describe your field in one conversation with an AI assistant and get a tailored briefing delivered to Slack or email.",
    tags: ["Next.js", "Claude API", "Supabase"],
    stack: [
      "Next.js",
      "Supabase (magic-link auth + Postgres)",
      "Claude API (Sonnet 4.6)",
      "n8n",
      "Exa",
      "Slack OAuth",
      "Brevo",
      "React Three Fiber",
      "Docker / Caddy",
    ],
    stats: [
      ["1", "conversation to a live digest"],
      ["2 days", "side project to production beta"],
      ["Slack + email", "multi-workspace delivery"],
    ],
    challenge:
      "I'd already automated my own fintech intelligence brief (Growfin), but it was hardcoded to me: one source list, one output, one voice. Everyone I showed it to wanted their own (different field, different sources, different channel) and there was no way to give it to them without rebuilding the workflow by hand. The real problem wasn't the automation; it was the generalization: how do you let someone who's never seen a workflow describe their world in plain language and get a system built for them?",
    built: [
      "A conversational onboarding: users describe their role and what they want to follow, and an AI assistant (Lia, on Claude) interviews them, researches candidate sources, validates each one (RSS auto-discovery, freshness checks) and curates a source set, replacing the hardcoded feed list with a flow that infers anyone's sources from a sentence.",
      "A multi-tenant architecture: one shared engine holds all the logic (fetch, dedupe, curate, write, deliver) and each user gets a thin scheduled workflow that calls it, so an improvement ships to everyone at once instead of being copied per user.",
      "Two delivery channels with real auth: passwordless magic-link sign-in, one-click Slack OAuth so a brief lands in any workspace's channel, and transactional email.",
      "Product guardrails from day one: per-user cost caps, a 30-seat beta limit, and a server-side rule that an email brief can only go to the account's own address: a tester found the spam hole and I closed it.",
      "Designed, built and deployed to my own server in about two days with Claude Code, down to a 3D landing for the first impression.",
    ],
    results: [
      "A working v1 in production in roughly two days, now in private beta with about a dozen colleagues at Finary spinning up their own briefs.",
      "The productization held: a non-technical person sets up a tailored digest in one conversation, on an engine that scales to many users without many codebases.",
      "Real usage pointed straight at the next problem (twelve people signed up, three launched a brief), so activation, not capability, is the lever I'd pull next.",
    ],
    links: [
      { label: "news.tiro.agency", href: "https://news.tiro.agency" },
    ],
  },
  {
    slug: "solen",
    index: "03",
    title: "Solen",
    context: "Product",
    year: "2025 · ongoing",
    role: "Solo builder",
    description:
      "Personal investment tracker whose first version shipped in four days, parsing Trade Republic, Bourse Direct and Coinbase statements; now pivoting toward investor education.",
    tags: ["Lovable", "Supabase", "Parsers"],
    stack: [
      "Lovable (React + Tailwind)",
      "Supabase",
      "Edge Functions",
      "Yahoo Finance API",
      "Recharts",
    ],
    stats: [
      ["4 days", "first working MVP"],
      ["3", "broker parsers (PDF & CSV)"],
      ["Daily", "portfolio snapshots"],
    ],
    challenge:
      "Retail investors hold assets across brokers that don't talk to each other. Getting one honest view of a portfolio (total invested, current value, allocation) means spreadsheets and manual exports. I wanted the consolidated view, and I wanted to test how fast AI-assisted building could ship it.",
    built: [
      "A Supabase backend structured around accounts, holdings, securities and snapshots, with Edge Functions enriching assets through the Yahoo Finance API.",
      "Statement parsers for Trade Republic (PDF), Bourse Direct (CSV) and Coinbase (CSV): the unglamorous work that makes consolidation real.",
      "An automatic snapshot system tracking portfolio evolution day by day.",
      "A dark, Finary-inspired dashboard: P&L overview, historical performance curve, allocation by account, sector and region.",
      "An investor-profile questionnaire (risk tolerance, horizon, goals) generating first allocation recommendations.",
    ],
    results: [
      "A working prototype in four days: the proof point for compressing months into days with AI tooling.",
      "Now pivoting toward financial education and investor accompaniment, where the user conversations pointed.",
    ],
  },
  {
    slug: "tiro",
    index: "04",
    title: "Tiro",
    context: "Co-founder & COO",
    year: "2025-2026",
    role: "Co-founder & COO · sales, GTM & ops",
    description:
      "Co-founded and ran the operations of a two-sided B2B venture connecting independent talent with startups (lead-scoring, automated prospecting and onboarding-to-delivery) to €10K revenue across ~35 projects.",
    tags: ["Operator", "GTM", "Automation"],
    stack: ["n8n", "GPT", "Chrome extension", "Notion CRM"],
    stats: [
      ["€10K", "revenue generated"],
      ["~35", "client projects delivered"],
      ["70+", "freelancers onboarded"],
    ],
    challenge:
      "A two-sided venture only works if both sides keep moving: qualified demand coming in, talent ready to deliver, clients coming back. As COO I owned that machine end to end, and a student-run operation can't afford to run it by hand.",
    built: [
      "A lead-scoring Chrome extension (n8n + GPT) that rated prospects before any outreach, so prospecting time went where conversion was likeliest.",
      "An AI-assisted outreach system generating hyper-personalized messages per lead, sustaining a high response rate.",
      "A Notion-based CRM running clients, talent and missions end to end, with tagging and lead-scoring logic.",
      "Full client ownership: commercial proposals, pricing, structured follow-ups and post-project surveys.",
      "Acquisition dashboards tracking channels and conversion rates, used to refine the outreach sequences.",
    ],
    results: [
      "€10K in revenue across ~35 client projects, with several clients returning repeatedly.",
      "70+ freelancers onboarded and trained into a delivery pipeline that ran alongside studies and an internship.",
      "Proof I can own a GTM motion end to end (acquisition, conversion and delivery) on systems rather than hustle.",
    ],
    links: [{ label: "tiro.agency", href: "https://tiro.agency" }],
  },
];

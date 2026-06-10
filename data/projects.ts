/**
 * Static project content — the only "database" of the site.
 * Ordered by impact; rendered as rows in Work and as full case-study
 * pages at /project/[slug]. Content sourced from the original briefs
 * and the previous portfolio's published case studies.
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
    slug: "app-review-intelligence",
    index: "01",
    title: "App Review Intelligence",
    context: "Finary",
    year: "2026",
    role: "Growth Data & Automation — solo DRI",
    description:
      "Classification pipeline turning 1,965 App Store & Play Store reviews into a live product-intelligence dashboard the team monitors at scale.",
    tags: ["Python", "Claude API", "Streamlit"],
    stack: ["Python", "Claude Haiku", "Streamlit", "Pandas"],
    stats: [
      ["1,965", "reviews classified"],
      ["2", "app stores covered"],
      ["1", "live dashboard for the product team"],
    ],
    challenge:
      "Finary's product team had thousands of App Store and Play Store reviews — raw, unstructured, in several languages — and no scalable way to know what users were actually complaining about, or whether an issue was growing. Reading them manually doesn't scale; ignoring them loses signal.",
    built: [
      "A Python ingestion pipeline collecting and normalizing 1,965 reviews across both stores.",
      "An LLM classification layer on Claude Haiku tagging every review by theme, sentiment and severity — prompts iterated against a hand-labeled validation sample until the taxonomy held.",
      "A Streamlit dashboard in Finary's dark branding: theme trends over time, store and version filters, drill-down to the raw verbatims.",
      "A design meant to re-run on every new batch of reviews, so monitoring is continuous rather than a one-off study.",
    ],
    results: [
      "The product team got a scalable review-monitoring system instead of anecdotal reading.",
      "Classification surfaced sync reliability and pricing perception as the dominant recurring themes — concrete, prioritizable levers.",
      "The pipeline pattern (ingest → LLM classify → dashboard) became reusable for other feedback sources.",
    ],
  },
  {
    slug: "growfin-newsletter",
    index: "02",
    title: "Growfin Newsletter",
    context: "Side system",
    year: "2025 — ongoing",
    role: "Designer & operator of the whole system",
    description:
      "Fully automated bi-weekly fintech intelligence brief — 13 sources researched, written, evaluated and delivered to subscribers without a human in the loop.",
    tags: ["n8n", "Claude API", "Langfuse", "Brevo"],
    stack: ["n8n", "Claude API", "Langfuse", "Promptfoo", "Brevo", "Notion"],
    stats: [
      ["13", "sources monitored"],
      ["6", "editorial sections per issue"],
      ["0", "humans in the loop"],
    ],
    challenge:
      "Staying sharp on fintech means hours of reading every week — funding rounds, product launches, regulation. I wanted the output of that reading without the hours, at an editorial quality I'd be willing to put my name on, delivered on a schedule whether I'm busy or not.",
    built: [
      "An n8n pipeline pulling from 13 curated sources, deduplicating and scoring items for relevance.",
      "A Claude-powered editorial layer writing six structured sections per issue, with a consistent voice defined in the system prompt.",
      "Langfuse tracing on every generation — each issue's cost, latency and outputs are observable, not a black box.",
      "Promptfoo evals guarding the prompts: changes ship only if they beat the previous version on the test set.",
      "Brevo for scheduled delivery to the subscriber list, Notion as the permanent archive.",
    ],
    results: [
      "The brief ships every two weeks with zero manual intervention — research, writing, QA and delivery are all systematized.",
      "A real LLM-ops setup (tracing + evals) on a personal project, the same discipline used on production systems.",
    ],
  },
  {
    slug: "solen",
    index: "03",
    title: "Solen",
    context: "Product",
    year: "2025 — ongoing",
    role: "Solo builder",
    description:
      "Personal investment tracker — first working version shipped in four days — parsing Trade Republic, Bourse Direct and Coinbase statements; now pivoting toward investor education.",
    tags: ["Lovable", "Supabase", "Parsers"],
    stack: ["Lovable (React + Tailwind)", "Supabase", "Edge Functions", "Yahoo Finance API", "Recharts"],
    stats: [
      ["4 days", "first working MVP"],
      ["3", "broker parsers (PDF & CSV)"],
      ["Daily", "portfolio snapshots"],
    ],
    challenge:
      "Retail investors hold assets across brokers that don't talk to each other. Getting one honest view of a portfolio — total invested, current value, allocation — means spreadsheets and manual exports. I wanted the consolidated view, and I wanted to test how fast AI-assisted building could ship it.",
    built: [
      "A Supabase backend structured around accounts, holdings, securities and snapshots, with Edge Functions enriching assets through the Yahoo Finance API.",
      "Statement parsers for Trade Republic (PDF), Bourse Direct (CSV) and Coinbase (CSV) — the unglamorous work that makes consolidation real.",
      "An automatic snapshot system tracking portfolio evolution day by day.",
      "A dark, Finary-inspired dashboard on Lovable: P&L overview, historical performance curve, allocation by account, sector and region.",
      "An investor-profile questionnaire (risk tolerance, horizon, goals) generating first allocation recommendations.",
    ],
    results: [
      "A working prototype in four days — the proof point for compressing months into days with AI tooling.",
      "Now pivoting toward financial education and investor accompaniment, where the user conversations pointed.",
    ],
    links: [{ label: "Live prototype", href: "https://tiro-finance.lovable.app/" }],
  },
  {
    slug: "tiro",
    index: "04",
    title: "Tiro",
    context: "Co-founder & COO",
    year: "2025 — ongoing",
    role: "Co-founder & COO — sales, ops, automation",
    description:
      "B2B creative-tech agency: €10K revenue across 35 projects in six months — LinkedIn rebranding and web development for tech & infratech independents.",
    tags: ["Agency", "Brand", "Web"],
    stack: ["n8n", "GPT", "Chrome extension", "Notion CRM"],
    stats: [
      ["35", "client projects delivered"],
      ["€10K", "generated in 6 months"],
      ["70", "student designers onboarded"],
    ],
    challenge:
      "Student designers struggle to get real-world experience; early-stage founders can't afford agencies. Tiro connects both sides — but making a two-sided model work takes systems, not just hustle: qualified leads in, quality delivery out, clients coming back.",
    built: [
      "A custom Chrome extension (n8n + GPT) scoring LinkedIn profiles automatically before outreach — prospecting time goes where conversion probability is.",
      "An AI-assisted outreach system generating hyper-personalized LinkedIn messages per lead, sustaining a high response rate.",
      "A complete Notion-based CRM managing clients, designer profiles and missions, with tagging and lead-scoring logic.",
      "End-to-end client operations: proposals, pricing, structured follow-ups and post-project surveys.",
      "Acquisition dashboards tracking channels and conversion, used to refine the outreach sequences.",
    ],
    results: [
      "35 client projects delivered and €10K generated in the first six months, with several clients returning up to six times.",
      "70 student designers onboarded and trained — a real talent community, not a freelancer list.",
      "The operation runs on systems: lead-gen, CRM and follow-ups are automated enough to operate alongside studies and an internship.",
    ],
    links: [{ label: "tiro.agency", href: "https://tiro.agency" }],
  },
  {
    slug: "multi-agent-fact-checker",
    index: "05",
    title: "Multi-Agent Fact-Checker",
    context: "Case study",
    year: "2026",
    role: "Designer & builder (Finary recruitment case)",
    description:
      "Claude and GPT-4 agents argue over claims; a confidence-weighted arbiter settles them with live web evidence — cutting fact-checking from 7h to 2h.",
    tags: ["Multi-agent", "Tavily", "Notion API"],
    stack: ["Claude API", "GPT-4", "Tavily", "Notion webhooks"],
    stats: [
      ["7h → 2h", "per script fact-checked"],
      ["−71%", "verification time"],
      ["2", "competing frontier models"],
    ],
    challenge:
      "Fact-checking a long-form video script took around seven hours of manual source-hunting per script. A single LLM can't be trusted as the checker — it hallucinates with confidence. The interesting question: can two models keep each other honest?",
    built: [
      "A claim-extraction stage splitting a script into individually verifiable statements.",
      "Two competing agents — Claude and GPT-4 — independently verifying each claim and scoring their own confidence.",
      "Live evidence retrieval through the Tavily search API, so verdicts cite current sources rather than training data.",
      "A confidence-weighted arbitration layer resolving disagreements between the two agents instead of naively trusting either.",
      "A Notion webhook delivering the annotated report — claim, verdict, confidence, sources — into the team's existing workspace.",
    ],
    results: [
      "Fact-checking time dropped from ~7 hours to ~2 hours per script — a 71% reduction with sources attached to every verdict.",
      "Adversarial multi-agent setups beat single-model verification: disagreement between models is exactly where human attention should go.",
    ],
  },
];

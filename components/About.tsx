import Reveal from "./Reveal";
import Scrub from "./Scrub";

/** Mono key/value spec sheet — the "terminal output" version of a bio. */
const SPECS: [string, string][] = [
  ["Education", "BBA Big Data, AI & Mgmt — Audencia × Centrale Nantes, 2027"],
  ["Currently", "Growth Data & Automation — Finary (solo DRI)"],
  ["Venture", "Co-founder & COO — Tiro"],
  ["Open to", "6-month internship — fintech / scale-up · from January 2027"],
  ["Exchanges", "Shenzhen, 5 mo · Casablanca, 3 mo"],
  ["Elsewhere", "Climbing · Long hikes · Gym, 4+ years"],
];

/**
 * Act 3 — about. Split layout: sticky manifesto on the left,
 * short first-person bio + spec sheet scrolling on the right.
 */
export default function About() {
  return (
    <section id="about" className="px-6 py-24 md:px-10 md:py-44">
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <Reveal>
              <p className="label">
                <span className="text-accent">02</span> — About
              </p>
              <Scrub from={30} to={-30}>
                <h2 className="display mt-6 text-4xl leading-tight md:text-6xl">
                  Operator first.
                  <br />
                  Builder by default.
                </h2>
              </Scrub>
            </Reveal>
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal stagger={0.15}>
            <p className="text-lg leading-relaxed text-ink md:text-xl">
              I&apos;m a business operator who ships. Third-year BBA student at
              Audencia × Centrale Nantes, currently the solo DRI for Growth
              Data &amp; Automation at Finary — pipelines, dashboards and AI
              systems the product team actually uses.
            </p>
            <p className="mt-8 text-lg leading-relaxed text-muted md:text-xl">
              On the side I co-founded Tiro, a B2B venture I ran as COO —
              prospecting, GTM and onboarding-to-delivery — to real revenue.
              The thread through everything: I use AI and automation to
              compress months of work into days, for products used by real
              people.
            </p>
            <p className="mt-8 text-lg leading-relaxed text-muted md:text-xl">
              What I&apos;m building toward — product and growth leadership at
              an early-stage fintech. The discipline comes from elsewhere:
              four-plus years in the gym, climbing walls and long hikes.
            </p>
          </Reveal>

          <Reveal className="mt-20">
            {SPECS.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-12 gap-4 border-t border-line py-5 last:border-b"
              >
                <span className="label col-span-4 md:col-span-3">{key}</span>
                <span className="col-span-8 text-sm text-ink md:col-span-9">
                  {value}
                </span>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

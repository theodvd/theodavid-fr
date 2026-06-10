import Link from "next/link";
import Reveal from "./Reveal";
import Scrub from "./Scrub";
import { projects } from "@/data/projects";

/**
 * Act 2 — selected work as full-width editorial rows, each linking to its
 * case-study page at /project/[slug] (→ slides in on hover). Heading drifts
 * on scroll (Scrub); rows stagger in and lift on hover.
 */
export default function Work() {
  return (
    <section id="work" className="px-6 py-32 md:px-10 md:py-44">
      <Scrub>
        <Reveal>
          <p className="label">
            <span className="text-accent">01</span> — Selected Work
          </p>
          <h2 className="display mt-6 text-5xl md:text-7xl">
            Systems that shipped
          </h2>
        </Reveal>
      </Scrub>

      <Reveal stagger={0.12} className="mt-20">
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={`/project/${p.slug}`}
            className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-4 border-t border-line py-10 transition-colors duration-500 last:border-b hover:bg-surface md:py-12"
          >
            <span className="label col-span-2 transition-colors duration-500 group-hover:text-accent md:col-span-1">
              {p.index}
            </span>

            <div className="col-span-10 md:col-span-4">
              <h3 className="display text-3xl transition-transform duration-500 ease-out group-hover:translate-x-2 md:text-4xl">
                {p.title}
                <span className="ml-3 inline-block text-xl text-accent opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100 md:text-2xl">
                  →
                </span>
              </h3>
              <p className="label mt-3">{p.context}</p>
            </div>

            <p className="col-span-10 col-start-3 text-sm leading-relaxed text-ink md:col-span-4 md:col-start-6 md:text-base">
              {p.description}
            </p>

            <p className="label col-span-10 col-start-3 md:col-span-3 md:col-start-10 md:text-right">
              {p.tags.join(" · ")}
            </p>
          </Link>
        ))}
      </Reveal>
    </section>
  );
}

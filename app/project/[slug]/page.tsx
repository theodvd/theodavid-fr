import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import PlanetCanvas from "@/components/three/PlanetCanvas";
import { projects } from "@/data/projects";
import { planets, defaultPlanet } from "@/data/planets";

/**
 * Case-study page — /project/[slug], fully static (SSG).
 * Editorial layout: breadcrumb, oversized title, mono meta grid, big stats,
 * then Challenge / What I built / Results, and prev/next navigation.
 * Deliberately no WebGL here: these pages are for reading.
 */

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return {};
  return {
    title: `${project.title} — Théo David`,
    description: project.description,
  };
}

export default function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const i = projects.findIndex((p) => p.slug === params.slug);
  if (i === -1) notFound();

  const project = projects[i];
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const planet = planets[project.slug] ?? defaultPlanet;

  return (
    <main
      className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-28 md:px-10"
      style={
        {
          // retint accent & glow across the whole page to match the planet
          "--c-accent": planet.accent,
          "--c-glow": planet.glow,
        } as React.CSSProperties
      }
    >
      <PlanetCanvas slug={project.slug} />
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-10">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-widest2 text-muted transition-colors duration-300 hover:text-ink"
        >
          ← Théo David
        </Link>
        <Link
          href="/#contact"
          className="draw-link font-mono text-[11px] uppercase tracking-widest2 text-muted transition-colors duration-300 hover:text-ink"
        >
          Contact
        </Link>
      </nav>

      <Reveal>
        <p className="label">
          <span className="text-accent">{project.index}</span> — Case study ·{" "}
          {project.context} · <span className="text-accent">{planet.name}</span>
        </p>
        <h1 className="display mt-6 text-5xl md:text-8xl">{project.title}</h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
          {project.description}
        </p>
      </Reveal>

      <Reveal className="mt-16">
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line md:grid-cols-4">
          {[
            ["Year", project.year],
            ["Role", project.role],
            ["Context", project.context],
            ["Stack", project.stack.join(" · ")],
          ].map(([k, v]) => (
            <div key={k} className="bg-night p-5">
              <p className="label">{k}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink">{v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal stagger={0.12} className="mt-20 grid gap-10 md:grid-cols-3">
        {project.stats.map(([value, label]) => (
          <div key={label} className="border-t border-line pt-5">
            <p className="display text-4xl text-glow md:text-5xl">{value}</p>
            <p className="label mt-3">{label}</p>
          </div>
        ))}
      </Reveal>

      <Reveal className="mt-24">
        <p className="label">The challenge</p>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink md:text-xl">
          {project.challenge}
        </p>
      </Reveal>

      <Reveal className="mt-20">
        <p className="label">What I built</p>
        <ul className="mt-6 max-w-3xl">
          {project.built.map((item) => (
            <li
              key={item}
              className="border-t border-line py-5 text-base leading-relaxed text-muted last:border-b md:text-lg"
            >
              {item}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="mt-20">
        <p className="label">Results</p>
        <ul className="mt-6 max-w-3xl">
          {project.results.map((item) => (
            <li
              key={item}
              className="border-t border-line py-5 text-base leading-relaxed text-ink last:border-b md:text-lg"
            >
              {item}
            </li>
          ))}
        </ul>
        {project.links && (
          <div className="mt-10 flex gap-8">
            {project.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="draw-link label !text-accent"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </Reveal>

      <Reveal className="mt-28">
        <div className="flex items-center justify-between border-t border-line pt-8">
          <Link href={`/project/${prev.slug}`} className="group max-w-[45%]">
            <p className="label">← Previous</p>
            <p className="display mt-2 truncate text-xl transition-colors duration-300 group-hover:text-glow md:text-2xl">
              {prev.title}
            </p>
          </Link>
          <Link
            href={`/project/${next.slug}`}
            className="group max-w-[45%] text-right"
          >
            <p className="label">Next →</p>
            <p className="display mt-2 truncate text-xl transition-colors duration-300 group-hover:text-glow md:text-2xl">
              {next.title}
            </p>
          </Link>
        </div>
        <p className="label mt-16 text-center">
          <a
            href="mailto:theo.david@audencia.com"
            className="draw-link !text-ink"
          >
            theo.david@audencia.com
          </a>
        </p>
      </Reveal>
    </main>
  );
}

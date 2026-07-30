import Reveal from "./Reveal";

const NOW = [
  "Scaling growth-data systems at Finary",
  "Building the next billion-dollar startup",
  "Out climbing, or on a long hike",
];

/**
 * Act 4 — a small present-tense pulse. Three lines, nothing more.
 * Deliberately inert: no hover states, so nothing pretends to be a link.
 */
export default function Now() {
  return (
    <section id="now" className="px-6 pb-24 md:px-10 md:pb-44">
      <Reveal>
        <p className="label flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="text-accent">03</span> · Now
        </p>
      </Reveal>
      <Reveal stagger={0.12} className="mt-10">
        {NOW.map((item, i) => (
          <p
            key={item}
            className="display border-t border-line py-6 text-2xl text-muted last:border-b md:text-4xl"
          >
            <span className="label mr-6 align-middle">{`0${i + 1}`}</span>
            {item}
          </p>
        ))}
      </Reveal>
    </section>
  );
}

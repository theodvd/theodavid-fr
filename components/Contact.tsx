import Reveal from "./Reveal";
import LocalTime from "./LocalTime";

/**
 * Act 5 — contact. The camera has pulled back to the wide shot; a
 * near-empty viewport with the email set enormous, the availability line,
 * two mono outlinks, and a terminal-style footer with the Paris clock.
 */
export default function Contact() {
  return (
    <section
      id="contact"
      className="flex min-h-[90svh] flex-col justify-between px-6 pt-32 md:px-10 md:pt-44"
    >
      <Reveal>
        <p className="label">
          <span className="text-accent">04</span> — Contact
        </p>
        <h2 className="display mt-6 text-4xl md:text-6xl">
          Building something in fintech?
        </h2>
        <p className="label mt-8 flex items-center gap-3 !text-glow">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50 motion-reduce:animate-none" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Open — 6-month internship · fintech / scale-up · from January 2027
        </p>
        <a
          href="mailto:theo.david@audencia.com"
          className="draw-link display mt-14 inline-block break-all text-[clamp(1.6rem,5.5vw,5rem)] text-ink transition-colors duration-500 hover:text-glow"
        >
          theo.david@audencia.com
        </a>
        <div className="mt-16 flex gap-8">
          <a
            href="https://www.linkedin.com/in/theodavid-tiro"
            target="_blank"
            rel="noopener noreferrer"
            className="draw-link label !text-ink transition-colors duration-300 hover:!text-accent"
          >
            LinkedIn ↗
          </a>
          <a
            href="https://github.com/theodvd"
            target="_blank"
            rel="noopener noreferrer"
            className="draw-link label !text-ink transition-colors duration-300 hover:!text-accent"
          >
            GitHub ↗
          </a>
          <a
            href="https://tiro.agency"
            target="_blank"
            rel="noopener noreferrer"
            className="draw-link label !text-ink transition-colors duration-300 hover:!text-accent"
          >
            Tiro ↗
          </a>
        </div>
      </Reveal>

      <footer className="label mt-32 flex flex-col gap-3 border-t border-line py-8 md:flex-row md:items-center md:justify-between">
        <span>Paris — Brussels</span>
        <LocalTime />
        <span>© 2026 · Next.js / Three.js / GSAP</span>
      </footer>
    </section>
  );
}

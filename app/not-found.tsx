import Link from "next/link";

/**
 * Branded 404 — on-theme with the solar identity.
 * Static, no WebGL: just type, the grain overlay from the layout, and a way home.
 */
export default function NotFound() {
  return (
    <main className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <p className="label">
        <span className="text-accent">404</span> · Signal lost
      </p>
      <h1 className="display mt-6 text-5xl md:text-8xl">
        This page drifted
        <br />
        out of orbit.
      </h1>
      <Link
        href="/"
        className="draw-link label mt-12 !text-ink transition-colors duration-300 hover:!text-glow"
      >
        ← Back to the sun
      </Link>
    </main>
  );
}

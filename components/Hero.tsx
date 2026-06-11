"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Act 1 — full-viewport hero over the fixed particle backdrop.
 * The name enters with clipped line reveals timed to the chaos resolving
 * (~1s in), then the whole composition parallax-fades as you scroll away
 * (scrubbed, so it tracks the finger/wheel exactly).
 * Text is visible by default; hidden states are applied only via JS.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-line]",
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.4,
          stagger: 0.14,
          delay: 0.9,
          ease: "power3.out",
        }
      );
      gsap.fromTo(
        "[data-fade]",
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          delay: 1.7,
          ease: "power3.out",
        }
      );
      // scrubbed exit: the hero recedes upward as the camera dives in
      gsap.to(content.current, {
        yPercent: -18,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "85% top",
          scrub: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="top" className="relative h-[100svh]">
      {/* mobile-only scrim: guarantees the name reads over the sun */}
      <div
        className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-night via-night/55 to-transparent md:hidden"
        aria-hidden="true"
      />
      <div
        ref={content}
        className="relative flex h-full flex-col justify-between px-6 pb-10 pt-24 md:px-10"
      >
        <div className="flex justify-end">
          <p data-fade className="label text-right leading-loose">
            Growth Data &amp; Automation — Finary
            <br />
            Co-founder &amp; COO — Tiro
          </p>
        </div>

        <div className="flex items-end justify-between gap-8">
          <div>
            <h1 className="display text-[clamp(4.5rem,15vw,13rem)] uppercase">
              <span className="block overflow-hidden">
                <span data-line className="block">
                  Théo
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-line className="block">
                  David
                </span>
              </span>
            </h1>
            <p
              data-fade
              className="mt-8 max-w-md text-base leading-relaxed text-muted md:text-lg"
            >
              I build growth systems for fintech — data, automation and AI,
              shipped as working products.
            </p>
            <p data-fade className="label mt-6 flex items-center gap-3 !text-glow">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Open — 6-month internship · from Jan 2027
            </p>
          </div>

          <a
            data-fade
            href="#work"
            aria-label="Scroll to selected work"
            className="hidden flex-col items-center gap-4 md:flex"
          >
            <span className="label">Explore</span>
            <span className="scroll-cue block h-16 w-px bg-accent/70" />
          </a>
        </div>
      </div>
    </section>
  );
}

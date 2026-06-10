"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const PHRASE =
  "Growth systems · Data pipelines · AI automation · Shipped, not slideware · ";

/**
 * Full-bleed outline-text marquee between hero and work.
 * The loop runs on GSAP; scroll velocity skews the strip and accelerates it,
 * so the type physically reacts to how hard you scroll (igloo-style energy).
 * Static (single line, no loop) under reduced motion.
 */
export default function Marquee() {
  const strip = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !strip.current) return;

    const loop = gsap.to(strip.current, {
      xPercent: -50,
      ease: "none",
      duration: 30,
      repeat: -1,
    });

    const skewTo = gsap.quickTo(strip.current, "skewX", {
      duration: 0.5,
      ease: "power2.out",
    });

    const st = ScrollTrigger.create({
      onUpdate(self) {
        const v = self.getVelocity();
        skewTo(gsap.utils.clamp(-10, 10, v / -350));
        loop.timeScale(1 + Math.min(Math.abs(v) / 1500, 3));
        gsap.to(loop, {
          timeScale: 1,
          duration: 1.2,
          overwrite: "auto",
          ease: "power2.out",
        });
      },
    });

    return () => {
      st.kill();
      loop.kill();
    };
  }, [reduced]);

  return (
    <div
      className="overflow-hidden border-y border-line py-8 md:py-10"
      aria-hidden="true"
    >
      <div ref={strip} className="flex w-max whitespace-nowrap will-change-transform">
        {[0, 1].map((i) => (
          <span
            key={i}
            className="display stroke-text pr-8 text-[clamp(3rem,8vw,7rem)] uppercase"
          >
            {PHRASE}
          </span>
        ))}
      </div>
    </div>
  );
}

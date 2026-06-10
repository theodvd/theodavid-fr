"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-scrubbed parallax wrapper: the element drifts from `from`px to
 * `to`px across its journey through the viewport. Used on big headings so
 * they move at a different speed than the page — depth without gimmick.
 */
export default function Scrub({
  children,
  from = 70,
  to = -70,
  className,
}: {
  children: React.ReactNode;
  from?: number;
  to?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;

    const tween = gsap.fromTo(
      ref.current,
      { y: from },
      {
        y: to,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced, from, to]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

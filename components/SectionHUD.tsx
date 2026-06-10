"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SECTIONS: [string, string][] = [
  ["#work", "01 / 04 — Work"],
  ["#about", "02 / 04 — About"],
  ["#now", "03 / 04 — Now"],
  ["#contact", "04 / 04 — Contact"],
];

/**
 * Fixed terminal-style HUD: a 1px scroll-progress line along the top
 * and the current section index bottom-left (desktop only).
 * Pure observers — works the same with or without reduced motion.
 */
export default function SectionHUD() {
  const bar = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const triggers = SECTIONS.map(([sel, text]) =>
      ScrollTrigger.create({
        trigger: sel,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && setLabel(text),
      })
    );

    // back in the hero -> hide the label
    const hero = ScrollTrigger.create({
      trigger: "#top",
      start: "top top",
      end: "bottom 55%",
      onToggle: (self) => self.isActive && setLabel(""),
    });

    const progress = gsap.to(bar.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    });

    return () => {
      triggers.forEach((t) => t.kill());
      hero.kill();
      progress.scrollTrigger?.kill();
      progress.kill();
    };
  }, []);

  return (
    <>
      <div
        ref={bar}
        className="fixed inset-x-0 top-0 z-50 h-px origin-left scale-x-0 bg-accent/60"
        aria-hidden="true"
      />
      <p
        className={`label fixed bottom-8 left-10 z-40 hidden transition-opacity duration-700 md:block ${
          label ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        {label}
      </p>
    </>
  );
}

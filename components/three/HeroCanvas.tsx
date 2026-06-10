"use client";

import { useEffect, useRef } from "react";
import { createHeroScene } from "./createHeroScene";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Fixed full-page WebGL backdrop — the scene persists behind every section
 * (the camera journey is scroll-driven inside createHeroScene).
 * A faint ice gradient sits underneath as the no-WebGL fallback.
 */
export default function HeroCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    const sceneHandle = createHeroScene(ref.current, reduced);
    return () => sceneHandle?.destroy();
  }, [reduced]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 68% 45%, rgba(255,122,41,0.09), transparent 70%)",
        }}
      />
      <div ref={ref} className="absolute inset-0" />
    </div>
  );
}

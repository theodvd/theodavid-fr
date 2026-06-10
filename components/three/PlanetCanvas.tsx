"use client";

import { useEffect, useRef } from "react";
import { createPlanetScene } from "./createPlanetScene";
import { planets, defaultPlanet } from "@/data/planets";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Mounts the per-project planet (see data/planets.ts for the
 * project → Solar System planet mapping).
 */
export default function PlanetCanvas({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    const spec = planets[slug] ?? defaultPlanet;
    const handle = createPlanetScene(
      ref.current,
      {
        colorA: spec.colorA,
        colorB: spec.colorB,
        ring: spec.ring,
        moons: spec.moons,
        tilt: spec.tilt,
        bandFreq: spec.bandFreq,
      },
      reduced
    );
    return () => handle?.destroy();
  }, [slug, reduced]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div ref={ref} className="absolute inset-0" />
    </div>
  );
}

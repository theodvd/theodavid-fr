"use client";

import { useEffect, useState, type ReactNode } from "react";
import AstresApp from "./AstresApp";

/**
 * Capability gate for the home page.
 *
 * The server ALWAYS renders the classic page (children): crawlers index the
 * full content, old browsers and small screens keep the validated experience.
 * After hydration, a browser that can actually run the solar system gets it
 * INSTEAD — swapping the state unmounts the classic tree entirely, which also
 * tears down its WebGL hero cleanly (no second scene burning GPU behind).
 *
 * The gate is a capability check, not UA sniffing: the scene is plain WebGL
 * (unlike trucs.ai's WebGPU original), so "can create a WebGL context" covers
 * every modern Chrome / Safari / Firefox / Edge.
 */
const MIN_WIDTH = 768; // below this, the validated classic mobile experience

function canRunAstres(): boolean {
  if (window.innerWidth < MIN_WIDTH) return false;
  try {
    const probe = document.createElement("canvas");
    return !!(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function HomeSwitch({ children }: { children: ReactNode }) {
  const [astres, setAstres] = useState(false);

  useEffect(() => {
    if (canRunAstres()) setAstres(true);
  }, []);

  return astres ? <AstresApp /> : <>{children}</>;
}

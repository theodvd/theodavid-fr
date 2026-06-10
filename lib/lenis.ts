import type Lenis from "lenis";

/**
 * Shared handle to the active Lenis instance.
 * Set by SmoothScroll, consumed by anything that needs programmatic
 * scrolling (e.g. header anchor links). Null when reduced motion is on.
 */
export const lenisRef: { current: Lenis | null } = { current: null };

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import {
  ASTRES_BODIES,
  SUN_ID,
  createAstresScene,
  type AstresScene,
} from "./createAstresScene";
import { astresProjects, sunProfile } from "./astresProjects";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * /astres — the client shell around the solar-system scene.
 *
 * Division of labour:
 *  - createAstresScene owns every Three.js object, the camera rig and the
 *    per-frame marker projection (it writes straight to the DOM nodes below).
 *  - this component owns HTML only: HUD, markers, landing overlay, panel.
 *
 * Two focus states on purpose:
 *  - `focus`   flips the instant a trip starts (drives markers + top HUD, so
 *              the destination is announced while you're still flying);
 *  - `settled` flips on arrival (drives the bottom-left block, which fades out
 *              on departure and fades back in with the new content, so the
 *              content swap is never visible).
 */

const TIME_STEPS: { value: number; label: string }[] = [
  { value: 0, label: "⏸" },
  { value: 1, label: "1×" },
  { value: 10, label: "10×" },
  { value: 100, label: "100×" },
];

/* astres design tokens — pure black, monospace, cold greys.
   Scoped to this page so nothing here leaks into the site's warm palette. */
const CSS = `
.astres-root { --a-dim:#555; --a-mid:#666; --a-soft:#999; --a-line:#2a2a2a; --a-blue:#6aa3ff; }
.astres-btn {
  background:#0a0a0a; border:1px solid var(--a-line); color:var(--a-mid);
  border-radius:2px; padding:5px 11px; font-size:11px; line-height:1;
  letter-spacing:.08em; cursor:pointer;
  transition:color .15s ease, border-color .15s ease;
}
.astres-btn:hover { border-color:#555; color:#ccc; }
.astres-btn[data-active="true"] { color:var(--a-blue); border-color:#33507d; }
.astres-marker {
  position:absolute; left:0; top:0; text-align:left;
  background:rgba(0,0,0,.55); border:1px solid var(--a-line); border-radius:2px;
  padding:5px 8px; cursor:pointer; white-space:nowrap;
  transition:opacity .15s ease, border-color .15s ease;
}
.astres-marker:hover { border-color:#555; }
.astres-arrow { display:none; margin-right:6px; color:var(--a-soft); }
/* off-screen bodies collapse to a compact arrow chip pinned to the edge */
.astres-marker[data-offscreen="true"] { border-color:#4a4a4a; opacity:.85; }
.astres-marker[data-offscreen="true"] .astres-arrow { display:inline-block; }
.astres-marker[data-offscreen="true"] .astres-marker-title { display:none; }
.astres-panel::-webkit-scrollbar { width:6px; }
.astres-panel::-webkit-scrollbar-thumb { background:#222; border-radius:3px; }
`;

export default function AstresApp() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<AstresScene | null>(null);
  const markerEls = useRef(new Map<string, HTMLElement | null>());
  const reduced = useReducedMotion();

  const [focus, setFocus] = useState<string>(SUN_ID);
  const [settled, setSettled] = useState<string>(SUN_ID);
  const [traveling, setTraveling] = useState(false);
  const [panelSlug, setPanelSlug] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [timeScale, setTimeScale] = useState(10);

  // the scene calls back from outside React's render cycle, so it needs a ref
  const focusRef = useRef(focus);
  focusRef.current = focus;
  // read once at mount only — changing the speed must not rebuild the scene
  const timeScaleRef = useRef(timeScale);
  timeScaleRef.current = timeScale;

  /* ---- navigation ------------------------------------------------ */

  // The panel content stays mounted through its 250ms slide-out, so closing
  // it is "hide now, unmount later" — this timer owns that second step.
  const panelClearTimer = useRef<number | null>(null);
  // Arriving at a planet auto-opens its case study after a beat (never the
  // sun). Any user decision — opening it early, closing it, leaving — kills
  // the pending timer, so the auto-open never fights the visitor.
  const autoOpenTimer = useRef<number | null>(null);

  const clearAutoOpen = useCallback(() => {
    if (autoOpenTimer.current) {
      window.clearTimeout(autoOpenTimer.current);
      autoOpenTimer.current = null;
    }
  }, []);

  const openPanel = useCallback(
    (slug: string) => {
      clearAutoOpen();
      if (panelClearTimer.current) window.clearTimeout(panelClearTimer.current);
      setPanelSlug(slug);
      setPanelOpen(true);
      track("astres_panel", { slug });
    },
    [clearAutoOpen]
  );

  const closePanel = useCallback(() => {
    clearAutoOpen();
    setPanelOpen(false);
    if (panelClearTimer.current) window.clearTimeout(panelClearTimer.current);
    panelClearTimer.current = window.setTimeout(() => setPanelSlug(null), 260);
  }, [clearAutoOpen]);

  useEffect(
    () => () => {
      if (panelClearTimer.current) window.clearTimeout(panelClearTimer.current);
      if (autoOpenTimer.current) window.clearTimeout(autoOpenTimer.current);
    },
    []
  );

  const travelTo = useCallback(
    (id: string) => {
      if (id === focusRef.current) return;
      setFocus(id);
      closePanel(); // leaving a planet always dismisses its case study
      setTraveling(true);
      sceneRef.current?.focusBody(id);
      track("astres_travel", { body: id });
    },
    [closePanel]
  );

  /* ---- scene lifecycle ------------------------------------------- */

  useEffect(() => {
    if (!mountRef.current) return;
    const handle = createAstresScene(mountRef.current, {
      reducedMotion: reduced,
      timeScale: timeScaleRef.current,
    });
    if (!handle) return;
    sceneRef.current = handle;

    // markers mount before this effect runs, so replay the registrations
    markerEls.current.forEach((el, id) => handle.registerMarkerEl(id, el));

    handle.setOnArrive((id) => {
      setSettled(id);
      setTraveling(false);
      // parked on a planet: its case study opens by itself after a beat
      // (clicking the planet earlier still works — that path clears this)
      clearAutoOpen();
      if (id !== SUN_ID) {
        autoOpenTimer.current = window.setTimeout(() => openPanel(id), 2000);
      }
    });

    // The scene already re-focuses when a NON-focused body is clicked; this
    // callback only has to mirror that into React state (and open the panel
    // when the click landed on the body we're already parked at — the sun
    // included: its panel is the "who I am" profile).
    handle.setOnBodyClick((id) => {
      if (id === focusRef.current) {
        openPanel(id);
        return;
      }
      setFocus(id);
      closePanel();
      setTraveling(true);
    });

    return () => {
      sceneRef.current = null;
      handle.destroy();
    };
  }, [reduced, openPanel, closePanel, clearAutoOpen]);

  useEffect(() => {
    sceneRef.current?.setTimeScale(timeScale);
  }, [timeScale]);

  // Dialog behavior: Escape closes, Tab is trapped inside the panel, and
  // focus moves into the dialog on open then back where it was on close.
  const lastFocused = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!panelOpen) {
      lastFocused.current?.focus?.();
      lastFocused.current = null;
      return;
    }
    lastFocused.current = document.activeElement as HTMLElement | null;
    const panel = document.querySelector<HTMLElement>(".astres-panel");
    panel?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePanel();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen, closePanel]);

  // One STABLE ref callback per body: a fresh closure on every render would
  // make React detach and re-attach every marker each time state changes.
  const markerRefCbs = useRef(
    new Map<string, (el: HTMLElement | null) => void>()
  );
  const setMarkerRef = useCallback((id: string) => {
    let cb = markerRefCbs.current.get(id);
    if (!cb) {
      cb = (el: HTMLElement | null) => {
        markerEls.current.set(id, el);
        sceneRef.current?.registerMarkerEl(id, el);
      };
      markerRefCbs.current.set(id, cb);
    }
    return cb;
  }, []);

  /* ---- derived --------------------------------------------------- */

  const focusBody = ASTRES_BODIES.find((b) => b.id === focus) ?? ASTRES_BODIES[0];
  const settledBody =
    ASTRES_BODIES.find((b) => b.id === settled) ?? ASTRES_BODIES[0];
  const settledProject = astresProjects.find((p) => p.slug === settled);
  const panelProject = astresProjects.find((p) => p.slug === panelSlug);
  const panelBody = ASTRES_BODIES.find((b) => b.id === panelSlug);

  const hudTarget = focusBody.isSun
    ? "◉ SUN"
    : `◉ ${focusBody.label.toUpperCase()} · ${focusBody.index} ${focusBody.title.toUpperCase()}`;

  /* ---------------------------------------------------------------- */

  return (
    <div
      className="astres-root fixed inset-0 overflow-hidden bg-black font-mono text-[11px]"
      style={{ color: "#666" }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* z-0 — the scene */}
      <div ref={mountRef} className="absolute inset-0 z-0" aria-hidden="true" />

      {/* z-10 — markers, projected onto the canvas every frame */}
      <div className="pointer-events-none fixed inset-0 z-10">
        {ASTRES_BODIES.filter((b) => b.id !== focus).map((b) => (
          <button
            key={b.id}
            ref={setMarkerRef(b.id)}
            type="button"
            onClick={() => travelTo(b.id)}
            className="astres-marker pointer-events-auto"
            data-offscreen="false"
            // parked off-screen until the scene's first frame projects it,
            // otherwise it flashes in the top-left corner
            style={{ transform: "translate(-9999px, -9999px)" }}
            aria-label={`Travel to ${b.label}`}
          >
            <span className="block leading-[1.35] tracking-[0.08em]">
              <span className="astres-arrow">▸</span>
              <span style={{ color: `rgb(${b.accent})` }}>
                {b.isSun ? "◉" : b.index}
              </span>{" "}
              <span style={{ color: "#ccc" }}>▸ {b.label.toUpperCase()}</span>
            </span>
            {!b.isSun && (
              <span
                className="astres-marker-title block leading-[1.35]"
                style={{ color: "#999" }}
              >
                {b.title}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* z-20 — HUD top-left */}
      <div
        className="pointer-events-none fixed z-20 leading-[1.7] tracking-[0.1em]"
        style={{
          color: "#6b6b6b",
          // safe areas: keep the HUD out of the notch on tall phones
          top: "calc(1.25rem + env(safe-area-inset-top))",
          left: "calc(1.25rem + env(safe-area-inset-left))",
        }}
      >
        <p>THÉO DAVID · SOLAR INDEX</p>
        <p style={{ color: "#999" }}>{hudTarget}</p>
        <p>TIME {timeScale}×</p>
      </div>

      {/* z-20 — time controls, bottom centre */}
      <div
        className="fixed left-1/2 z-20 flex -translate-x-1/2 gap-1.5"
        style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
      >
        {TIME_STEPS.map((step) => (
          <button
            key={step.value}
            type="button"
            className="astres-btn"
            data-active={timeScale === step.value}
            onClick={() => setTimeScale(step.value)}
            aria-label={`Time scale ${step.value}`}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* z-20 — bottom-left block: landing when parked on the sun,
          planet HUD when parked on a planet. Fades out during travel. */}
      <div
        className="pointer-events-none fixed z-20 max-w-[min(560px,calc(100vw-2.5rem))] transition-opacity duration-500"
        style={{
          opacity: traveling || panelOpen ? 0 : 1,
          bottom: "calc(4rem + env(safe-area-inset-bottom))",
          left: "calc(1.25rem + env(safe-area-inset-left))",
        }}
      >
        {settledBody.isSun ? (
          <div style={{ pointerEvents: traveling || panelOpen ? "none" : "auto" }}>
            <h1
              className="font-display font-semibold leading-[0.95] tracking-[-0.02em]"
              style={{ fontSize: "clamp(2.5rem, 7vw, 4rem)", color: "#ddd" }}
            >
              Théo David
            </h1>
            <p className="mt-4 tracking-[0.06em]" style={{ color: "#999" }}>
              Growth, Data &amp; Systems · the portfolio as a solar system
            </p>
            <p className="mt-2 tracking-[0.06em]" style={{ color: "#6f6f6f" }}>
              drag to orbit · scroll to zoom · click a marker to travel · click a
              planet to open
            </p>
            <p
              className="mt-4 tracking-[0.06em]"
              style={{ color: "var(--a-blue)" }}
            >
              click the sun · who I am
            </p>
          </div>
        ) : (
          <div style={{ pointerEvents: traveling || panelOpen ? "none" : "auto" }}>
            <p className="tracking-[0.14em]">
              <span style={{ color: `rgb(${settledBody.accent})` }}>
                {settledBody.index}
              </span>{" "}
              · {settledBody.label.toUpperCase()}
            </p>
            <h2
              className="mt-3 font-display font-semibold leading-[1.05] tracking-[-0.01em]"
              style={{ fontSize: "1.6rem", color: "#ddd" }}
            >
              {settledProject?.title}
            </h2>
            <p className="mt-2 tracking-[0.06em]" style={{ color: "#666" }}>
              {settledProject?.tags.join(" · ")}
            </p>
            <p
              className="mt-4 tracking-[0.06em]"
              style={{ color: "var(--a-blue)" }}
            >
              click the planet to open the case study
            </p>
            <button
              type="button"
              className="astres-btn mt-5"
              onClick={() => travelTo(SUN_ID)}
            >
              ← sun
            </button>
          </div>
        )}
      </div>

      {/* z-30 — the sun's panel: who I am. Same modal shell as the projects. */}
      {panelSlug === SUN_ID && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center p-4"
          onClick={closePanel}
          style={{
            background: "rgba(0,0,0,0.45)",
            opacity: panelOpen ? 1 : 0,
            transition: "opacity 250ms ease",
            pointerEvents: panelOpen ? "auto" : "none",
          }}
          aria-hidden={!panelOpen}
        >
          <aside
            className="astres-panel relative overflow-y-auto border p-6 outline-none md:p-10"
            role="dialog"
            aria-modal="true"
            aria-label="Who I am"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(720px, 92vw)",
              maxHeight: "84vh",
              background: "rgba(17,19,26,0.94)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderColor: "#2a2a2a",
              borderRadius: "2px",
              transform: panelOpen ? "none" : "translateY(14px) scale(0.985)",
              transition: "transform 250ms ease",
              overscrollBehavior: "contain",
            }}
          >
            <button
              type="button"
              onClick={closePanel}
              className="absolute right-5 top-5 text-lg leading-none transition-colors"
              style={{ color: "#999" }}
              aria-label="Close"
            >
              ×
            </button>

            <p className="tracking-[0.14em]">
              <span style={{ color: "rgb(255 178 61)" }}>◉</span> · SUN
            </p>

            <h2
              className="mt-6 font-display font-semibold leading-[1.05] tracking-[-0.01em]"
              style={{ fontSize: "2rem", color: "#ececec" }}
            >
              {sunProfile.title}
            </h2>
            <p className="mt-2 tracking-[0.08em]" style={{ color: "#b3b3b3" }}>
              {sunProfile.subtitle}
            </p>
            <p
              className="mt-4 tracking-[0.08em]"
              style={{ color: "rgb(255 178 61)" }}
            >
              {sunProfile.availability}
            </p>

            <Section label="Who I am">
              {sunProfile.bio.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 font-body text-[15px] leading-relaxed first:mt-0"
                  style={{ color: "#c6c6c6" }}
                >
                  {paragraph}
                </p>
              ))}
            </Section>

            <Section label="Now">
              <ul className="font-body text-[15px] leading-relaxed">
                {sunProfile.now.map((item, i) => (
                  <li
                    key={item}
                    className="border-t py-3 last:border-b"
                    style={{ borderColor: "#2e2e2e", color: "#c6c6c6" }}
                  >
                    <span className="mr-4" style={{ color: "#8f8f8f" }}>
                      0{i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section label="Spec sheet">
              {sunProfile.specs.map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-12 gap-3 border-t py-3 last:border-b"
                  style={{ borderColor: "#2e2e2e" }}
                >
                  <span
                    className="col-span-4 uppercase tracking-[0.1em] text-[10px] leading-relaxed"
                    style={{ color: "#9a9a9a" }}
                  >
                    {key}
                  </span>
                  <span
                    className="col-span-8 font-body text-[14px] leading-relaxed"
                    style={{ color: "#cfcfcf" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </Section>

            <Section label="Contact">
              <a
                href={`mailto:${sunProfile.email}`}
                className="font-display text-xl transition-colors"
                style={{ color: "#ececec" }}
              >
                {sunProfile.email}
              </a>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {sunProfile.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="astres-btn no-underline"
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </Section>

            <Section label="Credits">
              <p
                className="font-body text-[14px] leading-relaxed"
                style={{ color: "#9a9a9a" }}
              >
                This experience is a tribute to{" "}
                <a
                  href="https://trucs.ai/astres/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 transition-colors hover:text-[#ccc]"
                  style={{ color: "#c6c6c6" }}
                >
                  astres
                </a>{" "}
                by trucs.ai and its open-source{" "}
                <a
                  href="https://github.com/idle-intelligence/ridgeline"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 transition-colors hover:text-[#ccc]"
                  style={{ color: "#c6c6c6" }}
                >
                  ridgeline engine
                </a>
                , reimagined here in plain Three.js. This site&apos;s{" "}
                <a
                  href="https://github.com/theodvd/theodavid-fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 transition-colors hover:text-[#ccc]"
                  style={{ color: "#c6c6c6" }}
                >
                  source is public
                </a>{" "}
                too.
              </p>
            </Section>
          </aside>
        </div>
      )}

      {/* z-30 — project panel: a centred modal over the scene. Mounted for the
          whole open/close transition; the dimmed backdrop closes on click. */}
      {panelProject && panelBody && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center p-4"
          onClick={closePanel}
          style={{
            background: "rgba(0,0,0,0.45)",
            opacity: panelOpen ? 1 : 0,
            transition: "opacity 250ms ease",
            // still mounted during the fade-out — must not swallow clicks
            pointerEvents: panelOpen ? "auto" : "none",
          }}
          aria-hidden={!panelOpen}
        >
        <aside
          className="astres-panel relative overflow-y-auto border p-6 outline-none md:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={panelProject.title}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(720px, 92vw)",
            maxHeight: "84vh",
            background: "rgba(17,19,26,0.94)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderColor: "#2a2a2a",
            borderRadius: "2px",
            transform: panelOpen ? "none" : "translateY(14px) scale(0.985)",
            transition: "transform 250ms ease",
            overscrollBehavior: "contain",
          }}
        >
          <button
            type="button"
            onClick={closePanel}
            className="absolute right-5 top-5 text-lg leading-none transition-colors"
            style={{ color: "#999" }}
            aria-label="Close"
          >
            ×
          </button>

          <p className="tracking-[0.14em]">
            <span style={{ color: `rgb(${panelBody.accent})` }}>
              {panelProject.index}
            </span>{" "}
            · {panelBody.label.toUpperCase()}
          </p>
          <p className="mt-1.5 tracking-[0.08em]" style={{ color: "#8f8f8f" }}>
            {panelProject.context} · {panelProject.year} · {panelProject.role}
          </p>

          <h2
            className="mt-6 font-display font-semibold leading-[1.05] tracking-[-0.01em]"
            style={{ fontSize: "2rem", color: "#ececec" }}
          >
            {panelProject.title}
          </h2>

          <p className="mt-2 tracking-[0.08em]" style={{ color: "#9a9a9a" }}>
            {panelProject.tags.join(" · ")}
          </p>

          <p
            className="mt-5 font-body text-[15px] leading-relaxed"
            style={{ color: "#cfcfcf" }}
          >
            {panelProject.description}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {panelProject.stats.map(([value, label]) => (
              <div key={label}>
                <p
                  className="font-display text-lg leading-tight"
                  style={{ color: `rgb(${panelBody.accent})` }}
                >
                  {value}
                </p>
                <p
                  className="mt-1.5 text-[10px] uppercase leading-snug tracking-[0.1em]"
                  style={{ color: "#9a9a9a" }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          <Section label="The challenge">
            <p
              className="font-body text-[15px] leading-relaxed"
              style={{ color: "#c6c6c6" }}
            >
              {panelProject.challenge}
            </p>
          </Section>

          <Section label="What I built">
            <ul className="font-body text-[15px] leading-relaxed">
              {panelProject.built.map((item) => (
                <li
                  key={item}
                  className="border-t py-3 last:border-b"
                  style={{ borderColor: "#2e2e2e", color: "#c6c6c6" }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section label="Results">
            <ul className="font-body text-[15px] leading-relaxed">
              {panelProject.results.map((item) => (
                <li
                  key={item}
                  className="border-t py-3 last:border-b"
                  style={{ borderColor: "#2e2e2e", color: "#c6c6c6" }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section label="Stack">
            <div className="flex flex-wrap gap-2">
              {panelProject.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-[2px] border px-2.5 py-1 tracking-[0.06em]"
                  style={{ borderColor: "#3a3a3a", color: "#b3b3b3" }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </Section>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {panelProject.links?.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="astres-btn no-underline"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        </aside>
        </div>
      )}
    </div>
  );
}

/** Panel section: mono uppercase label, then whatever body content. */
function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10">
      <p className="uppercase tracking-[0.14em]" style={{ color: "#8f8f8f" }}>
        {label}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

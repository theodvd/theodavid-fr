"use client";

import { useEffect, useState, type ReactNode } from "react";
import AstresApp from "./AstresApp";

/**
 * Capability gate for the home page — flash-free.
 *
 * The server always renders the classic page (SEO for crawlers, fallback for
 * WebGL-less browsers). The inline parser-blocking script below runs BEFORE
 * the classic markup paints: if the browser can run the solar system it
 * stamps <html data-astres="1">, and the style rule hides the classic tree
 * from the very first paint — the visitor sees black, then the scene, never
 * the old site. After hydration the effect swaps in AstresApp; unmounting
 * the classic tree also tears down its WebGL hero cleanly.
 *
 * This is a capability check, not UA-version sniffing: the scene is plain
 * WebGL, so it covers modern Chrome / Safari / Firefox / Edge, mobile
 * included. Crawlers are deliberately kept on the classic page — it is the
 * indexable version of the same content.
 */
const GATE_SCRIPT = `try{if(!/bot|crawl|spider|lighthouse/i.test(navigator.userAgent)){var c=document.createElement("canvas");if(c.getContext("webgl2")||c.getContext("webgl"))document.documentElement.dataset.astres="1"}}catch(e){}`;

export default function HomeSwitch({ children }: { children: ReactNode }) {
  const [astres, setAstres] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.astres === "1") setAstres(true);
  }, []);

  if (astres) return <AstresApp />;

  return (
    <>
      {/* dangerouslySetInnerHTML on purpose: a text child gets quote-escaped
          differently on the server (&quot;) and the client, and that single
          mismatch makes React discard the whole server HTML — wiping the
          data-astres stamp with it. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `html[data-astres="1"] [data-classic-home]{display:none}`,
        }}
      />
      <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />
      <div data-classic-home>{children}</div>
    </>
  );
}

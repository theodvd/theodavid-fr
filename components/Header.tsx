"use client";

import { lenisRef } from "@/lib/lenis";

const LINKS = [
  { href: "#work", label: "WORK" },
  { href: "#about", label: "ABOUT" },
  { href: "#contact", label: "CONTACT" },
];

/**
 * Fixed minimal header: monogram left, three mono anchors right.
 * Anchors scroll through Lenis when active, native jump otherwise.
 */
export default function Header() {
  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (lenisRef.current) {
      lenisRef.current.scrollTo(href === "#top" ? 0 : href, { duration: 1.4 });
    } else {
      if (href === "#top") window.scrollTo(0, 0);
      else document.querySelector(href)?.scrollIntoView();
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 md:px-10 md:py-6">
      <a
        href="#top"
        onClick={(e) => go(e, "#top")}
        className="font-mono text-[11px] uppercase tracking-widest2 text-ink"
      >
        Théo David
      </a>
      <nav className="flex items-center gap-4 md:gap-8">
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={(e) => go(e, l.href)}
            className="draw-link font-mono text-[11px] uppercase tracking-widest2 text-muted transition-colors duration-300 hover:text-ink"
          >
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

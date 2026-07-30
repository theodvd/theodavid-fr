import type { Metadata } from "next";
import AstresApp from "@/components/astres/AstresApp";

/**
 * /astres — hidden experimental route.
 *
 * The whole portfolio rendered as one full-screen solar system of ridgeline
 * globes. No header, no footer, no scroll: the page IS the scene. Kept out of
 * the index because it is a signature piece, not a navigation entry point.
 */
export const metadata: Metadata = {
  title: "astres — Théo David",
  description:
    "An experimental index: the portfolio as a solar system of ridgeline globes.",
  robots: { index: false, follow: false },
};

export default function AstresPage() {
  return <AstresApp />;
}

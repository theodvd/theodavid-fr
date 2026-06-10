import type { Config } from "tailwindcss";

/**
 * Design tokens — "Solar" identity.
 * Warm space-black base, solar orange accent, ember hairlines.
 * `muted` is kept deliberately bright enough for body copy on #070403.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // named "night", NOT "base": a color called `base` collides with
        // Tailwind's `text-base` font-size utility and paints text black
        night: "#070403", // page background — warm space black
        surface: "#150D07", // elevated panels
        line: "#2E1E10", // 1px hairline borders, ember-tinted
        ink: "#F4EDE3", // primary text — warm white
        muted: "#B3A593", // secondary text — readable warm grey
        // accent & glow read CSS variables so each planet page can retint
        // the whole UI; defaults (solar orange) live in globals.css :root
        glow: "rgb(var(--c-glow) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-clash)", "sans-serif"],
        body: ["var(--font-satoshi)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      letterSpacing: {
        widest2: "0.18em",
      },
    },
  },
  plugins: [],
};

export default config;

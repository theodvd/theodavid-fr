/**
 * Each case study is a real Solar System planet: the 3D scene reproduces
 * its look (bands, rings, moons, axial tilt) and the page UI retints its
 * accent colors to match (via the --c-accent / --c-glow CSS variables).
 *
 * Assignments:
 *  - App Review Intelligence → Jupiter  (the data giant; Galilean moons)
 *  - Growfin Newsletter      → Saturn   (rings = orbiting feeds)
 *  - Solen                   → Venus    (the bright morning "star")
 *  - Tiro                    → Mars     (builder energy; Phobos & Deimos)
 *  - Multi-Agent Fact-Checker→ Neptune  (cold blue scrutiny; Triton)
 */
export type PlanetSpec = {
  name: string;
  colorA: string; // bright band (3D)
  colorB: string; // dark band (3D)
  ring: boolean;
  moons: number; // 0–2 rendered
  tilt: number; // radians, real axial tilts approximated
  bandFreq: number; // latitude band frequency
  accent: string; // page accent, "R G B"
  glow: string; // page glow, "R G B"
};

export const planets: Record<string, PlanetSpec> = {
  "app-review-intelligence": {
    name: "Jupiter",
    colorA: "#E8C9A0",
    colorB: "#9C5A2B",
    ring: false,
    moons: 2,
    tilt: 0.05,
    bandFreq: 16,
    accent: "224 163 107", // #E0A36B
    glow: "242 221 192", // #F2DDC0
  },
  "growfin-newsletter": {
    name: "Saturn",
    colorA: "#EAD6A6",
    colorB: "#A8763E",
    ring: true,
    moons: 1,
    tilt: 0.47,
    bandFreq: 12,
    accent: "217 179 106", // #D9B36A
    glow: "240 224 184", // #F0E0B8
  },
  solen: {
    name: "Venus",
    colorA: "#F6E9C8",
    colorB: "#C29A55",
    ring: false,
    moons: 0,
    tilt: 0.05,
    bandFreq: 4,
    accent: "230 197 112", // #E6C570
    glow: "248 238 205", // #F8EECD
  },
  tiro: {
    name: "Mars",
    colorA: "#E07B54",
    colorB: "#6E2614",
    ring: false,
    moons: 2,
    tilt: 0.44,
    bandFreq: 3,
    accent: "226 91 60", // #E25B3C
    glow: "242 180 156", // #F2B49C
  },
  "multi-agent-fact-checker": {
    name: "Neptune",
    colorA: "#7FA8E8",
    colorB: "#1E3A7A",
    ring: true,
    moons: 1,
    tilt: 0.49,
    bandFreq: 7,
    accent: "107 154 232", // #6B9AE8
    glow: "188 212 245", // #BCD4F5
  },
};

export const defaultPlanet: PlanetSpec = planets["app-review-intelligence"];

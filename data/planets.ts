/**
 * Each case study is a real Solar System planet: the 3D scene reproduces
 * its look (bands, rings, moons, axial tilt) and the page UI retints its
 * accent colors to match (via the --c-accent / --c-glow CSS variables).
 *
 * Colors are deliberately deep & saturated (not pale) so that, under the
 * scene's additive blending, each planet reads as a DISTINCT hue instead
 * of washing out to white/yellow: Jupiter=amber, Saturn=gold, Venus=peach,
 * Mars=red, Neptune=blue.
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
    colorA: "#F2A24E", // amber
    colorB: "#5E2A0C", // deep rust bands
    ring: false,
    moons: 2,
    tilt: 0.05,
    bandFreq: 16,
    accent: "236 150 66", // #EC9642
    glow: "247 198 132",
  },
  "growfin-newsletter": {
    name: "Saturn",
    colorA: "#EFC34E", // gold
    colorB: "#6E4C14",
    ring: true,
    moons: 1,
    tilt: 0.47,
    bandFreq: 12,
    accent: "230 190 76", // #E6BE4C
    glow: "247 226 150",
  },
  solen: {
    name: "Venus",
    colorA: "#F2A86C", // warm peach
    colorB: "#9C4E22",
    ring: false,
    moons: 0,
    tilt: 0.05,
    bandFreq: 4,
    accent: "240 158 100", // #F09E64
    glow: "249 208 174",
  },
  tiro: {
    name: "Mars",
    colorA: "#E25638", // red
    colorB: "#531405",
    ring: false,
    moons: 2,
    tilt: 0.44,
    bandFreq: 3,
    accent: "228 84 54", // #E45436
    glow: "243 158 128",
  },
  "multi-agent-fact-checker": {
    name: "Neptune",
    colorA: "#6F9FE8", // blue
    colorB: "#142C68",
    ring: true,
    moons: 1,
    tilt: 0.49,
    bandFreq: 7,
    accent: "111 159 232", // #6F9FE8
    glow: "184 208 247",
  },
};

export const defaultPlanet: PlanetSpec = planets["app-review-intelligence"];

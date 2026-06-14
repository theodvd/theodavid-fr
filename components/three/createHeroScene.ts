import * as THREE from "three";
import gsap from "gsap";

/**
 * Persistent scene — "Ignition".
 *
 * A particle star system in four layers, all drawn in ONE draw call
 * (a single Points geometry, layer selected per-particle via aType):
 *   0 — star surface : particles on a noisy sphere with differential
 *       rotation (equator spins faster than the poles, like a real sun)
 *   1 — corona       : breathing halo, alpha decaying with distance
 *   2 — orbital belt : a tilted ring of debris on Kepler-ish orbits
 *   3 — starfield    : faint twinkling background stars, very far away
 *
 * Narrative on load: the chaotic dust cloud (the part Théo liked) collapses
 *  under gravity into the star, then a short FLARE pulse marks ignition.
 *
 * The canvas is fixed behind the whole page. The star group sits at
 * x=+2.3 so the hero headline (bottom-left) never overlaps it; page scroll
 * drives a camera journey that keeps the star AWAY from text columns and
 * dims it hard while Work/About pass, returning full-strength for the
 * Contact wide "sunrise" shot.
 */

const VERTEX = /* glsl */ `
  attribute float aType;
  attribute float aSeed;
  attribute float aDist;
  attribute vec3 aDir;
  attribute vec3 aChaos;

  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uDim;
  uniform float uFlare;

  varying float vAlpha;
  varying float vHeat;

  void main() {
    vec3 formed;
    float alpha = 1.0;
    float heat = 0.5;
    float size = 1.0;

    if (aType < 0.5) {
      // ---- star surface ----
      vec3 dir = normalize(aDir);
      float rotSpeed = 0.14 * (1.0 - 0.5 * abs(dir.y)); // differential spin
      float a = uTime * rotSpeed + aSeed * 6.2831;
      float ca = cos(a), sa = sin(a);
      vec3 d = vec3(dir.x * ca + dir.z * sa, dir.y, -dir.x * sa + dir.z * ca);
      // granulation: layered sines stand in for surface convection
      float n = sin(d.x * 8.0 + uTime * 0.6)
              * sin(d.y * 9.0 - uTime * 0.4)
              * sin(d.z * 7.5 + uTime * 0.5);
      float r = 1.55 * (1.0 + 0.07 * n + 0.015 * sin(uTime * 2.0 + aSeed * 20.0));
      formed = d * r;
      heat = 0.55 + 0.45 * n;
      alpha = 0.95;
      size = 1.0;
    } else if (aType < 1.5) {
      // ---- corona ----
      vec3 dir = normalize(aDir);
      float a = uTime * 0.04 + aSeed * 6.2831;
      float ca = cos(a), sa = sin(a);
      vec3 d = vec3(dir.x * ca + dir.z * sa, dir.y, -dir.x * sa + dir.z * ca);
      float breathe = 1.0 + 0.09 * sin(uTime * 0.7 + aSeed * 6.2831);
      formed = d * 1.55 * mix(1.05, 2.9, aDist) * breathe;
      heat = 0.85 - aDist * 0.6;
      float fall = 1.0 - aDist;
      alpha = fall * fall * 0.5 * (0.7 + 0.3 * sin(uTime * 1.3 + aSeed * 12.0));
      size = 0.8;
    } else if (aType < 2.5) {
      // ---- orbital belt (tilted ring, inner orbits faster) ----
      float orbitR = aDir.x;
      float phase = aDir.z + uTime * (0.5 / sqrt(orbitR));
      vec3 ring = vec3(cos(phase) * orbitR, aDir.y, sin(phase) * orbitR);
      float tilt = 0.45;
      float ct = cos(tilt), st = sin(tilt);
      formed = vec3(ring.x, ring.y * ct - ring.z * st, ring.y * st + ring.z * ct);
      heat = 0.3;
      alpha = 0.55;
      size = 0.55;
    } else {
      // ---- background starfield ----
      formed = normalize(aDir) * (18.0 + aDist * 14.0);
      heat = 0.2;
      alpha = 0.35 + 0.45 * sin(uTime * (0.4 + aSeed) + aSeed * 40.0);
      size = 0.6;
    }

    // gravity collapse: chaos dust -> formed system (staggered sweep).
    // Background stars are exempt (chaos == formed for them).
    vec3 chaos = aChaos + 0.22 * vec3(
      sin(uTime * 0.32 + aSeed * 9.0),
      cos(uTime * 0.27 + aSeed * 5.0),
      sin(uTime * 0.23 + aSeed * 7.0)
    );
    float p = clamp(uProgress * 1.7 - aSeed * 0.7, 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);
    vec3 pos = aType > 2.5 ? formed : mix(chaos, formed, p);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // chaos dust is uniformly faint; formed layers use their own alpha
    vAlpha = mix(0.5, alpha, aType > 2.5 ? 1.0 : p) * uDim;
    vHeat = heat + uFlare * 0.6;

    float flareBoost = 1.0 + uFlare * 0.6;
    gl_PointSize = uSize * size * (0.5 + 0.9 * aSeed) * flareBoost * (6.0 / -mv.z);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorHot;
  uniform vec3 uColorMid;
  uniform vec3 uColorDeep;
  uniform float uFlare;

  varying float vAlpha;
  varying float vHeat;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float disc = 1.0 - smoothstep(0.1, 0.5, d);
    float strength = pow(disc, 2.2);
    float h = clamp(vHeat, 0.0, 1.0);
    // ember -> orange -> near-white heat ramp
    vec3 col = mix(uColorDeep, uColorMid, h);
    col = mix(col, uColorHot, h * h);
    col *= 0.7 + h * 0.55 + uFlare * 0.7;
    gl_FragColor = vec4(col, strength * vAlpha);
  }
`;

/* Star group sits at x=+2.3; both paths are framed around it so the sun
   stays clear of text columns at every stop of the journey. */
const STAR_POS = new THREE.Vector3(2.3, 0.4, 0);
const CAM_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0.1, 7.2), // hero: sun right, headline bottom-left
  new THREE.Vector3(-1.6, 0.7, 8.6), // work: sun pushed far upper-right
  new THREE.Vector3(5.6, 0.9, 7.2), // about: sun drifts left of center
  new THREE.Vector3(2.3, 0.1, 5.6), // contact: centered sunrise
]);
const LOOK_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(2.0, 0.4, 0),
  new THREE.Vector3(4.6, 2.3, -1.2), // work: sun pushed to the corner
  new THREE.Vector3(0.9, 0.3, 0),
  new THREE.Vector3(2.3, 0.5, 0),
]);

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

export type HeroScene = { destroy: () => void };

export function createHeroScene(
  container: HTMLElement,
  reducedMotion: boolean
): HeroScene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null; // WebGL unavailable -> the CSS fallback gradient stays
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.copy(CAM_PATH.getPoint(0));

  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;";
  container.appendChild(renderer.domElement);

  // layer budgets — fewer particles on small screens
  const isMobile = window.innerWidth < 768;
  // desktop count kept moderate so the dense centre doesn't over-accumulate
  // into white under additive blending (mobile look is already validated)
  const N_STAR = isMobile ? 5500 : 9000;
  const N_CORONA = isMobile ? 2200 : 6000;
  const N_BELT = isMobile ? 1800 : 5000;
  const N_BG = isMobile ? 800 : 1600;
  const COUNT = N_STAR + N_CORONA + N_BELT + N_BG;

  const aType = new Float32Array(COUNT);
  const aSeed = new Float32Array(COUNT);
  const aDist = new Float32Array(COUNT);
  const aDir = new Float32Array(COUNT * 3);
  const aChaos = new Float32Array(COUNT * 3);

  const randDir = () => {
    // uniform direction on the unit sphere
    const u = Math.random() * 2 - 1;
    const phi = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    return [s * Math.cos(phi), s * Math.sin(phi), u];
  };

  for (let i = 0; i < COUNT; i++) {
    let type: number;
    if (i < N_STAR) type = 0;
    else if (i < N_STAR + N_CORONA) type = 1;
    else if (i < N_STAR + N_CORONA + N_BELT) type = 2;
    else type = 3;

    aType[i] = type;
    aSeed[i] = Math.random();

    if (type === 2) {
      // belt: aDir packs (orbit radius, vertical jitter, phase)
      aDir[i * 3] = 2.4 + Math.pow(Math.random(), 1.4) * 1.7;
      aDir[i * 3 + 1] = (Math.random() - 0.5) * 0.22;
      aDir[i * 3 + 2] = Math.random() * Math.PI * 2;
      aDist[i] = 0;
    } else {
      const [x, y, z] = randDir();
      aDir[i * 3] = x;
      aDir[i * 3 + 1] = y;
      aDir[i * 3 + 2] = z;
      // corona: bias toward the star; bg: spread in depth
      aDist[i] = type === 1 ? Math.pow(Math.random(), 2.2) : Math.random();
    }

    // collapse origin: a wide dust cloud around the star
    aChaos[i * 3] = (Math.random() - 0.5) * 17;
    aChaos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    aChaos[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  const geometry = new THREE.BufferGeometry();
  // Points needs a `position` attribute; real positions come from the shader
  geometry.setAttribute("position", new THREE.BufferAttribute(aChaos, 3));
  geometry.setAttribute("aChaos", new THREE.BufferAttribute(aChaos, 3));
  geometry.setAttribute("aDir", new THREE.BufferAttribute(aDir, 3));
  geometry.setAttribute("aType", new THREE.BufferAttribute(aType, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
  geometry.setAttribute("aDist", new THREE.BufferAttribute(aDist, 1));

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: reducedMotion ? 1 : 0 },
    uSize: { value: isMobile ? 26 : 31 },
    uDim: { value: 1 },
    uFlare: { value: 0 },
    // hot = warm amber (low blue) so the dense centre accumulates to
    // orange-gold under additive blending instead of washing out white
    uColorHot: { value: new THREE.Color("#FFB23D") },
    uColorMid: { value: new THREE.Color("#FF8A2A") },
    uColorDeep: { value: new THREE.Color("#A8330A") },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.position.copy(STAR_POS);
  if (isMobile) {
    // portrait viewports have a narrow horizontal FOV: the sun would sit
    // behind the headline. Lift it into the top half and shrink it a bit —
    // the name lives bottom-left, so the lower half stays clear.
    points.position.y += 1.0;
    points.scale.setScalar(0.78);
  }
  scene.add(points);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (reducedMotion) renderer.render(scene, camera);
  };
  resize();
  window.addEventListener("resize", resize);

  if (reducedMotion) {
    // single static frame of the formed star — no animation loop at all
    uniforms.uTime.value = 12;
    camera.lookAt(LOOK_PATH.getPoint(0));
    renderer.render(scene, camera);
    return {
      destroy() {
        window.removeEventListener("resize", resize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
  }

  // gravity collapse, then the ignition flare
  gsap
    .timeline()
    .to(uniforms.uProgress, {
      value: 1,
      duration: 3.0,
      delay: 0.5,
      ease: "power2.inOut",
    })
    .to(uniforms.uFlare, { value: 1, duration: 0.35, ease: "power4.in" }, "-=0.5")
    .to(uniforms.uFlare, { value: 0, duration: 1.4, ease: "power2.out" });

  // pointer parallax, eased toward the cursor each frame
  const pointer = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointer);

  const clock = new THREE.Clock();
  const camPos = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  let pSmooth = 0; // slow ease — cinematic camera path
  let pFast = 0; // fast ease — dim & off-screen shift must not lag the scroll

  renderer.setAnimationLoop(() => {
    uniforms.uTime.value = clock.getElapsedTime();

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    pSmooth += (p - pSmooth) * 0.05;
    pFast += (p - pFast) * 0.18;

    CAM_PATH.getPoint(pSmooth, camPos);
    LOOK_PATH.getPoint(pSmooth, lookAt);
    // strong pointer parallax (igloo-style: the scene answers the mouse)
    camera.position.set(
      camPos.x + pointer.x * 0.8,
      camPos.y - pointer.y * 0.5,
      camPos.z
    );
    camera.lookAt(lookAt);

    // the sun physically leaves the text columns once Work starts and
    // stays in the right margin for the rest of the page
    const aside = smooth(0.05, 0.2, pFast);
    // nudge a touch left on mobile so the leading particles aren't clipped
    points.position.x = (isMobile ? 1.9 : STAR_POS.x) + aside * 3.8;

    // the whole system leans toward the cursor
    points.rotation.y += (pointer.x * 0.22 - points.rotation.y) * 0.05;
    points.rotation.x += (-pointer.y * 0.12 - points.rotation.x) * 0.05;

    // recede hard once the reading sections start — no sunrise return:
    // the contact email must stay readable
    uniforms.uDim.value = 1 - 0.85 * smooth(0.04, 0.18, pFast);

    renderer.render(scene, camera);
  });

  return {
    destroy() {
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

import * as THREE from "three";
import gsap from "gsap";

/**
 * Per-project planet — each case-study page gets its own particle planet,
 * parameterized by preset (band colors, ring, moons, tilt) so every page
 * feels distinct while staying in the solar family.
 *
 * Same construction as the home sun: one Points geometry, one draw call,
 * layers selected per-particle via aType:
 *   0 — banded planet surface   1 — ring   2 — moons   3 — starfield
 *
 * Interaction model (igloo-style):
 *  - the planet leans strongly toward the cursor (group rotation, eased)
 *  - it fades out as you scroll into the text so it never fights the copy
 *  - chaos-collapse formation on load, same narrative as the home page
 */

export type PlanetPreset = {
  colorA: string; // bright band
  colorB: string; // dark band
  ring: boolean;
  moons: number; // 0–2
  tilt: number; // radians
  bandFreq: number; // latitude band frequency
};

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
  uniform float uBandFreq;
  uniform float uMoons;

  varying float vAlpha;
  varying float vHeat;

  void main() {
    vec3 formed;
    float alpha = 1.0;
    float heat = 0.5;
    float size = 1.0;

    if (aType < 0.5) {
      // ---- banded planet surface ----
      vec3 dir = normalize(aDir);
      float a = uTime * 0.06 + aSeed * 0.0; // slow uniform spin
      float ca = cos(a), sa = sin(a);
      vec3 d = vec3(dir.x * ca + dir.z * sa, dir.y, -dir.x * sa + dir.z * ca);
      // latitude bands with a drifting wobble — gas-giant feel
      float band = sin(d.y * uBandFreq + 0.6 * sin(d.x * 3.0 + uTime * 0.25));
      float r = 1.25 * (1.0 + 0.02 * band);
      formed = d * r;
      heat = 0.5 + 0.5 * band;
      alpha = 0.95;
    } else if (aType < 1.5) {
      // ---- ring (flat annulus, slow orbit) ----
      float orbitR = aDir.x;
      float phase = aDir.z + uTime * (0.25 / sqrt(orbitR));
      formed = vec3(cos(phase) * orbitR, aDir.y, sin(phase) * orbitR);
      heat = 0.55;
      alpha = 0.5;
      size = 0.5;
    } else if (aType < 2.5) {
      // ---- moons: small particle clumps on inclined orbits ----
      float idx = aDist; // 0 or 1
      float speed = 0.32 - idx * 0.1;
      float a = uTime * speed + idx * 2.7;
      float orbitR = 2.3 + idx * 0.8;
      vec3 center = vec3(cos(a) * orbitR, sin(a * 1.3) * 0.3, sin(a) * orbitR);
      formed = center + aDir * 0.16; // aDir = local offset inside the moon
      heat = 0.85;
      alpha = step(idx, uMoons - 0.5) * 0.9; // hide unused moons
      size = 0.8;
    } else {
      // ---- background starfield ----
      formed = normalize(aDir) * (16.0 + aDist * 12.0);
      heat = 0.2;
      alpha = 0.3 + 0.4 * sin(uTime * (0.4 + aSeed) + aSeed * 40.0);
      size = 0.55;
    }

    // chaos collapse on load (background stars exempt)
    vec3 chaos = aChaos + 0.2 * vec3(
      sin(uTime * 0.3 + aSeed * 9.0),
      cos(uTime * 0.26 + aSeed * 5.0),
      sin(uTime * 0.22 + aSeed * 7.0)
    );
    float p = clamp(uProgress * 1.7 - aSeed * 0.7, 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);
    vec3 pos = aType > 2.5 ? formed : mix(chaos, formed, p);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    vAlpha = mix(0.45, alpha, aType > 2.5 ? 1.0 : p) * uDim;
    vHeat = heat;
    gl_PointSize = uSize * size * (0.5 + 0.9 * aSeed) * (5.0 / -mv.z);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying float vAlpha;
  varying float vHeat;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float disc = 1.0 - smoothstep(0.1, 0.5, d);
    float strength = pow(disc, 2.2);
    float h = clamp(vHeat, 0.0, 1.0);
    vec3 col = mix(uColorB, uColorA, h) * (0.7 + h * 0.7);
    gl_FragColor = vec4(col, strength * vAlpha);
  }
`;

export type PlanetScene = { destroy: () => void };

export function createPlanetScene(
  container: HTMLElement,
  preset: PlanetPreset,
  reducedMotion: boolean
): PlanetScene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 0, 6.8);

  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;";
  container.appendChild(renderer.domElement);

  const isMobile = window.innerWidth < 768;
  const N_PLANET = isMobile ? 4000 : 9000;
  const N_RING = preset.ring ? (isMobile ? 1200 : 3200) : 0;
  const N_MOON = preset.moons > 0 ? (isMobile ? 500 : 1200) : 0;
  const N_BG = isMobile ? 600 : 1200;
  const COUNT = N_PLANET + N_RING + N_MOON + N_BG;

  const aType = new Float32Array(COUNT);
  const aSeed = new Float32Array(COUNT);
  const aDist = new Float32Array(COUNT);
  const aDir = new Float32Array(COUNT * 3);
  const aChaos = new Float32Array(COUNT * 3);

  const randDir = () => {
    const u = Math.random() * 2 - 1;
    const phi = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    return [s * Math.cos(phi), s * Math.sin(phi), u];
  };

  for (let i = 0; i < COUNT; i++) {
    let type: number;
    if (i < N_PLANET) type = 0;
    else if (i < N_PLANET + N_RING) type = 1;
    else if (i < N_PLANET + N_RING + N_MOON) type = 2;
    else type = 3;

    aType[i] = type;
    aSeed[i] = Math.random();

    if (type === 1) {
      // ring: aDir packs (radius, vertical jitter, phase)
      aDir[i * 3] = 1.7 + Math.pow(Math.random(), 1.6) * 0.9;
      aDir[i * 3 + 1] = (Math.random() - 0.5) * 0.06;
      aDir[i * 3 + 2] = Math.random() * Math.PI * 2;
      aDist[i] = 0;
    } else if (type === 2) {
      // moons: aDir = local offset in the clump, aDist = moon index
      const [x, y, z] = randDir();
      const r = Math.cbrt(Math.random());
      aDir[i * 3] = x * r;
      aDir[i * 3 + 1] = y * r;
      aDir[i * 3 + 2] = z * r;
      aDist[i] = Math.min(Math.floor(Math.random() * preset.moons), 1);
    } else {
      const [x, y, z] = randDir();
      aDir[i * 3] = x;
      aDir[i * 3 + 1] = y;
      aDir[i * 3 + 2] = z;
      aDist[i] = Math.random();
    }

    aChaos[i * 3] = (Math.random() - 0.5) * 14;
    aChaos[i * 3 + 1] = (Math.random() - 0.5) * 9;
    aChaos[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(aChaos, 3));
  geometry.setAttribute("aChaos", new THREE.BufferAttribute(aChaos, 3));
  geometry.setAttribute("aDir", new THREE.BufferAttribute(aDir, 3));
  geometry.setAttribute("aType", new THREE.BufferAttribute(aType, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
  geometry.setAttribute("aDist", new THREE.BufferAttribute(aDist, 1));

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: reducedMotion ? 1 : 0 },
    uSize: { value: isMobile ? 22 : 30 },
    uDim: { value: 0.6 },
    uBandFreq: { value: preset.bandFreq },
    uMoons: { value: preset.moons },
    uColorA: { value: new THREE.Color(preset.colorA) },
    uColorB: { value: new THREE.Color(preset.colorB) },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const group = new THREE.Group();
  const points = new THREE.Points(geometry, material);
  points.rotation.z = preset.tilt;
  group.add(points);
  // upper-right on desktop, higher and more central on mobile
  group.position.set(isMobile ? 0.7 : 2.5, isMobile ? 1.8 : 1.1, 0);
  scene.add(group);

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
    uniforms.uTime.value = 10;
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

  gsap.to(uniforms.uProgress, {
    value: 1,
    duration: 2.2,
    delay: 0.3,
    ease: "power2.inOut",
  });

  const pointer = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointer);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    uniforms.uTime.value = clock.getElapsedTime();

    // the planet leans hard toward the cursor — the igloo "it sees you" feel
    group.rotation.y += (pointer.x * 0.55 - group.rotation.y) * 0.06;
    group.rotation.x += (-pointer.y * 0.3 - group.rotation.x) * 0.06;
    camera.position.x = pointer.x * 0.3;
    camera.position.y = -pointer.y * 0.2;
    camera.lookAt(group.position);

    // fade out while reading: fully present at the top, gone by one viewport
    const fade = Math.min(window.scrollY / (window.innerHeight * 0.9), 1);
    uniforms.uDim.value = 0.6 * (1 - fade * 0.92);

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

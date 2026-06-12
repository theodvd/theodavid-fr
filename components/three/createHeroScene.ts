import * as THREE from "three";
import gsap from "gsap";

/**
 * Hero scene — "The Sun, opened".
 *
 * igloo.inc-style centerpiece: a dense, SOLID-looking particle sun
 * (normal blending — matte dust, never blown-out white) sitting center
 * stage. Move the cursor onto it and the surface parts: shell particles
 * within the aperture peel outward like petals, revealing a hot, additive
 * glowing core. Leave, and it seals itself back slowly.
 *
 * Two draw calls:
 *  - SHELL: ~26k particles on a noisy sphere, differential rotation,
 *    yellow-orange limb-shaded ramp, NormalBlending => solid planet look.
 *  - INNER (additive): core (revealed on opening) + faint corona +
 *    background starfield, layer chosen per-particle via aType.
 *
 * Interaction: the pointer ray is intersected with the sun sphere in JS;
 * uHit (unit direction of the hit) and uReveal (0..1 strength) feed the
 * shell shader. Opening eases in fast, closes slowly. Touch devices get
 * an autonomous "breathing" reveal whose hit point drifts on the surface.
 *
 * On load the whole system still collapses from chaotic dust (uProgress),
 * ending on a brief core flare. Scroll dims everything under the page
 * scrim — the sun is the hero's piece, not the page's enemy.
 */

const R = 2.1; // shell radius (local units)

const SHELL_VERTEX = /* glsl */ `
  attribute vec3 aDir;
  attribute float aSeed;
  attribute vec3 aChaos;

  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uDim;
  uniform vec3 uHit;
  uniform float uReveal;

  varying float vHeat;
  varying float vLimb;
  varying float vInfl;
  varying float vAlpha;

  void main() {
    vec3 dir = normalize(aDir);

    // differential rotation: equator faster than poles
    float rotSpeed = 0.1 * (1.0 - 0.45 * abs(dir.y));
    float a = uTime * rotSpeed + aSeed * 0.0;
    float ca = cos(a), sa = sin(a);
    vec3 d = vec3(dir.x * ca + dir.z * sa, dir.y, -dir.x * sa + dir.z * ca);

    // convection granulation
    float n = sin(d.x * 9.0 + uTime * 0.5)
            * sin(d.y * 11.0 - uTime * 0.35)
            * sin(d.z * 8.0 + uTime * 0.45);
    float r = ${R.toFixed(2)} * (1.0 + 0.035 * n);

    // ---- the opening ----
    // angular distance to the (world-space) hit point on the sphere
    float ang = acos(clamp(dot(d, uHit), -1.0, 1.0));
    float infl = (1.0 - smoothstep(0.0, 0.95, ang)) * uReveal;
    float infl2 = infl * infl;
    // petals: radially outward, slightly toward the viewer's hit axis,
    // with an organic tangential swirl
    vec3 tang = normalize(cross(d, vec3(0.0, 1.0, 0.0)) + 0.001);
    vec3 disp = d * infl2 * 1.7
              + uHit * infl * 0.35
              + tang * infl2 * 0.45 * sin(uTime * 0.9 + aSeed * 6.2831);

    vec3 formed = d * r + disp;

    // chaos collapse on load
    vec3 chaos = aChaos + 0.2 * vec3(
      sin(uTime * 0.3 + aSeed * 9.0),
      cos(uTime * 0.26 + aSeed * 5.0),
      sin(uTime * 0.22 + aSeed * 7.0)
    );
    float p = clamp(uProgress * 1.7 - aSeed * 0.7, 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);
    vec3 pos = mix(chaos, formed, p);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    vHeat = 0.5 + 0.5 * n;
    // camera sits on +z: center of the disc bright, limb darker
    vLimb = clamp(d.z * 0.5 + 0.5, 0.0, 1.0);
    vInfl = infl;
    vAlpha = (0.92 - infl * 0.45) * mix(0.5, 1.0, p) * uDim;

    gl_PointSize = uSize * (0.55 + 0.8 * aSeed) * (1.0 + infl * 0.6) * (6.0 / -mv.z);
  }
`;

const SHELL_FRAGMENT = /* glsl */ `
  uniform vec3 uColorHot;
  uniform vec3 uColorMid;
  uniform vec3 uColorDeep;

  varying float vHeat;
  varying float vLimb;
  varying float vInfl;
  varying float vAlpha;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    // hard-ish sprite edge -> dense matte dust, not glow
    float disc = 1.0 - smoothstep(0.3, 0.5, d);
    vec3 col = mix(uColorDeep, uColorMid, vLimb);
    col = mix(col, uColorHot, vHeat * 0.35 + vInfl * 0.65);
    gl_FragColor = vec4(col, disc * vAlpha);
  }
`;

const INNER_VERTEX = /* glsl */ `
  attribute float aType;   // 0 core, 1 corona, 2 starfield
  attribute float aSeed;
  attribute float aDist;
  attribute vec3 aDir;
  attribute vec3 aChaos;

  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uDim;
  uniform float uReveal;
  uniform float uFlare;

  varying float vAlpha;
  varying float vHeat;

  void main() {
    vec3 formed;
    float alpha = 1.0;
    float heat = 0.5;
    float size = 1.0;

    if (aType < 0.5) {
      // ---- core: hot, pulsing, shines when the shell opens ----
      vec3 dir = normalize(aDir);
      float pulse = 1.0 + 0.04 * sin(uTime * 1.8 + aSeed * 6.2831);
      float n = sin(dir.x * 7.0 + uTime * 0.8) * sin(dir.y * 6.0 - uTime * 0.6);
      formed = dir * (0.55 + 0.5 * aDist) * pulse * (1.0 + 0.05 * n);
      heat = 1.0;
      alpha = (0.1 + uReveal * 0.85 + uFlare * 0.8) * (0.6 + 0.4 * aDist);
      size = 0.9;
    } else if (aType < 1.5) {
      // ---- faint corona ----
      vec3 dir = normalize(aDir);
      float a = uTime * 0.04 + aSeed * 6.2831;
      float ca = cos(a), sa = sin(a);
      vec3 dd = vec3(dir.x * ca + dir.z * sa, dir.y, -dir.x * sa + dir.z * ca);
      float breathe = 1.0 + 0.08 * sin(uTime * 0.6 + aSeed * 6.2831);
      formed = dd * ${R.toFixed(2)} * mix(1.05, 1.9, aDist) * breathe;
      heat = 0.8 - aDist * 0.5;
      float fall = 1.0 - aDist;
      alpha = fall * fall * 0.22;
      size = 0.7;
    } else {
      // ---- background starfield ----
      formed = normalize(aDir) * (17.0 + aDist * 13.0);
      heat = 0.2;
      alpha = 0.3 + 0.4 * sin(uTime * (0.4 + aSeed) + aSeed * 40.0);
      size = 0.55;
    }

    vec3 chaos = aChaos + 0.2 * vec3(
      sin(uTime * 0.3 + aSeed * 9.0),
      cos(uTime * 0.26 + aSeed * 5.0),
      sin(uTime * 0.22 + aSeed * 7.0)
    );
    float p = clamp(uProgress * 1.7 - aSeed * 0.7, 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);
    vec3 pos = aType > 1.5 ? formed : mix(chaos, formed, p);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    vAlpha = mix(0.4, alpha, aType > 1.5 ? 1.0 : p) * uDim;
    vHeat = heat + uFlare * 0.5;
    gl_PointSize = uSize * size * (0.5 + 0.9 * aSeed) * (6.0 / -mv.z);
  }
`;

const INNER_FRAGMENT = /* glsl */ `
  uniform vec3 uColorHot;
  uniform vec3 uColorMid;
  uniform vec3 uColorDeep;

  varying float vAlpha;
  varying float vHeat;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float disc = 1.0 - smoothstep(0.1, 0.5, d);
    float strength = pow(disc, 2.0);
    float h = clamp(vHeat, 0.0, 1.0);
    vec3 col = mix(uColorDeep, uColorMid, h);
    col = mix(col, uColorHot, h * h);
    gl_FragColor = vec4(col * (0.8 + h * 0.6), strength * vAlpha);
  }
`;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

const randDir = (): [number, number, number] => {
  const u = Math.random() * 2 - 1;
  const phi = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return [s * Math.cos(phi), s * Math.sin(phi), u];
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
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.set(0, 0.15, 7.0);
  camera.lookAt(0, 0.15, 0);

  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;";
  container.appendChild(renderer.domElement);

  const isMobile = window.innerWidth < 768;
  const N_SHELL = isMobile ? 11000 : 26000;
  const N_CORE = isMobile ? 2800 : 7000;
  const N_CORONA = isMobile ? 1500 : 4000;
  const N_BG = isMobile ? 700 : 1500;

  const colors = {
    uColorHot: { value: new THREE.Color("#FFD86B") },
    uColorMid: { value: new THREE.Color("#FF9E3D") },
    uColorDeep: { value: new THREE.Color("#B23A0A") },
  };

  const shared = {
    uTime: { value: 0 },
    uProgress: { value: reducedMotion ? 1 : 0 },
    uDim: { value: 1 },
    uReveal: { value: 0 },
  };

  // ---------- shell geometry ----------
  const sDir = new Float32Array(N_SHELL * 3);
  const sSeed = new Float32Array(N_SHELL);
  const sChaos = new Float32Array(N_SHELL * 3);
  for (let i = 0; i < N_SHELL; i++) {
    const [x, y, z] = randDir();
    sDir[i * 3] = x;
    sDir[i * 3 + 1] = y;
    sDir[i * 3 + 2] = z;
    sSeed[i] = Math.random();
    sChaos[i * 3] = (Math.random() - 0.5) * 16;
    sChaos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    sChaos[i * 3 + 2] = (Math.random() - 0.5) * 9;
  }
  const shellGeo = new THREE.BufferGeometry();
  shellGeo.setAttribute("position", new THREE.BufferAttribute(sChaos, 3));
  shellGeo.setAttribute("aChaos", new THREE.BufferAttribute(sChaos, 3));
  shellGeo.setAttribute("aDir", new THREE.BufferAttribute(sDir, 3));
  shellGeo.setAttribute("aSeed", new THREE.BufferAttribute(sSeed, 1));

  const shellUniforms = {
    ...shared,
    uSize: { value: isMobile ? 26 : 32 },
    uHit: { value: new THREE.Vector3(0, 0, 1) },
    ...colors,
  };
  const shellMat = new THREE.ShaderMaterial({
    vertexShader: SHELL_VERTEX,
    fragmentShader: SHELL_FRAGMENT,
    uniforms: shellUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending, // solid matte dust — never blown out
  });
  const shell = new THREE.Points(shellGeo, shellMat);
  shell.renderOrder = 2;

  // ---------- inner geometry (core + corona + stars) ----------
  const N_INNER = N_CORE + N_CORONA + N_BG;
  const iDir = new Float32Array(N_INNER * 3);
  const iSeed = new Float32Array(N_INNER);
  const iDist = new Float32Array(N_INNER);
  const iType = new Float32Array(N_INNER);
  const iChaos = new Float32Array(N_INNER * 3);
  for (let i = 0; i < N_INNER; i++) {
    const type = i < N_CORE ? 0 : i < N_CORE + N_CORONA ? 1 : 2;
    iType[i] = type;
    iSeed[i] = Math.random();
    iDist[i] =
      type === 0 ? Math.cbrt(Math.random()) : type === 1 ? Math.pow(Math.random(), 2) : Math.random();
    const [x, y, z] = randDir();
    iDir[i * 3] = x;
    iDir[i * 3 + 1] = y;
    iDir[i * 3 + 2] = z;
    iChaos[i * 3] = (Math.random() - 0.5) * 16;
    iChaos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    iChaos[i * 3 + 2] = (Math.random() - 0.5) * 9;
  }
  const innerGeo = new THREE.BufferGeometry();
  innerGeo.setAttribute("position", new THREE.BufferAttribute(iChaos, 3));
  innerGeo.setAttribute("aChaos", new THREE.BufferAttribute(iChaos, 3));
  innerGeo.setAttribute("aDir", new THREE.BufferAttribute(iDir, 3));
  innerGeo.setAttribute("aSeed", new THREE.BufferAttribute(iSeed, 1));
  innerGeo.setAttribute("aDist", new THREE.BufferAttribute(iDist, 1));
  innerGeo.setAttribute("aType", new THREE.BufferAttribute(iType, 1));

  const innerUniforms = {
    ...shared,
    uSize: { value: isMobile ? 24 : 30 },
    uFlare: { value: 0 },
    ...colors,
  };
  const innerMat = new THREE.ShaderMaterial({
    vertexShader: INNER_VERTEX,
    fragmentShader: INNER_FRAGMENT,
    uniforms: innerUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const inner = new THREE.Points(innerGeo, innerMat);
  inner.renderOrder = 1;

  // ---------- group: center stage; lifted & shrunk on mobile ----------
  const group = new THREE.Group();
  group.add(inner);
  group.add(shell);
  const scaleFactor = isMobile ? 0.72 : 1;
  group.scale.setScalar(scaleFactor);
  group.position.set(0, isMobile ? 1.35 : 0.15, 0);
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

  const disposeAll = () => {
    window.removeEventListener("resize", resize);
    shellGeo.dispose();
    shellMat.dispose();
    innerGeo.dispose();
    innerMat.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };

  if (reducedMotion) {
    shared.uTime.value = 12;
    renderer.render(scene, camera);
    return { destroy: disposeAll };
  }

  // collapse, then ignition flare
  gsap
    .timeline()
    .to(shared.uProgress, {
      value: 1,
      duration: 2.8,
      delay: 0.4,
      ease: "power2.inOut",
    })
    .to(innerUniforms.uFlare, { value: 1, duration: 0.3, ease: "power4.in" }, "-=0.4")
    .to(innerUniforms.uFlare, { value: 0, duration: 1.3, ease: "power2.out" });

  // ---------- pointer: raycast onto the sun sphere ----------
  const canHover = window.matchMedia("(hover: hover)").matches;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const sphere = new THREE.Sphere(group.position.clone(), R * scaleFactor);
  const hitPoint = new THREE.Vector3();
  const targetHit = new THREE.Vector3(0, 0, 1);
  let targetReveal = 0;
  let hasPointer = false;

  const onPointer = (e: PointerEvent) => {
    hasPointer = true;
    ndc.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
  };
  if (canHover) window.addEventListener("pointermove", onPointer);

  const clock = new THREE.Clock();
  let pFast = 0;

  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
    shared.uTime.value = t;

    // open toward the cursor / close when it leaves
    if (canHover && hasPointer) {
      raycaster.setFromCamera(ndc, camera);
      sphere.center.copy(group.position);
      if (raycaster.ray.intersectSphere(sphere, hitPoint)) {
        targetHit
          .copy(hitPoint)
          .sub(group.position)
          .normalize();
        targetReveal = 1;
      } else {
        targetReveal = 0;
      }
    } else if (!canHover) {
      // touch devices: the sun breathes open on its own, the aperture
      // drifting slowly across the surface
      targetReveal = 0.45 + 0.35 * Math.sin(t * 0.35);
      targetHit
        .set(Math.sin(t * 0.13), 0.35 * Math.sin(t * 0.09), Math.cos(t * 0.13))
        .normalize();
    }
    // fast open, slow seal — "ça se remet petit à petit"
    const rate = targetReveal > shellUniforms.uReveal.value ? 0.07 : 0.025;
    shellUniforms.uReveal.value +=
      (targetReveal - shellUniforms.uReveal.value) * rate;
    shellUniforms.uHit.value.lerp(targetHit, 0.07).normalize();

    // subtle camera parallax (kept small so the raycast stays honest)
    if (canHover) {
      camera.position.x += (ndc.x * 0.25 - camera.position.x) * 0.04;
      camera.position.y += (0.15 + ndc.y * 0.18 - camera.position.y) * 0.04;
      camera.lookAt(0, 0.15, 0);
    }

    // scroll: recede under the page scrim
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    pFast += (p - pFast) * 0.18;
    shared.uDim.value = 1 - 0.88 * smooth(0.04, 0.18, pFast);

    renderer.render(scene, camera);
  });

  return {
    destroy() {
      renderer.setAnimationLoop(null);
      if (canHover) window.removeEventListener("pointermove", onPointer);
      disposeAll();
    },
  };
}

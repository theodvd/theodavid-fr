import * as THREE from "three";
import gsap from "gsap";

/**
 * Hero scene — "The Sun, in plates".
 *
 * Direct transposition of igloo.inc's gesture, observed live:
 *  - the object is built of RIGID BLOCKS: the sun's crust is partitioned
 *    into ~28 Voronoi plates (nearest-seed on a fibonacci sphere). Every
 *    particle knows its plate; a plate moves as one rigid unit.
 *  - hovering separates the plates under the cursor in an exploded-view:
 *    each plate translates outward along its own normal (staggered per
 *    plate), it never deforms. Gaps open between blocks.
 *  - light FLOODS from inside: a central additive light sprite + the core
 *    particles blaze through the gaps. Closed, the seams between plates
 *    still glow faintly — the igloo's luminous joints.
 *  - plates carry slightly different albedos so the eye reads "blocks".
 *
 * Rotation is uniform (not differential) so plates stay rigid over time;
 * the same rotation is applied to plate centers for honest hit-testing.
 * Open eases in gently, seals even slower. Touch devices breathe open
 * autonomously. Chaos-collapse intro and ignition flare preserved.
 */

const R = 2.1;
const N_PLATES = 34;

const SHELL_VERTEX = /* glsl */ `
  attribute vec3 aDir;
  attribute vec3 aPlate;      // plate-center direction (unit)
  attribute float aPlateSeed; // shared by all particles of a plate
  attribute float aBorder;    // angular margin to the nearest plate border
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
  varying float vSeam;
  varying float vInfl;
  varying float vAlbedo;
  varying float vAlpha;

  void main() {
    // uniform rotation keeps plates rigid; plate centers rotate with them
    float a = uTime * 0.06;
    float ca = cos(a), sa = sin(a);
    vec3 dir = normalize(aDir);
    vec3 d = vec3(dir.x * ca + dir.z * sa, dir.y, -dir.x * sa + dir.z * ca);
    vec3 plate = vec3(
      aPlate.x * ca + aPlate.z * sa,
      aPlate.y,
      -aPlate.x * sa + aPlate.z * ca
    );

    // gentle convection shimmer (small: blocks must read as solid)
    float n = sin(d.x * 9.0 + uTime * 0.5)
            * sin(d.y * 11.0 - uTime * 0.35)
            * sin(d.z * 8.0 + uTime * 0.45);
    float r = ${R.toFixed(2)} * (1.0 + 0.018 * n);

    // ---- exploded view: the WHOLE PLATE separates, rigidly ----
    float ang = acos(clamp(dot(plate, uHit), -1.0, 1.0));
    float gate = 1.0 - smoothstep(0.15, 1.15, ang);
    float infl = clamp(gate * uReveal * 1.5 - aPlateSeed * 0.2, 0.0, 1.0);
    infl = infl * infl * (3.0 - 2.0 * infl);
    // translate along the plate normal + a whisper of per-plate drift
    vec3 disp = plate * infl * 0.6
              + vec3(sin(aPlateSeed * 6.2831), cos(aPlateSeed * 4.7), sin(aPlateSeed * 9.1))
                * infl * 0.07 * sin(uTime * 0.6 + aPlateSeed * 6.2831);

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
    vLimb = clamp(d.z * 0.5 + 0.5, 0.0, 1.0);
    // luminous joints: particles near a plate border glow, more when open
    vSeam = smoothstep(0.08, 0.01, aBorder);
    vInfl = infl;
    // igloo-style: blocks have individually varied albedo
    vAlbedo = 0.82 + 0.36 * fract(aPlateSeed * 7.31);
    // the interior is a void of light: the far hemisphere barely renders,
    // so the flood sprite and core blaze through any opened gap
    float facing = smoothstep(-0.15, 0.2, d.z);
    vAlpha = 0.96 * mix(0.16, 1.0, facing) * mix(0.5, 1.0, p) * uDim;

    gl_PointSize = uSize * (0.55 + 0.8 * aSeed) * (6.0 / -mv.z);
  }
`;

const SHELL_FRAGMENT = /* glsl */ `
  uniform vec3 uColorHot;
  uniform vec3 uColorMid;
  uniform vec3 uColorDeep;
  uniform float uReveal;

  varying float vHeat;
  varying float vLimb;
  varying float vSeam;
  varying float vInfl;
  varying float vAlbedo;
  varying float vAlpha;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float disc = 1.0 - smoothstep(0.3, 0.5, d);
    vec3 col = mix(uColorDeep, uColorMid, vLimb) * vAlbedo;
    col = mix(col, uColorHot, vHeat * 0.12);
    // the joints: always lit, blazing when the plates part
    float joint = vSeam * (0.45 + vInfl * 1.6 + uReveal * 0.25);
    col = mix(col, uColorHot * 1.25, clamp(joint, 0.0, 1.0));
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
      // ---- molten core: blazes when the crust opens ----
      vec3 dir = normalize(aDir);
      float pulse = 1.0 + 0.04 * sin(uTime * 1.8 + aSeed * 6.2831);
      float n = sin(dir.x * 7.0 + uTime * 0.8) * sin(dir.y * 6.0 - uTime * 0.6);
      formed = dir * (0.6 + 0.75 * aDist) * pulse * (1.0 + 0.05 * n);
      heat = 1.0;
      alpha = (0.15 + uReveal * 1.1 + uFlare * 0.8) * (0.5 + 0.5 * aDist);
      size = 1.35;
    } else if (aType < 1.5) {
      // ---- faint corona ----
      vec3 dir = normalize(aDir);
      float aa = uTime * 0.04 + aSeed * 6.2831;
      float ca = cos(aa), sa = sin(aa);
      vec3 dd = vec3(dir.x * ca + dir.z * sa, dir.y, -dir.x * sa + dir.z * ca);
      float breathe = 1.0 + 0.08 * sin(uTime * 0.6 + aSeed * 6.2831);
      formed = dd * ${R.toFixed(2)} * mix(1.05, 1.9, aDist) * breathe;
      heat = 0.8 - aDist * 0.5;
      float fall = 1.0 - aDist;
      alpha = fall * fall * 0.2;
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

/** Evenly distributed plate seeds (fibonacci sphere). */
const plateSeeds = (): THREE.Vector3[] => {
  const seeds: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N_PLATES; i++) {
    const y = 1 - (i / (N_PLATES - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    seeds.push(new THREE.Vector3(Math.cos(th) * rad, y, Math.sin(th) * rad));
  }
  return seeds;
};

/** Radial light texture for the central flood (drawn once on a canvas). */
const makeFloodTexture = (): THREE.Texture => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,240,200,1)");
  g.addColorStop(0.35, "rgba(255,180,80,0.6)");
  g.addColorStop(1, "rgba(255,120,30,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(cv);
  tex.needsUpdate = true;
  return tex;
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
  const N_SHELL = isMobile ? 12000 : 30000;
  const N_CORE = isMobile ? 3200 : 8000;
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

  // ---------- shell: particles assigned to rigid Voronoi plates ----------
  const seeds = plateSeeds();
  const sDir = new Float32Array(N_SHELL * 3);
  const sPlate = new Float32Array(N_SHELL * 3);
  const sPlateSeed = new Float32Array(N_SHELL);
  const sBorder = new Float32Array(N_SHELL);
  const sSeed = new Float32Array(N_SHELL);
  const sChaos = new Float32Array(N_SHELL * 3);
  const v = new THREE.Vector3();

  for (let i = 0; i < N_SHELL; i++) {
    const [x, y, z] = randDir();
    v.set(x, y, z);
    // nearest & second-nearest plate seed -> plate id + border margin
    let best = 0;
    let d1 = -2;
    let d2 = -2;
    for (let s = 0; s < N_PLATES; s++) {
      const dot = v.dot(seeds[s]);
      if (dot > d1) {
        d2 = d1;
        d1 = dot;
        best = s;
      } else if (dot > d2) {
        d2 = dot;
      }
    }
    sDir[i * 3] = x;
    sDir[i * 3 + 1] = y;
    sDir[i * 3 + 2] = z;
    sPlate[i * 3] = seeds[best].x;
    sPlate[i * 3 + 1] = seeds[best].y;
    sPlate[i * 3 + 2] = seeds[best].z;
    sPlateSeed[i] = (best + 0.5) / N_PLATES;
    // angular margin between the two nearest seeds ≈ distance to border
    sBorder[i] = Math.abs(Math.acos(Math.min(d1, 1)) - Math.acos(Math.min(Math.max(d2, -1), 1)));
    sSeed[i] = Math.random();
    sChaos[i * 3] = (Math.random() - 0.5) * 16;
    sChaos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    sChaos[i * 3 + 2] = (Math.random() - 0.5) * 9;
  }

  const shellGeo = new THREE.BufferGeometry();
  shellGeo.setAttribute("position", new THREE.BufferAttribute(sChaos, 3));
  shellGeo.setAttribute("aChaos", new THREE.BufferAttribute(sChaos, 3));
  shellGeo.setAttribute("aDir", new THREE.BufferAttribute(sDir, 3));
  shellGeo.setAttribute("aPlate", new THREE.BufferAttribute(sPlate, 3));
  shellGeo.setAttribute("aPlateSeed", new THREE.BufferAttribute(sPlateSeed, 1));
  shellGeo.setAttribute("aBorder", new THREE.BufferAttribute(sBorder, 1));
  shellGeo.setAttribute("aSeed", new THREE.BufferAttribute(sSeed, 1));

  const shellUniforms = {
    ...shared,
    uSize: { value: isMobile ? 24 : 30 },
    uHit: { value: new THREE.Vector3(0, 0, 1) },
    ...colors,
  };
  const shellMat = new THREE.ShaderMaterial({
    vertexShader: SHELL_VERTEX,
    fragmentShader: SHELL_FRAGMENT,
    uniforms: shellUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const shell = new THREE.Points(shellGeo, shellMat);
  shell.renderOrder = 3;

  // ---------- inner: core + corona + stars ----------
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
      type === 0
        ? Math.cbrt(Math.random())
        : type === 1
          ? Math.pow(Math.random(), 2)
          : Math.random();
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
  inner.renderOrder = 2;

  // ---------- the light flood: central additive sprite ----------
  const floodMat = new THREE.SpriteMaterial({
    map: makeFloodTexture(),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0,
  });
  const flood = new THREE.Sprite(floodMat);
  flood.scale.setScalar(R * 2.3);
  flood.renderOrder = 1;

  // ---------- group ----------
  const group = new THREE.Group();
  group.add(flood);
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
    floodMat.map?.dispose();
    floodMat.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };

  if (reducedMotion) {
    shared.uTime.value = 12;
    floodMat.opacity = 0.12;
    renderer.render(scene, camera);
    return { destroy: disposeAll };
  }

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

    if (canHover && hasPointer) {
      raycaster.setFromCamera(ndc, camera);
      sphere.center.copy(group.position);
      if (raycaster.ray.intersectSphere(sphere, hitPoint)) {
        targetHit.copy(hitPoint).sub(group.position).normalize();
        targetReveal = 1;
      } else {
        targetReveal = 0;
      }
    } else if (!canHover) {
      targetReveal = 0.45 + 0.35 * Math.sin(t * 0.35);
      targetHit
        .set(Math.sin(t * 0.13), 0.35 * Math.sin(t * 0.09), Math.cos(t * 0.13))
        .normalize();
    }
    const rate = targetReveal > shellUniforms.uReveal.value ? 0.045 : 0.02;
    shellUniforms.uReveal.value +=
      (targetReveal - shellUniforms.uReveal.value) * rate;
    shellUniforms.uHit.value.lerp(targetHit, 0.07).normalize();

    // the flood breathes with the opening (plus a faint idle leak)
    const reveal = shellUniforms.uReveal.value;
    floodMat.opacity =
      (0.12 + reveal * 0.85 + 0.02 * Math.sin(t * 1.6)) * shared.uDim.value;

    if (canHover) {
      camera.position.x += (ndc.x * 0.25 - camera.position.x) * 0.04;
      camera.position.y += (0.15 + ndc.y * 0.18 - camera.position.y) * 0.04;
      camera.lookAt(0, 0.15, 0);
    }

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

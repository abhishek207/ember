import { useEffect, useRef } from "react";
import * as THREE from "three";

export type BodyRegion =
  | "heart"
  | "lungs"
  | "bronchi"
  | "cilia"
  | "circulation"
  | "senses"
  | "vessels";

export const MILESTONE_REGION: Record<string, BodyRegion> = {
  "20m": "heart",
  "8h": "circulation",
  "24h": "heart",
  "48h": "senses",
  "72h": "bronchi",
  "1w": "circulation",
  "2w": "circulation",
  "1mo": "cilia",
  "3mo": "lungs",
  "9mo": "lungs",
  "1y": "heart",
  "5y": "vessels",
  "10y": "lungs",
  "15y": "heart",
};

export const REGION_LABEL: Record<BodyRegion, string> = {
  heart: "Heart",
  lungs: "Lungs",
  bronchi: "Airways",
  cilia: "Airway lining",
  circulation: "Circulation",
  senses: "Senses",
  vessels: "Vessels",
};

const DUST = new THREE.Color("#6a7166");
const SAGE = new THREE.Color("#8fb089");
const CLEAR = new THREE.Color("#b7c9b0");
const HEART = new THREE.Color("#b85a4c");
const HEART_LIT = new THREE.Color("#d97868");

function lungShape(side: -1 | 1): THREE.Shape {
  const s = new THREE.Shape();
  if (side < 0) {
    s.moveTo(-0.12, 1.18);
    s.bezierCurveTo(-0.28, 1.22, -0.7, 1.04, -0.86, 0.48);
    s.bezierCurveTo(-0.98, 0.02, -0.94, -0.52, -0.7, -0.92);
    s.bezierCurveTo(-0.48, -1.14, -0.18, -1.1, -0.08, -0.78);
    s.bezierCurveTo(-0.02, -0.42, -0.04, 0.18, -0.06, 0.62);
    s.bezierCurveTo(-0.07, 0.92, -0.08, 1.1, -0.12, 1.18);
  } else {
    s.moveTo(0.1, 1.14);
    s.bezierCurveTo(0.26, 1.18, 0.66, 1.0, 0.82, 0.44);
    s.bezierCurveTo(0.94, -0.02, 0.88, -0.5, 0.64, -0.9);
    s.bezierCurveTo(0.44, -1.12, 0.16, -1.08, 0.08, -0.74);
    s.bezierCurveTo(0.04, -0.42, 0.28, -0.08, 0.3, 0.18);
    s.bezierCurveTo(0.22, 0.42, 0.06, 0.72, 0.08, 1.0);
    s.bezierCurveTo(0.08, 1.08, 0.09, 1.12, 0.1, 1.14);
  }
  return s;
}

function heartShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, -0.28);
  s.bezierCurveTo(-0.42, -0.02, -0.4, 0.38, -0.08, 0.32);
  s.bezierCurveTo(-0.02, 0.42, 0.02, 0.42, 0.08, 0.32);
  s.bezierCurveTo(0.4, 0.38, 0.42, -0.02, 0, -0.28);
  return s;
}

function extrude(shape: THREE.Shape, depth: number): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.055,
    bevelSize: 0.048,
    bevelOffset: -0.012,
    bevelSegments: 5,
    curveSegments: 28,
  });
  geo.computeBoundingBox();
  const box = geo.boundingBox!;
  geo.translate(0, 0, -(box.min.z + box.max.z) / 2);
  geo.computeVertexNormals();
  return geo;
}

function tube(points: THREE.Vector3[], radius: number): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(curve, 24, radius, 8, false);
}

function organMat(color: THREE.Color, opacity = 0.96) {
  return new THREE.MeshStandardMaterial({
    color: color.clone(),
    roughness: 0.46,
    metalness: 0.04,
    emissive: color.clone().multiplyScalar(0.18),
    emissiveIntensity: 0.06,
    transparent: opacity < 0.999,
    opacity,
    depthWrite: opacity > 0.4,
  });
}

function fitPersp(camera: THREE.PerspectiveCamera, w: number, h: number) {
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
}

export function BodyScene({
  region,
  heal,
  className,
}: {
  region: BodyRegion;
  heal: number;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const regionRef = useRef(region);
  const healRef = useRef(heal);
  regionRef.current = region;
  healRef.current = heal;

  useEffect(() => {
    const host = wrap.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const width = host.clientWidth || 320;
    const height = host.clientHeight || 320;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, width / Math.max(height, 1), 0.1, 40);
    camera.position.set(0, 0.12, 7.6);
    camera.lookAt(0, -0.04, 0);

    const root = new THREE.Group();
    scene.add(root);

    const rightGeo = extrude(lungShape(-1), 0.52);
    const leftGeo = extrude(lungShape(1), 0.5);
    const heartGeo = extrude(heartShape(), 0.28);
    heartGeo.scale(0.72, 0.72, 0.72);

    const rightMat = organMat(SAGE);
    const leftMat = organMat(SAGE);
    const heartMat = organMat(HEART, 0.98);
    const airwayMat = organMat(new THREE.Color("#c5d0c0"), 0.92);
    const vesselMat = organMat(new THREE.Color("#c45c4a"), 0.0);
    vesselMat.transparent = true;
    const senseMat = organMat(new THREE.Color("#d7e2d3"), 0.0);
    senseMat.transparent = true;
    const ribMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#9aa394"),
      roughness: 0.7,
      metalness: 0.08,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    });
    const ringMat = new THREE.MeshStandardMaterial({
      color: SAGE,
      emissive: SAGE,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    const lungR = new THREE.Mesh(rightGeo, rightMat);
    const lungL = new THREE.Mesh(leftGeo, leftMat);
    lungR.position.set(0, -0.06, 0);
    lungL.position.set(0, -0.08, 0);
    root.add(lungR, lungL);

    const heart = new THREE.Mesh(heartGeo, heartMat);
    heart.position.set(0.16, 0.06, 0.22);
    heart.rotation.z = -0.18;
    root.add(heart);

    const tracheaGeo = tube(
      [new THREE.Vector3(0, 1.28, 0.02), new THREE.Vector3(0, 0.72, 0.04), new THREE.Vector3(0, 0.42, 0.06)],
      0.046,
    );
    const bronRGeo = tube(
      [new THREE.Vector3(0, 0.44, 0.06), new THREE.Vector3(-0.16, 0.28, 0.04), new THREE.Vector3(-0.34, 0.02, 0.02)],
      0.034,
    );
    const bronLGeo = tube(
      [new THREE.Vector3(0, 0.44, 0.06), new THREE.Vector3(0.18, 0.3, 0.05), new THREE.Vector3(0.34, 0.04, 0.03)],
      0.032,
    );
    const trachea = new THREE.Mesh(tracheaGeo, airwayMat);
    const bronR = new THREE.Mesh(bronRGeo, airwayMat);
    const bronL = new THREE.Mesh(bronLGeo, airwayMat);
    root.add(trachea, bronR, bronL);

    const aortaGeo = tube(
      [
        new THREE.Vector3(0.16, 0.22, 0.28),
        new THREE.Vector3(0.08, 0.48, 0.22),
        new THREE.Vector3(0.02, 0.86, 0.1),
        new THREE.Vector3(0.0, 1.22, 0.04),
      ],
      0.028,
    );
    const aorta = new THREE.Mesh(aortaGeo, vesselMat);
    root.add(aorta);

    const senseGeo = new THREE.SphereGeometry(0.07, 20, 20);
    const senseL = new THREE.Mesh(senseGeo, senseMat);
    const senseR = new THREE.Mesh(senseGeo, senseMat);
    senseL.position.set(-0.11, 1.42, 0.08);
    senseR.position.set(0.11, 1.42, 0.08);
    root.add(senseL, senseR);

    const ribs: THREE.Mesh[] = [];
    const ribGeos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 5; i += 1) {
      const y = 0.62 - i * 0.28;
      const rx = 0.92 + i * 0.04;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-rx, y, 0.08),
        new THREE.Vector3(0, y - 0.08, 0.42),
        new THREE.Vector3(rx, y, 0.08),
      );
      const geo = new THREE.TubeGeometry(curve, 20, 0.012, 6, false);
      ribGeos.push(geo);
      const mesh = new THREE.Mesh(geo, ribMat);
      ribs.push(mesh);
      root.add(mesh);
    }

    const ringGeo = new THREE.TorusGeometry(1.12, 0.018, 10, 64);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.15;
    ring.position.set(0, -0.12, 0);
    root.add(ring);

    scene.add(new THREE.HemisphereLight(0xe8efe4, 0x151a14, 0.72));
    const key = new THREE.DirectionalLight(0xf3f6f0, 1.15);
    key.position.set(-2.4, 2.8, 4.2);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fb089, 0.45);
    rim.position.set(2.2, -0.4, -2.4);
    scene.add(rim);
    const fill = new THREE.PointLight(0xb7c9b2, 4.5, 10);
    fill.position.set(1.4, -1.2, 3.2);
    scene.add(fill);

    const lungColor = new THREE.Color();
    const tmp = new THREE.Color();
    let frame = 0;
    const tick = (now: number) => {
      const t = now / 1000;
      const breath = reduce ? 1 : 1 + Math.sin(t * (Math.PI / 4)) * 0.028;
      const pulse = reduce ? 1 : 0.78 + Math.sin(t * 2.1) * 0.22;
      const target = regionRef.current;
      const heal = healRef.current;
      lungColor.copy(DUST).lerp(CLEAR, heal);

      const lungOn = target === "lungs" || target === "cilia";
      const bronOn = target === "bronchi" || target === "cilia";
      const heartOn = target === "heart" || target === "circulation";
      const circOn = target === "circulation";
      const headOn = target === "senses";
      const vesselOn = target === "vessels" || target === "circulation";

      lungR.scale.set(breath, breath, 1);
      lungL.scale.set(breath, breath, 1);

      rightMat.color.copy(lungColor);
      leftMat.color.copy(lungColor);
      tmp.copy(SAGE).lerp(CLEAR, 0.4);
      rightMat.emissive.copy(lungOn ? tmp : lungColor);
      leftMat.emissive.copy(lungOn ? tmp : lungColor);
      rightMat.emissiveIntensity = lungOn ? 0.14 + pulse * 0.1 : 0.04;
      leftMat.emissiveIntensity = lungOn ? 0.14 + pulse * 0.1 : 0.04;

      airwayMat.emissiveIntensity = bronOn ? 0.22 + pulse * 0.16 : 0.05;
      airwayMat.opacity = bronOn ? 0.95 : 0.82;
      trachea.scale.setScalar(bronOn ? 1 + pulse * 0.04 : 1);

      heartMat.color.copy(heartOn ? HEART_LIT : HEART);
      heartMat.emissive.copy(heartOn ? HEART_LIT : HEART);
      heartMat.emissiveIntensity = heartOn ? 0.2 + pulse * 0.18 : 0.06;
      const hs = heartOn ? 0.97 + pulse * 0.06 : 1;
      heart.scale.set(hs, hs, hs);

      vesselMat.opacity = vesselOn ? 0.55 + pulse * 0.25 : 0;
      vesselMat.emissiveIntensity = vesselOn ? 0.28 + pulse * 0.2 : 0;
      senseMat.opacity = headOn ? 0.55 + pulse * 0.3 : 0;
      senseMat.emissiveIntensity = headOn ? 0.3 + pulse * 0.2 : 0;

      ringMat.opacity = circOn ? 0.18 + pulse * 0.16 : 0;
      ring.scale.setScalar(circOn ? 0.98 + pulse * 0.04 : 1);
      ribMat.opacity = 0.08 + heal * 0.04;

      root.rotation.y = reduce ? 0 : Math.sin(t * 0.18) * 0.12;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    const onResize = () => {
      const w = host.clientWidth || 320;
      const h = host.clientHeight || 320;
      fitPersp(camera, w, h);
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    return () => {
      window.cancelAnimationFrame(frame);
      ro.disconnect();
      [
        rightGeo,
        leftGeo,
        heartGeo,
        tracheaGeo,
        bronRGeo,
        bronLGeo,
        aortaGeo,
        ringGeo,
        senseGeo,
        ...ribGeos,
      ].forEach((g) => g.dispose());
      [rightMat, leftMat, heartMat, airwayMat, vesselMat, senseMat, ribMat, ringMat].forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={wrap} className={className} aria-hidden />;
}

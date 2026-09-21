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

const VIEW = 2.15;
const SAGE = "#8fb089";
const HEART = "#c45c4a";

function fitCamera(camera: THREE.OrthographicCamera, w: number, h: number) {
  const aspect = w / Math.max(h, 1);
  if (aspect >= 1) {
    camera.left = -VIEW * aspect;
    camera.right = VIEW * aspect;
    camera.top = VIEW;
    camera.bottom = -VIEW;
  } else {
    camera.left = -VIEW;
    camera.right = VIEW;
    camera.top = VIEW / aspect;
    camera.bottom = -VIEW / aspect;
  }
  camera.updateProjectionMatrix();
}

function mat(hex: string, opacity: number, emissive = hex, emit = 0.12) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    roughness: 0.42,
    metalness: 0.06,
    emissive: new THREE.Color(emissive),
    emissiveIntensity: emit,
    transparent: true,
    opacity,
    depthWrite: false,
  });
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
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-VIEW, VIEW, VIEW, -VIEW, 0.1, 20);
    camera.position.z = 8;
    fitCamera(camera, width, height);

    const root = new THREE.Group();
    scene.add(root);

    const sphere = new THREE.SphereGeometry(1, 40, 40);
    const cyl = new THREE.CylinderGeometry(1, 1, 1, 20);

    const head = new THREE.Mesh(sphere, mat("#c5cec0", 0.22, SAGE, 0.05));
    head.scale.set(0.38, 0.44, 0.36);
    head.position.set(0, 1.42, 0);
    root.add(head);

    const neck = new THREE.Mesh(cyl, mat("#9aa394", 0.2, SAGE, 0.04));
    neck.scale.set(0.12, 0.28, 0.12);
    neck.position.set(0, 1.08, 0);
    root.add(neck);

    const trachea = new THREE.Mesh(cyl, mat("#b7c4b2", 0.35, SAGE, 0.1));
    trachea.scale.set(0.07, 0.38, 0.07);
    trachea.position.set(0, 0.72, 0.08);
    root.add(trachea);

    const bronL = new THREE.Mesh(cyl, mat("#b7c4b2", 0.32, SAGE, 0.1));
    bronL.scale.set(0.055, 0.34, 0.055);
    bronL.rotation.z = 0.72;
    bronL.position.set(-0.18, 0.48, 0.1);
    root.add(bronL);

    const bronR = new THREE.Mesh(cyl, mat("#b7c4b2", 0.32, SAGE, 0.1));
    bronR.scale.set(0.055, 0.34, 0.055);
    bronR.rotation.z = -0.72;
    bronR.position.set(0.18, 0.48, 0.1);
    root.add(bronR);

    const lungL = new THREE.Mesh(sphere, mat(SAGE, 0.34, SAGE, 0.16));
    lungL.scale.set(0.62, 0.95, 0.48);
    lungL.position.set(-0.58, -0.08, 0);
    root.add(lungL);

    const lungR = new THREE.Mesh(sphere, mat(SAGE, 0.34, SAGE, 0.16));
    lungR.scale.set(0.62, 0.95, 0.48);
    lungR.position.set(0.58, -0.08, 0);
    root.add(lungR);

    const heart = new THREE.Mesh(sphere, mat(HEART, 0.55, HEART, 0.28));
    heart.scale.set(0.28, 0.34, 0.26);
    heart.position.set(0.06, 0.18, 0.28);
    root.add(heart);

    const ringGeo = new THREE.TorusGeometry(1.05, 0.035, 12, 64);
    const ring = new THREE.Mesh(ringGeo, mat(SAGE, 0.0, SAGE, 0.4));
    ring.rotation.x = Math.PI / 2.4;
    ring.position.set(0, -0.05, 0);
    root.add(ring);

    scene.add(new THREE.AmbientLight(0xeef3ea, 0.6));
    const key = new THREE.PointLight(0xb7c9b2, 16, 14);
    key.position.set(-1.6, 1.8, 4);
    scene.add(key);
    const fill = new THREE.PointLight(0x6f8a6a, 7, 12);
    fill.position.set(2, -1.4, 3);
    scene.add(fill);
    const heartLight = new THREE.PointLight(0xc45c4a, 0, 4);
    heartLight.position.copy(heart.position);
    root.add(heartLight);

    const lungMats = [lungL.material, lungR.material] as THREE.MeshStandardMaterial[];
    const bronMats = [bronL.material, bronR.material, trachea.material] as THREE.MeshStandardMaterial[];
    const headMat = head.material as THREE.MeshStandardMaterial;
    const neckMat = neck.material as THREE.MeshStandardMaterial;
    const heartMat = heart.material as THREE.MeshStandardMaterial;
    const ringMat = ring.material as THREE.MeshStandardMaterial;

    let frame = 0;
    const tick = (now: number) => {
      const t = now / 1000;
      const open = reduce ? 0.5 : 0.5 + Math.sin(t * (Math.PI / 4)) * 0.5;
      const breath = 1 + open * 0.045;
      const target = regionRef.current;
      const heal = healRef.current;
      const pulse = reduce ? 1 : 0.72 + Math.sin(t * 2.2) * 0.28;

      lungL.scale.set(0.62 * breath, 0.95 * breath, 0.48);
      lungR.scale.set(0.62 * breath, 0.95 * breath, 0.48);

      const lungOn = target === "lungs" || target === "cilia";
      const bronOn = target === "bronchi" || target === "cilia";
      const heartOn = target === "heart" || target === "circulation";
      const circOn = target === "circulation";
      const headOn = target === "senses" || target === "vessels";

      const lungOp = 0.22 + heal * 0.38 + (lungOn ? 0.18 * pulse : 0);
      lungMats.forEach((m) => {
        m.opacity = lungOp;
        m.emissiveIntensity = lungOn ? 0.22 + pulse * 0.35 : 0.08 + heal * 0.12;
      });

      bronMats.forEach((m) => {
        m.opacity = bronOn ? 0.28 + pulse * 0.35 : 0.14 + heal * 0.12;
        m.emissiveIntensity = bronOn ? 0.2 + pulse * 0.4 : 0.06;
      });

      heartMat.opacity = heartOn ? 0.5 + pulse * 0.28 : 0.32 + heal * 0.12;
      heartMat.emissiveIntensity = heartOn ? 0.35 + pulse * 0.45 : 0.12;
      const hs = (heartOn ? 0.95 + pulse * 0.12 : 1) * (0.95 + open * 0.04);
      heart.scale.set(0.28 * hs, 0.34 * hs, 0.26 * hs);
      heartLight.intensity = heartOn ? 4 + pulse * 5 : 0.6;

      headMat.opacity = headOn ? 0.28 + pulse * 0.32 : 0.14;
      headMat.emissiveIntensity = headOn ? 0.18 + pulse * 0.35 : 0.04;
      neckMat.opacity = target === "vessels" ? 0.3 + pulse * 0.3 : 0.12;
      neckMat.emissiveIntensity = target === "vessels" ? 0.25 + pulse * 0.3 : 0.03;

      ringMat.opacity = circOn ? 0.22 + pulse * 0.35 : 0;
      ring.scale.setScalar(circOn ? 0.96 + pulse * 0.08 : 1);

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    const onResize = () => {
      const w = host.clientWidth || 320;
      const h = host.clientHeight || 320;
      fitCamera(camera, w, h);
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    return () => {
      window.cancelAnimationFrame(frame);
      ro.disconnect();
      sphere.dispose();
      cyl.dispose();
      ringGeo.dispose();
      [
        headMat,
        neckMat,
        heartMat,
        ringMat,
        ...lungMats,
        ...bronMats,
      ].forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={wrap} className={className} aria-hidden />;
}

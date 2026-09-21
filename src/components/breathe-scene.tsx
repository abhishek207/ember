import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CALM, cycleAt, type BreathePattern } from "@/lib/quit/breathe";

const PETALS = 7;
const VIEW = 2;
const SCALE_MIN = 0.5;
const SCALE_MAX = 0.72;
const RADIUS_MIN = 0.16;
const RADIUS_MAX = VIEW * 0.82 - SCALE_MAX;

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

export function BreatheScene({
  running,
  className,
  pattern = CALM,
  originMs,
}: {
  running: boolean;
  className?: string;
  pattern?: BreathePattern;
  originMs?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const runningRef = useRef(running);
  const patternRef = useRef(pattern);
  const originRef = useRef(originMs ?? 0);
  const localOrigin = useRef(performance.now());
  runningRef.current = running;
  patternRef.current = pattern;
  originRef.current = originMs ?? originRef.current;

  useEffect(() => {
    if (originMs != null) {
      originRef.current = originMs;
      return;
    }
    if (running) localOrigin.current = performance.now();
  }, [running, originMs, pattern.id]);

  useEffect(() => {
    const host = wrap.current;
    if (!host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const width = host.clientWidth || 280;
    const height = host.clientHeight || 280;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-VIEW, VIEW, VIEW, -VIEW, 0.1, 20);
    camera.position.z = 6;
    fitCamera(camera, width, height);

    const group = new THREE.Group();
    scene.add(group);

    const geo = new THREE.SphereGeometry(1, 32, 32);
    const petals: THREE.Mesh[] = [];
    for (let i = 0; i < PETALS; i += 1) {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#8fb089"),
        roughness: 0.48,
        metalness: 0.04,
        emissive: new THREE.Color("#6d8a68"),
        emissiveIntensity: 0.08,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      petals.push(mesh);
    }

    const coreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d5ddd2"),
      roughness: 0.38,
      metalness: 0.04,
      emissive: new THREE.Color("#8fb089"),
      emissiveIntensity: 0.12,
      transparent: false,
      opacity: 1,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), coreMat);
    core.scale.set(1, 0.92, 1);
    group.add(core);

    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.62, 32), shadowMat);
    shadow.position.set(0, -0.92, -0.2);
    shadow.scale.set(1.15, 0.38, 1);
    group.add(shadow);

    scene.add(new THREE.HemisphereLight(0xeef3ea, 0x1a2018, 0.7));
    const key = new THREE.PointLight(0xb7c9b2, 10, 12);
    key.position.set(-1.4, 1.6, 3.2);
    scene.add(key);
    const fill = new THREE.PointLight(0x6f8a6a, 4.5, 10);
    fill.position.set(1.8, -1.2, 2.4);
    scene.add(fill);

    let frame = 0;
    const tick = (now: number) => {
      const origin = originRef.current || localOrigin.current;
      const elapsed = runningRef.current ? (now - origin) / 1000 : 0;
      const open = reduce
        ? 0.4
        : runningRef.current
          ? cycleAt(elapsed, patternRef.current).open
          : 0.22;
      const radius = RADIUS_MIN + open * (RADIUS_MAX - RADIUS_MIN);
      const scale = SCALE_MIN + open * (SCALE_MAX - SCALE_MIN);
      petals.forEach((mesh, i) => {
        const a = (i / PETALS) * Math.PI * 2;
        mesh.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
        mesh.scale.setScalar(scale);
      });
      const cs = 0.9 + open * 0.08;
      core.scale.set(cs, cs * 0.92, cs);
      core.position.set(0, -0.04 + open * 0.02, 0.04);
      shadow.scale.set(1.05 + open * 0.35, 0.34 + open * 0.08, 1);
      shadowMat.opacity = 0.16 + (1 - open) * 0.14;
      group.rotation.z = now * 0.00004;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    const onResize = () => {
      const w = host.clientWidth || 280;
      const h = host.clientHeight || 280;
      fitCamera(camera, w, h);
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    return () => {
      window.cancelAnimationFrame(frame);
      ro.disconnect();
      geo.dispose();
      core.geometry.dispose();
      shadow.geometry.dispose();
      coreMat.dispose();
      shadowMat.dispose();
      petals.forEach((m) => {
        (m.material as THREE.Material).dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={wrap} className={className} aria-hidden />;
}

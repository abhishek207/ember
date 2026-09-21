import { useEffect, useRef } from "react";
import * as THREE from "three";

const PETALS = 7;
const IN = 4;
const OUT = 4;
const CYCLE = IN + OUT;
/** Half-size of the ortho view. Petals must stay inside this. */
const VIEW = 2;
const SCALE_MIN = 0.5;
const SCALE_MAX = 0.72;
const RADIUS_MIN = 0.16;
const RADIUS_MAX = VIEW * 0.82 - SCALE_MAX;

function ease(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function openAmount(running: boolean, now: number, startedAt: number): number {
  if (!running) return 0.22;
  const elapsed = ((now - startedAt) / 1000) % CYCLE;
  if (elapsed < IN) return ease(elapsed / IN);
  return 1 - ease((elapsed - IN) / OUT);
}

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
}: {
  running: boolean;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const runningRef = useRef(running);
  const startedAt = useRef(performance.now());
  runningRef.current = running;

  useEffect(() => {
    if (running) startedAt.current = performance.now();
  }, [running]);

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
        roughness: 0.35,
        metalness: 0.08,
        emissive: new THREE.Color("#6d8a68"),
        emissiveIntensity: 0.22,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      petals.push(mesh);
    }

    const coreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d7e2d3"),
      roughness: 0.25,
      metalness: 0.05,
      emissive: new THREE.Color("#8fb089"),
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.92,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 32), coreMat);
    group.add(core);

    scene.add(new THREE.AmbientLight(0xeef3ea, 0.55));
    const key = new THREE.PointLight(0xb7c9b2, 18, 12);
    key.position.set(-1.4, 1.6, 3.2);
    scene.add(key);
    const fill = new THREE.PointLight(0x6f8a6a, 8, 10);
    fill.position.set(1.8, -1.2, 2.4);
    scene.add(fill);

    let frame = 0;
    const tick = (now: number) => {
      const open = reduce ? 0.4 : openAmount(runningRef.current, now, startedAt.current);
      const radius = RADIUS_MIN + open * (RADIUS_MAX - RADIUS_MIN);
      const scale = SCALE_MIN + open * (SCALE_MAX - SCALE_MIN);
      petals.forEach((mesh, i) => {
        const a = (i / PETALS) * Math.PI * 2 + now * 0.00008;
        mesh.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
        mesh.scale.setScalar(scale);
      });
      core.scale.setScalar(0.72 + open * 0.22);
      group.rotation.z = now * 0.00005;
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
      coreMat.dispose();
      petals.forEach((m) => {
        (m.material as THREE.Material).dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={wrap} className={className} aria-hidden />;
}

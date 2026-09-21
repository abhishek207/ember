import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

function sdRoundRect(x: number, y: number, hw: number, hh: number, r: number) {
  const rx = Math.max(hw - r, 0.001);
  const ry = Math.max(hh - r, 0.001);
  const dx = Math.abs(x) - rx;
  const dy = Math.abs(y) - ry;
  const ax = Math.max(dx, 0);
  const ay = Math.max(dy, 0);
  return Math.min(Math.max(dx, dy), 0) + Math.hypot(ax, ay) - r;
}

/** Rounded-rect SDF → RG displacement (center 128 = no bend). Edge-only lens. */
export function makeLensMap(width: number, height: number, radius: number): string {
  const max = 192;
  const scale = Math.min(1, max / Math.max(width, height, 1));
  const w = Math.max(12, Math.round(width * scale));
  const h = Math.max(12, Math.round(height * scale));
  const rad = Math.max(1, radius * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(w, h);
  const data = img.data;
  const hw = w / 2;
  const hh = h / 2;
  const edge = Math.max(5, Math.min(hw, hh) * 0.42);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - hw;
      const py = y + 0.5 - hh;
      const d = sdRoundRect(px, py, hw, hh, rad);
      const i = (y * w + x) * 4;
      if (d > 0.5) {
        data[i] = 128;
        data[i + 1] = 128;
        data[i + 2] = 128;
        data[i + 3] = 0;
        continue;
      }
      const e = 1.15;
      const nx =
        sdRoundRect(px + e, py, hw, hh, rad) - sdRoundRect(px - e, py, hw, hh, rad);
      const ny =
        sdRoundRect(px, py + e, hw, hh, rad) - sdRoundRect(px, py - e, hw, hh, rad);
      const len = Math.hypot(nx, ny) || 1;
      const t = Math.max(0, Math.min(1, 1 + d / edge));
      const band = t * t * (3 - 2 * t);
      const mag = band * 0.62;
      data[i] = Math.round(128 + (nx / len) * mag * 127);
      data[i + 1] = Math.round(128 + (ny / len) * mag * 127);
      data[i + 2] = Math.round(128 + band * 96);
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

export function LiquidSurface({
  className,
  children,
  onClick,
  collapsed,
}: {
  className?: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  collapsed?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const rawId = useId().replace(/:/g, "");
  const filterId = `ember-lens-${rawId}`;
  const [map, setMap] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const paint = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w < 8 || h < 8) return;
      const r = Math.min(h / 2, w / 2);
      setMap(makeLensMap(w, h, r));
    };
    const schedule = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    };
    paint();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [collapsed]);

  return (
    <nav
      ref={ref as RefObject<HTMLElement | null>}
      aria-label="Main"
      aria-expanded={!collapsed}
      className={cn("liquid-dock", collapsed && "is-collapsed", className)}
      style={{
        backdropFilter: map ? `blur(8px) saturate(155%) brightness(1.08) url(#${filterId})` : undefined,
        WebkitBackdropFilter: "blur(8px) saturate(155%) brightness(1.08)",
      }}
      onClick={onClick}
    >
      {map ? (
        <svg aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden">
          <filter
            id={filterId}
            x="-12%"
            y="-28%"
            width="124%"
            height="156%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={map}
              x="0"
              y="0"
              width="100%"
              height="100%"
              result="map"
              preserveAspectRatio="none"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale="20"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
      ) : null}
      {children}
    </nav>
  );
}

/** Kept for the document root — no-op defs; maps are per-dock. */
export function LiquidGlassDefs() {
  return null;
}

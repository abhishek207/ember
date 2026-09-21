import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Flower2, HeartPulse, Home, UserRound, Wind } from "lucide-react";
import { LiquidSurface } from "@/components/liquid-glass";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/health", label: "Body", icon: HeartPulse },
  { to: "/cravings", label: "Urge", icon: Wind },
  { to: "/medi", label: "Medi", icon: Flower2 },
  { to: "/settings", label: "You", icon: UserRound },
] as const;

function navIndex(pathname: string): number {
  const i = NAV.findIndex((item) => (item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)));
  return i < 0 ? 0 : i;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function DockNav({ scrollRoot }: { scrollRoot: RefObject<HTMLDivElement | null> }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [thumb, setThumb] = useState({ x: 0, w: 0 });
  const [dragX, setDragX] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const active = hover ?? navIndex(pathname);

  function measure(index: number) {
    const track = trackRef.current;
    const item = itemRefs.current[index];
    if (!track || !item) return;
    const tr = track.getBoundingClientRect();
    const ir = item.getBoundingClientRect();
    setThumb({ x: ir.left - tr.left, w: ir.width });
  }

  function indexFromClientX(clientX: number): number {
    let best = 0;
    let dist = Infinity;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - clientX);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    return best;
  }

  function go(index: number) {
    const item = NAV[index];
    if (!item) return;
    measure(index);
    if (navIndex(pathname) !== index) navigate({ to: item.to });
  }

  function follow(clientX: number) {
    const track = trackRef.current;
    if (!track) return;
    const tr = track.getBoundingClientRect();
    const w = thumb.w || tr.width / NAV.length;
    const x = clamp(clientX - tr.left - w / 2, 0, Math.max(0, tr.width - w));
    setDragX(x);
    setHover(indexFromClientX(clientX));
  }

  useLayoutEffect(() => {
    if (collapsed || drag.current?.moved) return;
    measure(navIndex(pathname));
    const t = window.setTimeout(() => measure(navIndex(pathname)), 340);
    return () => window.clearTimeout(t);
  }, [pathname, collapsed]);

  useEffect(() => {
    const el = scrollRoot.current;
    if (!el) return;
    const apply = () => {
      const y = el.scrollTop;
      if (y <= 24) setCollapsed(false);
      else if (y >= 56) setCollapsed(true);
    };
    apply();
    el.addEventListener("scroll", apply, { passive: true });
    return () => el.removeEventListener("scroll", apply);
  }, [scrollRoot]);

  useEffect(() => {
    setHover(null);
    setDragX(null);
    const y = scrollRoot.current?.scrollTop ?? 0;
    setCollapsed(y >= 56);
  }, [pathname, scrollRoot]);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (collapsed || e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 16) return;
      if (Math.abs(dx) < Math.abs(dy)) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    follow(e.clientX);
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const moved = d.moved;
    drag.current = null;
    setDragX(null);
    setHover(null);
    if (collapsed) return;
    go(indexFromClientX(e.clientX));
    if (moved) e.preventDefault();
  }

  const x = dragX ?? thumb.x;

  return (
    <LiquidSurface
      as="nav"
      className="liquid-dock"
      collapsed={collapsed}
      onClick={(e) => {
        if (!collapsed) return;
        e.preventDefault();
        setCollapsed(false);
      }}
    >
      <div
        ref={trackRef}
        className="dock-track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
          setDragX(null);
          setHover(null);
        }}
      >
        <span
          className={cn("dock-thumb", dragX != null && "is-dragging")}
          style={{ width: thumb.w, transform: `translateX(${x}px)` }}
          aria-hidden
        >
          <span className="dock-thumb-spec" />
        </span>
        <ul className="dock-list">
          {NAV.map((item, i) => {
            const on = i === active;
            const Icon = item.icon;
            return (
              <li
                key={item.to}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className={cn("dock-item", on && "is-active")}
              >
                <Link
                  to={item.to}
                  className="dock-link"
                  tabIndex={collapsed && !on ? -1 : undefined}
                  onClick={(e) => {
                    if (collapsed) e.preventDefault();
                  }}
                >
                  <Icon className="size-5" strokeWidth={on ? 2.3 : 1.7} />
                  <span className="dock-label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </LiquidSurface>
  );
}

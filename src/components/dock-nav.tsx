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
  const drag = useRef<{ id: number; moved: boolean } | null>(null);
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
    if (collapsed || drag.current) return;
    measure(navIndex(pathname));
    const t = window.setTimeout(() => measure(navIndex(pathname)), 340);
    return () => window.clearTimeout(t);
  }, [pathname, collapsed]);

  useEffect(() => {
    const el = scrollRoot.current;
    if (!el) return;
    let last = el.scrollTop;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = el.scrollTop;
        const dy = y - last;
        last = y;
        if (y <= 28) setCollapsed(false);
        else if (dy > 8) setCollapsed(true);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scrollRoot]);

  useEffect(() => {
    setCollapsed(false);
    setHover(null);
    setDragX(null);
  }, [pathname]);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (collapsed || e.button !== 0) return;
    drag.current = { id: e.pointerId, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved && Math.abs(e.movementX) < 2 && Math.abs(e.movementY) < 2) return;
    d.moved = true;
    follow(e.clientX);
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const moved = d.moved;
    drag.current = null;
    if (!moved) {
      setDragX(null);
      setHover(null);
      return;
    }
    const next = indexFromClientX(e.clientX);
    const item = NAV[next]!;
    setHover(null);
    setDragX(null);
    measure(next);
    if (navIndex(pathname) !== next) navigate({ to: item.to });
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
        onPointerCancel={onPointerUp}
      >
        <span
          className={cn("dock-thumb", dragX != null && "is-dragging")}
          style={{ width: thumb.w, transform: `translateX(${x}px)` }}
          aria-hidden
        />
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
                    if (collapsed || drag.current?.moved) e.preventDefault();
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

import { useEffect, useState, type RefObject } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
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

export function DockNav({ scrollRoot }: { scrollRoot: RefObject<HTMLDivElement | null> }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

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
  }, [pathname]);

  return (
    <LiquidSurface
      collapsed={collapsed}
      onClick={(e) => {
        if (!collapsed) return;
        e.preventDefault();
        setCollapsed(false);
      }}
    >
      <ul className="dock-list">
        {NAV.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <li key={item.to} className={cn("dock-item", active && "is-active")}>
              <Link
                to={item.to}
                className="dock-link"
                tabIndex={collapsed && !active ? -1 : undefined}
                onClick={(e) => {
                  if (collapsed) e.preventDefault();
                }}
              >
                <Icon className="size-5" strokeWidth={active ? 2.3 : 1.7} />
                <span className="dock-label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </LiquidSurface>
  );
}

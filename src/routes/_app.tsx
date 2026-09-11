import { Outlet, createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { HeartPulse, Home, Settings, Wind } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/health", label: "Body", icon: HeartPulse },
  { to: "/cravings", label: "Urge", icon: Wind },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <AuthGate>
      <div className="flex h-dvh flex-col bg-background text-foreground">
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
        <nav
          className="shrink-0 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]"
          aria-label="Main"
        >
          <ul className="mx-auto grid max-w-lg grid-cols-4">
            {NAV.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </AuthGate>
  );
}

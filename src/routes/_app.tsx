import { useEffect, useRef, useState } from "react";
import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { AuthGate } from "@/components/auth-gate";
import { DockNav } from "@/components/dock-nav";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    setCollapsed(false);
  }, [pathname]);

  return (
    <AuthGate>
      <div className="relative h-dvh bg-background text-foreground">
        <div
          ref={scrollRef}
          className="no-scrollbar h-full overflow-x-hidden overflow-y-auto pb-[calc(5.75rem+env(safe-area-inset-bottom))]"
          onScroll={(e) => {
            const y = e.currentTarget.scrollTop;
            if (y <= 24) setCollapsed(false);
            else if (y >= 48) setCollapsed(true);
          }}
        >
          <Outlet />
        </div>
        <DockNav collapsed={collapsed} onExpand={() => setCollapsed(false)} />
      </div>
    </AuthGate>
  );
}

import { useRef } from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/auth-gate";
import { DockNav } from "@/components/dock-nav";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <AuthGate>
      <div className="relative h-dvh bg-background text-foreground">
        <div
          ref={scrollRef}
          className="no-scrollbar h-full overflow-x-hidden overflow-y-auto pb-[calc(5.75rem+env(safe-area-inset-bottom))]"
        >
          <Outlet />
        </div>
        <DockNav scrollRoot={scrollRef} />
      </div>
    </AuthGate>
  );
}

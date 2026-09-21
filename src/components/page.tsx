import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-lg px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  sub,
}: {
  kicker?: string;
  title: string;
  sub?: string;
}) {
  return (
    <header className="mb-8">
      {kicker ? <p className="text-sm font-medium tracking-wide text-primary">{kicker}</p> : null}
      <h1 className={cn("font-display text-3xl font-medium tracking-tight", kicker && "mt-1")}>
        {title}
      </h1>
      {sub ? <p className="mt-2 text-sm text-muted-foreground">{sub}</p> : null}
    </header>
  );
}

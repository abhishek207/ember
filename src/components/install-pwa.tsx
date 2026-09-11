import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function InstallPwa() {
  const [hint, setHint] = useState<"ios" | "other" | "standalone">("other");

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as { standalone?: boolean }).standalone));
    if (standalone) {
      setHint("standalone");
      return;
    }
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setHint(ios ? "ios" : "other");
  }, []);

  if (hint === "standalone") {
    return (
      <p className="text-sm text-muted-foreground">Ember is already on this home screen.</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Add Ember to your home screen. Use Safari on iPhone, not the in-app browser, so the name
        and icon stick.
      </p>
      <Button asChild variant="secondary">
        <a href="/?install=1&platform=ios">Show install steps</a>
      </Button>
    </div>
  );
}

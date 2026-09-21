import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import { BreatheScene } from "@/components/breathe-scene";
import { Button } from "@/components/ui/button";
import { SITS, SOUNDS, type SoundId } from "@/lib/medi/engine";
import { GUIDES, lineAt, type Guide, type GuideId } from "@/lib/medi/guides";
import { useMedi } from "@/lib/medi/use-medi";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/medi")({ component: Medi });

function formatSit(left: number): string {
  const s = Math.max(0, left);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.88;
  u.pitch = 0.95;
  u.lang = "en-IN";
  window.speechSynthesis.speak(u);
}

function Medi() {
  const medi = useMedi();
  const sitting = medi.sitEndsAt != null;
  const remaining = medi.sitRemaining();
  const [guideId, setGuideId] = useState<GuideId | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const lastLine = useRef("");
  const guide = GUIDES.find((g) => g.id === guideId) ?? null;
  const spoken = guide ? lineAt(guide, elapsed) : "";

  useEffect(() => {
    if (!guide || !sitting) return;
    const start = Date.now() - (medi.sitTotal - remaining) * 1000;
    const id = window.setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    }, 250);
    return () => window.clearInterval(id);
  }, [guide, sitting, medi.sitTotal, remaining]);

  useEffect(() => {
    if (!guide || !spoken || spoken === lastLine.current) return;
    lastLine.current = spoken;
    speak(spoken);
  }, [guide, spoken]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  function startGuide(g: Guide) {
    lastLine.current = "";
    setGuideId(g.id);
    setElapsed(0);
    medi.startSit(g.minutes);
  }

  function endSit() {
    medi.stopSit();
    setGuideId(null);
    setElapsed(0);
    lastLine.current = "";
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }

  return (
    <div className="scene-medi min-h-full">
      <div className="mx-auto w-full max-w-lg px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-10">
        <p className="text-sm font-medium tracking-wide text-primary">Medi</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Sit still.</h1>
        <p className="mt-2 text-sm text-muted-foreground">A voice, a timer, and air.</p>

        {sitting ? (
          <div className="glass mt-8 rounded-3xl px-5 py-6 text-center">
            <BreatheScene running className="mx-auto size-56" />
            <p className="mt-2 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              {guide ? guide.label : "Sitting"}
            </p>
            <p className="mt-2 font-display text-5xl font-medium tabular-nums tracking-tight">
              {formatSit(remaining)}
            </p>
            {spoken ? (
              <p className="mx-auto mt-4 max-w-[20rem] text-sm leading-relaxed text-foreground/90">
                {spoken}
              </p>
            ) : null}
            <Button type="button" variant="secondary" className="mt-6" onClick={endSit}>
              End sit
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Guided
              </p>
              <ul className="mt-3 space-y-2">
                {GUIDES.map((g) => (
                  <li key={g.id}>
                    <SoundRow
                      label={g.label}
                      hint={g.hint}
                      on={false}
                      onToggle={() => startGuide(g)}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Timer only
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {SITS.map((sit) => (
                  <button
                    key={sit.minutes}
                    type="button"
                    onClick={() => {
                      setGuideId(null);
                      medi.startSit(sit.minutes);
                    }}
                    className="glass h-14 rounded-2xl text-sm font-medium"
                  >
                    {sit.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="mt-10">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Ambient</p>
          <ul className="mt-3 space-y-2">
            {SOUNDS.map((sound) => {
              const on = medi.playing === sound.id;
              return (
                <li key={sound.id}>
                  <SoundRow
                    label={sound.label}
                    hint={sound.hint}
                    on={on}
                    onToggle={() => {
                      if (on) medi.stopSound();
                      else void medi.play(sound.id as SoundId);
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SoundRow({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "glass flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left",
        on && "bg-primary/15",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full",
          on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
        )}
      >
        {on ? <Pause className="size-4" /> : <Play className="size-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}

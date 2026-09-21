export type BreatheKind = "in" | "holdIn" | "out" | "holdOut";

export type BreatheStep = {
  kind: BreatheKind;
  label: string;
  seconds: number;
};

export type BreathePattern = {
  id: string;
  name: string;
  hint: string;
  steps: BreatheStep[];
};

export const PATTERNS: BreathePattern[] = [
  {
    id: "calm",
    name: "Calm",
    hint: "Four in. Four out.",
    steps: [
      { kind: "in", label: "Breathe in", seconds: 4 },
      { kind: "out", label: "Breathe out", seconds: 4 },
    ],
  },
  {
    id: "box",
    name: "Box",
    hint: "In, hold, out, hold.",
    steps: [
      { kind: "in", label: "Breathe in", seconds: 4 },
      { kind: "holdIn", label: "Hold", seconds: 4 },
      { kind: "out", label: "Breathe out", seconds: 4 },
      { kind: "holdOut", label: "Hold", seconds: 4 },
    ],
  },
  {
    id: "478",
    name: "4-7-8",
    hint: "In four. Hold seven. Out eight.",
    steps: [
      { kind: "in", label: "Breathe in", seconds: 4 },
      { kind: "holdIn", label: "Hold", seconds: 7 },
      { kind: "out", label: "Breathe out", seconds: 8 },
    ],
  },
  {
    id: "equal",
    name: "Equal",
    hint: "Five in. Five out.",
    steps: [
      { kind: "in", label: "Breathe in", seconds: 5 },
      { kind: "out", label: "Breathe out", seconds: 5 },
    ],
  },
  {
    id: "long",
    name: "Long out",
    hint: "Four in. Six out.",
    steps: [
      { kind: "in", label: "Breathe in", seconds: 4 },
      { kind: "out", label: "Breathe out", seconds: 6 },
    ],
  },
];

export const CALM = PATTERNS[0]!;

function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}

export function cycleLength(pattern: BreathePattern): number {
  return pattern.steps.reduce((sum, step) => sum + step.seconds, 0);
}

export function cycleAt(
  elapsedSec: number,
  pattern: BreathePattern,
): { step: BreatheStep; index: number; local: number; remaining: number; open: number } {
  const total = Math.max(0.001, cycleLength(pattern));
  let t = elapsedSec % total;
  if (t < 0) t += total;
  for (let i = 0; i < pattern.steps.length; i += 1) {
    const step = pattern.steps[i]!;
    if (t < step.seconds) {
      return {
        step,
        index: i,
        local: t,
        remaining: Math.max(0, step.seconds - t),
        open: openFor(step, t),
      };
    }
    t -= step.seconds;
  }
  const last = pattern.steps[pattern.steps.length - 1]!;
  return { step: last, index: pattern.steps.length - 1, local: last.seconds, remaining: 0, open: openFor(last, last.seconds) };
}

function openFor(step: BreatheStep, local: number): number {
  const u = step.seconds <= 0 ? 1 : ease(local / step.seconds);
  if (step.kind === "in") return u;
  if (step.kind === "holdIn") return 1;
  if (step.kind === "out") return 1 - u;
  return 0;
}

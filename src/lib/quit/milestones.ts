export type Milestone = {
  id: string;
  afterSeconds: number;
  title: string;
  body: string;
};

const MIN = 60;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export const MILESTONES: Milestone[] = [
  {
    id: "20m",
    afterSeconds: 20 * MIN,
    title: "Pulse eases",
    body: "Heart rate and blood pressure begin to settle toward their usual rest.",
  },
  {
    id: "8h",
    afterSeconds: 8 * HOUR,
    title: "Carbon monoxide falls",
    body: "Oxygen can move more freely. The air in your blood is already cleaner.",
  },
  {
    id: "24h",
    afterSeconds: 1 * DAY,
    title: "One clear day",
    body: "A full rotation without smoke. Risk of a heart event starts to ease.",
  },
  {
    id: "48h",
    afterSeconds: 2 * DAY,
    title: "Senses wake",
    body: "Smell and taste begin to return as nerve endings recover.",
  },
  {
    id: "72h",
    afterSeconds: 3 * DAY,
    title: "Breathing room",
    body: "Bronchial tubes relax. Air moves with less work.",
  },
  {
    id: "1w",
    afterSeconds: 7 * DAY,
    title: "A week free",
    body: "Nicotine is largely gone. The hardest chemical pull has passed.",
  },
  {
    id: "2w",
    afterSeconds: 14 * DAY,
    title: "Circulation lifts",
    body: "Walking and climbing start to feel less expensive.",
  },
  {
    id: "1mo",
    afterSeconds: 1 * MONTH,
    title: "Cilia recover",
    body: "The tiny sweepers in your airways start their work again.",
  },
  {
    id: "3mo",
    afterSeconds: 3 * MONTH,
    title: "Lung function climbs",
    body: "Capacity and flow measurably improve for most people.",
  },
  {
    id: "9mo",
    afterSeconds: 9 * MONTH,
    title: "Coughing quiets",
    body: "The chest has less to clear. Energy is easier to find.",
  },
  {
    id: "1y",
    afterSeconds: 1 * YEAR,
    title: "Heart risk halved",
    body: "A year free. Coronary risk is about half that of someone who still smokes.",
  },
  {
    id: "5y",
    afterSeconds: 5 * YEAR,
    title: "Stroke risk falling",
    body: "Vessels keep healing. Stroke risk approaches that of someone who never smoked.",
  },
  {
    id: "10y",
    afterSeconds: 10 * YEAR,
    title: "Lung cancer risk halved",
    body: "A decade of cleaner tissue. Risk of lung cancer is about half.",
  },
  {
    id: "15y",
    afterSeconds: 15 * YEAR,
    title: "Heart like never smoked",
    body: "Coronary risk matches someone who never lit up. The long game is yours.",
  },
];

export function nextMilestone(seconds: number): {
  current: Milestone | null;
  next: Milestone;
  progress: number;
} {
  let current: Milestone | null = null;
  for (const m of MILESTONES) {
    if (seconds >= m.afterSeconds) current = m;
    else {
      const prevAt = current?.afterSeconds ?? 0;
      const span = m.afterSeconds - prevAt;
      const progress = span <= 0 ? 1 : Math.min(1, (seconds - prevAt) / span);
      return { current, next: m, progress };
    }
  }
  const last = MILESTONES[MILESTONES.length - 1]!;
  return { current: last, next: last, progress: 1 };
}

export function reachedMilestones(seconds: number): Milestone[] {
  return MILESTONES.filter((m) => seconds >= m.afterSeconds);
}

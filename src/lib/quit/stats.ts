import type { Profile } from "./types";

export type QuitStats = {
  seconds: number;
  cigarettesAvoided: number;
  moneySaved: number;
  minutesReturned: number;
};

const MINUTES_PER_CIG = 8;

export function computeStats(profile: Profile | null, now = Date.now()): QuitStats {
  if (!profile) {
    return { seconds: 0, cigarettesAvoided: 0, moneySaved: 0, minutesReturned: 0 };
  }
  const quitMs = new Date(profile.quitAt).getTime();
  const seconds = Math.max(0, Math.floor((now - quitMs) / 1000));
  const days = seconds / 86400;
  const packCost = Number(profile.costPerPack) || 0;
  const perPack = Math.max(1, Number(profile.cigsPerPack) || 20);
  const perDay = Math.max(0, Number(profile.cigsPerDay) || 0);
  const cigarettesAvoided = days * perDay;
  const moneySaved = (cigarettesAvoided / perPack) * packCost;
  const minutesReturned = cigarettesAvoided * MINUTES_PER_CIG;
  return { seconds, cigarettesAvoided, moneySaved, minutesReturned };
}

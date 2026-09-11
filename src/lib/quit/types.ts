export type Profile = {
  quitAt: string;
  cigsPerDay: number;
  costPerPack: number;
  cigsPerPack: number;
  currency: string;
  displayName: string;
};

export type Craving = {
  id: string;
  intensity: number;
  note: string;
  createdAt: string;
};

export type DailyNote = {
  id: string;
  body: string;
  createdAt: string;
};

export type QuitPayload = {
  profile: Profile | null;
  cravings: Craving[];
  notes: DailyNote[];
};

export const DEFAULT_PROFILE: Omit<Profile, "quitAt"> = {
  cigsPerDay: 10,
  costPerPack: 20,
  cigsPerPack: 20,
  currency: "INR",
  displayName: "",
};

import type { Craving, DailyNote, Profile, QuitPayload } from "./types";

export async function loadQuit(): Promise<QuitPayload> {
  const { fetchQuitData } = await import("./api");
  return fetchQuitData();
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  const { saveProfileFn } = await import("./api");
  return saveProfileFn({ data: profile });
}

export async function saveCraving(craving: Craving): Promise<Craving> {
  const { saveCravingFn } = await import("./api");
  return saveCravingFn({ data: craving });
}

export async function saveNote(note: DailyNote): Promise<DailyNote> {
  const { saveNoteFn } = await import("./api");
  return saveNoteFn({ data: note });
}

export async function eraseAll(): Promise<void> {
  const { eraseQuitData } = await import("./api");
  await eraseQuitData();
}

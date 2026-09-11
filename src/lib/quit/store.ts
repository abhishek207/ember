import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PROFILE, type Craving, type DailyNote, type Profile } from "./types";
import * as remote from "./remote";

type QuitState = {
  hasHydrated: boolean;
  remoteReady: boolean;
  saving: boolean;
  saveError: string | null;
  profile: Profile | null;
  cravings: Craving[];
  notes: DailyNote[];
  markHydrated: () => void;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  logCraving: (intensity: number, note?: string) => Promise<void>;
  addNote: (body: string) => Promise<void>;
  pullRemote: () => Promise<void>;
  clearAll: () => Promise<void>;
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export const useQuitStore = create<QuitState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      remoteReady: false,
      saving: false,
      saveError: null,
      profile: null,
      cravings: [],
      notes: [],

      markHydrated: () => set({ hasHydrated: true }),

      updateProfile: async (patch) => {
        const current = get().profile;
        const next: Profile = {
          quitAt: current?.quitAt ?? new Date().toISOString(),
          ...DEFAULT_PROFILE,
          ...current,
          ...patch,
        };
        // Write local first so Home updates before the network round-trip.
        set({ profile: next, saving: true, saveError: null });
        try {
          await remote.saveProfile(next);
        } catch (err) {
          set({
            saveError: err instanceof Error ? err.message : "Could not save",
          });
          throw err;
        } finally {
          set({ saving: false });
        }
      },

      logCraving: async (intensity, note = "") => {
        const craving: Craving = {
          id: newId(),
          intensity,
          note,
          createdAt: new Date().toISOString(),
        };
        set({ cravings: [craving, ...get().cravings] });
        try {
          await remote.saveCraving(craving);
        } catch (err) {
          set({
            saveError: err instanceof Error ? err.message : "Could not save craving",
          });
        }
      },

      addNote: async (body) => {
        const trimmed = body.trim();
        if (!trimmed) return;
        const note: DailyNote = {
          id: newId(),
          body: trimmed,
          createdAt: new Date().toISOString(),
        };
        set({ notes: [note, ...get().notes] });
        try {
          await remote.saveNote(note);
        } catch (err) {
          set({
            saveError: err instanceof Error ? err.message : "Could not save note",
          });
        }
      },

      pullRemote: async () => {
        try {
          const data = await remote.loadQuit();
          const local = get();
          if (data.profile) {
            set({
              profile: data.profile,
              cravings: data.cravings,
              notes: data.notes,
              saveError: null,
            });
            return;
          }
          if (local.profile) {
            await remote.saveProfile(local.profile);
            await Promise.all([
              ...local.cravings.map((c) => remote.saveCraving(c).catch(() => undefined)),
              ...local.notes.map((n) => remote.saveNote(n).catch(() => undefined)),
            ]);
          }
        } catch {
          /* keep local cache */
        } finally {
          set({ remoteReady: true });
        }
      },

      clearAll: async () => {
        set({ saving: true, saveError: null });
        try {
          await remote.eraseAll();
          set({
            profile: null,
            cravings: [],
            notes: [],
            saving: false,
            saveError: null,
          });
        } catch (err) {
          set({
            saving: false,
            saveError: err instanceof Error ? err.message : "Could not erase",
          });
          throw err;
        }
      },
    }),
    {
      name: "ember-quit-v1",
      partialize: (s) => ({
        profile: s.profile,
        cravings: s.cravings,
        notes: s.notes,
      }),
      onRehydrateStorage: () => () => {
        useQuitStore.setState({ hasHydrated: true });
      },
    },
  ),
);

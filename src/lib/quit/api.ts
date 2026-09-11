import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Craving, DailyNote, Profile, QuitPayload } from "./types";

const profileSchema = z.object({
  quitAt: z.string().min(1),
  cigsPerDay: z.number().min(0).max(200),
  costPerPack: z.number().min(0).max(100000),
  cigsPerPack: z.number().min(1).max(100),
  currency: z.string().min(1).max(8),
  displayName: z.string().max(80),
});

const cravingSchema = z.object({
  id: z.string().min(1),
  intensity: z.number().min(1).max(10),
  note: z.string().max(400),
  createdAt: z.string().min(1),
});

const noteSchema = z.object({
  id: z.string().min(1),
  body: z.string().min(1).max(1000),
  createdAt: z.string().min(1),
});

type ProfileRow = {
  quit_at: string;
  cigs_per_day: number;
  cost_per_pack: string | number;
  cigs_per_pack: number;
  currency: string;
  display_name: string | null;
};

type CravingRow = {
  id: string;
  intensity: number;
  note: string | null;
  created_at: string;
};

type NoteRow = {
  id: string;
  body: string;
  created_at: string;
};

function mapProfile(row: ProfileRow): Profile {
  return {
    quitAt: new Date(row.quit_at).toISOString(),
    cigsPerDay: Number(row.cigs_per_day) || 0,
    costPerPack: Number(row.cost_per_pack) || 0,
    cigsPerPack: Number(row.cigs_per_pack) || 20,
    currency: row.currency || "INR",
    displayName: row.display_name ?? "",
  };
}

export const fetchQuitData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<QuitPayload> => {
    const sql = await getSql();
    const profiles = await sql<ProfileRow>`
      select quit_at, cigs_per_day, cost_per_pack, cigs_per_pack, currency, display_name
      from quit_profiles
      where user_id = ${context.userId}
      limit 1
    `;
    const cravings = await sql<CravingRow>`
      select id, intensity, note, created_at
      from quit_cravings
      where user_id = ${context.userId}
      order by created_at desc
      limit 200
    `;
    const notes = await sql<NoteRow>`
      select id, body, created_at
      from quit_notes
      where user_id = ${context.userId}
      order by created_at desc
      limit 100
    `;
    return {
      profile: profiles[0] ? mapProfile(profiles[0]) : null,
      cravings: cravings.map((row) => ({
        id: row.id,
        intensity: Number(row.intensity) || 1,
        note: row.note ?? "",
        createdAt: new Date(row.created_at).toISOString(),
      })),
      notes: notes.map((row) => ({
        id: row.id,
        body: row.body,
        createdAt: new Date(row.created_at).toISOString(),
      })),
    };
  });

export const saveProfileFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => profileSchema.parse(data))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<Profile> => {
    const sql = await getSql();
    await sql`
      insert into quit_profiles (
        user_id, quit_at, cigs_per_day, cost_per_pack, cigs_per_pack, currency, display_name, updated_at
      ) values (
        ${context.userId},
        ${data.quitAt},
        ${data.cigsPerDay},
        ${data.costPerPack},
        ${data.cigsPerPack},
        ${data.currency},
        ${data.displayName},
        now()
      )
      on conflict (user_id) do update set
        quit_at = excluded.quit_at,
        cigs_per_day = excluded.cigs_per_day,
        cost_per_pack = excluded.cost_per_pack,
        cigs_per_pack = excluded.cigs_per_pack,
        currency = excluded.currency,
        display_name = excluded.display_name,
        updated_at = now()
    `;
    return data;
  });

export const saveCravingFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => cravingSchema.parse(data))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<Craving> => {
    const sql = await getSql();
    await sql`
      insert into quit_cravings (id, user_id, intensity, note, created_at)
      values (${data.id}, ${context.userId}, ${data.intensity}, ${data.note}, ${data.createdAt})
      on conflict (id) do nothing
    `;
    return data;
  });

export const saveNoteFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => noteSchema.parse(data))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<DailyNote> => {
    const sql = await getSql();
    await sql`
      insert into quit_notes (id, user_id, body, created_at)
      values (${data.id}, ${context.userId}, ${data.body}, ${data.createdAt})
      on conflict (id) do nothing
    `;
    return data;
  });

export const eraseQuitData = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ ok: true }> => {
    const sql = await getSql();
    await sql`delete from quit_notes where user_id = ${context.userId}`;
    await sql`delete from quit_cravings where user_id = ${context.userId}`;
    await sql`delete from quit_profiles where user_id = ${context.userId}`;
    return { ok: true };
  });

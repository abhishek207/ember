import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
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

type ColMeta = {
  column_name: string;
  is_nullable: string;
  column_default: string | null;
  data_type: string;
};

const COL_IDENT = /^[a-z_][a-z0-9_]*$/;

function quoteIdent(name: string): string {
  if (!COL_IDENT.test(name)) throw new Error("Invalid column");
  return `"${name}"`;
}

function pickNum(row: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const key of keys) {
    if (row[key] == null || row[key] === "") continue;
    const n = Number(row[key]);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function pickStr(row: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const key of keys) {
    if (row[key] == null) continue;
    const s = String(row[key]);
    if (s) return s;
  }
  return fallback;
}

function mapProfile(row: Record<string, unknown>): Profile {
  const quitRaw = row.quit_at ?? row.quit_date;
  return {
    quitAt: new Date(String(quitRaw ?? Date.now())).toISOString(),
    cigsPerDay: pickNum(row, ["cigs_per_day", "cigarettes_per_day"]),
    costPerPack: pickNum(row, ["cost_per_pack", "pack_cost", "pack_price"]),
    cigsPerPack: pickNum(row, ["cigs_per_pack", "pack_size", "cigarettes_per_pack"], 20) || 20,
    currency: pickStr(row, ["currency"], "INR") || "INR",
    displayName: pickStr(row, ["display_name", "name"]),
  };
}

function profileColumnValues(userId: string, data: Profile): Record<string, unknown> {
  return {
    user_id: userId,
    quit_at: data.quitAt,
    quit_date: data.quitAt,
    cigs_per_day: data.cigsPerDay,
    cigarettes_per_day: data.cigsPerDay,
    cost_per_pack: data.costPerPack,
    pack_cost: data.costPerPack,
    pack_price: data.costPerPack,
    cigs_per_pack: data.cigsPerPack,
    pack_size: data.cigsPerPack,
    cigarettes_per_pack: data.cigsPerPack,
    currency: data.currency,
    display_name: data.displayName,
    name: data.displayName,
    updated_at: new Date().toISOString(),
  };
}

function fallbackForType(dataType: string): unknown {
  const t = dataType.toLowerCase();
  if (
    t.includes("int") ||
    t === "numeric" ||
    t === "decimal" ||
    t === "real" ||
    t.includes("double")
  ) {
    return 20;
  }
  if (t.includes("timestamp") || t === "date") return new Date().toISOString();
  if (t === "boolean") return false;
  return "";
}

async function listProfileColumns(sql: Sql): Promise<ColMeta[]> {
  return sql<ColMeta>`
    select column_name, is_nullable, column_default, data_type
    from information_schema.columns
    where table_name = 'quit_profiles'
  `;
}

async function upsertProfile(sql: Sql, userId: string, data: Profile): Promise<void> {
  const cols = await listProfileColumns(sql);
  const values = profileColumnValues(userId, data);
  const insertNames: string[] = [];
  const insertVals: unknown[] = [];

  for (const col of cols) {
    const name = col.column_name;
    if (!COL_IDENT.test(name)) continue;
    if (Object.prototype.hasOwnProperty.call(values, name)) {
      insertNames.push(name);
      insertVals.push(values[name]);
      continue;
    }
    const required = col.is_nullable === "NO";
    const hasDefault = Boolean(col.column_default);
    if (required && !hasDefault) {
      insertNames.push(name);
      insertVals.push(fallbackForType(col.data_type));
    }
  }

  if (!insertNames.includes("user_id")) {
    throw new Error("quit_profiles is missing user_id");
  }

  const quoted = insertNames.map(quoteIdent).join(", ");
  const placeholders = insertNames.map((_, i) => `$${i + 1}`).join(", ");
  const updates = insertNames
    .filter((name) => name !== "user_id")
    .map((name) => `${quoteIdent(name)} = excluded.${quoteIdent(name)}`)
    .join(", ");

  await sql.query(
    `insert into quit_profiles (${quoted}) values (${placeholders})
     on conflict (user_id) do update set ${updates}`,
    insertVals,
  );
}

export const fetchQuitData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<QuitPayload> => {
    const sql = await getSql();
    const profiles = await sql<Record<string, unknown>>`
      select * from quit_profiles
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
    await upsertProfile(sql, context.userId, data);
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

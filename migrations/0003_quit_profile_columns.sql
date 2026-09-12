-- Live Neon applied an older 0002 that lacked later profile columns.
-- 0002 is already recorded in _migrations, so it will not re-run.

alter table quit_profiles add column if not exists cost_per_pack numeric not null default 20;
alter table quit_profiles add column if not exists cigs_per_pack integer not null default 20;
alter table quit_profiles add column if not exists currency text not null default 'INR';
alter table quit_profiles add column if not exists display_name text;
alter table quit_profiles add column if not exists updated_at timestamptz not null default now();

-- Daily average can be 2.5 when some days are 2 and some are 3.
alter table quit_profiles
  alter column cigs_per_day type numeric using cigs_per_day::numeric;

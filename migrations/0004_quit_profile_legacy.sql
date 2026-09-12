-- Live Neon still has the original pack_size / pack_cost columns (NOT NULL, no default).
-- New inserts that only write cigs_per_pack / cost_per_pack then fail.

alter table quit_profiles add column if not exists pack_size integer;
alter table quit_profiles add column if not exists pack_cost numeric;

update quit_profiles
  set pack_size = coalesce(pack_size, cigs_per_pack, 20)
  where pack_size is null;
update quit_profiles
  set pack_cost = coalesce(pack_cost, cost_per_pack, 20)
  where pack_cost is null;
update quit_profiles
  set cigs_per_pack = coalesce(cigs_per_pack, pack_size, 20)
  where cigs_per_pack is null;
update quit_profiles
  set cost_per_pack = coalesce(cost_per_pack, pack_cost, 20)
  where cost_per_pack is null;

alter table quit_profiles alter column pack_size set default 20;
alter table quit_profiles alter column pack_cost set default 20;

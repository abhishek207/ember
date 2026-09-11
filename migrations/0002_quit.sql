-- Ember quit-smoking progress, scoped to the signed-in user.
create table if not exists quit_profiles (
  user_id text primary key,
  quit_at timestamptz not null,
  cigs_per_day integer not null default 10,
  cost_per_pack numeric not null default 20,
  cigs_per_pack integer not null default 20,
  currency text not null default 'INR',
  display_name text,
  updated_at timestamptz not null default now()
);

create table if not exists quit_cravings (
  id text primary key,
  user_id text not null,
  intensity integer not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists quit_cravings_user_id_idx on quit_cravings (user_id);

create table if not exists quit_notes (
  id text primary key,
  user_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists quit_notes_user_id_idx on quit_notes (user_id);

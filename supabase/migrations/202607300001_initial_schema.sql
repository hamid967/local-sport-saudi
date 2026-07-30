create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.sports (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ar text not null,
  name_en text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.regions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ar text not null,
  name_en text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.regions(id) on delete restrict,
  name_ar text not null,
  name_en text not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique(region_id, name_ar)
);

create table public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete restrict,
  name_ar text not null,
  name_en text not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique(city_id, name_ar)
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ar text not null,
  name_en text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid references public.roles(id) on delete set null,
  full_name text not null,
  phone text,
  city_id uuid references public.cities(id),
  preferred_language text not null default 'ar' check (preferred_language in ('ar','en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.sports(id) on delete restrict,
  region_id uuid references public.regions(id) on delete set null,
  city_id uuid references public.cities(id) on delete set null,
  name_ar text not null,
  name_en text not null,
  level text not null default 'local' check (level in ('national','regional','city','neighborhood','school','corporate','friendly','local')),
  gender text not null default 'men' check (gender in ('men','women','mixed','youth')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'scheduled' check (status in ('scheduled','active','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (ends_on >= starts_on)
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.sports(id) on delete restrict,
  city_id uuid references public.cities(id) on delete set null,
  neighborhood_id uuid references public.neighborhoods(id) on delete set null,
  name_ar text not null,
  name_en text not null,
  team_type text not null default 'community' check (team_type in ('club','academy','school','community','corporate')),
  founded_year int,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  full_name_ar text not null,
  full_name_en text,
  birth_date date,
  nationality text not null default 'SA',
  position text,
  dominant_foot text check (dominant_foot in ('right','left','both')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.team_memberships (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  season_id uuid references public.seasons(id) on delete set null,
  shirt_number int,
  role text not null default 'player' check (role in ('player','captain','coach','manager')),
  starts_on date not null default current_date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique(team_id, player_id, season_id)
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  city_id uuid not null references public.cities(id) on delete restrict,
  neighborhood_id uuid references public.neighborhoods(id) on delete set null,
  name_ar text not null,
  name_en text not null,
  address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  surface text not null default 'artificial_grass',
  capacity int,
  hourly_rate numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.venue_facilities (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  code text not null,
  name_ar text not null,
  name_en text not null,
  created_at timestamptz not null default now(),
  unique(venue_id, code)
);

create table public.venue_slots (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  price numeric(10,2) not null,
  status text not null default 'available' check (status in ('available','held','booked','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (ends_at > starts_at)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.sports(id) on delete restrict,
  competition_id uuid references public.competitions(id) on delete set null,
  season_id uuid references public.seasons(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  home_team_id uuid not null references public.teams(id) on delete restrict,
  away_team_id uuid not null references public.teams(id) on delete restrict,
  starts_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','live','halftime','completed','postponed','cancelled')),
  minute int,
  home_score int not null default 0,
  away_score int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (home_team_id <> away_team_id)
);

create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  player_id uuid references public.players(id) on delete set null,
  minute int not null,
  event_type text not null check (event_type in ('goal','own_goal','yellow_card','red_card','substitution','penalty','var','note')),
  description text,
  created_at timestamptz not null default now()
);

create table public.lineups (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  is_starter boolean not null default false,
  position text,
  shirt_number int,
  created_at timestamptz not null default now(),
  unique(match_id, player_id)
);

create table public.standings (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  played int not null default 0,
  won int not null default 0,
  drawn int not null default 0,
  lost int not null default 0,
  goals_for int not null default 0,
  goals_against int not null default 0,
  points int not null default 0,
  rank int,
  updated_at timestamptz not null default now(),
  unique(season_id, team_id)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete restrict,
  venue_slot_id uuid references public.venue_slots(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  total_price numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','rejected','completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (ends_at > starts_at)
);

alter table public.bookings add constraint bookings_no_overlap
exclude using gist (
  venue_id with =,
  tstzrange(starts_at, ends_at, '[)') with &&
) where (deleted_at is null and status in ('pending','confirmed','completed'));

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entity_type text not null check (entity_type in ('team','competition','venue','player','article')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id, entity_type, entity_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'system',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  sport_id uuid references public.sports(id) on delete set null,
  region_id uuid references public.regions(id) on delete set null,
  city_id uuid references public.cities(id) on delete set null,
  title_ar text not null,
  title_en text,
  slug text not null unique,
  summary_ar text,
  body_ar text not null,
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  article_id uuid references public.articles(id) on delete cascade,
  url text not null,
  media_type text not null check (media_type in ('image','video','document')),
  alt_ar text,
  alt_en text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_cities_region on public.cities(region_id) where deleted_at is null;
create index idx_neighborhoods_city on public.neighborhoods(city_id) where deleted_at is null;
create index idx_competitions_scope on public.competitions(sport_id, region_id, city_id) where deleted_at is null;
create index idx_teams_geo on public.teams(sport_id, city_id, neighborhood_id) where deleted_at is null;
create index idx_memberships_team on public.team_memberships(team_id) where deleted_at is null;
create index idx_venues_geo on public.venues(city_id, neighborhood_id, status) where deleted_at is null;
create index idx_venue_slots_lookup on public.venue_slots(venue_id, starts_at, status) where deleted_at is null;
create index idx_matches_schedule on public.matches(starts_at, status, sport_id) where deleted_at is null;
create index idx_matches_competition on public.matches(competition_id, season_id) where deleted_at is null;
create index idx_events_match on public.match_events(match_id, minute);
create index idx_bookings_user on public.bookings(user_id, starts_at) where deleted_at is null;
create index idx_articles_publish on public.articles(status, published_at desc) where deleted_at is null;
create index idx_notifications_user on public.notifications(user_id, read_at, created_at desc);
create index idx_audit_entity on public.audit_logs(entity_type, entity_id, created_at desc);

create trigger set_sports_updated_at before update on public.sports for each row execute function public.set_updated_at();
create trigger set_regions_updated_at before update on public.regions for each row execute function public.set_updated_at();
create trigger set_cities_updated_at before update on public.cities for each row execute function public.set_updated_at();
create trigger set_neighborhoods_updated_at before update on public.neighborhoods for each row execute function public.set_updated_at();
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_competitions_updated_at before update on public.competitions for each row execute function public.set_updated_at();
create trigger set_seasons_updated_at before update on public.seasons for each row execute function public.set_updated_at();
create trigger set_teams_updated_at before update on public.teams for each row execute function public.set_updated_at();
create trigger set_players_updated_at before update on public.players for each row execute function public.set_updated_at();
create trigger set_team_memberships_updated_at before update on public.team_memberships for each row execute function public.set_updated_at();
create trigger set_venues_updated_at before update on public.venues for each row execute function public.set_updated_at();
create trigger set_venue_slots_updated_at before update on public.venue_slots for each row execute function public.set_updated_at();
create trigger set_matches_updated_at before update on public.matches for each row execute function public.set_updated_at();
create trigger set_bookings_updated_at before update on public.bookings for each row execute function public.set_updated_at();
create trigger set_articles_updated_at before update on public.articles for each row execute function public.set_updated_at();

alter table public.sports enable row level security;
alter table public.regions enable row level security;
alter table public.cities enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.competitions enable row level security;
alter table public.seasons enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.team_memberships enable row level security;
alter table public.venues enable row level security;
alter table public.venue_facilities enable row level security;
alter table public.venue_slots enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;
alter table public.lineups enable row level security;
alter table public.standings enable row level security;
alter table public.bookings enable row level security;
alter table public.favorites enable row level security;
alter table public.notifications enable row level security;
alter table public.articles enable row level security;
alter table public.media_assets enable row level security;
alter table public.audit_logs enable row level security;

create policy public_read_sports on public.sports for select using (deleted_at is null and is_active = true);
create policy public_read_geo_regions on public.regions for select using (deleted_at is null);
create policy public_read_geo_cities on public.cities for select using (deleted_at is null);
create policy public_read_geo_neighborhoods on public.neighborhoods for select using (deleted_at is null);
create policy public_read_competitions on public.competitions for select using (deleted_at is null and is_active = true);
create policy public_read_seasons on public.seasons for select using (deleted_at is null);
create policy public_read_teams on public.teams for select using (deleted_at is null);
create policy public_read_players on public.players for select using (deleted_at is null);
create policy public_read_venues on public.venues for select using (deleted_at is null and status = 'approved');
create policy public_read_slots on public.venue_slots for select using (deleted_at is null and status = 'available');
create policy public_read_matches on public.matches for select using (deleted_at is null);
create policy public_read_match_events on public.match_events for select using (true);
create policy public_read_lineups on public.lineups for select using (true);
create policy public_read_standings on public.standings for select using (true);
create policy public_read_published_articles on public.articles for select using (deleted_at is null and status = 'published');
create policy public_read_media on public.media_assets for select using (deleted_at is null);

create policy users_read_own_profile on public.profiles for select using (auth.uid() = id);
create policy users_update_own_profile on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy users_read_own_bookings on public.bookings for select using (auth.uid() = user_id);
create policy users_create_own_bookings on public.bookings for insert with check (auth.uid() = user_id);
create policy users_update_own_pending_bookings on public.bookings for update using (auth.uid() = user_id and status = 'pending') with check (auth.uid() = user_id);
create policy users_manage_own_favorites on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy users_read_own_notifications on public.notifications for select using (auth.uid() = user_id);
create policy users_update_own_notifications on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy owners_read_own_venues on public.venues for select using (auth.uid() = owner_id);
create policy owners_update_own_venues on public.venues for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy owners_read_own_venue_bookings on public.bookings for select using (
  exists (select 1 from public.venues v where v.id = bookings.venue_id and v.owner_id = auth.uid())
);

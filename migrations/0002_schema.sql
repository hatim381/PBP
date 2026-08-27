-- PBP Concours — club-level shared schema
-- Tournament data is owned by the association, not a single user.
-- club_members maps authenticated users to roles.

create table if not exists club_members (
  user_id      text primary key,
  role         text not null default 'player'
               check (role in ('admin', 'organizer', 'player')),
  display_name text,
  email        text,
  created_at   timestamptz not null default now()
);

create table if not exists players (
  id              text primary key,
  first_name      text not null,
  last_name       text not null,
  phone           text,
  email           text,
  license_number  text,
  club            text,
  photo_url       text,
  status          text not null default 'active'
                  check (status in ('active', 'inactive')),
  user_id         text,
  created_at      timestamptz not null default now()
);

create index if not exists players_name_idx on players (last_name, first_name);
create index if not exists players_license_idx on players (license_number);
create index if not exists players_user_id_idx on players (user_id);

create table if not exists tournaments (
  id                    text primary key,
  name                  text not null,
  description           text,
  date                  date,
  start_time            text,
  venue_name            text,
  address               text,
  court_count           integer not null default 8,
  max_teams             integer not null default 32,
  team_format           text not null default 'doublette'
                        check (team_format in ('tete_a_tete', 'doublette', 'triplette')),
  competition_format    text not null default 'groups_then_knockout',
  group_size            integer not null default 4,
  qualified_per_group   integer not null default 2,
  target_points         integer not null default 13,
  ranking_criteria      text not null default '["wins","head_to_head","point_diff","points_for"]',
  status                text not null default 'draft'
                        check (status in (
                          'draft',
                          'registrations_open',
                          'registrations_closed',
                          'draw_pending',
                          'drawn',
                          'in_progress',
                          'finished',
                          'archived'
                        )),
  rules                 text,
  winner_team_id        text,
  created_by            text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists tournaments_status_idx on tournaments (status);
create index if not exists tournaments_date_idx on tournaments (date);

create table if not exists courts (
  id             text primary key,
  tournament_id  text not null references tournaments(id) on delete cascade,
  name           text not null,
  number         integer not null
);

create index if not exists courts_tournament_idx on courts (tournament_id);

create table if not exists teams (
  id             text primary key,
  tournament_id  text not null references tournaments(id) on delete cascade,
  name           text not null,
  number         integer,
  status         text not null default 'pending'
                 check (status in ('pending', 'validated', 'refused', 'cancelled')),
  created_at     timestamptz not null default now()
);

create index if not exists teams_tournament_idx on teams (tournament_id, status);

create table if not exists team_players (
  team_id    text not null references teams(id) on delete cascade,
  player_id  text not null references players(id) on delete restrict,
  position   integer not null default 1,
  primary key (team_id, player_id)
);

create index if not exists team_players_player_idx on team_players (player_id);

create table if not exists pools (
  id             text primary key,
  tournament_id  text not null references tournaments(id) on delete cascade,
  name           text not null,
  letter         text not null
);

create index if not exists pools_tournament_idx on pools (tournament_id);

create table if not exists pool_teams (
  pool_id  text not null references pools(id) on delete cascade,
  team_id  text not null references teams(id) on delete cascade,
  seed     integer not null default 0,
  primary key (pool_id, team_id)
);

create table if not exists matches (
  id              text primary key,
  tournament_id   text not null references tournaments(id) on delete cascade,
  phase           text not null default 'pool'
                  check (phase in (
                    'pool',
                    'round_of_16',
                    'quarter',
                    'semi',
                    'final',
                    'third'
                  )),
  pool_id         text references pools(id) on delete set null,
  round_index     integer not null default 1,
  bracket_slot    integer,
  team1_id        text references teams(id) on delete set null,
  team2_id        text references teams(id) on delete set null,
  score1          integer,
  score2          integer,
  status          text not null default 'upcoming'
                  check (status in ('upcoming', 'live', 'finished', 'validated')),
  court_id        text references courts(id) on delete set null,
  scheduled_at    text,
  started_at      timestamptz,
  ended_at        timestamptz,
  winner_id       text references teams(id) on delete set null,
  next_match_id   text,
  next_match_slot integer,
  placeholder1    text,
  placeholder2    text
);

create index if not exists matches_tournament_idx on matches (tournament_id, phase, status);
create index if not exists matches_pool_idx on matches (pool_id);

create table if not exists audit_log (
  id          text primary key,
  user_id     text,
  action      text not null,
  entity      text not null,
  entity_id   text,
  details     text,
  created_at  timestamptz not null default now()
);

create index if not exists audit_log_entity_idx on audit_log (entity, entity_id);

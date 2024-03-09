CREATE TABLE IF NOT EXISTS public.users (
  id serial primary key,
  name CHARACTER VARYING(64) NOT NULL, -- Mögulega óþarfi?
  username CHARACTER VARYING(64) NOT NULL unique,
  password CHARACTER VARYING(256) NOT NULL,
  admin BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.teams (
  id serial primary key,
  name varchar(64) not null unique,
  slug varchar(64) not null unique,
  description text not null default 'No description available'
);

CREATE TABLE IF NOT EXISTS public.games (
  id serial primary key,
  date timestamp with time zone not null default current_timestamp,
  home INTEGER NOT NULL,
  away INTEGER NOT NULL,
  home_score INTEGER NOT NULL CHECK (home_score >= 0),
  away_score INTEGER NOT NULL CHECK (away_score >= 0),

  CONSTRAINT fk_teams_home FOREIGN KEY (home) REFERENCES teams (id),
  CONSTRAINT fk_teams_away FOREIGN KEY (away) REFERENCES teams (id)
);
-- Pickamonster database setup. Paste into Supabase's SQL Editor and run it once.

-- Every card in the deck. The art itself lives in Storage, the row keeps its address.
CREATE TABLE cards (
  id serial PRIMARY KEY,
  name text NOT NULL,
  power int NOT NULL CHECK (power BETWEEN 1 AND 100),
  speed int NOT NULL CHECK (speed BETWEEN 1 AND 100),
  charm int NOT NULL CHECK (charm BETWEEN 1 AND 100),
  image_url text NOT NULL,
  image_path text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- One row per finished game.
CREATE TABLE games (
  id serial PRIMARY KEY,
  player_id uuid NOT NULL,
  player_name text NOT NULL,
  result text NOT NULL CHECK (result IN ('win', 'lose', 'draw')),
  rounds int NOT NULL,
  cards_left int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Only our Express server touches these two tables, and it connects as the
-- table owner, so RLS does not get in its way. Turning RLS on with no
-- policies means nobody can read or write them straight from the browser.
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

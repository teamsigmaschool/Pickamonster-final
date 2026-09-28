# Pickamonster

A card battle game. Make a deck of cards with your own art and three stats each, then play it
against the computer. Pick a stat, higher number takes both cards.

React (Vite) in `frontend/`, Express in `backend/`, Supabase for Postgres, Storage and Auth.

## Run it

1. Create a Supabase project. In the SQL Editor, run `backend/setup.sql`.
2. In Storage, create a public bucket called `card-art` (2 MB limit, image types only), then run
   `backend/storage-policies.sql`.
3. In Authentication > Sign In / Providers, allow anonymous sign-ins.
4. Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`,
   and fill them in. `DATABASE_URL` is the Session pooler connection string.
5. In `backend/`: `npm install`, then `npm run dev`.
6. In `frontend/`: `npm install`, then `npm run dev`, and open http://localhost:5173.

You need at least 6 cards to play.

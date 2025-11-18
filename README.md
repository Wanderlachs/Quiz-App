# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Credits

- Questions provided by [Open Trivia DB](https://opentdb.com).

## Global leaderboard (optional)

The quiz can sync its leaderboard to a shared Supabase table. To enable it:

1. Create a Supabase project and a table called `leaderboard` with columns  
   `id` (uuid, default), `name` (text), `difficulty` (text), `score` (int4) and `achieved_at` (timestamptz).  
   Make sure Row Level Security is enabled with insert/select policies that allow anonymous access if this is only for a hobby project.
2. Grab your project URL and anon key from Supabase → Project Settings → API.
3. Create a `.env` (or `.env.local`) file in the project root and add:
   ```
   VITE_SUPABASE_URL=<your-supabase-url>
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   VITE_SUPABASE_LEADERBOARD_TABLE=leaderboard # optional if you kept the default name
   ```
4. Restart the dev server (`npm run dev`). The app now fetches and stores leaderboard entries through Supabase. If no env vars are set, the app falls back to the local browser leaderboard.

# KGC multi-branch site
1. `npm install`, copy `.env.example` to `.env.local`, fill the values.
2. Supabase: run `supabase/schema.sql` in the SQL editor.
3. Paystack: set webhook URL to `https://YOUR-SITE/api/paystack/webhook`.
4. Vercel: import repo, add the same env vars, deploy.

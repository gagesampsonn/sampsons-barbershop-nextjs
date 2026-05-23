# Sampson's Barbershop

Public site: **https://sampsonsbarbershop.com**  
Admin panel: **https://sampsonsbarbershop.com/admin**

Next.js site with Supabase for editable hours, holiday closures, and service pricing.

## Admin setup

1. In [Supabase](https://supabase.com) → SQL Editor, run migrations in `supabase/migrations/` (in order).
2. Create an admin user: Authentication → Users → Add user (email + password).
3. In Vercel project settings → Environment Variables, set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_EMAIL_ALLOWLIST` (comma-separated admin emails, e.g. `brian@example.com`)
4. Redeploy.

After signing in at `/admin`, you can update prices, weekly hours, and holiday exceptions. Square sales data is under **Square Data** in the dashboard (`/admin/analytics`). Changes appear on the site within about 60 seconds.

## Local development

```bash
npm install
cp .env.example .env.local
# Fill in Supabase keys and ADMIN_EMAIL_ALLOWLIST
npm run dev
```

## Update beard trim to $10 (one-time SQL)

If the live site still shows $8 for beard trim, run in Supabase SQL Editor:

```sql
UPDATE services SET price = 10.00, updated_at = now() WHERE name ILIKE '%beard trim%';
```

Or edit **Beard Trim** in the admin dashboard under Service Pricing.

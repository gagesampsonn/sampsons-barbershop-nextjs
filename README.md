# Sampson's Barbershop Website

A modern barbershop website built with Next.js, Tailwind CSS, and Supabase.

## Features

- 🎨 Beautiful dark theme with barbershop aesthetic
- 📱 Fully responsive design
- ⏰ Dynamic hours display from database
- 🎄 Holiday/special hours management
- 🔐 Admin panel for managing hours
- 🔄 Auto-updating public site (revalidates every 60 seconds)

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Icons:** Lucide React
- **Toasts:** Sonner

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Access (comma-separated list of allowed admin emails)
ADMIN_EMAIL_ALLOWLIST=admin@example.com,owner@sampsonsbarbershop.com
```

## Supabase Setup

### 1. Create a new Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run the database migration

In the Supabase SQL Editor, run the contents of:
```
supabase/migrations/001_create_tables.sql
```

This will:
- Create `weekly_hours` table
- Create `hour_exceptions` table
- Set up Row Level Security (RLS) policies
- Insert default weekly hours

### 3. Create an admin user

In Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter email and password
4. Add this email to your `ADMIN_EMAIL_ALLOWLIST` env var

### 4. Configure authentication

In Supabase Dashboard:
1. Go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled

## Database Schema

### weekly_hours
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| day_of_week | INTEGER | 0-6 (0=Sunday) |
| is_closed | BOOLEAN | Whether closed that day |
| open_time | TIME | Opening time |
| close_time | TIME | Closing time |
| updated_at | TIMESTAMPTZ | Last update time |

### hour_exceptions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| date | DATE | The exception date (unique) |
| type | TEXT | 'closed' or 'modified' |
| open_time | TIME | Open time (if modified) |
| close_time | TIME | Close time (if modified) |
| label | TEXT | Holiday/event name |
| notes | TEXT | Optional notes |
| updated_at | TIMESTAMPTZ | Last update time |

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The site will auto-deploy on every push to main.

## Admin Panel

Access the admin panel at `/admin`:
- Login with an email from the `ADMIN_EMAIL_ALLOWLIST`
- Edit weekly hours (open/close times, closed days)
- Add/edit/delete holiday exceptions
- Changes save to database and update public site within 60 seconds

## Security

- Supabase Row Level Security (RLS) enabled
- Only authenticated users can modify data
- Admin email allowlist checked server-side
- Service key never exposed to client

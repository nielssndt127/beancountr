# Beancountr

Money clarity for UK freelancers. Track hours, manage expenses, send invoices, and always know what to set aside for tax and pension.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Environment variables

Copy `.env.local` and fill in your values:

```env
DATABASE_URL=                          # Supabase connection string (with pgbouncer)
DIRECT_URL=                            # Supabase direct connection string
NEXT_PUBLIC_SUPABASE_URL=              # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=         # Your Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=             # Your Supabase service role key
RESEND_API_KEY=                        # Resend for email (optional in MVP)
STRIPE_SECRET_KEY=                     # Stripe (optional in MVP)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=    # Stripe (optional in MVP)
STRIPE_WEBHOOK_SECRET=                 # Stripe (optional in MVP)
```

## Supabase setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > Database to get your connection strings
3. Enable Email auth under Authentication > Providers
4. Copy your project URL and anon key from Settings > API

## Local development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed demo data
npx prisma db seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Prisma commands

```bash
npx prisma generate        # Regenerate client after schema changes
npx prisma db push         # Push schema changes to database
npx prisma db seed         # Run seed file
npx prisma studio          # Open Prisma Studio GUI
npx prisma migrate reset   # Reset database and re-seed
```

## Vercel deployment

1. Push to GitHub
2. Import the repository in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

## Known limitations (MVP)

- No receipt uploads
- No bank feed integration
- No VAT return calculations
- No recurring invoices
- Basic tax estimates only — not formal tax advice
- Single user per account (no team support)

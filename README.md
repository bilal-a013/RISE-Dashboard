# RISE Dashboard

RISE Dashboard is a Supabase-backed tutor/admin prototype for RISE Tutoring: rough tutor notes in, polished parent report out.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

## Environment

Required:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Do not commit real Supabase credentials.

## Supabase setup

Run `supabase-schema.sql` in the Supabase SQL editor. It creates:

- `profiles`
- `students`
- `sessions`
- `reports`
- `parent_replies`

It also enables Row Level Security so tutors can only read/write their own profiles, students, sessions, reports, and future parent replies.

## Routes

- `/auth/login` - Supabase email/password login and signup
- `/dashboard` - protected dashboard insights and student cards
- `/students` - protected saved students list
- `/students/new` - protected child profile create/edit form
- `/sessions/new/[childId]` - protected quick session log
- `/reports` - protected reports dashboard with Tutor Key search
- `/reports/[reportId]` - protected parent-facing report preview

## Notes

- Google OAuth is marked Coming Soon until OAuth is configured in Supabase.
- Reports currently open a local email draft for sending.
- Parent email replies are future work; see `docs/gmail-integration.md`.

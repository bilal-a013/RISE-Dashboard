# RISE Tutoring Session Report Generator

This is a full-featured RISE Tutoring prototype for the tutor/admin flow: rough tutor notes in, polished parent report out.

## What it does

- Mock tutor login and dashboard
- Child profile creation with Tutor Key generation
- Tutor Key access to reload a child profile
- Fast session logging with rough notes, chips, selectors, and ratings
- Deterministic parent report generation
- Local storage persistence, structured for future Supabase or Firebase integration

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the app:

```bash
http://localhost:3001
```

## How to use it

1. Visit `/auth/login` and submit the mock login form.
2. Use `/dashboard` to view seeded child profiles.
3. Use `/students/new` to create a child profile and generate a Tutor Key.
4. Use `/tutor-key` with `RISE-AK47` to load Ayaan Khan.
5. Use `/sessions/new/ayaan-khan` to log a session quickly.
6. Click `Generate Parent Report` to create a report and navigate to `/reports/:reportId`.
7. Use the collapsed JSON metadata on the report page when you need the structured payload.

## Routes

- `/auth/login`
- `/dashboard`
- `/students/new`
- `/tutor-key`
- `/sessions/new/[childId]`
- `/reports/[reportId]`

## Key files

- `types/rise.ts` - core Tutor, ChildProfile, SessionLog, and ParentReport types
- `lib/mockRiseData.ts` - seeded local mock data
- `lib/reportGenerator.ts` - deterministic parent report generator
- `lib/localStorageStore.ts` - local mock persistence
- `lib/supabase.ts` - optional Supabase client
- `components/rise/*` - shared RISE UI components
- `app/*` - app-router pages
- `app/layout.tsx` - document shell and metadata
- `app/globals.css` - base styles and print styles

## Supabase

If you want the save actions to sync to Supabase, add:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The prototype will continue to work locally if these are not set.

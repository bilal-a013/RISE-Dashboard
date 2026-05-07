create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text default 'tutor',
  created_at timestamp with time zone default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  preferred_name text,
  age int,
  education_stage text,
  year_group text,
  pronouns text,
  school text,
  subjects text[] default '{}',
  exam_board text,
  current_grade text,
  target_grade text,
  goals text,
  strengths text[] default '{}',
  struggles text[] default '{}',
  current_topics text[] default '{}',
  learning_style text,
  main_learning_priority text,
  parent_name text,
  parent_relationship text,
  parent_email text,
  parent_phone text,
  parent_report_preference text,
  current_homework text,
  homework_due_date date,
  homework_status text,
  session_frequency text,
  long_term_target text,
  next_session_focus text,
  tutor_notes text,
  tutor_key text unique not null,
  status text default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table students add column if not exists education_stage text;
alter table students add column if not exists full_name text;
alter table students add column if not exists preferred_name text;
alter table students add column if not exists age int;
alter table students add column if not exists year_group text;
alter table students add column if not exists pronouns text;
alter table students add column if not exists school text;
alter table students add column if not exists subjects text[] default '{}';
alter table students add column if not exists exam_board text;
alter table students add column if not exists current_grade text;
alter table students add column if not exists target_grade text;
alter table students add column if not exists goals text;
alter table students add column if not exists strengths text[] default '{}';
alter table students add column if not exists struggles text[] default '{}';
alter table students add column if not exists current_topics text[] default '{}';
alter table students add column if not exists learning_style text;
alter table students add column if not exists main_learning_priority text;
alter table students add column if not exists parent_name text;
alter table students add column if not exists parent_relationship text;
alter table students add column if not exists parent_email text;
alter table students add column if not exists parent_phone text;
alter table students add column if not exists parent_report_preference text;
alter table students add column if not exists current_homework text;
alter table students add column if not exists homework_due_date date;
alter table students add column if not exists homework_status text;
alter table students add column if not exists session_frequency text;
alter table students add column if not exists long_term_target text;
alter table students add column if not exists next_session_focus text;
alter table students add column if not exists tutor_notes text;
alter table students add column if not exists tutor_key text;
alter table students add column if not exists status text default 'active';
alter table students add column if not exists created_at timestamp with time zone default now();
alter table students add column if not exists updated_at timestamp with time zone default now();

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  tutor_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null,
  subject text,
  topic text,
  summary text,
  strengths text[] default '{}',
  struggles text[] default '{}',
  homework text,
  next_steps text,
  understanding_level text,
  effort_rating int,
  confidence_rating int,
  session_focus text[] default '{}',
  key_skill text,
  report_tone text,
  include_in_report text[] default '{}',
  created_at timestamp with time zone default now()
);

alter table sessions add column if not exists understanding_level text;
alter table sessions add column if not exists effort_rating int;
alter table sessions add column if not exists confidence_rating int;
alter table sessions add column if not exists session_focus text[] default '{}';
alter table sessions add column if not exists key_skill text;
alter table sessions add column if not exists report_tone text;
alter table sessions add column if not exists include_in_report text[] default '{}';

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  tutor_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  title text not null,
  body text,
  report_sections jsonb default '{}'::jsonb,
  sent_status text default 'draft',
  sent_to text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table reports add column if not exists report_sections jsonb default '{}'::jsonb;

create table if not exists parent_replies (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  report_id uuid references reports(id) on delete set null,
  parent_email text,
  subject text,
  body text,
  received_at timestamp with time zone default now(),
  gmail_thread_id text
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table profiles enable row level security;
alter table students enable row level security;
alter table sessions enable row level security;
alter table reports enable row level security;
alter table parent_replies enable row level security;

drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile"
on profiles for select
using (id = auth.uid());

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
on profiles for insert
with check (id = auth.uid());

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
on profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Tutors can read own students" on students;
create policy "Tutors can read own students"
on students for select
using (tutor_id = auth.uid());

drop policy if exists "Tutors can insert own students" on students;
create policy "Tutors can insert own students"
on students for insert
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can update own students" on students;
create policy "Tutors can update own students"
on students for update
using (tutor_id = auth.uid())
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can delete own students" on students;
create policy "Tutors can delete own students"
on students for delete
using (tutor_id = auth.uid());

drop policy if exists "Tutors can read own sessions" on sessions;
create policy "Tutors can read own sessions"
on sessions for select
using (tutor_id = auth.uid());

drop policy if exists "Tutors can insert own sessions" on sessions;
create policy "Tutors can insert own sessions"
on sessions for insert
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can update own sessions" on sessions;
create policy "Tutors can update own sessions"
on sessions for update
using (tutor_id = auth.uid())
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can delete own sessions" on sessions;
create policy "Tutors can delete own sessions"
on sessions for delete
using (tutor_id = auth.uid());

drop policy if exists "Tutors can read own reports" on reports;
create policy "Tutors can read own reports"
on reports for select
using (tutor_id = auth.uid());

drop policy if exists "Tutors can insert own reports" on reports;
create policy "Tutors can insert own reports"
on reports for insert
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can update own reports" on reports;
create policy "Tutors can update own reports"
on reports for update
using (tutor_id = auth.uid())
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can delete own reports" on reports;
create policy "Tutors can delete own reports"
on reports for delete
using (tutor_id = auth.uid());

drop policy if exists "Tutors can read own parent replies" on parent_replies;
create policy "Tutors can read own parent replies"
on parent_replies for select
using (
  exists (
    select 1
    from students
    where students.id = parent_replies.student_id
      and students.tutor_id = auth.uid()
  )
);

create index if not exists students_tutor_id_idx on students(tutor_id);
create unique index if not exists students_tutor_key_unique_idx on students(tutor_key);
create index if not exists sessions_tutor_id_idx on sessions(tutor_id);
create index if not exists sessions_student_id_idx on sessions(student_id);
create index if not exists reports_tutor_id_idx on reports(tutor_id);
create index if not exists reports_student_id_idx on reports(student_id);

drop trigger if exists set_students_updated_at on students;
create trigger set_students_updated_at
before update on students
for each row execute function set_updated_at();

create table if not exists child_profiles (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid references auth.users(id) on delete cascade,
  full_name text,
  year_group text,
  age_range text,
  working_level text,
  target_grade text,
  preferred_subject text default 'maths',
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists tutor_keys (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  key_hash text unique not null,
  key_display text,
  status text default 'active',
  last_used_at timestamp with time zone,
  revoked_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table child_profiles add column if not exists tutor_id uuid references auth.users(id) on delete cascade;
alter table child_profiles add column if not exists full_name text;
alter table child_profiles add column if not exists year_group text;
alter table child_profiles add column if not exists age_range text;
alter table child_profiles add column if not exists working_level text;
alter table child_profiles add column if not exists target_grade text;
alter table child_profiles add column if not exists preferred_subject text default 'maths';
alter table child_profiles add column if not exists active boolean default true;
alter table child_profiles add column if not exists created_at timestamp with time zone default now();
alter table child_profiles add column if not exists updated_at timestamp with time zone default now();

alter table tutor_keys add column if not exists child_profile_id uuid references child_profiles(id) on delete cascade;
alter table tutor_keys add column if not exists key_hash text;
alter table tutor_keys add column if not exists key_display text;
alter table tutor_keys add column if not exists status text default 'active';
alter table tutor_keys add column if not exists last_used_at timestamp with time zone;
alter table tutor_keys add column if not exists revoked_at timestamp with time zone;
alter table tutor_keys add column if not exists created_at timestamp with time zone default now();

alter table child_profiles enable row level security;
alter table tutor_keys enable row level security;

create unique index if not exists tutor_keys_key_hash_unique_idx on tutor_keys(key_hash);
create index if not exists tutor_keys_child_profile_id_idx on tutor_keys(child_profile_id);
create unique index if not exists tutor_keys_one_current_per_child_idx on tutor_keys(child_profile_id) where revoked_at is null;
create index if not exists child_profiles_tutor_id_idx on child_profiles(tutor_id);

grant select, insert, update, delete on child_profiles to authenticated;
grant select, insert, update, delete on tutor_keys to authenticated;

drop policy if exists "Tutors can read own child profiles" on child_profiles;
create policy "Tutors can read own child profiles"
on child_profiles for select
using (tutor_id = auth.uid());

drop policy if exists "Tutors can insert own child profiles" on child_profiles;
create policy "Tutors can insert own child profiles"
on child_profiles for insert
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can update own child profiles" on child_profiles;
create policy "Tutors can update own child profiles"
on child_profiles for update
using (tutor_id = auth.uid())
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can delete own child profiles" on child_profiles;
create policy "Tutors can delete own child profiles"
on child_profiles for delete
using (tutor_id = auth.uid());

drop policy if exists "Tutors can read own tutor keys" on tutor_keys;
create policy "Tutors can read own tutor keys"
on tutor_keys for select
using (
  exists (
    select 1
    from child_profiles
    where child_profiles.id = tutor_keys.child_profile_id
      and child_profiles.tutor_id = auth.uid()
  )
);

drop policy if exists "Tutors can insert own tutor keys" on tutor_keys;
create policy "Tutors can insert own tutor keys"
on tutor_keys for insert
with check (
  exists (
    select 1
    from child_profiles
    where child_profiles.id = tutor_keys.child_profile_id
      and child_profiles.tutor_id = auth.uid()
  )
);

drop policy if exists "Tutors can update own tutor keys" on tutor_keys;
create policy "Tutors can update own tutor keys"
on tutor_keys for update
using (
  exists (
    select 1
    from child_profiles
    where child_profiles.id = tutor_keys.child_profile_id
      and child_profiles.tutor_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from child_profiles
    where child_profiles.id = tutor_keys.child_profile_id
      and child_profiles.tutor_id = auth.uid()
  )
);

drop policy if exists "Tutors can delete own tutor keys" on tutor_keys;
create policy "Tutors can delete own tutor keys"
on tutor_keys for delete
using (
  exists (
    select 1
    from child_profiles
    where child_profiles.id = tutor_keys.child_profile_id
      and child_profiles.tutor_id = auth.uid()
  )
);

insert into child_profiles (
  id,
  tutor_id,
  full_name,
  year_group,
  age_range,
  working_level,
  target_grade,
  preferred_subject,
  active,
  created_at,
  updated_at
)
select
  students.id,
  students.tutor_id,
  students.full_name,
  students.year_group,
  students.age::text,
  students.current_grade,
  students.target_grade,
  lower(coalesce(
    (
      select subject
      from unnest(coalesce(students.subjects, '{}'::text[])) as subject
      where subject ilike '%math%'
      limit 1
    ),
    students.subjects[1],
    'maths'
  )),
  coalesce(students.status, 'active') = 'active',
  coalesce(students.created_at, now()),
  coalesce(students.updated_at, now())
from students
on conflict (id) do update
set
  tutor_id = excluded.tutor_id,
  full_name = excluded.full_name,
  year_group = excluded.year_group,
  age_range = excluded.age_range,
  working_level = excluded.working_level,
  target_grade = excluded.target_grade,
  preferred_subject = excluded.preferred_subject,
  active = excluded.active,
  updated_at = excluded.updated_at;

insert into tutor_keys (
  child_profile_id,
  key_hash,
  key_display,
  status,
  created_at
)
select
  students.id,
  encode(digest(upper(regexp_replace(trim(students.tutor_key), '\s+', '-', 'g')), 'sha256'), 'hex'),
  upper(regexp_replace(trim(students.tutor_key), '\s+', '-', 'g')),
  case when coalesce(students.status, 'active') = 'active' then 'active' else 'inactive' end,
  coalesce(students.created_at, now())
from students
where students.tutor_key is not null
on conflict (child_profile_id) where revoked_at is null do update
set
  key_hash = excluded.key_hash,
  key_display = excluded.key_display,
  status = excluded.status;

drop trigger if exists set_child_profiles_updated_at on child_profiles;
create trigger set_child_profiles_updated_at
before update on child_profiles
for each row execute function set_updated_at();

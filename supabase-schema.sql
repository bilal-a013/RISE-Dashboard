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
  parent_name text,
  parent_relationship text,
  parent_email text,
  parent_phone text,
  parent_report_preference text,
  current_homework text,
  homework_due_date date,
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
alter table students add column if not exists parent_name text;
alter table students add column if not exists parent_relationship text;
alter table students add column if not exists parent_email text;
alter table students add column if not exists parent_phone text;
alter table students add column if not exists parent_report_preference text;
alter table students add column if not exists current_homework text;
alter table students add column if not exists homework_due_date date;
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
  created_at timestamp with time zone default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  tutor_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  title text not null,
  body text,
  sent_status text default 'draft',
  sent_to text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

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

-- Reservas directas (estadías cortas) y sus correos automáticos.
-- Ejecutar una vez en Supabase → SQL Editor → Run.

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties (id) on delete set null,
  property_code text not null default '',
  property_title text not null default '',
  check_in date not null,
  check_out date not null,
  guests integer,
  name text not null default '',
  phone text not null default '',
  email text not null default '',
  message text not null default '',
  status text not null default 'pendiente' check (status in ('pendiente', 'pagada', 'cancelada')),
  source text not null default 'web' check (source in ('web', 'manual')),
  amount text not null default '',
  guest_note text not null default '',
  paid_at timestamptz,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in)
);

create index if not exists reservations_check_in_idx on reservations (check_in);
create index if not exists reservations_property_idx on reservations (property_id, status);

alter table reservations enable row level security;

-- Esquema de base de datos para Supabase.
-- Pegar completo en Supabase → SQL Editor → Run.

create extension if not exists "pgcrypto";

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  operation text not null default 'arriendo' check (operation in ('venta', 'arriendo')),
  price text not null default '',
  sector text not null default '',
  address text not null default '',
  bedrooms numeric,
  bathrooms numeric,
  area_m2 numeric,
  brief text not null default '',
  ad_ids text[] not null default '{}',
  links text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('whatsapp', 'instagram', 'messenger')),
  external_id text not null,
  contact_name text not null default '',
  property_id uuid references properties(id) on delete set null,
  property_source text check (property_source in ('aviso', 'codigo', 'ia', 'manual')),
  property_confidence text check (property_confidence in ('alta', 'media', 'baja')),
  status text not null default 'nuevo'
    check (status in ('nuevo', 'respondido', 'visita', 'cerrado', 'descartado')),
  referral_ad_id text,
  referral_text text,
  draft jsonb,
  notes text not null default '',
  last_customer_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel, external_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  direction text not null check (direction in ('in', 'out')),
  text text not null,
  created_at timestamptz not null default now(),
  send_status text check (send_status in ('enviado', 'simulado', 'error')),
  send_error text
);

create index if not exists messages_conversation_idx on messages (conversation_id, created_at);
create index if not exists conversations_updated_idx on conversations (updated_at desc);

-- La app accede con la service role key desde el servidor.
-- Se activa RLS sin políticas para bloquear cualquier acceso con la clave pública.
alter table properties enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

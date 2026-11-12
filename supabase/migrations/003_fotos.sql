-- Fotos de propiedades.
-- Ejecutar una vez en Supabase → SQL Editor → Run.

alter table properties add column if not exists photos jsonb not null default '[]';

-- Espacio público para las fotos (la app también lo crea sola si no existe).
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

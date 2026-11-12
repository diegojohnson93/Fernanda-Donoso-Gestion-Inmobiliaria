-- Ficha base: modalidades (Airbnb, año corrido, marzo a diciembre, venta),
-- campos estructurados y notas privadas.
-- Ejecutar una vez en Supabase → SQL Editor → Run.

alter table properties add column if not exists modalities text[] not null default '{}';
alter table properties add column if not exists details jsonb not null default '{}';
alter table properties add column if not exists private_notes text not null default '';

-- Las columnas antiguas "operation" y "price" quedan en desuso.
-- Se pasan a la ficha nueva las propiedades que ya existían.
update properties
set
  modalities = case when operation = 'venta' then array['venta'] else array['anual'] end,
  details = details || case
    when operation = 'venta' and price <> '' then jsonb_build_object('precio_venta', price)
    when price <> '' then jsonb_build_object('canon_anual', price)
    else '{}'::jsonb
  end
where modalities = '{}';

alter table properties alter column operation drop not null;

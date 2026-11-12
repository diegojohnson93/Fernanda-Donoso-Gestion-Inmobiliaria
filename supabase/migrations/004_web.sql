-- Web pública y formularios.
-- Ejecutar una vez en Supabase → SQL Editor → Run.

-- Publicación de propiedades en la web
alter table properties add column if not exists published boolean not null default false;
alter table properties add column if not exists featured boolean not null default false;
alter table properties add column if not exists show_address boolean not null default false;
alter table properties add column if not exists web_description text not null default '';

-- Datos de contacto dejados en formularios web
alter table conversations add column if not exists contact_phone text;
alter table conversations add column if not exists contact_email text;

-- Nuevo canal "web" y nuevos valores permitidos
alter table conversations drop constraint if exists conversations_channel_check;
alter table conversations add constraint conversations_channel_check
  check (channel in ('whatsapp', 'instagram', 'messenger', 'web'));

alter table conversations drop constraint if exists conversations_property_source_check;
alter table conversations add constraint conversations_property_source_check
  check (property_source in ('aviso', 'codigo', 'ia', 'manual', 'web'));

alter table messages drop constraint if exists messages_send_status_check;
alter table messages add constraint messages_send_status_check
  check (send_status in ('enviado', 'simulado', 'manual', 'error'));

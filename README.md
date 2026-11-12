# Fernanda Donoso · Gestión Inmobiliaria — Bandeja de mensajes con IA

Bandeja única para los mensajes de **WhatsApp, Instagram y Facebook Messenger**.
Cada mensaje entrante recibe un **borrador de respuesta hecho por IA** con la ficha de la
propiedad por la que preguntan. Fernanda lo revisa, lo corrige si quiere y lo **aprueba**.
La IA nunca envía nada sola.

## Qué hace

- **Bandeja unificada**: filtros por canal y estado, búsqueda, y un aviso con el tiempo que
  queda de la ventana de 24 h para responder.
- **Ficha base de propiedades**: se llena una vez por propiedad. Tiene un código (p. ej.
  `REN-01`), una o más **modalidades** (Arriendo Airbnb, Arriendo año corrido, Arriendo marzo
  a diciembre, Venta) y una sección de campos para cada modalidad elegida. Al subir un
  **PDF**, la IA lo lee y completa los campos vacíos. Incluye **notas privadas** que la IA
  nunca ve (precio mínimo del dueño, comisión, etc.).
- **Fotos en la ficha**: subida múltiple (arrastrando o desde el celular), compresión
  automática a 2000 px, orden arrastrando y elección de portada. Se guardan en el bucket
  público `fotos` de Supabase Storage; al quitar una foto de la ficha se borra del almacenamiento. Los campos se definen en
  [`src/lib/ficha.ts`](src/lib/ficha.ts): agregar uno nuevo es sumar una línea ahí.
- **Detección de la propiedad**, en este orden:
  1. Lo que Fernanda eligió a mano (siempre manda).
  2. El **aviso de Meta** desde donde escribió el cliente (IDs vinculados en la ficha).
  3. El **código** que el cliente escribió en su mensaje (`REN-01`, `ren 01`, `REN01`).
  4. Si no hay nada de lo anterior, la **IA lo deduce** de la conversación. Si no está segura,
     el borrador le pregunta al cliente por cuál propiedad consulta.
- **Borradores honestos**: la IA solo usa la ficha. Lo que la ficha no dice lo marca como
  "falta en la ficha" en vez de inventarlo.
- **Mini CRM**: estados (nuevo, respondido, visita agendada, cerrado, descartado) y notas
  internas, que la IA también lee.
- **Simulador**: crea mensajes de prueba en cualquier canal para probar sin conectar Meta.

## Modos de funcionamiento

Funciona **sin configurar nada** (modo demo) y se va activando por partes:

| Variable(s) | Sin configurar | Configurada |
|---|---|---|
| `APP_PASSWORD` | Cualquiera con el link entra | Pide contraseña |
| `ANTHROPIC_API_KEY` | Borradores de plantilla simples | Borradores con IA (Claude) y lectura de PDF |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Datos en memoria (se reinician) | Base de datos permanente |
| `WHATSAPP_*`, `META_PAGE_ACCESS_TOKEN` | Envíos simulados | Envíos reales |

Todas las variables están descritas en [`.env.example`](.env.example).

## Probarlo en tu computador

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Para usar la IA, crea un archivo `.env.local` con
`ANTHROPIC_API_KEY=...`.

## Publicar en Vercel (gratis para empezar)

1. Entra a [vercel.com](https://vercel.com) con tu cuenta de GitHub.
2. **Add New → Project**, elige este repositorio y presiona **Deploy**. En un minuto queda
   publicado en una dirección del tipo `https://<proyecto>.vercel.app`.
3. En **Settings → Environment Variables** agrega al menos `APP_PASSWORD` y
   `ANTHROPIC_API_KEY` (la clave se crea en [console.anthropic.com](https://console.anthropic.com)).
   Luego ve a **Deployments → Redeploy** para que tomen efecto.

Cada cambio que se suba a GitHub se publica solo.

## Base de datos permanente (Supabase)

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En **SQL Editor** pega y ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql).
3. En **Project Settings → API** copia la *Project URL* y la *service_role key*, y agrégalas
   en Vercel como `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Redeploy.

> La base parte vacía: crea las propiedades reales desde la pestaña **Propiedades**.

**Actualizaciones de la base:** si la base se creó con una versión anterior de `schema.sql`,
ejecuta en el SQL Editor los archivos de [`supabase/migrations/`](supabase/migrations) que
aún no hayas corrido, en orden. Una base creada con el `schema.sql` actual no los necesita.

## Conectar WhatsApp, Instagram y Messenger (Meta)

Requisitos previos:

- Portafolio comercial en Meta Business verificado.
- Cuenta de Instagram **profesional** vinculada a la página de Facebook.
- Un número de teléfono para la API de WhatsApp.

Pasos:

1. En [developers.facebook.com](https://developers.facebook.com) crea una app de tipo
   **Business** y agrega los productos **WhatsApp**, **Messenger** e **Instagram**.
2. **Webhook** (es el mismo para los tres canales):
   - URL de callback: `https://<tu-proyecto>.vercel.app/api/webhooks/meta`
   - Token de verificación: el texto que pusiste en `META_VERIFY_TOKEN`.
   - Suscripciones: `messages` en WhatsApp; `messages`, `messaging_postbacks` y
     `messaging_referrals` en Messenger e Instagram.
3. Variables en Vercel:
   - `META_APP_SECRET`: *App settings → Basic → App secret*. Valida que los mensajes vengan de Meta.
   - `WHATSAPP_TOKEN` (token permanente de un *system user*) y `WHATSAPP_PHONE_NUMBER_ID`.
   - `META_PAGE_ACCESS_TOKEN`: token de la página de Facebook (sirve para Messenger e Instagram).
4. **Política de privacidad**: Meta pide una URL pública. La app ya trae una en `/privacidad`.
   Hay que revisar el texto antes de usarlo.
5. Para que funcione con clientes reales (no solo con cuentas de prueba), la app debe pasar la
   **revisión de Meta** con los permisos de mensajería.

### Vincular avisos con propiedades

En cada ficha, en *IDs de avisos de Meta vinculados*, pega el ID del aviso (se ve en el
Administrador de anuncios). Cuando alguien escribe desde un aviso "Click a WhatsApp" o
"Enviar mensaje", Meta manda ese ID y la propiedad se detecta sola.

Para los posts orgánicos, conviene poner el código en el texto
("Escríbenos por DM con el código **REN-01**").

## Reglas de Meta a tener presentes

- **Ventana de 24 h**: solo se puede responder libremente hasta 24 h después del último
  mensaje del cliente. Pasado ese plazo, WhatsApp exige una plantilla aprobada. La bandeja
  muestra el tiempo que queda.
- **Costos de WhatsApp** (desde octubre de 2026): las respuestas se cobran por mensaje después
  de 1.000 gratis al mes por número. Las conversaciones que vienen de avisos "Click a
  WhatsApp" tienen 72 h gratis.
- **IA en WhatsApp**: Meta prohíbe los chatbots de propósito general, pero permite usar IA en la
  atención de clientes del propio negocio. Este asistente solo responde sobre las propiedades
  y además pasa por aprobación humana.

## Estructura

```
src/
  app/
    page.tsx                 Bandeja
    propiedades/page.tsx     Fichas de propiedades
    login/, privacidad/
    api/
      conversations/         Listar, editar, regenerar borrador, enviar
      properties/            CRUD de fichas y lectura de PDF
      simulate/              Mensajes de prueba
      webhooks/meta/         Entrada de WhatsApp, Messenger e Instagram
  components/                Interfaz (Inbox, Properties, ui)
  lib/
    ai.ts                    Detección de propiedad, borradores y lectura de PDF (Claude)
    meta.ts                  Webhook y envío por la Graph API de Meta
    inbox.ts                 Flujo: recibir → borrador → aprobar y enviar
    store/                   Datos: memoria (demo) o Supabase
  proxy.ts                   Protección con contraseña
supabase/schema.sql          Tablas para Supabase
```

## Próximos pasos posibles

- Plantillas de WhatsApp para retomar conversaciones de más de 24 h.
- Varias usuarias con login propio (Supabase Auth).
- Recordatorios de visitas y seguimiento de leads.
- Sitio web público de propiedades que use estas mismas fichas.

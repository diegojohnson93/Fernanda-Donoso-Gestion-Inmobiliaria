export const metadata = { title: "Política de privacidad · Fernanda Donoso Gestión Inmobiliaria" };

/**
 * Meta exige una URL pública con la política de privacidad para aprobar la app.
 * Revisar y ajustar este texto con un abogado antes de publicarlo.
 */
export default function Privacidad() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6 text-sm leading-relaxed">
      <h1 className="text-xl font-semibold">Política de privacidad</h1>
      <p>
        Fernanda Donoso Gestión Inmobiliaria (“nosotros”) usa esta aplicación para responder
        consultas sobre propiedades recibidas por WhatsApp, Instagram y Facebook Messenger.
      </p>
      <h2 className="font-semibold">Qué datos recibimos</h2>
      <p>
        Tu nombre de perfil, tu identificador o número en la plataforma desde la que nos escribes y
        el contenido de los mensajes que nos envías.
      </p>
      <h2 className="font-semibold">Para qué los usamos</h2>
      <p>
        Exclusivamente para responder tus consultas, coordinar visitas y hacer seguimiento de tu
        interés en una propiedad. Usamos un servicio de inteligencia artificial para preparar
        borradores de respuesta, que siempre son revisados por una persona antes de enviarse.
      </p>
      <h2 className="font-semibold">Con quién los compartimos</h2>
      <p>
        No vendemos ni compartimos tus datos con terceros para fines comerciales. Solo los procesan
        los proveedores tecnológicos necesarios para operar el servicio (Meta, alojamiento web,
        base de datos y el proveedor de IA).
      </p>
      <h2 className="font-semibold">Tus derechos</h2>
      <p>
        Puedes pedir acceso, corrección o eliminación de tus datos escribiéndonos por el mismo
        canal por el que nos contactaste.
      </p>
    </main>
  );
}

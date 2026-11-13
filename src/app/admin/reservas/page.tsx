import { Reservations } from "@/components/Reservations";
import { AppShell } from "@/components/ui";

export const metadata = { title: "Reservas · Fernanda Donoso" };

export default function ReservasPage() {
  return (
    <AppShell>
      <Reservations />
    </AppShell>
  );
}

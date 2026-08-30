import { EstadoProvider } from "@/components/EstadoProvider";
import { AppShell } from "@/components/AppShell";

export default function Home() {
  return (
    <EstadoProvider>
      <AppShell />
    </EstadoProvider>
  );
}

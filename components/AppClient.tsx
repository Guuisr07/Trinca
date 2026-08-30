"use client";

import { EstadoProvider } from "@/components/EstadoProvider";
import { AppShell } from "@/components/AppShell";

export default function AppClient() {
  return (
    <EstadoProvider>
      <AppShell />
    </EstadoProvider>
  );
}

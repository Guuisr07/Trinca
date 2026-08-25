"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { gravarTema, lerTema, type Tema } from "@/lib/tema";

/* O tema real já está no <html> antes do React montar (SCRIPT_TEMA).
   Este componente só espelha e troca — por isso o estado começa nulo e o
   ícone só aparece depois do efeito: renderizar um sol no servidor e uma lua
   no cliente é erro de hidratação garantido. */
export function TrocaTema() {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => setTema(lerTema()), []);

  function trocar() {
    const novo: Tema = tema === "dark" ? "light" : "dark";
    gravarTema(novo);
    setTema(novo);
  }

  const escuro = tema === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={escuro}
      aria-label={escuro ? "Mudar para o tema claro" : "Mudar para o tema escuro"}
      onClick={trocar}
      className="grid size-11 place-items-center rounded-flat border-2 border-line text-muted transition-transform hover:text-ink active:translate-y-0.5"
    >
      {tema === null ? null : escuro ? (
        <Sun className="size-5" aria-hidden />
      ) : (
        <Moon className="size-5" aria-hidden />
      )}
    </button>
  );
}

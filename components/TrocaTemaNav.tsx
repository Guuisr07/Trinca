"use client";

import { useEffect, useState } from "react";
import { gravarTema, lerTema, type Tema } from "@/lib/tema";

export function TrocaTemaNav() {
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
      className="troca-tema"
      role="switch"
      aria-checked={escuro}
      aria-label={escuro ? "Mudar para o tema claro" : "Mudar para o tema escuro"}
      onClick={trocar}
    >
      <span className="trilho"><span className="botao" /></span>
      <i aria-hidden>Tema</i>
    </button>
  );
}

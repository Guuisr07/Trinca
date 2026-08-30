"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Ctx, progressoPadrao, carregarProgresso, salvarProgresso } from "@/lib/estado";
import type { Progresso } from "@/lib/dominio/tipos";

export function EstadoProvider({ children }: { children: ReactNode }) {
  const [progresso, _set] = useState(progressoPadrao);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    _set(carregarProgresso());
    setPronto(true);
  }, []);

  const setProgresso = useCallback(
    (p: Progresso | ((prev: Progresso) => Progresso)) => {
      _set((prev) => {
        const next = typeof p === "function" ? p(prev) : p;
        salvarProgresso(next);
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    const h = () => _set(carregarProgresso());
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

  if (!pronto) return null;

  return <Ctx value={{ progresso, setProgresso }}>{children}</Ctx>;
}

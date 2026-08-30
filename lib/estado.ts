"use client";

import { createContext, useContext } from "react";
import type { Progresso } from "./dominio/tipos.ts";
import { MAX_FICHAS } from "./dominio/fichas.ts";

const CHAVE = "trinca.v1";

export function progressoPadrao(): Progresso {
  return {
    xp: 0, xpHoje: 0, feitas: {}, acertos: 0, erros: 0,
    streak: 1, dia: null, vidas: MAX_FICHAS, gastaEm: null, vip: false,
  };
}

export function carregarProgresso(): Progresso {
  try {
    return Object.assign(progressoPadrao(), JSON.parse(localStorage.getItem(CHAVE) || "{}"));
  } catch {
    return progressoPadrao();
  }
}

export function salvarProgresso(p: Progresso): void {
  try { localStorage.setItem(CHAVE, JSON.stringify(p)); } catch {}
}

export type EstadoContexto = {
  progresso: Progresso;
  setProgresso: (p: Progresso | ((prev: Progresso) => Progresso)) => void;
};

export const Ctx = createContext<EstadoContexto | null>(null);

export function useEstado(): EstadoContexto {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEstado fora do Provider");
  return ctx;
}

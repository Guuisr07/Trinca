/* Fichas: gasto e recarga. Conta de relógio pura — o instante entra por
   parâmetro, nunca por `Date.now()` (ADR-003).

   Nada de timer contando pra baixo: o relógio é o próprio `gastaEm`, o
   instante em que a primeira ficha do lote foi perdida. Quantas voltaram é
   conta de tempo decorrido, feita na hora de ler. Sobrevive a recarregar a
   página, fechar a aba e dormir a máquina — um setInterval não sobreviveria.

   ponytail: `agora` vem do cliente e cliente adianta relógio. Vira `now()` do
   Postgres quando o Trinca+ cobrar (ADR-009). A assinatura já é essa. */

import type { Progresso } from "./tipos.ts";

/** Lote cheio. */
export const MAX_FICHAS = 5;

/** Uma ficha de volta a cada 30 minutos. */
export const RECARGA_MS = 30 * 60 * 1000;

/** Aplica a recarga acumulada até `agora`. Devolve o MESMO objeto quando nada
    mudou — quem chama pode comparar por referência pra evitar repintura. */
export function normalizarFichas(p: Progresso, agora: number): Progresso {
  if (p.vip) return p;
  if (p.vidas >= MAX_FICHAS) return p.gastaEm === null ? p : { ...p, gastaEm: null };
  if (p.gastaEm === null) return p;

  const ganhas = Math.floor((agora - p.gastaEm) / RECARGA_MS);
  if (ganhas <= 0) return p;

  const vidas = Math.min(MAX_FICHAS, p.vidas + ganhas);
  return {
    ...p,
    vidas,
    // sobra do tempo decorrido conta pra próxima ficha, não se perde
    gastaEm: vidas >= MAX_FICHAS ? null : p.gastaEm + ganhas * RECARGA_MS,
  };
}

/** Fichas disponíveis agora, já com a recarga aplicada. */
export function fichasAgora(p: Progresso, agora: number): number {
  return p.vip ? MAX_FICHAS : normalizarFichas(p, agora).vidas;
}

/** Tira uma ficha. Sem efeito no Trinca+, e no zero não fica devendo. */
export function gastarFicha(p: Progresso, agora: number): Progresso {
  if (p.vip) return p;
  const atual = normalizarFichas(p, agora);
  if (atual.vidas <= 0) return atual;
  return {
    ...atual,
    vidas: atual.vidas - 1,
    /* O relógio só começa quando o lote deixa de estar cheio. Reiniciar a cada
       erro faria quem erra cinco vezes seguidas nunca recarregar. */
    gastaEm: atual.vidas >= MAX_FICHAS ? agora : atual.gastaEm,
  };
}

/** Milissegundos até a próxima ficha. 0 quando não há o que esperar. */
export function proximaFichaEm(p: Progresso, agora: number): number {
  if (p.vip) return 0;
  const atual = normalizarFichas(p, agora);
  if (atual.vidas >= MAX_FICHAS || atual.gastaEm === null) return 0;
  return Math.max(0, atual.gastaEm + RECARGA_MS - agora);
}

/** "12:43" ou "1h04" — o que cabe no espaço de um contador. */
export function formatarEspera(ms: number): string {
  const s = Math.ceil(ms / 1000);
  if (s >= 3600) {
    return Math.floor(s / 3600) + "h" + String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  }
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

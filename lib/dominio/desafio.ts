/* Desafio: boss fight ao fim da trilha. Puro: sem React, sem DOM (ADR-003).
   O desafio testa tudo que a trilha ensinou, numa série de cenários contra
   o Dom Naipe. Custa fichas como lição, dá XP bônus. */

import { feita } from "./progresso.ts";
import type { Desafio, Progresso, Trilha } from "./tipos.ts";

/** Desafio desbloqueado = todas as lições da trilha feitas. */
export function desafioLiberado(trilha: Trilha, p: Progresso): boolean {
  return trilha.licoes.length > 0 && trilha.licoes.every(l => feita(p, l.id));
}

/** Desafio já vencido. */
export function desafioFeito(desafio: Desafio, p: Progresso): boolean {
  return feita(p, desafio.id);
}

/** XP do desafio: base maior que lição + bônus por acerto. */
export function xpDoDesafio(total: number, acertos: number): number {
  return 25 + acertos * 5;
}

/** Estrelas de 1 a 3 pelo desempenho. */
export function estrelasDoDesafio(total: number, acertos: number): number {
  const pct = total > 0 ? acertos / total : 0;
  if (pct >= 1) return 3;
  if (pct >= 0.7) return 2;
  return 1;
}

/** Registra conclusão do desafio no progresso. */
export function concluirDesafio(
  p: Progresso,
  desafioId: string,
  total: number,
  acertos: number,
  agora: number,
): Progresso {
  const ganho = xpDoDesafio(total, acertos);
  const hoje = new Date(agora).toDateString();
  const ontem = new Date(agora - 864e5).toDateString();
  const base: Progresso = p.dia === hoje ? p : {
    ...p,
    streak: p.dia === ontem ? p.streak + 1 : 1,
    dia: hoje,
    xpHoje: 0,
  };
  return {
    ...base,
    feitas: { ...base.feitas, [desafioId]: true },
    xp: base.xp + ganho,
    xpHoje: base.xpHoje + ganho,
  };
}

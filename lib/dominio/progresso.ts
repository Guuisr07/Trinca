/* XP, sequência de dias e missão diária. Puro: `agora` entra por parâmetro
   (ADR-003). Toda função devolve estado novo — nada muta o que recebeu. */

import { MAX_FICHAS } from "./fichas.ts";
import type { Progresso } from "./tipos.ts";

/** Meta diária da missão do trilho — cerca de uma lição. */
export const META_DIA = 20;

/* Fábrica, não constante: um objeto literal compartilhado vazaria o mesmo
   `feitas` entre o padrão e o estado vivo. */
export function progressoPadrao(): Progresso {
  return {
    xp: 0,
    xpHoje: 0,
    feitas: {},
    acertos: 0,
    erros: 0,
    streak: 1,
    dia: null,
    vidas: MAX_FICHAS,
    gastaEm: null,
    vip: false,
  };
}

/** Chave do dia. `toDateString()` é o formato já gravado no localStorage de
    quem usa o app — trocar por ISO invalidaria a sequência de todo mundo. */
export function diaDe(agora: number): string {
  return new Date(agora).toDateString();
}

export function feita(p: Progresso, id: string): boolean {
  return Boolean(p.feitas[id]);
}

export function feitasCount(p: Progresso): number {
  return Object.keys(p.feitas).length;
}

/** Conta o dia de hoje na sequência. Idempotente dentro do mesmo dia. */
export function marcarDia(p: Progresso, agora: number): Progresso {
  const hoje = diaDe(agora);
  if (p.dia === hoje) return p;
  const ontem = diaDe(agora - 864e5);
  return {
    ...p,
    streak: p.dia === ontem ? p.streak + 1 : 1,
    dia: hoje,
    xpHoje: 0,
  };
}

/** XP ganho hoje. Zera sozinho na virada do dia, mesmo com a aba aberta —
    por isso é conta de leitura, não um campo em que alguém confia cegamente. */
export function xpDeHoje(p: Progresso, agora: number): number {
  return p.dia === diaDe(agora) ? p.xpHoje : 0;
}

/** Quanto vale terminar uma lição: base fixa mais bônus por acerto de
    primeira. Revisão de lição concluída é livre e não paga XP. */
export function xpDaLicao(deprimeira: number, revisao: boolean): number {
  return revisao ? 0 : 10 + deprimeira * 2;
}

/** Fecha a lição: marca o dia, credita XP e registra a conclusão.
    `marcarDia` vem antes de somar — virou o dia, o contador do dia zera. */
export function concluirLicao(
  p: Progresso,
  licaoId: string,
  deprimeira: number,
  revisao: boolean,
  agora: number,
): Progresso {
  const base = marcarDia(p, agora);
  if (revisao) return base;
  const ganho = xpDaLicao(deprimeira, revisao);
  return {
    ...base,
    feitas: { ...base.feitas, [licaoId]: true },
    xp: base.xp + ganho,
    xpHoje: base.xpHoje + ganho,
  };
}

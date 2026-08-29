/* Regras de progressão da trilha: o que está aberto, quanto vale, onde parou.

   As trilhas entram por parâmetro em vez de serem importadas de `content/`.
   Domínio que não conhece a origem do conteúdo não precisou mudar uma linha
   quando a fonte trocou no passo 3 — e não vai mudar se um dia ela virar
   banco. Também é o que deixa o teste passar trilha de mentira. */

import { feita } from "./progresso.ts";
import type { Licao, Progresso, Trilha } from "./tipos.ts";

/** XP possível numa lição: base fixa + bônus por acerto de primeira. */
export function xpPossivel(licao: Licao): number {
  return 10 + licao.q.length * 2;
}

export function totalLicoes(trilhas: Trilha[]): number {
  return trilhas.reduce((n, t) => n + t.licoes.length, 0);
}

export function todasLicoes(trilhas: Trilha[]): Licao[] {
  return trilhas.flatMap((t) => t.licoes);
}

export function acharLicao(trilhas: Trilha[], id: string): Licao | null {
  return todasLicoes(trilhas).find((l) => l.id === id) ?? null;
}

/** Mapa id -> liberada. Lição abre com a anterior feita; trilha abre com a
    anterior inteira. Trilha vazia ("em breve") fecha o que vem depois. */
export function liberadas(trilhas: Trilha[], p: Progresso): Record<string, boolean> {
  const mapa: Record<string, boolean> = {};
  let trilhaAberta = true;

  for (const t of trilhas) {
    let anterior = true;
    for (const l of t.licoes) {
      mapa[l.id] = trilhaAberta && anterior;
      anterior = feita(p, l.id);
    }
    trilhaAberta =
      trilhaAberta && t.licoes.length > 0 && t.licoes.every((l) => feita(p, l.id));
  }
  return mapa;
}

export function estaLiberada(
  abertas: Record<string, boolean>,
  id: string,
): boolean {
  return abertas[id] ?? false;
}

/** Primeira lição aberta e ainda não concluída — o "continue de onde parou". */
export function proximaLicao(
  trilhas: Trilha[],
  p: Progresso,
  abertas: Record<string, boolean> = liberadas(trilhas, p),
): { licao: Licao; trilha: Trilha } | null {
  for (const trilha of trilhas) {
    for (const licao of trilha.licoes) {
      if (estaLiberada(abertas, licao.id) && !feita(p, licao.id)) {
        return { licao, trilha };
      }
    }
  }
  return null;
}

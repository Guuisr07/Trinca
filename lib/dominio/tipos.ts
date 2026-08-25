/* Formatos do domínio. Sem React, sem DOM, sem localStorage (ADR-003). */

/** Progresso do jogador. É exatamente o que vai pro localStorage — os nomes
    de campo são os que já estão gravados na máquina de quem usa o app hoje.
    Renomear `vidas` pra `fichas` aqui apagaria o progresso de todo mundo na
    virada; o vocabulário novo fica nos nomes de função. */
export interface Progresso {
  xp: number;
  xpHoje: number;
  /** id da lição -> concluída. O valor histórico é `1` ou `true`; leia por `feita()`. */
  feitas: Record<string, number | boolean>;
  acertos: number;
  erros: number;
  streak: number;
  /** `toDateString()` do último dia jogado. Formato herdado — não mexer. */
  dia: string | null;
  vidas: number;
  /** Instante em que o lote deixou de estar cheio. `null` = lote cheio. */
  gastaEm: number | null;
  vip: boolean;
}

/* Conteúdo. Tipagem mínima de propósito: o esquema de verdade (Zod, id
   estável, versão) é o passo 3 da ADR-012. */

export interface Pergunta {
  p: string;
  o: string[];
  c: number;
  e: string;
  t?: "mao";
  board?: string[];
}

export interface Licao {
  id: string;
  titulo: string;
  icone: string;
  aula: unknown[];
  q: Pergunta[];
}

export interface Trilha {
  id: string;
  nome: string;
  icone: string;
  desc: string;
  licoes: Licao[];
  embreve?: boolean;
}

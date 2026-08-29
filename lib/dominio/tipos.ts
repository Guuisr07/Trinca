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

/* Conteúdo (ADR-007). O conteúdo em si mora em `content/`, tipado por estas
   interfaces — `satisfies Trilha[]` lá quebra o build se uma lição sair do
   formato. Sem validação em tempo de execução: o dado vem do repositório,
   não da rede. */

/** Naipe: espadas, copas, ouros, paus. */
export type Naipe = "e" | "c" | "o" | "p";

/** Carta como dado: valor + símbolo do naipe, ex. `"A♠"`. O símbolo é chave,
    não ícone — quem desenha é `<Naipe />` (ADR-005). */
export type Carta = string;

/** Um passo da aula. Texto sempre; carta, tabela de naipes e lista, conforme. */
export interface PassoAula {
  h: string;
  p?: string;
  cartas?: Carta[];
  naipes?: boolean;
  lista?: string[];
}

export interface Pergunta {
  p: string;
  /** Alternativas. Texto, ou mãos de cartas quando `t === "mao"`. */
  o: string[] | Carta[][];
  /** Índice da alternativa correta em `o`. */
  c: number;
  e: string;
  t?: "mao";
  board?: Carta[];
}

export interface Licao {
  /** Estável e único pra sempre — o progresso é gravado por ele. */
  id: string;
  /** Sobe quando o conteúdo muda a ponto de valer a pena rever. */
  versao: number;
  titulo: string;
  /** Nome do ícone lucide, resolvido no render. Nunca emoji (ADR-005). */
  icone: string;
  aula: PassoAula[];
  q: Pergunta[];
}

export interface Trilha {
  id: string;
  nome: string;
  naipe: Naipe;
  desc: string;
  licoes: Licao[];
  embreve?: boolean;
}

/** Uma linha do ranking das mãos. A força vem da posição na lista de
    `content/maos.ts` — do índice 0 (mais fraca) ao último (mais forte). */
export interface Mao {
  id: string;
  nome: string;
  exemplo: Carta[];
  como: string;
}

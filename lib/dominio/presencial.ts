/* Montagem de mesa presencial. Sem React, sem DOM (ADR-003). */

export interface FichaInventario {
  valor: number;
  qtd: number;
}

export interface DistribuicaoJogador {
  fichas: { valor: number; qtd: number }[];
  total: number;
}

export interface NivelBlind {
  nivel: number;
  small: number;
  big: number;
  ante: number;
}

/**
 * Distribui fichas igualmente entre jogadores, maximizando quantidade
 * física de fichas por jogador (mais fichas = jogo mais confortável).
 * Greedy: começa pela menor denominação, usa o máximo possível.
 */
export function distribuirFichas(
  inventario: FichaInventario[],
  jogadores: number,
  stackAlvo: number
): DistribuicaoJogador | null {
  if (jogadores < 2 || stackAlvo <= 0) return null;

  const denoms = [...inventario]
    .filter(f => f.qtd > 0 && f.valor > 0)
    .sort((a, b) => a.valor - b.valor);

  if (denoms.length === 0) return null;

  const porJogador = denoms.map(d => ({
    valor: d.valor,
    disponivel: Math.floor(d.qtd / jogadores),
  }));

  let restante = stackAlvo;
  const resultado: { valor: number; qtd: number }[] = [];

  // ponytail: greedy simples, O(n) por denominação — exato quando denoms são múltiplas entre si (caso real de maleta)
  // Primeiro: de baixo pra cima, aloca máximo possível
  for (const d of porJogador) {
    if (restante <= 0) break;
    const maxPeloValor = Math.floor(restante / d.valor);
    const qtd = Math.min(maxPeloValor, d.disponivel);
    if (qtd > 0) {
      resultado.push({ valor: d.valor, qtd });
      restante -= qtd * d.valor;
    }
  }

  if (restante > 0) {
    for (const d of [...porJogador].reverse()) {
      if (restante <= 0) break;
      const jaUsou = resultado.find(r => r.valor === d.valor)?.qtd ?? 0;
      const sobraDisp = d.disponivel - jaUsou;
      if (sobraDisp > 0 && d.valor <= restante) {
        const qtd = Math.min(Math.floor(restante / d.valor), sobraDisp);
        if (qtd > 0) {
          const existente = resultado.find(r => r.valor === d.valor);
          if (existente) existente.qtd += qtd;
          else resultado.push({ valor: d.valor, qtd });
          restante -= qtd * d.valor;
        }
      }
    }
  }

  const total = resultado.reduce((s, r) => s + r.valor * r.qtd, 0);

  return {
    fichas: resultado.filter(r => r.qtd > 0).sort((a, b) => b.valor - a.valor),
    total,
  };
}

/** Valor total disponível na maleta. */
export function valorTotalInventario(inventario: FichaInventario[]): number {
  return inventario.reduce((s, f) => s + f.valor * f.qtd, 0);
}

/** Máximo de jogadores que o inventário suporta pro stack dado. */
export function maxJogadores(inventario: FichaInventario[], stackAlvo: number): number {
  if (stackAlvo <= 0) return 0;
  const total = valorTotalInventario(inventario);
  return Math.floor(total / stackAlvo);
}

/**
 * Gera tabela de blinds pro torneio.
 * Blinds dobram a cada nível. Ante entra no nível 4+.
 */
export function gerarBlinds(
  smallInicial: number,
  niveis: number
): NivelBlind[] {
  const resultado: NivelBlind[] = [];
  let small = smallInicial;

  // Sequência padrão: 1/2, 2/4, 3/6, 5/10, 10/20, 15/30, 25/50, 50/100...
  const multiplicadores = [1, 2, 3, 5, 10, 15, 25, 50, 75, 100, 150, 200, 300, 500, 750, 1000];

  for (let i = 0; i < niveis; i++) {
    const last = multiplicadores[multiplicadores.length - 1]!;
    const mult = i < multiplicadores.length ? multiplicadores[i]! : last * (2 ** (i - multiplicadores.length + 1));
    small = smallInicial * mult;
    const big = small * 2;
    const ante = i >= 3 ? Math.max(Math.round(small * 0.25), 1) * smallInicial : 0;
    resultado.push({ nivel: i + 1, small, big, ante });
  }

  return resultado;
}

/** Sugere small blind inicial com base no stack. ~1/100 do stack é padrão. */
export function sugerirBlindInicial(stack: number): number {
  const alvo = Math.round(stack / 100);
  // Arredonda pra número bonito
  if (alvo <= 1) return 1;
  if (alvo <= 3) return 2;
  if (alvo <= 7) return 5;
  if (alvo <= 15) return 10;
  if (alvo <= 30) return 25;
  return Math.round(alvo / 25) * 25;
}

/* Renderização de cartas. Baralho de 4 cores (padrão das salas online):
   cor identifica o naipe sem precisar enxergar o símbolo. */

export const NAIPES = {
  "♠": { k:"e", nome:"Espadas" },
  "♥": { k:"c", nome:"Copas"   },
  "♦": { k:"o", nome:"Ouros"   },
  "♣": { k:"p", nome:"Paus"    }
};

/** "A♠" -> HTML de uma carta. `mini` usa o tamanho reduzido das opções. */
export function carta(c, mini){
  const naipe = c.slice(-1), valor = c.slice(0, -1);
  const n = NAIPES[naipe] || NAIPES["♠"];
  return '<div class="carta n-' + n.k + (mini ? " mini" : "") + '"><u>' +
    valor + "</u><b>" + naipe + "</b></div>";
}

/** Lista de cartas, com as viradas escalonadas no tempo. */
export function mao(cs, mini){
  return '<div class="mao">' + cs.map((c, i) =>
    carta(c, mini).replace('class="carta', 'style="animation-delay:' + (i * 70) + 'ms" class="carta')
  ).join("") + "</div>";
}

/** Legenda cor -> naipe, usada na aula que apresenta o baralho. */
export function legendaNaipes(){
  return '<div class="legenda-naipes">' + Object.keys(NAIPES).map(s =>
    '<div class="pilula-naipe"><i class="n-' + NAIPES[s].k + '">' + s + "</i>" +
    NAIPES[s].nome + "</div>").join("") + "</div>";
}

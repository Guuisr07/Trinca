/* Fichas na tela: o desenho do lote e o relógio que conta a recarga.
   Mora fora de telas.js porque a lição também precisa, e telas.js já importa
   a lição — importar de volta fecharia o ciclo. */

import { $$ } from "./dom.js";
import { S, MAX_VIDAS, vidasAgora, proximaVidaEm, formatarEspera } from "./state.js";

/** Interior de um lote de fichas. Quem chama é dono do contêiner `.fichas`
    (e da classe `.vip` nele). `data-espera` é preenchido pelo relógio. */
export function conteudoFichas(){
  if (S.vip) return '<span class="infinito" title="Trinca+: fichas ilimitadas">&#8734;</span>';
  const vivas = vidasAgora();
  return Array.from({length:MAX_VIDAS}, (_, i) =>
      '<div class="ficha' + (i >= vivas ? " perdida" : "") + '"></div>').join("") +
    (vivas < MAX_VIDAS ? '<span class="espera" data-espera></span>' : "");
}

/** Preenche todo `[data-espera]` da página com o tempo da próxima ficha. */
export function pintarEsperas(){
  const ms = proximaVidaEm();
  const texto = ms ? formatarEspera(ms) : "";
  $$("[data-espera]").forEach(e => { e.textContent = texto; });
}

/** Relógio de 1s. Chama `aoRecarregar` só quando uma ficha de fato volta —
    repintar a tela inteira a cada segundo seria desperdício. */
export function ligarRelogio(aoRecarregar){
  let ultimas = vidasAgora();
  setInterval(() => {
    const agora = vidasAgora();
    if (agora !== ultimas){ ultimas = agora; aoRecarregar(); }
    pintarEsperas();
  }, 1000);
}

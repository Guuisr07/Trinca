/* Regras de progressão: o que está aberto, o que já foi feito, quanto vale.
   Sem DOM — é a camada testável do app (ver tests/regras.test.js). */

import { TRILHAS } from "../data/trilhas.js";
import { S } from "./state.js";

/** XP possível numa lição: base fixa + bônus por acerto de primeira. */
export const xpPossivel = licao => 10 + licao.q.length * 2;

export const totalLicoes = () => TRILHAS.reduce((n, t) => n + t.licoes.length, 0);
export const feitasCount = () => Object.keys(S.feitas).length;

export function acharLicao(id){
  for (const t of TRILHAS)
    for (const l of t.licoes)
      if (l.id === id) return l;
  return null;
}

/** Mapa id -> liberada. Lição abre com a anterior feita; trilha abre com a anterior inteira. */
export function liberadas(){
  const mapa = {};
  let trilhaAberta = true;
  for (const t of TRILHAS){
    let anterior = true;
    for (const l of t.licoes){
      mapa[l.id] = trilhaAberta && anterior;
      anterior = !!S.feitas[l.id];
    }
    trilhaAberta = trilhaAberta && t.licoes.length > 0 && t.licoes.every(l => S.feitas[l.id]);
  }
  return mapa;
}

/** Primeira lição aberta e ainda não concluída — o "continue de onde parou". */
export function proximaLicao(abertas = liberadas()){
  for (const t of TRILHAS)
    for (const l of t.licoes)
      if (abertas[l.id] && !S.feitas[l.id]) return { licao:l, trilha:t };
  return null;
}

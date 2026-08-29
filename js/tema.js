/* Tema claro/escuro. Dono da chave "trinca.tema" — o progresso continua sendo
   só do state.js. O valor inicial já foi aplicado pelo script inline do <head>
   (sem ele a tela pisca clara antes do módulo carregar). */

import { $$ } from "./dom.js";

const CHAVE = "trinca.tema";
const raiz = document.documentElement;

function pintar(){
  const escuro = raiz.dataset.tema === "dark";
  $$(".troca-tema").forEach(b => {
    b.setAttribute("aria-checked", escuro);
    b.setAttribute("aria-label", escuro ? "Mudar para o tema claro" : "Mudar para o tema escuro");
  });
}

/** Liga todos os switches da página. Chamada uma vez, no boot. */
export function ligarTema(){
  $$(".troca-tema").forEach(b => b.addEventListener("click", () => {
    raiz.dataset.tema = raiz.dataset.tema === "dark" ? "light" : "dark";
    try { localStorage.setItem(CHAVE, raiz.dataset.tema); } catch {}
    pintar();
  }));
  pintar();
}

/* ---------- baralho ----------
   Mesma ideia do tema: escolha visual, chave própria, aplicada no <html>. O
   script inline do <head> já leu a chave antes da primeira pintura. */

const CHAVE_BARALHO = "trinca.baralho";

export const BARALHOS = [
  { id: "cheio", nome: "Colorido", desc: "Face inteira na cor do naipe. Bate o olho e você sabe." },
  { id: "classico", nome: "Clássico", desc: "Carta branca, naipe colorido. Igual ao baralho da mesa." }
];

export function baralhoAtual(){
  return raiz.dataset.baralho === "classico" ? "classico" : "cheio";
}

export function escolherBaralho(id){
  raiz.dataset.baralho = id;
  try { localStorage.setItem(CHAVE_BARALHO, id); } catch {}
}

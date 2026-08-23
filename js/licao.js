/* Motor da lição: monta a sequência de passos (aula + perguntas), controla
   fichas/vidas, feedback e conclusão. É a única tela modal do app. */

import { $ } from "./dom.js";
import { S, salvar, marcarDia } from "./state.js";
import { acharLicao } from "./progresso.js";
import { mao, legendaNaipes } from "./cartas.js";
import { confete } from "./confete.js";

const VIDAS = 3;

/** Lição em andamento, ou null. */
let L = null;

/** Callback de saída — injetado no boot pra não criar ciclo com telas.js. */
let aoFechar = () => {};

/** Liga os controles fixos do modal. Chamada uma vez, no boot. */
export function ligarLicao(quandoFechar){
  aoFechar = quandoFechar;
  $("#btn-sair").addEventListener("click", () => {
    if (!L || L.i === 0 || confirm("Sair agora perde o progresso desta lição.")) fecharLicao();
  });
  $("#fb-bt").addEventListener("click", () => {
    if (!L) return;
    if (L.vidas <= 0) return semFichas();
    L.i++; passo();
  });
}

export function abrirLicao(id){
  const licao = acharLicao(id);
  if (!licao) return;
  L = {
    licao,
    passos: licao.aula.map(a => ({ tipo:"aula", ...a }))
      .concat(licao.q.map(q => ({ tipo:"q", ...q }))),
    i: 0, vidas: VIDAS, deprimeira: 0, total: licao.q.length, errou: false
  };
  $("#licao").classList.add("on");
  document.body.style.overflow = "hidden";
  pintarFichas(); passo();
}

function fecharLicao(){
  $("#licao").classList.remove("on");
  $("#feedback").classList.remove("on", "bom", "ruim");
  document.body.style.overflow = "";
  L = null;
  aoFechar();
}

function pintarFichas(){
  $("#fichas").innerHTML = [0,1,2].map(i =>
    '<div class="ficha' + (i >= L.vidas ? " perdida" : "") + '"></div>').join("");
}

function passo(){
  const fb = $("#feedback");
  fb.classList.remove("on", "bom", "ruim");
  $("#pg").style.width = Math.round(L.i / L.passos.length * 100) + "%";
  if (L.i >= L.passos.length) return concluir();
  const p = L.passos[L.i];
  const palco = $("#palco"), rodape = $("#rodape").firstElementChild;
  if (p.tipo === "aula"){
    palco.innerHTML = "<h2>" + p.h + "</h2>" +
      (p.p ? '<div class="dom-fala"><img class="dom-mini" src="assets/marca/dom-estuda.png" alt="">' +
        '<div class="balao">' + p.p + "</div></div>" : "") +
      (p.naipes ? legendaNaipes() : "") +
      (p.cartas ? '<div class="mesa">' + mao(p.cartas) + "</div>" : "") +
      (p.lista ? '<ul class="lista">' + p.lista.map((li, n) =>
        "<li><i>" + (n+1) + "</i><span>" + li + "</span></li>").join("") + "</ul>" : "");
    palco.style.animation = "none"; void palco.offsetWidth; palco.style.animation = "";
    rodape.innerHTML = '<button class="bt">Entendi</button>';
    rodape.firstElementChild.addEventListener("click", () => { L.i++; passo(); });
    return;
  }
  rodape.innerHTML = "";
  const opcoes = p.t === "mao"
    ? p.o.map((h, n) => '<button class="opc" data-i="' + n + '">' + mao(h, true) +
        '<div class="rot">Jogador ' + (n+1) + "</div></button>").join("")
    : p.o.map((o, n) => '<button class="opc" data-i="' + n + '">' + o + "</button>").join("");
  palco.innerHTML =
    '<div class="cap">Pergunta ' + (L.passos.slice(0, L.i).filter(x => x.tipo === "q").length + 1) + "</div>" +
    '<div class="pergunta">' + p.p + "</div>" +
    (p.board ? '<div class="mesa"><span class="cap">Mesa</span>' + mao(p.board, true) + "</div>" : "") +
    '<div class="opcoes">' + opcoes + "</div>";
  palco.style.animation = "none"; void palco.offsetWidth; palco.style.animation = "";
  palco.querySelectorAll(".opc").forEach(b => b.addEventListener("click", () => responder(b, p)));
}

function responder(botao, p){
  const escolha = +botao.dataset.i, certo = escolha === p.c;
  $("#palco").querySelectorAll(".opc").forEach((b, n) => {
    b.disabled = true;
    if (n === p.c) b.classList.add("certa");
    else if (n === escolha) b.classList.add("errada");
  });
  const fb = $("#feedback");
  if (certo){
    S.acertos++;
    if (!p.repetida) L.deprimeira++;
    fb.classList.add("bom");
    $("#fb-titulo").innerHTML = "✓ Isso aí!";
  } else {
    S.erros++; L.errou = true; L.vidas--; pintarFichas();
    fb.classList.add("ruim");
    $("#fb-titulo").innerHTML = "✗ Quase lá";
    L.passos.push(Object.assign({}, p, {repetida:true}));
  }
  salvar();
  $("#fb-texto").textContent = p.e;
  $("#fb-bt").textContent = L.vidas <= 0 ? "Ver o que aconteceu" : "Continuar";
  requestAnimationFrame(() => fb.classList.add("on"));
}

function semFichas(){
  $("#feedback").classList.remove("on", "bom", "ruim");
  $("#pg").style.width = "0%";
  $("#rodape").firstElementChild.innerHTML = "";
  $("#palco").innerHTML =
    '<div class="fim"><img class="selo" alt="" src="assets/marca/dom-tira.png"><h2>Acabaram suas fichas</h2>' +
    "<p>Sem drama: revisar é parte do jogo. Refaça a lição — o conteúdo é o mesmo, " +
    "e da segunda vez ele gruda.</p>" +
    '<button class="bt" id="denovo">Tentar de novo</button>' +
    '<button class="bt fantasma" id="voltar" style="margin-top:10px">Voltar pra trilha</button></div>';
  $("#denovo").addEventListener("click", () => abrirLicao(L.licao.id));
  $("#voltar").addEventListener("click", fecharLicao);
}

function concluir(){
  const bonus = L.deprimeira * 2;
  const ganho = 10 + bonus;
  const nova = !S.feitas[L.licao.id];
  S.feitas[L.licao.id] = true;
  S.xp += ganho;
  marcarDia(); salvar();   // o topo é repintado por aoFechar() -> render()
  $("#pg").style.width = "100%";
  $("#rodape").firstElementChild.innerHTML = "";
  $("#palco").innerHTML =
    '<div class="fim"><img class="selo" alt="" src="assets/marca/' +
      (L.errou ? "dom-pensa" : "dom-vibra") + '.png">' +
    "<h2>" + (L.errou ? "Lição fechada!" : "Sem errar uma!") + "</h2>" +
    "<p>" + L.licao.titulo + (nova ? " desbloqueou a próxima." : " revisada.") + "</p>" +
    '<div class="premios">' +
      '<div class="premio"><span class="cap">XP ganho</span><b>+' + ganho + "</b></div>" +
      '<div class="premio"><span class="cap">De primeira</span><b>' + L.deprimeira + "/" + L.total + "</b></div>" +
    "</div>" +
    '<button class="bt" id="segue">Continuar</button></div>';
  $("#segue").addEventListener("click", fecharLicao);
  confete();
}

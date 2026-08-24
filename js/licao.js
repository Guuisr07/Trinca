/* Motor da lição: monta a sequência de passos (aula + perguntas), gasta as
   fichas do jogador, dá feedback e conclui. É a única tela modal do app. */

import { $ } from "./dom.js";
import { S, salvar, marcarDia, vidasAgora, perderVida, proximaVidaEm,
         formatarEspera, MAX_VIDAS } from "./state.js";
import { acharLicao } from "./progresso.js";
import { conteudoFichas, pintarEsperas } from "./fichas.js";
import { mao, legendaNaipes } from "./cartas.js";
import { confete } from "./confete.js";

/** Lição em andamento, ou null. */
let L = null;

/** Callback de saída — injetado no boot pra não criar ciclo com telas.js. */
let aoFechar = () => {};

/** Liga os controles fixos do modal. Chamada uma vez, no boot. */
export function ligarLicao(quandoFechar){
  aoFechar = quandoFechar;
  $("#btn-sair").addEventListener("click", () => {
    if (!L || L.bloqueada || L.i === 0 ||
        confirm("Sair agora perde o progresso desta lição.")) fecharLicao();
  });
  $("#fb-bt").addEventListener("click", () => {
    if (!L) return;
    if (!L.revisao && vidasAgora() <= 0) return semFichas();
    L.i++; passo();
  });
  document.addEventListener("keydown", tecla);
}

/* No desktop a lição se joga sem mouse: número escolhe, Enter avança, Esc sai.
   O número é o mesmo que aparece na quina da opção (ver .opc::before). */
function tecla(e){
  if (!L || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key === "Escape") return $("#btn-sair").click();
  if (e.key === "Enter" || e.key === " "){
    const bt = $("#feedback").classList.contains("on")
      ? $("#fb-bt") : $("#rodape").querySelector(".bt");
    if (bt){ e.preventDefault(); bt.click(); }
    return;
  }
  const n = Number(e.key);
  if (!n || $("#feedback").classList.contains("on")) return;
  const opc = $("#palco").querySelectorAll(".opc")[n - 1];
  if (opc && !opc.disabled){ e.preventDefault(); opc.click(); }
}

export function abrirLicao(id){
  const licao = acharLicao(id);
  if (!licao) return;
  /* Lição já concluída abre em revisão: não custa ficha e não paga XP. É o que
     sobra pra fazer quando o lote zera — e é justamente o que ensina. */
  const revisao = !!S.feitas[id];
  abrirModal();
  if (!revisao && vidasAgora() <= 0){
    L = { licao, bloqueada:true };
    return telaSemFichas("Você ficou sem fichas",
      "Lições novas voltam quando a primeira ficha recarregar. Enquanto isso, " +
      "revisar uma lição já concluída não custa nada.");
  }
  L = {
    licao, revisao,
    passos: licao.aula.map(a => ({ tipo:"aula", ...a }))
      .concat(licao.q.map(q => ({ tipo:"q", ...q }))),
    i: 0, deprimeira: 0, total: licao.q.length, errou: false
  };
  pintarFichas(); passo();
}

function abrirModal(){
  $("#licao").classList.add("on");
  $("#licao").classList.remove("sem-fichas");
  document.body.style.overflow = "hidden";
  $("#pg").style.width = "0%";
}

function fecharLicao(){
  $("#licao").classList.remove("on", "sem-fichas");
  $("#feedback").classList.remove("on", "bom", "ruim");
  document.body.style.overflow = "";
  L = null;
  aoFechar();
}

function pintarFichas(){
  const el = $("#fichas");
  el.classList.toggle("vip", !!S.vip);
  el.innerHTML = conteudoFichas();
  pintarEsperas();
}

function passo(){
  const fb = $("#feedback");
  fb.classList.remove("on", "bom", "ruim");
  $("#pg").style.width = Math.round(L.i / L.passos.length * 100) + "%";
  if (L.i >= L.passos.length) return concluir();
  const p = L.passos[L.i];
  const palco = $("#palco"), rodape = $("#rodape").firstElementChild;
  if (p.tipo === "aula"){
    palco.innerHTML = (L.revisao ? '<div class="selo-revisao">Revisão · não gasta ficha</div>' : "") +
      "<h2>" + p.h + "</h2>" +
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
    (L.revisao ? '<div class="selo-revisao">Revisão · não gasta ficha</div>' : "") +
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
    S.erros++; L.errou = true;
    if (!L.revisao) perderVida();      // revisão não custa ficha
    pintarFichas();
    fb.classList.add("ruim");
    $("#fb-titulo").innerHTML = "✗ Quase lá";
    L.passos.push(Object.assign({}, p, {repetida:true}));
  }
  salvar();
  $("#fb-texto").textContent = p.e;
  const acabou = !L.revisao && vidasAgora() <= 0;
  $("#fb-bt").textContent = acabou ? "Ver o que aconteceu" : "Continuar";
  requestAnimationFrame(() => fb.classList.add("on"));
}

/** Tela de espera. Serve tanto pra quem zerou no meio quanto pra quem chegou
    na lição já sem ficha nenhuma. */
function telaSemFichas(titulo, texto){
  $("#licao").classList.add("sem-fichas");
  $("#feedback").classList.remove("on", "bom", "ruim");
  $("#pg").style.width = "0%";
  $("#rodape").firstElementChild.innerHTML = "";
  $("#palco").innerHTML =
    '<div class="fim"><img class="selo" alt="" src="assets/marca/dom-tira.png">' +
    "<h2>" + titulo + "</h2><p>" + texto + "</p>" +
    '<div class="contador"><span class="cap">Próxima ficha em</span>' +
      '<b data-espera>' + formatarEspera(proximaVidaEm()) + "</b></div>" +
    '<button class="bt" id="voltar">Voltar pra trilha</button></div>';
  $("#voltar").addEventListener("click", fecharLicao);
  pintarFichas();
}

function semFichas(){
  telaSemFichas("Acabaram suas fichas",
    "Sem drama: revisar é parte do jogo. Uma ficha volta a cada 30 minutos — " +
    "ou refaça uma lição já concluída, que não custa nada.");
}

function concluir(){
  const bonus = L.deprimeira * 2;
  const ganho = L.revisao ? 0 : 10 + bonus;
  marcarDia();            // antes de somar: virou o dia, o contador do dia zera
  if (!L.revisao){
    S.feitas[L.licao.id] = true;
    S.xp += ganho;
    S.xpHoje += ganho;
  }
  salvar();
  $("#pg").style.width = "100%";
  $("#rodape").firstElementChild.innerHTML = "";
  $("#palco").innerHTML =
    '<div class="fim"><img class="selo" alt="" src="assets/marca/' +
      (L.errou ? "dom-pensa" : "dom-vibra") + '.png">' +
    "<h2>" + (L.revisao ? "Revisão feita!" : (L.errou ? "Lição fechada!" : "Sem errar uma!")) + "</h2>" +
    "<p>" + L.licao.titulo + (L.revisao ? " continua na ponta da língua." : " desbloqueou a próxima.") + "</p>" +
    '<div class="premios">' +
      '<div class="premio"><span class="cap">' + (L.revisao ? "Revisão" : "XP ganho") + "</span><b>" +
        (L.revisao ? "grátis" : "+" + ganho) + "</b></div>" +
      '<div class="premio"><span class="cap">De primeira</span><b>' + L.deprimeira + "/" + L.total + "</b></div>" +
    "</div>" +
    '<button class="bt" id="segue">Continuar</button></div>';
  $("#segue").addEventListener("click", fecharLicao);
  if (!L.revisao) confete();
}

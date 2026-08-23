/* As três telas do app logado. Cada uma monta HTML e pinta em #tela;
   `render()` é o único ponto de entrada. */

import { $, $$ } from "./dom.js";
import { TRILHAS } from "../data/trilhas.js";
import { BOTS } from "../data/bots.js";
import { S, zerar } from "./state.js";
import { liberadas, totalLicoes, feitasCount, proximaLicao, xpPossivel } from "./progresso.js";
import { abrirLicao } from "./licao.js";

let aba = "trilha";

export function pintarTopo(){
  $("#s-xp").textContent = S.xp;
  $("#s-streak").textContent = S.streak;
}

export function render(){
  pintarTopo();
  if (aba === "trilha") telaTrilha();
  else if (aba === "ranking") telaRanking();
  else telaPerfil();
}

/** Liga a nav inferior. Chamada uma vez, no boot. */
export function ligarNav(){
  $$(".nav button").forEach(b => b.addEventListener("click", () => {
    $$(".nav button").forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    aba = b.dataset.aba;
    render();
  }));
}

function telaTrilha(){
  const abertas = liberadas();
  let html = "";

  const prox = proximaLicao(abertas);
  if (prox){
    const nova = !S.feitas[prox.licao.id];
    html += '<div class="destaque"><span class="naipe-marca">' + prox.trilha.icone + "</span>" +
      '<div class="cap">' + (feitasCount() ? "Continue de onde parou" : "Comece por aqui") + "</div>" +
      "<h2>" + prox.licao.titulo + "</h2>" +
      "<p>" + prox.trilha.nome + " &middot; " + prox.licao.aula.length + " telas de aula e " +
        prox.licao.q.length + " perguntas &middot; +" + xpPossivel(prox.licao) + " XP possíveis</p>" +
      '<button class="bt" data-licao="' + prox.licao.id + '">' +
        (nova ? "Jogar lição" : "Revisar lição") + "</button>" +
      '<span class="icone-licao">' + prox.licao.icone + "</span></div>";
  }

  html += '<div class="metas">' +
    '<div class="meta"><i>🔥</i><b>' + S.streak + "</b><small>DIAS SEGUIDOS</small></div>" +
    '<div class="meta"><i>🎯</i><b>' + S.xp + "</b><small>XP TOTAL</small></div>" +
    '<div class="meta"><i>🗺️</i><b>' + feitasCount() + "/" + totalLicoes() + "</b><small>LIÇÕES</small></div>" +
    "</div>";

  TRILHAS.forEach((t, ti) => {
    const feitas = t.licoes.filter(l => S.feitas[l.id]).length;
    const pct = t.licoes.length ? Math.round(feitas / t.licoes.length * 100) : 0;
    const travada = t.licoes.length > 0 && !abertas[t.licoes[0].id] && feitas === 0;
    if (t.embreve || (travada && ti > 0)){
      html += '<div class="bloco-travado"><h3>' + t.icone + " " + t.nome + " &middot; em breve</h3><p>" +
        t.desc + "</p></div>";
      return;
    }
    html += '<div class="cabecalho-trilha' + (ti ? '" style="margin-top:34px' : '') + '">' +
      '<span class="naipe-marca">' + t.icone + "</span>" +
      '<div class="cap">Trilha ' + (ti+1) + " &middot; " + feitas + " de " + t.licoes.length +
        (pct === 100 ? " &middot; completa ✓" : "") + "</div>" +
      "<h2>" + t.icone + " " + t.nome + "</h2><p>" + t.desc + "</p>" +
      '<div class="barra"><i style="width:' + pct + '%"></i></div></div>';
    html += '<div class="trilha">';
    t.licoes.forEach((l, i) => {
      const feita = !!S.feitas[l.id];
      const pronta = !feita && abertas[l.id];
      const cls = feita ? "feita" : (pronta ? "pronta" : "travada");
      const desloc = "desloc-" + ((i % 4) + 1);
      if (i) html += '<div class="fio ' + desloc + '"></div>';
      html += '<div class="no ' + cls + " " + desloc + '">' +
        '<button ' + (pronta || feita ? "" : "disabled ") + 'data-licao="' + l.id + '">' +
        '<div class="bolha">' + (feita ? "✓" : (pronta ? l.icone : "🔒")) + "</div></button>" +
        "<b>" + l.titulo + "</b><small>" +
        (feita ? "concluída" : (pronta ? "toque pra jogar" : "bloqueada")) + "</small>" +
        '<span class="xpzinho">' + (feita ? "✓ FEITA" : "+" + xpPossivel(l) + " XP") +
        "</span></div>";
    });
    html += "</div>";
    html += '<div class="fim-trilha"><div class="fichinhas">' +
      ["#E8453F","#F5B82E","#5B3FA0","#241C4F"].map(c =>
        '<i style="background:' + c + '"></i>').join("") + "</div>" +
      (pct === 100 ? "Trilha fechada. Boa!" : feitas + " de " + t.licoes.length +
        " lições — falta pouco") + "</div>";
  });
  $("#tela").innerHTML = html;
  $("#tela").querySelectorAll("[data-licao]").forEach(b =>
    b.addEventListener("click", () => abrirLicao(b.dataset.licao)));
}

function telaRanking(){
  const lista = BOTS.concat([{n:"Você", a:"🎩", x:S.xp, eu:true}]).sort((a,b) => b.x - a.x);
  const pos = lista.findIndex(j => j.eu) + 1;
  let html = '<div class="liga"><div class="medalha">🏆</div><h2>Liga das Fichas</h2>' +
    "<p>Você está em <b>" + pos + "º</b> de " + lista.length +
    ". Cada lição vale XP — os 3 primeiros sobem de liga no domingo.</p></div>";
  html += lista.map((j, i) =>
    '<div class="linha' + (j.eu ? " eu" : "") + '"><div class="pos">' + (i+1) + "</div>" +
    '<div class="av">' + j.a + '</div><div class="nm">' + j.n + "</div>" +
    '<div class="xp">' + j.x + " XP</div></div>").join("");
  $("#tela").innerHTML = html;
}

function telaPerfil(){
  const tentativas = S.acertos + S.erros;
  const precisao = tentativas ? Math.round(S.acertos / tentativas * 100) : 0;
  const conq = [
    {i:"🎬", t:"Primeira mão", d:"Concluiu a lição de estreia", ok:feitasCount() >= 1},
    {i:"♠", t:"Fundamentos fechados", d:"Terminou a trilha 1 inteira", ok:TRILHAS[0].licoes.every(l => S.feitas[l.id])},
    {i:"🔥", t:"Três dias seguidos", d:"Voltou 3 dias em sequência", ok:S.streak >= 3},
    {i:"🎯", t:"Mão de ferro", d:"100 XP acumulados", ok:S.xp >= 100}
  ];
  $("#tela").innerHTML =
    '<div class="cap" style="margin-bottom:10px">Seu progresso</div>' +
    '<div class="grade">' +
      '<div class="caixa"><b>' + S.xp + "</b><small>XP total</small></div>" +
      '<div class="caixa"><b>' + S.streak + "</b><small>dias seguidos</small></div>" +
      '<div class="caixa"><b>' + feitasCount() + "/" + totalLicoes() + "</b><small>lições</small></div>" +
      '<div class="caixa"><b>' + precisao + "%</b><small>de acerto</small></div>" +
    "</div>" +
    '<div class="cap" style="margin-bottom:10px">Conquistas</div>' +
    conq.map(c => '<div class="conquista' + (c.ok ? "" : " off") + '"><span>' + c.i +
      "</span><div><b>" + c.t + "</b><small>" + c.d + "</small></div></div>").join("") +
    '<button class="bt fantasma" id="zerar" style="margin-top:18px">Zerar meu progresso</button>';
  $("#zerar").addEventListener("click", () => {
    if (!confirm("Isso apaga XP, lições e sequência. Continuar?")) return;
    zerar(); render();
  });
}

/* Tela de entrada. Fica montada o tempo todo e alterna com .fora — o login vai
   morar aqui, então precisa dar pra voltar (botão da marca, no topo do app). */

import { $ } from "./dom.js";
import { S } from "./state.js";
import { feitasCount, totalLicoes } from "./progresso.js";

/** Texto do CTA depende do progresso — repintado toda vez que a landing volta. */
function pintar(){
  const voltando = S.xp > 0 || feitasCount() > 0;
  $("#entrar").textContent = voltando ? "Continuar de onde parei" : "Começar a jogar";
  $("#rodapinho").textContent = voltando
    ? S.xp + " XP acumulados · " + feitasCount() + " de " + totalLicoes() + " lições feitas"
    : "Grátis, sem cadastro. Primeira lição: o baralho.";
}

export function mostrarLanding(){
  const tela = $("#inicio");
  tela.classList.remove("fora", "saindo");
  tela.scrollTop = 0;
  document.body.style.overflow = "hidden";
  pintar();
}

function esconderLanding(){
  const tela = $("#inicio");
  tela.classList.add("saindo");
  document.body.style.overflow = "";
  // .intro cai junto: voltar pra landing não repete a animação de entrada
  setTimeout(() => { tela.classList.replace("saindo", "fora"); tela.classList.remove("intro"); }, 450);
}

export function ligarLanding(){
  const cores = ["#E8453F","#F5B82E","#5B3FA0","#241C4F","#22B573","#F7EFDF"];
  let html = "";
  for (let i = 0; i < 20; i++){
    const t = 24 + Math.random() * 28;
    const c = cores[(Math.random() * cores.length) | 0];
    html += '<div class="ficha-cai" style="' +
      "left:" + (Math.random() * 100).toFixed(1) + "%;" +
      "width:" + t.toFixed(0) + "px;height:" + t.toFixed(0) + "px;background:" + c + ";" +
      "box-shadow:inset 0 0 0 " + (t/10).toFixed(1) + "px #ffffffd9, inset 0 0 0 " +
        (t/6).toFixed(1) + "px " + c + ", 0 3px 0 #00000012;" +
      "animation-duration:" + (5 + Math.random() * 7).toFixed(1) + "s," +
        (1.1 + Math.random() * 1.8).toFixed(1) + "s;" +
      "animation-delay:-" + (Math.random() * 9).toFixed(1) + "s,-" +
        (Math.random() * 2).toFixed(1) + "s;" +
      "opacity:" + (0.45 + Math.random() * 0.45).toFixed(2) + '"></div>';
  }
  $("#chuva").innerHTML = html;
  document.body.style.overflow = "hidden";
  pintar();

  const dealer = document.querySelector(".dealer");
  $("#entrar").addEventListener("pointerdown", () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    dealer.animate([
      {transform:"none"},
      {transform:"translateY(-18px) rotate(-3deg)", offset:.4},
      {transform:"translateY(0) rotate(2.5deg)", offset:.7},
      {transform:"none"}
    ], {duration:550, easing:"cubic-bezier(.2,1.4,.4,1)"});
  });
  $("#entrar").addEventListener("click", esconderLanding);
  $("#ir-inicio").addEventListener("click", mostrarLanding);
}

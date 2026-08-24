/* Joga a primeira lição do começo ao fim, acertando tudo, e exige a tela de
   conclusão. Existe porque `concluir()` já quebrou por chamar uma função que
   não estava importada — e o sintoma era a lição travar no último passo.

   Rodar:  node serve.mjs   (noutro terminal)
           node tests/licao.test.mjs */
import { chromium } from "playwright";
import assert from "node:assert";
import { TRILHAS } from "../data/trilhas.js";

const URL = process.env.URL ?? "http://localhost:5173/";
const licao = TRILHAS[0].licoes[0];
const gabarito = licao.q.map(q => q.c);

const b = await chromium.launch();
const p = await b.newPage();
const erros = [];
p.on("pageerror", e => erros.push(e.message));
await p.goto(URL);
await p.click("#entrar");
await p.click(`[data-licao="${licao.id}"]`);

let respondidas = 0;
for (let volta = 0; volta < 60; volta++){
  if (await p.locator("#palco .fim").count()) break;
  const opcoes = p.locator("#palco .opc");
  if (await opcoes.count()){
    if (respondidas >= gabarito.length) break;   // travou na última pergunta
    await opcoes.nth(gabarito[respondidas++]).click();
    await p.locator("#fb-bt").click();
  } else {
    await p.locator("#rodape .bt").click();   // tela de aula: "Entendi"
  }
}

assert.deepStrictEqual(erros, [], "erro de runtime durante a lição");
assert.ok(await p.locator("#palco .fim").count(), "lição travou: tela de conclusão não apareceu");
assert.strictEqual(respondidas, licao.q.length, "não respondeu todas as perguntas");

await p.click("#segue");                       // conclusão tem que fechar o modal
await p.waitForTimeout(200);
assert.ok(!await p.locator("#licao.on").count(), "modal não fechou no Continuar");
const xp = await p.textContent("#s-xp");
assert.strictEqual(xp, String(10 + licao.q.length * 2), "XP do topo não bateu");

/* Caminho das fichas: agora elas são do jogador, não da lição. Errar cinco
   vezes zera o lote e trava lição nova; o que sobra é revisar. */
const licao2 = TRILHAS[0].licoes[1];
await p.click(`[data-licao="${licao2.id}"]`);
for (let volta = 0; volta < 40; volta++){
  if (await p.locator("#palco .fim").count()) break;
  const opcoes = p.locator("#palco .opc");
  if (await opcoes.count()){
    const certa = licao2.q[0].c;                 // qualquer opção que não seja a certa
    await opcoes.nth(certa === 0 ? 1 : 0).click();
    await p.locator("#fb-bt").click();
  } else await p.locator("#rodape .bt").click();
}
assert.ok(await p.locator("#voltar").count(), "cinco erros não levaram à tela de espera");
assert.ok(await p.locator("[data-espera]").count(), "tela de espera sem contador de recarga");
await p.click("#voltar");
await p.waitForTimeout(200);
assert.ok(!await p.locator("#licao.on").count(), "não voltou pra trilha");
assert.ok(await p.locator(".aviso-fichas").count(), "trilha não avisou que o lote zerou");

/* Sem ficha: lição nova bate na porta fechada, lição feita abre em revisão. */
await p.click(`[data-licao="${licao2.id}"]`);
await p.waitForTimeout(200);
assert.ok(await p.locator("#licao.sem-fichas").count(), "lição nova abriu sem ficha nenhuma");
await p.click("#voltar");

await p.click(`[data-licao="${licao.id}"]`);   // essa já foi concluída lá em cima
await p.waitForTimeout(200);
assert.ok(await p.locator(".selo-revisao").count(), "lição feita não abriu em revisão");
const antes = await p.textContent("#s-xp");
let r = 0;
for (let volta = 0; volta < 60; volta++){
  if (await p.locator("#palco .fim").count()) break;
  const opcoes = p.locator("#palco .opc");
  if (await opcoes.count()){
    // erra a primeira de propósito (não pode custar ficha) e acerta o resto,
    // senão a pergunta errada volta pra fila e a revisão nunca termina
    const alvo = r === 0 ? (gabarito[0] === 0 ? 1 : 0)
               : (r < gabarito.length ? gabarito[r] : gabarito[0]);
    r++;
    await opcoes.nth(alvo).click();
    await p.locator("#fb-bt").click();
  } else await p.locator("#rodape .bt").click();
}
assert.ok(await p.locator("#segue").count(), "revisão não chegou ao fim");
await p.click("#segue");
await p.waitForTimeout(200);
assert.strictEqual(await p.textContent("#s-xp"), antes, "revisão pagou XP — vira farm");
assert.strictEqual(await p.textContent("#s-fichas"), "0/5", "revisão gastou ficha");

// as outras abas e a volta pra landing entram na mesma varredura de erro
for (const aba of ["ranking", "perfil", "trilha"]) await p.click(`[data-aba="${aba}"]`);
await p.locator(".ir-inicio:visible").first().click();   // topo no mobile, lateral no desktop
await p.waitForTimeout(200);
assert.ok(!await p.locator("#inicio.fora").count(), "botão da marca não voltou pra landing");

/* Layout web: no viewport largo a nav é lateral e o trilho da direita aparece
   com a missão do dia. Uma checagem só — o resto do CSS não é testável aqui. */
await p.setViewportSize({ width:1280, height:800 });
await p.locator("#entrar").click();
assert.ok(await p.locator("#rail .missao").isVisible(), "trilho não apareceu no desktop");
assert.ok((await p.locator(".side .nav").boundingBox()).height > 200, "nav não virou lateral");

/* Teclado: número escolhe a alternativa e Enter avança. É o caminho do desktop
   e não tem clique nenhum pra cobrir por acaso. */
await p.locator(`[data-licao="${licao.id}"]`).click();
for (let volta = 0; volta < 20; volta++){
  if (await p.locator("#palco .opc").count()) break;
  await p.keyboard.press("Enter");                 // telas de aula
  await p.waitForTimeout(120);
}
await p.keyboard.press(String(gabarito[0] + 1));
await p.waitForTimeout(120);
assert.ok(await p.locator("#palco .opc.certa").count(), "tecla numérica não respondeu");
p.once("dialog", d => d.accept());                 // Esc no meio da lição pergunta antes
await p.keyboard.press("Escape");
await p.waitForTimeout(300);
assert.ok(!await p.locator("#licao.on").count(), "Esc não fechou a lição");

await p.locator(".ir-inicio:visible").first().click();
await p.waitForTimeout(200);

/* A mesa da lição (.mesa, cartas.css) já foi sequestrada por uma classe de mesmo
   nome na landing: virou um feltro de 350px que empurrava as opções pra fora.
   Cartas do board têm que estar centradas numa caixa baixa. */
await p.evaluate(() => localStorage.setItem("trinca.v1", JSON.stringify(
  { xp:200, feitas:{f1:true,f2:true}, acertos:0, erros:0, streak:1, dia:null, vip:true })));
await p.reload();
await p.click("#entrar");                       // reload traz a landing de volta
await p.click(`[data-licao="f3"]`);
let conferiu = false;
for (let volta = 0; volta < 40; volta++){
  const board = p.locator("#palco .mesa");
  if (await board.count() && await p.locator("#palco .opc").count()){
    const caixa = await board.boundingBox();
    assert.ok(caixa.height < 200, "mesa da lição inflou: " + Math.round(caixa.height) + "px");
    const cartas = await p.locator("#palco .mesa .carta").first().boundingBox();
    const desvio = Math.abs((caixa.x + caixa.width/2) - (cartas.x + cartas.width/2));
    assert.ok(desvio < caixa.width/2 - 40, "cartas do board não estão centradas na mesa");
    conferiu = true;
    break;
  }
  if (await p.locator("#palco .opc").count()){
    await p.locator("#palco .opc").first().click();
    await p.locator("#fb-bt").click();
  } else await p.locator("#rodape .bt").click();
}

assert.ok(conferiu, "não chegou na pergunta com board — a checagem da mesa não rodou");
assert.deepStrictEqual(erros, [], "erro de runtime em algum dos caminhos");
await b.close();
console.log("ok — lição concluída (" + xp + " XP), fichas, abas e volta pra landing sem erro");

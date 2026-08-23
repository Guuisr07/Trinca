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

/* Caminho das fichas: errar 3 vezes tem que cair na tela "acabaram as fichas".
   É o outro ramo do mesmo motor, onde um erro igual se esconderia. */
await p.click(`[data-licao="${licao.id}"]`);
for (let volta = 0; volta < 30; volta++){
  if (await p.locator("#palco .fim").count()) break;
  const opcoes = p.locator("#palco .opc");
  if (await opcoes.count()){
    const errada = gabarito[0] === 0 ? 1 : 0;
    await opcoes.nth(errada).click();
    await p.locator("#fb-bt").click();
  } else await p.locator("#rodape .bt").click();
}
assert.ok(await p.locator("#denovo").count(), "3 erros não levaram à tela de fichas");
await p.click("#voltar");
await p.waitForTimeout(200);
assert.ok(!await p.locator("#licao.on").count(), "não voltou pra trilha");

// as outras abas e a volta pra landing entram na mesma varredura de erro
for (const aba of ["ranking", "perfil", "trilha"]) await p.click(`[data-aba="${aba}"]`);
await p.click("#ir-inicio");
await p.waitForTimeout(200);
assert.ok(!await p.locator("#inicio.fora").count(), "botão da marca não voltou pra landing");

assert.deepStrictEqual(erros, [], "erro de runtime em algum dos caminhos");
await b.close();
console.log("ok — lição concluída (" + xp + " XP), fichas, abas e volta pra landing sem erro");

/* O switch de tema tem que trocar o data-tema e sobreviver ao reload — é a
   parte que o script inline do <head> resolve antes da primeira pintura.

   Rodar:  node tests/tema.test.mjs   (precisa de npm run dev de pé) */
import { chromium } from "playwright";
import assert from "node:assert";

const b = await chromium.launch();
const p = await b.newPage({ colorScheme: "light" });
await p.goto("http://localhost:5173/");

const tema = () => p.evaluate(() => document.documentElement.dataset.tema);
assert.equal(await tema(), "light", "sem escolha salva, segue o sistema");

await p.click(".cabeca .troca-tema");
assert.equal(await tema(), "dark", "switch não trocou o tema");
assert.equal(await p.getAttribute(".cabeca .troca-tema", "aria-checked"), "true");

await p.reload();
assert.equal(await tema(), "dark", "escolha não sobreviveu ao reload");

await p.click("#entrar");            // a landing cobre o app até sair de cena
await p.waitForTimeout(700);
await p.click(".nav .troca-tema");    // o switch da nav é o mesmo componente
assert.equal(await tema(), "light");

/* Baralho: mesma regra do tema — escolha no perfil, aplicada no <html> e viva
   depois do reload. É o que faz a carta nascer certa antes da primeira pintura. */
const baralho = () => p.evaluate(() => document.documentElement.dataset.baralho);
assert.equal(await baralho(), "cheio", "sem escolha salva, o baralho é o colorido");

await p.click('.nav button[data-aba="perfil"]');
await p.click('[data-escolha-baralho="classico"]');
assert.equal(await baralho(), "classico", "clique não trocou o baralho");
assert.equal(await p.getAttribute('[data-escolha-baralho="classico"]', "aria-pressed"), "true");

await p.reload();
assert.equal(await baralho(), "classico", "escolha do baralho não sobreviveu ao reload");

/* A carta clássica é branca nos dois temas — se o naipe clareasse junto com o
   tema escuro, sumiria no branco. */
await p.click("#entrar");
await p.click('.nav button[data-aba="maos"]');
const fundo = await p.evaluate(() =>
  getComputedStyle(document.querySelector(".mao-linha .carta")).backgroundColor);
assert.equal(fundo, "rgb(255, 255, 255)", "carta clássica não ficou branca");

await b.close();
console.log("ok — tema e baralho trocam, persistem e nascem aplicados");

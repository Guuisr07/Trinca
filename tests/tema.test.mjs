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

await b.close();
console.log("ok — tema troca nos dois switches e persiste");

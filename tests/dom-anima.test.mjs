/* O Dom já ficou estático uma vez: <use> clona o <symbol> num shadow tree e
   seletor de folha externa não atravessa. Por isso as animações moram num
   <style> dentro do próprio <symbol>. Este teste falha se saírem de lá.

   Rodar:  node tests/dom-anima.test.mjs
   Precisa de playwright disponível (npx playwright ...). */
import { chromium } from "playwright";
import assert from "node:assert";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const b = await chromium.launch();
const p = await b.newPage();
await p.goto("file:///" + join(raiz, "index.html").replace(/\/g, "/"));
await p.waitForTimeout(300);

const rodando = new Set((await p.evaluate(() =>
  document.getAnimations().map(a => a.animationName))).filter(Boolean));
await b.close();

for (const n of ["dom-deal", "dom-sombra", "dom-flick", "dom-cabeca",
                 "dom-olha", "dom-respira", "dom-pisca"])
  assert.ok(rodando.has(n), `${n} não está rodando — mascote estático`);

console.log("ok —", [...rodando].filter(n => n.startsWith("dom-")).sort().join(", "));

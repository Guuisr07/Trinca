/* Regras de conteúdo e progressão. Roda sem navegador:
       node tests/regras.test.js
   Falha o processo se alguma invariante quebrar. */

import assert from "node:assert/strict";
import { TRILHAS } from "../data/trilhas.js";
import { S } from "../js/state.js";
import { liberadas } from "../js/progresso.js";

/* ---------- progressão ---------- */
S.feitas = {};
assert.equal(liberadas().f1, true, "primeira lição deve começar aberta");
assert.equal(liberadas().f2, false, "f2 travada antes de f1");

S.feitas = { f1: 1 };
assert.equal(liberadas().f2, true, "f2 abre depois de f1");
assert.equal(liberadas().p1, false, "trilha 2 só abre com a trilha 1 inteira");

TRILHAS[0].licoes.forEach(l => { S.feitas[l.id] = 1; });
assert.equal(liberadas().p1, true, "trilha 2 abre com a trilha 1 completa");

/* ---------- conteúdo ---------- */
const ordem = TRILHAS.flatMap(t => t.licoes);

for (const l of ordem){
  assert.ok(l.aula.length >= 3, `lição rasa demais: ${l.id}`);
  for (const q of l.q)
    assert.notEqual(q.o[q.c], undefined, `resposta correta fora do range em ${l.id}`);
}

/* Nenhuma pergunta pode cobrar conteúdo que ainda não foi ensinado. */
const ensinaMesa = ordem.findIndex(l => /comunitárias/.test(JSON.stringify(l.aula)));
assert.ok(ensinaMesa >= 0, "nenhuma lição ensina as cartas comunitárias");
ordem.forEach((l, i) => {
  for (const q of l.q)
    assert.ok(!(q.board || q.t === "mao") || i >= ensinaMesa,
      `pergunta usa a mesa antes da aula que a ensina: ${l.id}`);
});

console.log(`ok — ${ordem.length} lições, ${ordem.reduce((n, l) => n + l.q.length, 0)} perguntas`);

/* Conteúdo das trilhas (ADR-007). Sem browser.

   TypeScript já garante a forma — `satisfies Trilha[]` em content/trilhas.ts
   quebra o build se um campo faltar ou vier torto. O que sobra pra cá são as
   regras que tipo nenhum pega: id estável e único, pergunta com resposta
   dentro do range, nenhuma pergunta cobrando aula que ainda não veio, ícone
   registrado no bundle, e o data/trilhas.js do legado em dia.

   Rodar:  node tests/conteudo.test.mjs */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TRILHAS } from "../content/trilhas.ts";
import { NOMES_ICONE } from "../lib/icones.ts";
import { gerar } from "../tools/gerar-trilhas.mjs";

const licoes = TRILHAS.flatMap((t) => t.licoes);

/* ---------- id é para sempre ---------- */
{
  const vistos = new Set();
  for (const l of licoes) {
    assert.ok(/^[a-z][a-z0-9-]*$/.test(l.id), `id fora do padrão: ${l.id}`);
    assert.ok(!vistos.has(l.id), `id repetido: ${l.id}`);
    vistos.add(l.id);
    assert.ok(Number.isInteger(l.versao) && l.versao >= 1, `versão inválida em ${l.id}`);
  }

  const idsTrilha = TRILHAS.map((t) => t.id);
  assert.equal(new Set(idsTrilha).size, idsTrilha.length, "id de trilha repetido");
}

/* ---------- perguntas ---------- */
for (const l of licoes) {
  assert.ok(l.aula.length >= 3, `lição rasa demais: ${l.id}`);
  assert.ok(l.q.length >= 1, `lição sem pergunta: ${l.id}`);

  for (const q of l.q) {
    assert.ok(q.o.length >= 2, `pergunta com menos de duas alternativas em ${l.id}`);
    assert.notEqual(q.o[q.c], undefined, `resposta correta fora do range em ${l.id}`);
    assert.ok(q.e.length > 0, `pergunta sem explicação em ${l.id}`);
    /* Alternativa de mão é lista de cartas; de texto, string. Misturar as duas
       na mesma pergunta faz a tela desenhar carta onde era pra ter texto. */
    const formatos = new Set(q.o.map((o) => (Array.isArray(o) ? "mao" : "texto")));
    assert.equal(formatos.size, 1, `alternativas de formatos diferentes em ${l.id}`);
    assert.equal(
      formatos.has("mao"),
      q.t === "mao",
      `alternativa de cartas sem t:"mao" (ou o contrário) em ${l.id}`,
    );
  }
}

/* ---------- nada é cobrado antes de ser ensinado ---------- */
{
  const ensinaMesa = licoes.findIndex((l) => /comunitárias/.test(JSON.stringify(l.aula)));
  assert.ok(ensinaMesa >= 0, "nenhuma lição ensina as cartas comunitárias");
  licoes.forEach((l, i) => {
    for (const q of l.q) {
      assert.ok(
        !(q.board || q.t === "mao") || i >= ensinaMesa,
        `pergunta usa a mesa antes da aula que a ensina: ${l.id}`,
      );
    }
  });
}

/* ---------- ícones (ADR-005) ---------- */
{
  for (const l of licoes) {
    assert.ok(
      NOMES_ICONE.includes(l.icone),
      `lição ${l.id} usa o ícone "${l.icone}", que não está em lib/icones.ts — ` +
        `a tela renderiza um buraco no lugar`,
    );
  }
  for (const t of TRILHAS) {
    assert.ok(["e", "c", "o", "p"].includes(t.naipe), `naipe inválido na trilha ${t.id}`);
  }

  /* Nenhum emoji no conteúdo (ADR-005).

     ♠♥♦♣ ficam de fora da varredura: são dado de carta em qualquer lugar que
     apareçam, inclusive no meio de uma frase ("Você recebe K♠ e K♥"). O
     Unicode os classifica como pictográficos, mas o problema que a regra
     ataca — arte do sistema operacional entrando no lugar do desenho da
     marca — se resolve forçando apresentação de texto no CSS, não tirando o
     símbolo do conteúdo. */
  const texto = JSON.stringify(TRILHAS).replace(/[♠-♧]/g, "");
  const emoji = texto.match(/\p{Extended_Pictographic}/gu);
  assert.equal(
    emoji,
    null,
    `emoji no conteúdo: ${emoji?.join(" ")} — use nome de ícone lucide (ADR-005)`,
  );
}

/* ---------- o legado segue em dia ---------- */
{
  const emDisco = readFileSync(new URL("../data/trilhas.js", import.meta.url), "utf8");
  assert.equal(
    emDisco,
    gerar(),
    "data/trilhas.js está fora de sincronia com content/trilhas.ts — " +
      "rode `node tools/gerar-trilhas.mjs`",
  );
}

console.log(
  `ok — conteúdo: ${licoes.length} lições, ` +
    `${licoes.reduce((n, l) => n + l.q.length, 0)} perguntas, ids, ícones e legado em dia`,
);

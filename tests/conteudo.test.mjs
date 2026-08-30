/* Conteúdo das trilhas (ADR-007). Sem browser.

   TypeScript já garante a forma — `satisfies Trilha[]` em content/trilhas.ts
   quebra o build se um campo faltar ou vier torto. O que sobra pra cá são as
   regras que tipo nenhum pega: id estável e único, pergunta com resposta
   dentro do range, nenhuma pergunta cobrando aula que ainda não veio, ícone
   registrado no bundle.

   Rodar:  node tests/conteudo.test.mjs */

import assert from "node:assert/strict";
import { TRILHAS } from "../content/trilhas.ts";
import { MAOS } from "../content/maos.ts";
import { NOMES_ICONE } from "../lib/icones.ts";

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

/* ---------- ranking das mãos ---------- */
{
  /* A ordem é a regra: sem campo de força, quem manda é o índice. Se alguém
     inserir uma mão no meio, estes dois asserts é que avisam. */
  assert.equal(MAOS.at(0).id, "carta-alta", "a lista tem que começar na mão mais fraca");
  assert.equal(MAOS.at(-1).id, "royal-flush", "a lista tem que terminar na mão mais forte");

  const vistos = new Set();
  for (const m of MAOS) {
    assert.ok(/^[a-z][a-z0-9-]*$/.test(m.id), `id de mão fora do padrão: ${m.id}`);
    assert.ok(!vistos.has(m.id), `id de mão repetido: ${m.id}`);
    vistos.add(m.id);
    assert.ok(m.como.length > 0, `mão sem explicação: ${m.id}`);
    /* Cinco cartas sempre: mão de poker é de cinco, e a tela desenha o que vier. */
    assert.equal(m.exemplo.length, 5, `mão ${m.id} não tem 5 cartas`);
    for (const c of m.exemplo) {
      assert.match(c, /^(10|[2-9]|[AKQJ])[♠♥♦♣]$/, `carta inválida em ${m.id}: ${c}`);
    }
  }
}

console.log(
  `ok — conteúdo: ${licoes.length} lições, ${MAOS.length} mãos, ` +
    `${licoes.reduce((n, l) => n + l.q.length, 0)} perguntas, ids e ícones ok`,
);

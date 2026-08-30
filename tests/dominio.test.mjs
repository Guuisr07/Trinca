/* Domínio puro (ADR-003): fichas, XP, sequência e progressão da trilha.
   Sem browser, sem jsdom, sem localStorage — entra dado, sai dado, e o
   relógio é um número que este arquivo controla.

   É a trava de qualidade da migração: as mesmas invariantes que
   fichas.test.mjs e regras.test.js cobrem no app legado, cobertas aqui contra
   o código novo. Enquanto os dois passarem, o port está fiel.

   O conteúdo em si é assunto de tests/conteudo.test.mjs — aqui ele entra só
   como insumo das regras de progressão.

   Node 24 executa .ts direto (type stripping) — nenhum passo de build.
   Rodar:  node tests/dominio.test.mjs */

import assert from "node:assert/strict";
import { TRILHAS } from "../content/trilhas.ts";
import {
  MAX_FICHAS,
  RECARGA_MS,
  fichasAgora,
  formatarEspera,
  gastarFicha,
  normalizarFichas,
  proximaFichaEm,
} from "../lib/dominio/fichas.ts";
import {
  META_DIA,
  concluirLicao,
  feitasCount,
  marcarDia,
  progressoPadrao,
  xpDaLicao,
  xpDeHoje,
} from "../lib/dominio/progresso.ts";
import {
  acharLicao,
  liberadas,
  proximaLicao,
  todasLicoes,
  totalLicoes,
  xpPossivel,
} from "../lib/dominio/trilha.ts";

const T0 = 1_700_000_000_000;

/* ---------- fichas: gasto ---------- */
{
  let p = progressoPadrao();
  assert.equal(fichasAgora(p, T0), MAX_FICHAS, "começa com o lote cheio");
  assert.equal(proximaFichaEm(p, T0), 0, "lote cheio não espera nada");

  p = gastarFicha(p, T0);
  assert.equal(p.vidas, MAX_FICHAS - 1, "erro custa uma ficha");
  assert.equal(p.gastaEm, T0, "o relógio começa no primeiro erro");
  assert.equal(proximaFichaEm(p, T0), RECARGA_MS, "espera cheia logo após o erro");

  /* Errar de novo não pode reiniciar a contagem — senão quem erra em sequência
     nunca recarrega. */
  const meia = T0 + RECARGA_MS / 2;
  p = gastarFicha(p, meia);
  assert.equal(p.vidas, MAX_FICHAS - 2, "segundo erro custa outra ficha");
  assert.equal(
    proximaFichaEm(p, meia),
    RECARGA_MS / 2,
    "o relógio não reiniciou no segundo erro",
  );

  /* ---------- fichas: recarga ---------- */
  assert.equal(
    fichasAgora(p, T0 + RECARGA_MS),
    MAX_FICHAS - 1,
    "meia hora devolve exatamente uma ficha",
  );

  const muitoDepois = T0 + RECARGA_MS * 11;
  assert.equal(fichasAgora(p, muitoDepois), MAX_FICHAS, "lote enche, não estoura");
  assert.equal(
    normalizarFichas(p, muitoDepois).gastaEm,
    null,
    "lote cheio solta o relógio",
  );
}

/* ---------- fichas: zerar ---------- */
{
  let p = progressoPadrao();
  for (let i = 0; i < MAX_FICHAS; i++) p = gastarFicha(p, T0);
  assert.equal(fichasAgora(p, T0), 0, "cinco erros zeram o lote");
  assert.equal(gastarFicha(p, T0).vidas, 0, "no zero não dá pra ficar devendo ficha");
  assert.ok(proximaFichaEm(p, T0) > 0, "zerado, há tempo pra esperar");

  assert.equal(
    fichasAgora(p, T0 + RECARGA_MS * 3 + 1000),
    3,
    "três meias horas devolvem três fichas, não mais",
  );
}

/* ---------- fichas: pureza ---------- */
{
  const p = progressoPadrao();
  const copia = structuredClone(p);
  gastarFicha(p, T0);
  fichasAgora(p, T0 + RECARGA_MS * 5);
  assert.deepEqual(p, copia, "nenhuma função de ficha muta o estado que recebeu");
}

/* ---------- fichas: Trinca+ ---------- */
{
  let p = { ...progressoPadrao(), vip: true };
  p = gastarFicha(p, T0);
  p = gastarFicha(p, T0);
  assert.equal(fichasAgora(p, T0), MAX_FICHAS, "Trinca+ não gasta ficha");
  assert.equal(proximaFichaEm(p, T0), 0, "Trinca+ não espera recarga");
}

/* ---------- contador ---------- */
assert.equal(formatarEspera(12 * 60000 + 43000), "12:43");
assert.equal(formatarEspera(59 * 1000), "0:59");
assert.equal(formatarEspera(64 * 60000), "1h04");

/* ---------- sequência de dias ---------- */
{
  const DIA = 864e5;
  let p = marcarDia(progressoPadrao(), T0);
  assert.equal(p.streak, 1, "primeiro dia começa a sequência em 1");

  p = marcarDia(p, T0 + 60_000);
  assert.equal(p.streak, 1, "marcar duas vezes no mesmo dia é idempotente");

  p = marcarDia(p, T0 + DIA);
  assert.equal(p.streak, 2, "dia seguinte soma na sequência");

  p = marcarDia(p, T0 + DIA * 3);
  assert.equal(p.streak, 1, "pular um dia zera a sequência");
}

/* ---------- XP do dia ---------- */
{
  let p = concluirLicao(progressoPadrao(), "f1", 5, false, T0);
  assert.equal(p.xp, 20, "lição sem erro paga base + bônus por acerto de primeira");
  assert.equal(xpDeHoje(p, T0), 20, "o XP do dia conta hoje");
  assert.equal(
    xpDeHoje(p, T0 + 864e5),
    0,
    "o XP do dia zera na virada, mesmo sem ninguém marcar o dia",
  );
  assert.ok(META_DIA <= 20, "a meta do dia cabe em uma lição");

  const revisao = concluirLicao(p, "f1", 5, true, T0);
  assert.equal(revisao.xp, p.xp, "revisão não paga XP");
  assert.equal(xpDaLicao(0, false), 10, "errar tudo ainda paga a base");
}

/* ---------- progressão da trilha ---------- */
{
  const vazio = progressoPadrao();
  const abertas = liberadas(TRILHAS, vazio);
  assert.equal(abertas.f1, true, "primeira lição deve começar aberta");
  assert.equal(abertas.f2, false, "f2 travada antes de f1");
  assert.equal(proximaLicao(TRILHAS, vazio)?.licao.id, "f1", "começa pela f1");

  const comF1 = { ...vazio, feitas: { f1: 1 } };
  assert.equal(liberadas(TRILHAS, comF1).f2, true, "f2 abre depois de f1");
  assert.equal(liberadas(TRILHAS, comF1).p1, false, "trilha 2 só abre com a 1 inteira");
  assert.equal(proximaLicao(TRILHAS, comF1)?.licao.id, "f2", "continua de onde parou");

  const feitas = {};
  for (const l of TRILHAS[0].licoes) feitas[l.id] = 1;
  const trilha1Ok = { ...vazio, feitas };
  assert.equal(liberadas(TRILHAS, trilha1Ok).p1, true, "trilha 2 abre com a 1 completa");
  assert.equal(feitasCount(trilha1Ok), TRILHAS[0].licoes.length, "conta as concluídas");

  /* `feitas` aceita 1 (histórico) e true (gravado hoje) — quem lê usa `feita()`. */
  assert.equal(
    liberadas(TRILHAS, { ...vazio, feitas: { f1: true } }).f2,
    true,
    "conclusão gravada como true vale igual à gravada como 1",
  );
}

/* ---------- consultas da trilha ---------- */
{
  const ordem = todasLicoes(TRILHAS);
  assert.equal(totalLicoes(TRILHAS), ordem.length, "o total bate com a lista");
  assert.equal(acharLicao(TRILHAS, "f1")?.id, "f1", "acha lição por id");
  assert.equal(acharLicao(TRILHAS, "naoexiste"), null, "id inexistente devolve null");
  for (const l of ordem) {
    assert.equal(xpPossivel(l), 10 + l.q.length * 2, `XP possível errado em ${l.id}`);
  }
}

const licoes = TRILHAS.flatMap((t) => t.licoes);
console.log(
  `ok — domínio: fichas, XP, sequência e progressão em ` +
    `${TRILHAS.length} trilhas / ${licoes.length} lições`,
);

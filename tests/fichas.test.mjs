/* Recarga das fichas. Sem browser: é conta de relógio, e conta de relógio
   quebra em silêncio — o sintoma aparece só meia hora depois, na mão do
   usuário. Aqui o relógio é falso e o erro aparece na hora.

   Rodar:  node tests/fichas.test.mjs */
import assert from "node:assert";
import { S, MAX_VIDAS, RECARGA_MS, vidasAgora, perderVida,
         proximaVidaEm, formatarEspera } from "../js/state.js";

/* Relógio de mentira: o state lê Date.now() e nada mais. */
const relogioReal = Date.now;
let agora = 1_700_000_000_000;
Date.now = () => agora;
const avancar = ms => { agora += ms; };

function reset(){
  Object.assign(S, { vidas:MAX_VIDAS, gastaEm:null, vip:false });
}

/* --- gastar --- */
reset();
assert.strictEqual(vidasAgora(), MAX_VIDAS, "começa com o lote cheio");
assert.strictEqual(proximaVidaEm(), 0, "lote cheio não espera nada");

perderVida();
assert.strictEqual(S.vidas, MAX_VIDAS - 1, "erro custa uma ficha");
assert.strictEqual(S.gastaEm, agora, "o relógio começa no primeiro erro");
assert.strictEqual(proximaVidaEm(), RECARGA_MS, "espera cheia logo após o erro");

/* Errar de novo não pode reiniciar a contagem — senão quem erra em sequência
   nunca recarrega. */
avancar(RECARGA_MS / 2);
perderVida();
assert.strictEqual(S.vidas, MAX_VIDAS - 2, "segundo erro custa outra ficha");
assert.strictEqual(proximaVidaEm(), RECARGA_MS / 2, "o relógio não reiniciou no segundo erro");

/* --- recarregar --- */
avancar(RECARGA_MS / 2);
assert.strictEqual(vidasAgora(), MAX_VIDAS - 1, "meia hora devolve exatamente uma ficha");

avancar(RECARGA_MS * 10);
assert.strictEqual(vidasAgora(), MAX_VIDAS, "muito tempo depois o lote está cheio, não estourado");
assert.strictEqual(S.gastaEm, null, "lote cheio solta o relógio");

/* --- zerar --- */
reset();
for (let i = 0; i < MAX_VIDAS; i++) perderVida();
assert.strictEqual(vidasAgora(), 0, "cinco erros zeram o lote");
assert.strictEqual(perderVida(), 0, "no zero não dá pra ficar devendo ficha");
assert.ok(proximaVidaEm() > 0, "zerado, há tempo pra esperar");

avancar(RECARGA_MS * 3 + 1000);
assert.strictEqual(vidasAgora(), 3, "três meias horas devolvem três fichas, não mais");

/* --- vip --- */
reset();
S.vip = true;
perderVida(); perderVida();
assert.strictEqual(vidasAgora(), MAX_VIDAS, "Trinca+ não gasta ficha");
assert.strictEqual(proximaVidaEm(), 0, "Trinca+ não espera recarga");

/* --- contador --- */
assert.strictEqual(formatarEspera(12 * 60000 + 43000), "12:43");
assert.strictEqual(formatarEspera(59 * 1000), "0:59");
assert.strictEqual(formatarEspera(64 * 60000), "1h04");

Date.now = relogioReal;
console.log("ok — fichas: gasto, recarga por tempo, teto, zero e Trinca+");

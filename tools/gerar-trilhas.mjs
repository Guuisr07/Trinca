/* Gera data/trilhas.js a partir de content/trilhas.ts.

   Existe porque o conteúdo tem uma fonte só (ADR-007) e o app legado é ES
   modules no browser — não lê .ts. Enquanto os dois convivem (até o passo 5
   da ADR-012), quem edita lição edita `content/` e roda isto.

   A tradução de volta pra emoji é de propósito: o legado imprime `icone` como
   texto. Some junto com data/trilhas.js no passo 5.

   Rodar:  node tools/gerar-trilhas.mjs
   Conferir sem escrever:  node tools/gerar-trilhas.mjs --conferir */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { TRILHAS } from "../content/trilhas.ts";

const DESTINO = fileURLToPath(new URL("../data/trilhas.js", import.meta.url));

const CARACTERE_NAIPE = { e: "♠", c: "♥", o: "♦", p: "♣" };

/* Nome do ícone lucide -> o emoji que o legado desenha. */
const EMOJI_LEGADO = {
  Layers: "\u{1F0A1}",
  RefreshCw: "\u{1F504}",
  Crown: "\u{1F451}",
  Hand: "\u{1F3AF}",
  Armchair: "\u{1FA91}",
  WalletCards: "\u{1F0CF}",
  Split: "\u{1F6A6}",
};

function paraLegado(trilha) {
  const emBreve = trilha.embreve ? { embreve: true } : {};
  return {
    id: trilha.id,
    nome: trilha.nome,
    icone: CARACTERE_NAIPE[trilha.naipe],
    ...emBreve,
    desc: trilha.desc,
    licoes: trilha.licoes.map((licao) => {
      const emoji = EMOJI_LEGADO[licao.icone];
      if (!emoji) {
        throw new Error(
          `lição ${licao.id} usa o ícone "${licao.icone}", que não tem emoji ` +
            `equivalente pro legado. Registre em EMOJI_LEGADO ou espere o passo 5.`,
        );
      }
      // `versao` fica de fora: o legado não sabe o que fazer com ela
      return { id: licao.id, titulo: licao.titulo, icone: emoji, aula: licao.aula, q: licao.q };
    }),
  };
}

export function gerar() {
  return (
    "/* GERADO por tools/gerar-trilhas.mjs — não editar na mão.\n" +
    "   A fonte do conteúdo é content/trilhas.ts (ADR-007). Editou aqui? O\n" +
    "   próximo `node tools/gerar-trilhas.mjs` apaga, e o teste de conteúdo\n" +
    "   falha antes disso. */\n" +
    "export const TRILHAS = " +
    JSON.stringify(TRILHAS.map(paraLegado), null, 1) +
    ";\n"
  );
}

export function conferir() {
  return readFileSync(DESTINO, "utf8") === gerar();
}

/* Só age quando chamado na linha de comando. Importar este módulo não pode
   escrever em disco — o teste de conteúdo importa `gerar()` pra comparar. */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (process.argv.includes("--conferir")) {
    if (!conferir()) {
      console.error("data/trilhas.js está fora de sincronia com content/trilhas.ts.");
      console.error("Rode: node tools/gerar-trilhas.mjs");
      process.exit(1);
    }
    console.log("ok — data/trilhas.js em dia com o conteúdo");
  } else {
    writeFileSync(DESTINO, gerar());
    console.log("escrito:", DESTINO);
  }
}

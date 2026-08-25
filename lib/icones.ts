/* Ícones que o app empacota (ADR-005).

   A lista mora aqui, sem JSX, por dois motivos: o teste de conteúdo consegue
   importar (Node roda .ts, não .tsx), e `components/Icone.tsx` tipa o mapa
   por ela — faltou um nome no mapa, o build quebra.

   Ícone novo no conteúdo entra em dois lugares: nesta lista e no mapa do
   Icone.tsx. Esquecer o segundo não compila; esquecer o primeiro falha em
   tests/conteudo.test.mjs. */

export const NOMES_ICONE = [
  // ícones de lição
  "Armchair",
  "Crown",
  "Hand",
  "Layers",
  "RefreshCw",
  "Split",
  "WalletCards",
  // ícones de interface
  "Flame",
  "Lock",
  "Map",
  "Target",
  "Trophy",
  "Zap",
] as const;

export type NomeIcone = (typeof NOMES_ICONE)[number];

export function ehNomeIcone(nome: string): nome is NomeIcone {
  return (NOMES_ICONE as readonly string[]).includes(nome);
}

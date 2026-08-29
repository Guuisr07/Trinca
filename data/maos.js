/* GERADO por tools/gerar-trilhas.mjs — não editar na mão.
   A fonte do conteúdo é content/ (ADR-007). Editou aqui? O próximo
   `node tools/gerar-trilhas.mjs` apaga, e o teste de conteúdo falha
   antes disso. */
export const MAOS = [
 {
  "id": "carta-alta",
  "nome": "Carta alta",
  "exemplo": [
   "A♠",
   "K♦",
   "9♣",
   "6♥",
   "3♠"
  ],
  "como": "Nada formado. Vale a carta mais alta — aqui, o Ás."
 },
 {
  "id": "par",
  "nome": "Um par",
  "exemplo": [
   "9♠",
   "9♥",
   "K♦",
   "7♣",
   "3♠"
  ],
  "como": "Duas cartas do mesmo valor."
 },
 {
  "id": "dois-pares",
  "nome": "Dois pares",
  "exemplo": [
   "J♠",
   "J♥",
   "4♦",
   "4♣",
   "K♠"
  ],
  "como": "Dois pares diferentes na mesma mão."
 },
 {
  "id": "trinca",
  "nome": "Trinca",
  "exemplo": [
   "7♠",
   "7♥",
   "7♦",
   "Q♣",
   "2♠"
  ],
  "como": "Três cartas do mesmo valor."
 },
 {
  "id": "sequencia",
  "nome": "Sequência",
  "exemplo": [
   "5♠",
   "6♥",
   "7♦",
   "8♣",
   "9♠"
  ],
  "como": "Cinco valores em ordem, naipe misturado."
 },
 {
  "id": "flush",
  "nome": "Flush",
  "exemplo": [
   "A♥",
   "J♥",
   "8♥",
   "5♥",
   "2♥"
  ],
  "como": "Cinco cartas do mesmo naipe, em qualquer ordem."
 },
 {
  "id": "full-house",
  "nome": "Full house",
  "exemplo": [
   "K♠",
   "K♥",
   "K♦",
   "7♣",
   "7♠"
  ],
  "como": "Trinca + par. Lê-se \"reis full de setes\"."
 },
 {
  "id": "quadra",
  "nome": "Quadra",
  "exemplo": [
   "4♠",
   "4♥",
   "4♦",
   "4♣",
   "9♠"
  ],
  "como": "As quatro cartas do mesmo valor."
 },
 {
  "id": "straight-flush",
  "nome": "Straight flush",
  "exemplo": [
   "6♣",
   "7♣",
   "8♣",
   "9♣",
   "10♣"
  ],
  "como": "Sequência toda do mesmo naipe."
 },
 {
  "id": "royal-flush",
  "nome": "Royal flush",
  "exemplo": [
   "A♠",
   "K♠",
   "Q♠",
   "J♠",
   "10♠"
  ],
  "como": "A sequência mais alta, toda do mesmo naipe. A melhor mão do poker."
 }
];

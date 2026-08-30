# Trinca

Poker do zero em lições de 3 minutos.

Next 16 + React 19 + TypeScript strict + Tailwind v4.
Decisões técnicas em [`ARQUITETURA.md`](ARQUITETURA.md), visual em [`DESIGN.md`](DESIGN.md).

## Rodar

```bash
npm install
npm run dev       # http://localhost:3000
```

## Testar

```bash
npm test          # domínio + conteúdo, sem servidor
npm run build     # produção (o que o Netlify roda)
```

- `dominio.test.mjs` — fichas, XP, sequência de dias e progressão. Relógio é parâmetro.
- `conteudo.test.mjs` — id estável e único, resposta dentro do range, ícone registrado, nada de emoji.

## Estrutura

```
app/                Next.js (layout, page, globals.css com tokens)
components/         telas e componentes React
content/
  trilhas.ts        fonte do conteúdo — lição nova entra aqui (ADR-007)
  maos.ts           ranking das mãos
lib/
  estado.ts         contexto React + localStorage (trinca.v1)
  tema.ts           chave trinca.tema, script inline no <head>
  icones.ts         nomes de ícone empacotados (ADR-005)
  dominio/          regras puras em TS: fichas, progresso, trilha (ADR-003)
css/                estilos legados — componentes React importam via globals.css
assets/
  trinca-logo.png   folha original do logo + poses do Dom Naipe
  marca/            peças recortadas: lockup, símbolo, wordmark, poses
public/assets/      cópia estática pra Next servir
tools/
  cortar-logo.mjs   recorta a folha em PNGs com fundo transparente
tests/
```

## Deploy

Netlify, no push da `main`. `npm run build` → Next.js static export.

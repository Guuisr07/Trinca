# Arquitetura do Trinca

Registro das decisões técnicas e do porquê de cada uma. **Uma decisão por
bloco, com data e alternativa descartada.** Mudou de ideia? Não apaga —
acrescenta um bloco novo marcando qual ADR ele substitui. O valor do arquivo
está em saber por que não fizemos do outro jeito.

`DESIGN.md` manda no visual. Este arquivo manda na estrutura.

**Status atual:** passos 1 e 2 da ADR-012 entregues em 24/08/2026 — andaime
Next 16 + React 19 + TS strict + Tailwind v4 com os tokens do `DESIGN.md`, e o
domínio (fichas, XP, sequência, progressão) portado pra `lib/dominio/` em TS
puro. ADR-001 a ADR-005, ADR-010 e ADR-013 viraram decidido; o resto segue
proposta. O app de verdade ainda é o HTML puro — roda em `npm run dev:atual`
até o passo 5.

---

## ADR-001 — Framework: React sobre Vue

*24/08/2026 — decidido*

O app sai de HTML + ES modules nativos para **React**.

### Vue — o que ganharíamos

O `<template>` de um SFC é o HTML que já está escrito. A migração seria quase
recortar e colar: `js/telas.js` monta string de HTML hoje, e template de Vue é
string de HTML com diretiva. Reatividade é automática — `ref()` e pronto, sem
`useMemo`, sem regra de dependência, sem re-render surpresa. Menos conceito por
linha de código, e num projeto de uma pessoa isso é dinheiro. Nuxt cobre tudo
que o Next cobre: SSR, rotas de servidor, layouts, geração estática.

### Vue — o que custaria

Ecossistema menor onde importa mais: Stripe, Supabase, Clerk, PostHog — todo
SDK de terceiro documenta React primeiro e Vue depois, quando documenta. Toda
biblioteca de componente acessível séria (Radix, shadcn/ui inteiro) é React.
E, o ponto decisivo pra este projeto: **o volume de React nos dados de treino é
maior**, então o código que a IA escreve em React sai mais certo na primeira.
Num app tocado por uma pessoa com assistência de IA, isso é multiplicador de
velocidade, não detalhe.

### React — o custo que aceitamos

Mais cerimônia. Re-render que precisa de atenção. Decisão demais em cada
esquina (qual roteador, qual estado, qual formulário) — mitigada porque este
arquivo trava essas escolhas de uma vez.

### Por que React ganhou

Trinca vai ter login, assinatura e social. Cada um desses é um SDK de terceiro,
e cada SDK é React-first. Somado à qualidade de geração assistida, React reduz
o tempo até o produto vendável — que é a régua que interessa nesta fase.

**Se o Trinca fosse só o app de lição, sem cobrança e sem conta, Vue seria a
escolha certa.** Não é o caso.

---

## ADR-002 — Next.js App Router, não SPA pura

*24/08/2026 — decidido*

Vite + React seria mais leve. Não escolhemos porque três coisas exigem
servidor, e todas chegam nos próximos meses:

1. **Landing indexável.** A distribuição vem de conteúdo (SEO/GEO já tem skill
   no MazyOS). Landing e artigo precisam de HTML renderizado no servidor.
2. **Webhook do Stripe.** Assinatura precisa de endpoint que o Stripe chama.
   SPA não tem endpoint.
3. **Autoridade de tempo.** A recarga de ficha é calculada por relógio do
   cliente hoje (ver ADR-009). Relógio de cliente é editável.

Com Vite viriam dois deploys e dois lugares de configuração. Com Next é um.
**Route Handlers são o backend** — não existe serviço separado até que alguma
coisa prove que precisa.

Marketing (`/`, `/blog/*`) é estático ou ISR. O app (`/app/*`) é client-side,
autenticado, sem SSR — é tela de jogo, não página de conteúdo.

TypeScript em modo `strict` desde o primeiro arquivo. Lição tem formato, e
formato errado em conteúdo é bug que só aparece pro usuário.

---

## ADR-003 — A lógica de domínio não sabe que React existe

*24/08/2026 — decidido*

**A decisão mais importante do arquivo.**

`fichas`, `progresso`, `xp`, `streak` e as regras de mão viram módulos
TypeScript puros em `lib/dominio/`. Entra dado, sai dado. Sem `import react`,
sem hook, sem acesso a `localStorage`, sem `Date.now()` escondido — o instante
entra por parâmetro.

```ts
// lib/dominio/fichas.ts
export function fichasAgora(estado: Progresso, agora: number): number
export function gastarFicha(estado: Progresso, agora: number): Progresso
```

O que isso compra:

- O teste do domínio é `node tests/dominio.test.mjs` e nada mais — sem jsdom,
  sem Testing Library, sem runner, milissegundos. As invariantes do legado
  foram reescritas contra a API pura em vez de reaproveitadas: a assinatura
  mudou (`agora` entra por parâmetro, estado sai novo), então copiar o arquivo
  não daria. Os dois convivem até o passo 5 — enquanto os dois passam, o port
  está fiel, e é isso que os torna a trava de qualidade
- A mesma função roda no servidor quando a recarga de ficha precisar de
  autoridade de tempo (ADR-009). Uma implementação, dois lugares
- Trocar React por outra coisa em 2029 custa a camada de tela, não o produto

React fica com o que é dele: pintar e capturar clique.

### O que o port revelou (24/08/2026)

**Nome de campo é contrato com o disco.** O domínio fala "ficha", mas o campo
continua `vidas` — junto com `gastaEm`, `feitas`, `xpHoje` e `dia`. Esses nomes
já estão gravados no `localStorage` de quem usa o app. Renomear pra ficar
bonito apagaria o progresso de todo mundo na virada. O mesmo vale pro `dia`,
que é `toDateString()` e não ISO: trocar o formato zeraria a sequência de
todos. Vocabulário novo entra nos nomes de função, nunca nos campos
persistidos.

**Estado novo em vez de mutação.** O legado muta um `S` compartilhado e chama
`salvar()`. As funções puras devolvem objeto novo — e devolvem o *mesmo* objeto
quando nada mudou, então dá pra comparar por referência e evitar repintura. É o
que React espera; mutar objeto compartilhado não dispara render.

**`feitas` aceita `1` e `true`.** Histórico do app legado grava os dois. Quem
lê usa `feita()`, nunca `p.feitas[id] === true`. Teste cobre os dois formatos.

---

## ADR-004 — Tailwind v4 com os tokens do `DESIGN.md`

*24/08/2026 — decidido*

Tailwind v4 configura tema em CSS, não em `tailwind.config.js`. Isso encaixa
com o que já existe: `css/base.css` tem os tokens em `:root` e
`:root[data-tema="dark"]`. Os dois blocos foram copiados inteiros pra
`app/globals.css`, com os mesmos nomes.

**`@theme inline` é o detalhe que faz o tema funcionar.** Sem `inline`, o
Tailwind resolve o token em tempo de build e congela a cor clara na classe —
o tema escuro morre. Com `inline`, o utilitário emite `var(--bg)` e quem troca
a cor é a cascata do `[data-tema]`:

```css
:root            { --bg:#FAF3E6 }
:root[data-tema="dark"] { --bg:#141024 }

@theme inline { --color-bg: var(--bg); }   /* bg-bg → background: var(--bg) */
```

A regra do `DESIGN.md` continua valendo com força total: **cor fora de token é
dívida.** Em Tailwind isso vira: proibido `bg-[#F5B82E]`, proibido
`text-yellow-400`. Só `bg-brass`, `text-naipe-c`. A paleta padrão do Tailwind
não é a paleta do Trinca — usar ela é errar a marca sem perceber.

Segunda armadilha, mais silenciosa: **classe interpolada não existe.** O
Tailwind lê o código como texto, então `bg-${cor}` não gera regra nenhuma e a
tela sai sem cor, sem erro. Nome de classe se escreve por extenso.

Tema escuro pelo atributo `data-tema` que já existe, via
`@custom-variant dark ([data-tema="dark"] &)`. Não usar `prefers-color-scheme`
sozinho — ele decide só o primeiro carregamento, no script inline do
`app/layout.tsx`; depois disso quem manda é a escolha do usuário.

Sombra sólida do Flat 2.0 vira token de tema (`shadow-plana` pro cartão,
`shadow-brass` pro botão) e o botão de ação inteiro vira `@utility bt-flat`.
É a assinatura visual — não pode depender de cada tela lembrar.

`css/cartas.css` e a mecânica de virar carta ficam em CSS de verdade, fora do
Tailwind. Animação de 40 linhas dentro de `className` é ilegível.

---

## ADR-005 — Ícone é SVG, emoji não entra

*24/08/2026 — decidido*

Regra completa em `.claude/skills/icones-svg/SKILL.md`, no workspace do MazyOS.
Resumo: `lucide-react` pra interface, SVG próprio em `components/icons/` pra
naipe, ficha e coroa. Emoji não renderiza igual entre sistemas, não aceita
`currentColor` (logo não vira no tema escuro) e polui leitor de tela.

Inventário atual a substituir: `js/telas.js` (7 ícones), `data/bots.js`
(9 avatares), `data/trilhas.js` (6 ícones de trilha). Os `♠♥♦♣` de
`data/trilhas.js` são **dado de carta**, continuam como caractere e viram
`<Naipe />` só na renderização.

---

## ADR-006 — Supabase como backend

*24/08/2026 — proposta*

Login, perfil, progresso, ranking, assinatura e social pedem banco. Escolha:
**Supabase** — Postgres gerenciado, com Auth, Row Level Security, Realtime e
Storage no mesmo lugar.

Por quê ele:

- Postgres de verdade embaixo. Ranking com função de janela, streak com CTE,
  tudo é SQL normal. Se um dia sair do Supabase, sai com `pg_dump` — não tem
  lock-in de modelo de dados
- RLS resolve autorização no banco. Sem RLS, cada rota precisa lembrar de
  filtrar por usuário, e a que esquecer vaza tudo
- Realtime já vem, e é o que a parte social (amigo, desafio, liga viva) vai
  querer sem construir WebSocket

Descartados: Firebase (sair dele é reescrever, e agregação de ranking em NoSQL
é dor), Convex (ótimo DX, ecossistema novo demais pra apostar sozinho), backend
próprio (não tem problema aqui que justifique manter servidor de pé).

Chave de serviço **só** em Route Handler. O cliente usa a chave anônima e vive
sob RLS. Toda tabela nasce com RLS ligada — a política é escrita junto com a
migration, nunca depois.

---

## ADR-007 — Conteúdo mora no repositório, não em CMS

*24/08/2026 — proposta*

Trilha e lição continuam sendo arquivo versionado, agora em
`content/trilhas/*.ts` com esquema Zod. Não vai pro banco e não vai pra CMS.

Por quê:

- Conteúdo é o produto. Revisar lição em pull request é revisão de verdade; em
  painel de CMS é ninguém revisando
- Zod pega lição quebrada no build, não em produção
- Uma pessoa escreve o conteúdo. CMS existe pra quem não mexe em código

O que **precisa** existir desde já:

```ts
{ id: "preflop-01", versao: 2, ... }   // id estável, nunca posição na lista
```

**Progresso salvo por `id`, jamais por índice.** Se `feitas` guardar posição,
inserir uma lição no meio da trilha reescreve o histórico de todo mundo. Esse é
o bug caro que só aparece depois de ter usuário. `data/trilhas.js` hoje tem
~141 linhas e ainda dá pra corrigir de graça.

Quando as trilhas passarem de ~50 lições, carregar por trilha em vez de tudo de
uma vez — mas só quando doer.

---

## ADR-008 — Progresso local-first, sincronizado

*24/08/2026 — proposta*

`localStorage` **não** é substituído por banco. Continua sendo a fonte que a
tela lê; o servidor vira o espelho durável.

Fluxo: escreve local, marca sujo, empurra pro Supabase quando dá. Sem conta,
funciona igual funciona hoje — e no login o progresso anônimo é reconciliado
com o da conta (regra: XP soma, lição feita é união, streak fica a maior).

Isso preserva o que já funciona bem: lição não trava por rede ruim, e
experimentar o app não exige cadastro. Cadastro é a etapa de cobrar, não de
entrar.

Estado no cliente:

- **Servidor** — TanStack Query. Ranking, perfil, assinatura
- **Cliente** — Zustand. Progresso e a lição em andamento. Uma store, sem
  Redux, sem Context aninhado
- **URL** — qual trilha, qual lição. Rota é estado, e é o único que dá pra
  mandar por link

---

## ADR-009 — Recarga de ficha tem que virar autoridade de servidor

*24/08/2026 — dívida conhecida, aceita por ora*

Hoje `state.js` guarda `gastaEm` e calcula a recarga por tempo decorrido na
leitura. É bom design — sobrevive a recarregar página, fechar aba e dormir a
máquina, coisa que `setInterval` não faz. Mantém.

O buraco: o relógio é do cliente. Adiantar o horário do sistema dá fichas
infinitas — que é exatamente o que o Trinca+ vende (ADR-011).

Enquanto não existe cobrança, não importa. **No dia em que o Trinca+ virar
receita, `fichasAgora()` roda no servidor com `now()` do Postgres** e o cliente
só desenha o contador. A função de ADR-003 é pura justamente pra essa mudança
custar um arquivo.

Marcar no código:
`// ponytail: relógio do cliente, mover pro servidor quando Trinca+ cobrar`

---

## ADR-010 — Pastas por feature, não por camada

*24/08/2026 — decidido*

```
app/                    rotas
  (site)/               landing, blog — estático/ISR
  (app)/trilha/[id]/    o app, client-side
  api/stripe/webhook/
components/             botão, cartão, modal — burro e reutilizável
  icons/                SVG próprio (ADR-005)
features/
  licao/                tela, hook e componente da lição
  trilha/
  fichas/
  ranking/
lib/
  dominio/              TS puro, sem React (ADR-003)
  supabase/             clientes: browser e servidor
content/trilhas/        conteúdo (ADR-007)
tests/                  node --test em lib/dominio
e2e/                    Playwright
```

Organizar por camada (`hooks/`, `utils/`, `services/`) obriga a abrir quatro
pastas pra mexer numa coisa só. Feature junta o que muda junto. `components/`
guarda apenas o que **duas features diferentes** já usam — antes disso, mora na
feature. Promover depois é barato; desmontar abstração criada cedo demais, não.

---

## ADR-011 — Trinca+ é assinatura derivada, nunca booleano local

*24/08/2026 — proposta*

Hoje `S.vip` é uma chave no `localStorage` com botão no perfil. Serve pra
sentir o benefício, e pra isso está certo.

Quando virar cobrança: Stripe Checkout, webhook em Route Handler, tabela
`assinaturas` com `status` e `expira_em`. `ehVip(usuario)` **deriva** disso.
Nunca existe um campo `vip` que alguém escreve à mão — booleano gravado sempre
desincroniza do estado real do pagamento, e desincronizar pro lado errado é dar
produto de graça ou cobrar de quem cancelou.

Preço em variável de ambiente, não em constante compilada.

---

## ADR-013 — Import relativo com extensão `.ts`, e nenhum runner de teste

*24/08/2026 — decidido*

Dentro de `lib/dominio/` os imports relativos levam a extensão:
`from "./fichas.ts"`. Fora do padrão da maioria dos projetos Next, e de
propósito.

O motivo é um só: **o Node 24 executa `.ts` direto** (type stripping, sem
flag), mas ESM exige o especificador completo. Com a extensão, o teste do
domínio é `node tests/dominio.test.mjs` e acabou — sem Vitest, sem Jest, sem
`tsx`, sem `ts-node`, sem passo de build antes de testar. Milissegundos.

O que isso descarta: Vitest (mais uma dependência e mais um config pra rodar
função pura), Jest (idem, mais lento), e o padrão extensionless que obrigaria
um runner só pra resolver caminho.

Custo: `allowImportingTsExtensions: true` no `tsconfig.json` — exige `noEmit`,
que já era o caso porque quem emite é o Turbopack. Verificado: `tsc --noEmit`,
`next build` e `node` os três resolvem.

Vale enquanto o domínio for TS puro. Componente React nunca é importado assim —
lá o caminho é `@/components/...` como sempre.

---

## ADR-012 — Ordem da migração

*24/08/2026 — proposta*

Sem big bang. Cada passo entrega app funcionando.

1. ~~**Andaime**~~ — **feito em 24/08/2026.** Next 16 + React 19 + TS strict +
   Tailwind v4. `app/`, `components/`, `lib/` de pé; tokens do `DESIGN.md`
   portados; tema claro/escuro virando sem piscar; fonte por `next/font`
   (acabou o `<link>` pro Google Fonts); `lucide-react` instalado. `/` é uma
   página de prova de tokens — sai no passo 4. Legado intacto:
   `npm run dev:atual`, e os 4 testes seguem passando
2. ~~**Domínio**~~ — **feito em 24/08/2026.** `lib/dominio/` com `tipos.ts`,
   `fichas.ts`, `progresso.ts` e `trilha.ts`: TS puro, `agora` por parâmetro,
   estado novo em vez de mutação. `tests/dominio.test.mjs` cobre as mesmas
   invariantes contra o código novo, e os 4 testes do legado seguem passando —
   5 no total. As trilhas entram por parâmetro, então o passo 3 não mexe aqui
3. **Conteúdo** — `data/trilhas.js` vira `content/` com Zod e `id` estável
   (ADR-007). Aqui os emoji de ícone morrem (ADR-005)
4. **Telas** — trilha, lição, ranking, perfil. Uma por vez, com Playwright
   comparando com o app atual
5. **Corte** — Netlify aponta pro Next. `index.html`, `js/`, `css/`,
   `data/` e `serve.mjs` saem, junto com o script `dev:atual`
6. Só então: Supabase, login, Stripe

Passos 1 a 5 não mudam o que o usuário vê. Se mudarem, é bug — não é melhoria.

Deploy: Netlify roda Next e a integração já está de pé. Fica. Migrar pra Vercel
é conversa pra quando alguma coisa do Next não funcionar lá, não antes.

---

## Como manter este arquivo

Decisão técnica com alternativa descartada, escrever aqui na hora — o motivo
evapora em duas semanas. Escolha óbvia sem alternativa real (usar `fetch`, usar
`git`) não vira ADR; vira ruído.

Formato: título, data, status (`proposta` / `decidido` / `substituída pela
ADR-0XX`), o que ganha, o que custa, o que foi descartado e por quê.

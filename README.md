# Trinca

Poker do zero em lições de 3 minutos. Sem build, sem framework, sem dependência —
HTML + CSS + ES modules nativos.

## Rodar

Precisa de um servidor HTTP (ES modules não carregam via `file://`):

```bash
node serve.mjs       # http://localhost:5173
```

Abrir o `index.html` com duplo clique **não funciona**: o browser bloqueia
`<script type="module">` em `file://` (origin null) e o app fica sem JS nenhum.

## Testar

```bash
npm install     # playwright — dependência de teste, o app não tem nenhuma
npm run dev     # servidor local, precisa estar de pé
npm test        # regras + lição de ponta a ponta + animações do mascote
```

- `regras.test.js` — progressão e invariantes de conteúdo, entre elas a regra de que
  nenhuma pergunta cobra algo que ainda não foi ensinado. Node puro.
- `licao.test.mjs` — joga uma lição inteira acertando tudo, depois erra até acabarem
  as fichas, e passa por abas e volta pra landing exigindo zero erro de runtime.
- `dom-anima.test.mjs` — o mascote precisa estar animado de fato.

## Estrutura

```
index.html          markup + as animações do mascote (ver regra abaixo)
netlify.toml        deploy: publica a raiz, sem build
serve.mjs           servidor estático local, zero dependência
css/
  base.css          tokens de cor/tipo, reset, .bt, .cap
  cartas.css        baralho de 4 cores e mesa
  dom.css           balão de fala e assinatura do mascote
  app.css           topo, trilha, ranking, perfil, nav
  licao.css         modal de lição
  landing.css       tela de entrada
  motion.css        prefers-reduced-motion (carrega por último de propósito)
data/
  trilhas.js        todo o conteúdo das lições — só dados
  bots.js           oponentes do ranking
js/
  main.js           boot: liga os módulos nesta ordem e só
  state.js          progresso do jogador + localStorage (dono único do estado)
  progresso.js      regras de liberação e XP — sem DOM, é o que os testes cobrem
  cartas.js         render de carta/mão/legenda
  telas.js          trilha, ranking, perfil
  licao.js          motor da lição (passos, vidas, feedback, conclusão)
  landing.js        tela de entrada
  confete.js        canvas da conclusão
  dom.js            $ e $$
tests/regras.test.js
```

## Regras de arquitetura

- **`state.js` é o único que fala com `localStorage`.** Todo o resto lê `S` e chama `salvar()`.
- **`progresso.js` não toca no DOM.** É por isso que os testes rodam em Node puro.
- **Sem ciclo de import.** `telas.js → licao.js`; a volta é o callback que `main.js` injeta
  em `ligarLicao(render)`.
- **Conteúdo é dado, não código.** Lição nova entra em `data/trilhas.js`, nada mais muda.
- **As animações do mascote moram dentro do `<symbol id="dom">`, não em `dom.css`.**
  `<use>` clona o símbolo num shadow tree, e seletor de folha externa não atravessa
  shadow — CSS de fora simplesmente não aplica. Por isso o `<style>` inline.
- **Ordem dos `<link>` importa.** `base` primeiro (tokens), `motion` por último (sobrescreve
  os estados finais das animações).

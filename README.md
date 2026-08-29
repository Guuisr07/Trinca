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
npm test        # regras + lição de ponta a ponta + switch de tema
```

- `regras.test.js` — progressão e invariantes de conteúdo, entre elas a regra de que
  nenhuma pergunta cobra algo que ainda não foi ensinado. Node puro.
- `licao.test.mjs` — joga uma lição inteira acertando tudo, depois erra até acabarem
  as fichas, e passa por abas e volta pra landing exigindo zero erro de runtime.
- `tema.test.mjs` — o switch troca o tema nos dois lugares e a escolha sobrevive ao reload.

## Estrutura

```
index.html          markup do app inteiro
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
assets/
  trinca-logo.png   folha original do logo + poses do Dom Naipe
  marca/            peças recortadas dela: lockup, símbolo, wordmark, poses
tools/
  cortar-logo.mjs   recorta a folha em PNGs com fundo transparente
data/
  trilhas.js        todo o conteúdo das lições — só dados
  maos.js           ranking das mãos, da mais fraca pra mais forte
  bots.js           oponentes do ranking
js/
  main.js           boot: liga os módulos nesta ordem e só
  state.js          progresso do jogador + localStorage (dono único do estado)
  progresso.js      regras de liberação e XP — sem DOM, é o que os testes cobrem
  cartas.js         render de carta/mão/legenda
  telas.js          trilha, mãos, ranking, perfil
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
- **O mascote e a marca são PNGs de `assets/marca/`.** Saem da folha `trinca-logo.png`
  por `node tools/cortar-logo.mjs` — mexeu na folha, roda de novo em vez de editar PNG.
- **Tema é só token.** `:root[data-tema="dark"]` em `base.css` troca as variáveis, e
  `tema.js` só vira o atributo. Cor fixa fora de token vira dívida na hora de virar o tema —
  inclusive as dos naipes, que moram em `--n-e/--n-c/--n-o/--n-p`.
- **O tema inicial é resolvido por um `<script>` inline no `<head>`.** Módulo carrega
  depois da primeira pintura, e a tela piscaria clara antes de virar escura.
- **`tema.js` é a única exceção ao dono único do localStorage.** Guarda `trinca.tema`;
  o progresso continua todo em `state.js`.
- **Ordem dos `<link>` importa.** `base` primeiro (tokens), `motion` por último (sobrescreve
  os estados finais das animações).

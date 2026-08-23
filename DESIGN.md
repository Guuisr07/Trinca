# Identidade do Trinca

Guia curto da marca do app. **A fonte da verdade é o código** — os valores abaixo
existem como token em `css/base.css`. Mudou a cor? Muda o token, não este arquivo.

## Logo

Tudo sai da folha `assets/trinca-logo.png`, recortada por `node tools/cortar-logo.mjs`
em `assets/marca/`:

| Peça | Onde usa |
|---|---|
| `lockup.png` | marca completa — topo da landing |
| `simbolo.png` | cartas + coroa — favicon e topo do app |
| `wordmark.png` | só a palavra Trinca |
| `dom-heroi.png` | Dom Naipe apontando — hero da landing |
| `dom-estuda.png` | balão de fala das lições |
| `dom-ri.png` | assinatura "com Dom Naipe" |
| `dom-vibra.png` / `dom-pensa.png` / `dom-tira.png` | fim de lição: sem erro / com erro / sem fichas |
| `dom-carta.png`, `balao.png` | sobrando, ainda sem uso |

Os PNGs têm fundo transparente e margem apertada. Não editar na mão: mexeu na
folha, roda o script de novo.

## Cores

Todas em `:root` (claro) e `:root[data-tema="dark"]` (escuro) de `css/base.css`.

| Papel | Claro | Escuro |
|---|---|---|
| Fundo / superfície | `#FAF3E6` / `#FFFFFF` | `#141024` / `#1E1838` |
| Texto | `#241C4F` navy | `#F7EFDF` creme |
| Destaque e CTA | `#F5B82E` ouro | igual |
| Erro | `#E8453F` | `#F4675F` |
| Acerto | `#22B573` | `#2ECC8B` |
| Roxo (secundário) | `#5B3FA0` | `#8E6FE0` |

Naipes têm token próprio (`--n-e`, `--n-c`, `--n-o`, `--n-p`) porque o baralho de
4 cores clareia no escuro e inverte o texto. Nunca escrever cor de naipe na mão.

## Tipografia

- **Títulos:** Bricolage Grotesque, 700–800, `letter-spacing:-.02em` (`--disp`)
- **Corpo e botões:** Instrument Sans, 400–700 (`--body`)

## Estilo

Flat 2.0: cor chapada, sombra sólida deslocada (`0 4px 0`) em vez de blur, raio
generoso (14–26px), botão que afunda no `:active`. Sem gradiente decorativo fora
do feltro do dealer e do fundo da capa.

Regra que segura tudo: **cor fixa fora de token vira dívida na hora de virar o tema.**

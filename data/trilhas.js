/* GERADO por tools/gerar-trilhas.mjs — não editar na mão.
   A fonte do conteúdo é content/ (ADR-007). Editou aqui? O próximo
   `node tools/gerar-trilhas.mjs` apaga, e o teste de conteúdo falha
   antes disso. */
export const TRILHAS = [
 {
  "id": "f",
  "nome": "Fundamentos",
  "icone": "♠",
  "desc": "O básico do Texas Hold'em: as cartas, a força das mãos, como uma rodada acontece e o que você pode fazer na sua vez.",
  "licoes": [
   {
    "id": "f1",
    "titulo": "O baralho",
    "icone": "🂡",
    "aula": [
     {
      "h": "52 cartas, 4 naipes",
      "p": "Poker usa o baralho comum: <em>13 valores</em> em <em>4 naipes</em>. Nada de coringa, nada de carta especial.",
      "cartas": [
       "A♠",
       "K♥",
       "Q♦",
       "J♣"
      ]
     },
     {
      "h": "Cada naipe tem uma cor",
      "p": "Cada naipe usa <em>uma cor própria</em> — espadas preto, copas vermelho, ouros azul, paus verde. É o baralho de 4 cores das salas online: bate o olho e você já sabe o naipe, sem precisar enxergar o símbolo.",
      "naipes": true
     },
     {
      "h": "Nenhum naipe manda",
      "p": "Diferente do truco, aqui <em>naipe não vale mais que naipe</em>. Um Ás de paus e um Ás de copas valem exatamente o mesmo.",
      "cartas": [
       "A♠",
       "A♥",
       "A♦",
       "A♣"
      ]
     },
     {
      "h": "Naipe serve pra uma coisa",
      "p": "Juntar <em>cinco cartas do mesmo naipe</em> forma o <em>flush</em> — uma mão forte. Fora isso, naipe não desempata nada."
     },
     {
      "h": "Do 2 ao Ás",
      "p": "A ordem de força é: 2, 3, 4... 10, Valete (J), Dama (Q), Rei (K) e <em>Ás (A), a mais forte</em>.",
      "lista": [
       "2 a 10 — valem o próprio número",
       "J (Valete) — vale mais que o 10",
       "Q (Dama) — vale mais que o J",
       "K (Rei) — vale mais que a Q",
       "A (Ás) — a mais alta de todas"
      ]
     },
     {
      "h": "O Ás tem dois lados",
      "p": "Ele é a carta mais alta, mas também pode virar <em>a mais baixa</em> numa sequência A-2-3-4-5. Só nesse caso.",
      "cartas": [
       "A♦",
       "2♣",
       "3♥",
       "4♠",
       "5♦"
      ]
     },
     {
      "h": "Cartas iguais têm nome",
      "p": "Quando você junta cartas do <em>mesmo valor</em>, a dupla ganha nome próprio. É o vocabulário que você vai usar o jogo inteiro.",
      "cartas": [
       "K♠",
       "K♥"
      ],
      "lista": [
       "Duas iguais = <b>par</b>",
       "Três iguais = <b>trinca</b>",
       "Quatro iguais = <b>quadra</b>"
      ]
     }
    ],
    "q": [
     {
      "p": "Quantas cartas tem o baralho do poker?",
      "o": [
       "52",
       "48",
       "54",
       "40"
      ],
      "c": 0,
      "e": "52 cartas: 13 valores × 4 naipes. Sem coringa."
     },
     {
      "p": "Qual naipe é o mais forte?",
      "o": [
       "Espadas",
       "Copas",
       "Nenhum, todos valem igual",
       "Ouros"
      ],
      "c": 2,
      "e": "Naipe não desempata nada no Hold'em. Só serve pra formar flush."
     },
     {
      "p": "No baralho de 4 cores, ouros (♦) aparece em qual cor?",
      "o": [
       "Vermelho",
       "Azul",
       "Verde",
       "Preto"
      ],
      "c": 1,
      "e": "Ouros é azul, copas é vermelho, paus é verde e espadas é preto. Cor = naipe."
     },
     {
      "p": "Qual dessas cartas é a mais forte?",
      "o": [
       "Rei",
       "Dama",
       "Ás",
       "Valete"
      ],
      "c": 2,
      "e": "Ás é a carta mais alta. Só na sequência A-2-3-4-5 ele conta como a mais baixa."
     },
     {
      "p": "Cinco cartas do mesmo naipe formam:",
      "o": [
       "Um par",
       "Um flush",
       "Uma trinca",
       "Uma quadra"
      ],
      "c": 1,
      "e": "Flush é cinco do mesmo naipe. É pra isso que naipe serve."
     },
     {
      "p": "Você recebe K♠ e K♥. Isso é...",
      "o": [
       "Um par de reis",
       "Um flush",
       "Uma trinca",
       "Nada"
      ],
      "c": 0,
      "e": "Duas cartas do mesmo valor = par. Par de reis é uma mão inicial fortíssima."
     },
     {
      "p": "Três cartas do mesmo valor formam:",
      "o": [
       "Par",
       "Trinca",
       "Quadra",
       "Flush"
      ],
      "c": 1,
      "e": "Duas = par, três = trinca, quatro = quadra."
     }
    ]
   },
   {
    "id": "f2",
    "titulo": "Como roda a mão",
    "icone": "🔄",
    "aula": [
     {
      "h": "Você recebe 2 cartas",
      "p": "São suas e ninguém mais vê. Elas se chamam <em>cartas fechadas</em> e ficam com você até o fim da mão.",
      "cartas": [
       "A♠",
       "K♦"
      ]
     },
     {
      "h": "5 cartas ficam no meio",
      "p": "As <em>cartas comunitárias</em> vão viradas pra cima no centro da mesa. <em>Todo mundo usa as mesmas 5</em> — a diferença entre os jogadores são só as 2 cartas fechadas.",
      "cartas": [
       "Q♣",
       "9♥",
       "4♦",
       "J♠",
       "2♣"
      ]
     },
     {
      "h": "As quatro rodadas",
      "p": "As 5 comunitárias não vêm de uma vez. Cada rodada abre mais carta, e antes de cada uma tem aposta:",
      "lista": [
       "<b>Pré-flop</b> — só suas 2 cartas",
       "<b>Flop</b> — 3 cartas na mesa de uma vez",
       "<b>Turn</b> — mais 1 carta",
       "<b>River</b> — a última carta"
      ]
     },
     {
      "h": "Melhores 5 de 7",
      "p": "No fim você tem 7 cartas disponíveis (suas 2 + as 5 da mesa). Sua mão é <em>a melhor combinação de 5</em> entre elas — você usa as duas, uma só, ou nenhuma.",
      "cartas": [
       "A♠",
       "K♠",
       "Q♠",
       "J♠",
       "10♠"
      ]
     },
     {
      "h": "Blinds obrigam ação",
      "p": "Dois jogadores pagam valor obrigatório antes de ver carta: o <em>small blind</em> e o <em>big blind</em>. Sem isso ninguém precisaria jogar mão nenhuma.",
      "lista": [
       "Small blind — paga metade",
       "Big blind — paga a aposta cheia",
       "Os dois giram de cadeira a cada mão"
      ]
     },
     {
      "h": "Como termina",
      "p": "A mão acaba de dois jeitos: <em>todo mundo desiste</em> e sobra um, ou chega no fim e as cartas são mostradas — o <em>showdown</em>. Aí a melhor mão de 5 leva o pote."
     }
    ],
    "q": [
     {
      "p": "Quantas cartas comunitárias vão pra mesa no total?",
      "o": [
       "3",
       "4",
       "5",
       "7"
      ],
      "c": 2,
      "e": "Flop (3) + turn (1) + river (1) = 5 cartas na mesa."
     },
     {
      "p": "O flop mostra quantas cartas de uma vez?",
      "o": [
       "1",
       "2",
       "3",
       "5"
      ],
      "c": 2,
      "e": "O flop vira 3 cartas de uma vez. Turn e river viram 1 cada."
     },
     {
      "p": "As 5 cartas do meio da mesa são:",
      "o": [
       "Só do jogador do botão",
       "De todo mundo",
       "Do dealer",
       "Sorteadas pra cada um"
      ],
      "c": 1,
      "e": "São comunitárias: todos usam as mesmas 5. A diferença está nas 2 cartas fechadas."
     },
     {
      "p": "Sua mão final é formada por:",
      "o": [
       "Suas 2 cartas apenas",
       "As 5 melhores entre as 7",
       "Todas as 7 cartas",
       "As 5 da mesa"
      ],
      "c": 1,
      "e": "Você escolhe as melhores 5 entre suas 2 + as 5 da mesa."
     },
     {
      "p": "Pra que servem os blinds?",
      "o": [
       "Pagar o crupiê",
       "Colocar dinheiro no pote e fazer o jogo andar",
       "Escolher quem dá as cartas",
       "Nada, são opcionais"
      ],
      "c": 1,
      "e": "Sem blinds ninguém precisaria jogar. Eles criam pote pra ser disputado."
     },
     {
      "p": "Qual a ordem correta?",
      "o": [
       "Flop, pré-flop, turn, river",
       "Pré-flop, flop, turn, river",
       "Pré-flop, turn, flop, river",
       "Flop, turn, river, pré-flop"
      ],
      "c": 1,
      "e": "Pré-flop → flop → turn → river. Sempre nessa ordem."
     },
     {
      "p": "Quando as cartas fechadas são mostradas?",
      "o": [
       "No flop",
       "No showdown, se a mão chegar até o fim",
       "Sempre no river, obrigatório",
       "Nunca"
      ],
      "c": 1,
      "e": "Só no showdown. Se todos desistirem antes, quem sobrou leva o pote sem mostrar nada."
     }
    ]
   },
   {
    "id": "f3",
    "titulo": "Força das mãos",
    "icone": "👑",
    "aula": [
     {
      "h": "A escada de força",
      "p": "Toda mão de poker tem <em>5 cartas</em>. Quem monta a combinação mais rara ganha o pote.",
      "lista": [
       "1. <b>Royal Flush</b> — A K Q J 10 do mesmo naipe",
       "2. <b>Straight Flush</b> — sequência do mesmo naipe",
       "3. <b>Quadra</b> — quatro iguais",
       "4. <b>Full House</b> — trinca + par",
       "5. <b>Flush</b> — cinco do mesmo naipe"
      ]
     },
     {
      "h": "E o resto da escada",
      "p": "Daí pra baixo, mãos cada vez mais comuns:",
      "lista": [
       "6. <b>Sequência</b> — cinco em ordem, naipe misturado",
       "7. <b>Trinca</b> — três iguais",
       "8. <b>Dois pares</b>",
       "9. <b>Um par</b>",
       "10. <b>Carta alta</b> — nada formado"
      ]
     },
     {
      "h": "Regra de ouro",
      "p": "<em>Quanto mais raro, mais forte.</em> Flush ganha de sequência porque cinco do mesmo naipe acontece menos que cinco em ordem.",
      "cartas": [
       "A♥",
       "J♥",
       "8♥",
       "5♥",
       "2♥"
      ]
     },
     {
      "h": "Quando as duas são iguais",
      "p": "Se os dois jogadores formam a mesma coisa, <em>vence a mais alta</em>. Par de reis ganha de par de noves. Trinca de damas ganha de trinca de setes.",
      "cartas": [
       "K♠",
       "K♥"
      ]
     },
     {
      "h": "O kicker desempata",
      "p": "Mesmo par nos dois? Entra a <em>carta de apoio mais alta</em> — o kicker. Com A-K você tem par de reis com kicker de Ás; quem tem K-9 perde no kicker.",
      "cartas": [
       "A♦",
       "K♣"
      ]
     },
     {
      "h": "Full house na prática",
      "p": "É a mão que mais confunde iniciante: <em>trinca + par juntos</em>. K K K 7 7 se lê \"reis full de setes\".",
      "cartas": [
       "K♠",
       "K♥",
       "K♦",
       "7♣",
       "7♠"
      ]
     }
    ],
    "q": [
     {
      "p": "Qual mão é mais forte?",
      "o": [
       "Flush",
       "Sequência",
       "Dois pares",
       "Trinca"
      ],
      "c": 0,
      "e": "Flush > sequência > trinca > dois pares. Flush é mais raro."
     },
     {
      "p": "O que é um Full House?",
      "o": [
       "Cinco do mesmo naipe",
       "Trinca + par",
       "Duas trincas",
       "Cinco em sequência"
      ],
      "c": 1,
      "e": "Trinca + par. Ex: K K K 7 7 — \"reis full de setes\"."
     },
     {
      "p": "Quadra ganha de full house?",
      "o": [
       "Sim",
       "Não",
       "Só se for de Ás",
       "Empatam"
      ],
      "c": 0,
      "e": "Quadra está acima do full house na escada. Quatro iguais é mais raro que trinca + par."
     },
     {
      "p": "Qual mão ganha?",
      "o": [
       [
        "A♠",
        "K♣"
       ],
       [
        "9♠",
        "8♦"
       ]
      ],
      "c": 0,
      "e": "Par de reis ganha do par de noves. Mesma combinação, vence a mais alta.",
      "t": "mao",
      "board": [
       "K♠",
       "9♥",
       "4♣",
       "2♦",
       "7♠"
      ]
     },
     {
      "p": "Os dois têm par de reis. Quem ganha?",
      "o": [
       [
        "A♥",
        "K♦"
       ],
       [
        "K♣",
        "J♠"
       ]
      ],
      "c": 0,
      "e": "Kicker: o Ás é mais alto que o Valete. Mesma mão, desempata pela carta de apoio.",
      "t": "mao",
      "board": [
       "K♠",
       "9♥",
       "4♣",
       "2♦",
       "7♠"
      ]
     },
     {
      "p": "Qual mão ganha?",
      "o": [
       [
        "A♥",
        "5♥"
       ],
       [
        "Q♠",
        "Q♣"
       ]
      ],
      "c": 0,
      "e": "Flush de copas (5 copas) ganha da trinca de damas. Flush é mais raro.",
      "t": "mao",
      "board": [
       "Q♥",
       "J♥",
       "3♥",
       "8♣",
       "2♦"
      ]
     },
     {
      "p": "Você tem 8♠ 8♦ e a mesa traz 8♣ K♥ K♣. Sua mão é:",
      "o": [
       "Trinca",
       "Full house",
       "Dois pares",
       "Quadra"
      ],
      "c": 1,
      "e": "Trinca de oitos + par de reis = full house. Mão monstro."
     },
     {
      "p": "Você não formou nada: nem par, nem sequência, nem flush. Sua mão é:",
      "o": [
       "Carta alta",
       "Nula, você perde na hora",
       "Dois pares",
       "Trinca"
      ],
      "c": 0,
      "e": "Carta alta: a mais fraca da escada, mas ainda pode ganhar se o adversário também não formou nada."
     }
    ]
   },
   {
    "id": "f4",
    "titulo": "Suas ações",
    "icone": "🎯",
    "aula": [
     {
      "h": "Na sua vez, 3 caminhos",
      "p": "Sempre: <em>sair</em>, <em>pagar</em> ou <em>aumentar</em>. Toda decisão de poker cabe nessas três."
     },
     {
      "h": "O que cada uma significa",
      "p": "Os nomes que você vai ouvir na mesa:",
      "lista": [
       "<b>Fold</b> — desisto, jogo as cartas fora",
       "<b>Check</b> — passo sem apostar (só se ninguém apostou)",
       "<b>Call</b> — pago o valor que está na mesa",
       "<b>Bet</b> — aposto primeiro",
       "<b>Raise</b> — aumento a aposta de alguém",
       "<b>All-in</b> — empurro todas as minhas fichas"
      ]
     },
     {
      "h": "Check ou call, nunca os dois",
      "p": "A regra que confunde todo iniciante: <em>se já tem aposta de pé, check não existe.</em> Ou você paga (call), ou aumenta (raise), ou sai (fold)."
     },
     {
      "h": "Quem começa a falar",
      "p": "A ação anda <em>no sentido horário</em>. Cada um decide na sua vez, sabendo só o que quem falou antes fez."
     },
     {
      "h": "Fold não é covardia",
      "p": "Iniciante paga demais. <em>Desistir cedo com mão ruim economiza mais dinheiro do que ganhar com mão boa.</em> Ficha guardada é ficha ganha."
     }
    ],
    "q": [
     {
      "p": "Ninguém apostou e você não quer apostar. Você faz:",
      "o": [
       "Fold",
       "Check",
       "Call",
       "Raise"
      ],
      "c": 1,
      "e": "Check = passar de graça. Só dá pra fazer se nenhuma aposta estiver de pé."
     },
     {
      "p": "Alguém apostou 10 e você quer continuar pagando o mesmo:",
      "o": [
       "Call",
       "Check",
       "Bet",
       "Fold"
      ],
      "c": 0,
      "e": "Call = igualar a aposta. Check não existe quando tem aposta na mesa."
     },
     {
      "p": "Você quer aumentar a aposta que outro jogador fez:",
      "o": [
       "Bet",
       "Raise",
       "Call",
       "Check"
      ],
      "c": 1,
      "e": "Bet é apostar primeiro. Aumentar a aposta de outro é raise."
     },
     {
      "p": "Tem uma aposta de pé e você não quer pagar nem aumentar. Sobra:",
      "o": [
       "Check",
       "Fold",
       "Bet",
       "Nada, você é obrigado a pagar"
      ],
      "c": 1,
      "e": "Com aposta na mesa, check não é opção. Sem querer pagar, o caminho é fold."
     },
     {
      "p": "Você tem 7♠ 2♦, uma mão fraquíssima, e alguém apostou forte. O certo é:",
      "o": [
       "Call pra ver o flop",
       "Raise pra blefar",
       "Fold",
       "All-in"
      ],
      "c": 2,
      "e": "Fold. Guardar ficha é tão importante quanto ganhar pote."
     }
    ]
   },
   {
    "id": "f5",
    "titulo": "Posição na mesa",
    "icone": "🪑",
    "aula": [
     {
      "h": "Quem fala por último, manda",
      "p": "Posição é <em>informação</em>. Quem age depois já viu o que os outros fizeram — e decide sabendo mais."
     },
     {
      "h": "O botão gira",
      "p": "O <em>botão (dealer)</em> anda uma cadeira por mão, então todo mundo passa por todas as posições. Quem está nele age por último depois do flop — a melhor cadeira da mesa.",
      "lista": [
       "<b>Small e big blind</b> — pagam antes e agem primeiro pós-flop",
       "<b>Early position</b> — fala cedo, precisa mão forte",
       "<b>Late position / botão</b> — fala tarde, pode abrir mais mãos"
      ]
     },
     {
      "h": "Por que isso muda tudo",
      "p": "Fora de posição você aposta no escuro. Em posição, você já viu check ou aposta do adversário antes de gastar uma ficha. <em>A mesma mão rende mais no botão.</em>"
     },
     {
      "h": "Regra prática",
      "p": "<em>Cedo: jogue apertado. Tarde: jogue mais mãos.</em> Não é sobre coragem, é sobre quanta gente ainda vai falar depois de você."
     }
    ],
    "q": [
     {
      "p": "Qual a melhor posição da mesa?",
      "o": [
       "Small blind",
       "Big blind",
       "Botão (dealer)",
       "Primeira a falar"
      ],
      "c": 2,
      "e": "No botão você age por último em todas as rodadas pós-flop. Informação máxima."
     },
     {
      "p": "Estar em posição significa:",
      "o": [
       "Ter mais fichas",
       "Agir depois dos adversários",
       "Estar perto do dealer",
       "Ter cartas melhores"
      ],
      "c": 1,
      "e": "Posição = agir depois. Você decide já sabendo o que os outros fizeram."
     },
     {
      "p": "Você é o primeiro a falar pré-flop. Você deve:",
      "o": [
       "Jogar quase toda mão",
       "Jogar só mãos fortes",
       "Sempre dar all-in",
       "Sempre dar fold"
      ],
      "c": 1,
      "e": "Cedo você tem muita gente pra falar depois. Só mão forte compensa."
     },
     {
      "p": "A mesma mão (por ex. J♠ 10♠) vale mais...",
      "o": [
       "No botão",
       "No early position",
       "No big blind",
       "Vale sempre igual"
      ],
      "c": 0,
      "e": "No botão você joga essa mão com informação. Em early ela vira armadilha."
     }
    ]
   }
  ]
 },
 {
  "id": "p",
  "nome": "Pré-flop",
  "icone": "♦",
  "desc": "A decisão que mais separa iniciante de jogador: quais mãos jogar e quais jogar fora antes do flop.",
  "licoes": [
   {
    "id": "p1",
    "titulo": "Mãos iniciais",
    "icone": "🃏",
    "aula": [
     {
      "h": "Nem toda mão merece ficha",
      "p": "São 169 combinações possíveis. Jogador vencedor joga umas <em>20% delas</em>. O resto é fold."
     },
     {
      "h": "O topo da lista",
      "p": "Mãos premium — sempre jogue:",
      "cartas": [
       "A♠",
       "A♥",
       "K♠",
       "K♥"
      ],
      "lista": [
       "AA, KK, QQ — pares gigantes",
       "AK — melhor mão não pareada",
       "JJ, TT, AQ — fortes, mas com cuidado"
      ]
     },
     {
      "h": "Suited vale mais",
      "p": "A♠K♠ (mesmo naipe) é melhor que A♠K♥: ganha a chance de flush. <em>Mesmo naipe soma valor, mas não transforma lixo em ouro.</em>"
     },
     {
      "h": "O lixo clássico",
      "p": "7-2 offsuit é a pior mão do jogo: baixa, sem sequência, sem naipe. Fold sempre.",
      "cartas": [
       "7♠",
       "2♦"
      ]
     }
    ],
    "q": [
     {
      "p": "Qual mão inicial é melhor?",
      "o": [
       [
        "A♠",
        "A♥"
       ],
       [
        "A♠",
        "K♠"
       ]
      ],
      "c": 0,
      "e": "AA é a melhor mão do poker. AK suited é forte, mas ainda perde pra AA.",
      "t": "mao"
     },
     {
      "p": "Qual mão inicial é melhor?",
      "o": [
       [
        "K♠",
        "Q♠"
       ],
       [
        "K♠",
        "Q♥"
       ]
      ],
      "c": 0,
      "e": "Mesma mão, mas suited: ganha a possibilidade de flush. Sempre um pouco melhor.",
      "t": "mao"
     },
     {
      "p": "Qual dessas você joga fora sem pensar?",
      "o": [
       "Q♠Q♥",
       "A♠Q♠",
       "7♠ 2♦",
       "J♥J♣"
      ],
      "c": 2,
      "e": "7-2 offsuit: a pior mão do baralho. Fold."
     },
     {
      "p": "Aproximadamente quantas mãos um bom jogador joga?",
      "o": [
       "Quase todas",
       "Cerca de 20%",
       "Cerca de 60%",
       "Menos de 2%"
      ],
      "c": 1,
      "e": "Em torno de 15-25%. Paciência é estratégia, não timidez."
     }
    ]
   },
   {
    "id": "p2",
    "titulo": "Abrir ou desistir",
    "icone": "🚦",
    "aula": [
     {
      "h": "Se vai jogar, aumente",
      "p": "<em>Limp</em> (só pagar o big blind) é erro de iniciante: não ganha o pote na hora e não dá informação. Entre com <em>raise</em>."
     },
     {
      "h": "Tamanho padrão",
      "p": "Abra com <em>2,5 a 3 big blinds</em>. Grande o bastante pra afastar mão ruim, pequeno o bastante pra não queimar fichas."
     },
     {
      "h": "Ajuste pela posição",
      "p": "Quanto mais tarde você fala, mais mãos pode abrir:",
      "lista": [
       "Early — só as premium (uns 10% das mãos)",
       "Meio — abre um pouco mais (uns 15%)",
       "Botão — pode abrir bem mais (25-40%)"
      ]
     },
     {
      "h": "Um raise, uma razão",
      "p": "Antes de apostar, responda: <em>estou apostando por valor ou blefando?</em> Se não souber, não aposte."
     }
    ],
    "q": [
     {
      "p": "Você quer jogar A♥Q♥ no botão e ninguém abriu. O certo é:",
      "o": [
       "Limp (pagar 1 BB)",
       "Raise de 2,5-3 BB",
       "Fold",
       "All-in"
      ],
      "c": 1,
      "e": "Mão boa em boa posição: abra com raise. Limp entrega a iniciativa."
     },
     {
      "p": "Por que limpar (limp) é ruim?",
      "o": [
       "É ilegal",
       "Não ganha o pote na hora e não dá informação",
       "Custa caro demais",
       "Deixa o dealer bravo"
      ],
      "c": 1,
      "e": "Limp não pressiona ninguém e ainda deixa muita gente ver o flop barato."
     },
     {
      "p": "Em early position você deve abrir:",
      "o": [
       "Mais mãos que no botão",
       "Menos mãos que no botão",
       "O mesmo número",
       "Todas as mãos suited"
      ],
      "c": 1,
      "e": "Muita gente ainda vai falar depois de você. Aperte a seleção."
     },
     {
      "p": "Tamanho padrão de abertura:",
      "o": [
       "1 BB",
       "2,5-3 BB",
       "10 BB",
       "Metade das fichas"
      ],
      "c": 1,
      "e": "2,5-3 BB é o padrão moderno. Constrói pote sem se comprometer demais."
     },
     {
      "p": "Antes de apostar, a pergunta certa é:",
      "o": [
       "Minhas cartas são bonitas?",
       "Estou apostando por valor ou blefando?",
       "Quanto tenho de fichas?",
       "Quem está no botão?"
      ],
      "c": 1,
      "e": "Toda aposta precisa de um plano: valor (mãos piores pagam) ou blefe (mãos melhores desistem)."
     }
    ]
   }
  ]
 },
 {
  "id": "x",
  "nome": "Pós-flop",
  "icone": "♣",
  "embreve": true,
  "desc": "Ler o flop, apostar por valor, blefar na hora certa e calcular odds. As lições ainda estão sendo escritas.",
  "licoes": []
 }
];

"use client";

import { useEstado } from "@/lib/estado";
import { TRILHAS } from "@/content/trilhas";
import { feitasCount, feita, progressoPadrao } from "@/lib/dominio/progresso";
import { totalLicoes } from "@/lib/dominio/trilha";
import { Mao } from "@/components/Carta";
import { salvarProgresso } from "@/lib/estado";

const BARALHOS = [
  { id: "cheio", nome: "Colorido", desc: "Face inteira na cor do naipe. Bate o olho e você sabe." },
  { id: "classico", nome: "Clássico", desc: "Carta branca, naipe colorido. Igual ao baralho da mesa." },
];

function baralhoAtual(): string {
  if (typeof document === "undefined") return "cheio";
  return document.documentElement.dataset.baralho === "classico" ? "classico" : "cheio";
}

function escolherBaralho(id: string) {
  document.documentElement.dataset.baralho = id;
  try { localStorage.setItem("trinca.baralho", id); } catch {}
}

export function TelaPerfil() {
  const { progresso, setProgresso } = useEstado();
  const feitas = feitasCount(progresso);
  const tentativas = progresso.acertos + progresso.erros;
  const precisao = tentativas ? Math.round(progresso.acertos / tentativas * 100) : 0;

  const conq = [
    { i: "🎬", t: "Primeira mão", d: "Concluiu a lição de estreia", ok: feitas >= 1 },
    { i: "♠", t: "Fundamentos fechados", d: "Terminou a trilha 1 inteira", ok: TRILHAS[0]?.licoes.every(l => feita(progresso, l.id)) },
    { i: "🔥", t: "Três dias seguidos", d: "Voltou 3 dias em sequência", ok: progresso.streak >= 3 },
    { i: "🎯", t: "Mão de ferro", d: "100 XP acumulados", ok: progresso.xp >= 100 },
  ];

  return (
    <>
      <div className="cap" style={{ marginBottom: 10 }}>Seu progresso</div>
      <div className="grade">
        <div className="caixa"><b>{progresso.xp}</b><small>XP total</small></div>
        <div className="caixa"><b>{progresso.streak}</b><small>dias seguidos</small></div>
        <div className="caixa"><b>{feitas}/{totalLicoes(TRILHAS)}</b><small>lições</small></div>
        <div className="caixa"><b>{precisao}%</b><small>de acerto</small></div>
      </div>

      <div className="cap" style={{ marginBottom: 10 }}>Cartas</div>
      <OpcoesBaralho />

      <div className="cap" style={{ marginBottom: 10 }}>Conquistas</div>
      {conq.map(c => (
        <div key={c.t} className={`conquista${c.ok ? "" : " off"}`}>
          <span>{c.i}</span>
          <div><b>{c.t}</b><small>{c.d}</small></div>
        </div>
      ))}

      <div className="cap" style={{ margin: "22px 0 10px" }}>Trinca+</div>
      <div className="cartao-vip">
        <b>Fichas ilimitadas</b>
        <p>Errar sem contar ficha e sem esperar recarga. O plano ainda não existe
          de verdade — por enquanto dá pra ligar aqui e sentir como fica.</p>
        <button
          className={`bt${progresso.vip ? " fantasma" : ""}`}
          onClick={() => {
            setProgresso(p => {
              const next = { ...p, vip: !p.vip };
              if (!next.vip && next.vidas <= 0) { next.vidas = 1; next.gastaEm = Date.now(); }
              return next;
            });
          }}
        >
          {progresso.vip ? "Desligar Trinca+" : "Ligar Trinca+ (prévia)"}
        </button>
      </div>

      <button
        className="bt fantasma"
        style={{ marginTop: 18 }}
        onClick={() => {
          if (confirm("Isso apaga XP, lições e sequência. Continuar?")) {
            setProgresso(progressoPadrao());
          }
        }}
      >
        Zerar meu progresso
      </button>
    </>
  );
}

function OpcoesBaralho() {
  const atual = typeof document !== "undefined" ? baralhoAtual() : "cheio";
  return (
    <div className="opcoes-baralho">
      {BARALHOS.map(b => (
        <button
          key={b.id}
          className={`opcao-baralho demo-${b.id}${b.id === atual ? " on" : ""}`}
          data-escolha-baralho={b.id}
          aria-pressed={b.id === atual}
          onClick={() => {
            escolherBaralho(b.id);
            window.location.reload();
          }}
        >
          <Mao cartas={["K♠", "K♥", "K♣"]} mini />
          <div><b>{b.nome}</b><small>{b.desc}</small></div>
        </button>
      ))}
    </div>
  );
}

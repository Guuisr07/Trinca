"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useEstado } from "@/lib/estado";
import { TRILHAS } from "@/content/trilhas";
import { Mao } from "@/components/Carta";
import { acharLicao } from "@/lib/dominio/trilha";
import { feita, concluirLicao } from "@/lib/dominio/progresso";
import {
  fichasAgora, gastarFicha, proximaFichaEm, formatarEspera, MAX_FICHAS,
} from "@/lib/dominio/fichas";
import type { Licao as TLicao, PassoAula, Pergunta } from "@/lib/dominio/tipos";

type Passo = ({ tipo: "aula" } & PassoAula) | ({ tipo: "q" } & Pergunta & { repetida?: boolean });

interface LicaoState {
  licao: TLicao;
  revisao: boolean;
  passos: Passo[];
  i: number;
  deprimeira: number;
  total: number;
  errou: boolean;
  bloqueada?: boolean;
}

export function ModalLicao({
  licaoId,
  onFechar,
}: {
  licaoId: string | null;
  onFechar: () => void;
}) {
  const { progresso, setProgresso } = useEstado();
  const [L, setL] = useState<LicaoState | null>(null);
  const [fb, setFb] = useState<{ tipo: "bom" | "ruim"; texto: string } | null>(null);
  const [respondida, setRespondida] = useState<{ escolha: number; certa: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!licaoId) { setL(null); return; }
    const licao = acharLicao(TRILHAS, licaoId);
    if (!licao) return;
    const revisao = feita(progresso, licaoId);
    const agora = Date.now();
    if (!revisao && fichasAgora(progresso, agora) <= 0) {
      setL({ licao, revisao: false, passos: [], i: 0, deprimeira: 0, total: 0, errou: false, bloqueada: true });
      return;
    }
    setL({
      licao, revisao,
      passos: [
        ...licao.aula.map((a): Passo => ({ tipo: "aula", ...a })),
        ...licao.q.map((q): Passo => ({ tipo: "q", ...q })),
      ],
      i: 0, deprimeira: 0, total: licao.q.length, errou: false,
    });
    setFb(null); setRespondida(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licaoId]);

  const revisao = L?.revisao ?? false;

  const avancar = useCallback(() => {
    setFb(null); setRespondida(null);
    setL(prev => prev ? { ...prev, i: prev.i + 1 } : null);
  }, []);

  const responder = useCallback((escolha: number, p: Pergunta & { repetida?: boolean }) => {
    const certo = escolha === p.c;
    setRespondida({ escolha, certa: p.c });
    if (certo) {
      setProgresso(prev => ({ ...prev, acertos: prev.acertos + 1 }));
      setL(prev => {
        if (!prev) return null;
        return { ...prev, deprimeira: p.repetida ? prev.deprimeira : prev.deprimeira + 1 };
      });
      setFb({ tipo: "bom", texto: p.e });
    } else {
      const agora = Date.now();
      setProgresso(prev => {
        let next = { ...prev, erros: prev.erros + 1 };
        if (!revisao) next = gastarFicha(next, agora);
        return next;
      });
      setL(prev => {
        if (!prev) return null;
        return {
          ...prev, errou: true,
          passos: [...prev.passos, { tipo: "q" as const, ...p, repetida: true }],
        };
      });
      setFb({ tipo: "ruim", texto: p.e });
    }
  }, [revisao, setProgresso]);

  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (!L || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "Escape") { fechar(); return; }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (fb) { avancar(); return; }
        if (L.i < L.passos.length && L.passos[L.i]?.tipo === "aula") { avancar(); return; }
      }
      const n = Number(e.key);
      if (n && !fb && L.i < L.passos.length) {
        const p = L.passos[L.i];
        if (p?.tipo === "q" && !respondida && n <= p.o.length) {
          e.preventDefault();
          responder(n - 1, p);
        }
      }
    }
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  });

  function fechar() {
    setL(null); setFb(null); setRespondida(null);
    document.body.style.overflow = "";
    onFechar();
  }

  function lancarConfete() {
    const cv = canvasRef.current;
    if (!cv || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    cv.width = innerWidth; cv.height = innerHeight;
    const cores = ["#F5B82E", "#E8453F", "#5B3FA0", "#241C4F", "#F7EFDF"];
    const fichas = Array.from({ length: 70 }, () => ({
      x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.5,
      r: 4 + Math.random() * 5, vy: 2 + Math.random() * 3.5, vx: -1 + Math.random() * 2,
      g: Math.random() * 6.28, vg: -0.12 + Math.random() * 0.24,
      c: cores[(Math.random() * cores.length) | 0]!,
    }));
    let q = 0;
    (function anima() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      fichas.forEach(f => {
        f.y += f.vy; f.x += f.vx; f.g += f.vg;
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.g);
        ctx.fillStyle = f.c; ctx.beginPath();
        ctx.ellipse(0, 0, f.r, f.r * Math.abs(Math.cos(f.g)) + 1.5, 0, 0, 6.3);
        ctx.fill(); ctx.restore();
      });
      if (++q < 190) requestAnimationFrame(anima);
      else ctx.clearRect(0, 0, cv.width, cv.height);
    })();
  }

  if (!licaoId || !L) return null;

  document.body.style.overflow = "hidden";
  const agora = Date.now();
  const vidas = fichasAgora(progresso, agora);
  const pct = L.passos.length ? Math.round(L.i / L.passos.length * 100) : 0;

  if (L.bloqueada) {
    return (
      <div id="licao" className="on sem-fichas">
        <LicaoTopo vidas={vidas} vip={progresso.vip} pct={0} onSair={fechar} />
        <div className="palco">
          <TelaSemFichas
            titulo="Você ficou sem fichas"
            texto="Lições novas voltam quando a primeira ficha recarregar. Enquanto isso, revisar uma lição já concluída não custa nada."
            espera={formatarEspera(proximaFichaEm(progresso, agora))}
            onVoltar={fechar}
          />
        </div>
        <canvas ref={canvasRef} id="confete" />
      </div>
    );
  }

  const concluido = L.i >= L.passos.length;
  const semFichaAgora = !L.revisao && vidas <= 0;

  if (concluido && !fb) {
    const ganho = L.revisao ? 0 : 10 + L.deprimeira * 2;
    return (
      <ConclusaoView
        L={L} ganho={ganho} vidas={vidas} vip={progresso.vip}
        onContinuar={() => {
          setProgresso(prev => concluirLicao(prev, L.licao.id, L.deprimeira, L.revisao, Date.now()));
          fechar();
        }}
        confete={lancarConfete}
        canvasRef={canvasRef}
      />
    );
  }

  if (semFichaAgora && fb) {
    return (
      <div id="licao" className="on sem-fichas">
        <LicaoTopo vidas={vidas} vip={progresso.vip} pct={pct} onSair={fechar} />
        <div className="palco">
          <TelaSemFichas
            titulo="Acabaram suas fichas"
            texto="Sem drama: revisar é parte do jogo. Uma ficha volta a cada 30 minutos — ou refaça uma lição já concluída, que não custa nada."
            espera={formatarEspera(proximaFichaEm(progresso, agora))}
            onVoltar={fechar}
          />
        </div>
        <canvas ref={canvasRef} id="confete" />
      </div>
    );
  }

  const passo = L.passos[L.i];

  return (
    <div id="licao" className="on">
      <LicaoTopo vidas={vidas} vip={progresso.vip} pct={pct} onSair={() => {
        if (L.i === 0 || confirm("Sair agora perde o progresso desta lição.")) fechar();
      }} />

      <div className="palco" key={L.i}>
        {passo?.tipo === "aula" ? (
          <PassoAulaView passo={passo} revisao={L.revisao} />
        ) : passo?.tipo === "q" ? (
          <PassoPerguntaView p={passo} respondida={respondida} onResponder={(i) => responder(i, passo)} revisao={L.revisao} />
        ) : null}
      </div>

      {passo?.tipo === "aula" && !fb && (
        <div className="rodape-fixo">
          <div className="interno">
            <button className="bt" onClick={avancar} style={{ width: "100%", padding: 15 }}>Entendi</button>
          </div>
        </div>
      )}

      <div className={`feedback${fb ? ` on ${fb.tipo}` : ""}`}>
        <div className="titulo">{fb?.tipo === "bom" ? "✓ Isso aí!" : "✗ Quase lá"}</div>
        <p>{fb?.texto}</p>
        <button className="bt" onClick={avancar} style={{ width: "100%", padding: 13 }}>
          {semFichaAgora ? "Ver o que aconteceu" : "Continuar"}
        </button>
      </div>

      <canvas ref={canvasRef} id="confete" />
    </div>
  );
}

function LicaoTopo({ vidas, vip, pct, onSair }: { vidas: number; vip: boolean; pct: number; onSair: () => void }) {
  return (
    <div className="licao-topo">
      <button className="sair" onClick={onSair} aria-label="Sair da lição">&times;</button>
      <div className="progresso"><i style={{ width: `${pct}%` }} /></div>
      <div className={`fichas${vip ? " vip" : ""}`}>
        {vip ? (
          <span className="infinito">&infin;</span>
        ) : (
          Array.from({ length: MAX_FICHAS }, (_, i) => (
            <div key={i} className={`ficha${i >= vidas ? " perdida" : ""}`} />
          ))
        )}
      </div>
    </div>
  );
}

function PassoAulaView({ passo, revisao }: { passo: PassoAula; revisao: boolean }) {
  return (
    <>
      {revisao && <div className="selo-revisao">Revisão · não gasta ficha</div>}
      <h2>{passo.h}</h2>
      {passo.p && (
        <div className="dom-fala">
          <Image className="dom-mini" src="/assets/marca/dom-estuda.png" alt="" width={48} height={48} />
          <div className="balao" dangerouslySetInnerHTML={{ __html: passo.p }} />
        </div>
      )}
      {passo.naipes && <LegendaNaipes />}
      {passo.cartas && <div className="mesa"><Mao cartas={passo.cartas} /></div>}
      {passo.lista && (
        <ul className="lista">
          {passo.lista.map((li, n) => (
            <li key={n}><i>{n + 1}</i><span dangerouslySetInnerHTML={{ __html: li }} /></li>
          ))}
        </ul>
      )}
    </>
  );
}

function LegendaNaipes() {
  const naipes = [
    { s: "♠", k: "e", nome: "Espadas" },
    { s: "♥", k: "c", nome: "Copas" },
    { s: "♦", k: "o", nome: "Ouros" },
    { s: "♣", k: "p", nome: "Paus" },
  ];
  return (
    <div className="legenda-naipes">
      {naipes.map(n => (
        <div key={n.k} className="pilula-naipe">
          <i className={`n-${n.k}`}>{n.s}</i>{n.nome}
        </div>
      ))}
    </div>
  );
}

function PassoPerguntaView({ p, respondida, onResponder, revisao }: {
  p: Pergunta; respondida: { escolha: number; certa: number } | null;
  onResponder: (i: number) => void; revisao: boolean;
}) {
  return (
    <>
      {revisao && <div className="selo-revisao">Revisão · não gasta ficha</div>}
      <div className="cap">Pergunta</div>
      <div className="pergunta">{p.p}</div>
      {p.board && (
        <div className="mesa">
          <span className="cap">Mesa</span>
          <Mao cartas={p.board} mini />
        </div>
      )}
      <div className="opcoes">
        {p.o.map((opt, n) => {
          const cls = respondida
            ? n === respondida.certa ? "certa" : n === respondida.escolha ? "errada" : ""
            : "";
          return (
            <button
              key={n}
              className={`opc ${cls}`}
              disabled={!!respondida}
              onClick={() => onResponder(n)}
            >
              {p.t === "mao" ? <Mao cartas={opt as string[]} mini /> : (opt as string)}
            </button>
          );
        })}
      </div>
    </>
  );
}

function TelaSemFichas({ titulo, texto, espera, onVoltar }: {
  titulo: string; texto: string; espera: string; onVoltar: () => void;
}) {
  return (
    <div className="fim">
      <Image className="selo" alt="" src="/assets/marca/dom-tira.png" width={150} height={150} />
      <h2>{titulo}</h2>
      <p>{texto}</p>
      <div className="contador">
        <span className="cap">Próxima ficha em</span>
        <b>{espera}</b>
      </div>
      <button className="bt" onClick={onVoltar}>Voltar pra trilha</button>
    </div>
  );
}

function ConclusaoView({ L, ganho, vidas, vip, onContinuar, confete, canvasRef }: {
  L: LicaoState; ganho: number; vidas: number; vip: boolean;
  onContinuar: () => void; confete: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  useEffect(() => { confete(); }, []);

  return (
    <div id="licao" className="on">
      <LicaoTopo vidas={vidas} vip={vip} pct={100} onSair={onContinuar} />
      <div className="palco">
        <div className="fim">
          <Image
            className="selo" alt=""
            src={`/assets/marca/${L.errou ? "dom-pensa" : "dom-vibra"}.png`}
            width={150} height={150}
          />
          <h2>{L.revisao ? "Revisão feita!" : L.errou ? "Lição fechada!" : "Sem errar uma!"}</h2>
          <p>{L.licao.titulo} {L.revisao ? "continua na ponta da língua." : "desbloqueou a próxima."}</p>
          <div className="premios">
            <div className="premio">
              <span className="cap">{L.revisao ? "Revisão" : "XP ganho"}</span>
              <b>{L.revisao ? "grátis" : `+${ganho}`}</b>
            </div>
            <div className="premio">
              <span className="cap">De primeira</span>
              <b>{L.deprimeira}/{L.total}</b>
            </div>
          </div>
          <button className="bt" onClick={onContinuar}>Continuar</button>
        </div>
      </div>
      <canvas ref={canvasRef} id="confete" />
    </div>
  );
}

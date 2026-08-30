"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useEstado } from "@/lib/estado";
import { DESAFIOS } from "@/content/desafios";
import { Mao } from "@/components/Carta";
import {
  xpDoDesafio, estrelasDoDesafio, concluirDesafio,
} from "@/lib/dominio/desafio";
import {
  fichasAgora, gastarFicha, proximaFichaEm, formatarEspera, MAX_FICHAS,
} from "@/lib/dominio/fichas";
import type { Cenario, ReacaoDom, Desafio } from "@/lib/dominio/tipos";

const IMG_DOM: Record<ReacaoDom, string> = {
  pensa: "/assets/marca/dom-pensa.png",
  blefa: "/assets/marca/dom-ri.png",
  ri: "/assets/marca/dom-ri.png",
  perde: "/assets/marca/dom-tira.png",
  provoca: "/assets/marca/dom-vibra.png",
};

interface DesafioState {
  desafio: Desafio;
  i: number;
  acertos: number;
  totalErros: number;
  reacaoDom: ReacaoDom | null;
  fase: "intro" | "jogando" | "feedback" | "fim";
}

export function ModalDesafio({
  desafioId,
  onFechar,
}: {
  desafioId: string | null;
  onFechar: () => void;
}) {
  const { progresso, setProgresso } = useEstado();
  const [D, setD] = useState<DesafioState | null>(null);
  const [respondida, setRespondida] = useState<{ escolha: number; correta: number } | null>(null);
  const [fbTexto, setFbTexto] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!desafioId) { setD(null); return; }
    const desafio = DESAFIOS.find(d => d.id === desafioId);
    if (!desafio) return;
    setD({ desafio, i: 0, acertos: 0, totalErros: 0, reacaoDom: null, fase: "intro" });
    setRespondida(null);
    setFbTexto(null);
  }, [desafioId]);

  const fechar = useCallback(() => {
    setD(null);
    setRespondida(null);
    setFbTexto(null);
    document.body.style.overflow = "";
    onFechar();
  }, [onFechar]);

  const comecar = useCallback(() => {
    setD(prev => prev ? { ...prev, fase: "jogando" } : null);
  }, []);

  const responder = useCallback((escolha: number, cenario: Cenario) => {
    const certo = escolha === cenario.correta;
    setRespondida({ escolha, correta: cenario.correta });
    setFbTexto(cenario.explicacao);

    if (certo) {
      setProgresso(prev => ({ ...prev, acertos: prev.acertos + 1 }));
      setD(prev => prev ? {
        ...prev, acertos: prev.acertos + 1, reacaoDom: cenario.acerto, fase: "feedback",
      } : null);
    } else {
      const agora = Date.now();
      setProgresso(prev => {
        let next = { ...prev, erros: prev.erros + 1 };
        next = gastarFicha(next, agora);
        return next;
      });
      setD(prev => prev ? {
        ...prev, totalErros: prev.totalErros + 1, reacaoDom: cenario.erro, fase: "feedback",
      } : null);
    }
  }, [setProgresso]);

  const avancar = useCallback(() => {
    setRespondida(null);
    setFbTexto(null);
    setD(prev => {
      if (!prev) return null;
      const proximo = prev.i + 1;
      if (proximo >= prev.desafio.cenarios.length) {
        return { ...prev, fase: "fim", reacaoDom: null };
      }
      return { ...prev, i: proximo, fase: "jogando", reacaoDom: null };
    });
  }, []);

  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (!D || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "Escape") { fechar(); return; }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (D.fase === "intro") { comecar(); return; }
        if (D.fase === "feedback") { avancar(); return; }
      }
      if (D.fase === "jogando" && !respondida) {
        const n = Number(e.key);
        const cenario = D.desafio.cenarios[D.i];
        if (cenario && n >= 1 && n <= cenario.opcoes.length) {
          e.preventDefault();
          responder(n - 1, cenario);
        }
      }
    }
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  });

  function lancarConfete() {
    const cv = canvasRef.current;
    if (!cv || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    cv.width = innerWidth; cv.height = innerHeight;
    const cores = ["#F5B82E", "#E8453F", "#5B3FA0", "#241C4F", "#F7EFDF"];
    const fichas = Array.from({ length: 100 }, () => ({
      x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.5,
      r: 4 + Math.random() * 6, vy: 2 + Math.random() * 4, vx: -1.5 + Math.random() * 3,
      g: Math.random() * 6.28, vg: -0.15 + Math.random() * 0.3,
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
      if (++q < 220) requestAnimationFrame(anima);
      else ctx.clearRect(0, 0, cv.width, cv.height);
    })();
  }

  if (!desafioId || !D) return null;

  document.body.style.overflow = "hidden";
  const agora = Date.now();
  const vidas = fichasAgora(progresso, agora);
  const cenario = D.desafio.cenarios[D.i];
  const pct = D.desafio.cenarios.length
    ? Math.round(D.i / D.desafio.cenarios.length * 100) : 0;

  if (D.fase === "intro") {
    return (
      <div id="desafio" className="desafio on">
        <DesafioTopo vidas={vidas} vip={progresso.vip} pct={0} onSair={fechar} />
        <div className="palco desafio-intro">
          <div className="dom-desafio-intro">
            <Image
              src="/assets/marca/dom-vibra.png" alt="Dom Naipe"
              width={180} height={180} className="dom-avatar-grande"
            />
          </div>
          <h2>{D.desafio.nome}</h2>
          <p>
            Hora de provar que você aprendeu! {D.desafio.cenarios.length} rodadas
            contra o Dom Naipe. Cada cenário testa o que a trilha ensinou.
          </p>
          <div className="desafio-meta">
            <div className="premio">
              <span className="cap">Cenários</span>
              <b>{D.desafio.cenarios.length}</b>
            </div>
            <div className="premio">
              <span className="cap">XP máximo</span>
              <b>+{xpDoDesafio(D.desafio.cenarios.length, D.desafio.cenarios.length)}</b>
            </div>
          </div>
          <button className="bt" onClick={comecar}>Aceitar desafio</button>
        </div>
        <canvas ref={canvasRef} id="confete" />
      </div>
    );
  }

  if (D.fase === "fim") {
    const total = D.desafio.cenarios.length;
    const ganho = xpDoDesafio(total, D.acertos);
    const estrelas = estrelasDoDesafio(total, D.acertos);
    return (
      <ConclusaoDesafio
        D={D} ganho={ganho} estrelas={estrelas} vidas={vidas} vip={progresso.vip}
        onContinuar={() => {
          setProgresso(prev =>
            concluirDesafio(prev, D.desafio.id, total, D.acertos, Date.now())
          );
          fechar();
        }}
        confete={lancarConfete}
        canvasRef={canvasRef}
      />
    );
  }

  if (!cenario) return null;

  const semFichaAgora = !progresso.vip && vidas <= 0;

  return (
    <div id="desafio" className="desafio on">
      <DesafioTopo vidas={vidas} vip={progresso.vip} pct={pct} onSair={() => {
        if (D.i === 0 || confirm("Sair agora perde o progresso do desafio.")) fechar();
      }} />

      <div className="palco desafio-palco" key={D.i}>
        <div className="mesa-desafio">
          <div className="dom-lado">
            <DomNaipe reacao={D.reacaoDom} />
            {cenario.maoDom && D.fase === "feedback" && (
              <div className="dom-cartas">
                <span className="cap">Dom Naipe</span>
                <Mao cartas={cenario.maoDom} mini />
              </div>
            )}
          </div>

          {cenario.board && (
            <div className="board-desafio">
              <span className="cap">Mesa</span>
              <Mao cartas={cenario.board} />
            </div>
          )}

          <div className="jogador-lado">
            <div className="jogador-cartas">
              <span className="cap">Suas cartas</span>
              <Mao cartas={cenario.mao} />
            </div>
          </div>
        </div>

        <div className="cenario-corpo">
          <p className="situacao">{cenario.situacao}</p>
          <div className="pergunta">{cenario.pergunta}</div>
          <div className="opcoes">
            {cenario.opcoes.map((opt, n) => {
              const cls = respondida
                ? n === respondida.correta ? "certa" : n === respondida.escolha ? "errada" : ""
                : "";
              return (
                <button
                  key={n} className={`opc ${cls}`}
                  disabled={!!respondida}
                  onClick={() => responder(n, cenario)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`feedback${D.fase === "feedback" ? ` on ${respondida && respondida.escolha === respondida.correta ? "bom" : "ruim"}` : ""}`}>
        <div className="titulo">
          {respondida && respondida.escolha === respondida.correta ? "✓ Isso aí!" : "✗ Dom Naipe levou essa"}
        </div>
        <p>{fbTexto}</p>
        <button className="bt" onClick={() => {
          if (semFichaAgora) { fechar(); return; }
          avancar();
        }}>
          {semFichaAgora ? "Sem fichas — voltar" : D.i + 1 >= D.desafio.cenarios.length ? "Ver resultado" : "Próxima rodada"}
        </button>
      </div>

      <canvas ref={canvasRef} id="confete" />
    </div>
  );
}

function DesafioTopo({ vidas, vip, pct, onSair }: {
  vidas: number; vip: boolean; pct: number; onSair: () => void;
}) {
  return (
    <div className="licao-topo">
      <button className="sair" onClick={onSair} aria-label="Sair do desafio">&times;</button>
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

function DomNaipe({ reacao }: { reacao: ReacaoDom | null }) {
  const src = reacao ? IMG_DOM[reacao] : "/assets/marca/dom-pensa.png";
  return (
    <div className={`dom-avatar${reacao ? ` dom-${reacao}` : ""}`}>
      <Image src={src} alt="Dom Naipe" width={100} height={100} />
    </div>
  );
}

function ConclusaoDesafio({ D, ganho, estrelas, vidas, vip, onContinuar, confete, canvasRef }: {
  D: DesafioState; ganho: number; estrelas: number;
  vidas: number; vip: boolean;
  onContinuar: () => void; confete: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  useEffect(() => { confete(); }, []);

  const total = D.desafio.cenarios.length;
  const venceu = D.acertos > total / 2;

  return (
    <div id="desafio" className="desafio on">
      <DesafioTopo vidas={vidas} vip={vip} pct={100} onSair={onContinuar} />
      <div className="palco">
        <div className="fim">
          <Image
            className="selo" alt=""
            src={venceu ? "/assets/marca/dom-tira.png" : "/assets/marca/dom-vibra.png"}
            width={150} height={150}
          />
          <h2>{venceu ? "Você venceu o Dom Naipe!" : "Dom Naipe levou essa..."}</h2>
          <p>{venceu
            ? "Trilha dominada. Você provou que sabe o que aprendeu."
            : "Mas tudo bem — revise as lições e tente de novo."
          }</p>
          <div className="estrelas-desafio">
            {[1, 2, 3].map(n => (
              <span key={n} className={`estrela${n <= estrelas ? " cheia" : ""}`}>★</span>
            ))}
          </div>
          <div className="premios">
            <div className="premio">
              <span className="cap">Acertos</span>
              <b>{D.acertos}/{total}</b>
            </div>
            <div className="premio">
              <span className="cap">XP ganho</span>
              <b>+{ganho}</b>
            </div>
          </div>
          <button className="bt" onClick={onContinuar}>Continuar</button>
        </div>
      </div>
      <canvas ref={canvasRef} id="confete" />
    </div>
  );
}

"use client";

import { useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { useEstado } from "@/lib/estado";

const CORES = ["#EF5B4C", "#F5B82E", "#3FA9F5", "#22B573", "#8E6FE0", "#FFFFFF"];

function gerarFichas() {
  return Array.from({ length: 20 }, () => {
    const t = 24 + Math.random() * 28;
    const c = CORES[(Math.random() * CORES.length) | 0];
    return {
      left: `${(Math.random() * 100).toFixed(1)}%`,
      size: t,
      bg: c,
      ringIn: (t / 10).toFixed(1),
      ringOut: (t / 6).toFixed(1),
      durCai: `${(5 + Math.random() * 7).toFixed(1)}s`,
      durGira: `${(1.1 + Math.random() * 1.8).toFixed(1)}s`,
      delayCai: `-${(Math.random() * 9).toFixed(1)}s`,
      delayGira: `-${(Math.random() * 2).toFixed(1)}s`,
      opacity: (0.45 + Math.random() * 0.45).toFixed(2),
    };
  });
}

export function Landing({ onEntrar }: { onEntrar: () => void }) {
  const { progresso } = useEstado();
  const dealerRef = useRef<HTMLImageElement>(null);
  const fichas = useMemo(gerarFichas, []);

  const voltando = progresso.xp > 0;
  const cta = voltando ? "Continuar de onde parei" : "Começar a jogar";
  const rodape = voltando
    ? `${progresso.xp} XP acumulados`
    : "Grátis, sem cadastro. Primeira lição: o baralho.";

  function bounce() {
    dealerRef.current?.animate?.(
      [
        { transform: "none" },
        { transform: "translateY(-18px) rotate(-3deg)", offset: 0.4 },
        { transform: "translateY(0) rotate(2.5deg)", offset: 0.7 },
        { transform: "none" },
      ],
      { duration: 550, easing: "cubic-bezier(.2,1.4,.4,1)" },
    );
  }

  return (
    <section className="lp" aria-label="Página inicial">
      {/* chuva de fichas */}
      <div className="lp-chuva" aria-hidden="true">
        {fichas.map((f, i) => (
          <div
            key={i}
            className="lp-ficha"
            style={{
              left: f.left,
              width: f.size,
              height: f.size,
              background: f.bg,
              boxShadow: `inset 0 0 0 ${f.ringIn}px #ffffffd9, inset 0 0 0 ${f.ringOut}px ${f.bg}, 0 3px 0 #00000012`,
              animationDuration: `${f.durCai}, ${f.durGira}`,
              animationDelay: `${f.delayCai}, ${f.delayGira}`,
              opacity: Number(f.opacity),
            }}
          />
        ))}
      </div>

      <header className="lp-cabeca">
        <div className="lp-marca">
          <Image src="/assets/marca/simbolo.png" alt="" width={26} height={26} className="h-[26px] w-auto" />
          Trinca
        </div>
      </header>

      <div className="lp-capa">
        <div className="lp-copy">
          <p className="lp-assina">
            <Image src="/assets/marca/dom-heroi.png" alt="" width={28} height={28} className="lp-pino-img" />
            com Dom Naipe, seu dealer-professor
          </p>
          <h1>
            Poker do <span>zero</span>
          </h1>
          <p className="lp-tag">
            Lições de 3 minutos, com cartas na tela e nenhum termo que você
            precise decorar. Do baralho ao pré-flop.
          </p>
          <button
            className="bt lp-bt"
            onPointerDown={bounce}
            onClick={onEntrar}
          >
            {cta}
          </button>
          <p className="lp-rodapinho">{rodape}</p>
        </div>

        <div className="lp-mesa">
          <div className="lp-raios" aria-hidden="true" />
          <div className="lp-anel" aria-hidden="true" />
          <div className="lp-anel" aria-hidden="true" />
          <div className="lp-anel" aria-hidden="true" />
          <Image
            ref={dealerRef}
            src="/assets/marca/dom-heroi.png"
            alt="Dom Naipe, o dealer-professor"
            width={320}
            height={280}
            className="lp-dealer"
            priority
          />
        </div>
      </div>

      <ul className="lp-pilares">
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="lp-pilar-ico">
            <path d="M4 19V5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
            <polyline points="14,3 14,9 20,9" />
          </svg>
          <b>3 trilhas</b>
          Do baralho às mãos vencedoras, na ordem que faz sentido.
        </li>
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="lp-pilar-ico">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
          <b>XP e ranking</b>
          Cada lição vale ponto. Você sobe na Liga das Fichas.
        </li>
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="lp-pilar-ico">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          <b>1 lição por dia</b>
          Três minutos. A sequência faz o resto.
        </li>
      </ul>
    </section>
  );
}

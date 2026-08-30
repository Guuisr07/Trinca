"use client";

import { useState, useCallback, type ReactNode } from "react";
import Image from "next/image";
import { useEstado } from "@/lib/estado";
import { fichasAgora, MAX_FICHAS } from "@/lib/dominio/fichas";
import { TelaTrilha } from "@/components/TelaTrilha";
import { TelaMaos } from "@/components/TelaMaos";
import { TelaRanking } from "@/components/TelaRanking";
import { TelaPerfil } from "@/components/TelaPerfil";
import { TelaPresencial } from "@/components/TelaPresencial";
import { TrocaTemaNav } from "@/components/TrocaTemaNav";
import { ModalLicao } from "@/components/Licao";

export type Aba = "trilha" | "maos" | "mesa" | "ranking" | "perfil";

export function AppShell() {
  const [aba, setAba] = useState<Aba>("trilha");
  const [licaoAberta, setLicaoAberta] = useState<string | null>(null);
  const { progresso } = useEstado();
  const agora = Date.now();
  const vidas = fichasAgora(progresso, agora);

  const abrirLicao = useCallback((id: string) => setLicaoAberta(id), []);

  const tela = useCallback(() => {
    switch (aba) {
      case "trilha": return <TelaTrilha onAbrirLicao={abrirLicao} />;
      case "maos": return <TelaMaos />;
      case "mesa": return <TelaPresencial />;
      case "ranking": return <TelaRanking />;
      case "perfil": return <TelaPerfil />;
    }
  }, [aba, abrirLicao]);

  return (
    <div className="app" id="app">
      <aside className="side">
        <button className="side-marca" aria-label="Trinca">
          <Image src="/assets/marca/lockup.png" alt="Trinca" width={128} height={32} className="h-8 w-auto" />
        </button>
        <Nav aba={aba} setAba={setAba} />
      </aside>

      <main className="col">
        <div className="topo">
          <button className="marca" aria-label="Trinca">
            <span className="chevron" aria-hidden>&larr;</span>
            <Image src="/assets/marca/simbolo.png" alt="" width={26} height={26} className="h-[26px] w-auto" />
            Trinca
          </button>
          <div className="stat" title="Dias seguidos">
            <span className="ico">🔥</span>
            <span>{progresso.streak}</span>
          </div>
          <div className="stat" title="Experiência">
            <span className="ico">🎰</span>
            <span>{progresso.xp}</span>
          </div>
          <div className="stat" title="Fichas">
            <span className="ico">🃏</span>
            <span>{progresso.vip ? "∞" : `${vidas}/${MAX_FICHAS}`}</span>
          </div>
        </div>
        <div className="faixa" id="tela">
          {tela()}
        </div>
      </main>
      <ModalLicao licaoId={licaoAberta} onFechar={() => setLicaoAberta(null)} />
    </div>
  );
}

function Nav({ aba, setAba }: { aba: Aba; setAba: (a: Aba) => void }) {
  return (
    <nav className="nav">
      <button data-aba="trilha" className={aba === "trilha" ? "on" : ""} onClick={() => setAba("trilha")}>
        <span>♠</span>Trilha
      </button>
      <button data-aba="maos" className={aba === "maos" ? "on" : ""} onClick={() => setAba("maos")}>
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="4" width="11" height="15" rx="2" transform="rotate(14 14.5 11.5)" />
            <rect x="3" y="5" width="11" height="15" rx="2" fill="var(--surface)" />
          </svg>
        </span>Mãos
      </button>
      <button data-aba="mesa" className={aba === "mesa" ? "on" : ""} onClick={() => setAba("mesa")}>
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <ellipse cx="12" cy="12" rx="10" ry="7" />
            <circle cx="7" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="10" r="1.5" fill="currentColor" />
            <circle cx="17" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </span>Mesa
      </button>
      <button data-aba="ranking" className={aba === "ranking" ? "on" : ""} onClick={() => setAba("ranking")}>
        <span>🏆</span>Ranking
      </button>
      <button data-aba="perfil" className={aba === "perfil" ? "on" : ""} onClick={() => setAba("perfil")}>
        <span>👤</span>Perfil
      </button>
      <TrocaTemaNav />
    </nav>
  );
}

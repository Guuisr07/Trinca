"use client";

import { useEstado } from "@/lib/estado";

const BOTS = [
  { n: "Marina", a: "🦊", x: 640 }, { n: "Caio", a: "🐺", x: 520 },
  { n: "Ju", a: "🐱", x: 410 }, { n: "Rafa", a: "🐸", x: 330 },
  { n: "Bia", a: "🦉", x: 260 }, { n: "Tom", a: "🐻", x: 180 },
  { n: "Lê", a: "🐧", x: 120 }, { n: "Nando", a: "🦝", x: 70 },
  { n: "Duda", a: "🐢", x: 30 },
];

function placar(xp: number) {
  return [...BOTS, { n: "Você", a: "🎩", x: xp, eu: true as const }]
    .sort((a, b) => b.x - a.x);
}

export function TelaRanking() {
  const { progresso } = useEstado();
  const lista = placar(progresso.xp);
  const pos = lista.findIndex(j => "eu" in j) + 1;

  return (
    <>
      <div className="liga">
        <div className="medalha">🏆</div>
        <h2>Liga das Fichas</h2>
        <p>
          Você está em <b>{pos}º</b> de {lista.length}.
          Cada lição vale XP — os 3 primeiros sobem de liga no domingo.
        </p>
      </div>
      {lista.map((j, i) => (
        <div key={j.n} className={`linha ${"eu" in j ? "eu" : ""}`}>
          <div className="pos">{i + 1}</div>
          <div className="av">{j.a}</div>
          <div className="nm">{j.n}</div>
          <div className="xp">{j.x} XP</div>
        </div>
      ))}
    </>
  );
}

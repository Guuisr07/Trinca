"use client";

import { MAOS } from "@/content/maos";
import { Mao } from "@/components/Carta";

export function TelaMaos() {
  return (
    <>
      <div className="liga">
        <h2>Ranking das mãos</h2>
        <p>Da mais fraca (1) pra mais forte ({MAOS.length}). Quanto mais rara a combinação, mais forte a mão.</p>
      </div>
      {MAOS.map((m, i) => (
        <div key={m.id} className="mao-linha">
          <div className="pos">{i + 1}</div>
          <div className="mao-info">
            <b>{m.nome}</b>
            <small>{m.como}</small>
          </div>
          <Mao cartas={m.exemplo} mini />
        </div>
      ))}
    </>
  );
}

"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  distribuirFichas,
  valorTotalInventario,
  maxJogadores,
  gerarBlinds,
  sugerirBlindInicial,
  type FichaInventario,
  type DistribuicaoJogador,
  type NivelBlind,
} from "@/lib/dominio/presencial";

type Modo = "cash" | "torneio";
type Etapa = "inventario" | "config" | "resultado";

const DENOMS_PADRAO = [1, 5, 10, 25, 50, 100];

const COR_FICHA: Record<number, string> = {
  1: "#C8C8C8",
  5: "#E8453F",
  10: "#2E64C8",
  25: "#22B573",
  50: "#F5A623",
  100: "#1A1730",
};

function corFicha(valor: number): string {
  return COR_FICHA[valor] ?? "var(--muted)";
}

function FichaChip({ valor, size = 28 }: { valor: number; size?: number }) {
  const cor = corFicha(valor);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: cor,
        color: "#FFF",
        fontSize: size * 0.38,
        fontWeight: 700,
        border: "2px dashed rgba(255,255,255,.4)",
        boxShadow: "0 2px 0 rgba(0,0,0,.2)",
        flexShrink: 0,
      }}
    >
      {valor}
    </span>
  );
}

function TimerBlind({ blinds, tempoMin }: { blinds: NivelBlind[]; tempoMin: number }) {
  const [nivelIdx, setNivelIdx] = useState(0);
  const [restante, setRestante] = useState(tempoMin * 60);
  const [rodando, setRodando] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nivel = blinds[nivelIdx];
  const proximo = nivelIdx + 1 < blinds.length ? blinds[nivelIdx + 1] : null;

  const limpar = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!rodando) { limpar(); return; }
    intervalRef.current = setInterval(() => {
      setRestante((r) => {
        if (r <= 1) {
          setNivelIdx((i) => {
            const next = i + 1;
            if (next >= blinds.length) { setRodando(false); return i; }
            return next;
          });
          return tempoMin * 60;
        }
        return r - 1;
      });
    }, 1000);
    return limpar;
  }, [rodando, tempoMin, blinds.length, limpar]);

  useEffect(() => {
    setRestante(tempoMin * 60);
  }, [nivelIdx, tempoMin]);

  const min = Math.floor(restante / 60);
  const seg = restante % 60;
  const progresso = 1 - restante / (tempoMin * 60);

  if (!nivel) return null;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "2px solid var(--brass)",
        borderRadius: 18,
        padding: "18px 16px",
        marginBottom: 22,
        textAlign: "center",
      }}
    >
      <div className="cap" style={{ marginBottom: 6 }}>
        N&iacute;vel {nivel.nivel}{nivel.ante ? ` · Ante ${nivel.ante}` : ""}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--disp)", letterSpacing: "-.02em" }}>
        {nivel.small} / {nivel.big}
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 99,
          background: "var(--surface-2)",
          margin: "12px 0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progresso * 100}%`,
            background: progresso > 0.8 ? "var(--no)" : "var(--brass)",
            transition: "width 1s linear, background .3s",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 42,
          fontWeight: 700,
          fontFamily: "var(--disp)",
          fontVariantNumeric: "tabular-nums",
          color: restante <= 30 ? "var(--no)" : "var(--ink)",
          transition: "color .3s",
        }}
      >
        {String(min).padStart(2, "0")}:{String(seg).padStart(2, "0")}
      </div>
      {proximo && (
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
          Pr&oacute;ximo: {proximo.small}/{proximo.big}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "center" }}>
        <button
          className={`bt ${rodando ? "" : "fantasma"}`}
          style={{ width: "auto", padding: "10px 20px", fontSize: 14 }}
          onClick={() => setRodando((r) => !r)}
        >
          {rodando ? "Pausar" : restante === tempoMin * 60 && nivelIdx === 0 ? "Iniciar" : "Continuar"}
        </button>
        {nivelIdx + 1 < blinds.length && (
          <button
            className="bt fantasma"
            style={{ width: "auto", padding: "10px 16px", fontSize: 14 }}
            onClick={() => { setNivelIdx((i) => i + 1); setRestante(tempoMin * 60); }}
          >
            Pular &rarr;
          </button>
        )}
      </div>
    </div>
  );
}

export function TelaPresencial() {
  const [etapa, setEtapa] = useState<Etapa>("inventario");
  const [inventario, setInventario] = useState<FichaInventario[]>(
    DENOMS_PADRAO.map((v) => ({ valor: v, qtd: 0 }))
  );
  const [jogadores, setJogadores] = useState(4);
  const [stack, setStack] = useState(500);
  const [modo, setModo] = useState<Modo>("cash");
  const [tempoBlind, setTempoBlind] = useState(15);

  const totalValor = useMemo(() => valorTotalInventario(inventario), [inventario]);
  const maxJog = useMemo(() => maxJogadores(inventario, stack), [inventario, stack]);

  const distribuicao = useMemo<DistribuicaoJogador | null>(() => {
    if (etapa !== "resultado") return null;
    return distribuirFichas(inventario, jogadores, stack);
  }, [etapa, inventario, jogadores, stack]);

  const blinds = useMemo<NivelBlind[]>(() => {
    if (modo !== "torneio" || etapa !== "resultado") return [];
    const sb = sugerirBlindInicial(stack);
    return gerarBlinds(sb, 12);
  }, [modo, stack, etapa]);

  function setQtd(valor: number, qtd: number) {
    setInventario((prev) =>
      prev.map((f) => (f.valor === valor ? { ...f, qtd: Math.max(0, qtd) } : f))
    );
  }

  function addDenom() {
    const existentes = new Set(inventario.map((f) => f.valor));
    const novo = prompt("Valor da ficha:");
    if (!novo) return;
    const val = parseInt(novo, 10);
    if (!val || val <= 0 || existentes.has(val)) return;
    setInventario((prev) => [...prev, { valor: val, qtd: 0 }].sort((a, b) => a.valor - b.valor));
  }

  const inventarioValido = inventario.some((f) => f.qtd > 0);
  const configValido = jogadores >= 2 && stack > 0 && jogadores <= maxJog;

  if (etapa === "resultado" && distribuicao) {
    return (
      <div>
        <button className="cap" style={{ marginBottom: 10 }} onClick={() => setEtapa("config")}>
          &larr; Voltar
        </button>

        <div className="destaque" style={{ marginBottom: 18 }}>
          <p className="cap" style={{ margin: 0 }}>
            {modo === "torneio" ? "Torneio" : "Cash Game"} &middot; {jogadores} jogadores
          </p>
          <h2 style={{ fontSize: 20, margin: "6px 0 2px" }}>
            {distribuicao.total} por jogador
          </h2>
          {distribuicao.total !== stack && (
            <p style={{ fontSize: 13, opacity: 0.8, margin: "2px 0 0" }}>
              (alvo: {stack} &mdash; ajustado pela maleta)
            </p>
          )}
        </div>

        <div className="cap" style={{ marginBottom: 10 }}>Fichas por jogador</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
          {distribuicao.fichas.map((f) => (
            <div
              key={f.valor}
              className="caixa"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
              }}
            >
              <FichaChip valor={f.valor} size={36} />
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 16 }}>{f.qtd}&times;</b>
                <small style={{ marginLeft: 6, color: "var(--muted)" }}>
                  = {f.valor * f.qtd}
                </small>
              </div>
            </div>
          ))}
        </div>

        <div className="cap" style={{ marginBottom: 10 }}>
          Total usado da maleta
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
          {distribuicao.fichas.map((f) => {
            const orig = inventario.find((i) => i.valor === f.valor)!;
            return (
              <div key={f.valor} className="meta" style={{ minWidth: 80 }}>
                <FichaChip valor={f.valor} />
                <b style={{ display: "block", marginTop: 4 }}>
                  {f.qtd * jogadores}/{orig.qtd}
                </b>
              </div>
            );
          })}
        </div>

        {modo === "torneio" && blinds.length > 0 && (
          <>
            <div className="cap" style={{ marginBottom: 10 }}>
              Blinds &middot; {tempoBlind} min por n&iacute;vel
            </div>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                overflow: "hidden",
                marginBottom: 22,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--line)",
                      color: "var(--muted)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                    }}
                  >
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>N&iacute;vel</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>SB</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>BB</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>Ante</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {blinds.map((b) => (
                    <tr
                      key={b.nivel}
                      style={{ borderBottom: "1px solid var(--line)" }}
                    >
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>{b.nivel}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>{b.small}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>{b.big}</td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          color: b.ante ? "inherit" : "var(--muted)",
                        }}
                      >
                        {b.ante || "—"}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          color: "var(--muted)",
                        }}
                      >
                        {b.nivel * tempoBlind}&prime;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {modo === "torneio" && blinds.length > 0 && (
          <TimerBlind blinds={blinds} tempoMin={tempoBlind} />
        )}

        <button className="bt" onClick={() => setEtapa("inventario")}>
          Nova mesa
        </button>
      </div>
    );
  }

  if (etapa === "config") {
    return (
      <div>
        <button className="cap" style={{ marginBottom: 10 }} onClick={() => setEtapa("inventario")}>
          &larr; Voltar
        </button>

        <div className="cap" style={{ marginBottom: 10 }}>Modo</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {(["cash", "torneio"] as Modo[]).map((m) => (
            <button
              key={m}
              className={`bt ${modo === m ? "" : "fantasma"}`}
              style={{ flex: 1, padding: 12, fontSize: 15 }}
              onClick={() => setModo(m)}
            >
              {m === "cash" ? "Cash Game" : "Torneio"}
            </button>
          ))}
        </div>

        <div className="cap" style={{ marginBottom: 10 }}>Jogadores</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <button
            className="bt fantasma"
            style={{ width: 44, padding: 10, fontSize: 18 }}
            onClick={() => setJogadores((j) => Math.max(2, j - 1))}
          >
            &minus;
          </button>
          <span style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--disp)", minWidth: 40, textAlign: "center" }}>
            {jogadores}
          </span>
          <button
            className="bt fantasma"
            style={{ width: 44, padding: 10, fontSize: 18 }}
            onClick={() => setJogadores((j) => j + 1)}
          >
            +
          </button>
          {maxJog > 0 && (
            <small style={{ color: "var(--muted)" }}>max {maxJog}</small>
          )}
        </div>

        <div className="cap" style={{ marginBottom: 10 }}>Stack inicial por jogador</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {[300, 500, 1000, 1500, 2000].map((v) => (
            <button
              key={v}
              className={`bt ${stack === v ? "" : "fantasma"}`}
              style={{ padding: "8px 14px", fontSize: 14, width: "auto" }}
              onClick={() => setStack(v)}
            >
              {v}
            </button>
          ))}
          <input
            type="number"
            value={stack}
            onChange={(e) => setStack(Math.max(0, parseInt(e.target.value, 10) || 0))}
            style={{
              width: 80,
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--ink)",
              fontSize: 14,
              fontWeight: 600,
              textAlign: "center",
            }}
          />
        </div>

        {modo === "torneio" && (
          <>
            <div className="cap" style={{ marginBottom: 10 }}>Tempo por blind (minutos)</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              {[10, 15, 20, 30].map((t) => (
                <button
                  key={t}
                  className={`bt ${tempoBlind === t ? "" : "fantasma"}`}
                  style={{ padding: "8px 14px", fontSize: 14, width: "auto" }}
                  onClick={() => setTempoBlind(t)}
                >
                  {t} min
                </button>
              ))}
            </div>
          </>
        )}

        {!configValido && maxJog > 0 && jogadores > maxJog && (
          <p style={{ color: "var(--no)", fontSize: 13, marginBottom: 12 }}>
            Fichas insuficientes. M&aacute;ximo {maxJog} jogadores com stack de {stack}.
          </p>
        )}

        <button
          className="bt"
          disabled={!configValido}
          style={{ opacity: configValido ? 1 : 0.4 }}
          onClick={() => setEtapa("resultado")}
        >
          Montar mesa
        </button>
      </div>
    );
  }

  // Etapa: inventário
  return (
    <div>
      <div className="cap" style={{ marginBottom: 10 }}>Sua maleta</div>
      <p style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.45, marginBottom: 16 }}>
        Quantas fichas de cada valor voc&ecirc; tem?
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {inventario.map((f) => (
          <div
            key={f.valor}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "10px 14px",
            }}
          >
            <FichaChip valor={f.valor} size={36} />
            <span style={{ fontWeight: 600, flex: 1 }}>{f.valor}</span>
            <button
              className="bt fantasma"
              style={{ width: 36, padding: 6, fontSize: 16 }}
              onClick={() => setQtd(f.valor, f.qtd - 10)}
            >
              &minus;
            </button>
            <input
              type="number"
              value={f.qtd}
              onChange={(e) => setQtd(f.valor, parseInt(e.target.value, 10) || 0)}
              style={{
                width: 56,
                padding: "6px 4px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--bg)",
                color: "var(--ink)",
                fontSize: 15,
                fontWeight: 600,
                textAlign: "center",
              }}
            />
            <button
              className="bt fantasma"
              style={{ width: 36, padding: 6, fontSize: 16 }}
              onClick={() => setQtd(f.valor, f.qtd + 10)}
            >
              +
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addDenom}
        style={{
          display: "block",
          width: "100%",
          padding: 10,
          borderRadius: 12,
          border: "1px dashed var(--line)",
          color: "var(--muted)",
          fontSize: 13,
          marginBottom: 18,
        }}
      >
        + Outro valor de ficha
      </button>

      {totalValor > 0 && (
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>
          Maleta: {totalValor} em fichas
        </p>
      )}

      <button
        className="bt"
        disabled={!inventarioValido}
        style={{ opacity: inventarioValido ? 1 : 0.4 }}
        onClick={() => setEtapa("config")}
      >
        Continuar
      </button>
    </div>
  );
}

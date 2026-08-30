"use client";

import { useEstado } from "@/lib/estado";
import { TRILHAS } from "@/content/trilhas";
import { Icone } from "@/components/Icone";
import {
  liberadas, proximaLicao, xpPossivel, totalLicoes,
} from "@/lib/dominio/trilha";
import { feitasCount, feita, xpDeHoje } from "@/lib/dominio/progresso";
import { fichasAgora, proximaFichaEm, formatarEspera, MAX_FICHAS } from "@/lib/dominio/fichas";

export function TelaTrilha({ onAbrirLicao }: { onAbrirLicao: (id: string) => void }) {
  const { progresso } = useEstado();
  const agora = Date.now();
  const abertas = liberadas(TRILHAS, progresso);
  const semFicha = !progresso.vip && fichasAgora(progresso, agora) <= 0;
  const prox = proximaLicao(TRILHAS, progresso, abertas);
  const feitas = feitasCount(progresso);

  return (
    <>
      {semFicha && (
        <div className="aviso-fichas">
          <i>⚠</i>
          <div>
            <b>Você está sem fichas</b>
            <span>
              Lição nova volta em <b>{formatarEspera(proximaFichaEm(progresso, agora))}</b>.
              Revisar uma lição já concluída continua liberado, de graça.
            </span>
          </div>
        </div>
      )}

      {prox && <Destaque prox={prox} feitas={feitas} semFicha={semFicha} agora={agora} progresso={progresso} onAbrirLicao={onAbrirLicao} />}

      <div className="metas">
        <div className="meta"><i>🔥</i><b>{progresso.streak}</b><small>DIAS SEGUIDOS</small></div>
        <div className="meta"><i>🎯</i><b>{progresso.xp}</b><small>XP TOTAL</small></div>
        <div className="meta"><i>🗺️</i><b>{feitas}/{totalLicoes(TRILHAS)}</b><small>LIÇÕES</small></div>
      </div>

      {TRILHAS.map((t, ti) => (
        <TrilhaBloco key={t.id} trilha={t} ti={ti} abertas={abertas} progresso={progresso} semFicha={semFicha} onAbrirLicao={onAbrirLicao} />
      ))}
    </>
  );
}

function Destaque({ prox, feitas, semFicha, agora, progresso, onAbrirLicao }: {
  prox: NonNullable<ReturnType<typeof proximaLicao>>;
  feitas: number; semFicha: boolean; agora: number;
  progresso: import("@/lib/dominio/tipos").Progresso;
  onAbrirLicao: (id: string) => void;
}) {
  const nova = !feita(progresso, prox.licao.id);
  return (
    <div className="destaque">
      <span className="naipe-marca">{NAIPE_CHAR[prox.trilha.naipe]}</span>
      <div className="cap">{feitas ? "Continue de onde parou" : "Comece por aqui"}</div>
      <h2>{prox.licao.titulo}</h2>
      <p>
        {prox.trilha.nome} &middot; {prox.licao.aula.length} telas de aula e{" "}
        {prox.licao.q.length} perguntas &middot; +{xpPossivel(prox.licao)} XP possíveis
      </p>
      <button className="bt" disabled={nova && semFicha} onClick={() => onAbrirLicao(prox.licao.id)}>
        {nova && semFicha
          ? `Sem fichas · volta em ${formatarEspera(proximaFichaEm(progresso, agora))}`
          : nova ? "Jogar lição" : "Revisar lição"}
      </button>
      <span className="icone-licao">
        <Icone nome={prox.licao.icone} className="size-10" />
      </span>
    </div>
  );
}

const NAIPE_CHAR: Record<string, string> = { e: "♠", c: "♥", o: "♦", p: "♣" };

function TrilhaBloco({ trilha: t, ti, abertas, progresso, semFicha, onAbrirLicao }: {
  trilha: import("@/lib/dominio/tipos").Trilha; ti: number;
  abertas: Record<string, boolean>;
  progresso: import("@/lib/dominio/tipos").Progresso;
  semFicha: boolean;
  onAbrirLicao: (id: string) => void;
}) {
  const feitas = t.licoes.filter(l => feita(progresso, l.id)).length;
  const pct = t.licoes.length ? Math.round(feitas / t.licoes.length * 100) : 0;
  const travada = t.licoes.length > 0 && !abertas[t.licoes[0]!.id] && feitas === 0;

  if (t.embreve || (travada && ti > 0)) {
    const anteriores = TRILHAS.slice(0, ti)
      .every(a => a.licoes.length > 0 && a.licoes.every(l => feita(progresso, l.id)));
    return (
      <div className="bloco-travado">
        <h3>{NAIPE_CHAR[t.naipe]} {t.nome} &middot; em breve</h3>
        <p>{t.desc}</p>
        {t.embreve && anteriores && (
          <p>Você já fechou as trilhas anteriores — não falta nada do seu lado.
            Essa aqui chega numa próxima atualização.</p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`cabecalho-trilha${ti ? "" : ""}`} style={ti ? { marginTop: 34 } : undefined}>
        <span className="naipe-marca">{NAIPE_CHAR[t.naipe]}</span>
        <div className="cap">
          Trilha {ti + 1} &middot; {feitas} de {t.licoes.length}
          {pct === 100 && " · completa ✓"}
        </div>
        <h2>{NAIPE_CHAR[t.naipe]} {t.nome}</h2>
        <p>{t.desc}</p>
        <div className="barra"><i style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="trilha">
        {t.licoes.map((l, i) => {
          const concluida = feita(progresso, l.id);
          const pronta = !concluida && abertas[l.id];
          const cls = concluida ? "feita" : pronta ? "pronta" : "travada";
          const desloc = `desloc-${(i % 4) + 1}`;
          return (
            <div key={l.id}>
              {i > 0 && <div className={`fio ${desloc}`} />}
              <div className={`no ${cls} ${desloc}`}>
                <button disabled={!pronta && !concluida} onClick={() => onAbrirLicao(l.id)}>
                  <div className="bolha">
                    {concluida ? "✓" : pronta
                      ? <Icone nome={l.icone} className="size-7" />
                      : <Icone nome="Lock" className="size-7" />}
                  </div>
                </button>
                <b>{l.titulo}</b>
                <small>
                  {concluida ? "toque pra revisar" : pronta
                    ? (semFicha ? "sem ficha" : "toque pra jogar")
                    : "bloqueada"}
                </small>
                <span className="xpzinho">
                  {concluida ? "✓ FEITA" : `+${xpPossivel(l)} XP`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fim-trilha">
        <div className="fichinhas">
          {["#E8453F", "#F5B82E", "#5B3FA0", "#241C4F"].map(c => (
            <i key={c} style={{ background: c }} />
          ))}
        </div>
        {pct === 100 ? "Trilha fechada. Boa!" : `${feitas} de ${t.licoes.length} lições — falta pouco`}
      </div>
    </>
  );
}

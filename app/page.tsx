import { Flame, Lock, Map, Target, Trophy, Zap } from "lucide-react";
import { TrocaTema } from "@/components/TrocaTema";
import { MAX_FICHAS, RECARGA_MS, formatarEspera, gastarFicha } from "@/lib/dominio/fichas.ts";
import { progressoPadrao } from "@/lib/dominio/progresso.ts";

/* Passo 1 da ADR-012: o andaime. Esta página não é produto — é a prova de que
   token, tema, tipografia e ícone estão de pé. Sai no passo 4, quando as telas
   de verdade chegarem. */

/* Classe escrita por extenso de propósito: o Tailwind lê o código-fonte como
   texto, então `bg-${nome}` não gera nada. Interpolar classe é o erro clássico. */
const CORES = [
  ["bg", "bg-bg", "superfície de fundo"],
  ["surface", "bg-surface", "cartão"],
  ["surface-2", "bg-surface-2", "cartão fundo"],
  ["ink", "bg-ink", "texto"],
  ["muted", "bg-muted", "texto secundário"],
  ["line", "bg-line", "borda"],
  ["brass", "bg-brass", "destaque e CTA"],
  ["ok", "bg-ok", "acerto"],
  ["no", "bg-no", "erro"],
  ["azul", "bg-azul", "roxo secundário"],
] as const;

const NAIPES = [
  ["bg-naipe-e", "espadas"],
  ["bg-naipe-c", "copas"],
  ["bg-naipe-o", "ouros"],
  ["bg-naipe-p", "paus"],
] as const;

/* Ícone entra por nome, nunca por emoji (ADR-005). */
const ICONES = [
  [Flame, "sequência"],
  [Target, "XP"],
  [Map, "progresso"],
  [Zap, "ficha"],
  [Lock, "lição travada"],
  [Trophy, "liga"],
] as const;

export default function Andaime() {
  return (
    <main className="mx-auto max-w-[600px] px-5 py-10">
      <header className="mb-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted">
            Passo 1 · andaime
          </p>
          <h1 className="text-3xl font-extrabold">Trinca</h1>
        </div>
        <TrocaTema />
      </header>

      <Bloco titulo="Cores">
        <div className="grid grid-cols-2 gap-2">
          {CORES.map(([nome, classe, papel]) => (
            <div
              key={nome}
              className="flex items-center gap-3 rounded-flat border-2 border-line p-2"
            >
              <span className={`size-8 shrink-0 rounded-lg border border-line ${classe}`} />
              <span className="min-w-0">
                <code className="block text-sm font-semibold">{nome}</code>
                <span className="block truncate text-xs text-muted">{papel}</span>
              </span>
            </div>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="Naipes">
        <div className="flex gap-2">
          {NAIPES.map(([classe, papel]) => (
            <div
              key={papel}
              className="flex-1 rounded-flat border-2 border-line p-3 text-center"
            >
              <span className={`mx-auto block size-6 rounded-full ${classe}`} />
              <span className="mt-2 block text-xs text-muted">{papel}</span>
            </div>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="Ícones — SVG, nunca emoji">
        <div className="flex flex-wrap gap-4">
          {ICONES.map(([Icone, papel]) => (
            <span key={papel} className="flex items-center gap-2 text-muted">
              <Icone className="size-5" aria-hidden />
              <span className="text-sm">{papel}</span>
            </span>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="Tipografia">
        <p className="font-disp text-2xl font-extrabold -tracking-[.02em]">
          Bricolage Grotesque — títulos
        </p>
        <p className="font-body text-base">Instrument Sans — corpo e botões</p>
      </Bloco>

      <Bloco titulo="Botão">
        <button type="button" className="bt-flat w-full py-4 text-base tracking-[.02em]">
          Continuar
        </button>
      </Bloco>

      <Bloco titulo="Domínio — TS puro, sem React">
        <Fichas />
      </Bloco>

      <p className="mt-10 text-sm text-muted">
        App atual segue rodando em <code>npm run dev:legacy</code>.
      </p>
    </main>
  );
}

/* Prova de que o domínio roda fora do React: dois erros num lote cheio, com
   o instante entrado por parâmetro. Nenhum `Date.now()` dentro da regra —
   é o que deixa a mesma função rodar no servidor depois (ADR-009). */
function Fichas() {
  const agora = 1_700_000_000_000;
  const p = gastarFicha(gastarFicha(progressoPadrao(), agora), agora + RECARGA_MS / 2);
  const espera = formatarEspera(RECARGA_MS / 2);

  return (
    <div className="flex items-center gap-3 rounded-flat border-2 border-line p-3">
      <span className="flex gap-1.5" aria-label={`${p.vidas} de ${MAX_FICHAS} fichas`}>
        {Array.from({ length: MAX_FICHAS }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={`size-4 rounded-full ${i < p.vidas ? "bg-brass" : "bg-line"}`}
          />
        ))}
      </span>
      <span className="text-sm text-muted">
        {p.vidas}/{MAX_FICHAS} · próxima em {espera}
      </span>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[.14em] text-muted">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

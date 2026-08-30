import type { Naipe as TipoNaipe } from "@/lib/dominio/tipos.ts";

/* Naipe como SVG (ADR-005). O caractere ♠♥♦♣ continua sendo o dado da carta;
   quem desenha é este componente.

   A cor sai do token do tema (`--n-e`, `--n-c`, `--n-o`, `--n-p`) porque o
   baralho de 4 cores clareia no escuro. Cor de naipe escrita na mão vira
   dívida na virada do tema — regra do DESIGN.md. */

const CAMINHO: Record<TipoNaipe, string> = {
  // espadas
  e: "M12 2c-1.6 3.3-4.4 5.2-6.4 7.2C4 10.7 3.4 12 3.4 13.4c0 2.3 1.8 4.1 4 4.1 1.3 0 2.4-.6 3.2-1.5-.2 2-.8 3.4-2.1 4h7c-1.3-.6-1.9-2-2.1-4 .8.9 1.9 1.5 3.2 1.5 2.2 0 4-1.8 4-4.1 0-1.4-.6-2.7-2.2-4.2C16.4 7.2 13.6 5.3 12 2Z",
  // copas
  c: "M12 21c-.4 0-.8-.2-1.1-.5C7.2 17 3 13.6 3 9.4 3 6.4 5.2 4 8 4c1.6 0 3.1.8 4 2.1C12.9 4.8 14.4 4 16 4c2.8 0 5 2.4 5 5.4 0 4.2-4.2 7.6-7.9 11.1-.3.3-.7.5-1.1.5Z",
  // ouros
  o: "M12 2 3.6 12 12 22l8.4-10L12 2Z",
  // paus
  p: "M12 2a4 4 0 0 0-3.1 6.5A4 4 0 1 0 8 16.3c1 0 1.9-.4 2.6-1-.1 2.2-.7 3.8-2.1 4.7h7c-1.4-.9-2-2.5-2.1-4.7.7.6 1.6 1 2.6 1a4 4 0 1 0-.9-7.8A4 4 0 0 0 12 2Z",
};

const COR: Record<TipoNaipe, string> = {
  e: "text-naipe-e",
  c: "text-naipe-c",
  o: "text-naipe-o",
  p: "text-naipe-p",
};

const NOME: Record<TipoNaipe, string> = {
  e: "espadas",
  c: "copas",
  o: "ouros",
  p: "paus",
};

export function Naipe({
  tipo,
  className = "size-5",
  rotulo = false,
}: {
  tipo: TipoNaipe;
  className?: string;
  /** Ligue quando o naipe carregar significado sozinho, sem texto ao lado. */
  rotulo?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${COR[tipo]} ${className}`}
      {...(rotulo ? { role: "img", "aria-label": NOME[tipo] } : { "aria-hidden": true })}
    >
      <path d={CAMINHO[tipo]} />
    </svg>
  );
}

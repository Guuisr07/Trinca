"use client";

const NAIPES: Record<string, string> = { "♠": "e", "♥": "c", "♦": "o", "♣": "p" };
const COR: Record<string, string> = {
  e: "text-naipe-e", c: "text-naipe-c", o: "text-naipe-o", p: "text-naipe-p",
};
const BG: Record<string, string> = {
  e: "bg-naipe-e", c: "bg-naipe-c", o: "bg-naipe-o", p: "bg-naipe-p",
};

export function Carta({ c, mini }: { c: string; mini?: boolean }) {
  const naipe = c.slice(-1);
  const valor = c.slice(0, -1);
  const k = NAIPES[naipe] ?? "e";
  return (
    <div
      className={`carta ${COR[k]} ${mini ? "mini" : ""}`}
      data-naipe={k}
    >
      <u>{valor}</u>
      <b>{naipe}</b>
    </div>
  );
}

export function Mao({ cartas, mini }: { cartas: string[]; mini?: boolean }) {
  return (
    <div className="mao">
      {cartas.map((c, i) => (
        <Carta key={`${c}-${i}`} c={c} mini={mini} />
      ))}
    </div>
  );
}

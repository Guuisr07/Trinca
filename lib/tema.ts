/* Tema claro/escuro. Mesma chave do app legado — quem já escolheu o tema não
   perde a escolha na migração. */

export const CHAVE_TEMA = "trinca.tema";

export type Tema = "light" | "dark";

/** Roda antes da primeira pintura, no <head>. Sem isso a tela pisca clara
    antes do React montar. Precisa ser string: vai inline no HTML. */
export const SCRIPT_TEMA = `try{document.documentElement.dataset.tema=localStorage.getItem("${CHAVE_TEMA}")||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light")}catch{document.documentElement.dataset.tema="light"}`;

export function lerTema(): Tema {
  return document.documentElement.dataset.tema === "dark" ? "dark" : "light";
}

export function gravarTema(tema: Tema): void {
  document.documentElement.dataset.tema = tema;
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    /* modo privado: o tema vale só nesta sessão */
  }
}

/* Progresso do jogador, persistido em localStorage.
   Dono único do estado — nenhum outro módulo escreve em localStorage. */

const CHAVE = "trinca.v1";

/* Fábrica, não constante: um objeto literal compartilhado vazaria o
   mesmo `feitas` entre o padrão e o estado vivo. */
const padrao = () => ({ xp:0, feitas:{}, acertos:0, erros:0, streak:1, dia:null });

function carregar(){
  try { return Object.assign(padrao(), JSON.parse(localStorage.getItem(CHAVE) || "{}")); }
  catch { return padrao(); }
}

/** Estado vivo. Mutável de propósito: uma referência só, compartilhada. */
export const S = carregar();

export function salvar(){
  try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch {}
}

export function zerar(){
  Object.assign(S, padrao());
  salvar();
}

/** Conta o dia de hoje na sequência. Idempotente dentro do mesmo dia. */
export function marcarDia(){
  const hoje = new Date().toDateString();
  if (S.dia === hoje) return;
  const ontem = new Date(Date.now() - 864e5).toDateString();
  S.streak = (S.dia === ontem) ? S.streak + 1 : 1;
  S.dia = hoje;
}

/* Progresso do jogador, persistido em localStorage.
   Dono único do estado — nenhum outro módulo escreve em localStorage. */

const CHAVE = "trinca.v1";

/** Fichas cheias. Erro custa uma; sem ficha, lição nova trava. */
export const MAX_VIDAS = 5;

/** Uma ficha de volta a cada 30 minutos. */
export const RECARGA_MS = 30 * 60 * 1000;

/** Meta diária da missão do trilho. */
export const META_DIA = 20;

/* Fábrica, não constante: um objeto literal compartilhado vazaria o
   mesmo `feitas` entre o padrão e o estado vivo. */
const padrao = () => ({ xp:0, xpHoje:0, feitas:{}, acertos:0, erros:0, streak:1, dia:null,
  vidas:MAX_VIDAS, gastaEm:null, vip:false });

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
  S.xpHoje = 0;
}

/** XP ganho hoje. Zera sozinho na virada do dia, mesmo com a aba aberta. */
export const xpDeHoje = () => (S.dia === new Date().toDateString() ? S.xpHoje : 0);

/* ---------- fichas ----------
   Nada de timer contando pra baixo: o relógio é o próprio `gastaEm`, o
   instante em que a primeira ficha do lote foi perdida. Quantas voltaram é
   conta de tempo decorrido, feita na hora de ler. Sobrevive a recarregar a
   página, fechar a aba e dormir a máquina — um setInterval não sobreviveria. */

/** Fichas disponíveis agora, já aplicando a recarga por tempo. Muta S. */
export function vidasAgora(){
  if (S.vip) return MAX_VIDAS;
  if (S.vidas >= MAX_VIDAS || !S.gastaEm){
    if (S.gastaEm && S.vidas >= MAX_VIDAS){ S.gastaEm = null; salvar(); }
    return S.vidas;
  }
  const ganhas = Math.floor((Date.now() - S.gastaEm) / RECARGA_MS);
  if (ganhas <= 0) return S.vidas;
  S.vidas = Math.min(MAX_VIDAS, S.vidas + ganhas);
  S.gastaEm = S.vidas >= MAX_VIDAS ? null : S.gastaEm + ganhas * RECARGA_MS;
  salvar();
  return S.vidas;
}

/** Tira uma ficha. Sem efeito no VIP. Devolve quantas sobraram. */
export function perderVida(){
  if (S.vip) return MAX_VIDAS;
  const atuais = vidasAgora();
  if (atuais <= 0) return 0;
  // o relógio da recarga só começa quando o lote deixa de estar cheio
  if (atuais >= MAX_VIDAS) S.gastaEm = Date.now();
  S.vidas = atuais - 1;
  salvar();
  return S.vidas;
}

/** Milissegundos até a próxima ficha. 0 quando não há o que esperar. */
export function proximaVidaEm(){
  if (S.vip || vidasAgora() >= MAX_VIDAS || !S.gastaEm) return 0;
  return Math.max(0, S.gastaEm + RECARGA_MS - Date.now());
}

/** "12:43" ou "1h04" — o que cabe no espaço de um contador. */
export function formatarEspera(ms){
  const s = Math.ceil(ms / 1000);
  if (s >= 3600) return Math.floor(s / 3600) + "h" + String(Math.floor(s % 3600 / 60)).padStart(2, "0");
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

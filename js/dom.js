/* Atalhos de DOM. Único lugar que conhece a API do navegador por seleção. */
export const $ = s => document.querySelector(s);
export const $$ = s => Array.from(document.querySelectorAll(s));

/* Corta a folha assets/trinca-logo.png em PNGs soltos com fundo transparente.
   Rodar: node tools/cortar-logo.mjs   (precisa do playwright de devDependencies) */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const FOLHA = 'assets/trinca-logo.png';
const SAIDA = 'assets/marca';

// x, y, w, h na folha 1536x1024. modo: 'maior' fica só com o maior blob.
const PECAS = [
  { nome: 'lockup',     r: [190, 10, 1190, 340], modo: 'tudo' },
  { nome: 'dom-heroi',  r: [40, 320, 520, 700], modo: 'maior' },
  { nome: 'dom-estuda', r: [530, 350, 270, 350], modo: 'maior' },
  { nome: 'dom-ri',     r: [790, 355, 275, 350], modo: 'maior' },
  { nome: 'dom-tira',   r: [1075, 330, 310, 375], modo: 'maior' },
  { nome: 'dom-pensa',  r: [510, 690, 290, 310], modo: 'maior' },
  { nome: 'dom-vibra',  r: [800, 690, 260, 310], modo: 'maior' },
  { nome: 'dom-carta',  r: [1040, 690, 280, 310], modo: 'maior' },
  { nome: 'balao',      r: [1300, 740, 220, 160], modo: 'maior' },
];

const b = readFileSync(FOLHA);
const dataUrl = 'data:image/png;base64,' + b.toString('base64');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('data:text/html,<body>');

const out = await page.evaluate(async ({ dataUrl, PECAS }) => {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();

  const res = {};
  for (const { nome, r, modo } of PECAS) {
    const [x, y, w, h] = r;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
    const id = ctx.getImageData(0, 0, w, h);
    const p = id.data;
    const at = (px, py) => (py * w + px) * 4;

    // 1) flood fill da borda: o fundo é um degradê liso, então comparo com o
    // vizinho (delta local). Degradê passa, contorno do desenho barra.
    const TOL = 26;
    const fora = new Uint8Array(w * h);
    const fila = [];
    for (let px = 0; px < w; px++) { fila.push(px, 0); fila.push(px, h - 1); }
    for (let py = 0; py < h; py++) { fila.push(0, py); fila.push(w - 1, py); }
    while (fila.length) {
      const py = fila.pop(), px = fila.pop();
      if (px < 0 || py < 0 || px >= w || py >= h) continue;
      const i = py * w + px;
      if (fora[i]) continue;
      fora[i] = 1;
      const o = i * 4;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = px + dx, ny = py + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (fora[ny * w + nx]) continue;
        const n = at(nx, ny);
        const d = Math.abs(p[o] - p[n]) + Math.abs(p[o+1] - p[n+1]) + Math.abs(p[o+2] - p[n+2]);
        if (d <= TOL) fila.push(nx, ny);
      }
    }

    // 2) blobs do que sobrou, pra jogar fora sujeira e sprite vizinho
    const rot = new Int32Array(w * h).fill(-1);
    const blobs = [];
    for (let i = 0; i < w * h; i++) {
      if (fora[i] || rot[i] >= 0) continue;
      const id2 = blobs.length;
      let n = 0, minx = w, miny = h, maxx = 0, maxy = 0;
      const st = [i];
      rot[i] = id2;
      while (st.length) {
        const j = st.pop();
        const jx = j % w, jy = (j / w) | 0;
        n++;
        if (jx < minx) minx = jx; if (jx > maxx) maxx = jx;
        if (jy < miny) miny = jy; if (jy > maxy) maxy = jy;
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
          const nx = jx + dx, ny = jy + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const k = ny * w + nx;
          if (fora[k] || rot[k] >= 0) continue;
          rot[k] = id2; st.push(k);
        }
      }
      blobs.push({ id: id2, n, minx, miny, maxx, maxy });
    }
    const maior = blobs.reduce((a, b2) => (b2.n > a.n ? b2 : a), { n: 0 });
    const vive = new Set(
      (modo === 'maior' ? [maior] : blobs.filter(bb => bb.n >= maior.n * 0.02)).map(bb => bb.id)
    );

    let minx = w, miny = h, maxx = 0, maxy = 0;
    for (let i = 0; i < w * h; i++) {
      if (!vive.has(rot[i])) { p[i * 4 + 3] = 0; continue; }
      const ix = i % w, iy = (i / w) | 0;
      if (ix < minx) minx = ix; if (ix > maxx) maxx = ix;
      if (iy < miny) miny = iy; if (iy > maxy) maxy = iy;
    }
    ctx.putImageData(id, 0, 0);

    // 3) recorta na caixa do que sobrou, com 2px de folga
    const m = 2;
    const cx = Math.max(0, minx - m), cy = Math.max(0, miny - m);
    const cw = Math.min(w, maxx + m) - cx + 1, ch = Math.min(h, maxy + m) - cy + 1;
    const c2 = document.createElement('canvas');
    c2.width = cw; c2.height = ch;
    c2.getContext('2d').drawImage(c, cx, cy, cw, ch, 0, 0, cw, ch);
    res[nome] = { png: c2.toDataURL('image/png').split(',')[1], w: cw, h: ch, blobs: blobs.length };

    // simbolo e wordmark saem fatiando o lockup já limpo — limpar cada um
    // sozinho deixa o fundo vazar pras cartas laterais.
    if (nome === 'lockup') {
      for (const [fnome, fx, fw] of [['simbolo', 0, 430], ['wordmark', 445, cw - 445]]) {
        const c3 = document.createElement('canvas');
        c3.width = fw; c3.height = ch;
        c3.getContext('2d').drawImage(c2, fx, 0, fw, ch, 0, 0, fw, ch);
        res[fnome] = { png: c3.toDataURL('image/png').split(',')[1], w: fw, h: ch, blobs: 0 };
      }
    }
  }
  return res;
}, { dataUrl, PECAS });

mkdirSync(SAIDA, { recursive: true });
for (const [nome, v] of Object.entries(out)) {
  writeFileSync(`${SAIDA}/${nome}.png`, Buffer.from(v.png, 'base64'));
  console.log(nome.padEnd(12), `${v.w}x${v.h}`, `blobs=${v.blobs}`);
}
await browser.close();

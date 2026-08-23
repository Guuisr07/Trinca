/* Chuva de fichas na conclusão da lição. Canvas puro, ~3s, sem dependência. */

import { $ } from "./dom.js";


export function confete(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = $("#confete"), ctx = cv.getContext("2d");
  cv.width = innerWidth; cv.height = innerHeight;
  const cores = ["#B4831F", "#2E8B57", "#C0392B", "#E3B04B", "#F5F7F2"];
  const fichas = Array.from({length:70}, () => ({
    x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.5,
    r: 4 + Math.random() * 5, vy: 2 + Math.random() * 3.5, vx: -1 + Math.random() * 2,
    g: Math.random() * 6.28, vg: -0.12 + Math.random() * 0.24,
    c: cores[(Math.random() * cores.length) | 0]
  }));
  let quadros = 0;
  (function anima(){
    ctx.clearRect(0, 0, cv.width, cv.height);
    fichas.forEach(f => {
      f.y += f.vy; f.x += f.vx; f.g += f.vg;
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.g);
      ctx.fillStyle = f.c; ctx.beginPath();
      ctx.ellipse(0, 0, f.r, f.r * Math.abs(Math.cos(f.g)) + 1.5, 0, 0, 6.3);
      ctx.fill(); ctx.restore();
    });
    if (++quadros < 190) requestAnimationFrame(anima);
    else ctx.clearRect(0, 0, cv.width, cv.height);
  })();
}


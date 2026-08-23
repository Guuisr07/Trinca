/* Servidor estático mínimo. Existe porque index.html usa <script type="module">,
   e módulo ES não carrega por file:// (CORS bloqueia origin null) — abrir o
   HTML com duplo clique deixa o app inteiro sem JS.
   Rodar:  node serve.mjs   ->  http://localhost:5173 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const raiz = import.meta.dirname;
const TIPO = { ".html":"text/html", ".js":"text/javascript", ".mjs":"text/javascript",
               ".css":"text/css", ".json":"application/json", ".svg":"image/svg+xml" };

createServer(async (req, res) => {
  const rel = normalize(decodeURIComponent(req.url.split("?")[0]));
  const arq = join(raiz, rel === sep || rel === "/" ? "index.html" : rel);
  if (!arq.startsWith(raiz)) return res.writeHead(403).end("403");
  try {
    const corpo = await readFile(arq);
    res.writeHead(200, { "content-type": TIPO[extname(arq)] ?? "application/octet-stream",
                         "cache-control": "no-store" }).end(corpo);
  } catch { res.writeHead(404).end("404"); }
}).listen(5173, () => console.log("Trinca em http://localhost:5173"));

// Vista previa local: arma el sitio y lo sirve en http://localhost:4321 (igual que en Vercel: /pagina/ → /pagina/index.html).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { RAIZ } from "./_util.mjs";

const PUERTO = Number(process.env.PUERTO || 4321);
const DIST = path.join(RAIZ, "dist");
if (!process.argv.includes("--sin-build")) {
  const r = spawnSync(process.execPath, [path.join(RAIZ, "plantilla", "build.mjs")], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status);
}
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon" };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (!p.includes(".") && !p.endsWith("/")) { res.writeHead(308, { Location: p + "/" }); return res.end(); }
  let f = path.join(DIST, p);
  if (!f.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (p.endsWith("/")) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404, { "Content-Type": TIPOS[".html"] }); return res.end(fs.existsSync(path.join(DIST, "404.html")) ? fs.readFileSync(path.join(DIST, "404.html")) : "404"); }
  res.writeHead(200, { "Content-Type": TIPOS[path.extname(f).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
  fs.createReadStream(f).pipe(res);
}).listen(PUERTO, () => console.log(`\nVista previa: http://localhost:${PUERTO}  (Ctrl+C para cerrarla)\n`));

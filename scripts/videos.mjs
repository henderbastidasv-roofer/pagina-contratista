// Prepara los videos reales de la compañía para la página:
// - recorta de 8 a 12 segundos (desde el segundo 2, para saltar el arranque del dron);
// - quita el sonido;
// - achica a 1280 px de ancho, en H.264 que corre en cualquier celular;
// - si el video viene en HDR (iPhone, DJI), lo pasa a colores normales, para que no salga lavado;
// - saca una foto del video para usarla de portada mientras carga.
// Uso: npm run videos -- "C:\ruta\a\la\carpeta\con\videos"   (o la ruta de un solo video)
// Necesita ffmpeg. Si falta: en Windows  winget install Gyan.FFmpeg ; en Mac  brew install ffmpeg
// NUNCA usar videos de stock como si fueran trabajos de la compañía.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { RAIZ } from "./_util.mjs";

const origen = process.argv[2];
const segundos = Number(process.argv[3] || 12);
if (!origen || !fs.existsSync(origen)) {
  console.error('\nDime la carpeta (o el video): npm run videos -- "C:\\ruta\\a\\los\\videos"\n');
  process.exit(1);
}
const ff = (args) => spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { encoding: "utf8" });
if (spawnSync("ffmpeg", ["-version"]).status !== 0) {
  console.error("\nFalta ffmpeg. Instálalo (Windows: winget install Gyan.FFmpeg · Mac: brew install ffmpeg) y vuelve a intentar.\n");
  process.exit(1);
}
const DEST = path.join(RAIZ, "compania", "videos");
const FOTOS = path.join(RAIZ, "compania", "fotos");
fs.mkdirSync(DEST, { recursive: true });
fs.mkdirSync(FOTOS, { recursive: true });
const limpio = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "video";
const archivos = fs.statSync(origen).isDirectory()
  ? fs.readdirSync(origen).filter((f) => /\.(mp4|mov|m4v)$/i.test(f)).map((f) => path.join(origen, f))
  : [origen];
if (!archivos.length) { console.error("\nNo encontré videos (.mp4, .mov) ahí.\n"); process.exit(1); }

console.log(`\nPreparando ${archivos.length} videos…`);
for (const f of archivos) {
  const nombre = limpio(path.parse(f).name);
  const sonda = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer:format=duration", "-of", "json", f], { encoding: "utf8" });
  let dur = 0, hdr = false;
  try { const j = JSON.parse(sonda.stdout); dur = Number(j.format?.duration || 0); hdr = /arib-std-b67|smpte2084/.test(j.streams?.[0]?.color_transfer || ""); } catch {}
  const inicio = dur > segundos + 4 ? 2 : 0;
  const largo = Math.min(segundos, Math.max(dur - inicio, 1));
  const base = "scale=1280:-2:flags=lanczos";
  const filtro = hdr ? `zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,${base}` : `${base},format=yuv420p`;
  const salida = path.join(DEST, nombre + ".mp4");
  const args = (vf) => ["-ss", String(inicio), "-i", f, "-t", String(largo), "-an", "-vf", vf, "-c:v", "libx264", "-preset", "slow", "-crf", "27",
    "-maxrate", "4M", "-bufsize", "8M", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", salida];
  let r = ff(args(filtro));
  if (r.status !== 0 && hdr) r = ff(args(`${base},format=yuv420p`)); // si este ffmpeg no trae zscale
  if (r.status !== 0) { console.log(`  ✗ ${path.basename(f)}: ${(r.stderr || "").split("\n")[0]}`); continue; }
  const poster = path.join(FOTOS, nombre + "-portada.jpg");
  ff(["-ss", String(Math.min(1, largo / 2)), "-i", salida, "-frames:v", "1", "-q:v", "3", poster]);
  const mb = (fs.statSync(salida).size / 1048576).toFixed(1);
  console.log(`  ✓ ${nombre}.mp4  (${largo.toFixed(0)} s, ${mb} MB${hdr ? ", HDR → normal" : ""})  · portada: ${nombre}-portada.jpg`);
  if (mb > 10) console.log("    ⚠️ Pesa más de 10 MB: usa uno más corto (npm run videos -- <video> 8).");
}
console.log("\nListo. Ahora Claude Code los revisa y los pone en hero.video o en proyectos[].video de compania/sitio.json.\n");

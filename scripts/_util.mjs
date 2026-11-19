// Ayudas compartidas por los scripts de pagina-contratista. Funcionan igual en Windows y en Mac. Sin dependencias.
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ENV = path.join(RAIZ, ".env");

function parsear(archivo) {
  if (!fs.existsSync(archivo)) return {};
  const vars = {};
  for (const linea of fs.readFileSync(archivo, "utf8").split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) vars[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
  return vars;
}
/** Lee .env y .env.local (el segundo manda). Las claves nunca se escriben en el código. */
export function leerEnvs() {
  return { ...parsear(ENV), ...parsear(path.join(RAIZ, ".env.local")) };
}
export function guardarEnv(vars) {
  const texto = Object.entries(vars).filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '\\"')}"`).join("\n");
  fs.writeFileSync(ENV, texto + "\n", { mode: 0o600 });
}

/** Pregunta en la Terminal. Con oculto=true no se ve lo que escribes (para claves). */
export function preguntar(texto, { oculto = false } = {}) {
  if (oculto && process.stdin.isTTY) return preguntarOculto(texto);
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl.question(texto, (r) => { rl.close(); resolve(r.trim()); });
  });
}
function preguntarOculto(texto) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    let valor = "";
    process.stdout.write(texto);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const alTeclear = (trozo) => {
      for (const c of trozo) {
        if (c === "\r" || c === "\n") {
          stdin.setRawMode(false); stdin.pause(); stdin.off("data", alTeclear);
          process.stdout.write("\n");
          resolve(valor.trim());
          return;
        }
        if (c === "\u0003") { process.stdout.write("\n"); process.exit(1); }
        if (c === "\u007f" || c === "\b") { if (valor.length) { valor = valor.slice(0, -1); process.stdout.write("\b \b"); } continue; }
        if (c >= " ") { valor += c; process.stdout.write("*"); }
      }
    };
    stdin.on("data", alTeclear);
  });
}

/** Corre un comando y deja ver su salida. En Windows usa el .cmd de npm/npx. */
export function correr(comando, args, { entrada, silencioso = false } = {}) {
  const cmd = process.platform === "win32" && ["npx", "npm", "vercel"].includes(comando) ? `${comando}.cmd` : comando;
  return spawnSync(cmd, args, {
    cwd: RAIZ, input: entrada, encoding: "utf8", shell: process.platform === "win32",
    stdio: entrada !== undefined ? ["pipe", silencioso ? "pipe" : "inherit", "inherit"] : silencioso ? "pipe" : "inherit",
  });
}

/** Ancho y alto de una imagen JPG, PNG, WEBP, GIF o SVG sin instalar nada. Devuelve null si no se puede leer. */
export function medidas(archivo) {
  try {
    const b = fs.readFileSync(archivo);
    if (b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG") return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    if (b.toString("ascii", 0, 3) === "GIF") return { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const marca = b[i + 1], largo = b.readUInt16BE(i + 2);
        if (marca >= 0xc0 && marca <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marca)) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
        i += 2 + largo;
      }
      return null;
    }
    if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
      const t = b.toString("ascii", 12, 16);
      if (t === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
      if (t === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
      if (t === "VP8L") { const n = b.readUInt32LE(21); return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 }; }
    }
    const txt = b.toString("utf8", 0, 2000);
    if (/<svg/i.test(txt)) {
      const w = txt.match(/\bwidth="([\d.]+)/), h = txt.match(/\bheight="([\d.]+)/), vb = txt.match(/viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/);
      if (w && h) return { w: Math.round(+w[1]), h: Math.round(+h[1]) };
      if (vb) return { w: Math.round(+vb[1]), h: Math.round(+vb[2]) };
    }
  } catch {}
  return null;
}

export function paso(n, texto) { console.log(`\n=== ${n}. ${texto} ===`); }

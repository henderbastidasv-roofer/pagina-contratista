// Prepara las fotos reales de la compañía para la página: las endereza, les quita los datos ocultos (GPS del teléfono),
// las achica a un tamaño web (máx. 1920 px) y las guarda en compania/fotos/ como .jpg.
// Uso: npm run fotos -- "C:\ruta\a\la\carpeta\con\fotos"
// Después Claude Code las mira, les pone un nombre que describe la foto (ej. reemplazo-techo-shingles-cypress-tx.jpg)
// y las asigna en compania/sitio.json. NUNCA usar fotos de stock como si fueran trabajos de la compañía.
import fs from "node:fs";
import path from "node:path";
import { RAIZ } from "./_util.mjs";

const origen = process.argv[2];
if (!origen || !fs.existsSync(origen)) {
  console.error('\nDime la carpeta de las fotos: npm run fotos -- "C:\\ruta\\a\\las\\fotos"\n');
  process.exit(1);
}
let sharp;
try { sharp = (await import("sharp")).default; } catch {
  console.error("\nFalta sharp. Corre npm install y vuelve a intentar.\n");
  process.exit(1);
}
const DESTINO = path.join(RAIZ, "compania", "fotos");
fs.mkdirSync(DESTINO, { recursive: true });
const limpio = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "foto";
const fotos = fs.readdirSync(origen).filter((f) => /\.(jpe?g|png|webp|heic|heif|tiff?)$/i.test(f));
if (!fotos.length) { console.error("\nNo encontré fotos (.jpg, .png, .webp, .heic) en esa carpeta.\n"); process.exit(1); }
console.log(`\nPreparando ${fotos.length} fotos…`);
for (const f of fotos) {
  const nombre = limpio(path.parse(f).name) + ".jpg";
  try {
    const info = await sharp(path.join(origen, f)).rotate().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(DESTINO, nombre));
    console.log(`  ✓ ${nombre}  (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
  } catch (e) {
    console.log(`  ✗ ${f}: no se pudo convertir (${e.message.split("\n")[0]})`);
  }
}
console.log("\nListo. Ahora Claude Code las revisa, les cambia el nombre y las pone en compania/sitio.json.\n");

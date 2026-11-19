// Revisa que el sitio esté listo: datos, claves, fotos reales, fuentes prohibidas, enlaces rotos y que no haya claves en el código.
// Uso: npm run revisar   (arma el sitio primero)
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { RAIZ, leerEnvs } from "./_util.mjs";

const r = spawnSync(process.execPath, [path.join(RAIZ, "plantilla", "build.mjs")], { encoding: "utf8" });
if (r.status !== 0) { console.error(r.stdout + r.stderr); process.exit(1); }
const D = JSON.parse(fs.readFileSync(path.join(RAIZ, "compania", "sitio.json"), "utf8"));
const env = leerEnvs();
const DIST = path.join(RAIZ, "dist");
let errores = 0, avisos = 0;
const ok = (t) => console.log("✅ " + t);
const mal = (t) => { errores++; console.log("❌ " + t); };
const ojo = (t) => { avisos++; console.log("⚠️  " + t); };

console.log("\n— Datos de la compañía —");
const C = D.compania;
if (/techos ejemplo/i.test(C.nombre)) ojo("Todavía tiene los datos del ejemplo (Techos Ejemplo LLC). Hay que hacer la entrevista de INSTALAR.md.");
else ok(`Compañía: ${C.legal || C.nombre}`);
if (!/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(C.telefono || "")) mal(`El teléfono "${C.telefono}" no se ve como un número de EE. UU.`); else ok(`Teléfono: ${C.telefono}`);
if (!/^https:\/\/[^/]+\.[a-z]{2,}$/i.test(C.dominio || "")) mal("Falta compania.dominio (https://tudominio.com, sin barra al final)."); else ok(`Dominio: ${C.dominio}`);
if (!D.zona?.ciudades?.length) mal("Faltan las ciudades donde trabajan (zona.ciudades)."); else ok(`Ciudades: ${D.zona.ciudades.join(", ")}`);
if (!D.leads?.correo && !env.WEB3FORMS_KEY) mal("Los formularios no llegan a nadie: falta leads.correo en sitio.json (o WEB3FORMS_KEY con npm run claves).");
else ok(`Los leads llegan por ${env.WEB3FORMS_KEY ? "Web3Forms" : "FormSubmit a " + D.leads.correo}`);

console.log("\n— Estimador y financiamiento —");
if (D.estimador?.activo) {
  for (const m of D.estimador.materiales) {
    const [lo, hi] = m.precio_square || [];
    if (!(lo > 50 && hi >= lo && hi < 10000)) mal(`Precio raro en ${m.nombre || m.id}: ${lo}–${hi} por square.`);
  }
  ok(`Materiales: ${D.estimador.materiales.map((m) => `${m.nombre || m.id} $${m.precio_square[0]}–$${m.precio_square[1]}/sq ($${(m.precio_square[0] / 100).toFixed(2)}–$${(m.precio_square[1] / 100).toFixed(2)}/pie²)`).join(" · ")}`);
  if (env.GOOGLE_MAPS_API_KEY) ok("Clave de Google guardada en .env: el estimador mide el techo por satélite.");
  else ojo("Sin clave de Google: el estimador funciona en modo manual (pregunta el tamaño de la casa). Ver docs/GOOGLE-MAPS.md.");
} else ok("Estimador apagado.");
const F = D.financiamiento;
if (F?.activo) {
  if (F.niveles_credito.some(([, apr]) => !(apr >= 0 && apr < 40))) mal("Hay un APR fuera de rango en financiamiento.niveles_credito.");
  if (!(F.monto_min < F.monto_inicial && F.monto_inicial <= F.monto_max)) mal("Revisa monto_min / monto_inicial / monto_max del financiamiento.");
  ok(`Financiamiento: ${F.niveles_credito.map(([t, a]) => `${t} ${a}%`).join(", ")} · plazos ${F.plazos_meses.join("/")} meses`);
  if (!F.link_precalificacion) ojo("Financiamiento sin link de precalificación del socio (el botón no sale). Si tienen socio (Hearth, GreenSky, Service Finance…), pon el link.");
} else ok("Financiamiento apagado.");

console.log("\n— Fotos y reseñas —");
const avisosBuild = JSON.parse(fs.readFileSync(path.join(DIST, ".avisos.json"), "utf8"));
const faltan = avisosBuild.filter((a) => a.startsWith("Falta la foto"));
if (faltan.length) { ojo(`Faltan ${faltan.length} fotos reales (salen como "Foto de muestra"):`); faltan.forEach((a) => console.log("     · " + a.replace("Falta la foto real: compania/fotos/", ""))); }
else ok("Todas las fotos son de la compañía.");
if (!(D.resenas?.lista || []).length) ojo("No hay reseñas: la sección no sale. Copia las reseñas reales de Google (nunca inventarlas).");

console.log("\n— Fuentes, claves y enlaces —");
const PROHIBIDAS = /font-family[^;{}]*\b(Inter|Roboto|Arial)\b|family=(Inter|Roboto|Arial)\b|"(Inter|Roboto|Arial)"/;
const archivos = [];
const recorrer = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { if (!["node_modules", ".git", ".vercel"].includes(f.name)) recorrer(p); } else archivos.push(p);
  }
};
recorrer(RAIZ);
const texto = archivos.filter((f) => /\.(html|css|js|mjs|json|md|txt|xml)$/.test(f));
const leer = (f) => fs.readFileSync(f, "utf8");
const conFuente = texto.filter((f) => !f.endsWith("revisar.mjs") && !f.endsWith("build.mjs") && PROHIBIDAS.test(leer(f)));
if (conFuente.length) mal("Fuente prohibida (Inter, Roboto o Arial) en: " + conFuente.map((f) => path.relative(RAIZ, f)).join(", ")); else ok("Sin Inter, Roboto ni Arial.");
const claves = [env.GOOGLE_MAPS_API_KEY, env.WEB3FORMS_KEY].filter(Boolean);
const fuga = texto.filter((f) => !f.startsWith(DIST) && !/[\\/]\.env/.test(f) && (/AIza[0-9A-Za-z_-]{30,}/.test(leer(f)) || claves.some((k) => leer(f).includes(k))));
if (fuga.length) mal("¡Hay una clave escrita en un archivo que se sube a GitHub! Quítala y créala de nuevo: " + fuga.map((f) => path.relative(RAIZ, f)).join(", "));
else ok("Ninguna clave escrita en el código (solo en .env).");
const htmls = archivos.filter((f) => f.startsWith(DIST) && f.endsWith(".html"));
const rotos = new Set();
for (const h of htmls) for (const [, href] of leer(h).matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
  const destino = path.join(DIST, decodeURIComponent(href));
  if (!fs.existsSync(destino) && !fs.existsSync(path.join(destino, "index.html"))) rotos.add(`${href} (en ${path.relative(DIST, h)})`);
}
if (rotos.size) mal("Enlaces rotos: " + [...rotos].join(", ")); else ok(`${htmls.length} páginas sin enlaces rotos.`);
const restos = htmls.filter((h) => /\{COMPANIA\}|\{\{[A-Z_]+\}\}|undefined|NaN/.test(leer(h)));
if (restos.length) mal("Quedó texto sin reemplazar en: " + restos.map((f) => path.relative(DIST, f)).join(", "));

console.log(`\n${errores ? `❌ ${errores} cosas por arreglar` : "✅ Listo para publicar"}${avisos ? ` · ⚠️ ${avisos} avisos` : ""}\n`);
process.exit(errores ? 1 : 0);

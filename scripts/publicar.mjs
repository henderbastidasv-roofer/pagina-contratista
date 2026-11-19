// Publica la página en Vercel: conecta la carpeta con un proyecto, sube las claves y publica.
// Uso: npm run publicar -- nombre-del-proyecto     (ej. techos-ejemplo-web)
// Antes: npm run revisar (sin ❌) y npx vercel login.
// Lo normal en ConstruIA es conectar el repositorio de GitHub en Vercel para que cada cambio se publique solo (lección 5);
// este script sirve para la primera publicación y para subir las claves.
import fs from "node:fs";
import path from "node:path";
import { RAIZ, correr, leerEnvs, paso } from "./_util.mjs";

const proyecto = process.argv[2];
if (!proyecto) { console.error("\nDime el nombre del proyecto en Vercel: npm run publicar -- mi-compania-web\n"); process.exit(1); }
const vars = leerEnvs();

paso(1, "Revisar el sitio");
if (correr("npm", ["run", "revisar"]).status !== 0) { console.error("\nArregla lo que marcó npm run revisar y vuelve a intentar.\n"); process.exit(1); }

paso(2, "Conectar esta carpeta con un proyecto de Vercel");
if (correr("npx", ["vercel", "link", "--yes", "--project", proyecto]).status !== 0) {
  console.error("\nNo se pudo conectar con Vercel. ¿Ya iniciaste sesión? Corre: npx vercel login\n");
  process.exit(1);
}
// `vercel link` agrega ".env*" al .gitignore y eso taparía .env.ejemplo: lo dejamos como estaba.
const gi = path.join(RAIZ, ".gitignore");
fs.writeFileSync(gi, fs.readFileSync(gi, "utf8").replace(/\r?\n\.vercel\r?\n\.env\*\r?\n?$/, "\n"));

paso(3, "Subir las claves a Vercel (producción y vistas previas)");
for (const nombre of ["GOOGLE_MAPS_API_KEY", "WEB3FORMS_KEY"].filter((n) => vars[n])) {
  for (const ent of ["production", "preview"]) {
    correr("npx", ["vercel", "env", "rm", nombre, ent, "--yes"], { silencioso: true });
    // El valor va por la entrada estándar: no queda en el historial de la Terminal.
    const r = correr("npx", ["vercel", "env", "add", nombre, ent, "--yes"], { entrada: vars[nombre], silencioso: true });
    if (r.status !== 0) { console.error(`\nNo se pudo guardar ${nombre} en Vercel:\n${r.stderr || r.stdout}\n`); process.exit(1); }
  }
  console.log(`  ${nombre} ✓`);
}

paso(4, "Publicar");
const d = correr("npx", ["vercel", "deploy", "--prod", "--yes"], { silencioso: true });
if (d.status !== 0) { console.error(`\nLa publicación falló:\n${d.stderr || d.stdout}\n`); process.exit(1); }
const url = (d.stdout.match(/https:\/\/[^\s]+\.vercel\.app/g) ?? []).pop();
console.log(`\nLa página está publicada: ${url}`);
console.log("Falta conectar tu dominio: Vercel → tu proyecto → Settings → Domains (lección 5).\n");

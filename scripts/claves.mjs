// Pide cada clave en la Terminal (sin mostrarla) y la guarda en .env.
// Las claves NUNCA se pegan en el chat de Claude ni se escriben en el código: solo aquí.
import { guardarEnv, leerEnvs, preguntar } from "./_util.mjs";

const CLAVES = [
  {
    nombre: "GOOGLE_MAPS_API_KEY",
    oculto: true,
    ayuda: "Clave de Google Maps Platform (empieza con AIza). La sacas en console.cloud.google.com → Google Maps Platform → Keys & Credentials.\n" +
      "Tiene que tener activadas: Maps JavaScript API, Places API (New) y Solar API, y estar restringida a tu dominio (lo explica docs/GOOGLE-MAPS.md).",
    valida: (v) => /^AIza[0-9A-Za-z_-]{30,}$/.test(v),
  },
  {
    nombre: "WEB3FORMS_KEY",
    oculto: true,
    ayuda: "Access key de Web3Forms (opcional). La sacas gratis en web3forms.com con el correo que recibe los clientes.\n" +
      "Sin esta clave, los formularios usan FormSubmit con el correo de leads (el primer envío te manda un correo para activarlo).",
    valida: (v) => /^[0-9a-f-]{36}$/i.test(v),
  },
];

const soloEstas = process.argv.slice(2);
const vars = leerEnvs();
console.log("\nVoy a pedirte cada clave. Lo que escribas se ve como ****.");
console.log("Si una ya está guardada o todavía no la tienes, presiona Enter para pasar a la siguiente.");
for (const c of soloEstas.length ? CLAVES.filter((x) => soloEstas.includes(x.nombre)) : CLAVES) {
  console.log(`\n${c.ayuda}`);
  for (;;) {
    const ya = vars[c.nombre] ? " (ya guardada, Enter para dejarla)" : "";
    const v = await preguntar(`${c.nombre}${ya}: `, { oculto: c.oculto });
    if (!v) break;
    if (c.valida(v)) { vars[c.nombre] = v; break; }
    console.log("  Eso no se ve bien. Revísalo y pégalo otra vez.");
  }
}
guardarEnv(vars);
console.log("\nListo: las claves quedaron en .env (ese archivo nunca se sube a GitHub). Corre npm run build para usarlas.\n");

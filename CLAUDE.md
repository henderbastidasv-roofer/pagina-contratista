# Página web para compañías de techos (pagina-contratista)

Plantilla de ConstruIA / Rufero Pro: sitio estático con **estimador de techos por satélite** y **calculadora de financiamiento**, publicado en Vercel.

- **Si estás instalando la página para una compañía, sigue `INSTALAR.md` paso a paso.** La persona no sabe programar: háblale simple, en su idioma, una cosa a la vez.
- **Para cambios del día a día** (precios, fotos, textos, servicios) usa el skill `/web-cambio`.
- **Nunca le pidas claves en el chat** ni escribas una clave en un archivo. Se guardan solo con `npm run claves` (quedan en `.env`, que no se sube a GitHub).
- **No inventes datos**: reseñas, certificaciones, años, licencias o garantías solo si la persona los confirma. **Fotos reales** de la compañía; nunca stock como si fuera trabajo propio.
- **Fuentes prohibidas: Inter, Roboto y Arial** (tampoco de reserva en el CSS). Solo las de `plantilla/fuentes.json`.
- **No publiques ni hagas `git push`** sin que la persona lo pida.
- Textos de la página en **inglés** (clientes en EE. UU.); la conversación en el idioma de la persona.

## Cómo está hecho
- `compania/sitio.json`: **todo** lo de la compañía (datos, ciudades, servicios, textos, precios, financiamiento, colores, fuente, fotos, reseñas, redirecciones). Es lo único que cambia de una compañía a otra.
- `compania/fotos/`, `compania/logo/`: fotos y logo reales. Las fotos que faltan salen como cuadro "Foto de muestra".
- `plantilla/build.mjs`: arma `dist/` (HTML estático) y escribe `vercel.json`. Sin dependencias. Páginas: `/`, `/residential-roofing/`, `/commercial-roofing/`, `/roof-repair/`, `/after-storm-damage/`, `/finance-insurance/`, `/roof-estimate/`, `/about-us/`, `/contact-us/`, `/thank-you/`, `/privacy-policy/`, `/free-roof-inspection/` (landing para anuncios: sin menú, noindex, fuera del sitemap), `404.html`, `sitemap.xml`, `robots.txt`, `llms.txt`. Schema `RoofingContractor` + FAQ + breadcrumbs en cada página.
- `plantilla/estilos.css`, `plantilla/site.js`: diseño (misma estructura que proudroofingtx.com). Colores y fuente se inyectan por página en `:root` (`--brand`, `--brand-oscuro`, `--ink`, `--fuente-titulos`, `--fuente-texto`).
- `componentes/estimador/`: el estimador. Lee `window.ESTIMADOR` (lo escribe build.mjs). Google: Maps JavaScript API + Places API (New) con `PlaceAutocompleteElement` + Solar API `buildingInsights:findClosest`. Sin clave o si Google falla → modo manual. Precios en `sitio.json` **por square** (el build los pasa a pie²). Manda el lead por Web3Forms (`WEB3FORMS_KEY`) o FormSubmit (`leads.correo`) y dispara `generate_lead` (GA4) y `Lead` (Meta Pixel).
- `componentes/financiamiento/`: la calculadora (amortización normal). Lee `window.FINANCIAMIENTO`. Aviso legal obligatorio.
- `compania/videos/`: videos reales (portada y proyectos), sin sonido y en bucle; se pausan solos si la persona pide menos movimiento o si no se ven.
- `scripts/`: `claves`, `vista-previa` (localhost:4321), `revisar`, `fotos` (sharp: endereza, quita GPS, achica), `videos` (ffmpeg: 12 s, sin sonido, HDR → normal, portada), `publicar` (Vercel).
- Claves en `.env`: `GOOGLE_MAPS_API_KEY`, `WEB3FORMS_KEY` (opcional). En Vercel, las mismas como variables de entorno.

## Después de cualquier cambio
`npm run revisar` (arma y revisa: datos, precios, fotos, fuentes, claves en el código, enlaces rotos). Enséñale el resultado en la vista previa.

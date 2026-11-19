# Classroom "Página Web y mantenimiento" (ConstruIA)

> El guion y el mapa del video (15 bloques, con Hender en pantalla y un mapa de Excalidraw) están en la carpeta de ConstruIA de Rufero Pro, no en este repo.

Lo que se usa de este repo en cada lección. La compañía de ejemplo del video es **Techos Ejemplo LLC** (Houston, TX).

| # | Lección | Qué se usa del repo |
|---|---|---|
| 00 | Presentación: lo que vas a tener al final | La página de ejemplo (`npm run vista-previa`) |
| 01 | Por qué tu página no te trae clientes | Un prompt de diagnóstico (Claude Code revisa la página actual con PageSpeed) |
| 02 | Que todo sea tuyo: dominio y accesos | `compania.dominio`; las cuentas a nombre de la compañía |
| 03 | Planear antes de construir | La entrevista de `INSTALAR.md` (fase 1, bloques A–G) como lista de lo que hay que tener |
| 04 | Instalar la plantilla y la entrevista | `PROMPT-PARA-PEGAR.md` → `INSTALAR.md` → `compania/sitio.json` |
| 05 | Tus fotos reales, tu logo y tus colores | `npm run fotos`, `marca` (colores, `plantilla/fuentes.json`, logo) |
| 06 | El estimador de techos | `componentes/estimador/` + `docs/GOOGLE-MAPS.md` + `npm run claves -- GOOGLE_MAPS_API_KEY` |
| 07 | La calculadora de financiamiento | `componentes/financiamiento/` + `financiamiento` en `sitio.json` |
| 08 | Que los leads te lleguen | `leads.correo` / `WEB3FORMS_KEY`, `medicion.meta_pixel`, `medicion.ga4`, la landing `/free-roof-inspection/` |
| 09 | Publicar con tu dominio | GitHub (`gh`), Vercel (`vercel.json`, `npm run publicar`), variables de entorno y dominio |
| 10 | Google: tu perfil, Search Console y SEO local | `medicion.search_console`, `sitemap.xml`, el schema `RoofingContractor`, `llms.txt` |
| 11 | Cambios con /web-cambio y la revisión del mes | El skill `/web-cambio`, `npm run revisar` y el prompt de la revisión del mes |
| 12 | Migrar desde Wix, GoDaddy o WordPress | `redirecciones` en `sitio.json` → redirecciones 301 en `vercel.json` |
| 13 | Cuando algo se rompe | Un prompt de revisión en orden, la tabla de errores de `docs/GOOGLE-MAPS.md` y la de `INSTALAR.md` |
| 14 | Tu tarea | Publicar la página con su dominio y compartir el link en la comunidad |

Cada lección lleva el video, la guía escrita completa en la lección de Skool, los prompts completos y "Tu tarea".

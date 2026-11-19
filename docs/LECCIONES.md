# Classroom "Página Web y mantenimiento" (ConstruIA)

> Guion y mapa del video (15 bloques, Hender en pantalla con un mapa de Excalidraw): están en la carpeta de ConstruIA de Rufero Pro, no en este repo.

Lo que sale de este repo para cada lección. Compañía de ejemplo de los videos: **Techos Ejemplo LLC** (Houston, TX).

| # | Lección | Qué se usa de este repo | Estado |
|---|---|---|---|
| 0 | Diagnóstico de tu página actual | — (checklist: velocidad, celular, formulario, Google, quién es dueño de qué) | Por escribir |
| 1 | Que todo sea tuyo (dominio y accesos) | `compania.dominio`; guía de comprar dominio y cuentas a nombre de la compañía | Por escribir |
| 2 | Planear antes de construir | La entrevista de `INSTALAR.md` (fase 1, bloques A–G) como hoja de trabajo | Listo en el repo |
| 3 | Construir con la plantilla | `PROMPT-PARA-PEGAR.md` → `INSTALAR.md` → `compania/sitio.json`, `npm run fotos`, `npm run vista-previa` | Listo en el repo |
| 3b | El estimador de techos | `componentes/estimador/` + `docs/GOOGLE-MAPS.md`: precios por square, materiales, clave de Google restringida, modo manual | Listo en el repo |
| 3c | La calculadora de financiamiento | `componentes/financiamiento/`: niveles de crédito/APR, plazos, montos, link de precalificación, aviso legal | Listo en el repo |
| 4 | Que te traiga clientes (formularios, pixel, landing pages) | `leads.correo` / `WEB3FORMS_KEY`, `medicion.ga4`, `medicion.meta_pixel` (el estimador y el formulario disparan `generate_lead` y `Lead`) | Listo: formularios, pixel, GA4 y landing `/free-roof-inspection/` |
| 5 | Publicar en GitHub y Vercel con su dominio | `npm run publicar`, `vercel.json` (lo escribe el build), variables de entorno en Vercel, conectar dominio | Script listo, sin probar en una cuenta real |
| 6 | Google: GBP, Search Console y SEO local | `medicion.search_console`, `sitemap.xml`, schema `RoofingContractor`, `llms.txt`, títulos y descripciones por ciudad | Base lista; guía por escribir |
| 7 | Mantenimiento con IA | Skill `/web-cambio` (listo) · `/web-revision-mensual` (por hacer: `npm run revisar` + leads + Google) | `/web-cambio` listo |
| 8 | Migrar desde Wix, GoDaddy o WordPress sin perder Google | `redirecciones` en `sitio.json` → redirecciones 301 en `vercel.json` | Base lista; guía por escribir |
| 9 | Cuando algo se rompe | `/web-emergencia` (por hacer) · tabla de errores de `docs/GOOGLE-MAPS.md` e `INSTALAR.md` | Por hacer |
| 10 | Medir y mejorar | GA4 + Meta Pixel (eventos de lead), Search Console | Por escribir |

Cada lección lleva: video, guía escrita completa en la lección de Skool, prompts completos y "Tu tarea".

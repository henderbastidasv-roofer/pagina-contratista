---
name: web-cambio
description: Hace un cambio en la página web de la compañía de techos (pagina-contratista) de forma segura — precios del estimador, materiales, financiamiento, textos, servicios, fotos, reseñas, colores, fuente, ciudades, teléfono, redirecciones — y lo deja revisado en la vista previa antes de publicar. Úsalo cuando la persona escriba /web-cambio, o pida cambiar, agregar o quitar algo de su página ("sube el precio del shingle", "pon esta foto", "ya no hacemos comercial", "cambia el teléfono", "agrega Katy a las ciudades").
---

# /web-cambio: cambiar algo de la página

La persona no sabe programar. Háblale simple, en su idioma, y confirma antes de tocar algo que no pidió.

## 1. Entender el cambio
- Si no dijo qué quiere cambiar, pregúntale en una línea: "¿Qué quieres cambiar de tu página?"
- Repítele el cambio con números o palabras exactas antes de hacerlo. Ejemplos:
  - "Architectural Shingles pasa de $450–$575 a $480–$600 por square ($4.80–$6.00 por pie²). ¿Así?"
  - "Quito Commercial Roofing del menú, del estimador y del sitemap. ¿Así?"
- Si el cambio es grande (rediseño, página nueva, otro idioma), dile que eso es más que un cambio y propónle cómo hacerlo.

## 2. Dónde se cambia cada cosa
Casi todo está en `compania/sitio.json`. No toques `plantilla/` ni `componentes/` para cambios de una compañía.

| Quiere cambiar | Dónde |
|---|---|
| Teléfono, correo, horario, dirección, lema, redes | `compania` |
| Ciudades donde trabaja | `zona.ciudades` (y menciónalas en `hero.eyebrow` y `faq_inicio` si salen ahí) |
| Precios del estimador | `estimador.materiales[].precio_square` = **[bajo, alto] por square** (100 pie²). Si te los da por pie², × 100 |
| Agregar o quitar un material | `estimador.materiales` (los que hay están en `componentes/estimador/catalogo.json`) |
| Ya no hacen comercial / sí hacen | `servicios[].activo` del servicio comercial y `estimador.comercial` |
| Tasas, plazos o socio de financiamiento | `financiamiento` (`niveles_credito`, `plazos_meses`, `socio`, `link_precalificacion`). El aviso legal no se quita |
| Apagar el estimador o el financiamiento | `estimador.activo` / `financiamiento.activo` |
| Correo que recibe los leads | `leads.correo` (o `npm run claves -- WEB3FORMS_KEY` si usa Web3Forms) |
| Texto del menú Services | `servicios[].menu` (frase corta, máx. 40 caracteres) |
| Textos de una página | `servicios[]` (`h1`, `intro`, `ofrece`, `porque`, `faq`, `titulo_seo`, `descripcion_seo`), `hero`, `nosotros`, `finanzas_seguro`, `faq_inicio` |
| Fotos | Nuevas: `npm run fotos -- "<carpeta>"`, mírala, ponle nombre descriptivo en inglés y pon `archivo` + `alt` en el lugar que va. **Solo fotos reales de sus trabajos.** |
| Reseñas | `resenas.lista` — copiadas tal cual de Google. **Nunca inventar.** Actualiza `calificacion` y `total` |
| Colores | `marca.color`, `marca.color_oscuro`, `marca.tinta` |
| Fuente | `marca.fuente` (opciones en `plantilla/fuentes.json`). **Nunca Inter, Roboto ni Arial** |
| Logo | `compania/logo/` + `marca.logo` / `marca.logo_blanco` |
| Landing page para anuncios (`/free-roof-inspection/`) | `landing` (`titulo`, `texto`, `puntos`, `slug`; `activo: false` la apaga). No sale en Google ni en el sitemap |
| Una página vieja que cambió de dirección | `redirecciones` (`desde` → `hacia`, con barra al final) |
| Clave de Google | Solo la persona en la Terminal: `npm run claves -- GOOGLE_MAPS_API_KEY`. Nunca en el chat |

## 3. Hacer el cambio
1. Edita `compania/sitio.json` (JSON válido: comillas dobles, sin coma al final).
2. Si cambió un servicio, una ciudad o el teléfono, busca en `sitio.json` otros textos que lo mencionen (`descripcion_seo`, `faq`, `intro`) y actualízalos también.
3. Corre `npm run revisar`. Arregla los ❌. Si apareció un ⚠️ nuevo por tu cambio, explícalo.

## 4. Enseñárselo
1. Si la vista previa no está corriendo, córrela en segundo plano: `npm run vista-previa`.
2. Abre la página donde se ve el cambio (`http://localhost:4321/...`) y enséñasela. Si cambió un precio, haz un estimado de prueba en `/roof-estimate/` y dile el rango que sale.
3. Pregúntale si así está bien.

## 5. Publicar (solo si la persona lo pide)
- Si la carpeta está conectada a GitHub y Vercel: commit con un mensaje claro en español ("Sube precio de architectural shingles") y `git push`. Vercel publica solo en 1 o 2 minutos.
- Si no está conectada todavía: `npm run publicar -- <proyecto>`.
- Después de publicar, abre la página en vivo y confirma que se ve el cambio.
- **Nunca publiques sin que la persona diga que sí.**

# Cómo mide el techo el estimador (Google Maps Platform)

## Qué hace Google en el estimador
1. **El cliente escribe su dirección** y Google le sugiere direcciones reales mientras escribe → **Places API (New)** (el cuadro `PlaceAutocompleteElement`).
2. **Se ve su casa desde el satélite** → **Maps JavaScript API**.
3. **Google mide el techo** → **Solar API**. El estimador le pregunta a `buildingInsights:findClosest` por esa latitud y longitud y usa `solarPotential.wholeRoofStats.areaMeters2`: el área del techo en metros cuadrados, ya con la inclinación. Se pasa a pies² (× 10.7639) y a squares (÷ 100).
4. Con esa medida, el estimador multiplica por el precio por pie² de cada material de la compañía y por el multiplicador de la pendiente que escogió el cliente (de 1.0 plano a 1.3 empinado, porque un techo empinado cuesta más trabajo).

Si Google no tiene datos de ese techo (pasa en zonas rurales o casas nuevas), el estimador usa un techo promedio (`tamano_por_defecto_sqft`) y se lo dice al cliente. **Sin clave**, el estimador funciona en modo manual: pregunta el tamaño de la casa en lugar de medir.

> Ojo: el estimador viejo de Proud usa `google.maps.places.Autocomplete`. Desde el 1 de marzo de 2025 Google ya no deja activar esa versión ("Places API", la legacy) en proyectos nuevos. Este estimador usa la nueva (**Places API (New)**), que sí funciona en cuentas nuevas.

## Qué clave necesita el contratista
**Una sola clave de API de Google Maps Platform** (empieza con `AIza…`), con estas 3 APIs activadas:
- Maps JavaScript API
- Places API (New)
- Solar API

## Paso a paso (lo hace el contratista, Claude Code lo guía)
1. Entrar a **console.cloud.google.com** con la cuenta de Google de la compañía (la misma del Google Business Profile, para que todo quede a su nombre).
2. Crear un proyecto nuevo: nombre `pagina-web-<compania>`.
3. **Billing (facturación):** agregar una tarjeta. Google la pide aunque el uso normal de un contratista quede dentro de lo gratis de cada mes. Revisar los precios del momento en mapsplatform.google.com/pricing: cada estimado usa una sesión de autocompletado, los mapas y una consulta de Solar API.
4. **APIs & Services → Library:** buscar y activar las 3 APIs de arriba (una por una, botón *Enable*).
5. **Google Maps Platform → Keys & Credentials → Create credentials → API key.** Copiarla (no pegarla en ningún chat).
6. **Restringir la clave** (muy importante, porque esta clave se ve en el código de la página: así funciona Google Maps en cualquier sitio):
   - *Application restrictions* → **Websites** → agregar:
     - `https://tudominio.com/*`
     - `https://www.tudominio.com/*`
     - `https://*.vercel.app/*` (para las vistas previas de Vercel; quitarla cuando el dominio ya esté conectado si quiere más seguridad)
     - `http://localhost:4321/*` (para la vista previa en su computadora)
   - *API restrictions* → **Restrict key** → marcar solo Maps JavaScript API, Places API (New) y Solar API.
7. **Poner un límite diario** para que nadie le gaste de más: *APIs & Services → Solar API → Quotas* → bajar "requests per day" (por ejemplo a 300). Hacer lo mismo con Places API (New). También se puede crear una alerta de presupuesto en *Billing → Budgets & alerts* (por ejemplo, $20 al mes).
8. **Guardar la clave en la computadora:** en la Terminal de Claude Code, la persona misma corre:
   ```
   npm run claves -- GOOGLE_MAPS_API_KEY
   ```
   y pega la clave cuando la pida (se ve como ****). Queda en `.env`, que nunca se sube a GitHub.
9. `npm run build` y probar el estimador en `http://localhost:4321/roof-estimate/` con una dirección real.
10. **En Vercel:** `npm run publicar -- <proyecto>` sube la clave a Vercel sola. Si se conecta GitHub a Vercel a mano, hay que agregarla en *Vercel → Project → Settings → Environment Variables* con el nombre `GOOGLE_MAPS_API_KEY`.

## Reglas de las claves
- Las claves **solo** van en la Terminal (`npm run claves`) o en el `.env`. **Nunca** en el código, en `sitio.json`, en un correo ni en el chat.
- Si una clave se pegó en el chat o se subió a GitHub: borrarla en Google Cloud y crear otra.
- `npm run revisar` avisa si encuentra una clave escrita en un archivo del proyecto.

## Errores comunes (se ven en la consola del navegador, F12)
| Error | Qué pasa | Arreglo |
|---|---|---|
| `InvalidKeyMapError` | La clave está mal copiada o se borró | Crear otra y volver a correr `npm run claves` |
| `RefererNotAllowedMapError` | La clave no permite este dominio | Agregar el dominio en *Websites* (paso 6) |
| `ApiNotActivatedMapError` | Falta activar Maps JavaScript API | Paso 4 |
| No sale el cuadro de dirección | Falta Places API (New) | Paso 4 |
| "We couldn't measure this roof" en todas las direcciones | Falta Solar API o la clave no la permite | Pasos 4 y 6 |
| `BillingNotEnabledMapError` | No hay tarjeta en el proyecto | Paso 3 |

En todos esos casos el estimador **no se rompe**: si falla el mapa o la clave, pasa solo al modo manual (pregunta el tamaño de la casa); si falla solo la medición, usa un techo promedio y lo dice. Además, debajo del cuadro de dirección hay un link "Can't find your address? Enter it manually". El lead llega igual.

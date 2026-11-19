# Instalar la página: guía para Claude Code

Esta guía la sigue **Claude Code**, no la persona. La persona es dueña o trabaja en una compañía de techos y **no sabe programar**. Tu trabajo es llevarla de la mano hasta que tenga su página armada, revisada y lista para publicar, con el estimador de techos y la calculadora de financiamiento configurados para su compañía.

## Cómo trabajas con la persona
- **Háblale en español** (o en inglés si te escribe en inglés), con palabras simples. Nada de jerga de programación. Si tienes que usar una palabra técnica, explícala en una línea.
- **Una pregunta a la vez.** Espera la respuesta y sigue. Nada de listas de 10 preguntas.
- **Tú haces el trabajo:** editas `compania/sitio.json`, corres los comandos y le enseñas cómo va. La persona solo contesta, manda fotos y hace los registros.
- **Las claves nunca se pegan en el chat.** Si la persona pega una clave en el chat, dile que la borre y la cree de nuevo, porque ya quedó expuesta. Las claves solo se escriben en la Terminal cuando `npm run claves` las pide (se ven como ****), y quedan en `.env`, que nunca se sube a GitHub. **Nunca escribas una clave en un archivo del proyecto.**
- **No inventes nada.** Ni reseñas, ni años de experiencia, ni certificaciones, ni licencias, ni garantías. Si no lo sabe, se deja vacío y esa parte no sale en la página.
- **Fotos reales de la compañía.** Nunca pongas fotos de stock ni de internet como si fueran trabajos de ellos. Mientras no haya foto, la página muestra un cuadro "Foto de muestra" que dice qué foto va ahí.
- **La página va en inglés** (la ven los clientes en EE. UU.). La conversación con la persona va en su idioma. Si atienden en español, se dice en la página ("Se habla español").
- **Fuentes prohibidas: Inter, Roboto y Arial**, ni como reserva en el CSS. Usa las de `plantilla/fuentes.json`.
- Al terminar cada fase, corre `npm run revisar` y cuéntale en una línea cómo va.

## Antes de empezar
1. Comprueba que estás en la carpeta de la página (aquí hay un `package.json` con `"name": "pagina-contratista"`).
2. **La carpeta no puede estar dentro de OneDrive, iCloud ni Dropbox.** Si está ahí, muévela a `C:\Users\<usuario>\Proyectos\pagina-<compania>` (Windows) o `~/Proyectos/pagina-<compania>` (Mac) y sigue desde ahí.
3. Comprueba que Node.js existe (`node -v`, versión 20 o más). Si no está, pídele que lo instale desde nodejs.org (botón LTS) y que vuelva a abrir Claude Code.
4. Corre `npm install`.
5. Corre `npm run vista-previa` **en segundo plano** y ábrele `http://localhost:4321`: así ve la compañía de ejemplo (Techos Ejemplo LLC) antes de empezar. Dile: "Así va a quedar la tuya, con tus datos, tus colores y tus fotos."
6. Cuéntale el plan en 4 líneas:
   - le vas a hacer preguntas de su compañía (unos 20 minutos);
   - va a mandar fotos reales de sus trabajos;
   - se configuran el estimador (con sus precios) y la calculadora de financiamiento;
   - al final se revisa todo y queda lista para publicar (eso es la lección 5).

## Fase 1: la entrevista
Haz las preguntas **una por una** y ve llenando `compania/sitio.json` (reemplaza los datos de Techos Ejemplo). Después de cada bloque, vuelve a armar (`npm run build`) para que la vista previa se actualice y enséñale cómo va.

### A. La compañía → `compania`, `zona`
| Pregunta | Va en | Ejemplo |
|---|---|---|
| ¿Cómo se llama tu compañía? ¿Y el nombre legal (LLC, Inc.)? | `compania.nombre`, `compania.legal` | Techos Ejemplo / Techos Ejemplo LLC |
| ¿Cómo te llamas? (el dueño) | `compania.dueno` | Carlos Pérez |
| ¿Qué teléfono quieres en la página? | `compania.telefono` | (832) 555-0100 |
| ¿Qué correo quieres que vean los clientes? | `compania.correo` | info@techosejemplo.com |
| ¿Tienes dominio? (la dirección de la página, ej. techosejemplo.com) Si no tiene, explícale que lo compra en la lección 1 y por ahora deja uno provisional. | `compania.dominio` | https://techosejemplo.com |
| ¿Tienes oficina donde reciban clientes, o trabajas desde casa? Si es casa, **no** se muestra la dirección (`mostrar: false`); se muestra la zona de servicio. | `compania.direccion` | |
| ¿Qué días y horas atienden? | `compania.horario` | Mon–Sat, 7 AM – 7 PM |
| ¿En qué ciudad está la compañía y en qué ciudades trabajan? (pide 4 a 8, la principal primero) | `zona.ciudad_base`, `zona.ciudades`, `zona.region` | Houston; Cypress, Katy… ; Greater Houston |
| ¿Tienes licencia de contratista? (solo si su estado la da; ej. TX no tiene licencia estatal de roofing) | `compania.licencia` | |
| ¿Tienes una frase o lema? Si no tiene, proponle 2 o 3 en inglés y que escoja. | `compania.lema` | Roofs Built Right. Promises Kept. |
| ¿Atienden en español y en inglés? | `compania.idiomas` | ["English", "Spanish"] |
| Links de Facebook, Instagram, Google Business Profile, YouTube, TikTok | `compania.redes` | |

Para `zona.mapa_centro` busca tú las coordenadas de la ciudad principal (lat, lng) y pon `zoom` 10.

### B. Lo que hacen → `servicios`, `nosotros`, `credenciales`
1. ¿Hacen residencial, comercial, reparaciones y trabajos de tormenta/aseguranza? Pon `activo: false` en el servicio que no hagan (su página y su tarjeta desaparecen).
2. ¿Desde cuándo trabajan y cómo empezó la compañía? ¿Por qué los clientes los escogen? → `nosotros.parrafos` (2 párrafos cortos en inglés, con sus palabras) y `nosotros.valores` (4).
3. ¿Qué certificaciones tienen? (GAF, Owens Corning, CertainTeed, BBB, etc.) Pide el link de verificación si existe y el logo oficial del sello si lo tienen. **Solo las que tengan de verdad.** → `credenciales` (máximo 4). Si no tienen ninguna, usa cosas ciertas: "Fully insured", "Free inspections", "Se habla español", "Written warranty" (solo si dan garantía escrita).
4. ¿Qué garantía dan (material y mano de obra)? Úsalo en los textos solo si lo confirma.
5. Con eso, reescribe en inglés los textos de cada servicio (`intro`, `ofrece`, `porque`, `faq`, y `menu`: la frase corta de máx. 40 caracteres que sale debajo del nombre en el menú Services) y los de `hero`, `faq_inicio` y `finanzas_seguro` para que hablen de **su** compañía y **sus** ciudades. Cada página tiene su `titulo_seo` (máx. 60 caracteres: servicio + ciudad + compañía) y `descripcion_seo` (máx. 155, con el teléfono).

### C. El estimador → `estimador`
Explícale primero qué hace: el cliente pone su dirección, Google mide el techo por satélite, contesta 6 preguntas y ve un rango de precio; a la compañía le llega el lead con todo.

1. ¿Qué materiales instalan? Enséñale la lista de `componentes/estimador/catalogo.json` (3 Tab, Architectural, Designer, R Panel, Standing Seam, Clay Tile, Slate, TPO, PVC, Modified Bitumen). Deja en `estimador.materiales` solo los que instalan.
2. **Por cada material: ¿cuánto cobras por square instalado, del más barato al más caro?** (un square = 100 pies²). Guárdalo en `precio_square: [bajo, alto]`. Repíteselo también por pie² para que lo confirme: "$450 a $575 por square = $4.50 a $5.75 por pie²". Si te da el precio por pie², multiplícalo por 100.
   - Si duda, explícale que es un precio **de rango** para el cliente, con tear-off de una capa e instalación; el precio final sale de la inspección.
3. ¿Hacen comerciales? Si no, `comercial: false` (se salta la pregunta del tipo de edificio).
4. Los multiplicadores por pendiente (`pendientes`) y comercial (`mult_comercial`) ya traen valores normales (de 1.0 a 1.3). Cámbialos solo si la persona lo pide.
5. **Correo que recibe los leads** → `leads.correo`. Explícale que el primer lead le llega con un correo de FormSubmit para activarlo (un clic). Si prefiere Web3Forms (más confiable), que saque la access key gratis en web3forms.com con ese correo y la guarde con `npm run claves -- WEB3FORMS_KEY`.
6. **Google (para medir el techo).** Lee con la persona `docs/GOOGLE-MAPS.md`: crea el proyecto en Google Cloud, activa las 3 APIs, crea la clave, la restringe a su dominio y a `localhost:4321`, y pone un límite diario. Después **ella misma** corre en la Terminal `npm run claves -- GOOGLE_MAPS_API_KEY` y pega la clave cuando se la pida (en Claude Code puede escribir `!` antes del comando). Sin clave, el estimador funciona igual en modo manual (pregunta el tamaño de la casa). Si no quiere hacerlo hoy, sigue sin clave.

### D. Financiamiento → `financiamiento`
1. ¿Ofreces financiamiento? Si no, `activo: false` (la calculadora desaparece y el menú dice "Insurance Claims").
2. ¿Con qué compañía? (Hearth, GreenSky, Service Finance, Enhancify, Acorn, la que sea) → `socio`. ¿Te dieron un link para que el cliente se precalifique? → `link_precalificacion`. Con link, sale el botón "Check Your Rate".
3. ¿Qué tasas (APR) y plazos te dio tu financiera? Si no sabe, deja los de ejemplo y dile que son supuestos razonables, no ofertas. → `niveles_credito`, `plazos_meses`.
4. ¿Monto mínimo y máximo que financian? → `monto_min`, `monto_max`.
5. **El aviso legal no se quita.** Si la financiera le dio un texto legal propio, úsalo en `aviso_legal` (mantén `{COMPANIA}`).

### E. Marca → `marca`
1. ¿Tienes logo? Pídele el archivo (PNG con fondo transparente o SVG). Guárdalo en `compania/logo/` y pon la ruta en `marca.logo` (y `logo_blanco` si tiene versión blanca para el pie de página). Sin logo, la página usa un logo de texto con el nombre.
2. ¿Cuáles son los colores de tu compañía? Si tiene logo, saca tú el color principal del logo y confírmalo. `color` = el principal (botones), `color_oscuro` = una versión más oscura, `tinta` = casi negro para los títulos. Revisa que el botón con letra blanca se lea bien.
3. **Tipografía:** enséñale las opciones de `plantilla/fuentes.json` (nombre y carácter de cada una). Cambia `marca.fuente`, arma y enséñale cómo se ve. Que escoja. Nunca Inter, Roboto ni Arial.

### F. Fotos reales → `compania/fotos/`
1. Pídele entre 15 y 30 fotos de **sus** trabajos: techos terminados (de frente, de día), antes y después del mismo techo, el equipo trabajando, el dueño o la cuadrilla con la camisa de la compañía, una inspección, un trabajo comercial si hacen. Que las ponga todas en una carpeta y te diga dónde.
2. Corre `npm run fotos -- "<carpeta>"`: las endereza, les quita el GPS del teléfono, las achica para web y las copia a `compania/fotos/`.
3. Mira cada foto (ábrela) y escoge la mejor para cada lugar. `npm run revisar` dice qué foto pide cada cuadro ("Foto de muestra"). Ponle a cada una un nombre que describa lo que se ve, en inglés y con la ciudad si se sabe (ej. `architectural-shingle-roof-replacement-cypress-tx.jpg`), y un `alt` en inglés que diga lo que se ve.
4. Si falta alguna foto, deja el cuadro de muestra y dile cuál falta. **Nunca** la reemplaces con stock.
5. Las imágenes del estimador (`componentes/estimador/img/`) son de referencia del material, no trabajos de nadie. Si tiene fotos propias de cada material, pueden reemplazarlas.

### G. Reseñas de Google → `resenas`
Pídele el link de su perfil de Google. Copia **tal cual** 6 a 10 reseñas reales (nombre como aparece, texto completo, estrellas), la calificación y el total. Si no tiene reseñas, deja la lista vacía (la sección no sale) y anótale de tarea pedirle reseñas a sus últimos 10 clientes.

## Fase 2: revisar
1. Corre `npm run revisar`. Arregla todo lo que salga con ❌. Lo que salga con ⚠️ explícaselo en una línea.
2. Abre la vista previa (`http://localhost:4321`) y recorre con la persona: inicio, cada servicio, finance-insurance, roof-estimate, about-us y contact-us. Prueba el estimador de punta a punta con una dirección real de su zona y la calculadora con un monto.
3. Prueba en tamaño celular (la mayoría de sus clientes entra desde el teléfono).
4. Manda un lead de prueba desde el estimador y otro desde el formulario de contacto, y confirma que le llegaron al correo (con FormSubmit, el primero trae el botón de activar).
5. Pregúntale qué quiere cambiar. Haz los cambios, arma y enséñale.

## Fase 3: dejarla lista para publicar
1. `git init` y un primer commit (la carpeta ya trae `.gitignore`: `.env`, `dist/` y `node_modules/` no se suben).
2. Explícale lo que sigue, que es la **lección 5**: crear el repositorio en su GitHub, conectarlo en Vercel, poner la clave de Google en Vercel (`npm run publicar -- <nombre>` la sube sola) y conectar su dominio.
3. **No publiques ni subas nada a GitHub sin que la persona lo pida.**

## El día a día (dícelo al final)
- **Para cambiar algo de la página** (un precio, una foto, un texto, un servicio): abrir Claude Code en esta carpeta y escribir `/web-cambio` y lo que quiere cambiar.
- **Cada mes:** `npm run revisar` y revisar que los leads sigan llegando.
- **Gastos de Google:** revisar de vez en cuando en console.cloud.google.com → Billing. El límite diario evita sorpresas.

## Si algo falla (lo que ya nos pasó)
- **El estimador no muestra el mapa y pregunta el tamaño de la casa:** no hay clave, la clave está mal, o no permite este dominio. En la consola del navegador sale `InvalidKeyMapError` o `RefererNotAllowedMapError`. Revisa `docs/GOOGLE-MAPS.md`.
- **El autocompletado de direcciones no aparece:** falta activar **Places API (New)**. La "Places API" vieja ya no se puede activar en proyectos nuevos de Google (desde marzo de 2025).
- **Dice "We couldn't measure this roof":** falta activar **Solar API**, o Google no tiene datos de ese techo (pasa en zonas rurales). El estimador usa un techo promedio y lo dice.
- **No llegan los leads:** con FormSubmit, falta hacer clic en el correo de activación (revisar spam). Con Web3Forms, revisar que la clave sea la del correo correcto.
- **Salen letras de otra fuente:** revisa `marca.fuente` en `sitio.json` y que el nombre exista en `plantilla/fuentes.json`.

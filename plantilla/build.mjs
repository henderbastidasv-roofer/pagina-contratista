// pagina-contratista — genera el sitio estático en dist/ a partir de compania/sitio.json.
// Uso: npm run build   (lo corre también Vercel en cada publicación)
// Estructura de páginas igual a proudroofingtx.com.
// Las claves (Google, Web3Forms) se leen de .env / .env.local o de las variables de Vercel. Nunca se escriben en el código.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { leerEnvs, medidas } from "../scripts/_util.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(RAIZ, "dist");
const P = (...a) => path.join(RAIZ, ...a);
const leerJSON = (f) => JSON.parse(fs.readFileSync(P(f), "utf8"));

const D = leerJSON("compania/sitio.json");
const CAT = leerJSON("componentes/estimador/catalogo.json");
const FUENTES = leerJSON("plantilla/fuentes.json");
const ENV = { ...leerEnvs(), ...process.env };
const GOOGLE_KEY = (ENV.GOOGLE_MAPS_API_KEY || "").trim();
const WEB3 = (ENV.WEB3FORMS_KEY || "").trim();

const C = D.compania, Z = D.zona, M = D.marca;
const DOM = (C.dominio || "https://example.com").replace(/\/+$/, "");
const HOY = new Date().toISOString().slice(0, 10);
const VER = Date.now().toString(36);
const avisos = [];

// ---------------------------------------------------------------- utilidades
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tok = (s) => String(s ?? "").replaceAll("{COMPANIA}", C.nombre).replaceAll("{LEGAL}", C.legal || C.nombre).replaceAll("{CIUDAD}", Z.ciudad_base).replaceAll("{ESTADO}", Z.estado);
const url = (slug) => `${DOM}/${slug ? slug + "/" : ""}`;
const tel = "+1" + C.telefono.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
const dinero = (n) => "$" + Number(n).toLocaleString("en-US");
const ciudadesTxt = (lista) => (lista.length > 1 ? lista.slice(0, -1).join(", ") + " and " + lista.at(-1) : lista[0] || "");
const svcActivos = D.servicios.filter((s) => s.activo);
const FIN = D.financiamiento?.activo ? D.financiamiento : null;
const EST = D.estimador?.activo ? D.estimador : null;
const RES = (D.resenas?.lista || []).filter((r) => r.texto && r.nombre);

function copiar(desde, hacia) {
  fs.mkdirSync(path.dirname(hacia), { recursive: true });
  fs.copyFileSync(desde, hacia);
}
function escribir(rel, contenido) {
  const f = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, contenido);
}

// ---------------------------------------------------------------- iconos (trazos estilo lucide)
const ICONOS = {
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  "arrow-right": '<path d="M5 12h14M12 5l7 7-7 7"/>',
  "arrow-left": '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  youtube: '<path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
  tiktok: '<path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5"/>',
  roof: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
  storm: '<path d="M6 16.3A5 5 0 0 1 8 7a6 6 0 0 1 11.6 1.5A4.5 4.5 0 0 1 18 17"/><path d="m13 12-3 5h4l-3 5"/>'
};
const ico = (n, cls = "") => `<svg${cls ? ` class="${cls}"` : ""} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[n] || ""}</svg>`;
const G_LOGO = '<svg class="g-logo" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
const STARS = "★★★★★";

// ---------------------------------------------------------------- fotos (siempre de la carpeta del sitio)
const fotosUsadas = new Set();
function foto(f, cls = "", lazy = true) {
  if (!f) return "";
  const src = P("compania/fotos", f.archivo || "");
  if (f.archivo && fs.existsSync(src)) {
    fotosUsadas.add(f.archivo);
    const m = medidas(src);
    const wh = m ? ` width="${m.w}" height="${m.h}"` : "";
    const l = lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"';
    return `<img${cls ? ` class="${cls}"` : ""} src="/img/${esc(f.archivo)}" alt="${esc(f.alt)}"${wh}${l}>`;
  }
  avisos.push(`Falta la foto real: compania/fotos/${f.archivo} — ${f.pide || f.alt}`);
  return `<span class="ph-muestra${cls ? " " + cls : ""}" role="img" aria-label="${esc(f.alt)}">${ico("camera")}<b>Foto de muestra</b><small>${esc(f.pide || f.alt)}</small></span>`;
}
const archivoMarca = (rel) => rel && fs.existsSync(P("compania", rel)) ? rel : "";
function logoHTML(blanco = false) {
  const rel = archivoMarca(blanco ? M.logo_blanco || M.logo : M.logo);
  if (rel) {
    const m = medidas(P("compania", rel));
    return `<img src="/${esc(rel)}" alt="${esc(C.nombre)} logo"${m ? ` width="${m.w}" height="${m.h}"` : ""}>`;
  }
  const sub = Z.region || `${Z.ciudad_base}, ${Z.estado}`;
  return `<span class="logo-txt">${ico("roof")}<span><b>${esc(C.nombre)}</b><small>Roofing · ${esc(sub)}</small></span></span>`;
}

// ---------------------------------------------------------------- colores y fuente
const fuente = FUENTES[M.fuente] || FUENTES.archivo;
for (const prohibida of ["inter", "roboto", "arial"]) {
  if (JSON.stringify(fuente).toLowerCase().includes(prohibida)) throw new Error(`La fuente elegida usa ${prohibida}: está prohibida. Elige otra en plantilla/fuentes.json.`);
}
const RESERVA = 'ui-sans-serif,"Segoe UI","Helvetica Neue",sans-serif';
const RESERVA_SERIF = 'ui-serif,Georgia,serif';
const esSerif = /Fraunces/.test(fuente.titulos);
const ROOT = `:root{--brand:${M.color};--brand-oscuro:${M.color_oscuro || M.color};--ink:${M.tinta || "#1c1917"};` +
  `--fuente-titulos:${fuente.titulos},${esSerif ? RESERVA_SERIF : RESERVA};--fuente-texto:${fuente.texto},${RESERVA};` +
  `--titulos-ancho:${fuente.ancho_titulos};--titulos-peso:${fuente.peso_titulos};--titulos-mayus:${fuente.mayusculas ? "uppercase" : "none"}}`;
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` +
  `<link href="https://fonts.googleapis.com/css2?${fuente.google}&display=swap" rel="stylesheet">`;

// ---------------------------------------------------------------- medición (GA4, Meta Pixel, Search Console)
function medicion() {
  const md = D.medicion || {};
  let h = "";
  if (md.ga4) h += `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(md.ga4)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${esc(md.ga4)}");</script>`;
  if (md.meta_pixel) h += `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${esc(md.meta_pixel)}');fbq('track','PageView');</script>`;
  if (md.search_console) h += `<meta name="google-site-verification" content="${esc(md.search_console)}">`;
  return h;
}

// ---------------------------------------------------------------- schema (RoofingContractor + FAQ + breadcrumbs)
const dir = C.direccion || {};
const NEGOCIO = {
  "@type": "RoofingContractor", "@id": `${DOM}/#business`, name: C.legal || C.nombre, url: `${DOM}/`, telephone: tel,
  email: C.correo || undefined, slogan: C.lema || undefined,
  image: D.hero?.foto?.archivo && fs.existsSync(P("compania/fotos", D.hero.foto.archivo)) ? `${DOM}/img/${D.hero.foto.archivo}` : undefined,
  logo: archivoMarca(M.logo) ? `${DOM}/${M.logo}` : undefined,
  address: { "@type": "PostalAddress", ...(dir.mostrar && dir.calle ? { streetAddress: dir.calle } : {}), addressLocality: dir.ciudad || Z.ciudad_base, addressRegion: dir.estado || Z.estado, postalCode: dir.zip || undefined, addressCountry: "US" },
  areaServed: Z.ciudades.map((c) => ({ "@type": "City", name: `${c}, ${Z.estado}` })),
  founder: C.dueno ? { "@type": "Person", name: C.dueno } : undefined,
  knowsLanguage: C.idiomas,
  sameAs: Object.values(C.redes || {}).filter(Boolean),
  aggregateRating: D.resenas?.calificacion && D.resenas?.total ? { "@type": "AggregateRating", ratingValue: D.resenas.calificacion, reviewCount: D.resenas.total } : undefined
};
function schema(slug, titulo, desc, faq, miga, servicio) {
  const g = [{ ...NEGOCIO }, { "@type": "WebPage", "@id": url(slug) + "#webpage", url: url(slug), name: titulo, description: desc, isPartOf: { "@id": `${DOM}/#website` }, about: { "@id": `${DOM}/#business` } }];
  if (!slug) g.push({ "@type": "WebSite", "@id": `${DOM}/#website`, url: `${DOM}/`, name: C.nombre });
  if (miga) g.push({ "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${DOM}/` }, { "@type": "ListItem", position: 2, name: miga, item: url(slug) }] });
  if (servicio) g.push({ "@type": "Service", name: servicio, provider: { "@id": `${DOM}/#business` }, areaServed: NEGOCIO.areaServed });
  if (faq?.length) g.push({ "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: tok(q), acceptedAnswer: { "@type": "Answer", text: tok(a) } })) });
  return JSON.stringify({ "@context": "https://schema.org", "@graph": g }, (k, v) => (v === undefined || (Array.isArray(v) && !v.length) ? undefined : v), 1).replaceAll("</", "<\\/");
}

// ---------------------------------------------------------------- piezas comunes
function head({ slug, titulo, desc, faq, miga, servicio, noindex = false, ogFoto, css = [], activo = "" }) {
  const og = ogFoto?.archivo && fs.existsSync(P("compania/fotos", ogFoto.archivo)) ? ogFoto : D.hero.foto;
  const ogImg = og?.archivo && fs.existsSync(P("compania/fotos", og.archivo)) ? `<meta property="og:image" content="${DOM}/img/${esc(og.archivo)}">` : "";
  const icono = archivoMarca(M.icono) ? `/${M.icono}` : "/favicon.svg";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tok(titulo))}</title>
<meta name="description" content="${esc(tok(desc))}">
<link rel="canonical" href="${url(slug)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta name="theme-color" content="#ffffff">
<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(C.nombre)}">
<meta property="og:title" content="${esc(tok(titulo))}"><meta property="og:description" content="${esc(tok(desc))}">
<meta property="og:url" content="${url(slug)}">${ogImg}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${icono}">
${FONTS}
<link rel="stylesheet" href="/styles.css?v=${VER}">${css.map((c) => `\n<link rel="stylesheet" href="${c}?v=${VER}">`).join("")}
<style>${ROOT}</style>
<script type="application/ld+json">
${schema(slug, tok(titulo), tok(desc), faq, miga, servicio)}
</script>
${medicion()}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${header(activo)}
`;
}

function header(activo) {
  const cur = (s) => (s === activo ? ' aria-current="page"' : "");
  const ICONO_SVC = { "residential-roofing": "roof", "commercial-roofing": "building", "roof-repair": "wrench", "after-storm-damage": "storm" };
  const sub = svcActivos.map((s) => `<a href="/${s.slug}/"${cur(s.slug)}><span class="sub-ic">${ico(s.icono || ICONO_SVC[s.slug] || "roof")}</span><span><b>${esc(s.nombre)}</b><small>${esc(tok(s.menu || s.corto.split(/[.—]/)[0]))}</small></span></a>`).join("");
  const msub = svcActivos.map((s) => `<a class="subl" href="/${s.slug}/">${esc(s.nombre)}</a>`).join("");
  const est = EST ? `<a href="/roof-estimate/"${cur("roof-estimate")}>Roof Estimator</a>` : "";
  const fin = `<a href="/finance-insurance/"${cur("finance-insurance")}>${FIN ? "Finance &amp; Insurance" : "Insurance Claims"}</a>`;
  return `<header class="header"><div class="header-in">
 <a class="logo" href="/" aria-label="${esc(C.nombre)} — home">${logoHTML()}</a>
 <nav class="nav" aria-label="Main">
  <a href="/"${cur("home")}>Home</a><a href="/about-us/"${cur("about-us")}>About Us</a>
  <div class="has-sub"><a href="/#services" aria-haspopup="true">Services<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></a><div class="sub" role="menu">${sub}</div></div>
  <a href="/#projects">Projects</a>${est}${fin}<a href="/contact-us/"${cur("contact-us")}>Contact</a>
 </nav>
 <div class="head-cta">
  <a class="head-tel" href="tel:${tel}">${ico("phone")}<span>${esc(C.telefono)}</span></a>
  <a class="btn sm" href="/contact-us/">Free Inspection</a>
  <button class="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><i></i><i></i></button>
 </div>
</div></header>
<nav class="mnav" id="mnav" aria-label="Mobile menu"><a href="/">Home</a><a href="/about-us/">About Us</a>${msub}<a href="/#projects">Projects</a>${EST ? '<a href="/roof-estimate/">Roof Estimator</a>' : ""}<a href="/finance-insurance/">${FIN ? "Finance &amp; Insurance" : "Insurance Claims"}</a><a href="/contact-us/">Contact</a><a class="btn" href="tel:${tel}">${ico("phone")} Call ${esc(C.telefono)}</a></nav>
`;
}

function footer() {
  const svc = svcActivos.map((s) => `<li><a href="/${s.slug}/">${esc(s.nombre)}</a></li>`).join("");
  const redes = Object.entries(C.redes || {}).filter(([, v]) => v).map(([k, v]) =>
    `<a href="${esc(v)}" target="_blank" rel="noopener" aria-label="${esc(C.nombre)} on ${k}">${k === "google" ? G_LOGO : ico(k)}</a>`).join("");
  const direccion = dir.mostrar && dir.calle ? `${esc(dir.calle)}, ${esc(dir.ciudad)}, ${esc(dir.estado)} ${esc(dir.zip)}` : `Serving ${esc(Z.region || Z.ciudad_base)}, ${esc(Z.estado)}`;
  return `<footer class="footer">
<div class="f-grid">
 <div class="f-box"><div class="f-cols">
  <div><h3>Company</h3><ul><li><a href="/">Home</a></li><li><a href="/about-us/">About Us</a></li><li><a href="/#projects">Projects</a></li>${RES.length ? '<li><a href="/#reviews">Google Reviews</a></li>' : ""}<li><a href="/contact-us/">Contact</a></li><li><a href="/privacy-policy/">Privacy Policy</a></li></ul></div>
  <div><h3>Resources</h3><ul>${EST ? '<li><a href="/roof-estimate/">Roof Estimator</a></li>' : ""}<li><a href="/contact-us/">Free Roof Inspection</a></li>${FIN ? '<li><a href="/finance-insurance/#financing">Financing Calculator</a></li>' : ""}<li><a href="/finance-insurance/">Insurance Claims</a></li></ul></div>
  <div><h3>Our Services</h3><ul>${svc}</ul></div>
 </div></div>
 <div class="f-box">
  <a class="logo" href="/" aria-label="${esc(C.nombre)} — home">${logoHTML(true)}</a>
  <ul style="margin-top:18px">
   <li class="i">${ico("phone")}<a href="tel:${tel}">${esc(C.telefono)}</a></li>
   ${C.correo ? `<li class="i">${ico("mail")}<a href="mailto:${esc(C.correo)}">${esc(C.correo)}</a></li>` : ""}
   <li class="i">${ico("pin")}<span>${direccion}</span></li>
   ${C.horario ? `<li class="i">${ico("clock")}<span>${esc(C.horario)}</span></li>` : ""}
   ${C.licencia ? `<li class="i">${ico("file")}<span>${esc(C.licencia)}</span></li>` : ""}
  </ul>
  ${redes ? `<div class="social">${redes}</div>` : ""}
 </div>
</div>
<div class="f-bottom"><span>© ${new Date().getFullYear()} ${esc(C.legal || C.nombre)}. All rights reserved.</span><span>${esc(C.lema || "")}</span></div>
</footer>
<div class="callbar"><a class="c1" href="tel:${tel}">${ico("phone")}Call now</a><a class="c2" href="${EST ? "/roof-estimate/" : "/contact-us/"}">${ico("calc")}Free estimate</a></div>
<script src="/site.js?v=${VER}" defer></script>
</body></html>`;
}

const faqHTML = (faq) => '<div class="faq">' + faq.map(([q, a]) => `<details><summary>${esc(tok(q))}</summary><p>${esc(tok(a))}</p></details>`).join("") + "</div>";
const titulo = (eyebrow, h, id, rojo = false) => `<div class="center"><span class="eyebrow${rojo ? " red" : ""}">${eyebrow}</span><h2 id="${id}" class="title">${h}</h2><span class="underline"></span></div>`;

function credenciales(h = "Licensed. Insured. Local.") {
  const lista = D.credenciales || [];
  if (!lista.length) return "";
  const b = lista.map((x) => {
    const imgRel = archivoMarca(x.imagen);
    const im = imgRel ? `<img src="/${esc(imgRel)}" alt="${esc(x.titulo)}" loading="lazy">` : `<span class="mono">${ico("shield")}</span>`;
    const inner = `${im}<span><strong>${esc(x.titulo)}</strong><small>${esc(x.detalle)}</small></span>`;
    return x.url ? `<a class="badge" href="${esc(x.url)}" target="_blank" rel="noopener">${inner}</a>` : `<div class="badge">${inner}</div>`;
  }).join("");
  return `<section class="trust" aria-label="Credentials"><div class="wrap"><h2>${h}</h2><div class="badges">${b}</div></div></section>`;
}

function revCard(r) {
  const ini = (r.nombre.trim()[0] || "?").toUpperCase();
  return `<article class="rev"><div class="stars" aria-label="${r.estrellas || 5} out of 5 stars">${"★".repeat(r.estrellas || 5)}</div>` +
    `<blockquote class="clamp">“${esc(r.texto)}”</blockquote><button class="more" type="button">Read more</button><div class="spacer"></div>` +
    `<footer><span class="avatar" aria-hidden="true">${esc(ini)}</span><div><div class="who">${esc(r.nombre)}</div><div class="meta">${G_LOGO}Posted on Google</div></div></footer></article>`;
}

const banner = (h = D.cta_final, f = D.proyectos?.[1] || D.hero.foto) => `<section class="banner" aria-label="Call to action"><div class="banner-in">${foto(f)}
 <div><h2>${esc(tok(h))}</h2><a class="btn" href="/contact-us/">Schedule Free Inspection</a></div>
</div></section>`;
const espacio = '<div style="height:clamp(50px,7vw,90px)"></div>';

// formularios: Web3Forms (si hay WEB3FORMS_KEY) o FormSubmit al correo de leads
const LEADS = (D.leads?.correo || "").trim();
function formAccion() {
  if (WEB3) return { action: "https://api.web3forms.com/submit", ocultos: `<input type="hidden" name="access_key" value="${esc(WEB3)}"><input type="hidden" name="subject" value="New website request — ${esc(C.nombre)}"><input type="hidden" name="redirect" value="${DOM}/thank-you/"><input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">` };
  if (LEADS) return { action: `https://formsubmit.co/${esc(LEADS)}`, ocultos: `<input type="hidden" name="_subject" value="New website request — ${esc(C.nombre)}"><input type="hidden" name="_next" value="${DOM}/thank-you/"><input type="hidden" name="_template" value="table"><input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">` };
  avisos.push("Los formularios no mandan a ningún lado: falta leads.correo en sitio.json o WEB3FORMS_KEY en .env (en la vista previa van directo a /thank-you/).");
  return { action: "/thank-you/", ocultos: "" };
}
function contacto(nivel = "h2") {
  const f = formAccion();
  const opts = svcActivos.map((s) => `<option>${esc(s.nombre)}</option>`).join("");
  const mapa = encodeURIComponent(dir.mostrar && dir.calle ? `${C.nombre}, ${dir.calle}, ${dir.ciudad}, ${dir.estado} ${dir.zip}` : `${Z.ciudad_base}, ${Z.estado}`);
  return `<div class="wrap contact">
 <div>
  <span class="eyebrow red">Contact us</span>
  <${nivel}>Ready for a roof you don't have to worry about?</${nivel}>
  <p class="lead">Call, email or send the form to book your free inspection. We serve ${esc(ciudadesTxt(Z.ciudades))}.</p>
  <ul class="nap">
   <li><span class="ic">${ico("phone")}</span><div><small>Phone${C.horario ? " · " + esc(C.horario) : ""}</small><a href="tel:${tel}">${esc(C.telefono)}</a></div></li>
   ${C.correo ? `<li><span class="ic">${ico("mail")}</span><div><small>Email</small><a href="mailto:${esc(C.correo)}">${esc(C.correo)}</a></div></li>` : ""}
   <li><span class="ic">${ico("pin")}</span><div><small>${dir.mostrar && dir.calle ? "Address" : "Service area"}</small>${dir.mostrar && dir.calle ? `${esc(dir.calle)}, ${esc(dir.ciudad)}, ${esc(dir.estado)} ${esc(dir.zip)}` : esc(ciudadesTxt(Z.ciudades)) + ", " + esc(Z.estado)}</div></li>
  </ul>
  <div class="map"><iframe src="https://www.google.com/maps?q=${mapa}&z=${dir.mostrar ? 14 : 9}&output=embed" title="Map of ${esc(C.nombre)} service area" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
 </div>
 <form class="form" action="${f.action}" method="POST">
  <h3>Request a free inspection</h3>
  <p class="hint">We'll get back to you as soon as possible.</p>
  ${f.ocultos}
  <label for="f-name">Full name *</label><input id="f-name" name="Name" required autocomplete="name">
  <div class="two"><div><label for="f-phone">Phone *</label><input id="f-phone" name="Phone" type="tel" required autocomplete="tel"></div>
  <div><label for="f-email">Email *</label><input id="f-email" name="Email" type="email" required autocomplete="email"></div></div>
  <label for="f-addr">Property address</label><input id="f-addr" name="Address" autocomplete="street-address">
  <label for="f-svc">What do you need?</label><select id="f-svc" name="Service"><option>Free roof inspection</option>${opts}${FIN ? "<option>Financing</option>" : ""}<option>Other</option></select>
  <label for="f-msg">Tell us about your roof</label><textarea id="f-msg" name="Message" rows="4"></textarea>
  <button class="btn" type="submit"><span>Get My Free Inspection</span>${ico("arrow-right")}</button>
  <p class="fine">By sending this form you agree to be contacted by ${esc(C.nombre)} about your request. See our <a href="/privacy-policy/">privacy policy</a>.</p>
 </form>
</div>`;
}

const tarjetas = (items) => '<div class="cards">' + items.map((s) =>
  `<a class="card" href="/${s.slug}/"><span class="ph">${foto(s.foto)}</span><h3>${esc(s.nombre)}</h3><p>${esc(tok(s.corto))}</p><span class="link">${esc(s.link || "Explore " + s.nombre)} ${ico("arrow-right")}</span></a>`).join("") + "</div>";
const TARJETAS = [...svcActivos,
  { slug: "finance-insurance", nombre: FIN ? "Financing & Insurance Claims" : "Insurance Claims", corto: FIN ? "Estimate your monthly payment in seconds, and get help documenting storm damage for your claim." : "Photo documentation and estimates to support your storm damage claim.", foto: D.finanzas_seguro.foto, link: FIN ? "Explore Financing" : "Learn More" },
  { slug: "contact-us", nombre: "Free Roof Inspections", corto: "Free, no-obligation inspections with photos — and an honest answer, even when your roof is fine.", foto: D.proceso?.[0]?.foto, link: "Schedule Free Inspection" }];

// ---------------------------------------------------------------- componentes
function estimador() {
  if (!EST) return "";
  const cat = CAT.materiales;
  const materiales = EST.materiales.map((m) => {
    const base = cat[m.id] || {};
    const [lo, hi] = m.precio_square;
    return { id: m.id, nombre: m.nombre || base.nombre, tipos: m.tipos || base.tipos, img: m.img || base.img, desc: tok(m.desc || base.desc), low: lo / 100, high: hi / 100 };
  });
  const actuales = {};
  for (const [tipo, ids] of Object.entries(EST.materiales_actuales)) actuales[tipo] = ids.map((id) => ({ id, ...CAT.actuales[id] }));
  const fin = FIN ? { apr: FIN.niveles_credito[FIN.estimador_nivel ?? 1][1], meses: FIN.estimador_plazo || FIN.plazo_inicial } : null;
  const cfg = {
    googleKey: GOOGLE_KEY, compania: C.nombre, pais: "us", centro: Z.mapa_centro,
    leads: { web3formsKey: WEB3, correo: LEADS },
    comercial: !!EST.comercial && materiales.some((m) => m.tipos.includes("commercial")), multComercial: EST.mult_comercial || 1,
    pendientes: EST.pendientes, materiales, materialesActuales: actuales, tamanoPorDefecto: EST.tamano_por_defecto_sqft,
    mostrarTodos: EST.mostrar_todos !== false, preguntarFinanciamiento: !!FIN, mensualidad: fin,
    linkCita: "/contact-us/", textoBoton: "Book Free Inspection"
  };
  const html = fs.readFileSync(P("componentes/estimador/estimador.html"), "utf8")
    .replaceAll("{{COMPANIA}}", esc(C.nombre)).replaceAll("{{PRIVACIDAD}}", "/privacy-policy/").replaceAll("{{AVISO}}", esc(tok(EST.aviso)))
    .replace("{{OPCIONES_TAMANO}}", EST.tamanos_sin_mapa.map(([t, v]) => `<option value="${v}">${esc(t)}</option>`).join(""));
  return html + `\n<script>window.ESTIMADOR=${JSON.stringify(cfg).replaceAll("</", "<\\/")};</script>\n<script src="/estimador/estimador.js?v=${VER}" defer></script>`;
}
function estSeccion(conTitulo = true) {
  if (!EST) return "";
  return `<div class="wrap">${conTitulo ? `<div class="est-head">${titulo("Roof Estimator", "Estimate Your Roof in 60 Seconds", "est-h")}</div>` : ""}\n${estimador()}\n</div>`;
}

function calculadora() {
  if (!FIN) return "";
  const pre = FIN.link_precalificacion
    ? `<a href="${esc(FIN.link_precalificacion)}" class="cta-button" target="_blank" rel="noopener" data-precalificar>Check Your Rate${FIN.socio ? " with " + esc(FIN.socio) : ""} →</a>` : "";
  const html = fs.readFileSync(P("componentes/financiamiento/financiamiento.html"), "utf8")
    .replace("{{MONTO_INICIAL}}", dinero(FIN.monto_inicial)).replace("{{MONTO_MIN}}", dinero(FIN.monto_min)).replace("{{MONTO_MAX}}", dinero(FIN.monto_max))
    .replace("{{OPCIONES_CREDITO}}", FIN.niveles_credito.map(([t, apr], i) => `<option value="${apr}"${i === 0 ? " selected" : ""}>${esc(t)}</option>`).join(""))
    .replace("{{OPCIONES_PLAZO}}", FIN.plazos_meses.map((m) => `<option value="${m}"${m === FIN.plazo_inicial ? " selected" : ""}>${m % 12 ? m + " months" : m / 12 + " years (" + m + " months)"}</option>`).join(""))
    .replace("{{BOTON_PRECALIFICAR}}", pre).replace("{{LINK_CITA}}", "/contact-us/").replace("{{CLASE_CITA}}", pre ? "secundario" : "")
    .replace("{{TEXTO_CITA}}", "Get Your Free Inspection").replace("{{AVISO_LEGAL}}", esc(tok(FIN.aviso_legal)));
  const cfg = { montoMin: FIN.monto_min, montoMax: FIN.monto_max };
  return html + `\n<script>window.FINANCIAMIENTO=${JSON.stringify(cfg)};</script>\n<script src="/financiamiento/financiamiento.js?v=${VER}" defer></script>`;
}
function pagoEjemplo() { // para la franja de financiamiento del inicio
  const apr = FIN.niveles_credito[FIN.estimador_nivel ?? 1][1] / 100 / 12, n = FIN.estimador_plazo || FIN.plazo_inicial, p = FIN.monto_inicial;
  return { pago: Math.round(apr ? (p * apr) / (1 - Math.pow(1 + apr, -n)) : p / n), n, apr: FIN.niveles_credito[FIN.estimador_nivel ?? 1][1] };
}

const pageHero = (miga, h1, intro, f, botones = true) => `<section class="page-hero"><div class="page-hero-in">${foto(f, "", false)}
 <div class="page-hero-copy"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <span>${esc(miga)}</span></nav>
 <h1>${h1}</h1><p>${esc(tok(intro))}</p>${botones ? `<div class="hero-btns">${EST ? `<a class="btn" href="/roof-estimate/">${ico("calc")} Instant Estimate</a>` : `<a class="btn" href="/contact-us/">Free Inspection</a>`}<a class="btn white" href="tel:${tel}">${ico("phone")} ${esc(C.telefono)}</a></div>` : ""}</div>
</div></section>`;

function seccionResenas(mini = false, nombres) {
  if (!RES.length) return "";
  const r = D.resenas;
  const lista = nombres ? RES.filter((x) => nombres.includes(x.nombre)) : RES;
  const barra = r.calificacion ? `<div class="rating-bar"><span class="score">${r.calificacion}</span><span class="stars">${STARS}</span><span class="src">${G_LOGO} Based on ${r.total} Google reviews</span></div>` : "";
  if (mini) return `<section class="sec soft"><div class="wrap">${titulo("Google reviews", "What Our Customers Say", "mr-h", true)}<div class="mini-reviews">${lista.slice(0, 3).map(revCard).join("")}</div></div></section>`;
  return `<section class="reviews" id="reviews" aria-labelledby="rev-h"><div class="wrap">
 ${titulo("Google reviews", 'What Our Customers <span class="r">Are Saying</span>', "rev-h", true)}
 ${barra}
 <div class="rev-wrap" data-carousel><div class="rev-track" tabindex="0" aria-label="Google reviews">${lista.map(revCard).join("")}</div>
 <div class="rev-nav"><button class="arr-btn" type="button" data-prev aria-label="Previous reviews">${ico("arrow-left")}</button><div class="dots" aria-hidden="true"></div><button class="arr-btn" type="button" data-next aria-label="Next reviews">${ico("arrow-right")}</button></div></div>
 ${r.google_url ? `<div class="rev-cta"><a class="btn outline" href="${esc(r.google_url)}" target="_blank" rel="noopener">${G_LOGO} See Us on Google</a></div>` : ""}
</div></section>`;
}

function escribirPagina(slug, html) { escribir(slug ? `${slug}/index.html` : "index.html", html); }
const cssEst = EST ? ["/estimador/estimador.css"] : [];
const cssFin = FIN ? ["/financiamiento/financiamiento.css"] : [];

// ================================================================ INICIO
function inicio() {
  const tituloSeo = `${C.nombre} | Roofing Contractor in ${Z.ciudad_base}, ${Z.estado}`;
  const desc = `Roof replacement, roof repair and storm damage restoration in ${Z.ciudad_base}, ${Z.estado} and nearby: ${ciudadesTxt(Z.ciudades.slice(1, 4))}. Free inspection${EST ? " and instant online roof estimate" : ""}. Call ${C.telefono}.`;
  const H = D.hero, N = D.nosotros;
  const tag = (t) => (t ? `<span class="tag${t === "After" ? " after" : ""}">${esc(t)}</span>` : "");
  const projs = (D.proyectos || []).map((p) => `<figure class="proj">${foto(p)}${tag(p.etiqueta)}<figcaption><b>${esc(p.titulo)}</b><span>${esc(p.lugar)}</span></figcaption></figure>`).join("");
  const conf = (H.confianza || []).map((t) => `<span>${esc(t)}</span>`).join("");
  const rating = D.resenas?.calificacion ? `<span><b>${STARS}</b> ${D.resenas.calificacion} on Google</span>` : "";
  const tarjetaHero = EST ? `<div class="hero-card">
  <div class="mock" aria-hidden="true"><b>Review your estimate</b>${foto(D.servicios[0].foto)}<i class="r"></i><i></i><i></i><i class="r"></i><i></i></div>
  <div><h2>Estimate Your Roof in 60 Seconds</h2><p>Get a starting price range for your ${esc(Z.region || Z.ciudad_base)} home or building. It takes about a minute.</p><a class="btn sm outline" href="#estimate">Try the Calculator</a></div>
 </div>` : "";
  const finBand = FIN ? (() => { const e = pagoEjemplo(); return `<section class="sec" aria-labelledby="finb-h"><div class="wrap"><div class="fin-band">
 <div><span class="eyebrow">Flexible financing</span><h2 id="finb-h">Roof Now. Pay Over Time.</h2><p>Estimate your monthly payment in seconds${FIN.link_precalificacion ? " and check your rate with no impact to your credit score" : ""}.</p></div>
 <div><div class="big">${dinero(e.pago)}<span> /mo*</span></div><p class="small">*Example: ${dinero(FIN.monto_inicial)} project, ${e.n} months at ${e.apr}% APR. Not an offer of credit.</p><a class="btn" href="/finance-insurance/#financing">Estimate My Payment</a></div>
</div></div></section>`; })() : "";

  const html = head({ slug: "", titulo: tituloSeo, desc, faq: D.faq_inicio, css: [...cssEst], activo: "home" }) + `<main id="main">
<section class="hero" aria-label="Introduction"><div class="hero-in">
 ${foto(H.foto, "hero-bg", false)}
 <div class="hero-copy">
  <p class="eyebrow">${esc(H.eyebrow)}</p>
  <h1>${H.titulo}</h1>
  <p>${esc(tok(H.texto))}</p>
  <div class="hero-btns"><a class="btn" href="/contact-us/">Get a Free Inspection</a><a class="btn white" href="tel:${tel}">${ico("phone")} ${esc(C.telefono)}</a></div>
  <div class="hero-trust">${rating}${conf}</div>
 </div>
 ${tarjetaHero}
</div></section>

${seccionResenas()}
${credenciales()}
<div class="checker" aria-hidden="true"></div>

<section class="sec" id="about" aria-labelledby="about-h"><div class="wrap about">
 <figure class="about-photo reveal">${foto(N.foto)}</figure>
 <div>
  <span class="eyebrow">${esc(N.eyebrow)}</span>
  <h2 id="about-h">${esc(N.titulo)}</h2>
  ${N.parrafos.map((p) => `<p>${esc(tok(p))}</p>`).join("\n  ")}
  <a class="btn" href="/contact-us/">Get a Free Inspection</a>
  <figure class="about-pic2 reveal">${foto(N.foto2)}</figure>
  <div class="values">${N.valores.map(([h, p]) => `<div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join("")}</div>
 </div>
</div></section>

<section class="sec soft" id="services" aria-labelledby="svc-h"><div class="wrap">
 <div class="svc-head"><div><span class="eyebrow">Full-service roofing</span><h2 id="svc-h" class="title">Roofing Services for ${esc(Z.region || Z.ciudad_base)} Homes &amp; Businesses</h2></div>
 <p>From free inspections to full replacements and storm repairs, we handle every part of your roof — with honest pricing and work we stand behind.</p></div>
 ${tarjetas(TARJETAS)}
</div></section>

<section class="sec" id="projects" aria-labelledby="proj-h"><div class="projects" data-carousel>
 <div>
  <span class="eyebrow">Featured projects</span>
  <h2 id="proj-h">See Recent Roofs We've Built</h2>
  <p>Real photos from our job sites across ${esc(Z.region || Z.ciudad_base)} — before, during and after.</p>
  <a class="link" href="/contact-us/">Start Your Project ${ico("arrow-right")}</a>
  <div class="arrows"><button class="arr-btn" type="button" data-prev aria-label="Previous projects">${ico("arrow-left")}</button><button class="arr-btn" type="button" data-next aria-label="Next projects">${ico("arrow-right")}</button></div>
 </div>
 <div class="proj-track" tabindex="0" aria-label="Project photos">${projs}</div>
</div></section>

${EST ? `<section class="sec soft" id="estimate" aria-labelledby="est-h">${estSeccion()}</section>` : ""}
${finBand}

<section class="sec${FIN ? " soft" : ""}" aria-labelledby="proc-h"><div class="wrap">
 ${titulo("Our 3-step process", "From Inspection to a Roof You Can Trust", "proc-h")}
 <div class="steps">${(D.proceso || []).map((s, i) => `<article class="step-card reveal">${foto(s.foto)}<div><span class="n">STEP 0${i + 1}</span><h3>${esc(s.titulo)}</h3><p>${esc(s.texto)}</p></div></article>`).join("")}</div>
</div></section>

<section class="sec${FIN ? "" : " soft"}" aria-labelledby="faq-h"><div class="wrap">
 ${titulo("FAQ", "Roofing Questions, Answered", "faq-h")}
 ${faqHTML(D.faq_inicio)}
</div></section>

${espacio}
${banner()}

<section class="sec" id="contact" aria-label="Contact">${contacto()}</section>
</main>
` + footer();
  escribirPagina("", html);
}

// ================================================================ SERVICIOS
function servicio(s) {
  const otros = TARJETAS.filter((x) => x.slug !== s.slug).slice(0, 3);
  const html = head({ slug: s.slug, titulo: s.titulo_seo, desc: s.descripcion_seo, faq: s.faq, miga: s.nombre, servicio: s.nombre, ogFoto: s.foto, activo: s.slug }) + `<main id="main">
${pageHero(s.nombre, esc(s.h1), s.intro, s.foto)}
<section class="sec"><div class="wrap">
 <div class="two-col">
  <div class="box"><span class="eyebrow red">What we offer</span><h2>What we offer</h2><ul class="ticks">${s.ofrece.map((x) => `<li>${esc(tok(x))}</li>`).join("")}</ul></div>
  <div class="box"><span class="eyebrow red">Why us</span><h2>Why ${esc(Z.ciudad_base)} chooses us</h2><ul class="ticks">${s.porque.map((x) => `<li>${esc(tok(x))}</li>`).join("")}</ul></div>
 </div>
 <div class="strip">${(s.galeria || []).map((g) => foto(g)).join("")}</div>
</div></section>
${credenciales()}
${seccionResenas(true, s.resenas)}
<section class="sec" aria-labelledby="faq-h"><div class="wrap">
 ${titulo("FAQ", esc(s.nombre) + " FAQ", "faq-h")}
 ${faqHTML(s.faq)}
</div></section>
<section class="sec soft" aria-labelledby="more-h"><div class="wrap">
 <div class="svc-head"><div><span class="eyebrow">More services</span><h2 id="more-h" class="title">Other Ways We Can Help</h2></div><p>Roofing, repairs, storm damage and insurance help — all from one local team serving ${esc(ciudadesTxt(Z.ciudades.slice(0, 4)))}.</p></div>
 ${tarjetas(otros)}
</div></section>
${espacio}
${banner()}
${espacio}
</main>
` + footer();
  escribirPagina(s.slug, html);
}

// ================================================================ FINANZAS Y SEGURO
function finanzasSeguro() {
  const F = D.finanzas_seguro, slug = "finance-insurance";
  const finSec = FIN ? `<section class="sec" id="financing" aria-labelledby="fin-h"><div class="wrap fin">
 <div>
  <span class="eyebrow red">Flexible financing</span>
  <h2 id="fin-h">Roof Now. Pay Over Time.</h2>
  <p class="lead">Small leaks become big problems while you save up. Financing lets you replace or repair your roof today and pay in manageable monthly steps.</p>
  <ol class="fin-steps">
   <li><div><b>${FIN.link_precalificacion ? "Check your rate" : "Estimate your payment"}</b><span>${FIN.link_precalificacion ? `Pre-qualify${FIN.socio ? " with " + esc(FIN.socio) : ""} in minutes. Most partners use a soft credit check.` : "Use the calculator to see what fits your budget."}</span></div></li>
   <li><div><b>Choose your plan</b><span>Pick the term and monthly payment that work for you.</span></div></li>
   <li><div><b>Start your roof</b><span>Once approved, we schedule your project. You pay over time.</span></div></li>
  </ol>
 </div>
 ${calculadora()}
</div></section>` : "";
  const html = head({ slug, titulo: F.titulo_seo, desc: F.descripcion_seo, faq: F.faq, miga: FIN ? "Finance & Insurance" : "Insurance Claims", ogFoto: F.foto, css: cssFin, activo: slug }) + `<main id="main">
${pageHero(FIN ? "Finance & Insurance" : "Insurance Claims", esc(F.h1), F.intro, F.foto, false)}
${finSec}
<section class="sec soft" aria-labelledby="ins-h"><div class="wrap">
 <div class="two-col">
  <div class="box" style="background:#fff"><span class="eyebrow red">Insurance claims</span><h2 id="ins-h">Storm damage? We'll document it for your claim.</h2><ul class="ticks">${F.seguro.map((x) => `<li>${esc(tok(x))}</li>`).join("")}</ul></div>
  <div class="box" style="background:#fff"><span class="eyebrow red">Good to know</span><h2>What we will never do</h2><ul class="ticks"><li>Promise what your insurance company will pay</li><li>Offer to cover or waive your deductible</li><li>Pressure you to sign before you understand the estimate</li></ul></div>
 </div>
</div></section>
<section class="sec" aria-labelledby="faq-h"><div class="wrap">${titulo("FAQ", "Financing &amp; Insurance, Answered", "faq-h")}${faqHTML(F.faq)}</div></section>
${banner()}
${espacio}
</main>
` + footer();
  escribirPagina(slug, html);
}

// ================================================================ OTRAS PÁGINAS
function paginaEstimado() {
  if (!EST) return;
  const slug = "roof-estimate";
  const faq = D.faq_inicio.slice(0, 2);
  const html = head({ slug, titulo: `Instant Roof Estimate Calculator | ${C.nombre}, ${Z.ciudad_base} ${Z.estado}`, desc: `Get an instant roof replacement price range for your home or building in ${Z.region || Z.ciudad_base} in about a minute. Free, no obligation.`, faq, miga: "Roof Estimate", css: cssEst, activo: slug }) + `<main id="main">
${pageHero("Roof Estimate", "Estimate Your Roof in 60 Seconds", "Answer a few quick questions and see a price range for your roof. Final prices are confirmed after a free on-site inspection.", D.hero.foto, false)}
<section class="sec">${estSeccion(false)}</section>
<section class="sec soft"><div class="wrap">${titulo("FAQ", "Questions About the Estimate", "faq-h")}${faqHTML(faq)}</div></section>
</main>
` + footer();
  escribirPagina(slug, html);
}

function nosotros() {
  const slug = "about-us", N = D.nosotros;
  const html = head({ slug, titulo: `About ${C.nombre} | Roofing Company in ${Z.ciudad_base}, ${Z.estado}`, desc: tok(N.parrafos[0]).slice(0, 158), faq: D.faq_inicio.slice(-2), miga: "About Us", ogFoto: N.foto, activo: slug }) + `<main id="main">
${pageHero("About Us", `About ${esc(C.nombre)}`, N.parrafos[0], N.foto2)}
<section class="sec"><div class="wrap about">
 <figure class="about-photo">${foto(N.foto)}</figure>
 <div>
  <span class="eyebrow">Our story</span>
  <h2>${esc(N.titulo)}</h2>
  ${N.parrafos.map((p) => `<p>${esc(tok(p))}</p>`).join("\n  ")}
  <a class="btn" href="/contact-us/">Get a Free Inspection</a>
  <div class="values">${N.valores.map(([h, p]) => `<div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join("")}</div>
 </div>
</div></section>
${credenciales()}
${seccionResenas(true)}
<section class="sec"><div class="wrap">${titulo("FAQ", "About " + esc(C.nombre), "faq-h")}${faqHTML(D.faq_inicio.slice(-2))}</div></section>
${banner(C.lema || D.cta_final)}
${espacio}
</main>
` + footer();
  escribirPagina(slug, html);
}

function paginaContacto() {
  const slug = "contact-us";
  const html = head({ slug, titulo: `Contact ${C.nombre} | Roofer in ${Z.ciudad_base}, ${Z.estado} | ${C.telefono}`, desc: `Call ${C.telefono} or send the form to book a free roof inspection with ${C.nombre}. Serving ${ciudadesTxt(Z.ciudades)}.`, faq: D.faq_inicio.slice(0, 1), miga: "Contact Us", activo: slug }) + `<main id="main">
${pageHero("Contact Us", "Get in Touch With Us", "Need a roof inspection, a storm damage assessment or details about financing and insurance? We're ready to help.", D.proceso?.[0]?.foto || D.hero.foto, false)}
<section class="sec">${contacto("h2")}</section>
<section class="sec soft"><div class="wrap">${titulo("FAQ", "Before You Call", "faq-h")}${faqHTML(D.faq_inicio.slice(0, 3))}</div></section>
</main>
` + footer();
  escribirPagina(slug, html);
}

function gracias() {
  const html = head({ slug: "thank-you", titulo: `Thank You | ${C.nombre}`, desc: `Thanks for contacting ${C.nombre}. We'll get back to you soon.`, noindex: true }) + `<main id="main" class="prose" style="min-height:55vh">
 <span class="eyebrow red">Message received</span>
 <h1>Thank You! We'll Be in Touch Soon.</h1>
 <p>Your request reached ${esc(C.nombre)}. If your roof is leaking right now, don't wait — call us at <a href="tel:${tel}">${esc(C.telefono)}</a>.</p>
 <p><a class="btn" href="/">Back to Home</a></p>
</main>
<script>try{if(window.gtag)gtag('event','generate_lead',{form:'contact'});if(window.fbq)fbq('track','Lead',{content_name:'Contact Form'});}catch(e){}</script>
` + footer();
  escribirPagina("thank-you", html);
}

function privacidad() {
  const servicios = [WEB3 ? "Web3Forms" : "FormSubmit"];
  const md = D.medicion || {};
  const html = head({ slug: "privacy-policy", titulo: `Privacy Policy | ${C.nombre}`, desc: `How ${C.legal || C.nombre} collects and uses the information you send through this website.`, miga: "Privacy Policy" }) + `<main id="main" class="prose">
 <span class="eyebrow red">Legal</span>
 <h1>Privacy Policy</h1>
 <p>Last updated: ${HOY}</p>
 <h2>What we collect</h2>
 <p>When you use our contact form${EST ? " or roof estimate calculator" : ""}, we collect the information you choose to send: your name, phone number, email, property address, roof details and any message.</p>
 <h2>How we use it</h2>
 <p>We use this information only to respond to your request, prepare your estimate and schedule your inspection. We may contact you by phone, text or email about your request. We do not sell your information. Text messages are sent only if you agree to receive them, and you can reply STOP at any time.</p>
 <h2>Service providers</h2>
 <p>Form submissions are delivered to our email through ${servicios.join(" and ")}.${EST && GOOGLE_KEY ? " The roof estimate calculator uses Google Maps Platform to find your address and measure your roof; Google processes that address under its own privacy policy." : ""}${md.ga4 ? " We use Google Analytics to understand how visitors use this site." : ""}${md.meta_pixel ? " We use the Meta Pixel to measure our advertising." : ""}${FIN?.link_precalificacion ? ` Financing pre-qualification happens on our financing partner's website${FIN.socio ? " (" + esc(FIN.socio) + ")" : ""}, under its own privacy policy.` : ""}</p>
 <h2>Contact</h2>
 <p>Questions? ${C.correo ? `Email <a href="mailto:${esc(C.correo)}">${esc(C.correo)}</a> or call` : "Call"} <a href="tel:${tel}">${esc(C.telefono)}</a>. ${esc(C.legal || C.nombre)}${dir.mostrar && dir.calle ? `, ${esc(dir.calle)}, ${esc(dir.ciudad)}, ${esc(dir.estado)} ${esc(dir.zip)}` : `, ${esc(Z.ciudad_base)}, ${esc(Z.estado)}`}.</p>
</main>
` + footer();
  escribirPagina("privacy-policy", html);
}

function pagina404() {
  const html = head({ slug: "404", titulo: `Page Not Found | ${C.nombre}`, desc: "This page doesn't exist.", noindex: true }) + `<main id="main" class="prose" style="min-height:55vh">
 <span class="eyebrow red">404</span><h1>We couldn't find that page.</h1>
 <p>It may have moved. Try the home page${EST ? ", get an instant roof estimate" : ""} or call us at <a href="tel:${tel}">${esc(C.telefono)}</a>.</p>
 <p><a class="btn" href="/">Back to Home</a></p>
</main>
` + footer();
  escribir("404.html", html);
}

// ================================================================ SEO: sitemap, robots, llms.txt + vercel.json
function archivosSeo() {
  const paginas = ["", ...svcActivos.map((s) => s.slug), "finance-insurance", ...(EST ? ["roof-estimate"] : []), "about-us", "contact-us", "privacy-policy"];
  escribir("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paginas.map((p) => `<url><loc>${url(p)}</loc><lastmod>${HOY}</lastmod></url>`).join("\n")}\n</urlset>\n`);
  escribir("robots.txt", `User-agent: *\nAllow: /\nDisallow: /thank-you/\n\nSitemap: ${DOM}/sitemap.xml\n`);
  const svc = svcActivos.map((s) => `- [${s.nombre}](${url(s.slug)}): ${tok(s.corto)}`).join("\n");
  const herramientas = [EST && `- [Instant roof estimate](${url("roof-estimate")}): price range for a roof replacement in about a minute.`, FIN && `- [Financing calculator](${url("finance-insurance")}#financing): estimated monthly payment (not an offer of credit).`].filter(Boolean).join("\n");
  escribir("llms.txt", `# ${C.legal || C.nombre}

> Roofing contractor in ${Z.ciudad_base}, ${Z.estado_nombre || Z.estado}. Serving ${ciudadesTxt(Z.ciudades)}. Residential and commercial roofing, roof repair, storm damage restoration and insurance claim help${FIN ? ", plus financing" : ""}.${C.dueno ? ` Owner: ${C.dueno}.` : ""}${C.idiomas?.length ? ` Languages: ${C.idiomas.join(", ")}.` : ""}

- Phone: ${C.telefono}${C.horario ? ` (${C.horario})` : ""}
${C.correo ? `- Email: ${C.correo}\n` : ""}- Service area: ${ciudadesTxt(Z.ciudades)}, ${Z.estado}
- Website: ${DOM}/

## Services
${svc}
${herramientas ? `\n## Tools\n${herramientas}\n` : ""}
## Pages
- [About](${url("about-us")})
- [Contact / free inspection](${url("contact-us")})
- [Finance & insurance](${url("finance-insurance")})
`);
  // vercel.json en la raíz: Vercel lo lee ANTES de construir, por eso se escribe aquí y se sube a GitHub.
  const host = new URL(DOM).host.replace(/^www\./, "");
  const vercel = {
    $schema: "https://openapi.vercel.sh/vercel.json",
    buildCommand: "npm run build", outputDirectory: "dist", trailingSlash: true,
    redirects: [
      { source: "/(.*)", has: [{ type: "host", value: "www." + host }], destination: `https://${host}/$1`, permanent: true },
      ...(D.redirecciones || []).map((r) => ({ source: r.desde, destination: r.hacia, permanent: true }))
    ],
    headers: [
      { source: "/img/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
      { source: "/estimador/img/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
      { source: "/(.*)", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }] }
    ]
  };
  fs.writeFileSync(P("vercel.json"), JSON.stringify(vercel, null, 2) + "\n");
}

// ================================================================ archivos estáticos
function estaticos() {
  copiar(P("plantilla/estilos.css"), path.join(DIST, "styles.css"));
  copiar(P("plantilla/site.js"), path.join(DIST, "site.js"));
  if (EST) {
    for (const f of ["estimador.js", "estimador.css"]) copiar(P("componentes/estimador", f), path.join(DIST, "estimador", f));
    for (const f of fs.readdirSync(P("componentes/estimador/img"))) copiar(P("componentes/estimador/img", f), path.join(DIST, "estimador/img", f));
  }
  if (FIN) for (const f of ["financiamiento.js", "financiamiento.css"]) copiar(P("componentes/financiamiento", f), path.join(DIST, "financiamiento", f));
  for (const f of fotosUsadas) copiar(P("compania/fotos", f), path.join(DIST, "img", f));
  for (const rel of [M.logo, M.logo_blanco, M.icono, ...(D.credenciales || []).map((c) => c.imagen)]) if (archivoMarca(rel)) copiar(P("compania", rel), path.join(DIST, rel));
  // favicon por defecto: un techo con el color de la marca
  escribir("favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${M.tinta || "#1c1917"}"/><path d="M12 34 32 17l20 17" fill="none" stroke="${M.color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 31v16h26V31" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/></svg>`);
}

// ================================================================ armar todo
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
inicio();
svcActivos.forEach(servicio);
finanzasSeguro();
paginaEstimado();
nosotros();
paginaContacto();
gracias();
privacidad();
pagina404();
archivosSeo();
estaticos();

const unicos = [...new Set(avisos)];
console.log(`\nListo: el sitio de ${C.nombre} quedó en dist/ (${svcActivos.length} servicios${EST ? ", estimador" : ""}${FIN ? ", calculadora de financiamiento" : ""}).`);
console.log(`Estimador: ${EST ? (GOOGLE_KEY ? "con Google (mapa satelital y medición del techo)" : "SIN clave de Google → modo manual (pregunta el tamaño de la casa)") : "apagado"}.`);
if (unicos.length) {
  const fotos = unicos.filter((a) => a.startsWith("Falta la foto"));
  const otros = unicos.filter((a) => !a.startsWith("Falta la foto"));
  if (fotos.length) console.log(`\n⚠️  Faltan ${fotos.length} fotos reales (salen como "Foto de muestra"). Corre npm run revisar para ver la lista.`);
  otros.forEach((a) => console.log("⚠️  " + a));
}
fs.writeFileSync(path.join(DIST, ".avisos.json"), JSON.stringify(unicos, null, 1));

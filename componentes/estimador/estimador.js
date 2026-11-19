/* Estimador de techos — componente de pagina-contratista (ConstruIA / Rufero Pro).
 * Toda la configuración llega en window.ESTIMADOR (la escribe build.mjs desde compania/sitio.json y .env).
 * No hay nada de una compañía en este archivo: marca, precios, materiales y correo vienen de la configuración.
 *
 * Google (solo si hay clave en GOOGLE_MAPS_API_KEY):
 *   - Maps JavaScript API  → el mapa satelital
 *   - Places API (New)     → el autocompletado de direcciones (PlaceAutocompleteElement)
 *   - Solar API            → mide el techo (buildingInsights:findClosest → wholeRoofStats.areaMeters2)
 * Sin clave, el estimador pregunta el tamaño de la casa y calcula igual (modo manual).
 */
(function () {
  'use strict';
  const C = window.ESTIMADOR;
  const root = document.getElementById('estimateCalc');
  if (!C || !root) return;

  const $ = (sel) => root.querySelector(sel);
  const $$ = (sel) => Array.from(root.querySelectorAll(sel));
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

  const S = {
    address: '', lat: null, lng: null, roofAreaSqft: null, medido: false,
    slope: null, building: C.comercial ? null : 'residential',
    currentMaterial: null, desiredMaterial: null, timeline: null, financing: null,
    history: []
  };
  let modo = C.googleKey ? 'mapa' : 'manual';
  let mapa = null, marcador = null;

  // ---------------------------------------------------------------- pasos (se arman según la configuración)
  function pasos() {
    const p = ['address', 'slope'];
    if (C.comercial) p.push('building');
    p.push('current');
    if (deseados().length > 1) p.push('desired');
    p.push('timeline');
    if (C.preguntarFinanciamiento) p.push('financing');
    p.push('contact');
    return p;
  }
  function deseados() {
    const b = S.building || 'residential';
    return C.materiales.filter((m) => m.tipos.includes(b));
  }
  function show(key) {
    $$('.step').forEach((s) => s.classList.toggle('active', s.dataset.step === key));
    const lista = pasos(), i = lista.indexOf(key);
    if (i >= 0) $$(`.step[data-step="${key}"] .step-n`).forEach((el) => { el.textContent = `Step ${i + 1} of ${lista.length}`; });
    const r = root.getBoundingClientRect();
    if (r.top < 0) window.scrollTo({ top: window.scrollY + r.top - 90, behavior: 'smooth' });
  }
  function next() {
    const lista = pasos(), actual = S.history[S.history.length - 1] || 'address';
    const sig = lista[lista.indexOf(actual) + 1];
    if (!sig) return;
    if (actual === 'current') renderDeseados();
    S.history.push(sig);
    show(sig);
  }
  function back() {
    if (S.history.length <= 1) return;
    S.history.pop();
    show(S.history[S.history.length - 1]);
  }
  S.history.push('address');

  // ---------------------------------------------------------------- opciones de material
  function optImg(item) {
    return `<button class="opt image" type="button" data-value="${esc(item.id)}">
      <div class="img-wrap"><img decoding="async" loading="lazy" src="${esc(item.img)}" alt=""></div>
      <span class="opt-label">${esc(item.nombre)} <span class="arrow-icon"></span></span></button>`;
  }
  function renderActuales() {
    const b = S.building || 'residential';
    $('.options[data-key="currentMaterial"]').innerHTML = (C.materialesActuales[b] || []).map(optImg).join('');
    S.currentMaterial = null;
  }
  function renderDeseados() {
    const lista = deseados();
    $('.options[data-key="desiredMaterial"]').innerHTML = lista.map(optImg).join('');
    S.desiredMaterial = lista.length === 1 ? lista[0].id : null;
  }
  renderActuales();

  // Clic en cualquier opción (delegado, sirve también para las que pinta el JS)
  $$('.options').forEach((group) => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.opt');
      if (!btn || !group.contains(btn)) return;
      group.querySelectorAll('.opt').forEach((o) => o.classList.remove('selected'));
      btn.classList.add('selected');
      S[group.dataset.key] = btn.dataset.value;
      if (group.dataset.key === 'building') renderActuales();
      setTimeout(next, 260);
    });
  });
  $$('.back-btn').forEach((b) => b.addEventListener('click', back));
  $('#addrContinue').addEventListener('click', next);
  $('#estManualLink').addEventListener('click', () => modoManual());
  $('#getEstimateBtn').addEventListener('click', submit);

  // ---------------------------------------------------------------- modo manual (sin clave de Google o si Google falla)
  function modoManual() {
    if (modo === 'manual' && root.dataset.modo === 'manual') return;
    modo = 'manual';
    root.dataset.modo = 'manual';
    const addr = $('#estAddressManual'), size = $('#estSize');
    const listo = () => {
      S.address = addr.value.trim();
      S.roofAreaSqft = parseInt(size.value, 10) || null;
      $('#addrContinue').disabled = !(S.address.length > 5 && S.roofAreaSqft);
    };
    addr.addEventListener('input', listo);
    size.addEventListener('change', listo);
    listo();
  }

  // ---------------------------------------------------------------- Google Maps + Places (New)
  window.gm_authFailure = function () { // Google llama esto si la clave está mal o no permite este dominio
    console.warn('[estimador] Google rechazó la clave (revisa restricciones y APIs). Sigo en modo manual.');
    modoManual();
  };
  function cargarGoogle() {
    window.__estimadorInit = initGoogle;
    const s = document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(C.googleKey) +
      '&v=weekly&loading=async&libraries=places&callback=__estimadorInit';
    s.async = true;
    s.onerror = modoManual;
    document.head.appendChild(s);
  }
  async function initGoogle() {
    try {
      const { PlaceAutocompleteElement } = await google.maps.importLibrary('places');
      const ac = new PlaceAutocompleteElement({ includedRegionCodes: [C.pais || 'us'] });
      ac.id = 'estAddress';
      ac.setAttribute('placeholder', 'Enter your street address');
      if (C.centro) ac.locationBias = { lat: C.centro.lat, lng: C.centro.lng };
      $('#estAddressWrap').appendChild(ac);
      ac.addEventListener('gmp-error', () => { console.warn('[estimador] Falló el autocompletado (¿Places API (New) activada?). Sigo en modo manual.'); modoManual(); });
      ac.addEventListener('gmp-select', async ({ placePrediction }) => {
        const place = placePrediction.toPlace();
        await place.fetchFields({ fields: ['formattedAddress', 'location'] });
        if (!place.location) return;
        S.address = place.formattedAddress;
        S.lat = place.location.lat();
        S.lng = place.location.lng();
        mapa.panTo({ lat: S.lat, lng: S.lng });
        mapa.setZoom(20);
        if (marcador) marcador.setMap(null);
        marcador = new google.maps.Marker({ position: { lat: S.lat, lng: S.lng }, map: mapa });
        $('#addrContinue').disabled = false;
      });
      const c = C.centro || { lat: 39.8283, lng: -98.5795, zoom: 4 };
      mapa = new google.maps.Map($('#map'), {
        center: { lat: c.lat, lng: c.lng }, zoom: c.zoom || 10, mapTypeId: 'satellite', tilt: 0,
        disableDefaultUI: true, gestureHandling: 'cooperative'
      });
    } catch (err) {
      console.warn('[estimador] No cargó Google Maps, sigo en modo manual:', err);
      modoManual();
    }
  }
  if (modo === 'mapa') cargarGoogle(); else modoManual();

  // ---------------------------------------------------------------- medir el techo (Solar API)
  function medirTecho() {
    if (modo !== 'mapa' || S.lat == null) return Promise.resolve();
    const url = 'https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=' + S.lat +
      '&location.longitude=' + S.lng + '&requiredQuality=LOW&key=' + encodeURIComponent(C.googleKey);
    return fetch(url)
      .then((r) => r.json())
      .then((d) => {
        const m2 = d && d.solarPotential && d.solarPotential.wholeRoofStats && d.solarPotential.wholeRoofStats.areaMeters2;
        if (m2) { S.roofAreaSqft = Math.round(m2 * 10.7639); S.medido = true; }
      })
      .catch(() => {})
      .then(() => { if (!S.roofAreaSqft) S.roofAreaSqft = C.tamanoPorDefecto; });
  }

  // ---------------------------------------------------------------- enviar
  function submit() {
    S.name = $('#estName').value.trim();
    S.email = $('#estEmail').value.trim();
    S.phone = $('#estPhone').value.trim();
    S.notes = $('#estNotes').value.trim();
    const err = $('#estError');
    err.textContent = '';
    if (!S.name || !S.email || !S.phone) { err.textContent = 'Please fill out your name, email and phone.'; return; }
    if (!/^\S+@\S+\.\S+$/.test(S.email)) { err.textContent = 'Please check your email address.'; return; }
    if (!$('#termsAgree').checked) { err.textContent = 'Please agree to the Privacy Policy.'; return; }
    show('loading');
    medirTecho().then(() => {
      const resultados = calcular();
      enviarLead(resultados);
      pintarResultados(resultados);
      medir();
    });
  }

  function pago(monto) { // pago mensual con amortización normal
    const f = C.mensualidad;
    if (!f) return null;
    const r = f.apr / 100 / 12, n = f.meses;
    return r === 0 ? monto / n : (monto * r) / (1 - Math.pow(1 + r, -n));
  }
  function calcular() {
    const b = S.building || 'residential';
    const mult = (C.pendientes[S.slope] || 1) * (b === 'commercial' ? C.multComercial : 1);
    // El material que eligió va primero; con mostrarTodos se ven también los demás que ofrece la compañía.
    const todos = deseados();
    const elegido = todos.filter((m) => m.id === S.desiredMaterial);
    const elegidos = C.mostrarTodos ? elegido.concat(todos.filter((m) => m.id !== S.desiredMaterial)) : (elegido.length ? elegido : todos);
    const redondeo = (n) => Math.round(n / 10) * 10;
    return elegidos.map((m) => {
      const low = redondeo(S.roofAreaSqft * m.low * mult), high = redondeo(S.roofAreaSqft * m.high * mult);
      return { m, low, high, mLow: pago(low), mHigh: pago(high) };
    });
  }

  function enviarLead(res) {
    const nombreMat = (id, lista) => ((lista || []).find((x) => x.id === id) || {}).nombre || id || '';
    const b = S.building || 'residential';
    const datos = {
      Name: S.name, Email: S.email, Phone: S.phone, Address: S.address,
      Roof_Size_SqFt: S.roofAreaSqft, Roof_Squares: (S.roofAreaSqft / 100).toFixed(1),
      Measured_By_Satellite: S.medido ? 'Yes' : 'No (home size answered by customer)',
      Slope: cap(S.slope), Building_Type: cap(b),
      Current_Material: nombreMat(S.currentMaterial, C.materialesActuales[b]),
      Desired_Material: nombreMat(S.desiredMaterial, C.materiales),
      Estimate_Shown: res.map((r) => `${r.m.nombre}: ${money(r.low)} - ${money(r.high)}`).join(' | '),
      Timeline: S.timeline || '', Financing: S.financing || '',
      SMS_Opt_In: $('#smsAgree').checked ? 'Yes' : 'No', Notes: S.notes || '',
      Page: location.href
    };
    const asunto = 'New Roof Estimate Lead — ' + S.name;
    let url, body;
    if (C.leads.web3formsKey) {
      url = 'https://api.web3forms.com/submit';
      body = Object.assign({ access_key: C.leads.web3formsKey, subject: asunto, from_name: C.compania + ' Roof Estimator' }, datos);
    } else if (C.leads.correo) {
      url = 'https://formsubmit.co/ajax/' + encodeURIComponent(C.leads.correo);
      body = Object.assign({ _subject: asunto, _template: 'table', _captcha: 'false' }, datos);
    } else {
      console.warn('[estimador] No hay a dónde mandar el lead: falta WEB3FORMS_KEY o leads.correo.');
      return;
    }
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .catch((e) => console.error('[estimador] El lead no se envió:', e));
  }

  function medir() { // GA4 y Meta Pixel, si la página los tiene
    try { if (window.gtag) window.gtag('event', 'generate_lead', { form: 'roof_estimator' }); } catch (e) {}
    try { if (window.fbq) window.fbq('track', 'Lead', { content_name: 'Roof Estimator' }); } catch (e) {}
  }

  function pintarResultados(res) {
    $('#estDisplayAddr').textContent = S.address;
    $('#estResultsTitle').textContent = res.length === 1 ? 'Review your estimate' : `Review your ${res.length} estimates`;
    $('#statSqft').textContent = S.roofAreaSqft.toLocaleString('en-US');
    $('#statSquares').textContent = (S.roofAreaSqft / 100).toFixed(1);
    $('#statSlope').textContent = cap(S.slope) || '—';
    if (!S.medido) {
      $('#estStatsSub').textContent = modo === 'mapa'
        ? "We couldn't measure this roof from satellite imagery, so these numbers use an average-size roof. We'll measure it exactly during your free inspection."
        : 'Roof size is estimated from the home size you chose. We measure it exactly during your free inspection.';
    }
    $('#estimatesList').innerHTML = res.map((r) => `
      <div class="estimate-card">
        <div class="img-box" style="background-image:url('${esc(r.m.img)}')"></div>
        <div>
          <h3>${esc(r.m.nombre)}</h3>
          <p class="price">${money(r.low)} - ${money(r.high)} *</p>
          ${r.mLow != null ? `<p class="monthly">${money(r.mLow)} - ${money(r.mHigh)} /mo with financing*</p>` : ''}
          <p class="desc">${esc(r.m.desc)}</p>
          <a href="${esc(C.linkCita)}" class="cta-small">${esc(C.textoBoton)} →</a>
        </div>
      </div>`).join('');
    show('results');
    root.classList.add('results-mode');
    if (modo === 'mapa' && S.lat != null && window.google) {
      setTimeout(() => {
        const m = new google.maps.Map($('#stats-map'), { center: { lat: S.lat, lng: S.lng }, zoom: 20, mapTypeId: 'satellite', tilt: 0, disableDefaultUI: true });
        new google.maps.Marker({ position: { lat: S.lat, lng: S.lng }, map: m });
      }, 150);
    }
  }
})();

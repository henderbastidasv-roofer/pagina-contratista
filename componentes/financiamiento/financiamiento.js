/* Calculadora de financiamiento — componente de pagina-contratista (ConstruIA / Rufero Pro).
 * Configurable: niveles de crédito con su APR,
 * plazos, monto mínimo y máximo y link de precalificación del socio de financiamiento.
 * La configuración llega en window.FINANCIAMIENTO (la escribe build.mjs desde compania/sitio.json).
 * Es solo un estimado: no es una oferta de crédito.
 */
(function () {
  'use strict';
  const C = window.FINANCIAMIENTO || {};
  const root = document.getElementById('financingCalc');
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const cost = $('calc-cost'), credit = $('calc-credit'), term = $('calc-term');
  const min = C.montoMin || 0, max = C.montoMax || Infinity;

  const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const parse = (s) => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;

  function calculate() {
    let principal = parse(cost.value);
    const fuera = principal && (principal < min || principal > max);
    $('calc-range').classList.toggle('warn', !!fuera);
    principal = Math.min(Math.max(principal, 0), max);
    const apr = parseFloat(credit.value) / 100;
    const months = parseInt(term.value, 10);
    const r = apr / 12;
    const monthly = !principal ? 0 : r === 0 ? principal / months : principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const total = monthly * months;
    $('calc-monthly').innerHTML = money(monthly) + ' <span>/ mo.</span>';
    $('calc-apr').textContent = 'Assumed APR: ' + (apr * 100).toFixed(2) + '%';
    $('calc-principal').textContent = money(principal);
    $('calc-interest').textContent = money(Math.max(total - principal, 0));
    $('calc-total').textContent = money(total);
  }

  cost.addEventListener('blur', function () {
    const n = parse(this.value);
    this.value = n > 0 ? '$' + n.toLocaleString('en-US') : '';
    calculate();
  });
  cost.addEventListener('input', calculate);
  credit.addEventListener('change', calculate);
  term.addEventListener('change', calculate);

  // El botón de precalificar abre la página del socio (Hearth, GreenSky, Service Finance, etc.). Se mide como lead.
  const pre = root.querySelector('[data-precalificar]');
  if (pre) pre.addEventListener('click', () => {
    try { if (window.gtag) window.gtag('event', 'generate_lead', { form: 'financing_prequalify' }); } catch (e) {}
    try { if (window.fbq) window.fbq('track', 'Lead', { content_name: 'Financing Pre-Qualify' }); } catch (e) {}
  });
  calculate();
})();

/* pagina-contratista — interacciones del sitio: menú del celular, carruseles, "Read more" y formularios */
(function () {
  // Menu del celular
  const burger = document.querySelector('.burger');
  const mnav = document.getElementById('mnav');
  if (burger && mnav) {
    const toggle = (open) => {
      burger.setAttribute('aria-expanded', open);
      mnav.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    };
    burger.addEventListener('click', () => toggle(burger.getAttribute('aria-expanded') !== 'true'));
    mnav.addEventListener('click', (e) => { if (e.target.closest('a')) toggle(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });
  }

  // Aparecer al hacer scroll
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((ents) => {
    ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -60px 0px' }) : null;
  document.querySelectorAll('.reveal').forEach((el) => io ? io.observe(el) : el.classList.add('in'));

  // Carruseles (resenas y proyectos): flechas + puntos
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const track = root.querySelector('.rev-track, .proj-track');
    const prev = root.querySelector('[data-prev]'), next = root.querySelector('[data-next]');
    const dots = root.querySelector('.dots');
    if (!track) return;
    const step = () => { const c = track.children[0]; return c ? c.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 16) : 300; };
    prev && prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next && next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    if (dots) {
      const pages = () => Math.max(1, Math.round((track.scrollWidth - track.clientWidth) / step()) + 1);
      const draw = () => {
        const n = pages(), cur = Math.min(n - 1, Math.round(track.scrollLeft / step()));
        if (dots.children.length !== n) dots.innerHTML = '<i></i>'.repeat(n);
        [...dots.children].forEach((d, i) => d.classList.toggle('on', i === cur));
      };
      track.addEventListener('scroll', () => requestAnimationFrame(draw), { passive: true });
      addEventListener('resize', draw); draw();
    }
  });

  // Resenas largas: "Read more"
  document.querySelectorAll('.rev blockquote.clamp').forEach((q) => {
    const b = q.nextElementSibling;
    if (!b || !b.classList.contains('more')) return;
    requestAnimationFrame(() => { if (q.scrollHeight <= q.clientHeight + 2) b.hidden = true; });
    b.addEventListener('click', () => {
      const clamped = q.classList.toggle('clamp');
      b.textContent = clamped ? 'Read more' : 'Show less';
    });
  });

  // Videos: si la persona pidió menos movimiento, se quedan quietos; si no, solo corren cuando se ven (ahorra datos)
  const vids = document.querySelectorAll('video[autoplay]');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) vids.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
  else if ('IntersectionObserver' in window) {
    const vo = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) en.target.play().catch(() => {}); else en.target.pause(); }));
    vids.forEach((v) => vo.observe(v));
  }

  // Formulario de contacto: no permitir doble envio
  document.querySelectorAll('form.form').forEach((f) => f.addEventListener('submit', () => {
    const b = f.querySelector('button[type=submit]'); if (b) { b.disabled = true; const s = b.querySelector('span'); if (s) s.textContent = 'Sending…'; }
  }));
})();

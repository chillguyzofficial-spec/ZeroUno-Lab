/* Menù: barra piena (logo a sinistra, voci al centro, Preventivo a destra) che prende il colore della parte di pagina sotto di lei: chiaro → barra chiara e testo scuro, scuro → barra nera e testo chiaro. Scompare scorrendo in giù: lo fa già lo script di ogni pagina. */
(() => {
  'use strict';
  const nav = document.querySelector('.nav'); if (!nav) return;
  const lum = c => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b, a = 1] = m.map(Number); if (a < 0.5) return null; return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  const dietro = () => {
    const x = Math.round(innerWidth / 2), y = 86;
    for (const el of document.elementsFromPoint(x, y)) {
      if (nav.contains(el) || el.closest('.wa-fisso, .cambia-tema, .promo-pop')) continue;
      for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const l = lum(getComputedStyle(e).backgroundColor); if (l !== null) return l; }
    }
    return lum(getComputedStyle(document.body).backgroundColor) ?? 1;
  };
  let att = false;
  const aggiorna = () => { att = false; nav.classList.toggle('nav-sc', dietro() < 0.45); };
  const pianifica = () => { if (!att) { att = true; requestAnimationFrame(aggiorna); } };
  addEventListener('scroll', pianifica, { passive: true }); addEventListener('resize', pianifica);
  new MutationObserver(pianifica).observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] });
  addEventListener('load', pianifica); setTimeout(pianifica, 300); pianifica();
})();

/* voce della pagina in cui sei: in evidenza */
(() => {
  const f = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav .menu-voci a[href]').forEach(a => {
    const h = a.getAttribute('href'); if (h.startsWith('#') || h.includes('#') || h.includes('?')) return;
    if (h.toLowerCase() === f) a.classList.add('att');
  });
})();

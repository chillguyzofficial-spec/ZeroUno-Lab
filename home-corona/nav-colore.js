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

/* Aperture da telefono: la composizione di immagini si rimpicciolisce quanto serve per stare nella prima schermata */
(function () {
  var MQ = matchMedia('(max-width: 899px)');
  var P = [['.ap-hero', '.ap-scena'], ['.mk-r__hero', '.mk-r__hero-visual'], ['.gz-hero', '.gz-scena']];
  function av() {
    var t = document.createElement('div'); t.style.cssText = 'position:fixed;left:0;top:0;height:100svh;width:1px;visibility:hidden;pointer-events:none';
    document.body.appendChild(t); var h = t.getBoundingClientRect().height; t.remove();
    var n = document.querySelector('header.nav'); return h - (n ? n.getBoundingClientRect().height : 52);
  }
  function fit() {
    P.forEach(function (p) {
      var hero = document.querySelector(p[0]), vis = hero && hero.querySelector(p[1]); if (!vis) return;
      vis.style.transform = ''; vis.style.marginBottom = ''; vis.style.transformOrigin = '';
      if (!MQ.matches) return;
      var A = av(), vh = vis.offsetHeight, H = hero.scrollHeight, rest = H - vh, disp = A - rest - 8;
      if (vh > 0 && disp < vh) {
        var s = Math.max(.42, disp / vh);
        vis.style.transformOrigin = '50% 0'; vis.style.transform = 'scale(' + s.toFixed(3) + ')'; vis.style.marginBottom = (-(vh * (1 - s))).toFixed(0) + 'px';
      }
    });
  }
  var t; var go = function () { clearTimeout(t); t = setTimeout(fit, 60); };
  addEventListener('resize', go); addEventListener('orientationchange', go); addEventListener('load', function () { fit(); setTimeout(fit, 500); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  document.addEventListener('DOMContentLoaded', fit);
})();

/* pulsanti fissi (tema e WhatsApp): visibili solo dopo aver lasciato la prima schermata */
(function () {
  var r = document.documentElement;
  function s() { r.classList.toggle('oltre', scrollY > innerHeight * .45); }
  addEventListener('scroll', s, { passive: true }); addEventListener('resize', s); s();
})();

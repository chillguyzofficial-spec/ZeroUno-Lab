/* Menù: barra piena (logo a sinistra, voci al centro, Preventivo a destra) che prende il colore della parte di pagina sotto di lei: chiaro → barra chiara e testo scuro, scuro → barra nera e testo chiaro. Scompare scorrendo in giù: lo fa già lo script di ogni pagina. */
(() => {
  'use strict';
  const nav = document.querySelector('.nav'); if (!nav) return;
  const lum = c => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b, a = 1] = m.map(Number); if (a < 0.5) return null; return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  const dietro = () => {
    const x = Math.round(innerWidth / 2), y = 86;
    /* apertura della home: la scena nera copre tutto lo schermo, la barra resta scura anche mentre si scorre veloce */
    const sc = document.querySelector('.ap01-scena, .ap01 .ap-scena');
    if (sc) { const r = sc.getBoundingClientRect(); if (r.top <= y && r.bottom >= y) { const l = lum(getComputedStyle(sc).backgroundColor); if (l !== null) return l; } }
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
  var P = [['.ap-hero', '.ap-scena', .9], ['.mk-r__hero', '.mk-r__hero-visual', .42], ['.gz-hero', '.gz-scena', .42]];   // il terzo valore è la scala minima: la scena App resta grande, anche se scende un po' sotto il bordo
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
        var s = Math.max(p[2] || .42, disp / vh);
        vis.style.transformOrigin = '50% 0'; vis.style.transform = 'scale(' + s.toFixed(3) + ')'; vis.style.marginBottom = (-(vh * (1 - s))).toFixed(0) + 'px';
      }
    });
  }
  /* la composizione resta nascosta finché la misura non è definitiva (font e pagina caricati): niente salti di grandezza visibili */
  var root = document.documentElement, pronta = false;
  function mostra() { if (pronta) return; pronta = true; fit(); requestAnimationFrame(function () { root.classList.remove('fit-attesa'); }); }
  if (MQ.matches && document.querySelector('.ap-scena, .gz-scena, .mk-r__hero-visual')) root.classList.add('fit-attesa');
  /* la grandezza si ricalcola solo se cambia la larghezza (ruotando il telefono): la barra degli indirizzi che si ritira scorrendo cambia solo l'altezza e non deve far crescere la scena */
  var larg = innerWidth;
  var t; var go = function () { if (Math.abs(innerWidth - larg) < 2) return; larg = innerWidth; clearTimeout(t); t = setTimeout(fit, 60); };
  addEventListener('resize', go); addEventListener('orientationchange', function () { larg = -1; go(); });
  var caricata = document.readyState === 'complete' ? Promise.resolve() : new Promise(function (r) { addEventListener('load', r); });
  var fontPronti = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  function decodificate() {
    var imgs = document.querySelectorAll('.ap-scena img, .gz-scena img, .mk-r__hero-visual img');
    var tutte = Array.prototype.map.call(imgs, function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); });
    return Promise.race([Promise.all(tutte), new Promise(function (r) { setTimeout(r, 1200); })]);
  }
  Promise.all([caricata, fontPronti]).then(function () { fit(); return decodificate(); }).then(function () { mostra(); setTimeout(fit, 500); });
  setTimeout(mostra, 1800);   /* sicurezza: se qualcosa tarda, si mostra comunque */
  document.addEventListener('DOMContentLoaded', fit);
})();

/* pulsanti fissi (tema e WhatsApp): visibili solo dopo aver lasciato la prima schermata */
(function () {
  var r = document.documentElement;
  function s() { r.classList.toggle('oltre', scrollY > innerHeight * .45); }
  addEventListener('scroll', s, { passive: true }); addEventListener('resize', s); s();
})();

/* animazioni infinite in pausa quando l'apertura (o la fascia che scorre) è fuori dallo schermo */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('fuori', !e.isIntersecting); }); }, { rootMargin: '80px' });
  ['.hv-open', '.sc-intro', '.ap-hero', '.gz-hero', '.sv-hero', '.apertura', '.mk-r__hero', '.lavori', '.hv-marq', '.sv-strip', '.ap-nastro'].forEach(function (s) { document.querySelectorAll(s).forEach(function (el) { io.observe(el); }); });
})();

/* ── Comparse allo scorrimento (tutto il sito): i blocchi sotto la prima schermata salgono piano quando entrano in vista.
   Solo opacità + piccolo spostamento, una volta sola, niente sfocature; spente con «riduci movimento».
   Non tocca ciò che ha già la sua entrata ([data-in]), la prima apertura, il piè di pagina, finestre e carosello. ── */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var VH = innerHeight, tutti = [];
  var ESCLUDI = '[data-in],[data-in] *,dialog,dialog *,.piede,.piede *,.ponte,.mk-r__raccordo,.menu,.nav,header.barra,#apertura,#apertura *,.ap01-scena,.ap-scena,.car-vista,.carosello,.gz-live,.gz-live *,.wa-fisso,.cambia-tema,[hidden]';
  function candidato(el) {
    if (!el || el.nodeType !== 1 || el.matches(ESCLUDI)) return false;
    var r = el.getBoundingClientRect();
    return r.height > 20 && r.top > VH * 0.9; /* solo ciò che parte fuori schermo */
  }
  function figli(box) {
    var out = [], k = box.children;
    for (var i = 0; i < k.length; i++) {
      var c = k[i], cs = getComputedStyle(c), n = c.children.length;
      if (/^(SCRIPT|STYLE|SVG|BR)$/i.test(c.tagName) || cs.position === 'fixed' || cs.position === 'absolute' || cs.display === 'none') continue;
      /* griglie e righe di schede/elenchi: si animano i singoli elementi, a cascata */
      if ((cs.display === 'grid' || cs.display === 'flex' || /^(UL|OL)$/.test(c.tagName)) && n >= 2 && n <= 12 && !c.matches('[class*="carosello"],[class*="-vista"],[class*="-binario"]')) out.push({ el: c, kids: true });
      else out.push({ el: c, kids: false });
    }
    return out;
  }
  function marca(el, d) { if (!candidato(el)) return; el.classList.add('rv-p'); el.style.setProperty('--rv-d', d + 'ms'); tutti.push(el); }
  var sezioni = document.querySelectorAll('main > section, main > div > section, body > section');
  Array.prototype.forEach.call(sezioni, function (s) {
    if (s.matches(ESCLUDI)) return;
    var box = s.querySelector(':scope > [class*="-in"], :scope > .sz-in, :scope > div') || s;
    figli(box).forEach(function (f) {
      if (f.kids) { Array.prototype.forEach.call(f.el.children, function (k, i) { marca(k, Math.min(i, 6) * 80); }); }
      else marca(f.el, 0);
    });
  });
  if (!tutti.length) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = e.target; io.unobserve(t);
      t.classList.remove('rv-p'); t.classList.add('rv-in');
      setTimeout(function () { t.classList.remove('rv-in'); t.style.removeProperty('--rv-d'); }, 1200);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  tutti.forEach(function (el) { io.observe(el); });
  /* rete di sicurezza: se per qualunque motivo qualcosa resta nascosto, dopo 6 secondi dalla comparsa del documento viene mostrato quando è in vista */
  addEventListener('hashchange', function () { tutti.forEach(function (el) { el.classList.remove('rv-p'); }); });
})();

/* menu da telefono: «Servizi» si espande e si richiude con un tocco */
(function () {
  document.querySelectorAll('.voce-sotto').forEach(function (v) {
    var t = v.querySelector('.voce-sotto-t'); if (!t) return;
    t.setAttribute('aria-expanded', 'false');
    t.addEventListener('click', function (e) {
      if (!matchMedia('(max-width: 899px)').matches) return;
      e.preventDefault();
      var a = v.classList.toggle('aperto'); t.setAttribute('aria-expanded', a ? 'true' : 'false');
    });
  });
})();

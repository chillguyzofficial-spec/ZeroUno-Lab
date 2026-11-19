/* Landing · quattro fogli: si tira l'angolo in alto a destra verso il basso, il foglio scivola via e sotto compare un altro colore.
   Mentre si tira l'angolo si solleva (piega più grande). Pallini in basso per scegliere il colore; tastiera: Invio sul bordo del foglio. */
(function () {
  var pila = document.getElementById('lppila');
  if (!pila) return;
  var primo = pila.querySelector('.lp-foglio');
  if (!primo) return;
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fogli = [primo];
  for (var k = 1; k < 4; k++) {
    var c = primo.cloneNode(true);
    c.classList.remove('lp-c0'); c.classList.add('lp-c' + k);
    var h1 = c.querySelector('h1');
    if (h1) { var d = document.createElement('div'); d.className = 'lp-h1'; d.innerHTML = h1.innerHTML; h1.parentNode.replaceChild(d, h1); }
    var ids = c.querySelectorAll('[id]'); for (var j = 0; j < ids.length; j++) ids[j].removeAttribute('id');
    var img = c.querySelector('img'); if (img) { img.removeAttribute('fetchpriority'); img.setAttribute('loading', 'lazy'); img.alt = ''; }
    pila.insertBefore(c, pila.querySelector('.lp-maniglia'));
    fogli.push(c);
  }
  /* a ogni foglio il suo esempio di landing (PC e telefono), come immagini dedicate */
  var NOMI = ['01-bianco', '02-viola', '03-nero', '04-lavanda'];
  var ALT = ['Esempio di landing page per uno studio di architettura', 'Esempio di landing page per un jazz club', 'Esempio di landing page per un atelier di sartoria', 'Esempio di landing page per un marchio di skincare'];
  fogli.forEach(function (f, i) {
    var vecchio = f.querySelector('.lp-esempio'); if (vecchio) vecchio.remove();
    var pic = document.createElement('picture'); pic.className = 'lp-esempio'; pic.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    var s = document.createElement('source'); s.media = '(max-width:760px)'; s.srcset = '../assets/img/landing/esempio-' + NOMI[i] + '-mobile.webp?v=20261119';
    var im = document.createElement('img'); im.src = '../assets/img/landing/esempio-' + NOMI[i] + '-pc.webp?v=20261119'; im.alt = i === 0 ? ALT[i] : ''; im.width = 1100; im.height = 1000; im.decoding = 'async'; 
    pic.append(s, im); f.insertBefore(pic, f.firstChild);
  });
  var colori = pila.querySelectorAll('.lp-colori button');
  var ordine = fogli.slice(); /* ordine[0] = foglio in cima */
  function colore(f) { return getComputedStyle(f).getPropertyValue('--t'); }
  function applica() {
    ordine.forEach(function (f, i) {
      f.style.zIndex = String(20 - i);
      f.classList.toggle('lp-sotto-pila', i > 0);
      if (i === 0) { f.removeAttribute('inert'); } else { f.setAttribute('inert', ''); }
      f.style.setProperty('--nf', colore(ordine[(i + 1) % ordine.length]));
      f.style.setProperty('--pg', '');
    });
    var attivo = fogli.indexOf(ordine[0]);
    Array.prototype.forEach.call(colori, function (b, i) { b.setAttribute('aria-pressed', String(i === attivo)); });
    /* solo il foglio con l'h1 vero resta nell'albero di accessibilità; gli altri sono copie */
    fogli.forEach(function (f, i) { if (i === 0) f.removeAttribute('aria-hidden'); else f.setAttribute('aria-hidden', 'true'); });
  }
  function porta(top, partenza) {
    var H = pila.offsetHeight;
    pila.classList.add('lp-usata');
    if (RM) { ordine.push(ordine.shift()); top.style.transform = ''; applica(); return; }
    var fine = function () {
      top.removeEventListener('transitionend', fine);
      top.style.transition = 'none';
      ordine.push(ordine.shift());
      top.style.transform = '';
      applica();
      void top.offsetWidth;
      top.style.transition = '';
    };
    top.classList.remove('lp-trascina');
    top.style.setProperty('--pg', '84px');
    top.style.transform = 'translate(' + (partenza && partenza.x ? partenza.x : 40) + 'px,' + Math.round(H * 1.15) + 'px) rotate(' + (partenza && partenza.r ? partenza.r : 7) + 'deg)';
    top.addEventListener('transitionend', fine);
    setTimeout(function () { if (top === ordine[0] && top.style.transform) fine(); }, 800);
  }
  function vaiA(n) {
    var guard = 0;
    while (fogli.indexOf(ordine[0]) !== n && guard++ < 4) { ordine.push(ordine.shift()); }
    applica();
    pila.classList.add('lp-usata');
  }
  applica();

  var st = null;
  pila.addEventListener('pointerdown', function (e) {
    var m = e.target.closest && e.target.closest('.lp-maniglia'); if (!m) return;
    var f = ordine[0];
    st = { f: f, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, t0: performance.now(), m: m, id: e.pointerId };
    f.classList.add('lp-trascina'); pila.classList.add('lp-usata');
    try { m.setPointerCapture(e.pointerId); } catch (x) {}
    e.preventDefault();
  });
  pila.addEventListener('pointermove', function (e) {
    if (!st) return;
    st.dx = e.clientX - st.x0; st.dy = Math.max(0, e.clientY - st.y0);
    var W = pila.offsetWidth, H = pila.offsetHeight;
    var rot = Math.max(-3, Math.min(9, st.dy / H * 7 - st.dx / W * 10));
    var pg = Math.min(260, 84 + st.dy * 0.35); /* l'angolo si solleva mentre lo tiri */
    st.f.style.setProperty('--pg', pg + 'px');
    st.f.style.transform = 'translate(' + (st.dx * 0.55) + 'px,' + st.dy + 'px) rotate(' + rot + 'deg)';
  });
  function fine() {
    if (!st) return;
    var f = st.f, H = pila.offsetHeight, dt = performance.now() - st.t0, v = st.dy / Math.max(dt, 1);
    var fatto = st.dy > H * 0.2 || (v > 0.9 && st.dy > 40);
    var dx = st.dx; st = null;
    f.classList.remove('lp-trascina');
    if (fatto) porta(f, { x: dx * 0.55, r: 8 }); else { f.style.transform = ''; f.style.setProperty('--pg', ''); }
  }
  pila.addEventListener('pointerup', fine);
  pila.addEventListener('pointercancel', fine);
  pila.addEventListener('click', function (e) {
    var m = e.target.closest && e.target.closest('.lp-maniglia');
    if (m && e.detail === 0) { porta(ordine[0]); return; } /* tastiera */
    var b = e.target.closest && e.target.closest('.lp-colori button');
    if (b) vaiA(+b.dataset.c);
  });
  /* suggerimento sulla piega: compare dopo 5 s solo se nessuno l'ha ancora usata */
  setTimeout(function () { if (!pila.classList.contains('lp-usata')) pila.classList.add('lp-suggerisci'); }, 5000);
})();

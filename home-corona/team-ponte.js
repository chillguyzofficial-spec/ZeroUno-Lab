/* Team · telefono: la linea dell'etichetta «Marketing» parte dal bordo destro del blocco viola della foto.
   Il punto è misurato sulla foto (ponte-mobile.webp, 1024×1536: bordo destro del blocco a x=634, y=605); qui si converte nella posizione reale (object-fit: cover).
   La foto è ingrandita (Z) con il centro proprio su quel punto: il blocco e la linea restano fermi, a ingrandirsi è il resto, così non restano fasce nere sopra e sotto. */
(function () {
  var mk = document.querySelector('.tm-et-mk'), sc = document.querySelector('.tm-ponte-scena');
  if (!mk || !sc) return;
  var img = sc.querySelector('img');
  var mq = matchMedia('(max-width: 899px)');
  var IW = 1024, IH = 1536, PX = 634, PY = 605, POSY = 0.52, GAP = 30, Z = 1.45;
  function metti() {
    if (!mq.matches) {
      ['left', 'top', 'right', 'bottom'].forEach(function (p) { mk.style.removeProperty(p); });
      if (img) { img.style.removeProperty('transform'); img.style.removeProperty('transform-origin'); }
      return;
    }
    var r = sc.getBoundingClientRect(), w = r.width, h = r.height; if (!w || !h) return;
    var s = Math.max(w / IW, h / IH), iw = IW * s, ih = IH * s;
    var x = (w - iw) * 0.5 + PX * s, y = (h - ih) * POSY + PY * s;
    if (img) { img.style.setProperty('transform-origin', Math.round(x) + 'px ' + Math.round(y) + 'px'); img.style.setProperty('transform', 'scale(' + Z + ')'); }
    var bh = mk.offsetHeight || 54;
    mk.style.setProperty('left', Math.round(x + GAP) + 'px', 'important');
    mk.style.setProperty('right', 'auto', 'important');
    mk.style.setProperty('bottom', 'auto', 'important');
    var bb = mk.querySelector('b'), fs = 24; if (bb) { bb.style.setProperty('font-size', fs + 'px', 'important'); while (fs > 15 && bb.getBoundingClientRect().right > w - 12) { fs -= 1; bb.style.setProperty('font-size', fs + 'px', 'important'); } }
    bh = mk.offsetHeight || bh;
    mk.style.setProperty('top', Math.round(y - bh * 0.5 + 4) + 'px', 'important');
  }
  metti();
  addEventListener('resize', metti);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(metti);
  if (mq.addEventListener) mq.addEventListener('change', metti);
})();

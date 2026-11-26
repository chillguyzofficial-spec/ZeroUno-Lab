/* Landing · «Come è fatta»: il telefono mostra un sito nostro vero (Hedoné) che scorre alla parte scelta. Le immagini si caricano solo quando servono. */
(function () {
  var tel = document.querySelector('.sv-tel');
  var nastro = document.getElementById('svtel');
  if (!tel || !nastro) return;
  var sch = tel.querySelector('.sv-tel-sch');
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* parte → [blocco immagine, posizione (px CSS dal capo della pagina intera)] */
  var PUNTI = { 1: [1, 0], 2: [1, 330], 3: [4, 7230], 4: [2, 2640], 5: [4, 8330], 6: [5, 9700] };
  var vistoPrima = false;
  function carica(n) {
    var im = nastro.querySelector('img[data-n="' + n + '"]');
    if (im && !im.getAttribute('src')) im.src = im.dataset.src;
  }
  function vai(k, subito) {
    var p = PUNTI[k] || PUNTI[1];
    carica(p[0]);
    var s = sch.clientWidth / 390; /* le immagini sono larghe 390 px CSS (1170 reali) */
    nastro.style.setProperty('--sc', s);
    if (subito || RM) nastro.style.transition = 'none'; else nastro.style.transition = '';
    nastro.style.transform = 'translateY(' + (-p[1] * s) + 'px) scale(' + s + ')';
    if (subito) { void nastro.offsetWidth; nastro.style.transition = ''; }
  }
  var corrente = '1';
  new MutationObserver(function () { corrente = tel.dataset.wf; vai(corrente, false); }).observe(tel, { attributes: true, attributeFilter: ['data-wf'] });
  addEventListener('resize', function () { vai(corrente, true); });
  /* carica la prima immagine quando la sezione sta per entrare in vista */
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es, io) { if (es[0].isIntersecting) { vai(corrente, true); io.disconnect(); } }, { rootMargin: '600px' }).observe(tel);
  else vai(corrente, true);
})();

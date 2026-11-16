/* Negozio online: scena a video (vasetto Michelangelo che si smonta) comandata dallo scorrimento.
   Un solo elemento <video> in pausa: si cambia currentTime in base allo scorrimento (come le pagine prodotto Apple).
   Niente immagini che si accendono e spengono, quindi niente lampeggi. Versione da PC e da telefono scelte in base alla larghezza.
   Con «riduci movimento» o se il video non parte resta il fotogramma di partenza fermo. */
(function () {
  'use strict';
  var sc = document.getElementById('scena-negozio');
  if (!sc) return;
  var v = sc.querySelector('.sc-video');
  var guida = sc.querySelector('.sc-guida');
  var dopo = sc.nextElementSibling;
  var riduci = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var debug = /[?&]debug=1/.test(location.search), box = null;
  function nota(t) {
    if (!debug) return;
    if (!box) { box = document.createElement('div'); box.style.cssText = 'position:fixed;left:12px;top:70px;z-index:99;background:#000;color:#0f0;font:12px/1.4 monospace;padding:8px 10px;border-radius:6px;max-width:360px'; document.body.appendChild(box); }
    box.textContent = t;
  }
  if (!v || riduci) { nota('SCENA FERMA: riduci movimento = ' + riduci + ', video = ' + !!v); sc.classList.add('sc-statica'); return; }
  setTimeout(function () { nota('dopo 3s: readyState=' + v.readyState + ' errore=' + (v.error ? v.error.code + ' ' + v.error.message : 'nessuno') + ' src=' + v.currentSrc.slice(-28) + ' pronto=' + pronto); }, 3000);

  var FINE = 0.84;            // il video va dalla scatola al vasetto nudo (84% della durata); poi arriva la pagina
  var verticale = false, pronto = false, occupato = false, target = 0, corrente = 0, attivo = false;
  var posterPc = v.getAttribute('poster');

  function stretto() { return window.innerWidth < 900; }

  function carica() {
    verticale = stretto();
    pronto = false;
    v.setAttribute('poster', verticale ? v.getAttribute('data-poster-mob') : posterPc);
    v.src = verticale ? v.getAttribute('data-mob') : v.getAttribute('data-pc');
    v.load();
  }
  v.addEventListener('loadeddata', function () { pronto = true; sc.classList.add('sc-pronta'); richiedi(); });
  // Riserva: se il browser non riesce a decodificare il video (succede con alcuni decodificatori hardware), la scena
  // passa a quattro immagini che si dissolvono scorrendo (scatola, vasetto chiuso, crema, vasetto nudo).
  var inRiserva = false;
  function riserva(motivo) {
    if (inRiserva) return;
    inRiserva = true; pronto = false;
    nota('RISERVA a immagini (' + motivo + ')');
    var palco = sc.querySelector('.sc-palco'), imgs = [];
    v.style.display = 'none';
    [1, 2, 3, 4].forEach(function (k) {
      var p = document.createElement('picture'); p.className = 'sc-qq';
      p.innerHTML = '<source media="(max-width: 899px)" srcset="../assets/img/scena-negozio-4/mob-' + k + '.webp?v=20261114g"><img src="../assets/img/scena-negozio-4/pc-' + k + '.webp?v=20261114g" alt="" decoding="async">';
      p.style.opacity = k === 1 ? '1' : '0';
      palco.insertBefore(p, v); imgs.push(p);
    });
    sc.classList.add('sc-riserva');
    var attR = false;
    function ag() {
      attR = false;
      var f = progresso() * 3;
      imgs.forEach(function (p, k) {
        var o = 1 - Math.abs(f - k) * 1.6; o = o < 0 ? 0 : o > 1 ? 1 : o;
        p.style.opacity = String(o);
      });
      if (guida) guida.style.opacity = String(Math.max(0, 1 - progresso() / 0.05));
      pagina();
    }
    function rq() { if (!attR) { attR = true; requestAnimationFrame(ag); } }
    window.addEventListener('scroll', rq, { passive: true });
    window.addEventListener('resize', rq);
    rq();
  }
  v.addEventListener('error', function () { nota('ERRORE VIDEO ' + (v.error ? v.error.code + ' ' + v.error.message : '')); riserva('errore video'); });
  setTimeout(function () { if (!pronto && !inRiserva) riserva('il video non si carica'); }, 6000);
  v.addEventListener('seeked', function () { occupato = false; richiedi(); });

  function progresso() {
    var r = sc.getBoundingClientRect(), tot = r.height - window.innerHeight;
    if (tot <= 0) return 0;
    var p = -r.top / tot;
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  function pagina() {
    if (!dopo) return;
    var r = dopo.getBoundingClientRect(), vh = window.innerHeight;
    var q = 1 - (r.top - vh * 0.05) / (vh * 0.5);
    dopo.style.setProperty('--sc-q', (q < 0 ? 0 : q > 1 ? 1 : q).toFixed(2));
  }

  function ciclo() {
    attivo = false;
    target = progresso();
    corrente += (target - corrente) * 0.35;                // piccola inerzia: niente scatti della rotellina
    if (Math.abs(target - corrente) < 0.0006) corrente = target;
    if (pronto && !occupato && v.duration) {
      var t = Math.min(v.duration - 0.05, corrente * FINE * v.duration);
      if (Math.abs(t - v.currentTime) > 0.012) { occupato = true; v.currentTime = t; }
    }
    pagina();
    if (guida) guida.style.opacity = String(Math.max(0, 1 - target / 0.05));
    if (Math.abs(target - corrente) > 0.0006 || occupato) richiedi();
  }

  function richiedi() { if (!attivo) { attivo = true; requestAnimationFrame(ciclo); } }

  window.addEventListener('scroll', richiedi, { passive: true });
  window.addEventListener('resize', function () { if (stretto() !== verticale) { corrente = progresso(); carica(); } richiedi(); });
  corrente = progresso();
  carica();
})();

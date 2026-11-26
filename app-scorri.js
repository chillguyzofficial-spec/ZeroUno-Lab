/* App · «Due app, fatte da noi»: le due file di schermate scorrono sempre in loop (come prima) ma si possono anche trascinare con dito o mouse.
   Il loop è un'animazione del browser (Web Animations, gira sulla scheda grafica come l'animazione CSS di prima): lo script interviene solo durante il gesto.
   Al rilascio la fila prosegue con l'inerzia del gesto e poi torna dolcemente alla velocità di partenza. Con «riduci movimento» resta la fila scorrevole a mano. */
(function () {
  var bande = document.querySelectorAll('.ap-banda');
  if (!bande.length || matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate) return;
  var SEC = { 'ap-sx': 55, 'ap-dx': 60 };            // secondi per mezzo nastro (come prima)
  var OFFSET = 1e7;                                  // si parte lontano da zero: così anche la corsa all'indietro resta sempre attiva
  var righe = [];

  bande.forEach(function (banda) {
    var nastro = banda.querySelector('.ap-nastro'); if (!nastro) return;
    var dx = nastro.classList.contains('ap-dx'), D = (SEC[dx ? 'ap-dx' : 'ap-sx']) * 1000;
    nastro.classList.add('ap-js');
    banda.classList.add('ap-trascina-ok');
    var anim = nastro.animate(
      dx ? [{ transform: 'translateX(-50%)' }, { transform: 'translateX(0)' }] : [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
      { duration: D, iterations: Infinity, easing: 'linear' });
    anim.currentTime = OFFSET + (dx ? D * 0.5 : 0);
    var r = { banda: banda, nastro: nastro, anim: anim, D: D, dir: dx ? 1 : -1, rate: 1, drag: null, half: 0 };
    righe.push(r);

    banda.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      r.half = nastro.scrollWidth / 2 || 1;
      r.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: r.anim.currentTime, mosso: false, campioni: [[performance.now(), e.clientX]] };
    });
    banda.addEventListener('pointermove', function (e) {
      var d = r.drag; if (!d || e.pointerId !== d.id) return;
      var mx = e.clientX - d.x0;
      if (!d.mosso) {
        if (Math.abs(mx) < 6 || Math.abs(mx) < Math.abs(e.clientY - d.y0)) return;   // gesto verticale: lo lascio alla pagina
        d.mosso = true; r.anim.pause(); try { banda.setPointerCapture(e.pointerId); } catch (x) {}
        banda.classList.add('ap-afferrata');
      }
      // spostare la fila di mx pixel = cambiare il tempo dell'animazione di mx / mezzo-nastro * durata (nel verso giusto)
      r.anim.currentTime = d.t0 + (r.dir * mx / r.half) * r.D;
      var t = performance.now(); d.campioni.push([t, e.clientX]);
      while (d.campioni.length > 2 && t - d.campioni[0][0] > 90) d.campioni.shift();
    });
    function fine(e) {
      var d = r.drag; if (!d || e.pointerId !== d.id) return;
      r.drag = null; banda.classList.remove('ap-afferrata');
      try { banda.releasePointerCapture(e.pointerId); } catch (x) {}
      if (!d.mosso) return;
      var c = d.campioni, a = c[0], b = c[c.length - 1], dt = (b[0] - a[0]) / 1000;
      var v = dt > 0.01 ? (b[1] - a[1]) / dt : 0;             // px/s del gesto
      v = Math.max(-1800, Math.min(1800, v));
      var base = r.dir * r.half / (r.D / 1000);             // px/s della velocità normale (con segno)
      r.rate = base ? v / base : 1;                         // inerzia espressa come multiplo della velocità normale
      r.anim.playbackRate = r.rate; r.anim.play();
    }
    banda.addEventListener('pointerup', fine);
    banda.addEventListener('pointercancel', fine);
    banda.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  // rientro morbido alla velocità normale (poche correzioni al secondo: il movimento vero lo fa la scheda grafica)
  var ultimo = 0;
  setInterval(function () {
    var t = performance.now(), dt = ultimo ? (t - ultimo) / 1000 : 0.05; ultimo = t;
    righe.forEach(function (r) {
      if (r.drag || r.anim.playState === 'paused') return;
      if (Math.abs(r.rate - 1) < 0.01) { if (r.rate !== 1) { r.rate = 1; r.anim.playbackRate = 1; } return; }
      r.rate += (1 - r.rate) * (1 - Math.exp(-dt / 0.9));
      r.anim.playbackRate = r.rate;
    });
  }, 50);
})();

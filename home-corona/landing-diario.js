/* Landing · apertura a diario: la piega in alto a destra gira la sola pagina destra (si trascina verso il basso, oppure clic/Invio).
   Geometria: la piega porta l'angolo C=(W,0) nel punto P; la linea di piega è l'asse del segmento CP. Resta visibile la parte del foglio dal lato di P,
   il lembo (retro della carta) è il riflesso della parte staccata. Nessun movimento da solo: tutto segue il gesto. Con «riduci movimento» il cambio è immediato. */
(function () {
  var plate = document.getElementById('dzplate');
  if (!plate) return;
  var fogli = Array.prototype.slice.call(plate.querySelectorAll('.dz-sheet'));
  var flap = plate.querySelector('.dz-flap');
  var corner = plate.querySelector('.dz-corner');
  var stato = document.getElementById('dzstato');
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ordine = fogli.slice();            // ordine[0] = foglio in cima
  var W = 0, H = 0, anim = 0, drag = null, usata = false;

  function misura() { var r = plate.getBoundingClientRect(); W = r.width; H = r.height; }
  function impila() {
    ordine.forEach(function (f, i) { f.style.zIndex = String(fogli.length - i); f.classList.toggle('dz-nascosto', i > 1); f.setAttribute('aria-hidden', i === 0 ? 'false' : 'true'); f.style.clipPath = ''; });
    flap.style.clipPath = 'polygon(0 0,0 0,0 0)';
    var cap = ordine[0].querySelector('figcaption');
    if (stato && cap) stato.textContent = cap.textContent + ' (' + (fogli.indexOf(ordine[0]) + 1) + ' di ' + fogli.length + ')';
  }
  function taglia(poly, mx, my, nx, ny, tieniPos) {   // tiene i punti con (X-M)·n >= 0 (o <= 0)
    var out = [], n = poly.length, s = tieniPos ? 1 : -1;
    function d(p) { return s * ((p[0] - mx) * nx + (p[1] - my) * ny); }
    for (var i = 0; i < n; i++) {
      var a = poly[i], b = poly[(i + 1) % n], da = d(a), db = d(b);
      if (da >= 0) out.push(a);
      if ((da >= 0) !== (db >= 0)) { var t = da / (da - db); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  function pts(poly) { return poly.length < 3 ? 'polygon(0 0,0 0,0 0)' : 'polygon(' + poly.map(function (p) { return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; }).join(',') + ')'; }
  function disegna(px, py) {
    var top = ordine[0], cx = W, cy = 0, dx = px - cx, dy = py - cy, L = Math.sqrt(dx * dx + dy * dy);
    if (L < 1) { top.style.clipPath = ''; flap.style.clipPath = 'polygon(0 0,0 0,0 0)'; return; }
    var nx = dx / L, ny = dy / L, mx = (cx + px) / 2, my = (cy + py) / 2;
    var rect = [[0, 0], [W, 0], [W, H], [0, H]];
    var resta = taglia(rect, mx, my, nx, ny, true), via = taglia(rect, mx, my, nx, ny, false);
    top.style.clipPath = pts(resta);
    var rifl = via.map(function (p) { var k = 2 * ((p[0] - mx) * nx + (p[1] - my) * ny); return [p[0] - k * nx, p[1] - k * ny]; });
    var f = rifl;   // il lembo resta dentro il foglio
    f = taglia(f, 0, 0, 1, 0, true); f = taglia(f, 0, 0, 0, 1, true); f = taglia(f, W, 0, -1, 0, true); f = taglia(f, 0, H, 0, -1, true);
    flap.style.clipPath = pts(f);
  }
  function anima(da, a, ms, fine, dolce) {
    cancelAnimationFrame(anim);
    if (RM) { disegna(a[0], a[1]); if (fine) fine(); return; }
    var t0 = performance.now();
    (function passo(t) {
      var k = Math.min(1, (t - t0) / ms), e = dolce ? (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2) : 1 - Math.pow(1 - k, 3);
      disegna(da[0] + (a[0] - da[0]) * e, da[1] + (a[1] - da[1]) * e);
      if (k < 1) anim = requestAnimationFrame(passo); else if (fine) fine();
    })(t0);
  }
  var RIPOSO = function () { var r = W < 600 ? 46 : 66; return [W - r, r]; };
  function segna() { if (usata) return; usata = true; plate.classList.add('dz-usata'); }
  function completa(da) {
    segna(); misura();
    anima(da, [-W * 0.99, 0], 700, function () {
      ordine.push(ordine.shift()); impila(); misura(); disegna.apply(null, RIPOSO());
    }, true);   // la piega arriva fino all'incavo e si restringe fino a sparire: la pagina nuova è già al suo posto, senza scatti
  }
  function torna(da) { anima(da, RIPOSO(), 260, null); }

  var ultimo = RIPOSO();
  corner.addEventListener('pointerdown', function (e) {
    misura(); cancelAnimationFrame(anim);
    drag = { id: e.pointerId, mosso: false, x0: e.clientX, y0: e.clientY };
    try { corner.setPointerCapture(e.pointerId); } catch (x) {}
    segna(); e.preventDefault();
  });
  corner.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.mosso && Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) < 6) return;
    drag.mosso = true;
    var r = plate.getBoundingClientRect();
    var px = Math.max(0, Math.min(W, e.clientX - r.left)), py = Math.max(0, Math.min(H, e.clientY - r.top));
    var dx = px - W, dy = py, L = Math.sqrt(dx * dx + dy * dy), min = (W < 600 ? 46 : 66) * 1.42;
    if (L < min) { var k = min / (L || 1); if (L < 1) { dx = -1; dy = 1; L = 1.42; k = min / L; } px = W + dx * k; py = dy * k; }
    ultimo = [px, py]; disegna(px, py);
  });
  function rilascia(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var mosso = drag.mosso; drag = null;
    try { corner.releasePointerCapture(e.pointerId); } catch (x) {}
    if (!mosso) { completa(RIPOSO()); return; }                        // un tocco: gira la pagina
    var L = Math.sqrt(Math.pow(ultimo[0] - W, 2) + Math.pow(ultimo[1], 2)), diag = Math.sqrt(W * W + H * H);
    if (L > diag * 0.38) completa(ultimo); else torna(ultimo);
  }
  corner.addEventListener('pointerup', rilascia);
  corner.addEventListener('pointercancel', function (e) { if (drag && e.pointerId === drag.id) { drag = null; torna(ultimo); } });
  corner.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); misura(); completa(RIPOSO()); } });

  function avvia() { misura(); impila(); disegna.apply(null, RIPOSO()); }
  avvia();
  addEventListener('resize', function () { if (!drag) avvia(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!drag) avvia(); });
  /* suggerimento piccolo: compare dopo 1,2 s solo se la piega non è stata usata */
  setTimeout(function () { if (!usata) plate.classList.add('dz-suggerisci'); }, 0);
})();

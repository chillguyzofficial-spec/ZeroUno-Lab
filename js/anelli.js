/* Anelli di 0 e 1 che ruotano (sfondo dell'apertura, 11/11).
   Riproduce la grafica approvata «17 · Binario orbitale» di Codex: la forma resta quella, le cifre scorrono lungo gli anelli.
   PC = archi concentrici attorno a un «buco» fuori schermo; telefono = due nastri ondulati.
   Leggero: cifre pre-disegnate (sprite), 30 fps (24 sul telefono), si ferma fuori dallo schermo e a scheda nascosta.
   Con «riduci movimento» non parte: resta l'immagine ferma. */
(() => {
  const scena = document.querySelector('.ap-scena');
  if (!scena) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas');
  cv.className = 'anelli';
  cv.setAttribute('aria-hidden', 'true');
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  scena.insertBefore(cv, scena.firstChild);

  const TINTE = [[206, 182, 255], [255, 255, 255], [170, 128, 250]]; // lavanda, bianco, viola
  const LIVELLI = 5;
  let conta = 0, fermoPerSempre = false, T, metà, mobile, RW, RH, scala, dpr, sprite = {}, anelli = [], nastri = null, vivo = false, inVista = true, ultimo = 0;

  const hash = (a, b) => { let x = (a * 374761393 + b * 668265263) | 0; x = (x ^ (x >> 13)) * 1274126177 | 0; return (x ^ (x >> 16)) >>> 0; };
  const ALFA = [0.7, 0.84, 0.94, 1];
  const spr = (cifra, tinta, liv, al) => {
    const aq = al >= 0.95 ? 3 : al >= 0.8 ? 2 : al >= 0.6 ? 1 : 0;
    const k = cifra + '|' + tinta + '|' + liv + '|' + aq;
    let s = sprite[k];
    if (s) return s;
    const px = Math.max(6, (6.5 + liv * 1.6) * scala * dpr);
    const c = document.createElement('canvas');
    const d = Math.ceil(px * 1.3);
    c.width = d; c.height = d;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(' + TINTE[tinta].join(',') + ',' + ALFA[aq] + ')';
    g.font = '500 ' + px + 'px "JetBrains Mono", ui-monospace, monospace';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(cifra ? '1' : '0', d / 2, d / 2);
    return (sprite[k] = c);
  };

  /* ── PC: archi concentrici (centro fuori schermo a sinistra) ── */
  const CX = -100, CY = 440;
  function costruisciPC() {
    anelli = [];
    const K = 17;
    for (let k = 0; k < K; k++) {
      const t = k / (K - 1);
      const a = 270 + 205 * t;
      const b = 90 + 360 * Math.pow(t, 1.25);
      const liv = 1 + t * 3.6;
      const pit = 9 + liv * 2.6;                                  // passo tra le cifre
      const per = 2 * Math.PI * Math.sqrt((a * a + b * b) / 2);
      anelli.push({ k, t, a, b, liv, N: Math.round(per / pit), vel: (0.075 + 0.05 * (1 - t)) * (k % 2 ? 1 : 0.9), fase: hash(k, 7) / 4294967296 * 6.28 });
    }
  }
  function disegnaPC(tempo) {
    {
      for (const r of anelli) {
        const giro = r.fase + tempo * r.vel;
        for (let i = 0; i < r.N; i++) {
          const th = (i / r.N) * 6.2832 + giro;
          const c = Math.cos(th), s = Math.sin(th);
          let x = CX + r.a * c, y = CY + r.b * s;
          if (x < -30 || x > 440 || y < -20 || y > RH + 20) continue;
          const h = hash(i, r.k);
          // più grandi e luminose in basso a sinistra (vicino a chi guarda)
          let liv = r.liv + 1.6 * Math.max(0, s) * (1 - c) * 0.5 - 0.6 * Math.max(0, -s) * 0.3;
          liv = Math.max(1, Math.min(LIVELLI, Math.round(liv)));
          const vicino = Math.max(0, s * 0.5 + (1 - c) * 0.25);
          const luce = Math.exp(-Math.pow((th % 6.2832 > 3.14 ? th % 6.2832 - 6.2832 : th % 6.2832) / 0.45, 2)); // fascia lavanda sul lato destro
          let tinta = r.t < 0.34 ? 2 : 0, al = 0.8 + 0.2 * r.t;
          if (vicino > 0.42 && r.t > 0.4) { tinta = 1; al = 1; }
          else if (luce > 0.4) { tinta = 0; al = 1; liv = Math.min(LIVELLI, liv + 1); }
          const sp = spr((h >> 3) & 1, tinta, liv, al);
          T.drawImage(sp, x * scala * dpr - sp.width / 2, y * scala * dpr - sp.height / 2);
        }
      }
    }
  }

  /* ── Telefono: due nastri ondulati, le cifre scorrono lungo il nastro ── */
  const BORDO = [[140, 0], [170, 70], [230, 118], [300, 137], [380, 115], [450, 70], [520, 35], [580, 18], [630, 30], [700, 70], [780, 100], [850, 112], [930, 102], [1000, 75], [1060, 35], [1105, 0]];
  function bordo(y) {
    if (y <= BORDO[0][0]) return 0;
    for (let i = 1; i < BORDO.length; i++) {
      if (y <= BORDO[i][0]) {
        const [y0, x0] = BORDO[i - 1], [y1, x1] = BORDO[i];
        const u = (y - y0) / (y1 - y0), e = (1 - Math.cos(u * Math.PI)) / 2;
        return x0 + (x1 - x0) * e;
      }
    }
    return 0;
  }
  function costruisciTel() {
    nastri = { yMin: 140, yMax: 1105, righe: 9, pit: 19 };
  }
  function disegnaTel(tempo) {
    const { yMin, yMax, righe, pit } = nastri, L = yMax - yMin, per = Math.floor(L / pit);
    {
      const dir = 1;
      for (let k = 0; k < righe; k++) {
        const t = (k + 1) / righe;
        const off = (k % 3) * 4.3 + hash(k, 3) % 6;
        for (let j = 0; j < per; j++) {
          let y = yMin + (((j * pit + off + dir * tempo * 26) % L) + L) % L;
          const xo = bordo(y);
          if (xo < 3) continue;
          let x = xo * (0.1 + 0.9 * t);
          const f = Math.min(1, (y - yMin) / 70, (yMax - y) / 70);
          const larg = xo / 137;
          const liv = Math.max(1, Math.min(LIVELLI, Math.round(1 + larg * 3.2 + t * 2)));
          const centro = Math.exp(-Math.pow((y - 700) / 170, 2));
          const h = hash(j, k + 40);
          let tinta = t < 0.4 ? 2 : 0, al = (0.45 + 0.55 * t) * f;
          if (centro > 0.35 && t > 0.7) { tinta = 1; al = (0.9) * f; }
          if (larg < 0.3 && t > 0.6) { tinta = 0; al = 1 * f; }
          const sp = spr((h >> 3) & 1, tinta, liv, Math.min(1, al + 0.15));
          T.drawImage(sp, x * scala * dpr - sp.width / 2, y * scala * dpr - sp.height / 2);
        }
      }
    }
  }

  function misura() {
    mobile = window.innerWidth < 768;
    RW = mobile ? 852 : 1672; RH = mobile ? 1846 : 941;
    const w = Math.min(scena.clientWidth || window.innerWidth, mobile ? 767 : 1700);
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1);
    const h = w * RH / RW;
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    scala = w / RW;
    sprite = {};
    metà = document.createElement('canvas');
    metà.width = Math.ceil((mobile ? 160 : 440) * scala * dpr); metà.height = cv.height;
    T = metà.getContext('2d');
    mobile ? costruisciTel() : costruisciPC();
  }

  function fotogramma(ms) {
    if (document.documentElement.getAttribute('data-v') === 'ed') { ctx.clearRect(0, 0, cv.width, cv.height); return; }   // nella versione Editoriale gli anelli sono quelli del suo sfondo
    T.clearRect(0, 0, metà.width, metà.height);
    mobile ? disegnaTel(ms / 1000) : disegnaPC(ms / 1000);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(metà, 0, 0);
    ctx.save(); ctx.translate(cv.width, 0); ctx.scale(-1, 1); ctx.drawImage(metà, 0, 0); ctx.restore();
  }

  function ciclo(ms) {
    if (!vivo) return;
    requestAnimationFrame(ciclo);
    if (ms - ultimo < (mobile ? 42 : 50)) return;
    ultimo = ms;
    const t0 = performance.now();
    fotogramma(ms);
    cv.dataset.ms = (0.9 * (+cv.dataset.ms || 0) + 0.1 * (performance.now() - t0)).toFixed(2);   // costo medio di un fotogramma (per controllo)
    // protezione: se su questo dispositivo un fotogramma costa troppo (>16 ms di media dopo 40 fotogrammi) ci si ferma sull'ultimo, niente scatti
    if (++conta > 40 && +cv.dataset.ms > 16) { ferma(); fermoPerSempre = true; }
  }
  function avvia() { if (fermoPerSempre || vivo || !inVista || document.hidden) return; vivo = true; requestAnimationFrame(ciclo); }
  function ferma() { vivo = false; }

  misura();
  fotogramma(0);
  scena.classList.add('anelli-attivi');           // da qui l'immagine ferma non serve più
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { inVista = es[0].isIntersecting; inVista ? avvia() : ferma(); }, { rootMargin: '100px' }).observe(scena);
  }
  document.addEventListener('visibilitychange', () => document.hidden ? ferma() : avvia());
  let rid;
  window.addEventListener('resize', () => { clearTimeout(rid); rid = setTimeout(() => { misura(); fotogramma(performance.now()); }, 150); });
  avvia();
})();

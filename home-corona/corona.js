/* HOME «CORONA» — comportamento (prova 13/11). Dal design handoff di Claude Design, ricreato nei nostri file.
   Movimento continuo: solo l'orbita lenta dei mockup (chiesta da Francesco); si può anche trascinare in qualsiasi direzione.
   Niente scroll-effect, niente parallax, niente effetti che seguono il mouse. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const riduci = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stretto = window.matchMedia('(max-width: 899px)');
  const mod = (n, k) => ((n % k) + k) % k;
  const pad = n => String(n).padStart(2, '0');

  /* ───────────────────────── Dati ───────────────────────── */
  // Le categorie e il nostro lavoro vero che le rappresenta (ritagli in assets/img/corona/, si rifanno con _build/tessere-corona.js)
  const SETTORI = {
    ristorante:  { label: 'Ristorante', cta: 'ristorante',
      riga: 'Il sito del tuo ristorante: <b>menù, prenotazioni, mappa</b>. Online in <b>2-3 settimane</b>.' },
    moda:        { label: 'Moda e negozio', cta: 'moda',
      riga: 'Il sito del tuo negozio: <b>lookbook, catalogo, orari e indicazioni</b>. Online in <b>3 settimane</b>.' },
    immobiliare: { label: 'Immobiliare', cta: 'immobiliare',
      riga: 'Il sito della tua agenzia: <b>annunci con filtri, schede immobile, richieste di visita</b>. Online in <b>3-4 settimane</b>.' },
    studio:      { label: 'Studio professionale', cta: 'studio professionale',
      riga: 'Il sito del tuo studio: <b>servizi, team, prenotazione degli appuntamenti</b>. Online in <b>2-3 settimane</b>.' },
    shop:        { label: 'Negozio online', cta: 'negozio online',
      riga: 'Il tuo negozio online: <b>catalogo, carrello, pagamenti e spedizioni</b>. Online in <b>4-5 settimane</b>.' },
    fitness:     { label: 'Fitness e app', cta: 'fitness',
      riga: 'La tua app e il tuo sito: <b>corsi, prenotazione lezioni, abbonamenti</b>. Pronti in <b>6-8 settimane</b>.' },
    trainer:     { label: 'Personal trainer', cta: 'personal trainer',
      riga: 'La tua app per gli atleti e il gestionale per il coach: <b>programmi, allenamenti, check-in</b>. Pronti in <b>6-8 settimane</b>.' }
  };
  // Prima della scelta: mockup misti, ognuno con la schermata d'apertura del suo sito (6 computer + 6 telefoni, tutti diversi)
  const MISTI = { L: ['ristorante', 'trainer', 'moda', 'studio', 'immobiliare', 'shop'], P: ['fitness', 'shop', 'trainer', 'immobiliare', 'ristorante', 'moda'] };
  const TESSERE = '../assets/img/corona/';
  const IMGL = '../assets/img/lavoro-';

  // Pagine intere per la finestra «Vetrina»: catture a qualità massima salvate a blocchi (HQ_META, scritto da _build/catture-corona.js).
  // Gli «y» sono gli stessi punti di partenza di _build/tessere-corona.js, in unità 960 (computer) e 360 (telefono).
  const HQ = '../assets/img/hq/', META = window.HQ_META || {};
  const std = (id, ysL, ysP) => ({ L: { hq: id, viste: ysL, mappa: [0, 1, 2, 3, 4, 5] }, P: { hq: id, viste: ysP, mappa: [0, 1, 2, 3, 4, 5] } });
  const SITI = {
    ristorante:  { nome: 'Hedoné', cat: 'Ristorante e lounge bar', url: 'https://www.hedonevimodrone.it/', ...std('hedone', [0, 1250, 2650, 4030, 600, 3300], [0, 820, 2050, 2740, 1400, 2450]) },
    moda:        { nome: 'Ossidiana', cat: 'Alta moda · sito dimostrativo', url: 'https://chillguyzofficial-spec.github.io/ossidiana/', ...std('ossidiana', [0, 600, 1700, 3000, 1150, 2380], [0, 800, 1650, 2300, 1200, 2700]) },
    immobiliare: { nome: 'Home Unity', cat: 'Immobiliare · Milano e Firenze', url: 'https://homeunity.it/', ...std('homeunity-sito', [0, 780, 1650, 3050, 420, 2520], [0, 2000, 4000, 5780, 1000, 4900]) },
    studio:      { nome: 'Studio Lumea', cat: 'Studio dentistico · sito dimostrativo', url: 'https://chillguyzofficial-spec.github.io/StudioLumea_Dentistico/', ...std('lumea', [0, 760, 1760, 2960, 1260, 2380], [0, 1400, 2150, 2740, 800, 1800]) },
    shop:        { nome: 'Michelangelo Beauty', cat: 'Negozio online · sito dimostrativo', url: 'https://chillguyzofficial-spec.github.io/MichelangeloBeauty/', ...std('michelangelo', [0, 600, 1560, 2400, 1000, 2950], [0, 1050, 1800, 2400, 500, 2700]) },
    fitness:     { nome: 'Cento Respiri', cat: 'Pilates · sito e app dimostrativi', url: 'https://chillguyzofficial-spec.github.io/Studio-Pilates-APP-e-SITO/', ...std('centorespiri', [0, 1000, 2380, 3000, 450, 1650], [0, 800, 1450, 2350, 300, 2700]) },
    trainer: {
      nome: 'Carico', cat: 'App per personal trainer · dimostrativo', url: 'https://chillguyzofficial-spec.github.io/Carico/',
      L: { viste: [{ hq: 'carico', y: 0 }, { src: `${TESSERE}trainer-coach.webp`, y: 0 }], mappa: [0, 1, 1, 1, 1, 1] },
      P: { viste: ['oggi', 'allenamento', 'progressi', 'chat', 'guida'].map(n => ({ src: `${TESSERE}trainer-app-${n}.webp`, y: 0 })).concat([{ src: `${TESSERE}trainer-app-hero.webp`, y: 0 }]), mappa: [0, 1, 2, 3, 4, 5] }
    },
    gestionale: {
      nome: 'Home Unity · gestionale', cat: 'Gestionale · area riservata', url: null,
      L: { viste: [{ src: `${IMGL}homeunity-pc.webp`, y: 0 }], mappa: [0] },
      P: { viste: [{ src: `${IMGL}homeunity-tel.webp`, y: 0 }], mappa: [0] }
    }
  };
  // le viste dei siti «standard» sono numeri (y); quelle di Carico e del gestionale sono oggetti. Questa funzione le rende uniformi
  const vistaDi = (d, i) => { const v = d.viste[i]; return typeof v === 'number' ? { hq: d.hq, y: v } : v; };
  const bloccoDi = (id, tipo) => ((META[id] || {})[tipo === 'P' ? 'tel' : 'pc'] || { blocchi: [] }).blocchi.map(b => HQ + b.file);
  const immaginiDi = (v, tipo) => v.hq ? (bloccoDi(v.hq, tipo).length ? bloccoDi(v.hq, tipo) : [`${IMGL}${v.hq}-${tipo === 'P' ? 'tel' : 'pc'}-intera.webp`]) : [v.src];

  // Le schede della slide: stessi testi del sito ufficiale
  const LAVORI = [
    { nome: 'Hedoné', cat: 'Sito web / Ristorazione · Vimodrone', stato: 'Cliente', img: 'hq/hedone-pc', riga: 'Ristorante e lounge bar sul Naviglio Martesana: il menù con gli ingredienti a un tocco e la prenotazione già aperta.', tag: ['Menù a un tocco', 'Prenotazione', 'Online da settembre 2026'], sito: 'ristorante' },
    { nome: 'Ossidiana', cat: 'Sito vetrina / Moda e lusso · Milano', stato: 'Dimostrativo', img: 'hq/ossidiana-pc', riga: 'Una sartoria di alta moda inventata per mostrare un sito di lusso: foto grandi e poche parole.', tag: ['Foto a tutta pagina', 'Tre pagine', 'Computer e telefono'], sito: 'moda' },
    { nome: 'Home Unity', cat: 'Sito web / Real estate · Milano e Firenze', stato: 'Online', img: 'hq/homeunity-sito-pc', w: 1920, h: 1200, riga: 'Il sito di Home Unity: property management e operazioni immobiliari a Milano e Firenze.', tag: ['Online su homeunity.it', 'Metodo in quattro passi'], sito: 'immobiliare' },
    { nome: 'Home Unity', cat: 'Gestionale / Affitti brevi', stato: 'Area riservata', img: 'homeunity-pc', riga: 'I numeri di 108 appartamenti tra Milano, Firenze e lago di Garda in una sola schermata.', tag: ['Dati che arrivano da soli', 'Confronto con l’anno prima'], sito: 'gestionale' },
    { nome: 'Studio Lumea', cat: 'Sito web / Studio dentistico · Milano', stato: 'Dimostrativo', img: 'hq/lumea-pc', riga: 'Dodici pagine pensate per chi ha paura del dentista: una per trattamento, costi chiari e richiesta di appuntamento.', tag: ['Dodici pagine', 'Costi chiari', 'Appuntamento online'], sito: 'studio' },
    { nome: 'Michelangelo Beauty', cat: 'Negozio online / Cosmetica · Toscana', stato: 'Dimostrativo', img: 'hq/michelangelo-pc', riga: 'Un negozio di cosmetica con il carattere di una bottega: carrello, confezione regalo e pagamento in quattro passaggi.', tag: ['Carrello', 'Confezione regalo', 'Questionario prodotti'], sito: 'shop' },
    { nome: 'Cento Respiri', cat: 'Sito + app / Pilates · Torino', stato: 'Dimostrativo', img: 'hq/centorespiri-pc', riga: 'Sito, area clienti e app da installare con un solo account: lista d’attesa, carnet e buoni regalo.', tag: ['Un solo account', 'Lista d’attesa', 'QR all’ingresso'], sito: 'fitness' },
    { nome: 'Carico', cat: 'App + gestionale / Personal trainer', stato: 'Dimostrativo', img: 'hq/carico-pc', riga: 'L’app per l’atleta con la scheda dell’allenamento e i progressi; il gestionale del coach da computer, collegato all’app.', tag: ['Scheda allenamento', 'Video della tecnica', 'Gestionale del coach'], sito: 'trainer' }
  ];

  /* ── Disposizione dei mockup ── */
  const L = 'L', P = 'P';
  const DISP = {
    orbita: [   // 10 mockup, computer e telefono alternati e ben distanziati (nessuna sovrapposizione): 5 computer + 5 telefoni
      { t: L, w: 270, r: -5, o: 1 }, { t: P, w: 96, r: 5, o: 1 },
      { t: L, w: 250, r: 4, o: 1 },  { t: P, w: 100, r: -6, o: 1 },
      { t: L, w: 280, r: -3, o: 1 }, { t: P, w: 92, r: 6, o: 1 },
      { t: L, w: 255, r: 5, o: 1 },  { t: P, w: 104, r: -5, o: 1 },
      { t: L, w: 265, r: -4, o: 1 }, { t: P, w: 98, r: 4, o: 1 }
    ],
    alta: [
      { t: P, left: '3%', top: '14%', w: 78, r: -9, o: 1 },
      { t: L, left: '22%', top: '18%', w: 220, r: -4, o: 1 },
      { t: P, right: '3%', top: '6%', w: 76, r: 8, o: 1 }
    ],
    bassa: [
      { t: L, left: '4%', top: '22%', w: 200, r: 5, o: 1 },
      { t: P, right: '20%', top: '10%', w: 84, r: -6, o: 1 },
      { t: P, right: '2%', top: '30%', w: 66, r: 9, o: 1 }
    ]
  };

  /* ───────────────────────── Stato ───────────────────────── */
  const stato = { sel: null, mostrato: null, esce: false };
  let mock = [];
  let ultimo = 0, raf = 0, visibile = true, contattoAperto = false, scalaOrb = 0;
  const W0 = (Math.PI * 2) / 140;                 // deriva di base: un giro ogni 140 s
  let ang = 0, omega = W0 * 6;                    // angolo dell'orbita e sua velocità (rad/s): parte già in movimento
  let trascina = null, rxAtt = 500, ryAtt = 300, sullaScelta = false, filaMossa = false;
  const offBanda = { alta: 0, bassa: 0 };         // telefono: di quanto sono ruotate le due fasce
  const apertura = $('.apertura');

  const settoreDi = (tipo, n) => stato.mostrato ? stato.mostrato : MISTI[tipo][mod(n, 6)];

  /* ───────────────────────── Mockup ───────────────────────── */
  function creaMockup(contenitore, lista, orbitale, cont = { L: 0, P: 0 }, banda = null) {
    return lista.map(d => {
      const n = cont[d.t]++;
      const outer = document.createElement('div');
      outer.className = 'mk ' + (d.t === L ? 'mk-pc' : 'mk-tel');
      if (!orbitale) ['left', 'right', 'top'].forEach(k => { if (d[k] != null) outer.style[k] = d[k]; });
      const inner = document.createElement('div'); inner.className = 'mk-in';
      inner.style.width = d.w + 'px';
      inner.innerHTML = '<div class="mk-frame"><div class="mk-schermo"><img alt="" decoding="async" fetchpriority="high"></div></div><div class="mk-base"></div>';
      outer.appendChild(inner);
      contenitore.appendChild(outer);
      const o = { outer, inner, d, n, orb: orbitale, banda, sid: null, tile: 0, tipo: d.t };
      riempi(o);
      posa(o, true);   // parte nascosto: entra appena le immagini sono pronte (vedi costruisci)
      return o;
    });
  }
  function riempi(o) {
    const n = o.n + (o.banda ? offBanda[o.banda] : 0);
    o.sid = settoreDi(o.d.t, n);
    o.tile = stato.mostrato ? mod(n, 6) : 0;     // prima della scelta: la schermata d'apertura; dopo: 6 punti diversi dello stesso sito
    $('img', o.inner).src = `${TESSERE}${o.sid}-${o.d.t}${o.tile + 1}.webp`;
  }
  // Uscita/ingresso dei mockup (cambio settore, avvio)
  function posa(o, esce) {
    const d = o.d, tr = `${o.orb ? 'translate(-50%,-50%) ' : ''}rotate(${d.r + (esce ? (d.r > 0 ? 2 : -2) : 0)}deg) translateY(${esce ? 18 : 0}px)`;
    o.inner.style.transform = tr;
    o.inner.style.opacity = esce ? 0 : d.o;
  }
  function costruisci() {
    mock.forEach(m => m.outer.remove()); mock = []; scalaOrb = 0;
    if (stretto.matches) {
      const cont = { L: 0, P: 0 };   // contatore unico: la fascia bassa continua da dove finisce l'alta, niente doppioni
      mock = creaMockup($('[data-banda="alta"]'), DISP.alta, false, cont, 'alta').concat(creaMockup($('[data-banda="bassa"]'), DISP.bassa, false, cont, 'bassa'));
    } else {
      mock = creaMockup($('[data-orbita]'), DISP.orbita, true);
    }
    posaOrbita();
    const lista = mock;
    const pronte = Promise.all(lista.map(m => { const i = $('img', m.inner); return i.decode ? i.decode().catch(() => {}) : Promise.resolve(); }));
    Promise.race([pronte, new Promise(r => setTimeout(r, 1400))]).then(() => lista.forEach((m, i) => {
      m.inner.style.transitionDelay = riduci.matches ? '0s' : (i * 0.06) + 's';
      posa(m, false);
    }));
  }

  /* ───────────────────────── Orbita ─────────────────────────
     I mockup girano attorno al blocco centrale. Quando uno entra nella colonna del titolo non sparisce: passa DIETRO, smorzato
     (così l'effetto resta e il testo si legge). Il movimento è fisico: ha una velocità che si adegua piano, quindi dopo un gesto scivola e poi torna alla deriva. */
  const liscio = (t, a, b) => { const x = Math.max(0, Math.min(1, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
  let dimW = 0, dimH = 0;
  const misura = () => { const b = $('[data-stage]'); dimW = b.offsetWidth; dimH = b.offsetHeight; scalaOrb = 0; };
  function posaOrbita() {
    if (stretto.matches) return;
    if (!dimW) misura();
    const W = dimW, H = dimH;
    // Sugli schermi più stretti l'orbita si allarga (i mockup escono un po' dai bordi) e i mockup si rimpiccioliscono
    const rx = W * (0.4 + 0.07 * Math.max(0, Math.min(1, (1320 - W) / 420))), ry = H * 0.43;
    rxAtt = rx; ryAtt = ry;
    const k = Math.max(0.7, Math.min(1, W / 1440)) * 0.94;
    if (k !== scalaOrb) { scalaOrb = k; mock.forEach(m => { m.inner.style.width = (m.d.w * k).toFixed(0) + 'px'; }); }
    const colonna = Math.min(455, W * 0.33) + 10;          // metà larghezza della colonna del testo
    const passo = (Math.PI * 2) / mock.length;
    mock.forEach((m, i) => {
      const a = i * passo + 0.26 + ang;
      const x = Math.cos(a) * rx, y = Math.sin(a) * ry, mezza = (m.d.w * k) / 2;
      const dentro = colonna - (Math.abs(x) - mezza);      // di quanto il bordo del mockup è dentro la colonna
      m.outer.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      m.outer.style.opacity = (1 - liscio(dentro, -30, 70)).toFixed(3);   // dietro al titolo non si vedono: sfumano e spariscono prima di entrare nella colonna
    });
  }
  const t0 = performance.now();
  let fattore = 1;
  const ATTRITO = 2.2;   // più alto = si smorza prima dopo un gesto; più basso = scivola più a lungo
  function tick(now) {
    const dt = Math.min(now - (ultimo || now), 50) / 1000; ultimo = now;
    const puoi = !riduci.matches && !stretto.matches && visibile && !contattoAperto && !document.hidden && !vetAperta();
    if (puoi && !trascina) {
      // sopra la fila dei settori l'orbita rallenta un poco (mai si ferma); all'avvio c'è una breve spinta
      const spinta = 1 + 7 * Math.exp(-(now - t0) / 1800);
      omega += (W0 * spinta - omega) * (1 - Math.exp(-dt * ATTRITO));
      ang += omega * dt;
      posaOrbita();
    }
    // fuori vista, con una finestra aperta o a scheda nascosta il ciclo dorme: si risveglia 4 volte al secondo, non pesa
    if (puoi || trascina) raf = requestAnimationFrame(tick); else setTimeout(() => { raf = requestAnimationFrame(tick); }, 250);
  }

  /* ── Mockup sotto il puntatore (per il clic e il cursore) ── */
  function daPunto(x, y) {
    for (let i = mock.length - 1; i >= 0; i--) {
      const m = mock[i];
      const oo = m.outer.style.opacity === '' ? 1 : +m.outer.style.opacity;
      if (oo * (+getComputedStyle(m.inner).opacity || 0) < 0.5) continue;   // quelli smorzati dietro il testo non si cliccano
      const r = m.inner.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return m;
    }
    return null;
  }

  /* ── Scorrimento a mano, sempre circolare: trascina in QUALSIASI direzione (il mockup segue il dito/mouse), trackpad, frecce ── */
  const stage = $('[data-stage]');
  const gira = d => { ang += d; posaOrbita(); };
  const scelta = $('.settori-box');
  scelta.addEventListener('pointerenter', () => { sullaScelta = true; });
  scelta.addEventListener('pointerleave', () => { sullaScelta = false; });
  stage.addEventListener('pointerdown', e => {
    if (stretto.matches || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (e.target.closest('.centro button, .centro a, .centro input, .settori-box, .giro')) return;
    const ora = performance.now();
    trascina = { id: e.pointerId, x: e.clientX, y: e.clientY, t: ora, t0: ora, v: 0, mosso: 0, centro: !!e.target.closest('.centro') };
    omega = 0;
    try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    stage.classList.add('sta-trascinando');
  });
  let hoverAttesa = false;
  stage.addEventListener('pointermove', e => {
    if (!trascina || e.pointerId !== trascina.id) {
      if (!trascina && !hoverAttesa && e.pointerType === 'mouse') {           // cursore a mano sopra un mockup cliccabile
        hoverAttesa = true;
        requestAnimationFrame(() => { hoverAttesa = false; stage.classList.toggle('su-mockup', !e.target.closest('.centro') && !!daPunto(e.clientX, e.clientY)); });
      }
      return;
    }
    const dx = e.clientX - trascina.x, dy = e.clientY - trascina.y, ora = performance.now(), dt = Math.max(1, ora - trascina.t) / 1000;
    // proiezione del gesto sulla direzione dell'orbita nel punto in cui si trova il dito: funziona in orizzontale, in verticale e in diagonale
    const r = stage.getBoundingClientRect();
    const px = e.clientX - (r.left + r.width / 2), py = e.clientY - (r.top + r.height / 2);
    const a = Math.atan2(py / ryAtt, px / rxAtt);
    const den = rxAtt * rxAtt * Math.sin(a) ** 2 + ryAtt * ryAtt * Math.cos(a) ** 2;
    const d = (dx * (-rxAtt * Math.sin(a)) + dy * (ryAtt * Math.cos(a))) / den;
    gira(d);
    trascina.v = 0.7 * trascina.v + 0.3 * (d / dt);
    trascina.mosso += Math.hypot(dx, dy);
    trascina.x = e.clientX; trascina.y = e.clientY; trascina.t = ora;
  });
  const finisci = e => {
    if (!trascina || (e && e.pointerId !== trascina.id)) return;
    const tap = e && e.type === 'pointerup' && trascina.mosso < 6 && performance.now() - trascina.t0 < 600 && !trascina.centro;
    const ferma = performance.now() - trascina.t > 90;          // se il dito era fermo prima di staccarsi, niente slancio
    const v = ferma ? 0 : trascina.v; trascina = null; stage.classList.remove('sta-trascinando');
    omega = riduci.matches ? 0 : Math.max(-2.8, Math.min(2.8, v));   // lo slancio del gesto continua e poi si smorza da solo
    if (tap) { const m = daPunto(e.clientX, e.clientY); if (m) apriVetrina(m.sid, m.tipo, m.tile); }
  };
  stage.addEventListener('pointerup', finisci); stage.addEventListener('pointercancel', finisci);
  stage.addEventListener('wheel', e => {
    if (stretto.matches || e.target.closest('.settori-box')) return;   // sopra la fila dei settori scorre la fila, non l'orbita
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2 && Math.abs(e.deltaX) > 1) { e.preventDefault(); gira(-e.deltaX / rxAtt * 0.9); }
  }, { passive: false });
  // frecce: una spinta che fa scorrere di un mockup con la stessa inerzia del gesto; più clic = più slancio
  $$('[data-giro]').forEach(b => b.addEventListener('click', () => {
    const dir = Number(b.dataset.giro), passo = (Math.PI * 2) / (mock.length || 12);
    if (riduci.matches) { ang += dir * passo; posaOrbita(); } else omega += dir * passo * ATTRITO;
  }));

  /* Telefono: le due fasce non girano da sole; un tocco-e-trascina in orizzontale fa scorrere (in cerchio) le schermate; un tocco apre la pagina */
  $$('.banda').forEach(el => {
    let s = null;
    el.addEventListener('pointerdown', e => { s = { x: e.clientX, y: e.clientY, id: e.pointerId, fatto: false }; });
    el.addEventListener('pointermove', e => {
      if (!s || s.fatto || e.pointerId !== s.id) return;
      const dx = e.clientX - s.x, dy = e.clientY - s.y;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) { s.fatto = true; giraBanda(el.dataset.banda, dx < 0 ? 1 : -1); }
    });
    el.addEventListener('pointerup', e => {
      if (s && !s.fatto && Math.hypot(e.clientX - s.x, e.clientY - s.y) < 10) { const m = daPunto(e.clientX, e.clientY); if (m) apriVetrina(m.sid, m.tipo, m.tile); }
      s = null;
    });
    el.addEventListener('pointercancel', () => { s = null; });
  });
  let tBanda = 0;
  function giraBanda(nome, dir) {
    offBanda[nome] = mod(offBanda[nome] + dir, 6);
    const lista = mock.filter(m => m.banda === nome);
    if (riduci.matches) { lista.forEach(riempi); return; }
    clearTimeout(tBanda);
    lista.forEach(m => { m.inner.style.transitionDelay = '0s'; posa(m, true); });
    tBanda = setTimeout(() => { lista.forEach((m, i) => { riempi(m); m.inner.style.transitionDelay = (i * 0.04) + 's'; posa(m, false); }); }, 260);
  }

  /* ───────────────────────── Scelta del settore ───────────────────────── */
  let tScelta = 0;
  function scegli(id) {
    if (id === stato.sel) return;
    stato.sel = id;
    $$('.settore').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.s === id)));
    $('[data-cta]').textContent = 'Parlaci del tuo progetto di ' + SETTORI[id].cta;
    apertura.classList.remove('accende'); void apertura.offsetWidth; apertura.classList.add('accende');   // la luce dietro il titolo si accende un attimo
    const cambia = () => {
      stato.mostrato = id; stato.esce = false;
      mock.forEach(riempi);
      mock.forEach((m, i) => { m.inner.style.transitionDelay = riduci.matches ? '0s' : (i * 0.04) + 's'; posa(m, false); });
      const r = $('#riga'); r.innerHTML = SETTORI[id].riga; r.classList.remove('esce');
    };
    if (riduci.matches) return cambia();
    clearTimeout(tScelta);
    stato.esce = true;
    mock.forEach(m => { m.inner.style.transitionDelay = '0s'; posa(m, true); });
    $('#riga').classList.add('esce');
    tScelta = setTimeout(cambia, 300);
  }
  $$('.settore').forEach(b => b.addEventListener('click', () => scegli(b.dataset.s)));

  /* ── Fila dei settori: come le schede a scorrimento del sito ufficiale (frecce che tornano al primo, trascinamento col mouse, barra) ── */
  (() => {
    const fila = $('#fila-settori'), barra = $('[data-fila-barra]'), comandi = $('.fila-comandi');
    const passo = () => Math.round(fila.clientWidth * 0.6);   // le voci hanno larghezze diverse: le frecce scorrono di circa metà striscia
    const piuVicina = () => { const li = [...fila.children].map(e => e.offsetLeft - fila.children[0].offsetLeft); return li.reduce((b, x) => Math.abs(x - fila.scrollLeft) < Math.abs(b - fila.scrollLeft) ? x : b, 0); };
    const aggiorna = () => {
      const tot = fila.scrollWidth, vis = fila.clientWidth;
      comandi.classList.toggle('ferma', tot <= vis + 4);
      barra.style.width = (vis / tot * 100) + '%'; barra.style.left = (fila.scrollLeft / tot * 100) + '%';
    };
    let tFila = 0;
    fila.addEventListener('scroll', () => { filaMossa = true; clearTimeout(tFila); tFila = setTimeout(() => { filaMossa = false; }, 900); aggiorna(); }, { passive: true });
    addEventListener('resize', aggiorna); aggiorna();
    $$('[data-fila-dir]').forEach(btn => btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.filaDir), beh = riduci.matches ? 'auto' : 'smooth';
      const fine = fila.scrollLeft + fila.clientWidth >= fila.scrollWidth - 4;
      if (dir > 0 && fine) fila.scrollTo({ left: 0, behavior: beh });
      else if (dir < 0 && fila.scrollLeft <= 4) fila.scrollTo({ left: fila.scrollWidth, behavior: beh });
      else fila.scrollBy({ left: dir * passo(), behavior: beh });
    }));
    let tiro = null, mosso = false;
    fila.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; tiro = { x: e.clientX, s: fila.scrollLeft }; mosso = false; fila.classList.add('tiro'); });
    addEventListener('pointermove', e => { if (!tiro) return; const dx = e.clientX - tiro.x; if (Math.abs(dx) > 5) mosso = true; fila.scrollLeft = tiro.s - dx; });
    addEventListener('pointerup', () => { if (!tiro) return; tiro = null; fila.classList.remove('tiro'); fila.scrollTo({ left: piuVicina(), behavior: 'smooth' }); });
    fila.addEventListener('click', e => { if (mosso) { e.preventDefault(); e.stopPropagation(); mosso = false; } }, true);   // dopo un trascinamento il «clic» non sceglie un settore
  })();

  /* ───────────────────────── Contatto ───────────────────────── */
  const dlg = $('[data-contatto]'), form = $('[data-form]'), grazie = $('[data-grazie]'), errore = $('[data-errore]');
  const WA = '393454517186';
  function apriContatto() {
    form.hidden = false; grazie.hidden = true; errore.hidden = true;
    if (stato.sel) form.elements.settore.value = SETTORI[stato.sel].label;
    segnaChip();
    contattoAperto = true;
    if (!dlg.open) dlg.showModal();
    form.elements[stato.sel ? 'nome' : 'settore'].focus();
  }
  $$('[data-apri-contatto]').forEach(b => b.addEventListener('click', apriContatto));
  $$('[data-chiudi-contatto]').forEach(b => b.addEventListener('click', () => { if (dlg.open) dlg.close(); }));
  // i settori come «chip»: un tocco compila il campo; se scrivi altro nel campo si spengono
  const chips = $$('[data-chip]'), campoSett = form.elements.settore;
  const segnaChip = () => chips.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.chip === campoSett.value.trim())));
  chips.forEach(b => b.addEventListener('click', () => { campoSett.value = b.dataset.chip; segnaChip(); }));
  campoSett.addEventListener('input', segnaChip);
  dlg.addEventListener('close', () => { contattoAperto = false; });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = form.elements, nome = f.nome.value.trim(), contatto = f.contatto.value.trim();
    if (!nome || !contatto) { errore.hidden = false; (nome ? f.contatto : f.nome).focus(); return; }
    errore.hidden = true;
    const righe = ['Ciao, sono ' + nome + '.', f.settore.value.trim() && ('Settore: ' + f.settore.value.trim() + '.'), f.msg.value.trim() && ('Il progetto: ' + f.msg.value.trim()), 'Mi trovi qui: ' + contatto + '.', '(dalla promo da 499 €)'].filter(Boolean);
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(righe.join(' ')), '_blank', 'noopener');
    form.hidden = true; grazie.hidden = false;
  });

  /* ───────────────────────── Vetrina: la pagina intera del sito, da scorrere ───────────────────────── */
  const vet = $('[data-vetrina]'), vSc = $('[data-v-scorri]'), vPag = $('[data-v-pagina]'), vCorpo = $('[data-v-corpo]');
  const V = { sito: null, tipo: 'L', i: 0, chiave: '' };
  function vetAperta() { return vet.open; }
  function vVai(y, morbido) {
    // gli «y» sono in unità 960 (computer) o 360 (telefono): si scalano sulla larghezza con cui la pagina è mostrata
    const ref = V.tipo === 'P' ? 360 : 960;
    vSc.scrollTo({ top: y * (vPag.clientWidth / ref), behavior: morbido && !riduci.matches ? 'smooth' : 'auto' });
  }
  function vMostra(morbido) {
    const s = SITI[V.sito], d = s[V.tipo] || s.L, n = d.viste.length, v = vistaDi(d, mod(V.i, n));
    $('[data-v-cat]').textContent = s.cat;
    $('[data-v-nome]').textContent = s.nome;
    const vai = $('[data-v-vai]'); vai.hidden = !s.url; if (s.url) vai.href = s.url;
    vCorpo.className = 'v-corpo ' + V.tipo;
    $('[data-v-conta]').textContent = pad(mod(V.i, n) + 1) + ' / ' + pad(n);
    $$('[data-v-tipo]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.vTipo === V.tipo)));
    const lista = immaginiDi(v, V.tipo), chiave = lista.join('|');
    if (chiave !== V.chiave) {                      // pagina diversa: si impilano i blocchi uno sotto l'altro
      V.chiave = chiave; vPag.innerHTML = '';
      lista.forEach((src, k) => { const im = new Image(); im.alt = k ? '' : s.nome + ': pagina intera'; im.decoding = 'async'; if (k === 0) im.onload = () => vVai(v.y, false); im.src = src; vPag.appendChild(im); });
      vVai(v.y, false);
    } else vVai(v.y, morbido);
  }
  function apriVetrina(sito, tipo, tile) {
    const s = SITI[sito]; if (!s) return;
    V.sito = sito; V.tipo = s[tipo] ? tipo : 'L';
    const mappa = s[V.tipo].mappa || [];
    V.i = mappa[tile] != null ? mappa[tile] : 0;
    vMostra(false);
    if (!vet.open) vet.showModal();
    vSc.focus({ preventScroll: true });
  }
  $('[data-v-chiudi]').addEventListener('click', () => vet.close());
  vet.addEventListener('close', () => { vPag.innerHTML = ''; V.chiave = ''; });   // alla chiusura le pagine intere escono dalla memoria: la pagina resta leggera
  $$('[data-v-tipo]').forEach(b => b.addEventListener('click', () => { V.tipo = b.dataset.vTipo; V.i = 0; vMostra(false); }));
  const vPasso = dir => { const n = (SITI[V.sito][V.tipo] || SITI[V.sito].L).viste.length; V.i = mod(V.i + dir, n); vMostra(true); };
  $('[data-v-prec]').addEventListener('click', () => vPasso(-1));
  $('[data-v-succ]').addEventListener('click', () => vPasso(1));
  vet.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { vPasso(1); e.preventDefault(); } else if (e.key === 'ArrowLeft') { vPasso(-1); e.preventDefault(); } });

  /* ───────────────────────── Lavori: slide come nel sito ufficiale ───────────────────────── */
  (() => {
    const vista = $('[data-car-vista]'), traccia = $('[data-car-traccia]'), conta = $('[data-lav-conta]');
    traccia.innerHTML = LAVORI.map((w, i) =>
      `<li class="car-scheda" data-i="${i}"><button type="button" class="car-bottone" aria-label="${w.nome}, ${w.cat.replace(' / ', ', ')}: apri il progetto"><span class="car-cornice"><img src="${w.img.startsWith('hq/') ? '../assets/img/' : IMGL}${w.img}.webp" width="${w.w || 1920}" height="${w.h || 1200}" alt="${w.nome}, la pagina d’apertura sul computer" draggable="false" decoding="async"><span class="car-stato">${w.stato}</span><span class="car-apri" aria-hidden="true">Apri il progetto <i>↗</i></span></span></button><div class="car-info"><div class="car-riga"><p class="car-nome">${w.nome}</p><p class="car-cat">${w.cat.replace(' / ', ' <span aria-hidden="true">/</span> ')}</p></div><p class="car-desc">${w.riga}</p><ul class="car-tag">${w.tag.map(t => `<li>${t}</li>`).join('')}</ul></div></li>`).join('');
    const schede = $$('.car-scheda', traccia);
    let ia = 0, base = 0, trascinando = null, mossa = false, tRuota = 0;
    function posiziona(extra = 0) {
      const sw = schede[0].offsetWidth, gap = parseFloat(getComputedStyle(traccia).columnGap) || 24;
      base = (vista.clientWidth - sw) / 2 - ia * (sw + gap);
      traccia.style.transform = `translateX(${base + extra}px)`;
    }
    function aggiorna() {
      schede.forEach((s, i) => { s.classList.toggle('attiva', i === ia); $('.car-bottone', s).tabIndex = i === ia ? 0 : -1; });
      conta.textContent = pad(ia + 1) + ' / ' + pad(LAVORI.length);
      posiziona();
    }
    function vai(n) { ia = mod(n, LAVORI.length); aggiorna(); }
    $('[data-lav-prec]').addEventListener('click', () => vai(ia - 1));
    $('[data-lav-succ]').addEventListener('click', () => vai(ia + 1));
    vista.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { vai(ia + 1); e.preventDefault(); } else if (e.key === 'ArrowLeft') { vai(ia - 1); e.preventDefault(); } });
    vista.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2 && Math.abs(e.deltaX) > 8) { e.preventDefault(); const t = performance.now(); if (t - tRuota > 450) { tRuota = t; vai(ia + (e.deltaX > 0 ? 1 : -1)); } }
    }, { passive: false });
    vista.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button !== 0) return; trascinando = { x: e.clientX, id: e.pointerId }; mossa = false; });
    addEventListener('pointermove', e => {
      if (!trascinando || e.pointerId !== trascinando.id) return;
      const dx = e.clientX - trascinando.x;
      if (!mossa && Math.abs(dx) > 8) { mossa = true; vista.classList.add('tiro'); }
      if (mossa) posiziona(dx);
    });
    const fine = e => {
      if (!trascinando || (e && e.pointerId !== trascinando.id)) return;
      const dx = e.clientX - trascinando.x; trascinando = null; vista.classList.remove('tiro');
      if (mossa && Math.abs(dx) > 60) vai(ia + (dx < 0 ? 1 : -1)); else posiziona();
    };
    addEventListener('pointerup', fine); addEventListener('pointercancel', fine);
    // clic su una scheda: se non è quella attiva ci va; se lo è, apre la pagina intera
    traccia.addEventListener('click', e => {
      if (mossa) { mossa = false; return; }
      const s = e.target.closest('.car-scheda'); if (!s) return;
      const i = Number(s.dataset.i);
      if (i !== ia) vai(i); else apriVetrina(LAVORI[i].sito, 'L', 0);
    });
    addEventListener('resize', () => posiziona());
    aggiorna();
  })();

  /* ───────────────────────── Menu fisso ed espandibile ───────────────────────── */
  (() => {
    const invertite = $$('.inv'), nav = $('.nav'), menu = $('[data-menu]'), btn = $('.menu-btn'), ponte = $('[data-ponte]'), lavori = $('#lavori');
    const imposta = v => { menu.classList.toggle('aperto', v); btn.setAttribute('aria-expanded', String(v)); btn.setAttribute('aria-label', v ? 'Chiudi il menu' : 'Apri il menu'); };
    btn.addEventListener('click', e => { e.stopPropagation(); imposta(!menu.classList.contains('aperto')); });
    $$('.menu-voci a').forEach(a => a.addEventListener('click', () => imposta(false)));
    document.addEventListener('click', e => { if (!menu.contains(e.target)) imposta(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('aperto')) { imposta(false); btn.focus(); } });
    let attesa = false;
    const aggiorna = () => {            // il menu cambia colore a metà del passaggio tra apertura e lavori
      attesa = false;
      const p = ponte.getBoundingClientRect(), l = lavori.getBoundingClientRect();
      let su = p.top + p.height * 0.5 <= 38 && l.bottom > 38;
      if (!su) for (const s of invertite) { const r = s.getBoundingClientRect(); if (r.top <= 38 && r.bottom > 38) { su = true; break; } }
      nav.classList.toggle('su-lavori', su);
    };
    addEventListener('scroll', () => { if (!attesa) { attesa = true; requestAnimationFrame(aggiorna); } }, { passive: true });
    addEventListener('resize', aggiorna); aggiorna();
  })();

  /* ───────────────────────── Tema (provvisorio, per confrontare) ───────────────────────── */
  const radice = document.documentElement;
  const segnaTema = () => $$('[data-tema-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.temaBtn === radice.getAttribute('data-tema'))));
  $$('[data-tema-btn]').forEach(b => b.addEventListener('click', () => {
    radice.setAttribute('data-tema', b.dataset.temaBtn);
    try { localStorage.setItem('corona-tema', b.dataset.temaBtn); } catch (_) {}
    segnaTema();
  }));
  segnaTema();

  /* ───────────────────────── Avvio ───────────────────────── */
  if (window.CSS && CSS.registerProperty && !riduci.matches) $('.firma').classList.add('scrive');   // la firma si scrive da sola
  costruisci();
  stretto.addEventListener('change', costruisci);
  addEventListener('resize', () => { misura(); if (!stretto.matches) posaOrbita(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visibile = es[0].isIntersecting; }, { threshold: 0 }).observe($('[data-stage]'));
  raf = requestAnimationFrame(tick);
})();

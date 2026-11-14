/* Gestionale · pannello di prova interattivo (dati inventati).
   Panoramica con grafico, calendario camere, prenotazioni (ordina, filtra, selezione multipla, CSV),
   clienti, incassi, scheda di dettaglio, ricerca rapida (Ctrl K) e nuove richieste in tempo reale. */
(function () {
  var root = document.getElementById('gzlive');
  if (!root) return;
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || root).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var num = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  var eur = function (n) { return num(n) + ' €'; };
  var DAY0 = 10, OGGI = 5, NG = 14; /* 10 nov = giorno 1; oggi = 14 nov */
  var dd = function (s) { var d = DAY0 + s - 1; return d <= 30 ? d + ' nov' : (d - 30) + ' dic'; };
  var WD = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  var CAM = ['Blu', 'Verde', 'Corte', 'Suite', 'Attico', 'Giardino'];
  var STL = { ok: 'Confermata', att: 'Da confermare', ann: 'Annullata' };

  /* ---------- dati inventati ---------- */
  var B = [
    [1, 'Marta Rossi', 0, 1, 3, 420, 'att', 'Carta'], [2, 'Luca Bianchi', 1, 2, 2, 360, 'ok', 'Carta'],
    [3, 'Studio Verdi', 2, 4, 4, 690, 'att', 'Bonifico'], [4, 'Elena Parisi', 3, 1, 5, 1180, 'ok', 'Carta'],
    [5, 'Giorgio Tosi', 0, 6, 2, 210, 'att', 'Contanti'], [6, 'Anna Galli', 4, 3, 6, 1560, 'ok', 'Bonifico'],
    [7, 'Paolo Neri', 1, 6, 3, 540, 'ok', 'Carta'], [8, 'Chiara Fumi', 5, 5, 2, 380, 'att', 'Carta'],
    [9, 'Hotel Aurora srl', 2, 9, 4, 820, 'ok', 'Bonifico'], [10, 'Sara Conti', 3, 8, 3, 690, 'att', 'Carta'],
    [11, 'Davide Moro', 5, 9, 5, 950, 'ok', 'Carta'], [12, 'Irene Villa', 0, 10, 3, 450, 'ok', 'Carta'],
    [13, 'Franco Dell’Orto', 4, 11, 2, 520, 'att', 'Bonifico']
  ].map(function (r) { return { id: r[0], g: r[1], c: r[2], s: r[3], n: r[4], imp: r[5], st: r[6], pay: r[7] }; });
  var STORICO = { 'Marta Rossi': [4, 1720], 'Luca Bianchi': [1, 180], 'Studio Verdi': [7, 4290], 'Elena Parisi': [2, 730], 'Giorgio Tosi': [0, 0], 'Anna Galli': [5, 2100], 'Paolo Neri': [3, 990], 'Chiara Fumi': [1, 250], 'Hotel Aurora srl': [9, 7400], 'Sara Conti': [0, 0], 'Davide Moro': [2, 640], 'Irene Villa': [6, 2380], 'Franco Dell’Orto': [1, 300] };
  var SERIE = {
    mese: { lab: 'ultime 7 settimane', k: [128, 18400, 74], d: ['+12%', '+7%', '−3 pt'], neg: [0, 0, 1], sp: [[14, 17, 15, 22, 19, 26, 24], [5200, 6400, 5800, 8100, 7000, 9600, 8800], [70, 73, 72, 78, 76, 75, 74]],
      b: [['28 set', 5200, 14, 4600, 13], ['05 ott', 6400, 17, 5900, 15], ['12 ott', 5800, 15, 6100, 16], ['19 ott', 8100, 22, 6900, 19], ['26 ott', 7000, 19, 6200, 17], ['02 nov', 9600, 26, 8200, 22], ['09 nov', 8800, 24, 8000, 21]] },
    anno: { lab: 'ultimi 12 mesi', k: [1460, 212300, 69], d: ['+9%', '+11%', '+2 pt'], neg: [0, 0, 0], sp: [[74, 58, 66, 88, 104, 128, 152, 171, 166, 134, 112, 126], [12400, 9800, 10600, 14200, 17100, 21300, 26400, 31200, 29100, 22300, 18500, 20700], [48, 42, 46, 55, 61, 68, 77, 86, 84, 72, 66, 69]],
      b: [['dic', 12400, 74, 11000, 68], ['gen', 9800, 58, 9100, 55], ['feb', 10600, 66, 9800, 61], ['mar', 14200, 88, 12600, 80], ['apr', 17100, 104, 15400, 96], ['mag', 21300, 128, 19000, 117], ['giu', 26400, 152, 23100, 139], ['lug', 31200, 171, 28200, 158], ['ago', 29100, 166, 27800, 160], ['set', 22300, 134, 20100, 124], ['ott', 18500, 112, 17300, 107], ['nov', 20700, 126, 18100, 112]] }
  };
  var st = { sez: 'pan', per: 'mese', met: 'inc', pin: -1, sort: ['s', 1], filtro: 'tutte', ck: {}, det: null, q: '', pal: false, palQ: '', palI: 0, alert: [1, 1], xInc: 0, xPren: 0, live: 0, nextId: 14,
    feed: [['Elena Parisi ha versato la caparra · 420 €', '10 min'], ['Richiesta di Marta Rossi · Camera Blu', '32 min'], ['Promemoria inviato a Luca Bianchi', '1 h'], ['Pulizia Suite completata', '2 h']] };

  /* ---------- struttura fissa ---------- */
  root.innerHTML =
    '<div class="gl-fin"><span class="gl-pt"></span><span class="gl-pt"></span><span class="gl-pt"></span><b class="gl-crumb"></b>' +
    '<button type="button" class="gl-srch" data-pal="1"><span aria-hidden="true">⌕</span><span class="gl-srch-t">Cerca</span><kbd>Ctrl K</kbd></button>' +
    '<button type="button" class="gl-bell" data-bell="1" aria-label="Prenotazioni da confermare"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 0 0 4 0"/></svg><i></i></button><span class="gl-av" aria-hidden="true">FR</span></div>' +
    '<div class="gl-corpo"><nav class="gl-nav" aria-label="Sezioni del pannello"></nav><div class="gl-main"></div><div class="gl-vel" data-close="1" hidden></div><aside class="gl-dr" role="dialog" aria-label="Dettaglio" hidden></aside></div>' +
    '<div class="gl-bar-s"><span class="gl-live"><i></i> Sincronizzato</span><span class="gl-bar-h">Dati di esempio · ambiente dimostrativo</span></div>' +
    '<div class="gl-toasts" aria-live="polite"></div>' +
    '<div class="gl-pal" hidden><div class="gl-pal-b" role="dialog" aria-label="Ricerca rapida"><input type="search" placeholder="Cerca un ospite, una camera o una sezione…" autocomplete="off" aria-label="Ricerca rapida"><ul></ul><p>↑ ↓ per scegliere · Invio per aprire · Esc per chiudere</p></div></div>';
  var nav = $('.gl-nav'), main = $('.gl-main'), dr = $('.gl-dr'), vel = $('.gl-vel'), pal = $('.gl-pal'), toasts = $('.gl-toasts');
  var SEZ = [['pan', 'Panoramica', '▦'], ['cal', 'Calendario', '▤'], ['pre', 'Prenotazioni', '☰'], ['cli', 'Clienti', '☺'], ['inc', 'Incassi', '€']];

  /* ---------- utilità ---------- */
  var daConf = function () { return B.filter(function (b) { return b.st === 'att'; }).length; };
  var byId = function (id) { return B.filter(function (b) { return b.id === id; })[0]; };
  var chip = function (s) { return '<em class="chip ' + s + '">' + STL[s] + '</em>'; };
  function toast(t) {
    var e = document.createElement('div'); e.className = 'gl-toast'; e.textContent = t; toasts.appendChild(e); while (toasts.children.length > 3) toasts.firstChild.remove();
    setTimeout(function () { e.classList.add('via'); setTimeout(function () { e.remove(); }, 300); }, 3200);
  }
  function feed(t) { st.feed.unshift([t, 'adesso']); st.feed = st.feed.slice(0, 6); }
  function setSt(b, s) {
    var v = b.st;
    if (v === s) return;
    if (s === 'ok') { st.xInc += b.imp; } if (v === 'ok' && s !== 'ok') { st.xInc -= b.imp; }
    b.st = s;
    var m = { ok: 'Confermata', ann: 'Annullata', att: 'Ripristinata' }[s];
    feed(m + ' la prenotazione di ' + b.g); toast(m + ': ' + b.g);
  }
  function occupa(c, s, n) { return B.some(function (b) { return b.st !== 'ann' && b.c === c && !(s + n - 1 < b.s || s > b.s + b.n - 1); }); }
  function occupazione() {
    var t = 0; B.forEach(function (b) { if (b.st !== 'ann') t += b.n; });
    return Math.round(t / (CAM.length * NG) * 100);
  }
  function csv(rows, nome) {
    var t = 'Ospite;Camera;Arrivo;Notti;Importo;Pagamento;Stato\n' + rows.map(function (b) { return [b.g, CAM[b.c], dd(b.s), b.n, b.imp, b.pay, STL[b.st]].join(';'); }).join('\n');
    try { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + t], { type: 'text/csv' })); a.download = nome + '.csv'; document.body.appendChild(a); a.click(); a.remove(); toast('Esportate ' + rows.length + ' righe (CSV)'); } catch (e) { toast('Esportazione non disponibile qui'); }
  }
  function conta(el, a, b, fmt) {
    if (RM || a === b) { el.textContent = fmt(b); return; }
    var t0 = performance.now();
    (function f(t) { var p = Math.min(1, (t - t0) / 650), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(a + (b - a) * e); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  function spark(a) {
    var mx = Math.max.apply(null, a), mn = Math.min.apply(null, a), n = a.length - 1;
    var pts = a.map(function (v, i) { return (i / n * 100).toFixed(1) + ',' + (26 - (v - mn) / (mx - mn || 1) * 22).toFixed(1); }).join(' ');
    return '<svg class="gl-sp" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,30 ' + pts + ' 100,30"/><polyline points="' + pts + '"/></svg>';
  }
  function passo(m) { var p = Math.pow(10, Math.floor(Math.log10(m))), c = [1, 2, 2.5, 5, 10]; for (var i = 0; i < c.length; i++) if (c[i] * p >= m) return c[i] * p; return 10 * p; }

  /* ---------- viste ---------- */
  var vecchi = [0, 0, 0];
  function pan() {
    var d = SERIE[st.per], fm = [num, eur, function (n) { return Math.round(n) + '%'; }], nome = ['Prenotazioni', 'Incasso', 'Occupazione'];
    var vals = [d.k[0] + st.xPren, d.k[1] + st.xInc, d.k[2]];
    var kpi = vals.map(function (v, i) { return '<div class="gl-k"><span>' + nome[i] + '</span><strong data-k="' + i + '">' + fm[i](vecchi[i]) + '</strong><small><b class="' + (d.neg[i] ? 'neg' : 'pos') + '">' + d.d[i] + '</b> sul periodo precedente</small>' + spark(d.sp[i]) + '</div>'; }).join('');
    var ix = st.met === 'inc' ? 1 : 2, pv = st.met === 'inc' ? 3 : 4, fv = st.met === 'inc' ? eur : function (n) { return n + ' prenotazioni'; };
    var mx = Math.max.apply(null, d.b.map(function (x) { return Math.max(x[ix], x[pv]); })), sp = passo(mx / 4), top = Math.ceil(mx / sp) * sp, n = d.b.length;
    var grid = '', t; for (t = 0; t <= top; t += sp) grid += '<div class="gl-gr" style="bottom:' + (t / top * 100) + '%"><span>' + (st.met === 'inc' ? (t >= 1000 ? (t / 1000) + ' k' : t) : t) + '</span></div>';
    var cols = d.b.map(function (x, i) {
      var dl = Math.round((x[ix] - x[pv]) / x[pv] * 100);
      return '<button type="button" class="gl-col' + (st.pin === i ? ' on' : '') + '" data-b="' + i + '" aria-label="' + x[0] + ': ' + fv(x[ix]) + '"><span class="gl-tip"><b>' + x[0] + '</b>' + fv(x[ix]) + '<small>' + (dl >= 0 ? '+' : '−') + Math.abs(dl) + '% sul periodo prima</small></span><span class="gl-bar" style="height:' + (x[ix] / top * 100) + '%"></span><em>' + x[0] + '</em></button>';
    }).join('');
    var line = d.b.map(function (x, i) { return ((i + .5) / n * 100).toFixed(2) + ',' + (100 - x[pv] / top * 100).toFixed(2); }).join(' ');
    var sel = st.pin >= 0 ? '<b>' + d.b[st.pin][0] + '</b> · ' + fv(d.b[st.pin][ix]) + ' · periodo prima ' + fv(d.b[st.pin][pv]) : 'Passa o tocca una barra per il dettaglio. La linea tratteggiata è il periodo precedente.';
    var al = [['Tre arrivi senza pulizia assegnata, domani', 'Assegna'], ['L’occupazione di fine mese è sotto la media', 'Proponi offerta']].map(function (a, i) {
      return st.alert[i] ? '<div class="gl-al"><span class="gl-al-i">!</span><p>' + a[0] + '</p><button type="button" data-a="' + i + '">' + a[1] + '</button></div>' : '<div class="gl-al ok"><span class="gl-al-i">✓</span><p>Fatto: ' + a[0].toLowerCase() + '</p></div>';
    }).join('');
    var arr = B.filter(function (b) { return b.st !== 'ann' && b.s >= OGGI; }).sort(function (a, b) { return a.s - b.s; }).slice(0, 4).map(function (b) { return '<li><button type="button" data-id="' + b.id + '"><b>' + esc(b.g) + '</b><small>' + dd(b.s) + ' · ' + CAM[b.c] + '</small></button>' + chip(b.st) + '</li>'; }).join('');
    main.innerHTML = '<div class="gl-top"><div><h3>Tutto sotto controllo.</h3><p class="gl-sub">Aggiornato adesso · ' + daConf() + ' da confermare</p></div><div class="gl-seg" role="group" aria-label="Periodo"><button type="button" data-p="mese"' + (st.per === 'mese' ? ' aria-pressed="true"' : '') + '>Mese</button><button type="button" data-p="anno"' + (st.per === 'anno' ? ' aria-pressed="true"' : '') + '>Anno</button></div></div>' +
      '<div class="gl-ks">' + kpi + '</div>' +
      '<div class="gl-due"><div class="gl-graf"><div class="gl-graf-t"><b>Andamento</b><div class="gl-seg gl-seg-s" role="group" aria-label="Cosa mostrare"><button type="button" data-m="inc"' + (st.met === 'inc' ? ' aria-pressed="true"' : '') + '>Incassi</button><button type="button" data-m="pre"' + (st.met === 'pre' ? ' aria-pressed="true"' : '') + '>Prenotazioni</button></div><span>' + d.lab + '</span></div>' +
      '<div class="gl-plot' + (n > 8 ? ' dens' : '') + '">' + grid + '<svg class="gl-prev" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + line + '"/></svg><div class="gl-cols">' + cols + '</div></div><p class="gl-sel">' + sel + '</p></div>' +
      '<aside class="gl-feed"><h4>Prossimi arrivi</h4><ul class="gl-arr">' + (arr || '<li class="vuoto">Nessun arrivo in programma.</li>') + '</ul><h4>Attività</h4><ul class="gl-att">' + st.feed.map(function (f) { return '<li><span>' + esc(f[0]) + '</span><small>' + f[1] + '</small></li>'; }).join('') + '</ul></aside></div>' +
      '<div class="gl-als">' + al + '</div>';
    main.querySelectorAll('[data-k]').forEach(function (el) { var i = +el.dataset.k; conta(el, vecchi[i], vals[i], fm[i]); vecchi[i] = vals[i]; });
  }

  function cal() {
    var occ = occupazione(), liberi = CAM.filter(function (c, i) { return !occupa(i, OGGI, 1); }).length;
    var head = '<div class="gl-cg gl-cg-h"><span></span>' + Array.apply(null, Array(NG)).map(function (_, i) { var d = DAY0 + i; return '<span class="' + (i + 1 === OGGI ? 'oggi' : '') + '"><small>' + WD[(1 + i) % 7] + '</small>' + (d <= 30 ? d : d - 30) + '</span>'; }).join('') + '</div>';
    var rows = CAM.map(function (nm, c) {
      var bs = B.filter(function (b) { return b.c === c; }).map(function (b) {
        return '<button type="button" class="gl-bk ' + b.st + '" style="grid-column:' + (b.s + 1) + ' / span ' + b.n + '" data-id="' + b.id + '" title="' + esc(b.g) + '"><span>' + esc(b.g) + '</span></button>';
      }).join('');
      return '<div class="gl-cg gl-cg-r"><b>' + nm + '</b>' + bs + '</div>';
    }).join('');
    main.innerHTML = '<div class="gl-top"><div><h3>Calendario</h3><p class="gl-sub">Dal 10 al 23 novembre · ' + occ + '% occupato · ' + liberi + ' camere libere oggi</p></div><div class="gl-leg"><i class="ok"></i>Confermata<i class="att"></i>Da confermare<i class="ann"></i>Annullata</div></div>' +
      '<div class="gl-cal" role="group" aria-label="Calendario delle camere">' + head + rows + '</div><p class="gl-sel">Tocca una prenotazione per aprirla, confermarla o annullarla.</p>';
  }

  function righe() {
    var k = st.sort[0], dir = st.sort[1];
    return B.filter(function (b) { return st.filtro === 'tutte' || b.st === st.filtro; }).sort(function (a, b) {
      var x = a[k], y = b[k]; if (typeof x === 'string') return x.localeCompare(y) * dir; return (x - y) * dir || a.id - b.id;
    });
  }
  function pre() {
    var r = righe(), cnt = function (s) { return B.filter(function (b) { return s === 'tutte' || b.st === s; }).length; };
    var nsel = Object.keys(st.ck).filter(function (i) { return st.ck[i]; }).length;
    var fl = [['tutte', 'Tutte'], ['att', 'Da confermare'], ['ok', 'Confermate'], ['ann', 'Annullate']].map(function (f) { return '<button type="button" data-f="' + f[0] + '"' + (st.filtro === f[0] ? ' aria-pressed="true"' : '') + '>' + f[1] + ' <i>' + cnt(f[0]) + '</i></button>'; }).join('');
    var th = function (k, t, cl) { var on = st.sort[0] === k; return '<th class="' + (cl || '') + '" aria-sort="' + (on ? (st.sort[1] > 0 ? 'ascending' : 'descending') : 'none') + '"><button type="button" data-sort="' + k + '">' + t + '<i aria-hidden="true">' + (on ? (st.sort[1] > 0 ? '↑' : '↓') : '') + '</i></button></th>'; };
    var allck = r.length && r.every(function (b) { return st.ck[b.id]; });
    main.innerHTML = '<div class="gl-top"><div><h3>Prenotazioni</h3><p class="gl-sub">' + r.length + ' in elenco · ordinate per ' + ({ g: 'ospite', s: 'arrivo', n: 'notti', imp: 'importo' }[st.sort[0]]) + '</p></div><button type="button" class="gl-sec" data-exp="1">Esporta CSV</button></div>' +
      '<div class="gl-seg gl-fl" role="group" aria-label="Filtro">' + fl + '</div>' +
      (nsel ? '<div class="gl-bulk"><b>' + nsel + ' selezionate</b><button type="button" data-bulk="ok">Conferma</button><button type="button" data-bulk="ann" class="sec">Annulla</button></div>' : '') +
      '<div class="gl-tw"><table class="gl-t"><thead><tr><th class="ck"><input type="checkbox" data-ckall="1" aria-label="Seleziona tutte"' + (allck ? ' checked' : '') + '></th>' + th('g', 'Ospite') + th('s', 'Arrivo') + th('n', 'Notti', 'hm') + '<th class="hm">Camera</th>' + th('imp', 'Importo', 'r') + '<th>Stato</th></tr></thead><tbody>' +
      (r.length ? r.map(function (b) { return '<tr' + (st.ck[b.id] ? ' class="sel"' : '') + '><td class="ck"><input type="checkbox" data-ck="' + b.id + '" aria-label="Seleziona ' + esc(b.g) + '"' + (st.ck[b.id] ? ' checked' : '') + '></td><td><button type="button" class="gl-l" data-id="' + b.id + '">' + esc(b.g) + '</button></td><td>' + dd(b.s) + '</td><td class="hm">' + b.n + '</td><td class="hm">' + CAM[b.c] + '</td><td class="r">' + eur(b.imp) + '</td><td>' + chip(b.st) + '</td></tr>'; }).join('') : '<tr><td colspan="7" class="vuoto">Nessuna prenotazione in questo elenco.</td></tr>') + '</tbody></table></div>';
  }

  function clienti() {
    var m = {}; B.forEach(function (b) { (m[b.g] = m[b.g] || []).push(b); });
    return Object.keys(m).map(function (g) {
      var h = STORICO[g] || [0, 0], vv = m[g].filter(function (b) { return b.st !== 'ann'; });
      return { g: g, v: h[0] + vv.length, t: h[1] + vv.reduce(function (a, b) { return a + b.imp; }, 0), b: m[g] };
    }).sort(function (a, b) { return b.t - a.t; });
  }
  function listaCli() {
    var q = st.q.trim().toLowerCase(), r = clienti().filter(function (c) { return !q || c.g.toLowerCase().indexOf(q) > -1; });
    return r.length ? '<table class="gl-t"><thead><tr><th>Cliente</th><th class="hm">Soggiorni</th><th class="r">Speso</th><th>Livello</th></tr></thead><tbody>' + r.map(function (c) { return '<tr><td><button type="button" class="gl-l" data-cl="' + esc(c.g) + '">' + esc(c.g) + '</button></td><td class="hm">' + c.v + '</td><td class="r">' + eur(c.t) + '</td><td><em class="chip ' + (c.v >= 5 ? 'vip' : '') + '">' + (c.v >= 5 ? 'Abituale' : c.v ? 'Ritorno' : 'Nuovo') + '</em></td></tr>'; }).join('') + '</tbody></table>' : '<p class="vuoto">Nessun cliente con questo nome.</p>';
  }
  function cli() {
    main.innerHTML = '<div class="gl-top"><div><h3>Clienti</h3><p class="gl-sub">' + clienti().length + ' clienti · ordinati per spesa</p></div><label class="gl-cerca"><span class="sr">Cerca un cliente</span><input type="search" placeholder="Cerca un cliente…" value="' + esc(st.q) + '" autocomplete="off"></label></div><div class="gl-tw" id="gl-res">' + listaCli() + '</div>';
    $('.gl-cerca input').addEventListener('input', function (e) { st.q = e.target.value; $('#gl-res').innerHTML = listaCli(); });
  }

  function inc() {
    var ok = B.filter(function (b) { return b.st === 'ok'; }), at = B.filter(function (b) { return b.st === 'att'; });
    var lordo = ok.reduce(function (a, b) { return a + b.imp; }, 0), da = at.reduce(function (a, b) { return a + b.imp; }, 0), netto = lordo / 1.1, iva = lordo - netto;
    var met = {}; ok.forEach(function (b) { met[b.pay] = (met[b.pay] || 0) + b.imp; });
    var ks = Object.keys(met).sort(function (a, b) { return met[b] - met[a]; }), cl = ['#6b46d8', '#e8873a', '#2e8b57', '#9b8bd8'];
    main.innerHTML = '<div class="gl-top"><div><h3>Incassi</h3><p class="gl-sub">Soggiorni dei prossimi 14 giorni</p></div><button type="button" class="gl-sec" data-exp="ok">Esporta CSV</button></div>' +
      '<div class="gl-ks"><div class="gl-k"><span>Incassato (lordo)</span><strong>' + eur(lordo) + '</strong><small>' + ok.length + ' prenotazioni confermate</small></div><div class="gl-k"><span>Da incassare</span><strong>' + eur(da) + '</strong><small>' + at.length + ' da confermare</small></div><div class="gl-k"><span>Netto · IVA 10%</span><strong>' + eur(netto) + '</strong><small>IVA ' + eur(iva) + '</small></div></div>' +
      '<div class="gl-graf"><div class="gl-graf-t"><b>Come hanno pagato</b><span>' + eur(lordo) + '</span></div><div class="gl-stk">' + ks.map(function (k, i) { return '<span style="flex:' + met[k] + ';background:' + cl[i % 4] + '" title="' + k + '"></span>'; }).join('') + '</div><ul class="gl-stl">' + ks.map(function (k, i) { return '<li><i style="background:' + cl[i % 4] + '"></i>' + k + '<b>' + eur(met[k]) + '</b><small>' + Math.round(met[k] / lordo * 100) + '%</small></li>'; }).join('') + '</ul></div>' +
      '<div class="gl-tw"><table class="gl-t"><thead><tr><th>Ospite</th><th>Data</th><th class="hm">Metodo</th><th class="r">Importo</th></tr></thead><tbody>' + ok.sort(function (a, b) { return a.s - b.s; }).map(function (b) { return '<tr><td><button type="button" class="gl-l" data-id="' + b.id + '">' + esc(b.g) + '</button></td><td>' + dd(b.s) + '</td><td class="hm">' + b.pay + '</td><td class="r">' + eur(b.imp) + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }

  /* ---------- scheda di dettaglio ---------- */
  function drawer() {
    var d = st.det;
    dr.hidden = vel.hidden = !d;
    root.classList.toggle('gl-aperto', !!d);
    if (!d) return;
    if (d.t === 'b') {
      var b = byId(d.id);
      var az = b.st === 'att' ? '<button type="button" data-st="' + b.id + ':ok">Conferma prenotazione</button><button type="button" class="sec" data-st="' + b.id + ':ann">Annulla</button>' : b.st === 'ok' ? '<button type="button" data-rem="' + b.id + '">Invia promemoria</button><button type="button" class="sec" data-st="' + b.id + ':ann">Annulla</button>' : '<button type="button" data-st="' + b.id + ':att">Ripristina</button>';
      dr.innerHTML = '<header><b>Prenotazione n. ' + b.id + '</b><button type="button" data-close="1" aria-label="Chiudi">×</button></header><div class="gl-dr-c"><h4>' + esc(b.g) + '</h4>' + chip(b.st) + '<dl><div><dt>Camera</dt><dd>' + CAM[b.c] + '</dd></div><div><dt>Arrivo</dt><dd>' + dd(b.s) + '</dd></div><div><dt>Partenza</dt><dd>' + dd(b.s + b.n) + '</dd></div><div><dt>Notti</dt><dd>' + b.n + '</dd></div><div><dt>Importo</dt><dd>' + eur(b.imp) + '</dd></div><div><dt>Pagamento</dt><dd>' + b.pay + '</dd></div></dl><div class="gl-dr-az">' + az + '</div><button type="button" class="gl-l" data-cl="' + esc(b.g) + '">Vedi la scheda cliente →</button></div>';
    } else {
      var c = clienti().filter(function (x) { return x.g === d.g; })[0];
      dr.innerHTML = '<header><b>Scheda cliente</b><button type="button" data-close="1" aria-label="Chiudi">×</button></header><div class="gl-dr-c"><h4>' + esc(c.g) + '</h4><em class="chip ' + (c.v >= 5 ? 'vip' : '') + '">' + (c.v >= 5 ? 'Abituale' : c.v ? 'Ritorno' : 'Nuovo') + '</em><dl><div><dt>Soggiorni</dt><dd>' + c.v + '</dd></div><div><dt>Speso in tutto</dt><dd>' + eur(c.t) + '</dd></div></dl><h5>Prenotazioni in corso</h5><ul class="gl-arr">' + c.b.map(function (b) { return '<li><button type="button" data-id="' + b.id + '"><b>' + dd(b.s) + ' · ' + CAM[b.c] + '</b><small>' + b.n + ' notti · ' + eur(b.imp) + '</small></button>' + chip(b.st) + '</li>'; }).join('') + '</ul></div>';
    }
  }

  /* ---------- ricerca rapida ---------- */
  function palRes() {
    var q = st.palQ.trim().toLowerCase(), out = [];
    SEZ.forEach(function (s) { if (!q || s[1].toLowerCase().indexOf(q) > -1) out.push(['Vai a', s[1], 's:' + s[0]]); });
    B.forEach(function (b) { if (q && (b.g.toLowerCase().indexOf(q) > -1 || ('camera ' + CAM[b.c]).toLowerCase().indexOf(q) > -1 || CAM[b.c].toLowerCase() === q)) out.push(['Prenotazione', b.g + ' · ' + CAM[b.c] + ' · ' + dd(b.s), 'b:' + b.id]); });
    return out.slice(0, 8);
  }
  function drawPal() {
    var r = palRes(); st.palI = Math.min(st.palI, Math.max(0, r.length - 1));
    $('.gl-pal ul').innerHTML = r.length ? r.map(function (x, i) { return '<li><button type="button" data-pi="' + x[2] + '"' + (i === st.palI ? ' class="on"' : '') + '><small>' + x[0] + '</small>' + esc(x[1]) + '</button></li>'; }).join('') : '<li class="vuoto">Nessun risultato.</li>';
  }
  function apriPal(v) {
    st.pal = v; pal.hidden = !v;
    if (v) { st.palQ = ''; st.palI = 0; var i = $('.gl-pal input'); i.value = ''; drawPal(); setTimeout(function () { i.focus(); }, 30); }
  }
  function vai(x) {
    apriPal(false);
    if (x.indexOf('s:') === 0) { st.sez = x.slice(2); st.det = null; } else { st.det = { t: 'b', id: +x.slice(2) }; }
    draw();
  }

  /* ---------- disegno ---------- */
  function draw() {
    nav.innerHTML = SEZ.map(function (s) { var n = s[0] === 'pre' && daConf() ? '<i>' + daConf() + '</i>' : ''; return '<button type="button" data-s="' + s[0] + '"' + (st.sez === s[0] ? ' aria-current="page"' : '') + '><span class="gl-ic" aria-hidden="true">' + s[2] + '</span>' + s[1] + n + '</button>'; }).join('');
    $('.gl-crumb').textContent = 'Spazio / Gestione / ' + SEZ.filter(function (s) { return s[0] === st.sez; })[0][1];
    var bell = $('.gl-bell i'); bell.textContent = daConf(); bell.hidden = !daConf();
    ({ pan: pan, cal: cal, pre: pre, cli: cli, inc: inc })[st.sez]();
    drawer();
  }

  /* ---------- eventi ---------- */
  root.addEventListener('click', function (e) {
    var t = e.target.closest('button,input'); if (!t || !root.contains(t)) return;
    var D = t.dataset;
    if (t.type === 'checkbox') return;
    if (D.s) { st.sez = D.s; st.det = null; draw(); }
    else if (D.p) { st.per = D.p; st.pin = -1; draw(); }
    else if (D.m) { st.met = D.m; st.pin = -1; draw(); }
    else if (D.b) { st.pin = st.pin === +D.b ? -1 : +D.b; draw(); }
    else if (D.a) { st.alert[+D.a] = 0; feed(D.a === '0' ? 'Pulizie assegnate per domani' : 'Offerta di fine mese inviata ai clienti abituali'); toast(D.a === '0' ? 'Pulizie assegnate' : 'Offerta pronta da inviare'); draw(); }
    else if (D.f) { st.filtro = D.f; st.ck = {}; draw(); }
    else if (D.sort) { st.sort = st.sort[0] === D.sort ? [D.sort, -st.sort[1]] : [D.sort, D.sort === 'imp' ? -1 : 1]; draw(); }
    else if (D.id) { st.det = { t: 'b', id: +D.id }; drawer(); }
    else if (D.cl) { st.det = { t: 'c', g: D.cl }; drawer(); }
    else if (D.close) { st.det = null; drawer(); }
    else if (D.st) { var p = D.st.split(':'); setSt(byId(+p[0]), p[1]); draw(); }
    else if (D.rem) { toast('Promemoria inviato a ' + byId(+D.rem).g); feed('Promemoria inviato a ' + byId(+D.rem).g); draw(); }
    else if (D.bulk) { var ids = Object.keys(st.ck).filter(function (i) { return st.ck[i]; }); ids.forEach(function (i) { setSt(byId(+i), D.bulk); }); st.ck = {}; draw(); }
    else if (D.exp) { csv(D.exp === 'ok' ? B.filter(function (b) { return b.st === 'ok'; }) : righe(), 'prenotazioni'); }
    else if (D.bell) { st.sez = 'pre'; st.filtro = 'att'; st.det = null; draw(); }
    else if (D.pal) { apriPal(true); }
    else if (D.pi) { vai(D.pi); }
  });
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.dataset.ck) { st.ck[t.dataset.ck] = t.checked; draw(); }
    else if (t.dataset.ckall) { righe().forEach(function (b) { st.ck[b.id] = t.checked; }); draw(); }
  });
  $('.gl-pal input').addEventListener('input', function (e) { st.palQ = e.target.value; st.palI = 0; drawPal(); });
  pal.addEventListener('click', function (e) { if (e.target === pal) apriPal(false); });
  root.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); apriPal(!st.pal); return; }
    if (st.pal) {
      var n = palRes().length;
      if (e.key === 'ArrowDown') { e.preventDefault(); st.palI = (st.palI + 1) % Math.max(n, 1); drawPal(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); st.palI = (st.palI + n - 1) % Math.max(n, 1); drawPal(); }
      else if (e.key === 'Enter') { var r = palRes()[st.palI]; if (r) vai(r[2]); }
      return;
    }
  });
  /* Esc chiude scheda e ricerca anche quando il focus è andato perso dopo un'azione */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (st.pal) apriPal(false); else if (st.det) { st.det = null; drawer(); }
  });

  /* ---------- nuove richieste in tempo reale (solo mentre il pannello è visibile) ---------- */
  var NUOVI = ['Silvia Marchi', 'Tommaso Gatti', 'Noemi Riva', 'Carlo Ferri'], visibile = false;
  function arrivo() {
    if (!visibile || document.hidden || st.live >= NUOVI.length || st.pal) return;
    var n = 2 + st.live % 2, c, s, trovato = false;
    for (c = 0; c < CAM.length && !trovato; c++) for (s = OGGI + 1; s + n - 1 <= NG && !trovato; s++) if (!occupa(c, s, n)) { trovato = true; break; }
    if (!trovato) return;
    c--;
    var b = { id: st.nextId++, g: NUOVI[st.live], c: c, s: s, n: n, imp: 190 * n, st: 'att', pay: 'Carta' };
    st.live++; st.xPren++; B.push(b); feed('Nuova richiesta di ' + b.g + ' · Camera ' + CAM[c]); toast('Nuova richiesta: ' + b.g + ' · ' + dd(b.s));
    if (!st.det) draw(); else { var d = st.det; draw(); st.det = d; drawer(); }
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visibile = en[0].isIntersecting; }, { threshold: .3 }).observe(root);
  else visibile = true;
  setInterval(arrivo, 9000);

  draw();
})();

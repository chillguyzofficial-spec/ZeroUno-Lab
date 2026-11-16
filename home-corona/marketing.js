/* Pagina Marketing: i quattro passi sono sempre visibili; scegliendo un'attività cambiano annuncio, pagina e messaggio. Nessun invio. */
(() => {
  'use strict';
  const dati = document.getElementById('dati-marketing'); if (!dati) return;
  const d = JSON.parse(dati.textContent), V = '?v=20261114f';
  const q = k => document.querySelector('[data-j="' + k + '"]');
  const scegli = id => {
    const s = d.settori.find(x => x.id === id); if (!s) return;
    document.querySelectorAll('[data-sector]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sector === id)));
    if (s.pc) q('pc').src = s.pc + V;
    q('img').src = s.immagine + V; q('tel').src = s.screenshot + V;
    q('ad').textContent = s.ad; q('cta').textContent = s.cta; q('msg').textContent = s.msg;
    if (s.didPagina) q('pg').textContent = s.didPagina;
    q('img').alt = 'Visual illustrativo: ' + s.nome; q('tel').alt = 'Schermata del sito, esempio ' + s.nome;
  };
  document.querySelectorAll('[data-sector]').forEach(b => b.addEventListener('click', () => scegli(b.dataset.sector)));
  scegli(d.iniziale[0]);
})();

/* Percorso come stepper: a sinistra i quattro passaggi, a destra lo schermo del passaggio scelto. Parte da solo finché non si tocca qualcosa. */
(() => {
  'use strict';
  const ol = document.querySelector('#percorso .mk-j'); if (!ol || ol.dataset.st) return;
  ol.dataset.st = '1';
  const li = Array.from(ol.children);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wrap = document.createElement('div'); wrap.className = 'mk-st';
  const nav = document.createElement('div'); nav.className = 'mk-st-nav'; nav.setAttribute('role', 'tablist');
  const btn = li.map((l, i) => {
    const n = l.querySelector('.mk-j-n'), p = l.querySelector(':scope > p');
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.i = i;
    const num = document.createElement('span'); num.className = 'mk-st-num'; num.textContent = String(i + 1).padStart(2, '0');
    const t = document.createElement('span'); t.className = 'mk-st-t'; t.textContent = (n ? n.textContent : '').replace(/^\d+\s*·\s*/, '');
    b.append(num, t);
    if (p) { p.classList.add('mk-st-d'); b.append(p); }
    if (n) n.remove();
    nav.append(b); return b;
  });
  ol.parentNode.insertBefore(wrap, ol); wrap.append(nav, ol);
  ol.classList.add('mk-st-scena');
  let cur = 0, timer = null, mano = false;
  const vai = (i, daUtente) => {
    cur = (i + li.length) % li.length;
    li.forEach((l, k) => { l.hidden = k !== cur; l.classList.toggle('mk-st-on', k === cur); });
    btn.forEach((b, k) => { b.setAttribute('aria-selected', String(k === cur)); b.classList.toggle('on', k === cur); });
    if (daUtente) { mano = true; clearInterval(timer); }
  };
  btn.forEach((b, i) => b.addEventListener('click', () => vai(i, true)));
  document.querySelectorAll('#percorso [data-sector]').forEach(b => b.addEventListener('click', () => { mano = true; clearInterval(timer); }));
  vai(0, false);
  if (!RM && 'IntersectionObserver' in window) {
    let vis = false;
    new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { threshold: .4 }).observe(wrap);
    timer = setInterval(() => { if (!vis || mano || document.hidden) return; vai(cur + 1, false); }, 4200);
  }
})();

/* Percorso: lo schermo è un portatile chiuso che si apre quando la sezione entra in vista. Senza JS o con «riduci movimento» resta aperto. */
(() => {
  'use strict';
  const sc = document.querySelector('#percorso .mk-st-scena'); if (!sc || sc.parentNode.classList.contains('mk-lap')) return;
  const lap = document.createElement('div'); lap.className = 'mk-lap';
  sc.parentNode.insertBefore(lap, sc);
  const lid = document.createElement('div'); lid.className = 'mk-lap-lid'; lid.append(sc);
  const base = document.createElement('div'); base.className = 'mk-lap-base'; base.setAttribute('aria-hidden', 'true');
  lap.append(lid, base);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  lap.classList.add('chiuso');
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { setTimeout(() => lap.classList.remove('chiuso'), 250); io.disconnect(); } }, { threshold: .45 });
  io.observe(lap);
  setTimeout(() => lap.classList.remove('chiuso'), 6000); /* rete di sicurezza */
})();


/* Portatile: pulsante per chiuderlo e riaprirlo; scegliere un passaggio lo riapre. */
(() => {
  'use strict';
  const lap = document.querySelector('#percorso .mk-lap'); if (!lap || lap.querySelector('.mk-lap-btn')) return;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'mk-lap-btn';
  const agg = () => { const chiuso = lap.classList.contains('chiuso'); b.textContent = chiuso ? 'Apri il computer' : 'Chiudi il computer'; b.setAttribute('aria-pressed', String(chiuso)); };
  b.addEventListener('click', () => { lap.classList.toggle('chiuso'); agg(); });
  lap.append(b);
  new MutationObserver(agg).observe(lap, { attributes: true, attributeFilter: ['class'] });
  document.querySelectorAll('#percorso .mk-st-nav button, #percorso [data-sector]').forEach(x => x.addEventListener('click', () => { if (lap.classList.contains('chiuso')) lap.classList.remove('chiuso'); }));
  agg();
})();


/* Percorso: contatto e misura come finestre sul desktop (WhatsApp Web e pannello risultati). Dati di esempio dichiarati. */
(() => {
  'use strict';
  const li = document.querySelectorAll('#percorso .mk-st-scena > li'); if (li.length < 4 || li[2].dataset.fin) return;
  li[2].dataset.fin = '1';
  const msg = (document.querySelector('#percorso [data-j="msg"]') || {}).textContent || '';
  const barra = t => '<div class="mk-win-bar"><i></i><i></i><i></i><span>' + t + '</span></div>';
  li[2].querySelector('.mk-j-v').innerHTML = '<div class="mk-desk"><div class="mk-win mk-wa">' + barra('web.whatsapp.com') +
    '<div class="mk-wa-in"><div class="mk-wa-lista"><b>Chat</b><div class="mk-wa-r on"><u></u><span>Nuova richiesta</span><small>ora</small></div><div class="mk-wa-r"><u></u><span>Cliente</span><small>ieri</small></div><div class="mk-wa-r"><u></u><span>Fornitore</span><small>lun</small></div></div>' +
    '<div class="mk-wa-chat"><div class="mk-wa-top"><u></u><span>Nuova richiesta<small>online</small></span></div><div class="mk-wa-corpo"><div class="mk-wa-b"><span data-j="msg">' + msg + '</span><small>12:41 ✓✓</small></div></div><div class="mk-wa-in2">Scrivi un messaggio</div></div></div></div><span class="mk-esempio">Esempio</span></div>';
  li[3].querySelector('.mk-j-v').innerHTML = '<div class="mk-desk mk-desk2"><div class="mk-win mk-rep">' + barra('Risultati campagne · esempio') +
    '<div class="mk-rep-in"><div class="mk-rep-k"><div><small>Richieste</small><b>Quante sono arrivate</b></div><div><small>Provenienza</small><b>Da quali annunci</b></div><div><small>Costo</small><b>Quanto per richiesta</b></div></div>' +
    '<div class="mk-rep-g"><div class="mk-rep-s"></div></div><div class="mk-rep-t"><span>Annuncio feed</span><i style="--w:82%"></i><span>Annuncio storie</span><i style="--w:54%"></i><span>Ricerca Google</span><i style="--w:67%"></i></div></div></div><span class="mk-esempio">Dati di esempio, non reali</span></div>';
})();


/* Percorso: l'annuncio è un post sponsorizzato (stile social) dentro una finestra del browser. Esempio dichiarato. */
(() => {
  'use strict';
  const li = document.querySelector('#percorso .mk-st-scena > li'); if (!li || li.dataset.post) return;
  li.dataset.post = '1';
  const v = li.querySelector('.mk-j-v'); if (!v) return;
  const img = v.querySelector('[data-j="img"]'), ad = (v.querySelector('[data-j="ad"]') || {}).textContent || '', cta = (v.querySelector('[data-j="cta"]') || {}).textContent || '';
  const src = img ? img.getAttribute('src') : '', alt = img ? img.alt : '';
  v.innerHTML = '<div class="mk-desk mk-desk3"><div class="mk-win mk-soc"><div class="mk-win-bar"><i></i><i></i><i></i><span>instagram.com</span></div>' +
    '<div class="mk-soc-in"><div class="mk-soc-post">' +
    '<div class="mk-soc-top"><u></u><span><b>la_tua_attivita</b><small>Sponsorizzata</small></span><em>•••</em></div>' +
    '<div class="mk-soc-img"><img data-j="img" src="' + src + '" alt="' + alt + '" decoding="async"></div>' +
    '<div class="mk-soc-cta"><span data-j="cta">' + cta + '</span><i aria-hidden="true">›</i></div>' +
    '<div class="mk-soc-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.1 5 6.4 5c2 0 3.6 1.2 4.4 2.7h.4C12 6.2 13.600 5 15.600 5c3.300 0 5.300 3.300 3.900 6.700C19.500 16.400 12 21 12 21z"/></svg><svg viewBox="0 0 24 24"><path d="M21 12a8.500 8.500 0 0 1-12.300 7.600L3 21l1.500-5.300A8.500 8.500 0 1 1 21 12z"/></svg><svg viewBox="0 0 24 24"><path d="M22 3 2 11l7 3 3 7zM9 14l13-11"/></svg></div>' +
    '<p class="mk-soc-cap"><b>la_tua_attivita</b> <span data-j="ad">' + ad + '</span></p>' +
    '</div></div></div><span class="mk-esempio">Annuncio di esempio</span></div>';
})();


/* Annuncio: dettagli del feed (barra dell'app, mi piace, orario) */
(() => {
  const post = document.querySelector('#percorso .mk-soc-post'); if (!post || post.dataset.r) return; post.dataset.r = '1';
  const bar = document.createElement('div'); bar.className = 'mk-soc-app'; bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<span class="mk-soc-logo">Instagram</span><i></i><svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.1 5 6.4 5c2 0 3.6 1.2 4.4 2.7h.4C12 6.2 13.6 5 15.6 5c3.3 0 5.3 3.3 3.9 6.7C19.5 16.4 12 21 12 21z"/></svg>';
  post.parentNode.insertBefore(bar, post);
  const ic = post.querySelector('.mk-soc-ic');
  if (ic) { const lk = document.createElement('div'); lk.className = 'mk-soc-lk'; lk.innerHTML = '<span><u></u><u></u><u></u></span><b>Piace a <em>chi ti ha già scelto</em> e ad altri</b>'; ic.after(lk); }
  const cap = post.querySelector('.mk-soc-cap'); if (cap) { const t = document.createElement('small'); t.className = 'mk-soc-ora'; t.textContent = 'SPONSORIZZATA · MILANO'; cap.after(t); }
  const cta = post.querySelector('.mk-soc-cta'); if (cta) cta.classList.add('mk-soc-btn');
})();


/* Annuncio realistico: ogni attività ha nome, profilo e creatività con logo e titolo (esempio dichiarato) */
(() => {
  'use strict';
  const post = document.querySelector('#percorso .mk-soc-post'); if (!post || post.dataset.v) return; post.dataset.v = '1';
  const B = {
    ristorante: { n: 'Hedoné', h: 'hedone_vimodrone', l: 'Vimodrone · Naviglio Martesana', t: 'LOUNGE BAR & RESTAURANT', tag: '#brace #vimodrone', foto: '../assets/img/marketing/hedone-hero0.jpg', pos: '30% 18%', cl: 'oro' },
    studio: { n: 'Studio Lumea', h: 'studiolumea_milano', l: 'Milano · Zona Wagner', t: 'STUDIO DENTISTICO', tag: '#dentista #milano', cl: 'chiaro' },
    moda: { n: 'Ossidiana', h: 'ossidiana.atelier', l: 'Milano', t: 'ALTA SARTORIA · DAL 1928', tag: '#altasartoria #milano', cl: 'scuro' },
    immobiliare: { n: 'Home Unity', h: 'homeunity.re', l: 'Milano · Firenze', t: 'REAL ESTATE & HOSPITALITY', tag: '#immobiliare #milano', cl: 'rosso' },
    fitness: { n: 'Cento Respiri', h: 'cento_respiri', l: 'Torino · San Salvario', t: 'PILATES REFORMER', tag: '#pilates #torino', cl: 'chiaro' }
  };
  const top = post.querySelector('.mk-soc-top'), img = post.querySelector('.mk-soc-img'), cap = post.querySelector('.mk-soc-cap');
  if (!top || !img || !cap) return;
  const nome = top.querySelector('b'), sub = top.querySelector('small'), av = top.querySelector('u');
  const cr = document.createElement('div'); cr.className = 'mk-cr';
  cr.innerHTML = '<span class="mk-cr-t"></span><b class="mk-cr-b"></b>';
  img.append(cr);
  const adOld = cap.querySelector('[data-j="ad"]'); const adTxt = adOld ? adOld.textContent : '';
  const head = document.createElement('span'); head.className = 'mk-cr-h'; head.setAttribute('data-j', 'ad'); head.textContent = adTxt;
  if (adOld) adOld.removeAttribute('data-j');
  cr.insertBefore(head, cr.querySelector('.mk-cr-b'));
  const dati = JSON.parse((document.getElementById('dati-marketing') || { textContent: '{"settori":[]}' }).textContent);
  const applica = id => {
    const b = B[id]; if (!b) return;
    const s = dati.settori.find(x => x.id === id) || {};
    nome.textContent = b.h; sub.textContent = 'Sponsorizzata · ' + b.l;
    av.textContent = b.n.charAt(0); av.className = 'mk-av ' + b.cl;
    cr.querySelector('.mk-cr-t').textContent = b.n.toUpperCase();
    cr.querySelector('.mk-cr-b').textContent = b.t;
    cr.className = 'mk-cr ' + b.cl;
    const im = img.querySelector('img'); if (b.foto) { im.src = b.foto; im.style.objectPosition = b.pos; } else im.style.objectPosition = '';
    cap.innerHTML = '<b>' + b.h + '</b> ' + (s.sub || '') + ' <span class="mk-cap-tag">' + b.tag + '</span>';
    const ora = post.querySelector('.mk-soc-ora'); if (ora) ora.textContent = 'SPONSORIZZATA · ' + b.l.toUpperCase();
  };
  document.querySelectorAll('#percorso [data-sector]').forEach(x => x.addEventListener('click', () => setTimeout(() => applica(x.dataset.sector), 30)));
  const iniz = document.querySelector('#percorso [data-sector][aria-pressed="true"]');
  applica(iniz ? iniz.dataset.sector : 'ristorante');
  /* la scelta dell'attività ricarica l'immagine: la rimettiamo dopo */
  const mo = new MutationObserver(() => { const a = document.querySelector('#percorso [data-sector][aria-pressed="true"]'); if (a && B[a.dataset.sector].foto) { const im = img.querySelector('img'); if (im.getAttribute('src').indexOf('hedone-hero0') < 0) im.src = B[a.dataset.sector].foto; } });
  mo.observe(img.querySelector('img'), { attributes: true, attributeFilter: ['src'] });
})();

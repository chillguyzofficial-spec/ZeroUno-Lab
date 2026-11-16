/* Pagine dei servizi: menu, tema, filtri per settore, anatomia, schede, confronto. Nessuna comparsa allo scorrimento, nessun effetto col mouse. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const riduci = matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Menu: si apre di lato, scompare scorrendo in giù e torna scorrendo in su ── */
  const nav = $('.nav'), menu = $('[data-menu]'), btn = $('.menu-btn');
  if (nav && menu && btn) {
    const imposta = v => { menu.classList.toggle('aperto', v); btn.setAttribute('aria-expanded', String(v)); btn.setAttribute('aria-label', v ? 'Chiudi il menu' : 'Apri il menu'); };
    btn.addEventListener('click', e => { e.stopPropagation(); imposta(!menu.classList.contains('aperto')); });
    $$('.menu-voci a').forEach(a => a.addEventListener('click', () => imposta(false)));
    document.addEventListener('click', e => { if (!menu.contains(e.target)) imposta(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('aperto')) { imposta(false); btn.focus(); } });
    const invertite = $$('.inv');
    let yPrima = scrollY, attesa = false;
    const aggiorna = () => {
      attesa = false;
      let su = false;
      for (const s of invertite) { const r = s.getBoundingClientRect(); if (r.top <= 38 && r.bottom > 38) { su = true; break; } }
      nav.classList.toggle('su-lavori', su);
      const lontano = scrollY > 80;     // il menu c'è solo in cima: scorrendo scompare (e si chiude)
      if (lontano && menu.classList.contains('aperto')) imposta(false);
      nav.classList.toggle('nascosto', lontano);
    };
    addEventListener('scroll', () => { if (!attesa) { attesa = true; requestAnimationFrame(aggiorna); } }, { passive: true });
    addEventListener('resize', aggiorna);
    aggiorna();
  }

  /* ── Tema (provvisorio, come nella home) ── */
  const radice = document.documentElement;
  const segna = () => $$('[data-tema-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.temaBtn === radice.getAttribute('data-tema'))));
  $$('[data-tema-btn]').forEach(b => b.addEventListener('click', () => {
    radice.setAttribute('data-tema', b.dataset.temaBtn);
    try { localStorage.setItem('corona-tema', b.dataset.temaBtn); } catch (_) {}
    segna();
  }));
  segna();

  /* ── Filtri per settore ── */
  const vetrina = $('[data-vetrina]'), datiEl = $('#dati-settori');
  if (vetrina && datiEl) {
    const dati = JSON.parse(datiEl.textContent), chips = $$('.sv-chip');
    const imgPc = $('[data-img-pc]', vetrina), imgTel = $('[data-img-tel]', vetrina), strip = $$('[data-strip] img');
    let t = 0;
    const scegli = id => {
      const d = dati.find(x => x.id === id); if (!d) return;
      chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.set === id)));
      const applica = () => {
        imgPc.src = '../assets/img/corona/' + id + '-L1.webp?v=20261113c'; imgTel.src = '../assets/img/corona/' + id + '-P1.webp?v=20261113c';
        strip.forEach((im, k) => { im.src = '../assets/img/corona/' + id + '-P' + ((k % 6) + 1) + '.webp?v=20261114b'; });
        $('[data-esempio]', vetrina).textContent = 'Un esempio: ' + d.esempio;
        $('[data-azione]', vetrina).textContent = d.azione;
        $('[data-punti]', vetrina).innerHTML = d.punti.map(p => '<li>' + p + '</li>').join('');
        $('[data-cta-sett]', vetrina).href = d.wa;
        vetrina.classList.remove('cambia');
      };
      clearTimeout(t);
      if (riduci.matches) applica(); else { vetrina.classList.add('cambia'); t = setTimeout(applica, 180); }
    };
    chips.forEach(c => c.addEventListener('click', () => scegli(c.dataset.set)));
  }

  /* ── Anatomia della pagina ── */
  const anat = $('[data-anat]');
  if (anat) {
    const wf = $('[data-wf]', anat), bott = $$('.sv-anat-lista button', anat);
    bott.forEach(b => b.addEventListener('click', () => {
      bott.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      wf.dataset.wf = b.dataset.b;
    }));
  }

  /* ── Schede ── */
  const schede = $('[data-tabs]');
  if (schede) {
    const tab = $$('[role="tab"]', schede), pan = $$('[role="tabpanel"]', schede);
    const vai = (i, focus) => {
      tab.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      pan.forEach((p, k) => { p.hidden = k !== i; });
      if (focus) tab[i].focus();
    };
    tab.forEach((t, i) => {
      t.addEventListener('click', () => vai(i));
      t.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); vai((i + 1) % tab.length, true); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); vai((i + tab.length - 1) % tab.length, true); }
        else if (e.key === 'Home') { e.preventDefault(); vai(0, true); }
        else if (e.key === 'End') { e.preventDefault(); vai(tab.length - 1, true); }
      });
    });
  }

  /* ── Confronto ── */
  $$('[data-conf]').forEach(conf => {
    const bott = $$('[data-c]', conf);
    bott.forEach(b => b.addEventListener('click', () => {
      conf.dataset.conf = b.dataset.c;
      bott.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }));
  });
  /* dispositivi inclinati: le schermate sono disegnate su 2000 px e scalate alla larghezza reale */
  const ang = $$('.ang');
  if (ang.length) {
    const adatta = a => { a.style.setProperty('--s', (a.getBoundingClientRect().width / (+a.dataset.w || 2000)).toFixed(5)); };
    ang.forEach(adatta);
    if ('ResizeObserver' in window) { const ro = new ResizeObserver(es => es.forEach(e => adatta(e.target))); ang.forEach(a => ro.observe(a)); }
    else addEventListener('resize', () => ang.forEach(adatta));
  }

  /* ── Marketing: demo «dal clic al cliente» (settore + 4 passi) ── */
  const mk = $('[data-mkdemo]');
  if (mk) {
    const dati = JSON.parse($('#dati-mk', mk).textContent), V = '?v=20261113c';
    const scegli = id => {
      const d = dati.sett.find(x => x.id === id); if (!d) return;
      $$('[data-mk]', mk).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mk === id)));
      $('[data-mk-img-ad]', mk).src = '../assets/img/oggetti/settore-' + d.ogg + '.webp' + V;
      $('[data-mk-img-tel]', mk).src = '../assets/img/corona/' + id + '-P1.webp' + V;
      $('[data-mk-ad]', mk).textContent = d.ad; $('[data-mk-sub]', mk).textContent = d.sub; $('[data-mk-cta]', mk).textContent = d.cta; $('[data-mk-msg]', mk).textContent = d.msg;
    };
    const passo = n => {
      mk.dataset.passo = String(n);
      $$('[data-p]', mk).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.p === n)));
      $('[data-mk-did]', mk).textContent = dati.passi[n - 1];
    };
    $$('[data-mk]', mk).forEach(b => b.addEventListener('click', () => scegli(b.dataset.mk)));
    $$('[data-p]', mk).forEach(b => b.addEventListener('click', () => passo(+b.dataset.p)));
    $$('[data-pane]', mk).forEach(p => p.addEventListener('click', () => passo(+p.dataset.pane)));
  }

  /* ── Selettori a schede (mappa del sito, percorso del negozio) ── */
  $$('[data-sel]').forEach(sel => {
    const bott = $$('[data-sel-b]', sel), pan = $$('[data-sel-p]', sel);
    const vai = k => { bott.forEach((b, i) => b.setAttribute('aria-selected', String(i === k))); pan.forEach((p, i) => { p.hidden = (i % bott.length) !== k; }); };
    bott.forEach((b, k) => b.addEventListener('click', () => vai(k)));
  });

  /* ── Entrate: elementi [data-in] salgono (o arrivano di lato) quando compaiono; solo se il movimento non è ridotto ── */
  const entra = $$('[data-in]');
  if (entra.length && !riduci.matches && 'IntersectionObserver' in window) {
    entra.forEach(e => e.classList.add('in-attesa'));
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.remove('in-attesa'); x.target.classList.add('in-fatto'); io.unobserve(x.target); } }), { threshold: 0.18 });
    entra.forEach((e, i) => { e.style.transitionDelay = ((i % 4) * 90) + 'ms'; io.observe(e); });
  }
})();

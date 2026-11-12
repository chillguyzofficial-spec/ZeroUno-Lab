/* Zero Uno Lab — landing */
(() => {
  'use strict';

  // ── Impostazioni: si cambiano solo qui ─────────────────────────────
  const CONFIG = {
    promoData: '31 dicembre 2026',
    promoFine: '2026-12-31T23:59:59+01:00', // stessa data, per i giorni che restano (veri: non ripartono mai)          // scadenza vera della promo (compare in 4 punti)
    // Dove arrivano le richieste del modulo. Vuoto = si apre WhatsApp con il messaggio già scritto.
    // Quando c'è un servizio email (es. Web3Forms o il nostro Worker), mettere qui l'indirizzo.
    endpoint: '',
    whatsapp: '393454517186',
  };

  document.querySelectorAll('[data-promo-data]').forEach(el => { el.textContent = CONFIG.promoData; });
  // giorni che restano alla fine della promo; finita la promo il riquadro non si mostra
  const giorni = document.querySelector('[data-giorni]');
  if (giorni) {
    const resto = Math.ceil((new Date(CONFIG.promoFine) - Date.now()) / 86400000);
    if (resto > 0) { giorni.textContent = resto === 1 ? 'Ultimo giorno' : 'Mancano ' + resto + ' giorni'; giorni.hidden = false; }
  }

  // ── Provenienza (utm delle inserzioni), salvata per la sessione ────
  const sorgente = (() => {
    const q = new URLSearchParams(location.search);
    const utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(k => { if (q.get(k)) utm[k] = q.get(k); });
    try {
      if (Object.keys(utm).length) sessionStorage.setItem('zul-utm', JSON.stringify(utm));
      return JSON.parse(sessionStorage.getItem('zul-utm') || '{}');
    } catch (e) { return utm; }
  })();

  // ── Progetti: giostra con frecce e punti, ogni scheda apre la finestra con computer e telefono ──
  const fila = document.querySelector('.prog-fila');
  const punti = [...document.querySelectorAll('.prog-punti span')];
  if (fila) {
    const passo = () => { const s = fila.querySelector('.prog'); return s ? s.getBoundingClientRect().width + 20 : 300; };
    document.querySelectorAll('[data-giostra]').forEach(b => b.addEventListener('click', () => {
      const fine = fila.scrollLeft + fila.clientWidth >= fila.scrollWidth - 4;
      const inizio = fila.scrollLeft <= 4;
      const dir = Number(b.dataset.giostra);
      if (dir > 0 && fine) fila.scrollTo({ left: 0, behavior: 'smooth' });
      else if (dir < 0 && inizio) fila.scrollTo({ left: fila.scrollWidth, behavior: 'smooth' });
      else fila.scrollBy({ left: dir * passo(), behavior: 'smooth' });
    }));
    fila.addEventListener('scroll', () => {
      const i = Math.round(fila.scrollLeft / passo());
      punti.forEach((p, k) => p.classList.toggle('attivo', k === Math.min(i, punti.length - 1)));
    }, { passive: true });
  }
  const dlgLavori = document.getElementById('lavori');
  const pannelli = [...dlgLavori.querySelectorAll('.vetrina')];
  let attuale = 0;
  const mostra = (i) => {
    attuale = (i + pannelli.length) % pannelli.length;
    pannelli.forEach((p, k) => { const si = k === attuale; p.hidden = !si; p.classList.remove('entra'); if (!si) ferma(p); });
    void pannelli[attuale].offsetWidth;
    pannelli[attuale].classList.add('entra');
  };
  const chiudiLavori = () => { if (dlgLavori.open) dlgLavori.close(); if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('bloccato'); };
  dlgLavori.addEventListener('close', () => { ferma(pannelli[attuale]); if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('bloccato'); });
  dlgLavori.addEventListener('click', e => { if (e.target === dlgLavori) chiudiLavori(); });
  dlgLavori.querySelector('[data-chiudi]').addEventListener('click', chiudiLavori);
  document.querySelectorAll('[data-lavoro]').forEach(b => b.addEventListener('click', () => {
    mostra(Number(b.dataset.lavoro));
    dlgLavori.showModal();
    document.documentElement.classList.add('bloccato');
    const f = pannelli[attuale].querySelector('[data-freccia="1"]'); if (f) f.focus({ preventScroll: true });
  }));
  dlgLavori.querySelectorAll('[data-freccia]').forEach(b => b.addEventListener('click', () => {
    mostra(attuale + Number(b.dataset.freccia));
    const btn = pannelli[attuale].querySelector(`[data-freccia="${b.dataset.freccia}"]`);
    if (btn) btn.focus({ preventScroll: true });
  }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && dlgLavori.open) { e.preventDefault(); chiudiLavori(); } });
  mostra(0);

  // «Clicca per scorrere»: carica la pagina intera e la fa scorrere nel riquadro; di nuovo = torna su
  function ferma(pannello) {
    pannello.querySelectorAll('.schermo img').forEach(img => { img.style.transform = ''; });
    const b = pannello.querySelector('[data-scorri]');
    if (b) { b.dataset.giu = ''; b.firstChild.textContent = 'Clicca per scorrere '; b.lastChild.textContent = '↓'; }
  }
  document.querySelectorAll('[data-scorri]').forEach(btn => btn.addEventListener('click', async () => {
    const pannello = btn.closest('.vetrina');
    if (btn.dataset.giu) { ferma(pannello); return; }
    btn.dataset.giu = '1'; btn.firstChild.textContent = 'Torna su '; btn.lastChild.textContent = '↑';
    const schermi = [...pannello.querySelectorAll('.schermo[data-intera]')];
    await Promise.all(schermi.map(s => {
      const img = s.querySelector('img');
      if (img.dataset.caricata) return null;
      return new Promise(ok => { const n = new Image(); n.onload = n.onerror = () => { img.src = n.src; img.removeAttribute('srcset'); img.dataset.caricata = '1'; ok(); }; n.src = s.dataset.intera; });
    }));
    requestAnimationFrame(() => schermi.forEach(s => {
      const img = s.querySelector('img');
      const corsa = Math.max(0, img.getBoundingClientRect().height - s.getBoundingClientRect().height);
      img.style.setProperty('--durata', Math.min(32, Math.max(6, corsa / 90)) + 's'); // 11/11: più lento (circa 90 px al secondo)
      img.style.transform = 'translateY(' + (-corsa) + 'px)';
    }));
  }));

  // ── 01 che ruota: anello di cifre binarie ──────────────────────────
  const anello = document.querySelector('[data-anello]');
  if (anello) {
    const bit = '0110100101101001011010010110';
    [...bit].forEach((c, i) => {
      const s = document.createElement('span');
      s.textContent = c;
      s.style.setProperty('--a', (i * 360 / bit.length) + 'deg');
      s.style.setProperty('--y', (Math.sin(i * 0.9) * 14).toFixed(1) + 'px');
      anello.appendChild(s);
    });
  }

  // ── Versione chiara / scura (scelta ricordata su questo dispositivo) ──
  const btnTema = document.querySelector('[data-tema-bottone]');
  const segnaTema = () => {
    const chiaro = document.documentElement.dataset.tema === 'chiaro';
    btnTema.setAttribute('aria-pressed', chiaro);
    btnTema.querySelector('.tema-testo').textContent = chiaro ? 'Scuro' : 'Chiaro';
    btnTema.setAttribute('aria-label', chiaro ? 'Passa alla versione scura' : 'Passa alla versione chiara');
  };
  if (btnTema) {
    segnaTema();
    btnTema.addEventListener('click', () => {
      const chiaro = document.documentElement.dataset.tema !== 'chiaro';
      if (chiaro) document.documentElement.dataset.tema = 'chiaro'; else delete document.documentElement.dataset.tema;
      try { localStorage.setItem('zul-tema', chiaro ? 'chiaro' : 'scuro'); } catch (e) {}
      segnaTema();
    });
  }

  // ── Alternative: il filtro cambia la scheda di sinistra in tutte le voci ──
  const altBottoni = [...document.querySelectorAll('[data-alt]')];
  const NOMI = { agenzia: 'Agenzia', faidate: 'Fai da te', conoscente: 'Il conoscente' };
  altBottoni.forEach(btn => btn.addEventListener('click', () => {
    const k = btn.dataset.alt;
    altBottoni.forEach(x => x.setAttribute('aria-pressed', x === btn));
    document.querySelectorAll('.alt-loro p').forEach(p => {
      p.classList.add('cambia');
      setTimeout(() => { p.textContent = p.dataset[k]; p.classList.remove('cambia'); }, 180);
    });
    document.querySelectorAll('[data-alt-nome]').forEach(s => { s.textContent = NOMI[k]; });
  }));

  // ── Confronto: il selettore cambia la scheda di sinistra ──
  const vsDati = document.getElementById('vs-dati');
  if (vsDati) {
    const D = JSON.parse(vsDati.textContent);
    const scheda = document.querySelector('.vs2-scheda.loro');
    const voci = [...scheda.querySelectorAll('[data-vs-lista] li span:not(.vs2-segno)')];
    const bott = [...document.querySelectorAll('[data-vs]')];
    bott.forEach(btn => btn.addEventListener('click', () => {
      const d = D[btn.dataset.vs];
      bott.forEach(x => x.setAttribute('aria-pressed', x === btn));
      scheda.classList.add('cambia');
      setTimeout(() => {
        scheda.querySelector('[data-vs-nome]').textContent = d[0];
        scheda.querySelector('[data-vs-prezzo]').textContent = d[1];
        scheda.querySelector('[data-vs-tempi]').textContent = d[2];
        d[3].forEach((t, k) => { voci[k].textContent = t; });
        scheda.classList.remove('cambia');
      }, 180);
    }));
  }

  // ── Pacchetto: schede da scorrere con le frecce o trascinando col mouse ──
  const pacFila = document.querySelector('.pac-fila');
  // sfondo di 0 e 1 diverso per ogni scheda
  document.querySelectorAll('.ps-bit').forEach((el, k) => { let s = '', x = 9301 + k * 49297; for (let i = 0; i < 420; i++) { x = (x * 1103515245 + 12345) % 2147483648; s += x % 7 < 3 ? '1' : '0'; } el.textContent = s; });
  if (pacFila) {
    const passoPac = () => { const s = pacFila.querySelector('.pac-scheda'); return s ? s.getBoundingClientRect().width + 14 : 280; };
    document.querySelectorAll('[data-pac]').forEach(btn => btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.pac);
      const fine = pacFila.scrollLeft + pacFila.clientWidth >= pacFila.scrollWidth - 4;
      if (dir > 0 && fine) pacFila.scrollTo({ left: 0, behavior: 'smooth' });
      else if (dir < 0 && pacFila.scrollLeft <= 4) pacFila.scrollTo({ left: pacFila.scrollWidth, behavior: 'smooth' });
      else pacFila.scrollBy({ left: dir * passoPac() * 2, behavior: 'smooth' });
    }));
    let tiro = null;
    pacFila.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; tiro = { x: e.clientX, s: pacFila.scrollLeft }; pacFila.classList.add('tiro'); });
    window.addEventListener('pointermove', e => { if (tiro) pacFila.scrollLeft = tiro.s - (e.clientX - tiro.x); });
    window.addEventListener('pointerup', () => { if (!tiro) return; tiro = null; pacFila.classList.remove('tiro'); const p = passoPac(); pacFila.scrollTo({ left: Math.round(pacFila.scrollLeft / p) * p, behavior: 'smooth' }); });
  }

  // ── Schede a scorrimento (Come lavoriamo, Marketing): frecce, dito, trascinamento col mouse, barra di avanzamento (05/11) ──
  document.querySelectorAll('.fila-scorre').forEach(fila => {
    const barra = document.querySelector('[data-fila-barra="' + fila.id + '"]');
    const comandi = barra && barra.closest('.fila-comandi');
    const passo = () => { const s = fila.querySelector('li'); return s ? s.getBoundingClientRect().width + 16 : 280; };
    const aggiorna = () => {
      const tot = fila.scrollWidth, vis = fila.clientWidth;
      if (comandi) comandi.classList.toggle('ferma', tot <= vis + 4); // tutte visibili: niente comandi
      if (barra) { barra.style.width = (vis / tot * 100) + '%'; barra.style.left = (fila.scrollLeft / tot * 100) + '%'; }
    };
    fila.addEventListener('scroll', aggiorna, { passive: true });
    addEventListener('resize', aggiorna); aggiorna();
    document.querySelectorAll('[data-fila="' + fila.id + '"]').forEach(btn => btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.dir);
      const fine = fila.scrollLeft + fila.clientWidth >= fila.scrollWidth - 4;
      if (dir > 0 && fine) fila.scrollTo({ left: 0, behavior: 'smooth' });
      else if (dir < 0 && fila.scrollLeft <= 4) fila.scrollTo({ left: fila.scrollWidth, behavior: 'smooth' });
      else fila.scrollBy({ left: dir * passo(), behavior: 'smooth' });
    }));
    let tiro = null;
    fila.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; tiro = { x: e.clientX, s: fila.scrollLeft }; fila.classList.add('tiro'); });
    addEventListener('pointermove', e => { if (tiro) fila.scrollLeft = tiro.s - (e.clientX - tiro.x); });
    addEventListener('pointerup', () => { if (!tiro) return; tiro = null; fila.classList.remove('tiro'); const p = passo(); fila.scrollTo({ left: Math.round(fila.scrollLeft / p) * p, behavior: 'smooth' }); });
  });

  // ── Titoli in binario (05/11): le parole in viola compaiono come 0 e 1 e si «decodificano» in lettere, una volta sola ──
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    // la parola vera resta sempre al suo posto (trasparente): le cifre sono disegnate sopra con ::after,
    // così la riga non si sposta mai (05/11: prima la parola saliva durante l'effetto)
    const decodifica = el => {
      const vero = el.textContent, n = vero.length, durata = 1000, t0 = performance.now(); // un pelino più lento (Francesco, 05/11)
      el.style.setProperty('--bin-colore', getComputedStyle(el).color);
      el.classList.add('in-binario');
      let ultimo = 0;
      const passo = now => {
        const p = Math.min(1, (now - t0) / durata);
        if (now - ultimo > 55 || p === 1) { // cifre che cambiano ogni 55 ms: si vedono
          ultimo = now;
          const fatte = Math.floor(p * (n + 2)) - 2;
          let s = ''; for (let i = 0; i < n; i++) s += vero[i] === ' ' || i < fatte ? vero[i] : (Math.random() < .5 ? '0' : '1');
          el.dataset.bit = s;
        }
        if (p < 1) requestAnimationFrame(passo);
        else { el.classList.remove('in-binario'); delete el.dataset.bit; el.style.removeProperty('--bin-colore'); }
      };
      requestAnimationFrame(passo);
    };
    const oss = new IntersectionObserver(voci => voci.forEach(v => { if (v.isIntersecting) { oss.unobserve(v.target); setTimeout(() => decodifica(v.target), v.target.closest('.apertura') ? 350 : 0); } }), { threshold: .8 });
    document.querySelectorAll('h1 .corsivo, h2 .corsivo, h3 .corsivo').forEach(el => { if (!el.closest('dialog')) oss.observe(el); });
  }

  // ── Domande: «Altre 5 domande» sul telefono ──
  const altreBtn = document.querySelector('.altre-domande');
  if (altreBtn) altreBtn.addEventListener('click', () => {
    const col = document.getElementById('altre-domande');
    const ap = col.classList.toggle('aperte');
    altreBtn.setAttribute('aria-expanded', ap);
    altreBtn.firstChild.textContent = ap ? 'Meno domande ' : 'Altre ' + col.querySelectorAll('details').length + ' domande ';
    altreBtn.lastChild.textContent = ap ? '↑' : '↓';
  });


  // ── Ingresso dell'apertura (11/11): la riga «siti · app · marketing» si scrive lettera per lettera,
  // titolo, testo, promo e pulsante salgono uno dopo l'altro; poi le schede dei lavori. Una volta sola, mai con «riduci movimento».
  const scritto = document.querySelector('[data-scrivi]');
  const fermo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (scritto) {
    const testo = scritto.dataset.scrivi;
    if (fermo) { scritto.textContent = testo; scritto.parentElement.classList.add('finito'); }
    else {
      let k = 0;
      const passo = () => { scritto.textContent = testo.slice(0, ++k); if (k < testo.length) setTimeout(passo, 38); else setTimeout(() => scritto.parentElement.classList.add('finito'), 900); };
      setTimeout(passo, 250);
    }
  }
  if (!fermo) document.documentElement.classList.add('ap-ingresso');

  // ── Lavori a scorrimento sotto l'apertura (11/11, direzione Claude Design) ──
  // Frecce, tastiera e trascinamento; mai da soli. La scheda al centro apre il lavoro (stessa finestra dei Progetti).
  const car = document.querySelector('[data-carosello]');
  if (car) {
    const vista = car.querySelector('.car-vista');
    const traccia = car.querySelector('.car-traccia');
    const schede = [...car.querySelectorAll('.car-scheda')];
    const frecce = car.querySelectorAll('[data-car]');
    const conta = car.querySelector('.car-conta');
    const annuncio = car.querySelector('.car-annuncio');
    const n = schede.length;
    let i = document.documentElement.getAttribute('data-v') === 'ed' ? 0 : Math.max(0, schede.findIndex(s => s.hasAttribute('data-inizio')));
    const due = x => String(x).padStart(2, '0');
    const segniBox = conta.querySelector('.car-segni');
    const segni = schede.map(() => segniBox.appendChild(document.createElement('i')));
    const geo = (k = i) => {
      const W = vista.clientWidth, vw = window.innerWidth;
      const mobile = vw < 640, tablet = vw < 1024;
      const gap = mobile ? 12 : 28;
      const w = Math.round(mobile ? W - 92 : tablet ? W * 0.6 : Math.min(760, W * 0.5));
      return { gap, w, x: Math.round((W - w) / 2 - k * (w + gap)) };
    };
    const disegna = (annuncia) => {
      const g = geo();
      car.style.setProperty('--car-w', g.w + 'px');
      car.style.setProperty('--car-gap', g.gap + 'px');
      traccia.style.transform = `translate3d(${g.x}px,0,0)`;
      schede.forEach((s, k) => {
        const attiva = k === i, b = s.querySelector('.car-bottone');
        s.classList.toggle('attiva', attiva);
        s.setAttribute('aria-roledescription', 'scheda');
        s.setAttribute('aria-label', `${k + 1} di ${n}: ${s.dataset.nome}`);
        b.setAttribute('aria-label', attiva ? `${s.dataset.nome}: guarda il lavoro sul computer e sul telefono` : `Mostra ${s.dataset.nome}`);
        b.tabIndex = attiva ? 0 : -1;
      });
      frecce[0].setAttribute('aria-disabled', i === 0);
      frecce[1].setAttribute('aria-disabled', i === n - 1);
      const cifre = conta.querySelectorAll('b'); cifre[0].textContent = due(i + 1); cifre[1].textContent = due(n);
      segni.forEach((s, k) => s.classList.toggle('acceso', k === i));
      if (annuncia) annuncio.textContent = `Progetto ${i + 1} di ${n}: ${schede[i].dataset.nome}`;
    };
    const vai = k => { i = Math.max(0, Math.min(n - 1, k)); disegna(true); };
    frecce.forEach(f => f.addEventListener('click', () => vai(i + Number(f.dataset.car))));
    vista.addEventListener('keydown', e => {
      const m = { ArrowLeft: i - 1, ArrowRight: i + 1, Home: 0, End: n - 1 };
      if (e.key in m) { e.preventDefault(); vai(m[e.key]); }
    });
    // trascinamento col dito o col mouse: parte solo se il gesto è orizzontale (in verticale la pagina scorre)
    let tr = null, trascinato = false;
    vista.addEventListener('pointerdown', e => { if (e.button !== 0) return; tr = { x: e.clientX, y: e.clientY, dx: 0, attivo: false, id: e.pointerId }; trascinato = false; });
    vista.addEventListener('pointermove', e => {
      if (!tr) return;
      const dx = e.clientX - tr.x, dy = e.clientY - tr.y;
      if (!tr.attivo) {
        if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) { tr.attivo = true; try { vista.setPointerCapture(tr.id); } catch (_) {} vista.classList.add('trascina'); }
        else if (Math.abs(dy) > 10) { tr = null; return; } else return;
      }
      const bordo = (i === 0 && dx > 0) || (i === n - 1 && dx < 0);
      tr.dx = bordo ? dx * 0.3 : dx;
      traccia.style.transform = `translate3d(${geo().x + tr.dx}px,0,0)`;
    });
    const fine = () => {
      const t = tr; tr = null;
      if (!t || !t.attivo) return;
      vista.classList.remove('trascina');
      trascinato = true; setTimeout(() => { trascinato = false; }, 0);
      const soglia = Math.min(80, geo().w * 0.18);
      vai(t.dx < -soglia ? i + 1 : t.dx > soglia ? i - 1 : i);
    };
    // touchpad (due dita di lato) e rotellina con Maiusc: un passo per gesto. Lo scorrimento in verticale resta alla pagina.
    // Dopo un gesto il touchpad continua a mandare la «coda» d'inerzia (valori che calano): la ignoriamo, ma se i valori
    // tornano a salire è un gesto nuovo e deve valere subito (12/11: prima il secondo gesto veloce veniva perso).
    let somma = 0, bloccato = false, pausa = null, ultimo = 0, tBlocco = 0;
    vista.addEventListener('wheel', e => {
      const dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
      const dy = e.shiftKey ? 0 : e.deltaY;
      if (Math.abs(dx) < 1 || Math.abs(dx) < Math.abs(dy) * 0.7) return;
      e.preventDefault();
      clearTimeout(pausa); pausa = setTimeout(() => { somma = 0; bloccato = false; ultimo = 0; }, 140);
      const forza = Math.abs(dx);
      if (bloccato) {
        const riparte = e.timeStamp - tBlocco > 260 && (forza > Math.abs(ultimo) + 3 || Math.sign(dx) !== Math.sign(ultimo));
        ultimo = dx;
        if (!riparte) return;
        bloccato = false; somma = 0;
      }
      ultimo = dx; somma += dx;
      if (Math.abs(somma) > 28) { vai(i + (somma > 0 ? 1 : -1)); somma = 0; bloccato = true; tBlocco = e.timeStamp; }
    }, { passive: false });
    vista.addEventListener('pointerup', fine);
    vista.addEventListener('pointercancel', fine);
    schede.forEach((s, k) => s.querySelector('.car-bottone').addEventListener('click', () => {
      if (trascinato) return;
      if (k !== i) { vai(k); return; }
      mostra(Number(s.dataset.apri));
      dlgLavori.showModal();
      document.documentElement.classList.add('bloccato');
      const f = pannelli[attuale].querySelector('[data-freccia="1"]'); if (f) f.focus({ preventScroll: true });
    }));
    window.addEventListener('resize', () => disegna(false));
    disegna(false);
  }

  // ── Widget 01 (06/11): etichetta «Parlaci del progetto» sempre visibile appena il pulsante
  // dell'apertura esce dallo schermo (così non lo copre sul telefono); il widget sparisce quando
  // il modulo della chiusura è in vista (lì il modulo c'è già).
  const widget = document.querySelector('.widget-01');
  const casa = document.querySelector('.modulo-casa');
  const ctaApertura = document.querySelector('.apertura .cta-apertura');
  const vista = { cta: true, casa: false };
  const aggiornaWidget = () => {
    if (!widget) return;
    widget.classList.toggle('etichetta', !vista.cta && !vista.casa);
    widget.classList.toggle('via', vista.casa);
  };
  if ('IntersectionObserver' in window) {
    if (ctaApertura) new IntersectionObserver(([e]) => { vista.cta = e.isIntersecting; aggiornaWidget(); }).observe(ctaApertura);
    if (casa) new IntersectionObserver(([e]) => { vista.casa = e.isIntersecting; aggiornaWidget(); }, { threshold: 0.15 }).observe(casa);
  }

  // ogni tanto un bit «sfarfalla» per un attimo e torna 01
  const bits = [...document.querySelectorAll('[data-bit]')];
  if (bits.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      const b = bits[Math.random() < .5 ? 0 : 1], vero = b === bits[0] ? '0' : '1';
      b.textContent = vero === '0' ? '1' : '0'; b.classList.add('cambia');
      setTimeout(() => { b.textContent = vero; b.classList.remove('cambia'); }, 160);
    }, 2600);
  }

  // ── Finestra del modulo ────────────────────────────────────────────
  // Il modulo vive nella chiusura (#richiesta): la finestra lo prende in prestito e lo restituisce
  // alla chiusura (stesso modulo, quello che si è scritto resta).
  const dlg = document.getElementById('modulo');
  const box = document.querySelector('.modulo-box');
  // Nella chiusura il modulo resta chiuso (intestazione + Nome + «Continua la richiesta»): toccando «Continua»
  // si apre la stessa finestra del widget 01, con il nome già scritto (Francesco, 06/11: niente espansione nella sezione).
  const continua = box.querySelector('.mod-continua');
  const torna = () => { if (casa && box.parentNode !== casa) casa.insertBefore(box, casa.firstChild); };
  const apri = (e) => {
    if (e) e.preventDefault();
    if (dlg.open) return;
    const daChiusura = e && e.currentTarget === continua;
    dlg.appendChild(box);
    dlg.showModal();
    document.documentElement.classList.add('bloccato'); // scorrimento bloccato solo su html
    const nome = box.querySelector('[name=nome]');
    const primo = box.classList.contains('fatto') ? box.querySelector('.inviato')
      : (daChiusura && nome.value.trim() ? box.querySelector('[name=telefono]') : nome);
    if (primo) primo.focus({ preventScroll: true });
  };
  const chiudi = () => { if (dlg.open) dlg.close(); document.documentElement.classList.remove('bloccato'); torna(); };
  dlg.addEventListener('close', () => { document.documentElement.classList.remove('bloccato'); torna(); }); // il modulo torna nella chiusura
  dlg.addEventListener('click', e => { if (e.target === dlg) chiudi(); }); // tocco fuori dal riquadro
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && dlg.open) { e.preventDefault(); chiudi(); } }); // Chrome a volte ignora il primo Esc
  box.querySelector('[data-chiudi]').addEventListener('click', chiudi);
  if (continua) continua.addEventListener('click', apri);
  document.querySelectorAll('[data-apri-modulo]').forEach(el => el.addEventListener('click', apri));

  // ── Modulo ─────────────────────────────────────────────────────────
  const form = box.querySelector('form');
  const campo = n => form.querySelector(`[data-campo="${n}"]`);
  const consenso = form.querySelector('.consenso');
  const invia = form.querySelector('.invia');

  const segna = (el, ko) => el.classList.toggle('ko', ko);
  const controlla = () => {
    const d = new FormData(form);
    const errori = [];
    const nome = (d.get('nome') || '').trim();
    const tel = (d.get('telefono') || '').replace(/[^\d+]/g, '');
    const att = (d.get('attivita') || '').trim();
    segna(campo('nome'), !nome); if (!nome) errori.push(campo('nome'));
    const telOk = tel.replace(/\D/g, '').length >= 8;
    segna(campo('telefono'), !telOk); if (!telOk) errori.push(campo('telefono'));
    segna(campo('attivita'), !att); if (!att) errori.push(campo('attivita'));
    const priv = form.privacy.checked;
    segna(consenso, !priv); if (!priv) errori.push(consenso);
    return errori;
  };
  form.addEventListener('input', e => {
    const c = e.target.closest('.campo, .consenso');
    if (c && c.classList.contains('ko')) controlla();
  });

  const messaggioWa = d => [
    'Ciao Zero Uno Lab, vi scrivo dal sito per la promo.',
    `Nome: ${d.nome}`,
    `Attività: ${d.attivita}`,
    d.serve ? `Mi serve: ${d.serve}` : '',
    d.email ? `Email: ${d.email}` : '',
  ].filter(Boolean).join('\n');

  const fatto = (conWa) => {
    box.querySelector('[data-nota-wa]').hidden = !conWa;
    box.classList.add('fatto');
    box.querySelector('.inviato').focus({ preventScroll: true });
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (casa && box.parentNode === casa) { continua.click(); return; } // Invio nel Nome della chiusura: si apre la finestra
    const errori = controlla();
    if (errori.length) {
      const primo = errori[0].querySelector('input');
      if (primo) primo.focus();
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const dati = {
      nome: d.nome.trim(), telefono: d.telefono.trim(), attivita: d.attivita.trim(),
      serve: d.serve || '', email: (d.email || '').trim(),
      ...sorgente, pagina: location.href.split('?')[0],
    };

    if (!CONFIG.endpoint) {
      // Nessun servizio collegato: WhatsApp con il messaggio pronto (aperto subito, dentro il tocco)
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(messaggioWa(dati))}`, '_blank', 'noopener');
      fatto(true);
      return;
    }
    invia.disabled = true;
    invia.textContent = 'Invio in corso…';
    try {
      const r = await fetch(CONFIG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(dati) });
      if (!r.ok) throw new Error(r.status);
      fatto(false);
    } catch (err) {
      invia.disabled = false;
      invia.innerHTML = 'Invia la richiesta <span aria-hidden="true">→</span>';
      if (confirm('La richiesta non è partita, forse per la rete. Vuoi mandarcela su WhatsApp?')) {
        window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(messaggioWa(dati))}`, '_blank', 'noopener');
        fatto(true);
      }
    }
  });

  box.querySelector('[data-ricomincia]').addEventListener('click', () => {
    form.reset();
    box.classList.remove('fatto');
    invia.disabled = false;
    invia.innerHTML = 'Invia la richiesta <span aria-hidden="true">→</span>';
    form.nome.focus();
  });
})();


// ── Menu in alto a sinistra: il nome si allarga col mouse (CSS); col tocco o con Invio apre/chiude le voci ──
(() => {
  const menu = document.querySelector('.menu-sito'); if (!menu) return;
  const bott = menu.querySelector('.menu-nome');
  const imposta = (v) => { menu.classList.toggle('aperto', v); bott.setAttribute('aria-expanded', String(v)); };
  bott.addEventListener('click', (e) => { e.stopPropagation(); imposta(!menu.classList.contains('aperto')); });
  menu.querySelectorAll('.menu-voci a').forEach(a => a.addEventListener('click', () => imposta(false)));
  document.addEventListener('click', (e) => { if (!menu.contains(e.target)) imposta(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('aperto')) { imposta(false); bott.focus(); } });
})();

// ── Il menu c'è solo nella home: sparisce (dissolvenza) quando si scorre oltre l'apertura e torna risalendo ──
(() => {
  const menu = document.querySelector('.menu-sito'), ap = document.querySelector('.apertura');
  if (!menu || !ap || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(es => {
    const visibile = es[0].isIntersecting;
    menu.classList.toggle('nascosto', !visibile);
    if (!visibile) { menu.classList.remove('aperto'); const b = menu.querySelector('.menu-nome'); if (b) b.setAttribute('aria-expanded', 'false'); }
  }, { threshold: 0, rootMargin: '-60px 0px 0px 0px' }).observe(ap);
})();

// ── Interruttore di versione: Classica / Editoriale (si ricorda la scelta; ?v=ed o ?v=cl nell'indirizzo la impone) ──
(() => {
  const box = document.querySelector('.cambia-versione'); if (!box) return;
  const root = document.documentElement;
  const mostra = () => { const ed = root.getAttribute('data-v') === 'ed'; box.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.versione === 'ed') === ed))); };
  box.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const ed = b.dataset.versione === 'ed';
    if (ed) root.setAttribute('data-v', 'ed'); else root.removeAttribute('data-v');
    try { localStorage.setItem('zul-versione', ed ? 'ed' : 'cl'); } catch (e) {}
    mostra();
    window.dispatchEvent(new Event('resize'));
  }));
  mostra();
})();

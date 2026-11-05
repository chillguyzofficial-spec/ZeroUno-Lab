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
      img.style.setProperty('--durata', Math.min(14, Math.max(3, corsa / 220)) + 's');
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

  // ── Domande: «Altre 5 domande» sul telefono ──
  const altreBtn = document.querySelector('.altre-domande');
  if (altreBtn) altreBtn.addEventListener('click', () => {
    const col = document.getElementById('altre-domande');
    const ap = col.classList.toggle('aperte');
    altreBtn.setAttribute('aria-expanded', ap);
    altreBtn.firstChild.textContent = ap ? 'Meno domande ' : 'Altre ' + col.querySelectorAll('details').length + ' domande ';
    altreBtn.lastChild.textContent = ap ? '↑' : '↓';
  });

  // ── Widget 01: l'etichetta «Richiedi la bozza» si vede per qualche secondo all'ingresso ──
  const widget = document.querySelector('.widget-01');
  // sul telefono la nuvoletta copriva il pulsante dell'apertura: lì non compare da sola (05/11)
  if (widget && !matchMedia('(max-width: 600px)').matches) { setTimeout(() => widget.classList.add('mostra'), 1200); setTimeout(() => widget.classList.remove('mostra'), 5200); }

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
  const dlg = document.getElementById('modulo');
  const box = dlg.querySelector('.modulo-box');
  const apri = (e) => {
    if (e) e.preventDefault();
    if (dlg.open) return;
    dlg.showModal();
    document.documentElement.classList.add('bloccato'); // scorrimento bloccato solo su html
    const primo = box.classList.contains('fatto') ? box.querySelector('.inviato') : dlg.querySelector('[name=nome]');
    if (primo) primo.focus({ preventScroll: true });
  };
  const chiudi = () => { if (dlg.open) dlg.close(); document.documentElement.classList.remove('bloccato'); };
  dlg.addEventListener('close', () => document.documentElement.classList.remove('bloccato'));
  dlg.addEventListener('click', e => { if (e.target === dlg) chiudi(); }); // tocco fuori dal riquadro
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && dlg.open) { e.preventDefault(); chiudi(); } }); // Chrome a volte ignora il primo Esc
  dlg.querySelector('[data-chiudi]').addEventListener('click', chiudi);
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

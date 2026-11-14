/* Pagina Marketing: i quattro passi sono sempre visibili; scegliendo un'attività cambiano annuncio, pagina e messaggio. Nessun invio. */
(() => {
  'use strict';
  const dati = document.getElementById('dati-marketing'); if (!dati) return;
  const d = JSON.parse(dati.textContent), V = '?v=20261114f';
  const q = k => document.querySelector('[data-j="' + k + '"]');
  const scegli = id => {
    const s = d.settori.find(x => x.id === id); if (!s) return;
    document.querySelectorAll('[data-sector]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sector === id)));
    q('img').src = s.immagine + V; q('tel').src = s.screenshot + V;
    q('ad').textContent = s.ad; q('cta').textContent = s.cta; q('msg').textContent = s.msg;
    q('img').alt = 'Visual illustrativo: ' + s.nome; q('tel').alt = 'Schermata del sito, esempio ' + s.nome;
  };
  document.querySelectorAll('[data-sector]').forEach(b => b.addEventListener('click', () => scegli(b.dataset.sector)));
  scegli(d.iniziale[0]);
})();

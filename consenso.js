/* Zero Uno Lab · consenso cookie + misurazione Google Ads (27/11/2026)
   ─────────────────────────────────────────────────────────────────────
   COSA FA
   • Mostra l'avviso cookie e ricorda la scelta per 6 mesi (nel browser, voce «zul-consenso»).
   • Carica il tag di Google SOLO dopo che il visitatore ha accettato (Consent Mode v2, modalità «base»):
     prima del consenso non parte nessuna richiesta verso Google e non viene scritto nessun cookie.
   • Segnala a Google Ads la conversione quando una richiesta di preventivo viene inviata
     (evento «zul:richiesta» lanciato da corona.js) e, se configurato, il clic sui link WhatsApp.

   DA COMPILARE (sono codici pubblici, non password: si leggono dall'account Google Ads,
   Obiettivi → Conversioni → la conversione → «Configurazione del tag» → «Usa il tag Google»):                */
var GOOGLE_ADS_ID = '';        // es. 'AW-1234567890'
var CONV_RICHIESTA = '';       // etichetta della conversione «richiesta di preventivo», es. 'AbC-D_efG-h12_34-567'
var CONV_WHATSAPP = '';        // facoltativa: etichetta di una seconda conversione «clic su WhatsApp»
/* Finché GOOGLE_ADS_ID è vuoto non c'è nulla da misurare: l'avviso non compare e Google non viene contattato. */

(function () {
  'use strict';
  var CHIAVE = 'zul-consenso', VERSIONE = 1, DURATA = 183 * 24 * 60 * 60 * 1000;   // 6 mesi
  var attivo = /^AW-[A-Za-z0-9]+$/.test(GOOGLE_ADS_ID);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  // tutto negato in partenza: è lo stato di chi non ha ancora scelto o ha rifiutato
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });

  function leggi() {
    try {
      var d = JSON.parse(localStorage.getItem(CHIAVE) || 'null');
      if (!d || d.v !== VERSIONE || typeof d.t !== 'number' || Date.now() - d.t > DURATA) return null;
      return d;
    } catch (e) { return null; }
  }
  function salva(ok) { try { localStorage.setItem(CHIAVE, JSON.stringify({ v: VERSIONE, pubblicita: !!ok, t: Date.now() })); } catch (e) {} }

  var caricato = false, concesso = false;
  function caricaGoogle() {
    if (caricato || !attivo) return; caricato = true;
    // misuriamo solo le conversioni: niente annunci personalizzati (ad_personalization resta negato)
    gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted' });
    gtag('js', new Date());
    gtag('config', GOOGLE_ADS_ID);
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GOOGLE_ADS_ID);
    document.head.appendChild(s);
  }
  function cancellaCookieGoogle() {   // dopo un rifiuto che segue un consenso: via i cookie di misurazione dal nostro dominio
    var host = location.hostname, domini = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (!/^_gcl_|^_gac_/.test(n)) return;
      domini.forEach(function (d) { document.cookie = n + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : ''); });
    });
  }
  function applica(ok) {
    concesso = !!ok && attivo;
    if (concesso) caricaGoogle();
    else { gtag('consent', 'update', { ad_storage: 'denied', ad_user_data: 'denied' }); cancellaCookieGoogle(); }
  }

  /* ── conversioni ── */
  var inviate = {};
  function conversione(etichetta) {
    if (!concesso || !etichetta || inviate[etichetta]) return;
    inviate[etichetta] = true;
    gtag('event', 'conversion', { send_to: GOOGLE_ADS_ID + '/' + etichetta });
  }
  document.addEventListener('zul:richiesta', function () { conversione(CONV_RICHIESTA); });
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me/"]') : null;
    if (a) conversione(CONV_WHATSAPP);
  }, true);

  /* ── avviso ── */
  var CSS = '.ck{position:fixed;left:16px;bottom:16px;z-index:2147483000;box-sizing:border-box;width:min(430px,calc(100vw - 32px));padding:20px 20px 18px;border-radius:16px;background:#141210;color:#F6F3EE;box-shadow:0 18px 50px rgba(0,0,0,.38),0 0 0 1px rgba(255,255,255,.10);font:400 14.5px/1.5 "Schibsted Grotesk",Helvetica,Arial,sans-serif;text-align:left}'
    + '.ck[hidden]{display:none}'
    + '.ck .ck-t{margin:0 30px 6px 0;font-weight:600;font-size:16px;line-height:1.3;color:#fff}'
    + '.ck p{margin:0 0 14px;color:#D9D4CC;font-size:14.5px;line-height:1.5;max-width:none}'
    + '.ck a{color:#fff;text-decoration:underline;text-underline-offset:3px}'
    + '.ck-b{display:flex;gap:10px}'
    + '.ck-b button{flex:1 1 0;min-height:46px;padding:0 14px;border-radius:999px;border:1.5px solid #F6F3EE;background:transparent;color:#F6F3EE;font-family:inherit;font-weight:600;font-size:15px;line-height:1;cursor:pointer}'
    + '.ck-b button:hover,.ck-b button:focus-visible{background:#F6F3EE;color:#141210}'
    + '.ck-x{position:absolute;top:8px;right:8px;width:40px;height:40px;border:0;border-radius:50%;background:transparent;color:#D9D4CC;font-size:22px;line-height:1;cursor:pointer}'
    + '.ck-x:hover,.ck-x:focus-visible{background:rgba(255,255,255,.12);color:#fff}'
    + '.ck button:focus-visible,.ck a:focus-visible{outline:2px solid #fff;outline-offset:2px}'
    + '@media (max-width:560px){.ck{left:8px;right:8px;bottom:8px;width:auto;padding:16px 16px 14px;font-size:14px}.ck p{font-size:14px;margin-bottom:12px}}'
    + '[data-preferenze-cookie]{background:none;border:0;padding:0;margin:0;font:inherit;color:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer}';
  var box = null;
  function costruisci() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    box = document.createElement('div');
    box.className = 'ck'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Avviso sui cookie'); box.setAttribute('aria-live', 'polite');
    box.innerHTML = '<button type="button" class="ck-x" data-ck="chiudi" aria-label="Chiudi e continua senza accettare">×</button>'
      + '<p class="ck-t">Un solo cookie, se ci stai</p>'
      + '<p>Con il tuo consenso usiamo un cookie di Google per capire se le nostre inserzioni portano richieste. Niente profilazione. Se rifiuti il sito funziona allo stesso modo. <a href="cookie.html">Cookie policy</a></p>'
      + '<div class="ck-b"><button type="button" data-ck="no">Rifiuta</button><button type="button" data-ck="si">Accetta</button></div>';
    box.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-ck]') : null; if (!b) return;
      var ok = b.getAttribute('data-ck') === 'si';   // «×» e «Rifiuta» valgono entrambi come no
      salva(ok); applica(ok); box.hidden = true;
    });
    document.body.appendChild(box);
  }
  function mostra() { if (!box) costruisci(); box.hidden = false; }

  function avvia() {
    var bottoni = document.querySelectorAll('[data-preferenze-cookie]');
    if (!attivo) {   // nessuno strumento da autorizzare: niente avviso, e il comando «Preferenze cookie» non serve
      Array.prototype.forEach.call(document.querySelectorAll('[data-solo-con-cookie]'), function (el) { el.hidden = true; });
      return;
    }
    Array.prototype.forEach.call(bottoni, function (b) { b.addEventListener('click', function (e) { e.preventDefault(); mostra(); }); });
    var d = leggi();
    if (d) applica(d.pubblicita); else mostra();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia); else avvia();
})();

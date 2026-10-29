// Concord: pele dos ReApps por cima do Discord. Roda antes do Discord carregar, em toda página.
// O Go coloca antes deste arquivo: window.__CC = { ver, css: { base, ours }, fonts: { família: { peso: base64 } } }
(function () {
  'use strict';
  if (window.__ccOn || window.top !== window || !/(^|\.)discord\.com$/.test(location.hostname)) return;
  window.__ccOn = true;
  var CC = window.__CC || { ver: '0', css: {}, fonts: {} };
  var LS = null; try { LS = window.localStorage; } catch (e) {} // o Discord apaga window.localStorage depois que carrega: guardo antes

  /* ---------- temas (os mesmos do FofitoZap) ---------- */
  var PRESETS = {
    fofito: { n: 'Grafite', a1: '#3ecfb2', a2: '#3ecfb2', a3: '#ff8fd1', o: ['#1a3f3a', '#16233a', '#2a1a33'], w: '#121318', bg: ['#0b0c10', '#0f1014'] },
    aurora: { n: 'Aurora', a1: '#7cf2a0', a2: '#9b6bff', a3: '#6be3ff', o: ['#1f5b4a', '#3b1f7a', '#12406b'], w: '#0e1c22', bg: ['#05121a', '#0b1a24'] },
    sakura: { n: 'Sakura', a1: '#ff9ecf', a2: '#ffb38a', a3: '#ffd36b', o: ['#6b1f4f', '#5a2a3a', '#3a1f5b'], w: '#1c0d18', bg: ['#14060f', '#1f0b1a'] },
    sol: { n: 'Pôr do sol', a1: '#ffb347', a2: '#ff5e7e', a3: '#ffd36b', o: ['#6b2a1f', '#5b1f4a', '#3a2a6b'], w: '#1c0e0e', bg: ['#140806', '#1f0c14'] },
    oceano: { n: 'Oceano', a1: '#4fd8ff', a2: '#3e6bff', a3: '#7cf2a0', o: ['#0f3a6b', '#0f5a6b', '#1f2a7a'], w: '#08162b', bg: ['#030a18', '#071429'] },
    lavanda: { n: 'Lavanda', a1: '#c3a6ff', a2: '#7f8cff', a3: '#ff9ecf', o: ['#3f2a7a', '#5a3a8a', '#2a2f6b'], w: '#140f2c', bg: ['#0a0720', '#120d30'] },
    floresta: { n: 'Floresta', a1: '#a6e36b', a2: '#3ec48a', a3: '#ffd36b', o: ['#1f4a2a', '#2a5a3a', '#1a3a4a'], w: '#0b1a11', bg: ['#040e08', '#08180f'] },
    cereja: { n: 'Cereja', a1: '#ff5c7a', a2: '#c03cff', a3: '#ffb347', o: ['#5a0f2a', '#4a0f4a', '#2a0f3a'], w: '#1a0811', bg: ['#0f0308', '#180613'] },
    grafite: { n: 'Prata', a1: '#e6e6f0', a2: '#8a8aa3', a3: '#c3a6ff', o: ['#2a2a35', '#1f1f2a', '#33334a'], w: '#131318', bg: ['#08080a', '#101014'] },
    ouro: { n: 'Ouro', a1: '#ffd36b', a2: '#e0a84a', a3: '#ff9ecf', o: ['#4a3a1f', '#3a2a1f', '#2a2440'], w: '#17120b', bg: ['#0c0905', '#15100a'] }
  };
  var ACCENTS = ['#3ee6c4', '#4fd8ff', '#4a7bff', '#9b6bff', '#c3a6ff', '#ff9ecf', '#ff5c7a', '#ffb347', '#ffd36b', '#a6e36b', '#e6e6f0'];
  var FONTS = ['Bricolage Grotesque', 'Onest', 'Space Grotesk', 'Sora', 'Manrope', 'DM Sans', 'Urbanist', 'Figtree', 'Outfit', 'Nunito', 'Plus Jakarta Sans', 'Lexend', ''];
  var DEF = { preset: 'fofito', accent: '', mat: 'aura', op: 0.62, blur: 14, radius: 14, gap: 10, font: 'Bricolage Grotesque', anim: true, motion: false, orbs: 0.6, chatbar: true, small: true, v: 6, style: true, bub: true, dood: true, tint: 0.06, clean: true, home: true, boost: 1, lite: false, mine: {}, places: {}, parallax: false, tab: 'tema', layout: 'palco', sideW: 272, bg: true };
  var CFG = {};
  try { CFG = JSON.parse((LS && LS.getItem('concord.cfg')) || '{}') || {}; } catch (e) { CFG = {}; }
  Object.keys(DEF).forEach(function (k) { if (CFG[k] === undefined) CFG[k] = DEF[k]; });
  if ((CFG.v || 0) < 7) { if (CFG.font === 'Onest') CFG.font = 'Bricolage Grotesque'; CFG.v = 7; try { LS && LS.setItem('concord.cfg', JSON.stringify(CFG)); } catch (e) {} }
  if ((CFG.v || 0) < 6) { CFG.motion = false; CFG.blur = Math.min(+CFG.blur || 0, 14); CFG.v = 6; try { LS && LS.setItem('concord.cfg', JSON.stringify(CFG)); } catch (e) {} }
  function save() { try { LS && LS.setItem('concord.cfg', JSON.stringify(CFG)); } catch (e) {} }
  var INFO = { mats: { aura: true, acrylic: true, mica: false, solid: true }, ver: CC.ver };

  /* ---------- cores ---------- */
  function rgb(h) { h = (h || '#000').replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function hex(c) { return '#' + c.map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); }
  function mix(a, b, p) { var x = rgb(a), y = rgb(b); return hex(x.map(function (v, i) { return v + (y[i] - v) * p; })); }
  function rgba(h, a) { var c = rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (+a).toFixed(3) + ')'; }
  function lum(h) { var c = rgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }

  var DOODLES = ['M30 40c-6-8-20-4-16 6 3 7 16 14 16 14s13-7 16-14c4-10-10-14-16-6z', 'M110 30l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z', 'M200 26v16M192 34h16M196 30l8 8M204 30l-8 8',
    'M262 30h34a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6h-20l-10 8v-8h-4a6 6 0 0 1-6-6V36a6 6 0 0 1 6-6z', 'M350 24v30a6 5 0 1 1-4-5V28l16-4v24a6 5 0 1 1-4-5', 'M60 120a18 18 0 1 0 22 22 14 14 0 1 1-22-22z',
    'M140 140a10 10 0 0 1 8-16 13 13 0 0 1 24 2 9 9 0 0 1 2 18h-30a8 8 0 0 1-4-4z', 'M240 120c0 10 6 14 6 14s-10-2-14 6c-2-10-12-10-12-10s8-4 6-14c6 6 14 4 14 4z', 'M318 118a16 16 0 1 0 0.1 0zM312 128h.1M326 128h.1M311 138a9 9 0 0 0 14 0',
    'M30 220l50-20-18 46-8-18z M54 228l8-8', 'M130 206l-10 22h12l-6 20 18-26h-12l8-16z', 'M210 210h28l-4 26a6 6 0 0 1-6 5h-8a6 6 0 0 1-6-5zM238 216h5a5 5 0 0 1 0 10h-6M216 202c0-4 4-4 4-8M226 202c0-4 4-4 4-8',
    'M300 226a16 16 0 1 0 32 0 16 16 0 1 0-32 0M290 232c10 6 42 0 52-12', 'M360 210l6 6M372 206v8M384 210l-6 6M366 226a10 10 0 0 0 12 0', 'M60 300c10-10 30-10 40 0M64 310a6 6 0 1 0 0.1 0M96 310a6 6 0 1 0 0.1 0M58 296l-6-10M102 296l6-10',
    'M150 290l14 14 14-14 14 14M150 310l14 14 14-14 14 14', 'M246 290a14 14 0 0 1 14 14v6h-28v-6a14 14 0 0 1 14-14zM236 316h20M246 290v-6', 'M320 300h40M340 280v40M326 286l28 28M354 286l-28 28',
    'M30 380c8-14 20-14 28 0s20 14 28 0', 'M130 370h40v26h-40zM150 370v-8a8 8 0 0 1 8-8h-16a8 8 0 0 1 8 8', 'M226 360l12 24 12-24M220 392h36', 'M320 368a10 10 0 1 1 20 0c0 10-10 12-10 22M330 400h.1', 'M380 360c-4 8 4 16 0 24 4 8-4 16 0 24'];
  var DOOD = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="0 0 420 420" fill="none" stroke="white" stroke-opacity=".06" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' + DOODLES.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</svg>') + '")';
  var NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

  function allThemes() { var o = {}; Object.keys(PRESETS).forEach(function (k) { o[k] = PRESETS[k]; }); Object.keys(CFG.mine || {}).forEach(function (k) { o[k] = CFG.mine[k]; }); return o; }
  // lugar aberto agora: um servidor (g:id) ou uma conversa (dm:id)
  function placeKey() { var p = location.pathname.split('/'); if (p[1] !== 'channels') return ''; if (p[2] === '@me') return p[3] ? 'dm:' + p[3] : ''; return p[2] ? 'g:' + p[2] : ''; }
  function placeTheme() { var pk = placeKey(), t = pk && (CFG.places || {})[pk]; return t && allThemes()[t] ? t : ''; }
  function themeKey() { return placeTheme() || CFG.preset; }
  function themeCSS() {
    var P = allThemes()[themeKey()] || PRESETS.fofito, a1 = placeTheme() ? P.a1 : (CFG.accent || P.a1), a3 = P.a3;
    var solid = CFG.mat === 'solid', op = solid ? 1 : +CFG.op, w = mix(mix(P.w, P.o[1], 0.22), a1, CFG.style ? +CFG.tint : 0);
    var aink = lum(a1) > 0.45 ? '#0b0c10' : '#ffffff';
    var ink = '#f2f3f8';
    var floatA = solid ? 1 : Math.max(op, 0.84);
    var v = {
      '--cc-bg0': P.bg[0], '--cc-bg1': P.bg[1], '--cc-o1': P.o[0], '--cc-o2': P.o[1], '--cc-o3': P.o[2], '--cc-orbs': CFG.orbs, '--cc-noise': NOISE,
      '--cc-a1': a1, '--cc-a2': P.a2, '--cc-a3': a3, '--cc-aink': aink, '--cc-ink': ink, '--cc-ink2': 'rgba(242,243,248,.74)', '--cc-ink3': 'rgba(242,243,248,.5)',
      '--cc-dood': DOOD, '--cc-wall1': rgba(mix(w, P.o[0], 0.32), op), '--cc-wall2': rgba(mix(w, P.o[1], 0.22), op), '--cc-wall3': rgba(mix(w, P.o[2], 0.32), op),
      '--cc-bub-in': 'rgba(255,255,255,.075)', '--cc-bub-me': rgba(a1, 0.24),
      '--cc-glass': rgba(mix(w, '#ffffff', 0.03), solid ? 0.98 : 0.78), '--cc-font': CFG.font ? "'" + CFG.font + "'" : "'gg sans'",
      '--text-0': aink, '--text-1': ink, '--text-2': 'rgba(242,243,248,.88)', '--text-3': 'rgba(242,243,248,.76)', '--text-4': 'rgba(242,243,248,.52)', '--text-5': 'rgba(242,243,248,.34)',
      '--bg-1': rgba(mix(w, '#ffffff', 0.12), Math.min(1, op + 0.18)), '--bg-2': rgba(mix(w, '#ffffff', 0.075), Math.min(1, op + 0.12)),
      '--bg-3': rgba(mix(w, '#ffffff', 0.035), op), '--bg-4': rgba(w, op),
      '--hover': 'rgba(255,255,255,.055)', '--active': 'rgba(255,255,255,.09)', '--active-2': 'rgba(255,255,255,.13)', '--message-hover': 'rgba(255,255,255,.025)',
      '--accent-1': mix(a1, '#ffffff', 0.22), '--accent-2': a1, '--accent-3': a1, '--accent-4': mix(a1, '#ffffff', 0.12), '--accent-5': mix(a1, '#000000', 0.12), '--accent-new': a3,
      '--border-light': 'rgba(255,255,255,.05)', '--border': 'rgba(255,255,255,.085)', '--border-hover': 'rgba(255,255,255,.15)', '--button-border': 'rgba(255,255,255,.1)'
    };
    v['--cc-float'] = rgba(mix(w, '#ffffff', 0.05), solid ? 1 : 0.95);
    v['--cc-side-w'] = (+CFG.sideW || 272) + 'px';
    // acrílico e mica: uma folha de vidro só, tingida por igual (antes os vãos entre os painéis viravam barras claras)
    if (CFG.mat === 'mica') v['--cc-sheet'] = rgba(P.bg[0], Math.max(0.28, op * 0.7)); // tinge a cor do Windows com o fundo do tema (antes ficava cinza lavado)
    if (CFG.mat === 'acrylic') {
      v['--cc-sheet'] = rgba(w, Math.max(0.15, op * 0.92));
      v['--bg-4'] = 'rgba(255,255,255,.035)'; v['--bg-3'] = 'rgba(255,255,255,.05)'; v['--bg-2'] = 'rgba(255,255,255,.075)'; v['--bg-1'] = 'rgba(255,255,255,.11)';
      v['--cc-wall1'] = rgba(mix(w, P.o[0], 0.4), 0.22); v['--cc-wall2'] = rgba(mix(w, P.o[1], 0.3), 0.16); v['--cc-wall3'] = rgba(mix(w, P.o[2], 0.4), 0.22);
    }
    var root = ':root{' + Object.keys(v).map(function (k) { return k + ':' + v[k]; }).join(';') + '}';
    var F = v['--cc-float'];
    root += 'body,.theme-dark,.theme-darker,.theme-midnight,.theme-light{--background-surface-high:' + F + '!important;--background-surface-higher:' + F + '!important;--background-surface-highest:' + F + '!important;--bg-surface-overlay:' + F + '!important;--bg-surface-overlay-tmp:' + F + '!important;--bg-surface-raised:' + F + '!important;--background-floating:' + F + '!important;--modal-background:' + F + '!important;--bg-floating:' + F + '!important}';
    var on = function (b) { return b ? 'on' : 'off'; };
    var r = +CFG.radius;
    var body = 'body{' + [
      "--font:" + (CFG.font ? "'" + CFG.font + "'" : "''"), '--gap:' + CFG.gap + 'px', '--border-thickness:1px',
      '--animations:' + on(CFG.anim), '--list-item-transition:.2s ease',
      '--top-bar-height:' + (CFG.layout === 'palco' ? '0px' : '36px'), '--top-bar-button-position:off', '--top-bar-title-position:off', '--subtle-top-bar-title:on',
      '--custom-window-controls:off', '--custom-dms-icon:off', '--custom-dms-background:off', '--background-image:off',
      '--transparency-tweaks:' + on(!solid), '--remove-bg-layer:' + on(!solid), '--panel-blur:' + on(!solid && CFG.blur > 0 && !CFG.lite), '--blur-amount:' + CFG.blur + 'px',
      '--bg-floating:' + rgba(mix(w, '#ffffff', 0.04), floatA),
      '--custom-chatbar:' + (CFG.chatbar ? 'separated' : 'off'), '--chatbar-height:' + (CFG.chatbar ? '56px' : '47px'), '--small-user-panel:' + on(CFG.small)
    ].join(';') + '}';
    // cantos: os tokens do próprio Discord
    var rad = ':root,body,.theme-dark,.theme-darker,.theme-midnight,.theme-light,.visual-refresh{--radius-lg:' + r + 'px!important;--radius-md:' + Math.round(r * 0.66) + 'px!important;--radius-sm:' + Math.max(4, Math.round(r * 0.45)) + 'px!important}';
    return root + body + rad + ':root{--colors:on}';
  }

  /* ---------- colocar os estilos (no fim do documento, para vencer os do Discord) ---------- */
  var STY = {};
  function style(id, css) {
    var el = STY[id];
    if (!el) { el = STY[id] = document.createElement('style'); el.id = 'cc-' + id; }
    if (el.textContent !== css) el.textContent = css;
    place();
  }
  function place() {
    var root = document.documentElement; if (!root) return;
    var ids = ['base', 'theme', 'ours'].filter(function (id) { return STY[id]; }), n = root.lastElementChild, ok = true;
    for (var i = ids.length - 1; i >= 0; i--) { if (n !== STY[ids[i]]) { ok = false; break; } n = n.previousElementSibling; }
    if (!ok) ids.forEach(function (id) { root.appendChild(STY[id]); });
  }
  // se o Discord bloquear <style>, usa folhas construídas (também ficam por cima de tudo)
  function fallbackSheets() {
    if (!document.body || getComputedStyle(document.documentElement).getPropertyValue('--cc-ok').trim() === '1') return;
    try {
      var list = ['base', 'theme', 'ours'].map(function (id) { var s = new CSSStyleSheet(); s.replaceSync(STY[id] ? STY[id].textContent : ''); return s; });
      document.adoptedStyleSheets = document.adoptedStyleSheets.concat(list);
      STY.adopted = list;
    } catch (e) {}
  }
  function applyTheme() {
    var css = themeCSS();
    if (STY.adopted) STY.adopted[1].replaceSync(css); else style('theme', css);
    marks(); if (typeof PX !== 'undefined') parallax();
    if (window.ccMat) window.ccMat(CFG.mat === 'acrylic' || CFG.mat === 'mica' ? CFG.mat : 'none').catch(function () {});
    paintWall();
  }

  // o Discord reescreve as classes do <html> quando termina de carregar ou troca o tema: as nossas voltam sozinhas
  // (o Discord troca as classes do <html> quando a janela ganha ou perde o foco: por isso TODAS as nossas, inclusive as de estado, voltam aqui)
  var HASBAR = false, FLAGS = {};
  function wantMarks() {
    var w = { 'cc-on': true, 'cc-aura': CFG.mat === 'aura' || CFG.mat === 'wall', 'cc-solid': CFG.mat === 'solid', 'cc-glass': CFG.mat === 'acrylic', 'cc-mica': CFG.mat === 'mica', 'cc-anim': !!CFG.anim, 'cc-still': !CFG.motion,
      'cc-style': !!CFG.style, 'cc-bub': !!(CFG.style && CFG.bub), 'cc-dood': !!(CFG.style && CFG.dood), 'cc-clean': !!CFG.clean, 'cc-lite': !!CFG.lite, 'cc-hasbar': HASBAR,
      'cc-lay': CFG.layout === 'palco', 'cc-homecfg': !!CFG.home };
    Object.keys(FLAGS).forEach(function (k) { w[k] = FLAGS[k]; });
    return w;
  }
  function marks() {
    var h = document.documentElement; if (!h) return;
    watchHtml();
    var want = wantMarks();
    Object.keys(want).forEach(function (c) { if (h.classList.contains(c) !== want[c]) h.classList.toggle(c, want[c]); });
  }
  function flag(c, on) { on = !!on; FLAGS[c] = on; var h = document.documentElement; if (h && h.classList.contains(c) !== on) h.classList.toggle(c, on); }
  var htmlWatched = false;
  function watchHtml() {
    if (htmlWatched || !document.documentElement) return; htmlWatched = true;
    new MutationObserver(function () {
      var h = document.documentElement, want = wantMarks();
      for (var c in want) if (h.classList.contains(c) !== want[c]) { marks(); return; }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- fontes (FontFace com os bytes: não depende de baixar nada) ---------- */
  var FONTS_LOADED = {};
  function loadCustomFont() {
    var b64 = ''; try { b64 = LS && LS.getItem('concord.font.pc'); } catch (e) {}
    if (!b64 || FONTS_LOADED.pc) return; FONTS_LOADED.pc = 1;
    try { var bin = atob(b64), buf = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i); var f = new FontFace('Fonte do PC', buf); document.fonts.add(f); f.load().catch(function () {}); } catch (e) {}
  }
  function loadFonts(all) {
    if (all || CFG.font === 'Fonte do PC') loadCustomFont();
    Object.keys(CC.fonts || {}).forEach(function (fam) {
      if (FONTS_LOADED[fam] || (!all && fam !== CFG.font && fam !== 'Bricolage Grotesque')) return; FONTS_LOADED[fam] = 1;
      Object.keys(CC.fonts[fam]).forEach(function (wt) {
        try {
          var bin = atob(CC.fonts[fam][wt]), buf = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
          var f = new FontFace(fam, buf, { weight: wt, style: 'normal', display: 'swap' });
          document.fonts.add(f); f.load().catch(function () {});
        } catch (e) {}
      });
    });
  }

  /* ---------- fundo (bolhas) ---------- */
  function aura() {
    if (document.getElementById('cc-aura') || !document.body) return;
    var a = document.createElement('div'); a.id = 'cc-aura'; a.innerHTML = '<i></i><i></i><i></i><b></b>';
    document.body.insertBefore(a, document.body.firstChild);
  }
  /* ---------- ícones ---------- */
  function sv(d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; }
  var IC = {
    min: sv('<path d="M5 12h14"/>'), max: sv('<rect x="5" y="5" width="14" height="14" rx="2.5"/>'), rest: sv('<rect x="5" y="8" width="11" height="11" rx="2"/><path d="M9 5h8a2 2 0 0 1 2 2v8"/>'),
    x: sv('<path d="M6 6l12 12M18 6L6 18"/>'), pen: sv('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>'), down: sv('<path d="M12 4v12M6 10l6 6 6-6M5 20h14"/>'), pal: sv('<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.9-.5-1.2-.3-.4-.5-.8-.5-1.2 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4-4-7.4-9-7.4z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10.5" cy="7" r="1.2" fill="currentColor"/><circle cx="15" cy="7.5" r="1.2" fill="currentColor"/>'),
    plus: sv('<path d="M12 5v14M5 12h14"/>'), img: sv('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/>')
  };
  var MARK = "<svg class=\"mk\" viewBox=\"0 0 1024 1024\"><defs><linearGradient id=\"ccga\" gradientUnits=\"userSpaceOnUse\" x1=\"252\" y1=\"344\" x2=\"588\" y2=\"680\"><stop offset=\"0\" stop-color=\"#4fe6c6\"/><stop offset=\"1\" stop-color=\"#3e8bff\"/></linearGradient><linearGradient id=\"ccgb\" gradientUnits=\"userSpaceOnUse\" x1=\"436\" y1=\"344\" x2=\"772\" y2=\"680\"><stop offset=\"0\" stop-color=\"#ddd2ff\"/><stop offset=\"1\" stop-color=\"#9b7bff\"/></linearGradient></defs><rect width=\"1024\" height=\"1024\" rx=\"232\" fill=\"#15161c\"/><circle cx=\"604\" cy=\"512\" r=\"168\" fill=\"none\" stroke=\"#15161c\" stroke-width=\"112\"/><circle cx=\"604\" cy=\"512\" r=\"168\" fill=\"none\" stroke=\"url(#ccgb)\" stroke-width=\"76\"/><circle cx=\"420\" cy=\"512\" r=\"168\" fill=\"none\" stroke=\"#15161c\" stroke-width=\"112\"/><circle cx=\"420\" cy=\"512\" r=\"168\" fill=\"none\" stroke=\"url(#ccga)\" stroke-width=\"76\"/><path d=\"M574.8 677.4A168 168 0 0 1 458.5 596\" fill=\"none\" stroke=\"#15161c\" stroke-width=\"112\"/><path d=\"M598.1 679.9A168 168 0 0 1 444.2 563.9\" fill=\"none\" stroke=\"url(#ccgb)\" stroke-width=\"76\"/></svg>";

  /* ---------- botões da janela ---------- */
  var MAXED = false;
  function win(cmd) { if (window.ccWin) return window.ccWin(cmd).then(function (z) { MAXED = !!z; paintMax(); }).catch(function () {}); return Promise.resolve(); }
  function paintMax() { document.querySelectorAll('.cc-win [data-w="max"]').forEach(function (b) { b.innerHTML = MAXED ? IC.rest : IC.max; b.title = MAXED ? 'Restaurar' : 'Maximizar'; }); }
  function winBox(extra) {
    var d = document.createElement('div'); d.className = 'cc-win' + (extra ? ' ' + extra : '');
    d.innerHTML = '<button class="cc-pal" data-w="pal" title="Aparência do Concord">' + IC.pal + '</button><button data-w="min" title="Minimizar">' + IC.min + '</button><button data-w="max" title="Maximizar">' + IC.max + '</button><button class="cc-x" data-w="close" title="Fechar">' + IC.x + '</button>';
    d.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; e.stopPropagation(); if (b.dataset.w === 'pal') togglePanel(); else win(b.dataset.w); });
    d.addEventListener('mousedown', function (e) { e.stopPropagation(); });
    return d;
  }
  // os botões entram na barra de cima do Discord (com as classes dela, para a pele base calcular o espaço)
  function mountWin() {
    if (!document.body) return;
    if (!document.getElementById('cc-winfix')) { var f = winBox(); f.id = 'cc-winfix'; document.body.appendChild(f); var dr = document.createElement('div'); dr.id = 'cc-drag'; document.body.appendChild(dr); paintMax(); }
    var tr = document.querySelector('[class*="base_"] > [class*="bar_"] > [class*="trailing_"]');
    if (HASBAR !== !!tr) { HASBAR = !!tr; marks(); }
    if (tr && !tr.querySelector('.cc-win')) {
      var m = /\btrailing_([\w-]+)/.exec(tr.className), suf = m ? m[1] : '';
      tr.appendChild(winBox(suf ? 'winButtons_' + suf : '')); paintMax();
    }
  }
  // arrastar pela barra de cima; dois cliques maximiza
  function isBarSpot(t) {
    if (!t || !t.closest) return false;
    if (t.closest('button, a, input, textarea, [role="button"], [role="tab"], [role="treeitem"], [contenteditable], .cc-win, #cc-ed')) return false;
    if (t.closest('[class*="base_"] > [class*="bar_"], #cc-drag')) return true;
    // layout Palco: o espaço vazio da faixa de cima (em volta dos servidores) também arrasta a janela
    if (CFG.layout === 'palco') {
      if (t.classList && (t.classList.contains('content__5e434') || t.classList.contains('scroller_ef3116') || t.classList.contains('tree_ef3116') || t.classList.contains('guilds__5e434'))) return true;
      if (t.id === 'cc-dockbg') return true;
    }
    return false;
  }
  document.addEventListener('mousedown', function (e) { if (e.button === 0 && e.detail === 1 && isBarSpot(e.target)) { e.preventDefault(); win('drag'); } }, true);
  document.addEventListener('dblclick', function (e) { if (isBarSpot(e.target)) win('max'); }, true);
  // layout Palco: a roda do mouse anda pelos servidores de lado
  document.addEventListener('wheel', function (e) {
    if (CFG.layout !== 'palco' || e.ctrlKey || !e.target.closest) return;
    var sc = e.target.closest('.guilds__5e434 .scroller_ef3116'); if (!sc || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault(); sc.scrollLeft += e.deltaY;
  }, { capture: true, passive: false });

  /* ---------- painel do Concord ---------- */
  var PANEL = null;
  function togglePanel(force) {
    if (!PANEL) buildPanel();
    var on = force == null ? !PANEL.classList.contains('on') : force;
    PANEL.classList.toggle('on', on);
    if (!on && PFV.el) PFV.el.classList.remove('on');
    if (on) { loadFonts(true); paintPanel(); }
  }
  function buildPanel() {
    PANEL = document.createElement('div'); PANEL.id = 'cc-panel';
    PANEL.innerHTML = '<div class="hd">' + MARK + '<div class="t"><b>Aparência</b><small>Concord ' + esc(INFO.ver) + '</small></div><button class="ib" data-a="close" title="Fechar">' + IC.x + '</button></div><div class="tabbar"></div><div class="bd"></div>' +
      '<div class="ft"><button class="btn" data-a="check" title="Procura versão nova do Concord e da pele">Procurar atualização</button><span class="sp"></span><button class="btn" data-a="reset">Restaurar padrão</button><button class="btn pri" data-a="update" hidden>Atualizar o Concord</button></div>';
    document.body.appendChild(PANEL);
    PANEL.addEventListener('click', onPanelClick);
    PANEL.addEventListener('input', onPanelInput);
    document.addEventListener('mousedown', function (e) { if (PANEL.classList.contains('on') && !e.target.closest('#cc-panel, .cc-win, #cc-pf-float, #cc-grande')) togglePanel(false); }, true);
  }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function range(k, label, sub, min, max, step, fmt) {
    var v = +CFG[k], p = ((v - min) / (max - min)) * 100;
    return '<div class="row"><div class="l"><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><input type="range" data-k="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v + '" style="--p:' + p + '%"><output>' + fmt(v) + '</output></div>';
  }
  function toggle(k, label, sub) { return '<div class="row"><div class="l"><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><button class="tg' + (CFG[k] ? ' on' : '') + '" data-t="' + k + '" role="switch" aria-checked="' + !!CFG[k] + '"></button></div>'; }
  var FMT = { pct: function (v) { return Math.round(v * 100) + '%'; }, px: function (v) { return Math.round(v) + 'px'; } };
  var EDIT = null; // tema sendo criado/editado
  var TABS = [['perfil', 'Perfil'], ['tema', 'Tema'], ['fundo', 'Fundo'], ['estilo', 'Estilo'], ['texto', 'Texto'], ['som', 'Som'], ['telas', 'Telas']];
  function themeCard(k, t, on, extra) {
    return '<button class="th' + (on ? ' on' : '') + '" data-p="' + esc(k) + '" style="--a:' + t.a1 + ';--g:radial-gradient(90% 120% at 15% 10%, ' + t.o[0] + ', transparent 70%), radial-gradient(90% 120% at 95% 90%, ' + t.o[1] + ', transparent 70%), ' + t.bg[1] + '"><i><em style="--c:' + t.a1 + '"></em><em style="--c:' + t.a2 + '"></em><em style="--c:' + t.a3 + '"></em></i><span>' + esc(t.n) + '</span>' + (extra || '') + '</button>';
  }
  function placeName() {
    var pk = placeKey(); if (!pk) return '';
    try {
      if (pk.indexOf('g:') === 0) { var G = st('Guild'), g = G && G.getGuild(pk.slice(2)); return g ? g.name : 'este servidor'; }
      var C = st('Channel'), U = st('User'), c = C && C.getChannel(pk.slice(3));
      if (c && c.name) return c.name;
      var u = c && U && U.getUser((c.recipients || [])[0]); return u ? nameOf(u) : 'esta conversa';
    } catch (e) { return pk.indexOf('g:') === 0 ? 'este servidor' : 'esta conversa'; }
  }
  var EDIT_FIELDS = [['bg.0', 'Fundo escuro'], ['bg.1', 'Fundo claro'], ['w', 'Painéis'], ['o.0', 'Bolha 1'], ['o.1', 'Bolha 2'], ['o.2', 'Bolha 3'], ['a1', 'Destaque'], ['a2', 'Destaque 2'], ['a3', 'Detalhe']];
  function getF(t, f) { var p = f.split('.'); return p.length > 1 ? t[p[0]][+p[1]] : t[f]; }
  function setF(t, f, v) { var p = f.split('.'); if (p.length > 1) t[p[0]][+p[1]] = v; else t[f] = v; }
  function paintPanel() {
    var P = allThemes()[themeKey()] || PRESETS.fofito, h = '', tab = CFG.tab || 'tema';
    var tabs = '<div class="tabs">' + TABS.map(function (t) { return '<button data-tab="' + t[0] + '"' + (tab === t[0] ? ' class="on"' : '') + '>' + t[1] + '</button>'; }).join('') + '</div>';
    if (tab !== 'perfil' && PFV.el) { PFV.el.classList.remove('on'); PANEL.classList.remove('pf-float'); }
    if (tab === 'perfil') h += perfilPanel();
    else if (tab === 'tema' && EDIT) {
      var t = EDIT.t;
      h += '<h4>' + (EDIT.key ? 'Editar tema' : 'Criar tema') + '</h4><div class="row"><div class="l"><b>Nome</b></div><input class="txt" data-en value="' + esc(t.n) + '" maxlength="24"></div>';
      h += '<div class="cols">' + EDIT_FIELDS.map(function (f) { return '<label class="col"><input type="color" data-ef="' + f[0] + '" value="' + getF(t, f[0]) + '"><span>' + f[1] + '</span></label>'; }).join('') + '</div>';
      h += '<div class="note">As mudanças aparecem na hora, enquanto você edita.</div><div class="btns"><button class="btn" data-a="ecancel">Cancelar</button>' + (EDIT.key ? '<button class="btn" data-a="edel">Apagar</button>' : '') + '<button class="btn pri" data-a="esave">Salvar tema</button></div>';
    } else if (tab === 'tema') {
      var mine = CFG.mine || {}, pn = placeName(), pt = placeTheme();
      h += '<h4>Temas prontos</h4><div class="themes">' + Object.keys(PRESETS).map(function (k) { return themeCard(k, PRESETS[k], CFG.preset === k); }).join('') + '</div>';
      h += '<h4>Seus temas</h4><div class="themes">' + Object.keys(mine).map(function (k) { return themeCard(k, mine[k], CFG.preset === k, '<b class="ed" data-edit="' + esc(k) + '" title="Editar">' + IC.pen + '</b>'); }).join('') +
        '<button class="th add" data-a="enew">' + IC.plus + '<span>Criar tema</span></button><button class="th add" data-a="eimp">' + IC.down + '<span>Colar código</span></button></div>';
      h += '<h4>Cor de destaque</h4><div class="sws"><button class="sw auto' + (!CFG.accent ? ' on' : '') + '" data-c="" title="A do tema" style="--c:' + P.a1 + '"></button>' +
        ACCENTS.map(function (c) { return '<button class="sw' + (CFG.accent === c ? ' on' : '') + '" data-c="' + c + '" style="--c:' + c + '"></button>'; }).join('') +
        '<label class="sw' + (CFG.accent && ACCENTS.indexOf(CFG.accent) < 0 ? ' on' : '') + '" title="Outra cor" style="--c:' + (CFG.accent || P.a1) + '">' + IC.plus + '<input type="color" data-ci="accent" value="' + (CFG.accent || P.a1) + '"></label></div>';
      if (pn) {
        h += '<h4>Tema só para ' + esc(pn) + '</h4><div class="note">Quando você abre ' + (placeKey().indexOf('g:') === 0 ? 'esse servidor' : 'essa conversa') + ', o Concord troca para o tema escolhido aqui.</div><div class="places"><button class="chip' + (!pt ? ' on' : '') + '" data-pl="">Igual ao geral</button>' +
          Object.keys(allThemes()).map(function (k) { var x = allThemes()[k]; return '<button class="chip' + (pt === k ? ' on' : '') + '" data-pl="' + esc(k) + '"><i style="background:linear-gradient(135deg,' + x.a1 + ',' + x.o[1] + ')"></i>' + esc(x.n) + '</button>'; }).join('') + '</div>';
      }
      if (CFG.mine && CFG.mine[CFG.preset]) h += '<div class="btns"><button class="btn" data-a="eexp">Copiar código do tema</button></div>';
    } else if (tab === 'fundo') {
      h += '<h4>Material</h4><div class="seg">' + [['aura', 'Aura'], ['acrylic', 'Acrílico'], ['mica', 'Mica'], ['wall', 'Imagem'], ['solid', 'Sólido']].map(function (m) {
        return '<button data-m="' + m[0] + '"' + (CFG.mat === m[0] ? ' class="on"' : '') + (INFO.mats[m[0]] === false ? ' disabled title="Precisa do Windows 11"' : '') + '>' + m[1] + '</button>';
      }).join('') + '</div><div class="note" style="margin-top:8px">' + ({ aura: 'Bolhas com as cores do tema atrás dos painéis de vidro.', acrylic: 'O que está atrás da janela aparece desfocado. Painéis bem transparentes combinam mais.', mica: 'Meio-termo: a cor do Windows por trás, com as bolhas do tema fracas e uma textura por cima.', wall: 'Uma imagem sua atrás dos painéis de vidro.', solid: 'Painéis firmes, sem transparência. O mais leve.' }[CFG.mat] || '') + '</div>';
      if (CFG.mat === 'wall') {
        h += '<h4>Seus fundos</h4><div class="note">Crie no editor com camadas, pincel, imagens e texto. Cada fundo tem versão para PC, tablet e celular.</div><div class="walls2" id="cc-walls"><div class="wl-load">Carregando...</div></div>' +
          '<div class="btns" style="justify-content:flex-start"><button class="btn pri" data-a="wallnew">' + IC.plus + ' Criar fundo</button><button class="btn" data-a="wallpick">' + IC.img + ' Usar uma imagem</button></div>';
        setTimeout(paintWalls, 0);
      }
      if (CFG.mat === 'aura' || CFG.mat === 'mica') h += range('orbs', 'Bolhas', 'Força das cores do fundo', 0.2, 1, 0.05, FMT.pct) + toggle('motion', 'Bolhas em movimento', 'Mais bonito, pesa um pouco mais');
      if (CFG.mat === 'aura' || CFG.mat === 'wall' || CFG.mat === 'mica') h += toggle('parallax', 'Profundidade', 'O fundo acompanha o mouse devagar, como se estivesse mais longe');
      if (CFG.mat !== 'solid') h += range('op', 'Opacidade dos painéis', 'Menos opaco deixa ver mais o fundo', 0.2, 1, 0.02, FMT.pct) + range('blur', 'Desfoque', 'Quanto o vidro desfoca o que está atrás', 0, 40, 1, FMT.px);
    } else if (tab === 'estilo') {
      h += '<h4>Layout</h4><div class="seg">' + [['palco', 'Palco'], ['classico', 'Clássico']].map(function (m) { return '<button data-lay="' + m[0] + '"' + (CFG.layout === m[0] ? ' class="on"' : '') + '>' + m[1] + '</button>'; }).join('') + '</div><div class="note" style="margin-top:8px">' +
        (CFG.layout === 'palco' ? 'Servidores numa faixa no topo, canais num cartão e os membros abrem quando você passa o mouse na direita. Ctrl+Shift+L troca.' : 'O arranjo de sempre do Discord, com a nossa pele. Ctrl+Shift+L troca.') + '</div>';
      if (CFG.layout === 'palco') h += range('sideW', 'Largura dos canais', '', 220, 380, 2, FMT.px);
      h += '<h4>Estilo</h4>' + toggle('style', 'Estilo ReApps', 'Fundo do chat, caixa de digitar e seleção com a nossa cara');
      if (CFG.style) h += toggle('bub', 'Mensagens em balões', 'As suas ficam na cor de destaque') + toggle('dood', 'Desenhos no fundo do chat', '') + range('tint', 'Cor do tema nos painéis', 'Quanto a cor de destaque tinge os painéis', 0, 0.25, 0.01, FMT.pct);
      h += '<h4>Formas</h4>' + range('radius', 'Cantos', '', 0, 24, 1, FMT.px) + range('gap', 'Espaço entre painéis', '', 0, 20, 1, FMT.px);
      h += '<h4>Detalhes</h4>' + toggle('anim', 'Animações', 'Trocas de tela, mensagens chegando, listas') + toggle('chatbar', 'Barra de mensagem solta', 'A caixa de digitar fica separada do chat') + toggle('small', 'Painel de usuário compacto', 'Seu perfil lá embaixo ocupa menos espaço');
    } else if (tab === 'texto') {
      h += '<h4>Fonte</h4><div class="fonts">' + FONTS.map(function (f) { return '<button data-f="' + esc(f) + '"' + (CFG.font === f ? ' class="on"' : '') + ' style="font-family:' + (f ? "'" + f + "'" : "'gg sans'") + '">' + (f === 'Bricolage Grotesque' ? 'Concord' : f || 'Padrão do Discord') + '</button>'; }).join('') +
        '<button data-a="fontpc"' + (CFG.font === 'Fonte do PC' ? ' class="on"' : '') + ' style="font-family:\'Fonte do PC\'">' + IC.plus + ' Fonte do PC</button></div><div class="note" style="margin-top:8px">"Concord" é a fonte do Concord. Em "Fonte do PC" você escolhe um arquivo .ttf, .otf ou .woff.</div>';
    } else if (tab === 'som') {
      h += '<h4>Chamadas</h4>' + range('boost', 'Volume das vozes', 'Aumenta o som de todo mundo, até 300%', 0.5, 3, 0.05, FMT.pct);
    } else if (tab === 'telas') {
      h += '<h4>Telas</h4>' + toggle('home', 'Início do Concord', 'Tela inicial nova com amigos, chamadas, conversas e servidores') + toggle('clean', 'Esconder propaganda do Discord', 'Nitro, Loja, Missões, botão de presente e de baixar o app') + toggle('lite', 'Modo leve', 'Sem vidro desfocado e sem bolhas: o mais rápido possível') +
        '<h4>Janela</h4>' + toggle('bg', 'Continuar aberto ao fechar', 'Fechar a janela deixa o Concord no ícone perto do relógio: você segue nas calls e recebendo avisos') + '<div class="btns" style="justify-content:flex-start"><button class="btn" data-a="fechar">Sair do Concord de vez</button></div>';
    }
    PANEL.querySelector('.tabbar').innerHTML = tabs;
    var bd = PANEL.querySelector('.bd'), sc = bd.dataset.tab === tab ? bd.scrollTop : 0; bd.innerHTML = h; bd.scrollTop = sc; bd.dataset.tab = tab;
    PANEL.querySelector('[data-a="update"]').hidden = !INFO.update;
  }
  function set(k, v, repaint) { CFG[k] = v; save(); applyTheme(); if (k === 'bg' && window.ccSegundoPlano) window.ccSegundoPlano(!!v).catch(function () {}); if (repaint) paintPanel(); if (k === 'home') homeTick(); if (k === 'parallax') parallax(); }
  function newId() { return 'meu-' + Date.now().toString(36); }
  function themeCode(t) { try { return 'CONCORD-TEMA:' + btoa(unescape(encodeURIComponent(JSON.stringify(t)))); } catch (e) { return ''; } }
  function readCode(c) {
    try { var t = JSON.parse(decodeURIComponent(escape(atob(String(c).trim().replace(/^CONCORD-TEMA:/, ''))))); if (!t || !t.a1 || !t.o || !t.bg) return null; t.n = String(t.n || 'Tema').slice(0, 24); return t; } catch (e) { return null; }
  }
  function onPanelClick(e) {
    var b = e.target.closest('button, b[data-edit]'); if (!b) return;
    if (perfilClick(b)) return;
    var a = b.dataset.a;
    if (b.dataset.tab) { CFG.tab = b.dataset.tab; EDIT = null; save(); paintPanel(); return; }
    if (b.dataset.edit) { e.stopPropagation(); var k = b.dataset.edit; EDIT = { key: k, t: JSON.parse(JSON.stringify(CFG.mine[k])), prev: CFG.preset }; CFG.preset = k; applyTheme(); paintPanel(); return; }
    if (a === 'close') togglePanel(false);
    else if (a === 'fechar') { if (window.ccFechar) window.ccFechar(); }
    else if (a === 'reset') { Object.keys(DEF).forEach(function (k) { if (k !== 'mine' && k !== 'places') CFG[k] = DEF[k]; }); delete CFG.wall; save(); applyTheme(); paintPanel(); toast('Aparência padrão de volta. Seus temas continuam salvos.'); }
    else if (a === 'update') { if (window.ccUpdate) window.ccUpdate(); }
    else if (a === 'check') { if (window.ccCheck) { toast('Procurando atualização...'); window.ccCheck().catch(function () { toast('Não consegui procurar agora'); }); } else toast('Atualize o Concord para usar este botão'); }
    else if (a === 'edopen') { togglePanel(false); edOpen(b.dataset.id || ''); }
    else if (a === 'wallnew') { togglePanel(false); edOpen(''); }
    else if (a === 'walluse') { wallUse(b.dataset.id); }
    else if (a === 'walldel') { if (b.dataset.sure) { DB.del(b.dataset.id).then(function () { if (CFG.wallId === b.dataset.id) { delete CFG.wallId; save(); applyTheme(); } paintPanel(); toast('Fundo apagado'); }); } else { b.dataset.sure = '1'; b.textContent = 'Apagar mesmo?'; } }
    else if (b.dataset.lay) { set('layout', b.dataset.lay, true); }
    else if (a === 'wallpick') pickWall();
    else if (a === 'fontpc') pickFont();
    else if (a === 'enew') { var base = allThemes()[themeKey()] || PRESETS.fofito; var t = JSON.parse(JSON.stringify(base)); t.n = 'Meu tema'; EDIT = { key: '', t: t, prev: CFG.preset, tmp: newId() }; CFG.mine = CFG.mine || {}; CFG.mine[EDIT.tmp] = EDIT.t; CFG.preset = EDIT.tmp; applyTheme(); paintPanel(); }
    else if (a === 'ecancel') { if (EDIT.tmp) delete CFG.mine[EDIT.tmp]; else CFG.mine[EDIT.key] = EDIT.orig || CFG.mine[EDIT.key]; CFG.preset = EDIT.prev; EDIT = null; save(); applyTheme(); paintPanel(); }
    else if (a === 'esave') { var key = EDIT.key || EDIT.tmp; CFG.mine[key] = EDIT.t; CFG.preset = key; CFG.accent = ''; EDIT = null; save(); applyTheme(); paintPanel(); toast('Tema salvo'); }
    else if (a === 'edel') { delete CFG.mine[EDIT.key]; Object.keys(CFG.places || {}).forEach(function (p) { if (CFG.places[p] === EDIT.key) delete CFG.places[p]; }); CFG.preset = EDIT.prev === EDIT.key ? 'fofito' : EDIT.prev; EDIT = null; save(); applyTheme(); paintPanel(); toast('Tema apagado'); }
    else if (a === 'eexp') { var c = themeCode(CFG.mine[CFG.preset]); try { navigator.clipboard.writeText(c); toast('Código copiado. Quem colar no Concord ganha esse tema.'); } catch (e2) { prompt('Código do tema', c); } }
    else if (a === 'eimp') {
      var paste = function (txt) { var t = readCode(txt); if (!t) { toast('Esse código não é de um tema do Concord'); return; } var id = newId(); CFG.mine = CFG.mine || {}; CFG.mine[id] = t; CFG.preset = id; CFG.accent = ''; save(); applyTheme(); paintPanel(); toast('Tema "' + t.n + '" adicionado'); };
      if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(paste).catch(function () { var v = prompt('Cole o código do tema'); if (v) paste(v); }); else { var v = prompt('Cole o código do tema'); if (v) paste(v); }
    }
    else if (b.dataset.pl != null) { var pk = placeKey(); CFG.places = CFG.places || {}; if (b.dataset.pl) CFG.places[pk] = b.dataset.pl; else delete CFG.places[pk]; save(); themeSwap(); paintPanel(); }
    else if (b.dataset.p) { CFG.accent = ''; set('preset', b.dataset.p, true); }
    else if (b.dataset.c != null && b.classList.contains('sw')) set('accent', b.dataset.c, true);
    else if (b.dataset.m) { set('mat', b.dataset.m, true); if (b.dataset.m === 'wall' && !CFG.wall) pickWall(); }
    else if (b.dataset.f != null) set('font', b.dataset.f, true);
    else if (b.dataset.t) set(b.dataset.t, !CFG[b.dataset.t], true);
  }
  function onPanelInput(e) {
    var t = e.target;
    if (perfilInput(t)) return;
    if (t.dataset.ef && EDIT) { setF(EDIT.t, t.dataset.ef, t.value); applyTheme(); return; }
    if (t.dataset.en != null && EDIT) { EDIT.t.n = t.value || 'Meu tema'; return; }
    if (t.dataset.k) {
      var min = +t.min, max = +t.max, v = +t.value; t.style.setProperty('--p', ((v - min) / (max - min)) * 100 + '%');
      var o = t.nextElementSibling; if (o) o.textContent = (t.dataset.k === 'op' || t.dataset.k === 'orbs' || t.dataset.k === 'tint' || t.dataset.k === 'boost' ? FMT.pct : FMT.px)(v);
      CFG[t.dataset.k] = v; save(); if (t.dataset.k === 'boost') { if (window.__ccBoostApply) window.__ccBoostApply(); } else applyTheme();
    } else if (t.dataset.ci) { CFG.accent = t.value; save(); applyTheme(); }
  }
  function pickFont() {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.ttf,.otf,.woff,.woff2';
    inp.onchange = function () {
      var f = inp.files[0]; if (!f) return;
      if (f.size > 3 << 20) { toast('Fonte grande demais (até 3 MB)'); return; }
      var r = new FileReader(); r.onload = function () {
        var b64 = String(r.result).split(',')[1];
        try { LS.setItem('concord.font.pc', b64); } catch (e) { toast('Não consegui guardar essa fonte'); return; }
        FONTS_LOADED.pc = 0; loadCustomFont(); set('font', 'Fonte do PC', true); toast('Fonte "' + f.name.replace(/\.[^.]+$/, '') + '" aplicada');
      };
      r.readAsDataURL(f);
    };
    inp.click();
  }
  var TT = null;
  function toast(t) {
    var n = document.getElementById('cc-toast'); if (!n) { n = document.createElement('div'); n.id = 'cc-toast'; document.body.appendChild(n); }
    n.textContent = t; n.classList.add('on'); clearTimeout(TT); TT = setTimeout(function () { n.classList.remove('on'); }, 2600);
  }

  /* ---------- avisos do Windows (o Discord no navegador usa Notification) ---------- */
  var NOTIFS = {}, NID = 0;
  function CCNotification(title, o) {
    o = o || {}; var self = this, id = ++NID;
    this.title = title; this.body = o.body || ''; this.icon = o.icon || ''; this.tag = o.tag || ''; this.data = o.data; this.silent = !!o.silent;
    this.onclick = this.onclose = this.onshow = this.onerror = null; this._l = {};
    NOTIFS[id] = this; this._id = id;
    if (window.ccNotify) window.ccNotify(String(id), String(title || ''), String(this.body), String(this.icon)).catch(function () {});
    setTimeout(function () { self._fire('show'); }, 0);
    var ids = Object.keys(NOTIFS); if (ids.length > 50) delete NOTIFS[ids[0]];
  }
  CCNotification.prototype.addEventListener = function (t, f) { (this._l[t] = this._l[t] || []).push(f); };
  CCNotification.prototype.removeEventListener = function (t, f) { this._l[t] = (this._l[t] || []).filter(function (x) { return x !== f; }); };
  CCNotification.prototype._fire = function (t) { var ev = { type: t, target: this, preventDefault: function () {} }; if (this['on' + t]) try { this['on' + t](ev); } catch (e) {} (this._l[t] || []).forEach(function (f) { try { f(ev); } catch (e) {} }); };
  CCNotification.prototype.close = function () { this._fire('close'); delete NOTIFS[this._id]; };
  Object.defineProperty(CCNotification, 'permission', { get: function () { return 'granted'; } });
  CCNotification.requestPermission = function (cb) { if (cb) cb('granted'); return Promise.resolve('granted'); };
  CCNotification.maxActions = 0;
  try { window.Notification = CCNotification; } catch (e) {}
  window.__ccNotifClick = function (id) { var n = NOTIFS[id]; if (n) n._fire('click'); };

  /* ---------- número de não lidas no ícone da barra de tarefas ---------- */
  var lastBadge = -1;
  function badge() {
    var m = /^\((\d+)\)/.exec(document.title || ''), n = m ? +m[1] : (/^[•·]/.test(document.title || '') ? 0 : 0);
    if (n !== lastBadge) { lastBadge = n; if (window.ccBadge) window.ccBadge(n).catch(function () {}); }
  }

  /* ---------- links: o que não é do Discord abre no navegador ---------- */
  function inside(u) { try { var x = new URL(u, location.href); return /(^|\.)discord\.com$/.test(x.hostname) && !/^\/(oauth2|download|nitro|safety|terms|privacy)/.test(x.pathname) || x.protocol === 'blob:' || x.href === 'about:blank'; } catch (e) { return true; } }
  var _open = window.open;
  window.open = function (u) {
    if (u && !inside(u) && window.ccOpen) { window.ccOpen(String(new URL(u, location.href))); return { closed: false, close: function () {}, focus: function () {}, blur: function () {}, postMessage: function () {} }; }
    return _open.apply(window, arguments);
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || e.defaultPrevented) return;
    if ((a.target === '_blank' || e.ctrlKey) && !inside(a.href) && window.ccOpen) { e.preventDefault(); e.stopPropagation(); window.ccOpen(a.href); }
  }, true);

  /* ---------- atalhos ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && (e.key === '<' || e.key === ',' || e.code === 'Comma')) { e.preventDefault(); togglePanel(); }
    if (e.key === 'Escape' && PANEL && PANEL.classList.contains('on')) { e.stopPropagation(); togglePanel(false); }
    if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l') && !(ED && ED.open)) { e.preventDefault(); set('layout', CFG.layout === 'palco' ? 'classico' : 'palco', PANEL && PANEL.classList.contains('on')); toast(CFG.layout === 'palco' ? 'Layout Palco' : 'Layout Clássico'); }
  }, true);

  /* ---------- quais mensagens são suas (para o balão na cor de destaque) ---------- */
  function myId() {
    var img = document.querySelector('[class*="panels_"] img[src*="/avatars/"], [class*="panels_"] img[src*="/users/"]');
    var m = img && /\/(?:avatars|users)\/(\d+)\//.exec(img.src); return m ? m[1] : '';
  }
  var CHAN_AT = 0;
  function tagMine() {
    var lis = document.querySelectorAll('li[id^="chat-messages-"]:not([data-cc-a])');
    if (!lis.length) return;
    var me = myId(), settled = Date.now() - CHAN_AT > 1200;
    lis.forEach(function (li) {
      var a = '?';
      if (li.querySelector('[class*="groupStart_"]')) {
        var av = li.querySelector('img[class*="avatar_"]'), m = av && /\/(?:avatars|users)\/(\d+)\//.exec(av.src || '');
        a = m ? m[1] : '?';
      } else {
        var p = li.previousElementSibling;
        while (p && !(p.tagName === 'LI' && p.dataset.ccA)) p = p.previousElementSibling;
        if (p) a = p.dataset.ccA;
      }
      li.dataset.ccA = a;
      if (me && a === me) li.dataset.ccMe = '1';
      var nx = li.nextElementSibling;
      if (settled && (!nx || !nx.matches('li[id^="chat-messages-"]'))) li.dataset.ccIn = '1';
    });
  }

  /* ---------- esqueleto da tela (só a estrutura, sem textos, nomes nem imagens) ----------
     O Concord guarda em dados/estrutura para ajustar a pele quando o Discord muda. */
  var DUMPED = {};
  var KEEP = ['class', 'id', 'role', 'aria-hidden', 'aria-selected', 'aria-expanded', 'aria-checked', 'type', 'contenteditable', 'href', 'data-list-item-id', 'aria-label', 'data-full-width', 'data-direction', 'data-cc-r', 'data-cc-p', 'style'];
  function visibleEdge(cs) {
    var b = ['Top', 'Right', 'Bottom', 'Left'].some(function (k) { return parseFloat(cs['border' + k + 'Width']) > 0 && cs['border' + k + 'Style'] !== 'none' && !/rgba\(.*, 0\)$|transparent/.test(cs['border' + k + 'Color']); });
    return b || (cs.boxShadow && cs.boxShadow !== 'none') || (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0);
  }
  function skeleton() {
    var marked = [];
    document.body.querySelectorAll('*').forEach(function (el) {
      if (el.closest('svg') && el.tagName !== 'svg') return;
      var cs = getComputedStyle(el); if (cs.display === 'none') return;
      // ::before / ::after com borda ou fundo (linhas soltas costumam vir daí)
      var ps = ['::before', '::after'].map(function (w) { var p = getComputedStyle(el, w); return p.content && p.content !== 'none' && p.display !== 'none' && (visibleEdge(p) || !/rgba\(.*, 0\)$|transparent/.test(p.backgroundColor) || p.backgroundImage !== 'none') ? w + ' ' + p.position + ' ' + p.width + 'x' + p.height + ' b=' + p.borderTopWidth + ' ' + p.borderTopColor + ' bg=' + p.backgroundColor + ' op=' + p.opacity : ''; }).filter(Boolean).join(' | ');
      if (ps) { el.setAttribute('data-cc-p', ps); marked.push(el); }
      if (!visibleEdge(cs)) return;
      var r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
      el.setAttribute('data-cc-r', Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.width) + ',' + Math.round(r.height) + ' op=' + cs.opacity + ' vis=' + cs.visibility + ' z=' + cs.zIndex + ' b=' + cs.borderTopWidth + ' ' + cs.borderTopColor + ' sh=' + (cs.boxShadow || '').slice(0, 40));
      marked.push(el);
    });
    var root = document.body.cloneNode(true);
    marked.forEach(function (el) { el.removeAttribute('data-cc-r'); el.removeAttribute('data-cc-p'); });
    root.querySelectorAll('#cc-panel, #cc-aura, #cc-toast, #cc-ed, script, style, link, svg *, iframe').forEach(function (n) { n.remove(); });
    (function walk(el) {
      for (var i = el.attributes.length - 1; i >= 0; i--) {
        var a = el.attributes[i].name;
        if (KEEP.indexOf(a) < 0 || (a === 'aria-label' && el.tagName !== 'BUTTON')) el.removeAttribute(a);
        else if (a === 'href' || a === 'data-list-item-id' || a === 'aria-label') el.setAttribute(a, el.getAttribute(a).replace(/\d{6,}/g, '#'));
        else if (a === 'style') el.setAttribute(a, el.getAttribute(a).replace(/url\([^)]*\)/g, 'url(#)').slice(0, 300));
      }
      if (el.id) el.id = el.id.replace(/\d{6,}/g, '#');
      var seen = {}, kids = Array.prototype.slice.call(el.childNodes);
      kids.forEach(function (c) {
        if (c.nodeType === 3) { if (c.nodeValue.trim()) c.nodeValue = '…'; else c.remove(); return; }
        if (c.nodeType !== 1) { c.remove(); return; }
        var sig = c.tagName + '.' + (c.getAttribute('class') || '');
        seen[sig] = (seen[sig] || 0) + 1;
        if (seen[sig] > 6) { c.remove(); return; }
        walk(c);
      });
    })(root);
    return '<!-- Concord ' + INFO.ver + ' | ' + location.pathname.replace(/\d{6,}/g, '#') + ' | ' + new Date().toISOString() + ' | tela ' + innerWidth + 'x' + innerHeight + ' dpr ' + devicePixelRatio + ' | diag ' + JSON.stringify(diag()) + ' -->\n' + root.outerHTML;
  }
  function screenKind() {
    if (document.querySelector('[class*="standardSidebarView_"]')) return 'configuracoes';
    if (document.querySelector('[class*="callContainer_"]')) return 'chamada';
    var p = location.pathname;
    if (/^\/channels\/@me\/\d/.test(p)) return 'conversa';
    if (/^\/channels\/@me/.test(p)) return 'inicio';
    if (/^\/channels\/\d+\/\d/.test(p)) return 'canal';
    if (/^\/(login|register)/.test(p)) return 'entrar';
    return 'outra';
  }
  function dump(force) {
    var k = screenKind();
    if (!window.ccDump || (DUMPED[k] && !force) || k === 'entrar' || document.hidden) return;
    DUMPED[k] = Date.now();
    try { window.ccDump(force ? 'manual-' + k : k, skeleton()).catch(function () {}); if (force) toast('Estrutura da tela guardada'); } catch (e) {}
  }
  // janela sem foco: guarda a tela como fica (para achar o que aparece pela transparência)
  window.addEventListener('blur', function () {
    setTimeout(function () { if (document.hasFocus() || DUMPED.desfocado || !window.ccDump) return; DUMPED.desfocado = 1; try { window.ccDump('desfocado', skeleton()).catch(function () {}); } catch (e) {} }, 1200);
  });
  // estilos do próprio Discord (uma vez por versão do Discord): assim eu testo a pele com o Discord de verdade
  function dumpCSS() {
    if (!window.ccDump) return;
    var sheets = [].slice.call(document.styleSheets).filter(function (sh) { return sh.href && /discord\.com\/assets\//.test(sh.href); });
    if (!sheets.length) return;
    var key = sheets.map(function (sh) { return sh.href.split('/').pop(); }).join(','), done = '';
    try { done = LS && LS.getItem('concord.cssdump'); } catch (e) {}
    if (done === key + '|' + INFO.ver) return;
    var out = ['/* ' + key + ' */'];
    sheets.forEach(function (sh) { try { out.push([].map.call(sh.cssRules, function (r) { return r.cssText; }).join('\n')); } catch (e) { out.push('/* sem acesso: ' + sh.href + ' */'); } });
    var html = '<!-- Concord ' + INFO.ver + ' estilos do Discord -->\n<style>\n' + out.join('\n') + '\n</style>';
    window.ccDump('discord-css', html).then(function () { try { LS && LS.setItem('concord.cssdump', key + '|' + INFO.ver); } catch (e) {} }).catch(function () {});
  }
  var dumpT = null, lastPath = '';
  function watchScreen() {
    var k = location.pathname + '|' + screenKind();
    if (k === lastPath) return;
    var g = location.pathname.split('/')[2], og = lastPath.split('|')[0].split('/')[2];
    lastPath = k; CHAN_AT = Date.now();
    swapAnim(g !== og);
    if (themeKey() !== LAST_THEME) themeSwap();
    homeTick();
    clearTimeout(dumpT); dumpT = setTimeout(function () { (window.requestIdleCallback || setTimeout)(function () { dump(false); }, { timeout: 8000 }); }, 5000);
  }
  document.addEventListener('keydown', function (e) { if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) { e.preventDefault(); dump(true); } }, true);

  var dragT = null;
  ['dragenter', 'dragover'].forEach(function (ev) { window.addEventListener(ev, function (e) {
    if (!e.dataTransfer || [].indexOf.call(e.dataTransfer.types || [], 'Files') < 0) return;
    if (ED && ED.open) return;
    flag('cc-drag', true); clearTimeout(dragT);
    dragT = setTimeout(function () { flag('cc-drag', false); }, 600);
  }, true); });
  window.addEventListener('drop', function () { setTimeout(function () { flag('cc-drag', false); }, 300); }, true);
  // anel de foco do Discord só quando a pessoa navega pelo teclado (senão aparecia um retângulo solto pela transparência)
  document.addEventListener('keydown', function (e) { if (e.key === 'Tab') flag('cc-kbd', true); }, true);
  document.addEventListener('mousedown', function () { if (FLAGS['cc-kbd']) flag('cc-kbd', false); }, true);

  /* ---------- zoom (Ctrl + roda do mouse, Ctrl + / -): o Concord lembra e volta com ele ---------- */
  var DPI = 1, ZOOM_OK = false;
  function curZoom() { return Math.round(devicePixelRatio / DPI * 100); }
  var zoomT = null;
  window.addEventListener('resize', function () {
    if (!ZOOM_OK) return;
    clearTimeout(zoomT); zoomT = setTimeout(function () { try { LS && LS.setItem('concord.zoom', String(curZoom())); } catch (e) {} }, 700);
  });
  function restoreZoom() {
    if (!window.ccDpi) { ZOOM_OK = true; return; }
    window.ccDpi().then(function (d) {
      DPI = d || 1;
      var saved = 0; try { saved = +(LS && LS.getItem('concord.zoom')) || 0; } catch (e) {}
      if (saved && Math.abs(saved - curZoom()) > 3 && window.ccZoom) window.ccZoom(saved, true).catch(function () {});
      setTimeout(function () { ZOOM_OK = true; }, 2500);
    }).catch(function () { ZOOM_OK = true; });
  }

  /* ================= Início do Concord: tela inicial nova, com os dados do seu Discord =================
     Lê (só lê) as informações que o próprio Discord já tem carregadas: amigos, status, quem está em chamada,
     conversas e servidores. Nada é enviado para fora. */
  var WREQ = null, STORES = {};
  // o Discord liga mais de um carregador: um pequeno primeiro e o principal depois. Fica sempre com o maior.
  var WREQ_AT = 0;
  function wreq() {
    var size = function (r) { return r && r.c ? Object.keys(r.c).length : 0; };
    if (WREQ && size(WREQ) > 2000 && Date.now() - WREQ_AT < 60000) return WREQ;
    var ch = window.webpackChunkdiscord_app; if (!ch || !ch.push || ch.push === Array.prototype.push) return WREQ;
    var got = null;
    try { ch.push([[Symbol('concord')], {}, function (r) { if (!got || size(r) > size(got)) got = r; }]); ch.pop(); } catch (e) {}
    if (got && size(got) >= size(WREQ)) { WREQ = got; WREQ_AT = Date.now(); }
    return WREQ;
  }
  function findMod(test) {
    var r = wreq(); if (!r || !r.c) return null;
    for (var id in r.c) {
      var m = r.c[id] && r.c[id].exports; if (!m || m === window) continue;
      try {
        if (test(m)) return m;
        if (typeof m === 'object') for (var k in m) { var x = m[k]; if (x && (typeof x === 'object' || typeof x === 'function') && test(x)) return x; }
      } catch (e) {}
    }
    return null;
  }
  var SHAPES = {
    User: function (m) { return typeof m.getCurrentUser === 'function' && typeof m.getUser === 'function'; },
    Rel: function (m) { return typeof m.getFriendIDs === 'function' && typeof m.isFriend === 'function'; },
    Presence: function (m) { return typeof m.getStatus === 'function' && typeof m.getActivities === 'function'; },
    Channel: function (m) { return typeof m.getChannel === 'function' && typeof m.getDMFromUserId === 'function'; },
    Guild: function (m) { return typeof m.getGuild === 'function' && typeof m.getGuilds === 'function' && typeof m.getGuildCount === 'function'; },
    Voice: function (m) { return typeof m.getVoiceStatesForChannel === 'function' && typeof m.getAllVoiceStates === 'function'; },
    Read: function (m) { return typeof m.getMentionCount === 'function' && typeof m.hasUnread === 'function' && typeof m.lastMessageId === 'function'; },
    GuildOrder: function (m) { return typeof m.getFlattenedGuildIds === 'function'; },
    VoiceAct: function (m) { return typeof m.selectVoiceChannel === 'function'; },
    DMAct: function (m) { return typeof m.openPrivateChannel === 'function'; }
  };
  // procura todas as peças que faltam numa passada só (o Discord tem milhares de módulos)
  var SCAN_AT = 0;
  function scanStores() {
    if (Date.now() - SCAN_AT < 5000) return; SCAN_AT = Date.now();
    var r = wreq(); if (!r || !r.c) return;
    var miss = Object.keys(SHAPES).filter(function (k) { return !STORES[k]; }); if (!miss.length) return;
    var check = function (x) {
      try { if (x.__ccNaoExiste__ !== undefined) return; } catch (e) { return; } // objetos que respondem a qualquer nome enganariam a busca
      for (var i = miss.length - 1; i >= 0; i--) { var k = miss[i]; try { if (SHAPES[k](x)) { STORES[k] = x; miss.splice(i, 1); } } catch (e) {} }
    };
    for (var id in r.c) {
      var m = r.c[id] && r.c[id].exports; if (!m || m === window) continue;
      try {
        if (typeof m === 'object' || typeof m === 'function') check(m);
        if (typeof m === 'object') for (var k in m) { var x = m[k]; if (x && (typeof x === 'object' || typeof x === 'function')) check(x); }
      } catch (e) {}
      if (!miss.length) break;
    }
  }
  function st(k) { if (!STORES[k]) scanStores(); return STORES[k] || null; }
  function go(path) { try { history.pushState(null, '', path); dispatchEvent(new PopStateEvent('popstate', { state: null })); } catch (e) { location.href = path; } }
  function avatarOf(u, size) {
    if (!u) return '';
    try { if (u.getAvatarURL) return u.getAvatarURL(undefined, size || 64); } catch (e) {}
    if (u.avatar) return 'https://cdn.discordapp.com/avatars/' + u.id + '/' + u.avatar + '.webp?size=' + (size || 64);
    try { return 'https://cdn.discordapp.com/embed/avatars/' + Number((BigInt(u.id) >> 22n) % 6n) + '.png'; } catch (e) { return 'https://cdn.discordapp.com/embed/avatars/0.png'; }
  }
  function guildIcon(g) { return g && g.icon ? 'https://cdn.discordapp.com/icons/' + g.id + '/' + g.icon + '.webp?size=96' : ''; }
  function initials(n) { return String(n || '?').split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 3); }
  function nameOf(u) { var R = st('Rel'); var nick = R && R.getNickname ? R.getNickname(u.id) : ''; return nick || u.globalName || u.global_name || u.username || '?'; }
  var SVG = {
    game: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M15.5 12h.01M18 14h.01"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="13" rx="2.5"/><path d="M8 2.5l4 3.5 4-3.5"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/></svg>',
    voice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    add: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>'
  };
  // o que a pessoa está fazendo agora, em uma linha
  function activityLine(id) {
    var P = st('Presence'); if (!P) return null;
    var acts = []; try { acts = P.getActivities(id) || []; } catch (e) {}
    var pick = acts.find(function (a) { return a.type === 2; }) || acts.find(function (a) { return a.type === 0; }) || acts.find(function (a) { return a.type === 3 || a.type === 1; }) || acts.find(function (a) { return a.type === 4; });
    if (!pick) return null;
    if (pick.type === 2) return { k: 'music', t: (pick.details || pick.name) + (pick.state ? ' de ' + pick.state : '') };
    if (pick.type === 0) return { k: 'game', t: 'Jogando ' + pick.name };
    if (pick.type === 3) return { k: 'tv', t: 'Assistindo ' + (pick.details || pick.name) };
    if (pick.type === 1) return { k: 'tv', t: 'Ao vivo: ' + (pick.details || pick.name) };
    return { k: 'chat', t: (pick.emoji && pick.emoji.name && !pick.emoji.id ? pick.emoji.name + ' ' : '') + (pick.state || '') };
  }
  var HOME = { el: null, back: null, filter: 'online', hidden: false, lastRender: 0, timer: null, shown: false };
  function onHomePath() { return /^\/channels\/@me\/?$/.test(location.pathname); }
  function homeRect() {
    var pg = document.querySelector('[class*="base_"] [class*="page_"]');
    return pg ? pg.getBoundingClientRect() : null;
  }
  function homeTick() {
    var h = document.documentElement;
    if (!CFG.home) { if (HOME.el) HOME.el.classList.remove('on'); if (HOME.back) HOME.back.classList.remove('on'); flag('cc-home-on', false); flag('cc-homelist', false); return; }
    var want = onHomePath();
    if (!want) HOME.hidden = false;
    flag('cc-homelist', want && HOME.hidden);
    var show = want && !HOME.hidden;
    if (!HOME.el && show) buildHome();
    if (!HOME.el) return;
    var r = homeRect();
    var vis = show && r && r.width > 200;
    flag('cc-home-on', !!vis);
    if (vis) {
      HOME.el.style.left = r.left + 'px'; HOME.el.style.top = r.top + 'px'; HOME.el.style.width = r.width + 'px'; HOME.el.style.height = r.height + 'px';
      var ready = !!st('User');
      if (!HOME.shown) { HOME.shown = true; HOME.el.classList.add('on'); HOME.ready = false; }
      if (ready && !HOME.ready) { HOME.ready = true; HOME.el.classList.add('in'); renderHome(true); setTimeout(function () { HOME.el.classList.remove('in'); }, 1300); }
      else if (!ready && !HOME.loading) { HOME.loading = true; renderLoading(); }
      if (!ready) { clearTimeout(HOME.retry); HOME.retry = setTimeout(homeTick, 1200); }
    } else if (HOME.shown) { HOME.shown = false; HOME.ready = false; HOME.loading = false; HOME.el.classList.remove('on'); }
    if (HOME.back) {
      var b = want && HOME.hidden && r;
      HOME.back.classList.toggle('on', !!b);
      if (b) { HOME.back.style.right = (innerWidth - r.right + 18) + 'px'; HOME.back.style.top = (r.top + 12) + 'px'; }
    }
  }
  // enquanto o Discord ainda não entregou os dados: esqueleto da tela com brilho passando
  function renderLoading() {
    var sk = function (c, n) { var o = ''; for (var i = 0; i < n; i++) o += '<div class="' + c + '"></div>'; return o; };
    HOME.el.querySelector('.sc').innerHTML = '<div class="hero sk-hero"><div class="sk sk-av"></div><div class="tx"><div class="sk sk-l1"></div><div class="sk sk-l2"></div></div></div>' +
      '<div class="grid" style="margin-top:22px"><div><div class="sk sk-h"></div><div class="friends">' + sk('sk sk-card', 6) + '</div></div><div><div class="sk sk-h"></div>' + sk('sk sk-card wide', 3) + '</div></div>';
  }
  function buildHome() {
    HOME.el = document.createElement('div'); HOME.el.id = 'cc-home'; HOME.el.innerHTML = '<div class="sc"></div>';
    document.body.appendChild(HOME.el);
    HOME.back = document.createElement('button'); HOME.back.id = 'cc-homeback'; HOME.back.innerHTML = SVG.home + 'Início do Concord';
    HOME.back.onclick = function () { HOME.hidden = false; homeTick(); };
    document.body.appendChild(HOME.back);
    HOME.el.addEventListener('click', onHomeClick);
    window.addEventListener('resize', homeTick);
    setInterval(function () { if (HOME.shown) { var c = HOME.el.querySelector('.clock'); if (c) c.textContent = clockText(); } }, 15000);
    // atualiza quando o Discord muda algo (alguém entra, sai, começa um jogo...)
    ['Presence', 'Rel', 'Voice', 'Read'].forEach(function (k) { var S = st(k); if (S && S.addChangeListener) S.addChangeListener(function () { if (HOME.shown) { clearTimeout(HOME.timer); HOME.timer = setTimeout(function () { renderHome(false); }, 900); } }); });
  }
  function clockText() { var d = new Date(); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
  function greet() { var h = new Date().getHours(); return h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
  function homeData() {
    var U = st('User'), R = st('Rel'), P = st('Presence'), C = st('Channel'), G = st('Guild'), V = st('Voice'), RS = st('Read'), GO = st('GuildOrder');
    var me = U.getCurrentUser();
    var friends = (R ? R.getFriendIDs() : []).map(function (id) {
      var u = U.getUser(id); if (!u) return null;
      var status = P ? (P.getStatus(id) || 'offline') : 'offline';
      return { id: id, u: u, name: nameOf(u), status: status, act: activityLine(id) };
    }).filter(Boolean);
    var order = { online: 0, idle: 1, dnd: 2, offline: 3 };
    var ord = function (x) { return x in order ? order[x] : 3; };
    friends.sort(function (a, b) { return ord(a.status) - ord(b.status) || (b.act ? 1 : 0) - (a.act ? 1 : 0) || a.name.localeCompare(b.name); });
    // chamadas acontecendo agora (nos seus servidores e em conversas)
    var calls = [];
    if (V) {
      var all = {}; try { all = V.getAllVoiceStates() || {}; } catch (e) {}
      var byCh = {};
      Object.keys(all).forEach(function (gid) { var m = all[gid] || {}; Object.keys(m).forEach(function (uid) { var vs = m[uid]; if (!vs || !vs.channelId) return; (byCh[vs.channelId] = byCh[vs.channelId] || { gid: gid === '@me' ? null : gid, users: [] }).users.push(uid); }); });
      Object.keys(byCh).forEach(function (cid) {
        var ch = C && C.getChannel(cid); var g = byCh[cid].gid && G && G.getGuild(byCh[cid].gid);
        calls.push({ cid: cid, gid: byCh[cid].gid, name: ch ? (ch.name || 'Chamada') : 'Chamada', guild: g, users: byCh[cid].users, mine: byCh[cid].users.indexOf(me.id) >= 0 });
      });
      calls.sort(function (a, b) { return (b.mine ? 1 : 0) - (a.mine ? 1 : 0) || b.users.length - a.users.length; });
    }
    // conversas recentes
    var dms = [];
    if (C && C.getSortedPrivateChannels) { try { dms = C.getSortedPrivateChannels().slice(0, 8); } catch (e) {} }
    else if (C && C.getMutablePrivateChannels) { try { var mp = C.getMutablePrivateChannels(); dms = Object.keys(mp).map(function (k) { return mp[k]; }).sort(function (a, b) { return (b.lastMessageId || '0').length - (a.lastMessageId || '0').length || ((b.lastMessageId || '0') > (a.lastMessageId || '0') ? 1 : -1); }).slice(0, 8); } catch (e) {} }
    dms = dms.map(function (c) {
      var rid = (c.recipients || [])[0], u = rid && U.getUser(rid);
      var nm = c.name || (u ? nameOf(u) : 'Conversa'); if (!c.name && (c.recipients || []).length > 1) nm = (c.recipients || []).map(function (id) { var x = U.getUser(id); return x ? nameOf(x) : ''; }).filter(Boolean).slice(0, 3).join(', ');
      return { id: c.id, name: nm, u: u, group: (c.recipients || []).length > 1, ping: RS ? RS.getMentionCount(c.id) : 0, unread: RS ? RS.hasUnread(c.id) : false, status: u && P ? P.getStatus(u.id) : 'offline' };
    });
    // servidores na ordem da sua coluna
    var gids = [];
    try { gids = GO ? GO.getFlattenedGuildIds() : Object.keys(G.getGuilds()); } catch (e) { try { gids = Object.keys(G.getGuilds()); } catch (e2) {} }
    var guilds = gids.map(function (id) { return G.getGuild(id); }).filter(Boolean);
    return { me: me, friends: friends, calls: calls, dms: dms, guilds: guilds };
  }
  function renderHome(first) {
    if (!HOME.el) return;
    HOME.loading = false;
    HOME.lastRender = Date.now();
    var d; try { d = homeData(); } catch (e) { HOME.el.querySelector('.sc').innerHTML = '<div class="empty">Não consegui ler os dados do Discord agora. A lista normal continua no botão abaixo.</div>'; return; }
    var on = d.friends.filter(function (f) { return f.status !== 'offline'; });
    var playing = d.friends.filter(function (f) { return f.act && f.act.k === 'game'; }), listening = d.friends.filter(function (f) { return f.act && f.act.k === 'music'; });
    var list = HOME.filter === 'online' ? on : HOME.filter === 'game' ? playing : HOME.filter === 'music' ? listening : d.friends;
    var callsN = d.calls.length;
    var sub = (on.length ? on.length + (on.length === 1 ? ' amigo online' : ' amigos online') : 'Nenhum amigo online agora') + (callsN ? ', ' + callsN + (callsN === 1 ? ' chamada acontecendo' : ' chamadas acontecendo') : '');
    var h = '<div class="hero"><div class="me"><img alt="" src="' + esc(avatarOf(d.me, 128)) + '"></div><div class="tx"><h1>' + greet() + ', ' + esc(d.me.globalName || d.me.username) + '</h1><p>' + esc(sub) + '</p></div><div class="clock">' + clockText() + '</div></div>';
    h += '<div class="acts"><button class="chip" data-h="add">' + SVG.add + 'Adicionar amigo</button><button class="chip" data-h="discord">' + SVG.list + 'Lista do Discord</button><button class="chip" data-h="look">' + IC.pal + 'Aparência</button></div>';
    h += '<div class="grid"><div>';
    h += '<div class="sec"><h2>Amigos <em>' + d.friends.length + '</em></h2><div class="filters">' +
      [['online', 'Online', on.length], ['game', 'Jogando', playing.length], ['music', 'Ouvindo', listening.length], ['all', 'Todos', d.friends.length]].map(function (f) { return '<button class="chip' + (HOME.filter === f[0] ? ' on' : '') + '" data-f="' + f[0] + '">' + f[1] + ' <small>' + f[2] + '</small></button>'; }).join('') + '</div>';
    h += list.length ? '<div class="friends">' + list.slice(0, 60).map(function (f, i) {
      return '<button class="fr" data-u="' + f.id + '" style="--i:' + Math.min(i, 20) + '"><span class="av"><img alt="" loading="lazy" src="' + esc(avatarOf(f.u, 64)) + '"><i class="' + f.status + '"></i></span><span class="t"><b>' + esc(f.name) + '</b><small>' + (f.act ? SVG[f.act.k] + '<span>' + esc(f.act.t) + '</span>' : '<span>' + ({ online: 'Online', idle: 'Ausente', dnd: 'Não perturbe', offline: 'Offline' }[f.status] || '') + '</span>') + '</small></span></button>';
    }).join('') + '</div>' : '<div class="card"><div class="empty">' + (HOME.filter === 'online' ? 'Ninguém online agora.' : 'Ninguém aqui por enquanto.') + '</div></div>';
    h += '</div></div><div>';
    h += '<div class="sec"><h2>' + SVG.voice.replace('<svg', '<svg width="16" height="16"') + 'Acontecendo agora</h2>' + (d.calls.length ? d.calls.slice(0, 6).map(function (c) {
      var ic = c.guild ? (guildIcon(c.guild) ? '<img class="gi" alt="" src="' + esc(guildIcon(c.guild)) + '">' : '<span class="gi">' + esc(initials(c.guild.name)) + '</span>') : '<span class="gi">' + SVG.chat.replace('<svg', '<svg width="16" height="16"') + '</span>';
      var U = st('User');
      return '<div class="vc"><div class="top">' + ic + '<div class="t"><b>' + esc(c.name) + '</b><small>' + esc(c.guild ? c.guild.name : 'Conversa') + ', ' + c.users.length + (c.users.length === 1 ? ' pessoa' : ' pessoas') + '</small></div>' +
        (c.mine ? '<button class="chip on" data-c="' + c.cid + '" data-g="' + (c.gid || '') + '">Você está aqui</button>' : '<button class="join" data-j="' + c.cid + '" data-g="' + (c.gid || '') + '">Entrar</button>') + '</div>' +
        '<div class="ppl">' + c.users.slice(0, 8).map(function (id) { var u = U.getUser(id); return u ? '<img alt="" title="' + esc(nameOf(u)) + '" src="' + esc(avatarOf(u, 48)) + '">' : ''; }).join('') + '</div></div>';
    }).join('') : '<div class="card"><div class="empty">Nenhuma chamada agora nos seus servidores.</div></div>') + '</div>';
    h += '<div class="sec"><h2>Conversas recentes</h2><div class="card">' + (d.dms.length ? d.dms.map(function (c) {
      return '<button class="row" data-dm="' + c.id + '"><span class="av"><img alt="" loading="lazy" src="' + esc(c.u ? avatarOf(c.u, 64) : 'https://cdn.discordapp.com/embed/avatars/0.png') + '">' + (c.group ? '' : '<i class="' + c.status + '"></i>') + '</span><span class="t"><b>' + esc(c.name) + '</b><small><span>' + (c.unread ? 'Mensagens novas' : c.group ? 'Grupo' : 'Conversa') + '</span></small></span>' + (c.ping ? '<span class="badge">' + c.ping + '</span>' : '') + '</button>';
    }).join('') : '<div class="empty">Sem conversas ainda.</div>') + '</div></div>';
    h += '<div class="sec"><h2>Seus servidores <em>' + d.guilds.length + '</em></h2><div class="guilds">' + d.guilds.slice(0, 40).map(function (g) {
      var RS = st('Read'), ic = guildIcon(g);
      return '<button class="gd" data-g2="' + g.id + '" title="' + esc(g.name) + '">' + (ic ? '<img class="gi" alt="" loading="lazy" src="' + esc(ic) + '">' : '<span class="gi">' + esc(initials(g.name)) + '</span>') + '<span>' + esc(g.name) + '</span></button>';
    }).join('') + '</div></div>';
    h += '</div></div>';
    var sc = HOME.el.querySelector('.sc'), top = sc.scrollTop; sc.innerHTML = h; sc.scrollTop = top;
    if (first) { HOME.el.classList.remove('in'); void HOME.el.offsetWidth; HOME.el.classList.add('in'); }
  }
  function openDM(uid) {
    var C = st('Channel'), cid = C && C.getDMFromUserId(uid);
    if (cid) { go('/channels/@me/' + cid); return; }
    var A = st('DMAct'); if (A) { try { A.openPrivateChannel(uid); return; } catch (e) {} }
    toast('Não consegui abrir a conversa');
  }
  function onHomeClick(e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.f) { HOME.filter = b.dataset.f; renderHome(false); return; }
    if (b.dataset.u) { openDM(b.dataset.u); return; }
    if (b.dataset.dm) { go('/channels/@me/' + b.dataset.dm); return; }
    if (b.dataset.g2) { go('/channels/' + b.dataset.g2); return; }
    if (b.dataset.j) {
      var A = st('VoiceAct');
      if (A) { try { A.selectVoiceChannel(b.dataset.j); toast('Entrando na chamada'); return; } catch (e2) {} }
      go('/channels/' + (b.dataset.g || '@me') + '/' + b.dataset.j); return;
    }
    if (b.dataset.c) { go('/channels/' + (b.dataset.g || '@me') + '/' + b.dataset.c); return; }
    if (b.dataset.h === 'look') { togglePanel(true); return; }
    if (b.dataset.h === 'discord' || b.dataset.h === 'add') {
      HOME.hidden = true; homeTick();
      if (b.dataset.h === 'add') setTimeout(function () { var t = [].slice.call(document.querySelectorAll('[class*="tabBar_"] [role="tab"], [class*="addFriend_"]')).pop(); if (t) t.click(); }, 150);
    }
  }

  /* ================= volume das vozes acima de 100% =================
     O Discord no navegador para em 100%. Aqui o som de cada pessoa passa por um amplificador (até 300%). */
  var BOOST = { ctx: null, sink: '', els: [] };
  function boostCtx() {
    if (!BOOST.ctx) { BOOST.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (BOOST.sink && BOOST.ctx.setSinkId) BOOST.ctx.setSinkId(BOOST.sink).catch(function () {}); }
    if (BOOST.ctx.state === 'suspended') BOOST.ctx.resume().catch(function () {});
    return BOOST.ctx;
  }
  (function hookAudio() {
    var P = HTMLMediaElement.prototype;
    var dSrc = Object.getOwnPropertyDescriptor(P, 'srcObject'), dVol = Object.getOwnPropertyDescriptor(P, 'volume'), dMut = Object.getOwnPropertyDescriptor(P, 'muted');
    if (!dSrc || !dVol || !dMut) return;
    function gainFor(el) { return el.__ccWantMuted ? 0 : (el.__ccWantVol == null ? 1 : el.__ccWantVol) * (+CFG.boost || 1); }
    function attach(el) {
      if (el.__cc || !el.__ccStream || (+CFG.boost || 1) === 1) return;
      try {
        var ctx = boostCtx(), src = ctx.createMediaStreamSource(el.__ccStream), g = ctx.createGain();
        g.gain.value = gainFor(el); src.connect(g); g.connect(ctx.destination);
        el.__cc = { src: src, g: g };
        dMut.set.call(el, true); // o som sai pelo amplificador; o elemento continua tocando (sem isso o Chrome não entrega o áudio)
      } catch (e) { el.__cc = null; }
    }
    function detach(el) {
      if (!el.__cc) return;
      try { el.__cc.src.disconnect(); el.__cc.g.disconnect(); } catch (e) {}
      el.__cc = null; dMut.set.call(el, !!el.__ccWantMuted); dVol.set.call(el, el.__ccWantVol == null ? 1 : el.__ccWantVol);
    }
    Object.defineProperty(P, 'srcObject', { configurable: true, enumerable: dSrc.enumerable, get: dSrc.get, set: function (v) {
      dSrc.set.call(this, v);
      try {
        detach(this); this.__ccStream = null;
        if (this.tagName === 'AUDIO' && v && typeof MediaStream !== 'undefined' && v instanceof MediaStream && v.getAudioTracks().length) {
          this.__ccStream = v; if (BOOST.els.indexOf(this) < 0) BOOST.els.push(this); attach(this);
        }
      } catch (e) {}
    } });
    Object.defineProperty(P, 'volume', { configurable: true, enumerable: dVol.enumerable, get: function () { return this.__cc ? (this.__ccWantVol == null ? 1 : this.__ccWantVol) : dVol.get.call(this); }, set: function (v) {
      this.__ccWantVol = v; if (this.__cc) this.__cc.g.gain.value = gainFor(this); else dVol.set.call(this, v);
    } });
    Object.defineProperty(P, 'muted', { configurable: true, enumerable: dMut.enumerable, get: function () { return this.__cc ? !!this.__ccWantMuted : dMut.get.call(this); }, set: function (v) {
      this.__ccWantMuted = !!v; if (this.__cc) this.__cc.g.gain.value = gainFor(this); else dMut.set.call(this, v);
    } });
    if (P.setSinkId) { var sk = P.setSinkId; P.setSinkId = function (id) { BOOST.sink = id; if (BOOST.ctx && BOOST.ctx.setSinkId) BOOST.ctx.setSinkId(id).catch(function () {}); return sk.apply(this, arguments); }; }
    window.__ccBoostApply = function () {
      BOOST.els = BOOST.els.filter(function (el) { return el.isConnected || el.__ccStream; });
      BOOST.els.forEach(function (el) { if ((+CFG.boost || 1) === 1) detach(el); else if (el.__cc) el.__cc.g.gain.value = gainFor(el); else attach(el); });
    };
    document.addEventListener('pointerdown', function () { if (BOOST.ctx && BOOST.ctx.state === 'suspended') BOOST.ctx.resume().catch(function () {}); }, true);
  })();

  /* ---------- membros no toque: o trilho abre com um toque (no mouse ele já abre ao passar por cima) ---------- */
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    var rail = e.target.closest && e.target.closest('.container_c8ffbb');
    document.querySelectorAll('.container_c8ffbb.cc-open').forEach(function (r) { if (r !== rail) r.classList.remove('cc-open'); });
    if (rail && !rail.classList.contains('cc-open') && document.documentElement.classList.contains('cc-lay')) {
      rail.classList.add('cc-open');
      // o primeiro toque só abre: não entra no perfil de quem estava embaixo do dedo
      var stop = function (ev) { ev.stopPropagation(); ev.preventDefault(); };
      rail.addEventListener('click', stop, { capture: true, once: true });
      setTimeout(function () { rail.removeEventListener('click', stop, true); }, 600);
    }
  }, true);

  /* ---------- compartilhar tela sem o som do próprio Concord ----------
     O som do sistema inclui as vozes da call: ia junto na transmissão, voltava duplicado e estourava os ouvidos.
     Com restrictOwnAudio o Chromium tira o som do próprio app; onde isso não existe, a tela vai sem som. */
  (function () {
    var MD = navigator.mediaDevices; if (!MD || !MD.getDisplayMedia || MD.__ccGdm) return; MD.__ccGdm = 1;
    var orig = MD.getDisplayMedia.bind(MD);
    MD.getDisplayMedia = function (c) {
      c = Object.assign({}, c || {});
      var sup = {}; try { sup = MD.getSupportedConstraints() || {}; } catch (e) {}
      if (c.audio) {
        var a = typeof c.audio === 'object' ? Object.assign({}, c.audio) : {};
        if (sup.restrictOwnAudio) a.restrictOwnAudio = true;
        a.suppressLocalAudioPlayback = false; a.echoCancellation = true; c.audio = a;
      }
      return orig(c).then(function (s) {
        if (!sup.restrictOwnAudio) s.getAudioTracks().forEach(function (t) { t.stop(); s.removeTrack(t); });
        return s;
      });
    };
  })();

  /* ---------- esconder Nitro, Loja, Missões, presente e baixar app ---------- */
  function cleanAds() {
    var hide = function (el) { if (el && !el.dataset.ccHid) { el.dataset.ccHid = '1'; el.style.setProperty('display', 'none', 'important'); } };
    if (!CFG.clean) { document.querySelectorAll('[data-cc-hid]').forEach(function (el) { el.style.removeProperty('display'); delete el.dataset.ccHid; }); return; }
    document.querySelectorAll('a[href="/store"], a[href="/shop"], a[href^="/quest-home"]').forEach(function (a) { hide(a.closest('li') || a.closest('.channel__972a0')); });
    var dl = document.querySelector('[data-list-item-id="guildsnav___app-download-button"]'); if (dl) hide(dl.closest('.listItem__650eb'));
    document.querySelectorAll('.trinketsIcon__5287f').forEach(function (t) { hide(t.closest('.container__5287f')); });
    document.querySelectorAll('.app-launcher-entrypoint').forEach(hide);
  }

  /* ---------- diagnóstico (vai junto no esqueleto da tela, para eu ver o que falhou) ---------- */
  function diag() {
    var ch = window.webpackChunkdiscord_app, d = { chunk: typeof ch, pronto: !!(ch && ch.push && ch.push !== Array.prototype.push), wreq: !!WREQ, cache: WREQ && WREQ.c ? Object.keys(WREQ.c).length : -1, achados: {}, audios: BOOST.els.length, amplificados: BOOST.els.filter(function (e) { return e.__cc; }).length, boost: CFG.boost, home: CFG.home, inicio: !!(HOME && HOME.el) };
    Object.keys(SHAPES).forEach(function (k) { d.achados[k] = !!STORES[k]; });
    return d;
  }
  window.__ccDiag = diag;

  /* ---------- troca de tema suave (servidores e conversas com tema próprio) ---------- */
  var LAST_THEME = '';
  function themeSwap() {
    var h = document.documentElement; h.classList.add('cc-tfade'); applyTheme();
    clearTimeout(themeSwap.t); themeSwap.t = setTimeout(function () { h.classList.remove('cc-tfade'); }, 750);
    LAST_THEME = themeKey();
  }

  /* ---------- profundidade: o fundo acompanha o mouse devagar ---------- */
  var PX = { on: false, x: 0, y: 0, tx: 0, ty: 0, raf: 0 };
  function pxMove(e) { PX.tx = (e.clientX / innerWidth - 0.5) * -26; PX.ty = (e.clientY / innerHeight - 0.5) * -18; if (!PX.raf) PX.raf = requestAnimationFrame(pxStep); }
  function pxStep() {
    PX.raf = 0; PX.x += (PX.tx - PX.x) * 0.12; PX.y += (PX.ty - PX.y) * 0.12;
    var a = document.getElementById('cc-aura'); if (a) a.style.transform = 'translate3d(' + PX.x.toFixed(1) + 'px,' + PX.y.toFixed(1) + 'px,0) scale(1.05)';
    if (Math.abs(PX.tx - PX.x) > 0.3 || Math.abs(PX.ty - PX.y) > 0.3) PX.raf = requestAnimationFrame(pxStep);
  }
  function parallax() {
    var want = !!CFG.parallax && !CFG.lite && (CFG.mat === 'aura' || CFG.mat === 'wall' || CFG.mat === 'mica');
    if (want === PX.on) return; PX.on = want;
    if (want) window.addEventListener('mousemove', pxMove, { passive: true });
    else { window.removeEventListener('mousemove', pxMove); var a = document.getElementById('cc-aura'); if (a) a.style.transform = ''; }
  }

  /* ---------- tela de abertura (enquanto o Discord carrega) ---------- */
  var SPLASH = null, SPLASH_AT = Date.now();
  function splash() {
    if (SPLASH || !document.body || window.__ccSplashDone) return;
    SPLASH = document.createElement('div'); SPLASH.id = 'cc-splash';
    var iv = setInterval(function () { splashCheck(); if (window.__ccSplashDone) clearInterval(iv); }, 300);
    SPLASH.innerHTML = '<div class="sp-in"><svg viewBox="0 0 120 64" class="sp-mk"><circle class="r1" cx="40" cy="32" r="20"/><circle class="r2" cx="80" cy="32" r="20"/></svg><b>Concord</b><small>Abrindo seu Discord</small><i class="sp-bar"><em></em></i></div>';
    document.body.appendChild(SPLASH);
  }
  function splashCheck() {
    if (!SPLASH || SPLASH.classList.contains('out')) return;
    var ready = document.querySelector('.guilds__5e434') && (document.querySelector('.sidebarList__5e434') || document.querySelector('.privateChannels_e6b769'));
    var login = /^\/(login|register)/.test(location.pathname) && Date.now() - SPLASH_AT > 1500;
    if ((ready && Date.now() - SPLASH_AT > 900) || login || Date.now() - SPLASH_AT > 25000) {
      SPLASH.classList.add('out'); window.__ccSplashDone = true;
      setTimeout(function () { if (SPLASH) SPLASH.remove(); }, 700);
    }
  }

  /* ---------- conversa privada: o painel grande da direita fica fechado (abre no botão do Discord) ---------- */
  function dmAside() {
    if (CFG.dmAsideOk || !/^\/channels\/@me\/\d/.test(location.pathname)) return;
    if (!document.querySelector('.content_f75fb0 > aside')) return;
    var btn = [].slice.call(document.querySelectorAll('.toolbar__9293f [aria-label]')).find(function (b) { return /hide user profile|ocultar perfil|esconder perfil/i.test(b.getAttribute('aria-label')); });
    if (btn) { btn.click(); CFG.dmAsideOk = true; save(); }
  }

  /* ---------- animação de troca de canal e de servidor (anima o que já está na tela, sem piscar) ---------- */
  function swapAnim(guildChanged) {
    if (!CFG.anim) return;
    setTimeout(function () {
      var mw = document.querySelector('.messagesWrapper__36d07');
      if (mw && mw.animate) mw.animate([{ opacity: 0.35, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
      if (guildChanged) { var sl = document.querySelector('.sidebarList__5e434'); if (sl && sl.animate) sl.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' }); }
    }, 30);
  }

  /* ================= Editor de fundos =================
     Camadas (imagem, texto, pintura, forma e degradê), pincel, borracha, opacidade, mistura, desfazer.
     Cada fundo tem uma versão para PC, uma para tablet e uma para celular. Fica guardado só neste computador. */
  var IDBF = null; try { IDBF = window.indexedDB; } catch (e) {}
  var IDBP = null;
  function db() {
    if (!IDBP) IDBP = new Promise(function (res, rej) {
      if (!IDBF) { rej(new Error('sem banco')); return; }
      var r = IDBF.open('concord', 1);
      r.onupgradeneeded = function () { var d = r.result; if (!d.objectStoreNames.contains('fundos')) d.createObjectStore('fundos', { keyPath: 'id' }); if (!d.objectStoreNames.contains('arquivos')) d.createObjectStore('arquivos'); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { IDBP = null; rej(r.error); };
    });
    return IDBP;
  }
  function dbReq(store, mode, fn) {
    return db().then(function (d) { return new Promise(function (res, rej) { var tx = d.transaction(store, mode), q = fn(tx.objectStore(store)); tx.oncomplete = function () { res(q ? q.result : undefined); }; tx.onerror = tx.onabort = function () { rej(tx.error); }; }); });
  }
  var DB = {
    list: function () { return dbReq('fundos', 'readonly', function (s) { return s.getAll(); }).then(function (a) { return (a || []).sort(function (x, y) { return (y.at || 0) - (x.at || 0); }); }); },
    get: function (id) { return dbReq('fundos', 'readonly', function (s) { return s.get(id); }); },
    put: function (p) { return dbReq('fundos', 'readwrite', function (s) { return s.put(p); }); },
    del: function (id) { return dbReq('fundos', 'readwrite', function (s) { return s.delete(id); }); }
  };
  function blobURL(b) { return new Promise(function (res) { if (!b) { res(''); return; } var r = new FileReader(); r.onload = function () { res(String(r.result)); }; r.onerror = function () { res(''); }; r.readAsDataURL(b); }); }
  function canvasBlob(c, type, q) { return new Promise(function (res) { c.toBlob(function (b) { res(b); }, type || 'image/png', q); }); }

  // fundo em uso (material Imagem)
  var WALL = { id: '', url: '' };
  function paintWall() {
    var a = document.getElementById('cc-aura'); if (!a) return;
    var on = CFG.mat === 'wall' && !!(CFG.wallId || CFG.wall);
    a.classList.toggle('wall', on);
    if (CFG.wallId) {
      if (WALL.id !== CFG.wallId) {
        WALL.id = CFG.wallId;
        DB.get(CFG.wallId).then(function (p) { return p && p.renders ? blobURL(p.renders.pc) : ''; }).then(function (u) {
          if (WALL.id !== CFG.wallId) return; WALL.url = u; a.style.setProperty('--cc-wall', u ? 'url("' + u + '")' : 'none');
        }).catch(function () {});
      } else if (WALL.url) a.style.setProperty('--cc-wall', 'url("' + WALL.url + '")');
    } else a.style.setProperty('--cc-wall', CFG.wall ? 'url("' + CFG.wall + '")' : 'none');
  }
  function wallUse(id) { CFG.wallId = id; delete CFG.wall; CFG.mat = 'wall'; WALL.id = ''; save(); applyTheme(); if (PANEL && PANEL.classList.contains('on')) paintPanel(); toast('Fundo aplicado'); }
  function paintWalls() {
    var box = document.getElementById('cc-walls'); if (!box) return;
    DB.list().then(function (list) {
      return Promise.all(list.map(function (p) { return blobURL(p.thumb).then(function (u) { return { p: p, u: u }; }); }));
    }).then(function (items) {
      box = document.getElementById('cc-walls'); if (!box) return;
      var old = CFG.wall && !CFG.wallId ? '<div class="wl on"><button class="wl-i" style="--w:url(' + CFG.wall + ')"></button><span>Imagem antiga</span></div>' : '';
      box.innerHTML = old + items.map(function (it) {
        return '<div class="wl' + (CFG.wallId === it.p.id ? ' on' : '') + '"><button class="wl-i" data-a="walluse" data-id="' + esc(it.p.id) + '" style="--w:url(' + it.u + ')" title="Usar este fundo"></button><span>' + esc(it.p.name) + '</span>' +
          '<div class="wl-b"><button data-a="edopen" data-id="' + esc(it.p.id) + '">Editar</button><button data-a="walldel" data-id="' + esc(it.p.id) + '">Apagar</button></div></div>';
      }).join('') + (items.length || old ? '' : '<div class="wl-load">Nenhum fundo ainda. Crie o primeiro.</div>');
    }).catch(function () { var b = document.getElementById('cc-walls'); if (b) b.innerHTML = '<div class="wl-load">Não consegui abrir os fundos guardados.</div>'; });
  }
  function pickWall() {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function () { var f = inp.files[0]; if (!f) return; togglePanel(false); edOpen('', { image: f }); };
    inp.click();
  }

  var DEVS = { pc: { n: 'PC', w: 1920, h: 1080 }, tab: { n: 'Tablet', w: 1600, h: 1200 }, cel: { n: 'Celular', w: 1080, h: 1920 } };
  var BLENDS = [['source-over', 'Normal'], ['multiply', 'Multiplicar'], ['screen', 'Clarear (tela)'], ['overlay', 'Sobrepor'], ['soft-light', 'Luz suave'], ['lighten', 'Mais claro'], ['darken', 'Mais escuro'], ['color', 'Só a cor'], ['difference', 'Diferença']];
  var ETOOLS = [['move', 'Mover', 'V'], ['brush', 'Pincel', 'B'], ['eraser', 'Borracha', 'E'], ['text', 'Texto', 'T'], ['image', 'Imagem', 'I'], ['shape', 'Forma', 'U'], ['fill', 'Degradê', 'G'], ['pick', 'Conta-gotas', 'K'], ['hand', 'Mão', 'H']];
  var EIC = {
    move: sv('<path d="M5 3l14 7-6 2-2 6z"/>'), brush: sv('<path d="M18.4 2.6a2 2 0 0 1 2.9 2.9L11 15.8 8.2 13z"/><path d="M7 14c-2 0-3.5 1.5-3.5 3.5 0 1.2-.6 2.2-1.5 2.5 1 .7 2.4 1 3.5 1C8.4 21 10 19 10 17z"/>'),
    eraser: sv('<path d="M20 20H9L4 15a2 2 0 0 1 0-2.8l9.2-9.2a2 2 0 0 1 2.8 0l4.6 4.6a2 2 0 0 1 0 2.8L12 18.6"/><path d="M8.5 9.5l6 6"/>'), text: sv('<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'),
    image: IC.img, shape: sv('<rect x="3" y="3" width="11" height="11" rx="2"/><circle cx="16" cy="16" r="5"/>'), fill: sv('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 15L15 3M8 21L21 8"/>'),
    pick: sv('<path d="M14.5 4.5l5 5M17 7l-9.5 9.5L4 20l3.5-3.5"/><path d="M13 3l8 8-2 2-8-8z"/>'), hand: sv('<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11.5V4a1.5 1.5 0 0 1 3 0v8M14 11.5V5.5a1.5 1.5 0 0 1 3 0V14c0 4-3 7-7 7-3 0-4.5-1.6-6-4l-2-3.5a1.5 1.5 0 0 1 2.5-1.6L8 15"/>'),
    undo: sv('<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>'), redo: sv('<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>'), back: sv('<path d="M15 18l-6-6 6-6"/>'),
    eye: sv('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'), eyeOff: sv('<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.6 3.4M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/>'),
    lock: sv('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'), unlock: sv('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>'),
    up: sv('<path d="M12 19V5M6 11l6-6 6 6"/>'), dn: sv('<path d="M12 5v14M6 13l6 6 6-6"/>'), dup: sv('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
    trash: sv('<path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'), paint: sv('<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.3-4-7.8-9-7.8z"/>')
  };
  var ED = null;
  function edDev() { return ED.p.devs[ED.dev]; }
  function edLayers() { return edDev().layers; }
  function edSel() { var id = ED.sel; return id ? edLayers().find(function (L) { return L.id === id; }) || null : null; }
  function lid() { return 'c' + Math.random().toString(36).slice(2, 10); }
  function edNewCanvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  // estado sem as imagens (para desfazer e para guardar)
  function strip(L) { var o = {}; for (var k in L) if (k[0] !== '_') o[k] = L[k]; return o; }
  function snap() { return JSON.stringify(edLayers().map(strip)); }
  function commit(before) {
    if (before == null || before === snap()) return;
    ED.undo.push({ k: 'st', dev: ED.dev, a: before, b: snap() }); if (ED.undo.length > 60) ED.undo.shift();
    ED.redo = []; ED.dirty = true; edPaintSide(); edButtons();
  }
  function copyCanvas(c) { var n = edNewCanvas(c.width, c.height); n.getContext('2d').drawImage(c, 0, 0); return n; }
  function edUndo(redo) {
    var from = redo ? ED.redo : ED.undo, to = redo ? ED.undo : ED.redo, e = from.pop(); if (!e) return;
    if (e.dev !== ED.dev) edSetDev(e.dev, true);
    if (e.k === 'st') edDev().layers = JSON.parse(redo ? e.b : e.a);
    else { var c = ED.cv[e.id]; if (c) { var x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); x.drawImage(redo ? e.b : e.a, 0, 0); } }
    to.push(e); ED.dirty = true;
    if (ED.sel && !edSel()) ED.sel = '';
    edPaintSide(); edButtons(); edDraw();
  }

  /* ----- desenhar ----- */
  function fontOf(L) { return (L.italic ? 'italic ' : '') + (L.weight || 700) + ' ' + Math.max(1, L.size) + "px '" + (L.font || 'Bricolage Grotesque') + "', 'gg sans', sans-serif"; }
  function textBox(L) {
    var x = ED.ctx; x.save(); x.font = fontOf(L);
    var lines = String(L.text == null ? '' : L.text).split('\n'), w = 0;
    lines.forEach(function (ln) { w = Math.max(w, x.measureText(ln).width); }); x.restore();
    return { w: Math.max(w, L.size * 0.5) + (L.stroke || 0) * 2, h: lines.length * L.size * 1.2 + (L.stroke || 0) * 2 };
  }
  function bounds(L) { if (L.type === 'image' || L.type === 'shape') return { w: L.w, h: L.h }; if (L.type === 'text') return textBox(L); return null; }
  function drawLayer(x, L, W, H) {
    if (L.type === 'fill') {
      var g;
      if (L.kind === 'solid') x.fillStyle = L.c1;
      else if (L.kind === 'radial') { g = x.createRadialGradient(W * (L.cx == null ? 0.5 : L.cx), H * (L.cy == null ? 0.5 : L.cy), 0, W / 2, H / 2, Math.hypot(W, H) * 0.6); g.addColorStop(0, L.c1); g.addColorStop(1, L.c2); x.fillStyle = g; }
      else { var a = (L.ang || 0) * Math.PI / 180, len = Math.abs(W * Math.cos(a)) + Math.abs(H * Math.sin(a)), dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2; g = x.createLinearGradient(W / 2 - dx, H / 2 - dy, W / 2 + dx, H / 2 + dy); g.addColorStop(0, L.c1); g.addColorStop(1, L.c2); x.fillStyle = g; }
      x.fillRect(0, 0, W, H); return;
    }
    if (L.type === 'paint') {
      var c = ED.cv[L.id]; if (!c) return;
      if (ED.stroke && ED.stroke.id === L.id && ED.stroke.tool === 'brush') {
        // o traço sendo feito agora fica numa folha à parte até soltar o mouse
        var t = ED.tmpL || (ED.tmpL = edNewCanvas(W, H)); if (t.width !== W || t.height !== H) { t.width = W; t.height = H; }
        var tx = t.getContext('2d'); tx.clearRect(0, 0, W, H); tx.drawImage(c, 0, 0); tx.save(); tx.globalAlpha = ED.brush.op; if (ED.brush.soft) tx.filter = 'blur(' + Math.max(1, ED.brush.size * 0.18) + 'px)'; tx.drawImage(ED.tmp, 0, 0); tx.restore();
        x.drawImage(t, L.dx || 0, L.dy || 0);
      } else x.drawImage(c, L.dx || 0, L.dy || 0);
      return;
    }
    x.translate(L.x, L.y); x.rotate((L.rot || 0) * Math.PI / 180); if (L.flip) x.scale(-1, 1);
    if (L.type === 'image') { var im = ED.img[L.id]; if (im) x.drawImage(im, -L.w / 2, -L.h / 2, L.w, L.h); return; }
    if (L.type === 'shape') {
      x.beginPath();
      if (L.kind === 'ellipse') x.ellipse(0, 0, Math.abs(L.w / 2), Math.abs(L.h / 2), 0, 0, Math.PI * 2);
      else if (x.roundRect) x.roundRect(-L.w / 2, -L.h / 2, L.w, L.h, Math.min(L.r || 0, Math.abs(L.w) / 2, Math.abs(L.h) / 2)); else x.rect(-L.w / 2, -L.h / 2, L.w, L.h);
      if (L.kind === 'line') { x.beginPath(); x.moveTo(-L.w / 2, 0); x.lineTo(L.w / 2, 0); x.lineCap = 'round'; x.lineWidth = Math.max(1, L.h); x.strokeStyle = L.color; x.stroke(); return; }
      x.fillStyle = L.color; x.fill(); if (L.stroke > 0) { x.lineWidth = L.stroke; x.strokeStyle = L.strokeColor || '#ffffff'; x.stroke(); } return;
    }
    if (L.type === 'text') {
      x.font = fontOf(L); x.textAlign = L.align || 'center'; x.textBaseline = 'middle';
      var lines = String(L.text == null ? '' : L.text).split('\n'), lh = L.size * 1.2, tb = textBox(L);
      var ax = L.align === 'left' ? -tb.w / 2 + (L.stroke || 0) : L.align === 'right' ? tb.w / 2 - (L.stroke || 0) : 0;
      lines.forEach(function (ln, i) {
        var yy = -tb.h / 2 + (L.stroke || 0) + lh * (i + 0.5);
        x.save();
        if (L.shadow) { x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = L.size * 0.25; x.shadowOffsetY = L.size * 0.06; }
        if (L.stroke > 0) { x.lineWidth = L.stroke * 2; x.lineJoin = 'round'; x.strokeStyle = L.strokeColor || '#000000'; x.strokeText(ln, ax, yy); x.shadowColor = 'transparent'; }
        x.fillStyle = L.color; x.fillText(ln, ax, yy); x.restore();
      });
    }
  }
  function renderTo(x, layers, W, H) {
    layers.forEach(function (L) { if (!L.vis) return; x.save(); x.globalAlpha = L.op == null ? 1 : L.op; x.globalCompositeOperation = L.blend || 'source-over'; try { drawLayer(x, L, W, H); } catch (e) {} x.restore(); });
  }
  function edDraw() { if (!ED.raf) ED.raf = requestAnimationFrame(edFrame); }
  function edFrame() {
    ED.raf = 0; if (!ED.open) return;
    var D = DEVS[ED.dev], x = ED.ctx;
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, D.w, D.h);
    renderTo(x, edLayers(), D.w, D.h);
    edOverlay();
  }

  /* ----- tela e zoom ----- */
  function edFit() {
    var st = ED.el.querySelector('.e-stage').getBoundingClientRect(), D = DEVS[ED.dev];
    ED.z = Math.max(0.05, Math.min((st.width - 48) / D.w, (st.height - 48) / D.h));
    ED.pan = { x: (st.width - D.w * ED.z) / 2, y: (st.height - D.h * ED.z) / 2 }; edBoard();
  }
  function edZoom(f, cx, cy) {
    var st = ED.el.querySelector('.e-stage').getBoundingClientRect(); if (cx == null) { cx = st.width / 2; cy = st.height / 2; }
    var nz = Math.max(0.05, Math.min(8, ED.z * f)), k = nz / ED.z;
    ED.pan = { x: cx - (cx - ED.pan.x) * k, y: cy - (cy - ED.pan.y) * k }; ED.z = nz; edBoard();
  }
  function edBoard() {
    var D = DEVS[ED.dev], b = ED.el.querySelector('.e-board');
    b.style.width = D.w * ED.z + 'px'; b.style.height = D.h * ED.z + 'px'; b.style.transform = 'translate(' + ED.pan.x + 'px,' + ED.pan.y + 'px)';
    ED.el.querySelector('.e-zv').textContent = Math.round(ED.z * 100) + '%'; edOverlay();
  }
  function toArt(e) { var r = ED.cvEl.getBoundingClientRect(), D = DEVS[ED.dev]; return { x: (e.clientX - r.left) / r.width * D.w, y: (e.clientY - r.top) / r.height * D.h }; }
  function toLocal(L, p) { var a = -(L.rot || 0) * Math.PI / 180, dx = p.x - L.x, dy = p.y - L.y; return { x: dx * Math.cos(a) - dy * Math.sin(a), y: dx * Math.sin(a) + dy * Math.cos(a) }; }
  function hit(L, p) {
    if (!L.vis || L.lock) return false;
    if (L.type === 'paint') { var c = ED.cv[L.id]; if (!c) return false; var px = Math.round(p.x - (L.dx || 0)), py = Math.round(p.y - (L.dy || 0)); if (px < 0 || py < 0 || px >= c.width || py >= c.height) return false; try { return c.getContext('2d').getImageData(px, py, 1, 1).data[3] > 20; } catch (e) { return false; } }
    var b = bounds(L); if (!b) return false; var q = toLocal(L, p); return Math.abs(q.x) <= Math.abs(b.w) / 2 + 4 && Math.abs(q.y) <= Math.abs(b.h) / 2 + 4;
  }
  function edOverlay() {
    var ov = ED.el.querySelector('.e-sel'), L = edSel(), b = L && bounds(L);
    ED.el.querySelector('.e-gv').classList.toggle('on', !!ED.guide.v); ED.el.querySelector('.e-gh').classList.toggle('on', !!ED.guide.h);
    if (!L || !b || !L.vis || ED.tool !== 'move') { ov.style.display = 'none'; return; }
    var z = ED.z; ov.style.display = 'block';
    ov.style.left = (L.x - Math.abs(b.w) / 2) * z + 'px'; ov.style.top = (L.y - Math.abs(b.h) / 2) * z + 'px';
    ov.style.width = Math.abs(b.w) * z + 'px'; ov.style.height = Math.abs(b.h) * z + 'px'; ov.style.transform = 'rotate(' + (L.rot || 0) + 'deg)';
    ov.classList.toggle('txt', L.type === 'text'); ov.classList.toggle('lk', !!L.lock);
  }

  /* ----- abrir, carregar, guardar ----- */
  function edBlank(name) {
    var P = allThemes()[themeKey()] || PRESETS.fofito, devs = {};
    Object.keys(DEVS).forEach(function (k) { devs[k] = { layers: k !== 'pc' ? [] : [{ id: lid(), type: 'fill', name: 'Degradê', vis: true, lock: false, op: 1, blend: 'source-over', kind: 'linear', c1: P.o[0], c2: P.bg[0], ang: 35 }] }; });
    return { id: 'f' + Date.now().toString(36), name: name || 'Meu fundo', devs: devs };
  }
  function edOpen(id, opt) {
    opt = opt || {};
    if (!ED) edBuild();
    ED.open = true; ED.undo = []; ED.redo = []; ED.sel = ''; ED.cv = {}; ED.img = {}; ED.blob = {}; ED.dirty = false; ED.guide = {};
    ED.el.classList.add('on'); flag('cc-edon', true);
    loadFonts(true);
    var load = id ? DB.get(id) : Promise.resolve(null);
    load.then(function (p) {
      if (!p) { ED.p = edBlank(); ED.isNew = true; return; }
      ED.isNew = false;
      ED.p = { id: p.id, name: p.name, devs: {} };
      var jobs = [];
      Object.keys(DEVS).forEach(function (k) {
        var src = (p.devs && p.devs[k]) || { layers: [] }, D = DEVS[k];
        ED.p.devs[k] = { layers: src.layers.map(function (L) {
          var o = strip(L); delete o.blob;
          if (L.blob && (L.type === 'image' || L.type === 'paint')) jobs.push(createImageBitmap(L.blob).then(function (bm) {
            if (L.type === 'image') { ED.img[o.id] = bm; ED.blob[o.id] = L.blob; }
            else { var c = edNewCanvas(D.w, D.h); c.getContext('2d').drawImage(bm, 0, 0); ED.cv[o.id] = c; }
          }).catch(function () {}));
          if (L.type === 'paint' && !L.blob) ED.cv[o.id] = edNewCanvas(D.w, D.h);
          return o;
        }) };
      });
      return Promise.all(jobs);
    }).then(function () {
      ED.dev = 'pc'; ED.el.querySelector('.e-name').value = ED.p.name; edSetDev('pc', true);
      if (opt.image) edAddImage(opt.image, true);
      setTimeout(edFit, 30);
    }).catch(function () { toast('Não consegui abrir esse fundo'); edClose(true); });
  }
  function edClose(force) {
    if (!force && ED.dirty) { edAsk('Sair sem salvar?', 'As mudanças deste fundo ainda não foram salvas.', [['save', 'Salvar e sair', 'pri'], ['drop', 'Sair sem salvar'], ['', 'Continuar editando']], function (r) { if (r === 'save') edSave().then(function () { edClose(true); }); else if (r === 'drop') edClose(true); }); return; }
    ED.open = false; ED.el.classList.remove('on'); flag('cc-edon', false); ED.cv = {}; ED.img = {}; ED.blob = {}; ED.undo = []; ED.redo = [];
  }
  function edSave() {
    var p = ED.p, out = { id: p.id, name: (ED.el.querySelector('.e-name').value || 'Meu fundo').slice(0, 40), at: Date.now(), devs: {}, renders: {} }, jobs = [];
    Object.keys(DEVS).forEach(function (k) {
      var D = DEVS[k], ls = p.devs[k].layers;
      out.devs[k] = { layers: ls.map(function (L) {
        var o = strip(L);
        if (L.type === 'image') o.blob = ED.blob[L.id] || null;
        if (L.type === 'paint' && ED.cv[L.id]) jobs.push(canvasBlob(ED.cv[L.id]).then(function (b) { o.blob = b; }));
        return o;
      }) };
      var c = edNewCanvas(D.w, D.h); renderTo(c.getContext('2d'), ls, D.w, D.h);
      jobs.push(canvasBlob(c, 'image/jpeg', 0.92).then(function (b) { out.renders[k] = b; }));
      if (k === 'pc') { var t = edNewCanvas(384, 216); t.getContext('2d').drawImage(c, 0, 0, 384, 216); jobs.push(canvasBlob(t, 'image/jpeg', 0.85).then(function (b) { out.thumb = b; })); }
    });
    var bt = ED.el.querySelector('[data-e="save"]'); bt.disabled = true; bt.textContent = 'Salvando...';
    return Promise.all(jobs).then(function () { return DB.put(out); }).then(function () {
      ED.dirty = false; ED.isNew = false; p.name = out.name; bt.disabled = false; bt.textContent = 'Salvar';
      if (CFG.wallId === p.id) { WALL.id = ''; paintWall(); }
      toast('Fundo salvo'); return out;
    }).catch(function (e) { bt.disabled = false; bt.textContent = 'Salvar'; toast('Não consegui salvar: ' + (e && e.message || 'erro')); throw e; });
  }
  function edAsk(title, text, btns, cb) {
    var d = document.createElement('div'); d.className = 'e-ask';
    d.innerHTML = '<div class="e-askb"><b>' + esc(title) + '</b><p>' + esc(text) + '</p><div class="e-askr">' + btns.map(function (b) { return '<button class="e-btn ' + (b[2] || '') + '" data-r="' + b[0] + '">' + esc(b[1]) + '</button>'; }).join('') + '</div></div>';
    d.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b && e.target !== d) return; d.remove(); cb(b ? b.dataset.r : ''); });
    ED.el.appendChild(d);
  }

  /* ----- versões (PC, tablet, celular) ----- */
  function edSetDev(k, quiet) {
    ED.dev = k; ED.sel = ''; var D = DEVS[k];
    ED.cvEl.width = D.w; ED.cvEl.height = D.h;
    ED.el.querySelectorAll('[data-dev]').forEach(function (b) { b.classList.toggle('on', b.dataset.dev === k); });
    var empty = !edLayers().length;
    ED.el.querySelector('.e-empty').classList.toggle('on', empty && k !== 'pc');
    if (!quiet) edFit(); else edBoard();
    edPaintSide(); edButtons(); edDraw();
  }
  // copia as camadas de outra versão, ajustando ao tamanho desta (cobrindo a tela)
  function edCopyFrom(src) {
    var S = DEVS[src], T = DEVS[ED.dev], s = Math.max(T.w / S.w, T.h / S.h), before = snap();
    var out = ED.p.devs[src].layers.map(function (L) {
      var o = strip(L); o.id = lid();
      if (L.type === 'image') { ED.img[o.id] = ED.img[L.id]; ED.blob[o.id] = ED.blob[L.id]; }
      if (L.type === 'paint') { var c = edNewCanvas(T.w, T.h), x = c.getContext('2d'); x.translate(T.w / 2, T.h / 2); x.scale(s, s); x.translate(-S.w / 2 + (L.dx || 0), -S.h / 2 + (L.dy || 0)); if (ED.cv[L.id]) x.drawImage(ED.cv[L.id], 0, 0); ED.cv[o.id] = c; o.dx = 0; o.dy = 0; }
      if (o.x != null) { o.x = (L.x - S.w / 2) * s + T.w / 2; o.y = (L.y - S.h / 2) * s + T.h / 2; }
      if (o.w != null) { o.w = L.w * s; o.h = L.h * s; }
      if (o.size) o.size = L.size * s; if (o.stroke) o.stroke = L.stroke * s;
      return o;
    });
    edDev().layers = out; ED.el.querySelector('.e-empty').classList.remove('on'); commit(before); edDraw();
  }

  /* ----- camadas novas ----- */
  function edInsert(L) { var ls = edLayers(), i = ED.sel ? ls.findIndex(function (x) { return x.id === ED.sel; }) : ls.length - 1; ls.splice(i < 0 ? ls.length : i + 1, 0, L); ED.sel = L.id; ED.el.querySelector('.e-empty').classList.remove('on'); }
  function base(type, name) { var D = DEVS[ED.dev]; return { id: lid(), type: type, name: name, vis: true, lock: false, op: 1, blend: 'source-over', x: D.w / 2, y: D.h / 2, rot: 0, flip: false }; }
  function edAddPaint() { var D = DEVS[ED.dev], L = base('paint', 'Pintura'); delete L.x; delete L.y; delete L.rot; delete L.flip; L.dx = 0; L.dy = 0; ED.cv[L.id] = edNewCanvas(D.w, D.h); edInsert(L); return L; }
  function edAddImage(file, cover) {
    if (!file || !/^image\//.test(file.type || 'image/')) return;
    if (file.size > 40 << 20) { toast('Imagem grande demais (até 40 MB)'); return; }
    createImageBitmap(file).then(function (bm) {
      // imagens enormes ficam com até 4096 pontos no lado maior
      var big = Math.max(bm.width, bm.height) > 4096;
      var go = function (bmp, blob) {
        var D = DEVS[ED.dev], before = snap(), L = base('image', (file.name || 'Imagem').replace(/\.[^.]+$/, '').slice(0, 30) || 'Imagem');
        var s = cover ? Math.max(D.w / bmp.width, D.h / bmp.height) : Math.min(D.w * 0.6 / bmp.width, D.h * 0.6 / bmp.height, 1);
        L.w = bmp.width * s; L.h = bmp.height * s; ED.img[L.id] = bmp; ED.blob[L.id] = blob;
        edInsert(L); edSetTool('move'); commit(before); edDraw();
        if (cover) Object.keys(DEVS).forEach(function (k) {
          if (k === ED.dev) return; var T = DEVS[k], o = JSON.parse(JSON.stringify(L)); o.id = lid(); var t = Math.max(T.w / bmp.width, T.h / bmp.height); o.w = bmp.width * t; o.h = bmp.height * t; o.x = T.w / 2; o.y = T.h / 2; ED.img[o.id] = bmp; ED.blob[o.id] = blob; ED.p.devs[k].layers.push(o);
        });
      };
      if (!big) { go(bm, file); return; }
      var s = 4096 / Math.max(bm.width, bm.height), c = edNewCanvas(Math.round(bm.width * s), Math.round(bm.height * s)); c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height);
      canvasBlob(c, 'image/png').then(function (b) { return createImageBitmap(b).then(function (b2) { go(b2, b); }); });
    }).catch(function () { toast('Não consegui abrir essa imagem'); });
  }
  function edPickImage() { var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true; inp.onchange = function () { [].forEach.call(inp.files, function (f) { edAddImage(f); }); }; inp.click(); }
  function edAddText(p) { var D = DEVS[ED.dev], before = snap(), L = base('text', 'Texto'); L.text = 'Seu texto'; L.size = Math.round(D.h * 0.09); L.font = CFG.font || 'Bricolage Grotesque'; L.weight = 700; L.color = '#ffffff'; L.align = 'center'; L.stroke = 0; L.strokeColor = '#000000'; L.shadow = true; if (p) { L.x = p.x; L.y = p.y; } edInsert(L); commit(before); edSetTool('move'); setTimeout(function () { var t = ED.el.querySelector('[data-lp="text"]'); if (t) { t.focus(); t.select(); } }, 30); }
  function edAddFill(kind) { var P = allThemes()[themeKey()] || PRESETS.fofito, before = snap(), L = base('fill', kind === 'solid' ? 'Cor' : 'Degradê'); delete L.x; delete L.y; delete L.rot; delete L.flip; L.kind = kind; L.c1 = kind === 'solid' ? P.o[1] : P.a1; L.c2 = P.o[1]; L.ang = 35; if (kind !== 'solid') L.op = 0.7; edInsert(L); commit(before); edDraw(); }

  /* ----- ferramentas ----- */
  function edSetTool(t) {
    if (t === 'image') { edPickImage(); return; }
    ED.tool = t; ED.el.querySelectorAll('[data-tool]').forEach(function (b) { b.classList.toggle('on', b.dataset.tool === t); });
    ED.el.querySelector('.e-stage').dataset.tool = t; edPaintSide(); edOverlay();
  }
  function edDown(e) {
    if (e.button === 2) return;
    var stage = ED.el.querySelector('.e-stage'); stage.setPointerCapture(e.pointerId);
    var p = toArt(e), D = DEVS[ED.dev], h = e.target.closest('.e-h');
    if (e.button === 1 || ED.tool === 'hand' || ED.space) { ED.drag = { mode: 'pan', sx: e.clientX, sy: e.clientY, pan: { x: ED.pan.x, y: ED.pan.y } }; return; }
    var L = edSel();
    if (h && L) { ED.drag = { mode: h.dataset.h === 'rot' ? 'rot' : /^[nsew]$/.test(h.dataset.h) ? 'side' : 'scale', h: h.dataset.h, start: p, L0: JSON.parse(JSON.stringify(strip(L))), before: snap() }; return; }
    if (ED.tool === 'move') {
      var ls = edLayers(), hitL = null;
      if (L && hit(L, p)) hitL = L; else for (var i = ls.length - 1; i >= 0; i--) if (ls[i].type !== 'fill' && hit(ls[i], p)) { hitL = ls[i]; break; }
      if (!hitL) { if (ED.sel) { ED.sel = ''; edPaintSide(); edOverlay(); } return; }
      if (ED.sel !== hitL.id) { ED.sel = hitL.id; edPaintSide(); }
      if (e.altKey && hitL.type !== 'paint') { var cp = edDupLayer(hitL); hitL = cp; }
      ED.drag = { mode: 'move', start: p, L0: JSON.parse(JSON.stringify(strip(hitL))), before: snap() }; edOverlay(); return;
    }
    if (ED.tool === 'brush' || ED.tool === 'eraser') {
      if (!L || L.type !== 'paint' || L.lock) { var b4 = snap(); L = edAddPaint(); commit(b4); }
      if (!L.vis) { L.vis = true; edPaintSide(); }
      var c = ED.cv[L.id]; ED.stroke = { id: L.id, tool: ED.tool, before: copyCanvas(c), last: { x: p.x - (L.dx || 0), y: p.y - (L.dy || 0) } };
      if (ED.tool === 'brush') { ED.tmp = ED.tmp && ED.tmp.width === D.w && ED.tmp.height === D.h ? ED.tmp : edNewCanvas(D.w, D.h); ED.tmp.getContext('2d').clearRect(0, 0, D.w, D.h); }
      edStroke([e]); return;
    }
    if (ED.tool === 'text') { edAddText(p); return; }
    if (ED.tool === 'pick') {
      try { var d = ED.ctx.getImageData(Math.round(p.x), Math.round(p.y), 1, 1).data; ED.brush.color = hex([d[0], d[1], d[2]]); edPaintSide(); toast('Cor ' + ED.brush.color + ' no pincel'); } catch (er) {}
      return;
    }
    if (ED.tool === 'shape') {
      var b5 = snap(), S = base('shape', ED.shape === 'ellipse' ? 'Elipse' : ED.shape === 'line' ? 'Linha' : 'Retângulo'); S.kind = ED.shape; S.color = ED.brush.color; S.r = 24; S.stroke = 0; S.strokeColor = '#ffffff'; S.x = p.x; S.y = p.y; S.w = 1; S.h = ED.shape === 'line' ? 8 : 1;
      edInsert(S); ED.drag = { mode: 'draw', start: p, before: b5 }; return;
    }
    if (ED.tool === 'fill') { edAddFill('linear'); }
  }
  function edStroke(evs) {
    var s = ED.stroke, L = edLayers().find(function (x) { return x.id === s.id; }); if (!L) return;
    var c = s.tool === 'brush' ? ED.tmp : ED.cv[s.id], x = c.getContext('2d'), B = ED.brush;
    x.save(); x.lineCap = 'round'; x.lineJoin = 'round';
    if (s.tool === 'eraser') { x.globalCompositeOperation = 'destination-out'; x.lineWidth = ED.eraser.size; x.strokeStyle = 'rgba(0,0,0,' + ED.eraser.op + ')'; if (ED.eraser.soft) x.filter = 'blur(' + Math.max(1, ED.eraser.size * 0.18) + 'px)'; }
    else { x.lineWidth = B.size; x.strokeStyle = B.color; }
    evs.forEach(function (e) {
      var p = toArt(e), q = { x: p.x - (L.dx || 0), y: p.y - (L.dy || 0) };
      x.beginPath(); x.moveTo(s.last.x, s.last.y); x.lineTo(q.x + 0.01, q.y); x.stroke(); s.last = q;
    });
    x.restore(); edDraw();
  }
  function edMove(e) {
    if (ED.stroke) { edStroke(e.getCoalescedEvents ? e.getCoalescedEvents() : [e]); return; }
    var d = ED.drag; if (!d) return;
    if (d.mode === 'pan') { ED.pan = { x: d.pan.x + e.clientX - d.sx, y: d.pan.y + e.clientY - d.sy }; edBoard(); return; }
    var p = toArt(e), L = edSel(); if (!L) return;
    var D = DEVS[ED.dev], L0 = d.L0, snapD = 10 / ED.z;
    if (d.mode === 'move') {
      if (L.type === 'paint') { L.dx = (L0.dx || 0) + p.x - d.start.x; L.dy = (L0.dy || 0) + p.y - d.start.y; }
      else {
        var nx = L0.x + p.x - d.start.x, ny = L0.y + p.y - d.start.y;
        if (e.shiftKey) { if (Math.abs(p.x - d.start.x) > Math.abs(p.y - d.start.y)) ny = L0.y; else nx = L0.x; }
        ED.guide = {}; if (Math.abs(nx - D.w / 2) < snapD) { nx = D.w / 2; ED.guide.v = 1; } if (Math.abs(ny - D.h / 2) < snapD) { ny = D.h / 2; ED.guide.h = 1; }
        L.x = nx; L.y = ny;
      }
    } else if (d.mode === 'scale') {
      var r0 = Math.hypot(d.start.x - L0.x, d.start.y - L0.y) || 1, f = Math.max(0.02, Math.hypot(p.x - L0.x, p.y - L0.y) / r0);
      if (L.type === 'text') L.size = Math.max(4, L0.size * f); else { L.w = L0.w * f; L.h = L0.h * f; }
    } else if (d.mode === 'side') {
      var q = toLocal(L0, p);
      if (L.type === 'text') { L.size = Math.max(4, L0.size * Math.max(0.05, (/[ew]/.test(d.h) ? Math.abs(q.x) * 2 / (textBox(L0).w || 1) : Math.abs(q.y) * 2 / (textBox(L0).h || 1)))); }
      else if (/[ew]/.test(d.h)) L.w = Math.max(2, Math.abs(q.x) * 2); else L.h = Math.max(2, Math.abs(q.y) * 2);
    } else if (d.mode === 'rot') {
      var a = Math.atan2(p.y - L0.y, p.x - L0.x) - Math.atan2(d.start.y - L0.y, d.start.x - L0.x), deg = (L0.rot || 0) + a * 180 / Math.PI;
      if (e.shiftKey) deg = Math.round(deg / 15) * 15; L.rot = Math.round(((deg + 540) % 360 - 180) * 10) / 10;
    } else if (d.mode === 'draw') {
      if (L.kind === 'line') { L.x = (d.start.x + p.x) / 2; L.y = (d.start.y + p.y) / 2; L.w = Math.hypot(p.x - d.start.x, p.y - d.start.y); L.rot = Math.atan2(p.y - d.start.y, p.x - d.start.x) * 180 / Math.PI; }
      else { var w = Math.abs(p.x - d.start.x), hh = Math.abs(p.y - d.start.y); if (e.shiftKey) w = hh = Math.max(w, hh); L.w = w; L.h = hh; L.x = d.start.x + (p.x > d.start.x ? w : -w) / 2; L.y = d.start.y + (p.y > d.start.y ? hh : -hh) / 2; }
    }
    edDraw(); edLiveProps();
  }
  function edUp() {
    if (ED.stroke) {
      var s = ED.stroke, c = ED.cv[s.id];
      if (s.tool === 'brush' && c) { var x = c.getContext('2d'); x.save(); x.globalAlpha = ED.brush.op; if (ED.brush.soft) x.filter = 'blur(' + Math.max(1, ED.brush.size * 0.18) + 'px)'; x.drawImage(ED.tmp, 0, 0); x.restore(); }
      ED.stroke = null;
      if (c) { ED.undo.push({ k: 'px', dev: ED.dev, id: s.id, a: s.before, b: copyCanvas(c) }); if (ED.undo.length > 60) ED.undo.shift(); ED.redo = []; ED.dirty = true; edButtons(); edPaintSide(); }
      edDraw(); return;
    }
    var d = ED.drag; ED.drag = null; ED.guide = {};
    if (!d) return;
    if (d.mode === 'draw') { var L = edSel(); if (L && L.w < 6 && (L.kind === 'line' || L.h < 6)) { var D = DEVS[ED.dev]; L.w = D.h * 0.3; L.h = L.kind === 'line' ? 8 : D.h * 0.3; } }
    if (d.before != null) commit(d.before);
    edOverlay(); edDraw(); edPaintSide();
  }
  function edDupLayer(L) {
    var o = JSON.parse(JSON.stringify(strip(L))); o.id = lid(); o.name = L.name + ' (cópia)';
    if (L.type === 'image') { ED.img[o.id] = ED.img[L.id]; ED.blob[o.id] = ED.blob[L.id]; }
    if (L.type === 'paint') ED.cv[o.id] = copyCanvas(ED.cv[L.id]);
    if (o.x != null && !ED.drag) { o.x += 30; o.y += 30; }
    edInsert(o); return o;
  }
  function edLayerAct(a) {
    var L = edSel(), ls = edLayers(), before = snap(); if (!L && a !== 'paint') return;
    var i = ls.indexOf(L);
    if (a === 'up' && i < ls.length - 1) { ls.splice(i, 1); ls.splice(i + 1, 0, L); }
    else if (a === 'dn' && i > 0) { ls.splice(i, 1); ls.splice(i - 1, 0, L); }
    else if (a === 'dup') edDupLayer(L);
    else if (a === 'del') { ls.splice(i, 1); ED.sel = ''; }
    else if (a === 'paint') edAddPaint();
    commit(before); edDraw(); edPaintSide();
  }

  /* ----- painel da direita: opções da ferramenta, propriedades da camada e lista de camadas ----- */
  function eRange(k, label, min, max, step, v, fmt) { return '<label class="e-row"><span>' + label + '</span><input type="range" data-lp="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v + '" style="--p:' + ((v - min) / (max - min) * 100) + '%"><output>' + (fmt ? fmt(v) : Math.round(v)) + '</output></label>'; }
  function eColor(k, label, v) {
    var P = allThemes()[themeKey()] || PRESETS.fofito, sw = [P.a1, P.a2, P.a3, P.o[0], P.o[1], '#ffffff', '#000000'];
    return '<div class="e-row"><span>' + label + '</span><div class="e-cols"><input type="color" data-lp="' + k + '" value="' + v + '">' + sw.map(function (c) { return '<button class="e-sw" data-sw="' + k + '" data-c="' + c + '" style="--c:' + c + '"></button>'; }).join('') + '</div></div>';
  }
  function eToggle(k, label, on) { return '<div class="e-row"><span>' + label + '</span><button class="tg' + (on ? ' on' : '') + '" data-lt="' + k + '"></button></div>'; }
  function eSeg(k, opts, v) { return '<div class="e-seg">' + opts.map(function (o) { return '<button data-ls="' + k + '" data-v="' + o[0] + '"' + (String(v) === String(o[0]) ? ' class="on"' : '') + '>' + o[1] + '</button>'; }).join('') + '</div>'; }
  var PCT = function (v) { return Math.round(v * 100) + '%'; }, DEG = function (v) { return Math.round(v) + '°'; };
  function edPaintSide() {
    if (!ED || !ED.open) return;
    var L = edSel(), t = ED.tool, h = '', B = ED.brush;
    if (t === 'brush') h += '<h5>Pincel</h5>' + eColor('b.color', 'Cor', B.color) + eRange('b.size', 'Tamanho', 1, 300, 1, B.size) + eRange('b.op', 'Opacidade', 0.05, 1, 0.05, B.op, PCT) + eToggle('b.soft', 'Ponta macia', B.soft);
    else if (t === 'eraser') h += '<h5>Borracha</h5>' + eRange('x.size', 'Tamanho', 1, 300, 1, ED.eraser.size) + eRange('x.op', 'Força', 0.05, 1, 0.05, ED.eraser.op, PCT) + eToggle('x.soft', 'Ponta macia', ED.eraser.soft);
    else if (t === 'shape') h += '<h5>Forma</h5>' + eSeg('shape', [['rect', 'Retângulo'], ['ellipse', 'Elipse'], ['line', 'Linha']], ED.shape) + eColor('b.color', 'Cor', B.color) + '<p class="e-note">Arraste na tela para desenhar. Com Shift fica quadrado ou redondo.</p>';
    else if (t === 'text') h += '<h5>Texto</h5><p class="e-note">Clique na tela onde o texto vai ficar.</p>';
    else if (t === 'pick') h += '<h5>Conta-gotas</h5><p class="e-note">Clique na tela para pegar uma cor para o pincel.</p><div class="e-row"><span>Cor do pincel</span><i class="e-chip" style="--c:' + B.color + '"></i></div>';
    else if (t === 'fill') h += '<h5>Degradê e cor</h5><div class="e-btns"><button class="e-btn" data-add="solid">Cor sólida</button><button class="e-btn" data-add="linear">Degradê</button><button class="e-btn" data-add="radial">Degradê redondo</button></div>';
    if (L) {
      h += '<h5>Camada</h5><input class="e-txt" data-lp="name" value="' + esc(L.name) + '" maxlength="30">' + eRange('op', 'Opacidade', 0, 1, 0.01, L.op, PCT) +
        '<div class="e-row"><span>Mistura</span><select data-lp="blend">' + BLENDS.map(function (b) { return '<option value="' + b[0] + '"' + (L.blend === b[0] ? ' selected' : '') + '>' + b[1] + '</option>'; }).join('') + '</select></div>';
      if (L.type === 'text') {
        h += '<textarea class="e-txt" data-lp="text" rows="3">' + esc(L.text) + '</textarea>' +
          '<div class="e-row"><span>Fonte</span><select data-lp="font">' + FONTS.concat(['Fonte do PC']).filter(Boolean).map(function (f) { return '<option value="' + esc(f) + '"' + (L.font === f ? ' selected' : '') + ' style="font-family:\'' + esc(f) + '\'">' + (f === 'Bricolage Grotesque' ? 'Concord' : f) + '</option>'; }).join('') + '</select></div>' +
          eRange('size', 'Tamanho', 8, 600, 1, L.size) + eSeg('weight', [[400, 'Normal'], [600, 'Médio'], [700, 'Negrito']], L.weight) + eSeg('align', [['left', 'Esquerda'], ['center', 'Centro'], ['right', 'Direita']], L.align) +
          eColor('color', 'Cor', L.color) + eRange('stroke', 'Contorno', 0, 40, 1, L.stroke || 0) + (L.stroke ? eColor('strokeColor', 'Cor do contorno', L.strokeColor || '#000000') : '') + eToggle('shadow', 'Sombra', !!L.shadow) + eToggle('italic', 'Itálico', !!L.italic) + eRange('rot', 'Girar', -180, 180, 1, L.rot || 0, DEG);
      } else if (L.type === 'image') {
        h += eRange('rot', 'Girar', -180, 180, 1, L.rot || 0, DEG) + '<div class="e-btns"><button class="e-btn" data-do="flip">Espelhar</button><button class="e-btn" data-do="center">Centralizar</button><button class="e-btn" data-do="fit">Caber na tela</button><button class="e-btn" data-do="cover">Cobrir a tela</button><button class="e-btn" data-do="ratio">Proporção original</button></div>';
      } else if (L.type === 'shape') {
        h += eColor('color', 'Cor', L.color) + (L.kind === 'rect' ? eRange('r', 'Cantos', 0, 400, 1, L.r || 0) : '') + (L.kind !== 'line' ? eRange('stroke', 'Borda', 0, 60, 1, L.stroke || 0) + (L.stroke ? eColor('strokeColor', 'Cor da borda', L.strokeColor || '#ffffff') : '') : eRange('h', 'Espessura', 1, 120, 1, L.h)) +
          eRange('rot', 'Girar', -180, 180, 1, L.rot || 0, DEG) + '<div class="e-btns"><button class="e-btn" data-do="center">Centralizar</button><button class="e-btn" data-do="cover">Cobrir a tela</button></div>';
      } else if (L.type === 'fill') {
        h += eSeg('kind', [['solid', 'Cor'], ['linear', 'Degradê'], ['radial', 'Redondo']], L.kind) + eColor('c1', L.kind === 'solid' ? 'Cor' : 'Cor 1', L.c1) + (L.kind !== 'solid' ? eColor('c2', 'Cor 2', L.c2) : '') + (L.kind === 'linear' ? eRange('ang', 'Ângulo', 0, 360, 1, L.ang || 0, DEG) : '') +
          (L.kind === 'radial' ? eRange('cx', 'Centro (lado)', 0, 1, 0.01, L.cx == null ? 0.5 : L.cx, PCT) + eRange('cy', 'Centro (altura)', 0, 1, 0.01, L.cy == null ? 0.5 : L.cy, PCT) : '');
      } else if (L.type === 'paint') {
        h += '<p class="e-note">Pinte com o pincel. Com a ferramenta Mover você arrasta a pintura inteira.</p><div class="e-btns"><button class="e-btn" data-do="clear">Limpar pintura</button><button class="e-btn" data-do="reset">Voltar ao lugar</button></div>';
      }
    } else if (t === 'move' || t === 'hand') h += '<h5>Fundo</h5><p class="e-note">Clique numa camada na tela ou na lista para mexer nela. Alt + arrastar duplica. Ctrl + roda do mouse dá zoom, espaço + arrastar move a tela.</p>';
    var op = ED.el.querySelector('.e-opts'), sc = op.scrollTop, act = document.activeElement, keep = act && op.contains(act) && act.dataset.lp;
    if (keep === 'text' || keep === 'name') { edLayersList(); return; } // não atrapalha quem está digitando
    op.innerHTML = h; op.scrollTop = sc; edLayersList();
  }
  // durante o arraste: só atualiza os números, sem refazer o painel
  function edLiveProps() {
    var L = edSel(); if (!L) return;
    ['rot', 'size', 'h'].forEach(function (k) { var i = ED.el.querySelector('[data-lp="' + k + '"]'); if (i && L[k] != null) { i.value = L[k]; var o = i.nextElementSibling; if (o) o.textContent = k === 'rot' ? DEG(L[k]) : Math.round(L[k]); i.style.setProperty('--p', ((L[k] - i.min) / (i.max - i.min) * 100) + '%'); } });
  }
  var THUMBS = {};
  function edLayersList() {
    var ls = edLayers().slice().reverse(), D = DEVS[ED.dev], tw = 52, th = Math.round(52 * D.h / D.w);
    if (th > 52) { th = 52; tw = Math.round(52 * D.w / D.h); }
    var box = ED.el.querySelector('.e-list');
    box.innerHTML = ls.map(function (L) {
      var kind = { image: 'Imagem', text: 'Texto', paint: 'Pintura', shape: 'Forma', fill: L.kind === 'solid' ? 'Cor' : 'Degradê' }[L.type];
      return '<div class="e-ly' + (L.id === ED.sel ? ' on' : '') + (L.vis ? '' : ' off') + '" data-ly="' + L.id + '" draggable="true"><button class="e-vi" data-vis="' + L.id + '" title="' + (L.vis ? 'Esconder' : 'Mostrar') + '">' + (L.vis ? EIC.eye : EIC.eyeOff) + '</button>' +
        '<canvas class="e-th" width="' + tw + '" height="' + th + '" data-th="' + L.id + '"></canvas><span class="e-ln"><b>' + esc(L.name) + '</b><small>' + kind + (L.op < 1 ? ', ' + Math.round(L.op * 100) + '%' : '') + '</small></span>' +
        '<button class="e-vi" data-lock="' + L.id + '" title="' + (L.lock ? 'Destravar' : 'Travar') + '">' + (L.lock ? EIC.lock : EIC.unlock) + '</button></div>';
    }).join('') || '<p class="e-note">Nenhuma camada.</p>';
    box.querySelectorAll('canvas[data-th]').forEach(function (c) {
      var L = edLayers().find(function (x) { return x.id === c.dataset.th; }); if (!L) return; var x = c.getContext('2d');
      x.save(); x.scale(c.width / D.w, c.height / D.h); var v = L.vis, o = L.op, bl = L.blend; L.vis = true; L.op = 1; L.blend = 'source-over'; renderTo(x, [L], D.w, D.h); L.vis = v; L.op = o; L.blend = bl; x.restore();
    });
  }
  function edButtons() { if (!ED) return; ED.el.querySelector('[data-e="undo"]').disabled = !ED.undo.length; ED.el.querySelector('[data-e="redo"]').disabled = !ED.redo.length; }
  function edProp(k, v, live) {
    var L = edSel();
    if (k.indexOf('b.') === 0) { ED.brush[k.slice(2)] = v; return; }
    if (k.indexOf('x.') === 0) { ED.eraser[k.slice(2)] = v; return; }
    if (k === 'shape') { ED.shape = v; edPaintSide(); return; }
    if (!L) return;
    if (ED.pend == null) ED.pend = snap();
    L[k] = v; edDraw();
    if (!live) { var b = ED.pend; ED.pend = null; commit(b); }
  }
  function edDo(a) {
    var L = edSel(); if (!L) return; var D = DEVS[ED.dev], before = snap();
    if (a === 'flip') L.flip = !L.flip;
    else if (a === 'center') { L.x = D.w / 2; L.y = D.h / 2; }
    else if (a === 'fit' || a === 'cover') { var b = bounds(L); if (b) { var r = Math.abs(b.w) / Math.abs(b.h), s = a === 'cover' ? Math.max(D.w / r, D.h) : Math.min(D.w / r, D.h); if (L.type === 'text') L.size *= s / Math.abs(b.h); else { L.h = s; L.w = s * r; } L.x = D.w / 2; L.y = D.h / 2; L.rot = 0; } }
    else if (a === 'ratio' && L.type === 'image') { var im = ED.img[L.id]; if (im) L.h = L.w * im.height / im.width; }
    else if (a === 'clear' && L.type === 'paint') { var c = ED.cv[L.id], bc = copyCanvas(c); c.getContext('2d').clearRect(0, 0, c.width, c.height); ED.undo.push({ k: 'px', dev: ED.dev, id: L.id, a: bc, b: copyCanvas(c) }); ED.redo = []; ED.dirty = true; edButtons(); }
    else if (a === 'reset' && L.type === 'paint') { L.dx = 0; L.dy = 0; }
    commit(before); edDraw(); edPaintSide();
  }
  function edExport() {
    var D = DEVS[ED.dev], c = edNewCanvas(D.w, D.h); renderTo(c.getContext('2d'), edLayers(), D.w, D.h);
    canvasBlob(c, 'image/png').then(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = (ED.el.querySelector('.e-name').value || 'fundo') + ' - ' + D.n + '.png'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000); toast('Imagem baixada'); });
  }

  function edBuild() {
    ED = { open: false, tool: 'move', z: 1, pan: { x: 0, y: 0 }, brush: { color: '#ffffff', size: 18, op: 1, soft: false }, eraser: { size: 40, op: 1, soft: false }, shape: 'rect', guide: {}, undo: [], redo: [] };
    var el = ED.el = document.createElement('div'); el.id = 'cc-ed';
    el.innerHTML = '<div class="e-top"><button class="e-ib" data-e="exit" title="Sair do editor">' + EIC.back + '</button><input class="e-name" maxlength="40" placeholder="Nome do fundo">' +
      '<div class="e-seg e-devs">' + Object.keys(DEVS).map(function (k) { return '<button data-dev="' + k + '">' + DEVS[k].n + '</button>'; }).join('') + '</div><span class="e-sp"></span>' +
      '<button class="e-ib" data-e="undo" title="Desfazer (Ctrl+Z)">' + EIC.undo + '</button><button class="e-ib" data-e="redo" title="Refazer (Ctrl+Y)">' + EIC.redo + '</button>' +
      '<div class="e-zoom"><button data-e="zout" title="Menos zoom">−</button><button class="e-zv" data-e="zfit" title="Ajustar à tela">100%</button><button data-e="zin" title="Mais zoom">+</button></div>' +
      '<button class="e-btn" data-e="export">Baixar imagem</button><button class="e-btn" data-e="save">Salvar</button><button class="e-btn pri" data-e="use">Usar como fundo</button></div>' +
      '<div class="e-main"><div class="e-tools">' + ETOOLS.map(function (t) { return '<button data-tool="' + t[0] + '" title="' + t[1] + ' (' + t[2] + ')">' + EIC[t[0]] + '<span>' + t[1] + '</span></button>'; }).join('') + '</div>' +
      '<div class="e-stage"><div class="e-board"><canvas></canvas><i class="e-gv"></i><i class="e-gh"></i><div class="e-sel"><i class="e-h" data-h="nw"></i><i class="e-h" data-h="ne"></i><i class="e-h" data-h="sw"></i><i class="e-h" data-h="se"></i><i class="e-h" data-h="n"></i><i class="e-h" data-h="s"></i><i class="e-h" data-h="e"></i><i class="e-h" data-h="w"></i><i class="e-h" data-h="rot"></i></div></div>' +
      '<div class="e-empty"><b>Esta versão ainda está vazia</b><p>Comece copiando o que você fez em outra versão, ajustado ao tamanho desta tela.</p><div class="e-btns"><button class="e-btn pri" data-copy="pc">Copiar do PC</button><button class="e-btn" data-copy="tab">Copiar do tablet</button><button class="e-btn" data-copy="cel">Copiar do celular</button><button class="e-btn" data-copy="">Começar do zero</button></div></div></div>' +
      '<div class="e-side"><div class="e-opts"></div><div class="e-layers"><div class="e-lh"><b>Camadas</b><span><button class="e-ib s" data-la="paint" title="Nova pintura">' + EIC.paint + '</button><button class="e-ib s" data-la="dup" title="Duplicar">' + EIC.dup + '</button><button class="e-ib s" data-la="up" title="Subir">' + EIC.up + '</button><button class="e-ib s" data-la="dn" title="Descer">' + EIC.dn + '</button><button class="e-ib s" data-la="del" title="Apagar">' + EIC.trash + '</button></span></div><div class="e-list"></div></div></div></div>';
    document.body.appendChild(el);
    ED.cvEl = el.querySelector('.e-board canvas'); ED.ctx = ED.cvEl.getContext('2d', { willReadFrequently: false });
    var stage = el.querySelector('.e-stage');
    stage.addEventListener('pointerdown', function (e) { if (e.target.closest('.e-empty')) return; edDown(e); });
    stage.addEventListener('pointermove', edMove);
    stage.addEventListener('pointerup', edUp); stage.addEventListener('pointercancel', edUp);
    stage.addEventListener('wheel', function (e) { e.preventDefault(); var r = stage.getBoundingClientRect(); if (e.ctrlKey || e.metaKey) edZoom(Math.exp(-e.deltaY * 0.0022), e.clientX - r.left, e.clientY - r.top); else { ED.pan.x -= e.shiftKey ? e.deltaY : e.deltaX; ED.pan.y -= e.shiftKey ? 0 : e.deltaY; edBoard(); } }, { passive: false });
    stage.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var a = b.dataset.e;
      if (a === 'exit') edClose(false);
      else if (a === 'undo') edUndo(false); else if (a === 'redo') edUndo(true);
      else if (a === 'zin') edZoom(1.25); else if (a === 'zout') edZoom(0.8); else if (a === 'zfit') edFit();
      else if (a === 'save') edSave().then(function () {}, function () {});
      else if (a === 'use') edSave().then(function (out) { wallUse(out.id); edClose(true); }, function () {});
      else if (a === 'export') edExport();
      else if (b.dataset.dev) edSetDev(b.dataset.dev);
      else if (b.dataset.copy != null) { if (b.dataset.copy && b.dataset.copy !== ED.dev && ED.p.devs[b.dataset.copy].layers.length) edCopyFrom(b.dataset.copy); else { el.querySelector('.e-empty').classList.remove('on'); if (!b.dataset.copy) { var bf = snap(); var P = allThemes()[themeKey()] || PRESETS.fofito; edDev().layers.push({ id: lid(), type: 'fill', name: 'Degradê', vis: true, lock: false, op: 1, blend: 'source-over', kind: 'linear', c1: P.o[0], c2: P.bg[0], ang: 35 }); commit(bf); edDraw(); } else toast('Essa versão também está vazia'); } }
      else if (b.dataset.tool) edSetTool(b.dataset.tool);
      else if (b.dataset.la) edLayerAct(b.dataset.la);
      else if (b.dataset.vis) { var bf2 = snap(), L = edLayers().find(function (x) { return x.id === b.dataset.vis; }); if (L) { L.vis = !L.vis; commit(bf2); edDraw(); } }
      else if (b.dataset.lock) { var bf3 = snap(), L2 = edLayers().find(function (x) { return x.id === b.dataset.lock; }); if (L2) { L2.lock = !L2.lock; commit(bf3); edOverlay(); } }
      else if (b.dataset.add) edAddFill(b.dataset.add);
      else if (b.dataset.do) edDo(b.dataset.do);
      else if (b.dataset.ls) edProp(b.dataset.ls, b.dataset.ls === 'weight' ? +b.dataset.v : b.dataset.v), edPaintSide();
      else if (b.dataset.lt) { var k = b.dataset.lt; if (k.indexOf('.') > 0) { var o = k[0] === 'b' ? ED.brush : ED.eraser; o[k.slice(2)] = !o[k.slice(2)]; } else { var L3 = edSel(); if (L3) edProp(k, !L3[k]); } edPaintSide(); }
      else if (b.dataset.sw) { edProp(b.dataset.sw, b.dataset.c); edPaintSide(); }
    });
    el.addEventListener('click', function (e) { var r = e.target.closest('[data-ly]'); if (!r || e.target.closest('button')) return; ED.sel = r.dataset.ly; if (ED.tool !== 'move' && ED.tool !== 'brush' && ED.tool !== 'eraser') edSetTool('move'); else edPaintSide(); edOverlay(); });
    el.addEventListener('dblclick', function (e) { var r = e.target.closest('[data-ly]'); if (r) { ED.sel = r.dataset.ly; edPaintSide(); var n = el.querySelector('[data-lp="name"]'); if (n) { n.focus(); n.select(); } } });
    // arrastar camadas na lista para mudar a ordem
    el.addEventListener('dragstart', function (e) { var r = e.target.closest('[data-ly]'); if (!r) return; ED.dragLy = r.dataset.ly; e.dataTransfer.effectAllowed = 'move'; });
    el.addEventListener('dragover', function (e) { if (ED.dragLy && e.target.closest('[data-ly]')) e.preventDefault(); });
    el.addEventListener('drop', function (e) {
      var r = e.target.closest('[data-ly]');
      if (ED.dragLy && r) { e.preventDefault(); var ls = edLayers(), from = ls.findIndex(function (x) { return x.id === ED.dragLy; }), to = ls.findIndex(function (x) { return x.id === r.dataset.ly; }); if (from >= 0 && to >= 0 && from !== to) { var bf = snap(), L = ls.splice(from, 1)[0]; ls.splice(to, 0, L); commit(bf); edDraw(); } }
      ED.dragLy = null;
    });
    el.addEventListener('input', function (e) {
      var t = e.target, k = t.dataset.lp; if (!k) return;
      if (t.type === 'range') { var v = +t.value; t.style.setProperty('--p', ((v - t.min) / (t.max - t.min) * 100) + '%'); var o = t.nextElementSibling; if (o) o.textContent = /op$|^op|cx|cy/.test(k) ? PCT(v) : /rot|ang/.test(k) ? DEG(v) : Math.round(v); edProp(k, v, true); }
      else if (t.type === 'color') edProp(k, t.value, true);
      else if (k === 'text' || k === 'name') { edProp(k, t.value, true); if (k === 'name') { var r = el.querySelector('.e-ly.on b'); if (r) r.textContent = t.value; } }
      else if (t.tagName === 'SELECT') { if (k === 'font' && t.value === 'Fonte do PC') loadCustomFont(); edProp(k, t.value); edLayersList(); }
    });
    el.addEventListener('change', function (e) { var k = e.target.dataset.lp; if (k && ED.pend != null) { var b = ED.pend; ED.pend = null; commit(b); } });
    window.addEventListener('resize', function () { if (ED.open) edFit(); });
    edSetTool('move');
  }

  // as teclas, colar e soltar arquivos são pegos antes do Discord (registrados logo no começo)
  function edListen() {
    // colar imagem e soltar arquivos direto no editor (não vai para o chat do Discord)
    window.addEventListener('paste', function (e) {
      if (!ED || !ED.open) return; e.stopPropagation();
      var items = (e.clipboardData && e.clipboardData.items) || []; for (var i = 0; i < items.length; i++) if (items[i].type.indexOf('image/') === 0) { e.preventDefault(); edAddImage(items[i].getAsFile()); }
    }, true);
    ['dragenter', 'dragover', 'drop'].forEach(function (ev) { window.addEventListener(ev, function (e) {
      if (!ED || !ED.open || ED.dragLy) return; e.stopPropagation(); e.preventDefault();
      if (ev === 'drop' && e.dataTransfer) [].forEach.call(e.dataTransfer.files || [], function (f) { edAddImage(f); });
    }, true); });
    window.addEventListener('keydown', function (e) {
      if (!ED || !ED.open) return;
      e.stopPropagation(); // o Discord não pode pegar as teclas enquanto o editor está aberto
      var typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) && e.target.type !== 'range' && e.target.type !== 'color';
      var ctrl = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
      if (ctrl && k === 'z' && !typing) { e.preventDefault(); edUndo(e.shiftKey); return; }
      if (ctrl && k === 'y' && !typing) { e.preventDefault(); edUndo(true); return; }
      if (ctrl && k === 's') { e.preventDefault(); edSave().then(function () {}, function () {}); return; }
      if (ctrl && k === 'd' && !typing) { e.preventDefault(); edLayerAct('dup'); return; }
      if (ctrl && (k === '=' || k === '+')) { e.preventDefault(); edZoom(1.25); return; }
      if (ctrl && k === '-') { e.preventDefault(); edZoom(0.8); return; }
      if (ctrl && k === '0') { e.preventDefault(); edFit(); return; }
      if (typing || ctrl) return;
      if (e.key === ' ') { e.preventDefault(); if (!ED.space) { ED.space = true; ED.el.querySelector('.e-stage').classList.add('pan'); } return; }
      if (e.key === 'Escape') { if (ED.sel) { ED.sel = ''; edPaintSide(); edOverlay(); } else edClose(false); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && ED.sel) { e.preventDefault(); edLayerAct('del'); return; }
      if (e.key === '[') { ED.brush.size = Math.max(1, Math.round(ED.brush.size * 0.85)); ED.eraser.size = Math.max(1, Math.round(ED.eraser.size * 0.85)); edPaintSide(); return; }
      if (e.key === ']') { ED.brush.size = Math.min(300, Math.round(ED.brush.size * 1.18) + 1); ED.eraser.size = Math.min(300, Math.round(ED.eraser.size * 1.18) + 1); edPaintSide(); return; }
      var L = edSel();
      if (L && /^Arrow/.test(e.key) && L.x != null) { e.preventDefault(); var st = e.shiftKey ? 10 : 1, bf = snap(); if (e.key === 'ArrowLeft') L.x -= st; if (e.key === 'ArrowRight') L.x += st; if (e.key === 'ArrowUp') L.y -= st; if (e.key === 'ArrowDown') L.y += st; commit(bf); edDraw(); return; }
      var t = ETOOLS.find(function (x) { return x[2].toLowerCase() === k; }); if (t) { e.preventDefault(); edSetTool(t[0]); }
    }, true);
    window.addEventListener('keyup', function (e) { if (!ED || !ED.open) return; e.stopPropagation(); if (e.key === ' ') { ED.space = false; ED.el.querySelector('.e-stage').classList.remove('pan'); } }, true);
    window.addEventListener('keypress', function (e) { if (ED && ED.open) e.stopPropagation(); }, true);
  }

  /* ---------- perfis do Concord ----------
     Ficam no servidor dos ReApps e só aparecem para quem usa Concord. A pele fala com o servidor pelo Concord (ccNet),
     nunca direto da página do Discord. Login: "Entrar com o Discord" no navegador (ccEntrar). */
  var PF = { conta: null, draft: null, cache: {}, fila: {}, media: {}, salvando: false, entrando: false, erro: '', carregando: false, sujo: false };
  var NET_N = 0, NET_CB = {};
  window.__ccNet = function (id, status, text) { var cb = NET_CB[id]; delete NET_CB[id]; if (cb) cb(status, text); };
  function net(method, path, body) {
    return new Promise(function (ok, no) {
      if (!window.ccNet) { no({ status: 0, erro: 'Atualize o Concord para usar o perfil.' }); return; }
      var id = ++NET_N;
      NET_CB[id] = function (s, t) {
        var j = t; if (t && (t[0] === '{' || t[0] === '[')) { try { j = JSON.parse(t); } catch (e) {} }
        if (s >= 200 && s < 300) ok(j); else no({ status: s, erro: (j && j.erro) || (s ? 'O servidor respondeu ' + s + '.' : 'Sem conexão com o servidor dos ReApps.') });
      };
      Promise.resolve(window.ccNet(id, method, path, body || '')).catch(function () { delete NET_CB[id]; no({ status: 0, erro: 'Não consegui falar com o Concord.' }); });
    });
  }
  var MEDIA_OK = {};
  function mediaJa(u) { if (!u) return ''; if (/^data:image\//.test(u)) return u; return MEDIA_OK[String(u).slice(-32)] || ''; }
  function mediaURL(u) {
    if (!u) return Promise.resolve('');
    if (/^data:image\//.test(u)) return Promise.resolve(u);
    var h = String(u).slice(-32);
    if (!/^[0-9a-f]{32}$/.test(h)) return Promise.resolve('');
    if (!PF.media[h]) PF.media[h] = net('GET', '/concord/m/' + h).then(function (d) { if (d) MEDIA_OK[h] = d; return d; }).catch(function () { delete PF.media[h]; return ''; });
    return PF.media[h];
  }

  var INS = {
    noite: ['Noturno', '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'],
    gamer: ['Gamer', '<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7.5 10.5v4M5.5 12.5h4M15.5 11.5h.01M18 13.5h.01"/>'],
    musica: ['Música', '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'],
    arte: ['Arte', '<path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L11 16l-4 1 1-4z"/><path d="M7 17c-2 0-3 1.5-3 3.5h4c1.5 0 2.5-1 2.5-2.5"/>'],
    fofo: ['Fofo', '<path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.4 3.9 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.1 0 5.3 2.9 4.2 6.2C19.5 15.4 12 20 12 20z"/>'],
    raio: ['Raio', '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'],
    planta: ['Planta', '<path d="M5 21c0-9 5-15 15-16-1 10-7 15-15 16z"/><path d="M5 21l8-8"/>'],
    estrela: ['Estrela', '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'],
    fundador: ['Fundador', '<path d="M2.5 20h19L14.5 7l-3.2 5.5-2.1-3z"/><path d="M14.5 7l1.6-3 1.6 3"/>'],
    pioneiro: ['Pioneiro', '<path d="M5 21V4"/><path d="M5 4h12l-3 4 3 4H5"/>']
  };
  var INS_LIVRES = ['noite', 'gamer', 'musica', 'arte', 'fofo', 'raio', 'planta', 'estrela'];
  var ESTILOS = [['normal', 'Normal'], ['degrade', 'Degradê'], ['brilho', 'Brilho'], ['neon', 'Neon'], ['arcoiris', 'Arco-íris'], ['toon', 'Desenho'], ['pop', 'Pop'], ['brilhante', 'Brilhante'], ['prisma', 'Prisma'], ['glitch', 'Glitch'], ['contorno', 'Contorno']];
  var PADROES = [['pontos', 'Pontos'], ['listras', 'Listras'], ['xadrez', 'Xadrez'], ['ondas', 'Ondas'], ['estrelas', 'Estrelas'], ['doodles', 'Desenhos']];
  function perfilVazio() { return { avatar: null, banner: null, placa: 'doce', efeito: 'coracoes', decoracao: 'gato', placa: 'aurora', efeito: 'bolhas', decoracao: 'orbita', fundo: { tipo: 'degrade', cores: ['#ff5c7a', '#7b5cff'], angulo: 135, padrao: 'pontos' }, nome: { estilo: 'normal', cores: ['#ffffff', '#ff5c7a'], fonte: '', animado: false }, insignias: [], bio: '', destaque: '#ff5c7a', moldura: 'nenhuma', luz: { tipo: 'segue', cor: '#ffffff', forca: 0.5 }, interacao: { inclinar: true, particulas: 'estrelas' }, placa: 'nenhuma', efeito: 'nenhum', decoracao: 'nenhuma', apelido: '', ganhas: [] }; }
  function padraoSVG(k, cor) {
    var s = cor.replace('#', '%23'), o = "stroke='" + s + "' stroke-opacity='.32' fill='none' stroke-width='2' stroke-linecap='round'", d = '';
    if (k === 'pontos') d = "<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18'><circle cx='4' cy='4' r='1.8' fill='" + s + "' fill-opacity='.4'/><circle cx='13' cy='13' r='1.8' fill='" + s + "' fill-opacity='.4'/></svg>";
    else if (k === 'listras') d = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M-4 20L20 -4M4 28L28 4M-12 12L12 -12' " + o + "/></svg>";
    else if (k === 'xadrez') d = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><rect width='12' height='12' fill='" + s + "' fill-opacity='.16'/><rect x='12' y='12' width='12' height='12' fill='" + s + "' fill-opacity='.16'/></svg>";
    else if (k === 'ondas') d = "<svg xmlns='http://www.w3.org/2000/svg' width='40' height='20'><path d='M0 10c5-7 15-7 20 0s15 7 20 0' " + o + "/></svg>";
    else if (k === 'estrelas') d = "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><path d='M14 8l1.6 3.4 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z' fill='" + s + "' fill-opacity='.45'/><circle cx='44' cy='40' r='1.6' fill='" + s + "' fill-opacity='.5'/><circle cx='36' cy='14' r='1' fill='" + s + "' fill-opacity='.5'/><path d='M48 50v6M45 53h6' " + o + "/></svg>";
    else d = "<svg xmlns='http://www.w3.org/2000/svg' width='210' height='210' viewBox='0 0 420 420'><g " + o.replace("stroke-width='2'", "stroke-width='3'") + ">" + DOODLES.slice(0, 12).map(function (p) { return "<path d='" + p + "'/>"; }).join('') + "</g></svg>";
    return 'url("data:image/svg+xml,' + d.replace(/</g, '%3C').replace(/>/g, '%3E') + '")';
  }
  function fundoCSS(f) {
    f = f || {}; var c = (f.cores || []).filter(Boolean); if (!c.length) c = ['#ff5c7a', '#7b5cff']; if (c.length < 2) c = [c[0], c[0]];
    var g = 'linear-gradient(' + (+f.angulo || 0) + 'deg, ' + c.join(', ') + ')';
    if (f.tipo === 'cor') return c[0];
    if (f.tipo === 'padrao') return padraoSVG(f.padrao, '#ffffff') + ', ' + g;
    return g;
  }
  function nomeStyle(el, n) {
    n = n || {}; var c = (n.cores || []).filter(Boolean); if (!c.length) c = ['#ffffff'];
    el.dataset.ccn = n.estilo || 'normal';
    if (n.animado) el.dataset.cca = '1'; else delete el.dataset.cca;
    el.style.setProperty('--n1', c[0]); el.style.setProperty('--n2', c[1] || c[0]); el.style.setProperty('--n3', c[2] || c[1] || c[0]);
    if (n.fonte && CC.fonts && CC.fonts[n.fonte]) { loadFam(n.fonte); el.style.fontFamily = "'" + n.fonte + "', var(--cc-font), sans-serif"; } else el.style.removeProperty('font-family');
  }
  function loadFam(fam) {
    if (FONTS_LOADED[fam] || !CC.fonts || !CC.fonts[fam]) return; FONTS_LOADED[fam] = 1;
    Object.keys(CC.fonts[fam]).forEach(function (wt) {
      try { var bin = atob(CC.fonts[fam][wt]), buf = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i); var f = new FontFace(fam, buf, { weight: wt, style: 'normal', display: 'swap' }); document.fonts.add(f); f.load().catch(function () {}); } catch (e) {}
    });
  }
  function insHTML(k) { var i = INS[k]; return i ? '<span class="pc-i" title="' + i[0] + '">' + sv(i[1]) + '<em>' + i[0] + '</em></span>' : ''; }
  var MOLDURAS = [['nenhuma', 'Nenhuma'], ['neon', 'Neon'], ['aurora', 'Aurora'], ['pixel', 'Pixel'], ['flores', 'Flores'], ['estrelas', 'Estrelas'], ['chamas', 'Chamas'], ['gelo', 'Gelo'], ['coracoes', 'Corações']];
  var LUZES = [['nenhuma', 'Sem luz'], ['segue', 'Segue o mouse'], ['aurora', 'Aurora'], ['holofote', 'Holofote'], ['pulso', 'Pulso']];
  var PARTS = [['nenhuma', 'Nada'], ['estrelas', 'Estrelas'], ['coracoes', 'Corações'], ['faiscas', 'Faíscas'], ['bolhas', 'Bolhas'], ['petalas', 'Pétalas']];
  // perfis salvos antes de existirem moldura, luz e interação ganham o padrão
  function completar(p) {
    var v = perfilVazio(); p = p || {};
    Object.keys(v).forEach(function (k) { if (p[k] == null) p[k] = v[k]; });
    if (!p.luz.tipo) p.luz = v.luz; if (!p.interacao || p.interacao.particulas == null) p.interacao = v.interacao;
    return p;
  }
  function flor(x, y, r, c, c2) {
    var h = '';
    for (var i = 0; i < 5; i++) { var a = i * 72; h += '<ellipse cx="' + x + '" cy="' + (y - r * 0.62) + '" rx="' + (r * 0.42) + '" ry="' + (r * 0.62) + '" fill="' + c + '" transform="rotate(' + a + ' ' + x + ' ' + y + ')"/>'; }
    return h + '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.32) + '" fill="' + c2 + '"/>';
  }
  function estrela(x, y, r, c) { var pts = []; for (var i = 0; i < 10; i++) { var a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * 0.42 : r; pts.push((x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1)); } return '<polygon points="' + pts.join(' ') + '" fill="' + c + '"/>'; }
  function coracao(x, y, s, c) { return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M0 6C-5-1-12 2-10 8c1.5 4 10 9 10 9s8.5-5 10-9C12 2 5-1 0 6z" fill="' + c + '"/>'; }
  var SVGO = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">';
  // enfeites dos cantos de cada moldura (desenhos nossos)
  function moldHTML(k) {
    var d = 'var(--d)', w = '#ffffff';
    var c = function (pos, svg) { return '<b class="mc ' + pos + '">' + SVGO + svg + '</svg></b>'; };
    if (k === 'flores') return c('tl', flor(30, 34, 22, d, '#ffe08a') + flor(62, 18, 13, w, d) + flor(14, 66, 11, w, d)) + c('br', flor(70, 66, 22, d, '#ffe08a') + flor(38, 82, 12, w, d) + flor(86, 34, 10, w, d));
    if (k === 'estrelas') return c('tl', estrela(28, 30, 16, w) + estrela(60, 14, 7, d)) + c('tr', estrela(72, 26, 10, d) + estrela(44, 12, 5, w)) + c('bl', estrela(26, 74, 9, d)) + c('br', estrela(70, 70, 15, w) + estrela(40, 86, 6, d));
    if (k === 'coracoes') return c('tl', coracao(28, 18, 1.6, d) + coracao(62, 10, 0.9, w)) + c('tr', coracao(66, 16, 1.1, w)) + c('bl', coracao(24, 60, 1, w)) + c('br', coracao(64, 56, 1.7, d) + coracao(34, 76, 0.8, w));
    if (k === 'gelo') return c('tl', '<path d="M8 8l22 70 6-48 18 30 4-40 16 18L90 8z" fill="#bfefff" fill-opacity=".85"/><path d="M8 8l22 70M36 30l18 30" stroke="#fff" stroke-width="2" fill="none"/>') + c('tr', '<path d="M92 8L70 70l-6-44-16 24-4-34L8 8z" fill="#bfefff" fill-opacity=".85"/>');
    if (k === 'chamas') return '<b class="mf"></b>';
    if (k === 'pixel') return c('tl', '<path d="M0 0h40v12H12v28H0z" fill="' + w + '"/><path d="M12 12h16v8h-8v8h-8z" fill="' + d + '"/>') + c('tr', '<path d="M100 0H60v12h28v28h12z" fill="' + w + '"/><path d="M88 12H72v8h8v8h8z" fill="' + d + '"/>') +
      c('bl', '<path d="M0 100h40V88H12V60H0z" fill="' + w + '"/>') + c('br', '<path d="M100 100H60V88h28V60h12z" fill="' + w + '"/>');
    return '';
  }
  // o cartão do perfil: o mesmo na prévia do editor e no lugar do cartão do Discord
  function cardEl(p, nome, avatar, acoes) {
    p = completar(p ? JSON.parse(JSON.stringify(p)) : perfilVazio());
    var wr = document.createElement('div'); wr.className = 'cc-pcw';
    wr.dataset.mold = p.moldura; wr.dataset.luz = p.luz.tipo; if (p.interacao.inclinar) wr.dataset.tilt = '1';
    var ins = (p.insignias || []).filter(function (k) { return INS[k]; });
    wr.innerHTML = '<div class="cc-pc"><div class="pc-bn"></div><i class="pc-ef" data-ef="' + p.efeito + '"></i><button class="pc-zoom" title="Ver grande">' + sv('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>') + '</button><div class="pc-av"><img alt=""><b class="pc-dec" data-dec="' + p.decoracao + '">' + decorAvatar(p.decoracao) + '</b></div><div class="pc-ct"><div class="pc-nm"></div><div class="pc-tag">' + MARK + '<span>Concord</span></div>' +
      (ins.length ? '<div class="pc-ins">' + ins.map(insHTML).join('') + '</div>' : '') + (p.bio ? '<p class="pc-bio"></p>' : '') +
      (acoes ? '<div class="pc-acts">' + acoes.map(function (a) { return '<button data-pca="' + a[0] + '"' + (a[2] ? ' class="pri"' : '') + '>' + a[1] + '</button>'; }).join('') + '</div>' : '') +
      '</div><i class="pc-luz"></i></div><div class="pc-mold"><i class="mr"></i>' + moldHTML(p.moldura) + '</div>';
    wr.style.setProperty('--pf', fundoCSS(p.fundo)); wr.style.setProperty('--d', p.destaque || '#ff5c7a');
    wr.style.setProperty('--lc', p.luz.cor); wr.style.setProperty('--lf', p.luz.forca);
    var nm = wr.querySelector('.pc-nm'); nm.textContent = p.apelido || nome || p.nomeDiscord || 'Você'; nomeStyle(nm, p.nome);
    if (p.bio) wr.querySelector('.pc-bio').textContent = p.bio;
    var img = wr.querySelector('.pc-av img'); if (avatar) img.src = avatar;
    var bnEl = wr.querySelector('.pc-bn'), setBn = function (d) { if (d) { bnEl.style.backgroundImage = 'url("' + d + '")'; wr.classList.add('has-bn'); } };
    if (p.avatar) { if (mediaJa(p.avatar)) img.src = mediaJa(p.avatar); else mediaURL(p.avatar).then(function (d) { if (d) img.src = d; }); }
    if (p.banner) { if (mediaJa(p.banner)) setBn(mediaJa(p.banner)); else mediaURL(p.banner).then(setBn); }
    wr.querySelector('.pc-zoom').addEventListener('click', function (e) { e.stopPropagation(); if (wr.classList.contains('grande')) { fecharGrande(); return; } ampliar(p, nm.textContent, img.src); });
    vivo(wr, p);
    return wr;
  }
  // inclinar, luz que segue o dedo/mouse e partículas
  function calmo() { return CFG.lite || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function vivo(wr, p) {
    var card = wr.querySelector('.cc-pc'), raf = 0, last = null;
    function mover(e) {
      last = e; if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0; var r = wr.getBoundingClientRect(); if (!r.width) return;
        var x = (last.clientX - r.left) / r.width, y = (last.clientY - r.top) / r.height;
        wr.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); wr.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (wr.dataset.tilt && !calmo()) wr.style.setProperty('--tilt', 'rotateX(' + ((0.5 - y) * 10).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 12).toFixed(2) + 'deg)');
      });
    }
    wr.addEventListener('pointermove', mover);
    wr.addEventListener('pointerleave', function () { wr.style.removeProperty('--tilt'); wr.style.setProperty('--mx', '50%'); wr.style.setProperty('--my', '30%'); });
    // com zoom (tela grande) o que está dentro do cartão anda em outra escala: converte a posição do dedo/mouse
    wr.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; mover(e); var r = wr.getBoundingClientRect(), z = r.width / (wr.offsetWidth || r.width) || 1; explodir(wr, (e.clientX - r.left) / z, (e.clientY - r.top) / z, p.interacao.particulas, 12); });
    if (!PF.quieto) setTimeout(function () { if (wr.isConnected) explodir(wr, 62, 100, p.interacao.particulas, 8); }, 380);
  }
  function partSVG(k, c) {
    if (k === 'estrelas') return SVGO + estrela(50, 50, 46, c) + '</svg>';
    if (k === 'coracoes') return SVGO + coracao(50, 34, 4, c) + '</svg>';
    if (k === 'bolhas') return SVGO + '<circle cx="50" cy="50" r="40" fill="none" stroke="' + c + '" stroke-width="8"/><circle cx="36" cy="36" r="8" fill="#fff" fill-opacity=".8"/></svg>';
    if (k === 'petalas') return SVGO + '<ellipse cx="50" cy="50" rx="24" ry="44" fill="' + c + '"/></svg>';
    return SVGO + '<circle cx="50" cy="50" r="22" fill="#fff"/><circle cx="50" cy="50" r="46" fill="' + c + '" fill-opacity=".45"/></svg>';
  }
  function explodir(wr, x, y, k, n) {
    if (!k || k === 'nenhuma' || calmo() || !wr.animate) return;
    var d = getComputedStyle(wr).getPropertyValue('--d').trim() || '#ff5c7a', cores = [d, '#ffffff', d];
    for (var i = 0; i < n; i++) {
      var el = document.createElement('i'); el.className = 'pc-p'; var s = 8 + Math.random() * 12;
      el.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + s + 'px;height:' + s + 'px';
      el.innerHTML = partSVG(k, cores[i % 3]); wr.appendChild(el);
      var a = Math.random() * Math.PI * 2, dist = 40 + Math.random() * 70, dx = Math.cos(a) * dist, dy = Math.sin(a) * dist;
      if (k === 'bolhas') { dx = (Math.random() - 0.5) * 60; dy = -60 - Math.random() * 80; }
      if (k === 'petalas') { dx = (Math.random() - 0.5) * 120; dy = 40 + Math.random() * 90; }
      var rot = (Math.random() - 0.5) * 540;
      el.animate([{ transform: 'translate(-50%,-50%) scale(.3) rotate(0deg)', opacity: 0 }, { offset: 0.15, opacity: 1 },
        { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(1) rotate(' + rot + 'deg)', opacity: 0 }],
        { duration: 900 + Math.random() * 700, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = (function (e2) { return function () { e2.remove(); }; })(el);
    }
  }

  // ---- perfis dos outros: pede em lote ao servidor e guarda por 10 minutos ----
  var FILA_T = null;
  function perfilDe(id) {
    var c = PF.cache[id];
    if (c && Date.now() - c.t < 1.2e5) return c.p;
    if (!PF.fila[id] && window.ccNet) { PF.fila[id] = 1; clearTimeout(FILA_T); FILA_T = setTimeout(pedirPerfis, 250); }
    return c ? c.p : undefined;
  }
  function pedirPerfis() {
    var ids = Object.keys(PF.fila).slice(0, 100); ids.forEach(function (id) { delete PF.fila[id]; });
    if (!ids.length) return;
    net('GET', '/concord/perfis?ids=' + ids.join(',')).then(function (r) {
      var got = (r && r.perfis) || {}, t = Date.now();
      ids.forEach(function (id) { PF.cache[id] = { t: t, p: got[id] || null }; });
      pintarNomes(true); pintarPlacas(); pintarTiles(); popTick(true);
    }).catch(function () { var t = Date.now() - 5e5; ids.forEach(function (id) { if (!PF.cache[id]) PF.cache[id] = { t: t, p: null }; }); });
  }

  // ---- nome com estilo no chat (só de quem tem perfil do Concord) ----
  function pintarNomes(tudo) {
    if (!window.ccNet) return;
    var lis = document.querySelectorAll(tudo ? 'li[data-cc-a]' : 'li[data-cc-a]:not([data-cc-n])');
    for (var i = 0; i < lis.length; i++) {
      var li = lis[i], a = li.dataset.ccA; li.dataset.ccN = '1';
      if (!a || a === '?') continue;
      var p = perfilDe(a); if (!p) continue;
      var u = li.querySelector('.username_c19a55'); if (!u) continue;
      nomeStyle(u, p.nome); u.classList.add('cc-nm');
      if (p.apelido) u.dataset.ccAp = p.apelido; else delete u.dataset.ccAp;
      if (!u.nextElementSibling || !u.nextElementSibling.classList.contains('cc-ins')) {
        var ins = (p.insignias || []).filter(function (k) { return INS[k]; }).slice(0, 3);
        if (ins.length) { var s = document.createElement('span'); s.className = 'cc-ins'; s.innerHTML = ins.map(function (k) { return '<i title="' + INS[k][0] + '">' + sv(INS[k][1]) + '</i>'; }).join(''); u.after(s); }
      }
    }
  }

  // ---- mais coisas do perfil: fontes do nome, placa do nome, efeito e enfeite do avatar ----
  var NOME_FONTES = ['Pacifico', 'Lobster', 'Bungee', 'Press Start 2P', 'Monoton', 'Righteous', 'Permanent Marker', 'Caveat Brush', 'Orbitron', 'Creepster', 'Fredoka', 'Chewy', 'Bebas Neue', 'Rubik Glitch', 'Silkscreen', 'Cinzel Decorative', 'Audiowide', 'Satisfy'];
  var PLACAS = [['nenhuma', 'Nenhuma'], ['cor', 'Cor do cartão'], ['aurora', 'Aurora'], ['estrelas', 'Estrelas'], ['chamas', 'Chamas'], ['ondas', 'Ondas'], ['neon', 'Neon'], ['doce', 'Doce'], ['pixel', 'Pixel'], ['cristal', 'Cristal']];
  var EFEITOS = [['nenhum', 'Nenhum'], ['neve', 'Neve'], ['brilhos', 'Brilhos'], ['coracoes', 'Corações'], ['confete', 'Confete'], ['vagalumes', 'Vaga-lumes'], ['chuva', 'Chuva'], ['bolhas', 'Bolhas']];
  var DECORS = [['nenhuma', 'Nenhum'], ['halo', 'Auréola'], ['orbita', 'Órbita'], ['gato', 'Gatinho'], ['coroa', 'Coroa'], ['flores', 'Flores'], ['chifres', 'Chifrinhos'], ['fones', 'Fones']];
  function decorAvatar(k) {
    var d = 'var(--d)', w = '#ffffff', s = '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">';
    if (k === 'halo') return s + '<ellipse cx="60" cy="10" rx="30" ry="8" fill="none" stroke="#ffe08a" stroke-width="5"/><ellipse cx="60" cy="10" rx="30" ry="8" fill="none" stroke="#fff" stroke-width="1.5" opacity=".8"/></svg>';
    if (k === 'orbita') return s + '<g class="orb"><circle cx="60" cy="60" r="57" fill="none" stroke="' + d + '" stroke-width="1.5" stroke-dasharray="3 6"/>' + estrela(60, 3, 7, w) + estrela(117, 60, 5, d) + '<circle cx="12" cy="94" r="4" fill="' + w + '"/></g></svg>';
    if (k === 'gato') return s + '<path d="M18 34L22 2l26 20z" fill="' + d + '"/><path d="M102 34L98 2 72 22z" fill="' + d + '"/><path d="M24 26l2-16 13 10z M96 26l-2-16-13 10z" fill="#ffc2da"/></svg>';
    if (k === 'coroa') return s + '<path d="M34 22l8-18 10 12 8-14 8 14 10-12 8 18z" fill="#ffd36e" stroke="#c98a1a" stroke-width="2"/><circle cx="60" cy="14" r="3" fill="' + d + '"/></svg>';
    if (k === 'flores') return s + flor(18, 96, 14, d, '#ffe08a') + flor(36, 110, 9, w, d) + flor(104, 22, 11, w, d) + '</svg>';
    if (k === 'chifres') return s + '<path d="M30 30C20 16 22 4 30 0c-2 10 6 18 12 22z" fill="#ff4d6d"/><path d="M90 30c10-14 8-26 0-30 2 10-6 18-12 22z" fill="#ff4d6d"/></svg>';
    if (k === 'fones') return s + '<path d="M14 66V58a46 46 0 0 1 92 0v8" fill="none" stroke="' + d + '" stroke-width="7" stroke-linecap="round"/><rect x="4" y="60" width="20" height="30" rx="8" fill="' + d + '"/><rect x="96" y="60" width="20" height="30" rx="8" fill="' + d + '"/></svg>';
    return '';
  }
  // placa do nome na lista de membros e de conversas (só de quem tem perfil do Concord)
  function pintarPlacas() {
    var els = document.querySelectorAll('.member__5d473, .channel__972a0.dm__972a0');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], img = el.querySelector('img[src*="/avatars/"]'), m = img && /\/avatars\/(\d{5,25})\//.exec(img.src), id = m ? m[1] : '';
      var p = id ? perfilDe(id) : null, k = p && p.placa && p.placa !== 'nenhuma' ? p.placa : '';
      if ((el.dataset.ccplaca || '') !== k) { if (k) el.dataset.ccplaca = k; else delete el.dataset.ccplaca; }
      if (k) el.style.setProperty('--d', p.destaque || '#ff5c7a'); else el.style.removeProperty('--d');
    }
  }
  // ver o cartão grande (edição e perfil dos outros)
  function ampliar(p, nome, avatar) {
    fecharGrande();
    var ov = document.createElement('div'); ov.id = 'cc-grande';
    ov.innerHTML = '<button class="gx" title="Fechar">' + IC.x + '</button><div class="gw"></div><div class="gn">Toque fora do cartão para fechar</div>';
    var card = cardEl(p, nome, avatar); card.classList.add('grande');
    ov.querySelector('.gw').appendChild(card); document.body.appendChild(ov);
    var fit = function () { var h = card.offsetHeight || 420, z = Math.max(1, Math.min(1.7, (innerHeight - 110) / h, (innerWidth - 40) / 300)); card.style.zoom = z.toFixed(3); };
    fit(); setTimeout(fit, 250);
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.gx') || e.target.classList.contains('gw')) fecharGrande(); });
    requestAnimationFrame(function () { ov.classList.add('on'); });
  }
  function fecharGrande() { var o = document.getElementById('cc-grande'); if (o) { o.classList.remove('on'); setTimeout(function () { o.remove(); }, 250); } }
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.getElementById('cc-grande')) { e.stopPropagation(); fecharGrande(); } }, true);
  // decide rápido o que mostrar quando um cartão do Discord abre (sem o do Discord piscar antes)
  var POP_RAF = 0;
  new MutationObserver(function () {
    if (POP_RAF || !window.ccNet) return;
    POP_RAF = requestAnimationFrame(function () { POP_RAF = 0; if (document.querySelector('.user-profile-popout:not([data-ccd]), .user-profile-modal:not([data-ccd]), .user-profile-modal-v2:not([data-ccd])')) popTick(true); });
  }).observe(document, { childList: true, subtree: true });

  // ---- o cartão Concord no lugar do cartão do Discord (o do Discord fica num botão) ----
  var POP = { host: null, id: '', card: null, v: '' };
  function fiberUser(el) {
    var k = null; for (var x in el) { if (x.indexOf('__reactFiber$') === 0) { k = x; break; } }
    for (var f = k && el[k], i = 0; f && i < 60; f = f.return, i++) {
      var p = f.memoizedProps; if (!p || typeof p !== 'object') continue;
      var u = p.user; if (u && typeof u === 'object' && /^\d{5,25}$/.test(u.id || '') && 'username' in u) return u.id;
      if (typeof p.userId === 'string' && /^\d{5,25}$/.test(p.userId)) return p.userId;
    }
    return '';
  }
  function popUserId(host) {
    var img = host.querySelector('img[src*="/avatars/"]'), m = img && /\/avatars\/(\d{5,25})\//.exec(img.src);
    if (m) return m[1];
    var c = host.querySelectorAll('img, [class*="avatar"]');
    for (var i = 0; i < c.length && i < 6; i++) { var id = fiberUser(c[i]); if (id) return id; }
    return fiberUser(host.firstElementChild || host);
  }
  function popTick(refresh) {
    var host = document.querySelector('.user-profile-modal-v2, .user-profile-modal, .user-profile-popout');
    if (POP.card && POP.host && (!POP.host.isConnected || POP.host !== host)) { POP.card.remove(); POP.card = null; POP.host = null; }
    if (!host || !window.ccNet) { POP.host = null; POP.card = null; POP.id = ''; return; }
    var id = host === POP.host ? POP.id : popUserId(host);
    if (!host.dataset.ccw) host.dataset.ccw = String(Date.now());
    var esperou = Date.now() - (+host.dataset.ccw);
    if (!id) { if (esperou > 900) host.dataset.ccd = '1'; else setTimeout(function () { popTick(true); }, 300); return; }
    var p = perfilDe(id), v = p ? String(p.v) : '';
    if (p === undefined) { if (esperou > 1200) host.dataset.ccd = '1'; else setTimeout(function () { popTick(true); }, 300); return; }
    if (!p) { host.dataset.ccd = '1'; }
    if (host === POP.host && !refresh && (POP.card ? POP.card.isConnected : !p)) return;
    if (host === POP.host && POP.card && POP.card.isConnected && POP.v === v) return;
    if (POP.card) POP.card.remove();
    POP.host = host; POP.id = id; POP.v = v; POP.card = null;
    if (!p) { host.classList.remove('cc-oculto'); return; }
    var U = st('User'), u = U && U.getUser(id), me = U && U.getCurrentUser && U.getCurrentUser(), eu = me && me.id === id;
    var modal = host.classList.contains('user-profile-modal') || host.classList.contains('user-profile-modal-v2');
    var acoes = eu ? [['editar', 'Editar perfil', true], ['discord', 'Perfil do Discord']] : [['msg', 'Mensagem', true], ['discord', 'Perfil do Discord']];
    var card = cardEl(p, u ? nameOf(u) : p.nomeDiscord, u ? avatarOf(u, 128) : '', acoes);
    card.classList.add('cc-pop'); if (modal) card.classList.add('modal');
    var pai = host.parentElement; if (getComputedStyle(pai).position === 'static') pai.style.position = 'relative';
    card.style.width = (modal ? Math.min(420, host.offsetWidth - 24) : Math.max(300, host.offsetWidth)) + 'px';
    card.style.left = (modal ? host.offsetLeft + Math.max(0, (host.offsetWidth - parseFloat(card.style.width)) / 2) : host.offsetLeft) + 'px';
    card.style.top = host.offsetTop + 'px';
    if (host.dataset.ccDiscord) card.classList.add('mini'); else host.classList.add('cc-oculto');
    host.dataset.ccd = '1';
    card.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pca]'); if (!b) { if (card.classList.contains('mini')) mostrarConcord(); return; }
      e.stopPropagation(); var a = b.dataset.pca;
      if (a === 'discord') { host.dataset.ccDiscord = '1'; host.classList.remove('cc-oculto'); card.classList.add('mini'); }
      else if (a === 'editar') { CFG.tab = 'perfil'; save(); togglePanel(true); }
      else if (a === 'msg') { host.dataset.ccDiscord = '1'; host.classList.remove('cc-oculto'); card.classList.add('mini'); var t = host.querySelector('[role="textbox"], textarea, input[type="text"]'); if (t) t.focus(); }
    });
    function mostrarConcord() { delete host.dataset.ccDiscord; host.classList.add('cc-oculto'); card.classList.remove('mini'); }
    POP.card = card; pai.appendChild(card);
    // perto de onde o cartão do Discord abriu: em cima, embaixo (o seu, lá no canto) ou no meio (perfil completo)
    var hr = host.getBoundingClientRect(), ch = card.offsetHeight, top = host.offsetTop;
    if (modal) top = host.offsetTop + Math.max(0, (host.offsetHeight - ch) / 2);
    else if (hr.bottom > innerHeight - 160 && hr.height > ch) top = host.offsetTop + host.offsetHeight - ch;
    card.style.top = top + 'px';
    var cr = card.getBoundingClientRect(), dt = 0;
    if (cr.bottom > innerHeight - 8) dt = innerHeight - 8 - cr.bottom;
    if (cr.top + dt < 8) dt = 8 - cr.top;
    if (dt) card.style.top = (top + dt) + 'px';
    requestAnimationFrame(function () { card.classList.add('on'); });
  }
  function popPlace() {}

  // ---- predefinições de decoração: prontas e as suas (troca rápida) ----
  var DECOR_K = ['fundo', 'moldura', 'luz', 'interacao', 'destaque', 'nome', 'placa', 'efeito', 'decoracao'];
  var DECOR_PRONTAS = {
    girassol: { n: 'Girassol', placa: 'doce', efeito: 'brilhos', decoracao: 'flores', fundo: { tipo: 'degrade', cores: ['#ffe27a', '#ffb347', '#ff7a59'], angulo: 160, padrao: 'pontos' }, moldura: 'flores', luz: { tipo: 'holofote', cor: '#fff3c4', forca: 0.6 }, interacao: { inclinar: true, particulas: 'petalas' }, destaque: '#f2b63c', nome: { estilo: 'brilho', cores: ['#fff7d6', '#ffb347'], fonte: 'Bricolage Grotesque', animado: false } },
    noite: { n: 'Noite estrelada', placa: 'estrelas', efeito: 'vagalumes', decoracao: 'orbita', fundo: { tipo: 'padrao', cores: ['#0e1033', '#3b2a7a'], angulo: 180, padrao: 'estrelas' }, moldura: 'estrelas', luz: { tipo: 'aurora', cor: '#9fb8ff', forca: 0.5 }, interacao: { inclinar: true, particulas: 'estrelas' }, destaque: '#9b7bff', nome: { estilo: 'degrade', cores: ['#e8e8ff', '#9fb8ff', '#c79bff'], fonte: 'Sora', animado: true } },
    neon: { n: 'Neon', placa: 'neon', efeito: 'chuva', decoracao: 'fones', fundo: { tipo: 'padrao', cores: ['#0b0a14', '#1c0b2e'], angulo: 135, padrao: 'xadrez' }, moldura: 'neon', luz: { tipo: 'segue', cor: '#4fd6e6', forca: 0.7 }, interacao: { inclinar: true, particulas: 'faiscas' }, destaque: '#4fd6e6', nome: { estilo: 'neon', cores: ['#4fd6e6', '#f06fd3'], fonte: 'Space Grotesk', animado: true } },
    sakura: { n: 'Sakura', fundo: { tipo: 'degrade', cores: ['#ffd1e3', '#ff8fb8', '#c86dd7'], angulo: 150, padrao: 'pontos' }, moldura: 'coracoes', luz: { tipo: 'pulso', cor: '#ffe3ef', forca: 0.5 }, interacao: { inclinar: true, particulas: 'petalas' }, destaque: '#ff5c9a', nome: { estilo: 'degrade', cores: ['#ffffff', '#ffc2da', '#ff5c9a'], fonte: 'Nunito', animado: false } },
    gelo: { n: 'Gelo', placa: 'cristal', efeito: 'neve', decoracao: 'halo', fundo: { tipo: 'padrao', cores: ['#dff6ff', '#7fc8f8', '#3a6fd8'], angulo: 200, padrao: 'ondas' }, moldura: 'gelo', luz: { tipo: 'holofote', cor: '#ffffff', forca: 0.55 }, interacao: { inclinar: true, particulas: 'bolhas' }, destaque: '#5b8cff', nome: { estilo: 'brilho', cores: ['#ffffff', '#7fc8f8'], fonte: 'Outfit', animado: false } },
    fogo: { n: 'Fogo', placa: 'chamas', efeito: 'brilhos', decoracao: 'chifres', fundo: { tipo: 'degrade', cores: ['#2a0a0a', '#8a1f12', '#ff6a2a'], angulo: 0, padrao: 'pontos' }, moldura: 'chamas', luz: { tipo: 'pulso', cor: '#ffb070', forca: 0.65 }, interacao: { inclinar: true, particulas: 'faiscas' }, destaque: '#ff6a2a', nome: { estilo: 'degrade', cores: ['#ffe08a', '#ff8a3d', '#ff3d3d'], fonte: 'Lexend', animado: true } },
    pixel: { n: 'Pixel', placa: 'pixel', efeito: 'confete', decoracao: 'coroa', fundo: { tipo: 'padrao', cores: ['#1b2a4a', '#2f5d8a'], angulo: 180, padrao: 'xadrez' }, moldura: 'pixel', luz: { tipo: 'segue', cor: '#ffffff', forca: 0.35 }, interacao: { inclinar: true, particulas: 'estrelas' }, destaque: '#5ee7a6', nome: { estilo: 'normal', cores: ['#5ee7a6'], fonte: 'Space Grotesk', animado: false } },
    aurora: { n: 'Aurora', fundo: { tipo: 'degrade', cores: ['#0f2a2e', '#1f6f6a', '#6a4fd6'], angulo: 120, padrao: 'pontos' }, moldura: 'aurora', luz: { tipo: 'aurora', cor: '#7cffd4', forca: 0.6 }, interacao: { inclinar: true, particulas: 'bolhas' }, destaque: '#5ee7a6', nome: { estilo: 'arcoiris', cores: ['#ffffff'], fonte: '', animado: true } }
  };
  function decorDe(p) { var o = {}; DECOR_K.forEach(function (k) { o[k] = JSON.parse(JSON.stringify(p[k])); }); return o; }
  function usarDecor(o) { var d = PF.draft; DECOR_K.forEach(function (k) { if (o[k] != null) d[k] = JSON.parse(JSON.stringify(o[k])); }); }
  function decorTile(k, o, mine) {
    var cs = o.fundo.cores.length > 1 ? o.fundo.cores : [o.fundo.cores[0], o.fundo.cores[0]], bg = o.fundo.tipo === 'cor' ? cs[0] : 'linear-gradient(' + o.fundo.angulo + 'deg, ' + cs.join(', ') + ')';
    return '<button class="pf-pre" data-pfpre="' + esc(k) + '"' + (mine ? ' data-mine="1"' : '') + ' style="--pf:' + esc(bg) + ';--d:' + o.destaque + '"><i></i><span>' + esc(o.n) + '</span>' + (mine ? '<b data-pfpdel="' + esc(k) + '" title="Apagar">' + IC.x + '</b>' : '') + '</button>';
  }
  function decorHTML() {
    var mine = CFG.decor || {};
    return '<h4>Decorações prontas</h4><div class="note">Um toque troca fundo, moldura, luz, partículas e estilo do nome de uma vez.</div><div class="pf-pres">' +
      Object.keys(DECOR_PRONTAS).map(function (k) { return decorTile(k, DECOR_PRONTAS[k]); }).join('') + '</div>' +
      '<h4>Suas decorações</h4><div class="pf-pres">' + Object.keys(mine).map(function (k) { return decorTile(k, mine[k], true); }).join('') +
      '<button class="pf-pre add" data-pfa="decsalvar">' + IC.plus + '<span>Guardar a atual</span></button></div>';
  }

  // ---- a própria conta ----
  window.__ccConta = function (ok, msg) {
    PF.entrando = false;
    if (ok) { toast('Conta do Concord conectada'); PF.tentou = true; carregarConta(); } else { PF.conta = null; PF.draft = null; if (msg) toast(msg); repintarPerfil(); }
  };
  function carregarConta() {
    if (!window.ccNet || PF.carregando) return;
    PF.carregando = true; repintarPerfil();
    Promise.resolve(window.ccConta ? window.ccConta() : false).then(function (tem) {
      if (!tem) { PF.carregando = false; PF.conta = null; repintarPerfil(); return; }
      return net('GET', '/concord/eu').then(function (r) {
        PF.carregando = false; PF.conta = r; PF.erro = '';
        PF.draft = completar(JSON.parse(JSON.stringify(r.perfil || perfilVazio()))); PF.sujo = false;
        PF.cache[r.id] = { t: Date.now(), p: r.perfil };
        repintarPerfil(); pintarNomes(true);
      });
    }).catch(function (e) { PF.carregando = false; PF.erro = (e && e.erro) || 'Não consegui carregar a conta.'; if (e && e.status === 401) PF.conta = null; repintarPerfil(); });
  }
  function repintarPerfil() { if (PANEL && PANEL.classList.contains('on') && (CFG.tab || 'tema') === 'perfil') paintPanel(); }
  function chips(attr, list, cur) { return '<div class="pf-chips">' + list.map(function (x) { return '<button class="chip' + (cur === x[0] ? ' on' : '') + '" data-' + attr + '="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>'; }
  function coresHTML(grupo, cores, n) {
    var h = '<div class="pf-cores">';
    for (var i = 0; i < n; i++) h += '<label class="pf-cor" style="--c:' + (cores[i] || cores[0] || '#ffffff') + '"><input type="color" data-pfc="' + grupo + '.' + i + '" value="' + (cores[i] || cores[0] || '#ffffff') + '"></label>';
    return h + (n < 3 ? '<button class="pf-cor add" data-pfa="addcor" data-g="' + grupo + '" title="Mais uma cor">' + IC.plus + '</button>' : '') + (n > 1 ? '<button class="pf-cor add" data-pfa="tirarcor" data-g="' + grupo + '" title="Uma cor a menos">' + sv('<path d="M5 12h14"/>') + '</button>' : '') + '</div>';
  }
  function perfilPanel() {
    var h = '';
    if (window.ccNet && !PF.conta && !PF.carregando && !PF.tentou) { PF.tentou = true; setTimeout(carregarConta, 0); }
    if (!window.ccNet) return '<h4>Perfil do Concord</h4><div class="note">Atualize o Concord para usar o perfil. Feche e abra o Concord para a versão nova entrar.</div>';
    if (PF.carregando && !PF.conta) return '<div class="pf-load">Carregando sua conta...</div>';
    if (!PF.conta) {
      h += '<div class="pf-hero"><div class="pf-prev" id="cc-pf-prev"></div><h4>Seu perfil do Concord</h4><div class="note">Avatar e banner com GIF, fundo, nome com estilo, insígnias e uma descrição. Só quem usa o Concord vê.</div>' +
        '<button class="btn pri pf-entrar" data-pfa="entrar"' + (PF.entrando ? ' disabled' : '') + '>' + (PF.entrando ? 'Esperando o login no navegador...' : 'Entrar com o Discord') + '</button>' +
        '<div class="note" style="margin-top:10px">Abre o navegador no login oficial do Discord. O Concord só fica sabendo quem você é, nada mais.</div>' + (PF.erro ? '<div class="pf-err">' + esc(PF.erro) + '</div>' : '') + '</div>';
      setTimeout(function () { var b = document.getElementById('cc-pf-prev'); if (b) { b.innerHTML = ''; var p = perfilVazio(); p.insignias = ['estrela', 'fofo']; p.bio = 'Seu cartão aparece assim para quem usa o Concord.'; p.nome.estilo = 'degrade'; b.appendChild(cardEl(p, 'Seu nome', '')); } }, 0);
      return h;
    }
    var d = PF.draft, f = d.fundo, n = d.nome, ganhas = d.ganhas || (PF.conta.perfil && PF.conta.perfil.ganhas) || [];
    h += '<div class="pf-prev" id="cc-pf-prev"></div><div class="btns pf-grande"><button class="btn" data-pfa="grande">' + sv('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>') + ' Ver em tela grande</button></div>';
    h += decorHTML();
    h += '<h4>Imagens</h4><div class="pf-imgs"><div class="pf-img"><b>Avatar</b><small>GIF, PNG, JPG ou WEBP, até 6 MB</small><div class="btns"><button class="btn" data-pfa="pick" data-k="avatar">' + IC.img + ' Trocar</button>' + (d.avatar ? '<button class="btn" data-pfa="tirar" data-k="avatar">Tirar</button>' : '') + '</div></div>' +
      '<div class="pf-img"><b>Banner</b><small>Fica no topo do cartão</small><div class="btns"><button class="btn" data-pfa="pick" data-k="banner">' + IC.img + ' Trocar</button>' + (d.banner ? '<button class="btn" data-pfa="tirar" data-k="banner">Tirar</button>' : '') + '</div></div></div>';
    h += '<h4>Fundo do cartão</h4><div class="seg">' + [['degrade', 'Degradê'], ['cor', 'Cor'], ['padrao', 'Padrão']].map(function (m) { return '<button data-pff="' + m[0] + '"' + (f.tipo === m[0] ? ' class="on"' : '') + '>' + m[1] + '</button>'; }).join('') + '</div>';
    h += coresHTML('fundo', f.cores, f.tipo === 'cor' ? 1 : f.cores.length);
    if (f.tipo !== 'cor') h += '<div class="row"><div class="l"><b>Direção</b></div><input type="range" data-pfr="angulo" min="0" max="360" step="5" value="' + f.angulo + '" style="--p:' + (f.angulo / 3.6) + '%"><output>' + f.angulo + '°</output></div>';
    if (f.tipo === 'padrao') h += chips('pfp', PADROES, f.padrao);
    h += '<h4>Nome</h4><input class="txt pf-ap" data-pfap maxlength="32" placeholder="' + esc(PF.conta.nome || 'Seu nome') + '" value="' + esc(d.apelido || '') + '"><div class="note" style="margin:6px 0 0">Nome do Concord: aparece no seu cartão e no chat para quem usa o Concord. Vazio usa o nome do Discord.</div>' + chips('pfn', ESTILOS, n.estilo);
    if (n.estilo !== 'arcoiris') h += coresHTML('nome', n.cores, n.estilo === 'normal' ? 1 : Math.max(2, n.cores.length));
    if (n.estilo === 'degrade' || n.estilo === 'arcoiris' || n.estilo === 'neon' || n.estilo === 'brilho') h += '<div class="row"><div class="l"><b>Animado</b><small>As cores andam devagar</small></div><button class="tg' + (n.animado ? ' on' : '') + '" data-pfa="animado" role="switch" aria-checked="' + !!n.animado + '"></button></div>';
    h += '<div class="pf-fontes">' + [''].concat(FONTS.filter(Boolean), NOME_FONTES).map(function (fm) { if (fm) loadFam(fm); return '<button data-pffo="' + esc(fm) + '"' + (n.fonte === fm ? ' class="on"' : '') + ' style="font-family:' + (fm ? "'" + fm + "'" : 'inherit') + '">' + (fm === 'Bricolage Grotesque' ? 'Concord' : fm || 'Igual ao chat') + '</button>'; }).join('') + '</div>';
    h += '<h4>Moldura</h4><div class="pf-molds">' + MOLDURAS.map(function (m) { return '<button class="pf-mold' + (d.moldura === m[0] ? ' on' : '') + '" data-pfm="' + m[0] + '"><span class="cc-pcw mini-mold" data-mold="' + m[0] + '" style="--d:' + d.destaque + '"><i class="cc-pc" style="--pf:#2a2433"></i><i class="pc-mold"><i class="mr"></i>' + moldHTML(m[0]) + '</i></span><em>' + m[1] + '</em></button>'; }).join('') + '</div>';
    h += '<h4>Luz</h4>' + chips('pfl', LUZES, d.luz.tipo);
    if (d.luz.tipo !== 'nenhuma') h += '<div class="pf-cores"><label class="pf-cor" style="--c:' + d.luz.cor + '"><input type="color" data-pflc value="' + d.luz.cor + '"></label></div>' + '<div class="row"><div class="l"><b>Força da luz</b></div><input type="range" data-pflf min="0.1" max="1" step="0.05" value="' + d.luz.forca + '" style="--p:' + (d.luz.forca * 100) + '%"><output>' + Math.round(d.luz.forca * 100) + '%</output></div>';
    h += '<h4>Interação</h4><div class="row"><div class="l"><b>Cartão inclina</b><small>Acompanha o mouse ou o dedo</small></div><button class="tg' + (d.interacao.inclinar ? ' on' : '') + '" data-pfa="inclinar" role="switch" aria-checked="' + !!d.interacao.inclinar + '"></button></div>' +
      '<div class="note" style="margin:8px 0 0">Partículas quando alguém abre ou toca no seu cartão</div>' + chips('pfpa', PARTS, d.interacao.particulas);
    h += '<h4>Efeito no cartão</h4>' + chips('pfe', EFEITOS, d.efeito);
    h += '<h4>Enfeite do avatar</h4>' + chips('pfdc', DECORS, d.decoracao);
    h += '<h4>Placa do nome</h4><div class="note">Aparece atrás do seu nome na lista de membros e nas conversas, para quem usa o Concord.</div><div class="pf-placas">' + PLACAS.map(function (x) { return '<button class="pf-placa' + (d.placa === x[0] ? ' on' : '') + '" data-pfpl="' + x[0] + '"><span data-ccplaca="' + x[0] + '" style="--d:' + d.destaque + '"><i></i><b>' + x[1] + '</b></span></button>'; }).join('') + '</div>';
    h += '<h4>Insígnias <em class="pf-n">' + d.insignias.length + ' de 4</em></h4><div class="pf-ins">' + INS_LIVRES.concat(['fundador', 'pioneiro']).map(function (k) {
      var livre = INS_LIVRES.indexOf(k) >= 0, tem = livre || ganhas.indexOf(k) >= 0, on = d.insignias.indexOf(k) >= 0;
      return '<button class="' + (on ? 'on' : '') + (tem ? '' : ' lock') + '" data-pfi="' + k + '"' + (tem ? '' : ' disabled title="' + (k === 'fundador' ? 'Só a primeira conta do Concord' : 'Das 25 primeiras contas do Concord') + '"') + '>' + sv(INS[k][1]) + '<span>' + INS[k][0] + '</span></button>';
    }).join('') + '</div>';
    h += '<h4>Sobre você <em class="pf-n" id="cc-pf-bion">' + d.bio.length + '/190</em></h4><textarea class="pf-bio" data-pfb maxlength="190" rows="3" placeholder="Uma frase sua...">' + esc(d.bio) + '</textarea>';
    h += '<h4>Cor do cartão</h4><div class="sws">' + ['#ff5c7a', '#ff8a3d', '#f2c14e', '#5ee7a6', '#4fd6e6', '#5b8cff', '#9b7bff', '#f06fd3', '#e8e8f0'].map(function (c) { return '<button class="sw' + (d.destaque === c ? ' on' : '') + '" data-pfd="' + c + '" style="--c:' + c + '"></button>'; }).join('') +
      '<label class="sw" title="Outra cor" style="--c:' + d.destaque + '">' + IC.plus + '<input type="color" data-pfdi value="' + d.destaque + '"></label></div>';
    if (PF.erro) h += '<div class="pf-err">' + esc(PF.erro) + '</div>';
    h += '<div class="btns pf-acts"><button class="btn" data-pfa="sair">Sair da conta</button><span class="sp"></span><button class="btn pri" data-pfa="salvar"' + (PF.salvando ? ' disabled' : '') + '>' + (PF.salvando ? 'Salvando...' : PF.sujo ? 'Salvar perfil' : 'Salvo') + '</button></div>';
    setTimeout(pfPreview, 0);
    return h;
  }
  // prévia ao vivo: voando do lado do painel (em tela larga) ou no topo do painel (tela estreita)
  var PFV = { el: null, key: '' };
  function pfFloat() {
    var quer = PANEL && PANEL.classList.contains('on') && (CFG.tab || 'tema') === 'perfil' && PF.draft && innerWidth >= 900;
    if (!PFV.el) { PFV.el = document.createElement('div'); PFV.el.id = 'cc-pf-float'; PFV.el.innerHTML = '<div class="fl-t">Prévia ao vivo</div><div class="fl-c" id="cc-pf-fl"></div>'; document.body.appendChild(PFV.el); }
    PFV.el.classList.toggle('on', !!quer);
    if (PANEL) PANEL.classList.toggle('pf-float', !!quer);
    return quer;
  }
  function pfPreview() {
    var flutua = pfFloat();
    var b = flutua ? document.getElementById('cc-pf-fl') : document.getElementById('cc-pf-prev'); if (!b || !PF.draft) return;
    var key = JSON.stringify(PF.draft) + (flutua ? 'f' : 'p');
    if (b.firstChild && b.dataset.k === key) return; b.dataset.k = key;
    var U = st('User'), me = U && U.getCurrentUser && U.getCurrentUser();
    var p = JSON.parse(JSON.stringify(PF.draft)); if (PF.draft._av) p.avatar = PF.draft._av; if (PF.draft._bn) p.banner = PF.draft._bn;
    b.innerHTML = ''; PF.quieto = true; b.appendChild(cardEl(p, me ? nameOf(me) : PF.conta.nome, me ? avatarOf(me, 128) : '')); PF.quieto = false;
  }
  // troca só o "escolhido" no lugar, sem redesenhar o painel (nada de piscar)
  function marcar(b, multi) {
    if (multi) b.classList.toggle('on'); else { var attr = Object.keys(b.dataset).filter(function (k) { return k.indexOf('pf') === 0; })[0], box = b.parentNode;
      box.querySelectorAll('button').forEach(function (x) { if (attr in x.dataset) x.classList.toggle('on', x === b); }); }
    PF.sujo = true; PF.erro = ''; pfPreview(); agendarSalvar();
  }
  // salva sozinho logo depois de cada mudança (o botão Salvar continua para quem quiser na hora)
  function agendarSalvar() { if (!PF.draft || !PF.conta) return; clearTimeout(PF.autoT); PF.autoT = setTimeout(salvarPerfil, 900); botaoSalvar('Salvando em instantes...'); }
  function botaoSalvar(t) { var b = PANEL && PANEL.querySelector('[data-pfa="salvar"]'); if (b) b.textContent = t; }
  function salvarPerfil() {
    var d = PF.draft; if (!d || !PF.conta) return;
    if (PF.salvando) { PF.denovo = true; return; }
    PF.salvando = true; PF.denovo = false; botaoSalvar('Salvando...');
    var body = JSON.parse(JSON.stringify(d)); delete body._av; delete body._bn; delete body.ganhas; delete body.nomeDiscord; delete body.v;
    net('PUT', '/concord/perfil', JSON.stringify(body)).then(function (r) {
      PF.salvando = false; PF.conta.perfil = r.perfil; d.v = r.perfil.v; d.ganhas = r.perfil.ganhas;
      PF.cache[PF.conta.id] = { t: Date.now(), p: r.perfil };
      if (PF.denovo) { salvarPerfil(); return; }
      PF.sujo = false; PF.erro = ''; botaoSalvar('Salvo');
      pintarNomes(true); pintarPlacas(); if (POP.id === PF.conta.id) popTick(true);
    }).catch(function (e) { PF.salvando = false; PF.erro = e.erro || 'Não consegui salvar.'; if (e.status === 401) { PF.conta = null; PF.draft = null; } paintPanel(); });
  }
  function mexeu(repaint) {
    PF.sujo = true; PF.erro = ''; agendarSalvar();
    if (repaint) { paintPanel(); botaoSalvar('Salvando em instantes...'); } else pfPreview();
  }
  function pickImg(k) {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/gif,image/png,image/jpeg,image/webp';
    inp.onchange = function () {
      var file = inp.files[0]; if (!file) return;
      if (file.size > 6 << 20) { toast('A imagem precisa ter até 6 MB'); return; }
      var r = new FileReader();
      r.onload = function () {
        var url = String(r.result), b64 = url.split(',')[1];
        PF.draft[k === 'avatar' ? '_av' : '_bn'] = url; pfPreview(); toast('Enviando a imagem...');
        net('POST', '/concord/midia', b64).then(function (res) {
          PF.draft[k] = res.url; PF.media[res.url.slice(-32)] = Promise.resolve(url); mexeu(true); toast('Imagem pronta. Salve o perfil para valer.');
        }).catch(function (e) { delete PF.draft[k === 'avatar' ? '_av' : '_bn']; PF.erro = e.erro || 'Não consegui enviar a imagem.'; paintPanel(); });
      };
      r.readAsDataURL(file);
    };
    inp.click();
  }
  function perfilClick(b) {
    if (!Object.keys(b.dataset).some(function (k) { return k.indexOf('pf') === 0; })) return false;
    var d = PF.draft, a = b.dataset.pfa;
    if (b.dataset.pfpre && window.event && window.event.target && window.event.target.closest('[data-pfpdel]')) { delete (CFG.decor || {})[b.dataset.pfpre]; save(); paintPanel(); toast('Decoração apagada'); return true; }
    if (a === 'entrar') { if (!window.ccEntrar) { toast('Atualize o Concord para entrar'); return true; } PF.entrando = true; PF.erro = ''; window.ccEntrar(); paintPanel(); toast('Abri o login do Discord no navegador'); return true; }
    if (!d) return a != null;
    if (a === 'sair') { if (b.dataset.sure) { if (window.ccSair) window.ccSair(); PF.conta = null; PF.draft = null; paintPanel(); } else { b.dataset.sure = '1'; b.textContent = 'Sair mesmo?'; } return true; }
    if (a === 'salvar') { clearTimeout(PF.autoT); salvarPerfil(); return true; }
    if (a === 'pick') { pickImg(b.dataset.k); return true; }
    if (a === 'tirar') { d[b.dataset.k] = null; delete d[b.dataset.k === 'avatar' ? '_av' : '_bn']; mexeu(true); return true; }
    if (a === 'animado') { d.nome.animado = !d.nome.animado; b.setAttribute('aria-checked', d.nome.animado); marcar(b, 1); return true; }
    if (a === 'addcor' || a === 'tirarcor') {
      var g = b.dataset.g === 'fundo' ? d.fundo : d.nome, l = g.cores;
      if (a === 'addcor' && l.length < 3) l.push(l[l.length - 1] || '#ffffff'); else if (a === 'tirarcor' && l.length > 1) l.pop();
      mexeu(true); return true;
    }
    if (b.dataset.pff) { d.fundo.tipo = b.dataset.pff; if (d.fundo.cores.length < 2 && d.fundo.tipo !== 'cor') d.fundo.cores.push('#7b5cff'); mexeu(true); return true; }
    if (b.dataset.pfp) { d.fundo.padrao = b.dataset.pfp; marcar(b); return true; }
    if (b.dataset.pfn) { d.nome.estilo = b.dataset.pfn; if (d.nome.estilo !== 'normal' && d.nome.cores.length < 2) d.nome.cores.push('#ff5c7a'); mexeu(true); return true; }
    if (b.dataset.pffo != null) { d.nome.fonte = b.dataset.pffo; marcar(b); return true; }
    if (b.dataset.pfi) { var k = b.dataset.pfi, i = d.insignias.indexOf(k); if (i >= 0) d.insignias.splice(i, 1); else if (d.insignias.length < 4) d.insignias.push(k); else { toast('Até 4 insígnias'); return true; } b.classList.toggle('on', d.insignias.indexOf(k) >= 0); var nn = PANEL.querySelectorAll('h4 .pf-n')[0]; if (nn) nn.textContent = d.insignias.length + ' de 4'; marcar(b, 'nada'); b.classList.toggle('on', d.insignias.indexOf(k) >= 0); return true; }
    if (b.dataset.pfd) { d.destaque = b.dataset.pfd; marcar(b); return true; }
    if (b.dataset.pfm) { d.moldura = b.dataset.pfm; marcar(b); return true; }
    if (b.dataset.pfe) { d.efeito = b.dataset.pfe; marcar(b); return true; }
    if (b.dataset.pfdc) { d.decoracao = b.dataset.pfdc; marcar(b); return true; }
    if (b.dataset.pfpl) { d.placa = b.dataset.pfpl; marcar(b); return true; }
    if (a === 'grande') { var pv0 = JSON.parse(JSON.stringify(d)); if (d._av) pv0.avatar = d._av; if (d._bn) pv0.banner = d._bn; var U0 = st('User'), me0 = U0 && U0.getCurrentUser && U0.getCurrentUser(); ampliar(pv0, me0 ? nameOf(me0) : PF.conta.nome, me0 ? avatarOf(me0, 128) : ''); return true; }
    if (b.dataset.pfl) { d.luz.tipo = b.dataset.pfl; mexeu(true); return true; }
    if (b.dataset.pfpa) { d.interacao.particulas = b.dataset.pfpa; marcar(b); var pv = document.querySelector('#cc-pf-fl .cc-pcw, #cc-pf-prev .cc-pcw'); if (pv) explodir(pv, 150, 120, d.interacao.particulas, 14); return true; }
    if (a === 'inclinar') { d.interacao.inclinar = !d.interacao.inclinar; b.setAttribute('aria-checked', d.interacao.inclinar); marcar(b, 1); return true; }
    if (a === 'decsalvar') { var nm = prompt('Nome da decoração', 'Minha decoração'); if (!nm) return true; var o = decorDe(d); o.n = nm.slice(0, 24); CFG.decor = CFG.decor || {}; CFG.decor['d' + Date.now().toString(36)] = o; save(); paintPanel(); toast('Decoração guardada'); return true; }
    if (b.dataset.pfpre) { var src = b.dataset.mine ? (CFG.decor || {})[b.dataset.pfpre] : DECOR_PRONTAS[b.dataset.pfpre]; if (src) { usarDecor(src); mexeu(true); var pv2 = document.querySelector('#cc-pf-fl .cc-pcw, #cc-pf-prev .cc-pcw'); if (pv2) explodir(pv2, 150, 120, d.interacao.particulas, 16); } return true; }
    return false;
  }
  function perfilInput(t) {
    var d = PF.draft; if (!d) return false;
    if (t.dataset.pfc) { var p = t.dataset.pfc.split('.'), g = p[0] === 'fundo' ? d.fundo : d.nome; g.cores[+p[1]] = t.value; t.parentNode.style.setProperty('--c', t.value); mexeu(false); return true; }
    if (t.dataset.pfr) { d.fundo.angulo = +t.value; t.style.setProperty('--p', (+t.value / 3.6) + '%'); var o = t.nextElementSibling; if (o) o.textContent = t.value + '°'; mexeu(false); return true; }
    if (t.dataset.pfb != null) { d.bio = t.value.slice(0, 190); var c = document.getElementById('cc-pf-bion'); if (c) c.textContent = d.bio.length + '/190'; mexeu(false); return true; }
    if (t.dataset.pfdi != null) { d.destaque = t.value; mexeu(false); return true; }
    if (t.dataset.pfap != null) { d.apelido = t.value.slice(0, 32); mexeu(false); return true; }
    if (t.dataset.pflc != null) { d.luz.cor = t.value; t.parentNode.style.setProperty('--c', t.value); mexeu(false); return true; }
    if (t.dataset.pflf != null) { d.luz.forca = +t.value; t.style.setProperty('--p', (+t.value * 100) + '%'); var o2 = t.nextElementSibling; if (o2) o2.textContent = Math.round(+t.value * 100) + '%'; mexeu(false); return true; }
    return false;
  }
  // na call, o quadro de quem usa Concord ganha o fundo, o banner, a cor e o nome do perfil
  function pintarTiles() {
    var ts = document.querySelectorAll('.tile__2f4f7');
    for (var i = 0; i < ts.length; i++) {
      var t = ts[i], img = t.querySelector('img[src*="/avatars/"]'), m = img && /\/avatars\/(\d{5,25})\//.exec(img.src), id = m ? m[1] : '';
      var p = id ? perfilDe(id) : null, k = p ? id + ':' + p.v : '';
      if ((t.dataset.ccTile || '') === k) continue;
      if (!p) { delete t.dataset.ccTile; t.style.removeProperty('--pf'); t.style.removeProperty('--cc-tbn'); continue; }
      t.dataset.ccTile = k; var pp = completar(JSON.parse(JSON.stringify(p)));
      t.style.setProperty('--pf', fundoCSS(pp.fundo)); t.style.setProperty('--d', pp.destaque);
      (function (t, pp) { if (pp.banner) mediaURL(pp.banner).then(function (d) { if (d) t.style.setProperty('--cc-tbn', 'url("' + d + '")'); }); else t.style.removeProperty('--cc-tbn'); })(t, pp);
      var nm = t.querySelector('.experimentOverlayTitle__2f4f7, .overlayTitleText__2f4f7'); if (nm) { nomeStyle(nm, pp.nome); nm.classList.add('cc-nm'); }
    }
  }
  function pfTick() { if (!window.ccNet) return; flag('cc-pfon', true); pintarNomes(false); pintarPlacas(); pintarTiles(); popTick(false); }
  window.addEventListener('resize', function () { popPlace(); if (PF.draft) pfPreview(); });

  /* ---------- começo ---------- */
  style('base', CC.css.base || ''); style('ours', CC.css.ours || ''); applyTheme(); edListen();
  loadFonts();
  var pend = false;
  var mo = new MutationObserver(function () {
    if (pend) return; pend = true;
    setTimeout(function () { pend = false; place(); if (document.body) { splash(); aura(); mountWin(); tagMine(); pfTick(); homeTick(); cleanAds(); splashCheck(); dmAside(); watchScreen(); } if (window.scrollY || document.documentElement.scrollTop) window.scrollTo(0, 0); }, 250);
  });
  mo.observe(document, { childList: true, subtree: true });
  // troca de tela na hora (sem esperar o Discord mexer na página): o Início entra sem mostrar a lista de amigos antes
  function onRoute() { if (!document.body) return; watchScreen(); homeTick(); requestAnimationFrame(homeTick); }
  ['pushState', 'replaceState'].forEach(function (m) { var o = history[m]; history[m] = function () { var r = o.apply(this, arguments); setTimeout(onRoute, 0); return r; }; });
  window.addEventListener('popstate', function () { setTimeout(onRoute, 0); });
  function ready() {
    splash(); aura(); mountWin(); applyTheme(); parallax(); LAST_THEME = themeKey(); fallbackSheets(); badge();
    new MutationObserver(badge).observe(document.querySelector('title') || document.head, { childList: true, subtree: true, characterData: true });
    if (window.ccInfo) window.ccInfo().then(function (i) { if (i) { INFO.ver = i.ver; INFO.mats = i.mats || INFO.mats; INFO.update = i.update; if (!INFO.mats[CFG.mat]) { CFG.mat = 'aura'; save(); } applyTheme(); if (PANEL && PANEL.classList.contains('on')) paintPanel(); } }).catch(function () {});
    win('state'); restoreZoom(); if (window.ccSegundoPlano) window.ccSegundoPlano(CFG.bg !== false).catch(function () {});
    setTimeout(function () { homeTick(); if (window.ccDump) window.ccDump('diagnostico', '<!-- ' + JSON.stringify(diag()) + ' -->').catch(function () {}); }, 30000);
    setTimeout(function () { (window.requestIdleCallback || setTimeout)(dumpCSS, { timeout: 10000 }); }, 15000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
  window.addEventListener('resize', function () { win('state'); });
  window.__ccUpdateReady = function (v) { INFO.update = v; toast('Versão nova do Concord pronta. Ela entra quando você fechar e abrir.'); if (PANEL && PANEL.classList.contains('on')) paintPanel(); };
  window.__ccToggle = togglePanel;
  window.__ccChecked = function (m) { toast(m); };
  window.__ccEditor = function (id) { togglePanel(false); edOpen(id || ''); };
  // pele nova baixada com o Concord aberto: troca os estilos na hora
  window.__ccReskin = function (base, ours) {
    CC.css.base = base; CC.css.ours = ours; setTimeout(function () { toast('Pele do Concord atualizada'); }, 300);
    if (STY.adopted) { STY.adopted[0].replaceSync(base); STY.adopted[2].replaceSync(ours); } else { style('base', base); style('ours', ours); }
  };
})();

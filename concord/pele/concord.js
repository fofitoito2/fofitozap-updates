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
  var DEF = { preset: 'fofito', accent: '', mat: 'aura', op: 0.62, blur: 14, radius: 14, gap: 10, font: 'Bricolage Grotesque', anim: true, motion: false, orbs: 0.6, chatbar: true, small: true, v: 6, style: true, bub: true, dood: true, tint: 0.06, clean: true, home: true, boost: 1, lite: false, mine: {}, places: {}, parallax: false, tab: 'tema' };
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
    var root = ':root{' + Object.keys(v).map(function (k) { return k + ':' + v[k]; }).join(';') + '}';
    var F = v['--cc-float'];
    root += 'body,.theme-dark,.theme-darker,.theme-midnight,.theme-light{--background-surface-high:' + F + '!important;--background-surface-higher:' + F + '!important;--background-surface-highest:' + F + '!important;--bg-surface-overlay:' + F + '!important;--bg-surface-overlay-tmp:' + F + '!important;--bg-surface-raised:' + F + '!important;--background-floating:' + F + '!important;--modal-background:' + F + '!important;--bg-floating:' + F + '!important}';
    var on = function (b) { return b ? 'on' : 'off'; };
    var r = +CFG.radius;
    var body = 'body{' + [
      "--font:" + (CFG.font ? "'" + CFG.font + "'" : "''"), '--gap:' + CFG.gap + 'px', '--border-thickness:1px',
      '--animations:' + on(CFG.anim), '--list-item-transition:.2s ease',
      '--top-bar-height:36px', '--top-bar-button-position:off', '--top-bar-title-position:off', '--subtle-top-bar-title:on',
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
  var HASBAR = false;
  function marks() {
    var h = document.documentElement; if (!h) return;
    watchHtml();
    var want = { 'cc-on': true, 'cc-aura': CFG.mat === 'aura' || CFG.mat === 'wall', 'cc-solid': CFG.mat === 'solid', 'cc-anim': !!CFG.anim, 'cc-still': !CFG.motion,
      'cc-style': !!CFG.style, 'cc-bub': !!(CFG.style && CFG.bub), 'cc-dood': !!(CFG.style && CFG.dood), 'cc-clean': !!CFG.clean, 'cc-lite': !!CFG.lite, 'cc-hasbar': HASBAR };
    Object.keys(want).forEach(function (c) { if (h.classList.contains(c) !== want[c]) h.classList.toggle(c, want[c]); });
  }
  var htmlWatched = false;
  function watchHtml() {
    if (htmlWatched || !document.documentElement) return; htmlWatched = true;
    new MutationObserver(function () { if (!document.documentElement.classList.contains('cc-on')) marks(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
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
  function paintWall() {
    var a = document.getElementById('cc-aura'); if (!a) return;
    a.classList.toggle('wall', CFG.mat === 'wall' && !!CFG.wall);
    a.style.setProperty('--cc-wall', CFG.wall ? 'url("' + CFG.wall + '")' : 'none');
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
    if (t.closest('button, a, input, textarea, [role="button"], [role="tab"], [contenteditable], .cc-win')) return false;
    return !!t.closest('[class*="base_"] > [class*="bar_"], #cc-drag');
  }
  document.addEventListener('mousedown', function (e) { if (e.button === 0 && e.detail === 1 && isBarSpot(e.target)) { e.preventDefault(); win('drag'); } }, true);
  document.addEventListener('dblclick', function (e) { if (isBarSpot(e.target)) win('max'); }, true);

  /* ---------- painel do Concord ---------- */
  var PANEL = null;
  function togglePanel(force) {
    if (!PANEL) buildPanel();
    var on = force == null ? !PANEL.classList.contains('on') : force;
    PANEL.classList.toggle('on', on);
    if (on) { loadFonts(true); paintPanel(); }
  }
  function buildPanel() {
    PANEL = document.createElement('div'); PANEL.id = 'cc-panel';
    PANEL.innerHTML = '<div class="hd">' + MARK + '<div class="t"><b>Aparência</b><small>Concord ' + esc(INFO.ver) + '</small></div><button class="ib" data-a="close" title="Fechar">' + IC.x + '</button></div><div class="tabbar"></div><div class="bd"></div>' +
      '<div class="ft"><span class="sp">As mudanças aparecem na hora</span><button class="btn" data-a="reset">Restaurar padrão</button><button class="btn pri" data-a="update" hidden>Atualizar o Concord</button></div>';
    document.body.appendChild(PANEL);
    PANEL.addEventListener('click', onPanelClick);
    PANEL.addEventListener('input', onPanelInput);
    document.addEventListener('mousedown', function (e) { if (PANEL.classList.contains('on') && !e.target.closest('#cc-panel, .cc-win')) togglePanel(false); }, true);
  }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function range(k, label, sub, min, max, step, fmt) {
    var v = +CFG[k], p = ((v - min) / (max - min)) * 100;
    return '<div class="row"><div class="l"><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><input type="range" data-k="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v + '" style="--p:' + p + '%"><output>' + fmt(v) + '</output></div>';
  }
  function toggle(k, label, sub) { return '<div class="row"><div class="l"><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><button class="tg' + (CFG[k] ? ' on' : '') + '" data-t="' + k + '" role="switch" aria-checked="' + !!CFG[k] + '"></button></div>'; }
  var FMT = { pct: function (v) { return Math.round(v * 100) + '%'; }, px: function (v) { return Math.round(v) + 'px'; } };
  var EDIT = null; // tema sendo criado/editado
  var TABS = [['tema', 'Tema'], ['fundo', 'Fundo'], ['estilo', 'Estilo'], ['texto', 'Texto'], ['som', 'Som'], ['telas', 'Telas']];
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
    if (tab === 'tema' && EDIT) {
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
      }).join('') + '</div><div class="note" style="margin-top:8px">' + ({ aura: 'Bolhas com as cores do tema atrás dos painéis de vidro.', acrylic: 'O que está atrás da janela aparece desfocado. Painéis bem transparentes combinam mais.', mica: 'A cor do seu papel de parede do Windows tinge a janela.', wall: 'Uma imagem sua atrás dos painéis de vidro.', solid: 'Painéis firmes, sem transparência. O mais leve.' }[CFG.mat] || '') + '</div>';
      if (CFG.mat === 'wall') h += '<div class="walls"><button data-a="wallpick" style="--w:' + (CFG.wall ? 'url(' + CFG.wall + ')' : 'none') + '">' + (CFG.wall ? '' : 'Escolher') + '</button></div>';
      if (CFG.mat === 'aura') h += range('orbs', 'Bolhas', 'Força das cores do fundo', 0.2, 1, 0.05, FMT.pct) + toggle('motion', 'Bolhas em movimento', 'Mais bonito, pesa um pouco mais');
      if (CFG.mat === 'aura' || CFG.mat === 'wall') h += toggle('parallax', 'Profundidade', 'O fundo acompanha o mouse devagar, como se estivesse mais longe');
      if (CFG.mat !== 'solid') h += range('op', 'Opacidade dos painéis', 'Menos opaco deixa ver mais o fundo', 0.2, 1, 0.02, FMT.pct) + range('blur', 'Desfoque', 'Quanto o vidro desfoca o que está atrás', 0, 40, 1, FMT.px);
    } else if (tab === 'estilo') {
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
      h += '<h4>Telas</h4>' + toggle('home', 'Início do Concord', 'Tela inicial nova com amigos, chamadas, conversas e servidores') + toggle('clean', 'Esconder propaganda do Discord', 'Nitro, Loja, Missões, botão de presente e de baixar o app') + toggle('lite', 'Modo leve', 'Sem vidro desfocado e sem bolhas: o mais rápido possível');
    }
    PANEL.querySelector('.tabbar').innerHTML = tabs;
    var bd = PANEL.querySelector('.bd'), sc = bd.dataset.tab === tab ? bd.scrollTop : 0; bd.innerHTML = h; bd.scrollTop = sc; bd.dataset.tab = tab;
    PANEL.querySelector('[data-a="update"]').hidden = !INFO.update;
  }
  function set(k, v, repaint) { CFG[k] = v; save(); applyTheme(); if (repaint) paintPanel(); if (k === 'home') homeTick(); if (k === 'parallax') parallax(); }
  function newId() { return 'meu-' + Date.now().toString(36); }
  function themeCode(t) { try { return 'CONCORD-TEMA:' + btoa(unescape(encodeURIComponent(JSON.stringify(t)))); } catch (e) { return ''; } }
  function readCode(c) {
    try { var t = JSON.parse(decodeURIComponent(escape(atob(String(c).trim().replace(/^CONCORD-TEMA:/, ''))))); if (!t || !t.a1 || !t.o || !t.bg) return null; t.n = String(t.n || 'Tema').slice(0, 24); return t; } catch (e) { return null; }
  }
  function onPanelClick(e) {
    var b = e.target.closest('button, b[data-edit]'); if (!b) return;
    var a = b.dataset.a;
    if (b.dataset.tab) { CFG.tab = b.dataset.tab; EDIT = null; save(); paintPanel(); return; }
    if (b.dataset.edit) { e.stopPropagation(); var k = b.dataset.edit; EDIT = { key: k, t: JSON.parse(JSON.stringify(CFG.mine[k])), prev: CFG.preset }; CFG.preset = k; applyTheme(); paintPanel(); return; }
    if (a === 'close') togglePanel(false);
    else if (a === 'reset') { Object.keys(DEF).forEach(function (k) { if (k !== 'mine' && k !== 'places') CFG[k] = DEF[k]; }); delete CFG.wall; save(); applyTheme(); paintPanel(); toast('Aparência padrão de volta. Seus temas continuam salvos.'); }
    else if (a === 'update') { if (window.ccUpdate) window.ccUpdate(); }
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
  function pickWall() {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function () {
      var f = inp.files[0]; if (!f) return;
      var img = new Image(); img.onload = function () {
        // reduz para caber guardado (até 2560px, JPEG)
        var s = Math.min(1, 2560 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        CFG.wall = c.toDataURL('image/jpeg', 0.86); CFG.mat = 'wall'; save(); applyTheme(); paintPanel(); URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(f);
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
  var KEEP = ['class', 'id', 'role', 'aria-hidden', 'aria-selected', 'aria-expanded', 'aria-checked', 'type', 'contenteditable', 'href', 'data-list-item-id', 'aria-label', 'data-cc-r'];
  function visibleEdge(cs) {
    var b = ['Top', 'Right', 'Bottom', 'Left'].some(function (k) { return parseFloat(cs['border' + k + 'Width']) > 0 && cs['border' + k + 'Style'] !== 'none' && !/rgba\(.*, 0\)$|transparent/.test(cs['border' + k + 'Color']); });
    return b || (cs.boxShadow && cs.boxShadow !== 'none') || (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0);
  }
  function skeleton() {
    var marked = [];
    document.body.querySelectorAll('*').forEach(function (el) {
      if (el.closest('svg') && el.tagName !== 'svg') return;
      var cs = getComputedStyle(el); if (cs.display === 'none' || !visibleEdge(cs)) return;
      var r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
      el.setAttribute('data-cc-r', Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.width) + ',' + Math.round(r.height) + ' op=' + cs.opacity + ' vis=' + cs.visibility + ' z=' + cs.zIndex + ' b=' + cs.borderTopWidth + ' ' + cs.borderTopColor + ' sh=' + (cs.boxShadow || '').slice(0, 40));
      marked.push(el);
    });
    var root = document.body.cloneNode(true);
    marked.forEach(function (el) { el.removeAttribute('data-cc-r'); });
    root.querySelectorAll('#cc-panel, #cc-aura, #cc-toast, script, style, link, svg *, iframe').forEach(function (n) { n.remove(); });
    (function walk(el) {
      for (var i = el.attributes.length - 1; i >= 0; i--) {
        var a = el.attributes[i].name;
        if (KEEP.indexOf(a) < 0 || (a === 'aria-label' && el.tagName !== 'BUTTON')) el.removeAttribute(a);
        else if (a === 'href' || a === 'data-list-item-id' || a === 'aria-label') el.setAttribute(a, el.getAttribute(a).replace(/\d{6,}/g, '#'));
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
    document.documentElement.classList.add('cc-drag'); clearTimeout(dragT);
    dragT = setTimeout(function () { document.documentElement.classList.remove('cc-drag'); }, 600);
  }, true); });
  window.addEventListener('drop', function () { setTimeout(function () { document.documentElement.classList.remove('cc-drag'); }, 300); }, true);

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
    if (!CFG.home) { if (HOME.el) HOME.el.classList.remove('on'); if (HOME.back) HOME.back.classList.remove('on'); h.classList.remove('cc-home-on'); return; }
    var want = onHomePath();
    if (!want) HOME.hidden = false;
    var show = want && !HOME.hidden;
    if (!HOME.el && show) buildHome();
    if (!HOME.el) return;
    var r = homeRect();
    var vis = show && r && r.width > 200;
    h.classList.toggle('cc-home-on', !!vis);
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
    var want = !!CFG.parallax && !CFG.lite && (CFG.mat === 'aura' || CFG.mat === 'wall');
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

  /* ---------- começo ---------- */
  style('base', CC.css.base || ''); style('ours', CC.css.ours || ''); applyTheme();
  loadFonts();
  var pend = false;
  var mo = new MutationObserver(function () {
    if (pend) return; pend = true;
    setTimeout(function () { pend = false; place(); if (document.body) { splash(); aura(); mountWin(); tagMine(); homeTick(); cleanAds(); splashCheck(); dmAside(); watchScreen(); } if (window.scrollY || document.documentElement.scrollTop) window.scrollTo(0, 0); }, 250);
  });
  mo.observe(document, { childList: true, subtree: true });
  function ready() {
    splash(); aura(); mountWin(); applyTheme(); parallax(); LAST_THEME = themeKey(); fallbackSheets(); badge();
    new MutationObserver(badge).observe(document.querySelector('title') || document.head, { childList: true, subtree: true, characterData: true });
    if (window.ccInfo) window.ccInfo().then(function (i) { if (i) { INFO.ver = i.ver; INFO.mats = i.mats || INFO.mats; INFO.update = i.update; if (!INFO.mats[CFG.mat]) { CFG.mat = 'aura'; save(); } applyTheme(); if (PANEL && PANEL.classList.contains('on')) paintPanel(); } }).catch(function () {});
    win('state'); restoreZoom();
    setTimeout(function () { homeTick(); if (window.ccDump) window.ccDump('diagnostico', '<!-- ' + JSON.stringify(diag()) + ' -->').catch(function () {}); }, 30000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
  window.addEventListener('resize', function () { win('state'); });
  window.__ccUpdateReady = function (v) { INFO.update = v; toast('Versão nova do Concord pronta. Ela entra quando você fechar e abrir.'); if (PANEL && PANEL.classList.contains('on')) paintPanel(); };
  window.__ccToggle = togglePanel;
  // pele nova baixada com o Concord aberto: troca os estilos na hora
  window.__ccReskin = function (base, ours) {
    CC.css.base = base; CC.css.ours = ours;
    if (STY.adopted) { STY.adopted[0].replaceSync(base); STY.adopted[2].replaceSync(ours); } else { style('base', base); style('ours', ours); }
  };
})();

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
  var FONTS = ['Onest', 'Figtree', 'Outfit', 'Nunito', 'Plus Jakarta Sans', 'Lexend', ''];
  var DEF = { preset: 'fofito', accent: '', mat: 'aura', op: 0.62, blur: 22, radius: 14, gap: 10, font: 'Onest', anim: true, motion: true, orbs: 0.6, chatbar: true, small: true };
  var CFG = {};
  try { CFG = JSON.parse((LS && LS.getItem('concord.cfg')) || '{}') || {}; } catch (e) { CFG = {}; }
  Object.keys(DEF).forEach(function (k) { if (CFG[k] === undefined) CFG[k] = DEF[k]; });
  function save() { try { LS && LS.setItem('concord.cfg', JSON.stringify(CFG)); } catch (e) {} }
  var INFO = { mats: { aura: true, acrylic: true, mica: false, solid: true }, ver: CC.ver };

  /* ---------- cores ---------- */
  function rgb(h) { h = (h || '#000').replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function hex(c) { return '#' + c.map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); }
  function mix(a, b, p) { var x = rgb(a), y = rgb(b); return hex(x.map(function (v, i) { return v + (y[i] - v) * p; })); }
  function rgba(h, a) { var c = rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (+a).toFixed(3) + ')'; }
  function lum(h) { var c = rgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }

  var NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

  function themeCSS() {
    var P = PRESETS[CFG.preset] || PRESETS.fofito, a1 = CFG.accent || P.a1, a3 = P.a3;
    var solid = CFG.mat === 'solid', op = solid ? 1 : +CFG.op, w = P.w;
    var aink = lum(a1) > 0.45 ? '#0b0c10' : '#ffffff';
    var ink = '#f2f3f8';
    var floatA = solid ? 1 : Math.max(op, 0.84);
    var v = {
      '--cc-bg0': P.bg[0], '--cc-bg1': P.bg[1], '--cc-o1': P.o[0], '--cc-o2': P.o[1], '--cc-o3': P.o[2], '--cc-orbs': CFG.orbs, '--cc-noise': NOISE,
      '--cc-a1': a1, '--cc-a2': P.a2, '--cc-a3': a3, '--cc-aink': aink, '--cc-ink': ink, '--cc-ink2': 'rgba(242,243,248,.74)', '--cc-ink3': 'rgba(242,243,248,.5)',
      '--cc-glass': rgba(mix(w, '#ffffff', 0.03), solid ? 0.98 : 0.78), '--cc-font': CFG.font ? "'" + CFG.font + "'" : "'gg sans'",
      '--text-0': aink, '--text-1': ink, '--text-2': 'rgba(242,243,248,.88)', '--text-3': 'rgba(242,243,248,.76)', '--text-4': 'rgba(242,243,248,.52)', '--text-5': 'rgba(242,243,248,.34)',
      '--bg-1': rgba(mix(w, '#ffffff', 0.12), Math.min(1, op + 0.18)), '--bg-2': rgba(mix(w, '#ffffff', 0.075), Math.min(1, op + 0.12)),
      '--bg-3': rgba(mix(w, '#ffffff', 0.035), op), '--bg-4': rgba(w, op),
      '--hover': 'rgba(255,255,255,.055)', '--active': 'rgba(255,255,255,.09)', '--active-2': 'rgba(255,255,255,.13)', '--message-hover': 'rgba(255,255,255,.025)',
      '--accent-1': mix(a1, '#ffffff', 0.22), '--accent-2': a1, '--accent-3': a1, '--accent-4': mix(a1, '#ffffff', 0.12), '--accent-5': mix(a1, '#000000', 0.12), '--accent-new': a3,
      '--border-light': 'rgba(255,255,255,.05)', '--border': 'rgba(255,255,255,.085)', '--border-hover': 'rgba(255,255,255,.15)', '--button-border': 'rgba(255,255,255,.1)'
    };
    var root = ':root{' + Object.keys(v).map(function (k) { return k + ':' + v[k]; }).join(';') + '}';
    var on = function (b) { return b ? 'on' : 'off'; };
    var r = +CFG.radius;
    var body = 'body{' + [
      "--font:" + (CFG.font ? "'" + CFG.font + "'" : "''"), '--gap:' + CFG.gap + 'px', '--border-thickness:1px',
      '--animations:' + on(CFG.anim), '--list-item-transition:.2s ease',
      '--top-bar-height:36px', '--top-bar-button-position:off', '--top-bar-title-position:off', '--subtle-top-bar-title:on',
      '--custom-window-controls:off', '--custom-dms-icon:off', '--custom-dms-background:off', '--background-image:off',
      '--transparency-tweaks:' + on(!solid), '--remove-bg-layer:' + on(!solid), '--panel-blur:' + on(!solid && CFG.blur > 0), '--blur-amount:' + CFG.blur + 'px',
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
    var h = document.documentElement; if (!h) return;
    h.classList.toggle('cc-aura', CFG.mat === 'aura' || CFG.mat === 'wall');
    h.classList.toggle('cc-solid', CFG.mat === 'solid');
    h.classList.toggle('cc-anim', !!CFG.anim);
    h.classList.toggle('cc-still', !CFG.motion);
    if (window.ccMat) window.ccMat(CFG.mat === 'acrylic' || CFG.mat === 'mica' ? CFG.mat : 'none').catch(function () {});
    paintWall();
  }

  /* ---------- fontes (FontFace com os bytes: não depende de baixar nada) ---------- */
  function loadFonts() {
    Object.keys(CC.fonts || {}).forEach(function (fam) {
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
    x: sv('<path d="M6 6l12 12M18 6L6 18"/>'), pal: sv('<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.9-.5-1.2-.3-.4-.5-.8-.5-1.2 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4-4-7.4-9-7.4z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10.5" cy="7" r="1.2" fill="currentColor"/><circle cx="15" cy="7.5" r="1.2" fill="currentColor"/>'),
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
    document.documentElement.classList.toggle('cc-hasbar', !!tr);
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
    if (on) paintPanel();
  }
  function buildPanel() {
    PANEL = document.createElement('div'); PANEL.id = 'cc-panel';
    PANEL.innerHTML = '<div class="hd">' + MARK + '<div class="t"><b>Aparência</b><small>Concord ' + esc(INFO.ver) + '</small></div><button class="ib" data-a="close" title="Fechar">' + IC.x + '</button></div><div class="bd"></div>' +
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
  function paintPanel() {
    var P = PRESETS[CFG.preset] || PRESETS.fofito, h = '';
    h += '<h4>Tema</h4><div class="themes">' + Object.keys(PRESETS).map(function (k) {
      var t = PRESETS[k];
      return '<button class="th' + (CFG.preset === k ? ' on' : '') + '" data-p="' + k + '" style="--a:' + t.a1 + ';--g:radial-gradient(90% 120% at 15% 10%, ' + t.o[0] + ', transparent 70%), radial-gradient(90% 120% at 95% 90%, ' + t.o[1] + ', transparent 70%), ' + t.bg[1] + '"><i><em style="--c:' + t.a1 + '"></em><em style="--c:' + t.a2 + '"></em><em style="--c:' + t.a3 + '"></em></i><span>' + esc(t.n) + '</span></button>';
    }).join('') + '</div>';
    h += '<h4>Cor de destaque</h4><div class="sws"><button class="sw auto' + (!CFG.accent ? ' on' : '') + '" data-c="" title="A do tema" style="--c:' + P.a1 + '"></button>' +
      ACCENTS.map(function (c) { return '<button class="sw' + (CFG.accent === c ? ' on' : '') + '" data-c="' + c + '" style="--c:' + c + '"></button>'; }).join('') +
      '<label class="sw' + (CFG.accent && ACCENTS.indexOf(CFG.accent) < 0 ? ' on' : '') + '" title="Outra cor" style="--c:' + (CFG.accent || P.a1) + '">' + IC.plus + '<input type="color" data-ci="accent" value="' + (CFG.accent || P.a1) + '"></label></div>';
    h += '<h4>Material</h4><div class="seg">' + [['aura', 'Aura'], ['acrylic', 'Acrílico'], ['mica', 'Mica'], ['wall', 'Imagem'], ['solid', 'Sólido']].map(function (m) {
      return '<button data-m="' + m[0] + '"' + (CFG.mat === m[0] ? ' class="on"' : '') + (INFO.mats[m[0]] === false ? ' disabled title="Precisa do Windows 11"' : '') + '>' + m[1] + '</button>';
    }).join('') + '</div><div class="note" style="margin-top:8px">' + ({ aura: 'Bolhas de cor do tema se movendo devagar atrás dos painéis de vidro.', acrylic: 'O que está atrás da janela aparece desfocado, como no Windows.', mica: 'A cor do papel de parede tinge a janela, bem de leve.', wall: 'Uma imagem sua atrás dos painéis de vidro.', solid: 'Painéis opacos, sem transparência. O mais leve.' }[CFG.mat] || '') + '</div>';
    if (CFG.mat === 'wall') h += '<div class="walls"><button data-a="wallpick" style="--w:' + (CFG.wall ? 'url(' + CFG.wall + ')' : 'none') + '">' + (CFG.wall ? '' : 'Escolher') + '</button></div>';
    if (CFG.mat === 'aura') h += range('orbs', 'Bolhas', 'Força das cores do fundo', 0.2, 1, 0.05, FMT.pct) + toggle('motion', 'Bolhas em movimento', '');
    if (CFG.mat !== 'solid') h += range('op', 'Opacidade dos painéis', 'Menos opaco deixa ver mais o fundo', 0.2, 1, 0.02, FMT.pct) + range('blur', 'Desfoque', 'Quanto o vidro desfoca o que está atrás', 0, 40, 1, FMT.px);
    h += '<h4>Formas</h4>' + range('radius', 'Cantos', '', 0, 24, 1, FMT.px) + range('gap', 'Espaço entre painéis', '', 0, 20, 1, FMT.px);
    h += '<h4>Fonte</h4><div class="fonts">' + FONTS.map(function (f) { return '<button data-f="' + esc(f) + '"' + (CFG.font === f ? ' class="on"' : '') + ' style="font-family:' + (f ? "'" + f + "'" : "'gg sans'") + '">' + (f || 'Padrão do Discord') + '</button>'; }).join('') + '</div>';
    h += '<h4>Detalhes</h4>' + toggle('anim', 'Animações', 'Mensagens, menus e listas se movendo') + toggle('chatbar', 'Barra de mensagem solta', 'A caixa de digitar fica separada do chat') + toggle('small', 'Painel de usuário compacto', 'Seu perfil lá embaixo ocupa menos espaço');
    var bd = PANEL.querySelector('.bd'), st = bd.scrollTop; bd.innerHTML = h; bd.scrollTop = st;
    PANEL.querySelector('[data-a="update"]').hidden = !INFO.update;
  }
  function set(k, v, repaint) { CFG[k] = v; save(); applyTheme(); if (repaint) paintPanel(); }
  function onPanelClick(e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'close') togglePanel(false);
    else if (b.dataset.a === 'reset') { Object.keys(DEF).forEach(function (k) { CFG[k] = DEF[k]; }); delete CFG.wall; save(); applyTheme(); paintPanel(); toast('Aparência padrão de volta'); }
    else if (b.dataset.a === 'update') { if (window.ccUpdate) window.ccUpdate(); }
    else if (b.dataset.a === 'wallpick') pickWall();
    else if (b.dataset.p) { CFG.accent = ''; set('preset', b.dataset.p, true); }
    else if (b.dataset.c != null && b.classList.contains('sw')) set('accent', b.dataset.c, true);
    else if (b.dataset.m) { set('mat', b.dataset.m, true); if (b.dataset.m === 'wall' && !CFG.wall) pickWall(); }
    else if (b.dataset.f != null) set('font', b.dataset.f, true);
    else if (b.dataset.t) set(b.dataset.t, !CFG[b.dataset.t], true);
  }
  function onPanelInput(e) {
    var t = e.target;
    if (t.dataset.k) {
      var min = +t.min, max = +t.max, v = +t.value; t.style.setProperty('--p', ((v - min) / (max - min)) * 100 + '%');
      var o = t.nextElementSibling; if (o) o.textContent = (t.dataset.k === 'op' || t.dataset.k === 'orbs' ? FMT.pct : FMT.px)(v);
      CFG[t.dataset.k] = v; save(); applyTheme();
    } else if (t.dataset.ci) { CFG.accent = t.value; save(); applyTheme(); }
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

  /* ---------- começo ---------- */
  style('base', CC.css.base || ''); style('ours', CC.css.ours || ''); applyTheme();
  loadFonts();
  var pend = false;
  var mo = new MutationObserver(function () {
    if (pend) return; pend = true;
    (document.hidden ? setTimeout : requestAnimationFrame)(function () { pend = false; place(); if (document.body) { aura(); mountWin(); } }, 200);
  });
  mo.observe(document, { childList: true, subtree: true });
  function ready() {
    aura(); mountWin(); applyTheme(); fallbackSheets(); badge();
    new MutationObserver(badge).observe(document.querySelector('title') || document.head, { childList: true, subtree: true, characterData: true });
    if (window.ccInfo) window.ccInfo().then(function (i) { if (i) { INFO.ver = i.ver; INFO.mats = i.mats || INFO.mats; INFO.update = i.update; if (!INFO.mats[CFG.mat]) { CFG.mat = 'aura'; save(); } applyTheme(); if (PANEL && PANEL.classList.contains('on')) paintPanel(); } }).catch(function () {});
    win('state');
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

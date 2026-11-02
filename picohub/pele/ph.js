// Pico Hub: base comum da pele (vale para todo site que o Hub abre).
// Config, temas, materiais (aura e vidro "assados" num canvas: bonito sem gastar o processador), fontes, a folha do Hub,
// a ponte com o app, mídia na tela de bloqueio, o truque da tela apagada e o modo bolso.
// O app coloca antes deste arquivo: window.__PH = { ver, pele, cfg, fonte: { nome, dados: { peso: base64 } }, css: { ph, site } }
// O YouTube exige Trusted Types: nada de innerHTML aqui, tudo é montado com createElement.
(function () {
  'use strict';
  var D = document;
  var CFG = {};

  /* ---------- o site não pode saber que o app foi para o fundo (senão pausa o vídeo) ----------
     Vale em todo quadro, inclusive no player do miniplayer (que é um quadro de www.youtube.com). */
  var fundo = false;
  if (!window.__phVis) {
    window.__phVis = true;
    var quadro = window.top !== window;
    var fingir = function () { return quadro || CFG.fundo !== false; };
    var trocar = function (nome, valor) {
      var d = Object.getOwnPropertyDescriptor(Document.prototype, nome);
      if (!d || !d.get) return;
      var orig = d.get;
      try { Object.defineProperty(Document.prototype, nome, { configurable: true, enumerable: d.enumerable, get: function () { return fingir() ? valor : orig.call(this); } }); } catch (e) {}
    };
    trocar('hidden', false); trocar('visibilityState', 'visible');
    trocar('webkitHidden', false); trocar('webkitVisibilityState', 'visible');
    var segura = function (e) { if (fingir()) e.stopImmediatePropagation(); };
    window.addEventListener('visibilitychange', segura, true);
    window.addEventListener('webkitvisibilitychange', segura, true);
    window.addEventListener('blur', function (e) { if ((quadro || (fundo && CFG.fundo !== false)) && e.target === window) e.stopImmediatePropagation(); }, true);
    var hf = Document.prototype.hasFocus;
    Document.prototype.hasFocus = function () { return (quadro || (fundo && CFG.fundo !== false)) ? true : hf.call(this); };
  }
  if (window.top !== window || window.__phOn) return;
  window.__phOn = true;
  var PH = window.__PH || { ver: '0', pele: 0, cfg: {}, fonte: null, css: {} };
  var R = D.documentElement; // pode não existir ainda: quandoRaiz() acerta

  /* ---------- ponte com o app ---------- */
  function app(o) { try { if (window.PHN) window.PHN.postMessage(JSON.stringify(o)); } catch (e) {} }

  /* ---------- temas, destaques, fontes, materiais ---------- */
  var TEMAS = {
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
  var DESTAQUES = ['#3ee6c4', '#4fd8ff', '#4a7bff', '#9b6bff', '#c3a6ff', '#ff9ecf', '#ff5c7a', '#ffb347', '#ffd36b', '#a6e36b', '#e6e6f0'];
  var FONTES = ['Bricolage Grotesque', 'Onest', 'Space Grotesk', 'Sora', 'Manrope', 'DM Sans', 'Urbanist', 'Figtree', 'Outfit', 'Nunito', 'Plus Jakarta Sans', 'Lexend', 'Sistema'];
  var MATERIAIS = [['aura', 'Aura', 'Bolhas de cor no escuro'], ['acrilico', 'Acrílico', 'Vidro fosco com granulado'], ['mica', 'Mica', 'Cor do tema bem suave'],
    ['gradiente', 'Gradiente', 'Duas cores do tema em diagonal'], ['solido', 'Sólido', 'Cor lisa, o mais leve'], ['imagem', 'Imagem', 'Uma foto sua no fundo']];
  var PAINEIS = [['vidro', 'Vidro'], ['neon', 'Neon'], ['flutuante', 'Flutuante'], ['plano', 'Plano']];
  var CANTOS = [['suave', 'Suave', 12], ['redondo', 'Redondo', 20], ['bolha', 'Bem redondo', 28]];
  var LEGENDAS = [['acrilico', 'Acrílico'], ['tema', 'Do tema'], ['escuro', 'Escuro'], ['contorno', 'Só contorno']];
  var TAMS = [['p', 'P', 0.85], ['m', 'M', 1], ['g', 'G', 1.2], ['gg', 'GG', 1.45]];

  /* ---------- config: fica no próprio site e também no app ---------- */
  var DEF = {
    tema: 'fofito', destaque: '', material: 'aura', painel: 'vidro', cantos: 'redondo', opPainel: 0.8, aura: 0.75, imgEscuro: 0.45,
    graf: 'leve', bolhas: false, anim: true, fonte: 'Bricolage Grotesque', legEstilo: 'acrilico', legTam: 'm',
    fundo: true, pipAuto: true, pipFecha: true, miniAuto: true, previa: true, v: 2
  };
  var LS = null; try { LS = window.localStorage; } catch (e) {}
  try { CFG = JSON.parse((LS && LS.getItem('picohub.cfg')) || 'null') || {}; } catch (e) { CFG = {}; }
  var cfgApp = PH.cfg || {};
  Object.keys(DEF).forEach(function (k) {
    if (CFG[k] === undefined && cfgApp[k] !== undefined) CFG[k] = cfgApp[k];
    if (CFG[k] === undefined) CFG[k] = DEF[k];
  });
  if ((CFG.v || 0) < 2) CFG.v = 2;
  if (!TEMAS[CFG.tema]) CFG.tema = DEF.tema;
  var salvarT = 0;
  function salvar() {
    try { LS && LS.setItem('picohub.cfg', JSON.stringify(CFG)); } catch (e) {}
    clearTimeout(salvarT); salvarT = setTimeout(function () { app({ t: 'cfg', cfg: CFG }); }, 250);
  }

  /* ---------- botões da tela de bloqueio: guardo os do site (próximo, anterior) ---------- */
  var ACOES = {};
  try {
    var ms = navigator.mediaSession;
    if (ms && ms.setActionHandler) {
      var sah = ms.setActionHandler.bind(ms);
      ms.setActionHandler = function (a, f) { ACOES[a] = f; try { return sah(a, f); } catch (e) {} };
    }
  } catch (e) {}

  /* ---------- toque: o YouTube engole o "click" em muita coisa, então decido pelo pointer ---------- */
  function toque(el, fn) {
    var x0 = 0, y0 = 0, t0 = 0, feito = 0, id = null;
    el.addEventListener('pointerdown', function (e) { if (e.button > 0) return; id = e.pointerId; x0 = e.clientX; y0 = e.clientY; t0 = Date.now(); el.classList.add('ph-aperto'); }, true);
    var solta = function () { el.classList.remove('ph-aperto'); };
    el.addEventListener('pointercancel', function () { id = null; solta(); }, true);
    el.addEventListener('pointerleave', solta, true);
    el.addEventListener('pointerup', function (e) {
      solta();
      if (id !== e.pointerId) return; id = null;
      if (Math.abs(e.clientX - x0) > 12 || Math.abs(e.clientY - y0) > 12 || Date.now() - t0 > 900) return;
      feito = Date.now(); e.preventDefault(); e.stopPropagation(); fn(e);
    }, true);
    el.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); if (Date.now() - feito > 500) fn(e); }, true);
    ['touchstart', 'touchend', 'mousedown', 'mouseup'].forEach(function (t) { el.addEventListener(t, function (e) { e.stopPropagation(); }, false); });
    return el;
  }

  /* ---------- montar elementos sem innerHTML ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function h(tag, at) {
    var el = D.createElement(tag);
    if (at) Object.keys(at).forEach(function (k) {
      var v = at[k];
      if (v == null || v === false) return;
      if (k === 'texto') el.textContent = v;
      else if (k === 'onclick') toque(el, v);
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c) el.appendChild(typeof c === 'string' ? D.createTextNode(c) : c); }
    return el;
  }
  // ícones desenhados por nós (24x24, traço arredondado)
  var ICONES = {
    x: ['M6 6l12 12', 'M18 6L6 18'],
    pip: ['M3.5 6.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z', 'M12.5 12.5h5v4h-5z'],
    vel: ['M5 17a8 8 0 1 1 14 0', 'M12 13l4-4'],
    bolso: ['M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z', 'M10 17.5h4', 'M9 8.5c1.6 1.6 4.4 1.6 6 0'],
    conta: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4.5 20c1.3-3.6 4.2-5.5 7.5-5.5s6.2 1.9 7.5 5.5'],
    seta: ['M12 4v12', 'M7 11l5 5 5-5', 'M5 20h14'],
    giro: ['M19 12a7 7 0 1 1-2.1-5', 'M19 4v4h-4'],
    baixo: ['M6 9l6 6 6-6'],
    play: ['M8 5.8v12.4a1 1 0 0 0 1.5.9l10-6.2a1 1 0 0 0 0-1.8l-10-6.2A1 1 0 0 0 8 5.8z'],
    pausa: ['M8 5v14', 'M16 5v14'],
    imagem: ['M4 6.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z', 'M4.5 16l4.5-4.5 4 4 2.5-2.5 4 4', 'M15.5 9.5h.01'],
    lupa: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', 'M20 20l-4-4'],
    check: ['M5 12.5l4.5 4.5L19 7.5']
  };
  function icone(n, tam) {
    var s = D.createElementNS(SVGNS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', tam || 22); s.setAttribute('height', tam || 22);
    s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'ph-ic ph-ic-' + n);
    (ICONES[n] || []).forEach(function (d) { var p = D.createElementNS(SVGNS, 'path'); p.setAttribute('d', d); s.appendChild(p); });
    return s;
  }
  // a marca do Pico Hub: o pico com a neve, no gradiente do tema
  var nMarca = 0;
  function marca(tam) {
    var s = D.createElementNS(SVGNS, 'svg');
    s.setAttribute('viewBox', '0 0 32 32'); s.setAttribute('width', tam); s.setAttribute('height', tam); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'ph-marca');
    var defs = D.createElementNS(SVGNS, 'defs'), g = D.createElementNS(SVGNS, 'linearGradient'), gid = 'phg' + (++nMarca);
    g.setAttribute('id', gid); g.setAttribute('x1', '0'); g.setAttribute('y1', '0'); g.setAttribute('x2', '1'); g.setAttribute('y2', '1');
    [['0', 'var(--ph-a1)'], ['1', 'var(--ph-a2)']].forEach(function (p) { var st = D.createElementNS(SVGNS, 'stop'); st.setAttribute('offset', p[0]); st.setAttribute('style', 'stop-color:' + p[1]); g.appendChild(st); });
    defs.appendChild(g); s.appendChild(defs);
    var m = D.createElementNS(SVGNS, 'path'); m.setAttribute('d', 'M3 26 L13 9 L17.5 16 L20 12.5 L29 26 Z'); m.setAttribute('fill', 'url(#' + gid + ')'); s.appendChild(m);
    var n = D.createElementNS(SVGNS, 'path'); n.setAttribute('d', 'M13 9 L16 14 L14.3 13.2 L12.6 15 L10.6 13.4 Z'); n.setAttribute('fill', '#fff'); s.appendChild(n);
    return s;
  }

  /* ---------- estilos ---------- */
  var estilos = {};
  function quandoRaiz(fn) {
    if (D.documentElement) { R = D.documentElement; return fn(); }
    var mo = new MutationObserver(function () { if (D.documentElement) { mo.disconnect(); R = D.documentElement; fn(); } });
    mo.observe(D, { childList: true });
  }
  function quandoCorpo(fn) {
    if (D.body) return fn();
    var mo = new MutationObserver(function () { if (D.body) { mo.disconnect(); fn(); } });
    mo.observe(D.documentElement || D, { childList: true, subtree: true });
  }
  function estilo(id, css) {
    var el = estilos[id];
    if (!el) { el = D.createElement('style'); el.id = id; estilos[id] = el; }
    el.textContent = css || '';
    if (!el.isConnected) (D.head || D.documentElement).appendChild(el);
  }
  function conferirEstilos() { Object.keys(estilos).forEach(function (k) { if (!estilos[k].isConnected) (D.head || D.documentElement).appendChild(estilos[k]); }); }

  /* ---------- fontes: a escolhida entra também no lugar das fontes do site (Roboto e YouTube Sans),
     assim tudo muda sem regra pesando em cada elemento ---------- */
  var faces = [];
  var NOMES_SITE = ['Pico UI', 'Roboto', 'YouTube Sans', 'Roboto Medium', 'YouTube Sans Medium'];
  function aplicarFonte(nome, dados) {
    try {
      faces.forEach(function (f) { try { D.fonts.delete(f); } catch (e) {} }); faces = [];
      R.classList.toggle('ph-fonte-sistema', !dados);
      if (!dados || !window.FontFace || !D.fonts) return;
      Object.keys(dados).forEach(function (peso) {
        var b = atob(dados[peso]), buf = new Uint8Array(b.length);
        for (var i = 0; i < b.length; i++) buf[i] = b.charCodeAt(i);
        NOMES_SITE.forEach(function (fam) {
          var f = new FontFace(fam, buf.buffer.slice(0), { weight: fam.indexOf('Medium') > 0 ? 'normal' : peso, style: 'normal', display: 'swap' });
          if (fam.indexOf('Medium') > 0 && peso !== '500') return;
          D.fonts.add(f); faces.push(f);
        });
      });
    } catch (e) {}
  }
  // o app manda a fonte pedida
  window.__phFonte = function (nome, dados) { if (nome === CFG.fonte) aplicarFonte(nome, nome === 'Sistema' ? null : dados); };
  function pedirFonte() { if (CFG.fonte === 'Sistema') aplicarFonte('Sistema', null); else app({ t: 'fonte', nome: CFG.fonte }); }

  /* ---------- tema e material aplicados ---------- */
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }
  function tema() { return TEMAS[CFG.tema] || TEMAS.fofito; }
  function opc(lista, k, def) { for (var i = 0; i < lista.length; i++) if (lista[i][0] === k) return lista[i]; return def || lista[0]; }
  function aplicarTema() {
    var t = tema(), st = R.style, a1 = CFG.destaque || t.a1;
    st.setProperty('--ph-a1', a1); st.setProperty('--ph-a2', CFG.destaque ? t.a1 : t.a2); st.setProperty('--ph-a3', t.a3);
    st.setProperty('--ph-a1r', rgb(a1)); st.setProperty('--ph-a2r', rgb(CFG.destaque ? t.a1 : t.a2)); st.setProperty('--ph-a3r', rgb(t.a3));
    st.setProperty('--ph-o1', t.o[0]); st.setProperty('--ph-o2', t.o[1]); st.setProperty('--ph-o3', t.o[2]);
    st.setProperty('--ph-w', t.w); st.setProperty('--ph-wr', rgb(t.w));
    st.setProperty('--ph-bg0', t.bg[0]); st.setProperty('--ph-bg1', t.bg[1]); st.setProperty('--ph-bg0r', rgb(t.bg[0]));
    st.setProperty('--ph-raio', opc(CANTOS, CFG.cantos)[2] + 'px');
    st.setProperty('--ph-op', String(CFG.opPainel));
    st.setProperty('--ph-leg-zoom', String(opc(TAMS, CFG.legTam, TAMS[1])[2]));
    var cl = R.classList;
    MATERIAIS.forEach(function (m) { cl.toggle('ph-mat-' + m[0], CFG.material === m[0]); });
    PAINEIS.forEach(function (p) { cl.toggle('ph-pn-' + p[0], CFG.painel === p[0]); });
    LEGENDAS.forEach(function (l) { cl.toggle('ph-leg-' + l[0], CFG.legEstilo === l[0]); });
    cl.toggle('ph-bonito', CFG.graf === 'bonito'); cl.toggle('ph-leve', CFG.graf !== 'bonito');
    cl.toggle('ph-bolhas', CFG.graf === 'bonito' && !!CFG.bolhas);
    cl.toggle('ph-sem-anim', !CFG.anim);
    app({ t: 'tema', bg: t.bg[0] });
    assar();
  }

  /* ---------- aura assada: desenhada uma vez num canvas pequeno (o navegador estica, e degradê esticado fica liso)
     e uma cópia borrada (desenhada minúscula e esticada) para os vidros. Nada de filtro ao vivo. ---------- */
  var urls = [], assarT = 0, imgUsuario = null;
  function carregarImgUsuario(fn) {
    if (imgUsuario !== null) return fn(imgUsuario);
    var d = null; try { d = LS && LS.getItem('picohub.img'); } catch (e) {}
    if (!d) { imgUsuario = false; return fn(false); }
    var im = new Image(); im.onload = function () { imgUsuario = im; fn(im); }; im.onerror = function () { imgUsuario = false; fn(false); }; im.src = d;
  }
  function assar() { clearTimeout(assarT); assarT = setTimeout(assarAgora, 60); }
  function assarAgora() {
    if (!D.body) return;
    var t = tema(), mat = CFG.material, W = Math.max(90, Math.round(innerWidth / 4)), H = Math.max(160, Math.round(innerHeight / 4));
    var desenhar = function (img) {
      var c = D.createElement('canvas'); c.width = W; c.height = H;
      var x = c.getContext('2d');
      var g = x.createLinearGradient(0, 0, W * 0.4, H); g.addColorStop(0, t.bg[0]); g.addColorStop(1, t.bg[1]); x.fillStyle = g; x.fillRect(0, 0, W, H);
      var f = +CFG.aura;
      var bolha = function (cx, cy, r, cor, a) { var rg = x.createRadialGradient(cx, cy, 0, cx, cy, r); rg.addColorStop(0, cor); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.globalAlpha = Math.max(0, Math.min(1, a)); x.fillStyle = rg; x.fillRect(0, 0, W, H); x.globalAlpha = 1; };
      var ac = CFG.destaque || t.a1;
      if (mat === 'imagem' && img) {
        var k = Math.max(W / img.width, H / img.height), iw = img.width * k, ih = img.height * k;
        x.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
        x.fillStyle = 'rgba(' + rgb(t.bg[0]) + ',' + CFG.imgEscuro + ')'; x.fillRect(0, 0, W, H);
      } else if (mat === 'gradiente') {
        var g2 = x.createLinearGradient(0, 0, W, H); g2.addColorStop(0, t.o[0]); g2.addColorStop(0.55, t.o[1]); g2.addColorStop(1, t.o[2]);
        x.globalAlpha = 0.35 + f * 0.65; x.fillStyle = g2; x.fillRect(0, 0, W, H); x.globalAlpha = 1;
        bolha(W * 0.1, 0, W * 0.9, ac, 0.18 * f);
      } else if (mat === 'mica') {
        x.fillStyle = t.w; x.globalAlpha = 0.85; x.fillRect(0, 0, W, H); x.globalAlpha = 1;
        bolha(W * 0.2, H * 0.05, W * 1.2, t.o[1], 0.5 * f); bolha(W * 0.9, H * 0.7, W * 1.1, t.o[2], 0.35 * f);
      } else if (mat !== 'solido') {
        if (!(CFG.graf === 'bonito' && CFG.bolhas)) {
          bolha(W * 0.05, -H * 0.05, W * 1.1, t.o[0], 0.95 * f); bolha(W * 1.05, H * 0.18, W * 1.05, t.o[1], 0.9 * f); bolha(W * 0.4, H * 1.08, W * 1.2, t.o[2], 0.95 * f);
          bolha(W * 0.15, H * 0.02, W * 0.7, ac, 0.16 * f); bolha(W * 0.95, H * 0.35, W * 0.6, t.a2, 0.12 * f);
        } else {
          bolha(W * 0.4, H * 1.08, W * 1.2, t.o[2], 0.6 * f);
        }
      }
      // cópia borrada para o vidro: desenha minúscula e estica
      var p = D.createElement('canvas'); p.width = Math.max(8, Math.round(W / 10)); p.height = Math.max(14, Math.round(H / 10));
      var px = p.getContext('2d'); px.imageSmoothingQuality = 'high'; px.drawImage(c, 0, 0, p.width, p.height);
      var b = D.createElement('canvas'); b.width = W; b.height = H;
      var bx = b.getContext('2d'); bx.imageSmoothingQuality = 'high'; bx.drawImage(p, 0, 0, W, H);
      var feitos = 0, novas = [];
      var pronto = function () {
        if (++feitos < 2) return;
        var st = R.style, velhas = urls; urls = novas;
        st.setProperty('--ph-aura-img', 'url("' + novas[0] + '")');
        st.setProperty('--ph-vidro-img', 'url("' + novas[1] + '")');
        setTimeout(function () { velhas.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} }); }, 1500);
      };
      [c, b].forEach(function (cv, i) {
        cv.toBlob(function (bl) { novas[i] = bl ? URL.createObjectURL(bl) : cv.toDataURL(); pronto(); }, 'image/webp', 0.9);
      });
    };
    if (mat === 'imagem') carregarImgUsuario(desenhar); else desenhar(null);
  }
  var tamAntes = '';
  addEventListener('resize', function () { var k = Math.round(innerWidth / 40) + 'x' + Math.round(innerHeight / 40); if (k !== tamAntes) { tamAntes = k; assar(); } });

  function aura() {
    if (D.getElementById('ph-aura')) return;
    D.body.insertBefore(h('div', { id: 'ph-aura', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')), D.body.firstChild);
  }

  /* ---------- avisos curtos ---------- */
  var avisoT = 0;
  function aviso(txt, acao) {
    var el = D.getElementById('ph-aviso');
    if (!el) { el = h('div', { id: 'ph-aviso', role: 'status' }); D.body.appendChild(el); }
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(h('span', { texto: txt }));
    if (acao) el.appendChild(h('button', { type: 'button', texto: acao.nome, onclick: function () { esconderAviso(); acao.fn(); } }));
    el.classList.toggle('ph-com-acao', !!acao);
    el.classList.add('on');
    clearTimeout(avisoT);
    avisoT = setTimeout(esconderAviso, acao ? 7000 : 2600);
  }
  function esconderAviso() { var el = D.getElementById('ph-aviso'); if (el) el.classList.remove('on'); }

  /* ---------- o vídeo da página e o que vai para a tela de bloqueio ---------- */
  var SITE = { titulo: null, capa: null, rota: null, midia: null, ignorarVideo: null, fundo: null, pip: null };
  function video() {
    var vs = D.querySelectorAll('video'), melhor = null, area = -1;
    for (var i = 0; i < vs.length; i++) {
      var v = vs[i];
      if (!v.currentSrc && !v.src) continue;
      if (SITE.ignorarVideo && SITE.ignorarVideo(v)) continue;
      var r = v.getBoundingClientRect(), a = Math.max(1, r.width * r.height) + (v.paused ? 0 : 1e7);
      if (a > area) { area = a; melhor = v; }
    }
    return melhor;
  }
  var ultimoEnvio = '', ultimaPausaNossa = 0, tentativas = [];
  function estado() {
    if (SITE.midia) { var m = SITE.midia.estado(); if (m) return m; }
    var v = video();
    if (!v) return { t: 'midia', on: false };
    var md = null; try { md = navigator.mediaSession && navigator.mediaSession.metadata; } catch (e) {}
    var titulo = (md && md.title) || (SITE.titulo && SITE.titulo()) || D.title.replace(/\s*-\s*YouTube\s*$/, '');
    var capa = '';
    if (md && md.artwork && md.artwork.length) capa = md.artwork[md.artwork.length - 1].src;
    if (!capa && SITE.capa) capa = SITE.capa();
    return {
      t: 'midia', on: true, tocando: !v.paused && !v.ended, titulo: titulo || 'Vídeo', canal: (md && md.artist) || '', capa: capa,
      dur: isFinite(v.duration) ? v.duration : 0, pos: v.currentTime || 0, vel: v.playbackRate || 1,
      w: v.videoWidth || 16, h: v.videoHeight || 9, prox: !!ACOES.nexttrack
    };
  }
  function enviarEstado(forcar) {
    var e = estado();
    var sig = JSON.stringify([e.on, e.tocando, e.titulo, e.canal, e.capa, Math.round(e.dur || 0), e.vel, e.w, e.h, e.prox]);
    if (!forcar && sig === ultimoEnvio) return;
    ultimoEnvio = sig;
    app(e);
    if (R) R.classList.toggle('ph-com-video', !!e.on);
  }
  ['play', 'pause', 'ended', 'ratechange', 'loadedmetadata', 'durationchange', 'emptied', 'seeked'].forEach(function (t) {
    D.addEventListener(t, function (ev) { if (ev.target && ev.target.tagName === 'VIDEO') enviarEstado(t === 'seeked' || t === 'play'); }, true);
  });
  // no fundo, se o vídeo parar sozinho (sem ninguém mandar), ele volta a tocar
  function insistir() {
    var agora = Date.now(); tentativas = tentativas.filter(function (x) { return agora - x < 15000; });
    if (tentativas.length >= 4) return false; // não fica brigando com o site
    tentativas.push(agora); return true;
  }
  D.addEventListener('pause', function (ev) {
    var v = ev.target;
    if (!v || v.tagName !== 'VIDEO' || !fundo || CFG.fundo === false || v.ended) return;
    if (Date.now() - ultimaPausaNossa < 2000 || (SITE.ignorarVideo && SITE.ignorarVideo(v)) || !insistir()) return;
    setTimeout(function () { if (fundo && v.paused && !v.ended) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }, 250);
  }, true);

  // comandos que vêm do app (notificação, tela de bloqueio, fone, PiP)
  window.__phCmd = function (c, arg) {
    if (c === 'pause') ultimaPausaNossa = Date.now();
    if (SITE.midia && SITE.midia.cmd(c, arg)) { setTimeout(function () { enviarEstado(true); }, 150); return true; }
    var v = video(); if (!v) return false;
    switch (c) {
      case 'play': { var p = v.play(); if (p && p.catch) p.catch(function () {}); break; }
      case 'pause': v.pause(); break;
      case 'toggle': if (v.paused) window.__phCmd('play'); else window.__phCmd('pause'); break;
      case 'ff': v.currentTime = Math.min((v.duration || 1e9) - 0.5, v.currentTime + 10); break;
      case 'rw': v.currentTime = Math.max(0, v.currentTime - 10); break;
      case 'seek': v.currentTime = Math.max(0, +arg || 0); break;
      case 'next': if (ACOES.nexttrack) try { ACOES.nexttrack({ action: 'nexttrack' }); } catch (e) {} break;
      case 'prev': if (ACOES.previoustrack && v.currentTime < 4) { try { ACOES.previoustrack({ action: 'previoustrack' }); } catch (e) {} } else v.currentTime = 0; break;
    }
    setTimeout(function () { enviarEstado(true); }, 120);
    return true;
  };
  window.__phEstado = function () { return JSON.stringify(estado()); };
  window.__phFundo = function (f) {
    fundo = !!f; if (R) R.classList.toggle('ph-no-fundo', fundo);
    if (!f) tentativas = [];
    if (SITE.fundo) try { SITE.fundo(fundo); } catch (e) {}
  };
  // PiP: o vídeo ocupa a janelinha toda; os pais dele perdem o que prenderia o "fixed"
  window.__phPip = function (on) {
    R.classList.toggle('ph-pip', !!on);
    D.querySelectorAll('[data-ph-pipv]').forEach(function (x) { x.removeAttribute('data-ph-pipv'); });
    D.querySelectorAll('.ph-pip-pai').forEach(function (x) { x.classList.remove('ph-pip-pai'); });
    if (SITE.pip) try { SITE.pip(!!on); } catch (e) {}
    if (!on) return;
    fecharFolha(); esconderAviso();
    if (SITE.midia && SITE.midia.estado()) return; // o miniplayer cuida
    var v = video(); if (!v) return;
    v.setAttribute('data-ph-pipv', '');
    for (var p = v.parentElement; p && p !== D.body; p = p.parentElement) p.classList.add('ph-pip-pai');
  };
  window.__phAviso = function (t) { aviso(String(t || '')); };
  window.__phReskin = function (phcss, sitecss) { estilo('ph-base', phcss); estilo('ph-site', sitecss); };

  /* ---------- modo bolso ---------- */
  function bolso(on) {
    var el = D.getElementById('ph-bolso');
    if (on) {
      if (!el) {
        var ult = 0;
        el = h('div', { id: 'ph-bolso' }, h('div', { 'class': 'ph-bolso-dica' }, marca(36), h('b', { texto: 'Modo bolso' }), h('span', { texto: 'Toque duas vezes para voltar' })));
        el.addEventListener('pointerup', function () { var n = Date.now(); if (n - ult < 450) bolso(false); ult = n; });
        D.body.appendChild(el);
      }
      requestAnimationFrame(function () { el.classList.add('on'); });
      fecharFolha();
    } else if (el) { el.classList.remove('on'); setTimeout(function () { if (el.parentNode && !el.classList.contains('on')) el.remove(); }, 400); }
    app({ t: 'bolso', on: !!on });
  }

  /* ---------- peças da folha ---------- */
  function chave(rotulo, dica, k, depois) {
    var sw = h('span', { 'class': 'ph-chave', 'aria-hidden': 'true' }, h('i'));
    var linha = h('div', { 'class': 'ph-linha', role: 'switch', tabindex: '0', 'aria-checked': String(!!CFG[k]) },
      h('span', { 'class': 'ph-linha-txt' }, h('b', { texto: rotulo }), dica ? h('small', { texto: dica }) : null), sw);
    toque(linha, function () { CFG[k] = !CFG[k]; linha.setAttribute('aria-checked', String(!!CFG[k])); salvar(); if (depois) depois(); });
    return linha;
  }
  function seg(lista, k, depois, classe) {
    var g = h('div', { 'class': 'ph-seg ' + (classe || ''), role: 'radiogroup' });
    lista.forEach(function (p) {
      g.appendChild(h('button', { type: 'button', role: 'radio', 'aria-checked': String(CFG[k] === p[0]), 'data-v': p[0], texto: p[1], onclick: function () {
        CFG[k] = p[0]; salvar();
        g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', String(x.getAttribute('data-v') === CFG[k])); });
        if (depois) depois();
      } }));
    });
    return g;
  }
  function deslizar(rotulo, k, min, max, passo, fmt, depois) {
    var val = h('span', { 'class': 'ph-desl-val', texto: fmt(CFG[k]) });
    var inp = h('input', { type: 'range', min: min, max: max, step: passo, value: CFG[k], 'aria-label': rotulo });
    var mexer = function () { CFG[k] = +inp.value; val.textContent = fmt(CFG[k]); inp.style.setProperty('--p', ((CFG[k] - min) / (max - min) * 100) + '%'); };
    inp.addEventListener('input', function () { mexer(); if (depois) depois(true); });
    inp.addEventListener('change', function () { mexer(); salvar(); if (depois) depois(false); });
    ['touchstart', 'touchmove', 'touchend'].forEach(function (t) { inp.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true }); });
    mexer();
    return h('div', { 'class': 'ph-desl' }, h('div', { 'class': 'ph-desl-cab' }, h('b', { texto: rotulo }), val), inp);
  }
  function rotulo(t) { return h('h3', { texto: t }); }
  var pct = function (v) { return Math.round(v * 100) + '%'; };

  /* ---------- a folha do Hub, em abas ---------- */
  var ATU = { pronto: 0, msg: '' };
  var ABAS = [['tema', 'Tema'], ['visual', 'Visual'], ['texto', 'Texto'], ['video', 'Vídeo'], ['app', 'App']];
  var abaAtual = 'tema';
  function abaTema() {
    var temas = h('div', { 'class': 'ph-temas', role: 'radiogroup', 'aria-label': 'Tema' });
    Object.keys(TEMAS).forEach(function (id) {
      var t = TEMAS[id];
      temas.appendChild(h('button', { type: 'button', role: 'radio', 'class': 'ph-tema', 'aria-checked': String(CFG.tema === id), 'data-tema': id, onclick: function () {
        CFG.tema = id; salvar(); aplicarTema();
        temas.querySelectorAll('.ph-tema').forEach(function (x) { x.setAttribute('aria-checked', String(x.getAttribute('data-tema') === id)); });
      } }, h('i', { style: 'background:radial-gradient(circle at 28% 28%,' + t.a1 + ',transparent 62%),radial-gradient(circle at 78% 72%,' + t.a3 + ',transparent 60%),linear-gradient(140deg,' + t.o[1] + ',' + t.bg[0] + ')' }), h('span', { texto: t.n })));
    });
    var dest = h('div', { 'class': 'ph-cores', role: 'radiogroup', 'aria-label': 'Cor de destaque' });
    [''].concat(DESTAQUES).forEach(function (c) {
      dest.appendChild(h('button', { type: 'button', role: 'radio', 'class': 'ph-cor' + (c ? '' : ' ph-cor-auto'), 'aria-label': c || 'Do tema', 'aria-checked': String(CFG.destaque === c), 'data-c': c, style: c ? 'background:' + c : null, onclick: function () {
        CFG.destaque = c; salvar(); aplicarTema();
        dest.querySelectorAll('.ph-cor').forEach(function (x) { x.setAttribute('aria-checked', String(x.getAttribute('data-c') === c)); });
      } }, c ? null : h('span', { texto: 'Auto' })));
    });
    return [rotulo('Tema'), temas, rotulo('Cor de destaque'), dest];
  }
  function abaVisual() {
    var mats = h('div', { 'class': 'ph-mats', role: 'radiogroup', 'aria-label': 'Material' });
    var extraImg = h('div', { 'class': 'ph-img-extra' });
    var mostrarExtra = function () { extraImg.hidden = CFG.material !== 'imagem'; };
    MATERIAIS.forEach(function (m) {
      mats.appendChild(h('button', { type: 'button', role: 'radio', 'class': 'ph-mat', 'data-m': m[0], 'aria-checked': String(CFG.material === m[0]), onclick: function () {
        CFG.material = m[0]; salvar(); aplicarTema(); mostrarExtra();
        mats.querySelectorAll('.ph-mat').forEach(function (x) { x.setAttribute('aria-checked', String(x.getAttribute('data-m') === m[0])); });
        if (m[0] === 'imagem' && !imgUsuario) escolherImagem();
      } }, h('i', { 'class': 'ph-mat-amostra ph-amostra-' + m[0] }), h('b', { texto: m[1] }), h('small', { texto: m[2] })));
    });
    extraImg.appendChild(h('button', { type: 'button', 'class': 'ph-botao', onclick: escolherImagem }, icone('imagem', 20), h('span', { texto: 'Escolher imagem' })));
    extraImg.appendChild(deslizar('Escurecer a imagem', 'imgEscuro', 0, 0.85, 0.05, pct, function (vivo) { if (!vivo) assar(); }));
    mostrarExtra();
    return [
      rotulo('Material do fundo'), mats, extraImg,
      h('div', { 'class': 'ph-cartao ph-pad' }, deslizar('Força das cores', 'aura', 0, 1, 0.05, pct, function (vivo) { if (!vivo) assar(); })),
      rotulo('Painéis'),
      h('div', { 'class': 'ph-cartao' },
        h('div', { 'class': 'ph-linha ph-linha-col' }, h('span', { 'class': 'ph-linha-txt' }, h('b', { texto: 'Estilo dos painéis' })), seg(PAINEIS, 'painel', aplicarTema, 'ph-seg-largo')),
        h('div', { 'class': 'ph-linha ph-linha-col' }, h('span', { 'class': 'ph-linha-txt' }, h('b', { texto: 'Cantos' })), seg(CANTOS, 'cantos', aplicarTema, 'ph-seg-largo')),
        h('div', { 'class': 'ph-linha ph-linha-col' }, deslizar('Opacidade dos painéis', 'opPainel', 0.3, 1, 0.05, pct, function () { R.style.setProperty('--ph-op', String(CFG.opPainel)); }))),
      rotulo('Desempenho'),
      h('div', { 'class': 'ph-cartao' },
        h('div', { 'class': 'ph-linha' }, h('span', { 'class': 'ph-linha-txt' }, h('b', { texto: 'Gráficos' }), h('small', { texto: 'Bonito põe vidro de verdade nos menus e deixa as bolhas se mexerem. Os dois são leves.' })), seg([['leve', 'Leve'], ['bonito', 'Bonito']], 'graf', aplicarTema)),
        chave('Bolhas se mexendo', 'Só no Bonito. Para sozinho com o app no fundo.', 'bolhas', aplicarTema),
        chave('Animações', 'Molas nos toques e trocas de tela que sobem', 'anim', aplicarTema))
    ];
  }
  function abaTexto() {
    var lista = h('div', { 'class': 'ph-fontes', role: 'radiogroup', 'aria-label': 'Fonte' });
    FONTES.forEach(function (f) {
      lista.appendChild(h('button', { type: 'button', role: 'radio', 'class': 'ph-fonte', 'data-f': f, 'aria-checked': String(CFG.fonte === f), onclick: function () {
        CFG.fonte = f; salvar(); pedirFonte();
        lista.querySelectorAll('.ph-fonte').forEach(function (x) { x.setAttribute('aria-checked', String(x.getAttribute('data-f') === f)); });
      } }, h('span', { texto: f === 'Sistema' ? 'Fonte do celular' : f }), icone('check', 18)));
    });
    var amostra = h('div', { 'class': 'ph-leg-amostra' }, h('span', { 'class': 'ph-leg-txt', texto: 'Assim fica a legenda do vídeo' }));
    return [
      rotulo('Fonte de tudo'), lista,
      rotulo('Legendas'),
      h('div', { 'class': 'ph-cartao' },
        amostra,
        h('div', { 'class': 'ph-linha ph-linha-col' }, h('span', { 'class': 'ph-linha-txt' }, h('b', { texto: 'Fundo' })), seg(LEGENDAS, 'legEstilo', aplicarTema, 'ph-seg-largo')),
        h('div', { 'class': 'ph-linha ph-linha-col' }, h('span', { 'class': 'ph-linha-txt' }, h('b', { texto: 'Tamanho' })), seg(TAMS, 'legTam', aplicarTema, 'ph-seg-largo')))
    ];
  }
  function abaVideo() {
    return [
      rotulo('Tocando'),
      h('div', { 'class': 'ph-cartao' },
        chave('Tocar com o app fechado', 'Continua com a tela apagada, com os controles na tela de bloqueio', 'fundo'),
        chave('Voltar leva o vídeo pro cantinho', 'Puxar o vídeo para baixo faz o mesmo', 'miniAuto'),
        chave('Prévia na home', 'O vídeo mais visível há 2 segundos começa a tocar sem som', 'previa'),
        chave('Picture in picture ao sair', 'Saiu do app com vídeo tocando, ele vira uma janelinha', 'pipAuto'),
        chave('Fechar a janelinha pausa', 'Quando você fecha o PiP, o vídeo para', 'pipFecha')),
      h('div', { 'class': 'ph-botoes' },
        h('button', { type: 'button', 'class': 'ph-botao', onclick: function () { fecharFolha(); app({ t: 'pip' }); } }, icone('pip', 20), h('span', { texto: 'Janelinha agora' })),
        h('button', { type: 'button', 'class': 'ph-botao', onclick: function () { bolso(true); } }, icone('bolso', 20), h('span', { texto: 'Modo bolso' })))
    ];
  }
  var atuMsg = null, atuBtn = null;
  function abaApp() {
    atuMsg = h('small', { 'class': 'ph-atu-msg' });
    atuBtn = h('button', { type: 'button', 'class': 'ph-botao', onclick: function () {
      if (ATU.pronto) app({ t: 'instalar' }); else { atuMsg.textContent = 'Procurando…'; app({ t: 'verificar' }); }
    } }, icone('giro', 20), h('span', { texto: 'Procurar atualização' }));
    pintarAtu();
    return [
      rotulo('Conta'),
      h('div', { 'class': 'ph-botoes' }, h('button', { type: 'button', 'class': 'ph-botao', onclick: function () {
        fecharFolha(); location.href = 'https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=' + encodeURIComponent('https://m.youtube.com/signin?action_handle_signin=true&next=%2F');
      } }, icone('conta', 20), h('span', { texto: 'Entrar na conta do Google' }))),
      rotulo('Atualização'),
      h('div', { 'class': 'ph-cartao ph-atu' }, atuMsg, atuBtn),
      h('p', { 'class': 'ph-rodape', texto: 'Pico Hub ' + (PH.ver || '?') + ' · pele ' + (PH.pele || 0) })
    ];
  }
  function pintarAtu() {
    if (!atuBtn) return;
    atuMsg.textContent = ATU.msg || (ATU.pronto ? 'Versão nova baixada.' : 'O app e a pele se atualizam sozinhos.');
    atuBtn.lastChild.textContent = ATU.pronto ? 'Atualizar agora' : 'Procurar atualização';
    atuBtn.classList.toggle('ph-destaque', !!ATU.pronto);
    atuBtn.replaceChild(icone(ATU.pronto ? 'seta' : 'giro', 20), atuBtn.firstChild);
  }
  var MONTAR = { tema: abaTema, visual: abaVisual, texto: abaTexto, video: abaVideo, app: abaApp };
  function mostrarAba(folha, id) {
    abaAtual = id;
    folha.querySelectorAll('.ph-aba').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-a') === id)); });
    var corpo = folha.querySelector('.ph-rola'), nova = h('div', { 'class': 'ph-pagina' });
    MONTAR[id]().forEach(function (el) { nova.appendChild(el); });
    while (corpo.firstChild) corpo.removeChild(corpo.firstChild);
    corpo.appendChild(nova); corpo.scrollTop = 0;
    var ativa = folha.querySelector('.ph-aba[aria-selected="true"]');
    if (ativa && ativa.scrollIntoView) try { ativa.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); } catch (e) {}
  }
  function montarFolha() {
    var abas = h('div', { 'class': 'ph-abas', role: 'tablist' });
    var folha = h('section', { id: 'ph-folha', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Pico Hub' },
      h('div', { 'class': 'ph-pega', 'aria-hidden': 'true' }),
      h('header', { 'class': 'ph-cab' }, marca(34), h('div', { 'class': 'ph-cab-txt' }, h('b', { texto: 'Pico Hub' }), h('small', { texto: 'Do seu jeito' })),
        h('button', { type: 'button', 'class': 'ph-redondo', 'aria-label': 'Fechar', onclick: fecharFolha }, icone('x', 22))),
      abas, h('div', { 'class': 'ph-rola' }));
    ABAS.forEach(function (a) { abas.appendChild(h('button', { type: 'button', role: 'tab', 'class': 'ph-aba', 'data-a': a[0], texto: a[1], onclick: function () { mostrarAba(folha, a[0]); } })); });
    ['touchstart', 'touchend', 'touchmove'].forEach(function (t) { folha.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true }); });
    // arrastar para baixo fecha
    var y0 = null, dy = 0;
    [folha.querySelector('.ph-cab'), folha.querySelector('.ph-pega')].forEach(function (el) {
      el.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; y0 = e.clientY; dy = 0; folha.classList.add('ph-arrasta'); try { el.setPointerCapture(e.pointerId); } catch (x) {} });
      el.addEventListener('pointermove', function (e) { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); folha.style.setProperty('--ph-dy', dy + 'px'); });
      var fim = function () { if (y0 == null) return; y0 = null; folha.classList.remove('ph-arrasta'); folha.style.removeProperty('--ph-dy'); if (dy > 90) fecharFolha(); };
      el.addEventListener('pointerup', fim); el.addEventListener('pointercancel', fim);
    });
    return folha;
  }
  function abrirFolha(aba) {
    var veu = D.getElementById('ph-veu');
    if (!veu) { veu = h('div', { id: 'ph-veu' }); toque(veu, fecharFolha); D.body.appendChild(veu); }
    var f = D.getElementById('ph-folha');
    if (!f) { f = montarFolha(); D.body.appendChild(f); }
    mostrarAba(f, aba || abaAtual);
    esconderAviso();
    R.classList.add('ph-folha-aberta');
    requestAnimationFrame(function () { requestAnimationFrame(function () { veu.classList.add('on'); f.classList.add('on'); }); });
  }
  function fecharFolha() {
    var f = D.getElementById('ph-folha'), v = D.getElementById('ph-veu');
    if (R) R.classList.remove('ph-folha-aberta');
    if (f) f.classList.remove('on');
    if (v) v.classList.remove('on');
  }
  window.__phAtualizacao = function (o) {
    o = o || {};
    if (o.pronto) ATU.pronto = o.pronto;
    ATU.msg = o.msg || '';
    pintarAtu();
    if (o.pronto && !o.calado) aviso('Versão nova do Pico Hub pronta', { nome: 'Atualizar', fn: function () { app({ t: 'instalar' }); } });
    else if (o.msg && o.avisar) aviso(o.msg);
  };

  /* ---------- imagem de fundo escolhida pela pessoa (fica guardada, já reduzida) ---------- */
  function escolherImagem() {
    var inp = h('input', { type: 'file', accept: 'image/*', style: 'position:fixed;left:-99px;opacity:0' });
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0]; inp.remove(); if (!f) return;
      var url = URL.createObjectURL(f), im = new Image();
      im.onload = function () {
        var k = Math.min(1, 900 / Math.max(im.width, im.height)), c = D.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        var d = c.toDataURL('image/webp', 0.82);
        try { LS && LS.setItem('picohub.img', d); } catch (e) { aviso('A imagem é grande demais. Tente outra.'); return; }
        imgUsuario = null; CFG.material = 'imagem'; salvar(); aplicarTema();
        aviso('Imagem no fundo');
      };
      im.onerror = function () { aviso('Não consegui abrir essa imagem'); };
      im.src = url;
    });
    D.body.appendChild(inp); inp.click();
  }

  /* ---------- botão do Hub ---------- */
  function botaoHub() {
    return h('button', { type: 'button', id: 'ph-hub', 'aria-label': 'Abrir o Pico Hub', onclick: function () { abrirFolha(); } }, marca(26));
  }

  /* ---------- voltar: o app pergunta aqui antes de voltar a página ---------- */
  var voltas = [];
  window.__phVoltar = function () {
    if (D.getElementById('ph-bolso')) { bolso(false); return true; }
    if (R.classList.contains('ph-folha-aberta')) { fecharFolha(); return true; }
    for (var i = 0; i < voltas.length; i++) { try { if (voltas[i]()) return true; } catch (e) {} }
    return false;
  };

  /* ---------- relógio leve (nada de observar a página inteira) ---------- */
  var ticks = [], url = '', nTick = 0;
  function tick() {
    if (fundo) return;
    nTick++;
    conferirEstilos();
    if (D.body && !D.getElementById('ph-aura')) aura();
    if (location.href !== url) {
      var antes = url; url = location.href;
      if (SITE.rota) try { SITE.rota(url, antes); } catch (e) {}
      if (antes && CFG.anim) { R.classList.remove('ph-entra'); void R.offsetWidth; R.classList.add('ph-entra'); setTimeout(function () { R.classList.remove('ph-entra'); }, 700); }
      setTimeout(function () { enviarEstado(true); }, 600);
    }
    for (var i = 0; i < ticks.length; i++) { try { ticks[i](nTick); } catch (e) {} }
  }

  /* ---------- começar ---------- */
  quandoRaiz(function () {
    R.classList.add('ph');
    estilo('ph-base', (PH.css && PH.css.ph) || '');
    estilo('ph-site', (PH.css && PH.css.site) || '');
    aplicarTema();
    if (PH.fonte && PH.fonte.nome === CFG.fonte) aplicarFonte(CFG.fonte, PH.fonte.dados); else pedirFonte();
  });
  quandoCorpo(function () { aura(); assar(); tick(); setInterval(tick, 600); });
  app({ t: 'oi', pele: PH.pele, cfg: CFG });

  window.PicoHub = {
    h: h, toque: toque, icone: icone, marca: marca, botaoHub: botaoHub, aviso: aviso, abrirFolha: abrirFolha, fecharFolha: fecharFolha,
    bolso: bolso, app: app, cfg: CFG, salvar: salvar, site: SITE, tick: function (f) { ticks.push(f); }, voltar: function (f) { voltas.push(f); },
    video: video, estado: estado, enviar: enviarEstado, temas: TEMAS, tema: tema, emFundo: function () { return fundo; },
    pausaNossa: function () { ultimaPausaNossa = Date.now(); }, insistir: insistir, quandoRaiz: quandoRaiz, quandoCorpo: quandoCorpo
  };
})();

// Pico Hub: base comum da pele (vale para todo site que o Hub abre).
// Config e temas, aura, fontes, a folha do Hub, a ponte com o app, mídia na tela de bloqueio e o truque da tela apagada.
// O app coloca antes deste arquivo: window.__PH = { ver, pele, cfg, fontes: { peso: base64 }, css: { ph, site } }
// O YouTube exige Trusted Types: nada de innerHTML aqui, tudo é montado com createElement.
(function () {
  'use strict';
  if (window.top !== window || window.__phOn) return;
  window.__phOn = true;
  var PH = window.__PH || { ver: '0', pele: 0, cfg: {}, fontes: {}, css: {} };
  var D = document, R = D.documentElement; // R pode não existir ainda: quandoRaiz() acerta

  /* ---------- ponte com o app (só existe dentro do Pico Hub) ---------- */
  function app(o) { try { if (window.PHN) window.PHN.postMessage(JSON.stringify(o)); } catch (e) {} }
  var noApp = function () { return !!window.PHN; };

  /* ---------- temas (os mesmos do FofitoZap e do Concord) ---------- */
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

  /* ---------- config: o que a pessoa escolheu fica no próprio site e também no app ---------- */
  var DEF = { tema: 'fofito', graf: 'leve', fundo: true, pipAuto: true, pipFecha: true };
  var LS = null; try { LS = window.localStorage; } catch (e) {}
  var CFG = {};
  try { CFG = JSON.parse((LS && LS.getItem('picohub.cfg')) || 'null') || {}; } catch (e) { CFG = {}; }
  var cfgApp = PH.cfg || {};
  Object.keys(DEF).forEach(function (k) {
    if (cfgApp[k] !== undefined && (CFG[k] === undefined || PH.cfgNovo)) CFG[k] = cfgApp[k];
    if (CFG[k] === undefined) CFG[k] = DEF[k];
  });
  if (!TEMAS[CFG.tema]) CFG.tema = DEF.tema;
  function salvar() {
    try { LS && LS.setItem('picohub.cfg', JSON.stringify(CFG)); } catch (e) {}
    app({ t: 'cfg', cfg: CFG });
  }

  /* ---------- o site não pode saber que o app foi para o fundo (senão pausa o vídeo) ---------- */
  var fundo = false;
  (function () {
    function trocar(nome, valor) {
      var d = Object.getOwnPropertyDescriptor(Document.prototype, nome);
      if (!d || !d.get) return;
      var orig = d.get;
      try { Object.defineProperty(Document.prototype, nome, { configurable: true, enumerable: d.enumerable, get: function () { return CFG.fundo ? valor : orig.call(this); } }); } catch (e) {}
    }
    trocar('hidden', false); trocar('visibilityState', 'visible');
    trocar('webkitHidden', false); trocar('webkitVisibilityState', 'visible');
    var segura = function (e) { if (CFG.fundo) e.stopImmediatePropagation(); };
    window.addEventListener('visibilitychange', segura, true);
    window.addEventListener('webkitvisibilitychange', segura, true);
    window.addEventListener('blur', function (e) { if (fundo && CFG.fundo && e.target === window) e.stopImmediatePropagation(); }, true);
    var hf = Document.prototype.hasFocus;
    Document.prototype.hasFocus = function () { return (fundo && CFG.fundo) ? true : hf.call(this); };
  })();

  /* ---------- botões da tela de bloqueio: guardo os do site (próximo, anterior) ---------- */
  var ACOES = {};
  try {
    var ms = navigator.mediaSession;
    if (ms && ms.setActionHandler) {
      var sah = ms.setActionHandler.bind(ms);
      ms.setActionHandler = function (a, h) { ACOES[a] = h; try { return sah(a, h); } catch (e) {} };
    }
  } catch (e) {}

  /* ---------- montar elementos sem innerHTML ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function h(tag, at) {
    var el = D.createElement(tag);
    if (at) Object.keys(at).forEach(function (k) {
      var v = at[k];
      if (v == null || v === false) return;
      if (k === 'texto') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c) el.appendChild(typeof c === 'string' ? D.createTextNode(c) : c); }
    return el;
  }
  // ícones desenhados por nós: lista de caminhos em 24x24, traço arredondado
  var ICONES = {
    x: ['M6 6l12 12', 'M18 6L6 18'],
    pip: ['M3.5 6.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z', 'M12.5 12.5h5v4h-5z'],
    vel: ['M5 17a8 8 0 1 1 14 0', 'M12 13l4-4'],
    bolso: ['M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z', 'M10 17.5h4', 'M9 8.5c1.6 1.6 4.4 1.6 6 0'],
    conta: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4.5 20c1.3-3.6 4.2-5.5 7.5-5.5s6.2 1.9 7.5 5.5'],
    seta: ['M12 4v12', 'M7 11l5 5 5-5', 'M5 20h14'],
    giro: ['M19 12a7 7 0 1 1-2.1-5', 'M19 4v4h-4']
  };
  function icone(n, tam) {
    var s = D.createElementNS(SVGNS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', tam || 22); s.setAttribute('height', tam || 22);
    s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'ph-ic');
    (ICONES[n] || []).forEach(function (d) { var p = D.createElementNS(SVGNS, 'path'); p.setAttribute('d', d); s.appendChild(p); });
    return s;
  }
  // a marca do Pico Hub: o pico com a neve, no gradiente do tema
  function marca(tam) {
    var s = D.createElementNS(SVGNS, 'svg');
    s.setAttribute('viewBox', '0 0 32 32'); s.setAttribute('width', tam); s.setAttribute('height', tam); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'ph-marca');
    var defs = D.createElementNS(SVGNS, 'defs'), g = D.createElementNS(SVGNS, 'linearGradient');
    var gid = 'phg' + Math.random().toString(36).slice(2, 7);
    g.setAttribute('id', gid); g.setAttribute('x1', '0'); g.setAttribute('y1', '0'); g.setAttribute('x2', '1'); g.setAttribute('y2', '1');
    [['0', 'var(--ph-a1)'], ['1', 'var(--ph-a2)']].forEach(function (p) { var st = D.createElementNS(SVGNS, 'stop'); st.setAttribute('offset', p[0]); st.setAttribute('style', 'stop-color:' + p[1]); g.appendChild(st); });
    defs.appendChild(g); s.appendChild(defs);
    var m = D.createElementNS(SVGNS, 'path'); m.setAttribute('d', 'M3 26 L13 9 L17.5 16 L20 12.5 L29 26 Z'); m.setAttribute('fill', 'url(#' + gid + ')'); s.appendChild(m);
    var n = D.createElementNS(SVGNS, 'path'); n.setAttribute('d', 'M13 9 L16 14 L14.3 13.2 L12.6 15 L10.6 13.4 Z'); n.setAttribute('fill', '#fff'); s.appendChild(n);
    return s;
  }

  /* ---------- estilos e fontes ---------- */
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
  // se alguém tirar os estilos da página, voltam
  function conferirEstilos() { Object.keys(estilos).forEach(function (k) { if (!estilos[k].isConnected) (D.head || D.documentElement).appendChild(estilos[k]); }); }
  function fontes() {
    try {
      if (!window.FontFace || !D.fonts) return;
      Object.keys(PH.fontes || {}).forEach(function (peso) {
        var b = atob(PH.fontes[peso]), buf = new Uint8Array(b.length);
        for (var i = 0; i < b.length; i++) buf[i] = b.charCodeAt(i);
        var f = new FontFace('Pico Bricolage', buf.buffer, { weight: peso, style: 'normal', display: 'swap' });
        D.fonts.add(f);
      });
    } catch (e) {}
  }

  /* ---------- tema aplicado ---------- */
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }
  function aplicarTema() {
    var t = TEMAS[CFG.tema] || TEMAS.fofito, st = R.style;
    st.setProperty('--ph-a1', t.a1); st.setProperty('--ph-a2', t.a2); st.setProperty('--ph-a3', t.a3);
    st.setProperty('--ph-a1r', rgb(t.a1)); st.setProperty('--ph-a2r', rgb(t.a2)); st.setProperty('--ph-a3r', rgb(t.a3));
    st.setProperty('--ph-o1', t.o[0]); st.setProperty('--ph-o2', t.o[1]); st.setProperty('--ph-o3', t.o[2]);
    st.setProperty('--ph-w', t.w); st.setProperty('--ph-wr', rgb(t.w));
    st.setProperty('--ph-bg0', t.bg[0]); st.setProperty('--ph-bg1', t.bg[1]);
    R.classList.toggle('ph-bonito', CFG.graf === 'bonito');
    R.classList.toggle('ph-leve', CFG.graf !== 'bonito');
    app({ t: 'tema', bg: t.bg[0] });
  }

  /* ---------- aura: o fundo com as bolhas de cor ---------- */
  function aura() {
    if (D.getElementById('ph-aura')) return;
    var a = h('div', { id: 'ph-aura', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'));
    D.body.insertBefore(a, D.body.firstChild);
  }

  /* ---------- avisos curtos ---------- */
  var avisoT = 0;
  function aviso(txt, acao) {
    var el = D.getElementById('ph-aviso');
    if (!el) { el = h('div', { id: 'ph-aviso', role: 'status' }); D.body.appendChild(el); }
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(h('span', { texto: txt }));
    if (acao) el.appendChild(h('button', { type: 'button', texto: acao.nome, onclick: function () { esconderAviso(); acao.fn(); } }));
    el.classList.add('on');
    clearTimeout(avisoT);
    avisoT = setTimeout(esconderAviso, acao ? 7000 : 2600);
  }
  function esconderAviso() { var el = D.getElementById('ph-aviso'); if (el) el.classList.remove('on'); }

  /* ---------- o vídeo da página e o que vai para a tela de bloqueio ---------- */
  function video() {
    var vs = D.querySelectorAll('video'), melhor = null, area = 0;
    for (var i = 0; i < vs.length; i++) {
      var v = vs[i]; if (!v.src && !v.currentSrc) continue;
      var r = v.getBoundingClientRect(), a = Math.max(1, r.width * r.height) + (v.paused ? 0 : 1e7);
      if (a > area) { area = a; melhor = v; }
    }
    return melhor;
  }
  var SITE = { titulo: null, capa: null, rota: null }; // cada site pode completar
  var ultimoEnvio = '', ultimaPausaNossa = 0, tentativas = [];
  function estado() {
    var v = video();
    if (!v) return { t: 'midia', on: false };
    var md = null; try { md = navigator.mediaSession && navigator.mediaSession.metadata; } catch (e) {}
    var titulo = (md && md.title) || (SITE.titulo && SITE.titulo()) || D.title.replace(/\s*-\s*YouTube\s*$/, '');
    var canal = (md && md.artist) || '';
    var capa = '';
    if (md && md.artwork && md.artwork.length) capa = md.artwork[md.artwork.length - 1].src;
    if (!capa && SITE.capa) capa = SITE.capa();
    return {
      t: 'midia', on: true, tocando: !v.paused && !v.ended, titulo: titulo || 'Vídeo', canal: canal, capa: capa,
      dur: isFinite(v.duration) ? v.duration : 0, pos: v.currentTime || 0, vel: v.playbackRate || 1,
      w: v.videoWidth || 16, h: v.videoHeight || 9, prox: !!ACOES.nexttrack, ant: !!ACOES.previoustrack
    };
  }
  function enviarEstado(forcar) {
    var e = estado();
    var sig = JSON.stringify([e.on, e.tocando, e.titulo, e.canal, e.capa, Math.round(e.dur), e.vel, e.w, e.h, e.prox]);
    if (!forcar && sig === ultimoEnvio) return;
    ultimoEnvio = sig;
    app(e);
    R.classList.toggle('ph-com-video', !!e.on);
  }
  ['play', 'playing', 'pause', 'ended', 'ratechange', 'loadedmetadata', 'durationchange', 'emptied'].forEach(function (t) {
    D.addEventListener(t, function (ev) { if (ev.target && ev.target.tagName === 'VIDEO') enviarEstado(t === 'seeked' || t === 'play'); }, true);
  });
  D.addEventListener('seeked', function (ev) { if (ev.target && ev.target.tagName === 'VIDEO') enviarEstado(true); }, true);
  // no fundo, se o vídeo parar sozinho (sem ninguém mandar), ele volta a tocar
  D.addEventListener('pause', function (ev) {
    var v = ev.target;
    if (!v || v.tagName !== 'VIDEO' || !fundo || !CFG.fundo || v.ended) return;
    if (Date.now() - ultimaPausaNossa < 2000) return;
    var agora = Date.now(); tentativas = tentativas.filter(function (x) { return agora - x < 15000; });
    if (tentativas.length >= 4) return; // não fica brigando com o site
    tentativas.push(agora);
    setTimeout(function () { if (fundo && v.paused && !v.ended) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }, 250);
  }, true);

  // comandos que vêm do app (notificação, tela de bloqueio, fone, PiP)
  window.__phCmd = function (c, arg) {
    var v = video(); if (!v) return false;
    switch (c) {
      case 'play': { var p = v.play(); if (p && p.catch) p.catch(function () {}); break; }
      case 'pause': ultimaPausaNossa = Date.now(); v.pause(); break;
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
  window.__phFundo = function (f) { fundo = !!f; R.classList.toggle('ph-no-fundo', fundo); if (!f) tentativas = []; };
  // PiP: o vídeo ocupa a janelinha toda; os pais dele perdem o que prenderia o "fixed"
  window.__phPip = function (on) {
    R.classList.toggle('ph-pip', !!on);
    D.querySelectorAll('[data-ph-pipv]').forEach(function (x) { x.removeAttribute('data-ph-pipv'); });
    D.querySelectorAll('.ph-pip-pai').forEach(function (x) { x.classList.remove('ph-pip-pai'); });
    if (!on) return;
    fecharFolha(); esconderAviso();
    var v = video(); if (!v) return;
    v.setAttribute('data-ph-pipv', '');
    for (var p = v.parentElement; p && p !== D.body; p = p.parentElement) p.classList.add('ph-pip-pai');
  };
  window.__phAviso = function (t) { aviso(String(t || '')); };
  window.__phReskin = function (phcss, sitecss) { estilo('ph-base', phcss); estilo('ph-site', sitecss); };

  /* ---------- modo bolso: tela preta, brilho lá embaixo, toque duplo destrava ---------- */
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

  /* ---------- a folha do Hub (temas, vídeo, visual, atualização) ---------- */
  var ATU = { pronto: 0, msg: '' };
  function linhaChave(rotulo, dica, k, depois) {
    var inp = h('input', { type: 'checkbox', role: 'switch' });
    inp.checked = !!CFG[k];
    inp.addEventListener('change', function () { CFG[k] = inp.checked; salvar(); if (depois) depois(); });
    return h('label', { 'class': 'ph-linha' }, h('span', { 'class': 'ph-linha-txt' }, h('b', { texto: rotulo }), dica ? h('small', { texto: dica }) : null), h('span', { 'class': 'ph-chave' }, inp, h('i')));
  }
  function montarFolha() {
    var temas = h('div', { 'class': 'ph-temas', role: 'radiogroup', 'aria-label': 'Tema' });
    Object.keys(TEMAS).forEach(function (id) {
      var t = TEMAS[id];
      var b = h('button', { type: 'button', role: 'radio', 'class': 'ph-tema', 'aria-checked': String(CFG.tema === id), 'data-tema': id, onclick: function () {
        CFG.tema = id; salvar(); aplicarTema();
        temas.querySelectorAll('.ph-tema').forEach(function (x) { x.setAttribute('aria-checked', String(x.getAttribute('data-tema') === id)); });
      } }, h('i', { style: 'background:radial-gradient(circle at 30% 30%,' + t.a1 + ',transparent 62%),radial-gradient(circle at 75% 70%,' + t.a3 + ',transparent 60%),linear-gradient(140deg,' + t.o[1] + ',' + t.bg[0] + ')' }), h('span', { texto: t.n }));
      temas.appendChild(b);
    });
    var graf = h('div', { 'class': 'ph-seg', role: 'radiogroup', 'aria-label': 'Gráficos' });
    [['leve', 'Leve'], ['bonito', 'Bonito']].forEach(function (p) {
      graf.appendChild(h('button', { type: 'button', role: 'radio', 'aria-checked': String(CFG.graf === p[0]), 'data-v': p[0], texto: p[1], onclick: function () {
        CFG.graf = p[0]; salvar(); aplicarTema();
        graf.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', String(x.getAttribute('data-v') === CFG.graf)); });
      } }));
    });
    var atuMsg = h('small', { 'class': 'ph-atu-msg', texto: '' });
    var atuBtn = h('button', { type: 'button', 'class': 'ph-botao', onclick: function () {
      if (ATU.pronto) app({ t: 'instalar' }); else { atuMsg.textContent = 'Procurando…'; app({ t: 'verificar' }); }
    } }, icone('giro', 20), h('span', { texto: 'Procurar atualização' }));
    var acoesVideo = h('div', { 'class': 'ph-botoes' },
      h('button', { type: 'button', 'class': 'ph-botao', onclick: function () { fecharFolha(); app({ t: 'pip' }); } }, icone('pip', 20), h('span', { texto: 'Picture in picture agora' })),
      h('button', { type: 'button', 'class': 'ph-botao', onclick: function () { bolso(true); } }, icone('bolso', 20), h('span', { texto: 'Modo bolso' })));

    var folha = h('section', { id: 'ph-folha', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Pico Hub' },
      h('div', { 'class': 'ph-pega', 'aria-hidden': 'true' }),
      h('header', { 'class': 'ph-cab' }, marca(34), h('div', { 'class': 'ph-cab-txt' }, h('b', { texto: 'Pico Hub' }), h('small', { texto: 'Versão ' + (PH.ver || '?') + ' · pele ' + (PH.pele || 0) })),
        h('button', { type: 'button', 'class': 'ph-redondo', 'aria-label': 'Fechar', onclick: fecharFolha }, icone('x', 22))),
      h('div', { 'class': 'ph-rola' },
        h('h3', { texto: 'Tema' }), temas,
        h('h3', { texto: 'Vídeo' }),
        h('div', { 'class': 'ph-cartao' },
          linhaChave('Tocar com o app fechado', 'Continua tocando com a tela apagada, com os controles na tela de bloqueio', 'fundo'),
          linhaChave('Picture in picture ao sair', 'Saiu do app com vídeo tocando, ele vira uma janelinha', 'pipAuto', function () { app({ t: 'cfg', cfg: CFG }); }),
          linhaChave('Fechar a janelinha pausa', 'Quando você fecha o PiP, o vídeo para', 'pipFecha')),
        acoesVideo,
        h('h3', { texto: 'Visual' }),
        h('div', { 'class': 'ph-cartao' }, h('div', { 'class': 'ph-linha' }, h('span', { 'class': 'ph-linha-txt' }, h('b', { texto: 'Gráficos' }), h('small', { texto: 'Leve gasta menos bateria. Bonito tem vidro e bolhas se mexendo.' })), graf)),
        h('h3', { texto: 'Conta' }),
        h('div', { 'class': 'ph-botoes' }, h('button', { type: 'button', 'class': 'ph-botao', onclick: function () {
          fecharFolha(); location.href = 'https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=' + encodeURIComponent('https://m.youtube.com/signin?action_handle_signin=true&next=%2F');
        } }, icone('conta', 20), h('span', { texto: 'Entrar na conta do Google' }))),
        h('h3', { texto: 'Atualização' }),
        h('div', { 'class': 'ph-cartao ph-atu' }, atuMsg, atuBtn)
      )
    );
    folha.__atu = function () {
      atuMsg.textContent = ATU.msg || (ATU.pronto ? '' : 'O app e a pele se atualizam sozinhos.');
      atuBtn.lastChild.textContent = ATU.pronto ? 'Atualizar agora' : 'Procurar atualização';
      atuBtn.classList.toggle('ph-destaque', !!ATU.pronto);
      atuBtn.replaceChild(icone(ATU.pronto ? 'seta' : 'giro', 20), atuBtn.firstChild);
    };
    // arrastar para baixo fecha
    var y0 = null, dy = 0;
    var cab = folha.querySelector('.ph-cab'), pega = folha.querySelector('.ph-pega');
    [cab, pega].forEach(function (el) {
      el.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; y0 = e.clientY; dy = 0; folha.classList.add('ph-arrasta'); try { el.setPointerCapture(e.pointerId); } catch (x) {} });
      el.addEventListener('pointermove', function (e) { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); folha.style.transform = 'translateY(' + dy + 'px)'; });
      var fim = function () { if (y0 == null) return; y0 = null; folha.classList.remove('ph-arrasta'); folha.style.transform = ''; if (dy > 90) fecharFolha(); };
      el.addEventListener('pointerup', fim); el.addEventListener('pointercancel', fim);
    });
    return folha;
  }
  function abrirFolha() {
    var vel = D.getElementById('ph-veu');
    if (!vel) { vel = h('div', { id: 'ph-veu', onclick: fecharFolha }); D.body.appendChild(vel); }
    var f = D.getElementById('ph-folha');
    if (!f) { f = montarFolha(); D.body.appendChild(f); }
    f.__atu();
    esconderAviso();
    R.classList.add('ph-folha-aberta');
    requestAnimationFrame(function () { vel.classList.add('on'); f.classList.add('on'); });
  }
  function fecharFolha() {
    var f = D.getElementById('ph-folha'), v = D.getElementById('ph-veu');
    R.classList.remove('ph-folha-aberta');
    if (f) f.classList.remove('on');
    if (v) v.classList.remove('on');
  }
  window.__phAtualizacao = function (o) {
    o = o || {};
    if (o.pronto) ATU.pronto = o.pronto;
    ATU.msg = o.msg || '';
    var f = D.getElementById('ph-folha'); if (f && f.__atu) f.__atu();
    if (o.pronto && !o.calado) aviso('Versão nova do Pico Hub pronta', { nome: 'Atualizar', fn: function () { app({ t: 'instalar' }); } });
    else if (o.msg && o.avisar) aviso(o.msg);
  };

  /* ---------- botão do Hub (cada site diz onde ele fica; senão flutua) ---------- */
  function botaoHub() {
    return h('button', { type: 'button', id: 'ph-hub', 'aria-label': 'Abrir o Pico Hub', onclick: function (e) { e.preventDefault(); e.stopPropagation(); abrirFolha(); } }, marca(26));
  }

  /* ---------- voltar: o app pergunta aqui antes de voltar a página ---------- */
  var voltas = [];
  window.__phVoltar = function () {
    if (D.getElementById('ph-bolso')) { bolso(false); return true; }
    if (R.classList.contains('ph-folha-aberta')) { fecharFolha(); return true; }
    for (var i = 0; i < voltas.length; i++) { try { if (voltas[i]()) return true; } catch (e) {} }
    return false;
  };

  /* ---------- relógio leve: confere as coisas a cada 700 ms (nada de observar a página inteira) ---------- */
  var ticks = [], url = '';
  function tick() {
    if (fundo) return; // no fundo não precisa
    conferirEstilos();
    if (D.body && !D.getElementById('ph-aura')) aura();
    if (location.href !== url) { url = location.href; if (SITE.rota) try { SITE.rota(url); } catch (e) {} setTimeout(function () { enviarEstado(true); }, 600); }
    for (var i = 0; i < ticks.length; i++) { try { ticks[i](); } catch (e) {} }
  }

  /* ---------- começar ---------- */
  quandoRaiz(function () {
    R = D.documentElement;
    R.classList.add('ph');
    estilo('ph-base', (PH.css && PH.css.ph) || '');
    estilo('ph-site', (PH.css && PH.css.site) || '');
    aplicarTema();
    fontes();
  });
  quandoCorpo(function () { aura(); tick(); setInterval(tick, 700); });
  app({ t: 'oi', pele: PH.pele, cfg: CFG });

  // o que os sites usam
  window.PicoHub = {
    h: h, icone: icone, marca: marca, botaoHub: botaoHub, aviso: aviso, abrirFolha: abrirFolha, fecharFolha: fecharFolha,
    bolso: bolso, app: app, noApp: noApp, cfg: CFG, salvar: salvar, site: SITE, tick: function (f) { ticks.push(f); }, voltar: function (f) { voltas.push(f); },
    video: video, estado: estado, temas: TEMAS, emFundo: function () { return fundo; }, quandoRaiz: quandoRaiz, quandoCorpo: quandoCorpo
  };
})();

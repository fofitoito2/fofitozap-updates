// Pele do YouTube no celular (m.youtube.com), por cima do ph.js.
// Título da página no topo, destaque na home, fileira embaixo do player, miniplayer (puxar o vídeo para baixo ou voltar),
// título na tela cheia, menus do YouTube no nosso estilo, busca limpa e o voltar que não fecha vídeo sem querer.
// Tudo protegido: se o YouTube mudar algo, a parte que falhou some e o site continua funcionando.
(function () {
  'use strict';
  var P = window.PicoHub;
  if (!P || window.top !== window || window.__phYt) return;
  if (!/(^|\.)youtube\.com$/.test(location.hostname)) return;
  window.__phYt = true;
  var D = document, R = D.documentElement, h = P.h;
  var celular = location.hostname === 'm.youtube.com';
  P.quandoRaiz(function () {
    R = D.documentElement;
    R.classList.add('ph-yt');
    if (!celular) R.classList.add('ph-yt-pc');
  });

  function idVideo(u) {
    try {
      u = new URL(u || location.href);
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      var m = u.pathname.match(/^\/(?:shorts|live)\/([\w-]{6,})/); return m ? m[1] : '';
    } catch (e) { return ''; }
  }
  function ehVideo(u) { try { return /^\/(watch|live)/.test(new URL(u || location.href).pathname); } catch (e) { return false; } }
  function ehShorts() { return /^\/shorts/.test(location.pathname); }
  function metadados() { try { return navigator.mediaSession && navigator.mediaSession.metadata; } catch (e) { return null; } }
  function tituloVideo() {
    var md = metadados(); if (md && md.title) return md.title;
    var t = D.querySelector('.slim-video-information-title, .slim-video-metadata-header h2, ytm-slim-video-information-renderer h2');
    return t ? t.textContent.replace(/\s+/g, ' ').trim() : D.title.replace(/\s*-\s*YouTube\s*$/, '');
  }
  function canalVideo() {
    var md = metadados(); if (md && md.artist) return md.artist;
    var c = D.querySelector('ytm-slim-owner-renderer .slim-owner-channel-name, .slim-owner-channel-name, ytm-slim-owner-renderer h3');
    return c ? c.textContent.replace(/\s+/g, ' ').trim() : '';
  }
  P.site.capa = function () { var id = idVideo(); return id ? 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg' : ''; };
  P.site.titulo = tituloVideo;
  // vídeos que tocam sozinhos na home (prévia muda) não contam como "o vídeo"
  P.site.ignorarVideo = function (v) { return !ehVideo() && !ehShorts() && v.muted; };

  function escuro() { R = D.documentElement; if (!R.hasAttribute('dark')) R.setAttribute('dark', 'true'); }

  /* ---------- título da página no lugar da logo, e o botão do Hub ---------- */
  function nomePagina() {
    var p = location.pathname;
    if (p === '/' || p === '') return 'Início';
    if (/^\/shorts/.test(p)) return 'Shorts';
    if (/^\/feed\/subscriptions/.test(p)) return 'Inscrições';
    if (/^\/feed\/(you|library)/.test(p)) return 'Você';
    if (/^\/feed\/history/.test(p)) return 'Histórico';
    if (/^\/feed\/trending|^\/feed\/explore/.test(p)) return 'Explorar';
    if (/^\/results/.test(p)) return 'Busca';
    if (/^\/playlist/.test(p)) return 'Playlist';
    if (/^\/(watch|live)/.test(p)) return 'Assistindo';
    if (/^\/(@|channel|c\/|user)/.test(p)) return 'Canal';
    return 'YouTube';
  }
  var botao = null, titulo = null, semBarraDesde = 0;
  function colocarTopo() {
    if (!botao) botao = P.botaoHub();
    var barra = D.querySelector('.mobile-topbar-header-content, ytm-mobile-topbar-renderer header > div, #masthead #end');
    if (barra && barra.offsetParent !== null) {
      semBarraDesde = 0;
      if (botao.parentElement !== barra) { botao.classList.remove('ph-solto'); barra.appendChild(botao); }
      if (!titulo) {
        titulo = h('button', { type: 'button', id: 'ph-titulo', 'aria-label': 'Ir para o início', onclick: irInicio }, P.marca(22), h('span'));
      }
      var logo = barra.querySelector('ytm-home-logo, .mobile-topbar-logo, a[href="/"]');
      if (titulo.parentElement !== barra) barra.insertBefore(titulo, logo ? logo.nextSibling : barra.firstChild);
      var nome = nomePagina();
      if (titulo.lastChild.textContent !== nome) titulo.lastChild.textContent = nome;
      R.classList.add('ph-com-titulo');
      return;
    }
    if (!semBarraDesde) semBarraDesde = Date.now();
    if (Date.now() - semBarraDesde > 2500 && botao.parentElement !== D.body) { botao.classList.add('ph-solto'); D.body.appendChild(botao); }
  }
  function irInicio() {
    var a = D.querySelector('ytm-home-logo a, ytm-home-logo, a.mobile-topbar-logo');
    if (a) { a.click(); return; }
    var aba = D.querySelector('ytm-pivot-bar-item-renderer');
    if (aba) { (aba.querySelector('.pivot-bar-item-tab') || aba).click(); return; }
    location.assign('/');
  }

  /* ---------- topo some ao rolar para baixo e volta ao subir ---------- */
  var yAntes = 0, rolarPend = false;
  addEventListener('scroll', function () {
    if (rolarPend) return; rolarPend = true;
    requestAnimationFrame(function () {
      rolarPend = false;
      var y = scrollY, dy = y - yAntes;
      if (Math.abs(dy) > 6) { R.classList.toggle('ph-topo-escondido', dy > 0 && y > 140 && !ehVideo()); yAntes = y; }
    });
  }, { passive: true });

  /* ---------- aba ativa da barra de baixo ---------- */
  function marcarAba() {
    var itens = D.querySelectorAll('ytm-pivot-bar-item-renderer');
    var barra = D.querySelector('ytm-pivot-bar-renderer');
    R.classList.toggle('ph-com-pivot', !!barra && barra.getClientRects().length > 0 && barra.getBoundingClientRect().height > 0);
    if (!itens.length) return;
    var p = location.pathname, alvo = p === '/' ? 0 : /^\/shorts/.test(p) ? 1 : /^\/feed\/subscriptions/.test(p) ? 2 : /^\/feed\/(you|library|history)/.test(p) ? 3 : -1;
    var nomes = [/in[ií]cio|home/i, /shorts/i, /inscri|subscr/i, /voc[eê]|you|biblio|library/i];
    for (var i = 0; i < itens.length; i++) {
      var ok = alvo >= 0 && nomes[alvo].test(itens[i].textContent || '');
      if (ok !== itens[i].hasAttribute('data-ph-ativo')) { if (ok) itens[i].setAttribute('data-ph-ativo', ''); else itens[i].removeAttribute('data-ph-ativo'); }
    }
  }

  /* ---------- home: o primeiro vídeo vira destaque, o conteúdo sobe ao trocar de página ---------- */
  function destaque() {
    var conteudo = D.querySelector(ehVideo() ? 'ytm-single-column-watch-next-results-renderer' : 'ytm-browse, ytm-search');
    if (conteudo && !conteudo.classList.contains('ph-sobe')) conteudo.classList.add('ph-sobe');
    if (location.pathname !== '/') return;
    if (D.querySelector('[data-ph-destaque]')) return;
    var itens = D.querySelectorAll('ytm-rich-item-renderer');
    for (var i = 0; i < itens.length && i < 6; i++) {
      var it = itens[i];
      if (it.querySelector('ytm-shorts-lockup-view-model, .reel-item-endpoint')) continue;
      if (!it.querySelector('a[href*="/watch"]')) continue;
      it.setAttribute('data-ph-destaque', '');
      break;
    }
  }

  /* ---------- fileira embaixo do player ---------- */
  var VELS = [1, 1.25, 1.5, 1.75, 2, 0.75];
  var fileira = null, btnVel = null;
  function rotuloVel() { var v = P.video(); if (btnVel) { btnVel.lastChild.textContent = String(v ? v.playbackRate : 1).replace('.', ',') + 'x'; btnVel.classList.toggle('ph-on', !!v && v.playbackRate !== 1); } }
  function montarFileira() {
    btnVel = h('button', { type: 'button', 'aria-label': 'Velocidade', onclick: function () {
      var v = P.video(); if (!v) return;
      var i = VELS.indexOf(v.playbackRate); v.playbackRate = VELS[(i + 1) % VELS.length]; rotuloVel();
    } }, P.icone('vel', 20), h('span', { texto: '1x' }));
    fileira = h('div', { id: 'ph-acoes' },
      h('button', { type: 'button', 'class': 'ph-hub-mini', 'aria-label': 'Abrir o Pico Hub', onclick: function () { P.abrirFolha(); } }, P.marca(28)),
      h('button', { type: 'button', 'aria-label': 'Levar o vídeo pro cantinho', onclick: function () { minimizar(); } }, P.icone('baixo', 20), h('span', { texto: 'Cantinho' })),
      h('button', { type: 'button', onclick: function () { P.app({ t: 'pip' }); } }, P.icone('pip', 20), h('span', { texto: 'Janelinha' })),
      btnVel,
      h('button', { type: 'button', onclick: function () { P.bolso(true); } }, P.icone('bolso', 20), h('span', { texto: 'Bolso' })));
  }
  function colocarFileira() {
    if (!ehVideo()) { if (fileira && fileira.parentElement) fileira.remove(); return; }
    var alvo = D.querySelector('ytm-slim-video-metadata-section-renderer, ytm-slim-video-information-renderer, ytm-single-column-watch-next-results-renderer');
    if (!alvo) return;
    if (!fileira) montarFileira();
    if (fileira.nextElementSibling !== alvo) alvo.parentElement.insertBefore(fileira, alvo);
    rotuloVel();
  }
  D.addEventListener('ratechange', rotuloVel, true);

  /* ---------- arrastar o player para baixo: vira miniplayer ---------- */
  function ligarArrasto() {
    if (!ehVideo()) return;
    var alvo = D.querySelector('#player-container-id');
    if (!alvo || alvo.__phArr) return;
    alvo.__phArr = true;
    var y0 = null, x0 = 0, dy = 0, ativo = false;
    var limpar = function () { alvo.style.transform = ''; alvo.style.opacity = ''; alvo.style.transition = ''; R.style.removeProperty('--ph-arr'); };
    alvo.addEventListener('touchstart', function (e) {
      if (D.fullscreenElement || e.touches.length !== 1 || R.classList.contains('ph-pip')) { y0 = null; return; }
      y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; dy = 0; ativo = false;
    }, { passive: true, capture: true });
    alvo.addEventListener('touchmove', function (e) {
      if (y0 == null) return;
      var t = e.touches[0], ddy = t.clientY - y0, ddx = t.clientX - x0;
      if (!ativo) {
        if (ddy > 14 && ddy > Math.abs(ddx) * 1.5) { ativo = true; R.classList.add('ph-arrastando'); alvo.style.transition = 'none'; }
        else if (Math.abs(ddx) > 14 || ddy < -14) { y0 = null; return; }
        else return;
      }
      e.preventDefault(); e.stopPropagation();
      dy = Math.max(0, ddy);
      var k = Math.min(1, dy / 340);
      alvo.style.transform = 'translate3d(' + (k * 22) + 'vw,' + (dy * 0.9) + 'px,0) scale(' + (1 - k * 0.45) + ')';
      R.style.setProperty('--ph-arr', k.toFixed(3));
    }, { passive: false, capture: true });
    var fim = function (e) {
      if (!ativo) { y0 = null; return; }
      if (e && e.cancelable) e.preventDefault();
      if (e) e.stopPropagation();
      ativo = false; y0 = null; R.classList.remove('ph-arrastando');
      if (dy > 110) {
        alvo.style.transition = 'transform .28s var(--ph-saida), opacity .28s ease';
        alvo.style.transform = 'translate3d(24vw,70vh,0) scale(.4)'; alvo.style.opacity = '0';
        setTimeout(function () { minimizar(); setTimeout(limpar, 400); }, 200);
      } else {
        alvo.style.transition = 'transform .5s var(--ph-mola)';
        alvo.style.transform = ''; R.style.removeProperty('--ph-arr');
        setTimeout(limpar, 520);
      }
    };
    alvo.addEventListener('touchend', fim, { passive: false, capture: true });
    alvo.addEventListener('touchcancel', fim, { passive: false, capture: true });
  }

  /* ---------- miniplayer: o vídeo continua num cartão no canto enquanto você passeia ----------
     Usa o player embutido do YouTube (www.youtube.com/embed) e conversa com ele por postMessage. */
  var MINI = null, navs = 0, pendente = null, ultimo = null;
  var EMBED = 'https://www.youtube.com';
  function guardarUltimo() {
    if (!ehVideo() || MINI) return;
    var v = P.video(), id = idVideo();
    if (!v || !id) return;
    var toc = !v.paused && !v.ended, n = Date.now();
    var qt = toc ? n : (ultimo && ultimo.id === id ? ultimo.quandoTocava : 0);
    ultimo = { id: id, t: v.currentTime || 0, tocando: toc, quandoTocava: qt, titulo: tituloVideo(), canal: canalVideo(), w: v.videoWidth || 16, h: v.videoHeight || 9, quando: n };
  }
  D.addEventListener('timeupdate', function (e) { if (e.target && e.target.tagName === 'VIDEO' && ehVideo() && !MINI) { var n = Date.now(); if (!ultimo || n - ultimo.quando > 500) guardarUltimo(); } }, true);
  D.addEventListener('pause', function (e) { if (e.target && e.target.tagName === 'VIDEO' && ehVideo()) guardarUltimo(); }, true);

  function mandar(func, args) {
    if (!MINI || !MINI.ifr.contentWindow) return;
    try { MINI.ifr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [], id: 1, channel: 'widget' }), EMBED); } catch (e) {}
  }
  function pararTudo() { D.querySelectorAll('video').forEach(function (v) { if (!v.paused) { P.pausaNossa(); try { v.pause(); } catch (e) {} } }); }
  function montarMini(info) {
    fecharMini(true);
    pararPrevia();
    pararTudo();
    var src = EMBED + '/embed/' + encodeURIComponent(info.id) + '?autoplay=1&playsinline=1&enablejsapi=1&controls=0&rel=0&iv_load_policy=3&fs=0&disablekb=1&start=' + Math.floor(info.t || 0) + '&origin=' + encodeURIComponent(location.origin);
    var ifr = h('iframe', { src: src, allow: 'autoplay; encrypted-media; picture-in-picture', title: info.titulo || 'Vídeo', referrerpolicy: 'strict-origin-when-cross-origin' });
    var btnPlay = h('button', { type: 'button', 'class': 'ph-mini-play', 'aria-label': 'Pausar', onclick: function () { if (MINI && MINI.tocando) { P.pausaNossa(); mandar('pauseVideo'); } else mandar('playVideo'); } }, P.icone('pausa', 22));
    var prog = h('i');
    var el = h('div', { id: 'ph-mini', 'class': 'ph-dir ph-baixo', role: 'region', 'aria-label': 'Miniplayer' },
      h('div', { 'class': 'ph-mini-tela' }, ifr, h('div', { 'class': 'ph-mini-capa', style: 'background-image:url("https://i.ytimg.com/vi/' + info.id + '/hqdefault.jpg")' }), h('div', { 'class': 'ph-mini-toque' })),
      h('div', { 'class': 'ph-mini-barra' },
        h('div', { 'class': 'ph-mini-txt' }, h('b', { texto: info.titulo || 'Vídeo' }), h('small', { texto: info.canal || '' })),
        btnPlay,
        h('button', { type: 'button', 'class': 'ph-mini-x', 'aria-label': 'Fechar', onclick: function () { fecharMini(); } }, P.icone('x', 20))),
      h('div', { 'class': 'ph-mini-prog' }, prog));
    MINI = { id: info.id, t: info.t || 0, dur: 0, st: -1, tocando: true, titulo: info.titulo || 'Vídeo', canal: info.canal || '', el: el, ifr: ifr, btnPlay: btnPlay, prog: prog, pronto: false, navs: 0, criado: Date.now() };
    D.body.appendChild(el);
    arrastoMini(el);
    // o player embutido só começa a conversar depois de ouvir "listening"
    var tentar = 0;
    MINI.ouvir = setInterval(function () {
      if (!MINI || MINI.pronto || ++tentar > 40) { if (MINI) clearInterval(MINI.ouvir); return; }
      try { ifr.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), EMBED); } catch (e) {}
    }, 250);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('on'); }); });
    R.classList.add('ph-com-mini');
    P.enviar(true);
  }
  function fecharMini(calado) {
    if (!MINI) return;
    var m = MINI; MINI = null;
    clearInterval(m.ouvir);
    m.el.classList.remove('on'); m.el.classList.add('ph-sai');
    try { m.ifr.src = 'about:blank'; } catch (e) {}
    setTimeout(function () { m.el.remove(); }, 380);
    R.classList.remove('ph-com-mini');
    if (!calado) P.enviar(true);
  }
  function tempoMini() { return MINI ? MINI.t + (MINI.tocando && MINI.rel ? (Date.now() - MINI.rel) / 1000 : 0) : 0; }
  function expandirMini() {
    if (!MINI) return;
    var id = MINI.id, t = tempoMini();
    pendente = { id: id, t: t };
    if (MINI.voltou && MINI.navs === 0) { MINI.el.classList.add('ph-expande'); history.forward(); }
    else location.assign('/watch?v=' + encodeURIComponent(id) + '&t=' + Math.floor(t) + 's');
  }
  addEventListener('message', function (e) {
    if (!MINI || e.origin !== EMBED || e.source !== MINI.ifr.contentWindow) return;
    var d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; }
    if (!d || !d.event) return;
    var m = MINI;
    if (d.event === 'onReady' || d.event === 'initialDelivery' || d.event === 'infoDelivery') { m.pronto = true; clearInterval(m.ouvir); }
    var info = d.info;
    if (d.event === 'onStateChange' && typeof info === 'number') info = { playerState: info };
    if (d.event === 'onError') {
      // vídeo que não deixa tocar embutido: volta para a página dele no mesmo ponto
      P.aviso('Esse vídeo não deixa tocar no cantinho');
      var id = m.id, t = Math.floor(tempoMini()); fecharMini();
      location.assign('/watch?v=' + encodeURIComponent(id) + '&t=' + t + 's');
      return;
    }
    if (info && typeof info === 'object') {
      if (typeof info.currentTime === 'number') { m.t = info.currentTime; m.rel = Date.now(); }
      if (typeof info.duration === 'number' && info.duration > 0) m.dur = info.duration;
      if (typeof info.playerState === 'number') {
        var antes = m.tocando;
        m.st = info.playerState; m.tocando = info.playerState === 1 || info.playerState === 3;
        if (m.st === 1) m.el.classList.add('ph-tocou');
        // no fundo: se parou sozinho, volta a tocar
        if (m.st === 2 && antes && P.emFundo() && P.cfg.fundo !== false && Date.now() - (m.pausaNossa || 0) > 2000 && P.insistir()) setTimeout(function () { mandar('playVideo'); }, 250);
        if (m.st === 0) fecharMini();
      }
      if (info.videoData && info.videoData.title) { m.titulo = info.videoData.title; m.canal = info.videoData.author || m.canal; var tx = m.el.querySelector('.ph-mini-txt'); tx.firstChild.textContent = m.titulo; tx.lastChild.textContent = m.canal; }
      pintarMini();
      P.enviar();
    }
  });
  function pintarMini() {
    if (!MINI) return;
    MINI.btnPlay.replaceChild(P.icone(MINI.tocando ? 'pausa' : 'play', 22), MINI.btnPlay.firstChild);
    MINI.btnPlay.setAttribute('aria-label', MINI.tocando ? 'Pausar' : 'Tocar');
    MINI.prog.style.transform = 'scaleX(' + (MINI.dur ? Math.min(1, tempoMini() / MINI.dur) : 0) + ')';
  }
  // o app (tela de bloqueio, notificação, PiP) fala com o miniplayer quando ele existe
  P.site.midia = {
    estado: function () {
      if (!MINI) return null;
      return { t: 'midia', on: true, tocando: MINI.tocando, titulo: MINI.titulo, canal: MINI.canal, capa: 'https://i.ytimg.com/vi/' + MINI.id + '/hqdefault.jpg', dur: MINI.dur, pos: tempoMini(), vel: 1, w: 16, h: 9, prox: false };
    },
    cmd: function (c, arg) {
      if (!MINI) return false;
      if (c === 'pause' || (c === 'toggle' && MINI.tocando)) { MINI.pausaNossa = Date.now(); mandar('pauseVideo'); }
      else if (c === 'play' || c === 'toggle') mandar('playVideo');
      else if (c === 'ff' || c === 'rw') mandar('seekTo', [Math.max(0, tempoMini() + (c === 'ff' ? 10 : -10)), true]);
      else if (c === 'seek') mandar('seekTo', [Math.max(0, +arg || 0), true]);
      else if (c === 'prev') mandar('seekTo', [0, true]);
      return true;
    }
  };
  P.site.pip = function (on) { if (MINI) MINI.el.classList.toggle('ph-mini-pip', on); };

  // arrastar o cartão: solta no canto mais perto; jogar para o lado fecha; tocar abre o vídeo de novo
  function arrastoMini(el) {
    var area = el.querySelector('.ph-mini-toque');
    var x0 = 0, y0 = 0, dx = 0, dy = 0, t0 = 0, id = null, movendo = false;
    area.addEventListener('pointerdown', function (e) { id = e.pointerId; x0 = e.clientX; y0 = e.clientY; dx = dy = 0; t0 = Date.now(); movendo = false; try { area.setPointerCapture(id); } catch (x) {} el.classList.add('ph-segura'); });
    area.addEventListener('pointermove', function (e) {
      if (id !== e.pointerId) return;
      dx = e.clientX - x0; dy = e.clientY - y0;
      if (!movendo && Math.hypot(dx, dy) > 10) { movendo = true; el.classList.add('ph-movendo'); }
      if (movendo) { el.style.setProperty('--mx', dx + 'px'); el.style.setProperty('--my', dy + 'px'); el.style.opacity = String(1 - Math.min(0.7, Math.max(0, Math.abs(dx) - 120) / 200)); }
    });
    var fim = function (e) {
      if (id !== e.pointerId) return; id = null;
      el.classList.remove('ph-segura', 'ph-movendo'); el.style.opacity = '';
      if (!movendo) { el.style.removeProperty('--mx'); el.style.removeProperty('--my'); if (Date.now() - t0 < 600) expandirMini(); return; }
      var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (Math.abs(dx) > Math.min(200, innerWidth * 0.42) && (cx < 30 || cx > innerWidth - 30)) { fecharMini(); return; }
      // vai para o canto mais perto, com mola, saindo de onde o dedo soltou
      el.style.transition = 'none';
      el.style.removeProperty('--mx'); el.style.removeProperty('--my');
      el.classList.toggle('ph-esq', cx < innerWidth / 2); el.classList.toggle('ph-dir', cx >= innerWidth / 2);
      el.classList.toggle('ph-cima', cy < innerHeight / 2); el.classList.toggle('ph-baixo', cy >= innerHeight / 2);
      var r1 = el.getBoundingClientRect();
      el.style.setProperty('--mx', (r.left - r1.left) + 'px'); el.style.setProperty('--my', (r.top - r1.top) + 'px');
      void el.offsetWidth;
      el.style.transition = '';
      requestAnimationFrame(function () { el.style.removeProperty('--mx'); el.style.removeProperty('--my'); });
    };
    area.addEventListener('pointerup', fim); area.addEventListener('pointercancel', fim);
    ['touchstart', 'touchmove', 'touchend'].forEach(function (t) { el.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true }); });
  }

  // sair da página do vídeo com ele tocando (puxando, voltando ou por qualquer link): vai pro cantinho
  function minimizar() {
    guardarUltimo();
    if (!ultimo || !ehVideo()) return false;
    ultimo.tocando = true; ultimo.quando = ultimo.quandoTocava = Date.now(); ultimo.forcar = true;
    if (navs > 0) history.back(); else irInicio();
    return true;
  }
  function trocouDeRota(agora, antes) {
    pararPrevia(); PREV.vis.clear(); PREV.melhor = null;
    if (!antes) return; // primeira página: não é navegação
    navs++;
    if (MINI) MINI.navs++;
    var limpar = D.querySelector('#player-container-id'); if (limpar) { limpar.style.transform = ''; limpar.style.opacity = ''; }
    if (antes && ehVideo(antes) && !ehVideo(agora)) {
      var u = ultimo;
      if (u && u.id === idVideo(antes) && (u.forcar || (P.cfg.miniAuto && Date.now() - (u.quandoTocava || 0) < 2500))) {
        var forcado = u.forcar; u.forcar = false;
        montarMini(u);
        if (forcado) { MINI.voltou = true; MINI.navs = 0; }
      }
    }
    if (ehVideo(agora) && MINI) {
      if (idVideo(agora) === MINI.id) pendente = pendente || { id: MINI.id, t: tempoMini() };
      fecharMini(true);
    }
    if (ehVideo(agora)) ultimo = null;
  }
  // voltou para o vídeo que estava no cantinho: continua do mesmo ponto
  function aplicarPendente() {
    if (!pendente || !ehVideo()) return;
    if (idVideo() !== pendente.id) { pendente = null; return; }
    var v = P.video();
    if (!v || v.readyState < 1) return;
    if (Math.abs(v.currentTime - pendente.t) > 2) try { v.currentTime = pendente.t; } catch (e) {}
    var p = v.play(); if (p && p.catch) p.catch(function () {});
    pendente = null;
  }


  /* ---------- prévia na home: o vídeo mais visível por 2 s toca sem som, um por vez ---------- */
  var PREV = { obs: null, vis: new Map(), melhor: null, desde: 0, atual: null };
  var SEL_MINIATURA = 'ytm-thumbnail-cover, .media-item-thumbnail-container, yt-thumbnail-view-model, .video-thumbnail-container-large';
  function paginaComPrevia() { return location.pathname === '/' || /^\/feed\/subscriptions/.test(location.pathname); }
  function observarPrevias() {
    if (!P.cfg.previa || !paginaComPrevia() || !('IntersectionObserver' in window)) { pararPrevia(); return; }
    if (!PREV.obs) PREV.obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) PREV.vis.set(e.target, e.intersectionRatio); else PREV.vis.delete(e.target); });
    }, { threshold: [0, 0.25, 0.5, 0.7, 0.85, 1], rootMargin: '-60px 0px -90px 0px' });
    var itens = D.querySelectorAll('ytm-rich-item-renderer:not([data-ph-obs])');
    for (var i = 0; i < itens.length; i++) {
      var it = itens[i]; it.setAttribute('data-ph-obs', '');
      if (it.querySelector('ytm-shorts-lockup-view-model, .reel-item-endpoint')) continue;
      var a = it.querySelector('a[href*="/watch?v="]'), mi = it.querySelector(SEL_MINIATURA);
      if (!a || !mi) continue;
      mi.__phId = idVideo(new URL(a.getAttribute('href'), location.href).href);
      if (mi.__phId) PREV.obs.observe(mi);
    }
  }
  function escolherPrevia() {
    if (!P.cfg.previa || !paginaComPrevia() || MINI || P.emFundo() || R.classList.contains('ph-folha-aberta') || rolando()) { if (!P.cfg.previa || !paginaComPrevia() || MINI) pararPrevia(); PREV.melhor = null; return; }
    // o YouTube já está tocando a prévia dele: deixo a dele
    var dele = D.querySelector('ytm-rich-item-renderer video');
    if (dele && !dele.paused) { pararPrevia(); return; }
    var melhor = null, r = 0;
    PREV.vis.forEach(function (ratio, el) { if (!el.isConnected) { PREV.vis.delete(el); return; } if (ratio > r) { r = ratio; melhor = el; } });
    if (r < 0.7) melhor = null;
    if (melhor !== PREV.melhor) { PREV.melhor = melhor; PREV.desde = Date.now(); if (PREV.atual && PREV.atual.el !== melhor) pararPrevia(); return; }
    if (melhor && !PREV.atual && Date.now() - PREV.desde >= 2000) tocarPrevia(melhor);
  }
  var ultimoRolar = 0;
  addEventListener('scroll', function () { ultimoRolar = Date.now(); }, { passive: true });
  function rolando() { return Date.now() - ultimoRolar < 350; }
  function tocarPrevia(mi) {
    pararPrevia();
    var id = mi.__phId;
    var ifr = h('iframe', { src: EMBED + '/embed/' + encodeURIComponent(id) + '?autoplay=1&mute=1&playsinline=1&enablejsapi=1&controls=0&rel=0&iv_load_policy=3&fs=0&disablekb=1&loop=1&playlist=' + encodeURIComponent(id) + '&origin=' + encodeURIComponent(location.origin), allow: 'autoplay; encrypted-media', title: 'Prévia', tabindex: '-1' });
    var el = h('div', { 'class': 'ph-previa', 'aria-hidden': 'true' }, ifr, h('span', { 'class': 'ph-previa-tag' }, P.icone('play', 12), h('b', { texto: 'Prévia' })), h('i', { 'class': 'ph-previa-prog' }));
    if (getComputedStyle(mi).position === 'static') mi.style.position = 'relative';
    mi.appendChild(el);
    PREV.atual = { el: mi, caixa: el, ifr: ifr, id: id, inicio: Date.now(), ouvir: 0 };
    var n = 0, tm = setInterval(function () {
      if (!PREV.atual || PREV.atual.ifr !== ifr || ++n > 40) { clearInterval(tm); return; }
      try { ifr.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 2, channel: 'widget' }), EMBED); } catch (e) {}
    }, 250);
    PREV.atual.ouvir = tm;
    // prévia tem fim: 30 s e volta para a miniatura
    PREV.atual.fim = setTimeout(pararPrevia, 30000);
  }
  function pararPrevia() {
    var a = PREV.atual; if (!a) return;
    PREV.atual = null;
    clearInterval(a.ouvir); clearTimeout(a.fim);
    a.caixa.classList.remove('on');
    setTimeout(function () { try { a.ifr.src = 'about:blank'; } catch (e) {} a.caixa.remove(); }, 350);
  }
  addEventListener('message', function (e) {
    var a = PREV.atual;
    if (!a || e.origin !== EMBED || e.source !== a.ifr.contentWindow) return;
    var d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; }
    if (!d) return;
    if (d.event === 'onError') { pararPrevia(); return; }
    var info = d.event === 'onStateChange' ? { playerState: d.info } : d.info;
    if (info && typeof info === 'object') {
      clearInterval(a.ouvir);
      if (info.playerState === 1) a.caixa.classList.add('on');
      if (typeof info.currentTime === 'number' && info.duration) a.caixa.lastChild.style.transform = 'scaleX(' + Math.min(1, info.currentTime / info.duration) + ')';
    }
  });

  /* ---------- tela cheia: título e canal em cima, aparecem a cada toque (igual ao app) ---------- */
  var topoT = 0;
  function topoCheia() {
    var fe = D.fullscreenElement || D.webkitFullscreenElement;
    R.classList.toggle('ph-telacheia', !!fe);
    var el = D.getElementById('ph-cheia-topo');
    if (!fe) { if (el) el.remove(); return; }
    if (!el) el = h('div', { id: 'ph-cheia-topo' }, h('b'), h('small'));
    el.firstChild.textContent = tituloVideo();
    el.lastChild.textContent = canalVideo();
    if (el.parentElement !== fe) fe.appendChild(el);
    mostrarTopo();
  }
  function mostrarTopo() {
    var el = D.getElementById('ph-cheia-topo'); if (!el) return;
    el.firstChild.textContent = tituloVideo();
    el.classList.add('on'); clearTimeout(topoT);
    topoT = setTimeout(function () { el.classList.remove('on'); }, 3200);
  }
  D.addEventListener('fullscreenchange', topoCheia, true);
  D.addEventListener('webkitfullscreenchange', topoCheia, true);
  D.addEventListener('pointerdown', function () { if (R.classList.contains('ph-telacheia')) mostrarTopo(); }, true);

  /* ---------- menus, folhas e diálogos do YouTube no nosso estilo ---------- */
  var SEL_FOLHAS = 'bottom-sheet-container, ytm-bottom-sheet-renderer, yt-sheet-view-model, .bottom-sheet-layout, ytm-menu-popup-renderer, tp-yt-paper-dialog, ytm-dialog, yt-dialog-view-model, .dialog-container, [role="dialog"]:not(#ph-folha), [role="menu"], [aria-modal="true"]:not(#ph-folha), ytm-engagement-panel';
  function marcarFolhas() {
    var els = D.querySelectorAll(SEL_FOLHAS);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.hasAttribute('data-ph-folha') || el.closest('#ph-folha, #ph-mini')) continue;
      el.setAttribute('data-ph-folha', '');
    }
  }
  var folhaT = [];
  D.addEventListener('pointerup', function () { folhaT.forEach(clearTimeout); folhaT = [80, 300, 700, 1400].map(function (ms) { return setTimeout(marcarFolhas, ms); }); }, true);

  /* ---------- busca: sem a lista enorme de buscas antigas; só aparece sugestão quando você começa a escrever ---------- */
  var vazioEl = null, listaBusca = null;
  function campoBusca() { return D.querySelector('input.searchbox-input, ytm-searchbox input, input[name="search"], input[type="search"]'); }
  function busca() {
    var inp = campoBusca();
    var aberta = !!inp && inp.offsetParent !== null && D.activeElement === inp;
    if (listaBusca && !listaBusca.isConnected) listaBusca = null;
    var vazia = aberta && !inp.value.trim();
    R.classList.toggle('ph-busca-aberta', aberta);
    R.classList.toggle('ph-busca-vazia', vazia);
    if (aberta && !listaBusca) acharLista(inp);
    if (listaBusca) {
      var c = listaBusca, n = 0;
      while (c.children.length === 1 && n++ < 6) c = c.children[0];
      for (var i = 0; i < c.children.length; i++) if (!c.children[i].hasAttribute('data-ph-linha') && c.children[i].textContent.trim()) c.children[i].setAttribute('data-ph-linha', '');
    }
    if (!aberta) { if (listaBusca) listaBusca.removeAttribute('data-ph-sugestoes'); listaBusca = null; }
    if (aberta) R.style.setProperty('--ph-busca-top', Math.round(inp.getBoundingClientRect().bottom + 8) + 'px');
    if (vazia) {
      if (!vazioEl) vazioEl = h('div', { id: 'ph-busca-vazia' }, P.icone('lupa', 34), h('b', { texto: 'O que vamos assistir?' }), h('span', { texto: 'As sugestões aparecem enquanto você escreve' }));
      if (!vazioEl.isConnected) D.body.appendChild(vazioEl);
    } else if (vazioEl && vazioEl.isConnected) vazioEl.remove();
  }
  // a lista de sugestões: primeiro pelos nomes conhecidos; se não achar, pelo que está logo embaixo do campo
  function acharLista(inp) {
    var l = D.querySelector('.searchbox-dropdown, ytm-search-suggestions-renderer, .search-suggestions, ytm-searchbox [role="listbox"], [role="listbox"]');
    if (!l) {
      var r = inp.getBoundingClientRect(), el = D.elementFromPoint(innerWidth / 2, r.bottom + 40);
      while (el && el !== D.body && el.parentElement) {
        var b = el.getBoundingClientRect();
        if (b.height > innerHeight * 0.35 && b.width > innerWidth * 0.9) break;
        el = el.parentElement;
      }
      if (el && el !== D.body && el !== R && !el.matches('ytm-app, #app, .page-container, ytm-browse, ytm-watch') && !el.querySelector('ytm-rich-item-renderer, ytm-pivot-bar-renderer, #player-container-id')) l = el;
    }
    if (l) { listaBusca = l; l.setAttribute('data-ph-sugestoes', ''); }
  }
  ['input', 'focusin', 'focusout'].forEach(function (t) { D.addEventListener(t, function (e) { if (e.target && e.target.tagName === 'INPUT') setTimeout(busca, t === 'focusout' ? 200 : 0); }, true); });

  /* ---------- voltar ---------- */
  function visivel(el) { if (!el) return false; var r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(el).visibility !== 'hidden'; }
  P.voltar(function () {
    var fundoFolha = D.querySelector('.bottom-sheet-overlay, .c3-overlay, tp-yt-iron-overlay-backdrop.opened, .dialog-overlay');
    if (visivel(fundoFolha)) { fundoFolha.click(); return true; }
    var fechar = D.querySelector('ytm-engagement-panel :is(button[aria-label*="Fechar" i], button[aria-label*="Close" i])');
    if (visivel(fechar)) { fechar.click(); return true; }
    if (D.fullscreenElement) { D.exitFullscreen().catch(function () {}); return true; }
    if (R.classList.contains('ph-busca-aberta')) { var inp = campoBusca(); if (inp) inp.blur(); }
    // vídeo tocando: vai pro cantinho em vez de fechar
    var v = P.video();
    if (ehVideo() && v && !v.paused && !v.ended && P.cfg.miniAuto) return minimizar();
    return false;
  });

  /* ---------- relógio ---------- */
  P.site.rota = trocouDeRota;
  P.site.fundo = function (f) { if (!f && MINI) pintarMini(); if (f) pararPrevia(); };
  P.tick(function (n) {
    escuro(); colocarTopo(); marcarAba(); colocarFileira(); ligarArrasto(); destaque(); aplicarPendente(); busca();
    if (MINI) pintarMini();
    if (n % 4 === 0) marcarFolhas();
    observarPrevias(); escolherPrevia();
    if (ehVideo() && !MINI) guardarUltimo();
  });
})();

// Pele do YouTube no celular (m.youtube.com), por cima do ph.js.
// Coloca o botão do Hub, a fileira embaixo do player, o voltar que não fecha vídeo sem querer e a capa para a tela de bloqueio.
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

  function idVideo() {
    try {
      var u = new URL(location.href);
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      var m = u.pathname.match(/^\/(?:shorts|live)\/([\w-]{6,})/); return m ? m[1] : '';
    } catch (e) { return ''; }
  }
  function naPaginaDoVideo() { return /^\/(watch|shorts|live)/.test(location.pathname); }
  P.site.capa = function () { var id = idVideo(); return id ? 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg' : ''; };
  P.site.titulo = function () {
    var t = D.querySelector('.slim-video-information-title, .slim-video-metadata-header h2, ytm-slim-video-information-renderer h2');
    return t ? t.textContent.replace(/\s+/g, ' ').trim() : '';
  };

  // modo escuro do YouTube (as cores são trocadas pelas do tema de qualquer jeito)
  function escuro() { R = D.documentElement; if (!R.hasAttribute('dark')) R.setAttribute('dark', 'true'); }

  /* ---------- botão do Hub na barra de cima (ou solto, se a barra não existir) ---------- */
  var botao = null, semBarraDesde = 0;
  function colocarBotao() {
    if (!botao) botao = P.botaoHub();
    var barra = D.querySelector('.mobile-topbar-header-content, ytm-mobile-topbar-renderer header > div, #masthead #end');
    if (barra && barra.offsetParent !== null) {
      semBarraDesde = 0;
      if (botao.parentElement !== barra) { botao.classList.remove('ph-solto'); barra.appendChild(botao); }
      return;
    }
    if (!semBarraDesde) semBarraDesde = Date.now();
    if (Date.now() - semBarraDesde > 2500 && botao.parentElement !== D.body) { botao.classList.add('ph-solto'); D.body.appendChild(botao); }
  }

  /* ---------- aba ativa da barra de baixo, na cor do tema ---------- */
  function marcarAba() {
    var itens = D.querySelectorAll('ytm-pivot-bar-item-renderer');
    if (!itens.length) return;
    var p = location.pathname, alvo = p === '/' ? 0 : /^\/shorts/.test(p) ? 1 : /^\/feed\/subscriptions/.test(p) ? 2 : /^\/feed\/(you|library|history)/.test(p) ? 3 : -1;
    // as abas não são links: acho pelo texto de cada uma
    var nomes = [/in[ií]cio|home/i, /shorts/i, /inscri|subscr/i, /voc[eê]|you|biblio|library/i];
    for (var i = 0; i < itens.length; i++) {
      var ok = alvo >= 0 && nomes[alvo].test(itens[i].textContent || '');
      if (ok !== itens[i].hasAttribute('data-ph-ativo')) { if (ok) itens[i].setAttribute('data-ph-ativo', ''); else itens[i].removeAttribute('data-ph-ativo'); }
    }
  }

  /* ---------- fileira embaixo do player ---------- */
  var VELS = [1, 1.25, 1.5, 1.75, 2, 0.75];
  var fileira = null, btnVel = null;
  function rotuloVel() { var v = P.video(); if (btnVel) btnVel.lastChild.textContent = (v ? v.playbackRate : 1).toString().replace('.', ',') + 'x'; }
  function montarFileira() {
    btnVel = h('button', { type: 'button', 'aria-label': 'Velocidade', onclick: function () {
      var v = P.video(); if (!v) return;
      var i = VELS.indexOf(v.playbackRate); v.playbackRate = VELS[(i + 1) % VELS.length]; rotuloVel();
      btnVel.classList.toggle('ph-on', v.playbackRate !== 1);
    } }, P.icone('vel', 20), h('span', { texto: '1x' }));
    fileira = h('div', { id: 'ph-acoes' },
      h('button', { type: 'button', 'class': 'ph-hub-mini', 'aria-label': 'Abrir o Pico Hub', onclick: P.abrirFolha }, P.marca(30)),
      h('button', { type: 'button', onclick: function () { P.app({ t: 'pip' }); } }, P.icone('pip', 20), h('span', { texto: 'Janelinha' })),
      btnVel,
      h('button', { type: 'button', onclick: function () { P.bolso(true); } }, P.icone('bolso', 20), h('span', { texto: 'Bolso' })));
  }
  function colocarFileira() {
    if (!naPaginaDoVideo() || /^\/shorts/.test(location.pathname)) { if (fileira && fileira.parentElement) fileira.remove(); return; }
    var alvo = D.querySelector('ytm-slim-video-metadata-section-renderer, ytm-slim-video-information-renderer, ytm-single-column-watch-next-results-renderer');
    if (!alvo) return;
    if (!fileira) montarFileira();
    if (fileira.nextElementSibling !== alvo) alvo.parentElement.insertBefore(fileira, alvo);
    rotuloVel();
  }
  D.addEventListener('ratechange', rotuloVel, true);

  /* ---------- tela cheia ---------- */
  D.addEventListener('fullscreenchange', function () { R.classList.toggle('ph-telacheia', !!D.fullscreenElement); }, true);
  D.addEventListener('webkitfullscreenchange', function () { R.classList.toggle('ph-telacheia', !!D.webkitFullscreenElement); }, true);

  /* ---------- voltar ---------- */
  function visivel(el) { if (!el) return false; var r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(el).visibility !== 'hidden'; }
  var pediuSair = 0;
  P.voltar(function () {
    // folha ou menu do YouTube aberto: fecha
    var fundoFolha = D.querySelector('.bottom-sheet-overlay, .c3-overlay, tp-yt-iron-overlay-backdrop.opened, .dialog-overlay');
    if (visivel(fundoFolha)) { fundoFolha.click(); return true; }
    var fechar = D.querySelector('ytm-engagement-panel :is(button[aria-label*="Fechar" i], button[aria-label*="Close" i])');
    if (visivel(fechar)) { fechar.click(); return true; }
    if (D.fullscreenElement) { D.exitFullscreen().catch(function () {}); return true; }
    // vídeo tocando: pede um segundo toque antes de sair dele
    var v = P.video();
    if (naPaginaDoVideo() && v && !v.paused && !v.ended) {
      if (Date.now() - pediuSair > 2600) { pediuSair = Date.now(); P.aviso('Toque em voltar de novo para sair do vídeo'); return true; }
    }
    return false;
  });

  /* ---------- relógio ---------- */
  P.site.rota = function () { pediuSair = 0; };
  P.tick(function () { escuro(); colocarBotao(); marcarAba(); colocarFileira(); });
})();

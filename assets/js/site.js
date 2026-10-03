/* Brincolar Games — carrossel, lista de jogos e morceguinha */
(function () {
  'use strict';

  var RAIZ = document.body.getAttribute('data-raiz') || '';
  var CORES = ['#8FD3E8', '#FF8FB8', '#B79CED', '#FFD166'];
  var MOVIMENTO_REDUZIDO = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function criar(tag, attrs, filhos) {
    var no = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'texto') no.textContent = attrs[k];
      else no.setAttribute(k, attrs[k]);
    });
    (filhos || []).forEach(function (f) { no.appendChild(f); });
    return no;
  }

  function linkSeguro(url) {
    return typeof url === 'string' && /^https?:\/\//i.test(url) ? url : null;
  }

  function carregar(arquivo) {
    return fetch(RAIZ + arquivo, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(arquivo + ': ' + r.status);
      return r.json();
    });
  }

  /* ---------- Jogos ---------- */

  function imagemDoJogo(jogo, i) {
    var img = criar('img', { src: RAIZ + jogo.banner, alt: '', loading: 'lazy', width: '1280', height: '720' });
    img.style.background = CORES[i % CORES.length];
    return img;
  }

  function montarCarrossel(jogos) {
    var trilho = document.getElementById('carrossel');
    if (!trilho) return;
    var destaques = jogos.filter(function (j) { return j.destaque; });
    if (!destaques.length) destaques = jogos;
    destaques.forEach(function (jogo, i) {
      var link = linkSeguro(jogo.link);
      if (!link) return;
      var cartao = criar('a', { 'class': 'cartao', href: link, target: '_blank', rel: 'noopener' }, [
        imagemDoJogo(jogo, i),
        criar('span', { 'class': 'nome', texto: jogo.nome })
      ]);
      trilho.appendChild(criar('li', {}, [cartao]));
    });
    var passo = function (dir) { trilho.scrollBy({ left: dir * Math.max(280, trilho.clientWidth * 0.8), behavior: 'smooth' }); };
    var ant = document.getElementById('carrossel-anterior');
    var prox = document.getElementById('carrossel-proximo');
    if (ant) ant.addEventListener('click', function () { passo(-1); });
    if (prox) prox.addEventListener('click', function () { passo(1); });
  }

  function montarGrade(jogos) {
    var grade = document.getElementById('lista-jogos');
    if (!grade) return;
    jogos.forEach(function (jogo, i) {
      var link = linkSeguro(jogo.link);
      if (!link) return;
      var corpo = criar('div', { 'class': 'corpo' }, [criar('h2', { texto: jogo.nome })]);
      if (jogo.plataformas) corpo.appendChild(criar('span', { 'class': 'plataforma', texto: jogo.plataformas }));
      corpo.appendChild(criar('p', { texto: jogo.descricao || '' }));
      corpo.appendChild(criar('a', {
        'class': 'btn rosa', href: link, target: '_blank', rel: 'noopener',
        'aria-label': 'Acessar jogo: ' + jogo.nome, texto: 'Acessar jogo'
      }));
      grade.appendChild(criar('li', {}, [criar('article', { 'class': 'cartao' }, [imagemDoJogo(jogo, i), corpo])]));
    });
  }

  if (document.getElementById('carrossel') || document.getElementById('lista-jogos')) {
    carregar('dados/jogos.json').then(function (jogos) {
      montarCarrossel(jogos);
      montarGrade(jogos);
    }).catch(function () {
      var alvo = document.getElementById('lista-jogos') || document.getElementById('carrossel');
      alvo.appendChild(criar('li', { 'class': 'aviso', texto: 'Não foi possível carregar a lista de jogos agora. Tente atualizar a página.' }));
    });
  }

  /* ---------- Sons ---------- */

  var audio = null;
  var mudo = false;
  try { mudo = localStorage.getItem('brincolar-mudo') === '1'; } catch (e) {}

  function tocar(notas, tipo) {
    if (mudo) return;
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      var t = audio.currentTime;
      notas.forEach(function (freq, i) {
        var osc = audio.createOscillator();
        var ganho = audio.createGain();
        var inicio = t + i * 0.08;
        osc.type = tipo || 'sine';
        osc.frequency.value = freq;
        ganho.gain.setValueAtTime(0.0001, inicio);
        ganho.gain.exponentialRampToValueAtTime(0.18, inicio + 0.015);
        ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.16);
        osc.connect(ganho);
        ganho.connect(audio.destination);
        osc.start(inicio);
        osc.stop(inicio + 0.18);
      });
    } catch (e) {}
  }

  /* ---------- Morceguinha ---------- */

  var IMG = RAIZ + 'assets/img/';
  var ANIMACOES = MOVIMENTO_REDUZIDO
    ? { idle: IMG + 'morcega.webp', atencao: IMG + 'morcega.webp', conversa: IMG + 'morcega.webp' }
    : { idle: IMG + 'morcega-idle.webp', atencao: IMG + 'morcega-atencao.webp', conversa: IMG + 'morcega-conversa.webp' };

  var surpresas = [];
  var aberto = false;
  var emCima = false;
  var modoAtual = 'idle';

  function opcao(tag, classe, texto, attrs) {
    var a = attrs || {};
    a['class'] = 'opcao ' + classe;
    a.texto = texto;
    if (tag === 'button') a.type = 'button';
    return criar(tag, a);
  }

  var btnJogar = opcao('button', 'azul', 'Jogar?');
  var btnAjuda = opcao('button', 'amarelo', 'Ajuda?');
  var lnkSurpresa = opcao('a', 'rosa', 'Surpresa?', { href: RAIZ + 'jogos/', target: '_blank', rel: 'noopener' });
  var menuInicio = criar('div', { 'class': 'balao-menu' }, [
    criar('div', { 'class': 'balao-titulo', texto: 'Oi! O que vamos fazer?' }), btnJogar, btnAjuda, lnkSurpresa
  ]);
  var menuJogar = criar('div', { 'class': 'balao-menu', hidden: '' }, [
    criar('div', { 'class': 'balao-titulo', texto: 'O que você quer jogar?' }),
    opcao('a', 'azul', 'Jogos livres e gratuitos?', { href: RAIZ + 'jogos/' }),
    opcao('a', 'lilas', 'Recursos terapêuticos', { href: RAIZ + 'hub/' })
  ]);
  var menuAjuda = criar('div', { 'class': 'balao-menu', hidden: '' }, [
    criar('div', { 'class': 'balao-titulo', texto: 'Como posso ajudar?' }),
    opcao('a', 'amarelo', 'Ajuda em projetos?', { href: RAIZ + 'servicos/' }),
    opcao('a', 'rosa', 'Contato direto', { href: 'mailto:daletefono@gmail.com' })
  ]);
  var btnVoltar = criar('button', { type: 'button', texto: 'Voltar', hidden: '' });
  var btnSom = criar('button', { type: 'button' });
  var btnFechar = criar('button', { type: 'button', texto: 'Fechar' });
  var balao = criar('div', { 'class': 'balao', id: 'balao-morceguinha', role: 'group', 'aria-label': 'Conversa com a morceguinha', hidden: '' }, [
    menuInicio, menuJogar, menuAjuda,
    criar('div', { 'class': 'balao-pe' }, [btnVoltar, btnSom, btnFechar])
  ]);
  var imagem = criar('img', { src: ANIMACOES.idle, alt: '', width: '132', height: '132' });
  var botao = criar('button', {
    type: 'button', 'class': 'mascote-btn', 'aria-label': 'Falar com a morceguinha',
    'aria-expanded': 'false', 'aria-controls': 'balao-morceguinha'
  }, [imagem]);
  var mascote = criar('div', { 'class': 'mascote' }, [balao, botao]);
  document.body.appendChild(mascote);

  function atualizarSom() { btnSom.textContent = mudo ? 'Som desligado' : 'Som ligado'; }
  atualizarSom();

  function atualizarAnimacao() {
    var modo = aberto ? 'conversa' : (emCima ? 'atencao' : 'idle');
    if (modo === modoAtual) return;
    modoAtual = modo;
    imagem.src = ANIMACOES[modo];
  }

  function mostrarMenu(qual) {
    menuInicio.hidden = qual !== 'inicio';
    menuJogar.hidden = qual !== 'jogar';
    menuAjuda.hidden = qual !== 'ajuda';
    btnVoltar.hidden = qual === 'inicio';
  }

  function sortearSurpresa() {
    if (!surpresas.length) return;
    lnkSurpresa.href = surpresas[Math.floor(Math.random() * surpresas.length)];
  }

  function abrir() {
    aberto = true;
    mostrarMenu('inicio');
    balao.hidden = false;
    botao.setAttribute('aria-expanded', 'true');
    atualizarAnimacao();
    tocar([523, 659, 784]);
  }

  function fechar(comSom) {
    if (!aberto) return;
    aberto = false;
    balao.hidden = true;
    botao.setAttribute('aria-expanded', 'false');
    atualizarAnimacao();
    if (comSom) tocar([520, 390]);
  }

  botao.addEventListener('click', function () { if (aberto) fechar(true); else abrir(); });
  botao.addEventListener('pointerenter', function (e) {
    if (e.pointerType === 'mouse') { emCima = true; atualizarAnimacao(); }
  });
  botao.addEventListener('pointerleave', function () { emCima = false; atualizarAnimacao(); });
  botao.addEventListener('focus', function () { emCima = true; atualizarAnimacao(); });
  botao.addEventListener('blur', function () { emCima = false; atualizarAnimacao(); });

  btnJogar.addEventListener('click', function () { tocar([660]); mostrarMenu('jogar'); });
  btnAjuda.addEventListener('click', function () { tocar([660]); mostrarMenu('ajuda'); });
  btnVoltar.addEventListener('click', function () { tocar([440]); mostrarMenu('inicio'); });
  btnFechar.addEventListener('click', function () { fechar(true); botao.focus(); });
  btnSom.addEventListener('click', function () {
    mudo = !mudo;
    try { localStorage.setItem('brincolar-mudo', mudo ? '1' : '0'); } catch (e) {}
    atualizarSom();
    tocar([660]);
  });
  lnkSurpresa.addEventListener('click', function () {
    tocar([523, 659, 784, 1047, 1319], 'triangle');
    setTimeout(sortearSurpresa, 400);
  });
  [menuJogar, menuAjuda].forEach(function (menu) {
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) tocar([784]); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && aberto) { fechar(true); botao.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (aberto && !mascote.contains(e.target)) fechar(false);
  });

  carregar('dados/surpresa.json').then(function (lista) {
    surpresas = (Array.isArray(lista) ? lista : []).map(linkSeguro).filter(Boolean);
    sortearSurpresa();
  }).catch(function () {});

  /* Carrega as outras duas animações depois que a página terminou de abrir */
  if (!MOVIMENTO_REDUZIDO) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        new Image().src = ANIMACOES.atencao;
        new Image().src = ANIMACOES.conversa;
      }, 1200);
    });
  }
})();

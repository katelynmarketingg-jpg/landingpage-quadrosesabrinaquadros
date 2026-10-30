/* =========================================================================
   QUADROS & SABRINA QUADROS ADVOCACIA — Scripts
   Sem dependências. Intersection Observer + requestAnimationFrame.
   ========================================================================= */
(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     CONFIGURAÇÃO — troque aqui o número do WhatsApp (DDI + DDD + número, só dígitos)
     Ex.: '5551999999999'
     ----------------------------------------------------------------------- */
  var WHATSAPP_NUMBER = '5551999895004';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Links de WhatsApp com mensagem pré-preenchida por área (atributo data-wa) */
  document.querySelectorAll('[data-wa]').forEach(function (el) {
    el.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(el.getAttribute('data-wa'));
  });

  /* 2. Header: fundo translúcido + blur ao rolar */
  var header = document.querySelector('.header');
  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* 3. Menu mobile */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');
  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    nav.classList.remove('is-open');
  }
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
    nav.classList.toggle('is-open', !open);
    if (!open) header.classList.add('is-scrolled');
    else onScrollHeader();
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* 4. Hero: título palavra a palavra */
  var title = document.querySelector('[data-split]');
  if (title) {
    var wordIndex = 0;
    title.querySelectorAll('.line').forEach(function (line) {
      var words = line.textContent.trim().split(/\s+/);
      line.textContent = '';
      words.forEach(function (w, i) {
        var outer = document.createElement('span');
        outer.className = 'word';
        var inner = document.createElement('span');
        inner.className = 'word__inner';
        inner.textContent = w;
        inner.style.setProperty('--d', (0.35 + wordIndex * 0.07).toFixed(2) + 's');
        outer.appendChild(inner);
        line.appendChild(outer);
        if (i < words.length - 1) line.appendChild(document.createTextNode(' '));
        wordIndex++;
      });
    });
  }

  // Dispara a sequência do hero
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add('is-loaded');
      var heroImg = document.querySelector('.hero .img-reveal');
      var heroFrame = document.querySelector('.hero .frame');
      setTimeout(function () {
        if (heroImg) heroImg.classList.add('is-visible');
        if (heroFrame) heroFrame.classList.add('is-visible');
      }, 250);
    });
  });

  /* 5. Scroll reveal (fade + subida, fios, máscaras de imagem, linha do tempo) */
  var targets = document.querySelectorAll(
    '.reveal, .rule, .section .img-reveal, .section .frame, .timeline, [data-count]'
  );

  if (!('IntersectionObserver' in window) || reduceMotion) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');
        if (el.hasAttribute('data-count')) countUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* 6. Contador "27" (0 → 27) */
  function countUp(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    var duration = 1800;
    var start = null;
    el.textContent = '0';
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      el.textContent = Math.round(eased * end);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* 7. Parallax leve nas imagens (máx. 30px) */
  if (!reduceMotion) {
    var imgs = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    var ticking = false;
    function parallax() {
      var vh = window.innerHeight;
      imgs.forEach(function (img) {
        var box = img.parentElement.getBoundingClientRect();
        if (box.bottom < 0 || box.top > vh) return;
        // progresso -1 (entrando por baixo) → 1 (saindo por cima)
        var progress = ((box.top + box.height / 2) - vh / 2) / (vh / 2 + box.height / 2);
        img.style.transform = 'translate3d(0,' + (progress * -30).toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', parallax);
    parallax();
  }
})();

/* 8. Seção Soluções: escondida até a pessoa clicar em "Soluções" no menu.
      Abas por área, links do menu abrem a aba certa. */
(function () {
  var section = document.getElementById('solucoes');
  var root = document.querySelector('[data-tabs]');
  if (!section || !root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));

  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    var list = tab.parentNode;
    list.scrollLeft = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
  }
  function reveal() {
    section.hidden = false;
    section.querySelectorAll('.reveal, .rule').forEach(function (el) { el.classList.add('is-visible'); });
  }
  function open(slug, smooth) {
    reveal();
    var tab = slug && document.getElementById('tab-' + slug);
    if (tab) select(tab);
    requestAnimationFrame(function () {
      section.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    });
  }
  function close() {
    section.hidden = true;
    history.replaceState(null, '', location.pathname + location.search);
    var areas = document.getElementById('areas');
    if (areas) areas.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      select(t);
      history.replaceState(null, '', '#sol-' + t.id.replace('tab-', ''));
    });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = null;
      if (k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (k === 'Home') n = tabs[0];
      if (k === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); select(n, true); }
    });
  });

  document.querySelectorAll('[data-tab-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var slug = a.getAttribute('data-tab-link');
      a.blur();
      history.replaceState(null, '', '#sol-' + slug);
      open(slug, true);
    });
  });
  document.querySelectorAll('[data-sol-open]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      a.blur();
      history.replaceState(null, '', '#solucoes');
      open(null, true);
    });
  });
  document.querySelectorAll('[data-sol-close]').forEach(function (b) {
    b.addEventListener('click', close);
  });

  function fromHash() {
    var h = location.hash;
    var m = h.match(/^#sol-(.+)$/);
    if (m) open(m[1], false);
    else if (h === '#solucoes') open(null, false);
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();

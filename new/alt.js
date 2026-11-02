/* РЕГИОН ТУР — альтернативная версия: поведение и анимации */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- страницы: в демо все страницы в одном документе, переключаются по якорю ---------- */
  var pages = $$('.page'), root = document;
  function pageOf(hash) {
    var id = decodeURIComponent((hash || '').replace('#', ''));
    if (!pages.length) return null;
    var byName = pages.filter(function (p) { return p.dataset.page === id; })[0];
    if (byName) return { page: byName };
    var el = id && document.getElementById(id);
    if (el) { var pg = el.closest('.page'); return { page: pg || null, el: el }; }
    return { page: pages[0] };
  }
  function show(hash, first) {
    var r = pageOf(hash); if (!r) return;
    var pg = r.page;
    if (pg && pg !== root) {
      pages.forEach(function (p) { p.hidden = p !== pg; });
      root = pg;
      document.body.className = 'pg-' + pg.dataset.page;
      $$('.hd__nav a, .mnav a').forEach(function (a) {
        if (a.getAttribute('href') === '#' + pg.dataset.page) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
      initPage();
      if (!r.el) window.scrollTo(0, 0);
      window.dispatchEvent(new Event('resize'));
    }
    if (r.el && !first) r.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (r.el) r.el.scrollIntoView();
  }
  if (pages.length) {
    window.addEventListener('hashchange', function () { show(location.hash); });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]'); if (!a) return;
      var h = a.getAttribute('href');
      e.preventDefault();
      if (h === '#') return;
      try { history.pushState(null, '', h); } catch (err) {}
      show(h);
    });
  }

  /* ---------- шапка: плавающая плашка, прячется при прокрутке вниз ---------- */
  var hd = $('.hd'), fab = $('.fab'), lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    hd.classList.toggle('is-solid', y > 40);
    hd.classList.toggle('is-hidden', y > 300 && y > lastY + 4 && !document.body.classList.contains('menu-open'));
    if (y < lastY - 4 || y < 300) hd.classList.remove('is-hidden');
    lastY = y;
    if (fab) fab.classList.toggle('is-on', y > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- мобильное меню ---------- */
  var bt = $('.hd__burger'), mn = $('#mnav');
  function closeMenu() { mn.classList.remove('is-open'); bt.setAttribute('aria-expanded', 'false'); bt.setAttribute('aria-label', 'Открыть меню'); document.body.classList.remove('menu-open'); document.body.style.overflow = ''; }
  if (bt && mn) {
    bt.addEventListener('click', function () {
      var open = mn.classList.toggle('is-open');
      bt.setAttribute('aria-expanded', open); bt.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      document.body.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', mn).forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* ---------- первый экран: дорога, таблички, автобус, параллакс фото ---------- */
  var hero, road, pills, heroImg;
  function placePills() {
    if (!road || !road.getTotalLength) return;
    var svg = road.ownerSVGElement, box = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    if (!box.width) return;
    var vis = pills.filter(function (p) { return p.offsetParent; }), n = vis.length, L = road.getTotalLength();
    vis.forEach(function (p, k) {
      var narrow = innerWidth < 640, from = narrow ? 0.24 : 0.06, span = narrow ? 0.4 : 0.58;
      var at = L * (from + span * (k / Math.max(1, n - 1)));
      var a = road.getPointAtLength(at), b = road.getPointAtLength(Math.min(L, at + 4));
      var x = a.x / vb.width * box.width, y = a.y / vb.height * box.height;
      var ang = Math.atan2((b.y - a.y) / vb.height * box.height, (b.x - a.x) / vb.width * box.width) * 180 / Math.PI;
      if (narrow) ang = Math.max(-12, Math.min(12, ang));
      p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.setProperty('--rot', ang.toFixed(1) + 'deg');
    });
  }
  window.addEventListener('resize', placePills);

  /* ---------- «Наша история» / «Как это работает»: автобус едет по дороге ---------- */
  var route, rpath, rbus;
  function drive() {
    if (!route || !rpath || !rbus || !rbus.offsetParent) return;
    var r = route.getBoundingClientRect(), vh = innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    var svg = rpath.ownerSVGElement, box = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    var L = rpath.getTotalLength(), a = rpath.getPointAtLength(L * p), b = rpath.getPointAtLength(Math.min(L, L * p + 3));
    var x = a.x / vb.width * box.width, y = a.y / vb.height * box.height;
    var ang = Math.atan2((b.y - a.y) / vb.height * box.height, (b.x - a.x) / vb.width * box.width) * 180 / Math.PI;
    rbus.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-62%) rotate(' + ang.toFixed(1) + 'deg)';
  }

  /* ---------- заголовки проявляются по словам в такт прокрутке ---------- */
  var heads = [];
  function splitWords(h) {
    if (h.dataset.split) return;
    h.dataset.split = '1';
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span'); w.className = 'w'; w.textContent = part; frag.appendChild(w);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName.toLowerCase() !== 'svg') walk(c);
      });
    };
    walk(h);
  }
  function paintHeads() {
    var vh = innerHeight;
    heads.forEach(function (h) {
      var r = h.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.92 - r.top) / (vh * 0.38)));
      var ws = h._w || (h._w = $$('.w', h)), n = ws.length;
      ws.forEach(function (w, i) { w.style.opacity = Math.min(1, Math.max(0.16, p * (n + 2) - i)).toFixed(2); });
    });
  }

  /* ---------- общий цикл прокрутки ---------- */
  var ticking = false;
  function frame() {
    ticking = false; drive(); paintHeads();
    if (heroImg && !reduce) { var y = Math.min(window.scrollY, innerHeight); heroImg.style.translate = '0 ' + (y * 0.28).toFixed(1) + 'px'; }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener('resize', frame);

  /* ---------- появление блоков ---------- */
  var io = ('IntersectionObserver' in window && !reduce) ? new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, sibs = el.parentElement ? $$(':scope > .rv', el.parentElement) : [el];
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 90 + 'ms';
      el.classList.add('in'); io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;

  /* ---------- цифры набегают ---------- */
  var io2 = ('IntersectionObserver' in window && !reduce) ? new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return; io2.unobserve(en.target);
      var el = en.target, src = el.dataset.num, m = src.match(/^([\d\s ]+)(.*)$/);
      if (!m) return;
      var target = parseInt(m[1].replace(/\D/g, ''), 10), tail = m[2], spaced = /\s| /.test(m[1].trim()), t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, (now - t0) / 1400), v = Math.round(target * (1 - Math.pow(1 - k, 3)));
        el.textContent = (spaced ? v.toLocaleString('ru-RU') : v) + tail;
        if (k < 1) requestAnimationFrame(step); else el.textContent = src;
      })(t0);
    });
  }, { threshold: .6 }) : null;

  /* ---------- запуск страницы (в демо — при каждом переключении) ---------- */
  function initPage() {
    var R = root;
    hero = $('[data-hero]', R); road = hero && $('.hero__road path', hero); pills = hero ? $$('.pill', hero) : [];
    heroImg = hero && $('.hero__bg img', hero);
    route = $('.route', R); rpath = route && $('.route__line path', route); rbus = route && $('.route__bus', route);
    if (hero) {
      hero.classList.remove('is-in');
      placePills();
      requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); });
      pills.forEach(function (p, i) { p.classList.remove('is-on'); setTimeout(function () { p.classList.add('is-on'); }, reduce ? 0 : 900 + i * 140); });
    }
    heads = [];
    heads.forEach(splitWords);
    $$('.rv', R).forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); });
    $$('.stat__num', R).forEach(function (el) { if (io2) io2.observe(el); });
    $$('.review', R).forEach(function (r) {
      var p = $('.review__text', r), b = $('.review__more', r);
      if (!p || !b || b.dataset.bound) return;
      b.dataset.bound = '1';
      if (p.scrollHeight <= p.clientHeight + 2) { b.hidden = true; return; }
      b.addEventListener('click', function () { r.classList.toggle('is-open'); b.textContent = r.classList.contains('is-open') ? 'Свернуть' : 'Читать целиком'; });
    });
    frame();
  }
  if (pages.length) show(location.hash, true); else initPage();
  if (!io) $$('.rv').forEach(function (el) { el.classList.add('in'); });
  $$('.boarding .rv, #заявка .rv, .ft .rv').forEach(function (el) { if (io) io.observe(el); });

  /* ---------- лента экскурсий: стрелки листают на одну карточку ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.reel__btn'); if (!b) return;
    var track = b.closest('.wrap').querySelector('.reel'), card = track.firstElementChild;
    track.scrollBy({ left: (+b.dataset.dir) * (card.getBoundingClientRect().width + 20), behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------- витрина автопарка: вкладки с автобусами ---------- */
  document.addEventListener('click', function (e) {
    var tab = e.target.closest('.sr__tab'); if (!tab) return;
    var sr = tab.closest('.sr');
    $$('.sr__tab', sr).forEach(function (t) { t.setAttribute('aria-selected', t === tab ? 'true' : 'false'); });
    $$('.sr__panel', sr).forEach(function (p) { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
  });
  document.addEventListener('keydown', function (e) {
    var tab = e.target.closest && e.target.closest('.sr__tab'); if (!tab || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    var all = $$('.sr__tab', tab.closest('.sr')), i = all.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1);
    var next = all[(i + all.length) % all.length]; next.focus(); next.click();
  });

  /* ---------- форма: тот же обработчик send.php, те же поля ---------- */
  var out = $('#f-people');
  $$('.stepper button').forEach(function (b) {
    b.addEventListener('click', function () { var v = Math.max(1, Math.min(99, (+out.textContent || 1) + (+b.dataset.step))); out.textContent = v; });
  });
  var form = $('#contactForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var btn = $('[type="submit"]', form), label = btn.firstChild, text = label.textContent, g = $('input[name="guide"]:checked', form);
    $('#rtMessage').value = 'Человек: ' + out.textContent + '; экскурсовод: ' + (g ? g.value : 'Нет');
    btn.disabled = true; label.textContent = 'Отправляем...';
    fetch('../send.php', { method: 'POST', body: new FormData(form) }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.success) throw new Error();
      label.textContent = 'Заявка отправлена'; form.reset(); out.textContent = '1';
    }).catch(function () {
      label.textContent = 'Не отправилось. Позвоните нам или попробуйте ещё раз';
      setTimeout(function () { label.textContent = text; btn.disabled = false; }, 3500);
    });
  });
})();

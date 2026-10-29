(function(){
  var els=document.querySelectorAll('.rt-fade');
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('visible');io.unobserve(en.target)}})},{threshold:.12});els.forEach(function(e){io.observe(e)});}else{els.forEach(function(e){e.classList.add('visible')})}
  var nums=document.querySelectorAll('[data-count]');
  if('IntersectionObserver' in window){var io2=new IntersectionObserver(function(es){es.forEach(function(en){if(!en.isIntersecting)return;io2.unobserve(en.target);var el=en.target,t=+el.dataset.count,s0=performance.now();
    (function step(n){var k=Math.min((n-s0)/1400,1),v=Math.round(t*(1-Math.pow(1-k,3)));el.textContent=(el.dataset.space?v.toLocaleString('ru-RU').replace(/ /g,' '):v)+el.dataset.suffix;if(k<1)requestAnimationFrame(step)})(s0)})},{threshold:.5});nums.forEach(function(e){io2.observe(e)});}
  var out=document.getElementById('rtPeople'),f=document.getElementById('contactForm'),msg=document.getElementById('rtMessage');
  if(f&&out){f.querySelectorAll('.rt-counter button').forEach(function(bt){bt.addEventListener('click',function(){out.textContent=Math.max(1,parseInt(out.textContent,10)+parseInt(bt.dataset.d,10))})});
    f.addEventListener('submit',function(){var g=f.querySelector('input[name=guide]:checked');msg.value='Человек: '+out.textContent+'; экскурсовод: '+(g?g.value:'Нет')+(document.title?'; страница: '+document.title:'')},true);}
})();

/* ===== Атмосферный фон, привязанный к странице (v45) =====
   Пятна в цветах логотипа разложены по всей высоте страницы, слева и справа по очереди.
   Они лежат «под» контентом и при прокрутке смещаются медленнее текста и вбок —
   поэтому видно, как фон живёт вместе с сайтом, а не просто едет за экраном. */
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var layer = document.createElement('div');
  layer.className = 'rt-aura'; layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);
  var blobs = [], vh = innerHeight, ticking = false;

  function build(){
    var H = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    layer.style.height = H + 'px';
    var step = Math.max(700, vh * 0.95), n = Math.ceil(H / step);
    if (blobs.length === n) { blobs.forEach(function(b, i){ b.y = i * step + step * 0.35; }); return; }
    layer.innerHTML = ''; blobs = [];
    for (var i = 0; i < n; i++) {
      var el = document.createElement('i');
      var left = i % 2 === 0;
      el.className = 'rt-aura__blob ' + (i % 3 === 1 ? 'is-teal' : (i % 3 === 2 ? 'is-sand' : 'is-orange'));
      el.style.top = (i * step + step * 0.35) + 'px';
      el.style[left ? 'left' : 'right'] = '-14vw';
      layer.appendChild(el);
      blobs.push({ el: el, y: i * step + step * 0.35, dir: left ? 1 : -1 });
    }
  }
  function frame(){
    ticking = false;
    var mid = window.scrollY + vh / 2;
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i], p = (b.y - mid) / vh;           // −1…1, пока пятно проходит через экран
      if (p < -2 || p > 2) continue;
      var x = Math.sin(p * 1.3) * 14 * b.dir;           // уплывает вбок, в vw
      var y = p * 140;                                  // отстаёт от текста — параллакс
      var s = 1 + 0.18 * Math.cos(p * 1.6);             // «дышит»
      b.el.style.transform = 'translate3d(' + (-x) + 'vw,' + y + 'px,0) scale(' + s.toFixed(3) + ')';
    }
  }
  function onScroll(){ if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  build(); frame();
  if (!reduce) window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function(){ vh = innerHeight; build(); frame(); });
  window.addEventListener('load', function(){ build(); frame(); });
  setTimeout(function(){ build(); frame(); }, 1500);
})();

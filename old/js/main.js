/* ===================================================
   РЕГИОН ТУР — Main JS
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Burger Menu ---- */
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen);
      // Animate burger icon
      const spans = burger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    // Close when link clicked
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', false);
        burger.querySelectorAll('span').forEach(s => s.style.transform = '');
        burger.querySelector('span:nth-child(2)').style.opacity = '';
      });
    });
  }

  /* ---- Active Nav Link ---- */
  const navLinks = document.querySelectorAll('.main-nav a, .mobile-menu a');
  const page = (window.location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';

  navLinks.forEach(link => {
    const href = (link.getAttribute('href') || '').split('#')[0].replace(/\.html$/, '');
    if (href === page) link.classList.add('active');
  });

  /* ---- Accordion (FAQ) ---- */
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const wasOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.accordion-item.open').forEach(i => {
        i.classList.remove('open');
      });

      // Open clicked if was closed
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---- Header scroll shadow ---- */
  const header = document.querySelector('.site-header');
  if (header) {
    /* класс вместо inline-стиля: браузер не пересчитывает стили на каждый тик прокрутки */
    let stuck = null, hTick = false;
    const updateHeader = () => {
      hTick = false;
      const s = window.scrollY > 10;
      if (s === stuck) return;
      stuck = s;
      header.classList.toggle('is-stuck', s);
    };
    window.addEventListener('scroll', () => {
      if (!hTick) { hTick = true; requestAnimationFrame(updateHeader); }
    }, { passive: true });
    updateHeader();
  }

  /* ---- Smooth anchor scrolling ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---- Contact Form Submission ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Отправляем...';

      // Collect data
      const data = new FormData(contactForm);

      try {
        const res = await fetch('send.php', {
          method: 'POST',
          body: data
        });
        const json = await res.json();
        if (json.success) {
          btn.textContent = '✓ Заявка отправлена!';
          btn.style.background = '#22C55E';
          contactForm.reset();
        } else {
          throw new Error(json.message || 'Ошибка');
        }
      } catch (err) {
        btn.textContent = 'Ошибка. Попробуйте снова';
        btn.style.background = '#EF4444';
        btn.disabled = false;
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }
    });
  }

  /* ---- Animate stats on scroll ---- */
  const statNumbers = document.querySelectorAll('.stat-item__number[data-target]');
  if (statNumbers.length) {
    const animateStat = (el) => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStat(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => io.observe(el));
  }

  /* ---- Fade-in on scroll ---- */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    const fadeIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach(el => fadeIo.observe(el));
  }
});


/* ===== Эффекты прокрутки (общие для всех страниц) ===== */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // полоса прогресса чтения
  var bar=document.createElement('div');bar.className='rt-progress';document.body.appendChild(bar);
  // слова заголовков выезжают из-под маски
  function split(node,idx){
    Array.prototype.slice.call(node.childNodes).forEach(function(n){
      if(n.nodeType===3){
        var f=document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function(part){
          if(!part)return;
          if(/^\s+$/.test(part)){f.appendChild(document.createTextNode(' '));return}
          var w=document.createElement('span');w.className='w';var s=document.createElement('span');s.textContent=part;s.style.setProperty('--i',idx.n++);w.appendChild(s);f.appendChild(w);
        });
        node.replaceChild(f,n);
      }else if(n.nodeType===1&&n.tagName!=='BR'){split(n,idx)}
    });
  }
  var titles=document.querySelectorAll('.rt-title,.section-title,.page-hero__title');
  titles.forEach(function(t){split(t,{n:0});t.classList.add('rt-split')});
  // ступенчатые задержки у соседних блоков
  var groups=new Map();
  document.querySelectorAll('.rt-fade,.fade-in').forEach(function(e){var p=e.parentElement;if(!groups.has(p))groups.set(p,[]);groups.get(p).push(e)});
  groups.forEach(function(list){if(list.length>1)list.forEach(function(e,i){e.style.transitionDelay=(i*0.11)+'s'})});
  // появление
  var targets=document.querySelectorAll('.rt-split,[data-reveal],.rt-map-block');
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.2});
    targets.forEach(function(t){io.observe(t)});
  }else{targets.forEach(function(t){t.classList.add('in')})}
  // параллакс: элементы с data-speed смещаются относительно прокрутки
  /* параллакс и полоса прогресса: ни одного измерения вёрстки во время прокрутки.
     Размеры снимаем один раз и пересчитываем только при resize — иначе браузер
     на каждом кадре заново считает всю страницу, и прокрутка лагает. */
  var par=[],tick=false,docH=0,vh=0,last=-1;
  document.querySelectorAll('[data-speed]').forEach(function(e){par.push({el:e,k:parseFloat(e.dataset.speed)||0,top:0,h:0})});
  function measure(){
    vh=innerHeight;
    docH=document.documentElement.scrollHeight-vh;
    par.forEach(function(p){var r=p.el.getBoundingClientRect();p.top=r.top+scrollY;p.h=r.height});
  }
  function frame(){
    tick=false;
    var y=scrollY;
    var prog=docH>0?Math.min(1,Math.max(0,y/docH)):0;
    bar.style.transform='scaleX('+prog.toFixed(4)+')';
    if(reduce)return;
    for(var i=0;i<par.length;i++){
      var p=par[i], top=p.top-y;
      if(top+p.h<-200||top>vh+200) continue;
      p.el.style.translate='0 '+(-(top+p.h/2-vh/2)*p.k).toFixed(1)+'px';
    }
    last=y;
  }
  function on(){if(!tick){tick=true;requestAnimationFrame(frame)}}
  addEventListener('scroll',on,{passive:true});
  addEventListener('resize',function(){measure();on()});
  addEventListener('load',function(){measure();on()});
  measure();frame();
})();

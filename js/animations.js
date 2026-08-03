/* ============================================================
   animations.js — Microinterações e animações de scroll
   Tudo baseado em transform / opacity e requestAnimationFrame.
   A experiência deve transmitir calma: nada exagerado.
============================================================ */
(function(){
  'use strict';

  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Reveal on scroll (fade + translate) ---------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-img');
  if('IntersectionObserver' in window && !reducedMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -60px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------- Título do hero: split em palavras mascaradas ---------- */
  (function splitHero(){
    var el = document.getElementById('heroHeadline');
    if(!el) return;
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function(w){
      return '<span class="split-line"><span class="split-word">' + w + '</span></span>';
    }).join(' ');
    el.querySelectorAll('.split-word').forEach(function(w, i){
      w.style.transitionDelay = (0.35 + i * 0.045) + 's';
    });
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ el.classList.add('split-ready'); });
    });
  })();

  /* ---------- Citação revelada palavra por palavra ---------- */
  (function wordReveal(){
    var el = document.querySelector('[data-word-reveal]');
    if(!el) return;
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function(w){ return '<span class="qword">' + w + '</span>'; }).join(' ');
    var qwords = el.querySelectorAll('.qword');
    if(!('IntersectionObserver' in window) || reducedMotion){
      qwords.forEach(function(w){ w.classList.add('is-visible'); });
      return;
    }
    var qio = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          qwords.forEach(function(w, i){
            setTimeout(function(){ w.classList.add('is-visible'); }, i * 28);
          });
          qio.unobserve(entry.target);
        }
      });
    }, { threshold:0.55 });
    qio.observe(el);
  })();

  /* ---------- Contadores animados ---------- */
  (function counters(){
    var els = document.querySelectorAll('[data-count-to]');
    if(!els.length) return;
    if(reducedMotion || !('IntersectionObserver' in window)){
      els.forEach(function(el){ el.textContent = el.getAttribute('data-count-prefix') || ''; el.textContent += el.getAttribute('data-count-to'); });
      return;
    }
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
        var prefix = el.getAttribute('data-count-prefix') || '';
        var dur = 1400, start = null;
        function step(ts){
          if(!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(eased * target);
          if(p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold:0.6 });
    els.forEach(function(el){ cio.observe(el); });
  })();

  /* ---------- Parallax leve na galeria horizontal ---------- */
  (function galleryParallax(){
    var scroller = document.getElementById('galleryScroller');
    if(!scroller || reducedMotion) return;
    var imgs = scroller.querySelectorAll('.gallery-item img');
    var ticking = false;

    function update(){
      var vw = window.innerWidth;
      imgs.forEach(function(img){
        var rect = img.getBoundingClientRect();
        var center = rect.left + rect.width / 2;
        var offset = (center - vw / 2) / vw; // -0.5 .. 0.5
        // deslocamento vertical sutil (imagem é 120% de altura)
        img.style.transform = 'translateY(' + (offset * -14).toFixed(2) + 'px)';
      });
      ticking = false;
    }
    function onScroll(){
      if(!ticking){ requestAnimationFrame(update); ticking = true; }
    }
    scroller.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', onScroll, { passive:true });
    update();
  })();

  /* ---------- Ripple discreto nos botões ---------- */
  (function ripple(){
    if(reducedMotion) return;
    document.querySelectorAll('.btn').forEach(function(btn){
      btn.addEventListener('pointerdown', function(e){
        var r = btn.getBoundingClientRect();
        var size = Math.max(r.width, r.height);
        var span = document.createElement('span');
        span.className = 'ripple';
        span.style.width = span.style.height = size + 'px';
        span.style.left = (e.clientX - r.left - size/2) + 'px';
        span.style.top = (e.clientY - r.top - size/2) + 'px';
        btn.appendChild(span);
        setTimeout(function(){ span.remove(); }, 600);
      });
    });
  })();

})();

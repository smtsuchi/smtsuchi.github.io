/* ============================================================
   shoha.info — no dependencies
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sticky nav + back-to-top --------------------- */
  var nav = document.getElementById('nav');
  var toTop = document.getElementById('toTop');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 16);
    toTop.classList.toggle('show', y > 640);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ---------- mobile menu ---------------------------------- */
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');

  function closeMenu() {
    links.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });

  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- scroll reveal -------------------------------- */
  var revealables = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- scroll spy ----------------------------------- */
  var navAnchors = Array.prototype.slice.call(links.querySelectorAll('a'));
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var visible = new Map();

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      var bestId = null;
      var bestRatio = 0;
      visible.forEach(function (ratio, id) {
        if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
      });

      navAnchors.forEach(function (a) {
        a.classList.toggle('is-active', bestId !== null && a.getAttribute('href') === '#' + bestId);
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- hero type rotator ---------------------------- */
  var typed = document.getElementById('typed');

  if (typed) {
    var phrases = [
      'automation that runs itself.',
      'crawlers that survive real websites.',
      'LLM pipelines with guardrails.',
      'admin tools people actually trust.',
      'full-stack products, end to end.'
    ];

    if (reduced) {
      typed.textContent = phrases[0];
    } else {
      var TYPE_MS = 42;
      var ERASE_MS = 22;
      var HOLD_MS = 1900;

      var pi = 0;
      var ci = 0;
      var erasing = false;

      (function tick() {
        var word = phrases[pi];
        typed.textContent = word.slice(0, ci);

        var delay;
        if (!erasing) {
          if (ci < word.length) {
            ci++;
            delay = TYPE_MS;
          } else {
            erasing = true;
            delay = HOLD_MS;
          }
        } else if (ci > 0) {
          ci--;
          delay = ERASE_MS;
        } else {
          erasing = false;
          pi = (pi + 1) % phrases.length;
          delay = 320;
        }

        setTimeout(tick, delay);
      })();
    }
  }

  /* ---------- copy email ----------------------------------- */
  var copyBtn = document.getElementById('copyBtn');
  var mailLink = document.getElementById('mailLink');

  if (copyBtn && mailLink) {
    var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
    var original = copyBtn.innerHTML;
    var resetTimer;

    function flashCopied() {
      copyBtn.innerHTML = CHECK;
      copyBtn.classList.add('done');
      copyBtn.setAttribute('aria-label', 'Email address copied');
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        copyBtn.innerHTML = original;
        copyBtn.classList.remove('done');
        copyBtn.setAttribute('aria-label', 'Copy email address');
      }, 1800);
    }

    copyBtn.addEventListener('click', function () {
      var email = mailLink.textContent.trim();

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(flashCopied).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        var ta = document.createElement('textarea');
        ta.value = email;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); flashCopied(); } catch (err) { /* no-op */ }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- footer year ---------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

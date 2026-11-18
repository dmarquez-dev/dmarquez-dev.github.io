// Theme toggle and scroll reveal. The page is complete without this file.
(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'theme';
  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  // ---------- Theme ----------

  function effectiveTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return darkQuery && darkQuery.matches ? 'dark' : 'light';
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) { /* storage unavailable: the choice lasts for this visit only */ }
  }

  var toggle = document.getElementById('theme-toggle');

  function syncToggle() {
    if (toggle) toggle.setAttribute('aria-pressed', String(effectiveTheme() === 'dark'));
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      saveTheme(next);
      syncToggle();
    });
  }
  if (darkQuery && darkQuery.addEventListener) darkQuery.addEventListener('change', syncToggle);
  syncToggle();

  // ---------- Reveal ----------

  var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  // Reveal with a short stagger inside each batch that enters together, then
  // clear the stagger so later hovers respond immediately.
  var STAGGER_MS = 80;
  var REVEAL_MS = 400;

  function show(el, order) {
    el.style.setProperty('--i', String(order));
    el.classList.add('is-visible');
    setTimeout(function () { el.style.setProperty('--i', '0'); }, REVEAL_MS + order * STAGGER_MS);
  }

  // The CSS fallback shows everything after 2.5s if this script hasn't run.
  // Starting later than that, the cards are already on screen: keep them there.
  var FALLBACK_MS = 2400;
  var startedLate = window.performance && performance.now() > FALLBACK_MS;

  if (startedLate || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { show(el, 0); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.filter(function (entry) { return entry.isIntersecting; })
        .forEach(function (entry, order) {
          show(entry.target, order);
          observer.unobserve(entry.target);
        });
    }, { threshold: 0.15 });
    items.forEach(function (el) { observer.observe(el); });
  }

  // Tell the CSS fallback that reveals are handled here.
  root.classList.add('reveal-ready');

  // The hero's one orchestrated moment: let the motifs settle in.
  var art = document.querySelector('.hero__art');
  if (art) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { art.classList.add('is-settled'); });
    });
  }
})();

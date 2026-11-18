// Theme toggle and scroll reveal. The page is complete without this file.
(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'theme';
  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  root.classList.add('js');

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
  items.forEach(function (el, i) { el.style.setProperty('--i', String(i)); });

  function show(el) { el.classList.add('is-visible'); }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { observer.observe(el); });
  } else {
    items.forEach(show);
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

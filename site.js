/* =========================================================
   Dera Crunch: shared behaviour for every page
   Hamburger menu, back-to-top button, scroll reveal, cart badge.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Mobile hamburger menu ---------- */
  var menuBtn = document.getElementById('menu-btn');
  var nav = document.getElementById('main-nav');

  function setMenu(open) {
    if (!menuBtn || !nav) return;
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') !== 'true';
      setMenu(open);
      if (open) {
        var first = nav.querySelector('a');
        if (first) first.focus();
      }
    });
    // Close after picking a link (also handles same-page #anchors)
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });
    // Close when tapping outside the header
    document.addEventListener('click', function (e) {
      if (menuBtn.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-header')) setMenu(false);
    });
    // Reset if the screen grows past phone size
    window.addEventListener('resize', function () {
      if (window.innerWidth > 720) setMenu(false);
    });
  }

  /* ---------- Back to top ---------- */
  var topBtn = document.getElementById('back-to-top');
  if (topBtn) {
    var onScroll = function () {
      topBtn.classList.toggle('is-visible', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    topBtn.addEventListener('click', function () {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      var skip = document.querySelector('.skip-link');
      // Move keyboard focus back to the top of the page too
      var brand = document.querySelector('.brand');
      if (brand) brand.focus({ preventScroll: true });
      else if (skip) skip.focus({ preventScroll: true });
    });
  }

  /* ---------- Scroll reveal (fade sections in) ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reveals.length && 'IntersectionObserver' in window && !reduceMotion) {
    document.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Saved-cart badge on pages without the cart drawer ---------- */
  var badge = document.querySelector('[data-saved-cart-count]');
  if (badge) {
    try {
      var saved = JSON.parse(localStorage.getItem('deraCrunchCart.v2') || '[]');
      var qty = Array.isArray(saved) ? saved.reduce(function (s, l) { return s + (Number(l && l.qty) || 0); }, 0) : 0;
      badge.textContent = String(qty);
      badge.setAttribute('aria-label', qty + (qty === 1 ? ' item' : ' items') + ' in cart');
    } catch (err) { /* storage blocked: leave at 0 */ }
  }
})();

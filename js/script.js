(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Mobile nav toggle
  // --------------------------------------------------------------------------
  var navToggle = document.querySelector('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var isOpen = document.body.hasAttribute('data-nav-open');
      if (isOpen) {
        document.body.removeAttribute('data-nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      } else {
        document.body.setAttribute('data-nav-open', '');
        navToggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Close mobile nav when any link inside it is followed
    document.querySelectorAll('.mobile-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.removeAttribute('data-nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.hasAttribute('data-nav-open')) {
        document.body.removeAttribute('data-nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  // --------------------------------------------------------------------------
  // FAQ — single-open accordion behaviour
  // --------------------------------------------------------------------------
  var faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });

  // --------------------------------------------------------------------------
  // Sticky "Book a free call" — fade in after hero leaves viewport
  // --------------------------------------------------------------------------
  var stickyCta = document.querySelector('.sticky-cta');
  var hero = document.querySelector('.hero');

  if (stickyCta && hero && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            stickyCta.classList.remove('visible');
          } else {
            stickyCta.classList.add('visible');
          }
        });
      },
      { threshold: 0, rootMargin: '-40px 0px 0px 0px' }
    );
    observer.observe(hero);
  } else if (stickyCta) {
    // Fallback: always show
    stickyCta.classList.add('visible');
  }

  // --------------------------------------------------------------------------
  // Current year in footer
  // --------------------------------------------------------------------------
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

// =============================================================================
// HOMEPAGE ANIMATIONS (scroll reveal, word-by-word hero, count-up)
// Scoped to pages with .hero-cinematic; respects prefers-reduced-motion
// =============================================================================

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

  const isHomePage = !!document.querySelector('.hero-cinematic');

  if (isHomePage) {

    // ── 1. Word-by-word H1 animation ──────────────────────────────────────────
    const heroH1 = document.querySelector('.hero-cinematic__h1');
    if (heroH1) {
      const raw = heroH1.textContent.trim();
      heroH1.innerHTML = raw.split(' ').map((word, i) =>
        `<span class="hw" style="animation-delay:${i * 85}ms" aria-hidden="true">${word}</span>`
      ).join(' ');
      // Keep accessible label on the h1 via aria-label (already set in HTML)
    }

    // ── 2. Add .reveal to scroll-animated elements ────────────────────────────
    const revealTargets = document.querySelectorAll(
      '.card, .audience-card, .stat, .pillar-card, .testimonial, .step'
    );
    revealTargets.forEach(el => el.classList.add('reveal'));

    document.querySelectorAll('.section__head h2').forEach(el => {
      el.classList.add('reveal', 'reveal--left');
    });

    // ── 3. IntersectionObserver — staggered reveal ────────────────────────────
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // Stagger based on sibling index within the same parent
        const siblings = Array.from(
          el.parentElement.querySelectorAll('.reveal:not(.revealed)')
        );
        const idx = Array.from(el.parentElement.children).indexOf(el);
        el.style.transitionDelay = Math.max(0, idx * 100) + 'ms';
        el.classList.add('revealed');
        revealObserver.unobserve(el);
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    });

    revealTargets.forEach(el => revealObserver.observe(el));
    document.querySelectorAll('.reveal--left').forEach(el => revealObserver.observe(el));

    // ── 4. Count-up for stats ──────────────────────────────────────────────────
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1400;
        const startTime = performance.now();

        const tick = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out quad
          const eased = 1 - Math.pow(1 - progress, 2);
          const current = Math.round(eased * target);
          el.textContent = (current >= 1000
            ? current.toLocaleString('en-GB')
            : current) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

  } // end isHomePage

} // end prefers-reduced-motion

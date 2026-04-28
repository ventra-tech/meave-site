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

    document.querySelectorAll('.mobile-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.removeAttribute('data-nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.hasAttribute('data-nav-open')) {
        document.body.removeAttribute('data-nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  // --------------------------------------------------------------------------
  // FAQ — single-open accordion
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
  // Sticky CTA — show after hero leaves viewport
  // Handles both .hero-cinematic (home) and .page-hero (inner pages)
  // --------------------------------------------------------------------------
  var stickyCta = document.querySelector('.sticky-cta');
  var heroEl    = document.querySelector('.hero-cinematic') ||
                  document.querySelector('.page-hero');

  if (stickyCta && heroEl && 'IntersectionObserver' in window) {
    var stickyObserver = new IntersectionObserver(
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
    stickyObserver.observe(heroEl);
  } else if (stickyCta) {
    stickyCta.classList.add('visible');
  }

  // --------------------------------------------------------------------------
  // Current year in footer
  // --------------------------------------------------------------------------
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();


// =============================================================================
// ANIMATION SYSTEM
// Respects prefers-reduced-motion throughout
// =============================================================================

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --------------------------------------------------------------------------
  // 1. PAGE TRANSITION — fade out on internal link click
  //    (fade-in handled by @keyframes pageIn in CSS)
  // --------------------------------------------------------------------------
  if (!reducedMotion) {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (
        !href ||
        href.charAt(0) === '#' ||
        href.indexOf('mailto:') === 0 ||
        href.indexOf('tel:')    === 0 ||
        link.target === '_blank'
      ) return;

      link.addEventListener('click', function (e) {
        e.preventDefault();
        var dest = href;
        document.body.style.transition = 'opacity 0.28s ease';
        document.body.style.opacity    = '0';
        setTimeout(function () { window.location.href = dest; }, 290);
      });
    });
  }

  // --------------------------------------------------------------------------
  // 2. SCROLL REVEAL — all pages
  //    Elements fade + slide up on scroll into view, staggered within groups
  // --------------------------------------------------------------------------
  if (!reducedMotion && 'IntersectionObserver' in window) {

    var revealTargets = [
      '.card',
      '.testimonial',
      '.stat',
      '.step',
      '.package-card',
      '.audience-card',
      '.pillar-card',
      '.credential-list li',
      '.pull-quote',
      '.trust-seal',
      '.trust-bar__meta',
      '.about-split > div',
      '.prose-split__aside'
    ].join(',');

    document.querySelectorAll(revealTargets).forEach(function (el) {
      el.classList.add('reveal');
    });

    // Section headings — slide in from left
    document.querySelectorAll('.section__head h2').forEach(function (el) {
      el.classList.add('reveal', 'reveal--left');
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;

        // Stagger by position among visible siblings
        var siblings = Array.from(el.parentElement.children);
        var idx = siblings.indexOf(el);
        el.style.transitionDelay = Math.min(idx * 80, 320) + 'ms';

        el.classList.add('revealed');
        revealObserver.unobserve(el);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -48px 0px'
    });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // --------------------------------------------------------------------------
  // 3. HOMEPAGE HERO ENTRANCE + WORD-SPLIT + COUNT-UP
  // --------------------------------------------------------------------------
  if (!reducedMotion && document.querySelector('.hero-cinematic')) {

    // --- 3a. Activate sub-element entrance animations via .hero-anim class ---
    var heroSection = document.querySelector('.hero-cinematic');
    heroSection.classList.add('hero-anim');

    // --- 3b. Word-by-word H1 split ---
    var heroH1 = document.querySelector('.hero-cinematic__h1');
    if (heroH1) {
      var label = heroH1.getAttribute('aria-label') || heroH1.textContent.trim();
      heroH1.innerHTML = label.split(' ').map(function (word, i) {
        return '<span class="hw" style="animation-delay:' + (300 + i * 85) + 'ms" aria-hidden="true">' + word + '</span>';
      }).join(' ');
      // aria-label on h1 already carries the full accessible text
    }

    // --- 3c. Count-up for stats ---
    if ('IntersectionObserver' in window) {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el      = entry.target;
          var target  = parseInt(el.dataset.count, 10);
          var suffix  = el.dataset.suffix || '';
          var dur     = 1600; // ms
          var t0      = performance.now();

          (function tick(now) {
            var progress = Math.min((now - t0) / dur, 1);
            var eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            var current  = Math.round(eased * target);

            el.textContent = (current >= 1000
              ? current.toLocaleString('en-GB')
              : current) + suffix;

            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              el.classList.add('stat__num--done'); // accent colour pop at finish
            }
          })(t0);

          countObserver.unobserve(el);
        });
      }, { threshold: 0.4 });

      document.querySelectorAll('[data-count]').forEach(function (el) {
        countObserver.observe(el);
      });
    }
  }

})();

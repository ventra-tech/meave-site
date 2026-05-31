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

  // --------------------------------------------------------------------------
  // Video play cue — hide once the intro video starts
  // --------------------------------------------------------------------------
  document.querySelectorAll('.video-embed video').forEach(function (video) {
    var cue = video.parentElement && video.parentElement.querySelector('.video-play-cue');
    if (!cue) return;
    video.addEventListener('play', function () {
      cue.style.display = 'none';
    });
  });

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


// =============================================================================
// 4. LOGO BELT — infinite scrolling ticker on all logo strips
//    Wraps .logo-strip__row in .logo-belt, duplicates logos for seamless loop
// =============================================================================

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.logo-strip__row').forEach(function (row) {
    // Count logos to set a proportional speed (5s per item, min 25s)
    var itemCount = row.querySelectorAll('.logo-strip__item').length;
    var duration  = Math.max(25, itemCount * 5) + 's';

    // Wrap row in the belt container
    var belt = document.createElement('div');
    belt.className = 'logo-belt';
    row.parentNode.insertBefore(belt, row);
    belt.appendChild(row);

    if (reducedMotion) return; // leave as static flex if reduced motion

    // Duplicate logos for seamless loop (translateX -50% = back to start)
    row.innerHTML = row.innerHTML + row.innerHTML;
    row.classList.add('logo-belt__track');
    row.style.setProperty('--belt-duration', duration);
  });

})();


// =============================================================================
// 5. STICKY IN-PAGE NAV — smooth scroll + scroll-spy
//    Used on inner pages only (about, for-parents, for-schools, for-organisations)
// =============================================================================

(function () {
  'use strict';

  var stickyNav = document.querySelector('.page-nav-sticky');
  if (!stickyNav) return;

  var pills = Array.prototype.slice.call(
    stickyNav.querySelectorAll('.page-nav-sticky__pill')
  );
  if (!pills.length) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Resolve each pill -> its target section element
  var sections = pills
    .map(function (p) {
      var href = p.getAttribute('href');
      return href && href.charAt(0) === '#' ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  // ── Smooth-scroll on click (manual offset for header + sticky nav) ────────
  pills.forEach(function (pill) {
    pill.addEventListener('click', function (e) {
      var href = pill.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      e.stopPropagation(); // prevent the page-transition fade handler from also firing

      var header   = document.querySelector('.site-header');
      var navH     = stickyNav.offsetHeight || 0;
      var headerH  = header ? header.offsetHeight : 0;
      var offset   = headerH + navH + 16;
      var top      = target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: top,
        behavior: reducedMotion ? 'auto' : 'smooth'
      });

      // Update URL hash without jumping
      if (history.replaceState) {
        history.replaceState(null, '', href);
      }
    });
  });

  // ── Scroll-spy via IntersectionObserver ───────────────────────────────────
  if ('IntersectionObserver' in window && sections.length) {
    var setActive = function (id) {
      pills.forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('href') === '#' + id);
      });
    };

    var spy = new IntersectionObserver(function (entries) {
      // Pick the entry with the largest intersection ratio that's actually intersecting
      var best = null;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
      });
      if (best && best.target.id) setActive(best.target.id);
    }, {
      // Section is "active" when its top crosses the upper third of the viewport
      rootMargin: '-30% 0px -55% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    sections.forEach(function (s) { spy.observe(s); });
  }

  // ── On page load, if URL has a hash, mark that pill active ──────────────
  var initialHash = window.location.hash;
  if (initialHash) {
    pills.forEach(function (p) {
      if (p.getAttribute('href') === initialHash) p.classList.add('is-active');
    });
  }

})();


// =============================================================================
// 6. PROGRAMME TABS (Primary / Secondary on for-schools.html)
//    CSS handles state via :checked. JS only ensures keyboard arrow nav.
// =============================================================================

(function () {
  'use strict';

  var tabs = document.querySelectorAll('.programme-tabs__head label[role="tab"]');
  if (!tabs.length) return;

  tabs.forEach(function (label, idx) {
    label.setAttribute('tabindex', '0');
    label.addEventListener('keydown', function (e) {
      var nextIdx = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + tabs.length) % tabs.length;
      if (nextIdx !== null) {
        e.preventDefault();
        tabs[nextIdx].focus();
        tabs[nextIdx].click();
      }
    });
  });

})();

/* Contact form — reveal extra detail field when "Something else" is selected */
(function () {
  'use strict';

  var select = document.getElementById('audience-select');
  var otherField = document.getElementById('audience-other-field');
  if (!select || !otherField) return;

  function sync() {
    otherField.hidden = select.value !== 'Something else';
  }

  select.addEventListener('change', sync);
  sync();
})();

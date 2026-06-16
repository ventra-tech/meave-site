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
        // Defensive: clear any stuck inline opacity/transform from the
        // page-transition fade-out so the menu never opens invisible.
        document.body.style.transition = '';
        document.body.style.opacity = '';
        var mobileNavEl = document.getElementById('mobile-nav');
        if (mobileNavEl) {
          mobileNavEl.style.opacity = '';
          mobileNavEl.style.transform = '';
          mobileNavEl.style.visibility = '';
          mobileNavEl.style.display = '';
          // Also wipe inline styles on every descendant — covers the case
          // where a transition / animation library has left a child element
          // at opacity:0 or visibility:hidden that we'd otherwise inherit.
          var descendants = mobileNavEl.querySelectorAll('*');
          for (var i = 0; i < descendants.length; i++) {
            var d = descendants[i];
            d.style.opacity = '';
            d.style.visibility = '';
            d.style.transform = '';
          }
        }
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
  // Sticky CTA — float the "Book a free call" button after hero scrolls out.
  // Uses a plain scroll listener (more reliable than IntersectionObserver on
  // iOS Safari, especially after page transitions/bfcache).
  // --------------------------------------------------------------------------
  var stickyCta = document.querySelector('.sticky-cta');
  if (stickyCta) {
    var heroEl = document.querySelector('.hero-cinematic') ||
                 document.querySelector('.page-hero');

    var updateStickyCta = function () {
      // If the menu is open we leave it hidden via CSS (see [data-nav-open]).
      var shouldShow = heroEl
        ? heroEl.getBoundingClientRect().bottom < 40
        : window.scrollY > 200;
      stickyCta.classList.toggle('visible', shouldShow);
    };

    window.addEventListener('scroll', updateStickyCta, { passive: true });
    window.addEventListener('resize', updateStickyCta);
    window.addEventListener('pageshow', function () {
      // Wipe any stuck inline styles that bfcache may have restored, then
      // re-evaluate visibility against the current scroll position.
      stickyCta.style.opacity = '';
      stickyCta.style.transform = '';
      stickyCta.style.display = '';
      updateStickyCta();
    });
    updateStickyCta();
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
  // Clear any stuck inline opacity from the fade-out — runs on initial load AND
  // on bfcache restore (back/forward). Without this, returning to the page can
  // leave <body style="opacity:0"> and the entire page (including the mobile
  // nav) renders blank.
  window.addEventListener('pageshow', function () {
    document.body.style.transition = '';
    document.body.style.opacity = '';
  });

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

  // ── Keep the active pill scrolled into view inside the orange bar ────────
  var pillScrollContainer = stickyNav.querySelector('.container');
  var scrollPillIntoView = function (pill) {
    if (!pill || !pillScrollContainer) return;
    if (pillScrollContainer.scrollWidth <= pillScrollContainer.clientWidth) return;
    var pillRect = pill.getBoundingClientRect();
    var contRect = pillScrollContainer.getBoundingClientRect();
    var offsetWithinContainer = pillRect.left - contRect.left + pillScrollContainer.scrollLeft;
    var target = offsetWithinContainer - (pillScrollContainer.clientWidth - pill.clientWidth) / 2;
    var maxScroll = pillScrollContainer.scrollWidth - pillScrollContainer.clientWidth;
    pillScrollContainer.scrollTo({
      left: Math.max(0, Math.min(maxScroll, target)),
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
  };

  // ── Scroll-spy via IntersectionObserver ───────────────────────────────────
  if ('IntersectionObserver' in window && sections.length) {
    var setActive = function (id) {
      var activePill = null;
      pills.forEach(function (p) {
        var match = p.getAttribute('href') === '#' + id;
        p.classList.toggle('is-active', match);
        if (match) activePill = p;
      });
      scrollPillIntoView(activePill);
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
      if (p.getAttribute('href') === initialHash) {
        p.classList.add('is-active');
        scrollPillIntoView(p);
      }
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

/* Dual-question interactive — Parenting today / Triple P */
(function () {
  'use strict';

  var grid = document.querySelector('[data-dual-question]');
  if (!grid) return;

  var panels = grid.querySelectorAll('.dual-question__panel');

  panels.forEach(function (panel) {
    var trigger = panel.querySelector('.dual-question__trigger');
    var body = panel.querySelector('.dual-question__body');
    if (!trigger || !body) return;

    trigger.addEventListener('click', function () {
      var isOpen = panel.classList.contains('is-open');

      // Close all panels first
      panels.forEach(function (p) {
        p.classList.remove('is-open');
        var t = p.querySelector('.dual-question__trigger');
        var b = p.querySelector('.dual-question__body');
        if (t) t.setAttribute('aria-expanded', 'false');
        if (b) b.setAttribute('hidden', '');
      });

      if (!isOpen) {
        panel.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        body.removeAttribute('hidden');
        grid.classList.add('has-active');
      } else {
        grid.classList.remove('has-active');
      }
    });
  });
})();

/* Contact form — reveal name field for School or Organisation */
(function () {
  'use strict';

  var select = document.getElementById('audience-select');
  var otherField = document.getElementById('audience-other-field');
  var otherLabel = document.getElementById('audience-other-label');
  var otherInput = document.getElementById('audience-other-input');
  if (!select || !otherField) return;

  function sync() {
    var val = select.value;
    if (val === 'School') {
      otherField.hidden = false;
      otherLabel.textContent = 'Name of school';
      otherInput.placeholder = 'Name of your school';
    } else if (val === 'Organisation') {
      otherField.hidden = false;
      otherLabel.textContent = 'Name of organisation';
      otherInput.placeholder = 'Name of your organisation';
    } else {
      otherField.hidden = true;
    }
  }

  select.addEventListener('change', sync);
  sync();
})();

/* Testimonials carousel — mobile-only auto-rotate + arrows + dots */
(function () {
  'use strict';

  var carousel = document.querySelector('[data-testimonial-carousel]');
  if (!carousel) return;

  var track = carousel.querySelector('.testimonials-carousel__track');
  if (!track) return;

  var slides = Array.prototype.slice.call(track.querySelectorAll('.testimonial'));
  if (slides.length < 2) return;

  var dots = Array.prototype.slice.call(carousel.querySelectorAll('.testimonials-carousel__dot'));
  var prevBtn = carousel.querySelector('.testimonials-carousel__btn--prev');
  var nextBtn = carousel.querySelector('.testimonials-carousel__btn--next');

  var mobileMQ = window.matchMedia('(max-width: 767px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var current = 0;
  var autoPlayEnabled = !reducedMotion;
  var timer = null;
  var DELAY = 5000;

  function scrollToSlide(idx, smooth) {
    var slide = slides[idx];
    if (!slide) return;
    var left = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
    track.scrollTo({
      left: left,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  function setActive(idx) {
    current = (idx + slides.length) % slides.length;
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
  }

  function goTo(idx, smooth) {
    setActive(idx);
    scrollToSlide(current, smooth);
  }

  function startAutoPlay() {
    if (!autoPlayEnabled || !mobileMQ.matches) return;
    stopAutoPlay();
    timer = setInterval(function () {
      goTo(current + 1, true);
    }, DELAY);
  }

  function stopAutoPlay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function killAutoPlay() {
    autoPlayEnabled = false;
    stopAutoPlay();
  }

  if (prevBtn) prevBtn.addEventListener('click', function () {
    killAutoPlay();
    goTo(current - 1, true);
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    killAutoPlay();
    goTo(current + 1, true);
  });
  dots.forEach(function (d, i) {
    d.addEventListener('click', function () {
      killAutoPlay();
      goTo(i, true);
    });
  });

  track.addEventListener('touchstart', killAutoPlay, { passive: true });
  track.addEventListener('wheel', killAutoPlay, { passive: true });

  // Keep dot indicator in sync when user scroll-snaps manually
  var scrollDebounce = null;
  track.addEventListener('scroll', function () {
    if (scrollDebounce) clearTimeout(scrollDebounce);
    scrollDebounce = setTimeout(function () {
      var trackRect = track.getBoundingClientRect();
      var center = trackRect.left + trackRect.width / 2;
      var bestIdx = 0;
      var bestDist = Infinity;
      slides.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        var slideCenter = r.left + r.width / 2;
        var dist = Math.abs(slideCenter - center);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });
      if (bestIdx !== current) setActive(bestIdx);
    }, 80);
  }, { passive: true });

  // Pause auto-play when carousel scrolls offscreen
  if ('IntersectionObserver' in window) {
    var visObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) startAutoPlay();
        else stopAutoPlay();
      });
    }, { threshold: 0.35 });
    visObs.observe(carousel);
  } else {
    startAutoPlay();
  }

  // Restart / clear on viewport change
  if (mobileMQ.addEventListener) {
    mobileMQ.addEventListener('change', function (e) {
      if (e.matches) startAutoPlay();
      else stopAutoPlay();
    });
  }

  setActive(0);
})();

/* Mobile nav — collapsible submenus (injects chevron buttons at runtime) */
(function () {
  'use strict';

  var nav = document.querySelector('.mobile-nav');
  if (!nav) return;

  var items = nav.querySelectorAll('.mobile-nav__item--has-menu');
  if (!items.length) return;

  // Helper: get a direct child of `parent` matching `className` without
  // using `:scope`, which can throw on older iOS Safari builds.
  function firstChildWithClass(parent, className) {
    var kids = parent.children;
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].classList && kids[i].classList.contains(className)) {
        return kids[i];
      }
    }
    return null;
  }

  var enhanced = 0;

  try {
    items.forEach(function (item, idx) {
      var link = firstChildWithClass(item, 'mobile-nav__link');
      var submenu = firstChildWithClass(item, 'mobile-nav__submenu');
      if (!link || !submenu) return;

      var submenuId = submenu.id || ('mobile-nav-sub-' + idx);
      submenu.id = submenuId;

      var row = document.createElement('div');
      row.className = 'mobile-nav__row';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mobile-nav__expand';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', submenuId);
      btn.setAttribute('aria-label', 'Show ' + link.textContent.trim() + ' sub-pages');
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

      link.parentNode.insertBefore(row, link);
      row.appendChild(link);
      row.appendChild(btn);

      btn.addEventListener('click', function () {
        var isOpen = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      enhanced++;
    });
  } catch (err) {
    enhanced = 0;
  }

  // Only switch the nav into collapsible mode if we successfully enhanced
  // every item. If anything failed, fall back to the always-visible state
  // rather than leaving the menu half-broken.
  if (enhanced === items.length) {
    nav.setAttribute('data-collapsible', '');
  }
})();

/* Credentials carousel — mobile-only auto-rotate + arrows + dots */
(function () {
  'use strict';

  var carousel = document.querySelector('[data-credentials-carousel]');
  if (!carousel) return;

  var track = carousel.querySelector('.credentials-carousel__track');
  if (!track) return;

  var slides = Array.prototype.slice.call(track.children);
  if (slides.length < 2) return;

  var dots = Array.prototype.slice.call(carousel.querySelectorAll('.credentials-carousel__dot'));
  var prevBtn = carousel.querySelector('.credentials-carousel__btn--prev');
  var nextBtn = carousel.querySelector('.credentials-carousel__btn--next');

  var mobileMQ = window.matchMedia('(max-width: 767px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var current = 0;
  var autoPlayEnabled = !reducedMotion;
  var timer = null;
  var DELAY = 5000;

  function scrollToSlide(idx, smooth) {
    var slide = slides[idx];
    if (!slide) return;
    var left = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
    track.scrollTo({
      left: left,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  function setActive(idx) {
    current = (idx + slides.length) % slides.length;
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
  }

  function goTo(idx, smooth) {
    setActive(idx);
    scrollToSlide(current, smooth);
  }

  function startAutoPlay() {
    if (!autoPlayEnabled || !mobileMQ.matches) return;
    stopAutoPlay();
    timer = setInterval(function () {
      goTo(current + 1, true);
    }, DELAY);
  }

  function stopAutoPlay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function killAutoPlay() {
    autoPlayEnabled = false;
    stopAutoPlay();
  }

  if (prevBtn) prevBtn.addEventListener('click', function () {
    killAutoPlay();
    goTo(current - 1, true);
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    killAutoPlay();
    goTo(current + 1, true);
  });
  dots.forEach(function (d, i) {
    d.addEventListener('click', function () {
      killAutoPlay();
      goTo(i, true);
    });
  });

  track.addEventListener('touchstart', killAutoPlay, { passive: true });
  track.addEventListener('wheel', killAutoPlay, { passive: true });

  var scrollDebounce = null;
  track.addEventListener('scroll', function () {
    if (scrollDebounce) clearTimeout(scrollDebounce);
    scrollDebounce = setTimeout(function () {
      var trackRect = track.getBoundingClientRect();
      var center = trackRect.left + trackRect.width / 2;
      var bestIdx = 0;
      var bestDist = Infinity;
      slides.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        var slideCenter = r.left + r.width / 2;
        var dist = Math.abs(slideCenter - center);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });
      if (bestIdx !== current) setActive(bestIdx);
    }, 80);
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    var visObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) startAutoPlay();
        else stopAutoPlay();
      });
    }, { threshold: 0.35 });
    visObs.observe(carousel);
  } else {
    startAutoPlay();
  }

  if (mobileMQ.addEventListener) {
    mobileMQ.addEventListener('change', function (e) {
      if (e.matches) startAutoPlay();
      else stopAutoPlay();
    });
  }

  setActive(0);
})();

/* Principles carousel — mobile-only auto-rotate + arrows + dots */
(function () {
  'use strict';

  var carousel = document.querySelector('[data-principles-carousel]');
  if (!carousel) return;

  var track = carousel.querySelector('.principles-carousel__track');
  if (!track) return;

  var slides = Array.prototype.slice.call(track.children);
  if (slides.length < 2) return;

  var dots = Array.prototype.slice.call(carousel.querySelectorAll('.principles-carousel__dot'));
  var prevBtn = carousel.querySelector('.principles-carousel__btn--prev');
  var nextBtn = carousel.querySelector('.principles-carousel__btn--next');

  var mobileMQ = window.matchMedia('(max-width: 767px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var current = 0;
  var autoPlayEnabled = !reducedMotion;
  var timer = null;
  var DELAY = 5000;

  function scrollToSlide(idx, smooth) {
    var slide = slides[idx];
    if (!slide) return;
    var left = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
    track.scrollTo({
      left: left,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  function setActive(idx) {
    current = (idx + slides.length) % slides.length;
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
  }

  function goTo(idx, smooth) {
    setActive(idx);
    scrollToSlide(current, smooth);
  }

  function startAutoPlay() {
    if (!autoPlayEnabled || !mobileMQ.matches) return;
    stopAutoPlay();
    timer = setInterval(function () {
      goTo(current + 1, true);
    }, DELAY);
  }

  function stopAutoPlay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function killAutoPlay() {
    autoPlayEnabled = false;
    stopAutoPlay();
  }

  if (prevBtn) prevBtn.addEventListener('click', function () {
    killAutoPlay();
    goTo(current - 1, true);
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    killAutoPlay();
    goTo(current + 1, true);
  });
  dots.forEach(function (d, i) {
    d.addEventListener('click', function () {
      killAutoPlay();
      goTo(i, true);
    });
  });

  track.addEventListener('touchstart', killAutoPlay, { passive: true });
  track.addEventListener('wheel', killAutoPlay, { passive: true });

  var scrollDebounce = null;
  track.addEventListener('scroll', function () {
    if (scrollDebounce) clearTimeout(scrollDebounce);
    scrollDebounce = setTimeout(function () {
      var trackRect = track.getBoundingClientRect();
      var center = trackRect.left + trackRect.width / 2;
      var bestIdx = 0;
      var bestDist = Infinity;
      slides.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        var slideCenter = r.left + r.width / 2;
        var dist = Math.abs(slideCenter - center);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });
      if (bestIdx !== current) setActive(bestIdx);
    }, 80);
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    var visObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) startAutoPlay();
        else stopAutoPlay();
      });
    }, { threshold: 0.35 });
    visObs.observe(carousel);
  } else {
    startAutoPlay();
  }

  if (mobileMQ.addEventListener) {
    mobileMQ.addEventListener('change', function (e) {
      if (e.matches) startAutoPlay();
      else stopAutoPlay();
    });
  }

  setActive(0);
})();

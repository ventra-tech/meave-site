# Meave Darroux — Website Build Diary

**Client:** Meave Darroux, certified Triple P parenting coach & consultant  
**URL:** meavedarroux.com  
**Stack:** Pure HTML / CSS / Vanilla JS — no frameworks, no build step  
**Hosting:** Vercel (auto-deploys from GitHub `main`)  
**Repo:** ventra-tech/meave-site  
**Documented:** June 2026

---

## Overview

This is the complete build diary for Meave Darroux's professional website — a parenting coaching and consultancy site targeting three distinct audiences: parents, schools, and organisations. The site was built from scratch and iterated extensively across content, design, interactivity, and mobile experience. This document captures the journey from the first commit to where the site stands today: the decisions made, the problems encountered, and how they were resolved.

---

## Phase 1 — Foundation

### Initial build

The site launched as a static HTML/CSS project with six core pages:

| Page | Purpose |
|---|---|
| `index.html` | Homepage — introduce Meave, three audiences, testimonials |
| `about.html` | Meave's story, credentials, how she works |
| `for-parents.html` | 1-to-1 coaching packages for families |
| `for-schools.html` | Talks, workshops, CPD, safeguarding training |
| `for-organisations.html` | Consultancy for employers, councils, charities |
| `contact.html` | Enquiry form with audience-routing |

The decision to use no frameworks was deliberate. The site is a brochure — no dynamic data, no user accounts, no server-side logic. Keeping it pure HTML/CSS/JS meant zero dependencies, zero build steps, and the ability to deploy a change in under a minute. Vercel auto-deploys from every push to `main`, so the whole workflow is: edit file → commit → push → live.

### Design system

The visual identity was built around three core brand colours:

- `--primary: #2D4A3E` — deep green (trust, nature, calm)
- `--accent: #C67B5C` — terracotta (warmth, energy, human)
- `--bg: #FAF6F0` — warm cream (softness, approachability)

Typography: **Fraunces** (display serif, for headlines and personality) + **Inter** (body, clean and readable). Both loaded via Google Fonts.

### Early interactive features

From early in the build, several JS-powered features were added:

- **Logo belt** — a seamless infinite scrolling ticker of partner logos. JS duplicates the logo row so the animation loops without a jump. Duration is proportional to the number of logos (5 seconds per logo, minimum 25 seconds), meaning adding a new logo automatically slows it down to stay readable.
- **Scroll reveal** — cards and testimonials fade/slide into view as the user scrolls. IntersectionObserver fires `.revealed` on each element. Siblings get staggered `transition-delay` by their index in the DOM so they cascade in rather than all appearing at once.
- **Count-up stats** — homepage statistics (17+ years, 2,000+ parents, 100+ organisations) animate from zero on scroll-into-view, with a colour-pop finish using the accent colour.
- **FAQ accordion** — `<details>/<summary>` elements, with JS enforcing single-open so only one answer is visible at a time.
- **Page transitions** — internal links trigger a 290ms opacity fade-out before navigation; CSS fades in on load. Respects `prefers-reduced-motion`.

### The mobile nav challenge (first encounter)

One of the earliest technical problems: the mobile nav was clipped. The `<header>` element had `backdrop-filter: blur(...)` applied for the frosted glass effect. This turned out to be a CSS containing block bug — `backdrop-filter` creates a new stacking context and containing block, which trapped the `position: fixed` mobile nav *inside* the header. It could never escape the header bounds.

**Fix:** Move `.mobile-nav` outside of `<header>` entirely, as a sibling in the DOM. It still visually overlays the header, but because it's no longer a child, the containing block is the viewport — which is what `position: fixed` needs.

---

## Phase 2 — Content Iteration

### Meave's copy feedback

The content went through multiple rounds of revision driven by Meave's direct feedback on a marked-up document. This phase was largely about accuracy — making sure every claim, qualification, and description precisely reflected her actual work. Key changes:

- **Experience years:** Early copy said "15+ years." Corrected to "17+" sitewide — across the hero badge, meta description, and About page heading.
- **Triple P branding:** Changed from "Triple P-informed" to "Triple P" — she is fully accredited, not just informed by the methodology.
- **Coaching packages renamed:** "Programmes" → "Coaching packages" sitewide for consistency.
- **Removing promises:** Specific timeframe commitments ("I'll respond within one week," "30-minute scoping call") were removed or softened — Meave didn't want to be held to exact timings she couldn't always guarantee.
- **International enquiries:** The For Organisations hero originally restricted to UK-only. Updated to explicitly invite international enquiries.
- **Nav link rename:** "Who I work with" → "Who I partner with" on the organisations page — subtle but important distinction between clients and collaborators.

### Homepage evolution

The homepage underwent significant content evolution:

- A full "Parenting today" editorial section was added to the for-parents page, and a teaser with CTA on the homepage. This was later replaced with an interactive **dual-question** feature — a paired set of scenarios ("Is this you?") that let each audience self-identify. This was a more engaging entry point than a static text block.
- The hero eyebrow styling evolved: plain text → green box with white text. The trust badges (years experience, parent count) became more prominent.
- The homepage testimonials were curated: a misattribution (Sarah Carter's quote on the wrong card) was fixed, a new quote from Stephen Mylchreest replaced an earlier one.
- UCL was added to the logo belt on both the homepage and organisations page.

### The video

The original hero video was 47MB — completely unsuitable for web. It was compressed to **2.3MB** (a 95% reduction) using ffmpeg, making the hero load in seconds rather than hanging. A new video (`0522.mp4`) was later sourced from Meave's professional shoot and swapped in.

---

## Phase 3 — Navigation & Structure Refinements

### Sticky in-page nav

All inner pages (for-parents, for-schools, for-organisations) have a sticky secondary navigation that scrolls with the user and highlights the current section. This was built with IntersectionObserver scroll-spy — as each section enters the viewport, the corresponding pill in the sticky nav becomes active. The active pill auto-scrolls into view within the nav if the nav itself is overflowing on narrow screens.

### Dropdown nav

Desktop hover dropdowns were added across all pages for the About Meave section. Mobile sub-links were added with a chevron toggle — tapping a top-level nav item with children reveals/hides the sub-pages without navigating. This avoided a common mobile pattern problem where tapping a parent nav item would navigate away before the user could see the sub-links.

---

## Phase 4 — Mobile Optimisation Sprint

This was the largest single phase of work. A full mobile audit was run and the findings discussed in detail before any changes were made. The audit identified seven categories of issues; the highest-priority ones were addressed systematically.

### The carousel system

The biggest structural change of this phase: **multi-card grid sections were converted to swipeable carousels on mobile and tablet (≤1023px)**.

The breakpoint was deliberately set at 1023px (not 767px) so that medium-sized tablets see the slideshow version rather than a cramped three-column layout. The user made this call explicitly: "anytime it's not fully fully mobile view, just have it to where it's going to just default to a slideshow."

Carousels were added to:
- For Parents: coaching packages, testimonials
- For Schools: packages, who I work with, programmes offered, testimonials (4 carousels)
- For Organisations: who I partner with, models offered, voices/testimonials (3 carousels)
- Homepage: audience selector cards, how I can help pillars
- Contact: route cards (pick your path)

**The generic carousel system.** Rather than writing bespoke CSS/JS for every new carousel, a reusable `mcarousel` system was built. Any element with `data-carousel` in the HTML gets automatically wired up: the JS queries all `[data-carousel]` elements, wraps the children in a track, and dynamically builds the arrow buttons and dot indicators. No new CSS class names needed for each instance.

CSS mechanics:
- `scroll-snap-type: x proximity` on the track, `scroll-snap-align: center` on each card
- `overflow-x: auto` (native scroll) with scrollbar hidden via `-webkit-scrollbar: none`
- `IntersectionObserver` to pause auto-rotation when the carousel is off-screen
- `matchMedia('(max-width: 1023px)')` to only activate carousels below the breakpoint — above it, the carousel CSS is inactive and cards show as the normal grid

### The packages carousel: defaulting to the featured card

The coaching packages carousel has three options, with the middle one marked "Most Chosen" (the recommended package). The requirement was for the carousel to land on the middle card by default, not the first.

This required changing the carousel initialisation from `setActive(0)` to a `goTo(1, false)` call — the `false` suppressing the transition animation so the starting position appears instant. The result: on mobile, the page loads already showing the featured middle card, reducing the chance a user only sees the cheaper option and misses the recommended one.

A secondary bug was discovered in the same carousel: the "Most Chosen" badge (positioned `top: -12px` on the card) was being clipped by the carousel track's `overflow: hidden`. Fixed by increasing the track's `padding-top` from `4px` to `16px`, giving the badge room above the card boundary.

### The blank nav bug (the hardest problem)

The most difficult bug encountered in the entire project. After the page transition animation was working and everything looked fine on desktop, reports came in of inner pages showing a completely blank mobile nav after scrolling down.

**Symptoms:** On inner pages only, scrolling down a certain amount then tapping the hamburger menu produced a black, empty nav overlay with no links.

**Investigation:** The nav was there in the DOM, its styles were set correctly, and on desktop everything worked. The first theory was that the hamburger click handler was firing but the nav styles were broken — so extra `!important` CSS overrides were added and inline styles were force-cleared on open. This helped in some cases but not all.

**Root cause (eventually found):** The page transition was using a CSS animation called `pageIn` that faded the body in:

```css
@keyframes pageIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

body { animation: pageIn 0.4s ease both; }
```

The `both` fill mode means the animation's final keyframe persists even after the animation completes. The final keyframe had `transform: translateY(0)` — a transform value, even though it's zero. **Any non-`none` transform on an element makes it the containing block for all `position: fixed` descendants.** So `body` was permanently acting as the containing block for the `position: fixed` mobile nav. When the page was scrolled, the nav scrolled with the body (not with the viewport), rendering off-screen.

**Fix:** Remove `transform` from `pageIn` entirely. The animation now only animates `opacity`. The containing block bug disappears because the body no longer has a transform applied.

```css
/* After fix */
@keyframes pageIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

This was a subtle CSS specification detail — the kind of thing that works perfectly for months and then bites unexpectedly when `animation-fill-mode: both` is introduced.

### The sticky CTA

A floating "Book a free call" button appears after the hero scrolls out of view on mobile. Two issues were addressed:

1. **It was terracotta** — same colour as other accent elements, making it blend in. Changed to green (`var(--primary)`) so it stands out as the primary action.
2. **It floated over the footer** — looking unprofessional and covering the footer links. Fixed by using IntersectionObserver on the footer element: when the footer enters the viewport, the CTA hides. When the footer leaves, it reappears. The user decided the stop point should be the footer itself (not the CTA band above it) — a specific call made after discussing the two options.

### Dot style unification

Carousels were built at different times and had inconsistent dot indicators:
- Older carousels: terracotta pill (wide, rounded-rectangle active state)
- Newer carousels: green round dots with scale transform on active

When the inconsistency was spotted in screenshots, all carousels were unified to the terracotta pill style:
- Active: `background: var(--accent-dark)`, `width: 22px`, `border-radius: 4px`
- Inactive: `background: rgba(45, 74, 62, 0.28)` (faded green)

### Featured quote sections

Both the schools page and organisations page had quote sections that needed refinement:

- **Schools:** The section heading "What schools and event partners say" was removed. The attribution (Heather Dolphin, Deputy Head) was made larger and heavier. The section now opens directly with the quote — no preamble.
- **Organisations:** The voices testimonial block was restyled to match — terracotta background (`--accent-dark`), large white quote text, white attribution in slightly larger/bolder weight. The decorative pull-quote mark (a large `"` pseudo-element) was removed.

### The contact form

Two issues were resolved on the contact page:
1. A malformed HTML note below the form was displaying garbled text. Rather than repairing the sentence, it was simply removed — it added nothing.
2. An email fallback note ("You can also email us at...") below the form was removed for the same reason — the form is the contact mechanism.
3. The submit button had `disabled` attribute left on from the prototype phase. This was removed so the form is now submittable (pending backend wiring to Netlify Forms or similar).

---

## Phase 5 — Image Optimisation

### The problem

A full performance audit was run before any changes were made. The findings:

- **83MB** across the `images/` folder, 29 files over 1MB
- Hero images were 3–4MB JPGs with no `srcset` — a 375px phone downloaded the same file as a 4K monitor
- No `width`/`height` attributes on any image — causing layout jumps (CLS) as images loaded
- Only 5 of 39 images had `loading="lazy"` — everything below the fold loaded eagerly
- Contact form inputs were `font-size: 0.95rem` (15.2px) — iOS Safari auto-zooms on any input under 16px
- Buttons were ~39px tall, just under the 44px touch-target guideline

### The discovery: most images weren't used

An image audit revealed that the `images/` folder contained around 50 files, but only **11 were actually used on the live site**. Several 4MB+ files were leftovers from earlier design iterations referenced nowhere in the HTML. The real image weight on the deployed site was ~18MB across those 11 photos.

A `used-images/` folder was created in the project with just those 11 files — a clean Squoosh worklist. The folder was added to `.gitignore` so it stays local and doesn't bloat the repo.

### Squoosh settings — what tripped us up

The user ran the images through Squoosh (browser-based, free, no install). One non-obvious setting: **Reduce palette was turned on by default**. This is intended for graphics/icons — it quantises the image to a limited colour palette. For photographs it produces visible degradation. The fix was to turn it off. Everything else was left at defaults (WebP, quality 75, Lanczos3 resize).

**Width targets used:**
- Hero / full-width banner images → 1600px
- Section photos → 1200px
- Small portraits → 800px

### Results

| File | Before | After | Saving |
|---|---|---|---|
| hero-home | 3.2MB | 94KB | 97% |
| schools-hero-children | 2.7MB | 138KB | 95% |
| orgs-support-adult-group | 2.5MB | 56KB | 98% |
| contact-sidebar-closeup | 1.6MB | 71KB | 96% |
| orgs-hero-professional | 1.4MB | 58KB | 96% |
| parents-hero-mum-child | 1.2MB | 132KB | 89% |
| home-mid-asian-dad-son | 903KB | 87KB | 90% |
| home-mid-white-mum-son | 3.3MB | 50KB | 98% |
| MD-018120260508 | 481KB | 54KB | 89% |
| MD-016520260508 | 447KB | 52KB | 88% |

**Total: 18MB → 792KB. 96% reduction.**

### Code changes (all applied in one commit)

Every photo `<img>` was wrapped in a `<picture>` element with a `<source type="image/webp">` pointing to the new file, and the original `.jpg` kept as fallback for older browsers. `width` and `height` attributes were added to every image so the browser reserves space before the image downloads, eliminating layout jump. `loading="lazy"` was added to every below-the-fold image.

---

## Phase 6 — Performance & Accessibility Polish

### Intro video: 13MB → 3.2MB

The intro video on the homepage (`logos/introvid.mp4`) was 13MB. The video had a bitrate of 1827 kbps — far higher than needed for a 478×850 portrait talking-head video on web. Compressed using ffmpeg:

```
ffmpeg -i introvid.mp4 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 96k -ac 1 -movflags +faststart introvid-compressed.mp4
```

Result: **13MB → 3.2MB (75% reduction)**. Same resolution, same duration, visually identical. The `+faststart` flag moves the moov atom to the start of the file so the video can begin buffering without downloading the whole file first.

(Note: the hero background video had already been compressed from 47MB to 2.3MB in an earlier phase using the same tool.)

### iOS zoom fix

Form inputs were set to `font-size: 0.95rem` (~15.2px). iOS Safari automatically zooms the viewport when the user taps any input with a font size under 16px — a jarring experience. One-line fix: bumped `.contact-form input, select, textarea` to `font-size: 1rem`.

### Button tap targets

Buttons were ~39px tall (12px top/bottom padding + single line of text). The WCAG touch-target guideline is 44px minimum. Added `min-height: 44px` to `.btn` — buttons that are already taller than 44px are unaffected; shorter buttons gain the extra height.

### Hero colour inconsistency

The "Book a free discovery call" button and the three trust badges in the hero were using `--accent-dark` (#A9674B) — the darker shade — rather than `--accent` (#C67B5C) used everywhere else on the site. This was a leftover from an earlier hero design iteration. Fixed by updating `.hero-cinematic__ctas .btn-accent` and `.hero-cinematic__trust span` to use `var(--accent)`.

### Eyebrow contrast

The terracotta accent colour (`#C67B5C`) on the cream background (`#FAF6F0`) produces a contrast ratio of approximately 3.0:1. WCAG AA requires 4.5:1 for small text. The small uppercase "eyebrow" labels above every section heading were using this colour — a site-wide accessibility fail.

The fix was a deliberate balance: darken the eyebrow colour just enough to pass, without changing buttons, badges or any other terracotta elements. The colour `#8B5040` achieves 4.6:1 contrast ratio on the cream background — passing WCAG AA — while remaining visually in the same terracotta family. The change was applied only to `.eyebrow { color }`, not to `--accent`.

### Microsoft Clarity

The analytics script was removed from `index.html` ahead of the domain connection. The existing tag was generated against a placeholder URL and will be regenerated once `meavedarroux.com` is live and connected. A new tag should be added to the `<head>` of all 6 pages at that point.

---

## Key Technical Decisions (Summary)

| Decision | Rationale |
|---|---|
| No framework, pure HTML/CSS/JS | Brochure site needs zero dependencies. Simpler to deploy, maintain, contribute to. |
| Vercel + GitHub auto-deploy | Push to main = live in ~30 seconds. Immediate feedback loop. |
| Carousel breakpoint at 1023px not 767px | Tablets show slideshows, not cramped grids. User's explicit requirement. |
| `scroll-snap-type: x proximity` | Proximity (not mandatory) snapping feels more natural — user can stop mid-scroll. |
| Generic `[data-carousel]` system | Avoids writing bespoke CSS/JS for every new section. One system handles all. |
| `pageIn` opacity-only animation | Removing transform from fill-mode animation eliminates containing block bug. |
| WebP at quality 75, max 1600px | Balance between visual quality and file size. Reduce palette must be OFF for photos. |
| Mobile nav outside `<header>` | `backdrop-filter` on header creates containing block that traps `position:fixed` children. |
| Eyebrow colour separate from `--accent` | Buttons and badges stay at `#C67B5C`; only eyebrows use `#8B5040` to pass WCAG AA contrast. |
| `min-height: 44px` on `.btn` | Non-destructive tap-target fix — taller buttons are unaffected, short ones gain height. |
| ffmpeg CRF 28 for web video | Quality-based encoding at CRF 28 gives ~75% size reduction on talking-head footage with no visible quality loss. |

---

## Challenges Ranked by Difficulty

### 1. Blank mobile nav (hardest)
The CSS `animation-fill-mode: both` + `transform` on `body` making `position: fixed` children lose their viewport reference. Took multiple sessions to isolate. Solved by removing transform from the keyframe animation entirely.

### 2. Carousel system design
Building a reusable generic carousel that auto-initialises from a `data-` attribute, works across every section, and handles edge cases (off-screen pause, bfcache restore, breakpoint switching) without conflicts between instances.

### 3. Packages carousel middle-default
The scroll position initialisation on carousel load. The `goTo(1, false)` approach (jump to index 1 instantly on init) had to avoid triggering the transition animation that would cause a visible slide from card 0.

### 4. Most Chosen badge clipping
`overflow: hidden` on the carousel track clipped a `top: -12px` positioned element. Non-obvious because the overflow was necessary for the carousel scroll. Fixed by adding `padding-top` to the track.

### 5. Edit tool conflicts
When multiple identical strings exist in a file, the Edit tool (string replacement) fails with a "not unique" error. Encountered multiple times when JS code had repeated patterns. Solved each time by either extending the match context or using `bash append` for additions.

---

## What's Still Pending

| Task | Detail |
|---|---|
| Contact form backend | Submit button is enabled but posts nowhere. Needs Netlify Forms integration or similar |
| Footer placeholders | Privacy policy and terms pages not yet created; footer links are placeholders |
| Clarity analytics | Script removed ahead of domain connect — re-add new tag to all 6 pages once `meavedarroux.com` is live |
| 17+ years consistency | `about.html` heading and one trust badge may still read "15+" — worth a final check on go-live |

---

## Working Style Notes

- Every edit was committed and pushed immediately upon completion — live deploy after every change, no batching.
- No preview tools were used. Changes went straight to production and were verified live by the user.
- Content decisions were always deferred to the client. The role here was implementation, not copy direction.
- When multiple options existed (e.g. where the sticky CTA stops, which card defaults first), they were discussed and the user made the call before code was written.

---

*Build diary last updated June 2026. Site continues to be iterated.*

# mdx edit 3

## Intro

Full build record for Meave Darroux's professional parenting coaching and consultancy website — a six-page static site targeting three distinct audiences (parents, schools, organisations), built from scratch and iterated extensively across content, interactivity, and mobile experience.

> **Source:** This session + context summary of prior sessions · **Date:** May–June 2026 · **Covers:** Full site build from initial commit to image optimisation phase

---

## 1. Snapshot

**Client:** Meave Darroux — certified Triple P parenting coach and consultant, 17+ years experience, UK-wide (international enquiries welcomed).

**What was built:** A six-page brochure website.

| Page | Purpose |
|---|---|
| `index.html` | Homepage — introduce Meave, three audiences, testimonials |
| `about.html` | Meave's story, credentials, how she works |
| `for-parents.html` | 1-to-1 coaching packages for families |
| `for-schools.html` | Talks, workshops, CPD, safeguarding training |
| `for-organisations.html` | Consultancy for employers, councils, charities |
| `contact.html` | Enquiry form with audience-routing |

**Stack:** Pure HTML / CSS / Vanilla JS. No frameworks, no build step.
**Hosting:** Vercel — auto-deploys from GitHub `main` on every push. Live in ~30 seconds from commit.
**Repo:** ventra-tech/meave-site
**Timeline:** ~60+ commits across multiple sessions, May–June 2026.

---

## 2. Phase narrative

### Foundation

Site built from scratch with a full design system:

- `--primary: #2D4A3E` — deep green (trust, calm)
- `--accent: #C67B5C` — terracotta (warmth, energy)
- `--bg: #FAF6F0` — warm cream (softness)
- Typography: **Fraunces** (display serif) + **Inter** (body) via Google Fonts

Interactive features added from early on: a seamless logo belt (JS-duplicated for seamless loop, duration proportional to logo count), scroll-reveal with staggered siblings, count-up stats on the homepage, FAQ accordion with JS single-open enforcement, and page fade transitions respecting `prefers-reduced-motion`.

First bug encountered immediately: the mobile nav was clipped inside the header because `backdrop-filter` on the header creates a CSS containing block that traps `position: fixed` children. Fix: move `.mobile-nav` outside `<header>` as a DOM sibling.

### Content iteration

Multiple rounds of copy revision from Meave's marked-up feedback document. Accuracy was the dominant concern:

- Experience years corrected from "15+" to "17+" sitewide (hero badge, meta description, About page heading)
- Triple P changed from "Triple P-informed" to "Triple P" (she is fully accredited)
- "Programmes" renamed to "Coaching packages" consistently across all pages
- Specific timeframe promises removed ("I'll respond within one week," "30-minute scoping call")
- International enquiries explicitly invited on the organisations page
- "Who I work with" → "Who I partner with" on organisations (distinction between clients and collaborators)

The homepage "Parenting today" editorial section was later replaced with an interactive dual-question feature — scenario-based self-identification for each audience, more engaging than a static text block.

The original hero video was 47MB — completely unsuitable for web delivery. Compressed to 2.3MB (95% reduction) using ffmpeg. A second video from Meave's professional shoot later replaced it.

### Navigation & structure

Sticky secondary nav added to all inner pages — IntersectionObserver scroll-spy highlights the current section, active pill auto-scrolls into view within the nav bar on overflow. Desktop hover dropdowns added for About Meave section. Mobile sub-links wired to a chevron toggle: tapping a parent nav item reveals sub-pages without navigating away (avoiding the common pattern where users can't reach sub-pages on mobile).

### Mobile optimisation sprint

The largest single phase. A full mobile audit was run first; findings were discussed in depth before any code was written. The user made one overarching direction call: "anytime it's not fully fully desktop view, just have it to where it's going to just default to a slideshow." Breakpoint set at 1023px (tablets + mobile), not just 767px.

**Carousels added to:**
- Coaching packages (parents page + schools page)
- Schools "who I work with" section
- Schools programmes section
- Testimonials (parents + schools + organisations)
- Organisations "who I partner with"
- Organisations models section
- Contact page route cards
- Homepage audience cards
- Homepage pillars grid

Total: 12+ carousel instances across 5 pages.

A reusable generic `[data-carousel]` system was built — JS auto-initialises every element with that attribute, dynamically building arrows and dots. No bespoke CSS/JS per carousel instance.

The packages carousel was configured to default to the middle ("Most Chosen" / featured) card on load. Sticky CTA changed from terracotta to green, and made to stop appearing when the footer scrolls into view. Dot styles unified to terracotta pill across all carousels after inconsistency was spotted across pages. Featured quote sections on schools and organisations pages had headings removed, attribution made larger and bolder. Contact form had two extraneous notes removed; the `disabled` attribute removed from the submit button.

### Image optimisation

Audit revealed only 11 of ~50 images in `images/` are actually used on the live site — the rest are leftovers from earlier iterations, some 4MB+. A `used-images/` working folder was created with just the 11 in-use photos, added to `.gitignore`. User chose a sustainable going-forward workflow: Squoosh (browser tool, no install), max 1600px width, WebP at quality 75. Compression in progress.

---

## 3. The good

**No-framework decision held up.** Every change was a direct edit to a real file. No compilation, no dependency conflicts, no "why isn't the dev server reflecting my change" moments. The entire workflow — edit → commit → push → live — never broke across 60+ commits.

**Auto-deploy from `main`.** Changes went live in ~30 seconds from every push. Tight feedback loop meant problems were visible and fixable immediately without a staging environment or manual deploy step.

**Generic carousel system.** Building a reusable `[data-carousel]` system before adding the 8th or 9th carousel paid off immediately — the contact page and organisations carousels cost almost nothing to wire up once the system existed. One system = one place to fix bugs.

**IntersectionObserver as a single pattern.** Used for: scroll-reveal, count-up stats, scroll-spy nav, carousel pause-when-offscreen, sticky CTA show/hide, and sticky CTA stop-before-footer. Six different features, one API, no scroll event listeners polling on every frame.

**Discuss before code.** Running the mobile audit and talking through every finding before touching any code meant work was prioritised correctly. Low-value changes weren't attempted; the highest-impact changes happened first.

**Image audit before optimisation.** Checking what was actually in use before compressing anything saved effort on ~39 files that don't need touching and identified that the real problem wasn't the images in use — it was an undisciplined upload process.

---

## 4. The bad + fixes

### Blank mobile nav on scrolled pages (hardest bug)

**Context:** Inner pages (not the homepage) were showing a completely black, empty nav overlay after scrolling then tapping the hamburger. Only on mobile, only after scrolling.

**Investigation:** The nav was in the DOM with correct styles. Multiple theories tested over multiple sessions: hamburger handler broken, z-index conflict, CSS specificity override. Extra `!important` overrides added, inline styles force-cleared on open. Helped in some cases, not consistently.

**Root cause:** The `pageIn` fade-in animation on `body` used `animation-fill-mode: both`. The keyframe included `transform: translateY(0)`. Even a zero-value transform persists under `fill-mode: both`. Any non-`none` transform on an element makes it the containing block for all `position: fixed` descendants — this is defined behaviour in the CSS spec. So `body` permanently captured the fixed mobile nav. When the page scrolled, the nav scrolled with the body and rendered off-screen.

**Fix:** Remove `transform` from `pageIn` entirely — animate `opacity` only. One property removed from one keyframe.

**Result:** Nav works correctly on every inner page at every scroll position. No JS workaround needed.

---

### Most Chosen badge clipped on packages carousel

**Context:** The recommended coaching package has a "Most Chosen" badge positioned `top: -12px` above the card top edge. On mobile carousel, it was cut off.

**Root cause:** `overflow: hidden` on the carousel track (required for the carousel to function) clipped anything extending above the track boundary.

**Fix:** Increase track `padding-top` from 4px to 16px. Gives the badge 16px of headroom without removing the overflow needed for the carousel scroll.

---

### 47MB hero video

**Context:** Initial hero video sourced and uploaded uncompressed directly from the camera.

**Fix:** ffmpeg compression to 2.3MB — 95% file size reduction. Made mobile load time acceptable. Later replaced with a second professionally-shot video, also compressed before upload.

---

### Edit tool "not unique" conflicts

**Context:** When a file has repeated identical code patterns (common in carousel JS — every carousel IIFE looks similar), the Edit tool fails because the match string isn't unique in the file.

**Fix:** Extend the match context to include enough surrounding unique lines, or use `bash append` for additions. Encountered multiple times; handled case by case.

---

### Inconsistent carousel dots

**Context:** Carousels built at different stages had two different dot styles — older carousels used a terracotta pill (wide, rounded-rectangle active state); newer ones used green round dots with a scale transform. Inconsistency was only visible when comparing across pages.

**Fix:** Unified all carousels to the terracotta pill in a single targeted CSS pass. Active: `background: var(--accent-dark)`, `width: 22px`, `border-radius: 4px`. Inactive: faded green.

---

## 5. Decisions + why

**No framework**
Options: React/Next.js, SvelteKit, plain HTML. Chose plain HTML.
Reasoning: The site is a brochure — no dynamic data, no user accounts, no server-side logic. Frameworks introduce build steps, dependency maintenance, and deployment complexity that serve none of those needs. Plain HTML means the workflow is edit → push → live, and the site will keep working in five years without a `npm audit fix` cycle.

---

**Carousel breakpoint at 1023px, not 767px**
Options: 767px (mobile only), 1023px (tablet + mobile).
Chose 1023px.
Reasoning: Three-column card grids on a 900px tablet are cramped. The client made the direction explicit: "anytime it's not fully fully desktop view, just default to a slideshow." 1023px covers tablets and mobile in one cut.

---

**WebP + Squoosh for images**
Options: ffmpeg CLI, Cloudinary upload pipeline, Squoosh browser tool.
Chose Squoosh.
Reasoning: No install, no account, no CLI knowledge required. The client can run it independently for every new image going forward. The goal wasn't just to fix the current images — it was to establish a sustainable gate so the problem doesn't recur every time new photography arrives.

---

**Sticky CTA colour changed from terracotta to green**
Options: Keep terracotta, switch to green.
Chose green.
Reasoning: Terracotta matched too many other accent elements on the page and didn't read as a distinct call to action. Green is the primary brand colour and visually signals "primary action."

---

**Sticky CTA stops at footer, not the CTA band above it**
Options: Stop before the CTA band section, stop before the footer.
Chose footer.
Reasoning: Client's call after a brief discussion. Stopping at the footer felt more natural — the floating CTA disappears when the user is already at the page's natural endpoint, not before they reach the page's own CTA section.

---

**Generic `[data-carousel]` system vs named carousels**
Options: Bespoke CSS/JS per carousel section, one reusable data-attribute system.
Chose generic system.
Reasoning: By the time the decision was made there were already 4+ carousels. Writing bespoke JS and CSS for each of 12+ instances would have been unmaintainable — a bug fix would need to be applied in 12 places. One system = one place to change anything.

---

**Move `.mobile-nav` outside `<header>`**
Options: Fix with z-index override, JS workaround, move element in DOM.
Chose DOM move.
Reasoning: `backdrop-filter` creating a containing block is CSS spec-defined behaviour — it cannot be overridden with z-index or other properties. The only correct fix is to remove the nav from the subtree where the containing block is created.

---

## 6. Suggested skills

> **Suggested skill: `static-site-carousel`**
> - **Pattern:** Adding swipeable mobile/tablet carousels to existing card-grid sections on a static HTML site
> - **Trigger:** When a client says "make these cards a slideshow on mobile/tablet" or when a card grid looks cramped below a breakpoint
> - **Rough process:** Wrap grid in a `data-carousel` container → apply scroll-snap CSS → JS auto-builds arrows + dots → activate only below breakpoint via `matchMedia` → handle bfcache restore with `pageshow`
> - **Why it recurs:** Came up 12+ times in a single project. Every static brochure site with multi-card grids will face this request.
> - **Type:** `yours`

---

> **Suggested skill: `image-pre-upload-workflow`**
> - **Pattern:** Converting images to WebP before they go near the site — established as a gate, not a one-time fix
> - **Trigger:** Any time new photos arrive (professional shoot, stock download, client-supplied)
> - **Rough process:** Open Squoosh in browser → resize to max 1600px width → export WebP at quality 75 → save to images/ folder → reference in HTML
> - **Why it recurs:** New photography arrives throughout a client project. Making this a step in the workflow prevents re-doing image optimisation retrospectively every few months.
> - **Type:** `yours`

---

> **Suggested skill: `css-containing-block-audit`**
> - **Pattern:** Diagnosing `position: fixed` elements that lose their viewport anchor (appear off-screen, scroll with the page, or behave as if they're `position: absolute`)
> - **Trigger:** Any time a fixed element (nav overlay, sticky CTA, modal) misbehaves on scroll or after page animation
> - **Rough process:** Inspect all ancestors of the fixed element. Check for: `transform` (including zero-value — `translateY(0)` counts), `filter`, `backdrop-filter`, `perspective`, `will-change: transform`, `animation-fill-mode: both/forwards` on an animation that includes any transform. Any of these = the ancestor is the containing block, not the viewport.
> - **Why it recurs:** Caused two separate bugs in this project (backdrop-filter on header, fill-mode transform on body). Easy to miss, hard to diagnose without knowing the spec rule.
> - **Type:** `generic`

---

## 7. Gaps

**Earlier sessions paraphrased, not verbatim.** This document draws from a conversation summary of prior sessions, not raw transcripts. Some nuance from earlier content rounds — exact wording changes Meave requested, specific feedback phrasing — is paraphrased rather than sourced directly.

**Image optimisation phase not closed out.** Squoosh compression was in progress at time of writing. The HTML wiring step (updating `src` attributes to `.webp`, adding `width`/`height` attributes, adding `loading="lazy"` to below-fold images) hasn't happened yet. This phase will need a follow-up entry.

**Pending items not documented as resolved.** The following were logged as open at the end of the last session and may be completed in a future session this document won't capture:
- iOS form zoom fix (bump input `font-size` to `1rem`)
- Contact form backend (Netlify Forms or equivalent)
- Footer placeholder links (privacy policy, terms pages not yet created)
- Duplicate Microsoft Clarity script in `index.html` head
- "15+" remaining on About page heading and one hero badge

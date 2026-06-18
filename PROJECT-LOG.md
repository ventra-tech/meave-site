# Building the Meave Darroux Website — Project Documentation

**Client:** Meave Darroux, UK parenting consultant / coach
**Stack:** Static HTML + CSS + vanilla JS (no framework, no build step)
**Hosting:** Vercel (auto-deploy on push to `main`)
**Repo:** `ventra-tech/meave-site`
**Timeline:** 27 April 2026 → 16 June 2026 (~7 weeks, 131 commits)
**Pages:** `index` (home), `about`, `for-parents`, `for-schools`, `for-organisations`, `contact`

---

## 1. The arc at a glance

The project moved through four natural phases:

| Phase | Dates | Focus |
|-------|-------|-------|
| **Foundation** | 27 Apr – 6 May | Initial build, logos, headshot/video, animation system |
| **Content & identity** | 9 – 30 May | Meave's copy passes, professional photos, hero video, image library |
| **Feedback sweep** | 1 – 12 Jun | Systematic application of the client feedback doc, page by page |
| **Mobile polish** | 12 – 16 Jun | Carousels, mobile nav hardening, sticky CTA, hero responsiveness |

The shape is classic and healthy: build the skeleton, dress it in real content, then iterate hard on client feedback, and finally fight the mobile-experience battles that always surface last.

---

## 2. The good — what went well

**A genuinely solid foundation, fast.** Within the first two days we had a full site live with a real headshot, a portrait video, larger branded logos, and — notably — a complete **animation system across all five categories** (28 Apr). Getting motion in early gave the site personality before the content was even final.

**A no-nonsense stack that never fought us.** Pure HTML/CSS/JS on Vercel meant zero build failures, zero dependency hell, instant deploys. Every one of the 131 commits shipped to production within seconds of pushing. For a content-heavy marketing site this was exactly the right call.

**Disciplined, surgical commits.** The commit log is unusually clean — each change is small, scoped, and described in plain language ("drop 'directly' from Enquire eyebrow", "remove '40%' statistic"). This made the client feedback sweep auditable: every red-marked edit in Meave's doc maps to a traceable commit. That discipline is the single biggest reason the project stayed legible across 7 weeks.

**Real content, real photos, real video.** We moved off placeholders early — professional shoot photos on About and For Parents (10 May), a proper image library reorganisation (29 May), and deliberate inclusion of diverse family representation (29 May). The site reads as a real practitioner's, not a template.

---

## 3. The bad / the challenges — and how we beat them

### Challenge 1 — The hero video was 47MB
A 47MB hero video is a non-starter; it would stall on mobile and blow Vercel's streaming. **Fix:** compressed it to **2.3MB** (30 May) — a 20x reduction — and used the first frame as a poster image so something paints instantly while the video loads. We also cycled through several clips (`meaveclip2.mp4` → `0522.mp4`) to get the right framing and tone.

### Challenge 2 — Mobile navigation was genuinely cursed
This was the hardest-fought battle of the project, and the commit log shows the scars:
- Nav clipped by the header's `backdrop-filter` (10 May)
- **Blank nav / blank page after using the browser back button** — a stuck `body` opacity left over from the fade-in animation (fixed twice: `pageshow` handler on 12 Jun, then root-caused on 16 Jun by dropping the `transform` from the body fade-in entirely)
- Stuck inline styles surviving across page transitions

**How we overcame it:** progressively hardened the nav — a `pageshow` reset, then "bulletproof visibility" using `!important` CSS plus a JS sweep that strips stuck inline styles off *every descendant* on open (16 Jun). It was iterative and occasionally felt like whack-a-mole, but each fix narrowed the root cause until the back-button/fade-in interaction was eliminated at source rather than patched.

### Challenge 3 — A CSS specificity bug in the contact form
We built a dynamic name field (label changes for School vs Organisation enquiries) and a hidden field kept showing because a specificity override beat the `hidden` rule (12 Jun). **Fix:** corrected the specificity so the toggle actually held.

### Challenge 4 — The endless copy feedback loop
Meave supplied feedback in waves — an amendments doc in May, then a large red-marked feedback doc that drove the entire 11–12 June sweep. Dozens of micro-edits: removing specific stats ("40%"), softening promises (removing response-time guarantees sitewide), expanding abbreviations (SEMH, MAT/LA), tightening eyebrows and headings. **How we kept it sane:** treated the doc as the single source of truth, applied one change per commit, and updated both the primary and secondary school tabs wherever content was duplicated (a recurring trap — the same copy lived in two places).

### Challenge 5 — Mobile layout density
The desktop multi-card layouts (coaching packages, qualifications, pillars, testimonials) were unreadable when stacked on mobile. **Fix:** built a reusable **auto-rotating carousel** pattern (arrows + dots, 5s rotation) and rolled it out across the homepage, About, For Parents, and Schools (16 Jun). We tuned the breakpoint from 767px up to 1023px so tablets got the carousel too, and fixed clipping bugs (the "Most Chosen" pill) and default-position issues along the way.

---

## 4. Notable smaller wins
- **Sticky in-page sub-nav** with the active pill auto-scrolling into view, hiding when the mobile menu opens.
- **About Meave dropdown nav** with desktop hover + animated underline and mobile sub-links.
- **Interactive dual-question module** on the homepage replacing a static "Parenting today" teaser (9 Jun).
- **Sticky CTA** reworked to scroll-based show/hide, stopped before the footer, recoloured green for contrast (16 Jun).
- **Microsoft Clarity analytics** added for real behavioural data (17 May).
- Sitewide typographic hygiene — removing em dashes, standardising "17+ years", fixing a testimonial misattribution.

---

## 5. Lessons / what this project teaches

1. **A static stack is a superpower for marketing sites.** No build step meant feedback → live in under a minute, 131 times. The velocity of the June feedback sweep simply wouldn't exist on a heavier stack.
2. **Mobile animation state is the silent killer.** Almost every "blank page" bug traced back to animation leftovers (opacity/transform) surviving navigation. The durable fix was removing the offending transform, not adding more resets.
3. **One change, one commit pays off.** When the client asks "did you change X?", the answer is a single grep of the log. This discipline turned a chaotic feedback process into an auditable one.
4. **Duplicate content is a landmine.** The school page's primary/secondary tabs caused repeated "you only changed one" moments — worth flagging any duplicated copy early.

---

**Status at time of writing:** clean working tree, all client feedback applied, last deploy 16 Jun 2026 18:21. The site is in good shape.

# MDX Codebase Rev — Process & Prompting Breakdown

## Intro
A process-and-prompting review of the Meave Darroux website build — a 7-week static-site project driven almost entirely through small, iterative edit requests. This document captures *how the tool was driven* (not what got built), so the working style can be improved and made repeatable. One EXTRACT thread; intended to be synthesised with breakdowns of the other build chats.

> **Source:** This chat (compacted continuation + documentation requests) · **Date:** project spans 27 Apr – 16 Jun 2026; this thread is the tail · **Covers:** prompting/process patterns inferred from the full git history plus the documentation phase

## 1. Snapshot
- **Shape:** A long tail of micro-instructions rather than a few large specs — high user control, high round-trip count.
- **Objective record:** 131 commits over ~7 weeks, the majority single-purpose one-liners (e.g. "drop 'directly' from Enquire eyebrow").
- **Collaboration mode:** Conversational edit-by-edit. The user relayed changes (often from a feedback doc or screenshots) one at a time; the model applied + committed each. Mobile/interactive work was more exploratory and iterative.
- **Context note:** Full conversational context exists only for this tail chat. Earlier prompting is inferred from commit shape, which is evidence of behaviour, not the prompts themselves.

## 2. Process walk
Reconciled against the git log so the whole shape appears; depth applied only where there was friction or a lesson.

- **Foundation (Apr 27–28)** — initial build, logos, headshot/video, full animation system across all five categories. *Just worked* — landed in two days, no visible friction.
- **Content & identity (May 9–30)** — Meave's copy passes, professional photos, image-library reorganisation, hero video.
  - *Friction:* hero video shipped at **47MB**, then compressed to **2.3MB** (30 May). A size constraint stated at selection time would have removed the compress-and-replace cycle.
  - *Friction:* several hero clips cycled (`meaveclip2` → `0522`) before framing/tone landed — exploratory, expected.
- **Analytics & structure (May 17 – Jun 9)** — Clarity tracking, dropdown nav, "What is Triple P?" section, interactive dual-question module. Mostly clean, single-pass additions.
- **The big feedback sweep (Jun 11–12)** — ~60 one-line copy commits in two days, driven by a red-marked feedback `.docx`. This is the dominant pattern of the project and the richest lesson source. Item-by-item relay rather than a single doc-driven sweep.
  - *Friction:* a `Revert: keep "..." section title` commit — a change made then undone, i.e. a wasted round-trip from acting before intent was settled.
  - *Friction:* duplicated primary/secondary school-tab copy caused repeated "only one instance changed" misses.
- **Mobile hardening (Jun 12–16)** — nav visibility fixed across *four escalating commits* ("harden" → "bulletproof" → "force-clear" → finally root-caused by dropping a `transform` from the body fade-in). Classic whack-a-mole: patches stacked before the root cause was found.
- **Documentation tail (this chat)** — vague "summarise this convo" → real intent surfaced as "document the whole build" → `PROJECT-LOG.md` written → this process breakdown. The first ask undersold the actual goal.

## 3. Prompting lessons
Principle first; the chat moment is the worked example.

> **Lesson:** When the changes live in a structured source (a doc, a spreadsheet, a list), hand over the whole source and ask for a reconciled sweep — don't relay items one at a time.
> **Here:** The feedback `.docx` drove ~60 separate one-line commits over two days. The artifact already existed as a single file; feeding it whole and asking the model to apply every red-marked change in a pass would have collapsed dozens of round-trips into a few.

> **Suggested skill: `doc-driven-edit-sweep`**
> - **Pattern:** Apply a batch of marked-up changes from a source document across a codebase in one reconciled pass, with a checklist back.
> - **Trigger:** User has a feedback doc / change list and starts relaying edits individually.
> - **Rough process:** Ingest the doc → extract every change as a checklist → locate each target (flagging duplicates) → apply all → return the checklist with done/skipped/ambiguous status.
> - **Why it recurs:** Client feedback almost always arrives as a document; relaying line-by-line is the user's default and the biggest round-trip sink here.
> - **Type:** `yours`

> **Lesson:** State fixed external constraints up front so the model doesn't build past them.
> **Here:** The hero video landed at 47MB and had to be compressed to 2.3MB afterwards. "Must stay under ~3MB for mobile/Vercel streaming" stated at selection time makes it a one-pass decision.

> **Lesson:** When a bug recurs, switch the instruction from "fix it" to "diagnose the root cause" before accepting another patch.
> **Here:** Mobile nav took four escalating commits; the real fix was removing a `transform` from the body fade-in. Asking "why does this keep coming back?" after the second recurrence would have skipped the patches between.

> **Suggested skill: `root-cause-first`**
> - **Pattern:** On a recurring bug, force a diagnosis step (hypothesis + evidence) before any further code change.
> - **Trigger:** The same symptom returns after a fix — second occurrence onward.
> - **Rough process:** Stop patching → enumerate what changed/what state persists → name the single root cause → fix once → verify the class of bug is gone.
> - **Why it recurs:** Iterative UI/animation bugs invite whack-a-mole; this user hit it on mobile nav and could on any stateful front-end work.
> - **Type:** `generic`

> **Lesson:** Tell the model about duplicated content before it edits, as a standing instruction.
> **Here:** The school page's primary/secondary tabs duplicated copy, producing repeated "you only changed one" misses. "This content appears in two tabs — change both" removes the entire error class.

> **Lesson:** Lead with the real end goal, not the small first ask — the opening framing shapes the whole first response.
> **Here:** This chat opened with "summarise this convo to take to a new chat," then immediately became "document the whole build — the good, the bad, the challenges." Stating the documentation goal first would have produced the right artifact in one shot.

## 4. What to do differently next time
- **Sweep, don't relay.** Process structured-feedback docs in one pass with a returned checklist, instead of item-by-item.
- **Front-load hard constraints** (asset size limits, duplicated content, brand/tone rules) into the first message of each work session.
- **Escalate to root-cause** after the second recurrence of any bug, rather than stacking patches.
- **Mind session length.** This project hit a context compaction mid-stream; chunk work into a fresh session per phase to keep context sharp and reduce re-derivation.
- **Open with the end goal**, then narrow — especially for documentation/summary tasks where the first ask tends to undersell the real intent.

## 5. Suggested skills
Aggregated from inline candidates — copy-paste ready.

1. **`doc-driven-edit-sweep`** — *Type: `yours`*
   - **Pattern:** Apply a batch of marked-up changes from a source document across a codebase in one reconciled pass, returning a checklist.
   - **Trigger:** A feedback doc / change list exists and edits start being relayed individually.
   - **Process:** Ingest doc → extract every change as a checklist → locate targets (flag duplicates) → apply all → return done/skipped/ambiguous status.
   - **Why it recurs:** Client feedback arrives as documents; line-by-line relay was the single biggest round-trip sink on this project.

2. **`root-cause-first`** — *Type: `generic`*
   - **Pattern:** Force a diagnosis step before any further code change on a recurring bug.
   - **Trigger:** Same symptom returns after a fix (second occurrence onward).
   - **Process:** Stop patching → enumerate persistent state / recent changes → name one root cause → fix once → verify the class is gone.
   - **Why it recurs:** Stateful front-end/animation bugs invite whack-a-mole; surfaced here on mobile nav.

3. **`session-phase-chunking`** *(candidate, lighter)* — *Type: `yours`*
   - **Pattern:** Start a fresh chat per project phase to avoid mid-stream context compaction and re-derivation.
   - **Trigger:** A single build chat grows long enough to risk summarisation.
   - **Process:** Close a phase with a short hand-off note → open a new session seeded with that note.
   - **Why it recurs:** This project compacted mid-build; the user already works across multiple chats, so phase-boundaries are a natural cut point.

## 6. Gaps
- **Couldn't reach:** the actual prompt text across the 7-week build — it lives in other chats and pre-compaction context. Every prompting lesson here is *inferred from commit shape*, not read from real prompts. Synthesising with EXTRACT files from those chats would ground these in actual wording.
- **Reached but skimmed:** the pre-compaction portion of *this* chat — available to me only via the session summary, not the full exchange. Friction inside those exchanges (misreads, re-prompts) would not appear in the git log and is therefore under-represented here.
- **To fill in:** run EXTRACT on the earlier build chats, then SYNTHESISE — a pattern that recurs across threads is far stronger evidence of a `yours` skill than one seen only via commit shape here.

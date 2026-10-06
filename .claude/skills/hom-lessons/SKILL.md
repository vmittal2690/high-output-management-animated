---
name: hom-lessons
description: Build or edit lessons of the animated High Output Management web book in this repository. Use for "build the lessons for chapter N", "redo lesson N", "add voice", coverage checks, and publishing. Wraps the papermorph skill with this book's audience, coverage rule, conventions and the plan for chapters 3 to 15.
---

# High Output Management lessons

This skill holds what is specific to this book. The mechanics (pipeline, engine API, review scripts) live in
the `papermorph` skill at `.claude/skills/papermorph/`. Read `CLAUDE.md` and
`books/high-output-management/BOOK.md` before anything else, then read papermorph's `SKILL.md`.
Where this skill and papermorph disagree, this skill wins.

## State of the book

- Done: the whole book, lessons 1 to 32 (`ch01` to `ch32`), covering book chapters 1 to 15 and One More Thing.
  Lessons 5 to 32 still need the Playwright checks below; they were built where no browser was available.
- Lesson folders are numbered in reading order (`ch05`, `ch06`, ...). They are lessons, not book chapters.
  The contents page groups lessons into parts named for main ideas (not the book's chapter titles) through `UNITS` in `index.html`.
- `books/high-output-management/chapters.md` is the lesson map and the plan. Keep it current.

## The coverage rule (the reason lessons 1 to 4 were rebuilt once)

The first pass made one short lesson per chapter and dropped material. The owner asked for it to be redone.
So, for every book chapter:

1. Read the whole chapter from the PDF, including figures and tables. Render pages as images when a figure
   carries the idea (`split_pages.py ... --only`).
2. Write a **coverage list** in `books/high-output-management/chapters/bookchNN.md`: every named concept,
   every example Grove uses, every figure, every number. Mark each one `lesson N beat X`, `summarised in
   beat X`, or `left out: reason`.
3. Split into lessons from that list. Default two lessons per chapter, 8 to 11 minutes each, each with one
   clear theme. Use one lesson for chapter 7 (four pages) and three where two would drop content
   (chapters 3 and 13 are the likely ones).
4. Show the owner the split and the left-out items **before** building. "Left out" needs a reason they
   would accept, such as a second example making the same point.
5. After building, tick the list against the finished beats and report anything that slipped.

## Lesson shape

Follow papermorph's `references/authoring.md`, with these fixed choices:

- Beats: `intro`, then lesson beats with a quick check after every one or two ideas, `wrap` with five
  takeaways (`hmWrap`), one `final1` practice set of four or five `choice` questions, `finish`.
- Three or four quick checks per lesson. Prefer acting on the picture (`pickEls`), then `grid` for
  classifying, `blanks` for a calculation, `choice` last.
- Every wrong option gets its own one-sentence explanation of the misunderstanding.
- Every lesson beat ends on its rule in amber (`hmRule`).
- Grove's story carries the explanation; questions move to a manager's week (see `CLAUDE.md`).
- Set `CHAPTER.kicker` to `'Part N · Lesson M'`, `CHAPTER.next` on the previous lesson, and add the
  lesson to `UNITS`. Each part reuses a sketch from `unit-art.js` (see the mapping at its end).

## Look and layout (approved in lessons 1 to 4)

- Colour meaning: amber `COL.task` = the limiting step or the rule to remember; blue `COL.whole` = ordinary
  work; red `COL.bad` = a problem or a cost; green `COL.good` = the goal or the output. Do not reuse a
  colour for a second meaning inside a lesson.
- Keep artwork above y = 770. Captions sit below that. Headings at y = 110 to 120 (`hmHead`).
- `BAND` cards (y 686 to 886) clip long text. Keep the prompt under about 75 characters and feedback under
  about 65, or draw the picture smaller inside `G(panel(0), { x, y, s: .8 })` and move the card up, as
  lesson 3 does for its two chart questions. Use `MID` when the picture is cleared for the question.
- Charts are drawn to scale with the scale stated in a code comment. Invented data says "illustrative".
- Shared helpers are in `site/high-output-management/lib/book.js` (`hmSay`, `hmLines`, `hmBox`, `hmArrow`,
  `hmChain`, `hmStairs`, `hmBarUp`, `hmBarBack`, `hmCross`, `hmDot`, `hmRule`, `hmHead`, `hmWrap`,
  `hmTitle`, `MID`). Add to that file when a second lesson needs a helper. Prefix lesson-only helpers
  (`l5Thing`) so they cannot collide with engine globals.
- Text does not wrap in SVG. Break lines by hand with `hmLines` and check widths in the screenshots.

## This book's engine differs from the skill's copy

`site/high-output-management/lib/engine.js` is patched. Reuse it; do not overwrite it with
`.claude/skills/papermorph/assets/engine/engine.js`. The patches:

- `CHAPTER.silent: true` plays without audio on wall-clock time and turns captions on by default
  (stored under `captions:silent`).
- `CHAPTER.kicker` sets the cover label. "Chapter" wording in the player is changed to "Lesson".
- Links use explicit `index.html` (`../index.html#chNN`, `chNN/index.html`) so the book also runs on hosts
  without folder URLs. Keep that in new lessons (`next: '../ch06/index.html'`).

## Narration: captions now, voice when you can

Narration scripts are in `content/high-output-management/chNN/narration.en.json` with `[[marks]]`.

- Captions only (current state): `python3 tools/high-output-management/silent_timings.py <narration.json>
  site/high-output-management/chNN/audio/en` writes `timings.js` at a reading pace, no MP3s.
- To add voice, per lesson: (1) run papermorph's `scripts/tts.py` on the same narration JSON and output
  folder (needs network access to Edge TTS, which uses a WebSocket, and `ffprobe`); (2) remove
  `silent: true` from that lesson's `CHAPTER`; (3) rerun the blank check, because real speech timing moves
  every mark. Do all lessons or none, so the book is consistent, and change the contents-page line
  "captioned, with quick checks" in `index.html`.
- Write for the ear either way: short sentences, numbers in words, one idea per sentence.

## Checks before handing a lesson over

Serve the site (`python3 -m http.server 8765 -d site`), then:

```sh
SK=.claude/skills/papermorph
U=http://localhost:8765/high-output-management/
uv run --with playwright --with pillow $SK/scripts/shot.py chNN --url $U --out shots
uv run --with playwright $SK/scripts/check_blank.py site/high-output-management chNN --url $U
uv run --with playwright python tools/high-output-management/walk.py   # reveals and continues every question in every lesson
```

Without a browser, `node tools/high-output-management/lint.js chNN` catches missing marks, script errors,
broken question data, text off the stage or below y 770, and text overlaps; `render.js chNN <dir>` writes
end-of-beat SVG frames (no question cards) that ImageMagick can turn into contact sheets.

Read the end-frame contact sheets once. The defects that actually occurred in lessons 1 to 4: text clipped
at the right edge, a label drawn over a line or another label, feedback clipped inside a `BAND` card, and a
question card covering the chart it asks about. `walk.py` cannot answer `pickEls` questions with its
number-key shortcut; test those with arrow keys and Enter (see `e2e.py` for the pattern).

Then stop and hand over: what was built, the coverage list result, anything left out, anything you could
not verify. The owner judges pacing, examples and teaching.

## Plan for the rest of the book

Printed page numbers from the contents page. PDF page = printed page + an offset that depends on the part
(Part Two starts at +10: chapter 3 is PDF pp. 49–80); confirm against the page itself before extracting.
The PDF is a scan with no text layer: render pages with `pdftoppm` and OCR them with `tesseract`.

| Book chapter | Printed pages | Suggested lessons |
| --- | --- | --- |
| 3 Managerial Leverage | 39–70 | 3: what a manager's output is; information-gathering, decisions and nudging as activities; leverage, delegation and using time |
| 4 Meetings: The Medium of Managerial Work | 71–87 | 2: process meetings (one-on-ones, staff, operation reviews); mission meetings |
| 5 Decisions, Decisions | 88–101 | 2: the ideal decision process; the peer-group syndrome and the six questions |
| 6 Planning: Today's Actions for Tomorrow's Output | 102–113 | 2: the planning process; management by objectives |
| 7 The Breakfast Factory Goes National | 117–120 | 1 |
| 8 Hybrid Organizations | 121–130 | 2 |
| 9 Dual Reporting | 131–143 | 2 |
| 10 Modes of Control | 144–153 | 2 |
| 11 The Sports Analogy | 157–171 | 2 |
| 12 Task-Relevant Maturity | 172–180 | 2 |
| 13 Performance Appraisal: Manager as Judge and Jury | 181–202 | 3 |
| 14 Two Difficult Tasks | 203–212 | 2: interviewing; "I quit!" |
| 15 Compensation as Task-Relevant Feedback | 213–220 | 1 or 2 |
| One More Thing... | 221–224 | 1 short closing lesson built around Grove's homework list |

The lesson themes above for chapters 3 to 6 and 14 come from general knowledge of the book, and for the
rest only from the titles. Nobody has read those chapters for this project yet. Treat the table as a
starting guess and let the coverage list decide.

Go in order, one book chapter per working session, and get the owner's approval of each chapter before
starting the next. Use one fresh subagent per lesson when available, as papermorph's *Context* section
describes, and brief it with this skill's path as well as papermorph's.

## Publishing

`site/` is the whole product. `.github/workflows/pages.yml` publishes it to GitHub Pages on push to `main`
once Pages is set to "GitHub Actions". Commit `site/`, `content/`, `books/` (never the PDF or extracted
pages; `.gitignore` covers them), `tools/` and `.claude/`. Read the copyright note in `CLAUDE.md` before
making anything public.

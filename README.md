# High Output Management, animated

Short animated lessons with quizzes that retell Andrew Grove's *High Output Management* for new managers.
The whole book is built: 32 lessons covering all fifteen chapters and Grove's closing homework list.
Captions only for now; see "Voice narration" below.

Based on *High Output Management* by Andrew S. Grove (first published 1983; Vintage Books).
[Buy the book](https://www.penguinrandomhouse.com/books/72467/high-output-management-by-andrew-s-grove-former-chairman-and-ceo-of-intel/)
and read the original. This is an independent study guide in original words and drawings. It is not affiliated
with or endorsed by the author's estate or the publisher, and it does not include or link to the book's text.

Started by Vaishali Mittal. Lesson engine and pipeline: [Papermorph](https://github.com/DozenTwelve/Papermorph) (MIT).

## What is here

| Path | What it is |
| --- | --- |
| `site/high-output-management/` | The finished static book: cover, contents, lessons 1 to 32. This is what gets published. |
| `.claude/skills/papermorph/` | The Papermorph skill, unmodified: pipeline, engine, templates, review scripts. |
| `.claude/skills/hom-lessons/` | Companion skill: this book's audience, coverage rule, look, and the plan for chapters 3 to 15. |
| `books/high-output-management/` | Book plan (`BOOK.md`), lesson map (`chapters.md`), per-lesson notes. |
| `content/high-output-management/` | Narration scripts, one JSON per lesson. |
| `tools/high-output-management/` | Caption-timing tool and browser tests. |
| `CLAUDE.md` | Project context Claude Code reads at the start of every session. |

## You need

- Your own copy of the book as a PDF, saved as `books/high-output-management/book.pdf`. It is not in this
  repository and is git-ignored. Do not commit it.
- Claude Code, plus `uv`, `ffmpeg`, and Playwright Chromium (`uv run --with playwright playwright install chromium`).

## Preview

```sh
python3 -m http.server 8765 -d site
# open http://localhost:8765/high-output-management/index.html
```

## Build the next chapter

Open the folder in Claude Code and say:

> Use the hom-lessons skill. Build the lessons for book chapter 3.

Claude reads `CLAUDE.md`, the companion skill and the book plan, reads that chapter from your PDF,
proposes the lesson split and what each lesson covers, builds them, runs the checks, and stops for your review.
Go one chapter at a time. Review pacing, examples and teaching quality yourself: the checks only catch
loading errors, blank openings and broken questions.

## Voice narration

All lessons run on timed captions because the build environment could not reach the speech service.
On your own machine, run `bash tools/high-output-management/add_voice.sh` to add voice to every lesson.

## Publish

The site is hosted on Vercel. `vercel.json` serves `site/` as-is (no build step), and every push to `main` redeploys.

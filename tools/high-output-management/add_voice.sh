#!/bin/bash
# Add neural voice narration to every lesson, then switch the lessons from captions-only to voiced.
# Run from the hom-webbook folder on a computer with internet access:
#     bash tools/high-output-management/add_voice.sh
# Needs: uv (https://docs.astral.sh/uv/) and ffmpeg (for ffprobe). Safe to rerun: finished clips are cached.
set -euo pipefail
cd "$(dirname "$0")/../.."
SK=.claude/skills/papermorph
BOOK=high-output-management

command -v uv >/dev/null || { echo "Missing uv. Install it with:  curl -LsSf https://astral.sh/uv/install.sh | sh"; exit 1; }
command -v ffprobe >/dev/null || { echo "Missing ffmpeg. Install it with:  brew install ffmpeg"; exit 1; }

LESSONS=$(ls -d site/$BOOK/ch[0-9][0-9] | xargs -n1 basename)

# 1. Generate audio for every lesson first. If any lesson fails, nothing is switched over.
for c in $LESSONS; do
  echo "== $c: generating voice"
  uv run --with edge-tts $SK/scripts/tts.py content/$BOOK/$c/narration.en.json site/$BOOK/$c/audio/en
done

# 2. Every lesson has audio: turn off captions-only mode and update the contents page.
for c in $LESSONS; do
  perl -pi -e "s/, silent: true//" site/$BOOK/$c/index.html
done
perl -pi -e "s/captioned, with quick checks/narrated, with quick checks/" site/$BOOK/index.html

echo
echo "Done. All lessons now play with voice. Preview with:"
echo "    python3 -m http.server 8765 -d site"
echo "    then open http://localhost:8765/$BOOK/index.html"
echo "Optional: rerun the blank check (see .claude/skills/hom-lessons/SKILL.md), because real speech moves the timings."

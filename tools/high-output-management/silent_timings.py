"""Captions-only stand-in for tts.py: writes timings.js (dur, marks, cues) at a reading pace, no audio.
Usage: python3 silent_timings.py content/<book>/chNN/narration.en.json site/<book>/chNN/audio/en
Swap for the skill's tts.py when Edge TTS is reachable; beat ids and [[marks]] stay the same."""
import json, re, sys
from pathlib import Path
MARK = re.compile(r"\[\[(\w+)\]\]")
PER_CHAR, WORD_GAP, COMMA, STOP, TAIL = 0.066, 0.07, 0.22, 0.55, 0.9

def beat(raw):
    marks, pos, clean = {}, 0, []
    for i, part in enumerate(MARK.split(raw)):
        if i % 2:
            assert part not in marks, f"duplicate mark {part}"
            marks[part] = pos
        else:
            clean.append(part); pos += len(part)
    clean = "".join(clean)
    t, starts = 0.15, []          # (char index, start time)
    for w in re.finditer(r"\S+", clean):
        starts.append((w.start(), round(t, 3)))
        word = w.group()
        t += len(word) * PER_CHAR + WORD_GAP
        if word[-1] in ".?!:": t += STOP
        elif word[-1] in ",;": t += COMMA
    at = lambda p: next((s for i, s in starts if i >= p), None)
    mt = {}
    for k, p in marks.items():
        mt[k] = at(p)
        assert mt[k] is not None, f"mark {k} matches no word"
    cues, start = [], 0
    for m in list(re.finditer(r"[.?!]\s+", clean)) + [None]:
        end = m.end() if m else len(clean)
        text = clean[start:end].strip()
        if text: cues.append([at(start) or 0, text])
        start = end
    return {"dur": round(t + TAIL, 3), "marks": mt, "cues": cues}

spec = json.loads(Path(sys.argv[1]).read_text())
out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
res = {b: beat(r) for b, r in spec["beats"].items()}
(out / "timings.js").write_text("window.TIMINGS = " + json.dumps(res, indent=1) + ";\n")
print(f"{len(res)} beats, {sum(v['dur'] for v in res.values())/60:.1f} min of narration")

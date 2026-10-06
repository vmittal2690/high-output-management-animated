"""Generate narration audio and mark timings with Google Cloud Text-to-Speech.

Usage (from the project root):
    python3 tools/high-output-management/tts_google.py content/<book>/chNN/narration.en.json site/<book>/chNN/audio/en

Needs ffprobe (from ffmpeg) and a Google Cloud API key with the Text-to-Speech API enabled, in the
environment as GOOGLE_TTS_API_KEY or in a git-ignored `.env` file at the project root.
Optional: GOOGLE_TTS_VOICE (default en-US-Neural2-J) and GOOGLE_TTS_RATE (speaking rate, default 0.96).

Writes the same <beat>.mp3 and timings.js (dur, marks, cues) as papermorph's tts.py. Each [[mark]] and each
sentence start becomes an SSML <mark>, and Google reports when it is spoken. Only beats whose text, marks
or voice changed are regenerated; finished beats are cached beside the narration JSON.
"""

import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path
from xml.sax.saxutils import escape

MARK = re.compile(r"\[\[(\w+)\]\]")
ENDPOINT = "https://texttospeech.googleapis.com/v1beta1/text:synthesize"


def api_key():
    key = os.environ.get("GOOGLE_TTS_API_KEY")
    env = Path(".env")
    if not key and env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("GOOGLE_TTS_API_KEY="):
                key = line.split("=", 1)[1].strip().strip('"\'')
    if not key:
        raise SystemExit("Missing GOOGLE_TTS_API_KEY (set it in the environment or in .env at the project root).")
    return key


def split_marks(raw):
    """Return clean text and {mark: char position in clean text}."""
    marks, clean, pos = {}, [], 0
    for i, part in enumerate(MARK.split(raw)):
        if i % 2:
            if part in marks:
                raise ValueError(f"duplicate mark {part!r} in one beat")
            marks[part] = pos
        else:
            clean.append(part)
            pos += len(part)
    return "".join(clean), marks


def sentences(clean):
    """[(start char, sentence)] split the same way as the other timing tools."""
    out, start = [], 0
    for m in list(re.finditer(r"[.?!]\s+", clean)) + [None]:
        end = m.end() if m else len(clean)
        text = clean[start:end].strip()
        if text:
            out.append((start + len(clean[start:end]) - len(clean[start:end].lstrip()), text))
        start = end
    return out


def ssml(clean, points):
    """Wrap clean text in SSML with a <mark> at each (position, name)."""
    parts, last = [], 0
    for pos, name in sorted(points):
        parts.append(escape(clean[last:pos]))
        parts.append(f'<mark name="{name}"/>')
        last = pos
    parts.append(escape(clean[last:]))
    return "<speak>" + "".join(parts) + "</speak>"


def synth(text_ssml, voice, rate, key):
    body = {
        "input": {"ssml": text_ssml},
        "voice": {"languageCode": "-".join(voice.split("-")[:2]), "name": voice},
        "audioConfig": {"audioEncoding": "MP3", "speakingRate": rate, "sampleRateHertz": 24000},
        "enableTimePointing": ["SSML_MARK"],
    }
    req = urllib.request.Request(ENDPOINT, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "X-Goog-Api-Key": key})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            res = json.load(r)
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Google TTS error {e.code}: {e.read().decode()[:500]}")
    times = {t["markName"]: round(t["timeSeconds"], 3) for t in res.get("timepoints", [])}
    return base64.b64decode(res["audioContent"]), times


def duration(mp3):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp3)],
                       capture_output=True, text=True, check=True)
    return round(float(r.stdout), 3)


def write_atomic(path, text):
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=f".{path.name}-", delete=False) as f:
        tmp = Path(f.name)
    try:
        tmp.write_text(text, encoding="utf-8")
        tmp.replace(path)
    finally:
        tmp.unlink(missing_ok=True)


def main(src, out_dir):
    key = api_key()
    voice = os.environ.get("GOOGLE_TTS_VOICE", "en-US-Neural2-J")
    rate = float(os.environ.get("GOOGLE_TTS_RATE", "0.96"))
    spec = json.loads(Path(src).read_text())
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    cache_path = Path(src).with_suffix(".google.json")  # build cache, kept out of the site
    cache = json.loads(cache_path.read_text()) if cache_path.exists() else {}
    timings_path = out_dir / "timings.js"
    public = lambda v: {k: v[k] for k in ("dur", "marks", "cues")}
    result = {}
    for beat, raw in spec["beats"].items():
        clean, marks = split_marks(raw)
        sents = sentences(clean)
        points = [(p, f"m.{n}") for n, p in marks.items()] + [(p, f"s.{i}") for i, (p, _) in enumerate(sents)]
        text_ssml = ssml(clean, points)
        k = hashlib.sha1(f"{voice}|{rate}|{text_ssml}".encode()).hexdigest()
        mp3 = out_dir / f"{beat}.mp3"
        old = cache.get(beat)
        if old and old.get("key") == k and mp3.exists() and mp3.stat().st_size > 0:
            result[beat] = old
            continue
        audio, times = synth(text_ssml, voice, rate, key)
        missing = [n for _, n in points if n not in times]
        if missing:
            raise SystemExit(f"{beat}: Google returned no time for {missing}")
        with tempfile.NamedTemporaryFile(dir=out_dir, prefix=f".{beat}-", suffix=".mp3", delete=False) as f:
            f.write(audio)
            tmp = Path(f.name)
        try:
            entry = {"key": k, "dur": duration(tmp),
                     "marks": {n: times[f"m.{n}"] for n in marks},
                     "cues": [[times[f"s.{i}"], s] for i, (_, s) in enumerate(sents)]}
            tmp.replace(mp3)
        finally:
            tmp.unlink(missing_ok=True)
        print(f"{beat}: synthesized ({entry['dur']}s)")
        result[beat] = cache[beat] = entry
        write_atomic(cache_path, json.dumps(cache, indent=1))  # keep finished beats if a later one fails
    for stale in set(p.stem for p in out_dir.glob("*.mp3")) - set(result):
        (out_dir / f"{stale}.mp3").unlink()
    write_atomic(cache_path, json.dumps(result, indent=1))
    write_atomic(timings_path, "window.TIMINGS = " + json.dumps({b: public(v) for b, v in result.items()}, indent=1) + ";\n")


if __name__ == "__main__":
    main(*sys.argv[1:3])

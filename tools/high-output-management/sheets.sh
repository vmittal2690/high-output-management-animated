#!/bin/bash
# Contact sheets without a browser: end-of-beat frames for one lesson, four per PNG (questions, intro, practice skipped).
# usage: bash tools/high-output-management/sheets.sh chNN OUTDIR     (run from the hom-webbook folder)
set -e
ROOT=$(pwd); D=$(mktemp -d); OUT=$2; mkdir -p "$OUT"
node tools/high-output-management/render.js $1 $D >/dev/null
cd $D; for f in *.svg; do convert -density 48 "$f" "${f%.svg}.png"; done
ls *.png | grep -v -E "_q[0-9]|final1|finish|intro" > list.txt
split -l 4 list.txt part_
k=1; for p in part_*; do montage $(cat $p) -tile 2x2 -geometry +4+4 -background '#000' "$OUT/$1_sheet$k.png"; k=$((k+1)); done
echo "$((k-1)) sheets in $OUT"

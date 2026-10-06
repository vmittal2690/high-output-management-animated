// Layout lint without a browser: runs every beat against stub drawing functions, then reports
// missing marks, script errors, text off the stage or below y 770, and text boxes that overlap.
const fs = require('fs');
const [ch] = process.argv.slice(2);
const SITE = process.env.SITE || 'site/high-output-management/';
const html = fs.readFileSync(SITE + ch + '/index.html', 'utf8');
const lesson = html.split('<script>')[1].split('</script>')[0].replace('boot();', '');
const book = fs.readFileSync(SITE + 'lib/book.js', 'utf8');
global.window = {}; eval(fs.readFileSync(SITE + ch + '/audio/en/timings.js', 'utf8')); const TIMINGS = window.TIMINGS;
const src = `
const COL = { nat: '#f4a48c', whole: '#86c9e8', int: '#f3c95c', rat: '#e8a0c8', irr: '#8fd6b0', real: '#bba8ee', chalk: '#ece8dc', dim: '#9aaba3', faint: '#5d7068', task: '#f0b45a', good: '#8fd6b0', bad: '#f08c7a', board: '#1d2b27' };
const BAND = { x: 96, y: 686, w: 1408, cls: 'band' }, TOPR = {}, SCREEN = {}, RIGHT = {};
const io = 0, out = 0, back = 0, lin = 0;
let TEXTS = [], ROOT = null, CUR = '';
class El { constructor(tag, a = {}, p) { this.tag = tag; this.a = a; this.kids = []; this.st = { x: 0, y: 0, s: 1 }; this.p = p || null; if (p) p.kids.push(this); }
  get children() { return this.kids; } get firstChild() { return this.kids[0]; } setAttribute(k, v) { this.a[k] = v; } remove() {} get classList() { return { add() {}, toggle() {} }; } }
function abs(e) { let x = 0, y = 0, s = 1; const chain = []; for (let q = e; q; q = q.p) chain.unshift(q); for (const q of chain) { x += q.st.x * s; y += q.st.y * s; s *= q.st.s ?? 1; } return { x, y, s }; }
const scene = new El('g');
const S = {};
function G(p, o = {}) { const g = new El('g', {}, p); Object.assign(g.st, { x: o.x || 0, y: o.y || 0, s: o.s ?? 1 }); return g; }
function mk(tag, a, p) { return new El(tag, a, p); }
function path(p, d, a = {}) { return new El('path', { d, ...a }, p); }
function T(p, str, o = {}) { const t = new El('text', {}, p); t.str = String(str); t.o = o; TEXTS.push({ t, beat: CUR }); return t; }
const put = (e, s) => { if (s.x !== undefined) e.st.x = s.x; if (s.y !== undefined) e.st.y = s.y; if (s.s !== undefined) e.st.s = s.s; };
const tw = (e, to) => { if (e && e.st && to.s === undefined) { if (to.x !== undefined) e.final = Object.assign(e.final || {}, { x: to.x }); if (to.y !== undefined) e.final = Object.assign(e.final || {}, { y: to.y }); } if (e && to.o === 0) e.gone = true; };
const show = () => {}, draw = () => {}, pop = () => {}, prog = () => {}, pulse = () => {};
const hide = (e) => { if (e) e.gone = true; };
function panel() { ROOT = new El('g', {}, scene); return ROOT; }
const QERR = [];
function quiz(pos, qs) { qs.forEach(q => { if (!q.id || !q.build) QERR.push('bad question ' + q.id); if (typeof q.build === 'string') QERR.push(q.id + ': ' + q.build); }); }
function choice(opts, right, yes, no) { if (opts.length !== no.length) return 'options/whys length mismatch'; if (no[right] !== null) return 'right option has a why'; if (no.some((w, i) => i !== right && !w)) return 'missing wrong-why'; return () => {}; }
function grid(items, cols) { const keys = cols.map(c => c[0]); for (const it of items) if (!it.ans.every(k => keys.includes(k)) || !it.why) return 'grid row bad: ' + it.parts; return () => {}; }
function pickEls(items, right) { if (!items[right] || items.some(i => !i.el || i.box.length !== 4)) return 'pickEls bad'; return () => {}; }
function blanks(rows) { return () => {}; } function finishCard() {}
${book}
${lesson}
module.exports = { QERR, BEATS, S, getT: () => TEXTS, setCur: c => { CUR = c; }, resetT: () => { TEXTS = []; }, abs };
`;
fs.writeFileSync('/tmp/_lint_mod_' + ch + '_' + process.pid + '.js', src);
const L = require('/tmp/_lint_mod_' + ch + '_' + process.pid + '.js');
const W = (t) => { const sz = t.o.size || 24, wt = t.o.weight || 400; return t.str.length * sz * (wt >= 600 ? .56 : .52); };
let issues = 0;
for (const b of L.BEATS) {
  const tm = TIMINGS[b.id]; if (!tm) { console.log(b.id, 'NO TIMINGS'); issues++; continue; }
  const m = (k, off = 0) => { if (!(k in tm.marks)) throw new Error('missing mark ' + k); return tm.marks[k] + off; };
  L.setCur(b.id);
  try { b.run(m, tm.dur); } catch (e) { console.log(b.id, 'ERROR', e.message); issues++; }
  if (b.ask && b.id !== 'finish') { try { b.ask(() => {}); } catch (e) { console.log(b.id, 'ASK ERROR', e.message); issues++; } }
}
// group texts by the panel they belong to, evaluated at their final state
const T = L.getT();
const byBeat = {};
for (const { t, beat } of T) {
  let gone = false; for (let q = t; q; q = q.p) if (q.gone) gone = true;
  if (gone) continue;
  // apply final tweened positions
  const saved = []; for (let q = t; q; q = q.p) if (q.final) { saved.push([q, { ...q.st }]); Object.assign(q.st, q.final); }
  const P = L.abs(t); saved.forEach(([q, s]) => q.st = s);
  const sz = (t.o.size || 24) * P.s, w = W(t) * P.s, x = P.x + (t.o.x || 0) * P.s, y = P.y + (t.o.y || 0) * P.s;
  const a = t.o.anchor || 'start', x0 = a === 'middle' ? x - w / 2 : a === 'end' ? x - w : x;
  (byBeat[beat] = byBeat[beat] || []).push({ s: t.str, x0, x1: x0 + w, y0: y - sz * .75, y1: y + sz * .22 });
}
for (const [beat, arr] of Object.entries(byBeat)) {
  for (const r of arr) {
    if (r.x0 < 15 || r.x1 > 1585) { console.log(beat, 'OFF-STAGE x', Math.round(r.x0), Math.round(r.x1), JSON.stringify(r.s)); issues++; }
    if (r.y1 > 772) { console.log(beat, 'BELOW 770', Math.round(r.y1), JSON.stringify(r.s)); issues++; }
  }
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
    const A = arr[i], B = arr[j];
    const ox = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0), oy = Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0);
    if (ox > 4 && oy > 3) { console.log(beat, 'OVERLAP', JSON.stringify(A.s), '×', JSON.stringify(B.s), `(${Math.round(ox)}×${Math.round(oy)})`); issues++; }
  }
}
for (const [b, a] of Object.entries(byBeat)) if (process.env.V) console.log(b, a.length, a.slice(0,3).map(r=>r.s+"@"+Math.round(r.x0)+","+Math.round(r.y0)).join(" ; "));
L.QERR.forEach(e => { console.log('QUESTION', e); issues++; });
console.log(issues ? issues + ' issue(s)' : 'clean');

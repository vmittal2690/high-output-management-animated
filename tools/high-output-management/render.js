// Render end-of-beat frames to SVG without a browser: stub drawing API with real state, tweens applied at the end of each beat.
const fs = require('fs');
const [ch, outdir] = process.argv.slice(2);
const SITE = process.env.SITE || 'site/high-output-management/';
const html = fs.readFileSync(SITE + ch + '/index.html', 'utf8');
const lesson = html.split('<script>')[1].split('</script>')[0].replace('boot();', '');
const book = fs.readFileSync(SITE + 'lib/book.js', 'utf8');
global.window = {}; eval(fs.readFileSync(SITE + ch + '/audio/en/timings.js', 'utf8'));
const src = `
const COL = { nat: '#f4a48c', whole: '#86c9e8', int: '#f3c95c', rat: '#e8a0c8', irr: '#8fd6b0', real: '#bba8ee', chalk: '#ece8dc', dim: '#9aaba3', faint: '#5d7068', task: '#f0b45a', good: '#8fd6b0', bad: '#f08c7a', board: '#1d2b27' };
const BAND = {}, TOPR = {}, SCREEN = {}, RIGHT = {};
const io = 0, out = 0, back = 0, lin = 0;
let TW = [];
class El { constructor(tag, a = {}, p) { this.tag = tag; this.a = a; this.kids = []; this.st = {}; this.p = p || null; if (p) p.kids.push(this); }
  get children() { return this.kids; } get firstChild() { return this.kids[0]; } setAttribute(k, v) { this.a[k] = v; } remove() {} get classList() { return { add() {}, toggle() {} }; } }
const scene = new El('g');
const S = {};
function G(p, o = {}) { const g = new El('g', {}, p); for (const k of ['x', 'y', 's', 'r', 'o']) if (o[k] !== undefined) g.st[k] = o[k]; return g; }
function mk(tag, a, p) { return new El(tag, { ...a }, p); }
function path(p, d, a = {}, o = {}) { const e = new El('path', { d, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...a }, p); if (o.d === 0) e.st.d = 0; return e; }
function T(p, str, o = {}) { const t = new El('text', { x: o.x || 0, y: o.y || 0, 'font-size': o.size || 30, fill: o.fill || COL.chalk, 'font-weight': o.weight || 500, 'text-anchor': o.anchor || 'start' }, p); t.str = String(str); if (o.o !== undefined) t.st.o = o.o; return t; }
const put = (e, s) => Object.assign(e.st, s);
const tw = (e, to, t0 = 0, dur = .5) => TW.push([e, to, t0 + dur]);
const show = (e, t0 = 0, dur = .4) => TW.push([e, { o: 1 }, t0 + dur]);
const hide = (e, t0 = 0, dur = .4) => TW.push([e, { o: 0 }, t0 + dur]);
const draw = (e, t0 = 0, dur = .5) => TW.push([e, { d: 1 }, t0 + dur]);
const pop = (e, t0 = 0) => TW.push([e, { s: 1, o: 1 }, t0 + .4]);
const prog = () => {}, pulse = () => {};
let ROOT = null;
function panel() { if (ROOT) ROOT.st.o = 0; ROOT = G(scene); return ROOT; }
function quiz() {} function choice() {} function grid() {} function pickEls() {} function blanks() {} function finishCard() {}
${book}
${lesson}
module.exports = { BEATS, scene, flush: () => { TW.sort((a, b) => a[2] - b[2]); for (const [e, to] of TW) Object.assign(e.st, to); TW = []; } };
`;
fs.writeFileSync('/tmp/_render_mod_' + ch + '_' + process.pid + '.js', src);
delete require.cache['/tmp/_render_mod_' + ch + '_' + process.pid + '.js'];
const L = require('/tmp/_render_mod_' + ch + '_' + process.pid + '.js');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function svg(e) {
  const a = { ...e.a }, st = e.st;
  for (const [k, v] of Object.entries(st)) if (k.startsWith('a_') || k.startsWith('c_')) a[k.slice(2)] = v;
  if (st.o !== undefined && st.o <= 0.001) return '';
  if (st.d === 0) return '';
  if (st.x || st.y || st.r || (st.s !== undefined && st.s !== 1)) {
    const s = st.s ?? 1, r = (st.r || 0) * Math.PI / 180, c = Math.cos(r) * s, n = Math.sin(r) * s;
    a.transform = `matrix(${c.toFixed(5)},${n.toFixed(5)},${(-n).toFixed(5)},${c.toFixed(5)},${st.x || 0},${st.y || 0})`;
  }
  if (st.o !== undefined && st.o < 1) a.opacity = st.o;
  const at = Object.entries(a).map(([k, v]) => `${k}="${esc(String(v))}"`).join(' ');
  if (e.tag === 'text') return `<text ${at}>${esc(e.str)}</text>`;
  return `<${e.tag} ${at}>${e.kids.map(svg).join('')}</${e.tag}>`;
}
fs.mkdirSync(outdir, { recursive: true });
L.BEATS.forEach((b, i) => {
  const tm = window.TIMINGS[b.id];
  const m = (k, off = 0) => { if (!(k in tm.marks)) throw new Error(b.id + ' missing mark ' + k); return tm.marks[k] + off; };
  try { b.run(m, tm.dur); } catch (e) { console.log('ERR', b.id, e.message); }
  L.flush();
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" font-family="DejaVu Sans"><rect width="1600" height="900" fill="#1d2b27"/>${svg(L.scene)}</svg>`;
  fs.writeFileSync(`${outdir}/${String(i).padStart(2, '0')}_${b.id}.svg`, doc);
});
console.log('rendered', L.BEATS.length);

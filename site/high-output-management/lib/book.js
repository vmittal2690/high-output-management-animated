// Shared drawing helpers for this book (prefixed hm to stay clear of engine globals).
'use strict';
const hmSay = (p, str, x, y, t0, { size = 34, fill = COL.chalk, anchor = 'middle', weight = 500 } = {}) => {
  const e = T(p, str, { x, y, size, fill, anchor, weight, o: 0 }); show(e, t0); return e;
};
const hmLines = (p, arr, x, y, t0, o = {}) => arr.map((s, i) => hmSay(p, s, x, y + i * (o.lh || (o.size || 34) * 1.3), t0, o));
// A bar that grows leftward from its finishing edge: the plan is built backward from the deadline.
function hmBarBack(p, xEnd, y, w, h, fill, t0, dur = .9, attrs = {}) {
  const r = mk('rect', { x: xEnd, y, width: 0, height: h, rx: 8, fill, ...attrs }, p);
  put(r, { a_x: xEnd, a_width: 0 });
  tw(r, { a_x: xEnd - w, a_width: w }, t0, dur, out);
  return r;
}
// A bar that rises from a baseline.
function hmBarUp(p, x, base, w, h, fill, t0, dur = .7) {
  const r = mk('rect', { x, y: base, width: w, height: 0, rx: 6, fill }, p);
  put(r, { a_y: base, a_height: 0 });
  tw(r, { a_y: base - h, a_height: h }, t0, dur, out);
  return r;
}
function hmBox(p, x, y, w, h, color, t0, lines, { size = 30, fill = COL.chalk, sub, bg = '#16211d' } = {}) {
  const g = G(p, { x, y, o: 0 });
  mk('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 14, fill: bg, stroke: color, 'stroke-width': 3 }, g);
  const L = [].concat(lines), S2 = [].concat(sub || []);
  const total = L.length * size * 1.25 + S2.length * 22 * 1.35;
  let yy = -total / 2 + size * .95;
  L.forEach(s => { T(g, s, { x: 0, y: yy, size, fill, weight: 600, anchor: 'middle' }); yy += size * 1.25; });
  S2.forEach(s => { T(g, s, { x: 0, y: yy, size: 22, fill: COL.dim, anchor: 'middle' }); yy += 22 * 1.35; });
  show(g, t0);
  return g;
}
function hmArrow(p, x1, y1, x2, y2, color, t0, dur = .6) {
  const a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - 16 * Math.cos(a), hy = y2 - 16 * Math.sin(a);
  const px = 9 * Math.sin(a), py = -9 * Math.cos(a);
  const g = G(p);
  draw(path(g, `M${x1} ${y1}L${x2} ${y2}`, { stroke: color, 'stroke-width': 3.5 }, { d: 0 }), t0, dur);
  draw(path(g, `M${hx + px} ${hy + py}L${x2} ${y2}L${hx - px} ${hy - py}`, { stroke: color, 'stroke-width': 3.5 }, { d: 0 }), t0 + dur * .8, .25);
  return g;
}
function hmCross(p, x, y, color = COL.bad, r = 20) {
  const g = G(p, { x, y, s: 0, o: 0 });
  mk('circle', { r: r + 8, fill: '#1d2b27', stroke: color, 'stroke-width': 3 }, g);
  path(g, `M${-r * .55} ${-r * .55}L${r * .55} ${r * .55}M${r * .55} ${-r * .55}L${-r * .55} ${r * .55}`, { stroke: color, 'stroke-width': 5 });
  return g;
}
// Rising value: one bar per stage. Returns bars and their geometry.
function hmStairs(p, names, heights, base, t0s, { x0 = 290, step = 270, w = 210, fill = COL.whole, labelY = 40 } = {}) {
  return names.map((n, i) => {
    const x = x0 + i * step, bar = hmBarUp(p, x, base, w, heights[i], fill, t0s[i]);
    const lab = hmSay(p, n, x + w / 2, base + labelY, t0s[i], { size: 26, fill: COL.dim });
    return { bar, lab, x, w, top: base - heights[i], h: heights[i], cx: x + w / 2 };
  });
}
function hmWrap(p, items, m) {
  items.forEach(([str, mark], i) => {
    const g = G(p, { x: -16, y: 230 + i * 125, o: 0 });
    mk('circle', { cx: 230, cy: -12, r: 26, fill: COL.task }, g);
    T(g, String(i + 1), { x: 230, y: -1, size: 30, fill: COL.board, weight: 700, anchor: 'middle' });
    T(g, str, { x: 290, size: 36, weight: 600 });
    tw(g, { o: 1, x: 0 }, m(mark), .6);
  });
}
function hmTitle(m, D, unit, title, sub) {
  const g = G(scene, { o: 0, y: 24 });
  T(g, unit, { x: 800, y: 320, size: 28, fill: COL.dim, anchor: 'middle' });
  T(g, title, { x: 800, y: 420, size: 78, weight: 600, anchor: 'middle' });
  tw(g, { o: 1, y: 0 }, .2, 1.1, out);
  const r = hmSay(scene, sub, 800, 560, m('sub'), { size: 34, fill: COL.dim });
  tw(g, { o: 0, y: -24 }, D - .9, .8); hide(r, D - .9, .8);
}
const MID = { x: 200, y: 150, w: 1200, cls: 'side' };

// A row of n labelled stage boxes joined by arrows; returns the box groups.
function hmChain(p, names, xs, y, w, h, color, t0s, o = {}) {
  return names.map((n, i) => {
    if (i) hmArrow(p, xs[i - 1] + w / 2 + 8, y, xs[i] - w / 2 - 10, y, COL.dim, t0s[i] - .15, .35);
    return hmBox(p, xs[i], y, w, h, color, t0s[i], n, { size: o.size || 26, sub: o.subs && o.subs[i] });
  });
}
const hmRule = (p, str, t0, y = 745) => hmSay(p, str, 800, y, t0, { size: 32, fill: COL.task, weight: 700 });
const hmHead = (p, str, t0 = .2, y = 110) => hmSay(p, str, 800, y, t0, { size: 40, weight: 600 });
const hmDot = (p, x, y, fill, r = 12) => { const d = G(p, { x, y, o: 0 }); mk('circle', { r, fill }, d); return d; };

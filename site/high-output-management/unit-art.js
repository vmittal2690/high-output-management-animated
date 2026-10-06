// Chalk sketches for the unit headers on the contents page, one per unit, drawn in the unit's colour.
'use strict';
(() => {
  let k = 0;
  const P = (d, cls = '', extra = '') => `<path class="d ${cls}" pathLength="1" style="--k:${k++}" d="${d}" ${extra}/>`;
  const Tx = (x, y, s, size = 24, cls = '', anchor = 'start') => `<text class="t ${cls}" style="--k:${k++}" x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}">${s}</text>`;
  const reset = s => { k = 0; return s; };
  window.UNIT_ART = [
    // 1 The breakfast plan: three bars of different lengths that finish on the same line.
    reset(P('M250 44H520', '', 'stroke-width="14"') + P('M400 88H520', 'a', 'stroke-width="14"') + P('M450 132H520', 'a', 'stroke-width="14"') +
      P('M532 24V156', 'a') + Tx(250, 30, 'limiting step', 20) + Tx(546, 96, 'deliver', 20, 'a')),
    // 2 Managing the factory: a straight-line plan with actual progress falling below it.
    reset(P('M250 150V30', 'a') + P('M250 150H570', 'a') + P('M250 150L560 40') + P('M250 150L320 136L390 118L460 104', 'a', 'stroke-width="5"') +
      Tx(470, 34, 'goal', 20) + Tx(474, 112, 'actual', 20, 'a')),
    // 3 Managerial leverage: a lever whose long arm, pushed lightly, lifts the team's output on the short arm.
    reset(P('M260 150L570 96') + P('M488 150L506 110L524 150Z', 'a') + P('M532 92V58H568V88', 'a') +
      P('M268 112V140', '', 'stroke-width="5"') + P('M260 128L268 140L276 128', '') +
      Tx(262, 100, 'one hour', 20) + Tx(500, 44, 'team output', 20, 'a')),
    // 4 Meetings: two chairs facing across a small table, and a calendar square that repeats.
    reset(P('M300 150V96H340V150') + P('M300 96V60') + P('M520 150V96H480V150', 'a') + P('M520 96V60', 'a') +
      P('M370 110H450') + P('M410 110V150') + Tx(352, 40, 'one-on-one', 20) + P('M560 40H590V70H560Z', 'a') + P('M560 90H590V120H560Z', 'a')),
    // 5 Decisions: three linked circles, discussion, decision, support, with a dashed loop back.
    reset(P('M270 90A30 30 0 1 0 330 90A30 30 0 1 0 270 90') + P('M340 90H390') + P('M400 90A30 30 0 1 0 460 90A30 30 0 1 0 400 90', 'a') +
      P('M470 90H520') + P('M530 90A30 30 0 1 0 590 90A30 30 0 1 0 530 90') + P('M560 124V150H300V124', 'a', 'stroke-dasharray="6 6"') + Tx(372, 40, 'free · clear · support', 20)),
    // 6 Planning: a fuel gauge, then a road with three milestone dots ending at a flag.
    reset(P('M260 140A50 50 0 0 1 360 140') + P('M310 140L282 104', 'a', 'stroke-width="5"') + P('M390 140H560') +
      P('M423 140A7 7 0 1 0 437 140A7 7 0 1 0 423 140', 'a') + P('M473 140A7 7 0 1 0 487 140A7 7 0 1 0 473 140', 'a') + P('M523 140A7 7 0 1 0 537 140A7 7 0 1 0 523 140', 'a') +
      P('M560 140V70L590 82L560 94', 'a') + Tx(400, 60, 'key results', 20, 'a')),
    // 7 Goes national: one restaurant dot fanning out through a regional node to many dots.
    reset(P('M268 90A12 12 0 1 0 292 90A12 12 0 1 0 268 90', 'a') + P('M292 90H400') + P('M400 90A10 10 0 1 0 420 90A10 10 0 1 0 400 90') +
      P('M420 90L540 40M420 90L560 90M420 90L540 140M420 90L510 60M420 90L510 120') + Tx(262, 140, 'headquarters', 20, 'a') + Tx(380, 60, 'region', 20)),
    // 8 Hybrid organizations: a column of shared functional boxes wired by one spine to mission boxes.
    reset(P('M270 40H340V70H270Z', 'a') + P('M270 85H340V115H270Z', 'a') + P('M270 130H340V160H270Z', 'a') + P('M340 100H420') + P('M420 40V160') +
      P('M420 40H470M420 100H470M420 160H470') + P('M470 28H560V52H470Z') + P('M470 88H560V112H470Z') + P('M470 148H560V172H470Z') + Tx(262, 24, 'shared', 20, 'a')),
    // 9 Dual reporting: one person, a solid line up to a business boss and a dashed line to a peer group.
    reset(P('M410 150V110') + P('M410 110L320 50') + P('M410 110L500 50', 'a', 'stroke-dasharray="8 7"') + P('M280 30H360V60H280Z') + P('M460 30H560V60H460Z', 'a', 'stroke-dasharray="8 7"') +
      P('M400 160A10 10 0 1 0 420 160A10 10 0 1 0 400 160') + Tx(282, 90, 'boss', 20) + Tx(470, 90, 'peers', 20, 'a')),
    // 10 Modes of control: a 2x2 grid with one hatched cell, a road with a traffic light below.
    reset(P('M300 30H460V130H300Z') + P('M380 30V130M300 80H460') + P('M380 30L460 80M400 30L460 66M420 30L460 52', 'a') +
      P('M260 160H580') + P('M520 160V120') + P('M512 100H528V120H512Z', 'a') + Tx(470, 45, 'market', 20) + Tx(470, 72, 'culture', 20, 'a')),
    // 11 Sports analogy: a stepped five-level ladder with a runner heading for the top step.
    reset(P('M280 160H340V130H400V100H460V70H520V40H580') + P('M538 30A7 7 0 1 0 552 30A7 7 0 1 0 538 30', 'a') + P('M545 37L540 55L530 66M540 55L552 66M542 44L530 48M542 44L556 40', 'a') + Tx(270, 110, 'needs', 20)),
    // 12 Task-relevant maturity: three boxes on a rising arrow, tell, talk, monitor.
    reset(P('M270 160L580 40') + P('M566 34L580 40L572 54') + P('M280 120H360V150H280Z', 'a') + P('M390 85H470V115H390Z') + P('M500 50H580V80H500Z', 'a') +
      Tx(292, 142, 'tell', 20, 'a') + Tx(404, 107, 'talk', 20) + Tx(505, 72, 'monitor', 20, 'a')),
    // 13 Performance appraisal: a two-pan scale, output against internal measures.
    reset(P('M420 160V40') + P('M330 60H510') + P('M330 60L300 110H360Z', 'a') + P('M510 60L480 110H540Z') + P('M390 160H450') +
      Tx(286, 140, 'output', 20, 'a') + Tx(470, 140, 'internal', 20)),
    // 14 Two difficult tasks: an interview chair and a desk; a door with someone halfway out.
    reset(P('M270 150V110H310V150M270 110V80') + P('M330 110H410M350 110V150M390 110V150') + P('M480 40H540V160H480Z') +
      P('M522 100A8 8 0 1 0 538 100A8 8 0 1 0 522 100', 'a') + P('M530 108V140M530 120L560 110', 'a') + Tx(270, 40, 'interview', 20) + Tx(470, 30, 'I quit!', 20, 'a')),
    // 15 Compensation: one rising pay curve that fans out, with a step up for a promotion.
    reset(P('M270 150C330 140 370 120 400 100') + P('M400 100C450 80 500 70 560 64', 'a') + P('M400 100C450 95 500 92 560 92') + P('M400 100C450 110 500 116 560 120') +
      P('M480 72V40H560', 'a', 'stroke-dasharray="6 6"') + Tx(270, 60, 'pay as feedback', 20)),
    // 16 One more thing: a ticked checklist and a tally filling to 100.
    reset(P('M280 50L292 62L312 38', 'a') + P('M330 50H420') + P('M280 95L292 107L312 83', 'a') + P('M330 95H420') + P('M290 140H310') + P('M330 140H420') +
      P('M480 160V40H540V160Z') + P('M480 160V80H540', 'a') + Tx(486, 30, '100', 20, 'a')),
    // 17 Bonus, agents: a person hands a brief to a rounded-square agent; a gate stands before "send".
    reset(P('M290 80A12 12 0 1 0 314 80A12 12 0 1 0 290 80') + P('M302 92V130M302 104L340 100') + P('M345 92H375V112H345Z', 'a') +
      P('M400 70H470V130H400Z', 'a') + P('M420 92A4 4 0 1 0 428 92A4 4 0 1 0 420 92', 'a') + P('M442 92A4 4 0 1 0 450 92A4 4 0 1 0 442 92', 'a') +
      P('M470 100H530') + P('M530 70V130', '', 'stroke-width="6"') + P('M535 100H580') + P('M570 92L580 100L570 108') + Tx(500, 60, 'gate', 20) + Tx(350, 150, 'brief', 20, 'a')),
  ];
})();

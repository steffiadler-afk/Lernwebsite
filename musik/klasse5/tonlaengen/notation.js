import {NOTES} from './model.js';
// Glyph outlines: Noto Music, SIL Open Font License 1.1.
const PATHS={"w": "M50 135Q50 172 77.0 200.0Q104 228 150.5 244.0Q197 260 253 260Q310 260 358.0 244.5Q406 229 435.0 201.0Q464 173 464 135Q464 96 436.0 67.5Q408 39 361.5 23.5Q315 8 259 8Q203 8 155.5 23.0Q108 38 79.0 66.5Q50 95 50 135ZM280 28Q314 28 326.5 53.0Q339 78 339 112Q339 147 324.5 176.0Q310 205 286.0 222.5Q262 240 232 240Q198 240 186.5 215.0Q175 190 175 156Q175 122 189.0 93.0Q203 64 226.5 46.0Q250 28 280 28Z", "h": "M323 1009H347V169Q347 137 330.5 106.5Q314 76 286.0 52.0Q258 28 225.0 13.5Q192 -1 159 -1Q111 -1 80.5 21.5Q50 44 50 90Q50 141 78.5 181.5Q107 222 153.0 245.5Q199 269 251 269Q295 269 323 247ZM77 66Q77 56 84.5 48.0Q92 40 105 40Q140 40 192 69Q227 89 255.5 113.5Q284 138 301.0 162.5Q318 187 318 204Q318 215 312.5 222.5Q307 230 293 230Q274 230 247.0 218.0Q220 206 190.5 187.0Q161 168 135.0 145.5Q109 123 93.0 102.0Q77 81 77 66Z", "q": "M350 1009V173Q350 130 321.5 93.0Q293 56 248.0 33.5Q203 11 153 11Q107 11 79.0 34.5Q51 58 51 98Q51 129 69.0 158.0Q87 187 116.5 210.5Q146 234 181.0 247.5Q216 261 250 261Q293 261 324 236V1009Z", "e": "M325 1009H351Q357 968 366.0 936.5Q375 905 392.0 875.5Q409 846 437 812Q467 777 487.0 753.5Q507 730 527 704Q564 658 581.5 609.5Q599 561 599 511Q599 407 511 259H495Q523 318 545.5 377.5Q568 437 568 491Q568 545 540 602Q512 659 461.5 698.0Q411 737 351 741V175Q351 132 323.5 94.5Q296 57 251.0 34.0Q206 11 152 11Q109 11 79.5 33.0Q50 55 50 98Q50 130 67.0 159.5Q84 189 112.0 212.0Q140 235 173.5 248.0Q207 261 241 261Q299 261 325 238Z", "s": "M321 1009H347Q350 980 356.0 958.0Q362 936 372 919Q389 892 413.0 872.5Q437 853 468 822Q498 793 527.0 757.5Q556 722 575.5 677.0Q595 632 595 576Q595 531 581 478Q607 440 607 368Q607 320 594.0 272.5Q581 225 556 191H540Q587 283 587 351Q587 406 556 452Q536 482 511.5 505.5Q487 529 449.0 554.0Q411 579 347 611V171Q347 128 318.5 91.5Q290 55 245.0 33.0Q200 11 152 11Q110 11 80.0 30.0Q50 49 50 89Q50 137 79.0 176.0Q108 215 154.0 238.5Q200 262 249 262Q294 262 321 238ZM353 823Q353 771 376 727Q384 713 408.5 682.0Q433 651 467 619Q505 583 534.0 550.0Q563 517 568 505Q570 513 571.0 523.5Q572 534 572 547Q572 623 523.0 690.0Q474 757 353 823Z", "rw": "M50 488V512H733V488H573V378H210V488Z", "rh": "M50 244V268H210V378H573V268H733V244Z", "rq": "M147 878 307 683Q257 624 230.0 581.0Q203 538 203 494Q203 457 227.0 416.5Q251 376 303 314L287 292Q243 320 205 320Q177 320 163.0 301.5Q149 283 149 257Q149 225 162.5 196.5Q176 168 199 142L186 123Q117 173 84.0 214.0Q51 255 51 303Q51 346 78.0 366.0Q105 386 143 386Q173 386 221 363V365L67 570Q168 659 168 736Q168 797 104 878Z", "re": "M155 269 251 609Q230 590 203.5 582.0Q177 574 151 574Q108 574 79.0 597.0Q50 620 50 663Q50 691 70.0 710.5Q90 730 121 730Q150 730 168.5 711.5Q187 693 187 662Q187 640 177 623Q177 617 189 617Q244 617 294 703H312L191 269Z", "rs": "M155 147 251 487Q230 468 203.5 460.0Q177 452 151 452Q108 452 79.0 475.0Q50 498 50 541Q50 569 69.5 588.5Q89 608 121 608Q150 608 168.5 589.5Q187 571 187 540Q187 518 177 501Q177 495 189 495Q230 495 267 541L319 731Q298 712 271.5 704.0Q245 696 219 696Q176 696 147.0 719.0Q118 742 118 785Q118 813 138.0 832.5Q158 852 189 852Q219 852 237.0 833.0Q255 814 255 784Q255 774 252.0 763.5Q249 753 245 745Q245 739 257 739Q312 739 362 825H380L191 147Z"};

function glyph(key, x, baseline = 100) {
  return `<path d="${PATHS[key]}" transform="translate(${x} ${baseline}) scale(.068 -.068)" fill="currentColor"/>`;
}

function line(x1, y1, x2, y2, width = 2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="${width}"/>`;
}

function beamGroup(sequence, start, x, tick, gap) {
  const key = sequence[start];
  const ticks = NOTES[key].ticks;
  let count = 1;
  while (sequence[start + count] === key && start + count !== gap && (tick % 4) + count * ticks < 4) count++;
  if (count === 1) return null;
  const notes = Array.from({ length: count }, (_, i) => glyph('q', x + i * 31)).join('');
  const width = (count - 1) * 31 + 2;
  const beam = y => `<rect x="${x + 22}" y="${y}" width="${width}" height="6" fill="currentColor"/>`;
  return { count, ink: notes + beam(31.4) + (key === 's' ? beam(41.4) : ''), width: (count - 1) * 31 + 48 };
}

// The five-line staff fixes the vertical position of whole and half rests.
export function notation(sequence, { gap, gapTicks = 0, staff = false, bar = false, meter = false } = {}) {
  let x = meter ? 47 : 17;
  let tick = 0;
  let ink = '';
  if (staff) {
    ink += `<g opacity=".4">${[35, 50, 65, 80, 95].map(y => line(5, y, 115, y, 1.4)).join('')}</g>`;
  }
  if (meter) {
    ink += '<text x="9" y="74" font-size="25" font-weight="800" fill="currentColor">4</text>';
    ink += '<text x="9" y="103" font-size="25" font-weight="800" fill="currentColor">4</text>';
  }
  const labels = [];
  for (let i = 0; i <= sequence.length;) {
    if (i === gap) {
      ink += `<rect x="${x}" y="30" width="49" height="73" rx="5" fill="none" stroke="currentColor" stroke-dasharray="4 4"/>`;
      labels.push('Lücke');
      x += 63;
      tick += gapTicks;
    }
    if (i === sequence.length) break;
    const key = sequence[i];
    const beamed = !staff && (key === 'e' || key === 's') ? beamGroup(sequence, i, x, tick, gap) : null;
    if (beamed) {
      ink += beamed.ink;
      x += beamed.width;
      tick += beamed.count * NOTES[key].ticks;
      labels.push(...sequence.slice(i, i + beamed.count).map(note => NOTES[note].name));
      i += beamed.count;
    } else {
      const baseline = key === 'rw' ? 50 + 512 * .068 : key === 'rh' ? 65 + 244 * .068 : staff ? 105 : 100;
      ink += glyph(key, x, baseline);
      x += key === 'rw' || key === 'rh' ? 60 : 50;
      tick += NOTES[key].ticks;
      labels.push(NOTES[key].name);
      i++;
    }
  }
  const width = staff ? 120 : Math.max(x + 13, meter ? 140 : 92);
  if (bar || meter) {
    ink = `<g opacity=".32">${line(meter ? 6 : 5, 91, width - 7, 91, 1.4)}</g>` + ink;
    if (!meter) ink += line(5, 28, 5, 108);
    ink += line(width - 7, 28, width - 7, 108);
  }
  return `<svg class="notation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 125" width="${width}" height="125" role="img" aria-label="${labels.join(', ') || 'Leerer Takt'}">${ink}</svg>`;
}

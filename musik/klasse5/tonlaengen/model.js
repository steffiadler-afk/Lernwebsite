// A quarter note contains four ticks, so all rhythms can be counted in integers.
export const NOTES = {
  w: { name: 'Ganze Note', ticks: 16, beats: '4' },
  h: { name: 'Halbe Note', ticks: 8, beats: '2' },
  q: { name: 'Viertelnote', ticks: 4, beats: '1' },
  e: { name: 'Achtelnote', ticks: 2, beats: '½' },
  s: { name: 'Sechzehntelnote', ticks: 1, beats: '¼' },
  rw: { name: 'Ganze Pause', ticks: 16, beats: '4' },
  rh: { name: 'Halbe Pause', ticks: 8, beats: '2' },
  rq: { name: 'Viertelpause', ticks: 4, beats: '1' },
  re: { name: 'Achtelpause', ticks: 2, beats: '½' },
  rs: { name: 'Sechzehntelpause', ticks: 1, beats: '¼' }
};
export const NOTE_KEYS = ['w', 'h', 'q', 'e', 's'];
export const REST_KEYS = ['rw', 'rh', 'rq', 're', 'rs'];
export const MODES = [
  { id: 'echo', title: 'Rhythmus-Echo', description: 'Höre einen Takt und klopfe ihn anschließend nach.', category: 'Hören und spielen' },
  { id: 'ears', title: 'Rhythmus-Detektiv', description: 'Welches Notenbild passt zum gehörten Rhythmus?', category: 'Hören und spielen' },
  { id: 'rebuild', title: 'Rhythmus nachbauen', description: 'Höre hin, fülle die Lücke und spiele deine Lösung ab.', category: 'Hören und spielen' },
  { id: 'meter', title: 'Taktgefühl', description: 'Wo hörst du die Eins? Erkenne den Zweier-, Dreier- oder Vierertakt.', category: 'Hören und spielen' },
  { id: 'names', title: 'Noten erkennen', description: 'Schreibe den Namen der Note.', category: 'Noten lesen' },
  { id: 'lengths', title: 'Tonlängen bestimmen', description: 'Zähle die Viertelschläge und höre die Notenwerte.', category: 'Noten lesen' },
  { id: 'rests', title: 'Pausen zuordnen', description: 'Finde zur Note die gleich lange Pause.', category: 'Noten lesen' },
  { id: 'bars', title: 'Takte ergänzen', description: 'Welche Note fehlt im 4/4-Takt?', category: 'Noten lesen' },
  { id: 'equal', title: 'Gleiche Dauer', description: 'Finde eine Notengruppe, die gleich lange dauert.', category: 'Noten lesen' }
];
export const PATTERNS = [
  ['q', 'q', 'q', 'q'], ['q', 'q', 'h'], ['h', 'q', 'q'], ['h', 'h'],
  ['e', 'e', 'q', 'e', 'e', 'q'], ['q', 'rq', 'e', 'e', 'q'], ['h', 'q', 'rq'], ['q', 'e', 'e', 'h'],
  ['s', 's', 's', 's', 'q', 'e', 'e', 'q'], ['e', 're', 'e', 'e', 'q', 'rq'], ['q', 's', 's', 's', 's', 'rq', 'q'], ['h', 'rq', 's', 's', 's', 's']
];
export const ECHO_LEVELS = [
  { title: 'Halbe und Viertel', patterns: PATTERNS.slice(0, 4), bpm: 70 },
  { title: 'Achtel und Pausen', patterns: PATTERNS.slice(4, 8), bpm: 66 },
  { title: 'Sechzehntel', patterns: PATTERNS.slice(8), bpm: 60 }
];
export const METER_LEVELS = [
  { title: 'Mit Betonung', bpm: 76, accompaniment: false },
  { title: 'Mit Begleitung', bpm: 86, accompaniment: true },
  { title: 'Schneller', bpm: 106, accompaniment: true }
];

export function sum(sequence) {
  return sequence.reduce((total, key) => total + NOTES[key].ticks, 0);
}

export function beats(ticks) {
  return String(ticks / 4).replace('.', ',');
}

export function beatLabel(ticks) {
  return `${beats(ticks)} ${ticks <= 4 ? 'Viertelschlag' : 'Viertelschläge'}`;
}

export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function numberValue(value) {
  const input = value.trim().replace(/\s/g, '').replace(',', '.');
  const fraction = input.match(/^(\d+)\/(\d+)$/);
  if (fraction) return Number(fraction[2]) ? Number(fraction[1]) / Number(fraction[2]) : NaN;
  const mixed = input.match(/^(\d*)([¼½¾])$/);
  if (mixed) return Number(mixed[1]) + { '¼': .25, '½': .5, '¾': .75 }[mixed[2]];
  return /^(\d+(\.\d+)?|\.\d+)$/.test(input) ? Number(input) : NaN;
}

export function accept(task, value) {
  if (task.input === 'number') return numberValue(value) === task.answer;
  if (task.input === 'name') return task.aliases.includes(value.toLowerCase().replace(/[\s-]/g, ''));
  return value === task.answer;
}

function options(correct, pool) {
  return shuffle([correct, ...shuffle(pool.filter(value => value !== correct)).slice(0, 3)]);
}

const PARTIAL_BARS = [
  [['h'], 'h'], [['q', 'h'], 'q'], [['q', 'rq'], 'h'], [['e', 'e', 'q', 'rq'], 'q'],
  [['h', 'q', 'e'], 'e'], [['s', 's', 's', 's', 'e', 'e', 'q'], 'q'],
  [['h', 'q', 'e', 's'], 's'], [['q', 'q', 'q'], 'q'], [['h', 'e', 'e'], 'q'],
  [['q', 'e', 'e'], 'h'], [['rh', 'q', 'e'], 'e'], [['h', 'q', 'e', 'rs'], 's']
];
const EQUAL_GROUPS = [
  ['w', ['h', 'h']], ['h', ['q', 'q']], ['q', ['e', 'e']], ['e', ['s', 's']],
  ['h', ['e', 'e', 'e', 'e']], ['q', ['s', 's', 's', 's']], ['w', ['h', 'q', 'q']],
  ['h', ['q', 'e', 'e']], ['w', ['q', 'q', 'q', 'q']], ['q', ['e', 's', 's']],
  ['h', ['q', 's', 's', 's', 's']], ['w', ['h', 'e', 'e', 'q']]
];
const REBUILD_BARS = [
  { before: ['q'], after: ['h'], fill: ['q'] },
  { before: ['h'], after: ['q'], fill: ['e', 'e'] },
  { before: ['e', 'e', 'q'], after: ['q'], fill: ['rq'] },
  { before: [], after: ['q', 'q'], fill: ['h'] },
  { before: ['q'], after: ['rq'], fill: ['q', 'q'] },
  { before: ['h'], after: ['e', 'e'], fill: ['rq'] },
  { before: ['h', 'q'], after: ['e'], fill: ['re'] },
  { before: ['q', 'h', 'e'], after: [], fill: ['e'] },
  { before: ['e'], after: ['q', 'h'], fill: ['s', 's'] },
  { before: ['h'], after: ['q'], fill: ['s', 's', 's', 's'] },
  { before: ['q'], after: ['e', 'e', 'q'], fill: ['e', 're'] },
  { before: ['h'], after: [], fill: ['rq', 'q'] }
];
const FILL_CHOICES = {
  2: [['e'], ['s', 's'], ['re']],
  4: [['q'], ['e', 'e'], ['rq'], ['s', 's', 's', 's'], ['e', 're']],
  8: [['h'], ['q', 'q'], ['rq', 'q'], ['rh']]
};

export function buildRound(mode, level = 0) {
  return shuffle(Array.from({ length: 12 }, (_, i) => makeTask(mode, i, level)));
}

function makeTask(mode, i, level) {
  const key = NOTE_KEYS[i % NOTE_KEYS.length];
  const note = NOTES[key];
  switch (mode) {
    case 'names':
      return {
        prompt: 'Wie heißt diese Note?', seq: [key], input: 'name', answer: note.name,
        aliases: [note.name.toLowerCase().replace(/\s/g, ''), ['ganze', 'halbe', 'viertel', 'achtel', 'sechzehntel'][i % 5]],
        explanation: `${note.name} dauert ${beatLabel(note.ticks)}.`
      };
    case 'lengths': {
      const groups = [['q', 'e', 'e'], ['h', 'q'], ['e', 'e'], ['s', 's', 's', 's'], ['q', 'rq'], ['h', 'rq'], ['e', 's', 's']];
      const seq = i < 5 ? [key] : groups[i - 5];
      const ticks = sum(seq);
      return {
        prompt: 'Wie viele Viertelschläge dauern diese Zeichen zusammen?', seq, input: 'number',
        answer: ticks / 4, answerLabel: beatLabel(ticks), audio: true,
        explanation: seq.length > 1 ? `${seq.map(x => NOTES[x].beats).join(' + ')} = ${beatLabel(ticks)}.` : `${note.name} dauert ${beatLabel(ticks)}.`
      };
    }
    case 'rests': {
      const answer = REST_KEYS[i % 5];
      return {
        prompt: 'Welche Pause dauert genauso lange wie diese Note?', seq: [key], input: 'choice',
        answer, options: options(answer, REST_KEYS), symbols: true,
        explanation: `Beide dauern hier ${beatLabel(note.ticks)}.`
      };
    }
    case 'bars': {
      const [seq, answer] = PARTIAL_BARS[i];
      return {
        prompt: 'Ergänze genau eine Note zum 4/4-Takt.', seq, gap: seq.length, input: 'choice',
        answer, options: options(answer, NOTE_KEYS), symbols: true,
        explanation: `${beatLabel(sum(seq))} sind schon da. Es fehlt ${beatLabel(NOTES[answer].ticks)}.`
      };
    }
    case 'equal': {
      const [target, group] = EQUAL_GROUPS[i];
      const ticks = sum(group);
      const wrong = [['q'], ['h'], ['w'], ['e'], ['s', 's', 's']].filter(seq => sum(seq) !== ticks);
      return {
        prompt: 'Welche Gruppe dauert genauso lange wie die Note?', seq: [target], input: 'group',
        answer: group.join(','), options: options(group.join(','), wrong.map(seq => seq.join(','))),
        explanation: `Beide dauern ${beatLabel(ticks)}.`
      };
    }
    case 'ears': {
      const seq = PATTERNS[i];
      return {
        prompt: 'Welches Notenbild passt zum gehörten Rhythmus?', seq, audio: true, hideNotation: true,
        input: 'group', answer: seq.join(','), options: options(seq.join(','), PATTERNS.map(pattern => pattern.join(','))),
        explanation: 'Die Claves markieren die Viertelschläge. Höre noch einmal und lies die Lösung mit.'
      };
    }
    case 'rebuild': {
      const { before, after, fill } = REBUILD_BARS[i];
      const width = sum(fill);
      return {
        prompt: 'Höre den Takt. Welche Zeichen gehören in die Lücke?', seq: [...before, ...after],
        gap: before.length, gapTicks: width, input: 'group', audio: true,
        audioSequence: [...before, ...fill, ...after], answer: fill.join(','),
        options: options(fill.join(','), FILL_CHOICES[width].map(group => group.join(','))),
        explanation: 'Spiele den gehörten Takt noch einmal ab und achte auf die Lücke.'
      };
    }
    case 'meter': {
      const meter = [2, 3, 4][i % 3];
      const setting = METER_LEVELS[level];
      return {
        prompt: 'Welche Taktart hörst du?', input: 'choice', meter,
        answer: `${meter}/4`, options: ['2/4', '3/4', '4/4'], audio: true,
        bpm: setting.bpm + [-6, 0, 4, 8][Math.floor(i / 3)], accompaniment: setting.accompaniment,
        explanation: `Der betonte Schlag ist die Eins. Von Eins zu Eins zählst du ${meter} Schläge.`
      };
    }
    default:
      throw new Error(`Unknown exercise: ${mode}`);
  }
}

export function addToBar(bar, key) {
  if (!Object.hasOwn(NOTES, key) || sum(bar) + NOTES[key].ticks > 16) return null;
  return [...bar, key];
}

export function soundOnsets(pattern) {
  let ticks = 0;
  const starts = [];
  for (const key of pattern) {
    if (!key.startsWith('r')) starts.push(ticks / 4);
    ticks += NOTES[key].ticks;
  }
  return starts;
}

// Match each tap at most once. The tolerance is smaller than half a sixteenth.
export function scoreEcho(expected, taps, secondsPerBeat) {
  const nearestBeat = expected.reduce((shortest, time, i) => i ? Math.min(shortest, time - expected[i - 1]) : shortest, .5);
  const tolerance = Math.min(.19, secondsPerBeat * nearestBeat * .46);
  const available = new Set(expected.map((_, i) => i));
  const matched = taps.map(tap => {
    let nearest = null;
    let distance = tolerance;
    for (const i of available) {
      const difference = Math.abs(expected[i] * secondsPerBeat - tap);
      if (difference <= distance) {
        nearest = i;
        distance = difference;
      }
    }
    if (nearest !== null) available.delete(nearest);
    return nearest !== null;
  });
  const hits = expected.length - available.size;
  const extra = taps.length - hits;
  return { matched, hits, extra, success: hits === expected.length && extra === 0 };
}

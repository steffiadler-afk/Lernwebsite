import test from 'node:test';
import assert from 'node:assert/strict';
import { MODES, NOTES, PATTERNS, sum, buildRound, accept, numberValue, addToBar, soundOnsets, scoreEcho } from './model.js';
import { notation } from './notation.js';

test('four-beat exercises and audio answers are musically consistent', () => {
  for (const pattern of PATTERNS) assert.equal(sum(pattern), 16);
  for (const { id } of MODES.filter(mode => mode.id !== 'echo')) {
    const tasks = buildRound(id);
    assert.equal(tasks.length, 12);
    for (const task of tasks) {
      if (task.options) {
        assert.equal(new Set(task.options).size, task.options.length);
        assert(task.options.includes(task.answer));
      }
      if (id === 'bars') assert.equal(task.options.filter(key => sum(task.seq) + NOTES[key].ticks === 16).length, 1);
      if (id === 'equal') assert.equal(task.options.filter(value => sum(value.split(',')) === sum(task.seq)).length, 1);
      if (id === 'rests') assert.equal(task.options.filter(key => NOTES[key].ticks === sum(task.seq)).length, 1);
      if (id === 'lengths') assert(accept(task, String(task.answer)));
      if (id === 'rebuild') {
        assert.equal(sum(task.audioSequence), 16);
        for (const value of task.options) assert.equal(sum(value.split(',')), task.gapTicks);
      }
      if (id === 'meter') assert.equal(task.answer, `${task.meter}/4`);
    }
  }
});

test('fractions, gaps and bar capacity', () => {
  for (const input of ['½', '1/2', '0,5', '0.5']) assert.equal(numberValue(input), .5);
  assert.equal(numberValue('1 ½'), 1.5);
  for (const input of ['', '1/0', 'abc']) assert(Number.isNaN(numberValue(input)));
  assert.deepEqual(addToBar(['h'], 'h'), ['h', 'h']);
  assert.equal(addToBar(['w'], 's'), null);
  assert.match(notation(['h', 'q'], { gap: 0, gapTicks: 4 }), /aria-label="Lücke, Halbe Note, Viertelnote"/);
  assert.match(notation(['e', 'e'], { gap: 1, gapTicks: 2 }), /aria-label="Achtelnote, Lücke, Achtelnote"/);
});

test('echo checks note onsets once and rejects taps in a pause', () => {
  const onsets = soundOnsets(['q', 'rq', 'e', 'e', 'q']);
  assert.deepEqual(onsets, [0, 2, 2.5, 3]);
  assert.equal(scoreEcho(onsets, [.05, 2, 2.5, 3], 1).success, true);
  assert.deepEqual(scoreEcho(onsets, [0, 1, 2, 2.5, 3], 1), { matched: [true, false, true, true, true], hits: 4, extra: 1, success: false });
  assert.equal(scoreEcho(onsets, [0, 2, 2, 3], 1).hits, 3);
});

import { initPage } from '../../../src/shared/page.js';
import {
  NOTES, NOTE_KEYS, REST_KEYS, MODES, ECHO_LEVELS, METER_LEVELS,
  sum, beats, accept, buildRound, addToBar, soundOnsets, scoreEcho
} from './model.js';
import { notation } from './notation.js';
import { playNotes, playMeter, playEcho, tapSound, stop } from './audio.js';

initPage();
const $ = id => document.getElementById(id);
const panels = ['overview', 'levels', 'exercise', 'echo', 'result'];
const modeInfo = id => MODES.find(mode => mode.id === id);
let mode = '';
let level = 0;
let tasks = [];
let index = 0;
let checked = false;
let attempts = [];
let echoClock = null;
let taps = [];
let echoRun = 0;
let pulseStep = -2;

function showPanel(id, focusId) {
  for (const panel of panels) $(panel).hidden = panel !== id;
  $(focusId).focus({ preventScroll: true });
  $(id).scrollIntoView({ block: 'start', behavior: 'instant' });
}

function card(title, description, detail, attributes) {
  return `<button class="mode-card" type="button" ${attributes}><strong>${title}</strong><span class="description">${description}</span><small>${detail}</small></button>`;
}

$('heroNotation').innerHTML = notation(['q', 'e', 'e', 'h']);
$('referenceContent').innerHTML = NOTE_KEYS.map((key, i) => `
  <div class="reference-row">
    <div class="reference-notes" style="--step:${26 + 18 * i}%">${notation(Array(2 ** i).fill(key))}</div>
    <span>${NOTES[key].name}<small>Je ${NOTES[key].beats} ${i < 2 ? 'Schläge' : 'Schlag'}</small></span>
    ${notation([REST_KEYS[i]], { staff: true })}
  </div>`).join('');
for (const [host, category] of [['audioCards', 'Hören und spielen'], ['readingCards', 'Noten lesen']]) {
  $(host).innerHTML = MODES.filter(item => item.category === category).map(item => {
    const detail = ['echo', 'meter'].includes(item.id) ? '3 Stufen' : '12 Aufgaben';
    return card(item.title, item.description, detail, `data-mode="${item.id}"`);
  }).join('');
  $(host).onclick = event => {
    const button = event.target.closest('[data-mode]');
    if (!button) return;
    mode = button.dataset.mode;
    level = 0;
    if (mode === 'echo' || mode === 'meter') showLevels();
    else beginRound();
  };
}

function showLevels() {
  $('levelTitle').textContent = modeInfo(mode).title;
  const choices = mode === 'echo' ? ECHO_LEVELS : METER_LEVELS;
  $('levelCards').innerHTML = choices.map((item, i) => card(
    item.title, `${item.bpm} Schläge pro Minute${mode === 'meter' ? ' als Richtwert' : ''}`,
    `Stufe ${i + 1} · ${mode === 'echo' ? item.patterns.length : 12} Aufgaben`, `data-level="${i}"`
  )).join('');
  showPanel('levels', 'levelTitle');
}
$('levelCards').onclick = event => {
  const button = event.target.closest('[data-level]');
  if (!button) return;
  level = Number(button.dataset.level);
  beginRound();
};
for (const button of document.querySelectorAll('[data-home]')) {
  button.onclick = () => {
    cancelEcho();
    showPanel('overview', 'roundTitle');
    $('rounds').scrollIntoView({ block: 'start', behavior: 'instant' });
  };
}

function beginRound(retry = null) {
  cancelEcho();
  tasks = retry || (mode === 'echo' ? ECHO_LEVELS[level].patterns : buildRound(mode, level));
  index = 0;
  attempts = [];
  const title = modeInfo(mode).title;
  const levelTitle = mode === 'echo' ? ECHO_LEVELS[level].title : mode === 'meter' ? METER_LEVELS[level].title : '';
  const heading = [title, levelTitle].filter(Boolean).join(' · ');
  if (mode === 'echo') {
    $('echoTitle').textContent = heading;
    showEcho();
    showPanel('echo', 'echoTitle');
  } else {
    $('exerciseTitle').textContent = heading;
    showQuestion();
    showPanel('exercise', 'exerciseTitle');
  }
}

function points() {
  return attempts.filter(attempt => attempt.correct).length;
}

function progress(labelId, meterId) {
  $(labelId).textContent = `Aufgabe ${index + 1} von ${tasks.length} · ${points()} ${points() === 1 ? 'Punkt' : 'Punkte'}`;
  $(meterId).max = tasks.length;
  $(meterId).value = attempts.length;
}

function answerNotation(task, value) {
  if (task.symbols) return notation([value], { staff: value.startsWith('r') });
  if (task.input === 'group') return notation(value.split(','), { bar: mode === 'ears' });
  return '';
}

function showQuestion() {
  stop();
  checked = false;
  const task = tasks[index];
  progress('roundStatus', 'progress');
  $('prompt').textContent = task.prompt;
  $('feedback').hidden = true;
  $('check').hidden = false;
  $('next').hidden = true;
  $('next').textContent = index === tasks.length - 1 ? 'Ergebnis ansehen' : 'Weiter →';
  $('visual').hidden = !task.seq || Boolean(task.hideNotation);
  $('visual').innerHTML = $('visual').hidden ? '' : notation(task.seq, {
    gap: task.gap, gapTicks: task.gapTicks, meter: task.gap !== undefined
  });
  $('listenControls').hidden = !task.audio;
  $('listen').textContent = mode === 'rebuild' ? '▶ Vorlage hören' : '▶ Hören';
  $('tryListen').hidden = mode !== 'rebuild';
  $('tryListen').disabled = true;
  $('listenStatus').textContent = task.meter ? 'Achte darauf, wann die betonte Eins wiederkommt.' : task.audio && mode !== 'lengths' ? 'Die Claves zählen vier Schläge ein.' : '';
  if (task.options) showChoices(task);
  else showInput(task);
}

function showInput(task) {
  const name = task.input === 'name';
  $('answerArea').innerHTML = `<div class="answer-field"><label for="answer">${name ? 'Name der Note' : 'Anzahl der Viertelschläge'}</label><input id="answer" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="answerHelp"><p class="small muted" id="answerHelp">${name ? 'Schreibe den Namen aus oder verwende die Kurzform.' : 'Du kannst zum Beispiel ½, 1/2 oder 0,5 schreiben.'}</p></div>`;
}

function showChoices(task) {
  const field = document.createElement('fieldset');
  field.className = 'answers' + (task.meter ? ' meter-options' : task.hideNotation ? ' rhythm-options' : '');
  const legend = document.createElement('legend');
  legend.textContent = 'Wähle eine Antwort';
  field.append(legend);
  task.options.forEach((value, i) => {
    const label = document.createElement('label');
    label.className = 'note-option';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'answer';
    radio.value = value;
    const graphic = document.createElement('span');
    graphic.innerHTML = answerNotation(task, value);
    const caption = document.createElement('span');
    caption.textContent = task.meter ? `${value}‑Takt` : String.fromCharCode(65 + i);
    label.append(radio, graphic, caption);
    field.append(label);
  });
  $('answerArea').replaceChildren(field);
}

function answer() {
  return ($('answer')?.value || $('answerArea').querySelector('input:checked')?.value || '').trim();
}

function withFill(task, value) {
  return [...task.seq.slice(0, task.gap), ...value.split(','), ...task.seq.slice(task.gap)];
}

function reportListen(text) {
  $('listenStatus').textContent = text;
}

$('answerArea').onchange = () => {
  if (mode !== 'rebuild' || checked) return;
  const task = tasks[index];
  $('tryListen').disabled = false;
  $('visual').innerHTML = notation(withFill(task, answer()), { meter: true });
};
$('listen').onclick = () => {
  const task = tasks[index];
  if (task.meter) playMeter(task, reportListen);
  else playNotes([task.audioSequence || task.seq], 68, reportListen, mode === 'lengths' ? 0 : 4);
  $('listen').textContent = mode === 'rebuild' ? '▶ Vorlage erneut hören' : '▶ Noch einmal hören';
};
$('listenStop').onclick = () => { stop(); reportListen('Wiedergabe gestoppt.'); };
$('tryListen').onclick = () => {
  if (answer()) playNotes([withFill(tasks[index], answer())], 68, reportListen);
};

function solutionText(task) {
  if (task.answerLabel) return task.answerLabel;
  if (task.symbols) return NOTES[task.answer].name;
  if (task.input === 'group') return task.answer.split(',').map(key => NOTES[key].name).join(', ');
  return task.meter ? `${task.answer}-Takt` : task.answer;
}

function showFeedback(text, kind, graphic = '') {
  const box = $('feedback');
  box.hidden = false;
  box.className = kind;
  box.textContent = text;
  if (graphic) {
    const div = document.createElement('div');
    div.innerHTML = graphic;
    box.append(div);
  }
}

$('taskForm').onsubmit = event => {
  event.preventDefault();
  if (checked) return;
  const task = tasks[index];
  const given = answer();
  if (!given) {
    showFeedback(task.options ? 'Wähle zuerst eine Antwort.' : 'Gib zuerst eine Antwort ein.', '');
    return;
  }
  checked = true;
  const correct = accept(task, given);
  attempts.push({ task, correct, given });
  progress('roundStatus', 'progress');
  const message = correct ? 'Richtig! ' : `Die Lösung ist ${solutionText(task)}. `;
  const graphic = correct ? '' : answerNotation(task, task.answer);
  showFeedback(message + task.explanation, correct ? 'good' : 'bad', graphic);
  for (const input of $('answerArea').querySelectorAll('input')) {
    input.disabled = true;
    if (task.options && input.value === task.answer) input.parentElement.classList.add('is-answer');
    else if (task.options && input.checked) input.parentElement.classList.add('is-mistake');
  }
  if (mode === 'rebuild') $('visual').innerHTML = notation(task.audioSequence, { meter: true });
  $('check').hidden = true;
  $('next').hidden = false;
  $('next').focus();
};
$('next').onclick = () => {
  if (!checked) return;
  if (++index === tasks.length) finish();
  else { showQuestion(); $('prompt').focus(); }
};

function finish() {
  cancelEcho();
  const correct = points();
  const missed = attempts.filter(attempt => !attempt.correct);
  $('score').textContent = correct;
  $('total').textContent = tasks.length;
  $('resultText').textContent = missed.length ? 'Schau dir die Lösungen an oder übe die schwierigen Aufgaben noch einmal.' : 'Alle Aufgaben richtig gelöst!';
  $('retry').hidden = !missed.length;
  $('review').replaceChildren();
  for (const attempt of missed) {
    const item = document.createElement('div');
    item.className = 'review-item';
    const text = document.createElement('p');
    if (mode === 'echo') {
      item.innerHTML = notation(attempt.task, { meter: true });
      text.textContent = attempt.given;
    } else {
      const { task } = attempt;
      if (task.seq && !task.hideNotation && task.gap === undefined) item.innerHTML = notation(task.seq);
      if (mode === 'rebuild') item.innerHTML = notation(task.audioSequence, { meter: true });
      if (task.hideNotation) item.innerHTML = answerNotation(task, task.answer);
      text.textContent = `${task.prompt} Lösung: ${solutionText(task)}.`;
    }
    item.append(text);
    $('review').append(item);
  }
  showPanel('result', 'resultTitle');
}
$('repeat').onclick = () => beginRound();
$('retry').onclick = () => beginRound(attempts.filter(attempt => !attempt.correct).map(attempt => attempt.task));

function pulse(step) {
  for (const [i, dot] of [...$('echoPulse').children].entries()) dot.classList.toggle('lit', step >= 0 && step < 12 && i === step % 4);
}

function tapPad(label, enabled) {
  $('tapPad').textContent = label;
  $('tapPad').setAttribute('aria-disabled', String(!enabled));
}

function cancelEcho() {
  stop();
  echoRun++;
  echoClock = null;
  $('tapPad').classList.remove('pressed');
}

function resetEcho() {
  cancelEcho();
  taps = [];
  pulseStep = -2;
  pulse(-1);
  tapPad('Auf den Einsatz warten', false);
  $('echoStatus').textContent = 'Höre zuerst dem Klavier zu. Danach zählen die Claves vier Schläge ein.';
  $('echoStart').hidden = false;
  $('echoStop').hidden = true;
  $('echoTiming').hidden = true;
}

function showEcho() {
  resetEcho();
  $('echoNotation').innerHTML = notation(tasks[index], { meter: true });
  $('echoNext').hidden = true;
  $('echoNext').textContent = index === tasks.length - 1 ? 'Ergebnis ansehen' : 'Weiter →';
  progress('echoProgress', 'echoMeter');
}

function showEchoTiming(expected, recorded, score, beat) {
  const percent = value => 100 * Math.max(0, Math.min(4, value)) / 4;
  const mark = (kind, value) => `<span class="timing-mark ${kind}" style="left:${percent(value)}%"></span>`;
  $('echoTiming').innerHTML = `<div class="timing-plot" aria-hidden="true">${expected.map(value => mark('expected', value)).join('')}${recorded.map((value, i) => mark(score.matched[i] ? 'hit' : 'miss', value / beat)).join('')}</div><p class="small timing-key">Oben stehen die Noteneinsätze. Unten siehst du deine Klopfer.</p>`;
  $('echoTiming').hidden = false;
}

function finishEcho(beat) {
  const pattern = tasks[index];
  const expected = soundOnsets(pattern);
  const score = scoreEcho(expected, taps, beat);
  const extra = score.extra ? ` Zusätzliche Klopfer: ${score.extra}.` : '';
  const feedback = `${score.hits} von ${expected.length} Schlägen getroffen.${extra}`;
  attempts.push({ task: pattern, correct: score.success, given: feedback });
  echoClock = null;
  tapPad('Fertig', false);
  progress('echoProgress', 'echoMeter');
  $('echoStatus').textContent = (score.success ? 'Genau im Takt! ' : '') + feedback;
  $('echoStop').hidden = true;
  $('echoNext').hidden = false;
  showEchoTiming(expected, taps, score, beat);
  $('echoNext').focus({ preventScroll: true });
}

$('echoStart').onclick = async () => {
  const run = ++echoRun;
  const { bpm } = ECHO_LEVELS[level];
  const beat = 60 / bpm;
  $('echoStart').hidden = true;
  $('echoStop').hidden = false;
  $('echoStatus').textContent = 'Wiedergabe startet …';
  const clock = await playEcho(tasks[index], bpm, step => {
    if (step === pulseStep || run !== echoRun) return;
    pulseStep = step;
    pulse(step);
    if (step === 0) $('echoStatus').textContent = 'Hör genau zu.';
    if (step === 4) $('echoStatus').textContent = 'Gleich bist du dran. Zähle 1, 2, 3, 4.';
    if (step === 8) {
      $('echoStatus').textContent = 'Jetzt bist du dran!';
      tapPad('Hier klopfen', true);
    }
    if (step >= 12) finishEcho(beat);
  }, text => { $('echoStatus').textContent = text; });
  if (run !== echoRun) return;
  if (clock) echoClock = () => clock() - 8 * beat;
  else { $('echoStart').hidden = false; $('echoStop').hidden = true; }
};
$('echoStop').onclick = resetEcho;
$('echoNext').onclick = () => {
  if (++index === tasks.length) finish();
  else { showEcho(); $('echoStart').focus(); }
};

function recordTap() {
  if (!echoClock) return;
  const time = echoClock();
  if (time < -.19 || time >= 240 / ECHO_LEVELS[level].bpm) return;
  taps.push(time);
  tapSound();
  $('tapPad').classList.add('pressed');
  setTimeout(() => $('tapPad').classList.remove('pressed'), 90);
}
$('tapPad').onpointerdown = event => { if (event.isPrimary && event.button === 0) recordTap(); };
$('tapPad').onclick = event => { if (event.detail === 0) recordTap(); };
document.addEventListener('keydown', event => {
  if (event.code === 'Space' && !event.repeat && echoClock && !$('echo').hidden) {
    if (event.target.closest('button') && event.target !== $('tapPad')) return;
    event.preventDefault();
    recordTap();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !$('echo').hidden && !$('echoStop').hidden) resetEcho();
});

const storageKey = 'music5-rhythm-v1';
let bars = [[], [], [], []];
let activeBar = 0;
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (Array.isArray(saved) && saved.length === 4 && saved.every(bar => Array.isArray(bar) && bar.every(key => Object.hasOwn(NOTES, key)) && sum(bar) <= 16)) bars = saved;
} catch { /* An unavailable store leaves an empty draft. */ }

function saveBars() {
  try { localStorage.setItem(storageKey, JSON.stringify(bars)); } catch { /* Continue in memory. */ }
}

function renderBars() {
  const bar = bars[activeBar];
  $('barTabs').innerHTML = bars.map((sequence, i) => `<button type="button" data-bar="${i}" aria-pressed="${activeBar === i}">Takt ${i + 1}<small>${beats(sum(sequence))} / 4</small></button>`).join('');
  $('composition').innerHTML = `<div class="bar-score">${bar.length ? notation(bar, { meter: true }) : '<p>Füge eine Note oder Pause hinzu.</p>'}</div>`;
  $('undo').disabled = !bar.length;
  $('clear').disabled = !bar.length;
  const complete = bars.every(sequence => sum(sequence) === 16);
  $('playComposition').disabled = !complete;
  $('audioStatus').textContent = complete ? 'Deine vier Takte sind abspielbereit.' : 'Fülle vier Takte, um deinen Rhythmus anzuhören.';
}
$('barTabs').onclick = event => {
  const button = event.target.closest('[data-bar]');
  if (!button) return;
  activeBar = Number(button.dataset.bar);
  stop();
  renderBars();
  $('barTabs').children[activeBar].focus({ preventScroll: true });
  $('composeMessage').textContent = '';
};
$('palette').innerHTML = [...NOTE_KEYS, ...REST_KEYS].map(key => `<button type="button" data-note="${key}" aria-label="${NOTES[key].name} hinzufügen">${notation([key], { staff: key.startsWith('r') })}<span>${NOTES[key].name}</span><small>${NOTES[key].beats} ${NOTES[key].ticks > 4 ? 'Schläge' : 'Schlag'}</small></button>`).join('');
$('palette').onclick = event => {
  const button = event.target.closest('[data-note]');
  if (!button) return;
  const next = addToBar(bars[activeBar], button.dataset.note);
  if (!next) { $('composeMessage').textContent = 'Dieser Wert passt nicht mehr in den Takt.'; return; }
  stop();
  bars[activeBar] = next;
  saveBars();
  renderBars();
  const remaining = 16 - sum(next);
  $('composeMessage').textContent = remaining ? `Noch frei: ${beats(remaining)} von vier Schlägen.` : 'Dieser Takt ist vollständig!';
};
$('undo').onclick = () => { stop(); bars[activeBar].pop(); saveBars(); renderBars(); $('composeMessage').textContent = 'Letztes Zeichen entfernt.'; };
$('clear').onclick = () => { stop(); bars[activeBar] = []; saveBars(); renderBars(); $('composeMessage').textContent = 'Dieser Takt ist leer.'; };
$('tempo').oninput = () => { $('tempoValue').textContent = $('tempo').value; };
$('playComposition').onclick = () => playNotes(bars, Number($('tempo').value), text => { $('audioStatus').textContent = text; });
$('stopComposition').onclick = () => { stop(); $('audioStatus').textContent = 'Wiedergabe gestoppt.'; };
renderBars();

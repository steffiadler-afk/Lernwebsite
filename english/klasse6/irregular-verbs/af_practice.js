import {initPage} from '../../../src/shared/page.js';
import {CONFIG} from '../../../src/shared/config.js';
import {irregularVerbs} from './irregular_verbs_data.js';
import {CLASS_NAME, TOPIC, TOTAL, UNITS, practiceGrade, studentCode, validStudentCode} from './af_results.js';

initPage();

const tabs = document.querySelector('.unit-tabs');
const questions = document.querySelector('#questions');
const result = document.querySelector('#result');
const codeInput = document.querySelector('#studentCode');
const check = document.querySelector('#check');
const reset = document.querySelector('#reset');
const send = document.querySelector('#sendResult');
const sendStatus = document.querySelector('#sendStatus');
const freshAttempt = () => ({answers: Array(TOTAL).fill(''), score: null, status: 'ready'});
const attempts = UNITS.map(freshAttempt);
const verbs = UNITS.map((_, unit) => Array.from({length: TOTAL}, (_, i) => irregularVerbs[(unit * TOTAL + i) % irregularVerbs.length]));
let current = 0;

try {
  const previousCode = localStorage.getItem('studentClass') === CLASS_NAME ? localStorage.getItem('studentName') : '';
  codeInput.value = [sessionStorage.getItem('irregularAfStudent'), sessionStorage.getItem('test1_6g_name'), previousCode]
    .map(studentCode).find(validStudentCode) || '';
} catch { /* The field can still be filled in if browser storage is unavailable. */ }

const normalize = value => value.trim().toLowerCase().replace(/\s+/g, ' ');
const isCorrect = (answer, past) => past.split('/').some(part => normalize(part) === normalize(answer));

function showSubmissionStatus(attempt) {
  if (attempt !== attempts[current]) return;
  const {score, status, submission} = attempt;
  send.hidden = score === null || status === 'sent' || status === 'sending';
  send.textContent = status === 'failed' ? 'Erneut senden' : 'Ergebnis senden';
  reset.disabled = status === 'sending';
  if (score === null) sendStatus.textContent = '';
  else if (status === 'sending') sendStatus.textContent = 'Ergebnis wird gespeichert …';
  else if (status === 'sent') sendStatus.textContent = 'Für Frau Adler gespeichert: ' + submission.name + '.';
  else if (status === 'failed') sendStatus.textContent = 'Die Abgabe hat nicht geklappt. Bitte lass die Seite geöffnet und klicke auf „Erneut senden“.';
  else sendStatus.textContent = 'Noch nicht abgegeben. Gib oben dein Kürzel ein und klicke auf „Ergebnis senden“.';
}

async function submitAttempt(attempt, unit) {
  if (attempt.score === null || attempt.status === 'sending' || attempt.status === 'sent') return;
  const name = attempt.submission?.name || studentCode(codeInput.value);
  if (!validStudentCode(name)) {
    sendStatus.textContent = 'Bitte gib dein Kürzel ein: Vorname und erster Buchstabe des Nachnamens.';
    codeInput.focus();
    return;
  }
  try { sessionStorage.setItem('irregularAfStudent', name); } catch { /* Optional convenience for the current tab. */ }
  attempt.submission ??= {
    type: 'exercise', topic: TOPIC, className: CLASS_NAME, subject: 'Englisch',
    unit: UNITS[unit], exercise: 'Irregular Verbs · Übung ' + UNITS[unit],
    name, score: attempt.score, total: TOTAL, timestamp: attempt.completedAt
  };
  attempt.status = 'sending';
  showSubmissionStatus(attempt);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    if (!CONFIG.remote.enabled) throw new Error('Abgabe nicht verfügbar');
    const response = await fetch(CONFIG.remote.url + '/api/submissions', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({...attempt.submission, token: CONFIG.remote.submitToken}),
      signal: controller.signal
    });
    if (!response.ok || (await response.json()).ok !== true) throw new Error('Abgabe fehlgeschlagen');
    attempt.status = 'sent';
  } catch {
    attempt.status = 'failed';
  } finally {
    clearTimeout(timeout);
    showSubmissionStatus(attempt);
  }
}

function render() {
  const attempt = attempts[current];
  const finished = attempt.score !== null;
  document.querySelector('#unitTitle').textContent = 'Übung ' + UNITS[current];
  tabs.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
  check.disabled = finished;
  result.textContent = finished ? 'Du hast ' + attempt.score + ' von ' + TOTAL + ' Punkten. Deine Übungsnote: ' + practiceGrade(attempt.score) + '.' : '';
  questions.replaceChildren();
  verbs[current].forEach((verb, i) => {
    const row = document.createElement('div');
    row.className = 'task-row';
    const label = document.createElement('label');
    label.htmlFor = 'answer' + i;
    label.textContent = (i + 1) + '. ' + verb.infinitive + ' →';
    const input = document.createElement('input');
    input.id = label.htmlFor;
    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.placeholder = 'Simple past';
    input.value = attempt.answers[i];
    input.disabled = finished;
    input.addEventListener('input', () => { attempt.answers[i] = input.value; });
    const feedback = document.createElement('span');
    feedback.className = 'feedback';
    feedback.id = 'feedback' + i;
    input.setAttribute('aria-describedby', feedback.id);
    if (finished) {
      const correct = isCorrect(input.value, verb.past);
      feedback.classList.add(correct ? 'ok' : 'wrong');
      feedback.textContent = correct ? '✓ Richtig!' : '✗ Richtig: ' + verb.past;
    }
    row.append(label, input, feedback);
    questions.append(row);
  });
  showSubmissionStatus(attempt);
}

UNITS.forEach((unit, i) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = unit;
  button.addEventListener('click', () => {
    if (current !== i) { current = i; render(); }
  });
  tabs.append(button);
});

document.querySelector('#quiz').addEventListener('submit', event => {
  event.preventDefault();
  const attempt = attempts[current];
  if (attempt.score !== null) return;
  const inputs = [...questions.querySelectorAll('input')];
  const firstEmpty = inputs.find(input => !input.value.trim());
  if (firstEmpty) {
    result.textContent = 'Bitte beantworte zuerst alle ' + TOTAL + ' Aufgaben.';
    firstEmpty.focus();
    return;
  }
  attempt.answers = inputs.map(input => input.value);
  attempt.score = attempt.answers.filter((answer, i) => isCorrect(answer, verbs[current][i].past)).length;
  attempt.completedAt = new Date().toISOString();
  render();
  result.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  if (validStudentCode(studentCode(codeInput.value))) submitAttempt(attempt, current);
});

send.addEventListener('click', () => submitAttempt(attempts[current], current));
reset.addEventListener('click', () => {
  attempts[current] = freshAttempt();
  render();
});
render();

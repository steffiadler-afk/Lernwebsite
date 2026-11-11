import {Results} from './results.js';

export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function choiceOptions(correct, alternatives, size = 4) {
  const distinct = [...new Set(alternatives)].filter(value => value !== correct);
  return shuffle([correct, ...shuffle(distinct).slice(0, size - 1)]);
}

function element(tag, className = '', text = '') {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

export function mountPracticeRound({buildRound, submitMeta}) {
  const root = document.querySelector('#practiceRound');
  root.innerHTML = `
    <form id="practiceForm" class="practice-stage">
      <div class="practice-progress-info"><strong id="taskNumber"></strong><span id="answeredCount"></span></div>
      <progress id="practiceProgress" class="practice-progress" aria-label="Beantwortete Aufgaben" value="0"></progress>
      <div id="practiceQuestion"></div>
      <div class="practice-toolbar">
        <button id="previousTask" type="button">← Zurück</button>
        <button class="primary" id="nextTask" type="submit">Weiter →</button>
      </div>
      <div id="practiceConfirm" class="practice-confirm" hidden>
        <p id="unansweredNote" role="status"></p>
        <div class="practice-confirm-actions">
          <button id="goToOpen" type="button">Zur ersten offenen Aufgabe</button>
          <button id="finishWithOpen" type="button">Trotzdem auswerten</button>
        </div>
      </div>
    </form>
    <section id="result" class="practice-result" tabindex="-1" aria-labelledby="resultTitle" hidden>
      <h2 id="resultTitle">Dein Ergebnis</h2>
      <div class="practice-scoreline"><span id="score">0</span> von <span id="total">0</span> <span id="pointsLabel">Punkten</span></div>
      <p id="resultMessage"></p>
      <details id="practiceReview" class="practice-review">
        <summary id="reviewTitle"></summary>
        <ul id="practiceMistakes" class="practice-mistakes"></ul>
      </details>
      <div class="practice-result-actions">
        <button id="newRound" class="primary" type="button">Neue Runde</button>
        <button id="redoMissed" type="button">Nur diese Aufgaben nachüben</button>
      </div>
      <div id="submitBox" hidden></div>
    </section>`;
  const get = id => root.querySelector('#' + id);
  const form = get('practiceForm'), host = get('practiceQuestion'), result = get('result');
  const previous = get('previousTask'), next = get('nextTask'), confirm = get('practiceConfirm');
  const progress = get('practiceProgress'), review = get('practiceReview'), submitBox = get('submitBox');
  let tasks, answers, current, redo, missed;

  function countAnswers() {
    const answered = answers.filter(value => value.trim()).length;
    progress.value = answered;
    get('answeredCount').textContent = answered + ' von ' + tasks.length + ' beantwortet';
    return answered;
  }

  function hideConfirmation() {
    confirm.hidden = true;
    get('unansweredNote').textContent = '';
  }

  function showQuestion(moveFocus = false) {
    const task = tasks[current];
    const group = element('fieldset', 'practice-question');
    const instruction = element('p', 'practice-instruction', task.instruction);
    instruction.id = 'practiceInstruction';
    const title = element('h2', 'practice-prompt', task.prompt);
    title.id = 'practicePrompt';
    title.tabIndex = -1;
    if (task.promptLang) title.lang = task.promptLang;
    group.setAttribute('aria-labelledby', title.id);
    group.setAttribute('aria-describedby', instruction.id);
    group.append(instruction, title);

    if (task.type === 'choice') {
      const options = element('div', 'practice-choices');
      const pairingNotice = element('p', 'practice-instruction');
      pairingNotice.setAttribute('role', 'status');
      pairingNotice.hidden = true;
      task.options.forEach(value => {
        const label = element('label', 'practice-option');
        const radio = element('input');
        radio.type = 'radio';
        radio.name = 'currentAnswer';
        radio.value = value;
        radio.checked = value === answers[current];
        if (radio.checked) label.classList.add('is-selected');
        const copy = element('span', '', value);
        if (task.answerLang) copy.lang = task.answerLang;
        label.append(radio, copy);
        radio.addEventListener('change', () => {
          if (!radio.checked) return;
          pairingNotice.hidden = true;
          pairingNotice.textContent = '';
          if (task.match) {
            const other = answers.findIndex((answer, i) => i !== current && answer === value);
            if (other !== -1) {
              answers[other] = '';
              pairingNotice.hidden = false;
              pairingNotice.textContent = 'Die bisherige Zuordnung in Aufgabe ' + (other + 1) + ' wurde gelöst.';
            }
          }
          answers[current] = value;
          for (const option of options.children) option.classList.toggle('is-selected', option === label);
          countAnswers();
          hideConfirmation();
        });
        options.append(label);
      });
      group.append(options, pairingNotice);
    } else {
      const field = element('div', 'practice-field');
      const label = element('label', '', 'Deine Antwort auf Englisch');
      label.htmlFor = 'practiceAnswer';
      const input = element('input');
      input.id = label.htmlFor;
      input.type = 'text';
      input.lang = 'en';
      input.autocomplete = 'off';
      input.setAttribute('autocapitalize', 'off');
      input.spellcheck = false;
      input.value = answers[current];
      input.addEventListener('input', () => {
        answers[current] = input.value;
        countAnswers();
        hideConfirmation();
      });
      field.append(label, input);
      group.append(field);
    }

    host.replaceChildren(group);
    get('taskNumber').textContent = 'Aufgabe ' + (current + 1) + ' von ' + tasks.length;
    previous.disabled = current === 0;
    next.textContent = current === tasks.length - 1 ? 'Auswerten' : 'Weiter →';
    hideConfirmation();
    countAnswers();
    if (moveFocus) {
      form.scrollIntoView({block:'start', behavior:'instant'});
      title.focus({preventScroll:true});
    }
  }

  function begin(nextTasks, moveFocus = false, isRedo = false) {
    tasks = nextTasks;
    answers = Array(tasks.length).fill('');
    current = 0;
    redo = isRedo;
    missed = [];
    progress.max = tasks.length;
    result.dataset.details = 'null';
    result.hidden = true;
    submitBox.hidden = true;
    submitBox.replaceChildren();
    form.hidden = false;
    showQuestion(moveFocus);
  }

  function finish() {
    const mistakes = [];
    let score = 0;
    tasks.forEach((task, i) => {
      const given = answers[i].trim();
      const correct = given !== '' && (task.accept ? task.accept(given) : given === task.answer);
      if (correct) score++;
      else mistakes.push({task, given, number: i + 1});
    });
    missed = mistakes.map(item => item.task);
    get('score').textContent = score;
    get('total').textContent = tasks.length;
    get('pointsLabel').textContent = tasks.length === 1 ? 'Punkt' : 'Punkten';
    const percent = Math.round(100 * score / tasks.length);
    get('resultMessage').textContent = percent + ' % richtig. ' + (
      !mistakes.length ? 'Alles richtig – gut gemacht!' :
      'Schau dir die Lösungen an und übe die offenen oder falschen Antworten noch einmal.'
    );
    review.hidden = !mistakes.length;
    review.open = !!mistakes.length;
    get('reviewTitle').textContent = mistakes.length === 1 ? '1 Aufgabe zum Nachüben' : mistakes.length + ' Aufgaben zum Nachüben';
    const list = get('practiceMistakes');
    list.replaceChildren();
    for (const {task, given, number} of mistakes) {
      const item = element('li');
      const heading = element('strong', '', number + '. ' + task.prompt);
      const entered = element('p', '', given ? 'Deine Antwort: ' + given : 'Keine Antwort gegeben');
      const expected = element('p');
      const answer = element('strong', '', task.answer);
      if (task.answerLang) answer.lang = task.answerLang;
      expected.append(document.createTextNode('Richtig: '), answer);
      item.append(heading, entered, expected);
      list.append(item);
    }
    result.dataset.details = JSON.stringify(mistakes.map(({task,given}) => ({
      question: task.instruction + ' ' + task.prompt, given, answer: task.answer, correct: false
    })));
    get('redoMissed').hidden = !mistakes.length;
    if (submitMeta && !redo) {
      Results.attachSubmit('#submitBox', submitMeta);
      submitBox.hidden = false;
    }
    form.hidden = true;
    result.hidden = false;
    result.scrollIntoView({block:'start', behavior:'instant'});
    result.focus({preventScroll:true});
  }

  previous.addEventListener('click', () => {
    if (current > 0) {
      current--;
      showQuestion(true);
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (form.hidden) return;
    if (current < tasks.length - 1) {
      current++;
      showQuestion(true);
    } else {
      const remaining = tasks.length - countAnswers();
      if (!remaining) finish();
      else {
        confirm.hidden = false;
        get('unansweredNote').textContent = remaining === 1 ? 'Eine Aufgabe ist noch offen.' : remaining + ' Aufgaben sind noch offen.';
        get('goToOpen').focus();
      }
    }
  });
  get('goToOpen').addEventListener('click', () => {
    const openTask = answers.findIndex(value => !value.trim());
    if (openTask !== -1) {
      current = openTask;
      showQuestion(true);
    }
  });
  get('finishWithOpen').addEventListener('click', finish);
  get('newRound').addEventListener('click', () => begin(buildRound(), true));
  get('redoMissed').addEventListener('click', () => {
    if (missed.length) begin(missed, true, true);
  });
  begin(buildRound());
}

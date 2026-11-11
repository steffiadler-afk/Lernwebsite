import {initPage} from '../../../src/shared/page.js';
import {mountPracticeRound} from '../../../src/shared/practice_round.js';
import {buildVocabularyRound} from './unit1_questions.js';

initPage();
const mode = document.body.dataset.practiceMode;
const exercise = {translate:'de-en', quiz:'mixed-quiz-20'}[mode];
mountPracticeRound({
  buildRound: () => buildVocabularyRound(mode),
  submitMeta: exercise ? {subject:'english', grade:6, topic:'vocabulary-unit1', exercise} : undefined
});

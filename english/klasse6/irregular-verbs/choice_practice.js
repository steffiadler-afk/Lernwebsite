import {initPage} from '../../../src/shared/page.js';
import {choiceOptions, mountPracticeRound, shuffle} from '../../../src/shared/practice_round.js';
import {irregularVerbs} from './irregular_verbs_data.js';

initPage();
const pastForms = irregularVerbs.map(verb => verb.past);
mountPracticeRound({
  buildRound: () => shuffle(irregularVerbs).slice(0, 10).map(verb => ({
    type:'choice', instruction:'Wähle die richtige Simple-Past-Form.',
    prompt:verb.infinitive, promptLang:'en',
    answer:verb.past, answerLang:'en', options:choiceOptions(verb.past, pastForms)
  })),
  submitMeta:{subject:'english', grade:6, topic:'irregular-verbs', exercise:'choice'}
});

import {initPage} from '../../../src/shared/page.js';
import {mountPracticeRound} from '../../../src/shared/practice_round.js';
import {buildIrregularChoiceRound} from './irregular_choice_data.js';

initPage();
let firstRound = true;
mountPracticeRound({
  buildRound: () => {
    const round = buildIrregularChoiceRound(firstRound);
    firstRound = false;
    return round;
  },
  submitMeta:{subject:'english', grade:6, topic:'irregular-verbs', exercise:'choice'}
});

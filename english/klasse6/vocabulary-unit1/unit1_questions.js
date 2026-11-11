import {choiceOptions, shuffle} from '../../../src/shared/practice_round.js';
import {unit1Phrases, unit1Vocabulary} from './unit1_vocab_data.js';

const categories = {
  Media:'Media · Medien',
  People:'People · Personen',
  School:'School · Schule',
  Story:'Story · Geschichte'
};

// Use examples that can be recognised from the themes in the unit.
const sortableWords = new Set([
  'media', 'screen', 'camera', 'games console', 'on TV', 'news', 'programme', 'detective series', 'documentary', 'soap opera',
  'straight', 'curly', 'bald', 'braces', 'tooth', 'glasses', 'young', 'kind', 'serious', 'shy', 'eye',
  'survey', 'count', 'exercise', 'repeat', 'presentation',
  'message in a bottle', 'by the sea', 'path', 'piece of paper', 'writer', 'sand', 'rock'
]);

const alternatives = {
  'pick sth up': ['pick something up', 'pick up something', 'pick up sth'],
  "What's for homework?": ['What is for homework?']
};

function normalizeEnglish(text) {
  return text.normalize('NFKC').toLowerCase().trim()
    .replace(/[‘’]/g, "'")
    .replace(/[‐‑–]/g, '-')
    .replace(/^(?:\(to\)|to)\s+/, '')
    .replace(/\.{3}|…/g, ' ')
    .replace(/[()]/g, '')
    .replace(/[.,!?;:]+$/, '')
    .replace(/\s+/g, ' ').trim();
}

function translation(entry, phrase = false) {
  const accepted = [
    entry.en, entry.en.replace(/\s*\([^)]*\)/g, ''), ...(alternatives[entry.en] || [])
  ].map(normalizeEnglish);
  return {
    type:'text', instruction:phrase ? 'Schreibe die englische Wendung.' : 'Übersetze ins Englische.',
    prompt:entry.de, promptLang:'de', answer:entry.en, answerLang:'en',
    accept:value => accepted.includes(normalizeEnglish(value))
  };
}

function meaning(entry) {
  const inTopic = unit1Vocabulary.filter(word => word.cat === entry.cat).map(word => word.de);
  return {
    type:'choice', instruction:'Wähle die deutsche Bedeutung.', prompt:entry.en, promptLang:'en',
    answer:entry.de, answerLang:'de', options:choiceOptions(entry.de, inTopic)
  };
}

function matching() {
  const round = shuffle(unit1Vocabulary).slice(0, 6);
  const meanings = shuffle(round.map(entry => entry.de));
  return round.map(entry => ({
    type:'choice', match:true, instruction:'Ordne die passende deutsche Bedeutung zu.',
    prompt:entry.en, promptLang:'en', answer:entry.de, answerLang:'de', options:meanings
  }));
}

function sortingWords(perCategory, exclude = new Set()) {
  return Object.keys(categories).flatMap(category => shuffle(
    unit1Vocabulary.filter(word => word.cat === category && sortableWords.has(word.en) && !exclude.has(word.en))
  ).slice(0, perCategory));
}

function categoryQuestion(entry) {
  return {
    type:'choice', instruction:'Zu welchem Themenbereich der Unit passt dieses Wort?',
    prompt:entry.en, promptLang:'en', answer:categories[entry.cat], options:Object.values(categories)
  };
}

function phraseChoice(entry) {
  return {
    type:'choice', instruction:'Welche englische Wendung passt dazu?', prompt:entry.de, promptLang:'de',
    answer:entry.en, answerLang:'en', options:choiceOptions(entry.en, unit1Phrases.map(phrase => phrase.en))
  };
}

function mixedQuiz() {
  const phrases = shuffle(unit1Phrases).slice(0, 4);
  const used = new Set(phrases.map(phrase => phrase.en));
  const sort = sortingWords(1, used);
  sort.forEach(word => used.add(word.en));
  const words = shuffle(unit1Vocabulary.filter(word => !used.has(word.en))).slice(0, 12);
  return shuffle([
    ...words.slice(0, 6).map(word => translation(word)),
    ...words.slice(6, 12).map(meaning),
    ...sort.map(categoryQuestion),
    ...phrases.map(phrase => translation(phrase, true))
  ]);
}

export function buildVocabularyRound(mode) {
  switch (mode) {
    case 'choice': return shuffle(unit1Vocabulary).slice(0, 12).map(meaning);
    case 'match': return matching();
    case 'sort': return shuffle(sortingWords(3)).map(categoryQuestion);
    case 'translate': return shuffle(unit1Vocabulary).slice(0, 12).map(word => translation(word));
    case 'phrases': {
      const phrases = shuffle(unit1Phrases).slice(0, 8);
      return shuffle([...phrases.slice(0, 4).map(phraseChoice), ...phrases.slice(4).map(phrase => translation(phrase, true))]);
    }
    case 'quiz': return mixedQuiz();
    default: throw new Error('Unbekannte Übungsform: ' + mode);
  }
}

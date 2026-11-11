import {choiceOptions, shuffle} from '../../../src/shared/practice_round.js';
import {unit1Phrases, unit1Vocabulary} from './unit1_vocab_data.js';
import {unit1EnglishClues, unit1GapSentences} from './unit1_writing_data.js';

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
  'games console': ['game console'],
  programme: ['program'],
  'pick sth up': ['pick something up', 'pick up something', 'pick up sth'],
  "What's for homework?": ['What is for homework?']
};

function normalizeEnglish(text, allowInfinitive) {
  const clean = text.normalize('NFKC').toLowerCase().trim()
    .replace(/[‘’]/g, "'")
    .replace(/[‐‑–]/g, '-')
    .replace(/\.{3}|…/g, ' ')
    .replace(/[()]/g, '')
    .replace(/[.,!?;:]+$/, '')
    .replace(/\s+/g, ' ').trim();
  return allowInfinitive ? clean.replace(/^to\s+/, '') : clean;
}

const wordByEnglish = new Map(unit1Vocabulary.map(word => [word.en, word]));

function written(entry, {allowInfinitive = true, ...prompt}) {
  const normalize = value => normalizeEnglish(value, allowInfinitive);
  const accepted = [
    entry.en, entry.en.replace(/\s*\([^)]*\)/g, ''), ...(alternatives[entry.en] || [])
  ].map(normalize);
  return {
    type:'text', ...prompt, answer:entry.en, answerLang:'en',
    accept:value => accepted.includes(normalize(value))
  };
}

function translation(entry, phrase = false) {
  return written(entry, {
    instruction:phrase ? 'Schreibe die englische Wendung.' : 'Übersetze ins Englische.',
    prompt:entry.de, promptLang:'de'
  });
}

function gap(word) {
  const entry = wordByEnglish.get(word);
  return written(entry, {
    instruction:'Schreibe nur das, was in die Lücke gehört.',
    prompt:unit1GapSentences[word], promptLang:'en',
    hint:'Deutscher Hinweis: ' + entry.de, hintLang:'de', allowInfinitive:false
  });
}

function englishClue(word) {
  return written(wordByEnglish.get(word), {
    instruction:'Schreibe die passende Vokabel aus Unit 1.',
    prompt:unit1EnglishClues[word], promptLang:'en'
  });
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

function takeUnused(entries, count, key, used) {
  const picked = [];
  for (const entry of shuffle(entries)) {
    const word = key(entry);
    if (used.has(word)) continue;
    used.add(word);
    picked.push(entry);
    if (picked.length === count) break;
  }
  return picked;
}

function mixedQuiz() {
  const used = new Set();
  const phrases = takeUnused(unit1Phrases, 4, phrase => phrase.en, used);
  const sort = takeUnused(sortingWords(1, used), 2, word => word.en, used);
  const gaps = takeUnused(Object.keys(unit1GapSentences), 4, word => word, used);
  const clues = takeUnused(Object.keys(unit1EnglishClues), 2, word => word, used);
  const words = takeUnused(unit1Vocabulary, 8, word => word.en, used);
  return shuffle([
    ...words.slice(0, 6).map(word => translation(word)),
    ...gaps.map(gap),
    ...clues.map(englishClue),
    ...phrases.map(phrase => translation(phrase, true)),
    ...words.slice(6).map(meaning),
    ...sort.map(categoryQuestion)
  ]);
}

export function buildVocabularyRound(mode) {
  switch (mode) {
    case 'choice': return shuffle(unit1Vocabulary).slice(0, 12).map(meaning);
    case 'match': return matching();
    case 'sort': return shuffle(sortingWords(3)).map(categoryQuestion);
    case 'translate': return shuffle(unit1Vocabulary).slice(0, 16).map(word => translation(word));
    case 'sentences': return shuffle(Object.keys(unit1GapSentences)).slice(0, 12).map(gap);
    case 'clues': return shuffle(Object.keys(unit1EnglishClues)).slice(0, 12).map(englishClue);
    case 'phrases': return shuffle(unit1Phrases).map(phrase => translation(phrase, true));
    case 'quiz': return mixedQuiz();
    default: throw new Error('Unbekannte Übungsform: ' + mode);
  }
}

import {initPage} from '../../../src/shared/page.js';
import {unit1Vocabulary, unit1Phrases} from './unit1_vocab_data.js';

initPage();
const search = document.querySelector('#wordSearch');
const status = document.querySelector('#wordSearchStatus');
const list = document.querySelector('#wordList');
const pairs = [...new Map(
  [...unit1Vocabulary, ...unit1Phrases].map(word => [JSON.stringify([word.en, word.de]), word])
).values()].sort((a, b) => a.en.localeCompare(b.en, 'en'));
const fold = value => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/ß/g, 'ss');

function render() {
  const query = fold(search.value.trim());
  const matches = pairs.filter(({en,de}) => fold(en).includes(query) || fold(de).includes(query));
  status.textContent = matches.length === 0 ? 'Keine passenden Einträge gefunden.' :
    matches.length + (matches.length === 1 ? ' Eintrag' : ' Einträge');
  list.replaceChildren(...matches.map(({en,de}) => {
    const row = document.createElement('tr');
    const english = document.createElement('td');
    const german = document.createElement('td');
    english.lang = 'en';
    english.textContent = en;
    german.textContent = de;
    row.append(english, german);
    return row;
  }));
}
search.addEventListener('input', render);
render();

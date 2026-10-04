import {describingPeople,people,whoRounds} from './describing_people_data.js';
function ok(x,m){if(!x)throw new Error(m)}
ok(new Set(describingPeople.match.pairs.map(x=>x.left)).size===describingPeople.match.pairs.length,'duplicate match term');
ok(describingPeople.choice.questions.every(q=>q.options.includes(q.answer)),'choice answer missing');
ok(describingPeople.sort.items.every(x=>describingPeople.sort.categories.includes(x.category)),'sort category missing');
ok(describingPeople.cloze.items.length>=5,'too few cloze items');
ok(people.length>=8,'too few people');
ok(new Set(people.map(p=>p.name)).size===people.length,'duplicate person name');
ok(whoRounds.every(r=>people.some(p=>p.name===r.answer)),'unknown answer in whoRounds');
console.log('describing_people_data tests passed');

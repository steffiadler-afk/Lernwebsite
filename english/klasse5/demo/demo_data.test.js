import {demo} from './demo_data.js';
function ok(x,m){if(!x)throw new Error(m)}
ok(new Set(demo.match.pairs.map(x=>x.left)).size===demo.match.pairs.length,'duplicate match left');
ok(demo.choice.questions.every(q=>q.options.includes(q.answer)),'choice answer missing');
ok(demo.sort.items.every(x=>demo.sort.categories.includes(x.category)),'sort category missing');
ok(demo.cloze.items.length>=3,'too few cloze items');
console.log('demo_data tests passed');

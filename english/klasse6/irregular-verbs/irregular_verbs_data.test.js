import {irregularVerbs} from './irregular_verbs_data.js';
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
assert(irregularVerbs.length>=60,'Es sollten mindestens 60 Verben vorhanden sein.');
const infinitives=irregularVerbs.map(v=>v.infinitive);
assert(new Set(infinitives).size===infinitives.length,'Doppelte Grundformen gefunden.');
for(const v of irregularVerbs){assert(v.infinitive&&v.past,'Jedes Verb braucht Grundform und simple past.');}
for(const key of ['go','be','write','take','see'])assert(infinitives.includes(key),`Wichtiges Verb fehlt: ${key}`);
console.log(`OK: ${irregularVerbs.length} irregular verbs geprüft.`);

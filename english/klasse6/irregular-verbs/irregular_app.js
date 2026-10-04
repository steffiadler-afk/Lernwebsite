import {initPage} from '../../../src/shared/page.js';
import {protect} from '../../../src/shared/protect.js';
import {mountQR} from '../../../src/shared/qr.js';
import {Results} from '../../../src/shared/results.js';
import {irregularVerbs} from './irregular_verbs_data.js';

initPage(); protect('english-6'); mountQR();

const mode=document.body.dataset.modeType;
const host=document.querySelector('#exercise');
const scoreEl=document.querySelector('#score');
const totalEl=document.querySelector('#total');
const resultEl=document.querySelector('#result');
const checkBtn=document.querySelector('#checkBtn');
const newBtn=document.querySelector('#newBtn');

const sample=(arr,n)=>[...arr].sort(()=>Math.random()-.5).slice(0,n);
const norm=s=>(s||'').trim().toLowerCase().replace(/\s+/g,' ');
let round=[];

function setResult(score,total,details){scoreEl.textContent=score;totalEl.textContent=total;resultEl.textContent=score===total?'Alles richtig! 🎉':`${score} von ${total} richtig.`;resultEl.className='result '+(score===total?'good':'bad');resultEl.dataset.details=JSON.stringify(details)}

function renderType(direction='toPast'){
 round=sample(irregularVerbs,12);
 host.innerHTML=round.map((v,i)=>{const prompt=direction==='toPast'?v.infinitive:v.past;const label=direction==='toPast'?'simple past':'infinitive';return `<div class="item row"><strong style="min-width:170px">${prompt}</strong><input data-i="${i}" type="text" placeholder="${label}"></div>`}).join('');
 checkBtn.onclick=()=>{let score=0,details=[];round.forEach((v,i)=>{const given=host.querySelector(`[data-i="${i}"]`).value;const answer=direction==='toPast'?v.past:v.infinitive;const acceptable=answer.split('/').map(x=>norm(x));if(acceptable.includes(norm(given)))score++;else details.push({prompt:direction==='toPast'?v.infinitive:v.past,given,answer})});setResult(score,round.length,details)};
}

function renderChoice(){
 round=sample(irregularVerbs,10);
 host.innerHTML=round.map((v,i)=>{const distractors=sample(irregularVerbs.filter(x=>x.past!==v.past),3).map(x=>x.past);const opts=[v.past,...distractors].sort(()=>Math.random()-.5);return `<div class="item"><strong>${i+1}. ${v.infinitive}</strong>${opts.map(o=>`<label class="option"><input type="radio" name="q${i}" value="${o}"> ${o}</label>`).join('')}</div>`}).join('');
 checkBtn.onclick=()=>{let score=0,details=[];round.forEach((v,i)=>{const given=host.querySelector(`input[name=q${i}]:checked`)?.value||'';if(given===v.past)score++;else details.push({prompt:v.infinitive,given,answer:v.past})});setResult(score,round.length,details)};
}

function renderMixed(){
 round=sample(irregularVerbs,12).map((v,i)=>({...v,dir:i%2===0?'toPast':'toInf'}));
 host.innerHTML=round.map((v,i)=>{const prompt=v.dir==='toPast'?v.infinitive:v.past;const target=v.dir==='toPast'?'simple past':'infinitive';return `<div class="item"><div class="small muted">Schreibe die ${target}-Form.</div><div class="row"><strong style="min-width:170px">${prompt}</strong><input data-i="${i}" type="text"></div></div>`}).join('');
 checkBtn.onclick=()=>{let score=0,details=[];round.forEach((v,i)=>{const given=host.querySelector(`[data-i="${i}"]`).value;const answer=v.dir==='toPast'?v.past:v.infinitive;const acceptable=answer.split('/').map(x=>norm(x));if(acceptable.includes(norm(given)))score++;else details.push({prompt:v.dir==='toPast'?v.infinitive:v.past,given,answer})});setResult(score,round.length,details)};
}

function render(){scoreEl.textContent='0';resultEl.textContent='';resultEl.dataset.details='[]';if(mode==='past')renderType('toPast');else if(mode==='infinitive')renderType('toInf');else if(mode==='choice')renderChoice();else renderMixed()}
newBtn.onclick=render; render();
Results.attachSubmit('#submitBox',{subject:'english',grade:6,topic:'irregular-verbs',exercise:mode});

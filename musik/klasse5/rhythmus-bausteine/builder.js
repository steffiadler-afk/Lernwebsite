import {initPage} from '../../../src/shared/page.js';
import {assets} from './blocks.js';
import {notation} from './notation.js';
initPage();
const first = document.querySelector('#first');
const more = document.querySelector('#more');
const add = document.querySelector('#add');
const status = document.querySelector('#status');
let firstTask = [], secondTask = [];

export function parseNumbers(value,count){
  const parts=value.trim().split(/[\s,;]+/).filter(Boolean);
  if(parts.length!==count||parts.some(part=>!/^(?:[1-9]|10)$/.test(part)))return null;
  const numbers=parts.map(Number);
  return new Set(numbers).size===count ? numbers : null;
}
function image(src,alt,width){
  const img=document.createElement('img');
  img.src=src;img.alt=alt;img.width=width;img.height=180;
  return img;
}
function staffRow(numbers){
  const row=document.createElement('div');row.className='staff-row';
  row.setAttribute('role','group');
  row.setAttribute('aria-label','Bausteine '+numbers.join(' und '));
  row.append(image(notation.header,'Schlagzeugschlüssel und Viervierteltakt',152));
  for(const number of numbers){
    const figure=document.createElement('figure');figure.className='measure';
    const label=document.createElement('figcaption');label.textContent='Baustein '+number;
    figure.append(label,image(notation.blocks[number],'Noten und Pausen von Baustein '+number,670));
    row.append(figure);
  }
  return row;
}
function render(){
  document.querySelector('#firstSequence').replaceChildren(...[0,2].filter(i=>firstTask[i]).map(i=>staffRow(firstTask.slice(i,i+2))));
  document.querySelector('#secondSequence').replaceChildren(...(secondTask.length?[staffRow(secondTask)]:[]));
  document.querySelector('#firstTask').hidden=firstTask.length===0;
  document.querySelector('#secondTask').hidden=secondTask.length===0;
  document.querySelector('#empty').hidden=firstTask.length>0;
  document.querySelector('#print').disabled=firstTask.length===0;
  document.querySelector('#displayToggle').disabled=firstTask.length===0;
  more.disabled=firstTask.length<4;add.disabled=firstTask.length<4;
}
document.querySelector('#firstForm').addEventListener('submit',event=>{
  event.preventDefault();const numbers=parseNumbers(first.value,4);
  if(!numbers){status.textContent='Bitte vier unterschiedliche Nummern zwischen 1 und 10 eingeben.';first.focus();return}
  firstTask=numbers;secondTask=[];more.value='';render();
  status.textContent='Aufgabe 1 mit vier Bausteinen wird angezeigt. Du kannst jetzt Aufgabe 2 auswählen.';
});
document.querySelector('#moreForm').addEventListener('submit',event=>{
  event.preventDefault();if(firstTask.length<4)return;
  const numbers=parseNumbers(more.value,2);
  if(!numbers){status.textContent='Bitte zwei unterschiedliche Nummern zwischen 1 und 10 eingeben.';more.focus();return}
  if(numbers.some(n=>firstTask.includes(n))){status.textContent='Diese Nummer ist bereits in Aufgabe 1. Bitte zwei noch nicht verwendete Nummern wählen.';more.focus();return}
  secondTask=numbers;render();status.textContent='Aufgabe 2 wird getrennt unter Aufgabe 1 angezeigt.';
});
document.querySelector('#displayToggle').addEventListener('click',()=>{
  const large=document.body.classList.toggle('large-display');
  const button=document.querySelector('#displayToggle');
  button.textContent=large?'Nummern bearbeiten':'Groß anzeigen';
  button.setAttribute('aria-pressed',String(large));
  document.querySelector('#sequenceTitle').scrollIntoView({block:'start'});
});
document.querySelector('#reset').addEventListener('click',()=>{firstTask=[];secondTask=[];first.value='';more.value='';status.textContent='';render();first.focus()});
document.querySelector('#print').addEventListener('click',()=>window.print());
document.querySelector('#catalog').replaceChildren(...Array.from({length:10},(_,i)=>{
  const figure=document.createElement('figure');figure.className='block';
  const label=document.createElement('figcaption');label.textContent='Baustein '+(i+1);
  const img=image(assets[i+1],'Rhythmusnotation von Baustein '+(i+1),800);
  figure.append(label,img);return figure;
}));
render();

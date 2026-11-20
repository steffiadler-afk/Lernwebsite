import {initPage} from '../../../src/shared/page.js';
import {assets} from './blocks.js';
initPage();
const first = document.querySelector('#first');
const more = document.querySelector('#more');
const add = document.querySelector('#add');
const status = document.querySelector('#status');
const sequence = document.querySelector('#sequence');
let chosen = [];

export function parseNumbers(value,count){
  const parts=value.trim().split(/[\s,;]+/).filter(Boolean);
  if(parts.length!==count||parts.some(part=>! /^(?:[1-9]|10)$/.test(part)))return null;
  return parts.map(Number);
}
function block(number){
  const figure=document.createElement('figure');figure.className='block';
  const label=document.createElement('figcaption');label.textContent='Baustein '+number;
  const image=document.createElement('img');image.src=assets[number];image.alt='Rhythmusnotation von Baustein '+number;image.width=800;image.height=175;
  figure.append(label,image);return figure;
}
function render(){
  sequence.replaceChildren(...chosen.map(block));
  document.querySelector('#empty').hidden=chosen.length>0;
  document.querySelector('#print').disabled=chosen.length===0;
  more.disabled=chosen.length<4;add.disabled=chosen.length<4;
}
document.querySelector('#firstForm').addEventListener('submit',event=>{
  event.preventDefault();const numbers=parseNumbers(first.value,4);
  if(!numbers){status.textContent='Bitte genau vier Nummern zwischen 1 und 10 eingeben.';first.focus();return}
  chosen=numbers;more.value='';render();status.textContent='Vier Bausteine werden angezeigt. Du kannst jetzt zwei weitere ergänzen.';
});
document.querySelector('#moreForm').addEventListener('submit',event=>{
  event.preventDefault();if(chosen.length<4)return;
  const numbers=parseNumbers(more.value,2);
  if(!numbers){status.textContent='Bitte genau zwei Nummern zwischen 1 und 10 eingeben.';more.focus();return}
  chosen=[...chosen.slice(0,4),...numbers];render();status.textContent='Alle sechs Bausteine werden angezeigt.';
});
document.querySelector('#reset').addEventListener('click',()=>{chosen=[];first.value='';more.value='';status.textContent='';render();first.focus()});
document.querySelector('#print').addEventListener('click',()=>window.print());
document.querySelector('#catalog').replaceChildren(...Array.from({length:10},(_,i)=>block(i+1)));
render();

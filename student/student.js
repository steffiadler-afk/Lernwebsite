import {initPage} from '../src/shared/page.js';
initPage();
const input=document.querySelector('#studentLogin');
const btn=document.querySelector('#studentLoginBtn');
const msg=document.querySelector('#studentLoginMsg');
const current=document.querySelector('#currentStudent');
const savedName=localStorage.getItem('studentName')||'';
const savedClass=localStorage.getItem('studentClass')||'';
if(savedName&&savedClass){current.classList.remove('hidden');current.innerHTML=`Angemeldet als <strong>${escapeHtml(savedName)}</strong> · Klasse <strong>${escapeHtml(savedClass)}</strong>`;input.value=savedName}
btn.onclick=()=>{
 const raw=input.value.trim().replace(/\s+/g,'');
 if(!/^[A-Za-zÄÖÜäöüß]+[A-Za-zÄÖÜäöüß]$/.test(raw)||raw.length<3){msg.textContent='Bitte Vorname + ersten Buchstaben des Nachnamens eingeben, z. B. GeorgB.';msg.className='result bad';return}
 localStorage.setItem('studentName',raw);
 localStorage.setItem('studentClass','6g');
 localStorage.setItem('studentLoginAt',String(Date.now()));
 msg.textContent='Anmeldung gespeichert.';msg.className='result good';
 current.classList.remove('hidden');current.innerHTML=`Angemeldet als <strong>${escapeHtml(raw)}</strong> · Klasse <strong>6g</strong>`;
};
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

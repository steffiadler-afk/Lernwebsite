import {CONFIG} from '../src/shared/config.js';
import {initPage} from '../src/shared/page.js';
initPage();

const login=document.querySelector('#login');
const panel=document.querySelector('#panel');
const msg=document.querySelector('#loginMsg');
const tab=document.querySelector('#tab');
let token=localStorage.getItem('adminToken')||'';
let exp=Number(localStorage.getItem('adminTokenExp')||0);
let submissions=[];

if(token&&Date.now()<exp)show();

document.querySelector('#loginBtn').onclick=async()=>{
  if(!CONFIG.remote.enabled){msg.textContent='Backend ist noch deaktiviert.';return}
  msg.textContent='Anmeldung wird geprüft …';
  try{
    const r=await fetch(CONFIG.remote.url+'/api/admin/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:document.querySelector('#adminPw').value})});
    if(!r.ok){msg.textContent='Anmeldung fehlgeschlagen.';return}
    const j=await r.json();
    token=j.token;
    localStorage.setItem('adminToken',token);
    localStorage.setItem('adminTokenExp',String(Date.now()+30*864e5));
    show();
  }catch(e){msg.textContent='Verbindung zum Backend fehlgeschlagen.'}
};

function show(){
  login.classList.add('hidden');
  panel.classList.remove('hidden');
  load('overview');
}

panel.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{
  panel.querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  load(b.dataset.tab);
});

async function api(path){
  const r=await fetch(CONFIG.remote.url+path,{headers:{authorization:'Bearer '+token}});
  if(r.status===401){localStorage.removeItem('adminToken');localStorage.removeItem('adminTokenExp');location.reload();throw new Error('unauthorized')}
  if(!r.ok)throw new Error('HTTP '+r.status);
  return r.json();
}

async function ensureSubmissions(){
  submissions=await api('/api/admin/students');
  submissions.sort((a,b)=>new Date(b.timestamp||0)-new Date(a.timestamp||0));
  return submissions;
}

async function load(name){
  if(!CONFIG.remote.enabled){tab.innerHTML='<p>Backend deaktiviert.</p>';return}
  tab.innerHTML='<p class="muted">Wird geladen …</p>';
  try{
    if(name==='overview')return renderOverview(await ensureSubmissions());
    if(name==='students')return renderStudents(await ensureSubmissions());
    if(name==='stats')return renderStats(await ensureSubmissions());
    if(name==='timeline')return renderTimeline(await ensureSubmissions());
    if(name==='visibility')return renderSimple('Sichtbarkeit',await api('/api/admin/visibility'));
    if(name==='materials')return renderSimple('Materialien',await api('/api/admin/materials'));
    if(name==='images')return renderSimple('Bilder',await api('/api/admin/images'));
  }catch(e){tab.innerHTML='<p class="bad">Fehler beim Laden.</p>'}
}

function pct(s,t){return t>0?Math.round((s/t)*100):0}
function safe(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dateFmt(v){if(!v)return '–';try{return new Intl.DateTimeFormat('de-DE',{dateStyle:'short',timeStyle:'short'}).format(new Date(v))}catch{return v}}
function exerciseLabel(s){return s.exercise||s.title||s.topic||s.type||s.engine||'Übung'}
function classLabel(s){return s.className||s.class||'ohne Klasse'}
function subjectLabel(s){return s.subject||s.fach||((s.realm||'').startsWith('music')?'Musik':'Englisch')}

function renderOverview(arr){
  const today=new Date().toISOString().slice(0,10);
  const todayCount=arr.filter(x=>(x.timestamp||'').slice(0,10)===today).length;
  const avg=arr.length?Math.round(arr.reduce((n,x)=>n+pct(Number(x.score)||0,Number(x.total)||0),0)/arr.length):0;
  const classes=new Set(arr.map(classLabel).filter(x=>x!=='ohne Klasse')).size;
  tab.innerHTML=`<div class="admin-head"><div><h2>Übersicht</h2><p class="muted">Aktueller Stand der abgegebenen Übungen</p></div><button id="refreshAdmin">↻ Aktualisieren</button></div>
  <div class="stat-grid">
    <div class="stat-card"><span>Abgaben gesamt</span><strong>${arr.length}</strong></div>
    <div class="stat-card"><span>Heute</span><strong>${todayCount}</strong></div>
    <div class="stat-card"><span>Ø Ergebnis</span><strong>${avg}%</strong></div>
    <div class="stat-card"><span>Klassen</span><strong>${classes}</strong></div>
  </div>
  <h3>Letzte Abgaben</h3>${submissionRows(arr.slice(0,6),false)}`;
  document.querySelector('#refreshAdmin').onclick=()=>load('overview');
}

function renderStudents(arr){
  const classes=[...new Set(arr.map(classLabel))].sort();
  const exercises=[...new Set(arr.map(exerciseLabel))].sort();
  tab.innerHTML=`<div class="admin-head"><div><h2>Schüler:innen & Abgaben</h2><p class="muted">Filtern, Details ansehen und Ergebnisse exportieren</p></div><button class="primary" id="csvBtn">CSV exportieren</button></div>
  <div class="filterbar">
    <input id="searchFilter" type="text" placeholder="Name/Pseudonym suchen …">
    <select id="classFilter"><option value="">Alle Klassen</option>${classes.map(x=>`<option>${safe(x)}</option>`).join('')}</select>
    <select id="exerciseFilter"><option value="">Alle Übungen</option>${exercises.map(x=>`<option>${safe(x)}</option>`).join('')}</select>
  </div>
  <div id="submissionList"></div>`;
  const render=()=>{
    const q=document.querySelector('#searchFilter').value.toLowerCase();
    const c=document.querySelector('#classFilter').value;
    const e=document.querySelector('#exerciseFilter').value;
    const filtered=arr.filter(x=>(!q||String(x.name||'').toLowerCase().includes(q))&&(!c||classLabel(x)===c)&&(!e||exerciseLabel(x)===e));
    document.querySelector('#submissionList').innerHTML=`<p class="small muted">${filtered.length} Abgabe(n)</p>${submissionRows(filtered,true)}`;
  };
  ['searchFilter','classFilter','exerciseFilter'].forEach(id=>document.querySelector('#'+id).addEventListener('input',render));
  document.querySelector('#csvBtn').onclick=()=>downloadCsv(arr);
  render();
}

function submissionRows(arr,details=true){
  if(!arr.length)return '<p class="muted">Noch keine Abgaben vorhanden.</p>';
  return `<div class="submission-list">${arr.map((s,i)=>{
    const p=pct(Number(s.score)||0,Number(s.total)||0);
    const cls=p>=80?'score-good':p>=50?'score-mid':'score-low';
    return `<details class="submission-card" ${details&&i===0?'open':''}><summary>
      <div><strong>${safe(s.name||'Anonym')}</strong><span>${safe(classLabel(s))} · ${safe(exerciseLabel(s))}</span></div>
      <div class="submission-meta"><span class="score-pill ${cls}">${s.score??0}/${s.total??0} · ${p}%</span><time>${safe(dateFmt(s.timestamp))}</time></div>
    </summary>
    <div class="submission-detail">
      <div class="detail-grid"><div><b>Fach</b><span>${safe(subjectLabel(s))}</span></div><div><b>Klasse</b><span>${safe(classLabel(s))}</span></div><div><b>Übung</b><span>${safe(exerciseLabel(s))}</span></div><div><b>Zeit</b><span>${safe(dateFmt(s.timestamp))}</span></div></div>
      ${renderDetails(s.details)}
    </div></details>`}).join('')}</div>`;
}

function renderDetails(d){
  if(d==null)return '<p class="muted">Keine Detaildaten gespeichert.</p>';
  if(Array.isArray(d))return `<div class="answer-list">${d.map((x,i)=>renderAnswer(x,i)).join('')}</div>`;
  if(typeof d==='object')return `<div class="answer-list">${Object.entries(d).map(([k,v],i)=>renderAnswer({label:k,value:v},i)).join('')}</div>`;
  return `<pre>${safe(d)}</pre>`;
}
function renderAnswer(x,i){
  if(x&&typeof x==='object'){
    const correct=x.correct===true||x.isCorrect===true;
    const wrong=x.correct===false||x.isCorrect===false;
    const label=x.question||x.label||x.prompt||`Aufgabe ${i+1}`;
    const value=x.answer??x.value??x.given??x.response??JSON.stringify(x);
    return `<div class="answer-row ${correct?'answer-correct':wrong?'answer-wrong':''}"><b>${safe(label)}</b><span>${safe(typeof value==='object'?JSON.stringify(value):value)}</span>${correct?'✓':wrong?'✗':''}</div>`;
  }
  return `<div class="answer-row"><b>Aufgabe ${i+1}</b><span>${safe(x)}</span></div>`;
}

function renderStats(arr){
  const groups={};
  arr.forEach(s=>{const key=classLabel(s)+'|'+exerciseLabel(s);(groups[key]??=[]).push(pct(Number(s.score)||0,Number(s.total)||0))});
  const rows=Object.entries(groups).map(([k,v])=>{const [c,e]=k.split('|');return{c,e,n:v.length,avg:Math.round(v.reduce((a,b)=>a+b,0)/v.length)}}).sort((a,b)=>a.c.localeCompare(b.c)||a.e.localeCompare(b.e));
  tab.innerHTML=`<h2>Statistik</h2><p class="muted">Durchschnittswerte nach Klasse und Übung</p><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Klasse</th><th>Übung</th><th>Abgaben</th><th>Ø Ergebnis</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${safe(r.c)}</td><td>${safe(r.e)}</td><td>${r.n}</td><td><b>${r.avg}%</b></td></tr>`).join('')}</tbody></table></div>`;
}

function renderTimeline(arr){
  const days={};arr.forEach(s=>{const d=(s.timestamp||'').slice(0,10)||'unbekannt';days[d]=(days[d]||0)+1});
  const rows=Object.entries(days).sort((a,b)=>b[0].localeCompare(a[0]));
  const max=Math.max(1,...rows.map(x=>x[1]));
  tab.innerHTML=`<h2>Verlauf</h2><p class="muted">Abgaben über die Zeit</p><div class="timeline-list">${rows.map(([d,n])=>`<div class="timeline-row"><time>${safe(d==='unbekannt'?'Ohne Datum':new Intl.DateTimeFormat('de-DE',{dateStyle:'medium'}).format(new Date(d+'T12:00:00')))}</time><div class="timeline-bar"><i style="width:${Math.max(5,n/max*100)}%"></i></div><strong>${n}</strong></div>`).join('')}</div>`;
}

function renderSimple(title,j){tab.innerHTML=`<h2>${safe(title)}</h2><pre style="white-space:pre-wrap">${safe(JSON.stringify(j,null,2))}</pre>`}

function downloadCsv(arr){
  const head=['Name/Pseudonym','Klasse','Fach','Übung','Punkte','Gesamt','Prozent','Datum'];
  const lines=[head,...arr.map(s=>[s.name||'',classLabel(s),subjectLabel(s),exerciseLabel(s),s.score??'',s.total??'',pct(Number(s.score)||0,Number(s.total)||0),s.timestamp||''])];
  const csv='\ufeff'+lines.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='lernwebsite-abgaben.csv';a.click();URL.revokeObjectURL(a.href);
}

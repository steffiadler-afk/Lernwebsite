import {CONFIG} from '../src/shared/config.js';import {initPage} from '../src/shared/page.js';initPage();
const login=document.querySelector('#login'),panel=document.querySelector('#panel'),msg=document.querySelector('#loginMsg'),tab=document.querySelector('#tab');
let token=localStorage.getItem('adminToken')||'';let exp=Number(localStorage.getItem('adminTokenExp')||0);
if(token&&Date.now()<exp)show();
document.querySelector('#loginBtn').onclick=async()=>{if(!CONFIG.remote.enabled){msg.textContent='Backend ist noch deaktiviert. Nach Cloudflare-Einrichtung kann hier serverseitig eingeloggt werden.';return}const r=await fetch(CONFIG.remote.url+'/api/admin/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:document.querySelector('#adminPw').value})});if(!r.ok){msg.textContent='Anmeldung fehlgeschlagen.';return}const j=await r.json();token=j.token;localStorage.setItem('adminToken',token);localStorage.setItem('adminTokenExp',String(Date.now()+30*864e5));show()};
function show(){login.classList.add('hidden');panel.classList.remove('hidden');load('overview')}
panel.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>load(b.dataset.tab));
async function load(name){if(!CONFIG.remote.enabled){tab.innerHTML='<p>Backend deaktiviert. Die Oberfläche ist vorbereitet.</p>';return}const r=await fetch(CONFIG.remote.url+'/api/admin/'+name,{headers:{authorization:'Bearer '+token}});if(!r.ok){tab.textContent='Fehler beim Laden.';return}const j=await r.json();tab.innerHTML='<pre style="white-space:pre-wrap">'+escapeHtml(JSON.stringify(j,null,2))+'</pre>'}
function escapeHtml(s){return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}

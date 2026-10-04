import {CONFIG} from './config.js';
export function protect(realm){
 if(realm==='english-6') return;
 const key='unlocked:'+realm;if(localStorage.getItem(key)==='1') return;
 const expected=CONFIG.realms[realm]; if(!expected) return;
 const ov=document.createElement('div');ov.className='protect-overlay';
 ov.innerHTML=`<div class="protect-box"><h2>🔒 Geschützter Übungsbereich</h2><p>Bitte Passwort eingeben.</p><input id="pw" type="password" autocomplete="off"><p id="msg" class="bad"></p><button class="primary" id="unlock">Freischalten</button></div>`;
 document.body.appendChild(ov); const input=ov.querySelector('#pw'); input.focus();
 const go=()=>{if(input.value===expected){localStorage.setItem(key,'1');ov.remove()}else ov.querySelector('#msg').textContent='Passwort stimmt leider nicht.'};
 ov.querySelector('#unlock').onclick=go;input.addEventListener('keydown',e=>{if(e.key==='Enter')go()});
}


const root=document.documentElement;
const savedTheme=localStorage.getItem('theme')||'ocean';
const savedMode=localStorage.getItem('mode')||'light';
const savedScale=localStorage.getItem('fontScale')||'1';
root.dataset.theme=savedTheme; root.dataset.mode=savedMode; root.style.setProperty('--font-scale', savedScale);
export function mountThemeControls(sel='#themeControls'){
 const host=document.querySelector(sel); if(!host) return;
 host.innerHTML=`<select id="themeSel" aria-label="Farbthema"><option>ocean</option><option>mint</option><option>berry</option><option>sun</option><option>forest</option><option>violet</option></select><button id="modeBtn">Hell/Dunkel</button><select id="fontSel" aria-label="Schriftgröße"><option value="0.9">klein</option><option value="1">normal</option><option value="1.15">groß</option><option value="1.3">sehr groß</option></select>`;
 host.querySelector('#themeSel').value=savedTheme;host.querySelector('#fontSel').value=savedScale;
 host.querySelector('#themeSel').onchange=e=>{root.dataset.theme=e.target.value;localStorage.setItem('theme',e.target.value)};
 host.querySelector('#modeBtn').onclick=()=>{root.dataset.mode=root.dataset.mode==='dark'?'light':'dark';localStorage.setItem('mode',root.dataset.mode)};
 host.querySelector('#fontSel').onchange=e=>{root.style.setProperty('--font-scale',e.target.value);localStorage.setItem('fontScale',e.target.value)};
}

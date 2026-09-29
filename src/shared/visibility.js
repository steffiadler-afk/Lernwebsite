import {CONFIG} from './config.js';
export async function applyVisibility(){if(!CONFIG.remote.enabled)return;try{const r=await fetch(CONFIG.remote.url+'/api/visibility');const map=await r.json();document.querySelectorAll('[data-exercise-id]').forEach(el=>{const id=el.dataset.exerciseId;if(map[id]===false)el.classList.add('hidden')})}catch(e){console.warn('visibility unavailable',e)}}


export function enableTapDrag({items, zones, onDrop}){
 let selected=null;
 items.forEach(item=>{
  item.tabIndex=0;
  const choose=()=>{if(selected)selected.classList.remove('selected');selected=item;item.classList.add('selected')};
  item.addEventListener('click',choose);item.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')choose()});
  item.addEventListener('pointerdown',e=>{item.setPointerCapture?.(e.pointerId); item.dataset.dragging='1'});
  item.addEventListener('pointerup',e=>{if(item.dataset.dragging==='1'){item.dataset.dragging='';const el=document.elementFromPoint(e.clientX,e.clientY);const zone=el?.closest?.('[data-dropzone]');if(zone){onDrop(item,zone);if(selected)selected.classList.remove('selected');selected=null}}});
 });
 zones.forEach(zone=>{zone.tabIndex=0;const drop=()=>{if(selected){onDrop(selected,zone);selected.classList.remove('selected');selected=null}};zone.addEventListener('click',drop);zone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')drop()})});
}

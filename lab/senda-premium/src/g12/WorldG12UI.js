/* Cosmetic text only. All game values are read from G4, never from artwork. */
export function installG12WorldUI({doc=document}={}){
 const main=doc.getElementById('main');if(!main)throw Error('G12_MAIN_MISSING');
 let updates=0;
 const text='🎨 G12: terreno, musgo y senda trenzada ilustrados en capas independientes. Arte candidato, sin modificar las reglas del juego.';
 const sync=()=>{
  const stage=main.querySelector('.stage');if(!stage?.querySelector('#g2-map'))return;
  const note=stage.querySelector('.g11-prototype-note,.g10-prototype-note,.g9-prototype-note');
  if(note&&!note.classList.contains('g12-prototype-note')){note.classList.add('g12-prototype-note');note.textContent=text;updates++;}
  const status=stage.querySelector('#g4-renderer-status');
  if(status&&status.textContent.includes('escenografía modular G11')){status.textContent=status.textContent.replace('escenografía modular G11','terreno y senda G12');updates++;}
 };
 const observer=new MutationObserver(sync);observer.observe(main,{childList:true,subtree:true});sync();
 return {diagnostics:()=>({updates,notes:main.querySelectorAll('.g12-prototype-note').length}),dispose:()=>observer.disconnect()};
}

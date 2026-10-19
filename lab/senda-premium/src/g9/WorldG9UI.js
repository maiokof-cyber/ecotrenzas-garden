/* G9 visual text layer: updates G8 player-facing lab descriptions only.
 * No currency, progress, styles or account operations.
 */
export function installG9WorldUI({doc=document}={}){
 const main=doc.getElementById('main');
 if(!main)throw Error('G9_MAIN_MISSING');
 let updates=0;
 const note='🎨 G9: arco, cascada y follaje independientes en capas 2.5D. Arte ilustrativo candidato; todavía no aprobado como arte final.';
 const sync=()=>{
   const stage=main.querySelector('.stage');
   if(!stage||!stage.querySelector('#g2-map'))return;
   const old=stage.querySelector('.g3-prototype-disclaimer');
   if(old){
     const updated=doc.createElement('p');updated.className='g9-prototype-note';updated.textContent=note;
     old.replaceWith(updated);updates++;
   }
   const status=stage.querySelector('#g4-renderer-status');
   if(status?.textContent?.includes('ambientación G8')){
     status.textContent=status.textContent.replace('ambientación G8','arte modular G9');updates++;
   }
 };
 const obs=new MutationObserver(()=>sync());
 obs.observe(main,{childList:true,subtree:true});sync();
 return {diagnostics:()=>({updates,notes:main.querySelectorAll('.g9-prototype-note').length}),dispose:()=>obs.disconnect()};
}

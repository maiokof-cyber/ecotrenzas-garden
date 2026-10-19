/* Player-facing presentation only. Source labels remain outside gameplay and commerce. */
export function installG11WorldUI({doc=document}={}){
 const host=doc.getElementById('main');if(!host)throw Error('G11_MAIN_MISSING');
 let updates=0;
 const note='🎨 G11: cielo, bosque lejano y cascada en sprites independientes. Arte ilustrativo candidato; Key Art maestro preservado y sin datos comerciales incrustados.';
 const sync=()=>{
  const stage=host.querySelector('.stage');if(!stage?.querySelector('#g2-map'))return;
  const old=stage.querySelector('.g10-prototype-note,.g9-prototype-note');
  if(old && !old.classList.contains('g11-prototype-note')){old.classList.add('g11-prototype-note');old.textContent=note;updates++;}
  const status=stage.querySelector('#g4-renderer-status');
  if(status?.textContent?.includes('materiales artísticos G10')){
   status.textContent=status.textContent.replace('materiales artísticos G10','escenografía modular G11');updates++;
  }
 };
 const obs=new MutationObserver(sync);obs.observe(host,{childList:true,subtree:true});sync();
 return {diagnostics:()=>({updates,notes:host.querySelectorAll('.g11-prototype-note').length}),dispose:()=>obs.disconnect()};
}

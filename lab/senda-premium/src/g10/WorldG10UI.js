/* G10 stage note overlay: honest production-candidate status, without gameplay writes. */
export function installG10WorldUI({doc=document}={}){
  const host=doc.getElementById('main');if(!host)throw Error('G10_MAIN_MISSING');
  let updates=0;
  const note='🎨 G10: materiales pictóricos transparentes de resolución doble, luces y capas 2.5D. Candidatos artísticos; faltan aprobación final y pruebas en teléfono físico.';
  function sync(){
    const stage=host.querySelector('.stage');if(!stage?.querySelector('#g2-map'))return;
    const g9Note=stage.querySelector('.g9-prototype-note');
    if(g9Note && !g9Note.classList.contains('g10-prototype-note')){
      g9Note.classList.add('g10-prototype-note');g9Note.textContent=note;updates++;
    }
    const label=stage.querySelector('#g4-renderer-status');
    if(label?.textContent?.includes('arte modular G9')){
      label.textContent=label.textContent.replace('arte modular G9','materiales artísticos G10');updates++;
    }
  }
  const mo=new MutationObserver(sync);mo.observe(host,{childList:true,subtree:true});sync();
  return {diagnostics:()=>({updates,notes:host.querySelectorAll('.g10-prototype-note').length}),dispose:()=>mo.disconnect()};
}

/* G8 atmospheric UI. Only decorative text, no localStorage and no game writes. */
import {CHAPTERS} from '../data/g2-chapters.js';
const LORE=[
  'Cada color comienza con una semilla. Sigue la primera trenza.',
  'La luz revela pigmentos y nuevos caminos entre las hojas.',
  'Las flores acompañan las historias que vas descubriendo.',
  'Bajo las estrellas, cada carta guarda un pequeño secreto.',
  'La senda reconoce lo que aprendiste en tu propio jardín.',
  'El Semillero celebra tu recorrido. Tu estilo sigue siendo tuyo.'
];
export function installG8World({doc=document}={}){
  const main=doc.getElementById('main');
  if(!main)throw Error('G8_MAIN_MISSING');
  const intro=doc.querySelector('.intro');
  if(intro){intro.classList.add('g8-intro');}
  let updates=0,lastZone=-1;
  function sync(){
    const stage=main.querySelector('.stage'),track=main.querySelector('#g2-map');
    if(!stage||!track)return;
    const chapterName=stage.querySelector('#chapter-name')?.textContent||'';
    const index=CHAPTERS.findIndex(ch=>ch.name===chapterName);
    if(index<0)return;
    let plaque=stage.querySelector('.g8-zone-plaque');
    if(!plaque){
      plaque=doc.createElement('div');plaque.className='g8-zone-plaque';
      plaque.setAttribute('aria-label','Historia de la zona');
      stage.querySelector('.chapter-toolbar')?.before(plaque);
    }
    if(index!==lastZone||!plaque.textContent){
      // Text nodes only; no user data or HTML from external sources.
      plaque.replaceChildren();
      const icon=doc.createElement('span');icon.textContent=['✦','❖','✿','☾','❃','✧'][index];icon.className='g8-zone-sigil';icon.setAttribute('aria-hidden','true');
      const text=doc.createElement('span');text.textContent=LORE[index];
      plaque.append(icon,text);plaque.dataset.zone=String(index+1);updates++;
      lastZone=index;
    }
  }
  // In the current UI the entire stage is replaced on navigation; observing only main is sufficient.
  const observer=new MutationObserver(()=>{if(doc.querySelector('#g2-map'))sync()});
  observer.observe(main,{childList:true,subtree:true});sync();
  return {diagnostics:()=>({zoneUpdates:updates,activeZone:lastZone+1,plaqueCount:main.querySelectorAll('.g8-zone-plaque').length}),dispose:()=>observer.disconnect()};
}

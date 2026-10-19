import { GardenGameplay, SEEDS, CARDS, MOTIVES, MAX_LEVEL, xpFor, coinsFor, SPECIAL, STORAGE_KEY, MISSION_TARGETS } from '../gameplay/GardenGameplay.mjs';
import {CHAPTERS} from '../data/g2-chapters.js';
import {StyleAtlas} from './StyleAtlas.mjs';
import { cardArtUrl, cardImageAlt } from '../g6/CardArt.mjs';
import {SERVICE_FAMILIES,SERVICE_IDS,STORE_SITES,STAMP_COUNT,SERVICE_IG_URL,serviceById,suggestedServices} from '../data/g4-services.js';
// Single shared GardenGameplay engine; the visual scene never awards rewards directly.
export function mountGame(TrackSceneClass, FallbackSceneClass = null) {
const game = new GardenGameplay({ storage: localStorage });
const atlas = new StyleAtlas({storage:localStorage});
let scene=null, chapter=0, sceneReady=false, sceneEpoch=0;
let rendererMode="loading", rendererError=null, rendererDetail=null;
const q = id => document.getElementById(id);
let tab='track';
const names=Object.fromEntries(Object.entries(SEEDS).map(([k,v])=>[k,v.name]));
const tones=['#7bbbe5','#b99bdb','#f18cb3','#79c9b7','#55d0c1','#c4a4da'];
const ico=['❄️','🌙','🌹','🌈','💧','✨'];
const clamp=(v,max)=>Math.max(0,Math.min(max,v));
const motivation = id => MOTIVES.find(m=>m.id===id)?.label || 'Explorar diseños';
function toast(txt){const e=q('toast');e.textContent=txt;e.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>e.classList.remove('show'),2600)}
function header() {
  const s=game.snapshot(),n=game.level(),next=xpFor(n+1),base=xpFor(n);
  q('wallet').innerHTML=`<span>🪙 ${s.coins.toLocaleString('es-CL')}</span><span>💎 ${s.crystals}</span><span>🎴 ${s.unlocked.length}/6</span>`;
  q('level').textContent=`Nivel ${n}/${MAX_LEVEL}`;
  q('xpdetail').textContent=n===MAX_LEVEL?'Senda completada':`${s.xp} XP · Faltan ${next-s.xp} XP`;
  q('xpbar').style.width=`${n===MAX_LEVEL?100:clamp(Math.round(100*(s.xp-base)/(next-base)),100)}%`;
  document.querySelectorAll('[data-tab]').forEach(b=>{if(b.dataset.tab===tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
}
function garden() {
  const s=game.snapshot();
  const seeds=Object.entries(SEEDS).map(([k,v])=>`<button class="${s.chosen===k?'active':''}" data-seed="${k}" aria-pressed="${s.chosen===k}">${v.icon}<br>${v.name}<br>🪙 4</button>`).join('');
  const plots=s.plots.map((p,i)=>{
    if(!game.plotUnlocked(i))return `<div class="plot locked"><b class="marker">PARCELA ${i+1}</b><span>🔒</span><strong>Rincón secreto</strong><small>Se abre con las 6 cartas</small></div>`;
    if(!p)return `<div class="plot"><b class="marker">PARCELA ${i+1}</b><span>🌰</span><strong>Tierra disponible</strong><button class="action" data-plot="plant" data-i="${i}">Plantar ${SEEDS[s.chosen].icon}</button></div>`;
    const left=game.secondsLeft(i),ready=left===0;
    return `<div class="plot"><b class="marker">PARCELA ${i+1}</b><span>${ready?SEEDS[p.seed].icon:'🌱'}</span><strong>${names[p.seed]}</strong><small>${ready?'¡Lista para cosechar!':left+' s restantes'}</small><button class="action" data-plot="${ready?'harvest':'water'}" data-i="${i}" ${!ready&&p.watered?'disabled':''}>${ready?'Cosechar +2':'💧 '+(p.watered?'Regada':'Regar · −6 s')}</button></div>`;
  }).join('');
  const m=MISSION_TARGETS.map(t=>{
    const id=t===4?'four':'eight';return `<div class="panel" style="margin:8px 0"><strong>${t===4?'🌱 Primera floración':'🌿 Jardín en movimiento'}</strong><p class="note" style="margin:7px 0">${Math.min(t,s.daily.harvest)}/${t} cosechas · ${s.daily.claimed.includes(id)?'✓ Completada':'+60 XP y +25 monedas'}</p></div>`;
  }).join('');
  return `<section class="stage"><h2>🌱 Jardín de pigmentos</h2><p class="note">Planta semillas por 4 EcoMonedas, riega para acelerar y cosecha pigmentos. Ganas XP por las primeras 10 cosechas del día, sin penalizaciones ni rachas.</p><div class="grid2"><div class="panel" style="background:linear-gradient(#3e7348,#1d4b35)"><div class="plots">${plots}</div></div><aside><div class="panel"><strong>Elige tu semilla</strong><div class="seeds">${seeds}</div><strong>Tus pigmentos</strong><div class="bag">${Object.entries(SEEDS).map(([k,v])=>`<span>${v.icon}<br>${s.pigments[k]}</span>`).join('')}</div></div><div style="margin-top:12px"><h3>Misiones del día</h3>${m}</div></aside></div></section>`;
}
function album() {
  const s=game.snapshot();
  const cards=CARDS.map((c,i)=>{
    const have=s.unlocked.includes(c.id),can=game.canUnlock(c.id);
    const ingredients=Object.entries(c.recipe).map(([k,n])=>`${SEEDS[k].icon} ${names[k]} ×${n}`).join(' · ');
    return `<article class="card g6-fantasy-card ${have?'owned':'g6-locked'}" data-card="${c.id}"><div class="cardpic g6-card-art" style="--tone:${tones[i]}"><img class="g6-card-image" src="${cardArtUrl(c.id)}" alt="${cardImageAlt(c)}" loading="eager" decoding="async"><span class="g6-card-rarity" aria-label="Rareza épica">◆ ÉPICA</span><span class="g6-card-flair" aria-hidden="true">${ico[i]}</span>${!have?'<span class="g6-card-seal" aria-hidden="true">✦</span>':''}</div><h3>${c.name}</h3><small>${c.rarity} · Ilustración de fantasía</small><p>${c.desc}</p><div class="ingredients">${ingredients}</div><button class="action ${have?'alt':''}" data-unlock="${c.id}" ${!can?'disabled':''}>${have?'✓ Coleccionada':can?'✨ Revelar carta':'Reúne pigmentos'}</button>${have?`<button class="action alt" style="margin-top:8px" data-equip="${c.id}">🪞 ${s.equipped===c.id?'Equipada':'Vestidor'}</button>`:''}</article>`;
  }).join('');
  return `<section class="stage"><h2>🎴 Álbum Wooldreads</h2><p class="note">Las seis cartas existentes se mantienen con sus recetas originales. Completa la colección para abrir la cuarta parcela. Las imágenes y nombres son inspiración de fantasía, no modelos exactos ni disponibilidad comercial.</p><div class="cardgrid">${cards}</div></section>`;
}
function track(){
  const s=game.snapshot(),lvl=game.level(),ch=CHAPTERS[chapter];
  return `<section class="stage"><h2>🏅 Senda Premium · 2.5D PixiJS</h2>
    <p class="note">30 niveles en seis zonas del Semillero Mágico. La senda representa el progreso por XP del jardín y del álbum: pulsar nodos no concede recompensas.</p>
    <div class="chapter-toolbar"><button type="button" id="prev-chapter" ${chapter===0?'disabled':''} aria-label="Zona anterior">←</button>
      <div><small>ZONA ${chapter+1} DE 6 · ${ch.short}</small><strong id="chapter-name">${ch.name}</strong><span>${ch.levels[0]}–${ch.levels[4]} · ${s.xp}/${7192} XP</span></div>
      <button type="button" id="next-chapter" ${chapter===5?'disabled':''} aria-label="Zona siguiente">→</button></div>
    <div id="g2-map" class="map-viewport" aria-label="Senda interactiva zona ${chapter+1}"></div>
    <p id="g4-renderer-status" class="g4-renderer-status" role="status">Preparando el mapa…</p>
    <p id="node-summary" class="node-summary">Selecciona un nodo de la senda. La experiencia se consigue cultivando y descubriendo cartas.</p>
    <div class="g3-node-controls" role="group" aria-label="Información de los cinco niveles de la zona">${ch.levels.map(l=>`<button type="button" data-node="${l}" aria-label="Ver nivel ${l}">${l===lvl?'✓ ':l===lvl+1?'✦ ':''}${l}</button>`).join('')}</div>
    <p class="g3-prototype-disclaimer">🎨 Paisaje y trenza generados por código: arte provisional G3. En PixiJS se utiliza el PNG aprobado para la base de los nodos. Ninguna ilustración representa productos reales.</p>
    <div class="chapter-jump" role="group" aria-label="Seleccionar zona">${CHAPTERS.map((v,i)=>`<button type="button" data-chapter="${i}" class="${chapter===i?'active':''}" aria-pressed="${chapter===i}">${i+1} · ${v.short}</button>`).join('')}</div>
    <p class="note" style="margin-top:14px">Progreso actual: nivel ${lvl}/30. Hitos especiales en niveles 5, 8, 10, 13, 15, 18, 20, 23, 25, 28 y 30. Recompensas solo virtuales.</p>
  </section>`;
}
function nodeInfo(n) {
  scene?.focusLevel?.(n);
  const lvl=game.level(),special=SPECIAL[n];
  const status=n<=lvl?'✓ Superado':n===lvl+1?'✦ Siguiente nivel':'🔒 Bloqueado';
  q('node-summary').textContent=`${status}: Nivel ${n} · ${xpFor(n).toLocaleString('es-CL')} XP necesarios · ${n===1?'Inicio':coinsFor(n)+' EcoMonedas'}${special?' · '+special:''}.`;
}
function selectChapter(n){chapter=clamp(Number(n),5);scene?.setChapter(chapter); q('chapter-name').textContent=CHAPTERS[chapter].name;
  // Rebuild toolbar/chapters to reflect current selection and disabled arrows without recreating stage.
  render();
}
function mountTrack() {
  const host=q('g2-map');if(!host)return;
  const epoch=++sceneEpoch;
  rendererMode='loading';rendererError=null;rendererDetail=null;
  const loadScene=async(SceneClass,mode)=>{
    const candidate=new SceneClass({game,onSelect:nodeInfo});
    scene=candidate;sceneReady=false;candidate.setChapter(chapter);
    try {
      await candidate.mount(host);
      if(epoch!==sceneEpoch||scene!==candidate){candidate.destroy();return;}
      if(mode==='pixi'){
        const d=candidate.runtimeDiagnostics?.();
        if(!d||d.backend!=='webgl'||!d.approvedNodeVerified||d.nodeCount!==5||d.nodeSprites!==5||!d.actualCanvas) {
          throw Error('G4_PIXI_RUNTIME_ATTESTATION_FAILED '+JSON.stringify(d));
        }
        rendererDetail=d;
      } else rendererDetail={engine:'canvas',backend:'2d',approvedNodeVerified:false};
      sceneReady=true;rendererMode=mode;
      const status=q('g4-renderer-status');
      if(status)status.textContent=mode==='pixi'?'PixiJS + WebGL verificados · sprite aprobado · efectos ambientales G5':mode==='canvas-fallback'?'Modo de compatibilidad Canvas 2.5D: PixiJS o su recurso aprobado no se pudieron cargar.':'Vista Canvas 2.5D · laboratorio';
    }catch(error){
      if(epoch!==sceneEpoch||scene!==candidate){candidate.destroy();return;}
      console.warn('G5_RENDERER_LOAD_FAILED', mode, String(error));
      try{candidate.destroy()}catch(cleanError){console.warn('G4_RENDERER_CLEANUP',String(cleanError))}
      scene=null;host.replaceChildren();rendererError=String(error);rendererDetail=null;
      if(mode==='pixi'&&FallbackSceneClass){
        return loadScene(FallbackSceneClass,'canvas-fallback');
      }
      rendererMode='failed';sceneReady=false;
      const status=q('g4-renderer-status');if(status)status.textContent='No se pudo iniciar el mapa. El progreso continúa guardado.';
    }
  };
  void loadScene(TrackSceneClass, FallbackSceneClass?'pixi':'canvas-preview');
}
function style() {
  const s=game.snapshot(),a=atlas.snapshot(),choices=game.discover();
  const motiveButtons=MOTIVES.map(m=>`<button type="button" data-motive="${m.id}" class="${s.motive===m.id?'active':''}" aria-pressed="${s.motive===m.id}">${m.label}</button>`).join('');
  const fantasyChoices=choices.map(c=>`<div class="choice g6-inspiration"><div class="g6-choice-visual"><img src="${cardArtUrl(c.id)}" loading="eager" decoding="async" alt="${cardImageAlt(c)}"></div><h3>${c.name}</h3><p class="note">${c.desc}</p><button type="button" class="action" data-select="${c.id}">${s.selected===c.id?'✓ Elegida':'Elegir inspiración'}</button></div>`).join('');
  const chosen=CARDS.find(c=>c.id===s.selected);
  const advisory=s.motive==='cabello';
  const ordered=suggestedServices(s.motive);
  const selected=serviceById(a.selectedService);
  const families=(advisory?SERVICE_FAMILIES:ordered).map(f=>{
    const visited=a.exploredServices.includes(f.id),current=a.selectedService===f.id;
    return `<div class="g4-family ${current?'g4-chosen':''}"><span class="g4-service-icon" aria-hidden="true">${f.symbol}</span><div><small>${f.theme}</small><h3>${f.name}</h3><p>${f.detail}</p><span class="g4-explore-stamp">${visited?'✓ Exploraste esta familia':'○ Sin explorar'}</span></div><button type="button" class="action" data-service="${f.id}" aria-pressed="${current}">${current?'✓ Me interesa':'Conocer familia'}</button></div>`;
  }).join('');
  const options=['<option value="">No tengo sede definida</option>',...STORE_SITES.map(name=>`<option value="${name}" ${a.preferredSede===name?'selected':''}>${name}</option>`)].join('');
  return `<section class="stage"><p class="g4-eyebrow">G4 · Puente del juego a EcoTienda</p><h2>🪞 Descubre tu próximo estilo</h2>
    <p class="note">Juega y colecciona cartas de fantasía; cuando quieras, explora los servicios reales de EcoTienda. No hace falta completar niveles ni entregar datos para consultar.</p>
    <h3>1 · Tu Punto de Conexión</h3><p class="note">¿Qué te gustaría conseguir con tu cabello? Puedes cambiar de idea libremente.</p>
    <div class="style-options">${motiveButtons}</div>
    <h3 style="margin-top:20px">2 · Cartas mágicas: tres inspiraciones</h3><p class="note">Estos nombres y colores son de fantasía; no son trabajos reales ni aseguran un resultado.</p>
    <div class="choice-row">${fantasyChoices}</div>
    <h3 style="margin-top:22px">3 · Familias de peinados EcoTienda</h3>
    <p class="note">${advisory?'Por dudas sobre cabello corto o sensibilizado, recomendamos conversar primero con una especialista. Ningún servicio está recomendado automáticamente para tu cabello.':'Estas familias se ordenan solo por afinidad temática con tu interés. La compatibilidad, duración, precio y disponibilidad se confirman con EcoTienda.'}</p>
    <div class="g4-stamps"><strong>🌿 Atlas de estilos: ${a.exploredServices.filter(x=>SERVICE_IDS.includes(x)).length}/${STAMP_COUNT} familias exploradas</strong><small>Sellos de exploración gratuitos. No entregan XP, descuentos ni premios por comprar.</small></div>
    <div class="g4-service-grid">${families}</div>
    <div class="g4-handoff"><h3>4 · Tu consulta a EcoTienda</h3>
      <p><strong>${selected?'Te interesa '+selected.name:'Aún no has seleccionado un servicio'}</strong>${chosen?' · Inspiración mágica: '+chosen.name:''}.</p>
      <label for="g4-sede">Sede de preferencia (opcional)</label><select id="g4-sede" name="sede">${options}</select>
      <p class="note">La tienda confirmará la mejor alternativa mediante atención humana. No se consulta stock ni agenda en tiempo real desde el juego.</p>
      <div class="g4-handoff-actions"><button type="button" class="action" id="copy">📋 Copiar consulta</button><a class="action alt" target="_blank" rel="noopener noreferrer" href="${SERVICE_IG_URL}">💬 Abrir Instagram ↗</a></div>
      <p class="muted">Abrir Instagram no envía el mensaje automáticamente. Puedes copiarlo y pegarlo cuando quieras, sin registro y sin obligación de comprar.</p>
    </div></section>`;
}
function draft() {
  const s=game.snapshot(),a=atlas.snapshot(),c=CARDS.find(c=>c.id===s.selected),selected=serviceById(a.selectedService);
  return `Hola EcoTienda 🌿. En EcoTrenzas Garden exploré ${selected?.name||'sus peinados'}${c?' y me inspiró la carta de fantasía '+c.name:''}. Me interesa: ${motivation(s.motive)}.${a.preferredSede?' Preferiría la sede '+a.preferredSede+'.':''} ¿Me pueden orientar sobre un servicio real adecuado para mí, su precio vigente y la disponibilidad?`;
}
function render(){sceneEpoch++;if(scene){try{scene.destroy()}catch(error){console.warn('G4_RENDERER_CLEANUP',String(error))}scene=null;}sceneReady=false;header();q('main').innerHTML={garden,album,track,style}[tab]();if(tab==='track')mountTrack();}
function revealCard(cardId){
  const card=CARDS.find(c=>c.id===cardId);if(!card)return;
  // Visual celebration ONLY: no XP, currencies or commercial effects.
  let dialog=document.getElementById('g6-reveal');
  if(!dialog){
    dialog=document.createElement('dialog');dialog.id='g6-reveal';dialog.className='g6-reveal';
    dialog.setAttribute('aria-labelledby','g6-reveal-title');
    document.body.append(dialog);
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    dialog.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button)return;
      if(button.dataset.revealAction==='close'){dialog.close();return;}
      if(button.dataset.revealAction==='equip'){
        const id=dialog.dataset.cardId;
        if(CARDS.some(c=>c.id===id)&&game.equip(id)){
          dialog.close();tab='album';render();toast('Estilo de fantasía equipado en el vestidor virtual');
        }
      }
    });
    dialog.addEventListener('close',()=>{
      const id=dialog.dataset.cardId;
      document.querySelector(`[data-card="${id}"] button[data-equip]`)?.focus();
    });
  }
  dialog.dataset.cardId=card.id;
  dialog.innerHTML=`<div class="g6-reveal-panel"><span class="g6-reveal-crown" aria-hidden="true">✦ Carta descubierta ✦</span><div class="g6-reveal-poster"><img src="${cardArtUrl(card.id)}" alt="${cardImageAlt(card)}" decoding="async"><span class="g6-reveal-beam" aria-hidden="true"></span></div><span class="g6-reveal-rank">◆ ÉPICA · WOOLDREADS</span><h2 id="g6-reveal-title">${card.name}</h2><p>${card.desc}. La carta se añadió a tu álbum.</p><p class="g6-reveal-note">Esta ilustración es fantástica; no representa un peinado real ni un beneficio comercial.</p><div class="g6-reveal-actions"><button type="button" class="action" data-reveal-action="equip">🪞 Probar en el avatar</button><button type="button" class="action alt" data-reveal-action="close">Seguir coleccionando</button></div></div>`;
  dialog.showModal();
  dialog.querySelector('[data-reveal-action="close"]')?.focus();
}
function act(cb,success='¡Listo!') {try{const res=cb();if(res===false||res===null)toast('No se puede completar todavía');else toast(success);}catch(e){toast('Acción detenida: '+e.message)}render();}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;render()}));
q('main').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.node!==undefined){nodeInfo(Number(b.dataset.node));return;}
  if(b.id==='prev-chapter'){selectChapter(chapter-1);return;}
  if(b.id==='next-chapter'){selectChapter(chapter+1);return;}
  if(b.dataset.chapter!==undefined){selectChapter(Number(b.dataset.chapter));return;}
  if(b.dataset.seed)act(()=>game.chooseSeed(b.dataset.seed),'Semilla seleccionada');
  if(b.dataset.plot){const index=Number(b.dataset.i);const job=b.dataset.plot;
    if(job==='plant')act(()=>game.plant(index),'¡Semilla plantada!');
    if(job==='water')act(()=>game.water(index),'La semilla crecerá más rápido');
    if(job==='harvest')act(()=>game.harvest(index),'¡Cosecha realizada! XP y recompensas actualizadas');
  }
  if(b.dataset.unlock){
    const cardId=b.dataset.unlock;
    if(!game.canUnlock(cardId)){toast('Reúne pigmentos para desbloquearla');return;}
    if(!game.unlock(cardId)){toast('La carta no está disponible');return;}
    render();revealCard(cardId);
  }
  if(b.dataset.equip)act(()=>game.equip(b.dataset.equip),'Nuevo look equipado en el vestidor virtual');
  if(b.dataset.motive)act(()=>game.chooseMotive(b.dataset.motive),'Exploración personalizada');
  if(b.dataset.select)act(()=>game.select(b.dataset.select),'Inspiración elegida');
  if(b.dataset.service)act(()=>atlas.exploreService(b.dataset.service),'Familia explorada en tu atlas');
  if(b.id==='copy'){navigator.clipboard.writeText(draft()).then(()=>toast('Consulta copiada; puedes pegarla en Instagram')).catch(()=>window.prompt('Copia tu consulta:',draft()));}
});
q('main').addEventListener('change',e=>{if(e.target?.id==='g4-sede'){atlas.chooseSede(e.target.value);toast('Preferencia guardada en esta partida local');}});
q('import').addEventListener('click',()=>{
  if(!confirm('¿Importar una COPIA del progreso V0.3.1/V0.3 en este laboratorio? No se alterará la partida original y no se sobrescribirán partidas G1 existentes.'))return;
  try{const from=game.copyFromLegacy();toast(from?'Copia importada de '+from:'No se encontró partida compatible');render();}catch(e){toast(e.message)}
});
q('reset').addEventListener('click',()=>{
  if(!confirm('¿Reiniciar solamente el laboratorio G4.2? Las partidas V0.2, V0.3 y V0.3.1 se preservan.'))return;
  localStorage.removeItem(STORAGE_KEY);location.reload();
});
setInterval(()=>{if(tab==='garden')render();},1000);
render();

window.__GARDEN_G3_TEST__ = {
  ready:true,
  snapshot:()=>({level:game.level(),xp:game.snapshot().xp,coins:game.state.coins,unlocked:game.state.unlocked.length,chapter,sceneReady,trackMounted:Boolean(scene),rendererMode,rendererError,rendererDetail}),
  showTrack:()=>{tab='track';render();},
  // Lab-only helper; never exposed on actual commercial integrations.
  reset:()=>{localStorage.removeItem(STORAGE_KEY);location.reload();}
};
window.__GARDEN_G4_TEST__=window.__GARDEN_G3_TEST__;
} // mountGame

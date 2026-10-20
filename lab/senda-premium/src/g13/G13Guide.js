/** Goal-driven play without a second currency or a second source of game state. */
import {CARDS, SEEDS, xpFor, MAX_LEVEL} from '../gameplay/GardenGameplay.mjs';
import {G13_GOAL_KEY,validGoal,computeCardPlan,firstEmptyPlot} from './G13Planner.mjs';
const esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function createG13Guide({storage=localStorage,doc=document}={}){
 let goal='';try{goal=validGoal(storage?.getItem(G13_GOAL_KEY)||'');}catch{}
 let ctx=null, mounted=false, actions=0;
 function save(id){goal=validGoal(id);try{if(goal)storage?.setItem(G13_GOAL_KEY,goal);else storage?.removeItem(G13_GOAL_KEY);}catch{}}
 function onClick(e){
   const button=e.target.closest?.('[data-g13]');if(!button||!ctx)return;
   e.preventDefault();e.stopPropagation();
   const job=button.dataset.g13,game=ctx.game;
   if(job==='target') {save(button.dataset.card);ctx.render();ctx.toast('Objetivo de colección guardado');actions++;}
   else if(job==='clear') {save('');ctx.render();actions++;}
   else if(job==='garden') {doc.querySelector('[data-tab="garden"]')?.click();}
   else if(job==='album') {doc.querySelector('[data-tab="album"]')?.click();}
   else if(job==='focus') {doc.querySelector(`[data-node="${game.level()+1}"]`)?.click();}
   else if(job==='plant') {
      const plan=computeCardPlan(game.snapshot(),goal),i=firstEmptyPlot(game);
      if(!plan?.best||i<0||game.state.coins<4){ctx.toast('No hay una parcela libre o suficientes EcoMonedas');return;}
      // One player-initiated planting; obey the ORIGINAL 4-coin engine contract.
      game.chooseSeed(plan.best.seed);
      if(game.plant(i,plan.best.seed)) {actions++;ctx.toast('Semilla plantada · −4 EcoMonedas · sin recompensas extra');ctx.render();}
      else ctx.toast('No se pudo plantar');
   }
 }
 function decorate(next){
   ctx=next;const host=doc.getElementById('main');if(!host)return;
   if(!mounted){host.addEventListener('click',onClick);mounted=true;}
   const stage=host.querySelector('.stage');if(!stage)return;
   const s=next.game.snapshot();
   if(next.tab==='album'){
     for(const card of CARDS){
       const el=stage.querySelector(`[data-card="${card.id}"]`);if(!el)continue;
       const own=s.unlocked.includes(card.id),selected=goal===card.id;
       const button=doc.createElement('button');button.type='button';button.dataset.g13='target';button.dataset.card=card.id;
       button.className='g13-goal-btn';button.setAttribute('aria-pressed',String(selected));
       button.textContent=selected?'★ Objetivo seleccionado':own?'✓ Revisar receta':'☆ Convertir en objetivo';
       el.append(button);
     }
     stage.insertAdjacentHTML('afterbegin',`<div class="g13-banner"><strong>🎯 Elige tu carta favorita</strong><span>Planifica pigmentos y cultivos. La colección sigue usando sus recetas originales, sin monedas ni XP adicionales.</span></div>`);
   } else if(next.tab==='garden'){
     const plan=computeCardPlan(s,goal);
     let html='';
     if(!plan){html='<strong>🎯 Tu próximo descubrimiento</strong><p>Selecciona una carta Wooldreads para descubrir qué pigmentos conviene cultivar.</p><button type="button" data-g13="album">🎴 Elegir carta en el Álbum</button>';}
     else {
       const entries=plan.missing.map(m=>`<li>${SEEDS[m.seed].icon} ${SEEDS[m.seed].name}: ${m.owned}/${m.required}${m.planted?` · ${m.planted} cultivo(s) en camino`:''}</li>`).join('');
       const slots=firstEmptyPlot(next.game);
       const plant=plan.best&&slots>=0&&s.coins>=4;
       let action=plan.unlocked?'✓ Ya forma parte de tu colección':plan.ready?'🎴 ¡Receta completa! Puedes revelar la carta':plan.plantedOnly?'🌱 Los cultivos actuales pueden completar la receta':'🌱 Consigue los pigmentos faltantes';
       html=`<strong>🎯 Objetivo: ${esc(plan.card.name)}</strong><ul>${entries}</ul><p>${action}</p><div class="g13-actions">${plant?`<button type="button" data-g13="plant">${SEEDS[plan.best.seed].icon} Plantar ${SEEDS[plan.best.seed].name} · −4 🪙</button>`:''}<button type="button" data-g13="album">🎴 Ver álbum</button><button type="button" data-g13="clear">Cambiar objetivo</button></div>`;
     }
     const div=doc.createElement('section');div.className='g13-guide';div.setAttribute('aria-label','Plan de cultivo de la colección');div.innerHTML=html;
     stage.querySelector('.grid2')?.before(div);
   }else if(next.tab==='track'){
     const level=next.game.level();const nextLevel=Math.min(MAX_LEVEL,level+1);
     const plan=computeCardPlan(s,goal);
     const focus=nextLevel<=next.chapter*5+5&&nextLevel>next.chapter*5;
     stage.insertAdjacentHTML('beforeend',`<section class="g13-guide g13-track-guide"><strong>✨ Próxima aventura</strong><p>Nivel ${level}/30 · ${level===MAX_LEVEL?'¡Senda completa!':`Faltan ${Math.max(0,xpFor(nextLevel)-s.xp)} XP para el nivel ${nextLevel}`}. ${plan?`Tu objetivo de colección es ${esc(plan.card.name)}.`:'Puedes elegir una carta objetivo en el Álbum.'}</p><div class="g13-actions">${focus&&level<MAX_LEVEL?'<button type="button" data-g13="focus">🎯 Enfocar siguiente nivel</button>':''}<button type="button" data-g13="garden">🌱 Planificar cultivo</button><button type="button" data-g13="album">🎴 Álbum</button></div></section>`);
   }
 }
 return {decorate, diagnostics:()=>({goal,actions,active:mounted,hasSeparateEconomy:false}), dispose:()=>{if(mounted)doc.getElementById('main')?.removeEventListener('click',onClick);mounted=false;}};
}

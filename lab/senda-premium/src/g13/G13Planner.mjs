/** G13 — deterministic collection planning. Pure read-only selectors. */
import {CARDS, SEEDS} from '../gameplay/GardenGameplay.mjs';
export const G13_GOAL_KEY='ecotrenzas-g13-card-goal-v1';
export function validGoal(id){return CARDS.some(c=>c.id===id)?id:'';}
export function computeCardPlan(snapshot,cardId){
 const card=CARDS.find(c=>c.id===cardId);
 if(!card)return null;
 const plots=Array.isArray(snapshot.plots)?snapshot.plots:[];
 const pigment=snapshot.pigments||{};
 const missing=Object.entries(card.recipe).map(([seed,count])=>{
   const owned=Number(pigment[seed])||0;
   const planted=plots.filter(p=>p?.seed===seed).length;
   const deficit=Math.max(0,count-owned);
   const remainingAfterGrowing=Math.max(0,deficit-2*planted);
   return {seed,required:count,owned,planted,deficit,remainingAfterGrowing,harvests:Math.ceil(remainingAfterGrowing/2)};
 });
 const ready=missing.every(x=>x.deficit===0);
 const plantedOnly=!ready&&missing.every(x=>x.remainingAfterGrowing===0);
 // Prioritize unfulfilled recipe quantity, then fewer growth seconds.
 const best=missing.filter(x=>x.remainingAfterGrowing>0).sort((a,b)=>b.remainingAfterGrowing-a.remainingAfterGrowing || SEEDS[a.seed].duration-SEEDS[b.seed].duration)[0]||null;
 const unlocked=Array.isArray(snapshot.unlocked)&&snapshot.unlocked.includes(cardId);
 return {card,missing,ready,plantedOnly,best,unlocked,missingTotal:missing.reduce((a,x)=>a+x.deficit,0),harvests:missing.reduce((a,x)=>a+x.harvests,0)};
}
export function firstEmptyPlot(game){for(let i=0;i<4;i++)if(game.plotUnlocked(i)&&!game.state.plots[i])return i;return -1;}

import { CARDS, GardenGameplay } from '../src/gameplay/GardenGameplay.mjs';
import { cardArtUrl, cardImageAlt } from '../src/g6/CardArt.mjs';
function assert(ok,msg){if(!ok)throw Error(msg)}
assert(CARDS.length===6,'Expected six historical cards');
for(const card of CARDS){
  assert(cardArtUrl(card.id)===`assets/cards/${card.id}.webp`,'Card asset path mismatch');
  assert(cardImageAlt(card).includes('fantástica'),'Missing art disclaimer');
}
let rejected=false;try{cardArtUrl('unexpected-card')}catch{rejected=true}
assert(rejected,'Unknown asset IDs must be refused');
let clock=Date.now();const game=new GardenGameplay({now:()=>clock});
game.state.pigments.azul=2;game.state.pigments.violeta=1;
assert(game.unlock('niebla_invernal'),'Seeded first discovery did not unlock');
const before=JSON.stringify(game.snapshot());
assert(!game.unlock('niebla_invernal'),'Unlock must be one-time');
assert(JSON.stringify(game.snapshot())===before,'Second unlock modified economy');
console.log('G6_CARD_CORE_GREEN: 6 original arts / whitelist / one-time unlock / no economy duplication');

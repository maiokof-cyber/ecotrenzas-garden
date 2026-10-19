/* Only approved existing fantasy card IDs and repository artwork. No external images or product claims. */
import { CARDS } from '../gameplay/GardenGameplay.mjs';
const CARD_IDS=new Set(CARDS.map(card=>card.id));
export const CARD_ASSET_ROOT='assets/cards';
export function cardArtUrl(id){
  if(!CARD_IDS.has(id))throw new Error('Carta de fantasía desconocida');
  return `${CARD_ASSET_ROOT}/${id}.webp`;
}
export function cardImageAlt(card){
  if(!CARD_IDS.has(card?.id))throw new Error('Carta de fantasía desconocida');
  return `Ilustración fantástica de ${card.name}, inspiración visual no comercial`;
}

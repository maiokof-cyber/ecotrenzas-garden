/* G2 presentation only. Gameplay XP/economy remains in GardenGameplay.mjs. */
export const CHAPTERS = Object.freeze([
  {id:'brote',name:'Bosque del Primer Brote',short:'El despertar',atmosphere:['#d9eea2','#81b273','#305b41'],levels:[1,2,3,4,5]},
  {id:'pigmentos',name:'Laguna de Pigmentos',short:'Colores vivos',atmosphere:['#b7e1d6','#569999','#28556a'],levels:[6,7,8,9,10]},
  {id:'flores',name:'Sendero de las Flores',short:'Trenzas florecidas',atmosphere:['#f5d6bd','#b98293','#4c5b54'],levels:[11,12,13,14,15]},
  {id:'bruma',name:'Jardín de la Bruma',short:'Magia nocturna',atmosphere:['#d5b6de','#76679f','#2d3b63'],levels:[16,17,18,19,20]},
  {id:'bosque',name:'Santuario de las Fibras',short:'Raíces y diseños',atmosphere:['#bfe2a0','#678b6a','#244c42'],levels:[21,22,23,24,25]},
  {id:'corona',name:'Corona del Semillero',short:'La senda legendaria',atmosphere:['#ecd9a7','#8b86b4','#39345d'],levels:[26,27,28,29,30]}
]);
export const NODE_LAYOUT = Object.freeze([
  {x:105,y:356},{x:295,y:288},{x:478,y:338},{x:667,y:263},{x:848,y:320}
]);
export const nodesForChapter = chapter => CHAPTERS[chapter].levels.map((level,i)=>({level,...NODE_LAYOUT[i],epic:level%5===0}));

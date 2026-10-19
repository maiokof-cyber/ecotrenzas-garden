/** EcoTienda G4: names/locations from store project; not a price or availability source.
 * MATCHES are editorial discovery hints only, never technical hair eligibility.
 * Update actual service prices/photos/descriptions from commercial authority before publishing.
 */
export const SERVICE_FAMILIES = Object.freeze([
  {id:'minibraids',name:'MiniBraids',symbol:'🌾',theme:'Trenzas',detail:'Explora ejemplos de esta familia de trenzados con asesoría personalizada.',interests:['naturalidad','practicidad','largo']},
  {id:'ecobraids',name:'EcoBraids',symbol:'🌿',theme:'EcoTienda',detail:'Conoce opciones de trenzado, acabados y colores disponibles con el equipo.',interests:['largo','volumen','color']},
  {id:'ecodreads',name:'EcoDreads',symbol:'🍃',theme:'Dreads',detail:'Descubre esta línea y pregunta por el proceso, el cuidado y la personalización.',interests:['identidad','practicidad','explorar']},
  {id:'gypsy',name:'Gypsy',symbol:'🌺',theme:'Expresión',detail:'Explora esta familia de peinados y consulta sus opciones reales de diseño.',interests:['identidad','volumen','color']},
  {id:'ecomix',name:'EcoMix',symbol:'🎨',theme:'Combinaciones',detail:'Descubre esta familia y pregunta al equipo por mezclas y alternativas.',interests:['color','identidad','explorar']}
]);
export const SERVICE_IDS = Object.freeze(SERVICE_FAMILIES.map(s=>s.id));
export const STORE_SITES = Object.freeze(['Ñuñoa','Rancagua','Viña del Mar']);
export const STAMP_COUNT = SERVICE_IDS.length;
export const SERVICE_IG_URL = 'https://www.instagram.com/ecotienda_trenzasydreads/';
export function serviceById(id){ return SERVICE_FAMILIES.find(x=>x.id===id)||null; }
export function suggestedServices(motive){
  // Human consultation must come first for concerns about hair condition.
  if(motive==='cabello')return [];
  if(!motive||motive==='explorar')return SERVICE_FAMILIES;
  return [...SERVICE_FAMILIES].sort((a,b)=>Number(b.interests.includes(motive))-Number(a.interests.includes(motive)));
}

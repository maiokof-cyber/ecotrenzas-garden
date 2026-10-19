/** G4 local exploration notebook only – not CRM, leads, purchases or game economy.
 * Separating storage prevents the discovery flow from rewriting the G3.1 saved game.
 */
import {SERVICE_IDS,STORE_SITES} from '../data/g4-services.js';
export const G4_ATLAS_STORAGE_KEY='ecotrenzas-g4-style-atlas-v1';
export class StyleAtlas {
  constructor({storage=null}={}){
    this.storage=storage;
    let raw=null;
    try{raw=JSON.parse(storage?.getItem(G4_ATLAS_STORAGE_KEY)||'null');}catch{}
    this.state={version:1,
      exploredServices:Array.isArray(raw?.exploredServices)?[...new Set(raw.exploredServices.filter(x=>SERVICE_IDS.includes(x)))]:[],
      selectedService:SERVICE_IDS.includes(raw?.selectedService)?raw.selectedService:'',
      preferredSede:STORE_SITES.includes(raw?.preferredSede)?raw.preferredSede:''};
  }
  snapshot(){return JSON.parse(JSON.stringify(this.state));}
  persist(){this.storage?.setItem(G4_ATLAS_STORAGE_KEY,JSON.stringify(this.state));}
  exploreService(id){if(!SERVICE_IDS.includes(id))return false;
    if(!this.state.exploredServices.includes(id))this.state.exploredServices.push(id);
    this.state.selectedService=id;this.persist();return true;}
  chooseSede(id){if(id!==''&&!STORE_SITES.includes(id))return false;
    this.state.preferredSede=id;this.persist();return true;}
}

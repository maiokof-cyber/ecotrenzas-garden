/* EcoTrenzas Garden / Senda Premium — Gameplay Gate G1
 * Port verified against V0.2 / V0.3 / V0.3.1. Client-only simulation, no real benefits.
 * This module has NO browser dependency: state transitions are testable in Node.
 */
export const VERSION = 1;
export const MAX_LEVEL = 30;
export const MAX_XP = 7192;
export const STORAGE_KEY = 'ecotrenzas-senda-premium-gameplay-v1';
export const LEGACY_KEYS = ['ecotrenzas-garden-v0.3.1-preview', 'ecotrenzas-garden-v0.3-preview'];
export const SEEDS = Object.freeze({
  rosa: { name: 'Rosa', icon: '🌺', duration: 14000 },
  violeta: { name: 'Violeta', icon: '🪻', duration: 16500 },
  azul: { name: 'Azul', icon: '💠', duration: 18000 },
  menta: { name: 'Menta', icon: '🌿', duration: 20000 },
  dorado: { name: 'Dorado', icon: '🌼', duration: 22000 }
});
export const CARDS = Object.freeze([
  { id:'niebla_invernal', name:'Niebla Invernal', desc:'Azules profundos y sombras de invierno', recipe:{azul:2,violeta:1}, motive:['naturalidad','practicidad'], rarity:'Épica' },
  { id:'niebla_lavanda', name:'Niebla Lavanda', desc:'Degradado nocturno hacia lavanda', recipe:{violeta:2,rosa:1}, motive:['color','identidad'], rarity:'Épica' },
  { id:'rosa_tentacion', name:'Rosa Tentación', desc:'Chocolate, frambuesa y rosa intenso', recipe:{rosa:3,dorado:1}, motive:['color','identidad'], rarity:'Épica' },
  { id:'algodon_tentador', name:'Algodón Tentador', desc:'Caramelo, turquesa y violeta en armonía', recipe:{azul:2,dorado:2,violeta:1}, motive:['color','volumen'], rarity:'Épica' },
  { id:'corriente_boreal', name:'Corriente Boreal', desc:'Azul y turquesa con destellos verdes', recipe:{azul:2,menta:2}, motive:['largo','practicidad'], rarity:'Épica' },
  { id:'luna_malva', name:'Luna Malva', desc:'Bruma violeta, plata y magia lunar', recipe:{violeta:2,menta:1,rosa:1}, motive:['identidad','naturalidad'], rarity:'Épica' }
]);
export const MOTIVES = Object.freeze([
  { id:'largo', label:'Ganar largo' }, { id:'volumen', label:'Dar volumen' },
  { id:'color', label:'Probar colores sin tinturas' }, { id:'practicidad', label:'Ganar tiempo cada mañana' },
  { id:'naturalidad', label:'Lograr un efecto natural' }, { id:'identidad', label:'Expresar mi identidad' },
  { id:'cabello', label:'Conversar sobre cabello corto o sensibilizado' }, { id:'explorar', label:'Explorar diseños' }
]);
// EXACT historic V0.3 formulas (keep intact until economy review).
export const xpFor = n => n <= 1 ? 0 : (n-1)*80 + 6*(n-2)*(n-1);
export const coinsFor = n => n <= 1 ? 0 : n <= 5 ? 40 : n <= 10 ? 60 : n <= 15 ? 70 : n <= 20 ? 80 : n <= 25 ? 90 : 100;
export const SPECIAL = Object.freeze({
  5:'Macetero del bosque',8:'Marco botánico',10:'Cristal + Bosque nocturno',
  13:'Farol del jardín',15:'Marco boreal',18:'Sendero decorativo',
  20:'Cristal + tema nocturno',23:'Fuente ornamental',25:'Aura del avatar',
  28:'Arco de hojas',30:'Cristal + insignia final'
});
export const MISSION_TARGETS = Object.freeze([4,8]);
const valid = (n, max=100000) => Number.isFinite(Number(n)) ? Math.min(max,Math.max(0,Math.floor(Number(n)))) : 0;
const unique = list => [...new Set(list)];
export const dayKey = ms => { const d=new Date(ms); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export function initialState(now=Date.now()) {
  return {version:VERSION, coins:48, crystals:0, xp:0, paidLevel:1,
    pigments:Object.fromEntries(Object.keys(SEEDS).map(k=>[k,0])),
    plots:[null,null,null,null], chosen:'rosa', unlocked:[], equipped:null,
    achievements:{}, daily:{day:dayKey(now),harvest:0,claimed:[]},
    motive:'', favorites:[], selected:'', source:'new', lastAction:null};
}
function normalize(raw, now) {
  const fresh=initialState(now);
  if (!raw || raw.version !== VERSION || !Array.isArray(raw.plots) || !Array.isArray(raw.unlocked)) return fresh;
  const s={...fresh,...raw};
  s.coins=valid(raw.coins,1e7); s.crystals=valid(raw.crystals,99); s.xp=valid(raw.xp,MAX_XP);
  s.paidLevel=Math.min(MAX_LEVEL,Math.max(1,valid(raw.paidLevel,MAX_LEVEL)));
  s.pigments=Object.fromEntries(Object.keys(SEEDS).map(k=>[k,valid(raw.pigments?.[k],10000)]));
  s.chosen=SEEDS[raw.chosen]?raw.chosen:'rosa';
  const ids=new Set(CARDS.map(c=>c.id));
  s.unlocked=unique(raw.unlocked.filter(id=>ids.has(id)));
  s.equipped=s.unlocked.includes(raw.equipped)?raw.equipped:null;
  s.plots=[0,1,2,3].map(i=>{
    const p=raw.plots[i]; return p && SEEDS[p.seed] && Number.isFinite(Number(p.planted)) && Number(p.planted)>0
      ? {seed:p.seed,planted:Number(p.planted),boost:valid(p.boost,60000),watered:!!p.watered} : null;
  });
  s.achievements={}; for(const k of ['firstHarvest','firstCard','fullAlbum','firstOutfit'])if(raw.achievements?.[k])s.achievements[k]=true;
  s.daily=raw.daily?.day===dayKey(now)?{
    day:dayKey(now),harvest:valid(raw.daily?.harvest,10000),
    claimed:unique((Array.isArray(raw.daily?.claimed)?raw.daily.claimed:[]).filter(x=>['four','eight'].includes(x)))
  }:fresh.daily;
  s.motive=MOTIVES.some(m=>m.id===raw.motive)?raw.motive:'';
  s.favorites=unique((Array.isArray(raw.favorites)?raw.favorites:[]).filter(x=>ids.has(x))).slice(0,3);
  s.selected=ids.has(raw.selected)?raw.selected:'';
  s.source=typeof raw.source==='string'?raw.source:'new';
  return s;
}
export function migrateLegacy(raw, now=Date.now(), source='preview') {
  // READ-COPY ONLY: never mutate the V0.3.1/V0.3 localStorage key.
  if (!raw || raw.version!==2 || !Array.isArray(raw.plots) || !Array.isArray(raw.unlocked)) throw new Error('Formato histórico incompatible; migración detenida');
  const p=raw.progress && raw.progress.version===1?raw.progress:null;
  const draft={...initialState(now),coins:raw.coins,crystals:p?.crystals||0,
    xp:p?.xp??Math.min(MAX_XP,raw.unlocked.length*60),paidLevel:p?.paidLevel??1,
    pigments:raw.pigments,plots:raw.plots,chosen:raw.chosen,unlocked:raw.unlocked,
    equipped:raw.equipped,achievements:p?.achievements||{},daily:p?.daily||{},source};
  return normalize(draft,now);
}
export class GardenGameplay {
  constructor({now=()=>Date.now(),storage=null,state=null}={}) {
    this.now=now; this.storage=storage;
    let raw=state;
    if(raw==null && storage){try{raw=JSON.parse(storage.getItem(STORAGE_KEY)||'null');}catch{/* use fresh */}}
    this.state=normalize(raw,this.now());
  }
  persist() { if(this.storage)this.storage.setItem(STORAGE_KEY,JSON.stringify(this.state)); }
  snapshot() { this.rollDay();return JSON.parse(JSON.stringify(this.state)); }
  level() { let level=1;while(level<MAX_LEVEL&&this.state.xp>=xpFor(level+1))level++;return level; }
  rollDay() {
    const d=dayKey(this.now());if(this.state.daily.day!==d){this.state.daily={day:d,harvest:0,claimed:[]};this.persist();}
  }
  awardXp(amount) {
    if(!Number.isInteger(amount)||amount<=0)throw Error('XP inválida');
    this.state.xp=Math.min(MAX_XP,this.state.xp+amount);
    const leveled=[];
    while(this.state.paidLevel<this.level()){
      const l=++this.state.paidLevel;this.state.coins+=coinsFor(l);
      if([10,20,30].includes(l))this.state.crystals++;
      leveled.push({level:l,coins:coinsFor(l),crystal:[10,20,30].includes(l)});
    }
    this.persist();return leveled;
  }
  achievement(id) {
    const config={firstHarvest:{xp:30},firstCard:{xp:30},fullAlbum:{crystal:1},firstOutfit:{xp:30}}[id];
    if(!config||this.state.achievements[id])return false;
    this.state.achievements[id]=true;
    if(config.crystal)this.state.crystals+=config.crystal;
    if(config.xp)this.awardXp(config.xp);
    this.persist();return true;
  }
  chooseSeed(id) { if(!SEEDS[id])return false;this.state.chosen=id;this.persist();return true; }
  plotUnlocked(index) {return Number.isInteger(index)&&index>=0&&index<4&&(index<3||this.state.unlocked.length===CARDS.length);}
  plant(index,seed=this.state.chosen) {
    if(!this.plotUnlocked(index)||this.state.plots[index]||!SEEDS[seed]||this.state.coins<4)return false;
    this.state.coins-=4;this.state.plots[index]={seed,planted:this.now(),boost:0,watered:false};this.persist();return true;
  }
  water(index) {
    const p=this.state.plots[index];if(!p||p.watered||this.isReady(index))return false;
    p.watered=true;p.boost=Math.min(60000,p.boost+6000);this.persist();return true;
  }
  isReady(index) {
    const p=this.state.plots[index];return Boolean(p&&this.now()-p.planted+p.boost>=SEEDS[p.seed].duration);
  }
  secondsLeft(index) {const p=this.state.plots[index];return !p?0:Math.max(0,Math.ceil((SEEDS[p.seed].duration-this.now()+p.planted-p.boost)/1000));}
  harvest(index) {
    this.rollDay();if(!this.isReady(index))return null;
    const p=this.state.plots[index];
    const coins=this.state.daily.harvest<10?9:4;
    this.state.coins+=coins;this.state.pigments[p.seed]+=2;this.state.plots[index]=null;
    this.state.daily.harvest++;
    const earnedXp=this.state.daily.harvest<=10?12:0;
    if(earnedXp)this.awardXp(earnedXp);
    this.achievement('firstHarvest');
    const missions=[];
    for(const t of MISSION_TARGETS){const id=t===4?'four':'eight';
      if(this.state.daily.harvest>=t&&!this.state.daily.claimed.includes(id)){
        this.state.daily.claimed.push(id);this.state.coins+=25;this.awardXp(60);missions.push(id);
      }
    }
    this.state.lastAction='harvest';this.persist();return {seed:p.seed,pigments:2,coins,xp:earnedXp,missions};
  }
  canUnlock(id) {const c=CARDS.find(c=>c.id===id);return Boolean(c&&!this.state.unlocked.includes(id)&&Object.entries(c.recipe).every(([k,v])=>this.state.pigments[k]>=v));}
  unlock(id) {
    if(!this.canUnlock(id))return false;
    const c=CARDS.find(c=>c.id===id);
    for(const [k,v] of Object.entries(c.recipe))this.state.pigments[k]-=v;
    this.state.unlocked.push(id);
    this.awardXp(60);this.achievement('firstCard');
    if(this.state.unlocked.length===CARDS.length)this.achievement('fullAlbum');
    this.state.lastAction='unlock';this.persist();return true;
  }
  equip(id) {if(!this.state.unlocked.includes(id))return false;this.state.equipped=id;this.achievement('firstOutfit');this.persist();return true;}
  chooseMotive(id) {if(!MOTIVES.some(m=>m.id===id))return false;this.state.motive=id;this.persist();return true;}
  select(id) {if(!CARDS.some(c=>c.id===id))return false;this.state.selected=id;this.persist();return true;}
  favorite(id) {if(!CARDS.some(c=>c.id===id))return false;
    const a=this.state.favorites;a.includes(id)?this.state.favorites=a.filter(x=>x!==id):this.state.favorites=[...a.filter(x=>x!==id),id].slice(-3);this.persist();return true;
  }
  discover(motive=this.state.motive) {return [...CARDS].sort((a,b)=>Number(b.motive.includes(motive))-Number(a.motive.includes(motive))).slice(0,3);}
  copyFromLegacy(storage=this.storage) {
    if(!storage)throw Error('Sin almacenamiento');
    if(storage.getItem(STORAGE_KEY))throw Error('Ya existe una partida G1; no se sobrescribe');
    for(const key of LEGACY_KEYS){const text=storage.getItem(key);if(!text)continue;
      const parsed=JSON.parse(text);this.state=migrateLegacy(parsed,this.now(),key);this.persist();return key;
    }
    return null;
  }
}

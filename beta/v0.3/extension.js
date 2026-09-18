/* EcoTrenzas Garden V0.3 — laboratorio local. No integra Instagram ni CRM. */
(()=>{'use strict';
const game=window.__ecogame;
if(!game)throw Error('No está disponible la base de EcoTrenzas V0.2');
const s=game.state;
const PRICE={seed:4,harvest:9,harvestAfterCap:4,harvestDailyLimit:10,dailyMissionCoins:25};
const special={5:'🪴 Macetero del bosque',8:'🌿 Marco botánico',10:'💎 Cristal + Bosque nocturno',13:'🏮 Farol del jardín',15:'🖼️ Marco boreal',18:'🪨 Sendero decorativo',20:'💎 Cristal + tema nocturno',23:'⛲ Fuente ornamental',25:'✨ Aura del avatar',28:'🌿 Arco de hojas',30:'💎 Cristal + insignia final'};
const achievementList=[
{id:'firstHarvest',icon:'🌱',name:'Primer brote',detail:'Cosecha una planta',xp:30},
{id:'firstCard',icon:'🎴',name:'Primer descubrimiento',detail:'Desbloquea tu primera carta Wooldreads',xp:30},
{id:'fullAlbum',icon:'🏆',name:'Coleccionista Wooldreads',detail:'Consigue las seis cartas',crystal:1},
{id:'firstOutfit',icon:'🪞',name:'Tu primer look',detail:'Equipa un Wooldread en tu avatar',xp:30}
];
const xpFor=n=>n<=1?0:(n-1)*80+6*(n-2)*(n-1);
const coinsFor=n=>n<=1?0:n<=5?40:n<=10?60:n<=15?70:n<=20?80:n<=25?90:100;
const day=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fresh=()=>({xp:0,paidLevel:1,crystals:0,achievements:{},daily:{day:day(),harvest:0,claimed:[]},version:1});
let p=s.progress;
if(!p||p.version!==1||!Number.isFinite(p.xp)||!Number.isFinite(p.paidLevel)||!p.achievements){
 p=fresh();p.xp=s.unlocked.length*60;
 if(s.unlocked.length){p.achievements.firstCard=true}
 if(s.unlocked.length===6){p.achievements.fullAlbum=true;p.crystals=1}
 if(s.equipped){p.achievements.firstOutfit=true}
 s.progress=p;game.save();
}
p.xp=Math.max(0,Math.min(7192,Math.floor(p.xp)));
p.paidLevel=Math.max(1,Math.min(30,Math.floor(p.paidLevel)));
p.crystals=Math.max(0,Math.min(99,Math.floor(Number(p.crystals)||0)));
if(!p.daily||p.daily.day!==day())p.daily={day:day(),harvest:0,claimed:[]};
if(!Array.isArray(p.daily.claimed))p.daily.claimed=[];
function refreshDay(){if(p.daily.day!==day()){p.daily={day:day(),harvest:0,claimed:[]};game.save()}}
const level=()=>{let n=1;while(n<30&&p.xp>=xpFor(n+1))n++;return n};
function payLevels(){while(p.paidLevel<level()){const n=++p.paidLevel;s.coins+=coinsFor(n);if(n===10||n===20||n===30)p.crystals++;}game.save()}
function xp(amount){p.xp=Math.min(7192,p.xp+amount);payLevels();renderExtra()}
function achieve(id){if(p.achievements[id])return false;const a=achievementList.find(x=>x.id===id);if(!a)return false;p.achievements[id]=true;if(a.crystal)p.crystals+=a.crystal;if(a.xp)p.xp=Math.min(7192,p.xp+a.xp);payLevels();game.showToast('¡Logro conseguido! '+a.icon+' '+a.name);return true}
function onHarvest(){refreshDay();p.daily.harvest++;if(p.daily.harvest<=PRICE.harvestDailyLimit)xp(12);if(!p.achievements.firstHarvest)achieve('firstHarvest');for(const [target,id] of [[4,'four'],[8,'eight']]){if(p.daily.harvest>=target&&!p.daily.claimed.includes(id)){p.daily.claimed.push(id);s.coins+=PRICE.dailyMissionCoins;xp(60)}}game.save();renderExtra()}
function onUnlock(){xp(60);if(s.unlocked.length===1)achieve('firstCard');if(s.unlocked.length===6)achieve('fullAlbum');game.save();renderExtra()}
function onEquip(){if(!p.achievements.firstOutfit)achieve('firstOutfit');game.save();renderExtra()}
function harvestCoins(){refreshDay();return p.daily.harvest<PRICE.harvestDailyLimit?PRICE.harvest:PRICE.harvestAfterCap}
window.__ecov03={onHarvest,onUnlock,onEquip,harvestCoins,onTab(name){document.querySelectorAll('[data-v3-screen]').forEach(x=>x.classList.remove('active'));document.querySelectorAll('[data-v3-tab]').forEach(x=>{x.classList.remove('active');x.removeAttribute('aria-current')})}};
payLevels();
const style=document.createElement('style');style.textContent=`.v3notice{margin:12px 0;background:#fff0c8;border:1px solid #dfc277;border-radius:13px;padding:11px 13px;font-size:12px;font-weight:750;color:#725329}.v3header{margin:12px 17px 0;padding:13px;background:#e9f5e5;border:1px solid #d0e4c9;border-radius:14px}.v3header button{float:right}.v3xp{height:9px;background:#c8d9bf;border-radius:99px;overflow:hidden;margin-top:8px}.v3xp i{height:100%;background:#348b61;display:block}.v3gr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.v3level{border:1px solid #e1d9c6;border-radius:12px;padding:9px;background:#fffdf4;font-size:11px}.v3level.done{border-color:#60a57c;background:#e8f4e5}.v3level.next{border:2px solid #ba965c;background:#fff4d9}.v3badge{display:inline-block;border-radius:99px;background:#e8e3d0;padding:3px 8px;font-size:10px;font-weight:800}.v3ach{display:flex;gap:11px;align-items:center;border:1px solid #e2dfc9;border-radius:13px;padding:13px;background:#fffdfa;margin:8px 0}.v3ach.locked{opacity:.68}.v3ach span.icon{font-size:29px}.v3ach strong{display:block}.v3ach small{display:block;color:#6c766d}.v3mission{background:#eff3e1;border-radius:12px;padding:11px;margin-bottom:8px}.v3mission .bar{width:100%;background:#d5dfc9;margin:7px 0}.v3mission .bar i{background:#4a9c70}@media(max-width:420px){.v3gr{grid-template-columns:repeat(2,minmax(0,1fr))}.nav .tab{font-size:11px;padding:6px 3px}.v3header button{float:none;display:block;margin-top:8px}}`;
document.head.appendChild(style);
const wrap=document.querySelector('.wrap');const note=document.createElement('div');note.className='v3notice';note.textContent='🧪 V0.3 en pruebas. Importamos una copia de tu V0.2, sin modificar la partida original. Recompensas y economía aún en calibración.';document.querySelector('.top').insertAdjacentElement('afterend',note);
const nav=document.querySelector('.nav');nav.insertAdjacentHTML('beforeend','<button class="tab" type="button" data-v3-tab="senda">🏅 Senda</button><button class="tab" type="button" data-v3-tab="logros">🏆 Logros</button>');
const hero=document.querySelector('.hero');hero.insertAdjacentHTML('afterend','<section class="v3header"><strong id="v3level">Nivel 1</strong> · <span id="v3xpcount">0 XP</span> · <span id="v3crystals">💎 0</span><button class="btn" type="button" id="v3go">Ver senda →</button><div class="v3xp"><i id="v3xpbar" style="width:0%"></i></div><small id="v3next">Tu siguiente premio está cerca</small></section>');
document.querySelector('#avatarScreen').insertAdjacentHTML('afterend','<section class="screen" id="v3senda" data-v3-screen aria-label="Senda de recompensas"><p class="eyebrow">Temporada 1 · Secretos del Bosque</p><h2>🏅 Senda de 30 niveles</h2><p class="intro">Cultiva, cumple dos misiones al día y descubre cartas. Las recompensas de nivel se entregan automáticamente, una sola vez.</p><h3>Misiones de hoy</h3><div id="v3missions"></div><h3>Tu recorrido</h3><div class="v3gr" id="v3levels"></div></section><section class="screen" id="v3logros" data-v3-screen aria-label="Logros internos"><p class="eyebrow">Juega a tu ritmo</p><h2>🏆 Logros del jardín</h2><p class="intro">Los logros se consiguen jugando. No hace falta seguir, comentar, etiquetar ni compartir en Instagram.</p><div id="v3achievements"></div></section>');
function showTab(which){for(const b of document.querySelectorAll('[data-tab]')){b.classList.remove('active');b.removeAttribute('aria-current')}for(const el of document.querySelectorAll('#gardenScreen,#albumScreen,#avatarScreen'))el.classList.remove('active');for(const el of document.querySelectorAll('[data-v3-screen]'))el.classList.toggle('active',el.id==='v3'+which);for(const b of document.querySelectorAll('[data-v3-tab]')){const active=b.dataset.v3Tab===which;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page')}renderExtra();window.scrollTo({top:0,behavior:'smooth'})}
nav.querySelectorAll('[data-v3-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.v3Tab)));
document.querySelector('#v3go').addEventListener('click',()=>showTab('senda'));
function renderExtra(){refreshDay();const n=level(),curr=xpFor(n),next=xpFor(n+1);document.querySelector('#v3level').textContent='Nivel '+n+'/30';document.querySelector('#v3xpcount').textContent=p.xp.toLocaleString('es-CL')+' XP';document.querySelector('#v3crystals').textContent='💎 '+p.crystals;document.querySelector('#v3xpbar').style.width=n===30?'100%':Math.round(100*(p.xp-curr)/(next-curr))+'%';document.querySelector('#v3next').textContent=n===30?'¡Completaste la senda!':`${next-p.xp} XP para el nivel ${n+1} · +${coinsFor(n+1)} monedas`;
const d=p.daily;document.querySelector('#v3missions').innerHTML=[[4,'four'],[8,'eight']].map(([target,id])=>`<div class="v3mission"><strong>${id==='four'?'🌱 Cosechadora':'🌿 Jardín en movimiento'}</strong> <span class="v3badge">${d.claimed.includes(id)?'✓ Recompensa recibida':'60 XP + 25 🪙'}</span><div class="bar"><i style="width:${Math.min(100,Math.round(d.harvest/target*100))}%"></i></div><small>${Math.min(d.harvest,target)} / ${target} cosechas de hoy</small></div>`).join('');
document.querySelector('#v3levels').innerHTML=Array.from({length:30},(_,i)=>{const k=i+1;return `<div class="v3level ${k<=n?'done':k===n+1?'next':''}"><strong>${k<=n?'✓ ':''}Nivel ${k}</strong><br><small>${xpFor(k).toLocaleString('es-CL')} XP</small><br>${k>1?'🪙 '+coinsFor(k):'🌱 Inicio'}${special[k]?'<br><span class="v3badge">'+esc(special[k])+'</span>':''}</div>`}).join('');
document.querySelector('#v3achievements').innerHTML=achievementList.map(a=>`<div class="v3ach ${p.achievements[a.id]?'':'locked'}"><span class="icon">${a.icon}</span><div><strong>${esc(a.name)} ${p.achievements[a.id]?'✓':'🔒'}</strong><small>${esc(a.detail)}</small><span class="v3badge">${a.crystal?'💎 '+a.crystal:'+'+a.xp+' XP'}</span></div></div>`).join('');}
const reset=document.querySelector('#reset');reset.textContent='Restaurar copia de V0.2';reset.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();if(confirm('¿Restaurar solo esta V0.3 de pruebas desde tu partida V0.2? La V0.2 original no se modificará.')){localStorage.removeItem('ecotrenzas-garden-v0.3-preview');location.reload()}},true);
renderExtra();
})();
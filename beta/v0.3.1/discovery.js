/* EcoTrenzas Garden V0.3.1 · Mi estilo. Solo laboratorio; sin API, CRM ni seguimiento social. */
(()=>{'use strict';
const game=window.__ecogame;
if(!game||!Array.isArray(game.SETS))throw Error('El vestidor de Mi estilo necesita la base V0.3.');
const STORE='ecotrenzas-garden-look-v0.3.1-preview';
const GAME_STORE='ecotrenzas-garden-v0.3.1-preview';
const IG='https://www.instagram.com/ecotienda_trenzasydreads/';
const options=[
 ['largo','Me gustaría ganar largo','📏'],
 ['volumen','Quiero más volumen','🌸'],
 ['color','Quiero explorar colores sin volver a tinturarme','🎨'],
 ['practicidad','Busco practicidad o ahorrar tiempo','⏰'],
 ['naturalidad','Me importa un resultado natural','🍃'],
 ['identidad','Quiero expresar mi estilo','✨'],
 ['cabello','Tengo dudas por mi cabello corto o sensibilizado','💬'],
 ['explorar','Solo quiero explorar diseños','👀']
];
const empty=()=>({version:1,motivation:'',selected:'',favorites:[],postcards:0});
function load(){try{const v=JSON.parse(localStorage.getItem(STORE)||'null');if(v&&v.version===1)return {version:1,motivation:options.some(x=>x[0]===v.motivation)?v.motivation:'',selected:game.SETS.some(x=>x.id===v.selected)?v.selected:'',favorites:Array.isArray(v.favorites)?v.favorites.filter(id=>game.SETS.some(x=>x.id===id)).slice(0,3):[],postcards:Math.max(0,Math.min(999,Number(v.postcards)||0))};}catch{}return empty()}
let choice=load(),shown=false;
function save(){try{localStorage.setItem(STORE,JSON.stringify(choice))}catch{game.showToast('No se pudo guardar esta ficha en el navegador.')}}
const $=id=>document.getElementById(id);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const motivation=()=>options.find(x=>x[0]===choice.motivation)?.[1]||'Aún no lo he definido';
const current=()=>game.SETS.find(x=>x.id===choice.selected)||null;
const owned=s=>game.state.unlocked.includes(s.id);
function draft(){const s=current();return `Hola EcoTienda 🌿. Vi EcoTrenzas Garden y me interesó ${s?s.name:'un diseño de trenzas'} (referencia de fantasía). Busco: ${motivation()}. ¿Me pueden orientar sobre un estilo real adecuado para mí, disponibilidad y precio vigente?`}
const css=document.createElement('style');css.textContent=`
.look-entrance{margin:12px 0 16px;padding:20px;border:1px solid #d4dfc4;border-radius:20px;background:linear-gradient(135deg,#eff8e5,#fff7ed);box-shadow:0 6px 18px #204b2a0b}
.look-entrance h2{font-size:clamp(22px,5vw,30px);margin:4px 0 9px}.look-entrance p{font-size:13px;color:#54675b}.look-actions{display:flex;gap:9px;flex-wrap:wrap}.look-actions .btn{min-height:47px;font-size:13px}
.look-screen h2{font-size:clamp(23px,5vw,31px);margin:0 0 7px}.look-step{background:#f1f6e8;border-radius:15px;border:1px solid #dce9d2;padding:14px;margin-bottom:14px}.look-step p{font-size:12px;color:#526758;margin:0 0 11px}
.look-motives{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.look-motives button{border:2px solid #e1dfca;background:#fffefa;border-radius:12px;padding:10px 8px;min-height:62px;text-align:left;font-size:12px;color:#2c4131;font-weight:740}.look-motives button[aria-pressed=true]{background:#e3f1df;border-color:#267b58;box-shadow:0 0 0 1px #267b58}
.look-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.look-choice{background:#fffdf7;border:2px solid #e2dfd0;border-radius:15px;padding:5px;text-align:left;color:#2c4131;min-width:0;overflow:hidden}.look-choice[aria-pressed=true]{border-color:#287452;background:#e9f4e7}.look-choice img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:10px}.look-choice strong{display:block;font-size:12px;margin:6px 2px 0}.look-choice small{display:block;font-size:10px;color:#69756a;margin:0 2px 4px}
.look-result{display:grid;grid-template-columns:minmax(120px,170px) 1fr;gap:14px;align-items:start;padding:13px;background:#fff8ea;border:1px solid #ebdbbd;border-radius:17px}.look-result img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:12px}.look-result h3{font-size:19px;margin:3px 0 8px}.look-result p{font-size:12px;color:#5b6659;margin-bottom:8px}.look-cta{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.look-cta button,.look-cta a{min-height:42px;text-align:center;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.look-cta .btn{font-size:12px}
.look-footnote{font-size:11px;color:#637066;line-height:1.55;margin:13px 0}.look-summary{background:#eff6e9;border-radius:12px;padding:11px;font-size:12px;margin-top:10px;line-height:1.6}.look-favs{font-size:11px;color:#476b51;margin:8px 0}.look-muted{font-size:11px;color:#68756c}.look-done{margin-top:13px}.look-done[hidden]{display:none}
@media(max-width:490px){.look-gallery{grid-template-columns:repeat(2,minmax(0,1fr))}.look-result{grid-template-columns:115px 1fr;gap:10px}.look-result h3{font-size:16px}.look-cta .btn{flex:1}.look-entrance{padding:15px}.look-screen{padding:13px}}
`;
document.head.appendChild(css);
const nav=document.querySelector('.nav');const styleTab=document.createElement('button');styleTab.className='tab';styleTab.type='button';styleTab.dataset.v3Tab='style';styleTab.textContent='✨ Mi estilo';nav.prepend(styleTab);
const screen=document.createElement('section');screen.id='v3style';screen.className='screen look-screen';screen.dataset.v3Screen='';screen.setAttribute('aria-label','Descubre y guarda tu estilo');screen.innerHTML=`
<p class="eyebrow">Mi estilo EcoTienda · Laboratorio V0.3.1</p><h2>✨ Imagina tu próximo look</h2><p class="intro">Elige qué buscas, descubre colores y guarda un diseño que te gustaría consultar. Puedes jugar sin reservar ni comprar.</p>
<div class="look-step"><strong>1 · ¿Qué te gustaría conseguir?</strong><p>Elige lo que te importa a ti; no evaluamos tu cabello desde una fotografía.</p><div id="lookMotives" class="look-motives"></div></div>
<div class="look-step"><strong>2 · ¿Qué combinación llama tu atención?</strong><p>Estas seis cartas son ilustraciones de fantasía: no representan un producto exacto ni garantizan que esté disponible.</p><div id="lookCards" class="look-gallery"></div><p class="look-favs" id="lookFavorites"></p></div>
<div class="look-step"><strong>3 · Guarda una idea clara de tu look</strong><p>Selecciona una carta y verás tu ficha. Puedes guardar hasta tres favoritas.</p><div id="lookResult" aria-live="polite"></div></div>
<p class="look-footnote">El juego no comprueba stock, precio, duración, compatibilidad con tu cabello ni disponibilidad de horas. La asesoría de EcoTienda confirma esos detalles antes de personalizar o reservar. MiniBraids y otros estilos se integrarán más adelante, cuando contemos con referencias visuales verificadas.</p>`;
document.querySelector('#v3logros').insertAdjacentElement('afterend',screen);
const entrance=document.createElement('section');entrance.className='look-entrance';entrance.setAttribute('aria-label','Elige cómo comenzar');entrance.innerHTML=`<p class="eyebrow">Una aventura, dos caminos</p><h2>¿Cuál será tu próximo look? ✨</h2><p>Puedes encontrar un diseño que te entusiasme en pocos minutos o seguir cultivando y coleccionando cartas. No es necesario jugar para consultar.</p><div class="look-actions"><button id="lookStart" class="btn go" type="button">✨ Encontrar mi estilo</button><button id="lookPlay" class="btn" type="button">🌱 Seguir jugando</button></div>`;
document.querySelector('.v3notice').insertAdjacentElement('afterend',entrance);
function showStyle(){document.querySelectorAll('#gardenScreen,#albumScreen,#avatarScreen,[data-v3-screen]').forEach(el=>el.classList.remove('active'));document.querySelectorAll('[data-tab],[data-v3-tab]').forEach(el=>{el.classList.remove('active');el.removeAttribute('aria-current')});screen.classList.add('active');styleTab.classList.add('active');styleTab.setAttribute('aria-current','page');entrance.hidden=true;shown=true;render();window.scrollTo({top:0,behavior:'smooth'})}
styleTab.onclick=showStyle;$('lookStart').onclick=showStyle;$('lookPlay').onclick=()=>{entrance.hidden=true;game.setTab('garden')};
const oldTab=window.__ecov03?.onTab;window.__ecov03.onTab=(name)=>{oldTab?.(name);styleTab.classList.remove('active');styleTab.removeAttribute('aria-current');screen.classList.remove('active')};
nav.querySelectorAll('[data-v3-tab]:not([data-v3-tab="style"])').forEach(btn=>btn.addEventListener('click',()=>{entrance.hidden=true},true));
function render(){const s=current();$('lookMotives').innerHTML=options.map(([id,label,icon])=>`<button type="button" data-motive="${id}" aria-pressed="${choice.motivation===id}">${icon} ${esc(label)}</button>`).join('');
 $('lookCards').innerHTML=game.SETS.map(x=>`<button type="button" class="look-choice" data-look="${x.id}" aria-pressed="${choice.selected===x.id}"><img loading="lazy" src="assets/${x.id}.webp" alt="${esc(x.name)}, imagen de fantasía"><strong>${esc(x.name)}</strong><small>${owned(x)?'✓ En tu álbum':'Inspiración · aún sin desbloquear'}</small></button>`).join('');
 $('lookFavorites').textContent=choice.favorites.length?'Mis favoritas: '+choice.favorites.map(id=>game.SETS.find(x=>x.id===id)?.name).filter(Boolean).join(' · '):'Todavía no has guardado favoritas.';
 if(!s){$('lookResult').innerHTML='<div class="look-summary">Selecciona una carta de la galería para visualizar tu idea de look.</div>';return}
 $('lookResult').innerHTML=`<div class="look-result"><img src="assets/${s.id}.webp" alt="Carta de fantasía ${esc(s.name)}"><div><p class="eyebrow">Mi diseño elegido</p><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p><p><strong>Lo que busco:</strong> ${esc(motivation())}</p><p class="look-muted">Referencia visual para conversar: el resultado real puede variar según el servicio y la evaluación humana.</p><div class="look-cta"><button type="button" class="btn go" id="lookFavorite">${choice.favorites.includes(s.id)?'✓ Guardado':'♡ Guardar favorita'}</button>${owned(s)?'<button type="button" class="btn" id="lookTry">🪞 Vestidor</button>':''}</div></div></div><div class="look-summary"><strong>Tu ficha para EcoTienda</strong><br>${esc(draft())}</div><div class="look-cta"><button class="btn" type="button" id="lookCopy">📋 Copiar consulta</button><button class="btn" type="button" id="lookPostcard">🖼️ Crear postal</button><a class="btn go" href="${IG}" target="_blank" rel="noopener noreferrer" id="lookContact">💬 Consultar en Instagram ↗</a></div><p class="look-footnote">Abrir Instagram es voluntario y no envía este texto automáticamente. Copia la consulta si quieres compartirla con el equipo. Sin premios por seguir, comentar o mencionar.</p>`;
 $('lookFavorite').onclick=()=>{if(choice.favorites.includes(s.id))choice.favorites=choice.favorites.filter(id=>id!==s.id);else choice.favorites=[...choice.favorites.filter(id=>id!==s.id),s.id].slice(-3);save();render();game.showToast('Tu selección quedó guardada en esta prueba 🌸')};
 if(owned(s))$('lookTry').onclick=()=>game.setTab('avatar');
 $('lookCopy').onclick=async()=>{try{await navigator.clipboard.writeText(draft());game.showToast('Consulta copiada. Puedes pegarla en Instagram.')}catch{window.prompt('Copia tu consulta:',draft())}};
 $('lookPostcard').onclick=()=>postcard(s);
}
$('lookMotives').addEventListener('click',e=>{const btn=e.target.closest('[data-motive]');if(!btn)return;choice.motivation=btn.dataset.motive;save();render()});
$('lookCards').addEventListener('click',e=>{const btn=e.target.closest('[data-look]');if(!btn)return;choice.selected=btn.dataset.look;save();render();$('lookResult').scrollIntoView({block:'nearest',behavior:'smooth'})});
async function postcard(s){const button=$('lookPostcard');button.disabled=true;try{
 const img=new Image();img.src=new URL(`assets/${s.id}.webp`,document.baseURI).href;await img.decode();
 const canvas=document.createElement('canvas');canvas.width=900;canvas.height=1180;const c=canvas.getContext('2d');if(!c)throw Error('Sin lienzo');
 const g=c.createLinearGradient(0,0,900,1180);g.addColorStop(0,'#e8f4df');g.addColorStop(1,'#fff5e8');c.fillStyle=g;c.fillRect(0,0,900,1180);
 c.fillStyle='#205741';c.font='bold 29px sans-serif';c.fillText('ECOTRENZAS GARDEN · MI ESTILO',52,65);
 const target={x:52,y:105,w:796,h:820};const ratio=Math.max(target.w/img.width,target.h/img.height);const w=img.width*ratio,h=img.height*ratio;c.save();c.beginPath();c.rect(target.x,target.y,target.w,target.h);c.clip();c.drawImage(img,target.x+(target.w-w)/2,target.y+(target.h-h)/2,w,h);c.restore();
 c.fillStyle='#205741';c.font='bold 49px sans-serif';c.fillText(s.name,52,1000);c.font='25px sans-serif';c.fillText('Mi inspiración de fantasía · No es una simulación real',52,1052);c.fillText('@ecotienda_trenzasydreads',52,1112);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('No se pudo generar la imagen');
 const filename=`mi-estilo-${s.id}.png`;const file=new File([blob],filename,{type:'image/png'});
 if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:'Mi estilo EcoTrenzas Garden'});game.showToast('Postal lista para compartir ✨');return}catch(e){if(e.name==='AbortError')return}}
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);game.showToast('Postal preparada. Revisa tus descargas.');
 }catch(e){console.warn('No se generó la postal',e);game.showToast('No pudimos generar la postal en este navegador.')}finally{button.disabled=false}}
// El botón de reinicio de V0.3 usa otra clave. Clonarlo aísla el reinicio de V0.3.1.
const oldReset=$('reset'),newReset=oldReset.cloneNode(true);oldReset.replaceWith(newReset);newReset.textContent='Restaurar copia en pruebas';newReset.addEventListener('click',()=>{if(confirm('¿Restaurar solamente esta versión de pruebas desde tu partida anterior? Tu V0.2 y V0.3 original no se modificarán.')){localStorage.removeItem(GAME_STORE);localStorage.removeItem(STORE);location.reload()}});
render();
})();
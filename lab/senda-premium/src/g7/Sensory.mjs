/* EcoTrenzas Garden G7 — optional local audio and cosmetic-only card magic.
 * No remote requests, no game state writes, no commercial effects.
 * Audio remains OFF until explicitly enabled by the player.
 */
export const G7_AUDIO_KEY='ecotrenzas-garden-g7-sound-v1';

export function installG7Sensory({doc=document,store=window.localStorage}={}){
  const soundButton=doc.getElementById('g7-sound');
  const status=doc.getElementById('g7-sound-status');
  if(!soundButton)throw Error('G7_SOUND_CONTROL_MISSING');
  const reducedMotion=Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const AudioAPI=window.AudioContext||window.webkitAudioContext;
  let enabled=store?.getItem(G7_AUDIO_KEY)==='on';
  let context=null, audioEvents=0, celebrations=0, lastCue='none', closed=false;
  const ledger=[];
  const notes={
    enable:[[523.25,0,0.12],[659.26,0.07,0.15]],
    navigate:[[390,0,0.075]],
    plant:[[330,0,0.085]],
    harvest:[[523,0,0.11],[659,0.10,0.15]],
    reveal:[[392,0,0.20],[523.25,0.13,0.20],[659.26,0.27,0.22],[783.99,0.42,0.3]],
    choose:[[440,0,0.07]]
  };
  const display=()=>{
    soundButton.setAttribute('aria-pressed',String(enabled));
    soundButton.textContent=enabled?'🔊 Silenciar magia':'🔇 Activar magia sonora';
    if(status)status.textContent=enabled?'Sonidos opcionales activados':'Sonidos opcionales desactivados';
  };
  const record=kind=>{lastCue=kind;ledger.push(kind);if(ledger.length>16)ledger.shift();};
  async function startOnGesture(){
    if(!enabled||!AudioAPI||closed)return false;
    try{
      if(!context)context=new AudioAPI();
      if(context.state!=='running')await context.resume();
      return context.state==='running';
    }catch{return false}
  }
  function cue(kind){
    if(!enabled||!context||context.state!=='running'||closed||!notes[kind])return false;
    const now=context.currentTime;
    try{
      for(const [freq,delay,duration] of notes[kind]){
        const osc=context.createOscillator();
        const gain=context.createGain();
        const begin=now+delay;
        osc.type=kind==='reveal'?'sine':'triangle';
        osc.frequency.setValueAtTime(freq,begin);
        gain.gain.setValueAtTime(0,begin);
        gain.gain.linearRampToValueAtTime(kind==='reveal'?0.027:0.018,begin+0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001,begin+duration);
        osc.connect(gain);gain.connect(context.destination);
        osc.start(begin);osc.stop(begin+duration+0.014);
      }
      audioEvents++;
      record(kind);
      return true;
    }catch{return false}
  }
  async function toggle(){
    if(enabled){
      enabled=false;
      try{store?.setItem(G7_AUDIO_KEY,'off')}catch{}
      display();
      try{await context?.suspend()}catch{}
      return;
    }
    if(!AudioAPI){
      if(status)status.textContent='Audio no disponible en este navegador';
      return;
    }
    enabled=true;
    try{store?.setItem(G7_AUDIO_KEY,'on')}catch{}
    display();
    if(await startOnGesture())cue('enable');
  }
  soundButton.addEventListener('click',toggle);
  // A persisted opt-in resumes only after a fresh user gesture (never autoplay).
  doc.addEventListener('pointerdown',()=>{if(enabled&&!closed)void startOnGesture()},{capture:true});
  doc.addEventListener('click',event=>{
    if(!enabled)return;
    const target=event.target.closest('button');
    if(!target||target===soundButton)return;
    if(target.matches('[data-tab], [data-chapter], #prev-chapter, #next-chapter, [data-node]'))cue('navigate');
    else if(target.dataset.plot==='plant')cue('plant');
    else if(target.dataset.plot==='harvest')cue('harvest');
    else if(target.matches('[data-seed], [data-select], [data-service]'))cue('choose');
  });
  function celebrate(dialog){
    if(!dialog?.open||!dialog.dataset.cardId||dialog.dataset.g7Celebrated===dialog.dataset.cardId)return;
    dialog.dataset.g7Celebrated=dialog.dataset.cardId;
    celebrations++;
    const previous=dialog.querySelector('.g7-reveal-magic');
    previous?.remove();
    if(!reducedMotion){
      const layer=doc.createElement('div');
      layer.className='g7-reveal-magic';layer.setAttribute('aria-hidden','true');
      // CSS decorations are separate from card imagery and game economy.
      for(let i=0;i<15;i++){
        const spark=doc.createElement('i');
        spark.style.setProperty('--angle',`${i*24}deg`);
        spark.style.setProperty('--radius',`${78+(i%3)*19}px`);
        spark.style.setProperty('--delay',`${(i%5)*0.055}s`);
        layer.append(spark);
      }
      dialog.querySelector('.g6-reveal-panel')?.append(layer);
    }
    // Reveal may be triggered in a microtask; sound is still optional.
    cue('reveal');
  }
  const observer=new MutationObserver(()=>celebrate(doc.getElementById('g6-reveal')));
  observer.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  display();
  return {
    diagnostics:()=>({enabled,reducedMotion,audioAvailable:Boolean(AudioAPI),audioReady:context?.state==='running',audioEvents,celebrations,lastCue,ledger:[...ledger],particleCount:doc.querySelectorAll('#g6-reveal .g7-reveal-magic i').length}),
    dispose:()=>{closed=true;observer.disconnect();void context?.close()}
  };
}

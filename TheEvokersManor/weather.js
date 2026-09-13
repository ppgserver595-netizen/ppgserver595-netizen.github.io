// Quiet procedural rainfall and distant thunder, controlled with the music.
(()=>{
 'use strict';
 let ctx,master,noise,timer,enabled=false;
 function makeNoise(seconds){
  const b=ctx.createBuffer(2,Math.ceil(ctx.sampleRate*seconds),ctx.sampleRate);
  for(let ch=0;ch<2;ch++){
   const data=b.getChannelData(ch);let brown=0;
   for(let i=0;i<data.length;i++){
    const white=Math.random()*2-1;brown=(brown+.02*white)/1.02;
    data[i]=white*.35+brown*1.7;
   }
  }
  return b;
 }
 function init(){
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)return false;
  ctx=new Audio();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
  noise=makeNoise(12);
  const rain=ctx.createBufferSource();rain.buffer=noise;rain.loop=true;
  const low=ctx.createBiquadFilter();low.type='lowpass';low.frequency.value=2600;low.Q.value=.5;
  const high=ctx.createBiquadFilter();high.type='highpass';high.frequency.value=650;
  const level=ctx.createGain();level.gain.value=.38;
  rain.connect(low).connect(high).connect(level).connect(master);rain.start();
  return true;
 }
 function thunder(){
  if(!enabled)return;
  const t=ctx.currentTime;
  const source=ctx.createBufferSource();source.buffer=noise;
  const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=170;filter.Q.value=.6;
  const envelope=ctx.createGain();envelope.gain.setValueAtTime(0,t);
  envelope.gain.linearRampToValueAtTime(.9,t+1.1);
  envelope.gain.linearRampToValueAtTime(.32,t+2.3);
  envelope.gain.linearRampToValueAtTime(.48,t+3.1);
  envelope.gain.exponentialRampToValueAtTime(.001,t+7.8);
  source.connect(filter).connect(envelope).connect(master);
  source.start(t);source.stop(t+8);
  source.onended=()=>{source.disconnect();filter.disconnect();envelope.disconnect();};
  timer=setTimeout(thunder,22000+Math.random()*14000);
 }
 window.manorWeather={
  async start(){
   try{
    if(!ctx&&!init())return;
    enabled=true;await ctx.resume();if(!enabled)return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(.085,ctx.currentTime,.7);
    if(!timer)timer=setTimeout(thunder,9000);
   }catch{ /* The invitation and music still work without Web Audio. */ }
  },
  stop(){
   enabled=false;clearTimeout(timer);timer=null;
   if(ctx){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(0,ctx.currentTime,.08);}
  }
 };
})();

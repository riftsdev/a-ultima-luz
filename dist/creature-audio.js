export function createCreatureAudio(){
 let context,output,buffer,loading,active;const diagnostics={ready:false,plays:0};
 async function init(ctx,destination){
  context=ctx;output=destination;
  if(buffer)return;if(loading)return loading;
  loading=(async()=>{try{const response=await fetch('./assets/audio/Allosaurus_Roar.m4a');if(response.ok){buffer=await context.decodeAudioData(await response.arrayBuffer());diagnostics.ready=true}}catch{}finally{loading=null}})();
  return loading;
 }
 function stop(){if(active){try{active.stop()}catch{}active=null}}
 function play(distance=8){
  if(!buffer||context?.state!=='running')return false;
  stop();const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;
  gain.gain.value=Math.max(.25,Math.min(.9,1-distance/35));source.connect(gain).connect(output);source.start();active=source;diagnostics.plays++;
  source.onended=()=>{source.disconnect();gain.disconnect();if(active===source)active=null};return true;
 }
 return {init,play,stop,diagnostics};
}

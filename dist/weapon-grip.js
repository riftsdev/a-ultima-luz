import * as THREE from './assets/three.module.min.js';

// Keep the aiming/recoil motion, but grasp the revolver with the closed grab pose.
export function makeRevolverClips(animations){
 const grab=animations.find(a=>a.name==='grab.R'),relax=animations.find(a=>a.name==='relax');
 if(!grab||!relax)return [];
 const finger=/^(f_(index|middle|ring|pinky)|thumb|palm).*R\.quaternion$/;
 return [['finger_gun_idle','revolver_idle'],['finger_gun_fire','revolver_fire']].flatMap(([source,name])=>{
  const original=animations.find(a=>a.name===source);if(!original)return [];
  const tracks=original.tracks.filter(t=>!t.name.split('.')[0].endsWith('L')&&!finger.test(t.name)).map(t=>t.clone());
  tracks.push(...relax.tracks.filter(t=>t.name.split('.')[0].endsWith('L')).map(t=>t.clone()));
  for(const track of grab.tracks.filter(t=>finger.test(t.name))){
   const q=new THREE.Quaternion().fromArray(track.createInterpolant().evaluate(.5)).normalize();
   // The index finger sits on the trigger instead of closing into the palm.
   if(track.name==='f_index01R.quaternion'){
    const rest=relax.tracks.find(t=>t.name===track.name);
    if(rest)q.slerp(new THREE.Quaternion().fromArray(rest.createInterpolant().evaluate(0)),.22);
   }
   const values=q.toArray();tracks.push(new THREE.QuaternionKeyframeTrack(track.name,[0,original.duration],[...values,...values]));
  }
  return [new THREE.AnimationClip(name,original.duration,tracks)];
 });
}

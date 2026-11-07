import * as THREE from './assets/three.module.min.js';
import {GLTFLoader} from './assets/GLTFLoader.js';

export function createGameAssets({scene,car,treeSpots,trunk,foliage,walls,onProgress=()=>{},loader=new GLTFLoader()}){
 const viewScene=new THREE.Scene(),viewCamera=new THREE.PerspectiveCamera(75,1,.01,8);
 viewCamera.position.set(0,1.74,0);viewScene.add(new THREE.HemisphereLight(0xb9d0c2,0x3d4538,2.1));
 const lamp=new THREE.DirectionalLight(0xe2d1a5,1.8);lamp.position.set(-1,3,2);viewScene.add(lamp);
 const viewRoot=new THREE.Group();viewScene.add(viewRoot);
 const gunPickup=new THREE.Group();gunPickup.position.set(-10,.94,-10.7);scene.add(gunPickup);
 const placeholder=new THREE.Mesh(new THREE.BoxGeometry(.32,.13,.12),new THREE.MeshStandardMaterial({color:0x7c8074,metalness:.5,roughness:.7}));gunPickup.add(placeholder);
 const marker=new THREE.Mesh(new THREE.RingGeometry(.18,.2,20),new THREE.MeshBasicMaterial({color:0xdba25c,side:THREE.DoubleSide}));marker.position.y=.4;gunPickup.add(marker);
 const gunView=new THREE.Group();gunView.name="view-revolver";viewRoot.add(gunView);gunView.visible=false;
 const muzzle=new THREE.PointLight(0xffb24f,0,2);viewScene.add(muzzle);
 const torch=new THREE.Group();torch.name="view-flashlight";const body=new THREE.Mesh(new THREE.CylinderGeometry(.034,.026,.18,8),new THREE.MeshStandardMaterial({color:0x28342e,metalness:.5,roughness:.7}));body.rotation.x=Math.PI/2;torch.add(body);
 const lens=new THREE.Mesh(new THREE.CircleGeometry(.032,10),new THREE.MeshBasicMaterial({color:0xf4e5ad}));lens.rotation.y=Math.PI;lens.position.z=-.091;torch.add(lens);viewRoot.add(torch);
 let rig,mixer,currentAction,rightHand,leftHand,base='relax',oneShot=0,recoil=0,clock=0;
 const actions=new Map(),diagnostics={loaded:[],failed:[]};let completed=0;
 async function load(name){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);try{const response=await fetch(`./assets/models/${name}.glb`,{signal:controller.signal});if(!response.ok)throw new Error(`HTTP ${response.status}`);return await loader.parseAsync(await response.arrayBuffer(),'./assets/models/')}finally{clearTimeout(timer)}}
 function nearest(root){root.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=false;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.map){m.map.magFilter=THREE.NearestFilter;m.map.needsUpdate=true}m.roughness=Math.max(.65,m.roughness);m.metalness=Math.min(.3,m.metalness)}})}
 function normalize(root,length){root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());const wrapper=new THREE.Group();wrapper.add(root);root.position.sub(center);wrapper.scale.setScalar(length/Math.max(size.x,size.y,size.z));return wrapper}
 function changeAction(name,once=false){const next=actions.get(name)||actions.get(base);if(!next||next===currentAction&&!once)return;next.reset();next.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,once?1:Infinity);next.clampWhenFinished=once;next.enabled=true;next.setEffectiveWeight(1).play();if(currentAction&&currentAction!==next)currentAction.crossFadeTo(next,.14,false);currentAction=next;if(once)oneShot=next.getClip().duration;}
 function forest(gltf){gltf.scene.updateMatrixWorld(true);const candidates=treeSpots.map((t,i)=>({...t,index:i})).filter(t=>Math.abs(t.x)<35&&t.z>-45&&t.z<45).slice(0,48);const zero=new THREE.Matrix4().makeScale(0,0,0),transform=new THREE.Object3D();
  for(const [name,parity] of [['tree_wide',0],['tree_tall',1]]){let source;gltf.scene.traverse(o=>{if(o.isMesh&&(o.name===name||o.parent?.name===name))source=o});if(!source)continue;const geometry=source.geometry.clone().applyMatrix4(source.matrixWorld),material=source.material.clone();material.color.multiply(new THREE.Color(.47,.58,.49));material.roughness=1;material.metalness=0;if(material.emissive)material.emissive.set(0);const selected=candidates.filter((_,i)=>i%2===parity),batch=new THREE.InstancedMesh(geometry,material,selected.length);
   selected.forEach((t,i)=>{transform.position.set(t.x,0,t.z);transform.rotation.set(0,t.index*1.37,0);transform.scale.setScalar(t.h/(parity?7:9)*.85);transform.updateMatrix();batch.setMatrixAt(i,transform.matrix);trunk.setMatrixAt(t.index,zero);for(let j=0;j<3;j++)foliage.setMatrixAt(t.index*3+j,zero);const collider=walls.find(w=>w.x===t.x&&w.z===t.z);if(collider)collider.w=collider.d=.65;});batch.computeBoundingSphere();scene.add(batch);
  }
  trunk.instanceMatrix.needsUpdate=true;foliage.instanceMatrix.needsUpdate=true;
  for(const [name,positions] of [['fallen_log',[[-7,8,.7],[7,19,2.6],[24,-20,1.1],[-24,-27,.3]]],['fern',[[-5,10,1],[6,28,2],[-15,-5,1],[-17,-9,2],[-18,-26,1],[15,-22,2],[23,-26,1],[-18,-35,1],[-23,-33,2],[7,5,1],[9,-13,2],[-8,0,1]]]]){
   let source;gltf.scene.traverse(o=>{if(o.isMesh&&(o.name===name||o.parent?.name===name))source=o});if(!source)continue;const geometry=source.geometry.clone().applyMatrix4(source.matrixWorld),material=source.material.clone();material.color.multiply(new THREE.Color(.45,.55,.4));material.roughness=1;material.metalness=0;if(material.emissive)material.emissive.set(0);const batch=new THREE.InstancedMesh(geometry,material,positions.length);positions.forEach(([x,z,r],i)=>{transform.position.set(x,0,z);transform.rotation.set(0,r,0);transform.scale.setScalar(name==='fern'?.6:1);transform.updateMatrix();batch.setMatrixAt(i,transform.matrix)});batch.computeBoundingSphere();scene.add(batch);
  }
 }
 const handlers={car:g=>{nearest(g.scene);car.children.filter(c=>c.isMesh).forEach(c=>c.visible=false);g.scene.name='Uploaded station wagon';car.add(g.scene)},nature:forest,arms:g=>{rig=g.scene;rig.rotation.y=Math.PI;nearest(rig);viewRoot.add(rig);mixer=new THREE.AnimationMixer(rig);const relaxed=g.animations.find(c=>c.name==='relax');for(const original of g.animations){let clip=original;if(original.name.startsWith('finger_gun')&&relaxed){clip=original.clone();clip.tracks=original.tracks.filter(t=>!t.name.split('.')[0].endsWith('L')).concat(relaxed.tracks.filter(t=>t.name.split('.')[0].endsWith('L')).map(t=>t.clone()));}actions.set(clip.name,mixer.clipAction(clip));}rightHand=rig.getObjectByName('handR')||rig.getObjectByName('hand.R');leftHand=rig.getObjectByName('handL')||rig.getObjectByName('hand.L');changeAction(base)},revolver:g=>{nearest(g.scene);const weapon=normalize(g.scene,.32);weapon.rotation.y=0;gunView.add(weapon);const pickup=weapon.clone(true);pickup.rotation.z=Math.PI/2;gunPickup.add(pickup);placeholder.visible=false;}};
 const ready=Promise.allSettled(Object.entries(handlers).map(async([name,handler])=>{try{handler(await load(name));diagnostics.loaded.push(name)}catch(error){diagnostics.failed.push(name);console.warn(`Asset ${name} unavailable; keeping fallback.`,error.message)}finally{completed++;onProgress(completed,4)}}));
 function update(dt,{playing,weapon,moving,running,repairing,lightOn,reduced,aspect}){
  clock+=dt;gunPickup.visible=!weapon;marker.rotation.y=clock;if(viewCamera.aspect!==aspect){viewCamera.aspect=aspect;viewCamera.fov=2*Math.atan(Math.tan(75*Math.PI/360)/Math.min(1,aspect))*180/Math.PI;viewCamera.position.z=aspect<.8?.18:0;viewCamera.updateProjectionMatrix();}
  base=weapon?'finger_gun_idle':'relax';if(oneShot>0){oneShot-=dt;if(oneShot<=0)changeAction(base)}else if(currentAction?.getClip().name!==base)changeAction(base);
  if(repairing&&oneShot<=0)changeAction('grab.R',true);mixer?.update(dt);viewRoot.position.set(reduced?0:Math.sin(clock*(running?10:6))*.006*moving,reduced?0:Math.cos(clock*(running?14:8))*.007*moving,0);viewRoot.updateMatrixWorld(true);
  gunView.visible=playing&&weapon&&!repairing;torch.visible=playing;recoil=Math.max(0,recoil-dt*4);
  if(rightHand){rightHand.getWorldPosition(gunView.position);gunView.position.sub(viewRoot.position);gunView.position.add(new THREE.Vector3(0,.02,-.095));}else gunView.position.set(.19,1.47,-.42);
  gunView.rotation.x=reduced?0:recoil*.24;gunView.position.z+=reduced?0:recoil*.05;
  if(leftHand){leftHand.getWorldPosition(torch.position);torch.position.sub(viewRoot.position);torch.position.add(new THREE.Vector3(0,.02,-.06));}else torch.position.set(-.2,1.43,-.37);
  lens.material.color.set(lightOn?0xffedbb:0x292f29);muzzle.position.copy(gunView.position).add(new THREE.Vector3(0,.06,-.2));muzzle.intensity=reduced?0:recoil>.8?3:0;
 }
 return {ready,diagnostics,gunPickup,viewScene,viewCamera,update,animate:()=>changeAction('grab.R',true),fire:()=>{recoil=1;changeAction('finger_gun_fire',true)},render(renderer){renderer.autoClear=false;renderer.clearDepth();renderer.render(viewScene,viewCamera);renderer.autoClear=true}};
}

export function createVehicleAudio(){
 let context,output,loopSource,active=[],pending=[],loading=false;const buffers=new Map();
 const names=['Engine_Start_Up','Engine_Turning_Off','Engine_Loop','Door_Open','Door_Close','Hood_Open','Hood_Close','Acceleration'];
 async function init(ctx,destination){if(context)return;context=ctx;output=destination;loading=true;await Promise.allSettled(names.map(async n=>{try{const r=await fetch(`./assets/audio/Car_${n}.m4a`);if(r.ok)buffers.set(n,await context.decodeAudioData(await r.arrayBuffer()))}catch{}}));loading=false;const queued=pending;pending=[];for(const [n,options] of queued)play(n,options)}
 function play(name,{loop=false,gain=.6}={}){if(loading&&!buffers.has(name)){pending.push([name,{loop,gain}]);return}if(!context||context.state!=='running'||!buffers.has(name))return;const source=context.createBufferSource(),level=context.createGain();source.buffer=buffers.get(name);source.loop=loop;level.gain.value=gain;source.connect(level).connect(output);source.start();active.push(source);source.onended=()=>{active=active.filter(s=>s!==source)};if(loop){stopLoop();loopSource=source}return source}
 function stopLoop(){if(loopSource){try{loopSource.stop()}catch{}loopSource=null}}
 return {init,play,stopLoop,stop(){pending=[];stopLoop();for(const s of active){try{s.stop()}catch{}}active=[]}};
}

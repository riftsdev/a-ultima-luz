import * as THREE from './assets/three.module.min.js';

export function installCabin(gltf,{scene,fallback,walls,oldWalls}){
 const cabin=gltf.scene;cabin.name='Abandoned cabin';cabin.scale.setScalar(.5);cabin.rotation.y=Math.PI/2;cabin.position.set(-9.2,1.08,-8.1);
 // Open the three doors supplied closed in the model; preserve the actual openings.
 cabin.traverse(o=>{if(['Cube007','Cube006','Cube008'].includes(o.name))o.visible=false;if(o.isMesh){o.material.roughness=1;o.material.metalness=0;if(o.material.map){o.material.map.magFilter=THREE.NearestFilter;o.material.map.needsUpdate=true}}});scene.add(cabin);cabin.updateMatrixWorld(true);
 for(const mesh of fallback)mesh.visible=false;for(const wall of oldWalls){const i=walls.indexOf(wall);if(i!==-1)walls.splice(i,1)}
 // Horizontal slices produce collision segments matching walls and porch railings.
 const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),p=new THREE.Vector3();
 cabin.traverseVisible(o=>{if(!o.isMesh)return;const geometry=o.geometry,position=geometry.attributes.position,index=geometry.index,count=index?index.count:position.count;
  for(let i=0;i<count;i+=3){a.fromBufferAttribute(position,index?index.getX(i):i).applyMatrix4(o.matrixWorld);b.fromBufferAttribute(position,index?index.getX(i+1):i+1).applyMatrix4(o.matrixWorld);c.fromBufferAttribute(position,index?index.getX(i+2):i+2).applyMatrix4(o.matrixWorld);
   for(const height of [.8,1.45]){const points=[];for(const [v,w] of [[a,b],[b,c],[c,a]]){if((v.y-height)*(w.y-height)<0){p.copy(v).lerp(w,(height-v.y)/(w.y-v.y));points.push([p.x,p.z])}}if(points.length!==2)continue;const [u,v]=points;if(Math.hypot(u[0]-v[0],u[1]-v[1])<.03)continue;walls.push({segment:[u,v],x:(u[0]+v[0])/2,z:(u[1]+v[1])/2,w:Math.max(.03,Math.abs(u[0]-v[0])),d:Math.max(.03,Math.abs(u[1]-v[1])),sight:true,cabin:true});}
  }
 });
 return cabin;
}

export function installAllosaurus(gltf,monster){
 for(const child of [...monster.children])monster.remove(child);
 const model=gltf.scene;model.name='Allosaurus fragilis';model.rotation.y=Math.PI;model.position.y=.02;
 model.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.material.roughness=.88;o.material.metalness=0;o.material.color.multiplyScalar(.85)}});monster.add(model);
 const mixer=new THREE.AnimationMixer(model),actions=new Map();const names={idle:'G_Iddle',walk:'G_Walk',run:'G_Run',attack:'G_Atack',hit:'G_Hit',call:'G_Call'};
 for(const [name,suffix] of Object.entries(names)){const clip=gltf.animations.find(a=>a.name.endsWith(suffix));if(clip){const action=mixer.clipAction(clip);if(name==='attack')action.timeScale=2.3;if(name==='call')action.timeScale=1.35;actions.set(name,action)}}
 let current,currentName='';function update(dt,name='idle'){if(name!==currentName&&actions.has(name)){const next=actions.get(name);next.reset().setEffectiveWeight(1).play();if(current)current.crossFadeTo(next,.18,false);current=next;currentName=name}mixer.update(dt)}update(0,'idle');
 return {update,model,mixer,actions};
}

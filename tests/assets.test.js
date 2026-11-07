import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as THREE from '../dist/assets/three.module.min.js';
import {GLTFLoader} from '../dist/assets/GLTFLoader.js';
import {createGameAssets} from '../dist/game-assets.js';
import {blocked,sightBlocked,ITEMS} from '../dist/game-core.js';

test('actual uploaded GLBs parse, animate and fit the desktop and portrait view',async()=>{
 const previousFetch=globalThis.fetch;globalThis.self=globalThis;
 globalThis.fetch=async path=>new Response(await fs.readFile(new URL('../dist/'+String(path).replace(/^\.\//,''),import.meta.url)));
 try{
  const loader=new GLTFLoader();loader.register(()=>({name:'cpu-texture-decoding',loadTexture:()=>Promise.resolve(new THREE.Texture())}));
  const scene=new THREE.Scene(),car=new THREE.Group(),fallback=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial());car.add(fallback);scene.add(car);
  const trunk=new THREE.InstancedMesh(new THREE.BoxGeometry(),fallback.material,8),foliage=new THREE.InstancedMesh(new THREE.BoxGeometry(),fallback.material,24);
  const treeSpots=Array.from({length:8},(_,i)=>({x:8+i*3,z:i*3-10,h:9}));
  const monster=new THREE.Group();scene.add(monster);
  const walls=[{x:ITEMS[0].x,z:ITEMS[0].z,w:2,d:1},{x:-10,z:-10.7,w:.9,d:.6}];
  const assets=createGameAssets({scene,car,treeSpots,trunk,foliage,walls,monster,loader});await assets.ready;
  assert.deepEqual(assets.diagnostics.failed,[]);assert.equal(assets.diagnostics.loaded.length,6);assert.equal(fallback.visible,false);
  assert.equal(scene.children.filter(o=>o.isInstancedMesh).length,3);
  // Reach the actual cabin pickups from outside without crossing the imported walls.
  const cells=[[-48,-10]],visited=new Set(['-48,-10']);
  for(let i=0;i<cells.length;i++){
   const [x,z]=cells[i];for(const [dx,dz] of [[0,1],[0,-1],[1,0],[-1,0]]){
    const a=x+dx,b=z+dz,key=a+','+b;
    if(a< -72||a> -20||b< -80||b>0||visited.has(key)||blocked(a/4,b/4,walls))continue;
    visited.add(key);cells.push([a,b]);
   }
  }
  for(const target of [{id:'note',x:-12,z:-6,r:2.5},{id:'revolver',x:-10,z:-10.7,r:1.7},{...ITEMS[0],r:2.4}]){
   assert.ok(cells.some(([x,z])=>Math.hypot(x/4-target.x,z/4-target.z)<target.r&&!sightBlocked({x:x/4,z:z/4},target,walls)),target.id+' must be reachable from the road');
  }
  const head=monster.getObjectByName('DEF-head_010');assert.ok(head,'uploaded dinosaur rig');
  for(const name of ['idle','walk','run','attack','hit','call']){
   for(let i=0;i<30;i++)assets.animateEnemy(1/60,name);
   monster.updateMatrixWorld(true);const p=head.getWorldPosition(new THREE.Vector3());
   assert.ok(p.toArray().every(Number.isFinite),name+' yields valid joint transforms');
   assert.ok(p.z>0,name+' faces the movement direction');
  }
  for(const aspect of [16/9,390/844]){
   for(let i=0;i<90;i++)assets.update(1/60,{playing:true,weapon:true,moving:0,running:false,repairing:false,lightOn:true,reduced:true,aspect});
   assets.viewScene.updateMatrixWorld(true);assets.viewCamera.updateMatrixWorld(true);
   for(const name of ['view-revolver','view-flashlight']){const model=assets.viewScene.getObjectByName(name);const world=model.getWorldPosition(new THREE.Vector3());const screen=world.project(assets.viewCamera);assert.ok(Math.abs(screen.x)<1,name+' must be visible horizontally at aspect '+aspect);assert.ok(Math.abs(screen.y)<1,name+' must be visible vertically');assert.ok(screen.z<1&&screen.z>-1);}
   const hand=assets.viewScene.getObjectByName('handR'),index=assets.viewScene.getObjectByName('f_index02R'),gun=assets.viewScene.getObjectByName('view-revolver');
   assert.ok(index.quaternion.angleTo(new THREE.Quaternion())>.8,'trigger finger bends instead of pointing like a finger gun');
   const relative=hand.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(gun.getWorldQuaternion(new THREE.Quaternion()));
   assets.fire();for(let i=0;i<20;i++)assets.update(1/60,{playing:true,weapon:true,moving:1,running:false,repairing:false,lightOn:true,reduced:false,aspect});
   assets.viewScene.updateMatrixWorld(true);
   const after=hand.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(gun.getWorldQuaternion(new THREE.Quaternion()));
   assert.ok(relative.angleTo(after)<.01,'revolver follows the wrist during recoil');
   for(let i=0;i<40;i++)assets.update(1/60,{playing:true,weapon:true,moving:0,running:false,repairing:false,lightOn:true,reduced:false,aspect});
  }
 }finally{globalThis.fetch=previousFetch}
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as THREE from '../dist/assets/three.module.min.js';
import {GLTFLoader} from '../dist/assets/GLTFLoader.js';
import {createGameAssets} from '../dist/game-assets.js';

test('actual uploaded GLBs parse, animate and fit the desktop and portrait view',async()=>{
 const previousFetch=globalThis.fetch;globalThis.self=globalThis;
 globalThis.fetch=async path=>new Response(await fs.readFile(new URL('../dist/'+String(path).replace(/^\.\//,''),import.meta.url)));
 try{
  const loader=new GLTFLoader();loader.register(()=>({name:'cpu-texture-decoding',loadTexture:()=>Promise.resolve(new THREE.Texture())}));
  const scene=new THREE.Scene(),car=new THREE.Group(),fallback=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial());car.add(fallback);scene.add(car);
  const trunk=new THREE.InstancedMesh(new THREE.BoxGeometry(),fallback.material,8),foliage=new THREE.InstancedMesh(new THREE.BoxGeometry(),fallback.material,24);
  const treeSpots=Array.from({length:8},(_,i)=>({x:8+i*3,z:i*3-10,h:9}));const assets=createGameAssets({scene,car,treeSpots,trunk,foliage,walls:[],loader});await assets.ready;
  assert.deepEqual(assets.diagnostics.failed,[]);assert.equal(assets.diagnostics.loaded.length,4);assert.equal(fallback.visible,false);
  assert.equal(scene.children.filter(o=>o.isInstancedMesh).length,4);
  for(const aspect of [16/9,390/844]){
   for(let i=0;i<90;i++)assets.update(1/60,{playing:true,weapon:true,moving:0,running:false,repairing:false,lightOn:true,reduced:true,aspect});
   assets.viewScene.updateMatrixWorld(true);assets.viewCamera.updateMatrixWorld(true);
   for(const name of ['view-revolver','view-flashlight']){const model=assets.viewScene.getObjectByName(name);const world=model.getWorldPosition(new THREE.Vector3());const screen=world.project(assets.viewCamera);assert.ok(Math.abs(screen.x)<1,name+' must be visible horizontally at aspect '+aspect);assert.ok(Math.abs(screen.y)<1,name+' must be visible vertically');assert.ok(screen.z<1&&screen.z>-1);}
   assets.fire();for(let i=0;i<60;i++)assets.update(1/60,{playing:true,weapon:true,moving:1,running:false,repairing:false,lightOn:true,reduced:false,aspect});
  }
 }finally{globalThis.fetch=previousFetch}
});

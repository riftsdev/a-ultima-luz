import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import * as RealThree from '../dist/assets/three.module.min.js';
import * as Core from '../dist/game-core.js';
test('scene initializes and complete playable journey reaches victory',()=>{
 const nodes=new Map(),storage=new Map();
 const node=id=>{if(nodes.has(id))return nodes.get(id);const n={id,hidden:false,style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},getContext(){return{fillRect(){},strokeRect(){},fillText(){}}},setPointerCapture(){},getBoundingClientRect(){return{left:0,top:0,width:112,height:112}},showModal(){this.open=true},close(){this.open=false},requestPointerLock(){return Promise.resolve()}};nodes.set(id,n);return n};
 class Renderer{setClearColor(){}setPixelRatio(){}setSize(){}render(){}}
 class Loader{load(){return new RealThree.Texture()}}
 class Clock{getDelta(){return 1/60}}
 const document={body:node('body'),getElementById:node,createElement:node,addEventListener(){},hidden:false,pointerLockElement:null};
 const sandbox={THREE:{...RealThree,WebGLRenderer:Renderer,TextureLoader:Loader,Clock},...Core,document,window:{},innerWidth:1280,innerHeight:800,devicePixelRatio:1,matchMedia:()=>({matches:false}),localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},addEventListener(){},requestAnimationFrame(){},setTimeout(){},console,Audio:class{play(){return Promise.resolve()}pause(){}}};
 const context=vm.createContext(sandbox);let code=fs.readFileSync(new URL('../dist/game.js',import.meta.url),'utf8').replace(/^import .*;$/gm,'');
 code+='\nglobalThis.api={start,loop,interact,updateInteraction,updatePlayer,updateEnemy,closeDialog,player,enemy,keys,walls,flare,backMenu,die,getState:()=>state,getMode:()=>mode,getCutTime:()=>cutTime};';
 vm.runInContext(code,context);const a=context.api;assert.equal(context.window.gameReady,true);assert.equal(a.getMode(),'menu');assert.ok(a.walls.length>100);
 a.start(false);assert.equal(a.getMode(),'cutscene');for(let i=0;i<1400;i++)a.loop();assert.equal(a.getMode(),'play');
 a.player.x=-12;a.player.z=-5;a.updateInteraction();a.interact();assert.equal(a.getMode(),'paused');assert.equal(a.getState().clue,true);a.closeDialog();assert.equal(a.getMode(),'play');
 for(const item of Core.ITEMS){a.player.x=item.x+1;a.player.z=item.z;a.updateInteraction();a.interact()}
 assert.equal(a.getState().items.length,3);assert.ok(storage.has('ultima-luz-save-v1'));
 a.player.x=0;a.player.z=26;a.keys.add('KeyE');for(let i=0;i<300;i++)a.updatePlayer(1/60);a.keys.clear();assert.equal(a.getState().repair,100);a.updateInteraction();a.interact();assert.equal(a.getMode(),'ending');for(let i=0;i<365;i++)a.loop();assert.equal(a.getMode(),'won');assert.equal(storage.has('ultima-luz-save-v1'),false);
 a.backMenu();a.start(false);assert.equal(node('skip').hidden,false);node('skip').onclick();a.getState().clue=true;a.getState().health=1;a.enemy.active=true;a.enemy.x=a.player.x;a.enemy.z=a.player.z;for(let i=0;i<800;i++)a.loop();
});
test('downloaded assets, all cached files and home screen icons exist',()=>{const root=new URL('../dist/',import.meta.url);const sw=fs.readFileSync(new URL('sw.js',root),'utf8'),assets=sw.match(/const ASSETS=\[(.*?)\]/s)[1].match(/'([^']+)'/g).map(s=>s.slice(1,-1));for(const f of assets){const path=new URL(f==='./'?'index.html':f,root);assert.ok(fs.statSync(path).size>0,f)}const manifest=JSON.parse(fs.readFileSync(new URL('manifest.webmanifest',root)));for(const icon of manifest.icons){const b=fs.readFileSync(new URL(icon.src,root));assert.equal(b.subarray(1,4).toString(),'PNG');const size=Number(icon.sizes.split('x')[0]);assert.equal(b.readUInt32BE(16),size);assert.equal(b.readUInt32BE(20),size)}});

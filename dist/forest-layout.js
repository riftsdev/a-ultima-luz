export const VILLAGE_SITES=[[-29,8,0],[-29,19,0],[29,9,0],[29,21,0],[18,42,0]];
export const TRAILS=[[[ -4,9],[-12,-4.5]], [[-12,-4.5],[-18,-4.5]], [[-18,-4.5],[-18.5,-23]], [[-18.5,-23],[-20,-37]], [[4,-14.8],[19,-25]]];
export function segmentDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)}
export function clearForVegetation(x,z,margin=0){return VILLAGE_SITES.every(([hx,hz])=>Math.abs(x-hx)>4+margin||z<hz-4-margin||z>hz+5+margin)&&Math.abs(x)>4.9+margin&&!(x>-19-margin&&x<-5+margin&&z>-21-margin&&z<-3+margin)&&Math.hypot(x-19,z+27)>7+margin&&Math.hypot(x+20,z+37)>7+margin&&Math.hypot(x,z-30)>8+margin&&TRAILS.every(([a,b])=>segmentDistance(x,z,a,b)>2.7+margin)}
export function createForestLayout(){let seed=42471;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const trees=[],plants=[],rocks=[];
 for(let i=0;i<2600&&trees.length<290;i++){const x=(random()-.5)*120,z=random()*135-70;if(!clearForVegetation(x,z,1)||trees.some(t=>Math.hypot(t.x-x,t.z-z)<4.4))continue;trees.push({x,z,h:6.3+random()*5.4,r:1.2+random()*.8,rotation:random()*Math.PI*2,tone:.75+random()*.25})}
 for(let i=0;i<1800&&plants.length<240;i++){const x=(random()-.5)*90,z=random()*107-51;if(!clearForVegetation(x,z))continue;plants.push({x,z,scale:.35+random()*.7,rotation:random()*Math.PI*2})}
 for(let i=0;i<180&&rocks.length<32;i++){const x=(random()-.5)*82,z=random()*103-49;if(!clearForVegetation(x,z,.5))continue;rocks.push({x,z,scale:.25+random()*.65,rotation:random()*Math.PI*2})}
 return {trees,plants,rocks};
}

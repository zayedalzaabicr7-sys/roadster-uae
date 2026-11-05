/* Roadster Dash UAE — v10: garage customisation, tuning, particles, speed FX (original code) */
(function(){'use strict';
var V=window.__v10={};
function U(){return window.__uae}
var LS={get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
// ---------------- data ----------------
var EMIRATES={DUBAI:{en:'DUBAI',ar:'دبي',band:'#ffffff',txt:'#111',code:'#111',codeBg:null},
 'ABU DHABI':{en:'ABU DHABI',ar:'أبوظبي',band:'#c8102e',txt:'#fff',code:'#fff',codeBg:'#c8102e'},
 SHARJAH:{en:'SHARJAH',ar:'الشارقة',band:'#f28c28',txt:'#111',code:'#111',codeBg:null},
 AJMAN:{en:'AJMAN',ar:'عجمان',band:'#1f3f8f',txt:'#fff',code:'#1f3f8f',codeBg:null},
 'UMM AL QUWAIN':{en:'U.A.Q',ar:'أم القيوين',band:'#7a1f2b',txt:'#fff',code:'#7a1f2b',codeBg:null},
 'RAS AL KHAIMAH':{en:'R.A.K',ar:'رأس الخيمة',band:'#b5121b',txt:'#fff',code:'#b5121b',codeBg:null},
 FUJAIRAH:{en:'FUJAIRAH',ar:'الفجيرة',band:'#00843d',txt:'#fff',code:'#00843d',codeBg:null}};
var PRESETS=[['#f4f4f2','Pearl white'],['#0d0d0f','Obsidian'],['#c8102e','UAE red'],['#00843d','Emirati green'],['#d4af37','Gold'],['#1d4ed8','Electric blue'],['#7c3aed','Purple'],['#f97316','Desert orange'],['#9ca3af','Silver'],['#e8d3a8','Sand'],['#0e7490','Gulf teal'],['#ec4899','Pink']];
var FIN={gloss:{en:'Gloss',m:.15,r:.22,cc:1},metallic:{en:'Metallic',m:.75,r:.26,cc:1},matte:{en:'Matte',m:.05,r:.9,cc:0},chrome:{en:'Chrome',m:1,r:.08,cc:1}};
var TYRES={sport:{en:'Sport',ar:'رياضي',hand:1,speed:1,accel:1,jump:1,w:1,r:1,col:0x0c0c0d,ro:.92,grip:1,sand:.8,desc:'Balanced road grip'},
 offroad:{en:'Off-road',ar:'طرق وعرة',hand:.95,speed:.97,accel:.98,jump:1.1,w:1.14,r:1.07,col:0x1b1916,ro:.98,grip:.9,sand:1.15,desc:'Chunky tread — best in dunes, higher jumps'},
 drift:{en:'Drift',ar:'درفت',hand:1.07,speed:1,accel:.97,jump:1,w:1.04,r:1,col:0x1a1a1c,ro:.7,grip:.72,sand:.75,desc:'Loose rear — slides easily, quick lane changes'},
 slick:{en:'Slick',ar:'سليك',hand:.95,speed:1.04,accel:1.05,jump:.97,w:1.12,r:.99,col:0x080808,ro:.55,grip:1.15,sand:.55,desc:'Track rubber — fastest on tarmac, bad on sand'}};
var MODS={engine:{en:'Engine',ar:'المحرك',lv:['Stock','Stage 1','Stage 2','Stage 3','Twin-turbo V8','STRONGEST ENGINE ⚡ V12'],speed:[0,.03,.06,.09,.12,.16],accel:[0,.1,.2,.3,.42,.56]},
 exhaust:{en:'Exhaust',ar:'العادم',lv:['Stock','Sport','Straight-pipe','Titanium flame'],speed:[0,.01,.02,.03],boost:[0,.01,.02,.03]},
 turbo:{en:'Turbo / Nitro',ar:'تيربو / نيترو',lv:['None','Turbo','Nitro','Twin nitro'],boost:[0,.05,.1,.16],airUse:[1,.9,.8,.7]},
 susp:{en:'Suspension',ar:'التعليق',lv:['Comfort','Sport','Rally','Air-ride'],hand:[0,.05,.1,.14],jump:[0,.03,.08,.05]},
 weight:{en:'Weight',ar:'الوزن',lv:['Stock','Lightweight','Carbon','Race-stripped'],accel:[0,.05,.1,.15],hand:[0,.02,.04,.06],jump:[0,.02,.04,.06]}};
var DEFP={camry:'#c0c4c8',lexus:'#0d0d0f',maxima:'#c8102e',landcruiser:'#f4f4f2',hilux:'#f4f4f2'};
function defCar(k){return{paint:{on:!!DEFP[k],hex:DEFP[k]||'#c8102e',fin:'metallic'},livery:true,rim:{on:false,hex:'#d4af37'},tyre:'sport',mods:{engine:0,exhaust:0,turbo:0,susp:0,weight:0,flight:0}}}
var C=LS.get('uae_custom',null);if(!C||typeof C!=='object')C={};C.cars=C.cars||{};C.plate=C.plate||{em:'DUBAI',code:'A',num:'971'};
function carKey(){var u=U();return u?u.A.car:'roadster'}
function cfg(k){k=k||carKey();var d=defCar(k),c=C.cars[k];if(!c){c=C.cars[k]=d}else{for(var x in d)if(c[x]==null)c[x]=d[x];for(var m in d.mods)if(c.mods[m]==null)c.mods[m]=0}return c}
function persist(){LS.set('uae_custom',C)}
Object.defineProperty(V,'C',{get:function(){return cfg()}});
V.cfg=cfg;V.TYRES=TYRES;V.MODS=MODS;
// ---------------- stats / mods ----------------
function fairActive(){var A=U()&&U().A;return !!(A&&A.market&&A.fair!==false)}
function modVals(k,ignoreFair){var c=cfg(k),o={speed:1,accel:1,hand:1,boost:1,jump:1,airUse:1};if(!ignoreFair&&fairActive())return o;
 Object.keys(MODS).forEach(function(m){var M=MODS[m],l=c.mods[m]||0;['speed','accel','hand','boost','jump'].forEach(function(s){if(M[s])o[s]+=M[s][l]});if(M.airUse)o.airUse*=M.airUse[l]});
 var t=TYRES[c.tyre]||TYRES.sport;['speed','accel','hand','jump'].forEach(function(s){o[s]*=t[s]});
 o.speed=Math.min(o.speed,1.22);return o}
V.modVals=modVals;
function stats(k){var u=U(),b=(u&&u.STATS[k])||{speed:1,accel:1,hand:1,boost:1,jump:1},m=modVals(k,true);return{speed:b.speed*m.speed,accel:b.accel*m.accel,hand:b.hand*m.hand,boost:b.boost*m.boost,jump:b.jump*m.jump}}
V.stats=stats;
V.speedMult=function(){var m=modVals();return m.speed};
function flightOn(){var A=U()&&U().A;if(!A)return false;if(A.flyRun)return true;return !fairActive()&&!!cfg().mods.flight}
V.flightOn=flightOn;
// make admin inf/jumps also honour the runner flight pack
function hookAdmin(){var A=window.__adm;if(!A||A._v10)return;A._v10=1;['inf','jumps'].forEach(function(k){var v=!!A[k];Object.defineProperty(A,k,{get:function(){return v||(A.inRun&&flightOn())},set:function(x){v=!!x},configurable:true})});
 var sv=A.save;}
// ---------------- plate texture ----------------
function validPlate(p){var e=EMIRATES[p.em]?null:'Choose an emirate';var code=String(p.code||'').toUpperCase().trim(),num=String(p.num||'').trim();
 if(!e&&!/^([A-Z]{1,2}|[1-9][0-9]?)$/.test(code))e='Code: 1–2 letters (A–Z) or a number 1–99';
 if(!e&&!/^[1-9][0-9]{0,4}$/.test(num))e='Number: 1–5 digits, no leading zero';return e}
V.validPlate=validPlate;
function drawPlate(p,cv){cv=cv||document.createElement('canvas');cv.width=512;cv.height=256;var g=cv.getContext('2d'),E=EMIRATES[p.em]||EMIRATES.DUBAI;
 g.fillStyle='#fff';g.fillRect(0,0,512,256);g.lineWidth=10;g.strokeStyle='#111';
 // top band with emirate name
 if(E.band!=='#ffffff'){g.fillStyle=E.band;g.fillRect(8,8,496,74)}
 g.fillStyle=E.band!=='#ffffff'?E.txt:'#111';g.textAlign='center';g.textBaseline='middle';
 g.font='bold 44px Arial';g.fillText(E.en,p.em==='DUBAI'?190:256,47);
 g.font='bold 40px Arial';if(p.em==='DUBAI'){g.fillText(E.ar,400,47)}else{g.font='bold 30px Arial';g.fillText('',0,0)}
 if(p.em!=='DUBAI'){g.font='bold 30px Arial';g.textAlign='right';g.fillText(E.ar,492,47);g.textAlign='left';g.font='bold 22px Arial';g.fillText('UAE',22,47);g.textAlign='center'}
 g.strokeRect(5,5,502,246);
 // code + number
 var code=String(p.code||'').toUpperCase(),num=String(p.num||'');
 if(E.codeBg){g.fillStyle=E.codeBg;g.fillRect(14,92,118,150);g.fillStyle='#fff'}else g.fillStyle=E.code;
 g.font='bold '+(code.length>1?74:92)+'px Arial';g.fillText(code,73,170);
 g.fillStyle='#111';var fs=num.length>4?118:136;g.font='bold '+fs+'px Arial';
 var w=g.measureText(num).width,max=350;if(w>max){g.font='bold '+Math.floor(fs*max/w)+'px Arial'}g.fillText(num,326,172);
 return cv}
V.drawPlate=drawPlate;
var plateT=null,plateKey='';
function plateTexture(){var T=window.__T;if(!T)return null;var k=JSON.stringify(C.plate);if(plateT&&k===plateKey)return plateT;var cv=drawPlate(C.plate),t=new T.CanvasTex(cv);t.colorSpace=T.SRGB;t.anisotropy=8;if(plateT)plateT.dispose();plateT=t;plateKey=k;return t}
V.plateTexture=plateTexture;
function applyPlate(){var u=U(),T=window.__T;if(!u||!T)return;var t=plateTexture();var S=u.shared(T);if(S.plate.map!==t){S.plate.map=t;S.plate.needsUpdate=true}
 (window.__carBodies||[]).forEach(function(o){o.body.traverse(function(m){if(m.isMesh&&m.material&&m.material.map&&m.material!==S.plate){var im=m.material.map.image;if(im&&(im.width===256&&im.height===128||m.material.userData.v10plate)){if(m.material.map!==t){m.material.map=t;m.material.userData.v10plate=1;m.material.needsUpdate=true}}}})})}
V.applyPlate=applyPlate;
// ---------------- apply customisation to car bodies ----------------
V.afterColor=function(){var u=U();if(!u)return;var k=u.A.car,c=cfg(k),T=window.__T;
 (window.__carBodies||[]).forEach(function(o){var M=o.mats,X=o.body.userData.ex;if(!M)return;
  if(c.paint.on&&!(u.GLB[k]&&u.GLB[k].noPaint)){var f=FIN[c.paint.fin]||FIN.metallic;M.body.color.set(c.paint.hex);M.body.metalness=f.m;M.body.roughness=f.r;if(M.body.isMeshPhysicalMaterial)M.body.clearcoat=f.cc;
   if(X&&X.userData.paints)X.userData.paints.forEach(function(p){p.color.set(c.paint.hex);p.metalness=Math.min(.9,f.m);p.roughness=Math.max(.06,f.r);if('clearcoat'in p)p.clearcoat=f.cc})}
  var LG=o.body.userData.livG;if(LG)LG.visible=c.livery!==false&&!X;
  // rims
  var rimC=c.rim.on?c.rim.hex:null;
  if(X&&X.userData.rims)X.userData.rims.forEach(function(m){if(rimC){m.color.set(rimC);m.metalness=.85;m.roughness=.25}else{m.color.setHex(m.userData.rim0)}});
  if(!X){[M.wheelInsert,M.wheelSpoke].forEach(function(m){if(!m)return;if(m.userData.c0==null)m.userData.c0=m.color.getHex();if(rimC)m.color.set(rimC);else m.color.setHex(m.userData.c0)})}
  // tyres
  var ty=TYRES[c.tyre]||TYRES.sport;
  if(X&&X.userData.tyres)X.userData.tyres.forEach(function(m){m.color.setHex(ty.col);m.roughness=ty.ro});
  if(!X&&M.tire){M.tire.color.setHex(ty.col);M.tire.roughness=ty.ro}
  if(X&&X.userData.wheels){var W=X.userData.wheels;Object.keys(W).forEach(function(n){var g=W[n];if(g.userData.y0==null)g.userData.y0=g.position.y;g.scale.set(ty.w,ty.r,ty.r);g.position.y=g.userData.y0*ty.r})}
  else if(o.wheels)o.wheels.forEach(function(w){w.wheel.scale.set(ty.w,ty.r,ty.r)})});
 applyPlate()};
// ---------------- particles (pooled billboards) ----------------
var softTex=null;function soft(){if(softTex)return softTex;var T=window.__T,c=document.createElement('canvas');c.width=c.height=64;var g=c.getContext('2d'),gr=g.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.45,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);softTex=new T.CanvasTex(c);softTex.colorSpace=T.SRGB;return softTex}
function Pool(scene,max){var T=window.__T,geo=new T.Plane(1,1),L=[],self=this;this.L=L;this.scene=scene;
 for(var i=0;i<max;i++){var m=new T.Mesh(geo,new T.Basic({map:soft(),transparent:true,depthWrite:false,opacity:0,color:0xffffff}));m.visible=false;m.renderOrder=30;m.frustumCulled=false;m.userData.p={life:0,age:0,v:[0,0,0],s0:1,s1:2,a:1,add:false};scene.add(m);L.push(m)}
 this.i=0;this.active=0}
Pool.prototype.emit=function(x,y,z,vx,vy,vz,s0,s1,life,col,a,add){var m=null;for(var n=0;n<this.L.length;n++){var c=this.L[(this.i+n)%this.L.length];if(!c.visible){m=c;this.i=(this.i+n+1)%this.L.length;break}}
 if(!m){m=this.L[this.i];this.i=(this.i+1)%this.L.length}
 var p=m.userData.p;m.position.set(x,y,z);p.v[0]=vx;p.v[1]=vy;p.v[2]=vz;p.s0=s0;p.s1=s1;p.life=life;p.age=0;p.a=a;m.material.color.setHex(col);
 var bl=add?2:1;if(m.material.blending!==bl){m.material.blending=bl;m.material.needsUpdate=true}m.visible=true;m.scale.setScalar(s0);m.material.opacity=a};
Pool.prototype.update=function(dt,cam,dz){for(var i=0;i<this.L.length;i++){var m=this.L[i];if(!m.visible)continue;var p=m.userData.p;p.age+=dt;var t=p.age/p.life;if(t>=1){m.visible=false;continue}
 m.position.x+=p.v[0]*dt;m.position.y+=p.v[1]*dt;m.position.z+=(p.v[2]+(dz||0))*dt;p.v[0]*=1-dt*1.5;p.v[1]*=1-dt*1.2;p.v[2]*=1-dt*1.5;
 m.scale.setScalar(p.s0+(p.s1-p.s0)*Math.sqrt(t));m.material.opacity=p.a*Math.pow(1-t,1.3);m.quaternion.copy(cam.quaternion)}};
V.Pool=Pool;
// world positions of car wheels and rear nozzles
var tv=null;function vec(){if(!tv){var Vc=window.__rd.camera.position.constructor;tv=new Vc()}return tv}
function wheelPoints(ent){var out=[],X=ent.body.userData.ex,v=vec();
 if(X&&X.userData.wheels){var W=X.userData.wheels;['LF','RF','LB','RB'].forEach(function(n){var g=W[n];if(!g)return;g.getWorldPosition(v);out.push({n:n,x:v.x,y:v.y,z:v.z})})}
 else if(ent.wheels)ent.wheels.forEach(function(w){w.wheel.getWorldPosition(v);var q=w.wheel.position;out.push({n:(q.x<0?'L':'R')+(q.z<0?'F':'B'),x:v.x,y:v.y,z:v.z})});return out}
function nozzlePoints(ent){var out=[],v=vec();if(ent&&ent.nozzles)Object.keys(ent.nozzles).forEach(function(k){if(k[0]!=='R')return;ent.nozzles[k].getWorldPosition(v);out.push({x:v.x,y:v.y,z:v.z})});return out}
V.wheelPoints=wheelPoints;V.nozzlePoints=nozzlePoints;
function exhaustCol(){var l=cfg().mods.exhaust||0;return [0xff8a2a,0xff6a1a,0xff4a10,0x6a8cff][l]}
V.exhaustCol=exhaustCol;
// ---------------- runner effects ----------------
var RP=null,prevG=true,trailT=0,prevBoost=false,flameT=0;
function playerEnt(){var rd=window.__rd;if(!rd||!rd.player||!rd.player.car)return null;var b=rd.player.car.body;return (window.__carBodies||[]).filter(function(o){return o.body===b})[0]||null}
function dustCol(){var w=U()&&U().A.world;return w==='liwa'?0xe2b27a:w==='jais'?0xb8aaa0:0xd8cfc4}
function runnerFX(dt){var rd=window.__rd,p=window.__player;if(!rd||!p)return;if(!RP){RP=new Pool(rd.scene,140);V.RP=RP}
 var dz=rd.state==='playing'?(rd.speed||0):0,ent=playerEnt();
 if(rd.state==='playing'&&ent){var g=!!p.grounded;
  if(prevG&&!g){wheelPoints(ent).forEach(function(w){if(w.n[1]!=='B')return;for(var i=0;i<4;i++)RP.emit(w.x+(Math.random()-.5)*.3,.15,w.z+Math.random()*.3,(Math.random()-.5)*1.5,.6+Math.random(),.5+Math.random()*1.5,.35,1.5,.75,dustCol(),.55)})}
  if(!prevG&&g){wheelPoints(ent).forEach(function(w){for(var i=0;i<4;i++)RP.emit(w.x+(Math.random()-.5)*.4,.12,w.z+(Math.random()-.5)*.4,(w.x<0?-1:1)*(1+Math.random()*2),.4+Math.random()*.8,(Math.random()-.2)*2,.4,1.9,.9,dustCol(),.6)})}
  prevG=g;
  if(!g&&(p.y||0)>.25){trailT-=dt;if(trailT<=0){trailT=.035;nozzlePoints(ent).forEach(function(n){RP.emit(n.x+(Math.random()-.5)*.1,n.y,n.z+.1,(Math.random()-.5)*.4,-.2+Math.random()*.3,1.5,.22,1.1,.7,0xe6e6e6,.42)})}}
  if(p.boosting&&(cfg().mods.exhaust||0)>0&&!fairActive()){flameT-=dt;if(flameT<=0){flameT=.03;var c=exhaustCol();nozzlePoints(ent).forEach(function(n){RP.emit(n.x,n.y,n.z+.15,(Math.random()-.5)*.6,(Math.random()-.5)*.3,3+Math.random()*2,.28,.06,.22,c,.9,true)})}}
  if(p.boosting&&!prevBoost)exhaustPop();prevBoost=!!p.boosting}
 else{prevG=true;prevBoost=false}
 RP.update(dt,rd.camera,dz)}
// exhaust / pop sound via the game's own audio bus (respects mute)
function exhaustPop(gain){var au=window.__audio,l=cfg().mods.exhaust||0;if(!au||!au.ctx||au.muted||!au.enabled||l<1||fairActive())return;try{var c=au.ctx,t=c.currentTime,n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
 if(!V._nb){var b=c.createBuffer(1,c.sampleRate*.4,c.sampleRate),d=b.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);V._nb=b}
 n.buffer=V._nb;f.type='lowpass';f.frequency.value=[0,900,700,1400][l];g.gain.setValueAtTime((gain||.25)*(.6+l*.25),t);g.gain.exponentialRampToValueAtTime(.001,t+.35);n.connect(f);f.connect(g);g.connect(au.master||c.destination);n.start(t);n.stop(t+.4)}catch(e){}}
V.exhaustPop=exhaustPop;
// ---------------- speed FX: gauge, speed lines, FOV + shake ----------------
var FX={I:0,boost:0,kmh:0,shake:0};V.FX=FX;
var gauge,glc,lines,llc;
function mkFX(){if(gauge)return;gauge=document.createElement('canvas');gauge.id='v10-gauge';lines=document.createElement('canvas');lines.id='v10-lines';
 document.body.appendChild(lines);document.body.appendChild(gauge);glc=gauge.getContext('2d');llc=lines.getContext('2d');
 var st=document.createElement('style');st.textContent='#v10-gauge{position:fixed;right:18px;bottom:64px;width:168px;height:168px;z-index:12;pointer-events:none;display:none}#v10-lines{position:fixed;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;display:none}'+
 '@media (max-width:820px){#v10-gauge{width:132px;height:132px;right:10px;bottom:84px}}';document.head.appendChild(st)}
var lineSeeds=[];for(var i=0;i<70;i++)lineSeeds.push({a:Math.random()*Math.PI*2,r:Math.random(),l:.3+Math.random()*.7,s:.6+Math.random()*.8});
function drawLines(I,dt){var W=innerWidth,H=innerHeight,dpr=1;if(lines.width!==W||lines.height!==H){lines.width=W;lines.height=H}llc.clearRect(0,0,W,H);if(I<.05){return}
 var cx=W/2,cy=H*.46,R=Math.hypot(W,H)*.55;llc.lineCap='round';
 lineSeeds.forEach(function(s){s.r+=dt*s.s*(1.2+I*2.5);if(s.r>1){s.r=.25*Math.random();s.a=Math.random()*Math.PI*2}
  var r0=R*(.28+s.r*.75),r1=r0+R*.18*s.l*(.4+I);var ca=Math.cos(s.a),sa=Math.sin(s.a);
  llc.strokeStyle='rgba(255,255,255,'+(Math.min(.55,I*.55)*s.l*Math.min(1,s.r*3)).toFixed(3)+')';llc.lineWidth=1+I*2*s.l;llc.beginPath();llc.moveTo(cx+ca*r0,cy+sa*r0*.7);llc.lineTo(cx+ca*r1,cy+sa*r1*.7);llc.stroke()})}
function drawGauge(kmh,max,boost,rpm,gear,fly){var s=gauge.clientWidth||168,d=Math.min(2,devicePixelRatio||1),S=Math.round(s*d);if(gauge.width!==S){gauge.width=gauge.height=S}var g=glc;g.setTransform(S/168,0,0,S/168,0,0);g.clearRect(0,0,168,168);
 var cx=84,cy=88,R=70,a0=Math.PI*.75,a1=Math.PI*2.25;
 g.fillStyle='rgba(8,10,14,.62)';g.beginPath();g.arc(cx,cy,R+10,0,Math.PI*2);g.fill();
 g.lineWidth=8;g.strokeStyle='rgba(255,255,255,.12)';g.beginPath();g.arc(cx,cy,R-4,a0,a1);g.stroke();
 var f=Math.min(1,kmh/max),grad=g.createLinearGradient(20,0,150,0);grad.addColorStop(0,'#00c46a');grad.addColorStop(.6,'#f3d77a');grad.addColorStop(1,boost?'#ff3b6b':'#ff7a2a');
 g.strokeStyle=grad;g.beginPath();g.arc(cx,cy,R-4,a0,a0+(a1-a0)*f);g.stroke();
 g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=2;for(var i=0;i<=10;i++){var a=a0+(a1-a0)*i/10;g.beginPath();g.moveTo(cx+Math.cos(a)*(R-14),cy+Math.sin(a)*(R-14));g.lineTo(cx+Math.cos(a)*(R-20),cy+Math.sin(a)*(R-20));g.stroke()}
 var na=a0+(a1-a0)*f;g.strokeStyle=boost?'#ff3b6b':'#fff';g.lineWidth=3;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(na)*(R-18),cy+Math.sin(na)*(R-18));g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(cx,cy,4,0,Math.PI*2);g.fill();
 g.fillStyle='#fff';g.textAlign='center';g.font='bold 30px Arial';g.fillText(Math.round(kmh),cx,cy+30);g.font='bold 10px Arial';g.fillStyle='rgba(255,255,255,.7)';g.fillText('KM/H  كم/س',cx,cy+44);
 // RPM bar
 var n=14;for(var j=0;j<n;j++){var on=j/n<rpm;g.fillStyle=on?(j>=n-3?'#ff3b30':j>=n-6?'#f3d77a':'#00c46a'):'rgba(255,255,255,.14)';g.fillRect(36+j*7,cy-34,5,9)}
 g.font='bold 11px Arial';g.fillStyle='rgba(255,255,255,.8)';g.fillText(fly?'✈ FLY':'GEAR '+gear,cx,cy-40);
 if(boost){g.fillStyle='#ff3b6b';g.font='bold 11px Arial';g.fillText('BOOST',cx,cy+60)}}
var noise=[0,0,0];
function speedFX(dt){mkFX();var rd=window.__rd,fr=window.__fr&&__fr.active,kmh=0,max=320,boost=false,show=false,fly=false;
 if(fr){kmh=__fr.kmh();max=__fr.maxKmh();boost=__fr.boosting();fly=__fr.flying();show=true}
 else if(rd&&rd.state==='playing'){kmh=(rd.speed||0)*3.6;max=Math.max(260,(rd.normalSpeed?rd.normalSpeed():60)*3.6*1.5);boost=!!(rd.player&&rd.player.boosting);show=true}
 var tgt=show?Math.max(0,Math.min(1,(kmh/max-.32)/.55))+(boost?.35:0):0;FX.I+=(Math.min(1.25,tgt)-FX.I)*Math.min(1,dt*3);FX.boost=boost;FX.kmh=kmh;FX.show=show;
 gauge.style.display=show?'block':'none';lines.style.display=show?'block':'none';
 if(show){var gr=[0,60,110,160,215,270,9e9],gear=1;while(kmh>gr[gear]&&gear<6)gear++;var lo=gr[gear-1],hi=Math.min(gr[gear],max*1.1),rpm=Math.max(.12,Math.min(1,(kmh-lo)/Math.max(1,hi-lo)));drawGauge(kmh,max,boost,rpm,gear,fly);drawLines(FX.I,dt)}
 for(var i=0;i<3;i++)noise[i]+=((Math.random()-.5)*2-noise[i])*Math.min(1,dt*22)}
V.camFX=function(cam){if(!FX.show||FX.I<.02)return null;var I=FX.I,sv={fov:cam.fov,x:cam.position.x,y:cam.position.y,z:cam.position.z};
 cam.fov=cam.fov*(1+.13*I+(FX.boost?.04:0));var a=(.006+.02*Math.max(0,I-.3))*(FX.boost?1.8:1)*(window.__fr&&__fr.active?3:1);cam.position.x+=noise[0]*a;cam.position.y+=noise[1]*a;cam.position.z+=noise[2]*a*.5;cam.updateProjectionMatrix();return sv};
function wrapRender(){var rd=window.__rd;if(!rd||!rd.renderer||rd.renderer._v10)return;var R=rd.renderer,orig=R.render;R._v10=1;
 R.render=function(scene,camera){var sc=scene,cam=camera;
  if(window.__fr&&__fr.active&&camera&&camera.isPerspectiveCamera&&scene!==__fr.scene){sc=__fr.scene;cam=__fr.cam;__fr.frame()}
  var sv=(cam===rd.camera||(window.__fr&&cam===__fr.cam))?V.camFX(cam):null;
  try{orig.call(this,sc,cam)}finally{if(sv){cam.fov=sv.fov;cam.position.set(sv.x,sv.y,sv.z);cam.updateProjectionMatrix()}}}}
// ---------------- credits line per car ----------------
var CRED={human:'Characters: Quaternius Animated Men (CC0); HDRIs Poly Haven CC0; palms/towers Kenney CC0; textures Poly Haven + ambientCG CC0',sedan:'"Tesla Model 3" by David_Holiday',sport:'"Tesla Roadster 2020" by metarex.4d',truck:'"Tesla Cybertruck" by PolyDucky',suv:'"Tesla Model Y 2021" by 763468712',
 landcruiser:'"SUV" by Quaternius (CC0, Poly Pizza) — Land Cruiser-style',camry:'"Car" by Quaternius (CC0, Poly Pizza) — Camry-style',lexus:'"Sports Car" by Quaternius (CC0, Poly Pizza) — Lexus-style',maxima:'"Sports Car" by Quaternius (CC0, Poly Pizza) — Maxima-style',hilux:'"Toyota Hilux 97" by Muhammad Reyhan (CC BY 3.0, Poly Pizza)',patrol:'"Terrano" by Muhammad Reyhan (CC BY 3.0, Poly Pizza)',rr:'"Range Rover" by IvOfficial (CC BY 3.0, Poly Pizza)',rolls:'"Rolls Royce" by David Sirera (CC BY 3.0, Poly Pizza)',gtr:'"Nissan GTR" by David Sirera (CC BY 3.0, Poly Pizza)',police:'"Nissan GTR" by David Sirera (CC BY 3.0, Poly Pizza) — police livery added',f40:'"Ferrari 458 Italia" by vicent091036 (CC BY 4.0, via three.js examples)'};
function credLine(){var cr=document.getElementById('u-cred');if(!cr)return;var k=carKey(),t=CRED[k]?('3D model: '+CRED[k]+(/Poly Pizza/.test(CRED[k])?'':' (CC BY 4.0, Sketchfab)')+' · full list in models/CREDITS.txt'):'';if(cr._v10!==t){cr.textContent=t;cr._v10=t}}
V.CRED=CRED;
// ---------------- main loop ----------------
var last=0,plateCheck=0;
function loop(ts){var dt=Math.min(.1,(ts-last)/1000||0);last=ts;try{
 var rd=window.__rd;if(rd){hookAdmin();wrapRender();var m=modVals();window.__mods={accel:m.accel,boost:m.boost,jump:m.jump,hand:m.hand,airUse:m.airUse};
  runnerFX(dt);plateCheck-=dt;if(plateCheck<=0){plateCheck=.5;applyPlate()}credLine()}
 speedFX(dt)}catch(e){if(!V._err){V._err=1;console.warn('v10',e)}}requestAnimationFrame(loop)}
requestAnimationFrame(loop);
V.persist=persist;V.Cdata=function(){return C};V.EMIRATES=EMIRATES;V.PRESETS=PRESETS;V.FIN=FIN;V.fairActive=fairActive;
})();

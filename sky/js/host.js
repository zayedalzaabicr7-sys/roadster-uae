/* SKYBOLT UAE — standalone three.js host for Skybolt Match + Open Sky.
   Provides window.__T, __fr, __games stubs expected by sky.js / sky_look.js. Original. */
(function(){
'use strict';
var THREE = window.THREE;
if(!THREE){console.error('THREE missing');return}

window.__T = {
  Mesh: THREE.Mesh,
  Box: THREE.BoxGeometry,
  Std: THREE.MeshStandardMaterial,
  Basic: THREE.MeshBasicMaterial,
  Phys: THREE.MeshPhysicalMaterial,
  Group: THREE.Group,
  Cyl: THREE.CylinderGeometry,
  Plane: THREE.PlaneGeometry,
  CanvasTex: THREE.CanvasTexture,
  SRGB: THREE.SRGBColorSpace || THREE.sRGBEncoding,
  Cone: THREE.ConeGeometry,
  Sphere: THREE.SphereGeometry,
  Shape: THREE.Shape,
  Extrude: THREE.ExtrudeGeometry,
  Geo: THREE.BufferGeometry,
  Attr: THREE.BufferAttribute
};

var canvas = document.getElementById('game');
var renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1, 2));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace || undefined;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b7e8);
scene.fog = new THREE.Fog(0xb8d4f0, 200, 1800);

var cam = new THREE.PerspectiveCamera(72, innerWidth/innerHeight, 0.2, 4000);
cam.position.set(0, 8, 18);

var hemi = new THREE.HemisphereLight(0xcfe8ff, 0x8a7050, 0.85); scene.add(hemi);
var sun = new THREE.DirectionalLight(0xfff2d6, 1.35); sun.position.set(80, 140, 40); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.near=2; sun.shadow.camera.far=600;
sun.shadow.camera.left=sun.shadow.camera.bottom=-180; sun.shadow.camera.right=sun.shadow.camera.top=180;
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.22));

// ground plane (open sky falls onto desert-tint)
var ground = new THREE.Mesh(new THREE.CircleGeometry(900, 48), new THREE.MeshStandardMaterial({color:0xd2b48c, roughness:0.95}));
ground.rotation.x = -Math.PI/2; ground.position.y = -0.5; ground.receiveShadow = true; scene.add(ground);

// particle pool
function Pool(){
  this.L=[]; var geo=new THREE.PlaneGeometry(1,1), mat=new THREE.MeshBasicMaterial({transparent:true, depthWrite:false, blending:THREE.AdditiveBlending});
  for(var i=0;i<200;i++){var m=new THREE.Mesh(geo, mat.clone()); m.visible=false; scene.add(m); this.L.push({m:m, life:0});}
}
Pool.prototype.emit=function(x,y,z,vx,vy,vz,life,size,drag,col,a,add){
  for(var i=0;i<this.L.length;i++){var p=this.L[i]; if(p.life>0) continue;
    p.life=life||.4; p.vx=vx||0; p.vy=vy||0; p.vz=vz||0; p.drag=drag||1; p.size=size||.4;
    p.m.visible=true; p.m.position.set(x,y,z); p.m.scale.setScalar(p.size);
    p.m.material.color.setHex(col||0xffffff); p.m.material.opacity=a==null?.8:a; return}
};
Pool.prototype.upd=function(dt){
  this.L.forEach(function(p){ if(p.life<=0) return; p.life-=dt; if(p.life<=0){p.m.visible=false;return}
    p.vx*=Math.pow(.9,dt*60); p.vy*=Math.pow(.9,dt*60); p.vz*=Math.pow(.9,dt*60);
    p.m.position.x+=p.vx*dt; p.m.position.y+=p.vy*dt; p.m.position.z+=p.vz*dt;
    p.m.material.opacity*=Math.pow(.96,dt*60); p.m.lookAt(cam.position);});
};
var pool = new Pool();

var ST = {x:0,z:0,y:2,yaw:0,vx:0,vz:0,vy:0,vL:0,vT:0,air:false,fly:false,spin:0,steer:0,pitch:0,roll:0,boost:false,yawRate:0,hb:false,camMode:0,kmh:0,vmaxK:280};
var keys={}, TI={jx:0,jy:0,gas:0,brk:0,boost:0,hb:0,up:0,dn:0,jump:0};
function isTouch(){return 'ontouchstart' in window || navigator.maxTouchPoints>0}

function trafficCar(col){
  var g=new THREE.Group();
  var body=new THREE.Mesh(new THREE.BoxGeometry(1.8,.5,4), new THREE.MeshStandardMaterial({color:col||0xcccccc, metalness:.4, roughness:.35}));
  body.position.y=.5; body.castShadow=true; g.add(body);
  return g;
}

var playerCar = null;
function ensureCar(){
  if(playerCar) return playerCar;
  var g=new THREE.Group(), inner=new THREE.Group(); g.add(inner);
  // default red roadster from sky_look if available later
  var box=new THREE.Mesh(new THREE.BoxGeometry(1.85,.42,4.2), new THREE.MeshStandardMaterial({color:0xe11d2e, metalness:.55, roughness:.28}));
  box.position.y=.52; box.castShadow=true; inner.add(box);
  scene.add(g);
  playerCar={g:g, inner:inner, wheels:[], th:null, noz:[[-.4,.5,-2.1],[.4,.5,-2.1]]};
  return playerCar;
}

function heightAt(x,z){
  if(FR.hOver){var h=FR.hOver(x,z); if(h!=null) return h}
  return 0;
}

function inp(){
  var t=(keys.KeyW||keys.ArrowUp?1:0), b=(keys.KeyS||keys.ArrowDown?1:0);
  var s=(keys.KeyA||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0);
  t=Math.max(t, TI.gas); b=Math.max(b, TI.brk);
  if(Math.abs(TI.jx)>.08) s=-TI.jx;
  var up=(keys.Space&&ST.fly?1:0)||TI.up, dn=(keys.KeyC||keys.ControlLeft||keys.ControlRight?1:0)||TI.dn;
  var climb=up-dn; if(ST.fly&&Math.abs(TI.jy)>.15) climb=-TI.jy;
  return {t:t,b:b,s:Math.max(-1,Math.min(1,s)), hb:!ST.fly&&(!!keys.Space||!!TI.hb), boost:!!(keys.ShiftLeft||keys.ShiftRight||TI.boost), climb:climb};
}

function physics(dt){
  if(FR.physOverride){ FR.physOverride(dt); return }
  var I=inp(), fx=-Math.sin(ST.yaw), fz=-Math.cos(ST.yaw);
  var boostOK=I.boost&&(I.t>0||ST.air||ST.fly); ST.boost=boostOK;
  var vmax=48*(boostOK?1.35:1)*(ST.fly?1.25:1), acc=14*(boostOK?1.6:1);
  var vL=ST.vL||0;
  if(I.t) vL += acc*dt; else if(I.b) vL -= acc*.8*dt; else vL *= Math.exp(-1.6*dt);
  vL=Math.max(-vmax*.4, Math.min(vmax, vL));
  var turn=I.s*1.8*(ST.fly?.9:1)/(1+Math.abs(vL)/40);
  ST.yawRate += (turn - ST.yawRate)*Math.min(1,dt*6); ST.yaw += ST.yawRate*dt;
  fx=-Math.sin(ST.yaw); fz=-Math.cos(ST.yaw);
  ST.vx=fx*vL; ST.vz=fz*vL; ST.vL=vL;
  ST.x+=ST.vx*dt; ST.z+=ST.vz*dt;
  var gnd=heightAt(ST.x,ST.z);
  if(ST.fly){
    ST.vy += (I.climb*18 - ST.vy)*Math.min(1,dt*3);
    ST.y += ST.vy*dt;
    if(ST.y < gnd+1.2){ ST.y=gnd+1.2; ST.vy=Math.max(0,ST.vy) }
    if(ST.y>700){ ST.y=700; ST.vy=Math.min(0,ST.vy) }
    ST.air=true;
  } else {
    ST.vy -= 22*dt; ST.y += ST.vy*dt;
    if(ST.y <= gnd){ ST.y=gnd; ST.vy=0; ST.air=false } else ST.air=true;
  }
  ST.pitch = ST.fly ? Math.max(-.35, Math.min(.35, ST.vy*.02)) : 0;
  ST.roll = Math.max(-.45, Math.min(.45, ST.yawRate*.3));
  ST.kmh = Math.abs(vL)*3.6; ST.vmaxK = vmax*3.6;
}

function syncCar(){
  var c=ensureCar();
  c.g.position.set(ST.x, ST.y, ST.z);
  c.g.rotation.order='YXZ';
  c.g.rotation.y = ST.yaw;
  c.g.rotation.x = ST.pitch||0;
  c.g.rotation.z = ST.roll||0;
  if(c.th) c.th.visible = !!ST.fly;
}

function toast(msg){
  var el=document.getElementById('toast'); if(!el) return;
  el.textContent=msg; el.classList.add('on'); clearTimeout(toast._t);
  toast._t=setTimeout(function(){el.classList.remove('on')}, 2800);
}

function toggleFly(){
  ST.fly=!ST.fly;
  if(ST.fly){ ST.vy=Math.max(ST.vy,6); ST.air=true; toast('✈️ Flight ON — Space climb · C descend') }
  else toast('🚗 Flight OFF');
  var b=document.getElementById('btn-fly'); if(b) b.classList.toggle('on', ST.fly);
}

var FR = {
  active:true, W:{scene:scene, pool:pool, traffic:null, camPos:cam.position},
  cam:cam, ST:ST, keys:keys, input:TI, shake:0,
  hOver:null, physOverride:null, carQuat:null, foot:null,
  getCar:ensureCar, trafficCar:trafficCar, heightAt:heightAt,
  inp:inp, isTouch:isTouch, toast:toast, toggleFly:toggleFly,
  pending:false, onFrame:null, keyHook:null, onExit:null, onMg:null,
  boom:function(){}, enter:function(){FR.active=true},
  games:null
};
window.__fr = FR;

// ---------- games UI helpers (GM._x) ----------
var ui = {};
function mkUI(){
  if(ui.hud) return;
  ui.hud=document.getElementById('match-hud');
  ui.boost=document.getElementById('boost');
  ui.touch=document.getElementById('touch');
  ui.ctl=document.getElementById('ctl');
  ui.menu=document.getElementById('menu');
  ui.res=document.getElementById('results');
  ui.cd=document.getElementById('countdown');
}
function hudSet(a,b){
  mkUI();
  var s=document.getElementById('scoreline'), h=document.getElementById('hudhelp');
  if(s) s.innerHTML=a||''; if(h) h.innerHTML=b||'';
  if(ui.hud) ui.hud.style.display='flex';
}
function countdown(t,big){
  mkUI(); var el=ui.cd; if(!el) return;
  if(!t){ el.style.display='none'; el.textContent=''; return }
  el.style.display='block'; el.textContent=t; el.classList.toggle('big', !!big);
}
function results(title, lines, foot){
  mkUI(); var box=ui.res; if(!box) return;
  box.style.display='flex';
  box.innerHTML='<div class="panel"><h2>'+title+'</h2><ul>'+(lines||[]).map(function(l){return '<li>'+l+'</li>'}).join('')+'</ul><p>'+(foot||'')+'</p><button id="res-ok">OK</button></div>';
  document.getElementById('res-ok').onclick=function(){ box.style.display='none'; if(window.__skybolt) window.__skybolt.showMenu() };
}
function boom(x,y,z,col,n){
  for(var i=0;i<(n||40);i++){
    var a=Math.random()*Math.PI*2, e=Math.random()*12;
    pool.emit(x,y,z, Math.cos(a)*e, Math.random()*8, Math.sin(a)*e, .5+Math.random()*.4, .5, 1, col||0xffffff, 1, true);
  }
  FR.shake=.4;
}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function fmtT(s){s=Math.max(0,s|0); return ((s/60)|0)+':'+('0'+(s%60)).slice(-2)}

var COLS={0:'#2f7bff',1:'#ff8a1f'};
var NAMES=['Omar','Layla','Hassan','Noor','Yousef','Amira','Khalid','Sara','Majid','Huda','Faisal','Rania'];
var BCARS=['muscle','hatch','suv','roadster','muscle','hatch'];

var NET = {id:1, name:'Player', ok:false};
function online(){return !!NET.ok}
function send(m){ if(window.__skybolt && window.__skybolt.mpSend) window.__skybolt.mpSend(m) }

var GM = {
  cur:null, GAMES:{}, ballCam:true, meter:100, frozen:false, mp:{},
  stat:{flips:0}, last:null, RF:null, SKY:null, AERO:null,
  start:function(id,o){
    o=o||{}; var g=GM.GAMES[id]; if(!g){toast('Unknown mode');return}
    if(GM.cur) GM.stop(false);
    GM.last={id:id,o:o}; GM.stat={flips:0}; GM.cur=g; GM.meter=100; GM.frozen=false;
    document.body.classList.add('playing'); document.getElementById('menu').style.display='none';
    try{g.start(o)}catch(e){console.error(e); GM.cur=null; toast('Failed to start'); return}
    mkUI(); if(ui.ctl) ui.ctl.style.display='flex';
  },
  stop:function(user){
    var g=GM.cur; if(!g) return;
    try{g.end()}catch(e){}
    GM.cur=null; GM.frozen=false; FR.hOver=null; FR.physOverride=null;
    countdown(''); if(ui.hud) ui.hud.style.display='none'; if(ui.boost) ui.boost.style.display='none';
    if(ui.touch) ui.touch.style.display='none'; if(ui.ctl) ui.ctl.style.display='none';
    document.body.classList.remove('playing');
    if(user && window.__skybolt) window.__skybolt.showMenu();
  },
  openMenu:function(){ if(window.__skybolt) window.__skybolt.showMenu() },
  openGarage:function(){ if(window.__skybolt) window.__skybolt.showGarage() },
  _x:{COLS:COLS, NAMES:NAMES, BCARS:BCARS, hudSet:hudSet, countdown:countdown, results:results, ui:ui, mkUI:mkUI,
      freeze:function(v){GM.frozen=!!v}, placePlayer:function(){}, boom:boom, send:send, online:online, NET:function(){return NET},
      fmtT:fmtT, esc:esc, toast:toast}
};
window.__games = GM;
FR.games = GM;

// simple uae stub so Body.setModel falls through to procedural / trafficCar
window.__uae = {
  A:{car:'roadster', color:'red'},
  CARS:{roadster:{en:'Skybolt Roadster'}, muscle:{en:'Muscle'}, hatch:{en:'Hatch'}, suv:{en:'SUV'}},
  carModel:function(){return 'fail'}
};

// input
window.addEventListener('keydown', function(e){
  if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if(FR.keyHook && FR.keyHook(e.code, e)) { e.preventDefault(); return }
  keys[e.code]=true;
  if(e.code==='KeyF' && GM.cur && GM.cur.id==='aerow') toggleFly();
  if(e.code==='KeyB' && GM.cur){ GM.ballCam=!GM.ballCam }
  if(e.code==='Escape' && GM.cur){ GM.stop(true) }
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code)>=0) e.preventDefault();
}, true);
window.addEventListener('keyup', function(e){ keys[e.code]=false }, true);

window.addEventListener('resize', function(){
  renderer.setSize(innerWidth, innerHeight, false);
  cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix();
});


function chaseCam(){
  var c=ensureCar();
  var behind = 14 + Math.min(10, Math.abs(ST.vL)*.15);
  var height = ST.fly ? 5.5 : 3.8;
  var fx=-Math.sin(ST.yaw), fz=-Math.cos(ST.yaw);
  var tx=ST.x - fx*behind, ty=ST.y + height, tz=ST.z - fz*behind;
  cam.position.x += (tx - cam.position.x)*0.18;
  cam.position.y += (ty - cam.position.y)*0.18;
  cam.position.z += (tz - cam.position.z)*0.18;
  var lx=ST.x + fx*8, ly=ST.y + (ST.fly?1.5:1.2), lz=ST.z + fz*8;
  cam.lookAt(lx, ly, lz);
}

var last=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  var dt=Math.min(0.05, (now-last)/1000); last=now;
  physics(dt); pool.upd(dt); syncCar();
  if(GM.cur){
    try{
      GM.cur.frame(dt);
      if(GM.cur.cam){
        var _cp0=cam.position.x+cam.position.y+cam.position.z;
        GM.cur.cam();
        var _cp1=cam.position.x+cam.position.y+cam.position.z;
        // Open Sky cam is a no-op — chase the car ourselves
        if(Math.abs(_cp1-_cp0)<1e-6) chaseCam();
      } else chaseCam();
    }catch(e){ if(!GM._fe){GM._fe=1; console.error(e)} }
  } else {
    // menu cam orbit
    var t=now*0.00015; cam.position.set(Math.sin(t)*28, 12, Math.cos(t)*28); cam.lookAt(0,4,0);
  }
  if(GM.cur && GM.cur.id==='aerow'){
    if(scene.fog){ scene.fog.near=80; scene.fog.far=3200; }
    scene.background.setHex(0x6eb0e8);
  } else if(!GM.cur){
    if(scene.fog){ scene.fog.near=200; scene.fog.far=1800; }
    scene.background.setHex(0x87b7e8);
  }
  if(FR.shake>0){ FR.shake=Math.max(0,FR.shake-dt); cam.position.x+=(Math.random()-.5)*FR.shake; cam.position.y+=(Math.random()-.5)*FR.shake }
  renderer.render(scene, cam);
  var spd=document.getElementById('spd'); if(spd) spd.textContent=(ST.kmh|0)+' KM/H';
}
requestAnimationFrame(frame);

window.__skyHost = {FR:FR, GM:GM, scene:scene, cam:cam, renderer:renderer, ensureCar:ensureCar, toast:toast, ST:ST, NET:NET};
console.log('[SKYBOLT] host ready');
})();

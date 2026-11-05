/* Roadster Dash UAE — Phase 3: Rocket Football (original car-soccer) + minigames. Original code, no third-party assets. */
(function(){'use strict';
var FR=window.__fr;if(!FR)return;
var GM=window.__games={cur:null};FR.games=GM;
function U(){return window.__uae}
function T(){return window.__T}
var ST=FR.ST;
function clamp(v,a,b){return v<a?a:v>b?b:v}
function wrapA(a){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function NET(){return FR.NET||{}}
function online(){return !!(FR.NET&&FR.NET.ok)}
function send(o){o.t='mg';FR.mpSend&&FR.mpSend(o)}
function toast(t){FR.toast&&FR.toast(t)}
function boom(x,y,z,col,n){var P=FR.W&&FR.W.pool;if(!P)return;for(var i=0;i<(n||40);i++)P.emit(x,y,z,(Math.random()-.5)*22,Math.random()*16,(Math.random()-.5)*22,.6,2.4,1.1,col||0xffb040,1,true)}
var COLS={0:'#2f7bff',1:'#ff8a1f'};
// ---------------- UI ----------------
var css=`
#gm-hud{position:fixed;left:50%;top:58px;transform:translateX(-50%);z-index:45;display:none;pointer-events:none;font:700 15px Arial,Helvetica,sans-serif;color:#fff;text-align:center}
#gm-hud .sb{display:inline-flex;align-items:stretch;border-radius:12px;overflow:hidden;box-shadow:0 6px 22px rgba(0,0,0,.45)}
#gm-hud .sb>div{padding:6px 14px;font-size:22px}#gm-hud .b{background:#2f7bffdd}#gm-hud .o{background:#ff8a1fdd}#gm-hud .tm{background:rgba(10,12,18,.85);min-width:74px;font-size:20px!important}
#gm-hud .sub{margin-top:5px;font-size:13px;background:rgba(10,12,18,.7);padding:4px 10px;border-radius:8px;display:inline-block;max-width:80vw}
#gm-cd{position:fixed;inset:0;z-index:46;display:none;align-items:center;justify-content:center;pointer-events:none;font:900 120px Arial;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.6)}
#gm-cd.sm{font-size:56px}
#gm-boost{position:fixed;right:18px;bottom:150px;z-index:45;width:92px;height:92px;border-radius:50%;display:none;align-items:center;justify-content:center;font:900 26px Arial;color:#fff;background:conic-gradient(#ff8a1f calc(var(--b)*1%),rgba(10,12,18,.7) 0);box-shadow:0 0 0 5px rgba(10,12,18,.6) inset}
#gm-boost span{background:rgba(10,12,18,.85);width:70px;height:70px;border-radius:50%;display:flex;align-items:center;justify-content:center}
body.fr-touch #gm-boost{bottom:250px;right:14px;width:80px;height:80px}body.fr-touch #gm-boost span{width:60px;height:60px}
#gm-touch{position:fixed;right:120px;bottom:150px;z-index:45;display:none;gap:10px}
#gm-touch button,#gm-ctl button{pointer-events:auto;font:800 14px Arial;color:#fff;background:rgba(10,12,18,.7);border:1px solid rgba(255,255,255,.3);border-radius:14px;min-width:70px;height:58px;touch-action:none}
#gm-ctl{position:fixed;left:12px;bottom:12px;z-index:45;display:none;gap:8px}
#gm-menu{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;font:14px Arial,Helvetica,sans-serif;color:#fff}
#gm-menu .box{background:linear-gradient(145deg,rgba(30,26,14,.95),rgba(10,10,14,.96));border:1px solid rgba(212,175,55,.6);border-radius:18px;padding:16px 18px;width:min(720px,94vw);max-height:88vh;overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,.6)}
#gm-menu h2{margin:0 0 4px;color:#f3d77a;font-size:24px}#gm-menu .x{float:right;background:none;border:0;color:#fff;font-size:22px;cursor:pointer}
#gm-menu .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:10px}
#gm-menu .card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:10px}
#gm-menu .card h3{margin:0 0 4px;font-size:17px}#gm-menu .card p{margin:0 0 8px;opacity:.8;font-size:12.5px;min-height:32px}
#gm-menu button.go{font:800 13px Arial;color:#111;background:#f3d77a;border:0;border-radius:9px;padding:8px 10px;margin:2px;cursor:pointer}
#gm-menu button.go.alt{background:#7cc4ff}#gm-menu button.go:disabled{opacity:.4}
#gm-menu .lob{margin-top:10px;padding:10px;border-radius:12px;background:rgba(47,123,255,.12);border:1px solid rgba(47,123,255,.4)}
#gm-res{position:fixed;inset:0;z-index:71;background:rgba(0,0,0,.5);display:none;align-items:center;justify-content:center;font:15px Arial;color:#fff}
#gm-res .box{background:rgba(12,12,18,.95);border:1px solid #f3d77a;border-radius:18px;padding:18px 22px;min-width:280px;max-width:92vw;text-align:center}
#gm-res h2{color:#f3d77a;margin:0 0 8px}#gm-res ol{text-align:left}#gm-res button{font:800 14px Arial;background:#f3d77a;border:0;border-radius:10px;padding:9px 16px;margin:6px;cursor:pointer}
`;
var ui={};
function el(h){var d=document.createElement('div');d.innerHTML=h.trim();return d.firstChild}
function mkUI(){if(ui.hud)return;var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 ui.hud=el('<div id="gm-hud"><div class="sb"></div><div><span class="sub"></span></div></div>');ui.cd=el('<div id="gm-cd"></div>');ui.boost=el('<div id="gm-boost"><span>100</span></div>');
 ui.touch=el('<div id="gm-touch"><button data-g="jump">⤴ JUMP</button><button data-g="cam">🎥 BALL</button></div>');
 ui.ctl=el('<div id="gm-ctl"><button data-g="quit">✕ Quit game</button></div>');
 ui.menu=el('<div id="gm-menu"><div class="box"></div></div>');ui.res=el('<div id="gm-res"><div class="box"></div></div>');
 [ui.hud,ui.cd,ui.boost,ui.touch,ui.ctl,ui.menu,ui.res].forEach(function(e){document.body.appendChild(e)});
 [ui.touch,ui.ctl,ui.menu,ui.res].forEach(function(e){['pointerdown','touchstart','mousedown','keydown'].forEach(function(ev){e.addEventListener(ev,function(x){x.stopPropagation();if(ev==='pointerdown'||ev==='touchstart'){var b=x.target.closest&&x.target.closest('[data-g]');if(b&&e===ui.touch){x.preventDefault();tbtn(b.dataset.g)}}},{passive:false})})});
 ui.ctl.addEventListener('click',function(e){var b=e.target.closest('[data-g]');if(b&&b.dataset.g==='quit')stop(true)});
 ui.menu.addEventListener('click',menuClick);ui.res.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;ui.res.style.display='none';if(b.dataset.a==='again'&&GM.last)start(GM.last.id,GM.last.o);else if(b.dataset.a==='menu')openMenu()})}
function tbtn(g){if(g==='jump')carJump();if(g==='cam'){GM.ballCam=!GM.ballCam;toast(GM.ballCam?'🎥 Ball cam ON':'🎥 Ball cam OFF')}}
function hudSet(sb,sub){mkUI();ui.hud.style.display='block';ui.hud.querySelector('.sb').innerHTML=sb;ui.hud.querySelector('.sub').innerHTML=sub||'';ui.hud.querySelector('.sub').style.display=sub?'inline-block':'none'}
var cdT=0;function countdown(txt,small){mkUI();ui.cd.textContent=txt;ui.cd.classList.toggle('sm',!!small);ui.cd.style.display=txt?'flex':'none'}
function results(title,rows,note){mkUI();ui.res.querySelector('.box').innerHTML='<h2>'+title+'</h2>'+(rows&&rows.length?'<ol>'+rows.map(function(r){return '<li>'+r+'</li>'}).join('')+'</ol>':'')+(note?'<p>'+note+'</p>':'')+'<button data-a="again">↻ Play again</button><button data-a="menu">🎮 Games</button><button data-a="close">Close</button>';ui.res.style.display='flex'}
function fmtT(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
// ---------------- generic car extras: jump / double-jump / dodge / aerial / boost meter ----------------
var CJ={jumps:0,jt:0,flip:0,flipAx:'x',flipDir:1,dodgeT:0};
function grounded(){return !ST.air&&!ST.fly}
function carJump(){if(GM.cur&&GM.cur.jump){GM.cur.jump();return}if(!GM.cur||!GM.cur.carJump||(FR.foot&&FR.foot.on)||ST.fly||GM.frozen)return;
 if(!ST.air){ST.vy=8.5;ST.air=true;ST.y+=.05;CJ.jumps=1;CJ.jt=0}
 else if(CJ.jumps===1&&CJ.jt<1.5){var K=FR.keys,TI=FR.input,f=(K.KeyW||K.ArrowUp||TI.gas?1:0)-(K.KeyS||K.ArrowDown||TI.brk?1:0),s=(K.KeyA||K.ArrowLeft?1:0)-(K.KeyD||K.ArrowRight?1:0);if(Math.abs(TI.jx)>.3)s=-Math.sign(TI.jx);
  CJ.jumps=2;var fx=-Math.sin(ST.yaw),fz=-Math.cos(ST.yaw),rx=Math.cos(ST.yaw),rz=-Math.sin(ST.yaw);
  if(!f&&!s){ST.vy=Math.max(ST.vy,7);CJ.flip=0;return}
  var dx=fx*f-rx*s,dz=fz*f-rz*s,l=Math.hypot(dx,dz)||1;ST.vx+=dx/l*11;ST.vz+=dz/l*11;ST.vy=Math.max(ST.vy,2.5);CJ.dodgeT=.5;
  CJ.flip=1;CJ.flipAx=Math.abs(f)>=Math.abs(s)?'x':'z';CJ.flipDir=CJ.flipAx==='x'?-f:s;GM.stat&&(GM.stat.flips=(GM.stat.flips||0)+1)}}
function carExtras(dt){if(!GM.cur||!GM.cur.carJump||GM.cur.ownPhys)return;CJ.jt+=dt;CJ.dodgeT=Math.max(0,CJ.dodgeT-dt);if(grounded()){CJ.jumps=0}
 if(CJ.flip>0){var d=dt/.55*Math.PI*2;CJ.flip-=dt/.55;if(CJ.flipAx==='x')ST.pitch+=d*CJ.flipDir;else ST.roll+=d*CJ.flipDir;if(CJ.flip<=0){CJ.flip=0;ST.pitch=0;ST.roll=0}}
 // aerial: boost while airborne pushes the car up/forward
 if(ST.air&&!ST.fly&&ST.boost){var fx=-Math.sin(ST.yaw),fz=-Math.cos(ST.yaw);ST.vy+=17*dt;ST.vx+=fx*9*dt;ST.vz+=fz*9*dt;ST.vy=Math.min(ST.vy,16);var c=FR.getCar();if(c)FR.W.pool&&FR.W.pool.emit(ST.x-fx*2.3,ST.y+.6,ST.z-fz*2.3,-fx*6,-1,-fz*6,.5,1.6,.35,0xff9a2a,1,true)}}
GM.meter=100;FR.boostGate=function(dt){if(!GM.cur||!GM.cur.meter)return true;if(GM.meter<=0)return false;GM.meter=Math.max(0,GM.meter-33*dt);return true};
// ---------------- bots ----------------
var NAMES=['Saif','Hamdan','Mansour','Khalid','Rashid','Majid','Hessa','Mariam','Noura','Fatima','Obaid','Sultan'];
var BCARS=['gtr','camry','lexus','maxima','patrol','landcruiser','f40','rolls','hilux','sport','sedan','police'];
function Bot(o){var t=T();this.team=o.team||0;this.k=o.car||BCARS[(Math.random()*BCARS.length)|0];this.col=o.col||'#cccccc';this.name=o.name||NAMES[(Math.random()*NAMES.length)|0];
 this.x=o.x;this.z=o.z;this.y=FR.heightAt(o.x,o.z);this.yaw=o.yaw||0;this.v=0;this.vy=0;this.air=false;this.vmax=o.vmax||32;this.hp=100;this.dead=0;this.pitch=0;
 this.g=new t.Group();this.g.rotation.order='YXZ';FR.W.scene.add(this.g);this.real=false;this.tryT=0;this.setModel();this.tag=null;if(o.label)this.label(o.label)}
Bot.prototype.setModel=function(){var u=U(),m=u&&u.carModel?u.carModel(this.k,this.col):'fail';if(m&&m!=='fail'){if(this.fb){this.g.remove(this.fb);this.fb=null}this.g.add(m);this.real=true;return}
 if(!this.fb){this.fb=FR.trafficCar(parseInt(this.col.slice(1),16),0);this.g.add(this.fb)}if(m==='fail')this.real=true};
Bot.prototype.label=function(txt){var t=T(),c=document.createElement('canvas');c.width=256;c.height=64;var g=c.getContext('2d');g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,8,256,48);g.fillStyle=COLS[this.team]||'#fff';g.font='bold 30px Arial';g.textAlign='center';g.fillText(txt,128,43);var tx=new t.CanvasTex(c);tx.colorSpace=t.SRGB;
 var m=new t.Mesh(new t.Plane(3,.75),new t.Basic({map:tx,transparent:true,depthWrite:false}));m.position.y=2.7;this.g.add(m);this.tag=m};
Bot.prototype.drive=function(dt,tx,tz,mul,boost){if(this.dead>0)return;var dx=tx-this.x,dz=tz-this.z,want=Math.atan2(-dx,-dz),d=wrapA(want-this.yaw);
 if(!this.air)this.yaw+=clamp(d,-2.6*dt,2.6*dt);var vm=this.vmax*(mul==null?1:mul)*(boost?1.35:1)*(Math.abs(d)>1.3?.45:1);if(!this.air)this.v+=(vm-this.v)*Math.min(1,dt*(boost?2.2:1.4));};
Bot.prototype.step=function(dt,bound){if(this.dead>0){this.dead-=dt;this.g.visible=false;if(this.dead<=0){this.g.visible=true;this.onRespawn&&this.onRespawn()}return}
 if(!this.real){this.tryT-=dt;if(this.tryT<=0){this.tryT=.6;this.setModel()}}
 var fx=-Math.sin(this.yaw),fz=-Math.cos(this.yaw);this.x+=fx*this.v*dt;this.z+=fz*this.v*dt;if(bound)bound(this);
 var g=FR.heightAt(this.x,this.z);if(this.air){this.vy-=24*dt;this.y+=this.vy*dt;if(this.y<=g){this.y=g;this.vy=0;this.air=false}}else{if(g<this.y-.4&&this.v>8){this.air=true;this.vy=0}else this.y=g}
 var hf=FR.heightAt(this.x+fx*1.6,this.z+fz*1.6),hb=FR.heightAt(this.x-fx*1.6,this.z-fz*1.6);this.pitch+=((this.air?this.pitch:Math.atan2(hf-hb,3.2))-this.pitch)*Math.min(1,dt*8);
 this.g.position.set(this.x,this.y,this.z);this.g.rotation.set(this.pitch,this.yaw,0);if(this.tag&&FR.cam)this.tag.quaternion.copy(FR.cam.quaternion).premultiply(this.g.quaternion.clone().invert())};
Bot.prototype.jump=function(v){if(!this.air&&this.dead<=0){this.air=true;this.vy=v||8.5}};
Bot.prototype.vel=function(){return[-Math.sin(this.yaw)*this.v,this.air?this.vy:0,-Math.cos(this.yaw)*this.v]};
Bot.prototype.kill=function(t){if(this.dead>0)return;boom(this.x,this.y+1,this.z,0xff5020,60);this.dead=t||3;this.v=0;this.g.visible=false};
Bot.prototype.dispose=function(){FR.W.scene.remove(this.g)};
// player <-> bot bumps; returns true if player demolished bot
function bump(b,demoOK){if(b.dead>0)return false;var dx=b.x-ST.x,dz=b.z-ST.z,d=Math.hypot(dx,dz);if(d>2.9||Math.abs(b.y-ST.y)>2.2||d<1e-3)return false;var nx=dx/d,nz=dz/d,push=(2.9-d)/2;
 var sp=Math.hypot(ST.vx,ST.vz),rel=(ST.vx*nx+ST.vz*nz)-(b.vel()[0]*nx+b.vel()[2]*nz);
 if(demoOK&&sp*3.6>=110&&rel>14){b.kill(3);FR.shake=.6;return true}
 b.x+=nx*push;b.z+=nz*push;ST.x-=nx*push;ST.z-=nz*push;if(rel>0){ST.vx-=nx*rel*.6;ST.vz-=nz*rel*.6;b.v*=.4;b.yaw+=(Math.random()-.5)*.6}GM.lastBump={b:b,rel:rel};return false}
function placePlayer(x,z,yaw){ST.x=x;ST.z=z;ST.yaw=yaw;ST.vx=ST.vz=ST.vy=0;ST.vL=ST.vT=0;ST.air=false;ST.fly=false;ST.y=FR.heightAt(x,z);ST.camYaw=yaw;ST.pitch=ST.roll=0;if(FR.W.camPos){FR.W.camPos.set(x+Math.sin(yaw)*8,ST.y+3,z+Math.cos(yaw)*8)}var F=FR.foot;if(F&&F.on&&!(GM.cur&&GM.cur.foot)){F.x=x;F.z=z;F.on=false;if(F.ch)F.ch.g.visible=false}FR.onTp&&FR.onTp()}
function freeze(on){GM.frozen=on;if(on){ST.vx=ST.vz=0;ST.vL=ST.vT=0}}
// ===================================================================== ROCKET FOOTBALL
var SC={CX:240,CZ:330,HX:88,HZ:52,R:10,GW:12,GH:8.5,GD:9,CEIL:28,BR:2.4};
function sRamp(d){var R=SC.R;if(d>=R)return 0;if(d<0)d=0;return R-Math.sqrt(R*R-(R-d)*(R-d))}
function sH(x,z){var lx=Math.abs(x-SC.CX),lz=Math.abs(z-SC.CZ);if(lx>SC.HX+SC.GD+3||lz>SC.HZ+3)return null;if(lx>SC.HX)return .16;var mouth=lz<SC.GW,dz=SC.HZ-lz,dx=mouth?99:SC.HX-lx;
 // rounded corners
 var cx=SC.HX-SC.R*2,cz=SC.HZ-SC.R*2;if(!mouth&&lx>cx&&lz>cz){var r=Math.hypot(lx-cx,lz-cz);return .16+sRamp(SC.R*2-r)}
 return .16+sRamp(Math.min(dz,dx))}
var soccer={id:'soccer',name:'⚽ Rocket Football',carJump:true,meter:true};
soccer.build=function(){var t=T(),G=new t.Group(),S=SC;
 var turf=new t.Mesh(new t.Box(S.HX*2,.12,S.HZ*2),new t.Std({color:0x2f8f46,roughness:.95}));turf.position.set(S.CX,.1,S.CZ);G.add(turf);
 for(var i=0;i<10;i++){var st=new t.Mesh(new t.Box(S.HX*2/10,.13,S.HZ*2-.2),new t.Std({color:i%2?0x2a8240:0x34a04f,roughness:.95}));st.position.set(S.CX-S.HX+S.HX*2/10*(i+.5),.11,S.CZ);G.add(st)}
 var lm=new t.Basic({color:0xffffff});[[0,0,.5,S.HZ*2-2],[0,S.HZ-1.2,S.HX*2-2,.5],[0,-(S.HZ-1.2),S.HX*2-2,.5]].forEach(function(l){var m=new t.Mesh(new t.Box(l[2],.14,l[3]),lm);m.position.set(S.CX+l[0],.13,S.CZ+l[1]);G.add(m)});
 var cc=new t.Mesh(new t.Cyl(12,12,.15,40,1,true),lm);cc.position.set(S.CX,.13,S.CZ);G.add(cc);
 // ramps (visual quarter-pipes) as strips
 var rm=new t.Std({color:0x9aa7b8,roughness:.6,metalness:.1,transparent:true,opacity:.85});
 function strip(x0,z0,x1,z1,inX,sign,len,gapZ){var n=8;for(var k=0;k<n;k++){var d0=SC.R*k/n,d1=SC.R*(k+1)/n,h0=sRamp(SC.R-d0),h1=sRamp(SC.R-d1);}}
 // walls built from slanted panels approximating the curve
 var seg=6;function wallRun(axis,side){for(var k=0;k<seg;k++){var a0=k/seg,a1=(k+1)/seg,d0=SC.R*(1-a0),d1=SC.R*(1-a1),h0=sRamp(d0),h1=sRamp(d1),dd=d0-d1,hh=h1-h0,len=Math.hypot(dd,hh),ang=Math.atan2(hh,dd);
   if(axis==='z'){var m=new t.Mesh(new t.Box(S.HX*2-S.R*4,.25,len),rm);m.position.set(S.CX,(h0+h1)/2,S.CZ+side*(S.HZ-(d0+d1)/2));m.rotation.x=side*ang;G.add(m)}
   else{[-1,1].forEach(function(zs){var w=S.HZ-S.GW-S.R*2;var m=new t.Mesh(new t.Box(len,.25,w),rm);m.position.set(S.CX+side*(S.HX-(d0+d1)/2),(h0+h1)/2,S.CZ+zs*(S.GW+w/2));m.rotation.z=-side*ang;G.add(m)})}}}
 [-1,1].forEach(function(s){wallRun('z',s);wallRun('x',s)});
 // glass walls + ceiling frame
 var gm=new t.Std({color:0x9fd3ff,transparent:true,opacity:.18,roughness:.1,depthWrite:false});
 [-1,1].forEach(function(s){var w=new t.Mesh(new t.Box(S.HX*2,S.CEIL-S.R,.3),gm);w.position.set(S.CX,S.R+(S.CEIL-S.R)/2,S.CZ+s*S.HZ);G.add(w);
  var e=new t.Mesh(new t.Box(.3,S.CEIL-S.GH,S.GW*2),gm);e.position.set(S.CX+s*S.HX,S.GH+(S.CEIL-S.GH)/2,S.CZ);G.add(e);
  [-1,1].forEach(function(zs){var w2=new t.Mesh(new t.Box(.3,S.CEIL,S.HZ-S.GW),gm);w2.position.set(S.CX+s*S.HX,S.CEIL/2,S.CZ+zs*(S.GW+(S.HZ-S.GW)/2));G.add(w2)})});
 var fr=new t.Std({color:0x222831,metalness:.6,roughness:.4});for(var i2=-4;i2<=4;i2++){var b=new t.Mesh(new t.Box(.6,.6,S.HZ*2),fr);b.position.set(S.CX+i2*S.HX/4,S.CEIL,S.CZ);G.add(b)}
 // goals
 [-1,1].forEach(function(s){var col=s<0?0x2f7bff:0xff8a1f,gmat=new t.Std({color:col,emissive:col,emissiveIntensity:.6,roughness:.4});var x=S.CX+s*(S.HX+S.GD/2);
  var net=new t.Mesh(new t.Box(S.GD,S.GH,S.GW*2),new t.Std({color:col,transparent:true,opacity:.22,depthWrite:false}));net.position.set(x,S.GH/2,S.CZ);G.add(net);
  [[0,S.GH,0,S.GD+.4,.5,S.GW*2+.6],[0,S.GH/2,S.GW,S.GD,S.GH,.5],[0,S.GH/2,-S.GW,S.GD,S.GH,.5]].forEach(function(p){var m=new t.Mesh(new t.Box(p[3],p[4],p[5]),gmat);m.position.set(x+p[0],p[1],S.CZ+p[2]);G.add(m)});
  var line=new t.Mesh(new t.Box(.6,.16,S.GW*2),new t.Basic({color:col}));line.position.set(S.CX+s*S.HX,.14,S.CZ);G.add(line)});
 // stands + lights
 var sm=new t.Std({color:0x3a3f4a,roughness:.8});[-1,1].forEach(function(s){for(var r=0;r<4;r++){var b2=new t.Mesh(new t.Box(S.HX*2,1.6,3),sm);b2.position.set(S.CX,1+r*1.6,S.CZ+s*(S.HZ+4+r*3));G.add(b2)}});
 var cm=['#e63946','#f1faee','#2f7bff','#ff8a1f','#ffd166','#06d6a0'];for(var c=0;c<120;c++){var s2=c%2?1:-1,r2=c%4,p=new t.Mesh(new t.Box(.5,.9,.5),new t.Std({color:cm[c%cm.length]}));p.position.set(S.CX-S.HX+5+((c*13.7)%(S.HX*2-10)),2.3+r2*1.6,S.CZ+s2*(S.HZ+4+r2*3));p.userData.ph=c;G.add(p);(G.userData.fans=G.userData.fans||[]).push(p)}
 // ball
 var cv=document.createElement('canvas');cv.width=256;cv.height=128;var g=cv.getContext('2d');g.fillStyle='#f4f4f4';g.fillRect(0,0,256,128);g.fillStyle='#222';for(var i3=0;i3<12;i3++){g.beginPath();g.arc((i3%6)*46+20+(i3>5?23:0),i3>5?92:36,13,0,7);g.fill()}
 var tx=new t.CanvasTex(cv);tx.colorSpace=t.SRGB;var ball=new t.Mesh(new t.Sphere(S.BR,24,18),new t.Std({map:tx,roughness:.45,metalness:.1}));ball.castShadow=true;G.add(ball);
 var shadow=new t.Mesh(new t.Cyl(S.BR,S.BR,.05,24),new t.Basic({color:0x000000,transparent:true,opacity:.3,depthWrite:false}));G.add(shadow);
 // boost pads
 var pads=[],big=[[1,1],[1,-1],[-1,1],[-1,-1],[0,1],[0,-1]],bm=new t.Std({color:0xff8a1f,emissive:0xff6a00,emissiveIntensity:1.2}),smm=new t.Std({color:0xffc56b,emissive:0xff9a2a,emissiveIntensity:.8});
 big.forEach(function(b){var x=S.CX+b[0]*(S.HX-12),z=S.CZ+b[1]*(S.HZ-12);var base=new t.Mesh(new t.Cyl(2.2,2.2,.2,20),bm);base.position.set(x,.22,z);var orb=new t.Mesh(new t.Sphere(.9,14,10),bm);orb.position.set(x,1.6,z);G.add(base,orb);pads.push({x:x,z:z,big:true,r:3,on:true,t:0,m:orb})});
 for(var ix=-3;ix<=3;ix++)for(var iz=-2;iz<=2;iz+=2){if(ix===0&&iz===0)continue;var x2=S.CX+ix*22,z2=S.CZ+iz*16+(ix%2?8:0);var pm=new t.Mesh(new t.Cyl(1,1,.18,14),smm);pm.position.set(x2,.22,z2);G.add(pm);pads.push({x:x2,z:z2,big:false,r:2,on:true,t:0,m:pm})}
 this.G=G;this.ball=ball;this.shadow=shadow;this.pads=pads;FR.W.scene.add(G)};
soccer.start=function(o){var S=SC;this.o=o;this.mode=o.size||1;this.score=[0,0];this.time=300;this.ot=false;this.my=o.team||0;this.state='kick';this.st=3;this.rep=[];this.repT=0;this.demos=0;this.goals=0;this.ballCam=true;GM.ballCam=true;
 if(!this.G)this.build();this.G.visible=true;FR.hOver=sH;this.B={x:S.CX,y:S.BR+3,z:S.CZ,vx:0,vy:0,vz:0};this.bots=[];
 if(!o.online){var n=this.mode;for(var i=0;i<n*2-1;i++){var team=i<n-1?this.my:1-this.my;this.bots.push(new Bot({team:team,col:COLS[team],vmax:o.diff==='hard'?36:o.diff==='easy'?26:31,name:NAMES[i],label:NAMES[i]}))}}
 if(FR.W.traffic)FR.W.traffic.visible=false;this.kickoff();mkUI();ui.boost.style.display='flex';ui.touch.style.display=FR.isTouch()?'flex':'none'};
soccer.kickoff=function(){var S=SC,self=this;this.B={x:S.CX,y:S.BR+.05,z:S.CZ,vx:0,vy:0,vz:0};this.state='kick';this.st=3;GM.meter=34;
 var spots=[[-28,0],[-40,-14],[-40,14],[-60,0]],me=0,mt=[0,0];
 function spot(team,idx){var sp=spots[idx%spots.length],s=team===0?1:-1;return[S.CX+sp[0]*s,S.CZ+sp[1],team===0?-Math.PI/2:Math.PI/2]}
 var myIdx=this.o.online?(this.o.slot||0):0;var p=spot(this.my,myIdx);placePlayer(p[0],p[1],p[2]);mt[this.my]=myIdx+1;
 this.bots.forEach(function(b){var q=spot(b.team,mt[b.team]++);b.x=q[0];b.z=q[1];b.yaw=q[2];b.v=0;b.vy=0;b.air=false;b.dead=0;b.g.visible=true});
 this.pads.forEach(function(p){p.on=true;p.m.visible=true})};
soccer.bound=function(b){var S=SC,lz=b.z-S.CZ,lx=b.x-S.CX,inMouth=Math.abs(lz)<S.GW-1.6;var mx=inMouth?S.HX+S.GD-1.6:S.HX-1.2;
 if(Math.abs(lx)>mx){b.x=S.CX+Math.sign(lx)*mx;return 1}if(Math.abs(lx)>S.HX-1.2&&!inMouth){b.x=S.CX+Math.sign(lx)*(S.HX-1.2)}
 if(Math.abs(lx)>S.HX&&Math.abs(lz)>S.GW-1.6){b.z=S.CZ+Math.sign(lz)*(S.GW-1.6)}
 if(Math.abs(lz)>S.HZ-1.2){b.z=S.CZ+Math.sign(lz)*(S.HZ-1.2);return 2}return 0};
soccer.boundPlayer=function(){var o={x:ST.x,z:ST.z};var r=this.bound(o);if(o.x!==ST.x){ST.vx*=-.3;ST.x=o.x}if(o.z!==ST.z){ST.vz*=-.3;ST.z=o.z}if(ST.y>SC.CEIL-1.5){ST.y=SC.CEIL-1.5;ST.vy=Math.min(0,ST.vy)}};
soccer.hitBall=function(cx,cy,cz,vx,vy,vz,fx,fz,dodge){var B=this.B,S=SC,dx=B.x-cx,dy=B.y-(cy+.8),dz=B.z-cz,d=Math.sqrt(dx*dx+dy*dy+dz*dz),R=S.BR+1.7;if(d>=R||d<1e-3)return false;var nx=dx/d,ny=dy/d,nz=dz/d;
 B.x=cx+nx*R;B.y=Math.max(B.y,cy+.8+ny*R);B.z=cz+nz*R;var rel=(vx-B.vx)*nx+(vy-B.vy)*ny+(vz-B.vz)*nz;if(rel<0)rel=0;var k=rel*1.45+4;B.vx+=nx*k;B.vy+=ny*k+Math.max(0,3-ny*3);B.vz+=nz*k;
 if(dodge){B.vx+=fx*14;B.vz+=fz*14;B.vy+=3}var sp=Math.hypot(B.vx,B.vy,B.vz);if(sp>60){B.vx*=60/sp;B.vy*=60/sp;B.vz*=60/sp}return true};
soccer.physBall=function(dt){var B=this.B,S=SC;B.vy-=17*dt;var dr=Math.pow(.995,dt*60);B.vx*=dr;B.vz*=dr;B.x+=B.vx*dt;B.y+=B.vy*dt;B.z+=B.vz*dt;
 var g=sH(B.x,B.z);if(g==null)g=0;if(B.y-S.BR<g){var e=.5,hx=(sH(B.x+.5,B.z)||0)-(sH(B.x-.5,B.z)||0),hz=(sH(B.x,B.z+.5)||0)-(sH(B.x,B.z-.5)||0),nx=-hx,ny=1,nz=-hz,l=Math.sqrt(nx*nx+ny*ny+nz*nz);nx/=l;ny/=l;nz/=l;
  B.y=g+S.BR;var vn=B.vx*nx+B.vy*ny+B.vz*nz;if(vn<0){B.vx-=(1+e)*vn*nx;B.vy-=(1+e)*vn*ny;B.vz-=(1+e)*vn*nz}if(Math.abs(B.vy)<1.2&&ny>.98)B.vy=0;var fr=Math.pow(.985,dt*60);B.vx*=fr;B.vz*=fr;
  if(ny<.9){B.vx+=nx*14*dt;B.vz+=nz*14*dt}}
 var lx=B.x-S.CX,lz=B.z-S.CZ,inMouth=Math.abs(lz)<S.GW-S.BR&&B.y<S.GH-S.BR;
 if(Math.abs(lz)>S.HZ-S.BR){B.z=S.CZ+Math.sign(lz)*(S.HZ-S.BR);B.vz*=-.7}
 if(!inMouth&&Math.abs(lx)>S.HX-S.BR&&Math.abs(lx)<S.HX+1){B.x=S.CX+Math.sign(lx)*(S.HX-S.BR);B.vx*=-.7}
 if(Math.abs(lx)>S.HX){if(Math.abs(lx)>S.HX+S.GD-S.BR){B.x=S.CX+Math.sign(lx)*(S.HX+S.GD-S.BR);B.vx*=-.4}if(Math.abs(lz)>S.GW-S.BR){B.z=S.CZ+Math.sign(lz)*(S.GW-S.BR);B.vz*=-.5}if(B.y>S.GH-S.BR){B.y=S.GH-S.BR;B.vy=-Math.abs(B.vy)*.5}}
 if(B.y>S.CEIL-S.BR){B.y=S.CEIL-S.BR;B.vy=-Math.abs(B.vy)*.7}
 if(Math.abs(lx)>S.HX+S.BR*.9&&Math.abs(lz)<S.GW)return lx>0?0:1;return -1};
soccer.ai=function(b,i,dt){var S=SC,B=this.B,gx=b.team===0?S.CX+S.HX+4:S.CX-S.HX-4,ownx=b.team===0?S.CX-S.HX:S.CX+S.HX;var dx=gx-B.x,dz=S.CZ-B.z,l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
 var role=(this.mode>1&&i%this.mode===1)?'def':'att',tx,tz,boost=false;
 var bx=B.x+B.vx*.35,bz=B.z+B.vz*.35;var behind=((bx-b.x)*dx+(bz-b.z)*dz)>0;
 if(role==='def'&&Math.abs(B.x-ownx)>S.HX*.9){tx=(B.x+ownx)/2;tz=(B.z+S.CZ)/2;}
 else if(behind){tx=bx+dx*2;tz=bz+dz*2;boost=Math.hypot(bx-b.x,bz-b.z)>14}else{tx=bx-dx*7;tz=bz-dz*7+(b.z<bz?-4:4)}
 b.drive(dt,tx,tz,1,boost);if(Math.hypot(B.x-b.x,B.z-b.z)<6&&B.y>3.2&&B.y<8)b.jump(8.5)};
soccer.frame=function(dt){var S=SC,self=this,B=this.B,net=this.o.online,host=!net||GM.mp.host===NET().id;
 // fans + pads
 var now=performance.now()/1000;(this.G.userData.fans||[]).forEach(function(f){f.position.y=f.userData.y0==null?(f.userData.y0=f.position.y):f.userData.y0+Math.max(0,Math.sin(now*6+f.userData.ph))*.35});
 this.pads.forEach(function(p){if(!p.on){p.t-=dt;if(p.t<=0){p.on=true;p.m.visible=true}}else{p.m.rotation.y+=dt*2;if(Math.hypot(ST.x-p.x,ST.z-p.z)<p.r&&ST.y<2&&GM.meter<100){GM.meter=p.big?100:Math.min(100,GM.meter+12);p.on=false;p.m.visible=false;p.t=p.big?10:4}}});
 if(this.state==='replay'){this.replay(dt);return}
 if(this.state==='kick'){this.st-=dt;freeze(true);var c=Math.ceil(this.st);countdown(c>0?String(c):'GO!');if(this.st<=0){this.state='play';freeze(false);setTimeout(function(){countdown('')},500)}
  ST.vx=ST.vz=0;}
 else if(this.state==='play'&&host){this.time-=this.ot?-dt:dt}
 this.boundPlayer();
 // bots
 if(this.state==='play')this.bots.forEach(function(b,i){self.ai(b,i,dt)});else this.bots.forEach(function(b){b.v=0});
 this.bots.forEach(function(b){b.step(dt,function(o){self.bound(o)});var v=b.vel();if(self.state==='play'&&self.hitBall(b.x,b.y,b.z,v[0],v[1],v[2],0,0,false)){}if(bump(b,b.team!==self.my)){self.demos++;toast('💥 DEMOLITION! '+b.name)}});
 // player touch
 if(this.state==='play'){var fx=-Math.sin(ST.yaw),fz=-Math.cos(ST.yaw);if(this.hitBall(ST.x,ST.y,ST.z,ST.vx,ST.air?ST.vy:0,ST.vz,fx,fz,CJ.dodgeT>0)){this.touchT=0;if(net&&!host)send({k:'kick',p:[B.x,B.y,B.z],v:[B.vx,B.vy,B.vz]})}}
 // ball
 if(this.state==='play'){if(host){var goal=this.physBall(dt);if(goal>=0)this.goal(goal)}else{this.physBall(dt)}}
 this.ball.position.set(B.x,B.y,B.z);this.ball.rotation.x+=B.vz*dt/S.BR;this.ball.rotation.z-=B.vx*dt/S.BR;var gg=sH(B.x,B.z)||0;this.shadow.position.set(B.x,gg+.06,B.z);this.shadow.scale.setScalar(Math.max(.4,1-(B.y-gg)/30));
 // record for replay
 this.rep.push({b:[B.x,B.y,B.z],p:[ST.x,ST.y,ST.z,ST.yaw,ST.pitch,ST.roll],k:this.bots.map(function(b){return[b.x,b.y,b.z,b.yaw]})});if(this.rep.length>200)this.rep.shift();
 // net sync
 if(net&&host){this.tx=(this.tx||0)-dt;if(this.tx<=0){this.tx=1/15;send({k:'ball',p:[+B.x.toFixed(2),+B.y.toFixed(2),+B.z.toFixed(2)],v:[+B.vx.toFixed(2),+B.vy.toFixed(2),+B.vz.toFixed(2)],s:this.score,tm:Math.round(this.time),st:this.state,ot:this.ot})}}
 // end of match
 if(host&&this.state==='play'&&!this.ot&&this.time<=0&&B.y<S.BR+1){if(this.score[0]===this.score[1]){this.ot=true;this.time=0;toast('⏱ OVERTIME — next goal wins!')}else this.finish()}
 this.hud()};
soccer.hud=function(){var me=this.my,n=this.o.online?(GM.mp.list||[]).map(function(p){return '<b style="color:'+COLS[p.team]+'">'+esc(p.n)+'</b>'}).join(' · '):(this.mode+'v'+this.mode+' vs bots');
 hudSet('<div class="b">'+this.score[0]+'</div><div class="tm">'+(this.ot?'+':'')+fmtT(Math.abs(this.time))+'</div><div class="o">'+this.score[1]+'</div>','You: <b style="color:'+COLS[me]+'">'+(me?'ORANGE':'BLUE')+'</b> · '+n+' · Space=jump/flip · Shift=boost · B=ball cam');
 ui.boost.style.setProperty('--b',GM.meter);ui.boost.firstChild.textContent=Math.round(GM.meter)};
soccer.goal=function(team,remote){var S=SC;this.score[team]++;var gx=S.CX+(team===0?1:-1)*(S.HX+3);boom(gx,4,S.CZ,team===0?0x2f7bff:0xff8a1f,140);FR.shake=1;
 countdown((team===0?'BLUE':'ORANGE')+' SCORES!',true);if(team===this.my)this.goals++;
 if(this.o.online&&!remote)send({k:'goal',team:team,s:this.score});
 this.state='replay';this.repI=Math.max(0,this.rep.length-110);this.repT=0;this.repSave={x:ST.x,z:ST.z};
 if(this.ot){var self=this;setTimeout(function(){self.finish()},2500)}};
soccer.replay=function(dt){this.repT+=dt;freeze(true);var f=this.rep[Math.min(this.rep.length-1,Math.floor(this.repI))];this.repI+=dt*30*.6;
 if(f){this.ball.position.set(f.b[0],f.b[1],f.b[2]);ST.x=f.p[0];ST.y=f.p[1];ST.z=f.p[2];ST.yaw=f.p[3];ST.pitch=f.p[4];ST.roll=f.p[5];var c=FR.getCar();if(c)c.g.position.set(ST.x,ST.y,ST.z);
  this.bots.forEach(function(b,i){var q=f.k[i];if(q){b.x=q[0];b.y=q[1];b.z=q[2];b.yaw=q[3];b.g.position.set(q[0],q[1],q[2]);b.g.rotation.y=q[3]}})}
 if(this.repT>1.2)countdown('REPLAY',true);
 if(this.repT>4.5||this.repI>=this.rep.length-1){countdown('');this.rep=[];if(this.state!=='over'){this.kickoff()}}};
soccer.cam=function(){if(!GM.ballCam||(FR.foot&&FR.foot.on))return;var cam=FR.cam,B=this.state==='replay'?this.ball.position:this.B,dx=B.x-ST.x,dz=B.z-ST.z,l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
 var px=ST.x-dx*9,pz=ST.z-dz*9,py=ST.y+3.4;this._c=this._c||{x:px,y:py,z:pz};var k=.18;this._c.x+=(px-this._c.x)*k;this._c.y+=(py-this._c.y)*k;this._c.z+=(pz-this._c.z)*k;cam.position.set(this._c.x,this._c.y,this._c.z);cam.lookAt(B.x,Math.min(B.y,ST.y+6),B.z)};
soccer.finish=function(){if(this.state==='over')return;this.state='over';freeze(true);var w=this.score[0]===this.score[1]?-1:this.score[0]>this.score[1]?0:1;if(this.o.online&&GM.mp.host===NET().id)send({k:'end',s:this.score});
 var best=+(localStorage.getItem('uae_rf_wins')||0);if(w===this.my)localStorage.setItem('uae_rf_wins',best+1);
 results(w<0?'Draw':w===this.my?'🏆 You win!':'Defeat',['Score: BLUE '+this.score[0]+' – '+this.score[1]+' ORANGE','Your goals: '+this.goals,'Demolitions: '+this.demos],'Total wins: '+(+(localStorage.getItem('uae_rf_wins')||0)))};
soccer.onMsg=function(m){var B=this.B;if(m.k==='ball'&&GM.mp.host!==NET().id){B.x+=(m.p[0]-B.x)*.6;B.y+=(m.p[1]-B.y)*.6;B.z+=(m.p[2]-B.z)*.6;B.vx=m.v[0];B.vy=m.v[1];B.vz=m.v[2];this.score=m.s;this.time=m.tm;this.ot=m.ot;if(m.st==='play'&&this.state==='kick'&&this.st>1)this.st=Math.min(this.st,1)}
 if(m.k==='kick'&&GM.mp.host===NET().id){var r=FR.RP&&FR.RP[m.from],ok=true,lp=r&&r.buf&&r.buf.length&&r.buf[r.buf.length-1].p;if(lp){ok=Math.hypot(lp.x-m.p[0],lp.z-m.p[2])<16}if(ok&&Array.isArray(m.v)){B.vx=clamp(+m.v[0],-60,60);B.vy=clamp(+m.v[1],-60,60);B.vz=clamp(+m.v[2],-60,60)}}
 if(m.k==='goal'&&GM.mp.host!==NET().id){this.score=[0,0];this.score[m.team]=m.s[m.team]-1;this.score[1-m.team]=m.s[1-m.team];this.goal(m.team,true)}
 if(m.k==='end'&&GM.mp.host!==NET().id){this.score=m.s;this.finish()}};
soccer.end=function(){if(this.G)this.G.visible=false;FR.hOver=null;this.bots.forEach(function(b){b.dispose()});this.bots=[];if(ui.boost){ui.boost.style.display='none';ui.touch.style.display='none'}countdown('')};
// ===================================================================== CHECKPOINT RACE
var RACEPTS=[[0,160],[0,80],[80,80],[160,80],[160,0],[160,-80],[80,-160],[0,-160],[-80,-160],[-160,-80],[-160,0],[-160,80],[-80,160]];
var race={id:'race',name:'🏁 Checkpoint Race',carJump:true};
race.start=function(o){var t=T();this.o=o;this.laps=2;this.cp=1;this.lap=1;this.t=0;this.state='cd';this.cd=3;this.fin=[];this.G=new t.Group();FR.W.scene.add(this.G);this.rings=[];var self=this;
 RACEPTS.forEach(function(p,i){var m=new t.Mesh(new t.Cyl(5,5,1.2,28,1,true),new t.Basic({color:i===0?0xffffff:0xf3d77a,transparent:true,opacity:.55,side:2,depthWrite:false}));var n=RACEPTS[(i+1)%RACEPTS.length];m.rotation.order='YXZ';m.rotation.y=Math.atan2(n[0]-p[0],n[1]-p[1]);m.rotation.x=Math.PI/2;m.position.set(p[0],FR.heightAt(p[0],p[1])+5,p[1]);self.G.add(m);self.rings.push(m)});
 this.bots=[];if(!o.online)for(var i=0;i<3;i++){var b=new Bot({team:1,col:['#c8102e','#00843d','#111111'][i],x:-4-i*5+8,z:170+i*4,yaw:0,vmax:30+i*2,label:NAMES[i+3],name:NAMES[i+3]});b.cp=1;b.lap=1;this.bots.push(b)}
 placePlayer(4,172,0);if(FR.W.traffic)FR.W.traffic.visible=false};
race.frame=function(dt){var self=this;if(this.state==='cd'){this.cd-=dt;freeze(true);countdown(Math.ceil(this.cd)>0?String(Math.ceil(this.cd)):'GO!');if(this.cd<=0){this.state='go';freeze(false);setTimeout(function(){countdown('')},500)}}
 else if(this.state==='go')this.t+=dt;
 this.rings.forEach(function(r,i){r.material.color.setHex(i===self.cp%RACEPTS.length?0x00ff88:i===0?0xffffff:0xf3d77a);r.rotation.z+=dt*.6});
 if(this.state==='go'){var p=RACEPTS[this.cp%RACEPTS.length];if(Math.hypot(ST.x-p[0],ST.z-p[1])<9){this.cp++;if(this.cp%RACEPTS.length===1&&this.cp>1){this.lap++;if(this.lap>this.laps){this.finishMe()}else toast('Lap '+this.lap+'/'+this.laps)}}
  this.bots.forEach(function(b){if(b.done)return;var q=RACEPTS[b.cp%RACEPTS.length];b.drive(dt,q[0],q[1],1,false);if(Math.hypot(b.x-q[0],b.z-q[1])<9){b.cp++;if(b.cp%RACEPTS.length===1&&b.cp>1){b.lap++;if(b.lap>self.laps){b.done=true;b.v=0;self.fin.push({n:b.name,t:self.t})}}}})}
 this.bots.forEach(function(b){b.step(dt);bump(b,false)});
 var pos=1+this.bots.filter(function(b){return b.lap*100+b.cp>self.lap*100+self.cp}).length;
 hudSet('<div class="tm">'+this.t.toFixed(1)+'s</div><div class="b">Lap '+Math.min(this.lap,this.laps)+'/'+this.laps+'</div><div class="o">CP '+((this.cp-1)%RACEPTS.length+1)+'/'+RACEPTS.length+'</div>',this.o.online?'Online race — fastest time wins':'Position '+pos+'/'+(this.bots.length+1)+' · follow the green rings')};
race.finishMe=function(){if(this.state==='done')return;this.state='done';this.fin.push({n:'You',t:this.t,me:1});var best=+(localStorage.getItem('uae_race_best')||0);if(!best||this.t<best)localStorage.setItem('uae_race_best',this.t.toFixed(2));
 if(this.o.online)send({k:'fin',v:+this.t.toFixed(2)});var self=this;setTimeout(function(){var rows=self.fin.concat(GM.mp.fin||[]).sort(function(a,b){return a.t-b.t}).map(function(r){return esc(r.n)+' — '+r.t.toFixed(2)+'s'});results('🏁 Finished!',rows,'Best: '+(+localStorage.getItem('uae_race_best')).toFixed(2)+'s')},this.o.online?2500:300)};
race.onMsg=function(m){if(m.k==='fin'){(GM.mp.fin=GM.mp.fin||[]).push({n:m.fn,t:+m.v||0});toast('🏁 '+m.fn+' finished '+(+m.v).toFixed(2)+'s')}};
race.end=function(){FR.W.scene.remove(this.G);this.bots.forEach(function(b){b.dispose()});countdown('')};
// ===================================================================== KING OF THE HILL
var koth={id:'koth',name:'👑 King of the Hill',carJump:true};var KZ={x:240,z:330,r:14};
koth.start=function(o){var t=T();this.o=o;this.t=90;this.score=0;this.state='cd';this.cd=3;this.G=new t.Group();FR.W.scene.add(this.G);
 var z=new t.Mesh(new t.Cyl(KZ.r,KZ.r,6,40,1,true),new t.Basic({color:0xf3d77a,transparent:true,opacity:.28,side:2,depthWrite:false}));z.position.set(KZ.x,3,KZ.z);this.G.add(z);this.zone=z;
 var hill=new t.Mesh(new t.Cyl(KZ.r,KZ.r+10,2.5,40),new t.Std({color:0xc9a46a,roughness:.9}));hill.position.set(KZ.x,1.25,KZ.z);this.G.add(hill);FR.hOver=function(x,z){var d=Math.hypot(x-KZ.x,z-KZ.z);if(d>KZ.r+10)return null;return d<KZ.r?2.5:2.5*(1-(d-KZ.r)/10)};
 this.bots=[];this.bs={};if(!o.online)for(var i=0;i<4;i++){var a=i/4*Math.PI*2;var b=new Bot({team:1,col:['#c8102e','#00843d','#111111','#7c3aed'][i],x:KZ.x+Math.cos(a)*55,z:KZ.z+Math.sin(a)*45,vmax:24,label:NAMES[i+6],name:NAMES[i+6]});b.sc=0;this.bots.push(b)}
 placePlayer(KZ.x-60,KZ.z,-Math.PI/2);this.others={}};
koth.frame=function(dt){var self=this;if(this.state==='cd'){this.cd-=dt;freeze(true);countdown(Math.ceil(this.cd)>0?String(Math.ceil(this.cd)):'GO!');if(this.cd<=0){this.state='go';freeze(false);setTimeout(function(){countdown('')},500)}}
 var inMe=Math.hypot(ST.x-KZ.x,ST.z-KZ.z)<KZ.r;var inB=this.bots.filter(function(b){return Math.hypot(b.x-KZ.x,b.z-KZ.z)<KZ.r&&b.dead<=0});
 if(this.state==='go'){this.t-=dt;if(inMe&&!inB.length)this.score+=dt;if(inB.length===1&&!inMe)inB[0].sc+=dt;
  this.bots.forEach(function(b,i){var a=performance.now()/1000*.7+i;b.drive(dt,KZ.x+Math.cos(a)*4,KZ.z+Math.sin(a)*4,1,false)});
  if(this.o.online){this.tx=(this.tx||0)-dt;if(this.tx<=0){this.tx=1;send({k:'sc',v:+this.score.toFixed(1)})}}
  if(this.t<=0){this.state='done';var rows=[{n:'You',s:this.score}].concat(this.bots.map(function(b){return{n:b.name,s:b.sc}})).concat(Object.keys(this.others).map(function(k){return{n:k,s:self.others[k]}})).sort(function(a,b){return b.s-a.s}).map(function(r){return esc(r.n)+' — '+r.s.toFixed(1)+'s'});results('👑 King of the Hill',rows,'Hold the zone alone to score.')}}
 this.bots.forEach(function(b){b.step(dt);bump(b,false)});this.zone.material.color.setHex(inMe&&!inB.length?0x00ff88:inMe?0xff5040:0xf3d77a);
 hudSet('<div class="tm">'+fmtT(this.t)+'</div><div class="b">You '+this.score.toFixed(1)+'s</div>','Hold the golden zone alone · '+(inMe?(inB.length?'CONTESTED!':'SCORING'):'get to the zone'))};
koth.onMsg=function(m){if(m.k==='sc')this.others[m.fn]=+m.v||0};
koth.end=function(){FR.scene.remove(this.G);FR.hOver=null;this.bots.forEach(function(b){b.dispose()});countdown('')};
// ===================================================================== INFECTION TAG
var tag={id:'tag',name:'🦠 Infection Tag',carJump:true};
tag.start=function(o){this.o=o;this.t=120;this.state='cd';this.cd=3;this.it={};this.bots=[];var self=this;
 if(!o.online){for(var i=0;i<6;i++){var b=new Bot({team:0,col:'#e9e9e9',x:-120+i*45,z:-100+(i%2)*120,vmax:27,label:NAMES[i],name:NAMES[i]});this.bots.push(b)}this.meIt=true}
 else{this.meIt=false}placePlayer(0,165,0)};
tag.frame=function(dt){var self=this;if(this.state==='cd'){this.cd-=dt;freeze(true);countdown(Math.ceil(this.cd)>0?String(Math.ceil(this.cd)):'GO!');if(this.cd<=0){this.state='go';freeze(false);setTimeout(function(){countdown('')},500)}}
 if(this.state==='go'){this.t-=dt;
  this.bots.forEach(function(b){var inf=self.it[b.name];if(inf){var tgt=null,bd=1e9;self.bots.forEach(function(q){if(!self.it[q.name]){var d=Math.hypot(q.x-b.x,q.z-b.z);if(d<bd){bd=d;tgt=q}}});if(tgt){b.drive(dt,tgt.x,tgt.z,1.05,false);if(bd<3.2){self.it[tgt.name]=1;self.paint(tgt);toast('🦠 '+tgt.name+' infected')}}}
   else{var dx=b.x-ST.x,dz=b.z-ST.z,d=Math.hypot(dx,dz)||1;var tx=b.x+dx/d*30,tz=b.z+dz/d*30;if(Math.abs(tx)>230)tx=-tx*.3;if(Math.abs(tz)>230)tz=-tz*.3;b.drive(dt,tx,tz,d<40?1:.6,d<20)}});
  this.bots.forEach(function(b){if(!self.it[b.name]&&Math.hypot(b.x-ST.x,b.z-ST.z)<3.4){self.it[b.name]=1;self.paint(b);toast('🦠 Tagged '+b.name+'!')}});
  if(this.o.online&&!this.meIt){var RP=FR.RP||{};Object.keys(RP).forEach(function(id){var r=RP[id],lp=r.buf&&r.buf.length&&r.buf[r.buf.length-1].p;if(lp&&self.it['#'+id]&&Math.hypot(lp.x-ST.x,lp.z-ST.z)<3.6){self.meIt=true;send({k:'tagged'});toast('🦠 You were infected!')}})}
  var left=this.o.online?1:this.bots.filter(function(b){return !self.it[b.name]}).length;
  if((!this.o.online&&left===0)||this.t<=0){this.state='done';var n=this.bots.filter(function(b){return self.it[b.name]}).length;results(this.t>0?'🦠 Everyone infected!':'⏱ Time up',[(this.o.online?(this.meIt?'You were infected':'You survived!'):('Infected: '+n+'/'+this.bots.length))],'Time left '+fmtT(this.t))}}
 this.bots.forEach(function(b){b.step(dt,function(o){o.x=clamp(o.x,-245,245);o.z=clamp(o.z,-245,245)})});
 hudSet('<div class="tm">'+fmtT(this.t)+'</div><div class="'+(this.meIt?'o':'b')+'">'+(this.meIt?'🦠 INFECTED':'🙂 SURVIVOR')+'</div>',this.o.online?'Infected chase survivors — touch to spread':'Chase and tag all '+this.bots.length+' drivers in Downtown')};
tag.paint=function(b){b.g.traverse(function(o){if(o.isMesh&&o.material&&o.material.color&&!o.material.transparent){o.material=o.material.clone();o.material.color.setHex(0x55ff44)}})};
tag.onMsg=function(m){if(m.k==='it'){this.it={};var self=this;(m.ids||[]).forEach(function(i){self.it['#'+i]=1});this.meIt=(m.ids||[]).indexOf(NET().id)>=0}if(m.k==='tagged'&&GM.mp.host===NET().id){this.it['#'+m.from]=1;send({k:'it',ids:Object.keys(this.it).map(function(k){return +k.slice(1)})})}};
tag.hostStart=function(){var L=GM.mp.list||[];if(!L.length)return;var pick=L[(Math.random()*L.length)|0].id;this.it={};this.it['#'+pick]=1;this.meIt=pick===NET().id;send({k:'it',ids:[pick]})};
tag.end=function(){this.bots.forEach(function(b){b.dispose()});countdown('')};
// ===================================================================== DEMOLITION DERBY (solo vs bots)
var derby={id:'derby',name:'💥 Demolition Derby',carJump:true,soloOnly:true};
derby.start=function(o){this.o=o;this.hp=100;this.state='cd';this.cd=3;SC.GW=0.01;GM.rfStadium(true);FR.hOver=sH;this.bots=[];
 for(var i=0;i<5;i++){var a=i/5*Math.PI*2;var b=new Bot({team:1,col:['#c8102e','#00843d','#111111','#7c3aed','#0ea5e9'][i],x:SC.CX+Math.cos(a)*50,z:SC.CZ+Math.sin(a)*30,yaw:a,vmax:30,label:NAMES[i+2],name:NAMES[i+2]});b.hp=100;this.bots.push(b)}placePlayer(SC.CX,SC.CZ,0)};
derby.frame=function(dt){var self=this;if(this.state==='cd'){this.cd-=dt;freeze(true);countdown(Math.ceil(this.cd)>0?String(Math.ceil(this.cd)):'GO!');if(this.cd<=0){this.state='go';freeze(false);setTimeout(function(){countdown('')},500)}}
 soccer.boundPlayer();var alive=this.bots.filter(function(b){return b.hp>0});
 if(this.state==='go'){alive.forEach(function(b,i){var tg=i%2?{x:ST.x,z:ST.z}:(alive[(i+1)%alive.length]||{x:ST.x,z:ST.z});b.drive(dt,tg.x,tg.z,1,false)});
  alive.forEach(function(b){var dx=b.x-ST.x,dz=b.z-ST.z,d=Math.hypot(dx,dz);if(d<2.9&&d>0){var rel=(ST.vx*dx+ST.vz*dz)/d,bv=b.vel(),rb=-(bv[0]*dx+bv[2]*dz)/d;if(rel>2){b.hp-=rel*1.6;boom(b.x,b.y+1,b.z,0xffb040,10)}if(rb>2){self.hp-=rb*1.3;FR.shake=.4}if(b.hp<=0){b.kill(9999);toast('💥 '+b.name+' wrecked!')}}bump(b,false)});
  for(var i=0;i<alive.length;i++)for(var j=i+1;j<alive.length;j++){var A=alive[i],B=alive[j],d2=Math.hypot(A.x-B.x,A.z-B.z);if(d2<2.9){A.hp-=B.v*.5;B.hp-=A.v*.5;A.v*=.3;B.v*=.3;A.yaw+=1;B.yaw-=1;[A,B].forEach(function(q){if(q.hp<=0)q.kill(9999)})}}
  if(this.hp<=0||!alive.length){this.state='done';results(this.hp>0?'🏆 Last car standing!':'💥 Wrecked',['Cars wrecked: '+this.bots.filter(function(b){return b.hp<=0}).length+'/5','Your HP: '+Math.max(0,Math.round(this.hp))])}}
 this.bots.forEach(function(b){b.step(dt,function(o){soccer.bound(o)});b.x=clamp(b.x,SC.CX-SC.HX+2,SC.CX+SC.HX-2);b.z=clamp(b.z,SC.CZ-SC.HZ+2,SC.CZ+SC.HZ-2)});ST.x=clamp(ST.x,SC.CX-SC.HX+1.5,SC.CX+SC.HX-1.5);ST.z=clamp(ST.z,SC.CZ-SC.HZ+1.5,SC.CZ+SC.HZ-1.5);
 hudSet('<div class="b">HP '+Math.max(0,Math.round(this.hp))+'</div><div class="tm">'+alive.length+' left</div>','Ram rivals hard — side hits hurt them, getting hit hurts you')};
derby.end=function(){SC.GW=12;GM.rfStadium(false);FR.hOver=null;this.bots.forEach(function(b){b.dispose()});countdown('')};
// ===================================================================== DRIFT BATTLE
var drift={id:'drift',name:'🌀 Drift Battle'};
drift.start=function(o){this.o=o;this.t=60;this.state='cd';this.cd=3;this.others={};placePlayer(240,330,Math.PI/2);var DR=FR.DR;if(DR&&!DR.on&&FR.toggleDrift)FR.toggleDrift();if(DR){DR.score=0;DR.cur=0}};
drift.frame=function(dt){var self=this,DR=FR.DR||{score:0};if(this.state==='cd'){this.cd-=dt;freeze(true);countdown(Math.ceil(this.cd)>0?String(Math.ceil(this.cd)):'GO!');if(this.cd<=0){this.state='go';freeze(false);DR.score=0;setTimeout(function(){countdown('')},500)}}
 if(this.state==='go'){this.t-=dt;var sc=Math.round((DR.score||0)+(DR.cur||0));if(this.o.online){this.tx=(this.tx||0)-dt;if(this.tx<=0){this.tx=1;send({k:'sc',v:sc})}}
  if(this.t<=0){this.state='done';var best=+(localStorage.getItem('uae_driftb_best')||0);if(sc>best)localStorage.setItem('uae_driftb_best',sc);var rows=[{n:'You',s:sc}].concat(Object.keys(this.others).map(function(k){return{n:k,s:self.others[k]}})).sort(function(a,b){return b.s-a.s}).map(function(r){return esc(r.n)+' — '+r.s.toLocaleString()});
   results('🌀 Drift Battle',rows,'Best: '+Math.max(sc,best).toLocaleString()+' · target 20,000')}}
 hudSet('<div class="tm">'+fmtT(this.t)+'</div><div class="o">'+Math.round((DR.score||0)+(DR.cur||0)).toLocaleString()+'</div>','Drift in the arena — handbrake (Space/Shift) + steer · chain combos')};
drift.onMsg=function(m){if(m.k==='sc')this.others[m.fn]=+m.v||0};
drift.end=function(){var DR=FR.DR;if(DR&&DR.on&&FR.toggleDrift)FR.toggleDrift();countdown('')};
// ===================================================================== STUNT PARK
var SP={x0:-980,x1:-780,z0:290,z1:470};
function spH(x,z){if(x<SP.x0-2||x>SP.x1+2||z<SP.z0-2||z>SP.z1+2)return null;var h=0;
 // kickers along x lanes
 [[-950,330],[-900,330],[-850,330],[-950,420],[-880,420]].forEach(function(k){var dx=x-k[0],dz=z-k[1];if(Math.abs(dz)<5&&dx>-10&&dx<0)h=Math.max(h,(dx+10)/10*3.2)});
 // mega ramp
 var dx2=x-(-810),dz2=z-380;if(Math.abs(dz2)<8&&dx2>-40&&dx2<0)h=Math.max(h,Math.pow((dx2+40)/40,2)*12);
 // half-pipe bowl
 var d=Math.hypot(x+880,z-380);if(d<26&&d>12)h=Math.max(h,Math.pow((d-12)/14,2)*7);
 return h}
var stunt={id:'stunt',name:'🛹 Stunt Park',carJump:true,meter:false};
stunt.start=function(o){var t=T();this.o=o;this.t=90;this.score=0;this.air=0;this.state='cd';this.cd=3;this.others={};FR.hOver=spH;
 if(!this.G){var G=new t.Group(),m=new t.Std({color:0xd8dde6,roughness:.6}),m2=new t.Std({color:0xf3d77a,roughness:.5});
  var fl=new t.Mesh(new t.Box(SP.x1-SP.x0,.1,SP.z1-SP.z0),new t.Std({color:0x6b7280,roughness:.9}));fl.position.set((SP.x0+SP.x1)/2,.03,(SP.z0+SP.z1)/2);G.add(fl);
  // build visuals by sampling spH into columns
  for(var x=SP.x0;x<SP.x1;x+=2)for(var z=SP.z0;z<SP.z1;z+=2){var h=spH(x+1,z+1);if(h>.15){var b=new t.Mesh(new t.Box(2,h,2),h>6?m2:m);b.position.set(x+1,h/2,z+1);G.add(b)}}
  this.G=G}FR.W.scene.add(this.G);this.G.visible=true;placePlayer(-970,380,-Math.PI/2)};
stunt.frame=function(dt){var self=this;if(this.state==='cd'){this.cd-=dt;freeze(true);countdown(Math.ceil(this.cd)>0?String(Math.ceil(this.cd)):'GO!');if(this.cd<=0){this.state='go';freeze(false);setTimeout(function(){countdown('')},500)}}
 ST.x=clamp(ST.x,SP.x0+1,SP.x1-1);ST.z=clamp(ST.z,SP.z0+1,SP.z1-1);
 if(this.state==='go'){this.t-=dt;if(ST.air){this.air+=dt}else if(this.air>0){if(this.air>.5){var pts=Math.round(this.air*300+(GM.stat.flips||0)*500);this.score+=pts;toast('🛹 '+this.air.toFixed(1)+'s air'+(GM.stat.flips?' + '+GM.stat.flips+' flip':'')+' → +'+pts)}this.air=0;GM.stat.flips=0}
  if(this.o.online){this.tx=(this.tx||0)-dt;if(this.tx<=0){this.tx=1;send({k:'sc',v:this.score})}}
  if(this.t<=0){this.state='done';var best=+(localStorage.getItem('uae_stunt_best')||0);if(this.score>best)localStorage.setItem('uae_stunt_best',this.score);var rows=[{n:'You',s:this.score}].concat(Object.keys(this.others).map(function(k){return{n:k,s:self.others[k]}})).sort(function(a,b){return b.s-a.s}).map(function(r){return esc(r.n)+' — '+r.s.toLocaleString()});results('🛹 Stunt Park',rows,'Best '+Math.max(best,this.score).toLocaleString())}}
 hudSet('<div class="tm">'+fmtT(this.t)+'</div><div class="o">'+this.score.toLocaleString()+'</div>','Hit kickers, the mega ramp & bowl · Space twice in air = flip bonus')};
stunt.onMsg=function(m){if(m.k==='sc')this.others[m.fn]=+m.v||0};
stunt.end=function(){if(this.G)this.G.visible=false;FR.hOver=null;countdown('')};
// ===================================================================== PARKOUR (on foot)
var PK={x:-150,z:420};var PLAT=[];(function(){var x=0,z=0,h=.6;for(var i=0;i<18;i++){PLAT.push({x:PK.x+x,z:PK.z+z,w:i%5===4?5:3,h:h,cp:i%6===0});x+=3.2+(i%3)*.7;z+=(i%4<2?1:-1)*1.6;h=Math.min(9,h+(i%3===2?-.3:.6))}PLAT.push({x:PK.x+x+3,z:PK.z+z,w:7,h:h,goal:true})})();
function pkH(x,z){if(Math.abs(x-PK.x-30)>45||Math.abs(z-PK.z)>25)return null;var h=0;for(var i=0;i<PLAT.length;i++){var p=PLAT[i];if(Math.abs(x-p.x)<p.w/2&&Math.abs(z-p.z)<p.w/2)h=Math.max(h,p.h)}return h}
var parkour={id:'parkour',name:'🧗 Parkour Run',foot:true};
parkour.start=function(o){var t=T();this.o=o;this.t=0;this.state='cd';this.cd=3;this.last=0;this.falls=0;this.others={};FR.hOver=pkH;
 if(!this.G){var G=new t.Group();PLAT.forEach(function(p,i){var m=new t.Mesh(new t.Box(p.w,p.h,p.w),new t.Std({color:p.goal?0xf3d77a:p.cp?0x00b96b:(i%2?0x8c96a8:0xb0b8c6),roughness:.7}));m.position.set(p.x,p.h/2,p.z);G.add(m)});
  var lava=new t.Mesh(new t.Box(90,.08,50),new t.Std({color:0xff5a1f,emissive:0xff3300,emissiveIntensity:.6}));lava.position.set(PK.x+30,.05,PK.z);G.add(lava);this.G=G}
 FR.W.scene.add(this.G);this.G.visible=true;placePlayer(PK.x-8,PK.z,-Math.PI/2);if(FR.foot&&!FR.foot.on&&FR.foot.toggle)FR.foot.toggle();this.reset()};
parkour.reset=function(){var p=PLAT[this.last],F=FR.foot;if(!F)return;F.x=p.x;F.z=p.z;F.y=p.h;F.vy=0;F.air=false};
parkour.frame=function(dt){var F=FR.foot;if(!F)return;if(!F.on&&F.toggle){F.toggle()}if(this.state==='cd'){this.cd-=dt;this.reset();countdown(Math.ceil(this.cd)>0?String(Math.ceil(this.cd)):'GO!');if(this.cd<=0){this.state='go';setTimeout(function(){countdown('')},500)}}
 else if(this.state==='go'){this.t+=dt;
  // walls: can't walk up >0.7m without jumping
  if(this.py!=null&&!F.air&&F.y-this.py>.7){F.x=this.px;F.z=this.pz;F.y=this.py}
  if(F.y<.3&&!F.air){this.falls++;toast('🔥 Lava! Back to checkpoint');this.reset()}
  for(var i=0;i<PLAT.length;i++){var p=PLAT[i];if(Math.abs(F.x-p.x)<p.w/2&&Math.abs(F.z-p.z)<p.w/2&&Math.abs(F.y-p.h)<.2){if(p.cp&&i>this.last){this.last=i;toast('✅ Checkpoint')}if(p.goal){this.state='done';var best=+(localStorage.getItem('uae_pk_best')||0);if(!best||this.t<best)localStorage.setItem('uae_pk_best',this.t.toFixed(2));if(this.o.online)send({k:'fin',v:+this.t.toFixed(2)});var self=this;
     results('🧗 Course complete!',[('Time '+this.t.toFixed(2)+'s'),('Falls: '+this.falls)].concat(Object.keys(this.others).map(function(k){return esc(k)+' — '+self.others[k].toFixed(2)+'s'})),'Best '+(+localStorage.getItem('uae_pk_best')).toFixed(2)+'s')}}}}
 this.px=F.x;this.pz=F.z;this.py=F.y;
 hudSet('<div class="tm">'+this.t.toFixed(1)+'s</div><div class="b">CP '+(PLAT.filter(function(p,i){return p.cp&&i<=this.last},this).length)+'</div>','On foot: jump across the platforms — don\'t touch the lava · Space = jump')};
parkour.onMsg=function(m){if(m.k==='fin')this.others[m.fn]=+m.v||0};
parkour.end=function(){if(this.G)this.G.visible=false;FR.hOver=null;countdown('')};
// ===================================================================== registry + flow
var GAMES={soccer:soccer,race:race,koth:koth,tag:tag,derby:derby,drift:drift,stunt:stunt,parkour:parkour};GM.GAMES=GAMES;
var DESC={soccer:'Car-soccer in an enclosed stadium: giant ball, curved walls, boost pads, jumps, flips, aerials, demolitions, replays.',race:'2 laps through Downtown Dubai checkpoints. Beat the bots or race friends online.',koth:'Hold the golden hill alone to score. Bump rivals off!',tag:'Infection tag in Downtown — tag everyone before time runs out.',derby:'Last car standing in the stadium. Ram rivals, avoid hits.',drift:'60-second drift score attack in the arena.',stunt:'Kickers, a mega ramp and a bowl. Air time + flips = points.',parkour:'On-foot platform run over lava with checkpoints.',skyl:'Flying car-soccer in a sky arena: thrusters, suction, aerials, boost rings, ceiling drive. Bloxx League × Flying Roadster mashup.',aerow:'Open-world UAE sky: Burj Spire, Gulf Loop, The Cube, Sky Sphere, Falcon Arch, Mega Ramp, Cargo Jet. Free flight, rings & Golden Bolts.'};
GM.mp={};
function start(id,o){o=o||{};var g=(GM.GAMES||GAMES)[id];if(!g)return;if(!FR.active&&FR.enter)FR.enter();if(GM.cur)stop(false);GM.last={id:id,o:o};GM.stat={flips:0};GM.cur=g;GM.meter=100;GM.frozen=false;
 try{g.start(o)}catch(e){console.error('game start',id,e);GM.cur=null;toast('Game failed to start');return}
 mkUI();ui.ctl.style.display='flex';ui.menu.style.display='none';ui.res.style.display='none';toast(g.name+(o.online?' — online':''))}
function stop(user){var g=GM.cur;if(!g)return;try{g.end()}catch(e){console.warn('game end',e)}GM.cur=null;GM.frozen=false;FR.hOver=null;mkUI();ui.hud.style.display='none';ui.ctl.style.display='none';ui.boost.style.display='none';ui.touch.style.display='none';countdown('');
 if(GM.mp.g&&user){send({k:'leave'});GM.mp={}}if(FR.W&&FR.W.traffic&&user)FR.W.traffic.visible=true}
GM.start=start;GM.stop=stop;GM.mpJoin=function(g){GM.mp={g:g,list:[]};send({k:'join',g:g})};GM.mpStart=function(){var L=GM.mp.list||[];send({k:'start',g:GM.mp.g,n:L.length});mpBegin()};
// menu
function openMenu(){if(!FR.active&&FR.enter)FR.enter();mkUI();renderMenu();ui.menu.style.display='flex'}
GM.openMenu=openMenu;
function renderMenu(){var on=online(),h='<button class="x" data-a="close">✕</button><h2>🎮 Games · ألعاب</h2><div style="opacity:.8">Solo vs bots, or online with players on this server'+(on?' (you are online as <b>'+esc(NET().name)+'</b>)':' — connect via 🌐 Online first')+'.</div>';
 h+='<div class="grid">'+Object.keys(GM.GAMES||GAMES).map(function(k){var g=(GM.GAMES||GAMES)[k];var solo=(k==='soccer'||k==='skyl')?'<button class="go" data-s="'+k+'" data-n="1">Solo 1v1</button><button class="go" data-s="'+k+'" data-n="2">2v2</button><button class="go" data-s="'+k+'" data-n="3">3v3</button>':'<button class="go" data-s="'+k+'">'+(k==='aerow'?'▶ Explore':'▶ Solo')+'</button>';
  return '<div class="card"><h3>'+g.name+'</h3><p>'+DESC[k]+'</p>'+solo+(g.soloOnly?'':'<button class="go alt" data-o="'+k+'" '+(on?'':'disabled')+'>🌐 Online</button>')+'</div>'}).join('')+'</div>';
 if(GM.mp.g){var L=GM.mp.list||[],host=GM.mp.host===NET().id;h+='<div class="lob"><b>Lobby: '+(GM.GAMES||GAMES)[GM.mp.g].name+'</b> — '+L.length+' player(s)<br>'+L.map(function(p){return '<span style="color:'+COLS[p.team]+'">'+(p.id===GM.mp.host?'⭐':'')+esc(p.n)+'</span>'}).join(' · ')+'<br>'+(host?'<button class="go" data-a="mpgo">▶ Start for everyone</button>':'Waiting for host to start…')+' <button class="go alt" data-a="mpleave">Leave lobby</button></div>'}
 ui.menu.querySelector('.box').innerHTML=h}
function menuClick(e){var b=e.target.closest('button');if(!b){if(e.target===ui.menu)ui.menu.style.display='none';return}
 if(b.dataset.a==='close'){ui.menu.style.display='none';return}
 if(b.dataset.s){start(b.dataset.s,{size:+(b.dataset.n||1)});return}
 if(b.dataset.o){GM.mp={g:b.dataset.o,list:[]};send({k:'join',g:b.dataset.o});setTimeout(renderMenu,400);renderMenu();return}
 if(b.dataset.a==='mpgo'){var L=GM.mp.list||[];send({k:'start',g:GM.mp.g,n:L.length});mpBegin();return}
 if(b.dataset.a==='mpleave'){send({k:'leave'});GM.mp={};renderMenu();return}}
function mpBegin(){var g=GM.mp.g,L=GM.mp.list||[],me=L.filter(function(p){return p.id===NET().id})[0]||{team:0},slot=L.filter(function(p){return p.team===me.team&&p.id<NET().id}).length;GM.mp.fin=[];
 start(g,{online:true,team:me.team,slot:slot,size:Math.max(1,Math.ceil(L.length/2))});if(g==='tag'&&GM.mp.host===NET().id&&GAMES.tag.hostStart)setTimeout(function(){GAMES.tag.hostStart()},3200)}
FR.onMg=function(m){if(m.k==='roster'){GM.mp.g=m.g;GM.mp.host=m.host;GM.mp.list=m.list;if(ui.menu&&ui.menu.style.display==='flex')renderMenu();return}
 if(m.k==='start'){if(GM.mp.g)mpBegin();return}
 if(GM.cur&&GM.cur.onMsg)GM.cur.onMsg(m)};
// ---------------- hooks ----------------
var prevKey=FR.keyHook;FR.keyHook=function(c,e){
 if(c==='KeyY'){if(ui.menu&&ui.menu.style.display==='flex')ui.menu.style.display='none';else openMenu();return true}
 if(c==='KeyU'){GM.openGarage();return true}
 if(c==='KeyI'){FR.creator&&FR.creator(true);return true}
 if(GM.cur){if(c==='Space'&&e&&e.repeat)return true;if(c==='Space'&&GM.cur.carJump&&!(FR.foot&&FR.foot.on)&&!ST.fly){carJump();return true}if(c==='KeyB'){tbtn('cam');return true}if(c==='Escape'&&GM.cur){stop(true);return true}}
 if(c==='KeyF'&&GM.cur&&GM.cur.carJump)return true;
 return prevKey?prevKey(c,e):false};
var prevFrame=FR.onFrame;FR.onFrame=function(dt){if(prevFrame)prevFrame(dt);if(!GM.cur)return;try{if(GM.frozen&&!(FR.foot&&FR.foot.on)){ST.vx=ST.vz=0;ST.vL=ST.vT=0}carExtras(dt);GM.cur.frame(dt);if(GM.cur&&GM.cur.cam)GM.cur.cam()}catch(e){if(!GM._e){GM._e=1;console.error('game frame',e)}}};
GM._x={Bot:Bot,COLS:COLS,NAMES:NAMES,BCARS:BCARS,hudSet:hudSet,countdown:countdown,results:results,ui:ui,mkUI:mkUI,freeze:freeze,placePlayer:placePlayer,boom:boom,send:send,online:online,NET:NET,fmtT:fmtT,esc:esc,toast:toast};
var prevExit=FR.onExit;FR.onExit=function(){if(GM.cur)stop(true);if(prevExit)prevExit()};
GM.openGarage=function(){var V=window.__v10;if(V&&V.openGarage){V.openGarage();GM._garage=true}};
// refresh FR car after garage closes (paint/plate/mods)
setInterval(function(){if(GM._garage&&!document.body.classList.contains('v10-garage')){GM._garage=false;if(FR.active)FR.pending=true}},400);
})();

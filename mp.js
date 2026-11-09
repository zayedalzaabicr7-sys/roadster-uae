/* Roadster Dash UAE — Phase 2: on-foot mode, character creator, online multiplayer, chat, arcade combat (original code) */
(function(){'use strict';
var FR=window.__fr,CH=window.__chr;if(!FR||!CH)return;
function U(){return window.__uae}
function T(){return window.__T}
var LS={get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var LOOK=CH.sanitize(LS.get('uae_look',null));
var ROLEB={owner:['👑','#f3d77a'],admin:['🛡️','#ff6b6b'],vip:['⭐','#c084fc'],player:['','#ffffff']};
// ================= ON FOOT =================
var F=FR.foot={on:false,x:0,y:0,z:0,yaw:0,vy:0,air:false,ch:null,state:'',atkT:0,camYaw:0,cur:'fist',weap:['fist'],ammo:{},hp:100,ko:false,wm:null,spd:0};
window.addEventListener('chr-ready',function(){try{if(F.ch)buildChar();for(var k in RP){var r=RP[k];if(r.ch){if(r.wm&&r.wm.parent)r.wm.parent.remove(r.wm);r.wm=null;FR.W.scene.remove(r.ch.g);r.ch=null;r.wk=null}}}catch(e){console.warn(e)}});
function buildChar(){var W=FR.W;if(F.ch){W.scene.remove(F.ch.g)}F.ch=CH.build(LOOK);W.scene.add(F.ch.g);F.ch.g.visible=F.on;attachWeapon()}
function attachWeapon(){if(!F.ch)return;if(F.wm){F.wm.parent&&F.wm.parent.remove(F.wm);F.wm=null}var m=CH.weaponMesh(F.cur);if(m){m.position.set(0,-.07,-.04);(F.ch.P.handR||F.ch.P.armR).add(m);F.wm=m;m.rotation.x=Math.PI/2}}
function exitCar(){var ST=FR.ST;if(ST.fly||ST.air){FR.toast('Land first · انزل أولاً');return}var rx=Math.cos(ST.yaw),rz=-Math.sin(ST.yaw);F.x=ST.x-rx*2.2;F.z=ST.z-rz*2.2;F.y=FR.heightAt(F.x,F.z);F.yaw=ST.yaw;F.camYaw=ST.yaw;F.on=true;if(!F.ch)buildChar();F.ch.g.visible=true;ST.vx=ST.vz=0;sync()}
function enterCar(){var ST=FR.ST;if(Math.hypot(F.x-ST.x,F.z-ST.z)>4){FR.toast('Walk to your car to get in · اقترب من سيارتك');return}F.on=false;if(F.ch)F.ch.g.visible=false;FR.ST.camYaw=ST.yaw;sync()}
FR.foot.toggle=function(){if(F.ko)return;F.on?enterCar():exitCar()};
var keyAtk=false;
FR.keyHook=function(c){if(c==='KeyE'){F.toggle();return true}if(c==='Enter'){openChat();return true}
 if(F.on){if(c==='KeyJ'||c==='KeyK'){attack();return true}if(c==='KeyQ'){cycle();return true}if(c==='KeyG'){drop();return true}if(c==='Space'){jump();return true}}return false};
function jump(){if(!F.air&&!F.ko){F.vy=5.6;F.air=true}}
function cycle(){if(F.weap.length<2)return;var i=(F.weap.indexOf(F.cur)+1)%F.weap.length;F.cur=F.weap[i];attachWeapon();if(NET.ok)send({t:'sw',w:F.cur});hudUpd()}
function drop(){if(F.cur==='fist')return;if(NET.ok)send({t:'drop'});else{F.weap=F.weap.filter(function(w){return w!==F.cur});F.cur='fist';attachWeapon();hudUpd()}}
F.update=function(dt){var K=FR.keys,TI=FR.input,hA=FR.heightAt;if(F.ko){F.ch&&F.ch.anim(dt,0,'ko');return}
 var f=(K.KeyW||K.ArrowUp?1:0)-(K.KeyS||K.ArrowDown?1:0),s=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0);if(Math.abs(TI.jx)>.12||Math.abs(TI.jy)>.12){s=TI.jx;f=-TI.jy}if(TI.gas)f=Math.max(f,1);
 var mag=Math.min(1,Math.hypot(f,s)),run=K.ShiftLeft||K.ShiftRight||TI.boost||mag>.92&&(Math.abs(TI.jx)+Math.abs(TI.jy))>0,sp=mag*(run?6.8:3.3);
 if(mag>.05){var cy=F.camYaw,dx=-Math.sin(cy)*f+Math.cos(cy)*s,dz=-Math.cos(cy)*f-Math.sin(cy)*s,ty=Math.atan2(-dx,-dz),d=ty-F.yaw;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;F.yaw+=d*Math.min(1,dt*12);var L=Math.hypot(dx,dz)||1;F.x+=dx/L*sp*dt;F.z+=dz/L*sp*dt}
 // collisions: buildings + parked car
 FR.colQuery(F.x,F.z,.4,F.y).forEach(function(o){var cx,cz;if(o.t==='b'){cx=Math.max(o.x0,Math.min(o.x1,F.x));cz=Math.max(o.z0,Math.min(o.z1,F.z))}else{var a=F.x-o.x,b=F.z-o.z,l=Math.hypot(a,b)||1;cx=o.x+a/l*o.r;cz=o.z+b/l*o.r}var ex=F.x-cx,ez=F.z-cz,dd=Math.hypot(ex,ez);if(dd<.4){if(dd<1e-4){ex=1;ez=0;dd=1}F.x=cx+ex/dd*.4;F.z=cz+ez/dd*.4}});
 var ST=FR.ST,cd=Math.hypot(F.x-ST.x,F.z-ST.z);if(cd<1.5&&F.y<ST.y+1.2){F.x=ST.x+(F.x-ST.x)/cd*1.5;F.z=ST.z+(F.z-ST.z)/cd*1.5}
 var g=hA(F.x,F.z);if(F.air){F.vy-=18*dt;F.y+=F.vy*dt;if(F.y<=g){F.y=g;F.air=false;F.vy=0}}else{if(F.y-g>.6){F.air=true;F.vy=0}else F.y=g}
 if(F.x<-1040&&F.z>100)F.z=100;
 F.atkT-=dt;F.spd=sp;var st=F.atkT>0?(F.cur==='fist'?'punch':'aim'):F.air?'air':'';if(!st&&F.cur!=='fist'&&F.aimHold>0)st='aim';
 F.ch.g.position.set(F.x,F.y,F.z);F.ch.g.rotation.y=F.yaw;F.ch.anim(dt,F.air?0:sp,st);F.state=st;
 // pickups
 PK.forEach(function(p){if(!p.m||!p.m.visible)return;if(Math.hypot(p.x-F.x,p.z-F.z)<1.6){if(NET.ok){if(!p.req||performance.now()-p.req>800){p.req=performance.now();send({t:'pick',id:p.id})}}else{p.m.visible=false;give(p.w,CH.WEAP[p.w].ammo);setTimeout(function(){p.m.visible=true},25000)}}})};
F.cam=function(cam,dt){var d=F.yaw-F.camYaw;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;if(F.spd>.2)F.camYaw+=d*Math.min(1,dt*2.2);
 if(CR.open){var fx=-Math.sin(F.yaw),fz=-Math.cos(F.yaw);cam.position.set(F.x+fx*3.1,F.y+1.55,F.z+fz*3.1);cam.lookAt(F.x,F.y+1.05,F.z);return}
 var fx2=-Math.sin(F.camYaw),fz2=-Math.cos(F.camYaw),tx=F.x-fx2*4.3,tz=F.z-fz2*4.3,ty=Math.max(F.y+2.1,FR.heightAt(tx,tz)+1);
 if(!F._cp){F._cp=cam.position.clone().set(tx,ty,tz)}F._cp.x+=(tx-F._cp.x)*Math.min(1,dt*8);F._cp.y+=(ty-F._cp.y)*Math.min(1,dt*8);F._cp.z+=(tz-F._cp.z)*Math.min(1,dt*8);cam.position.copy(F._cp);cam.lookAt(F.x+fx2*2,F.y+1.4,F.z+fz2*2)};
function give(w,a){if(F.weap.indexOf(w)<0)F.weap.push(w);F.ammo[w]=(F.ammo[w]||0)+a;F.cur=w;attachWeapon();hudUpd();FR.toast('🔫 '+CH.WEAP[w].en+' · '+CH.WEAP[w].ar)}
// ================= COMBAT (client side visuals; server decides hits) =================
var lastAtk=0;
function attack(){if(F.ko||!F.on)return;var w=CH.WEAP[F.cur]||CH.WEAP.fist,now=performance.now()/1000;if(now-lastAtk<w.rate)return;if(F.cur!=='fist'&&(F.ammo[F.cur]||0)<=0){FR.toast('No ammo · لا ذخيرة');return}lastAtk=now;
 // aim assist: snap to nearest player in a 30° cone
 var best=null,bd=1e9;Object.keys(RP).forEach(function(id){var r=RP[id];if(!r.cur||r.cur.ko)return;var dx=r.cur.x-F.x,dz=r.cur.z-F.z,d=Math.hypot(dx,dz);if(d>w.range)return;var a=Math.atan2(-dx,-dz)-F.yaw;while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;if(Math.abs(a)<.52&&d<bd){bd=d;best=a}});if(best!=null)F.yaw+=best;
 F.atkT=F.cur==='fist'?.25:.35;F.aimHold=1.2;if(F.cur!=='fist')F.ammo[F.cur]=Math.max(0,(F.ammo[F.cur]||0)-1);
 shotFX(F.x,F.y,F.z,F.yaw,F.cur);if(NET.ok)send({t:'atk',yaw:F.yaw});hudUpd()}
var tracers=[];
function shotFX(x,y,z,yaw,w){var Tt=T(),pool=FR.W.pool,fx=-Math.sin(yaw),fz=-Math.cos(yaw);if(w==='fist'){pool.emit(x+fx*.8,y+1.3,z+fz*.8,0,.4,0,.15,.5,.25,0xffffff,.6);return}
 var W2=CH.WEAP[w],len=Math.min(W2.range,30),c=w==='water'?0x6fd3ff:w==='paint'?[0xff2fa8,0xffd400,0x00e0a0][Math.floor(Math.random()*3)]:0xffe08a;
 if(w==='water'||w==='paint'){for(var i=0;i<6;i++){var k=2+i*2.5;pool.emit(x+fx*k,y+1.25-i*.05,z+fz*k,fx*6,-.5,fz*6,.18,.35,.35,c,.85)}return}
 var m=new Tt.Mesh(new Tt.Box(.03,.03,len),new Tt.Basic({color:c,transparent:true,opacity:.9,blending:2}));m.position.set(x+fx*(len/2+.6),y+1.3,z+fz*(len/2+.6));m.rotation.y=yaw;FR.W.scene.add(m);tracers.push({m:m,t:.08});
 pool.emit(x+fx*.9,y+1.3,z+fz*.9,0,0,0,.25,.05,.08,0xffc040,1,true)}
// ================= NETWORK =================
var NET={ws:null,ok:false,id:0,role:'player',set:{ff:true,weapons:true},name:LS.get('uae_mp_name',''),inv:{on:false,names:[]}},RP={},PK=[];FR.NET=NET;FR.RP=RP;FR.PK=PK;FR.give=function(w,a){give(w,a)};
var dev=LS.get('uae_dev','');if(!dev){dev='d'+Math.random().toString(36).slice(2)+Date.now().toString(36);LS.set('uae_dev',dev)}
function send(o){if(NET.ws&&NET.ws.readyState===1)NET.ws.send(JSON.stringify(o))}
function connect(name){if(NET.ws)try{NET.ws.close()}catch(e){}name=String(name||'').trim();if(!name){FR.toast('Pick a username');return}NET.name=name;LS.set('uae_mp_name',name);
 var url=(location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws',ws;try{ws=new WebSocket(url)}catch(e){status('Server not reachable ('+(e&&e.message)+')');return}NET.ws=ws;status('Connecting…');
 ws.onopen=function(){try{var car=(U()&&U().A&&U().A.car)||'roadster';send({t:'hello',name:name,dev:dev,key:LS.get('uae_owner_key','')||'',look:LOOK||{},car:car})}catch(e){console.warn('mp hello',e);status('Failed to handshake');try{ws.close()}catch(_e){}}};
 ws.onmessage=function(ev){var m;try{m=JSON.parse(ev.data)}catch(e){return}onMsg(m)};
 ws.onclose=function(){var was=NET.ok;NET.ok=false;status(NET.deny?'❌ '+NET.deny:was?'Disconnected':'Offline (server unreachable)');NET.deny=null;clearRemote();if(NET.kick){FR.toast(NET.kick);NET.kick=null}renderPanel()};ws.onerror=function(){status('Connection error')}}
function disconnect(){if(NET.ws)try{NET.ws.close()}catch(e){}NET.ws=null;NET.ok=false;clearRemote();renderPanel()}
function clearRemote(){Object.keys(RP).forEach(function(id){rmRemote(id)});PK.forEach(function(p){p.m&&FR.W.scene.remove(p.m)});PK.length=0;resetLocalPickups()}
function INVH(){var own=NET.role==='owner';return '<h4>Invites · دعوات</h4><div class="row"><input id="mp-inv" maxlength="16" placeholder="Invite player by username" style="flex:1"><button data-act="invadd">➕ Invite</button>'+(own?'<button data-act="invonly" class="'+(NET.inv.on?'on':'')+'">Invite-only server: '+(NET.inv.on?'ON':'OFF')+'</button>':'')+'</div><div class="row" style="flex-wrap:wrap;gap:4px">'+(NET.inv.names.length?NET.inv.names.map(function(x){return '<span class="pl" style="display:inline-flex;gap:4px;align-items:center">'+esc(x)+'<button data-act="invrm" data-n="'+esc(x)+'">✕</button></span>'}).join(' '):'<small>No invited players yet</small>')+'</div>'}
function invPop(m){var d=document.getElementById('mp-invpop');if(d)d.remove();d=document.createElement('div');d.id='mp-invpop';d.style.cssText='position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:99999;background:rgba(15,18,26,.95);color:#fff;padding:18px 22px;border-radius:10px;border:2px solid #d4af37;font:700 18px Rajdhani,Arial;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.5)';
 d.innerHTML='📨 <b>'+esc(m.from)+'</b> invited you to join him<br><button id="mp-invyes" style="margin:12px 6px 0;padding:10px 18px;font:900 16px Arial;border:0;border-radius:6px;background:#d4af37;cursor:pointer">✅ Join</button><button id="mp-invno" style="margin:12px 6px 0;padding:10px 18px;font:900 16px Arial;border:0;border-radius:6px;cursor:pointer">Later</button>';document.body.appendChild(d);
 d.querySelector('#mp-invno').onclick=function(){d.remove()};d.querySelector('#mp-invyes').onclick=function(){d.remove();send({t:'cmd',c:'inv_join',arg:String(m.id)})}}
FR.invPop=invPop;
function onMsg(m){var t=m.t;if(t==='inv'){NET.inv={on:!!m.on,names:m.names||[]};renderPanel();return}if(t==='invite'){invPop(m);return}
 if(t==='invgo'){setTimeout(function(){FR.onTp&&FR.onTp();if(m.mg&&window.__games&&__games.mpJoin)__games.mpJoin(m.mg);FR.toast('🚗 Joined your host')},200);return}
 if(t==='welcome'){NET.ok=true;NET.id=m.id;NET.role=m.role;NET.set=m.set||NET.set;status('Online as '+NET.name+' ('+m.role+')');try{(m.players||[]).forEach(addRemote);PK.forEach(function(p){p.m&&FR.W&&FR.W.scene&&FR.W.scene.remove(p.m)});PK.length=0;(m.pk||[]).forEach(function(pk){try{addPk(pk)}catch(e){console.warn('pk',e)}});if(m.keyBad)sysChat('Owner key not accepted');chatLine(null,'sys','Welcome to Roadster Dash UAE online · أهلاً بك. Enter to chat.');renderPanel();F.weap=['fist'];F.ammo={};F.cur='fist';attachWeapon();hudUpd();setTimeout(function(){var p=document.getElementById('mp-panel');if(p&&NET.ok)p.style.display='none'},900)}catch(e){console.warn('welcome',e);status('Online as '+NET.name+' (partial)')}}
 else if(t==='deny'){NET.deny=m.m;status('❌ '+m.m);FR.toast(m.m);NET.ws&&NET.ws.close()}
 else if(t==='join')addRemote(m.p);
 else if(t==='leave')rmRemote(m.id);
 else if(t==='snap'){var now=performance.now();m.p.forEach(function(p){if(p.id===NET.id){if(p.hp!==F.hp){F.hp=p.hp;hudUpd()}if(p.ko&&!F.ko){F.ko=true;koScreen(true)}NET.role=p.r;return}var r=RP[p.id]||addRemote(p);r.buf.push({t:now,p:p});if(r.buf.length>8)r.buf.shift();if(JSON.stringify(p.look)!==r.lookS){r.lookS=JSON.stringify(p.look);r.ch&&FR.W.scene.remove(r.ch.g);r.ch=null}})}
 else if(t==='chat')chatLine(m.n,m.r,m.m);
 else if(t==='sys')chatLine(null,'sys',m.m);
 else if(t==='role'){NET.role=m.r;FR.toast('Your role: '+m.r.toUpperCase());renderPanel()}
 else if(t==='kicked'){NET.kick=m.m;FR.toast(m.m)}
 else if(t==='set'){NET.set=m.s;renderPanel()}
 else if(t==='hit'){hitMarker(m.d)}
 else if(t==='feed'){feed(m.a,m.v,m.w)}
 else if(t==='fx'){var r2=RP[m.id];if(r2&&r2.cur){shotFX(r2.cur.x,r2.cur.y,r2.cur.z,m.yaw,m.w);r2.atk=.35;r2.atkW=m.w}}
 else if(t==='respawn'){F.ko=false;koScreen(false);F.hp=100;var ST=FR.ST;ST.x=m.x;ST.z=m.z;ST.y=FR.heightAt(m.x,m.z);ST.vx=ST.vz=0;if(F.on){F.x=m.x+2;F.z=m.z;F.y=FR.heightAt(F.x,F.z)}F.weap=F.weap.filter(function(w){return w==='fist'||(F.ammo[w]||0)>0});hudUpd();sync(true)}
 else if(t==='inv'){F.weap=m.weap;F.ammo=m.ammo;if(F.cur!==m.cur){F.cur=m.cur;attachWeapon()}hudUpd()}
 else if(t==='mg'){if(FR.onMg)try{FR.onMg(m)}catch(e){console.warn('mg',e)}}
 else if(t==='hp'){F.hp=m.hp;F.ko=false;koScreen(false);hudUpd()}
 else if(t==='pk'){addPk(m.p)}
 else if(t==='pkx'){PK.forEach(function(p){if(p.id===m.id&&p.m)p.m.visible=false})}
 else if(t==='pos'){if(F.on){F.x=m.x;F.z=m.z}else{FR.ST.x=m.x;FR.ST.z=m.z}}
 else if(t==='look'){var r3=RP[m.id];if(r3&&r3.ch){FR.W.scene.remove(r3.ch.g);r3.ch=null;r3.lookS=JSON.stringify(m.look)}}}
var CARTYPE={suv:1,patrol:1,rr:1,landcruiser:1,truck:2,hilux:2};
function tagTex(r){var Tt=T(),c=document.createElement('canvas');c.width=256;c.height=72;var t=new Tt.CanvasTex(c);t.colorSpace=Tt.SRGB;return{c:c,t:t}}
function drawTag(r,p){var g=r.tag.c.getContext('2d'),b=ROLEB[p.r]||ROLEB.player;g.clearRect(0,0,256,72);g.fillStyle='rgba(10,12,18,.65)';g.beginPath();g.roundRect?g.roundRect(8,4,240,40,10):g.rect(8,4,240,40);g.fill();g.font='bold 24px Arial';g.textAlign='center';g.fillStyle=b[1];g.fillText((b[0]?b[0]+' ':'')+p.n,128,32);
 g.fillStyle='rgba(0,0,0,.6)';g.fillRect(48,52,160,12);g.fillStyle=p.hp>50?'#22c55e':p.hp>25?'#f59e0b':'#ef4444';g.fillRect(50,54,156*Math.max(0,p.hp)/100,8);r.tag.t.needsUpdate=true}
function addRemote(p){var Tt=T();if(RP[p.id])return RP[p.id];var r={id:p.id,buf:[],cur:null,ch:null,car:null,carKey:'',lookS:JSON.stringify(p.look||{}),tagKey:''};
 r.tag=tagTex(r);r.tagM=new Tt.Mesh(new Tt.Plane(2.4,.68),new Tt.Basic({map:r.tag.t,transparent:true,depthWrite:false,fog:false}));r.tagM.renderOrder=40;FR.W.scene.add(r.tagM);RP[p.id]=r;return r}
function rmRemote(id){var r=RP[id];if(!r)return;[r.ch&&r.ch.g,r.car,r.tagM].forEach(function(o){o&&FR.W.scene.remove(o)});delete RP[id]}
function lerpA(a,b,t){var d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return a+d*t}
function updRemote(dt){var now=performance.now()-130,cam=FR.W.cam;Object.keys(RP).forEach(function(id){var r=RP[id],B=r.buf;if(!B.length)return;var a=B[0],b=B[B.length-1];for(var i=0;i<B.length-1;i++){if(B[i].t<=now&&B[i+1].t>=now){a=B[i];b=B[i+1];break}}
 var k=b.t>a.t?Math.max(0,Math.min(1,(now-a.t)/(b.t-a.t))):1,P=a.p,Q=b.p,cur={x:P.x+(Q.x-P.x)*k,y:P.y+(Q.y-P.y)*k,z:P.z+(Q.z-P.z)*k,yaw:lerpA(P.yaw,Q.yaw,k),p:Q.p,rl:Q.rl,m:Q.m,ko:Q.ko,hp:Q.hp,n:Q.n,r:Q.r,w:Q.w,car:Q.car,pc:Q.pc,look:Q.look,a:Q.a};
 var sp=r.cur?Math.hypot(cur.x-r.cur.x,cur.z-r.cur.z)/Math.max(dt,1e-3):0;r.cur=cur;
 if(cur.m==='foot'){if(r.car)r.car.visible=false;if(!r.ch){r.ch=CH.build(cur.look||{});FR.W.scene.add(r.ch.g);r.wk=''}if(r.wk!==cur.w){if(r.wm)r.wm.parent.remove(r.wm);r.wm=CH.weaponMesh(cur.w);if(r.wm){r.wm.position.set(0,-.07,-.04);r.wm.rotation.x=Math.PI/2;(r.ch.P.handR||r.ch.P.armR).add(r.wm)}r.wk=cur.w}
  r.ch.g.visible=true;r.ch.g.position.set(cur.x,cur.y,cur.z);r.ch.g.rotation.y=cur.yaw;r.atk=(r.atk||0)-dt;r.ch.anim(dt,Math.min(7,sp),cur.ko?'ko':r.atk>0?(r.atkW==='fist'?'punch':'aim'):cur.a==='air'?'air':'')}
 else{if(r.ch)r.ch.g.visible=false;var ck=cur.car+cur.pc;if(r.carKey!==ck||(r.carFb&&performance.now()>r.carRetry)){var mdl=window.__uae&&__uae.carModel?__uae.carModel(cur.car,cur.pc):'fail',fb=!mdl||mdl==='fail';if(r.car)FR.W.scene.remove(r.car);if(fb){r.car=FR.trafficCar(parseInt((cur.pc||'#eeeeea').slice(1),16),CARTYPE[cur.car]||0)}else{r.car=new __T.Group();r.car.add(mdl)}r.carFb=!mdl;r.carRetry=performance.now()+700;r.car.rotation.order='YXZ';FR.W.scene.add(r.car);r.carKey=ck}r.car.visible=true;r.car.position.set(cur.x,cur.y,cur.z);r.car.rotation.set(cur.p||0,cur.yaw,cur.rl||0)}
 var tk=cur.n+cur.r+cur.hp;if(tk!==r.tagKey){drawTag(r,cur);r.tagKey=tk}r.tagM.position.set(cur.x,cur.y+(cur.m==='foot'?2.35:2.5),cur.z);r.tagM.quaternion.copy(cam.quaternion);
 // ramming (we are the attacker if we're driving fast into them)
 if(!F.on&&NET.ok&&Math.hypot(FR.ST.vx,FR.ST.vz)>8&&Math.hypot(cur.x-FR.ST.x,cur.z-FR.ST.z)<3.4&&Math.abs(cur.y-FR.ST.y)<2.5&&(!r.ramT||performance.now()-r.ramT>1100)){r.ramT=performance.now();send({t:'ram',id:+id})}})}
// pickups
function addPk(p){var Tt=T();PK.forEach(function(q){if(q.id===p.id&&q.m){FR.W.scene.remove(q.m)}});for(var i=PK.length-1;i>=0;i--)if(PK[i].id===p.id)PK.splice(i,1);
 var g=new Tt.Group(),wm=CH.weaponMesh(p.w);if(wm){wm.scale.setScalar(1.8);wm.position.y=.9;wm.rotation.y=Math.PI/2;g.add(wm)}var ring=new Tt.Mesh(new Tt.Cyl(.75,.75,.04,24),new Tt.Basic({color:CH.WEAP[p.w].col||'#f3d77a',transparent:true,opacity:.55,blending:2}));ring.position.y=.06;g.add(ring);var beam=new Tt.Mesh(new Tt.Cyl(.35,.35,14,12,1,true),new Tt.Basic({color:CH.WEAP[p.w].col||'#f3d77a',transparent:true,opacity:.28,blending:2,depthWrite:false,side:2}));beam.position.y=7;g.add(beam);
 g.position.set(p.x,FR.heightAt(p.x,p.z)+.05,p.z);FR.W.scene.add(g);PK.push({id:p.id,x:p.x,z:p.z,w:p.w,m:g,spin:wm})}
var LOCALPK=[[10,120,'pistol'],[-80,-5,'smg'],[85,85,'shotgun'],[-160,40,'rifle'],[0,260,'water'],[240,300,'paint']];
function resetLocalPickups(){if(!FR.W||!FR.W.scene)return;LOCALPK.forEach(function(p,i){addPk({id:-1-i,x:p[0],z:p[1],w:p[2]})})}
// state sync
var stT=0,lastTp=0;
function sync(tp){if(!NET.ok)return;var ST=FR.ST,o=F.on?{t:'st',x:F.x,y:F.y,z:F.z,yaw:F.yaw,m:'foot',a:F.state||(F.air?'air':'')}:{t:'st',x:ST.x,y:ST.y,z:ST.z,yaw:ST.yaw,p:ST.pitch,rl:ST.roll,m:'car'};o.car=U().A.car;var c=window.__v10&&__v10.cfg();o.pc=c&&c.paint.on?c.paint.hex:'#eeeeea';if(tp)o.tp=1;send(o)}
// ================= HUD / UI =================
var css=`
#mp-hp{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);width:260px;height:14px;border-radius:8px;background:rgba(0,0,0,.55);overflow:hidden;display:none;border:1px solid rgba(255,255,255,.3)}
#mp-hp i{display:block;height:100%;background:linear-gradient(90deg,#22c55e,#a3e635)}
#mp-wp{position:absolute;left:50%;bottom:34px;transform:translateX(-50%);font:700 13px Arial;background:rgba(10,12,18,.6);padding:4px 12px;border-radius:999px;display:none;white-space:nowrap}
#mp-feed{position:absolute;right:12px;top:200px;display:flex;flex-direction:column;gap:4px;align-items:flex-end;font:700 12px Arial}
#mp-feed div{background:rgba(10,12,18,.65);padding:4px 10px;border-radius:8px}
#mp-hit{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:900 30px Arial;color:#fff;opacity:0;transition:opacity .25s;text-shadow:0 0 6px #000}
#mp-ko{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(40,40,60,.35);font:900 42px Arial;text-shadow:0 3px 14px #000;text-align:center}
#mp-chat{position:absolute;left:12px;bottom:118px;width:min(380px,calc(100vw - 24px));pointer-events:auto;font:13px Arial}
#mp-chat .log{max-height:170px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;-webkit-mask-image:linear-gradient(transparent,#000 22%)}
#mp-chat .log div{background:rgba(10,12,18,.55);padding:3px 8px;border-radius:7px;word-break:break-word}
#mp-chat .log .sys{color:#f3d77a}
#mp-chat form{display:none;margin-top:4px;gap:4px}
#mp-chat.open form{display:flex}
#mp-chat input{flex:1;background:rgba(10,12,18,.85);border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:9px;padding:8px;font:14px Arial;min-width:0}
#mp-chat button{padding:0 12px}
#mp-panel,#mp-cr{position:absolute;top:58px;right:10px;width:min(400px,calc(100vw - 20px));max-height:calc(100vh - 80px);overflow:auto;background:rgba(10,12,18,.92);border-radius:14px;padding:12px;display:none;pointer-events:auto;font:13px Arial;z-index:20}
#mp-panel h4,#mp-cr h4{margin:10px 0 6px;font-size:11px;letter-spacing:1.3px;color:#c9c2ad;text-transform:uppercase}
#mp-panel input,#mp-cr select{background:#151821;border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:9px;padding:8px;font:14px Arial;min-width:0}
#mp-panel .row,#mp-cr .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:5px 0}
#mp-panel .pl{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.08)}
#mp-panel .pl .ac{display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end}
#mp-panel .pl .ac button{padding:4px 7px;font-size:11px;border-radius:7px}
#mp-panel button,#mp-cr button{padding:7px 10px;font-size:12px}
#mp-cr .sw{width:28px;height:28px;border-radius:50%;padding:0}
#mp-cr .sw.on{box-shadow:0 0 0 3px #f3d77a}
#fr .foot{position:absolute;right:20px;bottom:24px;display:none;grid-template-columns:repeat(3,64px);gap:9px}
#fr.touch.onfoot .foot{display:grid}
#fr.touch.onfoot .ped,#fr.touch.onfoot .acts{display:none}
#fr .foot button{height:60px;font-size:20px;touch-action:none}#fr .foot button small{display:block;font-size:9px}
#fr .carbtn{position:absolute;right:190px;bottom:24px;display:none;width:64px;height:60px;font-size:20px}
#fr.touch .carbtn{display:block}#fr.touch.onfoot .carbtn{display:none}
@media (max-width:820px){#mp-chat{bottom:200px}#mp-feed{top:160px}}
`;
var H={};
function el(h){var d=document.createElement('div');d.innerHTML=h.trim();return d.firstElementChild}
function mkUI(){var hud=FR.hudEl();if(!hud||H.ok)return!!H.ok;H.ok=1;var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 var top=hud.querySelector('.top');top.appendChild(el('<button data-m="online">🌐 Online</button>'));top.appendChild(el('<button data-m="char">🧍 Character</button>'));top.appendChild(el('<button data-m="foot" id="mp-footbtn">🚶 Exit car (E)</button>'));top.appendChild(el('<button data-m="chat">💬</button>'));
 ['<div id="mp-hp"><i></i></div>','<div id="mp-wp"></div>','<div id="mp-feed"></div>','<div id="mp-hit">✕</div>','<div id="mp-ko">KNOCKED OUT · خارج اللعب<br><small style="font-size:18px">Respawning…</small></div>',
  '<div id="mp-chat"><div class="log"></div><form><input maxlength="160" placeholder="Say something · اكتب رسالة  (/help)" enterkeyhint="send"><button>Send</button></form></div>','<div id="mp-panel"></div>','<div id="mp-cr"></div>',
  '<div class="foot touch-only"><button data-f="atk">👊<small>ATTACK</small></button><button data-f="jump">⤴<small>JUMP</small></button><button data-f="enter">🚗<small>CAR</small></button><button data-f="sw">🔄<small>SWITCH</small></button><button data-f="drop">⬇<small>DROP</small></button><button data-h="boost">🏃<small>RUN</small></button></div>',
  '<button class="carbtn" data-f="enter">🚶<small style="display:block;font-size:9px">EXIT</small></button>'].forEach(function(h){var e=el(h);if(e.classList.contains('foot')||e.classList.contains('carbtn'))hud.querySelector('.touch').appendChild(e);else hud.appendChild(e)});
 // hold binding for the new RUN button
 hud.querySelectorAll('.foot [data-h]').forEach(function(b){var k=b.dataset.h;b.addEventListener('pointerdown',function(e){e.preventDefault();FR.input[k]=1});['pointerup','pointercancel','pointerleave'].forEach(function(ev){b.addEventListener(ev,function(){FR.input[k]=0})})});
 hud.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var m=b.dataset.m,f=b.dataset.f;
  if(m==='online')togglePanel();if(m==='char')toggleCreator();if(m==='foot')F.toggle();if(m==='chat')openChat();
  if(f==='atk')attack();if(f==='jump')jump();if(f==='enter')F.toggle();if(f==='sw')cycle();if(f==='drop')drop();
  var a=b.dataset.act;if(a)panelAct(a,b.dataset.n,b);var o=b.dataset.o;if(o)crSet(o,b.dataset.v)});
 var form=hud.querySelector('#mp-chat form'),inp=form.querySelector('input');form.addEventListener('submit',function(e){e.preventDefault();var v=inp.value.trim();if(v){if(v==='/help'){chatLine(null,'sys','Commands: /list. Owner only: /kick name, /ban name, /unban name, /bans, /mute name, /unmute name, /heal [name], /god [name], /give [name] pistol|smg|shotgun|rifle|water|paint, /ff, /weapons')}else if(NET.ok)send({t:'chat',m:v});else chatLine(null,'sys','Go online first (🌐 Online)')}inp.value='';hud.querySelector('#mp-chat').classList.remove('open');inp.blur()});
 inp.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Escape'){hud.querySelector('#mp-chat').classList.remove('open');inp.blur()}});
 ['#mp-panel','#mp-cr','#mp-chat'].forEach(function(s){var x=hud.querySelector(s);['keydown','keyup'].forEach(function(ev){x.addEventListener(ev,function(e){e.stopPropagation()})})});
 hud.querySelector('#mp-panel').addEventListener('input',function(){});
 // tap/click on the 3D view = attack when on foot (desktop mouse)
 window.addEventListener('mousedown',function(e){if(FR.active&&F.on&&e.button===0&&e.target&&(e.target.tagName==='CANVAS')&&!e.target.classList.contains('map'))attack()},true);
 resetLocalPickups();return true}
function openChat(){var c=document.querySelector('#mp-chat');if(!c)return;c.classList.add('open');setTimeout(function(){c.querySelector('input').focus()},30)}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function chatLine(n,r,m){var L=document.querySelector('#mp-chat .log');if(!L)return;var b=ROLEB[r]||ROLEB.player,d=document.createElement('div');if(r==='sys'){d.className='sys';d.textContent='• '+m}else d.innerHTML='<b style="color:'+b[1]+'">'+(b[0]?b[0]+' ':'')+esc(n)+'</b>: '+esc(m);L.appendChild(d);while(L.children.length>60)L.removeChild(L.firstChild);L.scrollTop=1e9}
function sysChat(m){chatLine(null,'sys',m)}
function status(t){NET.status=t;var s=document.getElementById('mp-status');if(s)s.textContent=t}
function hitMarker(d){var h=document.getElementById('mp-hit');if(!h)return;h.textContent='✕ '+d;h.style.opacity=1;clearTimeout(h._t);h._t=setTimeout(function(){h.style.opacity=0},220)}
function feed(a,v,w){var f=document.getElementById('mp-feed');if(!f)return;var ic={fist:'👊',ram:'🚗',water:'💦',paint:'🎨'}[w]||'🔫',d=document.createElement('div');d.textContent=a+' '+ic+' '+v;f.appendChild(d);setTimeout(function(){d.remove()},6000);while(f.children.length>5)f.removeChild(f.firstChild)}
function koScreen(on){var k=document.getElementById('mp-ko');if(k)k.style.display=on?'flex':'none'}
function hudUpd(){var hp=document.getElementById('mp-hp'),wp=document.getElementById('mp-wp');if(!hp)return;var show=NET.ok||F.on;hp.style.display=show?'block':'none';hp.querySelector('i').style.width=Math.max(0,F.hp)+'%';
 wp.style.display=F.on?'block':'none';var w=CH.WEAP[F.cur]||CH.WEAP.fist;wp.textContent=(F.cur==='fist'?'👊 ':'🔫 ')+w.en+' · '+w.ar+(F.cur==='fist'?'':'  '+(F.ammo[F.cur]||0))+(F.weap.length>1?'   [Q switch · G drop]':'')}
// ---- online panel ----
function togglePanel(f){var p=document.getElementById('mp-panel'),cr=document.getElementById('mp-cr');var show=f==null?p.style.display!=='block':f;p.style.display=show?'block':'none';if(show){cr.style.display='none';CR.open=false;renderPanel()}}
function renderPanel(){var p=document.getElementById('mp-panel');if(!p||p.style.display!=='block')return;var r=NET.role,adm=NET.ok&&r==='owner',own=r==='owner';
 var h='<h4>Online Free Roam · اللعب الجماعي</h4><div class="row"><input id="mp-name" maxlength="16" placeholder="Username (3-16)" value="'+esc(NET.name)+'" style="flex:1"><button data-act="'+(NET.ok?'off':'on')+'">'+(NET.ok?'Disconnect':'Go online')+'</button></div><div class="row" id="mp-status" style="color:#c9c2ad">'+esc(NET.status||'Offline')+'</div>';
 if(NET.ok){h+='<h4>Players</h4>';var me='<div class="pl"><span>'+(ROLEB[r][0]||'')+' <b>'+esc(NET.name)+'</b> (you)</span><span>'+F.hp+' ❤</span></div>';h+=me;
  Object.keys(RP).forEach(function(id){var c=RP[id].cur;if(!c)return;var acts='';if(adm&&c.r!=='owner'&&(own||c.r!=='admin')){acts=['kick','ban','mute','unmute','heal','god'].map(function(a){return '<button data-act="'+a+'" data-n="'+esc(c.n)+'">'+a+'</button>'}).join('')+'<button data-act="give" data-n="'+esc(c.n)+'">give rifle</button>'}
   h+='<div class="pl"><span style="color:'+(ROLEB[c.r]||ROLEB.player)[1]+'">'+((ROLEB[c.r]||[''])[0]||'')+' '+esc(c.n)+' <small>'+c.hp+'❤</small></span><span class="ac">'+acts+'</span></div>'});
  if(adm)h+='<h4>Server settings</h4><div class="row"><button data-act="ff" class="'+(NET.set.ff?'on':'')+'">Friendly fire: '+(NET.set.ff?'ON':'OFF')+'</button><button data-act="weapons" class="'+(NET.set.weapons?'on':'')+'">Weapons: '+(NET.set.weapons?'ON':'OFF')+'</button><button data-act="heal" data-n="">Heal me</button><button data-act="god" data-n="">God me</button></div>'+INVH()+'<div class="row"><input id="mp-unban" placeholder="unban name" style="flex:1"><button data-act="unban">Unban</button><button data-act="bans">List bans</button></div>';
  if(r!=='player')h+='<h4>VIP perks</h4><div class="row"><button data-act="vipgold">⭐ Exclusive VIP gold-chrome paint</button></div>'}
 h+='<h4>Owner key · مفتاح المالك</h4><div class="row"><input id="mp-key" type="password" placeholder="'+(LS.get('uae_owner_key','')?'(saved on this device)':'enter once')+'" style="flex:1" autocomplete="off"><button data-act="key">Save</button><button data-act="keyclr">Forget</button></div><div style="color:#998f78;font-size:11px">Only the owner has the key. Saved here only on your device; reconnect after saving.</div>';
 p.innerHTML=h}
function panelAct(a,n,b){if(a==='on'){connect(document.getElementById('mp-name').value)}else if(a==='off')disconnect();
 else if(a==='key'){var v=document.getElementById('mp-key').value.trim();if(v){LS.set('uae_owner_key',v);FR.toast('Owner key saved on this device');if(NET.ok){disconnect();setTimeout(function(){connect(NET.name)},300)}}}
 else if(a==='keyclr'){localStorage.removeItem('uae_owner_key');FR.toast('Owner key removed')}
 else if(a==='invadd'){var v=document.getElementById('mp-inv').value.trim();if(v)send({t:'cmd',c:'inv_add',tgt:v});document.getElementById('mp-inv').value=''}
 else if(a==='invrm')send({t:'cmd',c:'inv_rm',tgt:n});
 else if(a==='invonly')send({t:'cmd',c:'inv_only'});
 else if(a==='unban')send({t:'cmd',c:'unban',tgt:document.getElementById('mp-unban').value});
 else if(a==='give')send({t:'cmd',c:'give',tgt:n,arg:'rifle'});
 else if(a==='vipgold'){if(NET.role!=='owner')return;var c=window.__v10.cfg();c.paint={on:true,hex:'#e6c35c',fin:'chrome'};window.__v10.persist();U().applyColor();FR.toast('⭐ VIP gold applied')}
 else send({t:'cmd',c:a,tgt:n||''});setTimeout(renderPanel,300)}
// ---- character creator ----
var CR={open:false};
function toggleCreator(f){var cr=document.getElementById('mp-cr'),show=f==null?cr.style.display!=='block':f;cr.style.display=show?'block':'none';CR.open=show;if(show){document.getElementById('mp-panel').style.display='none';if(!F.on)exitCar();renderCreator()}}
function opt(o,v,label,on){return '<button data-o="'+o+'" data-v="'+esc(v)+'" class="'+(on?'on':'')+'">'+label+'</button>'}
function renderCreator(){var cr=document.getElementById('mp-cr'),O=CH.OPTS,L=LOOK,h='<h4>Character · الشخصية</h4>';
 h+='<div class="row">Skin '+O.skin.map(function(c,i){return '<button class="sw '+(L.skin===i?'on':'')+'" style="background:'+c+'" data-o="skin" data-v="'+i+'"></button>'}).join('')+'</div>';
 h+='<div class="row">Face '+O.face.map(function(f,i){return opt('face',i,f,L.face===i)}).join('')+'</div>';
 h+='<h4>Outfit · اللبس</h4><div class="row">'+Object.keys(O.out).map(function(k){return opt('out',k,O.out[k].en+' · '+O.out[k].ar,L.out===k)}).join('')+'</div>';
 if(L.out==='kandoora'){h+='<div class="row">Style '+Object.keys(O.style).map(function(k){return opt('style',k,O.style[k].en,L.style===k)}).join('')+'</div><div class="row">Colour '+Object.keys(O.kcol).map(function(k){return '<button class="sw '+(L.kcol===k?'on':'')+'" title="'+k+'" style="background:'+O.kcol[k]+'" data-o="kcol" data-v="'+k+'"></button>'}).join('')+'</div>'}
 if(L.out==='casual'||L.head==='cap')h+='<div class="row">Top/cap '+O.casual.map(function(c){return '<button class="sw '+(L.casual===c?'on':'')+'" style="background:'+c+'" data-o="casual" data-v="'+c+'"></button>'}).join('')+'</div>';
 h+='<h4>Head · الرأس</h4><div class="row">'+Object.keys(O.head).map(function(k){return opt('head',k,O.head[k],L.head===k)}).join('')+'</div>';
 h+='<div class="row">Hair '+O.hair.map(function(k){return opt('hair',k,k,L.hair===k)}).join('')+'</div><div class="row">Hair colour '+O.hairc.map(function(c,i){return '<button class="sw '+(L.hairc===i?'on':'')+'" style="background:'+c+'" data-o="hairc" data-v="'+i+'"></button>'}).join('')+'</div>';
 h+='<div class="row">Beard '+O.beard.map(function(k){return opt('beard',k,k,L.beard===k)}).join('')+'</div>';
 h+='<h4>Extras</h4><div class="row">'+opt('glasses',L.glasses?0:1,'🕶 Sunglasses',L.glasses)+opt('watch',L.watch?0:1,'⌚ Watch',L.watch)+'</div><div class="row">Shoes '+O.shoes.map(function(c){return '<button class="sw '+(L.shoes===c?'on':'')+'" style="background:'+c+'" data-o="shoes" data-v="'+c+'"></button>'}).join('')+'</div>';
 h+='<div class="row"><button data-o="done" data-v="1">✓ Done</button><button data-o="random" data-v="1">🎲 Random</button></div>';cr.innerHTML=h}
function crSet(o,v){if(o==='done'){toggleCreator(false);return}if(o==='random'){var O=CH.OPTS,r=function(a){return a[Math.floor(Math.random()*a.length)]};LOOK=CH.sanitize({skin:Math.floor(Math.random()*6),face:Math.floor(Math.random()*3),hair:r(O.hair),hairc:Math.floor(Math.random()*4),beard:r(O.beard),head:r(Object.keys(O.head)),out:r(Object.keys(O.out)),style:r(Object.keys(O.style)),kcol:r(Object.keys(O.kcol)),casual:r(O.casual),glasses:Math.random()<.4,watch:Math.random()<.6,shoes:r(O.shoes)})}
 else{var L=LOOK;if(['skin','face','hairc'].indexOf(o)>=0)L[o]=+v;else if(o==='glasses'||o==='watch')L[o]=v==='1';else L[o]=v;
  if(o==='out'&&v==='abaya'&&['ghutra','shemagh','kumma'].indexOf(L.head)>=0){L.head='shayla';L.beard='none'}if(o==='out'&&v==='kandoora'&&L.head==='shayla')L.head='ghutra';LOOK=CH.sanitize(L)}
 LS.set('uae_look',LOOK);buildChar();if(NET.ok)send({t:'look',look:LOOK});renderCreator()}
FR.creator=toggleCreator;FR.mpConnect=connect;FR.mpSend=send;FR.attack=attack;FR.LOOK=function(){return LOOK};
// ================= frame hook =================
setInterval(function(){if(FR.active)try{mkUI()}catch(e){}},200);
FR.onFrame=function(dt){if(!mkUI())return;var hud=FR.hudEl();hud.classList.toggle('onfoot',F.on);var fb=document.getElementById('mp-footbtn');if(fb)fb.textContent=F.on?'🚗 Enter car (E)':'🚶 Exit car (E)';
 if(F.on){if(!F.ch)buildChar();F.update(dt);F.aimHold=(F.aimHold||0)-dt}
 var car=FR.getCar();if(car&&car.g)car.g.visible=true;
 updRemote(dt);PK.forEach(function(p){if(p.spin)p.spin.rotation.y+=dt*2});
 for(var i=tracers.length-1;i>=0;i--){tracers[i].t-=dt;if(tracers[i].t<=0){FR.W.scene.remove(tracers[i].m);tracers[i].m.geometry.dispose();tracers.splice(i,1)}}
 stT-=dt;if(stT<=0){stT=1/12;sync()}hudUpd()};
// teleport → tell server it's a legit jump
FR.onTp=function(){if(F.on){F.x=FR.ST.x+2;F.z=FR.ST.z;F.y=FR.heightAt(F.x,F.z)}sync(true)};
FR.onExit=function(){if(F.on){F.on=false;if(F.ch)F.ch.g.visible=false}};
})();

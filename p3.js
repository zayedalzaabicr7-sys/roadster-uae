/* Roadster Dash UAE — Phase 3: weapon shops, customisation entry points, richer open world (original procedural code) */
(function(){'use strict';
var FR=window.__fr;if(!FR)return;
function T(){return window.__T}
function U(){return window.__uae}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var SHOPS=[{x:-15,z:92,n:'Downtown'},{x:-450,z:76,n:'Sheikh Zayed Rd'},{x:-1230,z:24,n:'Corniche'},{x:56,z:488,n:'Desert'},{x:400,z:-20,n:'Jebel Jais'}];FR.SHOPS=SHOPS;
var css=`
#p3-shop{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:62;display:none;background:linear-gradient(145deg,rgba(30,26,14,.95),rgba(10,10,14,.96));border:1px solid #f3d77a;border-radius:16px;padding:12px 14px;color:#fff;font:14px Arial;max-width:96vw;box-shadow:0 10px 30px rgba(0,0,0,.6)}
#p3-shop h3{margin:0 0 8px;color:#f3d77a}#p3-shop .row{display:flex;gap:8px;flex-wrap:wrap}
#p3-shop button{pointer-events:auto;font:800 13px Arial;color:#111;background:#f3d77a;border:0;border-radius:10px;padding:9px 11px;cursor:pointer;min-width:92px}
#p3-shop button small{display:block;font-weight:600;opacity:.75}
#fr .p3big{background:linear-gradient(135deg,#d4af37,#f3d77a)!important;color:#111!important;border-color:#f3d77a!important;font-weight:900!important}
#u-p3bar{display:grid;grid-template-columns:repeat(2,minmax(150px,1fr));gap:8px;margin-top:10px;max-width:470px}
#u-p3bar button{font:900 16px Rajdhani,Arial;letter-spacing:.5px;padding:13px 12px;border-radius:6px;border:0;cursor:pointer;color:#111;background:linear-gradient(135deg,#d4af37,#f3d77a);box-shadow:0 4px 16px rgba(0,0,0,.35);text-align:left}
#u-p3bar button.b2{background:linear-gradient(135deg,#2f7bff,#7cc4ff);color:#fff}
#u-p3bar button small{display:block;font:600 11px Arial;opacity:.8}
`;
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
// ---------------- main-menu big buttons ----------------
function mainBtns(){var bar=document.getElementById('u-menubar');if(!bar||document.getElementById('u-p3bar'))return;
 var d=document.createElement('div');d.id='u-p3bar';d.innerHTML='<button data-p="garage">🎨 Customise car<small>Paint · plate · rims · mods</small></button><button data-p="char">🧍 Character<small>Kandoora · ghutra · abaya · style</small></button><button data-p="games" class="b2">⚽ Games · Sky League<small>Car-soccer · Aero World · race…</small></button><button data-p="online" class="b2">🌐 Multiplayer<small>Free roam · chat · combat</small></button>';
 bar.parentNode.insertBefore(d,bar.nextSibling);
 d.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;e.stopPropagation();var p=b.dataset.p;
  if(p==='garage'){var V=window.__v10;V&&V.openGarage&&V.openGarage();return}
  FR.enter&&FR.enter();(function(){var tries=0;function go(){tries++;if(p==='char'){if(FR.creator){FR.creator(true);return}if(tries<40)return setTimeout(go,100)}if(p==='games'){if(FR.games&&FR.games.openMenu){FR.games.openMenu();return}if(tries<40)return setTimeout(go,100)}if(p==='online'){var o=document.querySelector('#fr [data-m="online"]');if(o){o.click();return}if(tries<50)return setTimeout(go,120);FR.toast&&FR.toast('Open 🌐 Online in the HUD');return}}setTimeout(go,p==='online'?200:300)})()});
 ['pointerdown','touchstart','mousedown'].forEach(function(ev){d.addEventListener(ev,function(e){e.stopPropagation()},{passive:true})})}
setInterval(mainBtns,700);
// ---------------- FR HUD buttons ----------------
function frBtns(){var hud=FR.hudEl&&FR.hudEl();if(!hud)return;var top=hud.querySelector('.top');if(!top||document.getElementById('p3-cust'))return;var oc=top.querySelector('[data-m="char"]');if(oc)oc.style.display='none';
 var mk=function(id,txt,fn){var b=document.createElement('button');b.id=id;b.className='p3big';b.textContent=txt;b.addEventListener('click',function(e){e.stopPropagation();fn()});['pointerdown','touchstart'].forEach(function(ev){b.addEventListener(ev,function(e){e.stopPropagation()},{passive:true})});top.insertBefore(b,top.children[1]||null);return b};
 mk('p3-games','🎮 Games (Y)',function(){FR.games&&FR.games.openMenu()});
 mk('p3-char','🧍 Character (I)',function(){FR.creator&&FR.creator(true)});
 mk('p3-cust','🎨 Customise (U)',function(){FR.games&&FR.games.openGarage()})}
// ---------------- weapon shops ----------------
var shopUI=null,built=false,near=null;
function sign(t,txt,sub,w,h){var c=document.createElement('canvas');c.width=512;c.height=160;var g=c.getContext('2d');var gr=g.createLinearGradient(0,0,512,0);gr.addColorStop(0,'#7a1020');gr.addColorStop(1,'#c8102e');g.fillStyle=gr;g.fillRect(0,0,512,160);g.strokeStyle='#f3d77a';g.lineWidth=8;g.strokeRect(4,4,504,152);
 g.fillStyle='#fff';g.font='bold 54px Arial';g.textAlign='center';g.fillText(txt,256,72);g.fillStyle='#f3d77a';g.font='bold 34px Arial';g.fillText(sub,256,128);var tx=new t.CanvasTex(c);tx.colorSpace=t.SRGB;return new t.Mesh(new t.Plane(w,h),new t.Basic({map:tx,side:2}))}
function buildShops(){if(built||!FR.W||!FR.W.scene)return;built=true;var t=T();
 SHOPS.forEach(function(s){var G=new t.Group(),y=FR.heightAt(s.x,s.z);G.position.set(s.x,y,s.z);
  var wall=new t.Std({color:0xe8dcc4,roughness:.85}),dark=new t.Std({color:0x2b2f36,roughness:.6}),gold=new t.Std({color:0xd4af37,metalness:.7,roughness:.3});
  [[0,2,-3,8,4,.3],[-4,2,0,.3,4,6],[4,2,0,.3,4,6]].forEach(function(b){var m=new t.Mesh(new t.Box(b[3],b[4],b[5]),wall);m.position.set(b[0],b[1],b[2]);m.castShadow=true;G.add(m)});
  var roof=new t.Mesh(new t.Box(8.6,.4,6.6),dark);roof.position.y=4.2;G.add(roof);
  var aw=new t.Mesh(new t.Box(8.6,.12,2.2),new t.Std({color:0xc8102e}));aw.position.set(0,3.6,3.9);aw.rotation.x=.25;G.add(aw);
  var counter=new t.Mesh(new t.Box(6,1.05,.9),dark);counter.position.set(0,.52,-.6);G.add(counter);
  var rack=new t.Mesh(new t.Box(6.5,2,.15),new t.Std({color:0x5a3d26}));rack.position.set(0,2.4,-2.8);G.add(rack);
  var CH=window.__chr;if(CH)['pistol','smg','shotgun','rifle','water','paint'].forEach(function(w,i){var m=CH.weaponMesh(w);if(m){m.rotation.y=Math.PI/2;m.scale.setScalar(1.6);m.position.set(-2.6+i*1.05,2.2+(i%2)*.6,-2.65);G.add(m)}});
  var sg=sign(t,'🔫 SOUQ AL SILAH','سوق السلاح · '+s.n,7,2.2);sg.position.set(0,5.6,0);G.add(sg);var sg2=sg.clone();sg2.rotation.y=Math.PI;sg2.position.z=-.01;G.add(sg2);
  var pole=new t.Mesh(new t.Cyl(.5,.5,40,12,1,true),new t.Basic({color:0xff3040,transparent:true,opacity:.22,blending:2,depthWrite:false,side:2}));pole.position.set(0,24,-3.6);G.add(pole);
  var pad=new t.Mesh(new t.Cyl(2.2,2.2,.06,24),new t.Basic({color:0xf3d77a,transparent:true,opacity:.5}));pad.position.set(0,.05,1.6);G.add(pad);
  if(CH){var k=CH.build({skin:1,head:'shemagh',beard:'full',out:'kandoora',kcol:'grey',style:'saudi'});k.g.position.set(0,0,-1.6);k.g.rotation.y=Math.PI;G.add(k.g);s.npc=k}
  FR.W.scene.add(G);s.G=G})}
function shopPanel(s){if(!shopUI){shopUI=document.createElement('div');shopUI.id='p3-shop';document.body.appendChild(shopUI);
  ['pointerdown','touchstart','mousedown','click'].forEach(function(ev){shopUI.addEventListener(ev,function(e){e.stopPropagation();if(ev==='click'){var b=e.target.closest('button');if(b)buy(b.dataset.w)}},{passive:true})})}
 if(!s){shopUI.style.display='none';return}var CH=window.__chr;
 shopUI.innerHTML='<h3>🔫 Souq Al Silah · '+esc(s.n)+' <small style="color:#fff;opacity:.7">— pick a weapon (free, arcade)</small></h3><div class="row">'+['pistol','smg','shotgun','rifle','water','paint'].map(function(w,i){var W=CH.WEAP[w];return '<button data-w="'+w+'">'+(i+1)+'. '+W.en+'<small>'+W.ar+' · +'+W.ammo+' ammo</small></button>'}).join('')+'</div>';shopUI.style.display='block'}
function buy(w){if(!w)return;var NET=FR.NET||{};var CH=window.__chr;if(NET.ok)FR.mpSend({t:'shop',w:w});else FR.give&&FR.give(w,CH.WEAP[w].ammo);FR.toast('🔫 '+CH.WEAP[w].en)}
FR.buy=buy;
// keys 1-6 at shop
window.addEventListener('keydown',function(e){if(!near||!FR.active)return;var n=+e.key;if(n>=1&&n<=6&&!/INPUT|TEXTAREA/.test((e.target||{}).tagName||'')){buy(['pistol','smg','shotgun','rifle','water','paint'][n-1]);e.stopPropagation()}},true);
// ---------------- minimap marks ----------------
FR.mapMarks=function(){var L=SHOPS.map(function(s){return{x:s.x,z:s.z,c:'#c8102e',i:'🔫',r:10,fs:12}});
 (FR.PK||[]).forEach(function(p){if(p.m&&p.m.visible)L.push({x:p.x,z:p.z,c:'#f3d77a',i:'•',r:5,fs:10})});
 L.push({x:240,z:330,c:'#2f7bff',i:'⚽',r:10});L.push({x:900,z:-520,c:'#7ec8ff',i:'🌌',r:12});L.push({x:900,z:-900,c:'#f3d77a',i:'✈️',r:12});L.push({x:-880,z:380,c:'#7c3aed',i:'🛹',r:9});L.push({x:-120,z:420,c:'#00b96b',i:'🧗',r:9});return L};
// ---------------- richer world ----------------
var life={done:false,peds:[],boats:[],birds:[]};
function buildWorld(){if(life.done||!FR.W||!FR.W.scene)return;life.done=true;var t=T(),S=FR.W.scene,add=function(m,x,y,z){m.position.set(x,y,z);S.add(m);return m};
 var white=new t.Std({color:0xf4f4f2,roughness:.4,metalness:.1}),glass=new t.Std({color:0x5c8db8,roughness:.1,metalness:.6}),steel=new t.Std({color:0xb8c0c8,roughness:.3,metalness:.8}),sand=new t.Std({color:0xd8c39a,roughness:.9});
 // Burj Al Arab-style sail hotel (off the Corniche, in the sea)
 var ba=new t.Group();for(var i=0;i<26;i++){var h=i*7,w=Math.max(2,22*Math.sin((1-i/26)*Math.PI*.5)),m=new t.Mesh(new t.Box(w,7,10),i%3?white:glass);m.position.set(w/2-11+Math.pow(i/26,2)*14,h+3.5,0);ba.add(m)}var mast=new t.Mesh(new t.Cyl(.8,.8,190,8),steel);mast.position.set(-12,95,0);ba.add(mast);var heli=new t.Mesh(new t.Cyl(6,6,.6,20),white);heli.position.set(-16,120,0);ba.add(heli);
 var isl=new t.Mesh(new t.Cyl(20,24,2,24),sand);isl.position.y=-.5;ba.add(isl);add(ba,-1420,0,190);
 // Ain Dubai-style observation wheel
 var wh=new t.Group(),R=55;for(var k=0;k<48;k++){var a=k/48*Math.PI*2,sg=new t.Mesh(new t.Box(1.2,R*2*Math.sin(Math.PI/48)+.4,1.2),steel);sg.position.set(Math.cos(a)*R,Math.sin(a)*R,0);sg.rotation.z=a;wh.add(sg);if(k%2===0){var sp=new t.Mesh(new t.Cyl(.25,.25,R,4),steel);sp.position.set(Math.cos(a)*R/2,Math.sin(a)*R/2,0);sp.rotation.z=a+Math.PI/2;wh.add(sp)}if(k%3===0){var cb=new t.Mesh(new t.Sphere(1.8,10,8),glass);cb.position.set(Math.cos(a)*(R+2),Math.sin(a)*(R+2),0);wh.add(cb)}}
 var wg=new t.Group();wg.add(wh);wh.position.y=R+8;[-1,1].forEach(function(s){var leg=new t.Mesh(new t.Box(2,R+12,2),steel);leg.position.set(s*14,(R+8)/2,0);leg.rotation.z=s*.25;wg.add(leg)});add(wg,-1560,0,260);wg.rotation.y=.6;life.wheel=wh;
 // Museum of the Future-style torus (built from segments) near SZR
 var mf=new t.Group(),silver=new t.Std({color:0xd9dde2,roughness:.25,metalness:.9});for(var q=0;q<40;q++){var a2=q/40*Math.PI*2,rr=16;var seg=new t.Mesh(new t.Box(7,3.2,9),silver);seg.position.set(Math.cos(a2)*rr,Math.sin(a2)*rr*1.25,0);seg.rotation.z=a2;mf.add(seg)}mf.position.y=24;var mb=new t.Group();mb.add(mf);var mound=new t.Mesh(new t.Cyl(14,22,6,24),new t.Std({color:0x7da35a,roughness:.9}));mound.position.y=3;mb.add(mound);add(mb,-560,0,-75);
 // Dhow boats + abras on the Corniche water
 for(var bI=0;bI<8;bI++){var bt=new t.Group(),hull=new t.Mesh(new t.Box(3,1.4,10),new t.Std({color:0x7a4a26,roughness:.8}));hull.position.y=.4;bt.add(hull);var ms=new t.Mesh(new t.Cyl(.12,.12,7,6),new t.Std({color:0x5a3a20}));ms.position.y=4;bt.add(ms);var sl=new t.Mesh(new t.Plane(4,5),new t.Std({color:0xf2ead8,side:2}));sl.position.set(0,4.5,.4);sl.rotation.y=Math.PI/2;bt.add(sl);
  bt.position.set(-1180-bI*55,-.2,140+(bI%3)*45);S.add(bt);life.boats.push({g:bt,x0:bt.position.x,z0:bt.position.z,ph:bI})}
 // birds
 var bm=new t.Basic({color:0x222222,side:2});for(var b2=0;b2<16;b2++){var bd=new t.Group();[-1,1].forEach(function(s){var wg2=new t.Mesh(new t.Plane(.9,.3),bm);wg2.position.x=s*.45;wg2.rotation.x=-Math.PI/2;bd.add(wg2)});S.add(bd);life.birds.push({g:bd,c:[(Math.random()-.5)*300,40+Math.random()*30,(Math.random()-.5)*300],r:20+Math.random()*40,ph:Math.random()*6,s:.2+Math.random()*.3})}
 // street lamps + palms along downtown avenue z=170 & x=0
 var lampM=new t.Std({color:0x30343a,metalness:.6,roughness:.4}),bulb=new t.Std({color:0xfff2c0,emissive:0xffd27a,emissiveIntensity:1.4});
 for(var lz=-230;lz<=230;lz+=40){[-9,9].forEach(function(sx){var p=new t.Mesh(new t.Cyl(.12,.16,7,6),lampM);p.position.set(sx,3.5,lz+20);S.add(p);var lb=new t.Mesh(new t.Box(1.4,.25,.5),bulb);lb.position.set(sx*.85,7,lz+20);S.add(lb)})}
 // pedestrians (original procedural characters)
 var CH=window.__chr;if(CH){var looks=[{out:'kandoora',head:'ghutra',beard:'short',kcol:'white'},{out:'abaya',head:'shayla',beard:'none',skin:1},{out:'kandoora',head:'shemagh',beard:'full',kcol:'cream',style:'saudi'},{out:'casual',head:'cap',beard:'stubble',casual:'#00843d'},{out:'kandoora',head:'kumma',style:'omani',kcol:'brown'},{out:'abaya',head:'shayla',skin:3},{out:'casual',head:'none',hair:'short',casual:'#c8102e',skin:4},{out:'kandoora',head:'ghutra',kcol:'grey',glasses:true}];
  var paths=[[[-9,-60],[-9,230]],[[9,230],[9,-60]],[[-60,-9+80],[230,-9+80]],[[230,9+160],[-60,9+160]],[[-9,-230],[-9,-90]],[[-90,9],[-230,9]]];
  for(var pI=0;pI<14;pI++){var lk=looks[pI%looks.length];lk.skin=lk.skin!=null?lk.skin:(pI%5);var c=CH.build(lk),path=paths[pI%paths.length];S.add(c.g);life.peds.push({c:c,p:path,t:Math.random(),sp:(1.1+Math.random()*.6)/Math.hypot(path[1][0]-path[0][0],path[1][1]-path[0][1]),dir:1})}}
 // lighting: warmer sun, sky bounce, light fog
 try{S.traverse(function(o){if(o.isDirectionalLight){o.color&&o.color.setHex(0xfff1d6);o.intensity=Math.max(o.intensity,2.6)}if(o.isHemisphereLight){o.color.setHex(0xcfe6ff);o.groundColor.setHex(0xc9a76e);o.intensity=Math.max(o.intensity,1.1)}});if(S.fog&&S.fog.color){S.fog.color.setHex(0xe9d9bf)}}catch(e){}}
function lifeFrame(dt){var now=performance.now()/1000,ST=FR.ST;if(life.wheel)life.wheel.rotation.z+=dt*.03;
 life.boats.forEach(function(b){b.g.position.z=b.z0+Math.sin(now*.05+b.ph)*30;b.g.position.y=-.2+Math.sin(now*1.3+b.ph)*.15;b.g.rotation.z=Math.sin(now*1.1+b.ph)*.05});
 life.birds.forEach(function(b){var a=now*b.s+b.ph;b.g.position.set(ST.x+b.c[0]+Math.cos(a)*b.r,b.c[1]+Math.sin(a*2)*3,ST.z+b.c[2]+Math.sin(a)*b.r);b.g.rotation.y=-a;var f=Math.sin(now*9+b.ph)*.6;b.g.children[0].rotation.z=f;b.g.children[1].rotation.z=-f});
 life.peds.forEach(function(p){var d=Math.hypot(p.c.g.position.x-ST.x,p.c.g.position.z-ST.z);if(d>260){p.c.g.visible=false;p.t+=p.sp*dt*p.dir;if(p.t>1||p.t<0)p.dir*=-1,p.t=Math.max(0,Math.min(1,p.t));return}p.c.g.visible=true;
  p.t+=p.sp*dt*p.dir;if(p.t>1||p.t<0){p.dir*=-1;p.t=Math.max(0,Math.min(1,p.t))}var A=p.p[0],B=p.p[1],x=A[0]+(B[0]-A[0])*p.t,z=A[1]+(B[1]-A[1])*p.t;
  // step aside from the player's car
  var dx=x-ST.x,dz=z-ST.z,dd=Math.hypot(dx,dz);if(dd<4&&dd>0){x+=dx/dd*(4-dd);z+=dz/dd*(4-dd)}
  p.c.g.position.set(x,FR.heightAt(x,z),z);p.c.g.rotation.y=Math.atan2(-(B[0]-A[0])*p.dir,-(B[1]-A[1])*p.dir);if(d<120)p.c.anim(dt,1.4,'')})}
// ---------------- frame hook ----------------
var prev=FR.onFrame;FR.onFrame=function(dt){if(prev)prev(dt);try{frBtns();buildShops();buildWorld();lifeFrame(dt);
 var F=FR.foot,px=F&&F.on?F.x:FR.ST.x,pz=F&&F.on?F.z:FR.ST.z,ns=null;SHOPS.forEach(function(s){if(Math.hypot(s.x-px,s.z-pz)<(F&&F.on?7:9))ns=s;if(s.npc&&Math.hypot(s.x-px,s.z-pz)<60)s.npc.anim(dt,0,'')});
 if(ns!==near){near=ns;if(ns&&!(F&&F.on))FR.toast('🔫 Souq Al Silah — press E to walk in');shopPanel(ns&&F&&F.on?ns:null)}else if(ns&&F&&F.on&&shopUI&&shopUI.style.display!=='block')shopPanel(ns)}catch(e){if(!FR._p3e){FR._p3e=1;console.error('p3',e)}}};
var prevExit=FR.onExit;FR.onExit=function(){shopPanel(null);near=null;if(prevExit)prevExit()};
})();

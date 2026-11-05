# Re-applies all UAE/offline changes. Run: python3 patch.py  (from /workspace/roadsterdash_uae)
import re,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
s=open('assets/game-DMhBVQcl.orig.js').read()
def rep(a,b):
    global s
    assert s.count(a)==1,(a[:70],s.count(a)); s=s.replace(a,b)
# 1) Dubai plate
i=s.index('function lm(i){'); j=s.index('n.anisotropy=4,n}',i)+len('n.anisotropy=4,n}')
s=s[:i]+r'''function lm(i){const t=document.createElement("canvas");t.width=512,t.height=256;const e=t.getContext("2d");e.fillStyle="#ffffff",e.fillRect(0,0,512,256),e.strokeStyle="#111",e.lineWidth=10,e.strokeRect(5,5,502,246);e.fillStyle="#c8102e",e.fillRect(14,14,110,228);e.fillStyle="#fff",e.font='bold 92px Arial, sans-serif',e.textAlign="center",e.textBaseline="middle",e.fillText("A",69,128);e.fillStyle="#111",e.font='bold 40px Arial, sans-serif',e.fillText("DUBAI  \u062f\u0628\u064a",318,52);e.font='bold 130px "Arial Narrow", Arial, sans-serif',e.fillText("971",318,160);const n=new Hn(t);return n.colorSpace=Pe,n.anisotropy=4,n}'''+s[j:]
# 2) livery colours
rep('wing:new bs({color:14276304,','wing:new bs({color:0x00843d,')
rep('chin:new Tt({color:10791085,','chin:new Tt({color:0xc8102e,')
# 3) UAE flag + bold side stripes (green/white/black, with red front block)
anchor='n.add(We(1.26,.022,.07,t.chin,0,.148,-2.19));'
# (v4) flag pole + box stripes removed; livery decals built by admin.js for every car instance (menu showroom + player)
rep('return{group:e,body:n,wheels:J,','(window.__carBodies||[]).forEach(function(o){if(o.body===n){o.wheels=J;o.nozzles=w;o.flames=_}});return{group:e,body:n,wheels:J,')
rep(anchor,anchor+'(window.__carBodies=window.__carBodies||[]).push({body:n,mats:t});try{window.__uaeLivery&&window.__uaeLivery(n,t)}catch(_e){}')
# 4) Dubai skyline (Burj Khalifa + towers) in the far backdrop
anchor2='this.buildMidground(n,s,r);'
rep(anchor2,anchor2+r'''(()=>{const sk=new Zt,mk=c=>new Qt({color:c,fog:!1}),dark=mk(0x3b4560),mid=mk(0x4a5878),lite=mk(0x6a7aa0),glass=mk(0x7f95c0),burjA=mk(0xc9d4e8),burjB=mk(0xa9b8d4),red=new Qt({color:0xff2020,fog:!1,toneMapped:!1}),win=new Qt({color:0xffd27a,fog:!1,toneMapped:!1});const add=(g,m,x,y,z)=>{const o=new pt(g,m);o.position.set(x,y,z);o.frustumCulled=!1;sk.add(o);return o};
const bx=-30,bz=-340;let y=0;[[16,40],[13,38],[10.5,34],[8.2,30],[6.2,24],[4.5,20],[3.1,16],[2,12]].forEach(([r,h],k)=>{add(new Dt(r*.82,r,h,6),k%2?burjB:burjA,bx,y+h/2,bz);for(const a of[0,2.094,4.189])add(new ae(r*.9,h*.7,r*.6),k%2?burjA:burjB,bx+Math.cos(a)*r*.75,y+h*.35,bz+Math.sin(a)*r*.75).rotation.y=-a;y+=h});add(new Dt(.25,1.4,48,6),burjA,bx,y+24,bz);add(new ae(1.2,1.2,1.2),red,bx,y+48.5,bz);
for(let k=0;k<26;k++)add(new ae(.6,.6,.3),win,bx+(k%3-1)*4,6+k*7.5,bz+14);
const tw=(x,z,w,h,m,top)=>{add(new ae(w,h,w),m,x,h/2,z);for(let k=1;k<h/6;k++)add(new ae(w*.7,.35,.2),win,x,k*6,z+w/2+.1);if(top)add(new yi(w*.6,top,4),m,x,h+top/2,z);add(new ae(.6,.6,.6),red,x,h+(top||0)+.5,z)};
tw(-95,-330,16,92,mid,22);tw(-75,-345,12,80,dark,0);tw(10,-325,14,86,lite,16);tw(32,-350,18,90,mid,0);tw(55,-320,11,70,dark,12);tw(-120,-350,20,60,lite,0);tw(80,-345,15,75,glass,0);tw(105,-330,12,64,mid,10);tw(-55,-310,10,55,glass,0);
add(new yi(9,30,3),lite,-75,95,-345).rotation.y=.4;add(new yi(10,32,3),lite,32,106,-350).rotation.y=-.3;
sk.scale.setScalar(.8);sk.position.z=-160;sk.traverse(o=>{o.renderOrder=Nh+1});this.group.add(sk);this.dubaiSkyline=sk})();''')
open('assets/game-DMhBVQcl.js','w').write(s)
# 5) index.html: remove ads, local fonts, offline shim, hide Google sign-in
h=open('index.orig.html').read()
h=re.sub(r'<script async src="https://pagead2[^>]*>\s*</script>','',h)
h=re.sub(r'<link rel="preconnect"[^>]*/>\s*','',h)
h=re.sub(r'<link href="https://fonts.googleapis.com[^>]*/>','<link href="/fonts/fonts.css" rel="stylesheet" />\n  <script src="/offline-shim.js"></script>\n  <style>#google-login,#google-account,.google-login,.google-account,.auth-note{display:none!important}</style>',h)
h=h.replace('roadsterdash.com','roadsterdash.ae')
h=h.replace('<title>Roadster Dash</title>','<title>Roadster Dash UAE | roadsterdash.ae</title>')
h=h.replace('content="Roadster Dash"','content="Roadster Dash UAE"')
open('index.html','w').write(h)
print('patched')

# ===== Admin panel hooks (window.__adm defined in admin.js, window.__rd = game) =====
s=open('assets/game-DMhBVQcl.js').read()
def rep2(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)
A='(window.__adm||{})'
rep2('this.state="idle",this.onGameOver=null,this.reset()}','this.state="idle",this.onGameOver=null,this.reset(),window.__rd=this,window.__T={Mesh:pt,Box:ae,Std:Tt,Basic:Qt,Phys:bs,Group:Zt,Cyl:Dt,Plane:Le,CanvasTex:Hn,SRGB:Pe,Cone:yi,Sphere:en,Shape:ni,Extrude:Ci,Geo:ie,Attr:jt},(()=>{try{window.__audio=It}catch(e){}})()}')
rep2('function sc(i){return Math.floor(Math.max(0,i)/dn)%ur.length}','function sc(i){return Math.floor(Math.max(0,i)/dn+((window.__adm||{}).zoneOff||0))%ur.length}')
rep2('handle(t,e){if(!this.crashed)switch(t){','handle(t,e){if((window.__adm||{}).rev){t=t==="left"?"right":t==="right"?"left":t}if(!this.crashed)switch(t){')
rep2('crash(t,e=null){var s,r;if(this.state!=="playing")return;','crash(t,e=null){var s,r;if(this.state!=="playing")return;if('+A+'.god&&t!=="admin"){try{e&&this.traffic.knock(e,this.player.x,1.7)}catch{}return}')
rep2('normalSpeed(){return ','normalSpeed(){return this._ns()*('+A+'.mult?__adm.mult():1)}_ns(){return ')
rep2('targetSpeed(){','targetSpeed(){return this._tsp()*('+A+'.mult?__adm.mult():1)}_tsp(){')
rep2('get airInfinite(){return ','get airInfinite(){return !!'+A+'.inf||')
rep2('let s=t*this.timeScale;','let s=t*this.timeScale*('+A+'.slow||1);')
rep2('$n(rb,l)*(.6+Math.random()*.8)','$n(rb,l)*(.6+Math.random()*.8)/('+A+'.dens?__adm.dens():1)')
rep2('case"up":this.grounded?','case"up":this.grounded||'+A+'.jumps?')
rep2('this.jumpHeld=!0,this.grounded?this.jump(e)','this.jumpHeld=!0,this.grounded||'+A+'.jumps?this.jump(e)',2)
rep2('o3(this.scene,this.effects,(n,s)=>this.onEvent(n,s))','o3(this.scene,this.effects,(n,s)=>this.onEvent(n,s)),window.__player=this.player')
M='(window.__mods||{})'
rep2('n=t.gravity,s=Se.jumpHeight;this.vy=','n=t.gravity,s=Se.jumpHeight*('+M+'.jump||1);this.vy=')
rep2('this.laneDur=s?Se.laneShiftTime:Se.laneShiftTimeNoAir,','this.laneDur=(s?Se.laneShiftTime:Se.laneShiftTimeNoAir)/('+M+'.hand||1),')
rep2('this.air=Math.max(0,this.air-t),!0)','this.air=Math.max(0,this.air-t*('+M+'.airUse||1)),!0)')
rep2('o>this.speed?3.5:2','o>this.speed?3.5*('+M+'.accel||1):2')
rep2('e*Math.max(t,Xr.powerSpeed):e*Xr.mult:e*t}','e*Math.max(t,Xr.powerSpeed):e*Xr.mult*('+M+'.boost||1):e*t}')
rep2('(this.player.boosting?Xr.mult:1)}','(this.player.boosting?Xr.mult*('+M+'.boost||1):1)}')
open('assets/game-DMhBVQcl.js','w').write(s)
h=open('index.html').read()
h=h.replace('<script src="/offline-shim.js"></script>','<script src="/offline-shim.js"></script>\n  <script src="/admin.js"></script>\n  <script src="/v10.js"></script>\n  <script src="/garage.js"></script>\n  <script src="/freeroam.js"></script>\n  <script src="/character.js"></script>\n  <script src="/mp.js"></script>')
open('index.html','w').write(h)
print('admin hooks ok')

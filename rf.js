/* Roadster Dash UAE — P4 Rocket Football: full 3D car physics (wall/ceiling driving, air roll), stadium, smarter bots. Original code. */
(function(){'use strict';
var FR=window.__fr,GM=window.__games;if(!FR||!GM||!GM._x)return;var X=GM._x,ST=FR.ST;
function T(){return window.__T}function U(){return window.__uae}
// ---------- tiny vec3 helpers (arrays) ----------
function v(x,y,z){return[x,y,z]}function add(a,b){return[a[0]+b[0],a[1]+b[1],a[2]+b[2]]}function sub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]]}
function mul(a,s){return[a[0]*s,a[1]*s,a[2]*s]}function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function len(a){return Math.sqrt(dot(a,a))}function nrm(a){var l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l]}function madd(a,b,s){a[0]+=b[0]*s;a[1]+=b[1]*s;a[2]+=b[2]*s;return a}
function clamp(x,a,b){return x<a?a:x>b?b:x}
function rot(vec,ax,ang){var c=Math.cos(ang),s=Math.sin(ang),k=nrm(ax),d=dot(k,vec),cr=cross(k,vec);return[vec[0]*c+cr[0]*s+k[0]*d*(1-c),vec[1]*c+cr[1]*s+k[1]*d*(1-c),vec[2]*c+cr[2]*s+k[2]*d*(1-c)]}
// ---------- arena (local coords, origin at centre of floor) ----------
var A={Y0:.22,CX:240,CZ:330,HX:88,HZ:52,H:34,R:10,GW:12,GH:9.5,GD:11,BR:3.0};
// signed distance to inside surface + inward normal for a point (local)
function sdf(p){var x=p[0],y=p[1]-A.H/2,z=p[2],ax=Math.abs(x),az=Math.abs(z),mouth=az<A.GW&&p[1]<A.GH;
 if(mouth&&ax>A.HX-1){ // goal tunnel: walls at z=±GW, floor 0, roof GH, back HX+GD
  var cand=[[p[1],[0,1,0]],[A.GH-p[1],[0,-1,0]],[A.GW-az,[0,0,-Math.sign(z)]],[A.HX+A.GD-ax,[-Math.sign(x),0,0]]];var best=cand[0];for(var i=1;i<4;i++)if(cand[i][0]<best[0])best=cand[i];return{d:best[0],n:best[1]}}
 var E=[mouth?1e4:A.HX,A.H/2,A.HZ],q=[ax,Math.abs(y),az],s=[x<0?-1:1,y<0?-1:1,z<0?-1:1],B=[E[0]-A.R,E[1]-A.R,E[2]-A.R];
 var w=[Math.max(0,q[0]-B[0]),Math.max(0,q[1]-B[1]),Math.max(0,q[2]-B[2])],wl=len(w);
 if(wl>1e-6){return{d:A.R-wl,n:[-s[0]*w[0]/wl,-s[1]*w[1]/wl,-s[2]*w[2]/wl]}}
 var m=[E[0]-q[0],E[1]-q[1],E[2]-q[2]],k=m[0]<m[1]?(m[0]<m[2]?0:2):(m[1]<m[2]?1:2),n=[0,0,0];n[k]=-s[k];return{d:m[k],n:n}}
function L(wx,wy,wz){return[wx-A.CX,wy,wz-A.CZ]}
// ---------- car body (shared by player + bots) ----------
var P={g:25,maxV:30,boostV:46,acc:26,boostA:34,brake:40,coast:6,turnLo:2.9,turnHi:1.25,jump:10.5,dj:9,dodge:15,pitchA:11,yawA:8,rollA:12,wMax:5.6,supersonic:42};
function Car(team){this.team=team;this.reset([0,0,0],[0,0,-1]);this.boost=34;this.dead=0}
Car.prototype.reset=function(p,f){this.p=p.slice();this.v=[0,0,0];this.f=nrm(f);this.u=[0,1,0];this.w=[0,0,0];this.gnd=true;this.n=[0,1,0];this.jumps=0;this.jt=0;this.flip=0;this.flipAx=null;this.dodgeT=0;this.spin=0;this.holdJ=0;this.boosting=false;this.air=0};
Car.prototype.right=function(){return nrm(cross(this.f,this.u))};
Car.prototype.center=function(){return add(this.p,mul(this.u,.7))};
Car.prototype.jump=function(I){if(this.dead>0)return;if(this.gnd){this.v=madd(this.v,this.u,P.jump);this.gnd=false;this.jumps=1;this.jt=0;this.holdJ=.18;this.p=madd(this.p,this.u,.15);return}
 if(this.jumps===1&&this.jt<1.4){this.jumps=2;var fw=I.t||0,sd=I.s||0;if(Math.abs(fw)<.3&&Math.abs(sd)<.3){this.v=madd(this.v,this.u,P.dj);return}
  var r=this.right(),hf=nrm([this.f[0],0,this.f[2]]),hr=nrm([r[0],0,r[2]]),dir=nrm(add(mul(hf,fw),mul(hr,-sd)));this.v=madd(this.v,dir,P.dodge);this.v[1]=Math.max(this.v[1]*.3,1.5);
  this.flip=.62;this.flipAx=nrm(add(mul(r,-fw),mul(this.f,-sd)));this.dodgeT=.55;GM.stat&&(GM.stat.flips=(GM.stat.flips||0)+1)}};
// I: {t throttle -1..1 (air: pitch), s steer -1..1 (+left), r roll -1..1, boost, hb}
Car.prototype.step=function(dt,I,frozen){if(this.dead>0){this.dead-=dt;return}
 this.jt+=dt;this.dodgeT=Math.max(0,this.dodgeT-dt);var c=sdf(this.p);this.boosting=false;
 if(frozen){this.v=[0,0,0];this.w=[0,0,0]}
 var gravity=[0,-P.g,0];
 if(this.gnd){var n=c.n;this.n=n;
  // align up to surface
  var ax=cross(this.u,n),sa=len(ax);if(sa>1e-5){var ang=Math.asin(Math.min(1,sa))*Math.min(1,dt*14);this.u=nrm(rot(this.u,ax,ang));this.f=nrm(rot(this.f,ax,ang))}
  this.f=nrm(sub(this.f,mul(n,dot(this.f,n))));this.u=n.slice();
  var r=this.right(),vf=dot(this.v,this.f),t=I.t||0,a=0;
  if(t>0)a=vf<-1?P.brake:P.acc*Math.max(.15,1-Math.max(0,vf)/P.maxV);else if(t<0)a=vf>1?-P.brake:-P.acc*.8*Math.max(.1,1+Math.min(0,vf)/(P.maxV*.6));else a=-Math.sign(vf)*Math.min(Math.abs(vf)/Math.max(dt,1e-3),P.coast);
  if(t>0&&vf>P.maxV)a=0;if(t)a*=Math.abs(t);
  if(I.boost&&this.boost>0&&!frozen){a+=P.boostA;this.boost=Math.max(0,this.boost-33*dt);this.boosting=true}
  this.v=madd(this.v,this.f,a*dt);
  var sp=Math.abs(vf),tr=(sp<1?sp*P.turnLo:P.turnLo+(P.turnHi-P.turnLo)*Math.min(1,sp/P.maxV))*(I.hb?1.45:1),yaw=(I.s||0)*tr*dt*(vf<-.5?-1:1);
  if(yaw){this.f=nrm(rot(this.f,n,yaw));var vt=sub(this.v,mul(n,dot(this.v,n)));this.v=add(rot(vt,n,yaw*.92),mul(n,dot(this.v,n)))}
  r=this.right();var vl=dot(this.v,r);this.v=madd(this.v,r,-vl*Math.min(1,dt*(I.hb?2.2:11)));
  // gravity tangential + sticky
  var gt=sub(gravity,mul(n,dot(gravity,n)));this.v=madd(this.v,gt,dt*(n[1]>.7?0:.8));
  var vn=dot(this.v,n);if(vn<0)this.v=madd(this.v,n,-vn);
  this.p=madd(this.p,this.v,dt);var c2=sdf(this.p);this.p=madd(this.p,c2.n,-c2.d+.02);for(var it=0;it<2;it++){var c5=sdf(this.p);if(c5.d<.015){this.p=madd(this.p,c5.n,-c5.d+.02);var vn5=dot(this.v,c5.n);if(vn5<0)this.v=madd(this.v,c5.n,-vn5)}}c2=sdf(this.p);if(c2.d>.3)c2.d=c2.d;
  var spd=len(this.v);if(c2.n[1]<.35&&spd<7||(c2.n[1]<-.2&&spd<10)){this.gnd=false;this.v=madd(this.v,c2.n,2.5);this.air=0}
  // leaving a convex edge (goal posts) — if surface far, become airborne
  if(c2.d>.6)this.gnd=false;
  this.w=[0,0,0];this.jumps=0;this.spin+=vf*dt/.36}
 else{this.air+=dt;this.v=madd(this.v,gravity,dt);if(this.holdJ>0&&I.jh){this.v=madd(this.v,this.u,14*dt);this.holdJ-=dt}else this.holdJ=0;
  var r2=this.right();
  if(this.flip>0){var fa=Math.min(this.flip,dt)/.62*Math.PI*2;this.f=nrm(rot(this.f,this.flipAx,fa));this.u=nrm(rot(this.u,this.flipAx,fa));this.flip-=dt;if(this.flip<=0)this.w=[0,0,0]}
  else{var wa=add(add(mul(r2,(I.t||0)*-P.pitchA),mul(this.u,(I.s||0)*P.yawA)),mul(this.f,(I.r||0)*-P.rollA));this.w=madd(this.w,wa,dt);this.w=mul(this.w,Math.max(0,1-dt*(I.t||I.s||I.r?1.2:4)));var wl=len(this.w);if(wl>P.wMax)this.w=mul(this.w,P.wMax/wl);
   if(wl>1e-4){var ang2=wl*dt;this.f=nrm(rot(this.f,this.w,ang2));this.u=nrm(rot(this.u,this.w,ang2))}}
  this.u=nrm(sub(this.u,mul(this.f,dot(this.u,this.f))));
  if(I.boost&&this.boost>0&&!frozen){this.v=madd(this.v,this.f,P.boostA*dt);this.boost=Math.max(0,this.boost-33*dt);this.boosting=true}
  var sp2=len(this.v);if(sp2>P.boostV+4)this.v=mul(this.v,(P.boostV+4)/sp2);
  this.p=madd(this.p,this.v,dt);
  // body probes: bottom point, roof, nose/tail
  var c3=sdf(this.p);if(c3.d<.05){var vn2=dot(this.v,c3.n);this.p=madd(this.p,c3.n,-c3.d+.03);
   var up=dot(this.u,c3.n);if(vn2<0)this.v=madd(this.v,c3.n,-vn2*(up>.2?1:1.3));if(up>-.2||this.air>.25){this.gnd=true;this.flip=0;this.air=0}}
  var top=add(this.p,mul(this.u,1.3)),c4=sdf(top);if(c4.d<.05){var vn3=dot(this.v,c4.n);if(vn3<0)this.v=madd(this.v,c4.n,-vn3*1.3);this.p=madd(this.p,c4.n,-c4.d+.05)}
  this.spin+=dot(this.v,this.f)*dt/.36}
 var vv=len(this.v);if(vv>P.boostV+6)this.v=mul(this.v,(P.boostV+6)/vv);
 if(this.gnd&&this.jt>.1)this.jumps=0};
Car.prototype.speed=function(){return len(this.v)};
Car.prototype.mat=function(){var r=this.right();return[r,this.u,mul(this.f,-1)]};
// quaternion from basis columns X,Y,Z
function quatOf(c,q){var X=c[0],Y=c[1],Z=c[2],m00=X[0],m01=Y[0],m02=Z[0],m10=X[1],m11=Y[1],m12=Z[1],m20=X[2],m21=Y[2],m22=Z[2],tr=m00+m11+m22,s;
 if(tr>0){s=.5/Math.sqrt(tr+1);q.set((m21-m12)*s,(m02-m20)*s,(m10-m01)*s,.25/s)}else if(m00>m11&&m00>m22){s=2*Math.sqrt(1+m00-m11-m22);q.set(.25*s,(m01+m10)/s,(m02+m20)/s,(m21-m12)/s)}
 else if(m11>m22){s=2*Math.sqrt(1+m11-m00-m22);q.set((m01+m10)/s,.25*s,(m12+m21)/s,(m02-m20)/s)}else{s=2*Math.sqrt(1+m22-m00-m11);q.set((m02+m20)/s,(m12+m21)/s,.25*s,(m10-m01)/s)}return q}
function euler(c){var Z=c[2],Xc=c[0],Y=c[1],m23=Z[1],x=Math.asin(-clamp(m23,-1,1)),y,z;if(Math.abs(m23)<.99999){y=Math.atan2(Z[0],Z[2]);z=Math.atan2(Xc[1],Y[1])}else{y=Math.atan2(-Xc[2],Xc[0]);z=0}return[x,y,z]}
// ---------- ball ----------
function ballStep(B,dt){B.v[1]-=P.g*.82*dt;var dr=Math.pow(.997,dt*60);B.v=mul(B.v,dr);B.p=madd(B.p,B.v,dt);
 for(var it=0;it<2;it++){var c=sdf(B.p);if(c.d<A.BR){B.p=madd(B.p,c.n,A.BR-c.d);var vn=dot(B.v,c.n);if(vn<0){var vt=sub(B.v,mul(c.n,vn));B.v=add(mul(vt,Math.max(.7,1-.25*Math.min(1,-vn/10))),mul(c.n,-vn*(-vn>3?.62:0)));B.rolling=c.n[1]>.9}}}
 var sp=len(B.v);if(sp>70)B.v=mul(B.v,70/sp);
 var ax=Math.abs(B.p[0]);if(ax>A.HX+A.BR&&Math.abs(B.p[2])<A.GW&&B.p[1]<A.GH)return B.p[0]>0?0:1;return -1}
// ball vs car OBB
function hitBall(B,c){if(c.dead>0)return false;var ctr=c.center(),r=c.right(),d=sub(B.p,ctr),lx=dot(d,r),ly=dot(d,c.u),lz=dot(d,c.f),hx=1.05,hy=.62,hz=2.25;
 var cx=clamp(lx,-hx,hx),cy=clamp(ly,-hy,hy),cz=clamp(lz,-hz,hz),cp=add(add(add(ctr,mul(r,cx)),mul(c.u,cy)),mul(c.f,cz)),dv=sub(B.p,cp),dl=len(dv);if(dl>=A.BR)return false;
 var n=dl>1e-4?mul(dv,1/dl):nrm(d);B.p=madd(cp.slice(),n,A.BR+.02);var rel=sub(B.v,c.v),vn=dot(rel,n);
 if(vn<0){B.v=madd(B.v,n,-vn*1.55)}
 var dir=sub(B.p,ctr);dir[1]*=.35;dir=nrm(dir);var push=Math.max(0,-vn);B.v=madd(B.v,dir,push*.5+3.5);
 if(c.dodgeT>0)B.v=madd(B.v,nrm([c.v[0],c.v[1]*.3,c.v[2]]),9);
 c.v=madd(c.v,n,-Math.max(0,-vn)*.08);B.last=c;return true}
// ---------- stadium visuals ----------
function canvasTex(w,h,draw,rep){var t=T(),cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d'),w,h);var tx=new t.CanvasTex(cv);tx.colorSpace=t.SRGB;tx.anisotropy=8;if(rep){tx.wrapS=tx.wrapT=1000;tx.repeat.set(rep[0],rep[1])}return tx}
function build(){var t=T(),G=new t.Group(),S=A;G.position.set(S.CX,S.Y0,S.CZ);
 // pitch texture: stripes + markings
 var turf=canvasTex(2048,1210,function(g,w,h){var sx=w/(S.HX*2),sz=h/(S.HZ*2);for(var i=0;i<16;i++){g.fillStyle=i%2?'#226b35':'#2a7d3f';g.fillRect(i*w/16,0,w/16+1,h)}
  for(var k=0;k<4000;k++){g.fillStyle='rgba(0,0,0,'+(Math.random()*.06)+')';g.fillRect(Math.random()*w,Math.random()*h,2,2)}
  g.strokeStyle='rgba(255,255,255,.92)';g.lineWidth=7;g.strokeRect(10,10,w-20,h-20);g.beginPath();g.moveTo(w/2,10);g.lineTo(w/2,h-10);g.stroke();g.beginPath();g.arc(w/2,h/2,15*sx,0,7);g.stroke();
  g.fillStyle='#fff';g.beginPath();g.arc(w/2,h/2,9,0,7);g.fill();
  [-1,1].forEach(function(s){var gx=s<0?10:w-10,bw=18*sx,bh=(S.GW+10)*2*sz;g.strokeRect(s<0?gx:gx-bw,h/2-bh/2,bw,bh);g.beginPath();g.arc(s<0?gx+bw:gx-bw,h/2,8*sx,s<0?-Math.PI/2:Math.PI/2,s<0?Math.PI/2:Math.PI*1.5);g.stroke();
   g.fillStyle=s<0?'rgba(47,123,255,.35)':'rgba(255,138,31,.35)';g.fillRect(s<0?gx:gx-bw,h/2-bh/2,bw,bh)});
  g.font='bold 90px Arial';g.textAlign='center';g.fillStyle='rgba(255,255,255,.2)';g.save();g.translate(w/2,h/2);g.fillText('RD · UAE',0,170);g.restore()});
 var fl=new t.Mesh(new t.Plane(S.HX*2,S.HZ*2),new t.Std({map:turf,roughness:.9,metalness:0}));fl.rotation.x=-Math.PI/2;fl.position.y=.03;fl.receiveShadow=true;G.add(fl);
 [-1,1].forEach(function(s){var gf=new t.Mesh(new t.Plane(S.GD,S.GW*2),new t.Std({color:s<0?0x1e3d7a:0x7a3d10,roughness:.8}));gf.rotation.x=-Math.PI/2;gf.position.set(s*(S.HX+S.GD/2),.03,0);G.add(gf)});
 // rounded shell from a subdivided box mapped onto the rounded-box surface
 var bx=new t.Box(S.HX*2,S.H,S.HZ*2,72,16,44),pa=bx.attributes.position,np=[],nn=[],nc=[],B=[S.HX-S.R,S.H/2-S.R,S.HZ-S.R];
 function mapP(x,y,z){var c=[clamp(x,-B[0],B[0]),clamp(y,-B[1],B[1]),clamp(z,-B[2],B[2])],d=nrm([x-c[0],y-c[1],z-c[2]]);return[c[0]+d[0]*S.R,c[1]+d[1]*S.R+S.H/2,c[2]+d[2]*S.R,d]}
 var idx=bx.index.array,lo={P:[],N:[],C:[]},hi={P:[],N:[],C:[]},cBlue=[.16,.36,.85],cOr=[.95,.48,.12];
 for(var i=0;i<idx.length;i+=3){var tri=[],cy=0,cxs=0,czs=0;for(var k=0;k<3;k++){var j=idx[i+k],m=mapP(pa.getX(j),pa.getY(j),pa.getZ(j));tri.push(m);cy+=m[1]/3;cxs+=m[0]/3;czs+=m[2]/3}
  if(cy<.4)continue;if(Math.abs(czs)<S.GW+.3&&cy<S.GH+.2&&Math.abs(cxs)>S.HX-S.R)continue;
  var dst=cy<S.R*1.05?lo:hi,tc=cxs<0?cBlue:cOr,shade=cy<S.R*1.05?.9:1;
  for(k=0;k<3;k++){var q=tri[k];dst.P.push(q[0],q[1],q[2]);dst.N.push(-q[3][0],-q[3][1],-q[3][2]);var tint=.35+.65*Math.min(1,Math.abs(q[0])/S.HX);dst.C.push((tc[0]*tint+.5*(1-tint))*shade,(tc[1]*tint+.55*(1-tint))*shade,(tc[2]*tint+.7*(1-tint))*shade)}}
 function mk(o,mat){var g=new t.Geo();g.setAttribute('position',new t.Attr(new Float32Array(o.P),3));g.setAttribute('normal',new t.Attr(new Float32Array(o.N),3));g.setAttribute('color',new t.Attr(new Float32Array(o.C),3));g.computeBoundingSphere();var m=new t.Mesh(g,mat);return m}
 var lowM=mk(lo,new t.Std({vertexColors:true,roughness:.5,metalness:.1,side:2,emissive:0x0a1020,emissiveIntensity:.6}));lowM.receiveShadow=true;G.add(lowM);
 var hex=canvasTex(256,256,function(g,w,h){g.clearRect(0,0,w,h);g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=4;for(var y=0;y<3;y++)for(var x=0;x<3;x++){var cx=x*w/2+(y%2?w/4:0),cy=y*h/2.3;g.beginPath();for(var a=0;a<7;a++){var an=a*Math.PI/3+Math.PI/6;g.lineTo(cx+Math.cos(an)*w/4.4,cy+Math.sin(an)*w/4.4)}g.stroke()}},[18,4]);
 var hiM=mk(hi,new t.Std({vertexColors:true,map:hex,transparent:true,opacity:.42,roughness:.15,metalness:.2,side:2,depthWrite:false,emissive:0x203048,emissiveIntensity:.5}));hiM.renderOrder=3;G.add(hiM);
 // neon trims along the top of curved walls
 var trim=function(col,x,z,w,d){var m=new t.Mesh(new t.Box(w,.35,d),new t.Std({color:col,emissive:col,emissiveIntensity:2.6}));m.position.set(x,S.R+.4,z);G.add(m)};
 [-1,1].forEach(function(s){trim(0x3a8bff,-S.HX/2,s*(S.HZ-.4),S.HX-S.R,.3);trim(0xff8a1f,S.HX/2,s*(S.HZ-.4),S.HX-S.R,.3)});
 // goals: glowing frames, net, back light
 var netTex=canvasTex(256,256,function(g,w,h){g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=3;for(var i=0;i<=8;i++){g.beginPath();g.moveTo(i*w/8,0);g.lineTo(i*w/8,h);g.stroke();g.beginPath();g.moveTo(0,i*h/8);g.lineTo(w,i*h/8);g.stroke()}},[4,2]);
 [-1,1].forEach(function(s){var col=s<0?0x2f7bff:0xff8a1f,gx=s*S.HX,em=new t.Std({color:col,emissive:col,emissiveIntensity:3.2,roughness:.3});
  [[0,S.GH+.4,0,1,.8,S.GW*2+1.6],[0,S.GH/2,S.GW+.4,1,S.GH+.8,.8],[0,S.GH/2,-S.GW-.4,1,S.GH+.8,.8]].forEach(function(p){var m=new t.Mesh(new t.Box(p[3],p[4],p[5]),em);m.position.set(gx+p[0],p[1],p[2]);G.add(m)});
  var nm=new t.Std({map:netTex,color:col,transparent:true,opacity:.55,side:2,depthWrite:false,emissive:col,emissiveIntensity:.35});
  var back=new t.Mesh(new t.Plane(S.GW*2,S.GH),nm);back.position.set(s*(S.HX+S.GD),S.GH/2,0);back.rotation.y=-s*Math.PI/2;G.add(back);
  var roof=new t.Mesh(new t.Plane(S.GD,S.GW*2),nm);roof.rotation.x=Math.PI/2;roof.position.set(s*(S.HX+S.GD/2),S.GH,0);G.add(roof);
  [-1,1].forEach(function(zs){var sd=new t.Mesh(new t.Plane(S.GD,S.GH),nm);sd.position.set(s*(S.HX+S.GD/2),S.GH/2,zs*S.GW);G.add(sd)});
  var gl=new t.Mesh(new t.Box(.5,.08,S.GW*2),new t.Std({color:col,emissive:col,emissiveIntensity:3}));gl.position.set(gx,.06,0);G.add(gl);
  // wall above goal: solid team-colour panel with logo
  var logo=canvasTex(512,256,function(g,w,h){g.fillStyle=s<0?'#0d2a66':'#6a2a06';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='bold 92px Arial';g.textAlign='center';g.fillText(s<0?'BLUE':'ORANGE',w/2,h/2+30)});
  var lg=new t.Mesh(new t.Plane(S.GW*2+6,S.R*.9),new t.Basic({map:logo}));lg.position.set(s*(S.HX-.3),S.GH+S.R*.55,0);lg.rotation.y=-s*Math.PI/2;G.add(lg)});
 // stands (stepped, with crowd texture) all around
 var crowd=canvasTex(1024,128,function(g,w,h){g.fillStyle='#1d2230';g.fillRect(0,0,w,h);var cols=['#e63946','#f1faee','#2f7bff','#ff8a1f','#ffd166','#06d6a0','#ffffff','#111'];for(var i=0;i<700;i++){var x=Math.random()*w,y=20+Math.random()*(h-30);g.fillStyle=cols[(Math.random()*cols.length)|0];g.fillRect(x,y,7,12);g.fillStyle='#e0b48c';g.fillRect(x+1,y-5,5,5)}},[6,1]);
 var crM=new t.Std({map:crowd,roughness:.9}),stM=new t.Std({color:0x2a2f3c,roughness:.8});
 function stand(cx,cz,w,ry){var g2=new t.Group();for(var r=0;r<6;r++){var st=new t.Mesh(new t.Box(w,1.6,3.2),stM);st.position.set(0,1+r*2.1,r*3.2);g2.add(st);var cr=new t.Mesh(new t.Plane(w,1.9),crM);cr.position.set(0,2.75+r*2.1,r*3.2-1.6);g2.add(cr)}g2.position.set(cx,S.H*0+0,cz);g2.rotation.y=ry;G.add(g2);return g2}
 G.userData.stands=[stand(0,S.HZ+4,S.HX*2,0),stand(0,-S.HZ-4,S.HX*2,Math.PI),stand(S.HX+S.GD+4,0,S.HZ*2,-Math.PI/2),stand(-S.HX-S.GD-4,0,S.HZ*2,Math.PI/2)];
 // light towers + roof ring
 var tw=new t.Std({color:0x30343c,metalness:.7,roughness:.4}),lamp=new t.Std({color:0xffffff,emissive:0xfff3d6,emissiveIntensity:4});
 [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(c){var x=c[0]*(S.HX+12),z=c[1]*(S.HZ+14);var p=new t.Mesh(new t.Cyl(.8,1.2,S.H+18,10),tw);p.position.set(x,(S.H+18)/2,z);G.add(p);var hd=new t.Mesh(new t.Box(9,4,1),lamp);hd.position.set(x,S.H+18,z);hd.lookAt(S.CX,0,S.CZ);hd.rotation.set(-.5,Math.atan2(-x,-z),0);G.add(hd)});
 var rr=new t.Std({color:0x1b1f27,metalness:.6,roughness:.4});for(var i2=-4;i2<=4;i2++){var b2=new t.Mesh(new t.Box(.7,.7,S.HZ*2),rr);b2.position.set(i2*S.HX/4.5,S.H+.3,0);G.add(b2);var lb=new t.Mesh(new t.Box(.5,.2,S.HZ*1.6),lamp);lb.position.set(i2*S.HX/4.5,S.H-.1,0);G.add(lb)}
 // scoreboard cube
 var sbc=document.createElement('canvas');sbc.width=512;sbc.height=192;var sbt=new t.CanvasTex(sbc);sbt.colorSpace=t.SRGB;var sbm=new t.Basic({map:sbt});
 var sb=new t.Group();[0,1,2,3].forEach(function(i){var pl=new t.Mesh(new t.Plane(14,5.25),sbm);pl.position.set(Math.sin(i*Math.PI/2)*7,0,Math.cos(i*Math.PI/2)*7);pl.rotation.y=i*Math.PI/2;sb.add(pl)});sb.position.set(0,S.H-6,0);G.add(sb);
 G.userData.sb={c:sbc,t:sbt};
 // ball: panelled, glowing seams
 var bt=canvasTex(1024,512,function(g,w,h){var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#f6f6f6');gr.addColorStop(1,'#cfd4da');g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle='#3a3f48';g.lineWidth=10;
  for(var i=0;i<10;i++)for(var j=0;j<5;j++){var cx=i*w/10+(j%2?w/20:0),cy=j*h/4.5+40;g.beginPath();for(var a=0;a<7;a++){var an=a*Math.PI/3;g.lineTo(cx+Math.cos(an)*42,cy+Math.sin(an)*42)}g.stroke()}
  g.fillStyle='#ffb000';g.fillRect(0,h/2-6,w,12)});
 var ball=new t.Mesh(new t.Sphere(S.BR,40,28),new t.Phys({map:bt,roughness:.35,metalness:.15,clearcoat:.6,emissive:0x221100,emissiveIntensity:.2}));ball.castShadow=true;
 var ring=new t.Mesh(new t.Cyl(S.BR*1.02,S.BR*1.02,.22,48,1,true),new t.Std({color:0xffb000,emissive:0xff8a00,emissiveIntensity:2.4}));ball.add(ring);G.add(ball);
 var shadow=new t.Mesh(new t.Cyl(S.BR,S.BR,.04,28),new t.Basic({color:0,transparent:true,opacity:.35,depthWrite:false}));G.add(shadow);
 // boost pads (RL-like layout)
 var pads=[],bigM=new t.Std({color:0xffa31a,emissive:0xff7a00,emissiveIntensity:3}),smM=new t.Std({color:0xffd27a,emissive:0xffa030,emissiveIntensity:2.2}),baseM=new t.Std({color:0x30343c,metalness:.6,roughness:.4});
 function pad(x,z,big){var b=new t.Mesh(new t.Cyl(big?2.4:1.3,big?2.6:1.4,.25,24),baseM);b.position.set(x,.13,z);G.add(b);var rg=new t.Mesh(new t.Cyl(big?2.1:1.1,big?2.1:1.1,.12,24,1,true),big?bigM:smM);rg.position.set(x,.3,z);G.add(rg);
  var orb=new t.Mesh(big?new t.Sphere(1.1,18,12):new t.Cyl(.7,.7,.12,16),big?bigM:smM);orb.position.set(x,big?2:.36,z);G.add(orb);pads.push({x:x,z:z,big:big,r:big?3.2:2,on:true,t:0,m:orb,rg:rg})}
 [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(c){pad(c[0]*(S.HX-12),c[1]*(S.HZ-10),true)});pad(0,S.HZ-7,true);pad(0,-S.HZ+7,true);
 [[-58,0],[58,0],[-30,-24],[-30,24],[30,-24],[30,24],[0,-14],[0,14],[-14,0],[14,0],[-46,-36],[-46,36],[46,-36],[46,36],[-72,-18],[-72,18],[72,-18],[72,18],[-22,-40],[22,-40],[-22,40],[22,40],[-60,-30],[60,-30],[-60,30],[60,30],[-80,0],[80,0]].forEach(function(p){pad(p[0],p[1],false)});
 G.userData.pads=pads;G.userData.ball=ball;G.userData.shadow=shadow;FR.W.scene.add(G);return G}
function drawSB(G,s,tm,ot){var c=G.userData.sb.c,g=c.getContext('2d');g.fillStyle='#0b0e14';g.fillRect(0,0,512,192);g.fillStyle='#2f7bff';g.fillRect(0,0,170,192);g.fillStyle='#ff8a1f';g.fillRect(342,0,170,192);g.fillStyle='#fff';g.font='bold 120px Arial';g.textAlign='center';g.fillText(s[0],85,140);g.fillText(s[1],427,140);g.font='bold 64px Arial';g.fillText((ot?'+':'')+X.fmtT(Math.abs(tm)),256,120);G.userData.sb.t.needsUpdate=true}
// ---------- model holder for bots ----------
function Body(k,col,name,team){var t=T();this.g=new t.Group();FR.W.scene.add(this.g);this.k=k;this.col=col;this.real=false;this.tryT=0;this.setModel();if(name)this.label(name,team);this.q=new (FR.cam.quaternion.constructor)()}
Body.prototype.setModel=function(){var u=U(),m=u&&u.carModel?u.carModel(this.k,this.col):'fail';if(m&&m!=='fail'){if(this.fb){this.g.remove(this.fb);this.fb=null}this.g.add(m);this.real=true;return}if(!this.fb){this.fb=FR.trafficCar(parseInt(this.col.slice(1),16),0);this.g.add(this.fb)}if(m==='fail')this.real=true};
Body.prototype.label=function(txt,team){var t=T(),c=document.createElement('canvas');c.width=256;c.height=64;var g=c.getContext('2d');g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,8,256,48);g.fillStyle=X.COLS[team]||'#fff';g.font='bold 30px Arial';g.textAlign='center';g.fillText(txt,128,43);var tx=new t.CanvasTex(c);tx.colorSpace=t.SRGB;
 var m=new t.Mesh(new t.Plane(3,.75),new t.Basic({map:tx,transparent:true,depthWrite:false,depthTest:false}));m.renderOrder=9;this.tag=m;FR.W.scene.add(m)};
Body.prototype.sync=function(c,dt){if(!this.real){this.tryT-=dt;if(this.tryT<=0){this.tryT=.6;this.setModel()}}this.g.visible=c.dead<=0;this.g.position.set(c.p[0]+A.CX,c.p[1]+A.Y0,c.p[2]+A.CZ);quatOf(c.mat(),this.g.quaternion);
 if(this.tag){this.tag.visible=c.dead<=0;this.tag.position.set(c.p[0]+A.CX,c.p[1]+3+A.Y0,c.p[2]+A.CZ);this.tag.quaternion.copy(FR.cam.quaternion)}};
Body.prototype.dispose=function(){FR.W.scene.remove(this.g);if(this.tag)FR.W.scene.remove(this.tag)};
// ---------- AI ----------
function predict(B,n,dt){var b={p:B.p.slice(),v:B.v.slice()},out=[];for(var i=0;i<n;i++){ballStep(b,dt);out.push({p:b.p.slice(),t:(i+1)*dt})}return out}
function aiInput(G,c,i,mates,dt){var B=G.B,I={t:0,s:0,r:0,boost:false,hb:false,jh:false},dirG=c.team===0?1:-1,oppGoal=[dirG*(A.HX+4),2,0],ownGoal=[-dirG*(A.HX+2),0,0];
 var pred=G.pred,tgt=null,tt=0,sp=Math.max(12,c.speed());
 // role: closest (by distance) teammate attacks
 var myD=len(sub(B.p,c.p)),att=mates.every(function(o){return o===c||o.dead>0||len(sub(B.p,o.p))>=myD-1});
 var danger=dirG*B.v[0]<-12&&Math.abs(B.p[0]-ownGoal[0])<A.HX*.9;
 if(att||danger&&!mates.some(function(o){return o!==c&&o.role==='keep'})){c.role='att';
  for(var k=0;k<pred.length;k+=2){var bp=pred[k].p;if(bp[1]>(c.boost>25&&G.diff!=='easy'?13:4.5))continue;var toG=nrm(sub(oppGoal,bp)),aim=sub(bp,mul(toG,A.BR+1.6));aim[1]=0;var dd=len(sub(aim,[c.p[0],0,c.p[2]])),need=dd/(c.boost>10?P.boostV*.85:P.maxV*.9)+.15;if(need<=pred[k].t){tgt=aim;tt=pred[k].t;G._h=bp[1];break}}
  if(!tgt){var bp2=pred[Math.min(pred.length-1,30)].p;tgt=sub(bp2,mul(nrm(sub(oppGoal,bp2)),A.BR+2));tt=1}
  // if we are on the wrong side of the ball, swing around to own side first
  if(dirG*(c.p[0]-B.p[0])>4&&Math.abs(c.p[2]-B.p[2])<10){tgt=[B.p[0]-dirG*14,0,B.p[2]+(c.p[2]>B.p[2]?9:-9)]}}
 else{c.role=mates.indexOf(c)%2?'keep':'mid';if(c.role==='keep'||danger){tgt=[ownGoal[0]+dirG*16,0,clamp(B.p[2]*.35,-A.GW+2,A.GW-2)]}else{tgt=[(B.p[0]+ownGoal[0])/2,0,B.p[2]*.6]}
  if(c.boost<35){var best=null,bd=1e9;G.pads.forEach(function(p){if(!p.big||!p.on)return;var d=Math.hypot(p.x-c.p[0],p.z-c.p[2]);if(d<bd&&d<45){bd=d;best=p}});if(best)tgt=[best.x,0,best.z]}}
 var nearB=len(sub(B.p,c.p))<12&&B.p[1]<4.5&&c.role==='att'&&dirG*(B.p[0]-c.p[0])>-2;if(nearB){tgt=sub(B.p,mul(nrm(sub(oppGoal,B.p)),1.2));tgt[1]=0}
 else{tgt[0]=clamp(tgt[0],-A.HX+13,A.HX-13);tgt[2]=clamp(tgt[2],-A.HZ+13,A.HZ-13);tgt[1]=0}
 // steering (in surface plane)
 var to=sub(tgt,c.p),r=c.right(),fx=dot(to,c.f),lx=dot(to,r),ang=Math.atan2(-lx,fx),dist=len(to);
 if(c.gnd){I.s=clamp(ang*2.4,-1,1);I.t=Math.abs(ang)>2.4&&dist<14?-1:1;I.hb=Math.abs(ang)>1.2&&c.speed()>14;var bd2=G.diff==='easy'?.5:G.diff==='hard'?1.6:1;I.boost=Math.abs(ang)<.35&&(dist>22||c.role==='att'&&(dist>8||nearB))&&c.boost>(c.role==='att'?0:40)&&Math.random()<bd2;
  if(c.u[1]<.55){var dn=sub([0,-1,0],mul(c.u,-c.u[1])),a2=Math.atan2(-dot(dn,r),dot(dn,c.f));I.s=clamp(a2*2.4,-1,1);I.t=c.u[1]<-.3?.2:.35;I.boost=false;I.hb=false}
  // jump / aerial
  var bd3=len(sub(B.p,c.p)),bh=B.p[1]-c.p[1];if(c.role==='att'&&bd3<9+bh*.6&&bh>3.2&&bh<11&&dot(nrm(sub(B.p,c.p)),c.f)>.6&&c.u[1]>.8){c.wantJ=true;c.aerial=bh>6.5&&c.boost>20&&G.diff!=='easy'}
  else if(c.role==='att'&&bd3<7&&bh<3.5&&c.speed()>12&&dot(nrm(sub(B.p,c.p)),c.f)>.8&&Math.random()<(G.diff==='hard'?.06:.03)){c.wantJ=true;c.wantFlip=true}}
 else{ // air: aim nose at ball, boost if aerial
  var want=nrm(sub(B.p,c.p)),lf=dot(want,c.f),lu=dot(want,c.u),lr=dot(want,c.right());if(c.aerial){I.t=clamp(-lu*3,-1,1);I.s=clamp(-lr*3,-1,1);I.boost=lf>.5&&c.boost>0;I.jh=true}
  else{ // land on wheels
   I.t=clamp(c.f[1]*3,-1,1);I.r=clamp(-c.right()[1]*3,-1,1)}
  if(c.wantFlip&&c.jumps===1&&c.jt>.12){c.wantFlip=false;c.jump({t:1,s:0})}}
 if(c.wantJ&&c.gnd){c.wantJ=false;c.jump({});if(!c.aerial&&!c.wantFlip&&len(sub(B.p,c.p))<6)c.wantFlip=true}
 if(c.gnd)c.aerial=false;return I}
// ---------- game ----------
var RF={id:'soccer',name:'⚽ Rocket Football',carJump:true,meter:true,ownPhys:true};
var qTmp=null;
RF.start=function(o){this.o=o;this.mode=o.size||1;this.diff=o.diff||'normal';this.score=[0,0];this.time=300;this.ot=false;this.my=o.team||0;this.rep=[];this.demos=0;this.goals=0;GM.ballCam=true;
 if(!this.G)this.G=build();this.G.visible=true;this.pads=this.G.userData.pads;this.ball=this.G.userData.ball;this.shadow=this.G.userData.shadow;
 FR.hOver=function(x,z){var lx=Math.abs(x-A.CX),lz=Math.abs(z-A.CZ);if(lx>A.HX+A.GD+30||lz>A.HZ+30)return null;return A.Y0};
 if(FR.W.traffic)FR.W.traffic.visible=false;
 this.me=new Car(this.my);this.cars=[this.me];this.bodies=[null];this.B={p:[0,A.BR,0],v:[0,0,0]};
 if(!o.online){var n=this.mode;for(var i=0;i<n*2-1;i++){var team=i<n-1?this.my:1-this.my,c=new Car(team);c.bot=true;c.name=X.NAMES[i];this.cars.push(c);this.bodies.push(new Body(X.BCARS[(i*5+3)%X.BCARS.length],X.COLS[team],c.name,team))}}
 (FR.PK||[]).forEach(function(q){if(q.m&&Math.abs(q.x-A.CX)<A.HX+40&&Math.abs(q.z-A.CZ)<A.HZ+40){q.m.visible=false;q._rfh=1}});
 var self=this;FR.physOverride=function(dt){self.phys(dt)};qTmp=qTmp||new (FR.cam.quaternion.constructor)();FR.carQuat=qTmp;
 this.kickoff();X.mkUI();X.ui.boost.style.display='flex';X.ui.touch.style.display=FR.isTouch()?'flex':'none';this.hint=6};
RF.kickoff=function(){var spots=[[-30,0],[-44,-16],[-44,16],[-64,0]],mt=[0,0],self=this;this.B={p:[0,A.BR+.02,0],v:[0,0,0]};this.state='kick';this.st=3;
 function spot(team){var sp=spots[(mt[team]++)%spots.length],s=team===0?1:-1;return{p:[sp[0]*s,0,sp[1]],f:[s,0,0]}}
 if(this.o.online)mt[this.my]=this.o.slot||0;var p=spot(this.my);this.me.reset(p.p,p.f);this.me.boost=34;this.me.dead=0;
 this.cars.forEach(function(c){if(c===self.me)return;var q=spot(c.team);c.reset(q.p,q.f);c.boost=34;c.dead=0});
 this.pads.forEach(function(p){p.on=true;p.m.visible=true});this.syncST()};
RF.input=function(){var I=FR.inp(),K=FR.keys,TI=FR.input,o={t:I.t?1:I.b?-1:0,s:I.s||0,r:0,boost:!!I.boost,hb:!!I.hb,jh:!!(K.Space||TI.jump)};
 if(TI.gas)o.t=1;if(TI.brk)o.t=-1;if(Math.abs(TI.jx||0)>.15)o.s=-TI.jx;if(Math.abs(TI.jy||0)>.25&&!this.me.gnd)o.t=-TI.jy;
 if(K.KeyQ)o.r=-1;if(K.KeyE)o.r=1;GM.meter=this.me.boost;return o};
RF.jump=function(){if(GM.frozen||this.state!=='play'&&this.state!=='kick')return;if(this.state==='kick')return;var I=this.input();this.me.jump(I)};
RF.syncST=function(){var c=this.me,m=c.mat(),e=euler(m);ST.x=c.p[0]+A.CX;ST.y=c.p[1]+A.Y0;ST.z=c.p[2]+A.CZ;ST.pitch=e[0];ST.yaw=e[1];ST.roll=e[2];ST.vx=c.v[0];ST.vy=c.v[1];ST.vz=c.v[2];ST.vL=dot(c.v,c.f);ST.vT=0;ST.kmh=Math.round(len(c.v)*3.6);ST.air=!c.gnd;ST.boost=c.boosting;ST.spin=c.spin*.36;ST.steer=0;quatOf(m,qTmp)};
RF.phys=function(dt){if(!this.state)return;var self=this,fz=this.state==='kick'||this.state==='replay'||this.state==='over';
 if(this.state==='replay'){this.syncST();return}
 var I=this.autoMe&&this.state==='play'?aiInput(this,this.me,0,this.cars.filter(function(o){return o.team===self.me.team})):this.input();if(this.autoMe&&!this.pred)this.pred=predict(this.B,90,1/30);this.me.step(dt,I,fz);
 if(this.state==='play'&&!this.o.online){this.pred=predict(this.B,90,1/30);this.cars.forEach(function(c,i){if(!c.bot)return;var mates=self.cars.filter(function(o){return o.team===c.team});c.step(dt,aiInput(self,c,i,mates,dt),false)})}
 else this.cars.forEach(function(c){if(c.bot)c.step(dt,{},true)});
 this.syncST();
 // boost trail
 var Pl=FR.W.pool;this.cars.forEach(function(c){if(c.boosting&&Pl&&c.dead<=0){var b=add(c.p,add(mul(c.f,-2.4),mul(c.u,.7)));Pl.emit(b[0]+A.CX,b[1]+A.Y0,b[2]+A.CZ,-c.f[0]*8,-c.f[1]*8,-c.f[2]*8,.35,1.5,.3,c.team?0xff8a2a:0x4aa8ff,1,true)}})};
RF.frame=function(dt){var self=this,B=this.B,net=this.o.online,host=!net||GM.mp.host===X.NET().id,now=performance.now()/1000;
 if(this.hint>0){this.hint-=dt}
 this.pads.forEach(function(p){if(!p.on){p.t-=dt;if(p.t<=0){p.on=true;p.m.visible=true}}else{p.m.rotation.y+=dt*2;if(p.big)p.m.position.y=2+Math.sin(now*3+p.x)*.25;
  self.cars.forEach(function(c){if(!p.on||c.dead>0||c.boost>=100)return;if(Math.hypot(c.p[0]-p.x,c.p[2]-p.z)<p.r&&c.p[1]<2.5){c.boost=p.big?100:Math.min(100,c.boost+12);p.on=false;p.m.visible=false;p.t=p.big?10:4}})}});
 if(this.state==='replay'){this.replay(dt);this.draw(dt);return}
 if(this.state==='kick'){this.st-=dt;var c=Math.ceil(this.st);X.countdown(c>0?String(c):'GO!');if(this.st<=0){this.state='play';setTimeout(function(){if(self.state==='play')X.countdown('')},500)}}
 else if(this.state==='play'&&host){this.time-=this.ot?-dt:dt}
 if(this.state==='play'){
  // car-car bumps / demos
  for(var i=0;i<this.cars.length;i++)for(var j=i+1;j<this.cars.length;j++)this.bump(this.cars[i],this.cars[j]);
  var touched=false;this.cars.forEach(function(c){if(c.bot||c===self.me){if(hitBall(B,c)&&c===self.me)touched=true}});
  if(touched&&net&&!host)X.send({k:'kick',p:B.p.map(function(x){return+x.toFixed(2)}),v:B.v.map(function(x){return+x.toFixed(2)})});
  var goal=ballStep(B,dt);if(host&&goal>=0)this.goal(goal)}
 this.draw(dt);
 this.rep.push({b:B.p.slice(),c:this.cars.map(function(c){return[c.p.slice(),c.f.slice(),c.u.slice(),c.dead]})});if(this.rep.length>220)this.rep.shift();
 if(net&&host){this.tx=(this.tx||0)-dt;if(this.tx<=0){this.tx=1/15;X.send({k:'ball',p:[+(B.p[0]+A.CX).toFixed(2),+B.p[1].toFixed(2),+(B.p[2]+A.CZ).toFixed(2)],v:B.v.map(function(x){return+x.toFixed(2)}),s:this.score,tm:Math.round(this.time),st:this.state,ot:this.ot})}}
 if(host&&this.state==='play'&&!this.ot&&this.time<=0&&B.p[1]<A.BR+1.5){if(this.score[0]===this.score[1]){this.ot=true;this.time=0;X.toast('⏱ OVERTIME — next goal wins!')}else this.finish()}
 this.hud()};
RF.bump=function(a,b){if(a.dead>0||b.dead>0)return;var d=sub(b.center(),a.center()),l=len(d);if(l>3.2||l<1e-3)return;var n=mul(d,1/l),rel=dot(sub(a.v,b.v),n);
 a.p=madd(a.p,n,-(3.2-l)/2);b.p=madd(b.p,n,(3.2-l)/2);
 if(a.team!==b.team){if(a.speed()>P.supersonic&&rel>18){this.demo(b,a);return}if(b.speed()>P.supersonic&&-rel>18){this.demo(a,b);return}}
 if(rel>0){a.v=madd(a.v,n,-rel*.7);b.v=madd(b.v,n,rel*.9);b.v[1]+=rel*.15;if(b.gnd&&rel>8)b.gnd=false}};
RF.demo=function(victim,by){X.boom(victim.p[0]+A.CX,victim.p[1]+1,victim.p[2]+A.CZ,0xff5020,70);victim.dead=3;FR.shake=.6;if(by===this.me){this.demos++;X.toast('💥 DEMOLITION! '+(victim.name||''))}
 var self=this,tm=victim.team;setTimeout(function(){if(!self.state)return;var s=tm===0?-1:1;victim.reset([s*(A.HX-20),0,(Math.random()-.5)*30],[-s,0,0]);victim.boost=34;victim.dead=0},3000)};
RF.draw=function(dt){var B=this.B,self=this;this.ball.position.set(B.p[0],B.p[1],B.p[2]);var sp=len(B.v);if(sp>.1){var ax=nrm(cross([0,1,0],B.v));if(len(ax)>.1){var q=this.ball.quaternion,ang=sp*dt/A.BR,h=Math.sin(ang/2);var dq=new (q.constructor)(ax[0]*h,ax[1]*h,ax[2]*h,Math.cos(ang/2));q.premultiply(dq)}}
 this.shadow.position.set(B.p[0],.06,B.p[2]);this.shadow.scale.setScalar(Math.max(.35,1-B.p[1]/(A.H*1.2)));
 this.cars.forEach(function(c,i){if(self.bodies[i])self.bodies[i].sync(c,dt)});
 var c=FR.getCar();if(c)c.g.visible=this.me.dead<=0;
 this.sbT=(this.sbT||0)-dt;if(this.sbT<=0){this.sbT=.5;drawSB(this.G,this.score,this.time,this.ot)}};
RF.hud=function(){var me=this.my,n=this.o.online?(GM.mp.list||[]).map(function(p){return '<b style="color:'+X.COLS[p.team]+'">'+X.esc(p.n)+'</b>'}).join(' · '):(this.mode+'v'+this.mode+' vs bots');
 X.hudSet('<div class="b">'+this.score[0]+'</div><div class="tm">'+(this.ot?'+':'')+X.fmtT(Math.abs(this.time))+'</div><div class="o">'+this.score[1]+'</div>','You: <b style="color:'+X.COLS[me]+'">'+(me?'ORANGE':'BLUE')+'</b> · '+n+(FR.isTouch()?'':' · Space jump/flip · Shift boost · Q/E air roll · B ball cam'));
 X.ui.boost.style.setProperty('--b',this.me.boost);X.ui.boost.firstChild.textContent=Math.round(this.me.boost)};
RF.goal=function(team,remote){var gx=(team===0?1:-1)*(A.HX+4);this.score[team]++;X.boom(gx+A.CX,4,A.CZ,team===0?0x2f7bff:0xff8a1f,180);X.boom(gx+A.CX,9,A.CZ,0xffffff,80);FR.shake=1.1;
 X.countdown((team===0?'BLUE':'ORANGE')+' SCORES!',true);if(team===this.my&&this.B.last===this.me)this.goals++;
 if(this.o.online&&!remote)X.send({k:'goal',team:team,s:this.score});this.state='replay';this.repI=Math.max(0,this.rep.length-120);this.repT=0;drawSB(this.G,this.score,this.time,this.ot);
 if(this.ot){var self=this;setTimeout(function(){self.finish()},2600)}};
RF.replay=function(dt){this.repT+=dt;var f=this.rep[Math.min(this.rep.length-1,Math.floor(this.repI))];this.repI+=dt*30*.55;var self=this;
 if(f){this.B.p=f.b.slice();this.cars.forEach(function(c,i){var q=f.c[i];if(q){c.p=q[0].slice();c.f=q[1].slice();c.u=q[2].slice();c.dead=q[3]}});this.B.v=[0,0,0]}
 if(this.repT>1)X.countdown('REPLAY',true);
 if(this.repT>4.6||this.repI>=this.rep.length-1){X.countdown('');this.rep=[];if(this.state!=='over')this.kickoff()}};
RF.cam=function(){if(FR.foot&&FR.foot.on)return;var cam=FR.cam,c=this.me,B=this.state==='replay'?this.B:this.B,wp=[c.p[0]+A.CX,c.p[1]+A.Y0,c.p[2]+A.CZ],bp=[B.p[0]+A.CX,B.p[1]+A.Y0,B.p[2]+A.CZ];
 var up=c.gnd?nrm(add(mul(c.u,.65),[0,.35,0])):[0,1,0],pos,look;
 if(this.state==='replay'){var o=[bp[0]+Math.sin(this.repT*.4)*22,Math.max(6,bp[1]+5),bp[2]+Math.cos(this.repT*.4)*22];pos=o;look=bp}
 else if(GM.ballCam){var d=sub(bp,wp);d[1]*=.35;d=nrm(d);pos=add(add(wp,mul(d,-11)),mul(up,3.6));look=add(add(wp,mul(d,6)),[0,1.2,0]);var bl=sub(bp,wp);if(len(bl)<60)look=add(mul(look,.5),mul(add(bp,[0,-1,0]),.5))}
 else{var f=c.gnd?c.f:nrm([c.v[0],c.v[1]*.4,c.v[2]]);if(!c.gnd&&len(c.v)<3)f=c.f;pos=add(add(wp,mul(f,-10)),mul(up,3.4));look=add(add(wp,mul(f,5)),mul(up,1.2))}
 // keep inside the arena
 var lp=L(pos[0],pos[1]-A.Y0,pos[2]),sd=sdf(lp);if(sd.d<1.2)pos=add(pos,mul(sd.n,1.2-sd.d));
 this._c=this._c||pos.slice();var k=this.state==='replay'?.08:.22;for(var i=0;i<3;i++)this._c[i]+=(pos[i]-this._c[i])*k;var lc=L(this._c[0],this._c[1]-A.Y0,this._c[2]),sc2=sdf(lc);if(sc2.d<1.2){this._c=add(this._c,mul(sc2.n,1.2-sc2.d))}
 cam.position.set(this._c[0],this._c[1],this._c[2]);cam.up.set(0,1,0);cam.lookAt(look[0],look[1],look[2]);cam.fov=FR.isTouch()?78:72;cam.updateProjectionMatrix();if(FR.W.camPos)FR.W.camPos.copy(cam.position)};
RF.finish=function(){if(this.state==='over')return;this.state='over';var w=this.score[0]===this.score[1]?-1:this.score[0]>this.score[1]?0:1;if(this.o.online&&GM.mp.host===X.NET().id)X.send({k:'end',s:this.score});
 var best=+(localStorage.getItem('uae_rf_wins')||0);if(w===this.my)localStorage.setItem('uae_rf_wins',best+1);
 X.results(w<0?'Draw':w===this.my?'🏆 You win!':'Defeat',['Score: BLUE '+this.score[0]+' – '+this.score[1]+' ORANGE','Your goals: '+this.goals,'Demolitions: '+this.demos,'Flips: '+((GM.stat&&GM.stat.flips)||0)],'Total wins: '+(+(localStorage.getItem('uae_rf_wins')||0)))};
RF.onMsg=function(m){var B=this.B,host=GM.mp.host===X.NET().id;if(m.k==='ball'&&!host){var p=[m.p[0]-A.CX,m.p[1],m.p[2]-A.CZ];for(var i=0;i<3;i++)B.p[i]+=(p[i]-B.p[i])*.6;B.v=m.v.slice();this.score=m.s;this.time=m.tm;this.ot=m.ot;if(m.st==='play'&&this.state==='kick'&&this.st>1)this.st=Math.min(this.st,1)}
 if(m.k==='kick'&&host){var r=FR.RP&&FR.RP[m.from],ok=true,lp=r&&r.buf&&r.buf.length&&r.buf[r.buf.length-1].p;if(lp)ok=Math.hypot(lp.x-A.CX-m.p[0],lp.z-A.CZ-m.p[2])<18;if(ok&&Array.isArray(m.v))B.v=m.v.map(function(x){return clamp(+x||0,-70,70)})}
 if(m.k==='goal'&&!host){this.score=[0,0];this.score[m.team]=m.s[m.team]-1;this.score[1-m.team]=m.s[1-m.team];this.goal(m.team,true)}
 if(m.k==='end'&&!host){this.score=m.s;this.finish()}};
RF.end=function(){(FR.PK||[]).forEach(function(q){if(q._rfh&&q.m){q.m.visible=true;q._rfh=0}});this.state=null;FR.physOverride=null;FR.carQuat=null;if(this.G)this.G.visible=false;FR.hOver=null;(this.bodies||[]).forEach(function(b){if(b)b.dispose()});this.bodies=[];this.cars=[];
 var c=FR.getCar();if(c){c.g.visible=true;c.g.quaternion.set(0,0,0,1)}ST.pitch=ST.roll=0;ST.y=FR.heightAt(ST.x,ST.z);if(X.ui.boost){X.ui.boost.style.display='none';X.ui.touch.style.display='none'}X.countdown('');if(FR.W.traffic)FR.W.traffic.visible=true};
GM.rfStadium=function(on){if(on&&!RF.G)RF.G=build();if(!RF.G)return;RF.G.visible=on;RF.G.userData.ball.visible=!on;RF.G.userData.shadow.visible=!on;if(!on){RF.G.userData.ball.visible=true;RF.G.userData.shadow.visible=true}};
GM.GAMES.soccer=RF;GM.RF=RF;GM.RFA=A;GM.RFsdf=sdf;
})();

/* Roadster Dash UAE — P7 Aero World + Sky League.
   Original mashup: Bloxx-League-style car soccer + Flying-Tesla-style free flight open world.
   Procedural UAE-themed landmarks. No third-party assets. Credit: Taejoo Um (base game). */
(function(){'use strict';
var FR=window.__fr,GM=window.__games;if(!FR||!GM||!GM._x)return;var X=GM._x,ST=FR.ST;
function T(){return window.__T}function U(){return window.__uae}
function v(x,y,z){return[x,y,z]}function add(a,b){return[a[0]+b[0],a[1]+b[1],a[2]+b[2]]}function sub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]]}
function mul(a,s){return[a[0]*s,a[1]*s,a[2]*s]}function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function len(a){return Math.sqrt(dot(a,a))}function nrm(a){var l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l]}function madd(a,b,s){a[0]+=b[0]*s;a[1]+=b[1]*s;a[2]+=b[2]*s;return a}
function clamp(x,a,b){return x<a?a:x>b?b:x}
function rot(vec,ax,ang){var c=Math.cos(ang),s=Math.sin(ang),k=nrm(ax),d=dot(k,vec),cr=cross(k,vec);return[vec[0]*c+cr[0]*s+k[0]*d*(1-c),vec[1]*c+cr[1]*s+k[1]*d*(1-c),vec[2]*c+cr[2]*s+k[2]*d*(1-c)]}
function quatOf(c,q){var Xc=c[0],Y=c[1],Z=c[2],m00=Xc[0],m01=Y[0],m02=Z[0],m10=Xc[1],m11=Y[1],m12=Z[1],m20=Xc[2],m21=Y[2],m22=Z[2],tr=m00+m11+m22,s;
 if(tr>0){s=.5/Math.sqrt(tr+1);q.set((m21-m12)*s,(m02-m20)*s,(m10-m01)*s,.25/s)}else if(m00>m11&&m00>m22){s=2*Math.sqrt(1+m00-m11-m22);q.set(.25*s,(m01+m10)/s,(m02+m20)/s,(m21-m12)/s)}
 else if(m11>m22){s=2*Math.sqrt(1+m11-m00-m22);q.set((m01+m10)/s,.25*s,(m12+m21)/s,(m02-m20)/s)}else{s=2*Math.sqrt(1+m22-m00-m11);q.set((m02+m20)/s,(m12+m21)/s,.25*s,(m10-m01)/s)}return q}
function euler(c){var Z=c[2],Xc=c[0],Y=c[1],m23=Z[1],x=Math.asin(-clamp(m23,-1,1)),y,z;if(Math.abs(m23)<.99999){y=Math.atan2(Z[0],Z[2]);z=Math.atan2(Xc[1],Y[1])}else{y=Math.atan2(-Xc[2],Xc[0]);z=0}return[x,y,z]}
function canvasTex(w,h,draw,rep){var t=T(),cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d'),w,h);var tx=new t.CanvasTex(cv);tx.colorSpace=t.SRGB;tx.anisotropy=8;if(rep){tx.wrapS=tx.wrapT=1000;tx.repeat.set(rep[0],rep[1])}return tx}

/* ===================== SKY LEAGUE ARENA (flying car-soccer) ===================== */
var A={Y0:420,CX:900,CZ:-520,HX:92,HZ:56,H:48,R:12,GW:13,GH:14,GD:12,BR:3.2,g:.55};
function sdfA(p){var x=p[0],y=p[1]-A.H/2,z=p[2],ax=Math.abs(x),az=Math.abs(z),mouth=az<A.GW&&p[1]<A.GH;
 if(mouth&&ax>A.HX-1){var cand=[[p[1],[0,1,0]],[A.GH-p[1],[0,-1,0]],[A.GW-az,[0,0,-Math.sign(z)]],[A.HX+A.GD-ax,[-Math.sign(x),0,0]]];var best=cand[0];for(var i=1;i<4;i++)if(cand[i][0]<best[0])best=cand[i];return{d:best[0],n:best[1]}}
 var E=[mouth?1e4:A.HX,A.H/2,A.HZ],q=[ax,Math.abs(y),az],s=[x<0?-1:1,y<0?-1:1,z<0?-1:1],B=[E[0]-A.R,E[1]-A.R,E[2]-A.R];
 var w=[Math.max(0,q[0]-B[0]),Math.max(0,q[1]-B[1]),Math.max(0,q[2]-B[2])],wl=len(w);
 if(wl>1e-6){return{d:A.R-wl,n:[-s[0]*w[0]/wl,-s[1]*w[1]/wl,-s[2]*w[2]/wl]}}
 var m=[E[0]-q[0],E[1]-q[1],E[2]-q[2]],k=m[0]<m[1]?(m[0]<m[2]?0:2):(m[1]<m[2]?1:2),n=[0,0,0];n[k]=-s[k];return{d:m[k],n:n}}
function LA(wx,wy,wz){return[wx-A.CX,wy-A.Y0,wz-A.CZ]}

/* car physics: Rocket League + continuous thruster flight (Flying Roadster) */
var P={g:14,maxV:32,boostV:52,acc:28,boostA:38,brake:42,coast:5,turnLo:2.8,turnHi:1.2,jump:11,dj:9.5,dodge:16,pitchA:12,yawA:9,rollA:13,wMax:6,supersonic:44,thrust:22,lift:18,suction:9};
function Car(team){this.team=team;this.reset([0,0,0],[0,0,-1]);this.boost=40;this.dead=0;this.fly=true}
Car.prototype.reset=function(p,f){this.p=p.slice();this.v=[0,0,0];this.f=nrm(f);this.u=[0,1,0];this.w=[0,0,0];this.gnd=true;this.n=[0,1,0];this.jumps=0;this.jt=0;this.flip=0;this.flipAx=null;this.dodgeT=0;this.spin=0;this.holdJ=0;this.boosting=false;this.air=0;this.fly=true;this.suction=false};
Car.prototype.right=function(){return nrm(cross(this.f,this.u))};
Car.prototype.center=function(){return add(this.p,mul(this.u,.7))};
Car.prototype.jump=function(I){if(this.dead>0)return;if(this.gnd){this.v=madd(this.v,this.u,P.jump);this.gnd=false;this.jumps=1;this.jt=0;this.holdJ=.2;this.p=madd(this.p,this.u,.15);return}
 if(this.jumps===1&&this.jt<1.5){this.jumps=2;var fw=I.t||0,sd=I.s||0;if(Math.abs(fw)<.3&&Math.abs(sd)<.3){this.v=madd(this.v,this.u,P.dj);return}
  var r=this.right(),hf=nrm([this.f[0],0,this.f[2]]),hr=nrm([r[0],0,r[2]]),dir=nrm(add(mul(hf,fw),mul(hr,-sd)));this.v=madd(this.v,dir,P.dodge);this.v[1]=Math.max(this.v[1]*.3,2);
  this.flip=.6;this.flipAx=nrm(add(mul(r,-fw),mul(this.f,-sd)));this.dodgeT=.55;GM.stat&&(GM.stat.flips=(GM.stat.flips||0)+1)}};
Car.prototype.step=function(dt,I,frozen){if(this.dead>0){this.dead-=dt;return}
 this.jt+=dt;this.dodgeT=Math.max(0,this.dodgeT-dt);var c=sdfA(this.p);this.boosting=false;this.suction=false;
 if(frozen){this.v=[0,0,0];this.w=[0,0,0];return}
 var gravity=[0,-P.g*A.g,0];
 // suction to nearby surface (Flying Roadster fans)
 if(I.stick&&c.d<4.5){var sn=c.n;this.v=madd(this.v,sn,-(c.d-.08)*P.suction*dt*8);if(c.d<.55){this.gnd=true;this.n=sn.slice();this.suction=true}}
 if(this.gnd){var n=c.n;this.n=n;
  var ax=cross(this.u,n),sa=len(ax);if(sa>1e-5){var ang=Math.asin(Math.min(1,sa))*Math.min(1,dt*14);this.u=nrm(rot(this.u,ax,ang));this.f=nrm(rot(this.f,ax,ang))}
  this.f=nrm(sub(this.f,mul(n,dot(this.f,n))));this.u=n.slice();
  var r=this.right(),vf=dot(this.v,this.f),t=I.t||0,a=0;
  if(t>0)a=vf<-1?P.brake:P.acc*Math.max(.15,1-Math.max(0,vf)/P.maxV);else if(t<0)a=vf>1?-P.brake:-P.acc*.8*Math.max(.1,1+Math.min(0,vf)/(P.maxV*.6));else a=-Math.sign(vf)*Math.min(Math.abs(vf)/Math.max(dt,1e-3),P.coast);
  if(t>0&&vf>P.maxV)a=0;if(t)a*=Math.abs(t);
  if(I.boost&&this.boost>0&&!frozen){a+=P.boostA;this.boost=Math.max(0,this.boost-28*dt);this.boosting=true}
  this.v=madd(this.v,this.f,a*dt);
  var sp=Math.abs(vf),tr=(sp<1?sp*P.turnLo:P.turnLo+(P.turnHi-P.turnLo)*Math.min(1,sp/P.maxV))*(I.hb?1.45:1),yaw=(I.s||0)*tr*dt*(vf<-.5?-1:1);
  if(yaw){this.f=nrm(rot(this.f,n,yaw));var vt=sub(this.v,mul(n,dot(this.v,n)));this.v=add(rot(vt,n,yaw*.92),mul(n,dot(this.v,n)))}
  r=this.right();var vl=dot(this.v,r);this.v=madd(this.v,r,-vl*Math.min(1,dt*(I.hb?2.2:11)));
  var gt=sub(gravity,mul(n,dot(gravity,n)));this.v=madd(this.v,gt,dt*(n[1]>.7?0:.55));
  var vn=dot(this.v,n);if(vn<0)this.v=madd(this.v,n,-vn);
  this.p=madd(this.p,this.v,dt);var c2=sdfA(this.p);this.p=madd(this.p,c2.n,-c2.d+.02);
  for(var it=0;it<2;it++){var c5=sdfA(this.p);if(c5.d<.015){this.p=madd(this.p,c5.n,-c5.d+.02);var vn5=dot(this.v,c5.n);if(vn5<0)this.v=madd(this.v,c5.n,-vn5)}}
  c2=sdfA(this.p);var spd=len(this.v);if((c2.n[1]<.35&&spd<7)||(c2.n[1]<-.2&&spd<10)||c2.d>.55){this.gnd=false;this.air=0}
  this.w=[0,0,0];this.jumps=0;this.spin+=vf*dt/.36}
 else{this.air+=dt;this.v=madd(this.v,gravity,dt);
  // thruster flight (Space climb / C descend / hold fly)
  if(I.climb){this.v=madd(this.v,[0,1,0],I.climb*P.lift*dt);if(I.climb>0&&this.boost>0){this.boost=Math.max(0,this.boost-8*dt)}}
  if(this.holdJ>0&&I.jh){this.v=madd(this.v,this.u,14*dt);this.holdJ-=dt}else this.holdJ=0;
  var r2=this.right();
  if(this.flip>0){var fa=Math.min(this.flip,dt)/.62*Math.PI*2;this.f=nrm(rot(this.f,this.flipAx,fa));this.u=nrm(rot(this.u,this.flipAx,fa));this.flip-=dt;if(this.flip<=0)this.w=[0,0,0]}
  else{var wa=add(add(mul(r2,(I.t||0)*-P.pitchA),mul(this.u,(I.s||0)*P.yawA)),mul(this.f,(I.r||0)*-P.rollA));this.w=madd(this.w,wa,dt);this.w=mul(this.w,Math.max(0,1-dt*(I.t||I.s||I.r?1.2:4)));var wl=len(this.w);if(wl>P.wMax)this.w=mul(this.w,P.wMax/wl);
   if(wl>1e-4){var ang2=wl*dt;this.f=nrm(rot(this.f,this.w,ang2));this.u=nrm(rot(this.u,this.w,ang2))}}
  this.u=nrm(sub(this.u,mul(this.f,dot(this.u,this.f))));
  if(I.boost&&this.boost>0&&!frozen){this.v=madd(this.v,this.f,P.boostA*1.15*dt);this.boost=Math.max(0,this.boost-26*dt);this.boosting=true}
  // free-flight throttle pushes forward even without boost
  if(I.fly&&(I.t||0)>0)this.v=madd(this.v,this.f,P.thrust*.55*dt*(I.t||0));
  var sp2=len(this.v);if(sp2>P.boostV+8)this.v=mul(this.v,(P.boostV+8)/sp2);
  this.p=madd(this.p,this.v,dt);
  var c3=sdfA(this.p);if(c3.d<.05){var vn2=dot(this.v,c3.n);this.p=madd(this.p,c3.n,-c3.d+.03);
   var up=dot(this.u,c3.n);if(vn2<0)this.v=madd(this.v,c3.n,-vn2*(up>.2?1:1.3));if(up>-.2||this.air>.25){this.gnd=true;this.flip=0;this.air=0}}
  var top=add(this.p,mul(this.u,1.3)),c4=sdfA(top);if(c4.d<.05){var vn3=dot(this.v,c4.n);if(vn3<0)this.v=madd(this.v,c4.n,-vn3*1.3);this.p=madd(this.p,c4.n,-c4.d+.05)}
  this.spin+=dot(this.v,this.f)*dt/.36}
 var vv=len(this.v);if(vv>P.boostV+10)this.v=mul(this.v,(P.boostV+10)/vv);
 if(this.gnd&&this.jt>.1)this.jumps=0};
Car.prototype.speed=function(){return len(this.v)};
Car.prototype.mat=function(){var r=this.right();return[r,this.u,mul(this.f,-1)]};

function ballStep(B,dt){B.v[1]-=P.g*A.g*.9*dt;var dr=Math.pow(.998,dt*60);B.v=mul(B.v,dr);B.p=madd(B.p,B.v,dt);
 for(var it=0;it<2;it++){var c=sdfA(B.p);if(c.d<A.BR){B.p=madd(B.p,c.n,A.BR-c.d);var vn=dot(B.v,c.n);if(vn<0){var vt=sub(B.v,mul(c.n,vn));B.v=add(mul(vt,Math.max(.7,1-.2*Math.min(1,-vn/10))),mul(c.n,-vn*(-vn>3?.6:0)))}}}
 var sp=len(B.v);if(sp>78)B.v=mul(B.v,78/sp);
 var ax=Math.abs(B.p[0]);if(ax>A.HX+A.BR&&Math.abs(B.p[2])<A.GW&&B.p[1]<A.GH)return B.p[0]>0?0:1;return -1}
function hitBall(B,c){if(c.dead>0)return false;var ctr=c.center(),r=c.right(),d=sub(B.p,ctr),lx=dot(d,r),ly=dot(d,c.u),lz=dot(d,c.f),hx=1.1,hy=.65,hz=2.3;
 var cx=clamp(lx,-hx,hx),cy=clamp(ly,-hy,hy),cz=clamp(lz,-hz,hz),cp=add(add(add(ctr,mul(r,cx)),mul(c.u,cy)),mul(c.f,cz)),dv=sub(B.p,cp),dl=len(dv);if(dl>=A.BR)return false;
 var n=dl>1e-4?mul(dv,1/dl):nrm(d);B.p=madd(cp.slice(),n,A.BR+.02);var rel=sub(B.v,c.v),vn=dot(rel,n);
 if(vn<0)B.v=madd(B.v,n,-vn*1.6);
 var dir=sub(B.p,ctr);dir[1]*=.4;dir=nrm(dir);var push=Math.max(0,-vn);B.v=madd(B.v,dir,push*.55+4);
 if(c.dodgeT>0)B.v=madd(B.v,nrm([c.v[0],c.v[1]*.35,c.v[2]]),10);
 if(c.boosting)B.v=madd(B.v,c.f,3.5);
 c.v=madd(c.v,n,-Math.max(0,-vn)*.08);B.last=c;return true}

function buildArena(){var t=T(),G=new t.Group(),S=A;G.position.set(S.CX,S.Y0,S.CZ);
 var turf=canvasTex(2048,1210,function(g,w,h){var sx=w/(S.HX*2),sz=h/(S.HZ*2);
  for(var i=0;i<18;i++){g.fillStyle=i%2?'#1a4a7a':'#1e568c';g.fillRect(i*w/18,0,w/18+1,h)}
  for(var k=0;k<3500;k++){g.fillStyle='rgba(255,255,255,'+(Math.random()*.05)+')';g.fillRect(Math.random()*w,Math.random()*h,2,2)}
  g.strokeStyle='rgba(243,215,122,.95)';g.lineWidth=8;g.strokeRect(12,12,w-24,h-24);g.beginPath();g.moveTo(w/2,12);g.lineTo(w/2,h-12);g.stroke();
  g.beginPath();g.arc(w/2,h/2,16*sx,0,7);g.stroke();g.fillStyle='#f3d77a';g.beginPath();g.arc(w/2,h/2,10,0,7);g.fill();
  [-1,1].forEach(function(s){var gx=s<0?12:w-12,bw=20*sx,bh=(S.GW+10)*2*sz;g.strokeRect(s<0?gx:gx-bw,h/2-bh/2,bw,bh);
   g.fillStyle=s<0?'rgba(47,123,255,.4)':'rgba(255,138,31,.4)';g.fillRect(s<0?gx:gx-bw,h/2-bh/2,bw,bh)});
  g.font='bold 86px Arial';g.textAlign='center';g.fillStyle='rgba(243,215,122,.28)';g.fillText('SKY LEAGUE · UAE',w/2,h/2+160)});
 var fl=new t.Mesh(new t.Plane(S.HX*2,S.HZ*2),new t.Std({map:turf,roughness:.55,metalness:.15,emissive:0x0a2040,emissiveIntensity:.35}));fl.rotation.x=-Math.PI/2;fl.position.y=.04;fl.receiveShadow=true;G.add(fl);
 [-1,1].forEach(function(s){var gf=new t.Mesh(new t.Plane(S.GD,S.GW*2),new t.Std({color:s<0?0x1e3d7a:0x7a3d10,roughness:.7,emissive:s<0?0x102040:0x401808,emissiveIntensity:.5}));gf.rotation.x=-Math.PI/2;gf.position.set(s*(S.HX+S.GD/2),.04,0);G.add(gf)});
 // translucent sky shell
 var bx=new t.Box(S.HX*2,S.H,S.HZ*2,64,14,40),pa=bx.attributes.position,idx=bx.index.array,B=[S.HX-S.R,S.H/2-S.R,S.HZ-S.R];
 function mapP(x,y,z){var c=[clamp(x,-B[0],B[0]),clamp(y,-B[1],B[1]),clamp(z,-B[2],B[2])],d=nrm([x-c[0],y-c[1],z-c[2]]);return[c[0]+d[0]*S.R,c[1]+d[1]*S.R+S.H/2,c[2]+d[2]*S.R,d]}
 var lo={P:[],N:[],C:[]},hi={P:[],N:[],C:[]},cBlue=[.12,.45,.95],cOr=[.98,.52,.1],cSky=[.35,.55,.95];
 for(var i=0;i<idx.length;i+=3){var tri=[],cy=0,cxs=0,czs=0;for(var k=0;k<3;k++){var j=idx[i+k],m=mapP(pa.getX(j),pa.getY(j),pa.getZ(j));tri.push(m);cy+=m[1]/3;cxs+=m[0]/3;czs+=m[2]/3}
  if(cy<.35)continue;if(Math.abs(czs)<S.GW+.3&&cy<S.GH+.2&&Math.abs(cxs)>S.HX-S.R)continue;
  var dst=cy<S.R*1.05?lo:hi,tc=cy>S.H*.75?cSky:(cxs<0?cBlue:cOr),shade=cy<S.R*1.05?.85:1;
  for(k=0;k<3;k++){var q=tri[k];dst.P.push(q[0],q[1],q[2]);dst.N.push(-q[3][0],-q[3][1],-q[3][2]);var tint=.4+.6*Math.min(1,Math.abs(q[0])/S.HX);dst.C.push((tc[0]*tint+.45*(1-tint))*shade,(tc[1]*tint+.55*(1-tint))*shade,(tc[2]*tint+.75*(1-tint))*shade)}}
 function mk(o,mat){var g=new t.Geo();g.setAttribute('position',new t.Attr(new Float32Array(o.P),3));g.setAttribute('normal',new t.Attr(new Float32Array(o.N),3));g.setAttribute('color',new t.Attr(new Float32Array(o.C),3));g.computeBoundingSphere();return new t.Mesh(g,mat)}
 var lowM=mk(lo,new t.Std({vertexColors:true,roughness:.4,metalness:.25,side:2,emissive:0x081828,emissiveIntensity:.7}));lowM.receiveShadow=true;G.add(lowM);
 var hex=canvasTex(256,256,function(g,w,h){g.clearRect(0,0,w,h);g.strokeStyle='rgba(180,220,255,.85)';g.lineWidth=3;for(var y=0;y<3;y++)for(var x=0;x<3;x++){var cx=x*w/2+(y%2?w/4:0),cy=y*h/2.3;g.beginPath();for(var a=0;a<7;a++){var an=a*Math.PI/3+Math.PI/6;g.lineTo(cx+Math.cos(an)*w/4.4,cy+Math.sin(an)*w/4.4)}g.stroke()}},[20,5]);
 var hiM=mk(hi,new t.Std({vertexColors:true,map:hex,transparent:true,opacity:.38,roughness:.12,metalness:.3,side:2,depthWrite:false,emissive:0x204060,emissiveIntensity:.55}));hiM.renderOrder=3;G.add(hiM);
 // goals
 var netTex=canvasTex(256,256,function(g,w,h){g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=3;for(var i=0;i<=8;i++){g.beginPath();g.moveTo(i*w/8,0);g.lineTo(i*w/8,h);g.stroke();g.beginPath();g.moveTo(0,i*h/8);g.lineTo(w,i*h/8);g.stroke()}},[4,2]);
 [-1,1].forEach(function(s){var col=s<0?0x2f7bff:0xff8a1f,gx=s*S.HX,em=new t.Std({color:col,emissive:col,emissiveIntensity:3.4,roughness:.3});
  [[0,S.GH+.4,0,1,.8,S.GW*2+1.6],[0,S.GH/2,S.GW+.4,1,S.GH+.8,.8],[0,S.GH/2,-S.GW-.4,1,S.GH+.8,.8]].forEach(function(p){var m=new t.Mesh(new t.Box(p[3],p[4],p[5]),em);m.position.set(gx+p[0],p[1],p[2]);G.add(m)});
  var nm=new t.Std({map:netTex,color:col,transparent:true,opacity:.5,side:2,depthWrite:false,emissive:col,emissiveIntensity:.4});
  var back=new t.Mesh(new t.Plane(S.GW*2,S.GH),nm);back.position.set(s*(S.HX+S.GD),S.GH/2,0);back.rotation.y=-s*Math.PI/2;G.add(back);
  var logo=canvasTex(512,256,function(g,w,h){g.fillStyle=s<0?'#0a1e4a':'#4a1e06';g.fillRect(0,0,w,h);g.fillStyle='#f3d77a';g.font='bold 72px Arial';g.textAlign='center';g.fillText(s<0?'BLUE · أزرق':'ORANGE · برتقالي',w/2,h/2+24)});
  var lg=new t.Mesh(new t.Plane(S.GW*2+6,S.R*.85),new t.Basic({map:logo}));lg.position.set(s*(S.HX-.3),S.GH+S.R*.5,0);lg.rotation.y=-s*Math.PI/2;G.add(lg)});
 // floating boost orbs (air + floor)
 var pads=[],bigM=new t.Std({color:0xffa31a,emissive:0xff7a00,emissiveIntensity:3.2}),smM=new t.Std({color:0x7ec8ff,emissive:0x3a9fff,emissiveIntensity:2.4}),baseM=new t.Std({color:0x2a3344,metalness:.7,roughness:.3});
 function pad(x,y,z,big){var b=new t.Mesh(new t.Cyl(big?2.2:1.2,big?2.4:1.3,.2,20),baseM);b.position.set(x,y+.1,z);G.add(b);var orb=new t.Mesh(new t.Sphere(big?1.15:.7,16,12),big?bigM:smM);orb.position.set(x,y+(big?2.2:1.1),z);G.add(orb);pads.push({x:x,y:y,z:z,big:big,r:big?3.4:2.2,on:true,t:0,m:orb})}
 [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(c){pad(c[0]*(S.HX-14),0,c[1]*(S.HZ-12),true)});
 pad(0,0,S.HZ-8,true);pad(0,0,-S.HZ+8,true);
 // mid-air boost rings (flight-focused)
 [[0,18,0],[40,22,20],[-40,22,-20],[55,14,0],[-55,14,0],[0,28,30],[0,28,-30],[70,10,25],[-70,10,-25]].forEach(function(p){pad(p[0],p[1],p[2],false)});
 [[-50,0],[50,0],[-28,-22],[-28,22],[28,-22],[28,22],[0,-16],[0,16],[-18,0],[18,0]].forEach(function(p){pad(p[0],0,p[1],false)});
 // ceiling drive strips (Turbo Ball homage — original)
 [-1,1].forEach(function(s){var strip=new t.Mesh(new t.Box(S.HX*1.4,.4,8),new t.Std({color:0xf3d77a,emissive:0xd4af37,emissiveIntensity:1.8,metalness:.5,roughness:.3}));strip.position.set(0,S.H-1.2,s*(S.HZ-18));G.add(strip)});
 // scoreboard
 var sbc=document.createElement('canvas');sbc.width=512;sbc.height=192;var sbt=new t.CanvasTex(sbc);sbt.colorSpace=t.SRGB;
 var sb=new t.Group();[0,1,2,3].forEach(function(i){var pl=new t.Mesh(new t.Plane(14,5.25),new t.Basic({map:sbt}));pl.position.set(Math.sin(i*Math.PI/2)*7,0,Math.cos(i*Math.PI/2)*7);pl.rotation.y=i*Math.PI/2;sb.add(pl)});sb.position.set(0,S.H-7,0);G.add(sb);
 // ball
 var bt=canvasTex(1024,512,function(g,w,h){var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#f8f8ff');gr.addColorStop(1,'#c8d0e0');g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle='#2a4060';g.lineWidth=10;
  for(var i=0;i<10;i++)for(var j=0;j<5;j++){var cx=i*w/10+(j%2?w/20:0),cy=j*h/4.5+40;g.beginPath();for(var a=0;a<7;a++){var an=a*Math.PI/3;g.lineTo(cx+Math.cos(an)*42,cy+Math.sin(an)*42)}g.stroke()}
  g.fillStyle='#f3d77a';g.fillRect(0,h/2-6,w,12)});
 var ball=new t.Mesh(new t.Sphere(S.BR,40,28),new t.Phys({map:bt,roughness:.3,metalness:.2,clearcoat:.7,emissive:0x221800,emissiveIntensity:.25}));ball.castShadow=true;
 var ring=new t.Mesh(new t.Cyl(S.BR*1.02,S.BR*1.02,.22,48,1,true),new t.Std({color:0xf3d77a,emissive:0xd4af37,emissiveIntensity:2.6}));ball.add(ring);G.add(ball);
 var shadow=new t.Mesh(new t.Cyl(S.BR,S.BR,.04,28),new t.Basic({color:0,transparent:true,opacity:.3,depthWrite:false}));G.add(shadow);
 G.userData={pads:pads,ball:ball,shadow:shadow,sb:{c:sbc,t:sbt}};FR.W.scene.add(G);return G}
function drawSB(G,s,tm,ot){var c=G.userData.sb.c,g=c.getContext('2d');g.fillStyle='#060a14';g.fillRect(0,0,512,192);g.fillStyle='#2f7bff';g.fillRect(0,0,170,192);g.fillStyle='#ff8a1f';g.fillRect(342,0,170,192);g.fillStyle='#fff';g.font='bold 120px Arial';g.textAlign='center';g.fillText(s[0],85,140);g.fillText(s[1],427,140);g.font='bold 56px Arial';g.fillStyle='#f3d77a';g.fillText((ot?'+':'')+X.fmtT(Math.abs(tm)),256,118);g.font='bold 22px Arial';g.fillText('SKY LEAGUE',256,168);G.userData.sb.t.needsUpdate=true}

function Body(k,col,name,team){var t=T();this.g=new t.Group();FR.W.scene.add(this.g);this.k=k;this.col=col;this.real=false;this.tryT=0;this.setModel();if(name)this.label(name,team);this.q=new (FR.cam.quaternion.constructor)()}
Body.prototype.setModel=function(){var u=U(),m=u&&u.carModel?u.carModel(this.k,this.col):'fail';if(m&&m!=='fail'){if(this.fb){this.g.remove(this.fb);this.fb=null}this.g.add(m);this.real=true;return}if(!this.fb){this.fb=FR.trafficCar(parseInt(this.col.slice(1),16),0);this.g.add(this.fb)}if(m==='fail')this.real=true};
Body.prototype.label=function(txt,team){var t=T(),c=document.createElement('canvas');c.width=256;c.height=64;var g=c.getContext('2d');g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,8,256,48);g.fillStyle=X.COLS[team]||'#fff';g.font='bold 28px Arial';g.textAlign='center';g.fillText(txt,128,42);var tx=new t.CanvasTex(c);tx.colorSpace=t.SRGB;
 var m=new t.Mesh(new t.Plane(3,.75),new t.Basic({map:tx,transparent:true,depthWrite:false,depthTest:false}));m.renderOrder=9;this.tag=m;FR.W.scene.add(m)};
Body.prototype.sync=function(c,dt){if(!this.real){this.tryT-=dt;if(this.tryT<=0){this.tryT=.6;this.setModel()}}this.g.visible=c.dead<=0;this.g.position.set(c.p[0]+A.CX,c.p[1]+A.Y0,c.p[2]+A.CZ);quatOf(c.mat(),this.g.quaternion);
 if(this.tag){this.tag.visible=c.dead<=0;this.tag.position.set(c.p[0]+A.CX,c.p[1]+3.2+A.Y0,c.p[2]+A.CZ);this.tag.quaternion.copy(FR.cam.quaternion)}};
Body.prototype.dispose=function(){FR.W.scene.remove(this.g);if(this.tag)FR.W.scene.remove(this.tag)};

function predict(B,n,dt){var b={p:B.p.slice(),v:B.v.slice()},out=[];for(var i=0;i<n;i++){ballStep(b,dt);out.push({p:b.p.slice(),t:(i+1)*dt})}return out}
function aiInput(G,c,i,mates,dt){var B=G.B,I={t:0,s:0,r:0,boost:false,hb:false,jh:false,climb:0,fly:true,stick:false},dirG=c.team===0?1:-1,oppGoal=[dirG*(A.HX+4),3,0],ownGoal=[-dirG*(A.HX+2),0,0];
 var pred=G.pred,tgt=null,myD=len(sub(B.p,c.p)),att=mates.every(function(o){return o===c||o.dead>0||len(sub(B.p,o.p))>=myD-1});
 var danger=dirG*B.v[0]<-10&&Math.abs(B.p[0]-ownGoal[0])<A.HX*.9;
 if(att||danger){c.role='att';
  for(var k=0;k<pred.length;k+=2){var bp=pred[k].p;if(bp[1]>(c.boost>20?22:8))continue;var toG=nrm(sub(oppGoal,bp)),aim=sub(bp,mul(toG,A.BR+1.6));aim[1]=Math.max(0,bp[1]-2);var dd=len(sub(aim,c.p)),need=dd/(c.boost>10?P.boostV*.8:P.maxV*.85)+.2;if(need<=pred[k].t){tgt=aim;break}}
  if(!tgt){var bp2=pred[Math.min(pred.length-1,40)].p;tgt=sub(bp2,mul(nrm(sub(oppGoal,bp2)),A.BR+2))}}
 else{c.role=mates.indexOf(c)%2?'keep':'mid';tgt=c.role==='keep'?[ownGoal[0]+dirG*18,0,clamp(B.p[2]*.4,-A.GW+2,A.GW-2)]:[(B.p[0]+ownGoal[0])/2,Math.max(0,B.p[1]-4),B.p[2]*.55];
  if(c.boost<30){var best=null,bd=1e9;G.pads.forEach(function(p){if(!p.on)return;var d=Math.hypot(p.x-c.p[0],p.y-c.p[1],p.z-c.p[2]);if(d<bd&&d<50){bd=d;best=p}});if(best)tgt=[best.x,best.y,best.z]}}
 var to=sub(tgt,c.p),r=c.right(),fx=dot(to,c.f),lx=dot(to,r),uy=to[1],ang=Math.atan2(-lx,fx),dist=len(to);
 if(c.gnd){I.s=clamp(ang*2.3,-1,1);I.t=Math.abs(ang)>2.3&&dist<14?-1:1;I.hb=Math.abs(ang)>1.1&&c.speed()>12;I.boost=Math.abs(ang)<.4&&dist>18&&c.boost>5;
  if(c.role==='att'&&len(sub(B.p,c.p))<10&&B.p[1]-c.p[1]>4&&dot(nrm(sub(B.p,c.p)),c.f)>.5){c.wantJ=true;c.aerial=B.p[1]>8&&c.boost>15}}
 else{var want=nrm(sub(B.p,c.p)),lf=dot(want,c.f),lu=dot(want,c.u),lr=dot(want,c.right());
  if(c.aerial||B.p[1]>6){I.t=clamp(-lu*3,-1,1);I.s=clamp(-lr*3,-1,1);I.boost=lf>.4&&c.boost>0;I.climb=clamp(uy*.08,-1,1);I.jh=true}
  else{I.t=clamp(c.f[1]*3,-1,1);I.r=clamp(-c.right()[1]*3,-1,1);I.climb=c.p[1]<2?.4:-.2}}
 if(c.wantJ&&c.gnd){c.wantJ=false;c.jump({})}
 if(c.gnd)c.aerial=false;I.fly=true;return I}

var SKY={id:'skyl',name:'🌌 Sky League',carJump:true,meter:true,ownPhys:true};
var qTmp=null;
SKY.start=function(o){this.o=o;this.mode=o.size||1;this.diff=o.diff||'normal';this.score=[0,0];this.time=300;this.ot=false;this.my=o.team||0;this.rep=[];this.demos=0;this.goals=0;GM.ballCam=true;
 if(!this.G)this.G=buildArena();this.G.visible=true;this.pads=this.G.userData.pads;this.ball=this.G.userData.ball;this.shadow=this.G.userData.shadow;
 FR.hOver=function(x,z){var lx=Math.abs(x-A.CX),lz=Math.abs(z-A.CZ);if(lx>A.HX+A.GD+40||lz>A.HZ+40)return null;return A.Y0};
 if(FR.W.traffic)FR.W.traffic.visible=false;if(window.__skyW)window.__skyW.visible=false;
 this.me=new Car(this.my);this.cars=[this.me];this.bodies=[null];this.B={p:[0,A.BR,0],v:[0,0,0]};
 if(!o.online){var n=this.mode;for(var i=0;i<n*2-1;i++){var team=i<n-1?this.my:1-this.my,c=new Car(team);c.bot=true;c.name=X.NAMES[i];this.cars.push(c);this.bodies.push(new Body(X.BCARS[(i*5+3)%X.BCARS.length],X.COLS[team],c.name,team))}}
 var self=this;FR.physOverride=function(dt){self.phys(dt)};qTmp=qTmp||new (FR.cam.quaternion.constructor)();FR.carQuat=qTmp;
 this.kickoff();X.mkUI();X.ui.boost.style.display='flex';X.ui.touch.style.display=FR.isTouch()?'flex':'none';this.hint=8;X.toast('🌌 Sky League — F free flight · Space jump · Shift boost · Q/E roll · Hold Ctrl suction')};
SKY.kickoff=function(){var spots=[[-32,0],[-46,-18],[-46,18],[-66,0]],mt=[0,0],self=this;this.B={p:[0,A.BR+.02,0],v:[0,0,0]};this.state='kick';this.st=3;
 function spot(team){var sp=spots[(mt[team]++)%spots.length],s=team===0?1:-1;return{p:[sp[0]*s,0,sp[1]],f:[s,0,0]}}
 if(this.o.online)mt[this.my]=this.o.slot||0;var p=spot(this.my);this.me.reset(p.p,p.f);this.me.boost=40;this.me.dead=0;
 this.cars.forEach(function(c){if(c===self.me)return;var q=spot(c.team);c.reset(q.p,q.f);c.boost=40;c.dead=0});
 this.pads.forEach(function(p){p.on=true;p.m.visible=true});this.syncST()};
SKY.input=function(){var I=FR.inp(),K=FR.keys,TI=FR.input,o={t:I.t?1:I.b?-1:0,s:I.s||0,r:0,boost:!!I.boost,hb:!!I.hb,jh:!!(K.Space||TI.jump),climb:0,fly:true,stick:!!(K.ControlLeft||K.ControlRight||TI.hb)};
 if(TI.gas)o.t=1;if(TI.brk)o.t=-1;if(Math.abs(TI.jx||0)>.15)o.s=-TI.jx;if(Math.abs(TI.jy||0)>.25&&!this.me.gnd)o.t=-TI.jy;
 if(K.KeyQ)o.r=-1;if(K.KeyE)o.r=1;
 // F toggles sticky free-flight climb with Space/C
 if(K.Space&&!this.me.gnd)o.climb+=1;if(K.KeyC||K.ControlLeft)o.climb-=(K.KeyC?1:0);if(TI.up)o.climb+=1;if(TI.dn)o.climb-=1;
 if(Math.abs(TI.jy||0)>.2&&!this.me.gnd&&(K.KeyF||this._flyOn))o.climb=-TI.jy;
 o.fly=!!(K.KeyF||this._flyOn||!this.me.gnd);GM.meter=this.me.boost;return o};
SKY.jump=function(){if(GM.frozen||this.state!=='play'&&this.state!=='kick')return;if(this.state==='kick')return;var I=this.input();this.me.jump(I)};
SKY.syncST=function(){var c=this.me,m=c.mat(),e=euler(m);ST.x=c.p[0]+A.CX;ST.y=c.p[1]+A.Y0;ST.z=c.p[2]+A.CZ;ST.pitch=e[0];ST.yaw=e[1];ST.roll=e[2];ST.vx=c.v[0];ST.vy=c.v[1];ST.vz=c.v[2];ST.vL=dot(c.v,c.f);ST.vT=0;ST.kmh=Math.round(len(c.v)*3.6);ST.air=!c.gnd;ST.boost=c.boosting;ST.spin=c.spin*.36;ST.steer=0;ST.fly=!c.gnd;quatOf(m,qTmp)};
SKY.phys=function(dt){if(!this.state)return;var self=this,fz=this.state==='kick'||this.state==='replay'||this.state==='over';
 if(this.state==='replay'){this.syncST();return}
 var I=this.autoMe&&this.state==='play'?aiInput(this,this.me,0,this.cars.filter(function(o){return o.team===self.me.team})):this.input();
 if(this.autoMe&&!this.pred)this.pred=predict(this.B,90,1/30);this.me.step(dt,I,fz);
 if(this.state==='play'&&!this.o.online){this.pred=predict(this.B,90,1/30);this.cars.forEach(function(c,i){if(!c.bot)return;var mates=self.cars.filter(function(o){return o.team===c.team});c.step(dt,aiInput(self,c,i,mates,dt),false)})}
 else this.cars.forEach(function(c){if(c.bot)c.step(dt,{},true)});
 this.syncST();
 var Pl=FR.W.pool;this.cars.forEach(function(c){if((c.boosting||(!c.gnd&&c.fly))&&Pl&&c.dead<=0){var b=add(c.p,add(mul(c.f,-2.4),mul(c.u,.7)));Pl.emit(b[0]+A.CX,b[1]+A.Y0,b[2]+A.CZ,-c.f[0]*10,-c.f[1]*10,-c.f[2]*10,.4,1.6,.35,c.team?0xff8a2a:0x4aa8ff,1,true)}})};
SKY.frame=function(dt){var self=this,B=this.B,net=this.o.online,host=!net||GM.mp.host===X.NET().id,now=performance.now()/1000;
 if(this.hint>0)this.hint-=dt;
 // F key sticky fly
 if(FR.keys.KeyF&&!this._fLatch){this._flyOn=!this._flyOn;this._fLatch=true;X.toast(this._flyOn?'✈️ Thrusters ON — Space climb · C descend':'🚗 Thrusters OFF')}
 if(!FR.keys.KeyF)this._fLatch=false;
 this.pads.forEach(function(p){if(!p.on){p.t-=dt;if(p.t<=0){p.on=true;p.m.visible=true}}else{p.m.rotation.y+=dt*2.2;p.m.position.y=p.y+(p.big?2.2:1.1)+Math.sin(now*3+p.x)*.2;
  self.cars.forEach(function(c){if(!p.on||c.dead>0||c.boost>=100)return;if(Math.hypot(c.p[0]-p.x,c.p[1]-p.y,c.p[2]-p.z)<p.r){c.boost=p.big?100:Math.min(100,c.boost+14);p.on=false;p.m.visible=false;p.t=p.big?9:3.5}})}});
 if(this.state==='replay'){this.replay(dt);this.draw(dt);return}
 if(this.state==='kick'){this.st-=dt;var c=Math.ceil(this.st);X.countdown(c>0?String(c):'GO!');if(this.st<=0){this.state='play';setTimeout(function(){if(self.state==='play')X.countdown('')},500)}}
 else if(this.state==='play'&&host){this.time-=this.ot?-dt:dt}
 if(this.state==='play'){for(var i=0;i<this.cars.length;i++)for(var j=i+1;j<this.cars.length;j++)this.bump(this.cars[i],this.cars[j]);
  var touched=false;this.cars.forEach(function(c){if(c.bot||c===self.me){if(hitBall(B,c)&&c===self.me)touched=true}});
  if(touched&&net&&!host)X.send({k:'kick',p:B.p.map(function(x){return+x.toFixed(2)}),v:B.v.map(function(x){return+x.toFixed(2)})});
  var goal=ballStep(B,dt);if(host&&goal>=0)this.goal(goal)}
 this.draw(dt);
 this.rep.push({b:B.p.slice(),c:this.cars.map(function(c){return[c.p.slice(),c.f.slice(),c.u.slice(),c.dead]})});if(this.rep.length>220)this.rep.shift();
 if(net&&host){this.tx=(this.tx||0)-dt;if(this.tx<=0){this.tx=1/15;X.send({k:'ball',p:[+(B.p[0]+A.CX).toFixed(2),+(B.p[1]+A.Y0).toFixed(2),+(B.p[2]+A.CZ).toFixed(2)],v:B.v.map(function(x){return+x.toFixed(2)}),s:this.score,tm:Math.round(this.time),st:this.state,ot:this.ot})}}
 if(host&&this.state==='play'&&!this.ot&&this.time<=0&&B.p[1]<A.BR+2){if(this.score[0]===this.score[1]){this.ot=true;this.time=0;X.toast('⏱ OVERTIME — next goal wins!')}else this.finish()}
 this.hud()};
SKY.bump=function(a,b){if(a.dead>0||b.dead>0)return;var d=sub(b.center(),a.center()),l=len(d);if(l>3.2||l<1e-3)return;var n=mul(d,1/l),rel=dot(sub(a.v,b.v),n);
 a.p=madd(a.p,n,-(3.2-l)/2);b.p=madd(b.p,n,(3.2-l)/2);
 if(a.team!==b.team){if(a.speed()>P.supersonic&&rel>18){this.demo(b,a);return}if(b.speed()>P.supersonic&&-rel>18){this.demo(a,b);return}}
 if(rel>0){a.v=madd(a.v,n,-rel*.7);b.v=madd(b.v,n,rel*.9);b.v[1]+=rel*.15;if(b.gnd&&rel>8)b.gnd=false}};
SKY.demo=function(victim,by){X.boom(victim.p[0]+A.CX,victim.p[1]+1+A.Y0,victim.p[2]+A.CZ,0xff5020,70);victim.dead=3;FR.shake=.6;if(by===this.me){this.demos++;X.toast('💥 DEMOLITION! '+(victim.name||''))}
 var self=this,tm=victim.team;setTimeout(function(){if(!self.state)return;var s=tm===0?-1:1;victim.reset([s*(A.HX-20),0,(Math.random()-.5)*30],[-s,0,0]);victim.boost=40;victim.dead=0},3000)};
SKY.draw=function(dt){var B=this.B,self=this;this.ball.position.set(B.p[0],B.p[1],B.p[2]);var sp=len(B.v);if(sp>.1){var ax=nrm(cross([0,1,0],B.v));if(len(ax)>.1){var q=this.ball.quaternion,ang=sp*dt/A.BR,h=Math.sin(ang/2);var dq=new (q.constructor)(ax[0]*h,ax[1]*h,ax[2]*h,Math.cos(ang/2));q.premultiply(dq)}}
 this.shadow.position.set(B.p[0],.06,B.p[2]);this.shadow.scale.setScalar(Math.max(.3,1-B.p[1]/(A.H*1.2)));
 this.cars.forEach(function(c,i){if(self.bodies[i])self.bodies[i].sync(c,dt)});
 var c=FR.getCar();if(c)c.g.visible=this.me.dead<=0;
 this.sbT=(this.sbT||0)-dt;if(this.sbT<=0){this.sbT=.5;drawSB(this.G,this.score,this.time,this.ot)}};
SKY.hud=function(){var me=this.my,n=this.o.online?(GM.mp.list||[]).map(function(p){return '<b style="color:'+X.COLS[p.team]+'">'+X.esc(p.n)+'</b>'}).join(' · '):(this.mode+'v'+this.mode+' vs bots');
 X.hudSet('<div class="b">'+this.score[0]+'</div><div class="tm">'+(this.ot?'+':'')+X.fmtT(Math.abs(this.time))+'</div><div class="o">'+this.score[1]+'</div>','🌌 You: <b style="color:'+X.COLS[me]+'">'+(me?'ORANGE':'BLUE')+'</b> · '+n+(this._flyOn?' · ✈️ FLY':'')+(FR.isTouch()?'':' · F thrusters · Space jump/climb · Shift boost · Q/E roll · Ctrl suction · B ball cam'));
 X.ui.boost.style.setProperty('--b',this.me.boost);X.ui.boost.firstChild.textContent=Math.round(this.me.boost)};
SKY.goal=function(team,remote){var gx=(team===0?1:-1)*(A.HX+4);this.score[team]++;X.boom(gx+A.CX,4+A.Y0,A.CZ,team===0?0x2f7bff:0xff8a1f,180);X.boom(gx+A.CX,9+A.Y0,A.CZ,0xffffff,80);FR.shake=1.1;
 X.countdown((team===0?'BLUE':'ORANGE')+' SCORES!',true);if(team===this.my&&this.B.last===this.me)this.goals++;
 if(this.o.online&&!remote)X.send({k:'goal',team:team,s:this.score});this.state='replay';this.repI=Math.max(0,this.rep.length-120);this.repT=0;drawSB(this.G,this.score,this.time,this.ot);
 if(this.ot){var self=this;setTimeout(function(){self.finish()},2600)}};
SKY.replay=function(dt){this.repT+=dt;var f=this.rep[Math.min(this.rep.length-1,Math.floor(this.repI))];this.repI+=dt*30*.55;var self=this;
 if(f){this.B.p=f.b.slice();this.cars.forEach(function(c,i){var q=f.c[i];if(q){c.p=q[0].slice();c.f=q[1].slice();c.u=q[2].slice();c.dead=q[3]}});this.B.v=[0,0,0]}
 if(this.repT>1)X.countdown('REPLAY',true);
 if(this.repT>4.6||this.repI>=this.rep.length-1){X.countdown('');this.rep=[];if(this.state!=='over')this.kickoff()}};
SKY.cam=function(){if(FR.foot&&FR.foot.on)return;var cam=FR.cam,c=this.me,B=this.B,wp=[c.p[0]+A.CX,c.p[1]+A.Y0,c.p[2]+A.CZ],bp=[B.p[0]+A.CX,B.p[1]+A.Y0,B.p[2]+A.CZ];
 var up=c.gnd?nrm(add(mul(c.u,.65),[0,.35,0])):[0,1,0],pos,look;
 if(this.state==='replay'){pos=[bp[0]+Math.sin(this.repT*.4)*24,Math.max(A.Y0+6,bp[1]+6),bp[2]+Math.cos(this.repT*.4)*24];look=bp}
 else if(GM.ballCam){var d=sub(bp,wp);d[1]*=.4;d=nrm(d);pos=add(add(wp,mul(d,-12)),mul(up,4));look=add(add(wp,mul(d,6)),[0,1.4,0]);var bl=sub(bp,wp);if(len(bl)<70)look=add(mul(look,.45),mul(add(bp,[0,-1,0]),.55))}
 else{var f=c.gnd?c.f:nrm([c.v[0],c.v[1]*.45,c.v[2]]);if(!c.gnd&&len(c.v)<3)f=c.f;pos=add(add(wp,mul(f,-11)),mul(up,3.8));look=add(add(wp,mul(f,5)),mul(up,1.3))}
 var lp=LA(pos[0],pos[1],pos[2]),sd=sdfA(lp);if(sd.d<1.4)pos=add(pos,mul(sd.n,1.4-sd.d));
 this._c=this._c||pos.slice();var k=this.state==='replay'?.08:.2;for(var i=0;i<3;i++)this._c[i]+=(pos[i]-this._c[i])*k;
 cam.position.set(this._c[0],this._c[1],this._c[2]);cam.up.set(0,1,0);cam.lookAt(look[0],look[1],look[2]);cam.fov=FR.isTouch()?80:74;cam.updateProjectionMatrix();if(FR.W.camPos)FR.W.camPos.copy(cam.position)};
SKY.finish=function(){if(this.state==='over')return;this.state='over';var w=this.score[0]===this.score[1]?-1:this.score[0]>this.score[1]?0:1;if(this.o.online&&GM.mp.host===X.NET().id)X.send({k:'end',s:this.score});
 var best=+(localStorage.getItem('uae_skyl_wins')||0);if(w===this.my)localStorage.setItem('uae_skyl_wins',best+1);
 X.results(w<0?'Draw':w===this.my?'🏆 You win!':'Defeat',['Score: BLUE '+this.score[0]+' – '+this.score[1]+' ORANGE','Your goals: '+this.goals,'Demolitions: '+this.demos,'Flips: '+((GM.stat&&GM.stat.flips)||0)],'Sky League wins: '+(+(localStorage.getItem('uae_skyl_wins')||0)))};
SKY.onMsg=function(m){var B=this.B,host=GM.mp.host===X.NET().id;if(m.k==='ball'&&!host){var p=[m.p[0]-A.CX,m.p[1]-A.Y0,m.p[2]-A.CZ];for(var i=0;i<3;i++)B.p[i]+=(p[i]-B.p[i])*.6;B.v=m.v.slice();this.score=m.s;this.time=m.tm;this.ot=m.ot;if(m.st==='play'&&this.state==='kick'&&this.st>1)this.st=Math.min(this.st,1)}
 if(m.k==='kick'&&host){if(Array.isArray(m.v))B.v=m.v.map(function(x){return clamp(+x||0,-78,78)})}
 if(m.k==='goal'&&!host){this.score=[0,0];this.score[m.team]=m.s[m.team]-1;this.score[1-m.team]=m.s[1-m.team];this.goal(m.team,true)}
 if(m.k==='end'&&!host){this.score=m.s;this.finish()}};
SKY.end=function(){this.state=null;FR.physOverride=null;FR.carQuat=null;if(this.G)this.G.visible=false;FR.hOver=null;(this.bodies||[]).forEach(function(b){if(b)b.dispose()});this.bodies=[];this.cars=[];
 var c=FR.getCar();if(c){c.g.visible=true;c.g.quaternion.set(0,0,0,1)}ST.pitch=ST.roll=0;ST.y=FR.heightAt(ST.x,ST.z);ST.fly=false;if(X.ui.boost){X.ui.boost.style.display='none';X.ui.touch.style.display='none'}X.countdown('');if(FR.W.traffic)FR.W.traffic.visible=true};

/* ===================== AERO WORLD (open-world free flight) =====================
   Inspired by Flying Tesla Roadster open world, fully original UAE sky map:
   - Burj Spire (tower race), Gulf Loop, Cube Stages, Sky Sphere, Mega Ramp,
     Falcon Arch, Cargo Jet hangar, floating islands, boost rings, Golden Bolts.
*/
var W0={OX:900,OY:380,OZ:-900}; // world origin (sky above desert SE of city)
var POI=[]; // {id,name,x,y,z,r,kind}
function signBoard(t,txt,sub,w,h,bg){var c=document.createElement('canvas');c.width=512;c.height=160;var g=c.getContext('2d');
 g.fillStyle=bg||'#0a1e4a';g.fillRect(0,0,512,160);g.strokeStyle='#f3d77a';g.lineWidth=8;g.strokeRect(4,4,504,152);
 g.fillStyle='#fff';g.font='bold 48px Arial';g.textAlign='center';g.fillText(txt,256,70);g.fillStyle='#f3d77a';g.font='bold 28px Arial';g.fillText(sub||'',256,120);
 var tx=new t.CanvasTex(c);tx.colorSpace=t.SRGB;return new t.Mesh(new t.Plane(w,h),new t.Basic({map:tx,side:2}))}
function buildWorld(){var t=T(),G=new t.Group();G.position.set(W0.OX,0,W0.OZ);POI=[];var _sr=987654321;function rnd(){_sr^=_sr<<13;_sr^=_sr>>>17;_sr^=_sr<<5;return ((_sr>>>0)/4294967296)};
 var steel=new t.Std({color:0xb8c4d0,metalness:.85,roughness:.28}),gold=new t.Std({color:0xd4af37,metalness:.7,roughness:.3,emissive:0x804000,emissiveIntensity:.4});
 var glass=new t.Std({color:0x5a9ad4,metalness:.6,roughness:.12,transparent:true,opacity:.55}),white=new t.Std({color:0xf2f4f8,roughness:.4});
 var neonB=new t.Std({color:0x2f7bff,emissive:0x2f7bff,emissiveIntensity:2.8}),neonO=new t.Std({color:0xff8a1f,emissive:0xff8a1f,emissiveIntensity:2.8});
 var sand=new t.Std({color:0xd8c39a,roughness:.92}),padM=new t.Std({color:0x2a3348,metalness:.5,roughness:.4});
 // hub island
 var hub=new t.Mesh(new t.Cyl(48,52,6,40),sand);hub.position.set(0,W0.OY-3,0);G.add(hub);
 var hubPad=new t.Mesh(new t.Cyl(22,22,.4,32),padM);hubPad.position.set(0,W0.OY+.2,0);G.add(hubPad);
 var hubRing=new t.Mesh(new t.Cyl(24,24,.15,48,1,true),gold);hubRing.position.set(0,W0.OY+.5,0);G.add(hubRing);
 var sg=signBoard(t,'AERO WORLD','عالم الطيران · UAE Sky',18,5.5);sg.position.set(0,W0.OY+10,18);G.add(sg);
 POI.push({id:'hub',name:'Aero Hub',x:W0.OX,y:W0.OY,z:W0.OZ,r:30,kind:'hub'});

 // --- BURJ SPIRE: 7-lap spiral tower race (original) ---
 var spire=new t.Group(),Hsp=280,R0=28;
 for(var i=0;i<56;i++){var h=i*(Hsp/56),rr=R0*(1-i/70),seg=new t.Mesh(new t.Box(rr*1.6,Hsp/56+.2,8),i%4?white:glass);seg.position.set(0,W0.OY+h,0);spire.add(seg);
  var ang=i/56*Math.PI*14,track=new t.Mesh(new t.Box(14,.6,5),padM);track.position.set(Math.cos(ang)*(rr+10),W0.OY+h+.4,Math.sin(ang)*(rr+10));track.rotation.y=-ang;spire.add(track);
  if(i%4===0){var lite=new t.Mesh(new t.Box(14.2,.15,.3),i%8?neonB:neonO);lite.position.copy(track.position);lite.position.y+=.4;lite.rotation.y=-ang;spire.add(lite)}}
 var tip=new t.Mesh(new t.Cone(4,18,10),gold);tip.position.set(0,W0.OY+Hsp+8,0);spire.add(tip);
 spire.position.set(180,0,-40);G.add(spire);
 var ss=signBoard(t,'BURJ SPIRE','برج السماء · 7-lap climb',16,5,'#1a0a30');ss.position.set(180,W0.OY+12,-40+36);G.add(ss);
 POI.push({id:'spire',name:'Burj Spire',x:W0.OX+180,y:W0.OY,z:W0.OZ-40,r:45,kind:'race'});

 // --- GULF LOOP: tube tunnel you can ride the ceiling of ---
 var loop=new t.Group(),LR=22,LL=220;
 for(var j=0;j<48;j++){var a=j/48*Math.PI*2,tube=new t.Mesh(new t.Box(4.5,4.5,LL/24),j%3?steel:glass);
  // bent into a big horizontal U then vertical loop
  var tprog=j/48,px=Math.sin(tprog*Math.PI*2)*60,py=W0.OY+20+Math.max(0,Math.sin(tprog*Math.PI*2))*35,pz=-120+tprog*LL*.35;
  tube.position.set(px,py,pz);tube.lookAt(Math.sin((j+1)/48*Math.PI*2)*60,py,pz+2);loop.add(tube)}
 // simpler torus loop for ceiling drive
 for(var k=0;k<36;k++){var a2=k/36*Math.PI*2,Rbig=38,rt=9;
  var qx=Math.cos(a2)*Rbig,qy=W0.OY+28+Math.sin(a2)*Rbig,qz=-160;
  var panel=new t.Mesh(new t.Box(rt*1.4,1.2,rt*1.4),k%2?steel:neonB);panel.position.set(qx,qy,qz);panel.lookAt(0,W0.OY+28,qz);loop.add(panel)}
 loop.position.set(-160,0,0);G.add(loop);
 var ls=signBoard(t,'GULF LOOP','حلقة الخليج · ride the ceiling',16,5,'#0a3040');ls.position.set(-160,W0.OY+14,-100);G.add(ls);
 POI.push({id:'loop',name:'Gulf Loop',x:W0.OX-160,y:W0.OY+28,z:W0.OZ-160,r:50,kind:'stunt'});

 // --- CUBE STAGES: 5 stacked Trackmania-style floors ---
 var cube=new t.Group();
 for(var fl=0;fl<5;fl++){var fy=W0.OY+fl*22,floor=new t.Mesh(new t.Box(50,.8,50),padM);floor.position.set(0,fy,0);cube.add(floor);
  // ramps + gaps per floor
  for(var r=0;r<4;r++){var ramp=new t.Mesh(new t.Box(10,.6,18),steel);ramp.position.set((r%2?1:-1)*14,fy+3,(r<2?-1:1)*8);ramp.rotation.x=(r%2?.35:-.35);cube.add(ramp)}
  var wall=new t.Mesh(new t.Box(50,8,.6),new t.Std({color:fl%2?0x2f7bff:0xff8a1f,emissive:fl%2?0x2f7bff:0xff8a1f,emissiveIntensity:2,transparent:true,opacity:.35}));wall.position.set(0,fy+4,25);cube.add(wall);
  var boost=new t.Mesh(new t.Sphere(1.4,12,10),gold);boost.position.set(0,fy+3,0);cube.add(boost)}
 var roof=new t.Mesh(new t.Box(52,1,52),glass);roof.position.set(0,W0.OY+5*22,0);cube.add(roof);
 cube.position.set(-80,0,200);G.add(cube);
 var cs=signBoard(t,'THE CUBE','المكعب · 5 stage parkour',14,4.5,'#201040');cs.position.set(-80,W0.OY+12,230);G.add(cs);
 POI.push({id:'cube',name:'The Cube',x:W0.OX-80,y:W0.OY,z:W0.OZ+200,r:40,kind:'parkour'});

 // --- SKY SPHERE: giant driveable globe ---
 var sphR=42,sph=new t.Mesh(new t.Sphere(sphR,36,24),new t.Std({color:0x3a6ea5,metalness:.4,roughness:.35,transparent:true,opacity:.55,emissive:0x102040,emissiveIntensity:.5,side:2}));
 sph.position.set(220,W0.OY+sphR+8,180);G.add(sph);
 // equator track
 for(var e=0;e<48;e++){var ae=e/48*Math.PI*2,tr=new t.Mesh(new t.Box(6,.5,4),gold);tr.position.set(220+Math.cos(ae)*(sphR+1),W0.OY+sphR+8,180+Math.sin(ae)*(sphR+1));tr.lookAt(220,W0.OY+sphR+8,180);G.add(tr)}
 var sps=signBoard(t,'SKY SPHERE','الكرة السماوية',14,4.5);sps.position.set(220,W0.OY+12,180+sphR+20);G.add(sps);
 POI.push({id:'sphere',name:'Sky Sphere',x:W0.OX+220,y:W0.OY+sphR+8,z:W0.OZ+180,r:55,kind:'stunt'});

 // --- FALCON ARCH (Gateway Arch homage, UAE falcon) ---
 var arch=new t.Group();
 for(var a=0;a<40;a++){var tA=a/39,angA=Math.PI*tA,ax=Math.cos(angA)*55,ay=Math.sin(angA)*70,segA=new t.Mesh(new t.Box(8,4,8),a%5?steel:gold);
  segA.position.set(ax,W0.OY+ay,0);segA.rotation.z=angA-Math.PI/2;arch.add(segA)}
 arch.position.set(40,0,-280);G.add(arch);
 var as=signBoard(t,'FALCON ARCH','قوس الصقر',14,4.5,'#2a1808');as.position.set(40,W0.OY+12,-250);G.add(as);
 POI.push({id:'arch',name:'Falcon Arch',x:W0.OX+40,y:W0.OY,z:W0.OZ-280,r:60,kind:'stunt'});

 // --- MEGA RAMP ---
 var rampG=new t.Group();
 var rampBase=new t.Mesh(new t.Box(40,2,80),padM);rampBase.position.set(0,W0.OY+1,0);rampG.add(rampBase);
 for(var ri=0;ri<12;ri++){var rr2=new t.Mesh(new t.Box(36,.8,8),steel);rr2.position.set(0,W0.OY+2+ri*ri*.35, -30+ri*7);rr2.rotation.x=-ri*.06;rampG.add(rr2)}
 var lip=new t.Mesh(new t.Box(36,1,10),neonO);lip.position.set(0,W0.OY+55,55);lip.rotation.x=-.9;rampG.add(lip);
 rampG.position.set(300,0,-80);G.add(rampG);
 var mrs=signBoard(t,'MEGA RAMP','منصة الإطلاق · launch & flip',14,4.5,'#401808');mrs.position.set(300,W0.OY+14,-40);G.add(mrs);
 POI.push({id:'ramp',name:'Mega Ramp',x:W0.OX+300,y:W0.OY,z:W0.OZ-80,r:45,kind:'stunt'});

 // --- CARGO JET (fly into) ---
 var jet=new t.Group();
 var fus=new t.Mesh(new t.Cyl(7,9,70,16),white);fus.rotation.z=Math.PI/2;fus.position.set(0,W0.OY+18,0);jet.add(fus);
 var wing=new t.Mesh(new t.Box(8,1.2,55),steel);wing.position.set(0,W0.OY+16,0);jet.add(wing);
 var tail=new t.Mesh(new t.Box(12,10,1.5),steel);tail.position.set(-32,W0.OY+24,0);jet.add(tail);
 var door=new t.Mesh(new t.Box(1,10,12),neonB);door.position.set(34,W0.OY+18,0);jet.add(door);
 // interior floor so you can drive in
 var infl=new t.Mesh(new t.Box(60,.4,12),padM);infl.position.set(0,W0.OY+11.5,0);jet.add(infl);
 jet.position.set(-280,8,80);G.add(jet);
 var js=signBoard(t,'CARGO JET','طائرة الشحن · fly inside',14,4.5);js.position.set(-280,W0.OY+28,100);G.add(js);
 POI.push({id:'jet',name:'Cargo Jet',x:W0.OX-280,y:W0.OY+18,z:W0.OZ+80,r:40,kind:'secret'});

 // floating islands + boost rings + golden bolts
 var rings=[],bolts=[];
 for(var ii=0;ii<10;ii++){var ix=(rnd()-.5)*700,iz=(rnd()-.5)*700,iy=W0.OY+20+rnd()*80;
  if(Math.hypot(ix,iz)<60)continue;
  var isl=new t.Mesh(new t.Cyl(8+rnd()*10,10+rnd()*8,3,16),sand);isl.position.set(ix,iy,iz);G.add(isl);
  var ip=new t.Mesh(new t.Cyl(5,5,.3,16),padM);ip.position.set(ix,iy+1.7,iz);G.add(ip)}
 for(var rr=0;rr<28;rr++){var rx=(rnd()-.5)*650,rz=(rnd()-.5)*650,ry=W0.OY+15+rnd()*120;
  var ring=new t.Group();var rm=new t.Std({color:0x7ec8ff,emissive:0x3a9fff,emissiveIntensity:2.5,metalness:.4,roughness:.3});
  var outer=new t.Mesh(new t.Cyl(5.4,5.4,.9,24,1,true),rm);var inner=new t.Mesh(new t.Cyl(4.2,4.2,.9,24,1,true),rm);ring.add(outer);ring.add(inner);
  ring.position.set(rx,ry,rz);ring.rotation.y=rnd()*6;G.add(ring);rings.push({m:ring,x:W0.OX+rx,y:ry,z:W0.OZ+rz,got:false})}
 for(var gb=0;gb<15;gb++){var bx=(rnd()-.5)*600,bz=(rnd()-.5)*600,by=W0.OY+10+rnd()*100;
  var bolt=new t.Group();var b1=new t.Mesh(new t.Cone(1.4,1.8,6),gold);b1.position.y=.9;var b2=new t.Mesh(new t.Cone(1.4,1.8,6),gold);b2.rotation.x=Math.PI;b2.position.y=-.9;bolt.add(b1);bolt.add(b2);bolt.position.set(bx,by,bz);G.add(bolt);bolts.push({m:bolt,x:W0.OX+bx,y:by,z:W0.OZ+bz,got:false})}

 // sky League portal pad near hub
 var portal=new t.Mesh(new t.Cyl(8,8,.5,24),neonB);portal.position.set(35,W0.OY+.5,0);G.add(portal);
 var ps=signBoard(t,'⚽ SKY LEAGUE','enter ball arena',12,4,'#0a2040');ps.position.set(35,W0.OY+8,12);G.add(ps);
 POI.push({id:'arena',name:'Sky League Portal',x:W0.OX+35,y:W0.OY,z:W0.OZ,r:12,kind:'portal'});

 // stars / nebula backdrop billboards
 for(var st=0;st<6;st++){var starC=canvasTex(512,512,function(g,w,h){g.fillStyle='#020510';g.fillRect(0,0,w,h);for(var i=0;i<200;i++){g.fillStyle='rgba(255,255,255,'+(Math.random()*.9)+')';g.fillRect(Math.random()*w,Math.random()*h,Math.random()*2.5,Math.random()*2.5)}
  g.fillStyle='rgba(80,120,255,.15)';g.beginPath();g.arc(w*.3,h*.4,80,0,7);g.fill();g.fillStyle='rgba(255,140,40,.12)';g.beginPath();g.arc(w*.7,h*.6,60,0,7);g.fill()});
  var bill=new t.Mesh(new t.Plane(400,400),new t.Basic({map:starC,transparent:true,opacity:.7,depthWrite:false,side:2}));
  var sang=st/6*Math.PI*2;bill.position.set(Math.cos(sang)*500,W0.OY+80,Math.sin(sang)*500);bill.lookAt(0,W0.OY,0);G.add(bill)}

 G.userData={rings:rings,bolts:bolts,poi:POI};FR.W.scene.add(G);window.__skyW=G;return G}

var WORLD={id:'aerow',name:'✈️ Aero World',carJump:false,meter:true,ownPhys:true,soloOnly:false};
var wq=null;
WORLD.start=function(o){this.o=o||{};this.rings=0;this.bolts=0;this.time=0;this.tricks=0;this.near=null;
 if(!this.G)this.G=buildWorld();this.G.visible=true;if(SKY.G)SKY.G.visible=false;
 if(FR.W.traffic)FR.W.traffic.visible=false;
 // place player at hub, flight on
 ST.x=W0.OX;ST.z=W0.OZ+8;ST.y=W0.OY+4;ST.yaw=Math.PI;ST.vx=ST.vz=ST.vy=0;ST.vL=0;ST.vT=0;ST.fly=true;ST.air=true;ST.camYaw=Math.PI;
 FR.hOver=function(x,z){var dx=x-W0.OX,dz=z-W0.OZ;if(Math.hypot(dx,dz)<52)return W0.OY;
  // rough pads at known POIs
  var PL=(window.__skyPOI||POI||[]);for(var i=0;i<PL.length;i++){var p=PL[i];if(p.kind==='hub'||p.kind==='portal')continue;if(Math.hypot(x-p.x,z-p.z)<(p.r*.45))return p.y||W0.OY}
  return null};
 var self=this;FR.physOverride=null; // use freeroam flight physics
 // force fly
 if(!ST.fly)FR.toggleFly&&FR.toggleFly();
 ST.fly=true;ST.y=Math.max(ST.y,W0.OY+3);
 X.mkUI();X.ui.boost.style.display='none';X.ui.touch.style.display=FR.isTouch()?'flex':'none';
 this.state='play';X.toast('✈️ Aero World — free flight UAE sky. Visit Spire · Loop · Cube · Sphere · Arch · Ramp · Jet. Rings & Golden Bolts!');
 this.hint=10};
WORLD.frame=function(dt){if(this.state!=='play')return;this.time+=dt;
 if(!ST.fly){ST.fly=true;ST.air=true}
 // collect rings
 var rings=this.G.userData.rings,bolts=this.G.userData.bolts,self=this;
 rings.forEach(function(r){if(r.got)return;r.m.rotation.y+=dt*1.5;if(Math.hypot(ST.x-r.x,ST.y-r.y,ST.z-r.z)<6){r.got=true;r.m.visible=false;self.rings++;X.boom(r.x,r.y,r.z,0x4aa8ff,40);X.toast('🔵 Boost ring '+self.rings+'/28')}});
 bolts.forEach(function(b){if(b.got)return;b.m.rotation.y+=dt*2;b.m.rotation.x+=dt;if(Math.hypot(ST.x-b.x,ST.y-b.y,ST.z-b.z)<4){b.got=true;b.m.visible=false;self.bolts++;X.boom(b.x,b.y,b.z,0xf3d77a,50);X.toast('⚡ Golden Bolt '+self.bolts+'/15')}});
 // POI proximity
 var near=null;var POIL=(this.G&&this.G.userData&&this.G.userData.poi)||window.__skyPOI||[];POIL.forEach(function(p){if(Math.hypot(ST.x-p.x,ST.z-p.z)<p.r&&Math.abs(ST.y-p.y)<40)near=p});
 if(near&&near!==this.near){this.near=near;X.toast('📍 '+near.name+(near.kind==='portal'?' — press E for Sky League':''))}
 if(!near)this.near=null;
 // E at portal -> sky league
 if(this.near&&this.near.kind==='portal'&&FR.keys.KeyE&&!this._eLatch){this._eLatch=true;GM.stop(false);setTimeout(function(){GM.start('skyl',{size:1})},200)}
 if(!FR.keys.KeyE)this._eLatch=false;
 // trick scoring: flips while flying fast
 if(ST.fly&&Math.abs(ST.vL)>20&&Math.abs(ST.pitch)>.8){this._tr=(this._tr||0)+dt;if(this._tr>.4){this.tricks++;this._tr=0}}
 this.hud()};
WORLD.hud=function(){X.hudSet('<div class="tm" style="font-size:22px">✈️ AERO WORLD</div>','Rings <b>'+this.rings+'/28</b> · Bolts <b>'+this.bolts+'/15</b> · Tricks <b>'+this.tricks+'</b> · '+(this.near?('📍 '+this.near.name):'Explore the sky')+' · Esc exit · F flight · Shift boost');
 if(X.ui.hud)X.ui.hud.style.display='flex'};
WORLD.cam=function(){/* freeroam cam handles flight */};
WORLD.onMsg=function(){};
WORLD.end=function(){this.state=null;if(this.G)this.G.visible=false;FR.hOver=null;ST.fly=false;X.countdown('');
 if(X.ui.boost)X.ui.boost.style.display='none';if(X.ui.touch)X.ui.touch.style.display='none';if(FR.W.traffic)FR.W.traffic.visible=true;
 localStorage.setItem('uae_aero_rings',String(Math.max(+(localStorage.getItem('uae_aero_rings')||0),this.rings||0)));
 localStorage.setItem('uae_aero_bolts',String(Math.max(+(localStorage.getItem('uae_aero_bolts')||0),this.bolts||0)))};

/* ===================== register ===================== */
GM.SKY=SKY;GM.AERO=WORLD;GM.SKYA=A;
// put new modes first in the games menu
GM.GAMES.skyl=SKY;GM.GAMES.aerow=WORLD;

if(GM._x){/* patch menu descriptions + buttons */}
// also put DESC on a shared object games.js reads — monkeypatch render by wrapping start ids
var _start=GM.start;GM.start=function(id,o){if(id==='skyl'||id==='aerow'){if(!FR.active&&FR.enter)FR.enter();if(GM.cur)GM.stop(false);GM.last={id:id,o:o||{}};GM.stat={flips:0};GM.cur=GM.GAMES[id];GM.meter=100;GM.frozen=false;
 try{GM.cur.start(o||{})}catch(e){console.error('game start',id,e);GM.cur=null;X.toast('Game failed');return}
 X.mkUI();if(X.ui.ctl)X.ui.ctl.style.display='flex';if(X.ui.menu)X.ui.menu.style.display='none';if(X.ui.res)X.ui.res.style.display='none';X.toast(GM.cur.name);return}
 return _start(id,o)};
// key: Space jump in skyl
var prevKey=FR.keyHook;FR.keyHook=function(c,e){
 if(GM.cur===SKY&&c==='Space'&&e&&!e.repeat&&!(FR.foot&&FR.foot.on)){SKY.jump();return true}
 if(GM.cur===SKY&&c==='KeyB'){GM.ballCam=!GM.ballCam;return true}
 return prevKey?prevKey(c,e):false};
console.log('[P7] Sky League + Aero World ready');
})();

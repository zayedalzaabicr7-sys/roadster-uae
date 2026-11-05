/* Roadster Dash UAE — P6 realistic characters: CC0 rigged human ("Animated Men Pack" by Quaternius) with CPU skinning + skeletal
   animation (idle/walk/run/jump/punch/aim/ko/sit), dressed with original kandoora / ghutra+agal / abaya+shayla meshes. */
(function(){'use strict';
var CH=window.__chr;if(!CH||!CH.build)return;var OLD=CH.build,M=null,LOADING=false;
function load(){if(M||LOADING)return;LOADING=true;fetch('models/human.glb?v=p6').then(function(r){if(!r.ok)throw new Error(r.status);return r.arrayBuffer()}).then(function(buf){M=parse(buf);var go=function(){if(cls())window.dispatchEvent(new Event('chr-ready'));else setTimeout(go,500)};go()}).catch(function(e){console.info('human.glb',e);LOADING=false;setTimeout(load,4000)})}
function parse(buf){var dv=new DataView(buf),jl=dv.getUint32(12,true),J=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,jl))),bo=20+jl+8;
 function acc(i){var a=J.accessors[i],bv=J.bufferViews[a.bufferView],n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type],C={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType],off=bo+(bv.byteOffset||0)+(a.byteOffset||0),es=n*C.BYTES_PER_ELEMENT,st=bv.byteStride||es;
  if(st===es)return new C(buf.slice(off,off+a.count*es));var out=new C(a.count*n),src=new DataView(buf),rd=C===Float32Array?'getFloat32':C===Uint16Array?'getUint16':C===Uint32Array?'getUint32':'getUint8';for(var i=0;i<a.count;i++)for(var j=0;j<n;j++)out[i*n+j]=src[rd](off+i*st+j*C.BYTES_PER_ELEMENT,true);return out}
 var skin=J.skins[0],meshNode=J.nodes.filter(function(n){return n.mesh!=null&&n.skin!=null})[0],prims=J.meshes[meshNode.mesh].primitives.map(function(p){var w=acc(p.attributes.WEIGHTS_0);if(!(w instanceof Float32Array)){var f=new Float32Array(w.length),dd=w instanceof Uint8Array?255:65535;for(var i=0;i<w.length;i++)f[i]=w[i]/dd;w=f}
  return{name:J.materials[p.material].name,col:(J.materials[p.material].pbrMetallicRoughness||{}).baseColorFactor||[1,1,1,1],pos:acc(p.attributes.POSITION),nrm:acc(p.attributes.NORMAL),jnt:acc(p.attributes.JOINTS_0),wt:w,idx:acc(p.indices)}});
 var parent={};J.nodes.forEach(function(n,i){(n.children||[]).forEach(function(c){parent[c]=i})});
 var anims={};(J.animations||[]).forEach(function(a){var nm=a.name.split('|').pop().replace('Man_','');var ch=a.channels.map(function(c){var s=a.samplers[c.sampler];return{node:c.target.node,path:c.target.path,t:acc(s.input),v:acc(s.output)}});var d=0;ch.forEach(function(c){d=Math.max(d,c.t[c.t.length-1])});anims[nm]={ch:ch,dur:d}});
 var order=[];(function walk(i){order.push(i);(J.nodes[i].children||[]).forEach(walk)})(J.scenes[J.scene||0].nodes[0]);
 return{J:J,joints:skin.joints,ibm:acc(skin.inverseBindMatrices),prims:prims,parent:parent,anims:anims,order:order}}
var V3,Q,M4;function cls(){if(V3)return true;var c=window.__fr&&__fr.W&&__fr.W.cam||window.__rd&&__rd.camera;if(!c)return false;V3=c.position.constructor;Q=c.quaternion.constructor;M4=c.matrix.constructor;return true}
function hex(h){return h}
function Human(look){var T=window.__T,L=CH.sanitize(look),self=this;this.L=L;var G=this.g=new T.Group();var inner=this.inner=new T.Group();G.add(inner);inner.rotation.y=Math.PI;
 var fem=L.out==='abaya'||L.head==='shayla',robeCol=L.out==='abaya'?'#0e0e10':L.out==='kandoora'?CH.KCOL[L.kcol]:null,skinC=CH.SKIN[L.skin],hairC=CH.HAIRC[L.hairc];
 var mats={};function mat(name){var c;switch(name){case 'Skin':c=skinC;break;case 'Hair':c=hairC;break;case 'Eyes':c='#151515';break;case 'Shirt':c=robeCol||L.casual;break;case 'Pants':c=robeCol||'#2c3e66';break;default:c=null}
  var m=new T.Std({color:c||0x888888,roughness:name==='Skin'?.6:name==='Eyes'?.2:.85,metalness:0});if(!c){var p=M.prims.filter(function(q){return q.name===name})[0];m.color.setRGB(p.col[0],p.col[1],p.col[2])}return m}
 this.parts=M.prims.map(function(p){var g=new T.Geo(),pos=new Float32Array(p.pos.length),nr=new Float32Array(p.nrm.length);g.setAttribute('position',new T.Attr(pos,3));g.setAttribute('normal',new T.Attr(nr,3));g.setIndex(new T.Attr(p.idx instanceof Uint32Array?p.idx:new Uint16Array(p.idx),1));
  var me=new T.Mesh(g,mat(p.name));me.castShadow=true;me.frustumCulled=false;if(p.name==='Hair'&&(L.head!=='none'&&L.head!=='cap'))me.visible=false;inner.add(me);return{p:p,g:g,pos:pos,nr:nr}});
 // pose buffers
 var n=M.J.nodes.length;this.lt=[];this.lr=[];this.ls=[];this.W=[];for(var i=0;i<n;i++){var nd=M.J.nodes[i];this.lt.push(new V3().fromArray(nd.translation||[0,0,0]));this.lr.push(new Q().fromArray(nd.rotation||[0,0,0,1]));this.ls.push(new V3().fromArray(nd.scale||[1,1,1]));this.W.push(new M4())}
 this.base={t:this.lt.map(function(v){return v.clone()}),r:this.lr.map(function(q){return q.clone()}),s:this.ls.map(function(v){return v.clone()})};
 this.jm=M.joints.map(function(){return new M4()});this.clip='Idle';this.prev=null;this.fade=0;this.time=0;this.ptime=0;
 var jn={};M.joints.forEach(function(j,k){jn[M.J.nodes[j].name]=j});this.jn=jn;
 // attachments follow bones (rigid)
 this.att=[];var P=this.P={};
 function attach(bone,obj,fix){var a=new T.Group();a.add(obj);inner.add(a);self.att.push({node:jn[bone],g:a,fix:fix});return a}
 P.handR=new T.Group();attach('Palm.R',P.handR);P.armR=P.handR;P.fist=P.handR;P.hips=new T.Group();
 // robe (kandoora/abaya): flared tube from shoulders to ankles, follows the hips
 if(robeCol){var rm=new T.Std({color:robeCol,roughness:.85,side:2});var pts=[];var prof=[[.17,1.42],[.2,1.3],[.2,1.1],[.215,.85],[.24,.5],[.27,.12],[.27,.06]];var lat=new (T.Cyl)(1,1,1,1);var geo=lathe(T,prof,18);var robe=new T.Mesh(geo,rm);robe.castShadow=true;this.robe=robe;inner.add(robe);
  var collar=new T.Mesh(new T.Cyl(.075,.09,.06,14,1,true),rm);collar.position.y=1.47;inner.add(collar);this.collar=collar;
  if(L.out==='kandoora'){var tas=new T.Mesh(new T.Cyl(.008,.008,.28,6),new T.Std({color:CH.KCOL[L.kcol],roughness:.6}));this.tassel=tas}}
 // headwear on the head bone
 var hw=new T.Group();this.hw=hw;
 if(L.head==='ghutra'||L.head==='shemagh'||L.head==='shayla'){var cloth=L.head==='shayla'?'#0e0e10':'#f7f7f4',cm=new T.Std({color:cloth,roughness:.85,side:2});
  var cap=new T.Mesh(new T.Sphere(.125,20,12,0,Math.PI*2,0,Math.PI*.55),cm);cap.scale.set(1.08,1.05,1.12);hw.add(cap);
  var drape=new T.Mesh(new T.Cyl(.135,.2,.34,18,1,true,Math.PI*.25,Math.PI*1.5),cm);drape.position.set(0,-.16,.015);hw.add(drape);
  if(L.head==='shemagh'){var tx=document.createElement('canvas');tx.width=tx.height=64;var g2=tx.getContext('2d');g2.fillStyle='#fff';g2.fillRect(0,0,64,64);g2.fillStyle='#c0182a';for(var y=0;y<64;y+=8)for(var x=(y/8)%2*4;x<64;x+=8)g2.fillRect(x,y,4,4);var ct=new T.CanvasTex(tx);ct.colorSpace=T.SRGB;ct.wrapS=ct.wrapT=1000;ct.repeat.set(2,2);cm.map=ct;cm.color.set('#ffffff')}
  if(L.head!=='shayla'){var agal=new T.Mesh(new T.Cyl(.128,.128,.035,20,1,true),new T.Std({color:'#0b0b0b',roughness:.5,side:2}));agal.position.y=.055;hw.add(agal);var ag2=agal.clone();ag2.position.y=.09;ag2.scale.set(.96,1,.96);hw.add(ag2)}}
 else if(L.head==='kumma'){var km=new T.Mesh(new T.Cyl(.118,.122,.1,20),new T.Std({color:'#f2efe6',roughness:.8}));km.position.y=.06;hw.add(km)}
 else if(L.head==='cap'){var cp=new T.Mesh(new T.Sphere(.122,16,8,0,Math.PI*2,0,Math.PI*.5),new T.Std({color:L.casual,roughness:.7}));hw.add(cp);var br=new T.Mesh(new T.Box(.18,.012,.12),cp.material);br.position.set(0,.0,-.15);hw.add(br)}
 if(!fem&&L.beard!=='none'){var bm=new T.Std({color:hairC,roughness:.95});var bd=new T.Mesh(new T.Sphere(.1,14,8,0,Math.PI*2,Math.PI*.45,Math.PI*.5),bm);bd.scale.set(1,L.beard==='full'?1.1:.8,.85);bd.position.set(0,-.06,-.03);hw.add(bd)}
 if(L.glasses){var gm=new T.Std({color:'#111',roughness:.2,metalness:.5});var gl=new T.Mesh(new T.Box(.17,.04,.01),gm);gl.position.set(0,.03,-.115);hw.add(gl)}
 hw.children.forEach(function(c){c.position.y+=.125});this.hwA=attach('Head',hw,'head');
 this.h=0;this.update(0,'Idle');this.measure();}
function lathe(T,prof,seg){var P=[],N=[],I=[];for(var i=0;i<prof.length;i++)for(var s=0;s<=seg;s++){var a=s/seg*Math.PI*2,r=prof[i][0];P.push(Math.sin(a)*r,prof[i][1],Math.cos(a)*r);N.push(Math.sin(a),0,Math.cos(a))}
 for(i=0;i<prof.length-1;i++)for(s=0;s<seg;s++){var a0=i*(seg+1)+s,b0=a0+seg+1;I.push(a0,b0,a0+1,a0+1,b0,b0+1)}var g=new T.Geo();g.setAttribute('position',new T.Attr(new Float32Array(P),3));g.setAttribute('normal',new T.Attr(new Float32Array(N),3));g.setIndex(I);return g}
var tq=null,tv=null;
Human.prototype.sample=function(clip,t,wgt){var A=M.anims[clip];if(!A)return;if(!tq){tq=new Q();tv=new V3()}var self=this;
 A.ch.forEach(function(c){var T=c.t,k=0,n=T.length;if(t<=T[0])k=0;else if(t>=T[n-1])k=n-2;else{while(k<n-2&&T[k+1]<t)k++}var f=n>1?Math.max(0,Math.min(1,(t-T[k])/((T[k+1]-T[k])||1))):0,i=c.node;
  if(c.path==='rotation'){tq.set(c.v[k*4],c.v[k*4+1],c.v[k*4+2],c.v[k*4+3]);if(n>1){var q2=new Q(c.v[k*4+4],c.v[k*4+5],c.v[k*4+6],c.v[k*4+7]);tq.slerp(q2,f)}if(wgt>=1)self.lr[i].copy(tq);else self.lr[i].slerp(tq,wgt)}
  else{var arr=c.path==='translation'?self.lt:self.ls;tv.set(c.v[k*3],c.v[k*3+1],c.v[k*3+2]);if(n>1)tv.lerp(new V3(c.v[k*3+3],c.v[k*3+4],c.v[k*3+5]),f);if(wgt>=1)arr[i].copy(tv);else arr[i].lerp(tv,wgt)}})};
Human.prototype.update=function(dt,clip,speed,loop){var self=this;if(clip!==this.clip){this.prev=this.clip;this.ptime=this.time;this.clip=clip;this.time=0;this.fade=.18}
 var A=M.anims[this.clip];this.time+=dt*(speed||1);if(A){if(loop===false)this.time=Math.min(this.time,A.dur-.001);else this.time%=A.dur||1}
 if(this.fade>0&&this.prev){var PA=M.anims[this.prev];this.ptime+=dt;if(PA)this.ptime%=PA.dur||1;this.sample(this.prev,this.ptime,1);this.sample(this.clip,this.time,1-this.fade/.18);this.fade-=dt}else this.sample(this.clip,this.time,1);
 if(this.aim){var ua=this.jn['UpperArm.R'];if(ua!=null){var qa=new Q().setFromAxisAngle(new V3(1,0,0),-1.2);this.lr[ua].multiply(qa)}}
 // world matrices
 var J=M.J,W=this.W,one=new V3(1,1,1);M.order.forEach(function(i){var m=W[i];m.compose(self.lt[i],self.lr[i],self.ls[i]);var pi=M.parent[i];if(pi!=null)m.premultiply(W[pi])});
 M.joints.forEach(function(j,k){self.jm[k].fromArray(M.ibm,k*16).premultiply(W[j])});
 // CPU skinning
 var JE=this.jm.map(function(m){return m.elements});
 this.parts.forEach(function(pt){var p=pt.p,P=p.pos,N=p.nrm,Jn=p.jnt,Wt=p.wt,o=pt.pos,on=pt.nr,cnt=P.length/3;
  for(var v=0;v<cnt;v++){var x=P[v*3],y=P[v*3+1],z=P[v*3+2],nx=N[v*3],ny=N[v*3+1],nz=N[v*3+2],ox=0,oy=0,oz=0,mx=0,my=0,mz=0;
   for(var k=0;k<4;k++){var w=Wt[v*4+k];if(w<=0)continue;var e=JE[Jn[v*4+k]];ox+=w*(e[0]*x+e[4]*y+e[8]*z+e[12]);oy+=w*(e[1]*x+e[5]*y+e[9]*z+e[13]);oz+=w*(e[2]*x+e[6]*y+e[10]*z+e[14]);mx+=w*(e[0]*nx+e[4]*ny+e[8]*nz);my+=w*(e[1]*nx+e[5]*ny+e[9]*nz);mz+=w*(e[2]*nx+e[6]*ny+e[10]*nz)}
   o[v*3]=ox;o[v*3+1]=oy;o[v*3+2]=oz;var l=Math.sqrt(mx*mx+my*my+mz*mz)||1;on[v*3]=mx/l;on[v*3+1]=my/l;on[v*3+2]=mz/l}
  pt.g.attributes.position.needsUpdate=true;pt.g.attributes.normal.needsUpdate=true;if(!pt.bs){pt.g.computeBoundingSphere();pt.bs=1}});
 this.att.forEach(function(a){var m=W[a.node];m.decompose(a.g.position,a.g.quaternion,a.g.scale);if(a.fix==='head'){a.g.scale.set(1,1,1);a.g.position.y+=.0}else a.g.scale.set(1,1,1)});
 if(this.robe){var hp=W[this.jn['Hips']],tmp=new V3();tmp.setFromMatrixPosition(hp);this.robe.position.set(tmp.x,0,tmp.z);var q=new Q();hp.decompose(new V3(),q,new V3());var e=new ((__fr.W.cam).rotation.constructor)().setFromQuaternion(q,'YXZ');this.robe.rotation.set(0,e.y,0);
  var nk=W[this.jn['Neck']];tmp.setFromMatrixPosition(nk);this.collar.position.set(tmp.x,tmp.y-.02,tmp.z)}};
Human.prototype.measure=function(){var mn=1e9,mx=-1e9;this.parts.forEach(function(pt){for(var i=1;i<pt.pos.length;i+=3){if(pt.pos[i]<mn)mn=pt.pos[i];if(pt.pos[i]>mx)mx=pt.pos[i]}});this.h=mx-mn;this.inner.scale.setScalar(1.78/(this.h||1.78));this.inner.position.y=-mn*this.inner.scale.y;
 // robe was modelled in metres at final scale: counter-scale it
 var s=1/this.inner.scale.x;if(this.robe){this.robe.scale.setScalar(s);this.collar.scale.setScalar(s)}this.hw.scale.setScalar(s);this.P.handR.scale.setScalar(s)};
function build2(look){var h=new Human(look),st={ph:0};
 function anim(dt,sp,state){var clip,spd=1,loop=true;h.aim=false;
  if(state==='ko'){clip='Death';loop=false}else if(state==='sit'){clip='Sitting';loop=false}else if(state==='air'){clip='Jump';loop=false}else if(state==='punch'){clip='Punch'}
  else if(state==='aim'){clip=sp>.3?'Walk':'Idle';h.aim=true}else if(sp<.25)clip='Idle';else if(sp<3.2){clip='Walk';spd=Math.max(.5,sp/1.5)}else{clip='Run';spd=Math.max(.7,sp/4.5)}
  h.update(dt,clip,spd,loop)}
 return{g:h.g,P:h.P,anim:anim,look:h.L,real:true,human:h}}
CH.buildOld=OLD;
CH.build=function(look){load();if(M&&cls()&&localStorage.getItem('uae_chr_classic')!=='1'){try{return build2(look)}catch(e){console.warn('human build',e)}}return OLD(look)};
CH.ready=function(){return !!M};
load();
})();

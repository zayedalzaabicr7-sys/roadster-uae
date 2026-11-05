/* Roadster Dash UAE — v10 Free Roam UAE: open-world drive + flight (original procedural code) */
(function(){'use strict';
var V=window.__v10;if(!V)return;
var FR=window.__fr={active:false};
function U(){return window.__uae}
var T,R,CL={},W={},car=null,ready=false;
// ---------- deterministic random ----------
var seed=97;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}
function sm(a,b,x){var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}
// ---------- world layout ----------
var X0=-1650,X1=1300,Z0=-850,Z1=1150,CELL=12.5,NX=Math.round((X1-X0)/CELL),NZ=Math.round((Z1-Z0)/CELL);
var MT={x:850,z:-380};
function mount0(x,z){var dx=x-MT.x,dz=z-MT.z,r2=dx*dx+dz*dz;return Math.max(0,275*Math.exp(-r2/(2*240*240))-28)}
function rawH(x,z){var h=0;
 if(z>250){var w=sm(250,430,z)*sm(-700,-450,x)*(1-sm(300,420,x));var d=9*Math.pow(Math.abs(Math.sin(x*.018+Math.sin(z*.011)*2.2)),1.5)+6*(Math.sin(z*.031+x*.007)*.5+.5)+3*Math.sin(x*.05)*Math.sin(z*.045);h+=w*d}
 var m=mount0(x,z);if(m>0)h+=m+m/240*14*Math.sin(x*.04+z*.02)*Math.cos(z*.037);
 if(x<-1040&&z>40)h-=sm(40,105,z)*3.6*sm(-1040,-1110,x);
 return h}
// roads: {pts:[[x,z]...], w:width, y:fn or null, col}
var ROADS=[];
function road(pts,w,kind,yf){ROADS.push({pts:pts,w:w,kind:kind,yf:yf||null})}
(function(){var i;for(i=-240;i<=240;i+=80){road([[i,-250],[i,250]],14,'city');road([[-250,i],[250,i]],14,'city')}
 road([[-240,0],[-1150,0]],38,'hwy');
 road([[-1150,0],[-1260,28],[-1400,46],[-1560,40],[-1620,20]],18,'cor');
 road([[-1260,28],[-1300,-90],[-1330,-130]],12,'cor');
 var d=[[0,250],[0,380],[40,500],[90,620],[20,760],[-60,880],[-20,1000],[40,1120]];road(d,14,'desert',function(){return 0});
 // Jebel Jais: approach + spiral climb
 var J=[[240,-40],[330,-40],[420,-30]],th0=Math.atan2(-30-MT.z,420-MT.x),r0=Math.hypot(420-MT.x,-30-MT.z),turns=1.55,N=260;
 for(i=1;i<=N;i++){var t=i/N,th=th0-t*turns*Math.PI*2,r=r0+(55-r0)*Math.pow(t,.85);J.push([MT.x+Math.cos(th)*r,MT.z+Math.sin(th)*r])}
 road(J,12,'jais',function(x,z){return mount0(x,z)});
 road([[150,330],[330,330]],110,'arena',function(){return 0});road([[0,330],[150,330]],14,'city',function(){return 0});
 // street from downtown east to the mountain road
 road([[240,-40],[250,-40]],14,'city')})();
// nearest-road query (for flattening + surface)
function segDist(px,pz,ax,az,bx,bz){var vx=bx-ax,vz=bz-az,l=vx*vx+vz*vz,t=l?((px-ax)*vx+(pz-az)*vz)/l:0;t=Math.max(0,Math.min(1,t));var cx=ax+vx*t,cz=az+vz*t;return{d:Math.hypot(px-cx,pz-cz),x:cx,z:cz}}
var HG=null;
function buildHeights(){HG=new Float32Array((NX+1)*(NZ+1));var flat=ROADS.filter(function(r){return r.yf});
 for(var j=0;j<=NZ;j++)for(var i=0;i<=NX;i++){var x=X0+i*CELL,z=Z0+j*CELL,h=rawH(x,z);
  for(var q=0;q<flat.length;q++){var r=flat[q],P=r.pts,best=1e9,bx=0,bz=0;
   for(var s=0;s<P.length-1;s++){var a=P[s],b=P[s+1];if(Math.abs(a[0]-x)>140&&Math.abs(b[0]-x)>140)continue;if(Math.abs(a[1]-z)>140&&Math.abs(b[1]-z)>140)continue;var k=segDist(x,z,a[0],a[1],b[0],b[1]);if(k.d<best){best=k.d;bx=k.x;bz=k.z}}
   if(best<60){var ty=r.yf(bx,bz),wgt=1-sm(r.w/2+5,r.w/2+42,best);h=h+(ty-h)*wgt}}
  HG[j*(NX+1)+i]=h}}
function gh(i,j){i=Math.max(0,Math.min(NX,i));j=Math.max(0,Math.min(NZ,j));return HG[j*(NX+1)+i]}
function heightAt(x,z){if(FR.hOver){var ho=FR.hOver(x,z);if(ho!=null)return ho}var gx=(x-X0)/CELL,gz=(z-Z0)/CELL,i=Math.floor(gx),j=Math.floor(gz),fx=gx-i,fz=gz-j;
 var a=gh(i,j),b=gh(i+1,j),c=gh(i,j+1),d=gh(i+1,j+1);if(fx+fz<1)return a+(b-a)*fx+(c-a)*fz;return d+(c-d)*(1-fx)+(b-d)*(1-fz)}
FR.heightAt=heightAt;
// road mask (5 m) for surface grip + minimap
var MK=5,MW=Math.ceil((X1-X0)/MK),MH=Math.ceil((Z1-Z0)/MK),MASK=null;
function buildMask(){MASK=new Uint8Array(MW*MH);ROADS.forEach(function(r){var P=r.pts,hw=r.w/2+1;for(var s=0;s<P.length-1;s++){var a=P[s],b=P[s+1],x0=Math.min(a[0],b[0])-hw,x1=Math.max(a[0],b[0])+hw,z0=Math.min(a[1],b[1])-hw,z1=Math.max(a[1],b[1])+hw;
 for(var z=z0;z<=z1;z+=MK)for(var x=x0;x<=x1;x+=MK){if(segDist(x,z,a[0],a[1],b[0],b[1]).d<=hw){var i=Math.floor((x-X0)/MK),j=Math.floor((z-Z0)/MK);if(i>=0&&j>=0&&i<MW&&j<MH)MASK[j*MW+i]=r.kind==='hwy'?2:1}}}})}
function onRoad(x,z){var i=Math.floor((x-X0)/MK),j=Math.floor((z-Z0)/MK);return i>=0&&j>=0&&i<MW&&j<MH?MASK[j*MW+i]:0}
function region(x,z){if(x>140&&x<340&&z>270&&z<390)return'arena';if(x<-1040)return'ad';if(x<-250&&Math.abs(z)<300)return'szr';if(z>300)return'desert';if(Math.hypot(x-MT.x,z-MT.z)<600||x>330)return'jais';return'city'}
var AREAS={arena:'Drift Arena · ساحة التفحيط',city:'Downtown Dubai · وسط دبي',szr:'Sheikh Zayed Road · شارع الشيخ زايد',ad:'Abu Dhabi Corniche · كورنيش أبوظبي',desert:'Desert Dunes · الكثبان الرملية',jais:'Jebel Jais · جبل جيس'};
// ---------- geometry merge helper ----------
function Merge(){this.P=[];this.N=[];this.C=[];this.UV=[]}
Merge.prototype.add=function(geo,m,col,uvf){var g=geo.index?geo.toNonIndexed():geo.clone();if(uvf&&g.attributes.uv)uvf(g.attributes.uv);g.applyMatrix4(m);var p=g.attributes.position.array,n=g.attributes.normal.array,uv=g.attributes.uv?g.attributes.uv.array:null,cnt=p.length/3;
 for(var i=0;i<p.length;i++){this.P.push(p[i]);this.N.push(n[i])}for(var k=0;k<cnt;k++){this.C.push(col.r,col.g,col.b);if(uv)this.UV.push(uv[k*2],uv[k*2+1]);else this.UV.push(0,0)}g.dispose()};
Merge.prototype.mesh=function(mat){var g=new T.Geo();g.setAttribute('position',new T.Attr(new Float32Array(this.P),3));g.setAttribute('normal',new T.Attr(new Float32Array(this.N),3));g.setAttribute('color',new T.Attr(new Float32Array(this.C),3));g.setAttribute('uv',new T.Attr(new Float32Array(this.UV),2));g.computeBoundingSphere();var m=new T.Mesh(g,mat);m.castShadow=false;m.receiveShadow=true;return m};
function M4(x,y,z,ry,sx,sy,sz){var m=new CL.M4();m.makeRotationY(ry||0);m.scale(new CL.V3(sx==null?1:sx,sy==null?1:sy,sz==null?1:sz));m.setPosition(x,y,z);return m}
function col(h){var c=new CL.Col();c.setHex(h);return c}
function jitter(h,a){var c=col(h);c.offsetHSL(0,0,(rnd()-.5)*a);return c}
// colliders
var COL={},CC=40;function ckey(i,j){return i+','+j}
function addCol(o){var i0=Math.floor((o.x0-X0)/CC),i1=Math.floor((o.x1-X0)/CC),j0=Math.floor((o.z0-Z0)/CC),j1=Math.floor((o.z1-Z0)/CC);for(var i=i0;i<=i1;i++)for(var j=j0;j<=j1;j++){var k=ckey(i,j);(COL[k]=COL[k]||[]).push(o)}}
function boxCol(x,z,w,d,top){addCol({t:'b',x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,top:top})}
function circCol(x,z,r,top){addCol({t:'c',x:x,z:z,r:r,x0:x-r,x1:x+r,z0:z-r,z1:z+r,top:top})}
// ---------- textures ----------
function canvasTex(w,h,draw,rep){var c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);var t=new T.CanvasTex(c);t.colorSpace=T.SRGB;if(rep){t.wrapS=t.wrapT=1000}t.anisotropy=4;return t}
function facadeTex(){return canvasTex(64,64,function(g){g.fillStyle='#f2f2f2';g.fillRect(0,0,64,64);for(var y=0;y<4;y++)for(var x=0;x<4;x++){var gr=g.createLinearGradient(0,y*16,0,y*16+12);gr.addColorStop(0,'#9cc0dc');gr.addColorStop(.5,'#5f86a8');gr.addColorStop(1,'#344f6c');g.fillStyle=gr;g.fillRect(x*16+3,y*16+3,11,11)}g.fillStyle='#f2f2f2';g.fillRect(0,0,3,3)},true)}
function roadTex(){return canvasTex(64,256,function(g){g.fillStyle='#4a4a4e';g.fillRect(0,0,64,256);for(var i=0;i<400;i++){g.fillStyle='rgba('+(rnd()<.5?255:0)+','+(rnd()<.5?255:0)+',255,.05)';g.fillRect(rnd()*64,rnd()*256,2,2)}},true)}
function signTex(a,b){return canvasTex(512,128,function(g){g.fillStyle='#0b6b3a';g.fillRect(0,0,512,128);g.strokeStyle='#fff';g.lineWidth=5;g.strokeRect(6,6,500,116);g.fillStyle='#fff';g.font='bold 40px Arial';g.textAlign='center';g.fillText(a,256,56);g.font='bold 34px Arial';g.fillText(b,256,102)})}
// ---------- build world ----------
function build(){T=window.__T;var rd=window.__rd;R=rd.renderer;
 CL.Scene=rd.scene.constructor;CL.Cam=rd.camera.constructor;CL.V3=rd.camera.position.constructor;CL.M4=rd.camera.matrix.constructor;CL.Col=(U().shared(T).black.color).constructor;
 rd.scene.traverse(function(o){if(o.isDirectionalLight&&!CL.Dir){CL.Dir=o.constructor;CL.dirI=o.intensity}if(o.isHemisphereLight&&!CL.Hemi){CL.Hemi=o.constructor;CL.hemiI=o.intensity}if(o.isAmbientLight&&!CL.Amb)CL.Amb=o.constructor});
 var S=W.scene=new CL.Scene();S.background=col(0xa9c8e6);S.fog={isFog:true,name:'',color:col(0xe9dcc6),near:260,far:1500,clone:function(){return this},toJSON:function(){return{}}};
 var cam=W.cam=new CL.Cam(62,innerWidth/innerHeight,.3,3200);
 // lights
 if(CL.Hemi){var hl=new CL.Hemi(0xe2ecff,0xcaa778,1.25);S.add(hl)}else if(CL.Amb){S.add(new CL.Amb(0xffffff,.8))}
 if(CL.Dir){var dl=W.sun=new CL.Dir(0xfff0d8,2.4);dl.position.set(-120,220,90);dl.castShadow=true;dl.shadow.mapSize.width=dl.shadow.mapSize.height=1024;var sc=dl.shadow.camera;sc.left=-40;sc.right=40;sc.top=40;sc.bottom=-40;sc.near=10;sc.far=600;dl.shadow.bias=-.0006;S.add(dl);S.add(dl.target)}
 // sky dome
 var sg=new T.Sphere(2800,24,12);var sp=sg.attributes.position,sc2=[];for(var i=0;i<sp.count;i++){var y=sp.getY(i)/2800,c=col(0xf3e2c6).lerp(col(0x4f86c9),Math.pow(Math.max(0,y),.55));if(y<0)c=col(0xe7d4b4);sc2.push(c.r,c.g,c.b)}sg.setAttribute('color',new T.Attr(new Float32Array(sc2),3));
 var sky=new T.Mesh(sg,new T.Basic({vertexColors:true,side:1,fog:false,depthWrite:false}));sky.renderOrder=-10;S.add(sky);W.sky=sky;
 var sun=new T.Mesh(new T.Sphere(60,16,8),new T.Basic({color:0xfff4d6,fog:false}));sun.position.set(-1200,1500,900);sky.add(sun);
 // terrain
 buildHeights();buildMask();
 var tg=new T.Geo(),P=new Float32Array((NX+1)*(NZ+1)*3),Cc=new Float32Array((NX+1)*(NZ+1)*3),k=0;
 for(var j=0;j<=NZ;j++)for(var i2=0;i2<=NX;i2++){var x=X0+i2*CELL,z=Z0+j*CELL,h=HG[j*(NX+1)+i2];P[k]=x;P[k+1]=h;P[k+2]=z;
  var rg=region(x,z),cc;if(rg==='arena')rg='city';if(h<-.8)cc=col(0xd9c9a2);else if(rg==='desert')cc=col(0xe2a35f).lerp(col(0xf0bd7c),Math.min(1,Math.max(0,h/14)));else if(Math.max(0,mount0(x,z))>2)cc=col(0x8c6a52).lerp(col(0xa8968a),Math.min(1,h/250));else if(rg==='ad'&&z>20)cc=col(0xe8dab4);else if(rg==='city'||rg==='szr'||rg==='ad')cc=col(0xc4bdb0);else cc=col(0xd9c49c);
  cc.offsetHSL(0,0,(rnd()-.5)*.05);Cc[k]=cc.r;Cc[k+1]=cc.g;Cc[k+2]=cc.b;k+=3}
 var idx=new Uint32Array(NX*NZ*6),q=0;for(j=0;j<NZ;j++)for(i2=0;i2<NX;i2++){var a=j*(NX+1)+i2,b=a+1,c=a+NX+1,d=c+1;idx[q++]=a;idx[q++]=c;idx[q++]=b;idx[q++]=b;idx[q++]=c;idx[q++]=d}
 tg.setAttribute('position',new T.Attr(P,3));tg.setAttribute('color',new T.Attr(Cc,3));tg.setIndex(new T.Attr(idx,1));tg.computeVertexNormals();tg.computeBoundingSphere();
 var ter=new T.Mesh(tg,new T.Std({vertexColors:true,roughness:.96,metalness:0}));ter.receiveShadow=true;S.add(ter);
 // water (Abu Dhabi corniche)
 var wat=new T.Mesh(new T.Plane(900,1400),new T.Std({color:0x2f8fb0,roughness:.12,metalness:.3,transparent:true,opacity:.92}));wat.rotation.x=-Math.PI/2;wat.position.set(-1500,-.45,800);S.add(wat);W.water=wat;
 // roads (ribbons)
 var rt=roadTex(),RM=new Merge(),LM=new Merge(),white=col(0xffffff),gold=col(0xf3d77a);
 ROADS.forEach(function(r){var P2=r.pts,acc=0;for(var s=0;s<P2.length-1;s++){var a=P2[s],b=P2[s+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/6));
  for(var t=0;t<n;t++){var x0=a[0]+(b[0]-a[0])*t/n,z0=a[1]+(b[1]-a[1])*t/n,x1=a[0]+(b[0]-a[0])*(t+1)/n,z1=a[1]+(b[1]-a[1])*(t+1)/n;ribbon(RM,x0,z0,x1,z1,r.w,acc,L/n);
   // dashed centre / lane lines
   if(r.kind!=='city'||true){var seg=Math.hypot(x1-x0,z1-z0),ux=(x1-x0)/seg,uz=(z1-z0)/seg,nx=-uz,nz=ux,lanes=r.kind==='hwy'?[-12.7,-6.3,6.3,12.7]:[0];
    if(Math.floor(acc/6)%2===0)lanes.forEach(function(o){strip(LM,x0+nx*o,z0+nz*o,x0+nx*o+ux*seg*.9,z0+nz*o+uz*seg*.9,.22,r.kind==='hwy'?white:gold)});
    if(r.kind==='hwy'){[-18.4,18.4].forEach(function(o){strip(LM,x0+nx*o,z0+nz*o,x1+nx*o,z1+nz*o,.25,white)})}}
   acc+=L/n}}});
 var rm=RM.mesh(new T.Std({map:rt,vertexColors:true,roughness:.85,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));S.add(rm);
 var lm=LM.mesh(new T.Std({vertexColors:true,roughness:.6,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));S.add(lm);
 buildCity(S);buildLandmarks(S);buildPalms(S);buildTraffic(S);
 W.pool=new V.Pool(S,170);
 buildMinimap();ready=true}
function ribbon(Mg,x0,z0,x1,z1,w,v0,len){var dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2,g=new T.Geo(),e=.6;
 var y0=heightAt(x0,z0)+.07,y1=heightAt(x1,z1)+.07,yl0=heightAt(x0+nx,z0+nz)+.07,yr0=heightAt(x0-nx,z0-nz)+.07,yl1=heightAt(x1+nx,z1+nz)+.07,yr1=heightAt(x1-nx,z1-nz)+.07;
 var ax=x0-dx/L*e,az=z0-dz/L*e,bx=x1+dx/L*e,bz=z1+dz/L*e;
 var p=[ax+nx,yl0,az+nz, bx+nx,yl1,bz+nz, ax-nx,yr0,az-nz, ax-nx,yr0,az-nz, bx+nx,yl1,bz+nz, bx-nx,yr1,bz-nz];
 var vv=v0/12,v1=(v0+len)/12,u=[0,vv,0,v1,w/7,vv,w/7,vv,0,v1,w/7,v1];
 g.setAttribute('position',new T.Attr(new Float32Array(p),3));g.setAttribute('uv',new T.Attr(new Float32Array(u),2));g.computeVertexNormals();
 Mg.add(g,new CL.M4(),col(0xffffff))}
function strip(Mg,x0,z0,x1,z1,w,c){var dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2,g=new T.Geo();
 var h=function(x,z){return heightAt(x,z)+.1};var p=[x0+nx,h(x0+nx,z0+nz),z0+nz, x1+nx,h(x1+nx,z1+nz),z1+nz, x0-nx,h(x0-nx,z0-nz),z0-nz, x0-nx,h(x0-nx,z0-nz),z0-nz, x1+nx,h(x1+nx,z1+nz),z1+nz, x1-nx,h(x1-nx,z1-nz),z1-nz];
 g.setAttribute('position',new T.Attr(new Float32Array(p),3));g.computeVertexNormals();Mg.add(g,new CL.M4(),c)}
function boxUV(sx,sy,sz){return function(uv){for(var f=0;f<6;f++)for(var v=0;v<6;v++){var i=f*6+v;if(f===2||f===3){uv.setXY(i,.01,.01)}else{var w=f<2?sz:sx;uv.setXY(i,uv.getX(i)*w/7,uv.getY(i)*sy/4.5)}}}}
var FAC=null;
function tower(Mg,x,z,w,d,h,c,ry){var g=new T.Box(1,1,1);Mg.add(g,M4(x,h/2,z,ry||0,w,h,d),c,boxUV(w,h,d));g.dispose();if(!ry)boxCol(x,z,w,d,h);else circCol(x,z,Math.max(w,d)*.6,h)}
function buildCity(S){FAC=facadeTex();var BM=new Merge(),PL=new Merge(),cols=[0xd9e2ea,0xc7d3dc,0xb8c6d2,0xe7e1d6,0xa9b9c6,0xd7cbb7,0x9fb3c4];
 var cents=[-200,-120,-40,40,120,200];
 cents.forEach(function(cx){cents.forEach(function(cz){
  if(cx===40&&cz===-40)return; // Burj plot
  if(cx===-120&&cz===120)return; // Frame plot
  if(cx===40&&cz===40){park(PL,cx,cz);return}
  var dc=Math.hypot(cx-40,cz+40),hm=Math.max(25,170-dc*.55),n=1+Math.floor(rnd()*3);
  // plinth
  PL.add(new T.Box(1,1,1),M4(cx,.15,cz,0,62,.3,62),col(0xcfc8bb));
  for(var i=0;i<n;i++){var w=14+rnd()*14,d=14+rnd()*14,h=hm*(.45+rnd()*.7),ox=n===1?0:(i%2?1:-1)*(31-w/2-2)*(rnd()*.6+.4),oz=n===1?0:(i<2?-1:1)*(31-d/2-2)*(rnd()*.6+.4);
   tower(BM,cx+ox,cz+oz,w,d,h,jitter(cols[Math.floor(rnd()*cols.length)],.06));if(rnd()<.35)tower(BM,cx+ox,cz+oz,w*.7,d*.7,h+8+rnd()*18,jitter(0xdde6ee,.04))}})});
 // Sheikh Zayed Road towers
 for(var x=-300;x>-860;x-=34){[-1,1].forEach(function(sd){var w=16+rnd()*10,d=16+rnd()*8,h=55+rnd()*150,z=sd*(40+d/2+rnd()*10);tower(BM,x+rnd()*6,z,w,d,h,jitter(cols[Math.floor(rnd()*cols.length)],.08))})}
 // Abu Dhabi corniche towers
 for(x=-1130;x>-1620;x-=42){var w=18+rnd()*10,h=60+rnd()*110;tower(BM,x,-60-rnd()*40,w,18+rnd()*8,h,jitter(cols[Math.floor(rnd()*cols.length)],.08))}
 var bm=BM.mesh(new T.Std({map:FAC,vertexColors:true,roughness:.35,metalness:.35}));bm.castShadow=true;S.add(bm);
 S.add(PL.mesh(new T.Std({vertexColors:true,roughness:.8})));
 // highway median + gantries
 var MD=new Merge();MD.add(new T.Box(1,1,1),M4(-700,.55,0,0,880,1.1,.8),col(0xbdbab2));addCol({t:'b',x0:-1140,x1:-260,z0:-.6,z1:.6,top:1.1});
 var sgn=new T.Std({map:signTex('ABU DHABI  أبوظبي  ←','Sheikh Zayed Rd  شارع الشيخ زايد'),roughness:.6});
 for(x=-380;x>-1100;x-=240){MD.add(new T.Box(1,1,1),M4(x,4.5,-19.5,0,.6,9,.6),col(0x8a8d92));MD.add(new T.Box(1,1,1),M4(x,4.5,19.5,0,.6,9,.6),col(0x8a8d92));MD.add(new T.Box(1,1,1),M4(x,9.2,0,0,.7,.7,39.6),col(0x8a8d92));circCol(x,-19.5,.6,9);circCol(x,19.5,.6,9);
  var s1=new T.Mesh(new T.Plane(14,3.5),sgn);s1.position.set(x+.4,7.6,-9);s1.rotation.y=Math.PI/2;S.add(s1);var s2=s1.clone();s2.position.z=9;S.add(s2)}
 S.add(MD.mesh(new T.Std({vertexColors:true,roughness:.6,metalness:.3})))}
function park(Mg,cx,cz){Mg.add(new T.Box(1,1,1),M4(cx,.12,cz,0,62,.24,62),col(0x6f9a4a));Mg.add(new T.Cyl(14,14,.3,24),M4(cx,.3,cz,0,1,1,1),col(0x3a8fb5));circCol(cx,cz,14,.4)}
function buildLandmarks(S){var gl=new T.Std({color:0xcfd8e0,metalness:.85,roughness:.18}),gold=new T.Std({color:0xd4af37,metalness:1,roughness:.28}),white=new T.Std({color:0xf6f3ec,roughness:.55});
 // Burj Khalifa-style tower (Y-plan, setbacks)
 var bk=new (T.Group)(),bx=40,bz=-40,hh=[0,60,110,150,190,225,255,280,300];
 for(var s=0;s<hh.length-1;s++){var h0=hh[s],h1=hh[s+1],sc=1-s*.105;for(var a=0;a<3;a++){var ang=a*Math.PI*2/3,w=7.5*sc,l=17*sc*(1-.1*a*(s%2));var m=new T.Mesh(new T.Box(w,h1-h0+.01,l),gl);m.position.set(bx+Math.sin(ang)*l/2,(h0+h1)/2,bz+Math.cos(ang)*l/2);m.rotation.y=ang;bk.add(m)}
  var core=new T.Mesh(new T.Cyl(6.5*sc,6.5*sc,h1-h0,10),gl);core.position.set(bx,(h0+h1)/2,bz);bk.add(core)}
 var spire=new T.Mesh(new T.Cyl(.4,2.2,70,8),gl);spire.position.set(bx,335,bz);bk.add(spire);bk.traverse(function(o){if(o.isMesh)o.castShadow=true});S.add(bk);circCol(bx,bz,20,370);
 var plz=new T.Mesh(new T.Cyl(30,30,.3,40),white);plz.position.set(bx,.16,bz);S.add(plz);
 // Dubai Frame-style
 var fx=-120,fz=120,F=new T.Group();[[-50],[50]].forEach(function(p){var m=new T.Mesh(new T.Box(10,150,10),gold);m.position.set(fx+p[0],75,fz);F.add(m);boxCol(fx+p[0],fz,10,10,150)});var top=new T.Mesh(new T.Box(110,10,10),gold);top.position.set(fx,155,fz);F.add(top);
 var gls=new T.Mesh(new T.Box(90,.5,8),new T.Std({color:0x6c8ea8,metalness:.6,roughness:.1,transparent:true,opacity:.6}));gls.position.set(fx,150.2,fz);F.add(gls);F.traverse(function(o){if(o.isMesh)o.castShadow=true});S.add(F);
 // Grand Mosque-style (Abu Dhabi)
 var mx=-1330,mz=-210,G=new T.Group(),dome=function(r,x,y,z){var d=new T.Mesh(new T.Sphere(r,20,10,0,Math.PI*2,0,Math.PI/2),white);d.position.set(x,y,z);G.add(d);var f=new T.Mesh(new T.Cone(r*.08,r*.5,8),gold);f.position.set(x,y+r+r*.22,z);G.add(f)};
 var base=new T.Mesh(new T.Box(150,6,110),white);base.position.set(mx,3,mz);G.add(base);boxCol(mx,mz,150,110,6);
 var hall=new T.Mesh(new T.Box(80,14,56),white);hall.position.set(mx,13,mz);G.add(hall);
 var drum=new T.Mesh(new T.Cyl(15,15,8,24),white);drum.position.set(mx,24,mz);G.add(drum);dome(15,mx,28,mz);
 [[-28,-18],[28,-18],[-28,18],[28,18],[0,-22],[0,22],[-32,0],[32,0]].forEach(function(p){dome(6,mx+p[0],20,mz+p[1])});
 for(var i=-6;i<=6;i++){dome(2.6,mx+i*11,6,mz-55);dome(2.6,mx+i*11,6,mz+55)}
 [[-75,-55],[75,-55],[-75,55],[75,55]].forEach(function(p){var mi=new T.Mesh(new T.Cyl(2.2,2.8,72,10),white);mi.position.set(mx+p[0],36+6,mz+p[1]);G.add(mi);var b2=new T.Mesh(new T.Cyl(3.4,3.4,2,10),white);b2.position.set(mx+p[0],55,mz+p[1]);G.add(b2);var tp=new T.Mesh(new T.Cone(2.4,7,10),gold);tp.position.set(mx+p[0],81.5,mz+p[1]);G.add(tp);circCol(mx+p[0],mz+p[1],3,80)});
 var pool=new T.Mesh(new T.Box(120,.4,14),new T.Std({color:0x2e86c1,roughness:.1,metalness:.2}));pool.position.set(mx,.3,mz+72);G.add(pool);
 G.traverse(function(o){if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});S.add(G);
 // Jebel Jais summit platform + flag
 var sx=MT.x,sz=MT.z,sy=heightAt(sx,sz),pf=new T.Mesh(new T.Cyl(14,15,2,24),new T.Std({color:0x7a6a5c,roughness:.9}));pf.position.set(sx,sy+.5,sz);S.add(pf);
 var pole=new T.Mesh(new T.Cyl(.25,.25,22,8),new T.Std({color:0xdddddd,metalness:.8,roughness:.3}));pole.position.set(sx+6,sy+11,sz);S.add(pole);circCol(sx+6,sz,.6,30);
 var flag=new T.Mesh(new T.Plane(9,4.5),new T.Std({map:canvasTex(256,128,function(g){g.fillStyle='#c8102e';g.fillRect(0,0,64,128);g.fillStyle='#00843d';g.fillRect(64,0,192,43);g.fillStyle='#fff';g.fillRect(64,43,192,42);g.fillStyle='#000';g.fillRect(64,85,192,43)}),side:2,roughness:.8}));flag.position.set(sx+10.6,sy+19.5,sz);S.add(flag);W.flag=flag;
 // zipline-style tower on the ridge
 var zt=new T.Mesh(new T.Cyl(.6,1.2,30,6),new T.Std({color:0x333333}));var zx=MT.x-120,zz=MT.z+60;zt.position.set(zx,heightAt(zx,zz)+15,zz);S.add(zt);circCol(zx,zz,1.4,40)}
function buildPalms(S){var M=new Merge(),trunk=new T.Cyl(.25,.4,8,6),leaf=new T.Cone(.7,4.6,4);
 var put=function(x,z){var y=heightAt(x,z),h=6+rnd()*3;M.add(trunk,M4(x,y+h/2,z,0,1,h/8,1),jitter(0x8a6a44,.08));for(var i=0;i<6;i++){var a=i/6*Math.PI*2+rnd()*.3,m=new CL.M4(),q=new CL.M4();m.makeRotationY(a);q.makeRotationX(Math.PI/2.3);m.multiply(q);var t=new CL.M4();t.makeTranslation(0,2.1,0);m.multiply(t);m.setPosition(x+Math.sin(a)*.2,y+h,z+Math.cos(a)*.2);M.add(leaf,m,jitter(0x3f7a2e,.1))}circCol(x,z,.45,h)};
 for(var x=-280;x>-1130;x-=30)put(x,rnd()<.5?-23:23);
 for(x=-1160;x>-1620;x-=22)put(x,62+rnd()*6);
 for(var i=0;i<26;i++){var a=i/26*Math.PI*2;put(40+Math.cos(a)*36,-40+Math.sin(a)*36)}
 for(i=0;i<18;i++)put(40+(rnd()-.5)*50,40+(rnd()-.5)*50);
 var pm=M.mesh(new T.Std({vertexColors:true,roughness:.8}));pm.castShadow=true;S.add(pm)}
// ---------- traffic ----------
var TR=[];
function trafficCar(c,ty){var M=new Merge(),L=[4.4,4.8,5.2,11][ty],H=[.62,.8,.7,2.4][ty];M.add(new T.Box(1,1,1),M4(0,.3+H/2,0,0,ty===3?2.5:1.95,H,L),col(c));if(ty===2){M.add(new T.Box(1,1,1),M4(0,1.4,-.9,0,1.75,.6,1.9),col(0x1b2430))}else if(ty===3){M.add(new T.Box(1,1,1),M4(0,1.9,0,0,2.52,.7,10.4),col(0x1b2430))}else M.add(new T.Box(1,1,1),M4(0,.3+H+.25,.15,0,1.62,.5,ty?2.9:2.3),col(0x1b2430));M.add(new T.Box(1,1,1),M4(0,.62,-2.21,0,1.5,.16,.02),col(0xfff6d8));M.add(new T.Box(1,1,1),M4(0,.7,2.21,0,1.5,.12,.02),col(0xd01818));
 var wg=new T.Cyl(.34,.34,.26,10);[[-.86,-1.35],[.86,-1.35],[-.86,1.35],[.86,1.35]].forEach(function(p){var m=new CL.M4();m.makeRotationZ(Math.PI/2);m.setPosition(p[0],.34,p[1]);M.add(wg,m,col(0x111111))});
 var me=M.mesh(TR.mat);me.castShadow=true;return me}
function buildTraffic(S){TR.mat=new T.Std({vertexColors:true,roughness:.4,metalness:.3});var cs=[0xf4f4f2,0x111111,0xc0c4c8,0xc8102e,0x1d4ed8,0xd4af37,0x0b6b3a,0xf2b705,0x8b5cf6,0xf4f4f2];var G=W.traffic=new T.Group();S.add(G);
 var lanes=[{p:[[-260,-9.5],[-1140,-9.5]]},{p:[[-260,-15.5],[-1140,-15.5]]},{p:[[-1140,9.5],[-260,9.5]]},{p:[[-1140,15.5],[-260,15.5]]},{p:[[-236,-236],[236,-236],[236,236],[-236,236],[-236,-236]]},{p:[[-3.5,240],[-3.5,-240]]},{p:[[3.5,-240],[3.5,240]]}];
 lanes.forEach(function(L){var len=0;for(var i=0;i<L.p.length-1;i++)len+=Math.hypot(L.p[i+1][0]-L.p[i][0],L.p[i+1][1]-L.p[i][1]);L.len=len});
 var n=0;lanes.forEach(function(L,li){var cnt=li<4?5:li===4?4:2;for(var i=0;i<cnt;i++){var ty=n%9===8?3:n%3===1?1:n%5===2?2:0,m=trafficCar(ty===3?0xf2b705:cs[n%cs.length],ty);n++;G.add(m);TR.push({m:m,L:L,s:L.len*i/cnt+rnd()*20,v:li<4?22+rnd()*8:11+rnd()*4,stop:0,x:0,z:0})}});W.lanes=lanes}
function lanePos(L,s){s=((s%L.len)+L.len)%L.len;for(var i=0;i<L.p.length-1;i++){var a=L.p[i],b=L.p[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(s<=l){var t=s/l;return{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,yaw:Math.atan2(-(b[0]-a[0]),-(b[1]-a[1]))}}s-=l}var e=L.p[L.p.length-1];return{x:e[0],z:e[1],yaw:0}}
function updTraffic(dt){var on=W.traffic.visible;if(!on)return;TR.forEach(function(c){var pa=lanePos(c.L,c.s+8),blk=Math.hypot(pa.x-ST.x,pa.z-ST.z)<7&&Math.abs(ST.y-heightAt(pa.x,pa.z))<2.5;c.cv=c.cv==null?c.v:c.cv;c.cv+=((blk?0:c.v)-c.cv)*Math.min(1,dt*(blk?4:1));if(c.stop>0)c.stop-=dt;else c.s+=c.cv*dt;var p=lanePos(c.L,c.s);c.x=p.x;c.z=p.z;c.m.position.set(p.x,heightAt(p.x,p.z),p.z);c.m.rotation.y=p.yaw})}
// ---------- player car ----------
var ST={x:0,z:170,y:0,yaw:0,vx:0,vz:0,vy:0,air:false,fly:false,foldT:0,spin:0,steer:0,pitch:0,roll:0,boost:false,yawRate:0,hb:false,camMode:0,lastArea:''};
function cleanClone(src){var saved=[];src.traverse(function(o){saved.push([o,o.userData]);o.userData={}});var c;try{c=src.clone(true)}finally{saved.forEach(function(s){s[0].userData=s[1]})}return c}
function pathOf(root,node){var p=[];while(node&&node!==root){var par=node.parent;if(!par)return null;p.unshift(par.children.indexOf(node));node=par}return node===root?p:null}
function follow(root,p){var n=root;for(var i=0;i<p.length;i++){n=n.children[p[i]];if(!n)return null}return n}
function makeCar(){var rd=window.__rd;if(!rd.player||!rd.player.car)return false;var src=rd.player.car.group,body=rd.player.car.body,ent=(window.__carBodies||[]).filter(function(o){return o.body===body})[0];
 if(car){W.scene.remove(car.g)}
 var g=cleanClone(src);g.position.set(0,0,0);g.rotation.set(0,0,0);g.scale.set(1,1,1);var wheels=[],ex=body.userData.ex,rear=ex&&ex.userData.rearZ>-9?ex.userData.rearZ:2.2;
 if(ex&&ex.userData.wheels){var bp=pathOf(src,body),cb=follow(g,bp),ei=body.children.indexOf(ex),cex=cb&&cb.children[ei];if(cex)Object.keys(ex.userData.wheels).forEach(function(n){var ow=ex.userData.wheels[n],pp=pathOf(ex,ow),cw=pp&&follow(cex,pp);if(cw){cw.rotation.order='YXZ';wheels.push({g:cw,f:n[1]==='F',s:n[0]==='L'?-1:1,r:Math.max(.25,ow.userData.y0||ow.position.y||.34),y0:cw.position.y})}})}
 else if(ent&&ent.wheels){ent.wheels.forEach(function(w){var pw=pathOf(src,w.wheel),ps=pathOf(src,w.spin);var cw=pw&&follow(g,pw),cs=ps&&follow(g,ps);if(cw){cw.visible=true;wheels.push({g:cw,sp:cs,f:w.wheel.position.z<0,s:w.wheel.position.x<0?-1:1,r:.34,y0:cw.position.y})}})}
 g.traverse(function(o){if(o.isMesh){o.castShadow=o.material&&o.material.colorWrite!==false&&o.visible;o.frustumCulled=false}});
 // flight thrusters
 var th=new T.Group(),tm=new T.Basic({color:0x8fd8ff,transparent:true,opacity:.85,depthWrite:false,blending:2});[-.45,.45].forEach(function(x){var c=new T.Mesh(new T.Cyl(.16,.08,.05,14),tm);c.rotation.x=Math.PI/2;c.position.set(x,.5,rear+.06);th.add(c)});
 [[-.7,-1.1],[.7,-1.1],[-.7,1.5],[.7,1.5]].forEach(function(p){var c=new T.Mesh(new T.Cyl(.22,.22,.04,16),tm);c.position.set(p[0],.12,p[1]);th.add(c)});th.visible=false;g.add(th);
 var holder=new T.Group();holder.add(g);holder.rotation.order='YXZ';W.scene.add(holder);
 car={g:holder,inner:g,wheels:wheels,th:th,tm:tm,rear:rear,key:U().A.car};
 car.noz=[[-.45,.5,rear+.1],[.45,.5,rear+.1]];return true}
// ---------- input ----------
var K={},TI={jx:0,jy:0,gas:0,brk:0,boost:0,hb:0,up:0,dn:0};
function keyOn(e,v){if(!FR.active)return;var c=e.code;if(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)){return}if(v&&c==='KeyA'&&e.shiftKey){e.stopImmediatePropagation();e.preventDefault();if(window.__uaeAskAdmin)window.__uaeAskAdmin();return}if(FR.keyHook&&v&&FR.keyHook(c,e)){e.stopImmediatePropagation();e.preventDefault();return}if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','ShiftLeft','ShiftRight','KeyC','ControlLeft','ControlRight','KeyQ','KeyE','KeyF','KeyT','KeyV','KeyR','Escape','KeyN','KeyM','KeyP','KeyZ','KeyX'].indexOf(c)>=0||/^Key|^Digit|^Arrow/.test(c)){e.stopImmediatePropagation();if(!(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)))e.preventDefault()}
 if(v&&!K[c]){if(c==='KeyF'&&!(FR.foot&&FR.foot.on))toggleFly();if(c==='KeyT'&&!(FR.foot&&FR.foot.on))toggleTraffic();if(c==='KeyV')ST.camMode=(ST.camMode+1)%3;if(c==='KeyR')resetCar();if(c==='KeyG'&&!(FR.foot&&FR.foot.on))toggleDrift();if(c==='Escape')exit()}K[c]=v}
window.addEventListener('keydown',function(e){keyOn(e,true)},true);window.addEventListener('keyup',function(e){keyOn(e,false)},true);
function inp(){if(FR.foot&&FR.foot.on)return{t:0,b:0,s:0,hb:false,boost:false,climb:0};var t=(K.KeyW||K.ArrowUp?1:0),b=(K.KeyS||K.ArrowDown?1:0),s=(K.KeyA||K.ArrowLeft?1:0)-(K.KeyD||K.ArrowRight?1:0);
 t=Math.max(t,TI.gas);b=Math.max(b,TI.brk);if(Math.abs(TI.jx)>.08)s=-TI.jx;
 var up=(K.Space&&ST.fly?1:0)||TI.up,dn=(K.KeyC||K.ControlLeft||K.ControlRight?1:0)||TI.dn,climb=up-dn;if(ST.fly&&Math.abs(TI.jy)>.15)climb=-TI.jy;
 return{t:t,b:b,s:Math.max(-1,Math.min(1,s)),hb:!ST.fly&&(!!K.Space||!!TI.hb),boost:!!(K.ShiftLeft||K.ShiftRight||K.KeyN||TI.boost),climb:climb}}
// ---------- physics ----------
var sfx={eng:null};
function physics(dt){var k=U().A.car,st=V.stats(k),ty=V.TYRES[V.cfg(k).tyre]||V.TYRES.sport,I=inp(),fx=-Math.sin(ST.yaw),fz=-Math.cos(ST.yaw),rx=Math.cos(ST.yaw),rz=-Math.sin(ST.yaw);
 var vL=ST.vx*fx+ST.vz*fz,vT=ST.vx*rx+ST.vz*rz,surf=onRoad(ST.x,ST.z),sand=!surf&&region(ST.x,ST.z)!=='city';
 var grip=ty.grip*(sand?ty.sand:1),boostOK=I.boost&&(I.t>0||ST.air)&&!(FR.boostGate&&!FR.boostGate(dt));ST.boost=boostOK;
 var vmax=58*st.speed*(boostOK?1.32*st.boost:1)*(ST.fly?1.25:1)*(sand&&!ST.fly?.55+.35*ty.sand:1),acc=11*st.accel*(boostOK?1.6:1);
 if(!ST.air||ST.fly){
  if(I.t>0){vL+=I.t*acc*Math.max(.12,1-Math.max(0,vL)/vmax)*dt;if(vL>vmax)vL-=(vL-vmax)*Math.min(1,dt*1.5)}
  if(I.b>0){if(vL>.8)vL-=I.b*34*dt;else vL=Math.max(-14,vL-I.b*acc*.6*dt)}
  vL-=vL*(ST.fly?.08:.16)*dt+(I.t||I.b?0:Math.sign(vL)*Math.min(Math.abs(vL),2.2*dt));
  if(I.hb&&!ST.fly)vL-=Math.sign(vL)*Math.min(Math.abs(vL),5*dt);
  var kg=ST.fly?5:I.hb?.9:7.5*grip*(ty===V.TYRES.drift?.55:1)*(DR.on?.6:1);vT*=Math.exp(-kg*dt);
  var spd=Math.abs(vL),sf=ST.fly?Math.max(.55,Math.min(1,spd/10)):Math.min(1,spd/7),yr=I.s*1.75*st.hand*sf/(1+spd/55)*(vL<-.5?-1:1)*(I.hb?1.45:1);
  ST.yawRate+=(yr-ST.yawRate)*Math.min(1,dt*(ST.fly?4:8));ST.yaw+=ST.yawRate*dt;
  // drift: handbrake + steer kicks the tail out
  if(I.hb&&spd>8)vT+=-I.s*spd*.9*dt}
 ST.steer+=(I.s-ST.steer)*Math.min(1,dt*10);
 fx=-Math.sin(ST.yaw);fz=-Math.cos(ST.yaw);rx=Math.cos(ST.yaw);rz=-Math.sin(ST.yaw);
 ST.vx=fx*vL+rx*vT;ST.vz=fz*vL+rz*vT;ST.vL=vL;ST.vT=vT;ST.hb=I.hb;
 var nx=ST.x+ST.vx*dt,nz=ST.z+ST.vz*dt;nx=Math.max(X0+30,Math.min(X1-30,nx));nz=Math.max(Z0+30,Math.min(Z1-30,nz));
 if(nx<-1040&&nz>100&&!ST.fly){nz=100;ST.vz=Math.min(0,ST.vz)}
 ST.x=nx;ST.z=nz;collide();
 var g=heightAt(ST.x,ST.z);
 if(ST.fly){ST.vy+=(I.climb*16-ST.vy)*Math.min(1,dt*3);ST.y+=ST.vy*dt;var hm=g+1.1;if(ST.y<hm){ST.y=hm;ST.vy=Math.max(0,ST.vy)}if(ST.y>520){ST.y=520;ST.vy=Math.min(0,ST.vy)}ST.air=true}
 else if(ST.air){ST.vy-=24*dt;ST.y+=ST.vy*dt;if(ST.y<=g){if(ST.vy<-5)landFX(Math.min(1,-ST.vy/18));ST.y=g;ST.vy=0;ST.air=false}}
 else{var ny=g,pred=ST.y+ST.vy*dt-12*dt*dt;if(pred>g+.08&&ST.vy>2){ST.air=true;ST.y=pred;ST.vy-=24*dt;takeoffFX()}else{var vy=(ny-ST.y)/Math.max(dt,1e-3);ST.vy=Math.max(-30,Math.min(28,vy));ST.y=ny}}
 // body attitude
 var fl=1.6,hf=heightAt(ST.x+fx*fl,ST.z+fz*fl),hb2=heightAt(ST.x-fx*fl,ST.z-fz*fl),hr=heightAt(ST.x+rx,ST.z+rz),hl=heightAt(ST.x-rx,ST.z-rz);
 var tp,tr;if(ST.fly){tp=Math.max(-.35,Math.min(.35,ST.vy*.022));tr=Math.max(-.5,Math.min(.5,ST.yawRate*.32))}else if(ST.air){tp=ST.pitch*.98;tr=ST.roll*.98}else{tp=Math.atan2(hf-hb2,fl*2);tr=Math.atan2(hr-hl,2)-Math.max(-.06,Math.min(.06,vT*.01))}
 ST.pitch+=(tp-ST.pitch)*Math.min(1,dt*8);ST.roll+=(tr-ST.roll)*Math.min(1,dt*8);
 ST.foldT+=((ST.fly?1:0)-ST.foldT)*Math.min(1,dt*3.5);ST.spin+=vL*dt;ST.sand=sand;ST.kmh=Math.abs(vL)*3.6;ST.vmaxK=58*st.speed*1.32*st.boost*1.25*3.6}
function collide(){var r=1.25,i0=Math.floor((ST.x-r-X0)/CC),i1=Math.floor((ST.x+r-X0)/CC),j0=Math.floor((ST.z-r-Z0)/CC),j1=Math.floor((ST.z+r-Z0)/CC),hit=0;
 for(var i=i0;i<=i1;i++)for(var j=j0;j<=j1;j++){var L=COL[ckey(i,j)];if(!L)continue;for(var q=0;q<L.length;q++){var o=L[q];if(ST.y>o.top+.3)continue;var cx,cz;
  if(o.t==='b'){cx=Math.max(o.x0,Math.min(o.x1,ST.x));cz=Math.max(o.z0,Math.min(o.z1,ST.z))}else{var dx=ST.x-o.x,dz=ST.z-o.z,d=Math.hypot(dx,dz)||1;cx=o.x+dx/d*o.r;cz=o.z+dz/d*o.r}
  var ex=ST.x-cx,ez=ST.z-cz,dd=Math.hypot(ex,ez);var inside=o.t==='b'&&ST.x>o.x0&&ST.x<o.x1&&ST.z>o.z0&&ST.z<o.z1;if(o.t==='c'&&Math.hypot(ST.x-o.x,ST.z-o.z)<o.r)inside=true;
  if(dd<r||inside){var nx2,nz2;if(inside){if(o.t==='b'){var a=[ST.x-o.x0,o.x1-ST.x,ST.z-o.z0,o.z1-ST.z],m=Math.min.apply(null,a),ai=a.indexOf(m);nx2=ai===0?-1:ai===1?1:0;nz2=ai===2?-1:ai===3?1:0;ST.x+=nx2*(m+r);ST.z+=nz2*(m+r)}else{var d2=Math.hypot(ST.x-o.x,ST.z-o.z)||1;nx2=(ST.x-o.x)/d2;nz2=(ST.z-o.z)/d2;ST.x=o.x+nx2*(o.r+r);ST.z=o.z+nz2*(o.r+r)}}
   else{nx2=ex/(dd||1);nz2=ez/(dd||1);ST.x=cx+nx2*r;ST.z=cz+nz2*r}
   var vn=ST.vx*nx2+ST.vz*nz2;if(vn<0){ST.vx-=nx2*vn*1.45;ST.vz-=nz2*vn*1.45;hit=Math.max(hit,-vn)}}}}
 // traffic
 if(W.traffic.visible)TR.forEach(function(c){if(Math.abs(ST.y-heightAt(c.x,c.z))>2.2)return;var dx=ST.x-c.x,dz=ST.z-c.z,d=Math.hypot(dx,dz);if(d<2.6&&d>0){var nx3=dx/d,nz3=dz/d;ST.x=c.x+nx3*2.6;ST.z=c.z+nz3*2.6;var vn2=ST.vx*nx3+ST.vz*nz3;if(vn2<0){ST.vx-=nx3*vn2*1.4;ST.vz-=nz3*vn2*1.4;hit=Math.max(hit,-vn2)}c.stop=1.5}});
 if(hit>6){crashFX(hit);driftWipe()}}
// ---------- drift mode + skid marks ----------
var DR={on:false,score:0,cur:0,combo:1,t:0,idle:0,best:+(localStorage.getItem('uae_drift_best')||0),ang:0,msgT:0};FR.DR=DR;
var SK=null,skI=0;
function skids(){if(SK)return;SK=[];var g=new T.Plane(.34,1),m=new T.Basic({color:0x111111,transparent:true,opacity:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});
 for(var i=0;i<260;i++){var q=new T.Mesh(g,m);q.rotation.order='YXZ';q.visible=false;q.renderOrder=2;W.scene.add(q);SK.push(q)}}
var skL=[0,0];function skidMark(){skids();if(Math.hypot(ST.x-skL[0],ST.z-skL[1])<.7)return;skL=[ST.x,ST.z];wheelWorld().forEach(function(w){if(w.f)return;var q=SK[skI++%SK.length];q.position.set(w.x,heightAt(w.x,w.z)+.12,w.z);q.rotation.set(-Math.PI/2,0,0);q.rotation.y=ST.yaw;q.scale.y=Math.max(.6,Math.hypot(ST.vx,ST.vz)*.05);q.visible=true})}
function callout(t){var e=hudEl&&hudEl.querySelector('.dcall');if(!e)return;e.textContent=t;e.style.opacity=1;DR.msgT=2}
function driftUpd(dt){var sp=Math.hypot(ST.vx,ST.vz),ang=Math.atan2(Math.abs(ST.vT||0),Math.abs(ST.vL||0))*57.3;DR.ang=ang;
 var sliding=!ST.air&&!ST.fly&&sp>7&&ang>11&&ang<100;
 if(sliding&&(!ST.sand||true)){skidMark();if(DR.on){DR.t+=dt;DR.combo=Math.min(8,1+Math.floor(DR.t/1.5));DR.cur+=ang*sp*dt*.08*DR.combo;DR.idle=0}}
 else if(DR.on&&DR.cur>0){DR.idle+=dt;if(DR.idle>.7){var c=Math.round(DR.cur);DR.score+=c;callout(c>=5000?'🔥 TAFHEET! تفحيط  +'+c:c>=2000?'GREAT DRIFT! درفت قوي  +'+c:c>=400?'NICE DRIFT! درفت حلو  +'+c:'+'+c);if(DR.score>DR.best){DR.best=DR.score;try{localStorage.setItem('uae_drift_best',DR.best)}catch(e){}}DR.cur=0;DR.t=0;DR.combo=1}}
 if(DR.msgT>0){DR.msgT-=dt;if(DR.msgT<=0){var e=hudEl.querySelector('.dcall');if(e)e.style.opacity=0}}
 var p=hudEl&&hudEl.querySelector('.drift');if(p){p.style.display=DR.on?'block':'none';if(DR.on){p.querySelector('.ds').textContent=Math.round(DR.score).toLocaleString('en-US');p.querySelector('.dc').textContent=DR.cur>0?('+'+Math.round(DR.cur)+'  x'+DR.combo):'';p.querySelector('.db').textContent='BEST '+Math.round(DR.best).toLocaleString('en-US');p.querySelector('.da i').style.width=Math.min(100,ang/60*100)+'%';p.querySelector('.dn').textContent=Math.round(Math.min(ang,90))+'°'}}}
function driftWipe(){if(DR.on&&DR.cur>0){DR.cur=0;DR.t=0;DR.combo=1;callout('💥 WIPEOUT · اصطدام')}}
function toggleDrift(){DR.on=!DR.on;DR.cur=0;DR.score=0;DR.combo=1;var b=document.getElementById('fr-drift');if(b)b.classList.toggle('on',DR.on);toast(DR.on?'🌀 Drift mode ON — handbrake + steer to slide':'🌀 Drift mode OFF')}
FR.toggleDrift=toggleDrift;
// ---------- particles / sound ----------
var emT=0,flT=0;
function wheelWorld(){var out=[],v=new CL.V3();if(!car)return out;car.wheels.forEach(function(w){w.g.getWorldPosition(v);out.push({x:v.x,y:v.y,z:v.z,f:w.f,s:w.s})});return out}
function dust(){return ST.sand?(region(ST.x,ST.z)==='jais'?0xa89888:0xe0b07a):0xdedede}
function takeoffFX(){var P=W.pool;wheelWorld().forEach(function(w){if(w.f)return;for(var i=0;i<4;i++)P.emit(w.x+(Math.random()-.5)*.4,heightAt(w.x,w.z)+.2,w.z+(Math.random()-.5)*.4,(Math.random()-.5)*2,.8+Math.random(),(Math.random()-.5)*2,.4,1.8,.8,dust(),.55)})}
function landFX(s){var P=W.pool;wheelWorld().forEach(function(w){for(var i=0;i<5;i++){var a=Math.random()*Math.PI*2;P.emit(w.x,heightAt(w.x,w.z)+.15,w.z,Math.cos(a)*(2+3*s),.5+Math.random()*1.5*s,Math.sin(a)*(2+3*s),.5,2.4+s,1,dust(),.6)}});if(s>.5)V.exhaustPop&&V.exhaustPop(.15)}
function crashFX(h){var P=W.pool,fx=-Math.sin(ST.yaw),fz=-Math.cos(ST.yaw);for(var i=0;i<12;i++)P.emit(ST.x+fx*2,ST.y+.6,ST.z+fz*2,(Math.random()-.5)*8,Math.random()*5,(Math.random()-.5)*8,.25,.05,.4,0xffb040,1,true);FR.shake=Math.min(1,h/25);thud(Math.min(1,h/30))}
function thud(g){var au=window.__audio;if(!au||!au.ctx||au.muted||!au.enabled)return;try{var c=au.ctx,t=c.currentTime,o=c.createOscillator(),gg=c.createGain();o.type='triangle';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(40,t+.25);gg.gain.setValueAtTime(.35*g,t);gg.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(gg);gg.connect(au.master||c.destination);o.start(t);o.stop(t+.32)}catch(e){}}
function effects(dt){var P=W.pool;emT-=dt;flT-=dt;var v=new CL.V3();
 if(!ST.air&&!ST.fly&&emT<=0){var slide=Math.abs(ST.vT||0)>3.2&&Math.abs(ST.vL)>5,hbS=ST.hb&&Math.abs(ST.vL)>5,sandD=ST.sand&&Math.abs(ST.vL)>8;if(slide||hbS||sandD){emT=sandD&&!slide?.05:.03;wheelWorld().forEach(function(w){if(w.f&&!sandD)return;P.emit(w.x+(Math.random()-.5)*.3,heightAt(w.x,w.z)+.25,w.z+(Math.random()-.5)*.3,(Math.random()-.5)*1.5-ST.vx*.05,.6+Math.random()*.8,(Math.random()-.5)*1.5-ST.vz*.05,.45,2.4,slide||hbS?1.3:.9,slide||hbS?0xe8e8e8:dust(),slide||hbS?.5:.45)})}}
 if((ST.fly||ST.air)&&car&&flT<=0){flT=.03;var col2=V.exhaustCol(),big=ST.boost?1.5:1;car.noz.forEach(function(n){v.set(n[0],n[1],n[2]);car.inner.localToWorld(v);var b=-Math.sin(ST.yaw),c=-Math.cos(ST.yaw);
   P.emit(v.x,v.y,v.z,-b*3+(Math.random()-.5)*.5,(Math.random()-.5)*.4,-c*3+(Math.random()-.5)*.5,.25,1.3*big,ST.fly?.9:.6,0xdcdcdc,.42);
   if(ST.fly)P.emit(v.x,v.y,v.z,-b*6,(Math.random()-.5)*.3,-c*6,.32*big,.05,.18,ST.boost?0xff6a2a:col2,.95,true)});
  if(ST.fly){var gnd=heightAt(ST.x,ST.z),alt=ST.y-gnd;if(alt<7&&Math.random()<.6){var a=Math.random()*Math.PI*2;P.emit(ST.x+Math.cos(a)*1.5,gnd+.2,ST.z+Math.sin(a)*1.5,Math.cos(a)*4,.5,Math.sin(a)*4,.5,2.6,.9,dust(),.4*(1-alt/7))}}}
 P.update(dt,W.cam,0)}
function engine(on){var au=window.__audio;if(!au||!au.ctx)return;var c=au.ctx;if(on&&!sfx.eng){try{var o=c.createOscillator(),o2=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o2.type='square';f.type='lowpass';f.frequency.value=600;g.gain.value=0;o.connect(f);o2.connect(f);f.connect(g);g.connect(au.master||c.destination);o.start();o2.start();sfx.eng={o:o,o2:o2,f:f,g:g}}catch(e){}}
 if(!on&&sfx.eng){try{sfx.eng.g.gain.setTargetAtTime(0,c.currentTime,.05);var e=sfx.eng;setTimeout(function(){try{e.o.stop();e.o2.stop()}catch(_){}},300)}catch(e2){}sfx.eng=null}}
function engineUpd(){var e=sfx.eng,au=window.__audio;if(!e||!au||!au.ctx)return;var c=au.ctx,l=V.cfg().mods.exhaust||0,kmh=ST.kmh,gr=[0,60,110,160,215,270,9e9],g=1;while(kmh>gr[g]&&g<6)g++;var rpm=(kmh-gr[g-1])/Math.max(1,Math.min(gr[g],400)-gr[g-1]);
 var base=ST.fly?90:38+rpm*85+g*6;e.o.frequency.setTargetAtTime(base,c.currentTime,.05);e.o2.frequency.setTargetAtTime(base*.5,c.currentTime,.05);e.f.frequency.setTargetAtTime(500+l*350+rpm*700,c.currentTime,.08);
 var I=inp();e.g.gain.setTargetAtTime((au.muted||!au.enabled)?0:(.035+.03*I.t+(ST.boost?.03:0))*(1+l*.25),c.currentTime,.08)}
// ---------- per-frame ----------
var lastT=0,tmpV=null;
FR.frame=function(){var now=performance.now(),dt=Math.max(0,Math.min(.05,(now-lastT)/1000||.016));lastT=now;if(!ready)return;
 if(!car||car.key!==U().A.car||FR.pending){var ex=window.__rd.player&&window.__rd.player.car.body.userData.ex,k=U().A.car,gl=U().GLB[k];var okc=k==='roadster'?!ex:(ex&&(!gl||gl.st!=='ok'||ex.userData.wheels));if(okc&&(!gl||gl.st==='ok'||gl.st==='fail'||k==='roadster')){FR.pending=false;makeCar()}}
 if(FR.foot&&FR.foot.on){ST.vx*=.9;ST.vz*=.9;ST.vL=0;ST.vT=0;ST.kmh=0;ST.boost=false}else if(FR.physOverride)FR.physOverride(dt);else physics(dt);updTraffic(dt);if(hudEl)driftUpd(dt);
 if(car){var h=car.g;h.position.set(ST.x,ST.y,ST.z);h.rotation.set(ST.pitch,ST.yaw,ST.roll);if(FR.carQuat&&FR.physOverride)h.quaternion.copy(FR.carQuat);
  car.wheels.forEach(function(w){var o=w.g,sp=w.sp||o;sp.rotation.x=-ST.spin/w.r;if(!w.sp)o.rotation.y=w.f?ST.steer*.42*(1-ST.foldT):0;else o.rotation.y=w.f?ST.steer*.42*(1-ST.foldT):0;o.rotation.z=w.s*ST.foldT*Math.PI/2;o.position.y=w.y0+ST.foldT*.18});
  car.th.visible=ST.foldT>.3;car.tm.opacity=(.5+.4*Math.sin(now*.03))*ST.foldT}
 effects(dt);
 // camera
 var cam=W.cam;if(FR.foot&&FR.foot.on){FR.foot.cam(cam,dt)}else{var fx=-Math.sin(ST.yaw),fz=-Math.cos(ST.yaw),sp=Math.abs(ST.vL||0),md=[[7.2,2.5],[13,5],[4.6,1.6]][ST.camMode],dist=md[0]+sp*.035+(ST.fly?3:0),hh=md[1]+(ST.fly?1.2:0);
 if(!tmpV){tmpV=new CL.V3();W.camPos=new CL.V3(ST.x-fx*dist,ST.y+hh,ST.z-fz*dist)}
 var cy=ST.camYaw==null?ST.yaw:ST.camYaw;var dy=ST.yaw-cy;while(dy>Math.PI)dy-=Math.PI*2;while(dy<-Math.PI)dy+=Math.PI*2;ST.camYaw=cy+dy*Math.min(1,dt*(ST.camMode===2?20:4.5));
 var cfx=-Math.sin(ST.camYaw),cfz=-Math.cos(ST.camYaw);tmpV.set(ST.x-cfx*dist,ST.y+hh,ST.z-cfz*dist);var cg=heightAt(tmpV.x,tmpV.z)+1.2;if(tmpV.y<cg)tmpV.y=cg;
 W.camPos.lerp(tmpV,Math.min(1,dt*7));cam.position.copy(W.camPos);
 if(FR.shake>0){FR.shake=Math.max(0,FR.shake-dt*2.5);cam.position.x+=(Math.random()-.5)*FR.shake*.5;cam.position.y+=(Math.random()-.5)*FR.shake*.5}
 cam.lookAt(ST.x+cfx*4,ST.y+1.1+(ST.camMode===2?.2:0),ST.z+cfz*4);
 }
 var asp=innerWidth/innerHeight;cam.fov=asp<.9?72:60;cam.aspect=asp;cam.updateProjectionMatrix();
 W.sky.position.copy(cam.position);
 if(W.sun){W.sun.position.set(ST.x-120,ST.y+220,ST.z+90);W.sun.target.position.set(ST.x,ST.y,ST.z);W.sun.target.updateMatrixWorld()}
 if(W.flag)W.flag.rotation.y=Math.sin(now*.002)*.15;
 engineUpd();hud(dt);if(FR.onFrame)try{FR.onFrame(dt)}catch(e){if(!FR._e){FR._e=1;console.warn('fr hook',e)}}};
// ---------- controls ----------
function toggleFly(){ST.fly=!ST.fly;if(ST.fly){ST.vy=Math.max(ST.vy,6);ST.air=true;toast('✈️ Flight mode ON — Space/▲ climb, C/▼ descend')}else{toast('🚗 Flight mode OFF — landing')}var b=document.getElementById('fr-fly');if(b)b.classList.toggle('on',ST.fly)}
function toggleTraffic(){W.traffic.visible=!W.traffic.visible;toast(W.traffic.visible?'🚦 Traffic ON':'🚦 Traffic OFF');var b=document.getElementById('fr-trf');if(b)b.classList.toggle('on',W.traffic.visible)}
var SPAWNS={city:[0,170,0],szr:[-420,-9.5,Math.PI/2],ad:[-1240,26,Math.PI/2],desert:[0,430,Math.PI],arena:[240,330,Math.PI/2],jais:[440,-28,-Math.PI/2]};
function teleport(k){setTimeout(function(){FR.onTp&&FR.onTp()},0);var s=SPAWNS[k];ST.x=s[0];ST.z=s[1];ST.yaw=s[2];if(k!=='city'&&k!=='szr'&&k!=='arena')resetCar(1);ST.vx=ST.vz=ST.vy=0;ST.y=heightAt(ST.x,ST.z);ST.air=ST.fly;if(ST.fly)ST.y+=4;ST.camYaw=ST.yaw;if(W.camPos){var fx=-Math.sin(ST.yaw),fz=-Math.cos(ST.yaw);W.camPos.set(ST.x-fx*8,ST.y+3,ST.z-fz*8)}}
function resetCar(q){setTimeout(function(){FR.onTp&&FR.onTp()},0);var best=null,bd=1e9;ROADS.forEach(function(r){r.pts.forEach(function(p,i){var d=Math.hypot(p[0]-ST.x,p[1]-ST.z);if(d<bd){bd=d;best={p:p,n:r.pts[i+1]||r.pts[i-1]}}})});if(best){ST.x=best.p[0];ST.z=best.p[1];ST.yaw=Math.atan2(-(best.n[0]-best.p[0]),-(best.n[1]-best.p[1]))}ST.vx=ST.vz=ST.vy=0;ST.y=heightAt(ST.x,ST.z);ST.air=ST.fly;if(!q)toast('⟲ Reset to road')}
FR.teleport=teleport;FR.W=W;FR.heightAt=heightAt;FR.region=region;FR.AREAS=AREAS;FR.getCar=function(){return car};FR.colQuery=function(x,z,r,y){var out=[],i0=Math.floor((x-r-X0)/CC),i1=Math.floor((x+r-X0)/CC),j0=Math.floor((z-r-Z0)/CC),j1=Math.floor((z+r-Z0)/CC);for(var i=i0;i<=i1;i++)for(var j=j0;j<=j1;j++){var L=COL[ckey(i,j)];if(L)L.forEach(function(o){if(y<=o.top+.3&&out.indexOf(o)<0)out.push(o)})}return out};FR.trafficList=TR;FR.toast=function(t){toast(t)};FR.hudEl=function(){return hudEl};FR.trafficCar=function(c,t){return trafficCar(c,t)};FR.Merge=Merge;FR.M4=M4;FR.col=col;FR.isTouch=function(){return isTouch()};FR.toggleFly=toggleFly;FR.toggleTraffic=toggleTraffic;FR.inp=inp;FR.ST=ST;FR.input=TI;FR.keys=K;
Object.defineProperty(FR,'scene',{get:function(){return W.scene}});Object.defineProperty(FR,'cam',{get:function(){return W.cam}});
FR.kmh=function(){return ST.kmh||0};FR.maxKmh=function(){return Math.max(200,ST.vmaxK||300)};FR.boosting=function(){return !!ST.boost};FR.flying=function(){return ST.fly};
// ---------- HUD ----------
var css=`
#fr{position:fixed;inset:0;z-index:40;pointer-events:none;font:14px Arial,Helvetica,sans-serif;color:#fff;user-select:none;-webkit-user-select:none;touch-action:none}
#fr button{pointer-events:auto;font:700 14px Arial;color:#fff;background:rgba(10,12,18,.62);border:1px solid rgba(255,255,255,.25);border-radius:12px;cursor:pointer;-webkit-tap-highlight-color:transparent}
#fr button.on{background:#f3d77a;color:#111;border-color:#f3d77a}
#fr .top{position:absolute;top:max(10px,env(safe-area-inset-top));left:10px;display:flex;gap:5px;flex-wrap:wrap;max-width:calc(100vw - 220px);z-index:5}
#fr .top button{height:36px;padding:0 10px;font-size:13px}
#fr .area{position:absolute;top:64px;left:50%;transform:translateX(-50%);padding:8px 18px;border-radius:999px;background:rgba(10,12,18,.55);font-weight:700;letter-spacing:.5px;transition:opacity .6s;white-space:nowrap}
#fr canvas.map{position:absolute;top:max(10px,env(safe-area-inset-top));right:10px;width:180px;height:180px;border-radius:50%;box-shadow:0 4px 16px rgba(0,0,0,.45);border:2px solid rgba(243,215,122,.7);pointer-events:auto}
#fr .help{position:absolute;left:12px;bottom:12px;background:rgba(10,12,18,.6);border-radius:12px;padding:10px 12px;font-size:12px;line-height:1.6;transition:opacity 1s;max-width:330px}
#fr .help b{display:inline-block;min-width:16px;padding:0 5px;margin-right:3px;border:1px solid rgba(255,255,255,.4);border-radius:4px;text-align:center}
#fr .menu{position:absolute;top:58px;left:10px;background:rgba(10,12,18,.9);border-radius:14px;padding:10px;display:none;pointer-events:auto;max-width:min(520px,calc(100vw - 20px));max-height:calc(100vh - 140px);overflow:auto}
#fr .menu h5{margin:6px 4px;font-size:11px;letter-spacing:1.4px;color:#c9c2ad;text-transform:uppercase}
#fr .menu .g{display:flex;flex-wrap:wrap;gap:6px}
#fr .menu button{padding:8px 10px;font-size:13px}
#fr .drift{position:absolute;top:110px;left:50%;transform:translateX(-50%);display:none;text-align:center;background:rgba(10,12,18,.55);border-radius:14px;padding:8px 18px;min-width:220px}
#fr .drift .ds{font:800 32px Arial;color:#f3d77a}#fr .drift .dc{font:700 16px Arial;color:#7be3a6;min-height:20px}#fr .drift .da{height:8px;border-radius:5px;background:rgba(255,255,255,.15);margin:6px 0 2px;overflow:hidden}#fr .drift .da i{display:block;height:100%;width:0;background:linear-gradient(90deg,#00c46a,#f3d77a,#ff3b30)}
#fr .drift .dn,#fr .drift .db,#fr .drift .dl{font-size:11px;color:#ddd}#fr .dcall{position:absolute;top:42%;left:50%;transform:translate(-50%,-50%);font:900 34px Arial;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.7);opacity:0;transition:opacity .4s;white-space:nowrap;pointer-events:none}
#fr .touch{display:none}
#fr.touch .touch{display:block}
#fr.touch .help{display:none}
#fr .joy{position:absolute;left:24px;bottom:28px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.3);pointer-events:auto;touch-action:none}
#fr .joy i{position:absolute;left:50%;top:50%;width:62px;height:62px;margin:-31px 0 0 -31px;border-radius:50%;background:rgba(243,215,122,.85);box-shadow:0 2px 10px rgba(0,0,0,.4)}
#fr .ped{position:absolute;right:20px;bottom:24px;display:flex;gap:12px;align-items:flex-end}
#fr .ped button{width:78px;border-radius:16px;touch-action:none}
#fr .ped .gas{height:150px;background:rgba(0,132,61,.6)}
#fr .ped .brk{height:100px;background:rgba(200,16,46,.55)}
#fr .acts{position:absolute;right:20px;bottom:190px;display:grid;grid-template-columns:repeat(2,66px);gap:10px}
#fr .acts button{height:58px;font-size:20px;touch-action:none}
#fr .acts button small{display:block;font-size:10px}
#fr .alt{position:absolute;left:190px;bottom:40px;display:none;flex-direction:column;gap:10px}
#fr.flying .alt{display:flex}
#fr .alt button{width:62px;height:56px;font-size:20px;touch-action:none}
body.v10-fr #menu,body.v10-fr [id^="u-"]:not(#u-toast):not(#u-panel):not(#u-fab){display:none!important}
body.v10-fr #u-fab.show{display:flex!important;z-index:100050!important}
body.v10-fr #u-panel{z-index:100060!important;pointer-events:auto!important}
body.v10-fr .u-modal-bg{z-index:100070!important;pointer-events:auto!important}
#fr .top button.adm-r{min-width:36px;padding:7px 10px;opacity:.85;font-weight:900;letter-spacing:1px;color:#f3d77a;border-color:rgba(243,215,122,.45)}
body.v10-fr #v10-gauge{bottom:16px;right:206px}
body.v10-fr.fr-touch #v10-gauge{top:120px;bottom:auto;left:12px;right:auto;width:120px;height:120px}
@media (max-width:820px){#fr canvas.map{width:140px;height:140px}#fr .top{max-width:calc(100vw - 165px)}#fr .top button{height:38px;padding:0 9px;font-size:13px}#fr .area{top:auto;bottom:200px;font-size:12px}}
`;
var hudEl,mapC,mapG,mapSrc,areaEl,areaT=0,helpT=8;
function toast(t){var u=U();if(u&&u.toast)u.toast(t)}
function mkHud(){if(hudEl)return;var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 hudEl=document.createElement('div');hudEl.id='fr';hudEl.innerHTML='<div class="top"><button data-a="exit">✕ Exit</button><button data-a="menu">🚗 Car &amp; map</button><button data-a="fly" id="fr-fly">✈️ Fly</button><button data-a="trf" id="fr-trf" class="on">🚦 Traffic</button><button data-a="drift" id="fr-drift">🌀 Drift</button><button data-a="cam">📷 Cam</button><button data-a="reset">⟲</button></div>'+
 '<div class="drift"><div class="ds">0</div><div class="dc"></div><div class="da"><i></i></div><div class="dn">0°</div><div class="db"></div><div class="dl">DRIFT SCORE · نقاط التفحيط</div></div><div class="dcall"></div><div class="menu"></div><div class="area"></div><canvas class="map" width="360" height="360"></canvas>'+
 '<div class="help"><b>W</b><b>A</b><b>S</b><b>D</b> / arrows drive · <b>Space</b> handbrake drift · <b>Shift</b> boost<br><b>F</b> fly mode (<b>Space</b> climb · <b>C</b> descend) · <b>G</b> drift mode · <b>T</b> traffic · <b>V</b> camera · <b>R</b> reset · <b>Shift+A</b> admin · <b>Esc</b> exit</div>'+
 '<div class="touch"><div class="joy"><i></i></div><div class="alt"><button data-h="up">▲</button><button data-h="dn">▼</button></div><div class="acts"><button data-h="boost">🔥<small>BOOST</small></button><button data-h="hb">✋<small>DRIFT</small></button></div><div class="ped"><button class="brk" data-h="brk">BRAKE<br>◀ REV</button><button class="gas" data-h="gas">GAS</button></div></div>';
 document.body.appendChild(hudEl);mapC=hudEl.querySelector('canvas.map');mapG=mapC.getContext('2d');areaEl=hudEl.querySelector('.area');
 ['pointerdown','pointerup','touchstart','touchend','touchmove','mousedown','mouseup','click','wheel','contextmenu'].forEach(function(ev){hudEl.addEventListener(ev,function(e){e.stopPropagation();if(ev==='contextmenu'||ev==='touchmove')e.preventDefault()},{passive:false})});
 hudEl.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var a=b.dataset.a;if(a==='exit')exit();if(a==='fly')toggleFly();if(a==='trf')toggleTraffic();if(a==='drift')toggleDrift();if(a==='cam')ST.camMode=(ST.camMode+1)%3;if(a==='reset')resetCar();if(a==='menu')menu();
  if(b.dataset.tp){teleport(b.dataset.tp);menu(false)}if(b.dataset.car){var u=U();if(true){u.A.car=b.dataset.car;u.save();u.applyCar();FR.pending=true;menu(false);toast(u.CARS[b.dataset.car].en)}else toast('🔒 '+u.needText(u.CARS[b.dataset.car]))}});
 // hold buttons
 hudEl.querySelectorAll('[data-h]').forEach(function(b){var k=b.dataset.h,on=function(e){e.preventDefault();TI[k]=1;b.classList.add('on')},off=function(e){TI[k]=0;b.classList.remove('on')};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off)});
 // joystick
 var jy=hudEl.querySelector('.joy'),kn=jy.querySelector('i'),jid=null;function jmove(e){var r=jy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,m=r.width/2,d=Math.hypot(dx,dy);if(d>m){dx*=m/d;dy*=m/d}TI.jx=dx/m;TI.jy=dy/m;kn.style.transform='translate('+dx+'px,'+dy+'px)'}
 jy.addEventListener('pointerdown',function(e){jid=e.pointerId;try{jy.setPointerCapture(jid)}catch(_){}jmove(e)});jy.addEventListener('pointermove',function(e){if(e.pointerId===jid)jmove(e)});
 var jend=function(e){if(e.pointerId!==jid)return;jid=null;TI.jx=TI.jy=0;kn.style.transform=''};jy.addEventListener('pointerup',jend);jy.addEventListener('pointercancel',jend);
 mapC.addEventListener('click',function(){mapC._big=!mapC._big})}
function menu(force){var m=hudEl.querySelector('.menu'),show=force==null?m.style.display!=='block':force;if(!show){m.style.display='none';return}var u=U();
 m.innerHTML='<h5>Drive to · انتقل إلى</h5><div class="g">'+Object.keys(AREAS).map(function(k){return '<button data-tp="'+k+'">'+AREAS[k].split(' · ')[0]+'</button>'}).join('')+'</div><h5>Switch car · بدّل السيارة (all unlocked in Free Roam)</h5><div class="g">'+Object.keys(u.CARS).map(function(k){var c=u.CARS[k],ok=true;return '<button data-car="'+k+'" class="'+(u.A.car===k?'on':'')+'" style="'+(ok?'':'opacity:.45')+'">'+c.icon+' '+c.en+(ok?'':' 🔒')+'</button>'}).join('')+'</div>';m.style.display='block'}
function buildMinimap(){var w=600,h=Math.round(600*(Z1-Z0)/(X1-X0)),c=document.createElement('canvas');c.width=w;c.height=h;var g=c.getContext('2d'),im=g.createImageData(w,h);
 for(var j=0;j<h;j++)for(var i=0;i<w;i++){var x=X0+(i+.5)/w*(X1-X0),z=Z0+(j+.5)/h*(Z1-Z0),hh=heightAt(x,z),r=onRoad(x,z),rg=region(x,z),cc;
  if(x<-1040&&z>100)cc=[60,140,180];else if(r)cc=r===2?[70,70,76]:[95,95,100];else if(rg==='desert')cc=[226,170,104];else if(mount0(x,z)>2){var t=Math.min(1,hh/250);cc=[140+30*t,108+40*t,86+46*t]}else cc=[214,200,170];
  var o=(j*w+i)*4;im.data[o]=cc[0];im.data[o+1]=cc[1];im.data[o+2]=cc[2];im.data[o+3]=255}
 g.putImageData(im,0,0);var sx=w/(X1-X0),sz=h/(Z1-Z0),P=function(x,z){return[(x-X0)*sx,(z-Z0)*sz]};
 g.fillStyle='rgba(40,48,60,.55)';Object.keys(COL).forEach(function(k){COL[k].forEach(function(o){if(o._m)return;o._m=1;if(o.t==='b'&&o.top>8){var a=P(o.x0,o.z0),b=P(o.x1,o.z1);g.fillRect(a[0],a[1],Math.max(1,b[0]-a[0]),Math.max(1,b[1]-a[1]))}})});
 Object.keys(COL).forEach(function(k){COL[k].forEach(function(o){o._m=0})});
 var lbl=function(t,x,z){var p=P(x,z);g.font='bold 15px Arial';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.6)';g.strokeText(t,p[0],p[1]);g.fillStyle='#fff';g.fillText(t,p[0],p[1])};
 var ic=function(t,x,z){var p=P(x,z);g.font='18px Arial';g.textAlign='center';g.fillText(t,p[0],p[1]+6)};
 ic('🏙️',40,-40);ic('🖼️',-120,120);ic('🕌',-1330,-210);ic('⛰️',MT.x,MT.z);
 lbl('DOWNTOWN',0,-280);lbl('SHEIKH ZAYED RD',-700,-60);lbl('ABU DHABI',-1350,-320);lbl('DESERT',100,700);lbl('JEBEL JAIS',MT.x,MT.z+90);
 mapSrc=c}
function drawMap(){var W2=mapC.width,H2=mapC.height,g=mapG,span=mapC._big?2400:760,sx=mapSrc.width/(X1-X0),sz=mapSrc.height/(Z1-Z0);g.clearRect(0,0,W2,H2);g.save();g.beginPath();g.arc(W2/2,H2/2,W2/2,0,Math.PI*2);g.clip();g.fillStyle='#2b6f8f';g.fillRect(0,0,W2,H2);
 var cx=mapC._big?(X0+X1)/2-150:ST.x,cz=mapC._big?(Z0+Z1)/2:ST.z,x0=(cx-span/2-X0)*sx,z0=(cz-span/2-Z0)*sz;g.drawImage(mapSrc,x0,z0,span*sx,span*sz,0,0,W2,H2);
 var P=function(x,z){return[(x-(cx-span/2))/span*W2,(z-(cz-span/2))/span*H2]};
 if(W.traffic.visible){g.fillStyle='#ffe25c';TR.forEach(function(c){var p=P(c.x,c.z);g.fillRect(p[0]-2,p[1]-2,4,4)})}
 if(FR.mapMarks)try{FR.mapMarks().forEach(function(m){var q=P(m.x,m.z);if(q[0]<-20||q[1]<-20||q[0]>W2+20||q[1]>H2+20)return;g.fillStyle=m.c||'#fff';g.beginPath();g.arc(q[0],q[1],m.r||9,0,7);g.fill();g.strokeStyle='#000';g.lineWidth=2;g.stroke();g.font=(m.fs||13)+'px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(m.i||'',q[0],q[1]+1);g.textBaseline='alphabetic'})}catch(e){}
 var p=P(ST.x,ST.z);g.translate(p[0],p[1]);g.rotate(-ST.yaw);g.fillStyle=ST.fly?'#8fd8ff':'#ff3b3b';g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(0,-11);g.lineTo(7,8);g.lineTo(0,4);g.lineTo(-7,8);g.closePath();g.fill();g.stroke();g.restore();
 g.fillStyle='#fff';g.font='bold 18px Arial';g.textAlign='center';g.fillText('N',W2/2,22)}
function hud(dt){if(!hudEl)return;drawMap();var a=AREAS[region(ST.x,ST.z)];if(a!==ST.lastArea){ST.lastArea=a;areaEl.textContent=a+(ST.fly?' · ✈️':'');areaT=4}areaT-=dt;areaEl.style.opacity=areaT>0?1:0;
 helpT-=dt;var hp=hudEl.querySelector('.help');if(hp)hp.style.opacity=helpT>0?1:.35;hudEl.classList.toggle('flying',ST.fly)}
// ---------- enter / exit ----------
function isTouch(){return (navigator.maxTouchPoints>0)||matchMedia('(pointer:coarse)').matches}
function enter(){var rd=window.__rd;if(!rd||!window.__T||FR.active)return;if(rd.state==='playing'){toast('Finish the run first');return}
 try{if(!ready){var t0=performance.now();build();FR.buildMs=Math.round(performance.now()-t0)}}catch(e){console.error('freeroam build',e);toast('Free Roam failed to load');return}
 mkHud();FR.active=true;document.body.classList.add('v10-fr');document.body.classList.toggle('fr-touch',isTouch());hudEl.classList.toggle('touch',isTouch());hudEl.style.display='block';
 if(!car||car.key!==U().A.car)makeCar();teleport('city');helpT=9;ST.lastArea='';lastT=performance.now();engine(true);
 // nudge the game into rendering every frame (menu showroom loop keeps running)
 toast('🗺️ Free Roam UAE')}
function exit(){if(!FR.active)return;if(FR.onExit)FR.onExit();FR.active=false;for(var k in K)K[k]=false;for(var t in TI)TI[t]=0;document.body.classList.remove('v10-fr','fr-touch');if(hudEl)hudEl.style.display='none';menu(false);engine(false)}
FR.enter=enter;FR.exit=exit;
function ensureAdminBtn(){var hud=hudEl;if(!hud)return;var top=hud.querySelector('.top');if(!top||top.querySelector('.adm-r'))return;var b=document.createElement('button');b.className='adm-r';b.title='Admin (Shift+A)';b.textContent='R';b.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();if(window.__uaeAskAdmin)window.__uaeAskAdmin();else if(window.__uae&&__uae.askAdmin)__uae.askAdmin()});top.appendChild(b)}
var _enter=enter;enter=function(){_enter();setTimeout(ensureAdminBtn,50);setTimeout(ensureAdminBtn,500)};FR.enter=enter;
addEventListener('keydown',function(e){if(!FR.active)return;if(e.code==='KeyA'&&e.shiftKey&&!/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||'')){e.preventDefault();e.stopPropagation();if(window.__uaeAskAdmin)window.__uaeAskAdmin()}},true);

// menu button
function addBtn(){var bar=document.getElementById('u-menubar');if(!bar||document.getElementById('v10-frbtn'))return;var b=document.createElement('button');b.className='u-btn';b.id='v10-frbtn';b.textContent='🗺️ Free Roam UAE';b.onclick=function(e){e.stopPropagation();enter()};bar.appendChild(b)}
setInterval(addBtn,700);
})();

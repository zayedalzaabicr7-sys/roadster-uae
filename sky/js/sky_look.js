/* SKYBOLT UAE — P7 visual fidelity pass.
   Original recreations of Bloxx League arena look + Flying Tesla Roadster open-world
   landmarks and cars. No third-party / Roblox assets. Study: official thumbs + listings. */
(function(){'use strict';
var FR=window.__fr,GM=window.__games;if(!FR||!GM||!GM.SKY)return;
var X=GM._x,SKY=GM.SKY,WORLD=GM.AERO,A=GM.SKYA;
function T(){return window.__T}
function canvasTex(w,h,draw,rep){var t=T(),cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d'),w,h);var tx=new t.CanvasTex(cv);tx.colorSpace=t.SRGB;tx.anisotropy=8;if(rep){tx.wrapS=tx.wrapT=1000;tx.repeat.set(rep[0],rep[1])}return tx}
function signBoard(txt,sub,w,h,bg){var t=T(),c=document.createElement('canvas');c.width=640;c.height=180;var g=c.getContext('2d');
 g.fillStyle=bg||'#071428';g.fillRect(0,0,640,180);g.strokeStyle='#00e5ff';g.lineWidth=10;g.strokeRect(6,6,628,168);
 g.fillStyle='#fff';g.font='bold 64px Arial';g.textAlign='center';g.fillText(txt,320,78);g.fillStyle='#f3d77a';g.font='bold 32px Arial';g.fillText(sub||'',320,130);
 var tx=new t.CanvasTex(c);tx.colorSpace=t.SRGB;return new t.Mesh(new t.Plane(w,h),new t.Basic({map:tx,side:2}))}

/* ===================== PROCEDURAL CARS (Bloxx + Flying Roadster style) ===================== */
function wheel(t,x,z,gold){var g=new t.Group();
 var tire=new t.Mesh(new t.Cyl(.34,.34,.22,14),new t.Std({color:0x111111,roughness:.95}));tire.rotation.z=Math.PI/2;g.add(tire);
 var rim=new t.Mesh(new t.Cyl(.22,.22,.24,12),new t.Std({color:gold?0xd4af37:0xc8ccd2,metalness:.85,roughness:.25}));rim.rotation.z=Math.PI/2;g.add(rim);
 g.position.set(x,.34,z);return g}
function thrusterPad(t,x,z){var m=new t.Mesh(new t.Cyl(.2,.2,.05,12),new t.Basic({color:0x7ef0ff,transparent:true,opacity:.9,depthWrite:false,blending:2}));m.position.set(x,.08,z);return m}
/** Hero: Tesla-Roadster-like coupe with underside cyan thrusters (Flying Tesla look). Original mesh. */
function mkRoadster(hex,thrusters){var t=T(),G=new t.Group(),col=hex||0xe11d2e;
 var body=new t.Std({color:col,metalness:.55,roughness:.28,clearcoat:.7}),dark=new t.Std({color:0x111418,metalness:.4,roughness:.4}),glass=new t.Std({color:0x1a2430,metalness:.7,roughness:.1,transparent:true,opacity:.55});
 // low sleek body
 G.add(mesh(new t.Box(1.85,.42,4.2),body,0,.52,0));
 G.add(mesh(new t.Box(1.75,.28,2.4),body,0,.85,-.15)); // cabin rise
 G.add(mesh(new t.Box(1.55,.22,1.9),glass,0,1.05,-.05)); // canopy
 G.add(mesh(new t.Box(1.7,.12,1.1),body,0,.62,1.55)); // nose
 G.add(mesh(new t.Box(1.6,.08,.06),new t.Std({color:0xffffff,emissive:0xffffff,emissiveIntensity:2}),0,.55,-2.05)); // LED strip rear
 G.add(mesh(new t.Box(1.5,.06,.05),new t.Std({color:0xffffff,emissive:0xaaccff,emissiveIntensity:3}),0,.48,2.08)); // front LED
 G.add(mesh(new t.Box(1.6,.05,1.0),dark,0,.32,0)); // undertray
 // small spoiler
 G.add(mesh(new t.Box(1.5,.04,.35),body,0,1.0,-1.95));
 [[-.78,-1.25],[.78,-1.25],[-.78,1.35],[.78,1.35]].forEach(function(p){G.add(wheel(t,p[0],p[1],true))});
 if(thrusters!==false){[[-.55,-1.1],[.55,-1.1],[-.55,1.2],[.55,1.2]].forEach(function(p){G.add(thrusterPad(t,p[0],p[1]))})}
 // rear boost nozzles
 [-.35,.35].forEach(function(x){var n=new t.Mesh(new t.Cyl(.1,.14,.18,10),new t.Std({color:0x222,metalness:.6,roughness:.3}));n.rotation.x=Math.PI/2;n.position.set(x,.45,-2.15);G.add(n)});
 G.userData.kind='roadster';return G}
/** Bloxx League-style muscle coupe (Camaro/Firebird silhouette). Original. */
function mkMuscle(hex){var t=T(),G=new t.Group(),col=hex||0xe11d2e;
 var body=new t.Std({color:col,metalness:.45,roughness:.32,clearcoat:.5}),dark=new t.Std({color:0x151515,roughness:.5}),glass=new t.Std({color:0x223040,metalness:.5,roughness:.15,transparent:true,opacity:.5});
 G.add(mesh(new t.Box(1.95,.5,4.4),body,0,.55,0));
 G.add(mesh(new t.Box(1.85,.35,2.0),body,0,.95,-.2));
 G.add(mesh(new t.Box(1.6,.28,1.5),glass,0,1.15,-.15));
 G.add(mesh(new t.Box(1.9,.2,1.2),body,0,.55,1.6)); // long hood
 G.add(mesh(new t.Box(1.7,.15,.8),body,0,.7,-1.8)); // trunk
 G.add(mesh(new t.Box(1.55,.08,.4),body,0,1.05,-2.05)); // spoiler
 G.add(mesh(new t.Box(1.4,.08,.05),new t.Std({color:0xff2200,emissive:0xff2200,emissiveIntensity:2}),0,.5,-2.2));
 G.add(mesh(new t.Box(1.5,.1,.06),new t.Std({color:0xfff6d0,emissive:0xffe8a0,emissiveIntensity:2.5}),0,.45,2.2));
 [[-.85,-1.3],[.85,-1.3],[-.85,1.4],[.85,1.4]].forEach(function(p){G.add(wheel(t,p[0],p[1],true))});
 G.userData.kind='muscle';return G}
/** Bloxx-style compact hatch / octane-like hitbox. Original. */
function mkHatch(hex){var t=T(),G=new t.Group(),col=hex||0x2f7bff;
 var body=new t.Std({color:col,metalness:.4,roughness:.35}),glass=new t.Std({color:0x1a2838,metalness:.5,roughness:.15,transparent:true,opacity:.5});
 G.add(mesh(new t.Box(1.7,.55,3.6),body,0,.55,0));
 G.add(mesh(new t.Box(1.55,.45,2.0),body,0,1.0,-.1));
 G.add(mesh(new t.Box(1.4,.35,1.6),glass,0,1.2,0));
 G.add(mesh(new t.Box(1.5,.2,1.0),body,0,.55,1.4));
 G.add(mesh(new t.Box(1.3,.12,.5),body,0,.95,-1.7));
 [[-.72,-1.15],[.72,-1.15],[-.72,1.2],[.72,1.2]].forEach(function(p){G.add(wheel(t,p[0],p[1],false))});
 G.userData.kind='hatch';return G}
/** Bloxx-style boxy SUV (Bronco-ish). Original. */
function mkSUV(hex){var t=T(),G=new t.Group(),col=hex||0x2f7bff;
 var body=new t.Std({color:col,metalness:.35,roughness:.4}),dark=new t.Std({color:0x1a1a1a,roughness:.6}),glass=new t.Std({color:0x243040,metalness:.4,roughness:.2,transparent:true,opacity:.55});
 G.add(mesh(new t.Box(1.95,.7,4.0),body,0,.7,0));
 G.add(mesh(new t.Box(1.85,.55,2.4),body,0,1.25,-.1));
 G.add(mesh(new t.Box(1.65,.45,2.0),glass,0,1.4,0));
 G.add(mesh(new t.Box(1.9,.25,1.0),dark,0,.55,1.7));
 [[-.88,-1.3],[.88,-1.3],[-.88,1.35],[.88,1.35]].forEach(function(p){G.add(wheel(t,p[0],p[1],false))});
 G.userData.kind='suv';return G}
function mesh(geo,mat,x,y,z){var t=T(),m=new t.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;return m}
function hexNum(h){if(typeof h==='number')return h;if(!h)return 0xe11d2e;return parseInt(String(h).replace('#',''),16)||0xe11d2e}
function pickCar(kind,col){var c=hexNum(col);if(kind==='roadster')return mkRoadster(c,true);if(kind==='muscle')return mkMuscle(c);if(kind==='suv')return mkSUV(c);return mkHatch(c)}
window.__skyCars={mkRoadster:mkRoadster,mkMuscle:mkMuscle,mkHatch:mkHatch,mkSUV:mkSUV,pick:pickCar};

/* ===================== BLOXX-LIKE ARENA VISUALS ===================== */
function rebuildArena(){var t=T(),S=A,G=new t.Group();G.position.set(S.CX,S.Y0,S.CZ);
 // GREEN checkered turf + blue lines (Bloxx thumb)
 var turf=canvasTex(2048,1210,function(g,w,h){var sx=w/(S.HX*2),sz=h/(S.HZ*2);
  for(var i=0;i<16;i++)for(var j=0;j<10;j++){g.fillStyle=(i+j)%2?'#2f9e4a':'#268a3f';g.fillRect(i*w/16,j*h/10,w/16+1,h/10+1)}
  for(var k=0;k<2500;k++){g.fillStyle='rgba(0,0,0,'+(Math.random()*.05)+')';g.fillRect(Math.random()*w,Math.random()*h,2,2)}
  g.strokeStyle='rgba(60,180,255,.95)';g.lineWidth=10;g.strokeRect(14,14,w-28,h-28);
  g.beginPath();g.moveTo(w/2,14);g.lineTo(w/2,h-14);g.stroke();
  g.beginPath();g.arc(w/2,h/2,18*sx,0,7);g.stroke();g.fillStyle='#3cb4ff';g.beginPath();g.arc(w/2,h/2,10,0,7);g.fill();
  [-1,1].forEach(function(s){var gx=s<0?14:w-14,bw=22*sx,bh=(S.GW+12)*2*sz;g.strokeRect(s<0?gx:gx-bw,h/2-bh/2,bw,bh);
   g.fillStyle=s<0?'rgba(0,200,255,.25)':'rgba(255,140,40,.25)';g.fillRect(s<0?gx:gx-bw,h/2-bh/2,bw,bh)});
  // glow pads marks
  [[.22,.22],[.78,.22],[.22,.78],[.78,.78],[.5,.15],[.5,.85]].forEach(function(p){var grd=g.createRadialGradient(p[0]*w,p[1]*h,4,p[0]*w,p[1]*h,40);grd.addColorStop(0,'rgba(255,180,40,.85)');grd.addColorStop(1,'rgba(255,180,40,0)');g.fillStyle=grd;g.beginPath();g.arc(p[0]*w,p[1]*h,40,0,7);g.fill()})
 });
 var fl=new t.Mesh(new t.Plane(S.HX*2,S.HZ*2),new t.Std({map:turf,roughness:.85,metalness:.05}));fl.rotation.x=-Math.PI/2;fl.position.y=.04;fl.receiveShadow=true;G.add(fl);
 [-1,1].forEach(function(s){var gf=new t.Mesh(new t.Plane(S.GD,S.GW*2),new t.Std({color:0x1a2a38,roughness:.7}));gf.rotation.x=-Math.PI/2;gf.position.set(s*(S.HX+S.GD/2),.04,0);G.add(gf)});
 // rounded shell — dark stadium walls + hex lattice upper (Bloxx dome)
 var bx=new t.Box(S.HX*2,S.H,S.HZ*2,64,14,40),pa=bx.attributes.position,idx=bx.index.array,B=[S.HX-S.R,S.H/2-S.R,S.HZ-S.R];
 function mapP(x,y,z){var c=[Math.max(-B[0],Math.min(B[0],x)),Math.max(-B[1],Math.min(B[1],y)),Math.max(-B[2],Math.min(B[2],z))],d=[x-c[0],y-c[1],z-c[2]],l=Math.sqrt(d[0]*d[0]+d[1]*d[1]+d[2]*d[2])||1;d=[d[0]/l,d[1]/l,d[2]/l];return[c[0]+d[0]*S.R,c[1]+d[1]*S.R+S.H/2,c[2]+d[2]*S.R,d]}
 var lo={P:[],N:[],C:[]},hi={P:[],N:[],C:[]};
 for(var i=0;i<idx.length;i+=3){var tri=[],cy=0,cxs=0,czs=0;for(var k=0;k<3;k++){var j=idx[i+k],m=mapP(pa.getX(j),pa.getY(j),pa.getZ(j));tri.push(m);cy+=m[1]/3;cxs+=m[0]/3;czs+=m[2]/3}
  if(cy<.4)continue;if(Math.abs(czs)<S.GW+.3&&cy<S.GH+.2&&Math.abs(cxs)>S.HX-S.R)continue;
  var dst=cy<S.R*1.2?lo:hi,isBlue=cxs<0,tc=cy>S.H*.7?[.15,.55,.85]:(isBlue?[.08,.18,.38]:[.28,.12,.06]);
  for(k=0;k<3;k++){var q=tri[k];dst.P.push(q[0],q[1],q[2]);dst.N.push(-q[3][0],-q[3][1],-q[3][2]);dst.C.push(tc[0],tc[1],tc[2])}}
 function mk(o,mat){var g=new t.Geo();g.setAttribute('position',new t.Attr(new Float32Array(o.P),3));g.setAttribute('normal',new t.Attr(new Float32Array(o.N),3));g.setAttribute('color',new t.Attr(new Float32Array(o.C),3));g.computeBoundingSphere();return new t.Mesh(g,mat)}
 G.add(mk(lo,new t.Std({vertexColors:true,roughness:.55,metalness:.15,side:2,emissive:0x061018,emissiveIntensity:.5})));
 var hex=canvasTex(256,256,function(g,w,h){g.clearRect(0,0,w,h);g.strokeStyle='rgba(80,220,255,.95)';g.lineWidth=3;for(var y=0;y<3;y++)for(var x=0;x<3;x++){var cx=x*w/2+(y%2?w/4:0),cy=y*h/2.3;g.beginPath();for(var a=0;a<7;a++){var an=a*Math.PI/3+Math.PI/6;g.lineTo(cx+Math.cos(an)*w/4.4,cy+Math.sin(an)*w/4.4)}g.stroke()}},[22,6]);
 var hiM=mk(hi,new t.Std({vertexColors:true,map:hex,transparent:true,opacity:.5,roughness:.12,metalness:.25,side:2,depthWrite:false,emissive:0x104060,emissiveIntensity:.7}));hiM.renderOrder=3;G.add(hiM);
 // CYAN neon goals (Bloxx)
 var netTex=canvasTex(256,256,function(g,w,h){g.strokeStyle='rgba(180,240,255,.85)';g.lineWidth=3;for(var i=0;i<=10;i++){g.beginPath();g.moveTo(i*w/10,0);g.lineTo(i*w/10,h);g.stroke();g.beginPath();g.moveTo(0,i*h/10);g.lineTo(w,i*h/10);g.stroke()}},[4,2]);
 [-1,1].forEach(function(s){var col=s<0?0x00e5ff:0xff8a1f,gx=s*S.HX,em=new t.Std({color:col,emissive:col,emissiveIntensity:4.2,roughness:.25,metalness:.4});
  [[0,S.GH+.45,0,1.2,.9,S.GW*2+2],[0,S.GH/2,S.GW+.5,1.2,S.GH+1,.9],[0,S.GH/2,-S.GW-.5,1.2,S.GH+1,.9]].forEach(function(p){var m=new t.Mesh(new t.Box(p[3],p[4],p[5]),em);m.position.set(gx+p[0],p[1],p[2]);G.add(m)});
  var nm=new t.Std({map:netTex,color:col,transparent:true,opacity:.45,side:2,depthWrite:false,emissive:col,emissiveIntensity:.5});
  var back=new t.Mesh(new t.Plane(S.GW*2,S.GH),nm);back.position.set(s*(S.HX+S.GD),S.GH/2,0);back.rotation.y=-s*Math.PI/2;G.add(back);
  // vertical light columns beside goal (Bloxx stadium pillars)
  [-1,1].forEach(function(zs){var col2=new t.Mesh(new t.Box(1.2,S.H*.7,1.2),em);col2.position.set(s*(S.HX-4),S.H*.35,zs*(S.HZ-6));G.add(col2)});
  var logo=canvasTex(512,256,function(g,w,h){g.fillStyle=s<0?'#041828':'#281408';g.fillRect(0,0,w,h);g.fillStyle=s<0?'#00e5ff':'#ff8a1f';g.font='bold 78px Arial';g.textAlign='center';g.fillText(s<0?'BLUE':'ORANGE',w/2,h/2+28);g.fillStyle='#fff';g.font='bold 28px Arial';g.fillText('SKYBOLT',w/2,48)});
  var lg=new t.Mesh(new t.Plane(S.GW*2+8,S.R),new t.Basic({map:logo}));lg.position.set(s*(S.HX-.4),S.GH+S.R*.55,0);lg.rotation.y=-s*Math.PI/2;G.add(lg)});
 // packed stands + screens
 var crowd=canvasTex(1024,128,function(g,w,h){g.fillStyle='#12161e';g.fillRect(0,0,w,h);var cols=['#e63946','#f1faee','#2f7bff','#ff8a1f','#ffd166','#06d6a0','#ffffff','#111','#00e5ff'];for(var i=0;i<900;i++){var x=Math.random()*w,y=18+Math.random()*(h-28);g.fillStyle=cols[(Math.random()*cols.length)|0];g.fillRect(x,y,6,11);g.fillStyle='#e0b48c';g.fillRect(x+1,y-4,4,4)}},[8,1]);
 var crM=new t.Std({map:crowd,roughness:.9}),stM=new t.Std({color:0x1a1f2a,roughness:.75});
 function stand(cx,cz,w,ry){var g2=new t.Group();for(var r=0;r<7;r++){var st=new t.Mesh(new t.Box(w,1.7,3.4),stM);st.position.set(0,1+r*2.15,r*3.3);g2.add(st);var cr=new t.Mesh(new t.Plane(w,2),crM);cr.position.set(0,2.9+r*2.15,r*3.3-1.7);g2.add(cr)}g2.position.set(cx,0,cz);g2.rotation.y=ry;G.add(g2)}
 stand(0,S.HZ+5,S.HX*2,0);stand(0,-S.HZ-5,S.HX*2,Math.PI);stand(S.HX+S.GD+5,0,S.HZ*2,-Math.PI/2);stand(-S.HX-S.GD-5,0,S.HZ*2,Math.PI/2);
 // jumbotron screens
 var sc=canvasTex(512,192,function(g,w,h){g.fillStyle='#030810';g.fillRect(0,0,w,h);g.fillStyle='#00e5ff';g.font='bold 72px Arial';g.textAlign='center';g.fillText('SKYBOLT',w/2,90);g.fillStyle='#f3d77a';g.font='bold 36px Arial';g.fillText('UAE · ألعاب',w/2,150)});
 [-1,1].forEach(function(s){var scr=new t.Mesh(new t.Plane(28,10),new t.Basic({map:sc}));scr.position.set(0,S.H-8,s*(S.HZ-2));scr.rotation.y=s>0?Math.PI:0;G.add(scr)});
 // boost pads
 var pads=[],bigM=new t.Std({color:0xffa31a,emissive:0xff7a00,emissiveIntensity:3.5}),smM=new t.Std({color:0x7ec8ff,emissive:0x3a9fff,emissiveIntensity:2.6}),baseM=new t.Std({color:0x222833,metalness:.6,roughness:.35});
 function pad(x,y,z,big){var b=new t.Mesh(new t.Cyl(big?2.6:1.4,big?2.8:1.5,.22,24),baseM);b.position.set(x,y+.12,z);G.add(b);
  var glow=new t.Mesh(new t.Cyl(big?2.3:1.2,big?2.3:1.2,.08,24),big?bigM:smM);glow.position.set(x,y+.28,z);G.add(glow);
  var orb=new t.Mesh(new t.Sphere(big?1.2:.75,16,12),big?bigM:smM);orb.position.set(x,y+(big?2.3:1.15),z);G.add(orb);pads.push({x:x,y:y,z:z,big:big,r:big?3.5:2.3,on:true,t:0,m:orb})}
 [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(c){pad(c[0]*(S.HX-14),0,c[1]*(S.HZ-12),true)});pad(0,0,S.HZ-8,true);pad(0,0,-S.HZ+8,true);
 [[0,18,0],[40,22,20],[-40,22,-20],[55,14,0],[-55,14,0],[0,28,30],[0,28,-30]].forEach(function(p){pad(p[0],p[1],p[2],false)});
 [[-50,0],[50,0],[-28,-22],[28,22],[0,-16],[0,16],[-18,0],[18,0]].forEach(function(p){pad(p[0],0,p[1],false)});
 // ceiling strips
 [-1,1].forEach(function(s){var strip=new t.Mesh(new t.Box(S.HX*1.5,.35,10),new t.Std({color:0x00e5ff,emissive:0x00e5ff,emissiveIntensity:2.2,metalness:.5,roughness:.3}));strip.position.set(0,S.H-1.1,s*(S.HZ-16));G.add(strip)});
 // scoreboard
 var sbc=document.createElement('canvas');sbc.width=512;sbc.height=192;var sbt=new t.CanvasTex(sbc);sbt.colorSpace=t.SRGB;
 var sb=new t.Group();[0,1,2,3].forEach(function(i){var pl=new t.Mesh(new t.Plane(14,5.25),new t.Basic({map:sbt}));pl.position.set(Math.sin(i*Math.PI/2)*7,0,Math.cos(i*Math.PI/2)*7);pl.rotation.y=i*Math.PI/2;sb.add(pl)});sb.position.set(0,S.H-7,0);G.add(sb);
 // mechanical panelled ball (Bloxx)
 var bt=canvasTex(1024,512,function(g,w,h){var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#f4f6fa');gr.addColorStop(1,'#b8c0cc');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.strokeStyle='#2a3344';g.lineWidth=8;for(var i=0;i<8;i++)for(var j=0;j<4;j++){var cx=i*w/8+(j%2?w/16:0),cy=j*h/3.5+50;g.strokeRect(cx-36,cy-28,72,56);g.fillStyle='#3a4558';g.fillRect(cx-10,cy-10,20,20);g.fillStyle='#00e5ff';g.fillRect(cx-4,cy-4,8,8)}
  g.fillStyle='#111';g.fillRect(0,h/2-8,w,16);g.fillStyle='#00e5ff';g.fillRect(0,h/2-3,w,6)});
 var ball=new t.Mesh(new t.Sphere(S.BR,40,28),new t.Phys({map:bt,roughness:.32,metalness:.25,clearcoat:.75,emissive:0x0a1520,emissiveIntensity:.3}));ball.castShadow=true;
 var ring=new t.Mesh(new t.Cyl(S.BR*1.02,S.BR*1.02,.2,48,1,true),new t.Std({color:0x00e5ff,emissive:0x00e5ff,emissiveIntensity:2.8}));ball.add(ring);G.add(ball);
 var shadow=new t.Mesh(new t.Cyl(S.BR,S.BR,.04,28),new t.Basic({color:0,transparent:true,opacity:.32,depthWrite:false}));G.add(shadow);
 G.userData={pads:pads,ball:ball,shadow:shadow,sb:{c:sbc,t:sbt},look:'bloxx'};FR.W.scene.add(G);return G}

/* ===================== OPEN SKY WORLD ===================== */
var W0={OX:900,OY:380,OZ:-900};
function rebuildWorld(){var t=T(),G=new t.Group();G.position.set(W0.OX,0,W0.OZ);var POI=[];
 var steel=new t.Std({color:0xb8c4d0,metalness:.88,roughness:.22}),gold=new t.Std({color:0xd4af37,metalness:.75,roughness:.28,emissive:0x603000,emissiveIntensity:.35});
 var glass=new t.Std({color:0x5a9ad4,metalness:.65,roughness:.1,transparent:true,opacity:.5}),white=new t.Std({color:0xf2f4f8,roughness:.35});
 var neonB=new t.Std({color:0x00e5ff,emissive:0x00e5ff,emissiveIntensity:3.2}),neonP=new t.Std({color:0xff4fd8,emissive:0xff4fd8,emissiveIntensity:2.8});
 var neonO=new t.Std({color:0xff8a1f,emissive:0xff8a1f,emissiveIntensity:2.8}),sand=new t.Std({color:0xd8c39a,roughness:.92}),padM=new t.Std({color:0x1e2636,metalness:.55,roughness:.35});
 var asphalt=new t.Std({color:0x2a2e36,roughness:.85});
 // HUB — paved plaza with neon rim (open-world spawn)
 var hub=new t.Mesh(new t.Cyl(55,58,5,48),sand);hub.position.set(0,W0.OY-2.5,0);G.add(hub);
 var hubPad=new t.Mesh(new t.Cyl(28,28,.35,40),asphalt);hubPad.position.set(0,W0.OY+.2,0);G.add(hubPad);
 var hubRing=new t.Mesh(new t.Cyl(30,30,.12,64,1,true),neonB);hubRing.position.set(0,W0.OY+.45,0);G.add(hubRing);
 G.add(at(signBoard('OPEN SKY','عالم الطيران · UAE Sky',20,6,'#041020'),0,W0.OY+11,22));
 // showcase RED Roadster on a pedestal (Flying Tesla hero)
 var ped=new t.Mesh(new t.Cyl(3.2,3.5,.6,20),padM);ped.position.set(-18,W0.OY+.5,8);G.add(ped);
 var hero=mkRoadster(0xe11d2e,true);hero.position.set(-18,W0.OY+.9,8);hero.rotation.y=.6;hero.scale.setScalar(1.15);G.add(hero);
 POI.push({id:'hub',name:'Aero Hub',x:W0.OX,y:W0.OY,z:W0.OZ,r:35,kind:'hub'});

 // BURJ SPIRE — tall tower + clear spiral LED track (~1000ft feel, scaled)
 var spire=new t.Group(),Hsp=320,R0=22;
 for(var i=0;i<64;i++){var h=i*(Hsp/64),rr=R0*(1-i/90);
  var seg=new t.Mesh(new t.Box(Math.max(4,rr*1.5),Hsp/64+.15,Math.max(4,rr*1.5)),i%5?white:glass);seg.position.set(0,W0.OY+h,0);spire.add(seg);
  var ang=i/64*Math.PI*16,trR=rr+12;
  var track=new t.Mesh(new t.Box(16,.55,5.5),asphalt);track.position.set(Math.cos(ang)*trR,W0.OY+h+.35,Math.sin(ang)*trR);track.rotation.y=-ang;spire.add(track);
  var lite=new t.Mesh(new t.Box(16.4,.12,.25),i%2?neonB:neonO);lite.position.set(Math.cos(ang)*trR,W0.OY+h+.7,Math.sin(ang)*trR);lite.rotation.y=-ang;spire.add(lite)}
 var tip=new t.Mesh(new t.Cone(3.5,22,10),gold);tip.position.set(0,W0.OY+Hsp+10,0);spire.add(tip);
 spire.position.set(200,0,-60);G.add(spire);
 G.add(at(signBoard('THE SPIRE','برج السماء · 7-lap climb',16,5,'#0a1030'),200,W0.OY+14,-20));
 POI.push({id:'spire',name:'The Spire',x:W0.OX+200,y:W0.OY,z:W0.OZ-60,r:50,kind:'race'});

 // GULF LOOP — continuous translucent tube (ceiling-rideable)
 var loop=new t.Group(),Rbig=42;
 for(var k=0;k<48;k++){var a2=k/48*Math.PI*2;
  var panel=new t.Mesh(new t.Box(14,1.4,14),k%3?steel:glass);panel.position.set(Math.cos(a2)*Rbig,W0.OY+30+Math.sin(a2)*Rbig,0);panel.lookAt(0,W0.OY+30,0);loop.add(panel);
  var rail=new t.Mesh(new t.Box(14,.2,.3),neonB);rail.position.copy(panel.position);rail.position.y+=.8;rail.lookAt(0,W0.OY+30,0);loop.add(rail)}
 // approach tube
 for(var j=0;j<20;j++){var tube=new t.Mesh(new t.Cyl(9,9,8,16,1,true),glass);tube.rotation.z=Math.PI/2;tube.position.set(-Rbig-10-j*7,W0.OY+30,0);loop.add(tube)}
 loop.position.set(-180,0,-40);G.add(loop);
 G.add(at(signBoard('THE LOOP','حلقة الخليج · ride the ceiling',16,5,'#041828'),-180,W0.OY+16,-40+Rbig+20));
 POI.push({id:'loop',name:'The Loop',x:W0.OX-180,y:W0.OY+30,z:W0.OZ-40,r:55,kind:'stunt'});

 // THE CUBE — 5 clear Trackmania floors
 var cube=new t.Group();
 for(var fl=0;fl<5;fl++){var fy=W0.OY+fl*24;
  var floor=new t.Mesh(new t.Box(56,.7,56),padM);floor.position.set(0,fy,0);cube.add(floor);
  var rim=new t.Mesh(new t.Box(56.5,.2,56.5),fl%2?neonB:neonP);rim.position.set(0,fy+.5,0);cube.add(rim);
  // zigzag ramps
  for(var r=0;r<3;r++){var ramp=new t.Mesh(new t.Box(12,.55,22),steel);ramp.position.set((r-1)*16,fy+4,(r%2?-1:1)*10);ramp.rotation.x=(r%2?.4:-.4);cube.add(ramp)}
  var boost=new t.Mesh(new t.Sphere(1.5,12,10),gold);boost.position.set(0,fy+3.2,0);cube.add(boost);
  // corner pillars
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(c){var p=new t.Mesh(new t.Box(2,22,2),steel);p.position.set(c[0]*26,fy+11,c[1]*26);cube.add(p)})}
 cube.position.set(-100,0,220);G.add(cube);
 G.add(at(signBoard('THE CUBE','المكعب · 5 stages',14,4.5,'#180828'),-100,W0.OY+14,255));
 POI.push({id:'cube',name:'The Cube',x:W0.OX-100,y:W0.OY,z:W0.OZ+220,r:45,kind:'parkour'});

 // SKY SPHERE — glossy driveable globe + equator track
 var sphR=48;var sph=new t.Mesh(new t.Sphere(sphR,40,28),new t.Std({color:0x3a7ec0,metalness:.55,roughness:.25,transparent:true,opacity:.62,emissive:0x102848,emissiveIntensity:.55,side:2}));
 sph.position.set(240,W0.OY+sphR+6,200);G.add(sph);
 for(var e=0;e<56;e++){var ae=e/56*Math.PI*2,tr=new t.Mesh(new t.Box(7,.45,4.5),gold);tr.position.set(240+Math.cos(ae)*(sphR+1.2),W0.OY+sphR+6,200+Math.sin(ae)*(sphR+1.2));tr.lookAt(240,W0.OY+sphR+6,200);G.add(tr)}
 G.add(at(signBoard('THE SPHERE','الكرة السماوية',14,4.5),240,W0.OY+12,200+sphR+22));
 POI.push({id:'sphere',name:'The Sphere',x:W0.OX+240,y:W0.OY+sphR+6,z:W0.OZ+200,r:60,kind:'stunt'});

 // GATEWAY ARCH — tall parabolic arch
 var arch=new t.Group();
 for(var a=0;a<48;a++){var tA=a/47,angA=Math.PI*tA,ax=Math.cos(angA)*70,ay=Math.sin(angA)*95;
  var segA=new t.Mesh(new t.Box(10,5,10),a%6?steel:gold);segA.position.set(ax,W0.OY+ay,0);segA.rotation.z=angA-Math.PI/2;arch.add(segA)}
 arch.position.set(50,0,-300);G.add(arch);
 G.add(at(signBoard('GATEWAY ARCH','قوس البوابة',14,4.5,'#1a1008'),50,W0.OY+14,-260));
 POI.push({id:'arch',name:'Gateway Arch',x:W0.OX+50,y:W0.OY,z:W0.OZ-300,r:70,kind:'stunt'});

 // MEGA RAMP — neon LED edges, scaffolding, floodlights (Flying Tesla thumb)
 var rampG=new t.Group();
 var rampBase=new t.Mesh(new t.Box(44,2,90),asphalt);rampBase.position.set(0,W0.OY+1,0);rampG.add(rampBase);
 for(var ri=0;ri<14;ri++){var rr2=new t.Mesh(new t.Box(40,.7,9),steel);rr2.position.set(0,W0.OY+2+ri*ri*.32,-35+ri*7.5);rr2.rotation.x=-ri*.055;rampG.add(rr2);
  var led=new t.Mesh(new t.Box(40.4,.12,.2),neonB);led.position.set(0,rr2.position.y+.4,rr2.position.z);led.rotation.x=rr2.rotation.x;rampG.add(led)}
 var lip=new t.Mesh(new t.Box(40,1.2,12),neonO);lip.position.set(0,W0.OY+62,62);lip.rotation.x=-.95;rampG.add(lip);
 // scaffolding sides + floodlights
 [-1,1].forEach(function(s){for(var si=0;si<6;si++){var post=new t.Mesh(new t.Box(.6,18,.6),steel);post.position.set(s*24,W0.OY+10+si*6,si*12-20);rampG.add(post)}
  var flood=new t.Mesh(new t.Box(4,2,1),new t.Std({color:0xffffff,emissive:0xfff3d0,emissiveIntensity:3}));flood.position.set(s*22,W0.OY+55,50);rampG.add(flood)});
 // red flags
 for(var fi=0;fi<8;fi++){var flag=new t.Mesh(new t.Plane(2,3),new t.Std({color:0xe11d2e,side:2}));flag.position.set(-23,W0.OY+8+fi*5,fi*10-30);rampG.add(flag)}
 rampG.position.set(320,0,-100);G.add(rampG);
 G.add(at(signBoard('MEGA RAMP','منصة الإطلاق · launch & flip',14,4.5,'#281008'),320,W0.OY+14,-50));
 POI.push({id:'ramp',name:'Mega Ramp',x:W0.OX+320,y:W0.OY,z:W0.OZ-100,r:50,kind:'stunt'});

 // CARGO PLANE — more airplane-shaped, flyable interior
 var jet=new t.Group();
 var fus=new t.Mesh(new t.Cyl(8,10,78,18),white);fus.rotation.z=Math.PI/2;fus.position.set(0,W0.OY+20,0);jet.add(fus);
 var nose=new t.Mesh(new t.Cone(8,16,14),white);nose.rotation.z=-Math.PI/2;nose.position.set(46,W0.OY+20,0);jet.add(nose);
 var wing=new t.Mesh(new t.Box(10,1.4,70),steel);wing.position.set(0,W0.OY+18,0);jet.add(wing);
 var tail=new t.Mesh(new t.Box(14,14,1.8),steel);tail.position.set(-36,W0.OY+28,0);jet.add(tail);
 var door=new t.Mesh(new t.Box(1.2,11,14),neonB);door.position.set(-38,W0.OY+20,0);jet.add(door);
 var infl=new t.Mesh(new t.Box(70,.5,14),padM);infl.position.set(0,W0.OY+13,0);jet.add(infl);
 jet.position.set(-300,10,100);G.add(jet);
 G.add(at(signBoard('CARGO PLANE','طائرة الشحن · fly inside',14,4.5),-300,W0.OY+32,125));
 POI.push({id:'jet',name:'Cargo Plane',x:W0.OX-300,y:W0.OY+20,z:W0.OZ+100,r:45,kind:'secret'});

 // KART TRACK — flat oval with neon curb
 var kart=new t.Group();
 for(var kt=0;kt<48;kt++){var ka=kt/48*Math.PI*2,kx=Math.cos(ka)*70,kz=Math.sin(ka)*42;
  var seg=new t.Mesh(new t.Box(14,.4,8),asphalt);seg.position.set(kx,W0.OY+.3,kz+280);seg.rotation.y=-ka;kart.add(seg);
  var curb=new t.Mesh(new t.Box(14,.25,.4),kt%2?neonO:neonB);curb.position.set(kx,W0.OY+.55,kz+280);curb.rotation.y=-ka;kart.add(curb)}
 G.add(kart);
 G.add(at(signBoard('KART TRACK','حلبة الكارت',12,4),0,W0.OY+10,280+50));
 POI.push({id:'kart',name:'Kart Track',x:W0.OX,y:W0.OY,z:W0.OZ+280,r:80,kind:'race'});

 // floating islands + RAINBOW/PINK rings (Flying Tesla thumb) + golden bolts
 var rings=[],bolts=[],_sr=424242;function rnd(){_sr^=_sr<<13;_sr^=_sr>>>17;_sr^=_sr<<5;return ((_sr>>>0)/4294967296)}
 for(var ii=0;ii<12;ii++){var ix=(rnd()-.5)*720,iz=(rnd()-.5)*720,iy=W0.OY+18+rnd()*90;if(Math.hypot(ix,iz)<70)continue;
  var isl=new t.Mesh(new t.Cyl(9+rnd()*12,11+rnd()*8,3.2,16),sand);isl.position.set(ix,iy,iz);G.add(isl);
  var ip=new t.Mesh(new t.Cyl(6,6,.3,16),padM);ip.position.set(ix,iy+1.8,iz);G.add(ip)}
 for(var rr=0;rr<28;rr++){var rx=(rnd()-.5)*680,rz=(rnd()-.5)*680,ry=W0.OY+18+rnd()*130;
  var ring=new t.Group();var hue=rr%3,rm=hue===0?neonB:(hue===1?neonP:neonO);
  var outer=new t.Mesh(new t.Cyl(6,6,1.1,28,1,true),rm);var inner=new t.Mesh(new t.Cyl(4.6,4.6,1.1,28,1,true),rm);ring.add(outer);ring.add(inner);
  ring.position.set(rx,ry,rz);ring.rotation.y=rnd()*6;G.add(ring);rings.push({m:ring,x:W0.OX+rx,y:ry,z:W0.OZ+rz,got:false})}
 for(var gb=0;gb<15;gb++){var bx=(rnd()-.5)*620,bz=(rnd()-.5)*620,by=W0.OY+12+rnd()*110;
  var bolt=new t.Group();var b1=new t.Mesh(new t.Cone(1.5,2,6),gold);b1.position.y=1;var b2=new t.Mesh(new t.Cone(1.5,2,6),gold);b2.rotation.x=Math.PI;b2.position.y=-1;bolt.add(b1);bolt.add(b2);
  bolt.position.set(bx,by,bz);G.add(bolt);bolts.push({m:bolt,x:W0.OX+bx,y:by,z:W0.OZ+bz,got:false})}

 // Skybolt Match portal
 var portal=new t.Mesh(new t.Cyl(9,9,.55,28),neonB);portal.position.set(38,W0.OY+.55,0);G.add(portal);
 G.add(at(signBoard('⚽ SKYBOLT','enter ball arena',13,4.2,'#041828'),38,W0.OY+9,14));
 POI.push({id:'arena',name:'Skybolt Match Portal',x:W0.OX+38,y:W0.OY,z:W0.OZ,r:14,kind:'portal'});

 // starfield billboards
 for(var st=0;st<6;st++){var starC=canvasTex(512,512,function(g,w,h){g.fillStyle='#020510';g.fillRect(0,0,w,h);for(var i=0;i<220;i++){g.fillStyle='rgba(255,255,255,'+(Math.random()*.9)+')';g.fillRect(Math.random()*w,Math.random()*h,Math.random()*2.5,Math.random()*2.5)}
  g.fillStyle='rgba(0,200,255,.12)';g.beginPath();g.arc(w*.3,h*.4,90,0,7);g.fill();g.fillStyle='rgba(255,80,200,.1)';g.beginPath();g.arc(w*.7,h*.55,70,0,7);g.fill()});
  var bill=new t.Mesh(new t.Plane(420,420),new t.Basic({map:starC,transparent:true,opacity:.75,depthWrite:false,side:2}));
  var sang=st/6*Math.PI*2;bill.position.set(Math.cos(sang)*520,W0.OY+90,Math.sin(sang)*520);bill.lookAt(0,W0.OY,0);G.add(bill)}

 G.userData={rings:rings,bolts:bolts,poi:POI,look:'flytesla'};FR.W.scene.add(G);window.__skyW=G;window.__skyPOI=POI;return G}
function at(m,x,y,z){m.position.set(x,y,z);return m}

/* ===================== HOOK INTO EXISTING MODES ===================== */
function swapArena(){if(SKY.G){FR.W.scene.remove(SKY.G);try{SKY.G.traverse(function(o){if(o.geometry)o.geometry.dispose()})}catch(e){}}
 SKY.G=rebuildArena();SKY.G.visible=false}
function swapWorld(){try{if(WORLD.G&&WORLD.G.parent)FR.W.scene.remove(WORLD.G)}catch(e){}
 try{if(window.__skyW&&window.__skyW!==WORLD.G&&window.__skyW.parent)FR.W.scene.remove(window.__skyW)}catch(e){}
 WORLD.G=rebuildWorld();WORLD.G.visible=false;window.__skyW=WORLD.G;window.__skyPOI=WORLD.G.userData.poi||[]}

// Patch Body to prefer Bloxx/Roadster procedural cars
function patchBodies(){
 var kinds=['muscle','hatch','suv','roadster'];
 // monkeypatch after SKY.start creates bodies — wrap start
 var _ss=SKY.start;SKY.start=function(o){swapArena();
  var r=_ss.apply(this,arguments);
  // replace player car visual with muscle/roadster team color
  try{var meCol=(o&&o.team)?0xff8a1f:0x2f7bff;var self=this;
   (function tintTeam(){var n=0;var iv=setInterval(function(){n++;try{var pc=FR.getCar();if(!pc||!pc.inner)return;
  pc.inner.traverse(function(o){if(o.isMesh&&o.material&&o.material.color&&!o.material.transparent){var n2=(o.material.name||'')+(o.name||'');if(/glass|window|tire|wheel|carbon/i.test(n2))return;try{o.material=o.material.clone();o.material.color.setHex(meCol)}catch(e){}}});
  pc._skyLook=2;clearInterval(iv)}catch(e){}
  if(n>25)clearInterval(iv)},250)})();
   (self.bodies||[]).forEach(function(b,i){if(!b)return;var team=self.cars[i]?self.cars[i].team:0,kind=i===0?'muscle':kinds[i%kinds.length],col=team?0xff8a1f:0x2f7bff;
    while(b.g.children.length)b.g.remove(b.g.children[0]);b.g.add(pickCar(kind,col));b.real=true;b.fb=null});
  }catch(e){console.warn('car patch',e)}
  return r};
 var _ws=WORLD.start;WORLD.start=function(o){swapWorld();
  // force red roadster paint vibe: switch to sport/roadster + red if possible
  try{var u=window.__uae;if(u){u.A.car='sport'}}catch(e){}
  var r=_ws.apply(this,arguments);
  // attach thruster pads to player car if missing
  (function paintRed(){var n=0;var iv=setInterval(function(){n++;try{var c=FR.getCar();if(!c||!c.inner)return;
  c.inner.traverse(function(o){if(o.isMesh&&o.material&&o.material.color&&!o.material.transparent){var n2=(o.material.name||'')+(o.name||'');if(/glass|window|tire|wheel|carbon/i.test(n2))return;try{o.material=o.material.clone();o.material.color.setHex(0xe11d2e)}catch(e){}}});
  if(!c._skyThPads){var th=new (T()).Group();[[-.55,-1.1],[.55,-1.1],[-.55,1.2],[.55,1.2]].forEach(function(pp){th.add(thrusterPad(T(),pp[0],pp[1]))});c.inner.add(th);c._skyThPads=1}
  c._skyLook=2;clearInterval(iv)}catch(e){}
  if(n>25)clearInterval(iv)},250)})();
  return r}}
patchBodies();

// Eagerly build so first start is fast
if(FR.W&&FR.W.scene){try{swapArena();swapWorld()}catch(e){console.warn('sky_look build',e)}}
else{var iv=setInterval(function(){if(FR.W&&FR.W.scene){clearInterval(iv);try{swapArena();swapWorld()}catch(e){}}},500)}
console.log('[SKYBOLT] sky_look: arena + open sky + procedural cars ready');
})();

/* Roadster Dash UAE — P9 "crazy" graphics overhaul
   Target look: main race grade (punchy sat/curve/vignette/sun bloom) applied to EVERY mode.
   Adds: SSAO-lite + SMAA-lite passes, PBR world textures, denser UAE landmarks, car paint flakes,
   headlights, clouds, volumetric sun haze, cascade-follow soft shadows, richer particles/characters.
   Quality: Ultra+ on capable desktops; Low/Medium stay playable. */
(function(){'use strict';
var VER='p9';
var LBL={auto:'Auto',low:'Low',medium:'Medium',high:'High',ultra:'Ultra',ultraplus:'Ultra+'};

function T(){return window.__T}
function C(){return window.__comp}
function R(){return window.__rd && __rd.renderer}
function FR(){return window.__fr}
function qEff(){return window.__gfx && __gfx.eff ? __gfx.eff() : 'high'}
function isPlus(){var q=qEff();return q==='ultra'||q==='ultraplus'}
function isMax(){return qEff()==='ultraplus'}
function touch(){return navigator.maxTouchPoints>0||matchMedia('(pointer:coarse)').matches}

/* ---------- shared race-grade post bag (matches punchy daytime race mood) ---------- */
function mkPostBag(){
  return {blur:0,roadBlur:0,roadDistance:0,roadRegion:null,carBlur:0,carMask:null,samples:12,
    center:{x:.5,y:.55},car:{x:.5,y:.35},sun:{x:.72,y:.18},sunVis:.85,
    sunColor:{r:1,g:.82,b:.55,isColor:true,clone:function(){return this},copy:function(c){this.r=c.r;this.g=c.g;this.b=c.b;return this},multiplyScalar:function(s){this.r*=s;this.g*=s;this.b*=s;return this}},
    sat:1.14,curve:.34,vignette:.32,grain:.016,
    shadowTint:{r:-.005,g:0,b:.014,isColor:true,copy:function(c){this.r=c.r;this.g=c.g;this.b=c.b;return this},set:function(r,g,b){this.r=r;this.g=g;this.b=b;return this}},
    highTint:{r:.024,g:.01,b:-.008,isColor:true,copy:function(c){this.r=c.r;this.g=c.g;this.b=c.b;return this},set:function(r,g,b){this.r=r;this.g=g;this.b=b;return this}},
    crash:0,grainScale:1};
}
var RACE_POST=mkPostBag();
var frPost=mkPostBag();

/* ---------- texture loader (CanvasTex from Image, equirect or repeat) ---------- */
var TEX={},TEX_LOAD={};
function loadTex(key,url,opts){
  if(TEX[key])return TEX[key];
  if(TEX_LOAD[key])return null;
  TEX_LOAD[key]=1;
  var im=new Image();
  im.onload=function(){
    var tAPI=T(); if(!tAPI){TEX_LOAD[key]=0;return}
    var t=new tAPI.CanvasTex(im);
    t.colorSpace=tAPI.SRGB;
    t.anisotropy=opts&&opts.aniso||8;
    if(opts&&opts.repeat){t.wrapS=t.wrapT=1000; /* RepeatWrapping */ if(opts.repeat!==true){t.repeat&&t.repeat.set?t.repeat.set(opts.repeat,opts.repeat):0}}
    if(opts&&opts.equirect)t.mapping=303;
    if(opts&&opts.linear){try{t.colorSpace=''}catch(e){}}
    t.needsUpdate=true; TEX[key]=t; TEX_LOAD[key]=2;
    if(opts&&opts.on)opts.on(t);
  };
  im.onerror=function(){TEX_LOAD[key]=0;console.warn('p9 tex fail',url)};
  im.src=url+(url.indexOf('?')>=0?'':'?v='+VER);
  return null;
}
function ensureWorldTex(){
  var base='models/tex/';
  [['asphaltD','asphalt_diff.jpg',1],['asphaltN','asphalt_nor.jpg',1],['asphaltR','asphalt_rough.jpg',1],['asphaltA','asphalt_ao.jpg',1],
   ['sandD','sand_diff.jpg',1],['sandN','sand_nor.jpg',1],['sandR','sand_rough.jpg',1],
   ['wallD','wall_diff.jpg',1],['wallN','wall_nor.jpg',1],['wallR','wall_rough.jpg',1],
   ['facadeD','facade_diff.jpg',1],['facadeN','facade_nor.jpg',1],['facadeR','facade_rough.jpg',1],
   ['brickD','brick_diff.jpg',1],['brickN','brick_nor.jpg',1],['brickR','brick_rough.jpg',1],
   ['concD','concrete_diff.jpg',1],['concN','concrete_nor.jpg',1],['concR','concrete_rough.jpg',1],
   ['grassD','grass_diff.jpg',1],['grassN','grass_nor.jpg',1],['grassR','grass_rough.jpg',1]
  ].forEach(function(x){loadTex(x[0],base+x[1],{repeat:true,aniso:8,linear:/N$|R$|A$/.test(x[0])})});
  loadTex('envDay','models/env_kloofendal.jpg',{equirect:true,aniso:1});
  loadTex('envDusk','models/env_dusk.jpg',{equirect:true,aniso:1});
  loadTex('envGoegap','models/env_goegap.jpg',{equirect:true,aniso:1});
  loadTex('envNight','models/env_night.jpg',{equirect:true,aniso:1});
}

/* ---------- SSAO-lite + SMAA-lite + godray/haze ShaderPasses ---------- */
var passesInstalled=false,saoPass=null,smaaPass=null,hazePass=null;
var SAO_FS=[
'uniform sampler2D tDiffuse;uniform vec2 uRes;uniform float uAmt,uRad;varying vec2 vUv;',
'float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}',
'void main(){vec2 px=1./uRes;vec4 col=texture2D(tDiffuse,vUv);float l=lum(col.rgb);',
'float ao=0.;const int N=8;for(int i=0;i<N;i++){float a=6.28318*float(i)/float(N);',
'vec2 o=vec2(cos(a),sin(a))*uRad*px;float l2=lum(texture2D(tDiffuse,vUv+o).rgb);',
'ao+=smoothstep(0.,1.,(l-l2)*4.5);}ao=1.-clamp(ao/float(N),0.,1.)*uAmt;',
'col.rgb*=mix(1.,ao,.9);gl_FragColor=col;}'
].join('');
var SMAA_FS=[
'uniform sampler2D tDiffuse;uniform vec2 uRes;uniform float uSharp;varying vec2 vUv;',
'void main(){vec2 px=1./uRes;vec4 c=texture2D(tDiffuse,vUv);',
'vec4 n=texture2D(tDiffuse,vUv+vec2(0.,-px.y));vec4 s=texture2D(tDiffuse,vUv+vec2(0.,px.y));',
'vec4 e=texture2D(tDiffuse,vUv+vec2(px.x,0.));vec4 w=texture2D(tDiffuse,vUv+vec2(-px.x,0.));',
'float edge=length(c.rgb-n.rgb)+length(c.rgb-s.rgb)+length(c.rgb-e.rgb)+length(c.rgb-w.rgb);',
'vec4 blur=(n+s+e+w)*.25;c=mix(c,blur,smoothstep(.04,.25,edge)*.55);',
'c.rgb=c.rgb+(c.rgb-blur.rgb)*uSharp;gl_FragColor=c;}'
].join('');
var HAZE_FS=[
'uniform sampler2D tDiffuse;uniform vec2 uRes;uniform vec2 uSun;uniform float uHaze,uGod,uWarm;varying vec2 vUv;',
'void main(){vec2 d=vUv-uSun;float dist=length(d);vec4 col=texture2D(tDiffuse,vUv);',
'vec4 god=vec4(0.);if(uGod>.01){for(int i=0;i<10;i++){float t=float(i)/9.;god+=texture2D(tDiffuse,vUv-d*t*.08);}god/=10.;',
'col.rgb=mix(col.rgb,god.rgb,uGod*smoothstep(.9,.1,dist));}',
'col.rgb+=uHaze*vec3(1.,.78,.5)*pow(max(0.,1.-dist*1.1),2.2)*.22;',
'col.rgb=mix(col.rgb,col.rgb*vec3(1.05,1.0,.94),uWarm);',
'float v=smoothstep(1.05,.42,length((vUv-vec2(.5,.52))*vec2(1.1,1.2)));col.rgb*=mix(.78,1.,v);',
'gl_FragColor=col;}'
].join('');
var VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';

function installPasses(){
  var comp=C(); if(!comp||!comp.SP||!comp.rs||passesInstalled)return !!passesInstalled;
  try{
    saoPass=new comp.SP({uniforms:{tDiffuse:{value:null},uRes:{value:{x:1600,y:900}},uAmt:{value:.45},uRad:{value:2.2}},vertexShader:VS,fragmentShader:SAO_FS});
    smaaPass=new comp.SP({uniforms:{tDiffuse:{value:null},uRes:{value:{x:1600,y:900}},uSharp:{value:.35}},vertexShader:VS,fragmentShader:SMAA_FS});
    hazePass=new comp.SP({uniforms:{tDiffuse:{value:null},uRes:{value:{x:1600,y:900}},uSun:{value:{x:.72,y:.18}},uHaze:{value:.7},uGod:{value:.25},uWarm:{value:.55}},vertexShader:VS,fragmentShader:HAZE_FS});
    saoPass.enabled=false;smaaPass.enabled=false;hazePass.enabled=false;
    // Order: after bloom/grade-ish — insert before FXAA (last), after grade
    var fxIdx=comp.rs.passes.indexOf(comp.fxaa);
    if(fxIdx<0)fxIdx=comp.rs.passes.length;
    var gradeIdx=comp.rs.passes.indexOf(comp.grade);
    // Scene → bloom → grade → SSAO → haze → SMAA → FXAA
    var at=gradeIdx>=0?gradeIdx+1:fxIdx;
    comp.rs.insertPass(saoPass,at);
    comp.rs.insertPass(hazePass,at+1);
    comp.rs.insertPass(smaaPass,at+2);
    passesInstalled=true;
  }catch(e){console.warn('p9 passes',e)}
  return passesInstalled;
}

function syncPassRes(){
  var r=R(); if(!r)return;
  var w=r.domElement.width||innerWidth, h=r.domElement.height||innerHeight;
  [saoPass,smaaPass,hazePass].forEach(function(p){if(p&&p.uniforms&&p.uniforms.uRes)p.uniforms.uRes.value={x:w,y:h}});
}

function setPassQuality(q){
  if(!installPasses())return;
  var on=q!=='low', max=q==='ultraplus', hi=q==='ultra'||max;
  if(saoPass){saoPass.enabled=on&&(hi||q==='high');saoPass.uniforms.uAmt.value=max?.55:hi?.4:.28;saoPass.uniforms.uRad.value=max?2.8:2.0}
  if(smaaPass){smaaPass.enabled=on;smaaPass.uniforms.uSharp.value=max?.45:hi?.32:.18}
  if(hazePass){hazePass.enabled=on;hazePass.uniforms.uHaze.value=max?.85:hi?.55:.3;hazePass.uniforms.uGod.value=max?.32:hi?.18:.08;hazePass.uniforms.uWarm.value=max?.65:.4}
  var comp=C();
  if(comp&&comp.fxaa)comp.fxaa.enabled=on; // keep FXAA with SMAA for soft edges
}

/* ---------- boost race-grade post for ALL modes ---------- */
var hooked=false, nightAmt=0;
function boostPost(post,mode){
  if(!post)return post;
  var q=qEff(), mul=q==='ultraplus'?1:q==='ultra'?.92:q==='high'?.8:q==='medium'?.65:.45;
  if(q==='low')return post;
  post.sat=Math.max(post.sat||1, 1.02+0.14*mul);
  post.curve=Math.max(post.curve||0, 0.22+0.14*mul);
  post.vignette=Math.max(post.vignette||0, 0.24+0.1*mul);
  post.grain=Math.max(post.grain||0, 0.01*mul);
  if(post.sunVis!=null)post.sunVis=Math.max(post.sunVis, 0.55*mul*(1-nightAmt*.5));
  if(post.samples!=null)post.samples=Math.max(post.samples||0, q==='ultraplus'?14:10);
  return post;
}

function hookComposer(){
  var comp=C(); if(!comp||!comp.grade||hooked)return !!hooked;
  var grade=comp.grade, _apply=grade.apply.bind(grade);
  grade.apply=function(post,t){
    // Boost whatever bag the race/menu loop provides (menu bag is used for freeroam/minigames).
    // Never invent a bag without roadRegion — FinishShader crashes on null roadRegion.
    if(post){
      var fr=FR(), extra=(fr&&fr.active)||(window.__games&&__games.active)||(window.__rf&&__rf.active);
      if(extra){
        post.sat=Math.max(post.sat||1,1.12);
        post.curve=Math.max(post.curve||0,.32);
        post.vignette=Math.max(post.vignette||0,.3);
        post.grain=Math.max(post.grain||0,.014);
        post.sunVis=Math.max(post.sunVis||0,.7);
        if(post.samples!=null)post.samples=Math.max(post.samples,12);
      }
      post=boostPost(post, extra?'fr':'race');
      if(hazePass&&hazePass.uniforms&&post.sun){
        var sx=post.sun.x!=null?post.sun.x:(post.sun.X||.72), sy=post.sun.y!=null?post.sun.y:.18;
        hazePass.uniforms.uSun.value={x:sx,y:sy};
        hazePass.uniforms.uGod.value=Math.max(hazePass.uniforms.uGod.value||0,(post.sunVis||0)*.35);
      }
    }
    return _apply(post,t);
  };
  // Boost bloom every render
  var rs=comp.rs, _render=rs.render.bind(rs);
  rs.render=function(){
    var q=qEff();
    if(q!=='low'&&comp.bloom){
      var base=comp.bloom.strength||.48;
      var tgt=q==='ultraplus'?1.15:q==='ultra'?.95:q==='high'?.75:.55;
      // Race already sets ~0.8; push higher. Freeroam/menu was stuck ~0.48.
      comp.bloom.strength=Math.max(base,tgt);
      if(comp.bloom.threshold!=null)comp.bloom.threshold=q==='ultraplus'?.72:.82;
      if(comp.bloom.radius!=null)comp.bloom.radius=Math.max(comp.bloom.radius||0, q==='ultraplus'?.85:.55);
    }
    syncPassRes();
    return _render();
  };
  hooked=true; return true;
}

/* ---------- renderer / shadow / tone mapping ---------- */
function tuneRenderer(){
  var r=R(), q=qEff(); if(!r)return;
  try{
    // ACESFilmicToneMapping = 4 in three r152+
    if(r.toneMapping!==4)r.toneMapping=4;
    var exp=q==='ultraplus'?1.12:q==='ultra'?1.05:q==='high'?1.0:.95;
    if(r.toneMappingExposure<exp)r.toneMappingExposure=exp;
    r.shadowMap.enabled=q!=='low';
    // PCFSoftShadowMap = 2
    if(r.shadowMap.type!==2)r.shadowMap.type=2;
  }catch(e){}
}

function cascadeShadows(){
  var fr=FR(), q=qEff(); if(!fr||!fr.active||!fr.W||!fr.W.sun||q==='low')return;
  var sun=fr.W.sun, st=fr.ST; if(!st)return;
  var ext=q==='ultraplus'?55:q==='ultra'?45:q==='high'?35:28;
  sun.target.position.set(st.x,st.y,st.z);
  sun.position.set(st.x-80,st.y+160,st.z+60);
  sun.target.updateMatrixWorld();
  var sc=sun.shadow.camera;
  if(sc){sc.left=-ext;sc.right=ext;sc.top=ext;sc.bottom=-ext;sc.near=10;sc.far=420;sc.updateProjectionMatrix()}
  var sh=q==='ultraplus'?4096:q==='ultra'?2048:1024;
  if(sun.shadow.mapSize.width!==sh){sun.shadow.mapSize.set(sh,sh);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}
  sun.shadow.bias=-.00035; sun.shadow.normalBias=.025;
}

/* ---------- apply PBR textures + landmarks + clouds to freeroam (and any __fr.W.scene) ---------- */
var worldDone=false, landmarkDone=false, cloudGroup=null;
function addUVsFromXZ(geo,scale){
  if(!geo||!geo.attributes||!geo.attributes.position)return;
  if(geo.attributes.uv)return;
  var p=geo.attributes.position, n=p.count, uv=new Float32Array(n*2), sc=scale||.04;
  for(var i=0;i<n;i++){uv[i*2]=p.getX(i)*sc;uv[i*2+1]=p.getZ(i)*sc}
  var tAPI=T(); geo.setAttribute('uv', new tAPI.Attr(uv,2));
}
function pbrMat(diff,nor,rough,opts){
  var tAPI=T(); if(!tAPI||!TEX[diff])return null;
  var o=opts||{};
  var m=new tAPI.Std({map:TEX[diff],roughness:o.roughness!=null?o.roughness:.85,metalness:o.metalness||0,
    vertexColors:!!o.vertexColors, polygonOffset:!!o.poly, polygonOffsetFactor:o.pf||-2, polygonOffsetUnits:o.pu||-2});
  if(TEX[nor]){m.normalMap=TEX[nor];m.normalScale&&m.normalScale.set(.6,.6)}
  if(TEX[rough]&&'roughnessMap' in m)m.roughnessMap=TEX[rough];
  if(o.ao&&TEX[o.ao]&&'aoMap' in m){m.aoMap=TEX[o.ao];m.aoMapIntensity=.7}
  m.envMapIntensity=o.env!=null?o.env:.55;
  return m;
}
function enhanceWorld(){
  var fr=FR(); if(!fr||!fr.W||!fr.W.scene||worldDone)return !!worldDone;
  if(!TEX.asphaltD||!TEX.sandD||!TEX.wallD)return false;
  var S=fr.W.scene, tAPI=T();
  S.traverse(function(o){
    if(!o.isMesh||!o.material||Array.isArray(o.material)||o.userData.p9)return;
    var m=o.material, g=o.geometry; if(!g)return;
    if(!g.boundingBox)try{g.computeBoundingBox()}catch(e){return}
    var b=g.boundingBox, sx=b.max.x-b.min.x, sy=b.max.y-b.min.y, sz=b.max.z-b.min.z;
    // Terrain: large, flat-ish, vertexColors
    if(m.vertexColors&&sy<80&&sx*sz>50000){
      addUVsFromXZ(g,.035);
      var tm=pbrMat('sandD','sandN','sandR',{vertexColors:true,roughness:.95,env:.25});
      if(tm){o.material=tm;o.userData.p9='terrain';o.receiveShadow=true}
      return;
    }
    // Roads: have map already (canvas road tex), large flat
    if(m.map&&sy<.8&&sx*sz>2000&&m.polygonOffset){
      var rm=pbrMat('asphaltD','asphaltN','asphaltR',{vertexColors:false,roughness:.82,metalness:.02,poly:true,pf:-2,pu:-2,ao:'asphaltA',env:.28});
      if(rm){o.material=rm;o.userData.p9='road';o.receiveShadow=true}
      return;
    }
    // Buildings: have facade map + castShadow
    if(m.map&&o.castShadow&&sy>10){
      var bm=pbrMat(TEX.facadeD?'facadeD':'wallD',TEX.facadeN?'facadeN':'wallN',TEX.facadeR?'facadeR':'wallR',{vertexColors:false,roughness:.32,metalness:.45,env:1.1});
      if(bm){o.material=bm;o.userData.p9='bld'}
      return;
    }
    // Plinths / sidewalks
    if(m.vertexColors&&!m.map&&sy<.6&&sx>20&&sz>20){
      addUVsFromXZ(g,.08);
      var cm=pbrMat('concD','concN','concR',{vertexColors:true,roughness:.88,env:.3});
      if(cm){o.material=cm;o.userData.p9='walk';o.receiveShadow=true}
    }
  });
  // Environment
  var env=TEX.envDay||TEX.envGoegap;
  if(env){S.environment=env;S.environmentIntensity=isMax()?.95:.7}
  // Fog warmer / race-like
  if(S.fog&&S.fog.color){S.fog.color.setHex(0xd9c4a0);S.fog.near=120;S.fog.far=isMax()?1700:1400}
  worldDone=true; return true;
}

function buildLandmarks(){
  var fr=FR(); if(!fr||!fr.W||!fr.W.scene||landmarkDone||!isPlus())return !!landmarkDone;
  var tAPI=T(), S=fr.W.scene, G=new tAPI.Group(); G.name='p9_landmarks';
  var glass=new tAPI.Std({color:0xd7e6f4,metalness:.95,roughness:.08,envMapIntensity:1.6,emissive:0x1a3048,emissiveIntensity:.15});
  var white=new tAPI.Std({color:0xf4f1ea,roughness:.55,metalness:.05});
  var gold=new tAPI.Std({color:0xd4af37,metalness:1,roughness:.28});
  var sail=new tAPI.Std({color:0xf2ebe0,metalness:.42,roughness:.28,envMapIntensity:1.05});
  var sailDark=new tAPI.Std({color:0xd8cfc0,metalness:.35,roughness:.35});
  function mesh(geo,mat,x,y,z,sx,sy,sz,ry){
    var o=new tAPI.Mesh(geo,mat); o.position.set(x,y,z); if(sx!=null)o.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz); if(ry)o.rotation.y=ry;
    o.castShadow=true; o.receiveShadow=true; G.add(o); return o;
  }
  // ---- Procedural Burj Khalifa (Y-plan setbacks + spire) — no licensed mesh available ----
  var bk=new tAPI.Group(), bx=40, bz=-40;
  var tiers=[{h:0,H:55,sc:1},{h:55,H:50,sc:.9},{h:105,H:45,sc:.78},{h:150,H:40,sc:.66},{h:190,H:35,sc:.55},{h:225,H:30,sc:.44},{h:255,H:28,sc:.34},{h:283,H:22,sc:.26}];
  tiers.forEach(function(t,si){
    for(var a=0;a<3;a++){
      var ang=a*Math.PI*2/3+si*.04, w=8.2*t.sc, l=19*t.sc;
      var m=new tAPI.Mesh(new tAPI.Box(w,t.H+.02,l),glass);
      m.position.set(bx+Math.sin(ang)*l*.48,t.h+t.H/2,bz+Math.cos(ang)*l*.48); m.rotation.y=ang; m.castShadow=true; bk.add(m);
    }
    var core=new tAPI.Mesh(new tAPI.Cyl(7.2*t.sc,7.2*t.sc,t.H,12),glass); core.position.set(bx,t.h+t.H/2,bz); core.castShadow=true; bk.add(core);
  });
  var spire=new tAPI.Mesh(new tAPI.Cyl(.35,2.4,78,8),glass); spire.position.set(bx,348,bz); bk.add(spire);
  var tip=new tAPI.Mesh(new tAPI.Sphere(1.1,10,8),gold); tip.position.set(bx,388,bz); bk.add(tip);
  var plz=new tAPI.Mesh(new tAPI.Cyl(32,32,.35,40),white); plz.position.set(bx,.18,bz); bk.add(plz);
  G.add(bk);

  // ---- Procedural Burj Al Arab (sail + atrium spine) ----
  var ba=new tAPI.Group(), ax=-210, az=210;
  for(var i=0;i<14;i++){
    var t=i/13, h=18+t*155, w=22*(1-t*.62), d=7.5*(1-t*.45);
    var m=new tAPI.Mesh(new tAPI.Box(1,1,1), i%2?sail:sailDark);
    m.position.set(ax+t*14, h/2, az); m.scale.set(w,h,d); m.rotation.y=0.18; m.castShadow=true; ba.add(m);
  }
  var spine=new tAPI.Mesh(new tAPI.Box(1,1,1),glass); spine.position.set(ax+10,95,az+5); spine.scale.set(12,160,1.4); spine.rotation.y=0.18; ba.add(spine);
  var helipad=new tAPI.Mesh(new tAPI.Cyl(6,6,.5,20),white); helipad.position.set(ax+12,168,az); ba.add(helipad);
  var mast=new tAPI.Mesh(new tAPI.Cyl(1.2,2.2,16,10),gold); mast.position.set(ax+8,176,az); ba.add(mast);
  // island plinth
  var isl=new tAPI.Mesh(new tAPI.Cyl(55,55,.5,40),new tAPI.Std({color:0xc9b897,roughness:.9})); isl.position.set(ax,.25,az); ba.add(isl);
  G.add(ba);

  // Museum of the Future-ish
  var mx=160,mz=-160;
  mesh(new tAPI.Cyl(24,24,10,36),glass,mx,58,mz);
  mesh(new tAPI.Sphere(20,28,18),white,mx,58,mz);
  // Palm Jumeirah crescent platforms
  var px=-40,pz=480;
  mesh(new tAPI.Cyl(95,95,.45,48),new tAPI.Std({color:0xc8b89a,roughness:.92}),px,.22,pz);
  for(var k=0;k<8;k++){var a=k/8*Math.PI*2; mesh(new tAPI.Box(1,1,1),new tAPI.Std({color:0xb9a888,roughness:.9}),px+Math.cos(a)*72,.28,pz+Math.sin(a)*72,30,.55,11,a)}
  mesh(new tAPI.Box(1,1,1),new tAPI.Std({color:0xb9a888,roughness:.9}),px,.28,pz-85,14,.55,75);

  // Extra glass cluster around Burj
  for(var n=0;n<16;n++){
    var ang=n/16*Math.PI*2, rr=58+(n%4)*16, h2=70+(n%6)*38, w2=9+(n%3)*4;
    mesh(new tAPI.Box(1,1,1), n%2?glass:white, 40+Math.cos(ang)*rr, h2/2, -40+Math.sin(ang)*rr, w2, h2, w2*(.7+.3*(n%2)));
  }
  if(TEX.grassD){
    var gm=pbrMat('grassD','grassN','grassR',{roughness:.92,env:.2});
    if(gm){var park=new tAPI.Mesh(new tAPI.Plane(55,55),gm); park.rotation.x=-Math.PI/2; park.position.set(40,.2,40); park.receiveShadow=true; G.add(park)}
  }
  // Clouds
  cloudGroup=new tAPI.Group();
  var cv=document.createElement('canvas'); cv.width=256; cv.height=128;
  var cg=cv.getContext('2d');
  for(var c=0;c<5;c++){var gx=40+c*40,gy=60+(c%2)*20;var grd=cg.createRadialGradient(gx,gy,5,gx,gy,40+c*4);grd.addColorStop(0,'rgba(255,255,255,.85)');grd.addColorStop(1,'rgba(255,255,255,0)');cg.fillStyle=grd;cg.fillRect(0,0,256,128)}
  var ct=new tAPI.CanvasTex(cv); ct.colorSpace=tAPI.SRGB;
  var cm2=new tAPI.Basic({map:ct,transparent:true,depthWrite:false,fog:true,opacity:.65});
  for(var ci=0;ci<18;ci++){
    var cl=new tAPI.Mesh(new tAPI.Plane(180+ci*7,70),cm2);
    cl.position.set(-900+ci*140, 220+(ci%4)*40, -600+((ci*97)%900));
    cl.rotation.y=Math.PI*.15; cloudGroup.add(cl);
  }
  G.add(cloudGroup);
  S.add(G);
  // Async: Kenney palms + skyline towers (CC0)
  loadPropPack(G, fr);
  landmarkDone=true; return true;
}

/* Minimal GLB prop loader (reuses same binary layout as admin glbParse) */
var propCache={};
function parsePropGLB(buf){
  var dv=new DataView(buf), jl=dv.getUint32(12,true), json=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,jl))), bo=20+jl+8, tAPI=T();
  function acc(i){var a=json.accessors[i],bv=json.bufferViews[a.bufferView],n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],off=bo+(bv.byteOffset||0)+(a.byteOffset||0),C={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];
    var es=n*C.BYTES_PER_ELEMENT,st=bv.byteStride||es; if(st===es)return new tAPI.Attr(new C(buf.slice(off,off+a.count*es)),n);
    var out=new C(a.count*n),src=new DataView(buf),rd=C===Float32Array?'getFloat32':C===Uint16Array?'getUint16':C===Uint32Array?'getUint32':'getUint8';
    for(var i2=0;i2<a.count;i2++)for(var j2=0;j2<n;j2++)out[i2*n+j2]=src[rd](off+i2*st+j2*C.BYTES_PER_ELEMENT,true); return new tAPI.Attr(out,n)}
  var geos=(json.meshes||[]).map(function(m){return m.primitives.map(function(p){var g=new tAPI.Geo(); g.setAttribute('position',acc(p.attributes.POSITION)); if(p.attributes.NORMAL!=null)g.setAttribute('normal',acc(p.attributes.NORMAL)); else g.computeVertexNormals(); if(p.indices!=null)g.setIndex(acc(p.indices)); g.computeBoundingSphere(); return {g:g,m:(json.materials&&json.materials[p.material])||{}}})});
  return {json:json,geos:geos};
}
function buildProp(data,tint){
  var tAPI=T(), G=new tAPI.Group(), J=data.json;
  function mat(gm){var pb=gm.pbrMetallicRoughness||{},cf=pb.baseColorFactor||[1,1,1,1], m=new tAPI.Std({metalness:pb.metallicFactor||0,roughness:pb.roughnessFactor==null?.7:pb.roughnessFactor,vertexColors:false});
    if(tint)m.color.set(tint); else m.color.setRGB(cf[0],cf[1],cf[2]); return m}
  function node(i,parent){var n=J.nodes[i],g=new tAPI.Group(); if(n.mesh!=null){data.geos[n.mesh].forEach(function(p){var me=new tAPI.Mesh(p.g.clone(),mat(p.m)); me.castShadow=true; me.receiveShadow=true; g.add(me)})}
    if(n.translation)g.position.fromArray(n.translation); if(n.rotation)g.quaternion.fromArray(n.rotation); if(n.scale)g.scale.fromArray(n.scale);
    (n.children||[]).forEach(function(ch){node(ch,g)}); parent.add(g)}
  (J.scenes[0].nodes||[]).forEach(function(i){node(i,G)}); return G;
}
function fetchProp(url,cb){
  if(propCache[url]==='loading')return;
  if(propCache[url]&&propCache[url]!=='loading'){cb(propCache[url]);return}
  propCache[url]='loading';
  fetch(url+'?v='+VER).then(function(r){if(!r.ok)throw r.status;return r.arrayBuffer()}).then(function(buf){propCache[url]=parsePropGLB(buf);cb(propCache[url])}).catch(function(e){propCache[url]=null;console.warn('p9 prop',url,e)});
}
function loadPropPack(G, fr){
  var palms=['models/landmarks/tree_palmDetailedTall.glb','models/landmarks/tree_palmTall.glb','models/landmarks/tree_palmDetailedShort.glb','models/landmarks/tree_palmShort.glb','models/landmarks/tree_palm.glb','models/landmarks/tree_palmBend.glb'];
  var towers=['models/landmarks/building-skyscraper-a.glb','models/landmarks/building-skyscraper-b.glb','models/landmarks/building-skyscraper-c.glb','models/landmarks/building-skyscraper-d.glb','models/landmarks/building-skyscraper-e.glb'];
  // Palms along SZR + Corniche + Burj plaza + Palm island
  var spots=[];
  for(var x=-280;x>-1130;x-=36)spots.push([x,23,1.6+Math.random()*.4],[x,-23,1.6+Math.random()*.4]);
  for(x=-1160;x>-1620;x-=28)spots.push([x,68,1.8]);
  for(var i=0;i<20;i++){var a=i/20*Math.PI*2;spots.push([40+Math.cos(a)*38,-40+Math.sin(a)*38,1.7])}
  for(i=0;i<12;i++){a=i/12*Math.PI*2;spots.push([-210+Math.cos(a)*48,210+Math.sin(a)*48,1.9])}
  for(i=0;i<10;i++){a=i/10*Math.PI*2;spots.push([-40+Math.cos(a)*80,480+Math.sin(a)*80,1.5])}
  palms.forEach(function(url,pi){
    fetchProp(url,function(data){if(!data||!fr.W)return;
      for(var s=pi;s<spots.length;s+=palms.length){
        var sp=spots[s], h=fr.heightAt?fr.heightAt(sp[0],sp[1]):0;
        var inst=buildProp(data, null);
        inst.position.set(sp[0],h,sp[1]); inst.scale.setScalar(sp[2]); inst.rotation.y=Math.random()*6.28;
        G.add(inst);
      }
    });
  });
  // Skyline towers along SZR
  var tspots=[];
  for(x=-320;x>-900;x-=70){tspots.push([x,48,22+Math.random()*10]); tspots.push([x,-52,18+Math.random()*12])}
  towers.forEach(function(url,ti){
    fetchProp(url,function(data){if(!data||!fr.W)return;
      for(var s=ti;s<tspots.length;s+=towers.length){
        var sp=tspots[s], h=fr.heightAt?fr.heightAt(sp[0],sp[1]):0;
        var inst=buildProp(data,null);
        inst.position.set(sp[0],h,sp[1]); inst.scale.setScalar(sp[2]); inst.rotation.y=(Math.random()>.5?0:Math.PI/2);
        G.add(inst);
      }
    });
  });
}

/* ---------- car paint flakes + clearcoat + headlights ---------- */
var flakeHooked={};
function flakeify(mat){
  if(!mat||mat.userData&&mat.userData.p9flake)return;
  // MeshStandardMaterial warns if clearcoat is set — only Physical gets flakes
  if(!mat.isMeshPhysicalMaterial)return;
  mat.clearcoat=Math.max(mat.clearcoat||0, .85);
  mat.clearcoatRoughness=Math.min(mat.clearcoatRoughness!=null?mat.clearcoatRoughness:1, .08);
  mat.metalness=Math.min(.85, Math.max(mat.metalness||0, .45));
  mat.roughness=Math.min(mat.roughness||1, .32);
  mat.envMapIntensity=Math.max(mat.envMapIntensity||1, 1.15);
  // procedural flake via onBeforeCompile
  var prev=mat.onBeforeCompile;
  mat.onBeforeCompile=function(shader){
    if(prev)prev(shader);
    // geometryNormal exists only after lights_fragment_begin — flake after lights done
    shader.fragmentShader=shader.fragmentShader.replace(
      '#include <lights_fragment_end>',
      '#include <lights_fragment_end>\n'+
      '{\n float flake=fract(sin(dot(normal.xy,vec2(12.9898,78.233)))*43758.5453);\n'+
      ' reflectedLight.directSpecular+=vec3(.07)*step(.93,flake)*clearcoat;\n}\n'
    ).replace(
      '#include <output_fragment>',
      'outgoingLight+=vec3(0.01)*pow(max(0.,1.0-roughnessFactor),3.0);\n#include <output_fragment>'
    );
  };
  mat.customProgramCacheKey=function(){return 'p9flake1'};
  mat.needsUpdate=true;
  if(!mat.userData)mat.userData={};
  mat.userData.p9flake=1;
}
function enhanceCars(){
  if(!isPlus())return;
  function walk(root){
    if(!root||!root.traverse)return;
    root.traverse(function(o){
      if(!o.isMesh||!o.material)return;
      var mats=Array.isArray(o.material)?o.material:[o.material];
      mats.forEach(function(m){
        if(!m)return;
        // paint-like: has clearcoat or moderate metalness + not glass/tyre
        var isGlass=m.transparent||m.opacity<0.95||(m.name&&/glass/i.test(m.name));
        var isDark=m.color&&m.color.r+m.color.g+m.color.b<0.25&&m.metalness<.2;
        if(isGlass){m.envMapIntensity=Math.max(m.envMapIntensity||1,1.4);m.roughness=Math.min(m.roughness||1,.08);return}
        if(isDark&&m.roughness>.6)return; // tyre
        if(m.isMeshPhysicalMaterial)flakeify(m); else if(m.metalness>.35&&m.roughness<.45){m.envMapIntensity=Math.max(m.envMapIntensity||1,1.2);m.roughness=Math.min(m.roughness,.28)}
      });
    });
  }
  (window.__carBodies||[]).forEach(function(o){walk(o.body); if(o.body&&o.body.userData&&o.body.userData.ex)walk(o.body.userData.ex)});
  var fr=FR(); if(fr&&fr.getCar){var c=fr.getCar(); if(c&&c.g)walk(c.g)}
  // remote MP cars
  if(window.__mp&&__mp.remotes)Object.keys(__mp.remotes).forEach(function(k){var r=__mp.remotes[k]; if(r&&r.car)walk(r.car)});
}

var headlightG=null;
function updateHeadlights(){
  var fr=FR(), rd=window.__rd, tAPI=T(); if(!tAPI)return;
  // Estimate night from race mood or clock
  var night=0;
  try{
    if(window.__game&&__game.game&&__game.game.mood&&__game.game.night!=null)night=__game.game.night;
  }catch(e){}
  // Also time-based fallback for freeroam
  if(!night){var h=(Date.now()/1e3/60)%(24*60)/60; night= h<6||h>19?1:h<7||h>18?.6:0}
  nightAmt=night;
  var want=night>.35 && isPlus();
  var car=fr&&fr.active&&fr.getCar&&fr.getCar();
  var body=rd&&rd.player&&rd.player.car&&rd.player.car.group;
  var host=car&&car.inner||body;
  if(!want){if(headlightG)headlightG.visible=false;return}
  if(!host)return;
  if(!headlightG){
    headlightG=new tAPI.Group(); headlightG.name='p9_hl';
    var mat=new tAPI.Basic({color:0xfff2c8,transparent:true,opacity:.55,depthWrite:false,fog:false,toneMapped:false});
    [[-.55,-.1],[.55,-.1]].forEach(function(p){
      var cone=new tAPI.Mesh(new tAPI.Cone(1.2,6,12,1,true),mat);
      cone.rotation.x=Math.PI/2; cone.position.set(p[0],.55,p[1]-3.2); headlightG.add(cone);
      var glow=new tAPI.Mesh(new tAPI.Sphere(.18,10,8),new tAPI.Basic({color:0xffe9a8,toneMapped:false,fog:false}));
      glow.position.set(p[0],.55,p[1]-.2); headlightG.add(glow);
    });
  }
  if(headlightG.parent!==host){host.add(headlightG)}
  headlightG.visible=true;
  headlightG.children.forEach(function(ch){if(ch.material&&ch.material.opacity!=null&&ch.geometry&&ch.geometry.type!=='SphereGeometry')ch.material.opacity=.35+.4*night});
}

/* ---------- characters: richer skin / cloth materials ---------- */
function enhanceCharacters(){
  if(!isPlus())return;
  function bump(root){
    if(!root||!root.traverse)return;
    root.traverse(function(o){
      if(!o.isMesh||!o.material||o.userData.p9c)return;
      var m=o.material; if(Array.isArray(m))return;
      if(m.isMeshStandardMaterial||m.isMeshPhysicalMaterial){
        m.roughness=Math.min(m.roughness||1,.72);
        m.envMapIntensity=Math.max(m.envMapIntensity||1,.8);
        if(m.color&&m.color.r>.6&&m.color.g>.45&&m.color.b>.35){ // skin-ish
          m.roughness=.55; m.metalness=0;
        }
        o.userData.p9c=1; m.needsUpdate=true;
      }
    });
  }
  if(window.__mp&&__mp.localChar)bump(__mp.localChar.g||__mp.localChar);
  var fr=FR(); if(fr&&fr.foot&&fr.foot.ch)bump(fr.foot.ch.g);
}

/* ---------- denser / nicer particles ---------- */
function boostParticles(){
  var V=window.__v10; if(!V||!V.Pool||V.Pool._p9)return;
  var proto=V.Pool.prototype, _emit=proto.emit;
  proto.emit=function(x,y,z,vx,vy,vz,s0,s1,life,col,a,add){
    var q=qEff();
    if(q==='low')return _emit.call(this,x,y,z,vx,vy,vz,s0,s1,life,col,a,add);
    var n=q==='ultraplus'?3:q==='ultra'?2:1;
    for(var i=0;i<n;i++){
      var j=.7+Math.random()*.6;
      _emit.call(this,x+(Math.random()-.5)*.15,y,z+(Math.random()-.5)*.15,vx*j,vy*j,vz*j,s0,s1,life*(.9+Math.random()*.2),col,a,add);
    }
  };
  V.Pool._p9=1;
}

/* ---------- UI polish (race-like HUD glass) ---------- */
function uiPolish(){
  if(document.getElementById('p9-css'))return;
  var st=document.createElement('style'); st.id='p9-css';
  st.textContent=[
    '#hud .panel,#menu .panel,.u-glass,#pause-modal .modal-card{backdrop-filter:blur(10px) saturate(1.2);-webkit-backdrop-filter:blur(10px) saturate(1.2)}',
    '#menu h1 span,#menu h1{text-shadow:0 0 28px rgba(255,200,80,.35),0 2px 0 rgba(0,0,0,.35)}',
    '.gfx-q{box-shadow:0 0 0 1px rgba(255,209,102,.25),0 4px 18px rgba(0,0,0,.4)}',
    '#v10-gauge{filter:drop-shadow(0 4px 12px rgba(0,0,0,.45))}',
    'body.v10-fr .gfx-q b{color:#ffe08a}'
  ].join('');
  document.head.appendChild(st);
}

/* ---------- quality defaults: Ultra+ on desktop ---------- */
function preferCrazy(){
  if(touch())return;
  var saved=localStorage.getItem('uae_q');
  if(!saved||saved==='auto'||saved==='high'){
    localStorage.setItem('uae_q','ultraplus');
    localStorage.setItem('uae_qplus','1');
    if(window.__gfx&&__gfx.set)__gfx.set('ultraplus');
    else{
      var s=document.getElementById('set-quality');
      if(s){s.value='ultra';s.dispatchEvent(new Event('change'))}
    }
  }
}

/* ---------- main tick ---------- */
var lastQ='', readyTries=0;
function tick(){
  requestAnimationFrame(tick);
  ensureWorldTex();
  hookComposer();
  installPasses();
  tuneRenderer();
  uiPolish();
  boostParticles();
  var q=qEff();
  if(q!==lastQ){setPassQuality(q);lastQ=q;worldDone=false; /* re-eval */ if(q==='low'){landmarkDone=false}}
  var fr=FR();
  if(fr&&fr.active){
    enhanceWorld();
    buildLandmarks();
    cascadeShadows();
    // env swap day/dusk soft
    if(fr.W&&fr.W.scene&&isPlus()){
      var env=nightAmt>.55?(TEX.envNight||TEX.envDusk||TEX.envDay):(TEX.envDay||TEX.envGoegap);
      if(env){fr.W.scene.environment=env;fr.W.scene.environmentIntensity=nightAmt>.55?.7:.9}
    }
    if(cloudGroup){cloudGroup.children.forEach(function(c,i){c.position.x+=.015*(1+(i%3)); if(c.position.x>1200)c.position.x=-1200})}
  }
  // Also enhance race scene cars/characters continuously
  if((readyTries++%30)===0){enhanceCars();enhanceCharacters();enhanceRaceBackdrop()}
  updateHeadlights();
  // Race scene environment boost
  try{
    var rd=window.__rd;
    if(rd&&rd.scene&&isPlus()){
      var env=TEX.envGoegap||TEX.envDay;
      if(env&&!rd.scene.environment){rd.scene.environment=env;rd.scene.environmentIntensity=.75}
      else if(env&&rd.scene.environmentIntensity!=null&&rd.scene.environmentIntensity<.7)rd.scene.environmentIntensity=.75;
    }
  }catch(e){}
}

/* ---------- race backdrop densify ---------- */
var raceBG=false;
function enhanceRaceBackdrop(){
  if(raceBG||!isPlus())return;
  var bd=window.__rd&&__rd.env&&__rd.env.backdrop; if(!bd||!bd.group)return;
  var tAPI=T(); if(!tAPI)return;
  var glass=new tAPI.Std({color:0xcfe0f0,metalness:.9,roughness:.12,envMapIntensity:1.3,emissive:0x102030,emissiveIntensity:.12});
  var G=new tAPI.Group(); G.name='p9_race_skyline';
  for(var i=0;i<24;i++){
    var x=-220+i*18+(i%3)*4, h=40+((i*37)%120), w=8+(i%4)*3;
    var m=new tAPI.Mesh(new tAPI.Box(w,h,w*0.7),glass);
    m.position.set(x,h/2,-380-(i%5)*8); m.frustumCulled=false; G.add(m);
  }
  // mini procedural sail
  for(var j=0;j<8;j++){var t=j/7,h2=20+t*70,w2=12*(1-t*.5); var s=new tAPI.Mesh(new tAPI.Box(w2,h2,4),new tAPI.Std({color:0xf0e8dc,metalness:.4,roughness:.3})); s.position.set(90+t*6,h2/2,-360); s.frustumCulled=false; G.add(s)}
  bd.group.add(G); raceBG=true;
}

/* ---------- public + boot ---------- */
window.__p9={ver:VER,ensureWorldTex:ensureWorldTex,enhanceWorld:enhanceWorld,setPassQuality:setPassQuality,isMax:isMax};
// Default crazy on desktop once DOM ready
setTimeout(preferCrazy,800);
setTimeout(preferCrazy,2500);
requestAnimationFrame(tick);
console.info('[p9] crazy graphics loaded');
})();

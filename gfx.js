/* Roadster Dash UAE — P4 graphics: quality presets (Low/Medium/High/Ultra/Auto), env reflections, shadows. */
(function(){'use strict';
var LBL={auto:'Auto',low:'Low',medium:'Medium',high:'High',ultra:'Ultra',ultraplus:'Ultra+'},ORDER=['auto','low','medium','high','ultra','ultraplus'];
function sel(){return document.getElementById('set-quality')}
function cur(){var s=sel();if(!s)return 'auto';return s.value==='ultra'&&localStorage.getItem('uae_qplus')==='1'?'ultraplus':s.value}
function setQ(v){var s=sel();if(!s)return;localStorage.setItem('uae_qplus',v==='ultraplus'?'1':'0');s.value=v==='ultraplus'?'ultra':v;s.dispatchEvent(new Event('change'));localStorage.setItem('uae_q',v);upd();apply()}
function touch(){return navigator.maxTouchPoints>0||matchMedia('(pointer:coarse)').matches}
// smart default once: touch devices (iPad) → Medium, desktops keep adaptive Auto
function initQ(){var s=sel();if(!s)return false;var saved=localStorage.getItem('uae_q');if(!saved){saved=touch()?'medium':'ultraplus';localStorage.setItem('uae_q',saved);if(saved==='ultraplus')localStorage.setItem('uae_qplus','1')}var sv=saved==='ultraplus'?'ultra':saved;if(s.value!==sv){s.value=sv;s.dispatchEvent(new Event('change'))}return true}
function eff(){var q=cur();if(q==='auto')return touch()?'medium':'high';return q}
// equirect sky texture for reflections
var envTex=null;function env(){if(envTex)return envTex;var T=window.__T;if(!T)return null;var c=document.createElement('canvas');c.width=1024;c.height=512;var g=c.getContext('2d');
 var gr=g.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#5f8fd0');gr.addColorStop(.42,'#cfe1f4');gr.addColorStop(.5,'#f6e7cf');gr.addColorStop(.53,'#9c8a72');gr.addColorStop(1,'#3b352e');g.fillStyle=gr;g.fillRect(0,0,1024,512);
 var sg=g.createRadialGradient(300,150,4,300,150,90);sg.addColorStop(0,'rgba(255,250,235,1)');sg.addColorStop(.2,'rgba(255,240,210,.9)');sg.addColorStop(1,'rgba(255,230,190,0)');g.fillStyle=sg;g.fillRect(180,40,240,240);
 for(var i=0;i<40;i++){g.fillStyle='rgba(40,50,70,'+(.25+Math.random()*.4)+')';var w=8+Math.random()*30,h=20+Math.random()*90;g.fillRect(Math.random()*1024,256-h,w,h)}
 g.fillStyle='rgba(255,255,255,.95)';for(var k=0;k<6;k++)g.fillRect(100+k*150,10,90,14);
 var t=new T.CanvasTex(c);t.mapping=303;t.colorSpace=T.SRGB;envTex=t;return t}
function apply(){var FR=window.__fr,rd=window.__rd;if(!rd||!rd.renderer)return;var q=eff(),R=rd.renderer;
 var W=FR&&FR.W;if(W&&W.scene){var e=env();if(e&&W.scene.environment!==e){W.scene.environment=e}W.scene.environmentIntensity=q==='low'?.35:.6;
  if(W.sun){var sh=q==='low'?0:q==='medium'?1024:q==='high'?2048:4096;W.sun.castShadow=sh>0;if(sh&&W.sun.shadow.mapSize.width!==sh){W.sun.shadow.mapSize.width=W.sun.shadow.mapSize.height=sh;if(W.sun.shadow.map){W.sun.shadow.map.dispose();W.sun.shadow.map=null}}
   var ext=q==='ultraplus'?90:q==='ultra'?70:q==='high'?55:40,sc=W.sun.shadow.camera;if(sc.right!==ext){sc.left=-ext;sc.right=ext;sc.top=ext;sc.bottom=-ext;sc.updateProjectionMatrix()}W.sun.shadow.bias=-.0004;W.sun.shadow.normalBias=.02}}
 R.shadowMap.enabled=q!=='low';plus(q==='ultraplus')}
/* P6 Ultra+ (desktop max): Poly Haven CC0 HDRI image-based lighting, 4K soft PCF shadows, stronger bloom + FXAA,
   screen-space post pass (speed motion blur, DOF-lite edge blur, warm sun haze, vignette), optional wet-look asphalt. */
var hdri=null,hdriL=false,post=null,saved=null,wetOn=localStorage.getItem('uae_wet')==='1',wetSet=[];
function loadHdri(){if(hdri||hdriL)return;hdriL=true;var im=new Image();im.onload=function(){var T=window.__T,t=new T.CanvasTex(im);t.mapping=303;t.colorSpace=T.SRGB;t.needsUpdate=true;hdri=t};im.onerror=function(){hdriL=false};im.src='models/env_kloofendal.jpg?v=p10'}
var FS='uniform sampler2D tDiffuse;uniform float uSpeed,uDof,uHaze;uniform vec2 uRes;varying vec2 vUv;void main(){vec2 c=vec2(.5,.56);vec2 d=vUv-c;vec4 col=texture2D(tDiffuse,vUv);'+
 'float mb=uSpeed*smoothstep(.12,.75,length(d));if(mb>.003){vec4 a=vec4(0.);for(int i=0;i<10;i++){float t=float(i)/9.;a+=texture2D(tDiffuse,vUv-d*mb*.075*t);}col=mix(col,a/10.,clamp(mb*2.2,0.,1.));}'+
 'float db=uDof*smoothstep(.3,.5,abs(vUv.y-.52));if(db>.003){vec2 px=2.5/uRes;vec4 b=(texture2D(tDiffuse,vUv+px)+texture2D(tDiffuse,vUv-px)+texture2D(tDiffuse,vUv+vec2(px.x,-px.y))+texture2D(tDiffuse,vUv+vec2(-px.x,px.y))+texture2D(tDiffuse,vUv+vec2(px.x*2.,0.))+texture2D(tDiffuse,vUv-vec2(px.x*2.,0.)))/6.;col=mix(col,b,db);}'+
 'col.rgb+=uHaze*vec3(1.,.8,.55)*pow(max(0.,vUv.y-.3),1.5)*.16;col.rgb=mix(col.rgb,col.rgb*vec3(1.03,1.,.96),uHaze);float v=smoothstep(1.,.38,length(d*vec2(1.,1.15)));col.rgb*=mix(.8,1.,v);gl_FragColor=col;}';
var VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
function mkPost(){var C=window.__comp;if(!C||!C.SP)return null;if(post)return post;post=new C.SP({uniforms:{tDiffuse:{value:null},uSpeed:{value:0},uDof:{value:.6},uHaze:{value:1},uRes:{value:{x:1600,y:900}}},vertexShader:VS,fragmentShader:FS});
 var i=C.rs.passes.indexOf(C.grade);C.rs.insertPass(post,i<0?C.rs.passes.length-1:i);post.enabled=false;return post}
function roadMats(W){var out=[];W.scene.traverse(function(o){if(!o.isMesh||!o.material||Array.isArray(o.material)||o.userData.real)return;var m=o.material;if(!m.isMeshStandardMaterial||m.transparent)return;var g=o.geometry;if(!g)return;if(!g.boundingBox)g.computeBoundingBox();var b=g.boundingBox,sx=b.max.x-b.min.x,sy=b.max.y-b.min.y,sz=b.max.z-b.min.z;if(sy>.5||sx*sz<400)return;var c=m.color,l=.3*c.r+.6*c.g+.1*c.b;if(l<.12||m.map&&l<.6){if(out.indexOf(m)<0)out.push(m)}});return out}
function wet(on,W){if(on){if(!wetSet.length)wetSet=roadMats(W).map(function(m){return{m:m,r:m.roughness,mt:m.metalness,e:m.envMapIntensity}});wetSet.forEach(function(x){x.m.roughness=.16;x.m.metalness=.25;x.m.envMapIntensity=1.6;x.m.needsUpdate=true})}
 else{wetSet.forEach(function(x){x.m.roughness=x.r;x.m.metalness=x.mt;x.m.envMapIntensity=x.e;x.m.needsUpdate=true});wetSet=[]}}
var plusWas=false,wetWas=false;
function plus(on){var FR=window.__fr,W=FR&&FR.W,C=window.__comp;if(on)loadHdri();
 if(W&&W.scene){if(on&&hdri){if(W.scene.environment!==hdri)W.scene.environment=hdri;W.scene.environmentIntensity=.85}else if(!on&&W.scene.environment===hdri){W.scene.environment=env()}}
 if(C){var p=mkPost();if(on&&!plusWas){saved={bs:C.bloom.strength,br:C.bloom.radius,fx:C.fxaa.enabled}}if(on){C.bloom.strength=Math.max(saved?saved.bs:0,.85);C.bloom.radius=.75;C.fxaa.enabled=true}else if(plusWas&&saved){C.bloom.strength=saved.bs;C.bloom.radius=saved.br;C.fxaa.enabled=saved.fx}if(p)p.enabled=on&&!!(FR&&FR.active)}
 var w=on&&wetOn;if(W&&W.scene&&w!==wetWas){wet(w,W);wetWas=w}plusWas=on;wetBtn()}
(function tick(){requestAnimationFrame(tick);if(!post||!post.enabled)return;var FR=window.__fr,k=FR&&FR.ST?Math.abs(FR.ST.kmh||0):0;var tgt=Math.max(0,Math.min(1,(k-90)/180));var u=post.uniforms;u.uSpeed.value+=(tgt-u.uSpeed.value)*.08;var cv=window.__rd&&__rd.renderer&&__rd.renderer.domElement;if(cv)u.uRes.value={x:cv.width,y:cv.height}})();
function wetBtn(){var FR=window.__fr,hud=FR&&FR.hudEl&&FR.hudEl(),top=hud&&hud.querySelector('.top');if(!top)return;var b=top.querySelector('.gfx-wet');var show=eff()==='ultraplus';if(!b&&show){b=document.createElement('button');b.className='gfx-q gfx-wet';b.onclick=function(e){e.stopPropagation();wetOn=!wetOn;localStorage.setItem('uae_wet',wetOn?'1':'0');plus(true);FR.toast&&FR.toast(wetOn?'💧 Wet road ON':'Dry road')};top.appendChild(b)}if(b){b.style.display=show?'':'none';b.innerHTML='💧 Wet road: <b>'+(wetOn?'ON':'OFF')+'</b>'}}
function upd(){var t=LBL[cur()]||'Auto',e=eff();document.querySelectorAll('.gfx-q').forEach(function(b){b.innerHTML='✨ Quality: <b>'+t+'</b>'+(cur()==='auto'?' <small>('+LBL[e]+')</small>':'')})}
function cycle(e){e&&e.stopPropagation();var i=ORDER.indexOf(cur());setQ(ORDER[(i+1)%ORDER.length]);var FR=window.__fr;FR&&FR.toast&&FR.toast('✨ Graphics: '+LBL[cur()])}
var css=document.createElement('style');css.textContent='.gfx-q{font:800 13px Rajdhani,Arial;padding:7px 10px;border-radius:6px;border:0;cursor:pointer;background:rgba(20,24,34,.85);color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.35)}.gfx-q b{color:#ffd166}.gfx-q small{opacity:.7}#u-p3bar .gfx-q{grid-column:1/-1;padding:10px}';document.head.appendChild(css);
function btns(){var bar=document.getElementById('u-p3bar');if(bar&&!bar.querySelector('.gfx-q')){var b=document.createElement('button');b.className='gfx-q';b.onclick=cycle;bar.appendChild(b);upd()}
 var FR=window.__fr,hud=FR&&FR.hudEl&&FR.hudEl(),top=hud&&hud.querySelector('.top');if(top&&!top.querySelector('.gfx-q')){var b2=document.createElement('button');b2.className='gfx-q';b2.onclick=cycle;top.appendChild(b2);upd()}}
var inited=false;setInterval(function(){if(!inited)inited=initQ();btns();apply()},1000);
addEventListener('keydown',function(e){if(e.code==='KeyO'&&!/INPUT|TEXTAREA/.test((e.target||{}).tagName||'')&&window.__fr&&__fr.active)cycle()});
window.__gfx={plusOn:function(){return eff()==='ultraplus'},set:setQ,cur:cur,eff:eff,apply:apply};
})();
/* P5: replace box-shaped traffic cars with real car models once their GLBs are loaded */
(function(){var KS=['camry','lexus','maxima','landcruiser','hilux','patrol','camry','maxima'],hid=null;
 setInterval(function(){var FR=window.__fr,U=window.__uae;if(!FR||!FR.active||!U||!U.carModel||!FR.trafficList)return;if(window.__gfx&&__gfx.eff()==='low')return;var T=window.__T;if(!hid)hid=new T.Basic({visible:false});var n=0;
  FR.trafficList.forEach(function(c,i){if(!c.m||c.m.userData.real||n>=4)return;var bb=c.m.geometry&&c.m.geometry.boundingSphere;if(bb&&bb.radius>5)return;/* keep buses */
   var col=c.m.userData.col;if(col==null){var ca=c.m.geometry.attributes.color;col=ca?((Math.round(ca.getX(0)*255)<<16)|(Math.round(ca.getY(0)*255)<<8)|Math.round(ca.getZ(0)*255)):0xeeeeee;c.m.userData.col=col}
   var m=U.carModel(KS[i%KS.length],'#'+('00000'+col.toString(16)).slice(-6));if(!m||m==='fail')return;n++;c.m.material=hid;c.m.castShadow=false;m.traverse(function(o){if(o.isMesh){o.castShadow=false}});c.m.add(m);c.m.userData.real=1})},700)})();

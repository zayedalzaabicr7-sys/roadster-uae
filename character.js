/* Roadster Dash UAE — Phase 2: original low-poly characters + creator data (procedural, no external assets) */
(function(){'use strict';
var CH=window.__chr={};
var SKIN=['#f1c9a5','#e0ac83','#c68a5e','#a86f45','#8a5634','#5e3a22'];
var HAIRC=['#111111','#3b2416','#6b4423','#a0a0a0'];
var OUT={kandoora:{en:'Kandoora',ar:'كندورة'},abaya:{en:'Abaya',ar:'عباية'},casual:{en:'Casual',ar:'كاجوال'}};
var STYLE={emirati:{en:'Emirati',ar:'إماراتي'},saudi:{en:'Saudi',ar:'سعودي'},omani:{en:'Omani',ar:'عُماني'}};
var KCOL={white:'#f5f3ee',cream:'#ece0c4',grey:'#a9adb3',brown:'#7a5a3e',navy:'#1f2c4d'};
var HEAD={ghutra:'White ghutra + agal',shemagh:'Red shemagh + agal',kumma:'Omani kumma',cap:'Cap',shayla:'Shayla (headscarf)',none:'None'};
CH.OPTS={skin:SKIN,hairc:HAIRC,out:OUT,style:STYLE,kcol:KCOL,head:HEAD,hair:['short','buzz','long','none'],beard:['none','stubble','short','full','goatee'],face:['calm','smile','serious'],shoes:['#3b2a1e','#111111','#f2f2f2','#c8a46a'],casual:['#c8102e','#1d4ed8','#00843d','#111111','#f2f2f2']};
CH.DEF={skin:2,face:0,hair:'short',hairc:0,beard:'short',head:'ghutra',out:'kandoora',style:'emirati',kcol:'white',casual:'#1d4ed8',glasses:false,watch:true,shoes:'#3b2a1e'};
CH.sanitize=function(l){var d=CH.DEF,o={};l=l||{};for(var k in d)o[k]=l[k]!=null?l[k]:d[k];o.skin=Math.max(0,Math.min(5,o.skin|0));o.face=Math.max(0,Math.min(2,o.face|0));o.hairc=Math.max(0,Math.min(3,o.hairc|0));
 if(CH.OPTS.hair.indexOf(o.hair)<0)o.hair='short';if(CH.OPTS.beard.indexOf(o.beard)<0)o.beard='none';if(!HEAD[o.head])o.head='none';if(!OUT[o.out])o.out='kandoora';if(!STYLE[o.style])o.style='emirati';if(!KCOL[o.kcol])o.kcol='white';
 if(!/^#[0-9a-f]{6}$/i.test(o.casual))o.casual='#1d4ed8';if(!/^#[0-9a-f]{6}$/i.test(o.shoes))o.shoes='#3b2a1e';o.glasses=!!o.glasses;o.watch=!!o.watch;return o};
// build: returns {g, parts, anim(dt,speed,state)} — v3 proportions (≈1.8 m), jointed limbs, sculpted head
CH.build=function(look){var T=window.__T,L=CH.sanitize(look),G=new T.Group(),P={};
 var M=function(c,o){o=o||{};return new T.Std({color:c,roughness:o.r==null?.7:o.r,metalness:o.m||0})};
 var add=function(par,geo,mat,x,y,z){var m=new T.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.castShadow=true;par.add(m);return m};
 var fem=L.out==='abaya'||L.head==='shayla';
 var skin=M(SKIN[L.skin],{r:.55}),hairM=M(HAIRC[L.hairc],{r:.9}),shoe=M(L.shoes,{r:.45}),dark=M('#141414',{r:.4}),white=M('#fbfbf8',{r:.3});
 var robe=L.out==='abaya'?M('#101012',{r:.75}):L.out==='kandoora'?M(KCOL[L.kcol],{r:.8}):null;
 var shirt=M(L.casual,{r:.8}),jeans=M('#2c3e66',{r:.85});
 var hips=new T.Group();hips.position.y=.98;G.add(hips);P.hips=hips;
 // legs: thigh + shin with knee joint
 ['L','R'].forEach(function(s,i){var x=i?.1:-.1,leg=new T.Group();leg.position.set(x,0,0);hips.add(leg);var pant=L.out==='casual'?jeans:(robe||jeans);
  add(leg,new T.Cyl(.085,.07,.46,9),pant,0,-.23,0);var knee=new T.Group();knee.position.y=-.46;leg.add(knee);add(knee,new T.Cyl(.068,.055,.44,9),pant,0,-.22,0);add(knee,new T.Cyl(.05,.05,.05,8),robe?skin:pant,0,-.43,0);
  var foot=add(knee,new T.Box(.11,.07,.26),shoe,0,-.47,-.05);if(L.out==='kandoora'){add(knee,new T.Box(.115,.02,.2),M('#5a3a22'),0,-.5,-.06)}
  P['leg'+s]=leg;P['knee'+s]=knee});
 // torso
 var chest=new T.Group();hips.add(chest);P.chest=chest;
 if(robe){var hem=L.out==='abaya'?.98:.9;var skirt=add(chest,new T.Cyl(.24,.33,hem,16),robe,0,-hem/2+.02,0);P.skirt=skirt;
  add(chest,new T.Cyl(fem?.2:.23,.24,.62,14),robe,0,.32,0);var sh=add(chest,new T.Sphere(.24,14,8,0,Math.PI*2,0,Math.PI*.5),robe,0,.6,0);sh.scale.set(fem?1.15:1.35,.45,.85)}
 else{add(chest,new T.Cyl(.23,.2,.62,12),shirt,0,.32,0);var sh2=add(chest,new T.Sphere(.23,12,8,0,Math.PI*2,0,Math.PI*.5),shirt,0,.6,0);sh2.scale.set(1.35,.42,.85);add(chest,new T.Cyl(.2,.2,.14,12),jeans,0,-.02,0);add(chest,new T.Box(.4,.04,.22),M('#3b2a1e'),0,.04,0)}
 // style details
 if(L.out==='kandoora'){var collar=add(chest,new T.Cyl(.075,.085,.07,12),robe,0,.66,0);
  if(L.style==='emirati'){add(chest,new T.Cyl(.008,.008,.34,5),robe,.03,.42,-.235);add(chest,new T.Sphere(.03,8,6),robe,.03,.24,-.235)}
  if(L.style==='saudi'){[0,1,2].forEach(function(i){add(chest,new T.Sphere(.013,6,4),M('#c9b37a',{m:.6}),0,.58-i*.07,-.225)});add(chest,new T.Box(.12,.05,.03),robe,0,.66,-.07)}
  if(L.style==='omani'){add(chest,new T.Cyl(.007,.007,.28,4),M('#c8a46a'),0,.45,-.235);add(chest,new T.Sphere(.032,8,6),M('#c8a46a'),0,.3,-.235)}
  add(chest,new T.Box(.1,.012,.012),robe,0,.62,-.22)}
 if(L.out==='abaya'){add(chest,new T.Box(.05,1.3,.02),M('#c9a24a',{m:.4}),0,.0,-.25);}
 // arms: upper + forearm, hands with thumb
 ['L','R'].forEach(function(s,i){var sx=i?1:-1,arm=new T.Group();arm.position.set(sx*.3,.6,0);chest.add(arm);var sleeve=robe||shirt;
  add(arm,new T.Sphere(.075,10,8),sleeve,0,0,0);add(arm,new T.Cyl(.07,.06,.32,10),sleeve,0,-.17,0);var el=new T.Group();el.position.y=-.33;arm.add(el);
  add(el,new T.Cyl(.06,robe?.065:.05,.28,10),robe?sleeve:(L.out==='casual'?skin:sleeve),0,-.14,0);
  var hand=new T.Group();hand.position.y=-.32;el.add(hand);var palm=add(hand,new T.Box(.075,.1,.04),skin,0,-.02,0);add(hand,new T.Box(.07,.06,.035),skin,0,-.09,-.008);var th=add(hand,new T.Box(.025,.06,.025),skin,sx*-.04,-.02,-.025);th.rotation.z=sx*.4;
  if(s==='L'&&L.watch)add(el,new T.Cyl(.058,.058,.035,12),M('#d4af37',{m:1,r:.25}),0,-.25,0);P['arm'+s]=arm;P['elbow'+s]=el;P['hand'+s]=hand});
 // head
 var head=new T.Group();head.position.y=.7;chest.add(head);P.head=head;
 add(head,new T.Cyl(.055,.065,.12,10),skin,0,.02,0);
 var skull=add(head,new T.Sphere(.115,16,12),skin,0,.17,0);skull.scale.set(.92,1.12,1);
 var jaw=add(head,new T.Box(.16,.09,.16),skin,0,.09,-.015);
 var chin=add(head,new T.Sphere(.055,10,8),skin,0,.075,-.07);chin.scale.set(1.2,.8,.8);
 ['L','R'].forEach(function(s,i){var x=i?.042:-.042;var w=add(head,new T.Sphere(.021,10,8),white,x,.178,-.108);w.scale.set(1.2,.8,.5);add(head,new T.Sphere(.0105,8,6),M('#2a1a10',{r:.2}),x,.178,-.117);
  var br=add(head,new T.Box(.05,.013,.016),hairM,x,.207,-.112);br.rotation.z=(i?-1:1)*(L.face===2?.18:-.05);
  var ear=add(head,new T.Sphere(.03,8,6),skin,i?.108:-.108,.16,0);ear.scale.set(.45,1,.8)});
 var nose=add(head,new T.Box(.03,.055,.04),skin,0,.148,-.12);nose.rotation.x=-.2;
 var mouth=add(head,new T.Box(L.face===1?.055:.042,.011,.01),M('#8a3b30'),0,.108,-.113);if(L.face===1){var sm=add(head,new T.Box(.05,.009,.01),white,0,.116,-.112)}
 if(L.beard!=='none'){var bm=hairM;if(L.beard==='stubble'){bm=M(HAIRC[L.hairc],{r:1});bm.transparent=true;bm.opacity=.5}
  if(L.beard==='goatee'){add(head,new T.Box(.055,.06,.035),bm,0,.07,-.095);add(head,new T.Box(.065,.012,.012),bm,0,.124,-.119)}
  else{var b=add(head,new T.Sphere(.122,14,10,0,Math.PI*2,Math.PI*.6,Math.PI*.36),bm,0,.15,-.01);b.scale.set(.95,L.beard==='full'?1.3:1.02,1.04);add(head,new T.Box(.075,.016,.014),bm,0,.124,-.119)}}
 var hairShow=L.head==='none'||L.head==='cap';
 if(hairShow&&L.hair!=='none'){var hh=add(head,new T.Sphere(.122,14,10,0,Math.PI*2,0,Math.PI*(L.hair==='buzz'?.36:.52)),hairM,0,.175,.008);hh.scale.set(.96,1.12,1.04);if(L.hair==='long')add(head,new T.Box(.22,.26,.07),hairM,0,.05,.09)}
 if(L.head==='ghutra'||L.head==='shemagh'){var cl=L.head==='ghutra'?M('#fbfbf9',{r:.85}):(function(){var c=document.createElement('canvas');c.width=c.height=64;var g=c.getContext('2d');g.fillStyle='#f4f1ec';g.fillRect(0,0,64,64);g.fillStyle='#b3121f';for(var i=0;i<8;i++)for(var j=0;j<8;j++)if((i+j)%2===0)g.fillRect(i*8+1,j*8+1,6,6);var t=new T.CanvasTex(c);t.colorSpace=T.SRGB;t.wrapS=t.wrapT=1000;t.repeat.set(3,3);return new T.Std({map:t,roughness:.85})})();
  cl.side=2;var cap=add(head,new T.Sphere(.134,16,10,0,Math.PI*2,0,Math.PI*.4),cl,0,.175,.005);cap.scale.set(1,1.12,1.06);var capB=add(head,new T.Sphere(.136,16,10,Math.PI*1.65,Math.PI*1.7,0,Math.PI*.62),cl,0,.175,.008);capB.scale.set(1,1.12,1.06);
  // cloth frames the face and falls over shoulders and back
  var back=add(head,new T.Cyl(.14,.3,.5,16,1,true,Math.PI*.22,Math.PI*1.56),cl,0,-.04,.02);back.rotation.y=Math.PI;
  ['L','R'].forEach(function(s,i){var sd=add(head,new T.Box(.022,.44,.17),cl,(i?1:-1)*.13,.0,-.035);sd.rotation.z=(i?1:-1)*.2;sd.rotation.x=.06});
  var brim=add(head,new T.Cyl(.135,.135,.03,16,1,true,Math.PI*.7,Math.PI*.6),cl,0,.235,0);
  var ag=M('#0c0c0c',{r:.5});var a1=add(head,new T.Cyl(.138,.138,.03,18),ag,0,.27,.012);var a2=add(head,new T.Cyl(.14,.14,.03,18),ag,0,.235,.012);a1.rotation.x=a2.rotation.x=-.12;
  [-.03,.03].forEach(function(x){var tl=add(head,new T.Cyl(.008,.008,.28,5),ag,x,.1,.15);tl.rotation.x=.25})}
 if(L.head==='kumma'){add(head,new T.Cyl(.125,.13,.12,16),M('#f2efe6'),0,.27,.005);var em=add(head,new T.Cyl(.132,.132,.04,16),M('#7a1f2b'),0,.24,.005);add(head,new T.Cyl(.127,.127,.02,16),M('#00843d'),0,.31,.005)}
 if(L.head==='cap'){add(head,new T.Sphere(.128,14,8,0,Math.PI*2,0,Math.PI*.45),M(L.casual),0,.2,.005);add(head,new T.Box(.17,.014,.11),M(L.casual),0,.245,-.15)}
 if(L.head==='shayla'){var shm=M('#151517',{r:.8});shm.side=2;var hs=add(head,new T.Sphere(.138,16,10,0,Math.PI*2,0,Math.PI*.64),shm,0,.165,.008);hs.scale.set(1,1.1,1.05);var d2=add(head,new T.Cyl(.13,.27,.42,16,1,true,Math.PI*.24,Math.PI*1.52),shm,0,-.02,0);d2.rotation.y=Math.PI}
 if(L.glasses){var gl=M('#0b0b0b',{r:.15,m:.6});add(head,new T.Box(.2,.04,.015),gl,0,.177,-.112);add(head,new T.Box(.008,.01,.2),gl,-.1,.18,-.02);add(head,new T.Box(.008,.01,.2),gl,.1,.18,-.02)}
 G.userData.look=L;
 var ph=Math.random()*6,blend=0;
 function anim(dt,sp,state){ph+=dt*(2.2+sp*1.5);var run=Math.min(1,sp/3.5),sw=Math.min(1,sp/2.5)*(.5+run*.35)*(robe?.6:1),s=Math.sin(ph),c=Math.cos(ph);
  P.legL.rotation.x=s*sw;P.legR.rotation.x=-s*sw;
  P.kneeL.rotation.x=Math.max(0,-c)*sw*1.3+(run*.2);P.kneeR.rotation.x=Math.max(0,c)*sw*1.3+(run*.2);
  P.armL.rotation.x=-s*sw*.85;P.armR.rotation.x=s*sw*.85;P.elbowL.rotation.x=-(.25+run*.9)*Math.min(1,sp);P.elbowR.rotation.x=-(.25+run*.9)*Math.min(1,sp);
  P.armL.rotation.z=-.08;P.armR.rotation.z=.08;chest.rotation.y=s*sw*.12;chest.rotation.x=run*.12;head.rotation.y=-s*sw*.08;
  hips.position.y=.98+Math.abs(c)*sw*.06-run*.03;if(P.skirt){P.skirt.rotation.x=s*sw*.12;P.skirt.rotation.z=c*sw*.05}
  if(sp<.1){var br=Math.sin(performance.now()*.002+ph)*.012;chest.position.y=br;P.armL.rotation.z=-.1-br;P.armR.rotation.z=.1+br}
  if(state==='air'){P.legL.rotation.x=.6;P.legR.rotation.x=-.25;P.kneeL.rotation.x=.9;P.kneeR.rotation.x=.4;P.armL.rotation.z=-.7;P.armR.rotation.z=.7}
  if(state==='punch'){P.armR.rotation.x=-1.55;P.elbowR.rotation.x=0}
  if(state==='aim'){P.armR.rotation.x=-1.45;P.elbowR.rotation.x=-.1;P.armL.rotation.x=-1.25;P.elbowL.rotation.x=-.5;P.armL.rotation.z=.4}
  if(state==='ko'){G.rotation.x=-1.45}else G.rotation.x=0;
  if(state==='sit'){P.legL.rotation.x=P.legR.rotation.x=-1.45;P.kneeL.rotation.x=P.kneeR.rotation.x=1.4;hips.position.y=.55}}
 return{g:G,P:P,anim:anim,look:L}};
// stylised original weapon models (toy-like)
CH.WEAP={fist:{en:'Fists',ar:'لكمة',dmg:12,range:2,rate:.45,ammo:0},pistol:{en:'Pistol',ar:'مسدس',dmg:14,range:45,rate:.35,ammo:36,col:'#2b2f36'},smg:{en:'SMG',ar:'رشاش',dmg:8,range:35,rate:.1,ammo:120,col:'#3a3f48'},
 shotgun:{en:'Shotgun',ar:'شوزن',dmg:34,range:18,rate:.9,ammo:16,col:'#5a3d26'},rifle:{en:'Rifle',ar:'بندقية',dmg:22,range:80,rate:.22,ammo:60,col:'#4b5320'},water:{en:'Water gun',ar:'مسدس ماء',dmg:4,range:22,rate:.12,ammo:200,col:'#29a8e0'},paint:{en:'Paint gun',ar:'مسدس ألوان',dmg:7,range:30,rate:.2,ammo:90,col:'#e0299b'}};
CH.weaponMesh=function(k){var T=window.__T,w=CH.WEAP[k];if(!w||k==='fist')return null;var g=new T.Group(),m=new T.Std({color:w.col,roughness:.4,metalness:.3}),a=new T.Std({color:'#f3d77a',roughness:.4,metalness:.6});
 var L={pistol:.22,smg:.38,shotgun:.62,rifle:.72,water:.4,paint:.42}[k];var b=new T.Mesh(new T.Box(.07,.09,L),m);b.position.z=-L/2;g.add(b);var gr=new T.Mesh(new T.Box(.05,.13,.06),m);gr.position.set(0,-.09,-.04);g.add(gr);
 if(k==='water'){var t=new T.Mesh(new T.Cyl(.07,.07,.16,10),new T.Std({color:'#7fd3f7',transparent:true,opacity:.7}));t.position.set(0,.1,-.2);g.add(t)}
 if(k==='paint'){var t2=new T.Mesh(new T.Sphere(.07,10,8),new T.Std({color:'#ffd400'}));t2.position.set(0,.1,-.2);g.add(t2)}
 if(k==='rifle'||k==='shotgun'){var s=new T.Mesh(new T.Box(.06,.1,.2),m);s.position.set(0,-.02,.12);g.add(s)}
 var tip=new T.Mesh(new T.Box(.075,.03,.03),a);tip.position.set(0,.03,-L);g.add(tip);g.userData.len=L;return g};
CH.SKIN=SKIN;CH.HAIRC=HAIRC;CH.KCOL=KCOL;
})();

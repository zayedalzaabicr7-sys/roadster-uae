/* Roadster Dash UAE — v10 Garage screen (cars, paint, plate, wheels & tyres, tuning) */
(function(){'use strict';
var V=window.__v10;if(!V)return;
function U(){return window.__uae}
var TAB='cars',root=null;
var css=`
#v10g{position:fixed;top:0;left:0;bottom:0;width:min(440px,100vw);z-index:60;display:flex;flex-direction:column;background:rgba(10,12,18,.9);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#f4f1e8;font:14px/1.35 Arial,Helvetica,sans-serif;border-right:1px solid rgba(243,215,122,.35);box-shadow:10px 0 40px rgba(0,0,0,.45)}
#v10g *{box-sizing:border-box}
#v10g .hd{display:flex;align-items:center;gap:10px;padding:14px 16px 8px}
#v10g .hd h2{margin:0;font-size:20px;letter-spacing:1px;flex:1;color:#f3d77a}
#v10g .x{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;border-radius:10px;width:40px;height:40px;font-size:18px;cursor:pointer}
#v10g .tabs{display:flex;gap:6px;padding:0 12px 10px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
#v10g .tabs::-webkit-scrollbar{display:none}
#v10g .tabs button{flex:0 0 auto;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);color:#eee;border-radius:999px;padding:8px 13px;font:600 13px Arial;cursor:pointer;white-space:nowrap}
#v10g .tabs button.on{background:#f3d77a;color:#111;border-color:#f3d77a}
#v10g .bd{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 16px 12px}
#v10g h4{margin:14px 0 8px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#c9c2ad}
#v10g .cars{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
#v10g .car{position:relative;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:10px;cursor:pointer;text-align:left;color:#fff;font:inherit;min-height:66px}
#v10g .car.sel{border-color:#f3d77a;background:rgba(243,215,122,.14)}
#v10g .car.lock{opacity:.5}
#v10g .car b{display:block;font-size:13px;margin:2px 0}
#v10g .car small{display:block;color:#bdb6a2;font-size:11px}
#v10g .car .ic{font-size:20px}
#v10g .row{display:flex;align-items:center;gap:8px;margin:8px 0;flex-wrap:wrap}
#v10g .row label{min-width:86px;color:#ddd}
#v10g .chip{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);color:#fff;border-radius:10px;padding:8px 11px;cursor:pointer;font:600 13px Arial}
#v10g .chip.on{background:#f3d77a;color:#111;border-color:#f3d77a}
#v10g .chip:disabled{opacity:.4;cursor:default}
#v10g .sw{width:34px;height:34px;border-radius:50%;border:2px solid rgba(255,255,255,.3);cursor:pointer;padding:0}
#v10g .sw.on{border-color:#f3d77a;box-shadow:0 0 0 2px #f3d77a}
#v10g input[type=text],#v10g select{background:#151821;border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:10px;padding:9px 10px;font:600 15px Arial;min-width:0}
#v10g input[type=color]{width:46px;height:38px;border:none;background:none;padding:0;cursor:pointer}
#v10g .err{color:#ff8b8b;font-size:12px;min-height:16px}
#v10g .ok{color:#7be3a6;font-size:12px}
#v10g canvas.pl{width:220px;height:110px;border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,.5)}
#v10g .mod{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;margin:8px 0}
#v10g .mod .t{display:flex;justify-content:space-between;align-items:center;gap:8px}
#v10g .mod .lv{display:flex;gap:4px;margin-top:8px}
#v10g .mod .lv i{flex:1;height:7px;border-radius:4px;background:rgba(255,255,255,.14)}
#v10g .mod .lv i.on{background:linear-gradient(90deg,#00c46a,#f3d77a)}
#v10g .mod .bt{display:flex;gap:6px}
#v10g .mod .bt button{width:38px;height:34px;border-radius:9px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:700 18px Arial;cursor:pointer}
#v10g .stats{padding:10px 16px 14px;border-top:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.25)}
#v10g .st{display:grid;grid-template-columns:78px 1fr 40px;align-items:center;gap:8px;font-size:12px;margin:3px 0}
#v10g .st .b{height:8px;border-radius:5px;background:rgba(255,255,255,.12);overflow:hidden;position:relative}
#v10g .st .b span{position:absolute;left:0;top:0;bottom:0;border-radius:5px;background:linear-gradient(90deg,#00843d,#f3d77a)}
#v10g .st .b em{position:absolute;left:0;top:0;bottom:0;border-radius:5px;background:rgba(255,255,255,.35)}
#v10g .note{font-size:12px;color:#bdb6a2;margin:6px 0}
#v10g .fair{font-size:12px;color:#7be3a6;margin-top:4px}
body.v10-garage #menu>*:not(canvas){visibility:hidden}
body.v10-garage #u-bar,body.v10-garage #u-cred{visibility:hidden}
@media (max-width:900px) and (orientation:portrait){#v10g{top:auto;left:0;width:100vw;height:58vh;border-right:none;border-top:1px solid rgba(243,215,122,.35);border-radius:18px 18px 0 0}#v10g .cars{grid-template-columns:repeat(3,1fr)}}
`;
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function statHtml(){var k=U().A.car,s=V.stats(k),b=U().STATS[k]||{speed:1,accel:1,hand:1,boost:1,jump:1};
 var L=[['speed','Speed','السرعة',.85,1.4],['accel','Accel','التسارع',.75,1.9],['hand','Handling','التحكم',.75,1.45],['boost','Boost','البوست',.9,1.35],['jump','Jump','القفز',.85,1.35]];
 return L.map(function(r){var f=function(v){return Math.max(.04,Math.min(1,(v-r[3])/(r[4]-r[3])))};return '<div class="st"><span>'+r[1]+' <span style="color:#998f78">'+r[2]+'</span></span><div class="b"><em style="width:'+(f(b[r[0]])*100).toFixed(1)+'%"></em><span style="width:'+(f(s[r[0]])*100).toFixed(1)+'%"></span></div><b>'+Math.round(s[r[0]]*100)+'</b></div>'}).join('')+
 (V.fairActive()?'<div class="fair">⚖️ Fair mode: Market Day is on — mods are ignored this run</div>':'<div class="note">Bars: white = factory, gold = with your tuning.</div>')}
function body(){var u=U(),A=u.A,k=A.car,c=V.cfg(k),h='';
 if(TAB==='cars'){h='<h4>Choose car · اختر السيارة</h4><div class="cars">'+Object.keys(u.CARS).map(function(id){var cc=u.CARS[id],ok=u.unlocked(id),s=V.stats(id);
   return '<button class="car '+(id===k?'sel ':'')+(ok?'':'lock')+'" data-car="'+id+'"><span class="ic">'+cc.icon+'</span><b>'+esc(cc.en)+'</b><small>'+cc.ar+'</small><small>'+(ok?('⚡ '+Math.round(s.speed*100)+' · 🏁 '+Math.round(s.accel*100)+' · 🎯 '+Math.round(s.hand*100)):('🔒 '+u.needText(cc)))+'</small></button>'}).join('')+'</div>'+
   '<p class="note">Unlock cars with your best score or distance in the runner. Admin → Cars → “Unlock all” opens everything.</p>'}
 if(TAB==='paint'){var np=u.GLB[k]&&u.GLB[k].noPaint;
  if(np)h+='<p class="note">This model is factory-painted (texture). Rim colour and tyres still work.</p>';
  h+='<h4>Paint · الطلاء</h4><div class="row"><button class="chip '+(!c.paint.on?'on':'')+'" data-paint="off" '+(np?'disabled':'')+'>Theme colour</button><button class="chip '+(c.paint.on?'on':'')+'" data-paint="on" '+(np?'disabled':'')+'>Custom</button><input type="color" data-in="hex" value="'+c.paint.hex+'" '+(np?'disabled':'')+' aria-label="Paint colour"></div>'+
  '<div class="row">'+V.PRESETS.map(function(p){return '<button class="sw '+(c.paint.on&&c.paint.hex.toLowerCase()===p[0]?'on':'')+'" title="'+p[1]+'" style="background:'+p[0]+'" data-hex="'+p[0]+'" '+(np?'disabled':'')+'></button>'}).join('')+'</div>'+
  '<h4>Finish · اللمعة</h4><div class="row">'+Object.keys(V.FIN).map(function(f){return '<button class="chip '+(c.paint.fin===f?'on':'')+'" data-fin="'+f+'" '+(np?'disabled':'')+'>'+V.FIN[f].en+'</button>'}).join('')+'</div>'+
  '<h4>UAE livery · الملصقات</h4><div class="row"><button class="chip '+(c.livery!==false?'on':'')+'" data-liv="1" '+(u.GLB[k]&&!u.GLB[k].liv?'disabled':'')+'>On</button><button class="chip '+(c.livery===false?'on':'')+'" data-liv="0" '+(u.GLB[k]&&!u.GLB[k].liv?'disabled':'')+'>Off</button>'+(k==='police'?'<span class="note">Dubai Police livery is always on.</span>':'')+'</div>'}
 if(TAB==='plate'){var p=V.Cdata().plate;h='<h4>Number plate · لوحة الأرقام</h4><div class="row"><canvas class="pl" id="v10pl" width="512" height="256"></canvas></div>'+
  '<div class="row"><label>Emirate</label><select data-in="em">'+Object.keys(V.EMIRATES).map(function(e){return '<option value="'+e+'" '+(p.em===e?'selected':'')+'>'+e+' · '+V.EMIRATES[e].ar+'</option>'}).join('')+'</select></div>'+
  '<div class="row"><label>Code</label><input type="text" data-in="code" maxlength="2" value="'+esc(p.code)+'" style="width:80px;text-transform:uppercase" autocomplete="off" autocapitalize="characters"></div>'+
  '<div class="row"><label>Number</label><input type="text" data-in="num" maxlength="5" inputmode="numeric" pattern="[0-9]*" value="'+esc(p.num)+'" style="width:130px" autocomplete="off"><button class="chip on" data-act="plate">Save plate</button></div><div class="err" id="v10perr"></div>'+
  '<p class="note">Code: 1–2 letters or a number 1–99. Number: 1–5 digits. One plate is used on every car.</p>'}
 if(TAB==='wheels'){h='<h4>Tyres · الإطارات</h4>'+Object.keys(V.TYRES).map(function(t){var T=V.TYRES[t];return '<div class="mod"><div class="t"><span><b>'+T.en+'</b> · '+T.ar+'<br><span class="note">'+T.desc+'</span></span><button class="chip '+(c.tyre===t?'on':'')+'" data-tyre="'+t+'">'+(c.tyre===t?'Fitted':'Fit')+'</button></div></div>'}).join('')+
  '<h4>Rims · الجنوط</h4><div class="row"><button class="chip '+(!c.rim.on?'on':'')+'" data-rim="off">Factory</button><button class="chip '+(c.rim.on?'on':'')+'" data-rim="on">Custom</button><input type="color" data-in="rim" value="'+c.rim.hex+'" aria-label="Rim colour"></div>'+
  '<div class="row">'+['#d4af37','#111111','#c0c4c8','#c8102e','#00843d','#ffffff'].map(function(x){return '<button class="sw '+(c.rim.on&&c.rim.hex===x?'on':'')+'" style="background:'+x+'" data-rimhex="'+x+'"></button>'}).join('')+'</div>'}
 if(TAB==='mods'){h='<h4>Tuning · التعديل</h4>'+Object.keys(V.MODS).map(function(m){var M=V.MODS[m],l=c.mods[m]||0,n=M.lv.length;return '<div class="mod"><div class="t"><span><b>'+M.en+'</b> · '+M.ar+'<br><span class="note">'+esc(M.lv[l])+'</span></span><span class="bt"><button data-mod="'+m+'" data-d="-1" aria-label="Lower">−</button><button data-mod="'+m+'" data-d="1" aria-label="Raise">+</button></span></div><div class="lv">'+M.lv.slice(1).map(function(_,i){return '<i class="'+(i+1<=l?'on':'')+'"></i>'}).join('')+'</div></div>'}).join('')+
  '<div class="mod"><div class="t"><span><b>Flight pack ✈️</b> · حزمة الطيران<br><span class="note">Runner: infinite air + air jumps (tap jump to climb). Free Roam always has flight.</span></span><button class="chip '+(c.mods.flight?'on':'')+'" data-flight="1">'+(c.mods.flight?'ON':'OFF')+'</button></div></div>'+
  '<div class="row"><button class="chip" data-act="maxall">⚡ Max everything</button><button class="chip" data-act="stock">Reset to stock</button></div>'+
  '<p class="note">Fair mode (Admin → Market Day, on by default) makes Market Day ignore all mods.</p>'}
 return h}
function render(){if(!root)return;root.querySelector('.tabs').innerHTML=[['cars','🚗 Cars'],['paint','🎨 Paint'],['plate','🔢 Plate'],['wheels','🛞 Wheels'],['mods','🔧 Mods']].map(function(t){return '<button class="'+(TAB===t[0]?'on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</button>'}).join('');
 var sc=root.querySelector('.bd').scrollTop;root.querySelector('.bd').innerHTML=body();root.querySelector('.bd').scrollTop=sc;root.querySelector('.stats').innerHTML=statHtml();
 var pc=root.querySelector('#v10pl');if(pc)V.drawPlate(V.Cdata().plate,pc);
 var u=U();root.querySelector('.hd h2').textContent='Garage · الكراج — '+u.CARS[u.A.car].en}
function apply(rebuild){V.persist();var u=U();if(rebuild)u.applyCar();else u.applyColor();render()}
function onClick(e){var b=e.target.closest('button');if(!b||!root.contains(b))return;var d=b.dataset,u=U(),A=u.A,c=V.cfg(A.car);
 if(d.tab){TAB=d.tab;root.querySelector('.bd').scrollTop=0;render();return}
 if(b.classList.contains('x')){close();return}
 if(d.car){if(!u.unlocked(d.car)){u.toast('🔒 '+u.needText(u.CARS[d.car]));return}A.car=d.car;u.save();u.applyCar();u.refreshWorldBtn();render();return}
 if(d.paint){c.paint.on=d.paint==='on';apply(false);return}
 if(d.hex){c.paint.on=true;c.paint.hex=d.hex;apply(false);return}
 if(d.fin){c.paint.on=true;c.paint.fin=d.fin;apply(false);return}
 if(d.liv){c.livery=d.liv==='1';apply(true);return}
 if(d.tyre){c.tyre=d.tyre;apply(false);return}
 if(d.rim){c.rim.on=d.rim==='on';apply(false);return}
 if(d.rimhex){c.rim.on=true;c.rim.hex=d.rimhex;apply(false);return}
 if(d.mod){var M=V.MODS[d.mod],l=(c.mods[d.mod]||0)+(+d.d);c.mods[d.mod]=Math.max(0,Math.min(M.lv.length-1,l));apply(false);return}
 if(d.flight){c.mods.flight=c.mods.flight?0:1;apply(false);return}
 if(d.act==='maxall'){Object.keys(V.MODS).forEach(function(m){c.mods[m]=V.MODS[m].lv.length-1});apply(false);u.toast('⚡ Strongest engine fitted');return}
 if(d.act==='stock'){Object.keys(V.MODS).forEach(function(m){c.mods[m]=0});c.mods.flight=0;apply(false);return}
 if(d.act==='plate'){savePlate(true)}}
function readPlate(){var g=function(n){var el=root.querySelector('[data-in="'+n+'"]');return el?el.value:''};return{em:g('em'),code:g('code').toUpperCase().replace(/\s+/g,''),num:g('num').replace(/\s+/g,'')}}
function savePlate(commit){var p=readPlate(),e=V.validPlate(p),er=root.querySelector('#v10perr'),pc=root.querySelector('#v10pl');
 if(pc&&!e)V.drawPlate(p,pc);if(er){er.className=e?'err':'ok';er.textContent=e||(commit?'✓ Plate saved · تم الحفظ':'')}
 if(!e&&commit){V.Cdata().plate=p;V.persist();V.applyPlate();U().toast('🔢 '+p.em+' '+p.code+' '+p.num)}return !e}
function onInput(e){var t=e.target,n=t.dataset&&t.dataset.in;if(!n)return;var c=V.cfg();
 if(n==='hex'){c.paint.on=true;c.paint.hex=t.value;V.persist();U().applyColor();return}
 if(n==='rim'){c.rim.on=true;c.rim.hex=t.value;V.persist();U().applyColor();return}
 if(n==='code'){var v=t.value.toUpperCase().replace(/[^A-Z0-9]/g,'');if(v!==t.value)t.value=v}
 if(n==='num'){var v2=t.value.replace(/[^0-9]/g,'');if(v2!==t.value)t.value=v2}
 if(n==='em'||n==='code'||n==='num')savePlate(false)}
function open(){var u=U();if(!u)return;if(!root){var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  root=document.createElement('div');root.id='v10g';root.setAttribute('role','dialog');root.setAttribute('aria-label','Garage');root.innerHTML='<div class="hd"><h2>Garage</h2><button class="x" aria-label="Close">✕</button></div><div class="tabs"></div><div class="bd"></div><div class="stats"></div>';
  ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','keydown','keyup','wheel'].forEach(function(ev){root.addEventListener(ev,function(e){e.stopPropagation();if(ev==='keydown'&&e.key==='Escape')close()},{passive:true})});
  root.addEventListener('click',function(e){e.stopPropagation();onClick(e)});root.addEventListener('input',onInput);root.addEventListener('change',onInput)}
 document.body.appendChild(root);root.style.display='flex';document.body.classList.add('v10-garage');render()}
function close(){if(root){root.style.display='none'}document.body.classList.remove('v10-garage');var u=U();u&&u.refreshWorldBtn()}
V.openGarage=open;V.closeGarage=close;V.renderGarage=render;
})();

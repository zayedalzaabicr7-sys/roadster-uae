// Roadster Dash UAE v4 — secret admin, worlds, garage, Market Day, trolls, local leaderboard
(function(){
'use strict';
var LS={get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var S=LS.get('uae_admin',{});
var A=window.__adm={god:!!S.god,inf:!!S.inf,jumps:!!S.jumps,mode:S.mode||'normal',speed:S.speed||1,slowV:S.slowV||1,night:!!S.night,color:S.color||'uae',
  world:S.world||'dubai',car:S.car||'roadster',unlockAll:!!S.unlockAll,market:!!S.market,marketTarget:S.marketTarget||60,fair:S.fair==null?true:!!S.fair,flyRun:!!S.flyRun,
  rev:false,upside:false,ghost:false,size:1,freeze:false,zoneOff:0,mkT:0,mkLvl:0,
  mult:function(){return (A.carSpeed?A.carSpeed():1)*(window.__v10?__v10.speedMult():1)*A.speed*(A.mode==='hard'?1.35:A.mode==='insane'?1.8:1)*(A.market&&A.inRun?1+.1*A.mkLvl:1)},
  dens:function(){return (A.mode==='hard'?1.8:A.mode==='insane'?3:1)*(A.market&&A.inRun?1+.22*A.mkLvl:1)}};
Object.defineProperty(A,'slow',{get:function(){return A.freeze?1e-4:A.slowV},set:function(v){A.slowV=v}});
function save(){LS.set('uae_admin',{god:A.god,inf:A.inf,jumps:A.jumps,mode:A.mode,speed:A.speed,slowV:A.slowV,night:A.night,color:A.color,world:A.world,car:A.car,unlockAll:A.unlockAll,market:A.market,marketTarget:A.marketTarget,fair:A.fair,flyRun:A.flyRun})}
A.save=save;
var PIN=function(){return LS.get('uae_pin','2026')};
var WORLDS={dubai:{en:'Dubai Desert',ar:'صحراء دبي',icon:'🏙️',off:0,tint:'',night:false,groups:['dubai']},
  abudhabi:{en:'Abu Dhabi Corniche (Night)',ar:'كورنيش أبوظبي ليلاً',icon:'🌃',off:1,tint:'',night:true,groups:['abudhabi']},
  jais:{en:'Jebel Jais Mountains',ar:'جبل جيس',icon:'⛰️',off:1,tint:'saturate(.85) hue-rotate(-12deg) brightness(1.03)',night:false,groups:['jais']},
  liwa:{en:'Liwa Dunes',ar:'كثبان ليوا',icon:'🐪',off:2,tint:'sepia(.35) saturate(1.35) hue-rotate(-8deg)',night:false,groups:['liwa']},
  neon:{en:'Neon City',ar:'مدينة النيون',icon:'🌆',off:3,tint:'saturate(1.4) contrast(1.08)',night:false,groups:['dubai']}};
var CARS={roadster:{en:'Roadster (classic)',ar:'رودستر',icon:'🏎️',need:null},
  sedan:{en:'Tesla Model 3',ar:'تسلا موديل ٣',icon:'🚘',need:{dist:1000}},
  suv:{en:'Tesla Model Y',ar:'تسلا موديل Y',icon:'🚙',need:{score:5000}},
  truck:{en:'Tesla Cybertruck',ar:'سايبرترك',icon:'🛻',need:{dist:3000}},
  sport:{en:'Tesla Roadster 2020',ar:'تسلا رودستر ٢٠٢٠',icon:'🏁',need:{score:15000}},
  patrol:{en:'Patrol VTC-style 4x4',ar:'باترول ڤي تي سي',icon:'🏜️',need:{dist:5000}},
  hilux:{en:'Toyota Hilux pickup',ar:'تويوتا هايلكس',icon:'🛻',need:{dist:2000}},
  landcruiser:{en:'Land Cruiser-style 4x4',ar:'لاندكروزر',icon:'🚙',need:{score:8000}},
  camry:{en:'Camry-style sedan',ar:'كامري',icon:'🚗',need:{dist:1500}},
  lexus:{en:'Lexus-style sport sedan',ar:'لكزس',icon:'🚘',need:{score:12000}},
  maxima:{en:'Maxima-style sedan',ar:'ماكسيما',icon:'🚗',need:{dist:4000}},
  rr:{en:'Range Rover Classic',ar:'رينج روفر',icon:'🚙',need:{score:25000}},
  rolls:{en:'Rolls-Royce',ar:'رولز رويس',icon:'👑',need:{dist:8000}},
  gtr:{en:'Nissan GT-R',ar:'نيسان جي تي آر',icon:'🔵',need:{score:40000}},
  f40:{en:'Ferrari 458 Italia',ar:'فيراري 458',icon:'🐎',need:{score:60000}},
  police:{en:'Dubai Police GT-R',ar:'شرطة دبي',icon:'🚓',need:{dist:12000}}};
// v10 base stats (1 = classic Roadster)
var STATS={roadster:{speed:1,accel:1,hand:1,boost:1,jump:1},sedan:{speed:.97,accel:.95,hand:1,boost:1,jump:1},suv:{speed:.94,accel:.9,hand:.92,boost:1,jump:1.03},
 truck:{speed:.95,accel:.86,hand:.86,boost:1.05,jump:1.06},sport:{speed:1.08,accel:1.15,hand:1.05,boost:1.05,jump:1},patrol:{speed:.92,accel:.88,hand:.88,boost:1,jump:1.12},
 rr:{speed:.93,accel:.88,hand:.9,boost:1,jump:1.08},rolls:{speed:.96,accel:.86,hand:.9,boost:1.02,jump:.98},gtr:{speed:1.06,accel:1.12,hand:1.1,boost:1.04,jump:1},
 f40:{speed:1.1,accel:1.1,hand:1.04,boost:1.06,jump:.98},hilux:{speed:.92,accel:.9,hand:.92,boost:1,jump:1.1},landcruiser:{speed:.95,accel:.92,hand:.9,boost:1,jump:1.08},camry:{speed:.98,accel:.98,hand:1.02,boost:1,jump:1},lexus:{speed:1.02,accel:1.02,hand:1.03,boost:1.02,jump:1},maxima:{speed:1,accel:1.02,hand:1.06,boost:1,jump:1},police:{speed:1.07,accel:1.12,hand:1.1,boost:1.08,jump:1}};
var COLORS={uae:{en:'UAE flag',body:0xeeeeea,wing:0x00843d,m:.05,r:.3},gold:{en:'Gold',body:0xd4af37,wing:0x8a6d1d,m:.9,r:.25},black:{en:'Matte black',body:0x121212,wing:0x050505,m:.1,r:.95},police:{en:'Dubai Police',body:0xf7f7f7,wing:0x0b6b3a,m:.05,r:.35}};
// ---------- leaderboard / players ----------
function lb(){return LS.get('uae_lb',[])}
function player(){return LS.get('uae_player','Zayed')}
function bans(){return LS.get('uae_bans',[])}
function isBanned(n){n=(n||player()).trim().toLowerCase();return bans().some(function(b){return b.toLowerCase()===n})}
function best(){var l=lb(),s=0,d=0;l.forEach(function(r){s=Math.max(s,r.score);d=Math.max(d,r.dist)});return{score:s,dist:d}}
function unlocked(k){var c=CARS[k];if(!c.need||A.unlockAll)return true;var b=best();return (c.need.score&&b.score>=c.need.score)||(c.need.dist&&b.dist>=c.need.dist)}
function needText(c){return c.need.score?('Score '+c.need.score.toLocaleString()+' نقاط'):('Distance '+c.need.dist.toLocaleString()+' m متر')}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function top10Html(hl){var l=lb().slice().sort(function(a,b){return b.score-a.score}).slice(0,10);
  if(!l.length)return '<div class="u-empty">No runs yet — play to set the first record!<br>لا توجد نتائج بعد</div>';
  return '<ol class="u-lb">'+l.map(function(r,i){return '<li class="'+(r===hl||(hl&&r.t===hl.t)?'me':'')+'"><b>'+(i+1)+'</b><span>'+esc(r.name)+(r.win?' 🎁':'')+'</span><em>'+Math.round(r.score).toLocaleString()+'</em><i>'+Math.round(r.dist).toLocaleString()+' m</i></li>'}).join('')+'</ol>'}
// ---------- styles ----------
var css=`
.u-glass{background:linear-gradient(145deg,rgba(30,26,14,.88),rgba(10,10,14,.92));backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(212,175,55,.55);box-shadow:0 10px 40px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08);color:#fff;border-radius:18px;font-family:Rajdhani,Arial,sans-serif}
.u-modal-bg{position:fixed;inset:0;z-index:100070;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}
.u-modal{padding:22px 24px;min-width:280px;max-width:92vw;text-align:center}
.u-modal h2{margin:0 0 6px;font-size:22px;letter-spacing:1px;color:#f3d77a}.u-modal p{margin:4px 0 14px;opacity:.85}
.u-btn{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;border-radius:10px;padding:9px 16px;font:700 15px Rajdhani,Arial;cursor:pointer;margin:4px}
.u-btn:hover{background:rgba(255,255,255,.16)}.u-btn.gold{background:linear-gradient(135deg,#f6e27a,#c9a227);color:#1a1405;border-color:#f6e27a}.u-btn.red{background:#c8102e;border-color:#ff3b55}.u-btn.green{background:#00843d;border-color:#13b75c}.u-btn.on{background:#00843d;border-color:#13b75c}
.u-pin{font:700 28px 'Share Tech Mono',monospace;letter-spacing:10px;text-align:center;width:170px;padding:8px;border-radius:10px;border:1px solid #d4af37;background:#000a;color:#f3d77a}
#u-fab{position:fixed;z-index:100050;right:16px;bottom:16px;width:58px;height:58px;border-radius:50%;cursor:pointer;font-size:26px;display:none;align-items:center;justify-content:center;
 background:radial-gradient(circle at 30% 25%,rgba(255,240,180,.95),rgba(212,175,55,.75) 45%,rgba(120,90,10,.8));border:1px solid rgba(255,235,160,.9);box-shadow:0 6px 24px rgba(212,175,55,.45),inset 0 2px 6px rgba(255,255,255,.6);backdrop-filter:blur(6px)}
#u-fab.show{display:flex}
#u-panel{position:fixed;z-index:100060;right:14px;bottom:86px;width:min(390px,94vw);max-height:80vh;display:none;flex-direction:column;overflow:hidden}
#u-panel.open{display:flex}
#u-panel .hd{display:flex;align-items:center;justify-content:space-between;padding:12px 14px 6px;border-bottom:1px solid rgba(212,175,55,.3);background:linear-gradient(90deg,#c8102e 0 6px,transparent 6px)}
#u-panel .hd b{font-size:17px;letter-spacing:1.5px;color:#f3d77a}#u-panel .tabs{display:flex;gap:2px;padding:6px 8px;overflow-x:auto}
#u-panel .tabs button{flex:1;white-space:nowrap;background:transparent;color:#ccc;border:0;border-bottom:2px solid transparent;padding:6px 6px;font:700 13px Rajdhani,Arial;cursor:pointer}
#u-panel .tabs button.act{color:#f3d77a;border-color:#d4af37}#u-panel .bd{overflow:auto;padding:8px 14px 14px;font-size:14px}
#u-panel .row{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:7px 0}#u-panel .ar{opacity:.7;font-size:12px}
#u-panel .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0}#u-panel .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin:6px 0}
#u-panel .grid .u-btn,#u-panel .grid3 .u-btn{margin:0;padding:7px 6px;font-size:13px}
#u-panel input[type=text],#u-panel input[type=number],#u-panel select{background:#0008;color:#fff;border:1px solid #666;border-radius:8px;padding:6px 8px;font:600 14px Rajdhani,Arial;width:140px}
#u-panel input[type=range]{width:130px}#u-panel h4{margin:12px 0 4px;color:#f3d77a;font-size:14px;letter-spacing:1px}
.u-tg{min-width:58px}.u-recent{max-height:150px;overflow:auto;font-size:13px}.u-recent div{display:flex;justify-content:space-between;border-bottom:1px solid #ffffff14;padding:3px 0}
.u-lb{list-style:none;margin:0;padding:0}.u-lb li{display:grid;grid-template-columns:26px 1fr auto 70px;gap:6px;padding:5px 4px;border-bottom:1px solid #ffffff12;font:600 14px Rajdhani,Arial}
.u-lb li b{color:#f3d77a}.u-lb li em{font-style:normal;font-family:'Share Tech Mono',monospace}.u-lb li i{font-style:normal;opacity:.7;text-align:right;font-family:'Share Tech Mono',monospace}.u-lb li.me{background:rgba(212,175,55,.18)}
.u-empty{opacity:.75;padding:10px 4px;font-size:14px}
#u-menubar{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}#u-menubar .u-btn{margin:0;border-radius:4px;background:transparent;border:1px solid rgba(255,255,255,.7);padding:10px 14px}
.u-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:10px}
.u-card{padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);cursor:pointer;text-align:left}
.u-card.sel{border-color:#d4af37;background:rgba(212,175,55,.18)}.u-card.lock{opacity:.5;cursor:not-allowed}.u-card .ic{font-size:30px}.u-card .nm{font-weight:700;font-size:15px}.u-card .sb{font-size:12px;opacity:.75}
#u-mk{position:fixed;z-index:9000;left:50%;top:64px;transform:translateX(-50%);padding:6px 16px;border-radius:30px;font:700 16px Rajdhani,Arial;display:none;color:#fff;background:linear-gradient(90deg,#00843d,#111);border:1px solid #d4af37}
#u-win{position:fixed;inset:0;z-index:100001;display:none;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(212,175,55,.35),rgba(0,0,0,.85))}
#u-win .box{padding:30px 34px;text-align:center;animation:upop .6s cubic-bezier(.2,1.6,.4,1)}#u-win h1{font-size:clamp(30px,7vw,64px);margin:0;color:#f6e27a;text-shadow:0 0 30px #d4af37}#u-win h2{font-size:clamp(22px,5vw,40px);margin:8px 0 16px}
@keyframes upop{from{transform:scale(.3);opacity:0}to{transform:scale(1);opacity:1}}
#u-fog{position:fixed;inset:0;z-index:8000;pointer-events:none;background:radial-gradient(ellipse at 50% 70%,rgba(235,235,240,.35),rgba(225,228,235,.97) 60%);opacity:0;transition:opacity 1.2s}
#u-fake{position:fixed;inset:0;z-index:100002;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.8);color:#ff3048;font:700 clamp(36px,9vw,90px) Rajdhani,Arial;text-align:center}
@keyframes ushake{0%,100%{transform:translate(0,0)}20%{transform:translate(-14px,8px)}40%{transform:translate(12px,-10px)}60%{transform:translate(-10px,-6px)}80%{transform:translate(9px,10px)}}
.u-shake{animation:ushake .12s linear infinite}
#u-ban{position:fixed;inset:0;z-index:100003;display:none;align-items:center;justify-content:center;background:rgba(40,0,0,.85)}
#u-toast{position:fixed;z-index:100004;left:50%;top:18px;transform:translateX(-50%);padding:8px 16px;border-radius:12px;font:700 15px Rajdhani,Arial;display:none}
h1 #u-r{cursor:pointer;display:inline!important;margin:0!important;padding:0!important}
`;
function el(h){var d=document.createElement('div');d.innerHTML=h.trim();return d.firstElementChild}
function toast(t){var x=document.getElementById('u-toast');x.textContent=t;x.style.display='block';clearTimeout(x._t);x._t=setTimeout(function(){x.style.display='none'},1600)}
function modal(html,onBind){var bg=el('<div class="u-modal-bg"><div class="u-modal u-glass">'+html+'</div></div>');document.body.appendChild(bg);
  ['pointerdown','touchstart','keydown','click'].forEach(function(ev){bg.addEventListener(ev,function(e){e.stopPropagation()})});
  var close=function(){bg.remove()};onBind&&onBind(bg,close);return bg}
// ---------- secret admin ----------
function askAdmin(){
  if(LS.get('uae_adm_ok',false)){showFab(true);openPanel(true);return}
  modal('<h2>🔐 Enable admin?</h2><p>تفعيل وضع المشرف؟</p><button class="u-btn gold" data-y>Yes · نعم</button><button class="u-btn" data-n>No · لا</button>',function(bg,close){
    bg.querySelector('[data-n]').onclick=close;
    bg.querySelector('[data-y]').onclick=function(){close();askPin()}})}
function askPin(){modal('<h2>Enter PIN</h2><p>أدخل الرمز السري</p><input class="u-pin" type="password" inputmode="numeric" maxlength="8" autocomplete="off"><div style="margin-top:12px"><button class="u-btn gold" data-ok>Unlock · فتح</button><button class="u-btn" data-n>Cancel</button></div><div data-err style="color:#ff6b7d;margin-top:8px;min-height:18px"></div>',function(bg,close){
  var inp=bg.querySelector('input');setTimeout(function(){inp.focus()},50);
  var go=function(){if(inp.value===String(PIN())){close();LS.set('uae_adm_ok',true);showFab(true);openPanel(true);toast('✅ Admin enabled · تم التفعيل')}else{bg.querySelector('[data-err]').textContent='Wrong PIN · رمز خاطئ';inp.value=''}};
  bg.querySelector('[data-ok]').onclick=go;inp.addEventListener('keydown',function(e){if(e.key==='Enter')go()});bg.querySelector('[data-n]').onclick=close})}
function showFab(v){var f=document.getElementById('u-fab');if(!f)return;f.classList.toggle('show',v);if(v){f.style.display='flex';f.style.zIndex='100050'}}
function openPanel(v){var p=document.getElementById('u-panel');p.classList.toggle('open',v==null?!p.classList.contains('open'):v);renderTab()}
// ---------- panel ----------
var TAB='game';
function tg(k,lbl,ar){return '<div class="row"><span>'+lbl+'<br><span class="ar">'+ar+'</span></span><button class="u-btn u-tg '+(A[k]?'on':'')+'" data-tg="'+k+'">'+(A[k]?'ON':'OFF')+'</button></div>'}
function renderTab(){var b=document.querySelector('#u-panel .bd');if(!b)return;document.querySelectorAll('#u-panel .tabs button').forEach(function(x){x.classList.toggle('act',x.dataset.tab===TAB)});var h='';
 if(TAB==='game'){h=tg('god','God mode (never crash)','وضع الخلود')+tg('inf','Infinite boost / air','بوست لا نهائي')+tg('jumps','Unlimited jumps','قفزات بلا حدود')+tg('flyRun','Flight mode in runner (hold jump to fly)','وضع الطيران')+
  '<h4>Difficulty · الصعوبة</h4><div class="grid3">'+['normal','hard','insane'].map(function(m){return '<button class="u-btn '+(A.mode===m?'on':'')+'" data-mode="'+m+'">'+{normal:'Normal<br>عادي',hard:'Hard 🔥<br>صعب',insane:'Insane 💀<br>جنوني'}[m]+'</button>'}).join('')+'</div>'+
  '<div class="row"><span>Speed ×<b>'+(+A.speed).toFixed(1)+'</b> <span class="ar">السرعة</span></span><input type="range" min="0.5" max="3" step="0.1" value="'+A.speed+'" data-rng="speed"></div>'+
  '<div class="row"><span>Slow-motion ×<b>'+(+A.slowV).toFixed(2)+'</b> <span class="ar">بطيء</span></span><input type="range" min="0.2" max="1" step="0.05" value="'+A.slowV+'" data-rng="slowV"></div>'+
  '<div class="grid"><button class="u-btn" data-act="score">+1,000 score</button><button class="u-btn" data-act="dist">+500 m</button></div>'+tg('night','Night mode','الوضع الليلي')+
  '<h4>World · العالم</h4><select data-sel="world">'+Object.keys(WORLDS).map(function(k){return '<option value="'+k+'" '+(A.world===k?'selected':'')+'>'+WORLDS[k].icon+' '+WORLDS[k].en+'</option>'}).join('')+'</select>'+
  '<div class="grid" style="margin-top:10px"><button class="u-btn red" data-act="crash">💥 Instant crash<br><span class="ar">خسارة فورية</span></button><button class="u-btn" data-act="best">🗑 Reset scores<br><span class="ar">تصفير النتائج</span></button></div>'+
  '<h4>Security · الأمان</h4><div class="row"><input type="text" inputmode="numeric" placeholder="New PIN" data-in="pin" maxlength="8"><button class="u-btn" data-act="pin">Change PIN</button></div>'+
  '<div class="grid"><button class="u-btn" data-act="hide">🙈 Hide admin button</button><button class="u-btn" data-act="lock">🔒 Lock admin</button></div>'}
 if(TAB==='market'){h='<p>Every <b>5 s</b> the game gets faster with more traffic. Survive the target time to win a free gift!<br><span class="ar">كل ٥ ثواني تزيد الصعوبة — اصمد للوقت المحدد واربح هدية!</span></p>'+tg('market','Market Day mode','وضع يوم السوق')+tg('fair','Fair mode — Market Day ignores garage mods','وضع عادل — بدون تعديلات')+
  '<div class="row"><span>Target time (s)<br><span class="ar">الوقت المطلوب</span></span><input type="number" min="5" max="600" value="'+A.marketTarget+'" data-num="marketTarget"></div>'+
  '<div class="grid"><button class="u-btn gold" data-act="testwin">🎁 Preview win screen</button><button class="u-btn" data-act="mkreset">↺ Reset timer</button></div>'}
 if(TAB==='players'){var rec=lb().slice(-15).reverse();h='<h4>Current player · اللاعب</h4><div class="row"><input type="text" maxlength="16" value="'+esc(player())+'" data-in="name"><button class="u-btn gold" data-act="name">Save</button></div>'+
  '<h4>Recent players · آخر اللاعبين</h4><div class="u-recent">'+(rec.length?rec.map(function(r){return '<div><span>'+esc(r.name)+(isBanned(r.name)?' 🚫':'')+'</span><span>'+Math.round(r.score).toLocaleString()+' · '+Math.round(r.dist)+' m</span></div>'}).join(''):'<div>No runs yet</div>')+'</div>'+
  '<h4>Ban / Unban · حظر</h4><div class="row"><input type="text" maxlength="16" placeholder="Player name" data-in="ban"><span><button class="u-btn red" data-act="ban">Ban</button><button class="u-btn" data-act="unban">Unban</button></span></div>'+
  '<div class="ar">Banned: '+(bans().map(esc).join(', ')||'—')+'</div>'}
 if(TAB==='cars'){h='<h4>Car · السيارة</h4><div class="grid">'+Object.keys(CARS).map(function(k){var c=CARS[k],u=unlocked(k);return '<button class="u-btn '+(A.car===k?'on':'')+'" data-car="'+k+'" '+(u?'':'style="opacity:.5"')+'>'+c.icon+' '+c.en+(u?'':' 🔒')+'</button>'}).join('')+'</div>'+
  tg('unlockAll','Unlock all cars','فتح كل السيارات')+'<h4>Colour · اللون</h4><div class="grid">'+Object.keys(COLORS).map(function(k){return '<button class="u-btn '+(A.color===k?'on':'')+'" data-color="'+k+'">'+COLORS[k].en+'</button>'}).join('')+'</div>'}
 if(TAB==='troll'){h=tg('rev','Reverse controls','عكس التحكم')+tg('upside','Upside-down screen','الشاشة مقلوبة')+tg('ghost','Ghost traffic','سيارات شبح')+
  '<h4>Car size · حجم السيارة</h4><div class="grid3"><button class="u-btn '+(A.size<1?'on':'')+'" data-size="0.45">🐜 Tiny</button><button class="u-btn '+(A.size==1?'on':'')+'" data-size="1">Normal</button><button class="u-btn '+(A.size>1?'on':'')+'" data-size="2.2">🦖 Giant</button></div>'+
  '<h4>One-shot · مرة واحدة</h4><div class="grid"><button class="u-btn red" data-act="fake">☠️ Fake game over</button><button class="u-btn" data-act="shake">📳 Screen shake</button><button class="u-btn" data-act="honk">📯 Honk</button><button class="u-btn" data-act="fog">🌫️ Sudden fog</button></div>'}
 b.innerHTML=h}
function bindPanel(p){
 ['pointerdown','touchstart','keydown'].forEach(function(ev){p.addEventListener(ev,function(e){e.stopPropagation()})});
 p.querySelector('.tabs').onclick=function(e){var t=e.target.closest('button');if(t){TAB=t.dataset.tab;renderTab()}};
 p.querySelector('[data-close]').onclick=function(){openPanel(false)};
 p.addEventListener('input',function(e){var r=e.target.dataset.rng;if(r){A[r]=+e.target.value;e.target.previousElementSibling.querySelector('b').textContent=(+e.target.value).toFixed(r==='speed'?1:2);save()}
   var n=e.target.dataset.num;if(n){A[n]=Math.max(5,+e.target.value||60);save()}});
 p.addEventListener('change',function(e){if(e.target.dataset.sel==='world'){setWorld(e.target.value)}});
 p.querySelector('.bd').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;e.stopPropagation();var d=b.dataset;
  if(d.tg){A[d.tg]=!A[d.tg];if(d.tg==='night'||d.tg==='upside')applyScreen();if(d.tg==='unlockAll')refreshGarage();if(d.tg==='market'){A.mkT=0;A.mkLvl=0}toast(d.tg+(A[d.tg]?' ON':' OFF'))}
  if(d.mode){A.mode=d.mode;toast(A.mode.toUpperCase())}
  if(d.color){A.color=d.color;applyColor()}
  if(d.car){if(unlocked(d.car)){A.car=d.car;applyCar();toast(CARS[d.car].en)}else toast('🔒 '+needText(CARS[d.car]))}
  if(d.size){A.size=+d.size;applySize()}
  var a=d.act;var inp=function(k){return p.querySelector('[data-in='+k+']').value.trim()};
  if(a==='score'&&window.__rd){__rd.score+=1000;toast('+1000')}if(a==='dist'&&window.__rd){__rd.distance+=500;toast('+500 m')}
  if(a==='crash')toast(crashNow()?'💥':'Start a run first');
  if(a==='best'){LS.set('uae_lb',[]);renderLB();toast('Scores reset')}
  if(a==='pin'){var v=inp('pin');if(/^\d{4,8}$/.test(v)){LS.set('uae_pin',v);toast('PIN changed → '+v)}else toast('PIN must be 4–8 digits')}
  if(a==='hide'){showFab(false);openPanel(false);toast('Hidden — tap the R in ROADSTER to bring it back')}
  if(a==='lock'){LS.set('uae_adm_ok',false);showFab(false);openPanel(false);toast('Admin locked')}
  if(a==='testwin')showWin(true);if(a==='mkreset'){A.mkT=0;A.mkLvl=0}
  if(a==='name'){var nm=inp('name');if(nm){LS.set('uae_player',nm);syncName();toast('Player: '+nm)}}
  if(a==='ban'||a==='unban'){var nm2=inp('ban');if(nm2){var l=bans().filter(function(x){return x.toLowerCase()!==nm2.toLowerCase()});if(a==='ban')l.push(nm2);LS.set('uae_bans',l);toast((a==='ban'?'🚫 Banned ':'✅ Unbanned ')+nm2)}}
  if(a==='fake')fakeOver();if(a==='shake')shake(3000);if(a==='honk')honk();if(a==='fog')fog();
  save();renderTab()})}
// ---------- game effects ----------
function crashNow(){if(window.__rd&&__rd.state==='playing'){__rd.crash('admin',null);return true}return false}
A.crashNow=crashNow;
function canvas(){return document.querySelector('canvas')}
function applyScreen(){var c=canvas();if(!c)return;var w=WORLDS[A.world]||WORLDS.dubai,f=[];if(w.tint)f.push(w.tint);if(A.night||w.night)f.push('brightness(.45) saturate(1.3) hue-rotate(195deg) contrast(1.15)');c.style.filter=f.join(' ');c.style.transform=A.upside?'rotate(180deg)':''}
function shake(ms){var c=canvas();if(!c)return;c.classList.add('u-shake');setTimeout(function(){c.classList.remove('u-shake')},ms)}
function honk(){try{var ac=new (window.AudioContext||window.webkitAudioContext)();[0,.35].forEach(function(t0){[392,494].forEach(function(f){var o=ac.createOscillator(),g=ac.createGain();o.type='sawtooth';o.frequency.value=f;g.gain.setValueAtTime(.0001,ac.currentTime+t0);g.gain.exponentialRampToValueAtTime(.25,ac.currentTime+t0+.02);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+t0+.3);o.connect(g).connect(ac.destination);o.start(ac.currentTime+t0);o.stop(ac.currentTime+t0+.32)})});toast('📯 HONK HONK!')}catch(e){}}
function fog(){var f=document.getElementById('u-fog');f.style.opacity=1;setTimeout(function(){f.style.opacity=0},6000)}
function fakeOver(){var f=document.getElementById('u-fake');f.innerHTML='GAME OVER<br><span style="font-size:.4em;color:#fff">انتهت اللعبة</span>';f.style.display='flex';A.freeze=true;
 setTimeout(function(){f.innerHTML='😜 JUST KIDDING!<br><span style="font-size:.4em;color:#fff">أمزح معك!</span>';f.style.color='#f6e27a'},2300);
 setTimeout(function(){f.style.display='none';f.style.color='#ff3048';A.freeze=false},3800)}
function applySize(){var p=window.__rd&&__rd.player;if(p&&p.car&&p.car.group)p.car.group.scale.setScalar(A.size)}
function applyColor(){var L=window.__carBodies||[];if(!L.length)return false;L.forEach(function(o){var M=o.mats,c=COLORS[A.color]||COLORS.uae;
 M.body.color.setHex(A.car==='truck'&&A.color==='uae'?0xb9bdc2:c.body);M.body.metalness=A.car==='truck'?.5:c.m;M.body.roughness=c.r;if(M.body.isMeshPhysicalMaterial)M.body.clearcoat=A.color==='black'?0:1;if(M.wing)M.wing.color.setHex(c.wing);var X=o.body.userData.ex;if(X&&X.userData.paints)X.userData.paints.forEach(function(p){p.color.copy(M.body.color);p.metalness=Math.min(.75,M.body.metalness);p.roughness=Math.max(.18,M.body.roughness)});if(A.car==='police'&&X&&X.userData.paints)X.userData.paints.forEach(function(p){p.color.setHex(0xf4f4f2);p.metalness=.1;p.roughness=.3})});if(window.__v10)try{__v10.afterColor()}catch(e){console.warn('v10 color',e)}return true}
// livery decal (canvas texture) — flowing UAE stripes, red accent, gold trim, falcon
function liveryTex(flip){var c=document.createElement('canvas');c.width=1024;c.height=200;var g=c.getContext('2d');
 if(flip){g.translate(1024,0);g.scale(-1,1)}
 var wave=function(y0,amp){g.beginPath();g.moveTo(0,y0);g.bezierCurveTo(300,y0-amp,620,y0+amp,1024,y0-amp*.4)};
 var band=function(y0,h,col,amp){g.beginPath();g.moveTo(140,y0+30);g.bezierCurveTo(380,y0-amp,640,y0+amp,1024,y0-amp*.5);g.lineTo(1024,y0-amp*.5+h);g.bezierCurveTo(640,y0+amp+h,380,y0-amp+h,170,y0+30+h*.6);g.closePath();g.fillStyle=col;g.fill()};
 band(40,40,'#00843d',34);band(80,4,'#d4af37',34);band(84,36,'#ffffff',34);band(120,40,'#0b0b0b',34);
 g.lineWidth=5;g.strokeStyle='#d4af37';g.beginPath();g.moveTo(150,66);g.bezierCurveTo(380,4,640,72,1024,20);g.stroke();
 g.beginPath();g.moveTo(170,166);g.bezierCurveTo(380,126,640,196,1024,144);g.stroke();
 g.fillStyle='#c8102e';g.beginPath();g.moveTo(40,50);g.lineTo(150,50);g.lineTo(190,150);g.lineTo(80,150);g.closePath();g.fill();g.strokeStyle='#d4af37';g.lineWidth=4;g.stroke();
 // falcon
 g.save();g.translate(860,150);g.scale(1.25,1.25);g.fillStyle='#d4af37';g.strokeStyle='#5a4310';g.lineWidth=1.5;g.beginPath();
 g.moveTo(0,0);g.bezierCurveTo(-20,-6,-46,-30,-74,-22);g.bezierCurveTo(-56,-20,-44,-14,-36,-6);g.bezierCurveTo(-56,-8,-80,4,-92,18);g.bezierCurveTo(-66,10,-44,8,-26,8);
 g.lineTo(-16,22);g.lineTo(-8,12);g.bezierCurveTo(6,14,18,8,26,-2);g.lineTo(36,-4);g.lineTo(28,-10);g.bezierCurveTo(22,-14,12,-12,6,-6);g.closePath();g.fill();g.stroke();g.restore();
 g.fillStyle='#fff';g.font='bold 22px Arial';g.fillText(flip?'':'',0,0);
 var T=window.__T,t=new T.CanvasTex(c);t.colorSpace=T.SRGB;t.anisotropy=8;return t}
var LIV=true;
window.__uaeLivery=function(body){var T=window.__T;if(!T||body.userData.liv)return;body.userData.liv=1;var LIV=new T.Group();
 [-1,1].forEach(function(W){var m=new T.Std({map:liveryTex(W<0),alphaTest:.5,roughness:.35,metalness:.1,polygonOffset:true,polygonOffsetFactor:-2,side:2});
  var pl=new T.Mesh(new T.Plane(2.55,.5),m);pl.rotation.y=W*Math.PI/2;pl.position.set(W*1.013,.56,.18);pl.renderOrder=5;LIV.add(pl)});
 // gold rear trim + red accent on rear
 LIV.add(box(T,1.3,.02,.02,0xd4af37,0,.79,2.245));LIV.add(box(T,1.3,.02,.02,0xd4af37,0,.56,2.245));
 body.add(LIV);body.userData.livG=LIV};
function buildLivery(){}
function box(T,w,h,d,c,x,y,z){var m=new T.Mesh(new T.Box(w,h,d),new T.Std({color:c,metalness:.9,roughness:.25}));m.position.set(x,y,z);return m}
function applyCar(){var L=window.__carBodies||[],T=window.__T;if(!L.length||!T)return false;L.forEach(function(o){carOn(o.body,T)});applyColor();return true}
// ---------- v5 standalone low-poly car models (wheels = game's own animated wheels at z -1.05 / 1.7, x ±0.86, r 0.34) ----------
var WZ=[-1.05,1.7],WR=.34;
function plateTex(T){var c=document.createElement('canvas');c.width=512;c.height=256;var e=c.getContext('2d');e.fillStyle='#fff';e.fillRect(0,0,512,256);e.strokeStyle='#111';e.lineWidth=10;e.strokeRect(5,5,502,246);e.fillStyle='#c8102e';e.fillRect(14,14,110,228);e.fillStyle='#fff';e.font='bold 92px Arial';e.textAlign='center';e.textBaseline='middle';e.fillText('A',69,128);e.fillStyle='#111';e.font='bold 40px Arial';e.fillText('DUBAI  \u062f\u0628\u064a',318,52);e.font='bold 130px Arial';e.fillText('971',318,160);var t=new T.CanvasTex(c);t.colorSpace=T.SRGB;t.anisotropy=8;return t}
var SHARED=null;
function shared(T){if(SHARED)return SHARED;SHARED={
 glass:new T.Phys({color:0x0d1420,roughness:.06,metalness:.55,clearcoat:1,clearcoatRoughness:.05}),
 black:new T.Std({color:0x0b0b0c,roughness:.55,metalness:.2}),
 trim:new T.Std({color:0xd4af37,roughness:.28,metalness:1}),
 head:new T.Std({color:0xffffff,emissive:0xe8f0ff,emissiveIntensity:3}),
 plate:new T.Std({map:plateTex(T),roughness:.5,metalness:.1,polygonOffset:true,polygonOffsetFactor:-2}),
 livL:new T.Std({map:liveryTex(true),alphaTest:.5,roughness:.35,metalness:.1,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),
 livR:new T.Std({map:liveryTex(false),alphaTest:.5,roughness:.35,metalness:.1,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4})};return SHARED}
// side-profile extrusion: bottom edge front->rear with wheel arches, then upper outline rear->front
function profile(T,o){var s=new T.Shape(),yb=o.yb,ar=o.arch||.44;s.moveTo(o.zF,yb);
 WZ.forEach(function(wz){if(o.square){s.lineTo(wz-ar-.06,yb);s.lineTo(wz-ar+.06,WR+ar*.92);s.lineTo(wz+ar-.06,WR+ar*.92);s.lineTo(wz+ar+.06,yb)}
  else{s.lineTo(wz-ar,yb);s.lineTo(wz-ar,WR);s.absarc(wz,WR,ar,Math.PI,0,true);s.lineTo(wz+ar,yb)}});
 s.lineTo(o.zR,yb);o.up.forEach(function(p){s.lineTo(p[0],p[1])});s.closePath();return s}
function extrudeX(T,shape,width,bevel){var d=Math.max(.01,width-2*bevel);var g=new T.Extrude(shape,{depth:d,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:bevel>0?3:0,curveSegments:16});g.translate(0,0,-d/2);g.rotateY(-Math.PI/2);g.computeVertexNormals();return g}
function M(T,g,m,x,y,z,G){var o=new T.Mesh(g,m);o.position.set(x||0,y||0,z||0);o.castShadow=o.receiveShadow=true;G.add(o);return o}
function bx(T,w,h,d){return new T.Box(w,h,d)}
var SPECS={
 sedan:{w:2.04,bev:.06,lower:{zF:-2.3,zR:2.5,yb:.22,up:[[2.54,.34],[2.58,.68],[2.46,.84],[1.95,.88],[-1.0,.88],[-1.45,.85],[-2.05,.74],[-2.3,.6],[-2.36,.4]]},
  cabin:{w:1.74,bev:.09,pts:[[-1.05,.84],[-.25,1.36],[.45,1.43],[1.25,1.32],[2.1,.98],[2.3,.84]]},
  head:[-2.24,.64,.38],tail:[2.55,.74],plate:[2.585,.5],liv:[-.6,1.25,.44,.8],speed:.97},
 suv:{w:2.06,bev:.07,lower:{zF:-2.32,zR:2.52,yb:.27,arch:.46,up:[[2.56,.38],[2.6,.82],[2.5,1.0],[1.6,1.02],[-1.1,1.02],[-1.55,.99],[-2.1,.88],[-2.33,.7],[-2.38,.44]]},
  cabin:{w:1.8,bev:.1,pts:[[-1.15,.98],[-.4,1.58],[.4,1.68],[1.75,1.62],[2.32,1.32],[2.5,1.0]]},
  head:[-2.27,.76,.4],tail:[2.58,.9],plate:[2.6,.58],liv:[-.58,1.22,.5,.92],speed:.93},
 sport:{w:2.08,bev:.05,lower:{zF:-2.32,zR:2.5,yb:.17,up:[[2.54,.28],[2.6,.62],[2.5,.78],[1.95,.83],[-1.0,.83],[-1.45,.8],[-2.05,.68],[-2.32,.55],[-2.38,.34]]},
  cabin:{w:1.72,bev:.09,pts:[[-1.0,.79],[-.25,1.26],[.45,1.33],[1.2,1.22],[2.1,.92],[2.3,.79]]},
  head:[-2.26,.58,.36],tail:[2.56,.68],plate:[2.585,.44],liv:[-.6,1.25,.38,.74],speed:1.08},
 truck:{w:2.08,bev:.015,lower:{zF:-2.38,zR:2.62,yb:.3,arch:.48,square:true,up:[[2.64,.34],[2.66,1.02],[.05,1.64],[-2.3,.9],[-2.44,.84],[-2.44,.4]]},
  head:null,tail:[2.67,.98],plate:[2.672,.55],liv:[-.52,1.2,.42,.86],speed:.95}};
function buildModel(k,T,mats){var sp=SPECS[k],S=shared(T),G=new T.Group(),body=mats.body,hw=sp.w/2,bv=sp.bev;
 M(T,extrudeX(T,profile(T,sp.lower),sp.w,sp.bev),body,0,0,0,G);
 if(sp.cabin){var cb=sp.cabin,pts=cb.pts,c=new T.Shape();c.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();
  M(T,extrudeX(T,c,cb.w,cb.bev),body,0,0,0,G);// body-colour greenhouse (pillars + roof edges)
  var seg=function(p0,p1,wd,inset,mat,off){var dz=p1[0]-p0[0],dy=p1[1]-p0[1],L=Math.hypot(dz,dy),nz=-dy/L,ny=dz/L;var g=M(T,bx(T,wd,.014,L*inset),mat,0,(p0[1]+p1[1])/2+ny*(cb.bev+off),(p0[0]+p1[0])/2+nz*(cb.bev+off),G);g.rotation.x=-Math.atan2(dy,dz);return g};
  seg(pts[0],pts[1],cb.w-.22,.86,S.glass,.008);// windshield
  seg(pts[1],pts[2],cb.w-.5,.8,S.glass,.008);seg(pts[2],pts[3],cb.w-.5,.9,S.glass,.008);// glass roof
  seg(pts[3],pts[4],cb.w-.26,.84,S.glass,.008);// rear window
  var cx=0,cy=0;pts.forEach(function(p){cx+=p[0];cy+=p[1]});cx/=pts.length;cy/=pts.length;
  var sw=new T.Shape();pts.forEach(function(p,i){var q=[cx+(p[0]-cx)*.84,cy+(p[1]-cy)*.74];i?sw.lineTo(q[0],q[1]):sw.moveTo(q[0],q[1])});sw.closePath();
  [-1,1].forEach(function(s){var g=new T.Extrude(sw,{depth:.006,bevelEnabled:false});g.rotateY(-Math.PI/2);M(T,g,S.glass,s*(cb.w/2+.004)+(s<0?0:.006),0,0,G);
   M(T,bx(T,.012,(pts[2][1]-pts[0][1])*.9,.08),body,s*(cb.w/2+.012),pts[0][1]+(pts[2][1]-pts[0][1])*.45+cb.bev*.5,cx+.1,G)})}
 if(k==='truck'){// glass panels sit 1.5cm proud of the steel faces (no coplanar faces)
  var a=Math.atan2(.74,2.35),zc=-.78,yc=.9+(zc+2.3)*(.74/2.35);var ws=M(T,bx(T,1.78,.012,1.42),S.glass,0,yc+Math.cos(a)*.018,zc-Math.sin(a)*.018,G);ws.rotation.set(-a,0,0);
  var sw=new T.Shape();sw.moveTo(-1.35,1.0);sw.lineTo(-.05,1.5);sw.lineTo(1.0,1.33);sw.lineTo(1.0,1.0);sw.closePath();
  [-1,1].forEach(function(s){var g=new T.Extrude(sw,{depth:.012,bevelEnabled:false});g.rotateY(-Math.PI/2);var m=M(T,g,S.glass,s*(hw+.003)+(s<0?0:.012),0,0,G)});
  M(T,bx(T,sp.w-.04,.035,.04),S.head,0,.86,-2.455,G);// front light bar
  M(T,bx(T,1.9,.16,.06),S.black,0,.36,-2.43,G);// bumper
  [-1,1].forEach(function(s){WZ.forEach(function(wz){var cl=M(T,bx(T,.03,.14,1.1),S.black,s*(hw+.012),.34+.48*.92+.03,wz,G)})});
  M(T,bx(T,sp.w-.1,.03,.03),S.trim,0,1.06,2.69,G)}
 if(sp.head){[-1,1].forEach(function(s){var h=M(T,bx(T,sp.head[2],.05,.08),S.head,s*(hw-.25-sp.head[2]/2+.15),sp.head[1],sp.head[0]-bv,G);h.rotation.y=s*.18})
  M(T,bx(T,sp.w-.3,.12,.08),S.black,0,sp.lower.yb+.06,sp.lower.zF-.03-bv,G)}
 // full-width tail light bar (uses game taillight material → flickers correctly on crash)
 M(T,bx(T,sp.w-.16,.05,.07),mats.taillight,0,sp.tail[1],sp.tail[0]+bv,G);
 M(T,bx(T,sp.w-.1,.012,.06),S.trim,0,sp.tail[1]+.045,sp.tail[0]+bv-.01,G);
 // plate holder + plate
 M(T,bx(T,.36,.19,.05),S.black,0,sp.plate[1],sp.plate[0]+bv,G);var pl=M(T,new T.Plane(.32,.16),S.plate,0,sp.plate[1],sp.plate[0]+bv+.027,G);
 // side livery decals between the arches, 6 mm off the flat extruded side
 var L=sp.liv,len=L[1]-L[0],ht=L[3]-L[2];[-1,1].forEach(function(s){var d=M(T,new T.Plane(len,ht),s<0?S.livL:S.livR,s*(hw+.006),(L[2]+L[3])/2,(L[0]+L[1])/2,G);d.rotation.y=s*Math.PI/2;d.castShadow=false});
 // gold sill trim
 [-1,1].forEach(function(s){M(T,bx(T,.012,.025,len),S.trim,s*(hw+.004),L[2]-.05,(L[0]+L[1])/2,G)});
 if(k==='sport'){M(T,bx(T,1.8,.035,.22),S.black,0,.86,2.38,G);M(T,bx(T,1.9,.03,.25),S.black,0,.2,-2.3,G);[-1,1].forEach(function(s){M(T,bx(T,.03,.08,1.75),S.black,s*(hw+.01),.24,.32,G)})}
 if(k==='suv'){[-1,1].forEach(function(s){M(T,bx(T,.03,.1,1.7),S.black,s*(hw+.01),.33,.32,G)})}
 return G}

// ---------- v6 licensed realistic models (GLB, CC-BY — see models/CREDITS.txt) ----------
var GLB={sedan:{url:'models/sedan.glb',paint:/CAR_PAINT/,glass:/^Glass$|Material\.01[67]/,chrome:/chrome|Material\.003/,liv:[-.55,1.2,.5],plate:null},
 sport:{url:'models/sport.glb',paint:/car_main_paint/,glass:/Glass_(mid|Clear|Tint)/,chrome:/chrome|Rims/,liv:[-.55,1.2,.42],plate:null},
 suv:{url:'models/suv.glb',paint:/^body$/,glass:/glass_body/,chrome:/^chrome$/,liv:[-.55,1.2,.55],plate:null},
 truck:{url:'models/truck.glb',tyre:/TeslaBlack/,paint:/^Base$/,glass:/Material\.004/,chrome:/^$/,liv:[-1.15,1.1,.78],plate:null},
 patrol:{url:'models/patrol.glb',fb:'suv',tyre:/^ban$/,paint:/^Color_I07$/,glass:/^Color_M05$/,chrome:/^warna_bum$/,liv:[-1.2,1.55,.72],plate:null},
 hilux:{url:'models/hilux.glb',fb:'truck',tyre:/^M_0137_Black$/,paint:/^M_0042_Sienna$/,glass:/^M_0136_Charcoal$/,chrome:/^M_0135_DarkGray$/,liv:[-1.9,1.9,.66],plate:null},
 rr:{url:'models/rr.glb',fb:'suv',tyre:/^$/,paint:/^$/,glass:/^Glass$/,chrome:/^$/,liv:null,plate:null,noPaint:true},
 rolls:{url:'models/rolls.glb',fb:'sedan',tyre:/^tire$/,paint:/^car$/,glass:/^glass$/,chrome:/^grey$/,liv:[-1.3,1.6,.62],plate:null},
 gtr:{url:'models/gtr.glb',fb:'sport',tyre:/^tire$/,paint:/^chasis$/,glass:/^glass$/,chrome:/^rim$/,liv:[-1.3,1.55,.55],plate:null},
 f40:{url:'models/ferrari458.glb',fb:'sport',tyre:/^Tires$/,paint:/^Body_Color$/,glass:/^Glass_Gray$/,chrome:/^metal_chrome$/,liv:[-1.3,1.5,.45],plate:null},
 police:{url:'models/gtr.glb',fb:'sport',tyre:/^tire$/,paint:/^chasis$/,glass:/^glass$/,chrome:/^rim$/,liv:[-1.3,1.55,.55],plate:null,police:true}};
GLB.police.share='gtr';
GLB.landcruiser={url:'models/landcruiser.glb',fb:'suv',tyre:/^Black$/,paint:/^White$/,glass:/^Windows$/,chrome:/^Grey$/,liv:[-1.3,1.6,.62],plate:null};
GLB.camry={url:'models/camry.glb',fb:'sedan',tyre:/^Black$/,paint:/^Blue$/,glass:/^Windows$/,chrome:/^Grey$/,liv:[-1.3,1.6,.5],plate:null};
GLB.lexus={url:'models/lexus.glb',fb:'sport',tyre:/^Black$/,paint:/^White$/,glass:/^Windows$/,chrome:/^Grey$/,liv:[-1.3,1.6,.5],plate:null};
GLB.maxima={url:'models/maxima.glb',fb:'sedan',tyre:/^Black$/,paint:/^(Dark)?Orange$/,glass:/^Windows$/,chrome:/^Grey$/,liv:[-1.3,1.6,.5],plate:null};

var GLBC={};var PROC={landcruiser:'suv',camry:'sedan',lexus:'sport',maxima:'sedan'};
function glbLoad(k){var c=GLB[k];if(!c||c.st)return;if(c.share){var o2=GLB[c.share];if(o2.st==='ok'){c.data=o2.data;c.st='ok';setTimeout(function(){A._carDone=false;applyCar()},0);return}c.st='loading';glbLoad(c.share);var iv=setInterval(function(){if(o2.st==='ok'){clearInterval(iv);c.data=o2.data;c.st='ok';A._carDone=false;applyCar()}else if(o2.st==='fail'){clearInterval(iv);c.st='fail'}},120);return}c.st='loading';fetch(c.url+'?v=p3').then(function(r){if(!r.ok)throw r.status;return r.arrayBuffer()}).then(function(buf){c.data=glbParse(buf);c.st='ok';A._carDone=false;applyCar();if(window.__fr&&__fr.active)__fr.pending=true}).catch(function(e){c.st='fail';c.tries=(c.tries||0)+1;console.info('glb retry',k,e);if(c.tries<4)setTimeout(function(){if(c.st==='fail'){c.st=null;glbLoad(k)}},1500*c.tries)})}
function glbParse(buf){var dv=new DataView(buf),jl=dv.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,jl))),bo=20+jl+8,T=window.__T,cache={};
 function acc(i){var a=json.accessors[i],bv=json.bufferViews[a.bufferView],n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],off=bo+(bv.byteOffset||0)+(a.byteOffset||0),C={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];
  var es=n*C.BYTES_PER_ELEMENT,st=bv.byteStride||es,nz=!!a.normalized;if(st===es)return new T.Attr(new C(buf.slice(off,off+a.count*es)),n,nz);
  var out=new C(a.count*n),src=new DataView(buf),rd=C===Float32Array?'getFloat32':C===Uint16Array?'getUint16':C===Uint32Array?'getUint32':'getUint8';
  for(var i2=0;i2<a.count;i2++)for(var j2=0;j2<n;j2++)out[i2*n+j2]=src[rd](off+i2*st+j2*C.BYTES_PER_ELEMENT,true);return new T.Attr(out,n,nz)}
 var geos=json.meshes.map(function(m){return m.primitives.map(function(p){var g=new T.Geo();g.setAttribute('position',acc(p.attributes.POSITION));if(p.attributes.NORMAL!=null)g.setAttribute('normal',acc(p.attributes.NORMAL));if(p.attributes.COLOR_0!=null){var ca=acc(p.attributes.COLOR_0);if(ca.itemSize===4){var a3=new Float32Array(ca.count*3);for(var q=0;q<ca.count;q++){a3[q*3]=ca.getX(q);a3[q*3+1]=ca.getY(q);a3[q*3+2]=ca.getZ(q)}ca=new T.Attr(a3,3)}g.setAttribute('color',ca)}if(p.indices!=null)g.setIndex(acc(p.indices));if(p.attributes.NORMAL==null)g.computeVertexNormals();g.computeBoundingSphere();return {g:g,m:json.materials[p.material]||{}}})});
 return {json:json,geos:geos}}
function liveryShader(m,L,P){if(!L||(window.__v10&&__v10.C&&__v10.C.livery===false&&!P))return;var V=function(a){return 'vec3('+a.map(function(x){return x.toFixed(3)}).join(',')+')'},LC=P?[[0,.2,.07],[.95,.95,.95],[0,.2,.07],[.9,.9,.9],[0,.2,.07]]:[[0,.23,.05],[.92,.92,.92],[.012,.012,.012],[.83,.6,.14],[.6,.004,.02]];m.onBeforeCompile=function(s){s.uniforms.uL={value:new Float32Array(L)};
 s.vertexShader='varying vec3 vLp;varying vec3 vLn;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLp=position;vLn=normal;');
 s.fragmentShader='uniform vec3 uL;varying vec3 vLp;varying vec3 vLn;\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+
 '{float zs=(vLp.z-uL.x)/(uL.y-uL.x);if(abs(vLn.x)>.45&&zs>0.&&zs<1.){float t=.045;float yc=uL.z+.05*sin(zs*3.6)-.06*zs;float y=vLp.y;float sl=(y-yc)*.18;'+
 'vec3 col=diffuseColor.rgb;bool hit=false;'+
 'if(zs>.13+sl){if(y>yc+t&&y<yc+2.*t){col='+V(LC[0])+';hit=true;}else if(y>yc&&y<yc+t){col='+V(LC[1])+';hit=true;}else if(y>yc-t&&y<yc){col='+V(LC[2])+';hit=true;}'+
 'if(abs(y-(yc+2.*t+.008))<.006||abs(y-(yc-t-.008))<.006){col='+V(LC[3])+';hit=true;}}'+
 'else if(zs>.02+sl&&y>yc-t&&y<yc+2.*t){col='+V(LC[4])+';hit=true;}'+
 'diffuseColor.rgb=col;}}')}
 m.customProgramCacheKey=function(){return 'uaeliv'+L.join(',')+(P?'P':'')}}
function buildGLB(k,T,o){var c=GLB[k],d=c.data,J=d.json,S=shared(T),G=new T.Group(),paints=[],matc={},rims=[],tyres=[];
 function mat(gm,inW,vc){var nm=gm.name||'',key=nm+(inW?'|W':'')+(vc?'|C':'');if(matc[key])return matc[key];if(inW&&c.tyre&&c.tyre.test(nm)){var ty=new T.Std({color:0x0c0c0d,roughness:.92,metalness:0});ty.userData.tyre=1;tyres.push(ty);return matc[key]=ty}var pb=gm.pbrMetallicRoughness||{},cf=pb.baseColorFactor||[1,1,1,1],mt=pb.metallicFactor==null?1:pb.metallicFactor,ro=pb.roughnessFactor==null?1:pb.roughnessFactor,em=gm.emissiveFactor,m;
  if(c.paint.test(nm)){m=new T.Phys({color:0xffffff,metalness:.55,roughness:.3,clearcoat:1,clearcoatRoughness:.06});liveryShader(m,c.liv,c.police);paints.push(m)}
  else if(c.glass.test(nm)||gm.alphaMode==='BLEND')m=new T.Phys({color:0x0b121c,metalness:.2,roughness:.04,clearcoat:1,transparent:true,opacity:.82,depthWrite:true});
  else if(em&&(em[0]+em[1]+em[2])>.5){m=new T.Std({color:new (o.mats.body.color.constructor)(em[0],em[1],em[2]),emissive:new (o.mats.body.color.constructor)(em[0],em[1],em[2]),emissiveIntensity:2.2})}
  else if(c.chrome.test(nm))m=new T.Std({color:0xc9ccd0,metalness:1,roughness:.18});
  else{m=new T.Std({metalness:Math.min(mt,.6),roughness:Math.max(ro,.25)});m.color.setRGB(cf[0],cf[1],cf[2])}
  if(vc){m.vertexColors=true;if(!m.isMeshPhysicalMaterial&&!c.chrome.test(nm))m.color.setRGB(1,1,1)}
  if(inW&&!m.transparent&&!m.emissiveIntensity){var lum=m.color.r+m.color.g+m.color.b;if(c.chrome.test(nm)||lum>.6){m.userData.rim=1;m.userData.rim0=m.color.getHex();rims.push(m)}}
  m.side=gm.doubleSided?2:0;return matc[key]=m}
 var wheels={};
 function node(i,parent,inW){var n=J.nodes[i],g;inW=inW||/^wheel_/.test(n.name||'');if(n.mesh!=null){g=new T.Group();d.geos[n.mesh].forEach(function(p){var me=new T.Mesh(p.g.clone(),mat(p.m,inW,!!p.g.attributes.color));me.castShadow=true;me.receiveShadow=true;g.add(me)})}else g=new T.Group();
  g.name=n.name||'';if(n.translation)g.position.fromArray(n.translation);if(n.rotation)g.quaternion.fromArray(n.rotation);if(n.scale)g.scale.fromArray(n.scale);
  if(/^wheel_/.test(g.name)){g.rotation.order='YXZ';wheels[g.name.slice(6)]=g}
  (n.children||[]).forEach(function(ch){node(ch,g,inW)});parent.add(g)}
 J.scenes[0].nodes.forEach(function(i){node(i,G)});
 // v7: re-pivot each wheel on its true tyre centre, make pairs symmetric and sit them exactly on the ground
 var info=[];Object.keys(wheels).forEach(function(k){var g=wheels[k],mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  g.traverse(function(o){if(o.isMesh){o.geometry.computeBoundingBox();var b=o.geometry.boundingBox,p=o.parent===g?o.position:o.parent.position;
   [b.min,b.max].forEach(function(v){var q=[v.x+p.x,v.y+p.y,v.z+p.z];for(var i=0;i<3;i++){if(q[i]<mn[i])mn[i]=q[i];if(q[i]>mx[i])mx[i]=q[i]}})}});
  var c=[(mn[0]+mx[0])/2,(mn[1]+mx[1])/2,(mn[2]+mx[2])/2],r=Math.max(mx[1]-mn[1],mx[2]-mn[2])/2;
  g.children.forEach(function(ch){ch.position.x-=c[0];ch.position.y-=c[1];ch.position.z-=c[2]});
  info.push({k:k,g:g,x:g.position.x+c[0],z:g.position.z+c[2],r:r})});
 if(c.hub!==false){var hubM=new T.Std({color:0x16171a,roughness:.7,metalness:.3});info.forEach(function(i){var d=new T.Mesh(new T.Cyl(i.r*.74,i.r*.74,.06,20),hubM);d.rotation.z=Math.PI/2;i.g.add(d)})}
 ['F','B'].forEach(function(ax){var L=info.filter(function(i){return i.k[1]===ax});if(!L.length)return;var X=0,Z=0,R=0;L.forEach(function(i){X+=Math.abs(i.x);Z+=i.z;R+=i.r});X/=L.length;Z/=L.length;R/=L.length;
  L.forEach(function(i){i.g.position.set(i.k[0]==='L'?-X:X,R,Z);i.g.rotation.set(0,0,0)})});
 // v9: measure rear surface (for Dubai plate + boost nozzles)
 var pts=[];G.updateMatrixWorld(true);G.traverse(function(o){if(!o.isMesh||o.material.transparent)return;var q=o,w=false;while(q&&q!==G){if(/^wheel_/.test(q.name))w=true;q=q.parent}if(w)return;
  var A2=o.geometry.attributes.position,e=o.matrixWorld.elements;for(var i=0;i<A2.count;i++){var x=A2.getX(i),y=A2.getY(i),z=A2.getZ(i);var wx=e[0]*x+e[4]*y+e[8]*z+e[12],wy=e[1]*x+e[5]*y+e[9]*z+e[13],wz=e[2]*x+e[6]*y+e[10]*z+e[14];if(Math.abs(wx)<.5&&wy>.15&&wy<1.1)pts.push(wx,wy,wz)}});
 function maxZ(x0,y0,y1){var m=-9;for(var i=0;i<pts.length;i+=3)if(Math.abs(pts[i])<x0&&pts[i+1]>=y0&&pts[i+1]<=y1&&pts[i+2]>m)m=pts[i+2];return m}
 var best=null;for(var y=.3;y<=.85;y+=.025){var z=maxZ(.2,y-.095,y+.095);if(z>-9&&(!best||z>best.z+.02))best={y:y,z:z}}
 G.userData.rearZ=maxZ(.45,.3,.7);
 if(best){var pl=new T.Mesh(new T.Plane(.36,.18),S.plate);pl.position.set(0,best.y,best.z+.012);pl.renderOrder=3;G.add(pl);var hb=new T.Mesh(new T.Box(.4,.215,.01),S.black);hb.position.set(0,best.y,best.z+.004);G.add(hb)}
 G.userData.paints=paints;G.userData.wheels=wheels;G.userData.rims=rims;G.userData.tyres=tyres;
 if(c.police)policeKit(T,G);return G}
// v10 Dubai Police kit: roof light bar (blinks in tick) + side decals
function policeKit(T,G){var pts=[],top=-1,tz=0;G.updateMatrixWorld(true);G.traverse(function(o){if(!o.isMesh)return;var A2=o.geometry.attributes.position,e=o.matrixWorld.elements;for(var i=0;i<A2.count;i++){var x=A2.getX(i),y=A2.getY(i),z=A2.getZ(i),wx=e[0]*x+e[4]*y+e[8]*z+e[12],wy=e[1]*x+e[5]*y+e[9]*z+e[13],wz=e[2]*x+e[6]*y+e[10]*z+e[14];if(Math.abs(wx)<.2&&wy>top){top=wy;tz=wz}}});
 var bar=new T.Group(),base=new T.Mesh(new T.Box(.9,.06,.2),new T.Std({color:0x111111,roughness:.5}));bar.add(base);
 var r=new T.Std({color:0xff2030,emissive:0xff1020,emissiveIntensity:2.5}),b=new T.Std({color:0x2050ff,emissive:0x1040ff,emissiveIntensity:2.5});
 var lr=new T.Mesh(new T.Box(.4,.08,.16),r),lb=new T.Mesh(new T.Box(.4,.08,.16),b);lr.position.set(-.22,.06,0);lb.position.set(.22,.06,0);bar.add(lr,lb);bar.position.set(0,top+.03,tz+.1);G.add(bar);
 G.userData.pbar={r:r,b:b};
 // side decals measured on the door
 var cv=document.createElement('canvas');cv.width=1024;cv.height=160;var g=cv.getContext('2d');g.fillStyle='#0b5a2e';g.font='bold 78px Arial';g.textBaseline='middle';g.textAlign='center';g.fillText('DUBAI POLICE  \u0634\u0631\u0637\u0629 \u062f\u0628\u064a',512,84);
 var tx=new T.CanvasTex(cv);tx.colorSpace=T.SRGB;tx.anisotropy=8;
 var side=function(W){var best=-9;G.traverse(function(o){if(!o.isMesh||o.material.transparent)return;var A2=o.geometry.attributes.position,e=o.matrixWorld.elements;for(var i=0;i<A2.count;i++){var x=A2.getX(i),y=A2.getY(i),z=A2.getZ(i),wx=e[0]*x+e[4]*y+e[8]*z+e[12],wy=e[1]*x+e[5]*y+e[9]*z+e[13],wz=e[2]*x+e[6]*y+e[10]*z+e[14];if(wy>.5&&wy<.66&&wz>-.2&&wz<1.1&&wx*W>best)best=wx*W}});return best};
 [-1,1].forEach(function(W){var x=side(W);if(x<0)return;var m=new T.Mesh(new T.Plane(1.45,.226),new T.Basic({map:tx,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));
  m.rotation.y=W*Math.PI/2;m.position.set(W*(x+.02),.6,.42);m.renderOrder=6;G.add(m)})}
function plateFor(k,T,G){var c=GLB[k];if(!c.plate)return;var S=shared(T),p=new T.Mesh(new T.Plane(.34,.17),S.plate);p.position.set(0,c.plate[1],c.plate[0]);G.add(p)}
function carOn(body,T){if(!body.userData.liv&&window.__uaeLivery)window.__uaeLivery(body);var mats=(window.__carBodies||[]).filter(function(o){return o.body===body})[0];mats=mats?mats.mats:null;
 if(!body.userData.orig)body.userData.orig=body.children.slice();
 if(body.userData.ex){body.remove(body.userData.ex);body.userData.ex=null}
 body.scale.set(1,1,1);var k=A.car;
 if(k==='roadster'||(!SPECS[k]&&!GLB[k]&&!PROC[k])||!mats){body.userData.orig.forEach(function(c){if(c.parent!==body)body.add(c)});(window.__carBodies||[]).forEach(function(o){if(o.body===body&&o.wheels)o.wheels.forEach(function(w){w.wheel.visible=true});if(o.body===body)nozFix(o,null)});shadowFix(body,false);try{var pl=window.__rd&&__rd.player;if(pl&&pl.car&&pl.car.body===body&&pl.damage){pl.damage.parts=null}}catch(_e){}return}
 var e0=(window.__carBodies||[]).filter(function(o){return o.body===body})[0],keep=[];if(e0){Object.keys(e0.nozzles||{}).forEach(function(k){keep.push(e0.nozzles[k])});Object.keys(e0.flames||{}).forEach(function(k){if(e0.flames[k].mesh)keep.push(e0.flames[k].mesh)})}
 body.userData.orig.forEach(function(c){if(c.parent===body&&keep.indexOf(c)<0)body.remove(c)});
 var ent=(window.__carBodies||[]).filter(function(o){return o.body===body})[0],X=null,useG=GLB[k]&&GLB[k].st==='ok';if(GLB[k]&&!GLB[k].st)glbLoad(k);
 if(useG){try{X=buildGLB(k,T,ent);plateFor(k,T,X)}catch(e){console.warn('glb build',e);X=null}}
 if(!X)X=buildModel(SPECS[k]?k:PROC[k]||(GLB[k].fb||'sedan'),T,mats);body.userData.ex=X;body.add(X);
 if(ent&&ent.wheels)ent.wheels.forEach(function(w){w.wheel.visible=!X.userData.wheels})
 nozFix(ent,X.userData.rearZ);try{var pl=window.__rd&&__rd.player;if(pl&&pl.car&&pl.car.body===body&&pl.damage){pl.damage.reset&&pl.damage.parts&&pl.damage.reset();pl.damage.parts=null}}catch(_e){}
 shadowFix(body,!!X.userData.wheels)}
function nozFix(ent,rz){if(!ent||!ent.nozzles)return;Object.keys(ent.nozzles).forEach(function(k){var o=ent.nozzles[k],f=ent.flames&&ent.flames[k]&&ent.flames[k].mesh;[o,f].forEach(function(q){if(!q)return;if(!q.userData.z0)q.userData.z0={z:q.position.z};q.position.z=q.userData.z0.z;
  if(k[0]==='R'&&rz!=null&&rz>-9)q.position.z=rz+.02})})}
function shadowFix(body,on){var g=body.parent;if(!g)return;g.children.forEach(function(ch){if(ch.isMesh&&ch.material&&ch.material.colorWrite===false&&ch.castShadow!==undefined){if(ch.userData.cs0===undefined)ch.userData.cs0=ch.castShadow;ch.castShadow=on?false:ch.userData.cs0;ch.visible=!on}})}
A.carSpeed=function(){var s=STATS[A.car];return s?s.speed:1};
// ---------- worlds ----------
var WG={};
function mk(T,c){return new T.Basic({color:c,fog:false})}
function buildWorlds(){var T=window.__T,bd=window.__rd&&__rd.env&&__rd.env.backdrop;if(!T||!bd||WG.done)return!!WG.done;WG.done=true;
 WG.dubai=bd.dubaiSkyline;
 var ad=new T.Group(),dk=mk(T,0x223047),lt=mk(T,0x3b5378),win=new T.Basic({color:0xffd27a,fog:false,toneMapped:false}),add=function(G,g,m,x,y,z){var o=new T.Mesh(g,m);o.position.set(x,y,z);o.frustumCulled=false;G.add(o);return o};
 // Etihad-style towers (curved = stacked cylinders), ADNOC slab, Sheikh Zayed Mosque domes
 [[-60,95],[-40,110],[-20,85],[0,120],[20,78]].forEach(function(t,i){for(var y=0;y<t[1];y+=6){add(ad,new T.Cyl(7-Math.abs(y-t[1]/2)/t[1]*3,7-Math.abs(y+6-t[1]/2)/t[1]*3,6,10),i%2?lt:dk,t[0],y+3,-360);if(y%12==0)add(ad,new T.Box(5,.6,.3),win,t[0],y+3,-352.6)}});
 add(ad,new T.Box(26,140,10),dk,70,70,-370);for(var y=8;y<140;y+=8)add(ad,new T.Box(22,.8,.3),win,70,y,-364.6);
 var ms=mk(T,0xf2f2f2);add(ad,new T.Box(90,14,30),ms,-140,7,-380);[-170,-140,-110].forEach(function(x){add(ad,new T.Sphere(9,16,10,0,Math.PI*2,0,Math.PI/2),ms,x,14,-380)});
 [-190,-90].forEach(function(x){add(ad,new T.Cyl(1.5,2,40,8),ms,x,20,-375)});
 // corniche water line lights
 for(var i=0;i<40;i++)add(ad,new T.Box(1,1,1),win,-200+i*10,1,-300);
 ad.scale.setScalar(.8);ad.position.z=-160;bd.group.add(ad);WG.abudhabi=ad;
 // Jebel Jais mountains
 var mj=new T.Group();[[-160,150,90,0x4a3a35],[-60,190,110,0x5a463e],[50,170,100,0x4f3f39],[150,140,85,0x5c4840],[-230,120,80,0x473833],[230,130,90,0x4d3d37]].forEach(function(m){add(mj,new T.Cone(m[2],m[1],7),mk(T,m[3]),m[0],m[1]/2-5,-420);add(mj,new T.Cone(m[2]*.28,m[1]*.28,7),mk(T,0xf0f0f0),m[0],m[1]-m[1]*.14-5,-420)});
 // zipline towers
 add(mj,new T.Cyl(.6,.6,60,6),mk(T,0x222222),-20,30,-300);mj.scale.setScalar(.85);mj.position.z=-120;bd.group.add(mj);WG.jais=mj;
 // Liwa dunes
 var lw=new T.Group();for(var j=0;j<14;j++){var r=40+Math.random()*60;var d=add(lw,new T.Sphere(r,20,10,0,Math.PI*2,0,Math.PI/2),mk(T,[0xe0a15a,0xd48f45,0xe8b06a][j%3]),-300+j*46+Math.random()*20,-5,-330-Math.random()*120);d.scale.y=.32+Math.random()*.2}
 lw.position.z=-60;bd.group.add(lw);WG.liwa=lw;
 Object.keys(WG).forEach(function(k){var g=WG[k];if(g&&g.traverse)g.traverse(function(o){o.renderOrder=41})});
 return true}
function setWorld(k){if(!WORLDS[k])k='dubai';A.world=k;var w=WORLDS[k];A.zoneOff=w.off;save();
 ['dubai','abudhabi','jais','liwa'].forEach(function(g){if(WG[g])WG[g].visible=w.groups.indexOf(g)>=0});applyScreen();refreshWorldBtn();toast(w.icon+' '+w.en)}
// ---------- menu: worlds / garage / leaderboard ----------
function pickerModal(title,ar,items,cur,onPick){modal('<h2>'+title+'</h2><p>'+ar+'</p><div class="u-cards">'+items.map(function(it){return '<div class="u-card '+(it.k===cur?'sel':'')+(it.lock?' lock':'')+'" data-k="'+it.k+'"><div class="ic">'+it.icon+'</div><div class="nm">'+it.en+'</div><div class="sb">'+it.sub+'</div></div>'}).join('')+'</div><div style="margin-top:14px"><button class="u-btn" data-n>Close · إغلاق</button></div>',function(bg,close){
 bg.querySelector('[data-n]').onclick=close;bg.querySelectorAll('.u-card').forEach(function(c){c.onclick=function(){if(c.classList.contains('lock')){toast('🔒 Locked');return}onPick(c.dataset.k);close()}})})}
function openWorlds(){pickerModal('🌍 Choose world','اختر العالم',Object.keys(WORLDS).map(function(k){var w=WORLDS[k];return{k:k,icon:w.icon,en:w.en,sub:w.ar}}),A.world,setWorld)}
function openGarage(){if(window.__v10&&__v10.openGarage)return __v10.openGarage();pickerModal('🚗 Garage','الكراج',Object.keys(CARS).map(function(k){var c=CARS[k],u=unlocked(k);return{k:k,icon:c.icon,en:c.en,sub:c.ar+' · '+(u?'Unlocked ✅':'🔒 '+needText(c)),lock:!u}}),A.car,function(k){A.car=k;save();applyCar();refreshWorldBtn()})}
function refreshGarage(){}
function refreshWorldBtn(){var b=document.getElementById('u-wbtn');if(b)b.textContent=WORLDS[A.world].icon+' '+WORLDS[A.world].en.split(' (')[0];var g=document.getElementById('u-gbtn');if(g)g.textContent=CARS[A.car].icon+' Garage · الكراج'}
function renderLB(hl){var m=document.getElementById('u-lb-menu');if(m)m.innerHTML=top10Html(hl);var fl=document.getElementById('u-lb-full');if(fl)fl.innerHTML=top10Html(hl);var g=document.getElementById('u-lb-go');if(g)g.innerHTML='<div style="margin:10px 0 4px;color:#f3d77a;font-weight:700;letter-spacing:1px">LOCAL TOP 10 · أفضل ١٠</div>'+top10Html(hl)}
function syncName(){var e=document.getElementById('pilot-name');if(e)e.textContent=player();var b=best(),s=document.getElementById('best-score'),d=document.getElementById('best-dist');if(b.score&&s)s.textContent=b.score.toLocaleString('en-US');if(b.dist&&d)d.textContent=b.dist.toLocaleString('en-US')+' m'}
// ---------- market day + run tracking ----------
var last=0,prevState='idle',runStart=0;
function showWin(preview){var w=document.getElementById('u-win');w.style.display='flex';A.freeze=!preview;honk();
 w.querySelector('[data-t]').textContent=(preview?A.marketTarget:Math.round(A.mkT))+' s'}
function tick(ts){var dt=Math.min(.1,(ts-last)/1000||0);last=ts;var rd=window.__rd;
 if(rd){if(!WG.done&&buildWorlds())setWorld(A.world);if(!A._carDone&&(window.__carBodies||[]).length>=2){A._carDone=applyCar()}
  (window.__carBodies||[]).forEach(function(o){var X=o.body.userData.ex,hideW=!!(X&&X.userData.wheels),M=o.mats||{},WM=[M.tire,M.wheelInsert,M.wheelSpoke];
   if(o.body.parent)o.body.parent.children.forEach(function(ch){if(ch.isMesh&&WM.indexOf(ch.material)>=0){if(hideW){ch.visible=false;ch.userData.uaeHid=1}else if(ch.userData.uaeHid){ch.visible=true;ch.userData.uaeHid=0}}});
   if(X&&X.userData.pbar){var ph=Math.floor(ts/180)%2;X.userData.pbar.r.emissiveIntensity=ph?3:.15;X.userData.pbar.b.emissiveIntensity=ph?.15:3}
   if(X&&X.userData.wheels&&o.wheels){var W=X.userData.wheels;o.wheels.forEach(function(w,i){var nm=['LF','RF','LB','RB'],q=w.wheel.position,key=(q.x<0?'L':'R')+(q.z<0?'F':'B'),m=W[key];w.wheel.visible=false;if(m){m.rotation.x=w.spin.rotation.x;m.rotation.y=w.wheel.rotation.y}})}});
  var st=rd.state;A.inRun=st==='playing';var cr=document.getElementById('u-cred');if(cr)cr.style.display=(st==='playing'||!GLB[A.car])?'none':'block';
  if(st==='playing'&&prevState!=='playing'){A.mkT=0;A.mkLvl=0;applySize();if(isBanned()){crashNow();banScreen()}}
  if(st==='playing'&&A.market&&!A.freeze){A.mkT+=dt*(A.slowV||1);var nl=Math.floor(A.mkT/5);if(nl>A.mkLvl){A.mkLvl=nl;toast('🔥 LEVEL '+(nl+1))}if(A.mkT>=A.marketTarget){A.won=true;showWin(false)}}
  var mk=document.getElementById('u-mk');if(st==='playing'&&A.market){mk.style.display='block';mk.textContent='🛍️ MARKET DAY · '+Math.floor(A.mkT)+' / '+A.marketTarget+' s · LVL '+(A.mkLvl+1)}else mk.style.display='none';
  if(prevState==='playing'&&st!=='playing'&&!A.skipRecord){var rec={name:player(),score:Math.round(rd.score),dist:Math.round(rd.distance),time:Math.round(rd.time||0),t:Date.now(),win:!!A.won,car:A.car,world:A.world};
   if(!isBanned()){var l=lb();l.push(rec);if(l.length>200)l=l.slice(-200);LS.set('uae_lb',l)}A.won=false;renderLB(rec)}
  A.skipRecord=false;prevState=st;
  if(A.ghost&&rd.traffic){var vis=Math.floor(ts/350)%3===0;rd.traffic.list.forEach(function(c){if(c.mesh)c.mesh.visible=vis})}else if(A._ghostWas&&rd.traffic){rd.traffic.list.forEach(function(c){if(c.mesh)c.mesh.visible=true})}A._ghostWas=A.ghost}
 requestAnimationFrame(tick)}
function banScreen(){var b=document.getElementById('u-ban');b.style.display='flex';setTimeout(function(){b.style.display='none'},3500)}
// ---------- build DOM ----------
function build(){
 var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 document.body.appendChild(el('<div id="u-toast" class="u-glass"></div>'));
 document.body.appendChild(el('<div id="u-fab" title="Admin">👑</div>'));
 document.body.appendChild(el('<div id="u-mk"></div>'));document.body.appendChild(el('<div id="u-cred" style="position:fixed;left:8px;bottom:6px;z-index:30;font:11px Arial,sans-serif;color:rgba(255,255,255,.75);text-shadow:0 1px 2px #000;pointer-events:none;display:none">3D models (CC BY 4.0): “Tesla Model 3” by David_Holiday · “Tesla Roadster 2020” by metarex.4d · “Tesla Cybertruck” by PolyDucky · “Tesla Model Y 2021” by 763468712 — Sketchfab</div>'));document.body.appendChild(el('<div id="u-fog"></div>'));document.body.appendChild(el('<div id="u-fake"></div>'));
 document.body.appendChild(el('<div id="u-ban"><div class="u-modal u-glass"><h2 style="color:#ff6b7d">🚫 You are banned</h2><p>تم حظرك من اللعب</p></div></div>'));
 var win=el('<div id="u-win"><div class="box u-glass"><div style="font-size:70px">🎁</div><h1>YOU WIN A FREE GIFT!</h1><h2>!مبروك… ربحت هدية مجانية</h2><p>Survived Market Day · <b data-t></b></p><button class="u-btn gold" data-ok>Claim & back to menu · استلم</button></div></div>');document.body.appendChild(win);
 ['pointerdown','touchstart','keydown'].forEach(function(ev){win.addEventListener(ev,function(e){e.stopPropagation()})});
 win.querySelector('[data-ok]').onclick=function(){win.style.display='none';if(A.freeze){A.freeze=false;var g=A.god;A.god=false;crashNow();A.god=g}};
 var p=el('<div id="u-panel" class="u-glass"><div class="hd"><b>👑 ADMIN · المشرف</b><button class="u-btn" data-close style="padding:4px 10px">✕</button></div><div class="tabs">'+
  [['game','🎮 Game'],['market','🛍️ Market Day'],['players','👥 Players'],['cars','🚗 Cars'],['troll','😈 Troll']].map(function(t){return '<button data-tab="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div><div class="bd"></div></div>');
 document.body.appendChild(p);bindPanel(p);
 var fab=document.getElementById('u-fab');fab.onclick=function(e){e.stopPropagation();openPanel()};['pointerdown','touchstart'].forEach(function(ev){fab.addEventListener(ev,function(e){e.stopPropagation()})});
 if(LS.get('uae_adm_ok',false))showFab(true);
 // secret R
 var h1=document.querySelector('#menu h1 span');if(h1&&h1.textContent.trim()==='ROADSTER'){h1.innerHTML='<span id="u-r">R</span>OADSTER';var r=document.getElementById('u-r');r.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();askAdmin()});['pointerdown','touchstart'].forEach(function(ev){r.addEventListener(ev,function(e){e.stopPropagation()})})}
 // menu buttons
 var play=document.getElementById('play-btn');if(play){var bar=el('<div id="u-menubar"><button class="u-btn" id="u-wbtn"></button><button class="u-btn" id="u-gbtn"></button></div>');play.parentNode.insertBefore(bar,play.nextSibling);
  bar.querySelector('#u-wbtn').onclick=function(e){e.stopPropagation();openWorlds()};bar.querySelector('#u-gbtn').onclick=function(e){e.stopPropagation();openGarage()};
  ['pointerdown','touchstart','keydown'].forEach(function(ev){bar.addEventListener(ev,function(e){e.stopPropagation()})});
  play.addEventListener('click',function(e){if(isBanned()){e.stopImmediatePropagation();e.preventDefault();banScreen()}},true)}
 window.addEventListener('keydown',function(e){if((e.code==='Space'||e.key===' ')&&isBanned()){var m=document.getElementById('menu');if(m&&!m.classList.contains('hidden')){e.stopImmediatePropagation();e.preventDefault();banScreen()}}},true);
 // local leaderboard replaces online ranking
 var lc=document.getElementById('lb-menu-content');if(lc){lc.insertBefore(el('<div id="u-lb-menu"></div>'),lc.firstChild)}
 var t=document.getElementById('lb-menu-title');if(t){var nt=el('<span class="lb-title">LOCAL TOP 10 · أفضل ١٠</span>');t.parentNode.insertBefore(nt,t);}
 var lf=document.getElementById('lb-full');if(lf)lf.parentNode.insertBefore(el('<div id="u-lb-full"></div>'),lf);var lft=document.getElementById('lb-full-title');if(lft){lft.removeAttribute('data-i18n');lft.textContent='LOCAL TOP 10 · أفضل ١٠'}
 var gg=document.getElementById('go-gap');if(gg)gg.parentNode.insertBefore(el('<div id="u-lb-go"></div>'),gg.nextSibling);
 var hide=document.createElement('style');hide.textContent='#lb-menu,#lb-note,#lb-region-menu,#lb-menu-title,#lb-menu-content>:not(#u-lb-menu),#go-rank,#go-gap,#lb-full,#lb-outside,#lb-region-full,#go-rank-btn,#menu-rankings .lb-tabs,#menu-rankings [class*=tab]{display:none!important}';document.head.appendChild(hide);
 renderLB();refreshWorldBtn();setInterval(syncName,1500);syncName();
 requestAnimationFrame(tick)}
function carModel(k,hex){var c=GLB[k],T=window.__T,ent=(window.__carBodies||[]).filter(function(o){return o.mats})[0];if(!c)return 'fail';if(!T||!ent)return null;if(!c.st)glbLoad(k);if(c.st!=='ok')return c.st==='fail'?'fail':null;
 try{var G=buildGLB(k,T,ent);if(hex&&!c.police)G.userData.paints.forEach(function(m){m.color.set(hex)});G.traverse(function(o){if(o.isMesh)o.frustumCulled=false});return G}catch(e){console.warn('carModel',k,e);return 'fail'}}
window.__uaeAskAdmin=askAdmin;window.__uaeOpenPanel=openPanel;window.__uae={A:A,askAdmin:askAdmin,openPanel:openPanel,carModel:carModel,CARS:CARS,STATS:STATS,GLB:GLB,COLORS:COLORS,LS:LS,save:save,toast:toast,modal:modal,el:el,unlocked:unlocked,needText:needText,applyCar:applyCar,applyColor:applyColor,shared:shared,refreshWorldBtn:refreshWorldBtn,best:best,esc:esc};
A.setWorld=function(k){setWorld(k)};A.applyCar=function(){return applyCar()};A.fakeOver=function(){fakeOver()};A.fog=function(){fog()};A.shake=function(m){shake(m||3000)};A.applyScreen=function(){applyScreen()};A.applySize=function(){applySize()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();

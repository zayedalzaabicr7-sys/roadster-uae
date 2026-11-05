/* SKYBOLT UAE — menu / garage / online. Original branding. */
(function(){
'use strict';
var H = window.__skyHost, GM = window.__games, FR = window.__fr;
if(!H||!GM){console.error('host missing');return}

var state = {car:'roadster', col:0xe11d2e, size:2, online:false, ws:null, peers:[]};
var CAR_OPTS = [
  {id:'roadster', name:'Bolt Coupe', kind:'roadster', col:0xe11d2e},
  {id:'muscle', name:'Bloxx Muscle', kind:'muscle', col:0xe11d2e},
  {id:'hatch', name:'Arena Hatch', kind:'hatch', col:0x2f7bff},
  {id:'suv', name:'Arena SUV', kind:'suv', col:0x2f7bff}
];

function $(id){return document.getElementById(id)}
function show(id){
  ['menu','garage','online','hud-wrap'].forEach(function(k){var e=$(k); if(e) e.style.display='none'});
  var e=$(id); if(e) e.style.display = (id==='menu'||id==='garage'||id==='online')?'flex':'block';
}
function showMenu(){ show('menu'); document.body.classList.remove('playing'); if(GM.cur) GM.stop(false) }
function showGarage(){ show('garage'); renderGarage() }
function showOnline(){ show('online'); }

function applyCarVisual(kind, col){
  state.car=kind; state.col=col;
  var c=H.ensureCar();
  while(c.inner.children.length) c.inner.remove(c.inner.children[0]);
  var pick = window.__skyCars && window.__skyCars.pick;
  if(pick){ c.inner.add(pick(kind, col)); }
  else {
    var t=window.__T;
    var m=new t.Mesh(new t.Box(1.85,.5,4.1), new t.Std({color:col, metalness:.5, roughness:.3}));
    m.position.y=.55; c.inner.add(m);
  }
  c._skyLook=2;
}

function renderGarage(){
  var grid=$('garage-grid'); if(!grid) return;
  grid.innerHTML = CAR_OPTS.map(function(c){
    return '<button class="car-card'+(state.car===c.id?' on':'')+'" data-id="'+c.id+'"><b>'+c.name+'</b><span style="background:#'+('000000'+c.col.toString(16)).slice(-6)+'"></span></button>';
  }).join('');
  grid.onclick=function(e){
    var b=e.target.closest('[data-id]'); if(!b) return;
    var c=CAR_OPTS.filter(function(x){return x.id===b.dataset.id})[0];
    if(c){ applyCarVisual(c.kind,c.col); renderGarage(); H.toast('Selected '+c.name) }
  };
}

function startMatch(size){
  size=size||state.size||2;
  applyCarVisual(state.car, state.col);
  GM.start('skyl', {size:size, team:0, online:state.online && !!H.NET.ok});
  $('hud-wrap').style.display='block';
}
function startWorld(){
  applyCarVisual('roadster', 0xe11d2e);
  GM.start('aerow', {});
  $('hud-wrap').style.display='block';
  // Snap chase cam to hub spawn immediately; WORLD.start already enables flight
  var S=FR.ST, cam=FR.cam;
  if(cam&&S){ cam.position.set(S.x, S.y+6, S.z+16); cam.lookAt(S.x, S.y+1, S.z); }
  setTimeout(function(){ if(!FR.ST.fly) FR.toggleFly();
    var b=document.getElementById('btn-fly'); if(b) b.classList.toggle('on', !!FR.ST.fly);
  }, 200);
}

function mpSend(m){
  if(!state.ws || state.ws.readyState!==1) return;
  try{ state.ws.send(JSON.stringify(Object.assign({t:'mg'}, m))) }catch(e){}
}
H.mpSend = mpSend;

function connectOnline(){
  var name=($('on-name').value||'Pilot').trim().slice(0,16);
  if(name.length<3){ H.toast('Name needs 3+ letters'); return }
  var proto=location.protocol==='https:'?'wss':'ws';
  var url = proto+'://'+location.host+'/ws';
  // when served from /sky/ on same host
  try{
    var ws=new WebSocket(url);
    state.ws=ws;
    $('on-status').textContent='Connecting…';
    ws.onopen=function(){
      H.NET.ok=true; H.NET.name=name; state.online=true;
      ws.send(JSON.stringify({t:'hello', n:name, car:state.car, pc:'#'+('000000'+state.col.toString(16)).slice(-6)}));
      $('on-status').textContent='Online as '+name;
      H.toast('🌐 Online — friends can join this server');
    };
    ws.onclose=function(){ H.NET.ok=false; state.online=false; $('on-status').textContent='Disconnected'; };
    ws.onerror=function(){ $('on-status').textContent='Could not connect (is the Mac server up?)'; };
    ws.onmessage=function(ev){
      try{
        var m=JSON.parse(ev.data);
        if(m.t==='sys') H.toast(m.m);
        if(m.t==='mg' && GM.cur && GM.cur.onMsg) GM.cur.onMsg(m);
        if(m.t==='hello'||m.t==='join'||m.t==='roster'){ /* roster light */ }
      }catch(e){}
    };
  }catch(e){ $('on-status').textContent='WebSocket blocked'; }
}

function wire(){
  $('btn-match').onclick=function(){ startMatch(+$('match-size').value||2) };
  $('btn-world').onclick=startWorld;
  $('btn-garage').onclick=showGarage;
  $('btn-online').onclick=showOnline;
  $('btn-back-g').onclick=showMenu;
  $('btn-back-o').onclick=showMenu;
  $('btn-connect').onclick=connectOnline;
  $('btn-exit').onclick=function(){ if(GM.cur) GM.stop(true); else showMenu() };
  var fly=$('btn-fly'); if(fly) fly.onclick=function(){ FR.toggleFly() };
  // touch
  document.querySelectorAll('#touch [data-h]').forEach(function(b){
    var set=function(v){return function(e){e.preventDefault(); var h=b.dataset.h; if(h==='gas')FR.input.gas=v; if(h==='brk')FR.input.brk=v; if(h==='boost')FR.input.boost=v; if(h==='hb')FR.input.hb=v; if(h==='up')FR.input.up=v; if(h==='dn')FR.input.dn=v; if(h==='jump'&&v){ if(GM.cur&&GM.cur.jump) GM.cur.jump() } }};
    b.addEventListener('touchstart', set(1), {passive:false});
    b.addEventListener('touchend', set(0)); b.addEventListener('touchcancel', set(0));
  });
  if(FR.isTouch()) document.body.classList.add('touch');
}

window.__skybolt = {showMenu:showMenu, showGarage:showGarage, startMatch:startMatch, startWorld:startWorld, mpSend:mpSend, state:state};

// boot after sky_look has registered cars/modes
function boot(){
  wire();
  // wait until sky modes registered
  var n=0, iv=setInterval(function(){
    n++;
    if(GM.GAMES.skyl && GM.GAMES.aerow){
      clearInterval(iv);
      applyCarVisual('roadster', 0xe11d2e);

  // Ensure Open Sky has a chase camera (host also falls back)
  if(GM.GAMES.aerow){
    GM.GAMES.aerow.cam=function(){ /* host chaseCam fills in when no-op */ };
  }
      showMenu();
      H.toast('SKYBOLT UAE ready — Play Match or Open Sky');
      console.log('[SKYBOLT] modes', Object.keys(GM.GAMES));
    } else if(n>40){ clearInterval(iv); H.toast('Modes failed to load'); console.error('modes', GM.GAMES) }
  }, 100);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

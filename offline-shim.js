// v9: Safari/iPad compatibility (iOS < 15.4 lacks .at() and Object.hasOwn); WebGL2 check
(function(){
  function at(n){n=Math.trunc(n)||0;if(n<0)n+=this.length;return n<0||n>=this.length?undefined:this[n]}
  [Array,String].concat(['Int8Array','Uint8Array','Uint8ClampedArray','Int16Array','Uint16Array','Int32Array','Uint32Array','Float32Array','Float64Array'].map(function(k){return window[k]}).filter(Boolean)).forEach(function(C){
    if(C&&C.prototype&&!C.prototype.at)Object.defineProperty(C.prototype,'at',{value:at,writable:true,configurable:true})});
  if(!Object.hasOwn)Object.hasOwn=function(o,k){return Object.prototype.hasOwnProperty.call(o,k)};
  try{var c=document.createElement('canvas');window.__uaeGL2=!!(c.getContext('webgl2'))}catch(e){window.__uaeGL2=false}
  if(!window.__uaeGL2)document.addEventListener('DOMContentLoaded',function(){var d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;background:#0b0b0e;color:#fff;font:600 18px/1.5 Arial,sans-serif';
    d.innerHTML='This browser cannot run 3D (WebGL 2 is off or unsupported).<br>On iPad: update to iPadOS 15 or newer, or in Settings › Safari › Advanced › Feature Flags enable WebGL 2.0.<br><br>المتصفح لا يدعم WebGL 2 — حدّث نظام الآيباد إلى 15 أو أحدث.';document.body.appendChild(d)});
})();
// Local-only shim: blocks every request to external hosts (leaderboard, auth, analytics, ads).
(function(){
  var ok=function(u){try{return new URL(u,location.href).origin===location.origin}catch(e){return true}};
  var isGeo=function(u){try{return new URL(u,location.href).pathname.indexOf('/api/')===0}catch(e){return false}};
  var fake=function(method){return new Response(method==='GET'||method==='HEAD'?'[]':'{}',{status:200,headers:{'content-type':'application/json'}})};
  var b64=function(o){return btoa(JSON.stringify(o)).replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_')};
  var uid=localStorage.getItem('uae_local_uid')||(crypto.randomUUID?crypto.randomUUID():'00000000-0000-4000-8000-'+Date.now().toString().padStart(12,'0'));localStorage.setItem('uae_local_uid',uid);
  var exp=Math.floor(Date.now()/1000)+3600*24*365;
  var user={id:uid,aud:'authenticated',role:'authenticated',is_anonymous:true,app_metadata:{},user_metadata:{},identities:[],created_at:new Date().toISOString()};
  var session=function(){return {access_token:b64({alg:'HS256',typ:'JWT'})+'.'+b64({sub:uid,role:'authenticated',aud:'authenticated',exp:exp,is_anonymous:true,session_id:uid})+'.local',token_type:'bearer',expires_in:exp-Math.floor(Date.now()/1000),expires_at:exp,refresh_token:'local',user:user}};
  var of=window.fetch.bind(window);
  window.fetch=function(input,init){
    var u=typeof input==='string'?input:(input&&input.url)||String(input);
    var m=((init&&init.method)||(input&&input.method)||'GET').toUpperCase();
    if(!ok(u)||isGeo(u)){console.info('[offline] blocked',m,u);
      if(/\/auth\/v1\/(signup|token)/.test(u))return Promise.resolve(new Response(JSON.stringify(session()),{status:200,headers:{'content-type':'application/json'}}));
      if(/\/auth\/v1\/user/.test(u))return Promise.resolve(new Response(JSON.stringify(user),{status:200,headers:{'content-type':'application/json'}}));
      return Promise.resolve(fake(m))}
    return of(input,init)};
  navigator.sendBeacon=function(){return true};
  var OX=XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open=function(m,u){if(!ok(u)){arguments[1]='data:application/json,[]'}return OX.apply(this,arguments)};
  (function(){var WS0=window.WebSocket;var W2=function(u,pr){var x;try{x=new URL(u,location.href)}catch(e){throw new Error('offline')}if(x.host===location.host&&x.pathname==='/ws')return pr?new WS0(u,pr):new WS0(u);throw new Error('offline')};W2.prototype=WS0.prototype;W2.CONNECTING=0;W2.OPEN=1;W2.CLOSING=2;W2.CLOSED=3;window.WebSocket=W2})();
  var d=Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,'src');
  Object.defineProperty(HTMLScriptElement.prototype,'src',{get:d.get,set:function(v){if(!ok(v)){console.info('[offline] blocked script',v);var s=this;setTimeout(function(){s.onerror&&s.onerror(new Event('error'))},0);return}d.set.call(this,v)}});
})();

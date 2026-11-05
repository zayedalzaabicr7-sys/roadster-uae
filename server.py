#!/usr/bin/env python3
"""Roadster Dash UAE — combined static file + WebSocket (/ws) multiplayer server. Python 3.8+ stdlib only."""
import asyncio, base64, hashlib, json, math, os, random, re, secrets, struct, time, mimetypes, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get('PORT', '8765'))
DATA = os.path.join(ROOT, 'mpdata')
os.makedirs(DATA, exist_ok=True)
GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
mimetypes.add_type('application/javascript', '.js'); mimetypes.add_type('model/gltf-binary', '.glb'); mimetypes.add_type('font/woff2', '.woff2')

def jload(name, default):
    try:
        with open(os.path.join(DATA, name)) as f: return json.load(f)
    except Exception: return default
def jsave(name, obj):
    p = os.path.join(DATA, name); tmp = p + '.tmp'
    with open(tmp, 'w') as f: json.dump(obj, f, indent=1, ensure_ascii=False)
    os.replace(tmp, p)
KEYF = os.path.join(DATA, 'owner.key')
_env_key = (os.environ.get('OWNER_KEY') or '').strip()
if _env_key:
    with open(KEYF, 'w') as f: f.write(_env_key)
    os.chmod(KEYF, 0o600)
elif not os.path.exists(KEYF):
    with open(KEYF, 'w') as f: f.write(secrets.token_urlsafe(18))
    os.chmod(KEYF, 0o600)
OWNER_KEY = open(KEYF).read().strip()
ROLES = jload('roles.json', {})        # name_lower -> 'admin'|'vip'
BANS = jload('bans.json', [])          # [{name, dev, by, t}]
SET = jload('settings.json', {'ff': True, 'weapons': True})
INV = jload('invites.json', {'on': False, 'names': []})
def inv_state(): return {'t': 'inv', 'on': bool(INV.get('on')), 'names': INV.get('names', [])}
def inv_push():
    for q in list(players.values()):
        if q.name and RANK[q.role] >= 2: q.w.send(inv_state())
CHATLOG = os.path.join(DATA, 'chat.log')
RANK = {'player': 0, 'vip': 1, 'admin': 2, 'owner': 3}
BAD = ['fuck','shit','bitch','cunt','dick','pussy','nigg','fag','whore','slut','bastard','asshole','retard','kys',
       'كلب','حمار','زق','خرا','شرموط','قحب','عاهر','منيوك','زب','كس','طيز','لعن','حقير','وسخ']
def norm(s): return re.sub(r'[\W_]+', '', s.lower().replace('0','o').replace('1','i').replace('3','e').replace('4','a').replace('5','s').replace('@','a').replace('$','s'))
def is_bad(s):
    n = norm(s); return any(b in n for b in BAD)
def censor(s):
    out = s
    for b in BAD:
        out = re.sub(re.escape(b), lambda m: '*' * len(m.group(0)), out, flags=re.I)
    if is_bad(out): out = '*' * len(out)
    return out
NAME_RE = re.compile(r'^[A-Za-z0-9_\u0600-\u06FF ]{3,16}$')
WEAP = {'fist': (12, 2.2, .4, 0), 'pistol': (14, 45, .3, 36), 'smg': (8, 35, .09, 120), 'shotgun': (34, 18, .85, 16),
        'rifle': (22, 80, .2, 60), 'water': (4, 22, .1, 200), 'paint': (7, 30, .18, 90)}
SPAWNS = [(0, 170), (-20, 150), (20, 150), (-420, -9), (240, 330)]
SAFE = [(0, 170, 30)]
SHOPS = [(-15, 92), (-450, 76), (-1230, 24), (56, 488), (400, -20)]
PICK_SPOTS = [(10,120,'pistol'),(-80,-5,'smg'),(85,85,'shotgun'),(-160,40,'rifle'),(0,260,'water'),(240,300,'paint'),(-500,25,'rifle'),(-1240,40,'pistol'),(40,500,'shotgun'),(430,-10,'smg'),(-30,-120,'paint'),(120,-160,'water')]
players = {}; pickups = {}; pid_ctr = [0]; pk_ctr = [0]
for x, z, w in PICK_SPOTS:
    pk_ctr[0] += 1; pickups[pk_ctr[0]] = {'id': pk_ctr[0], 'x': x, 'z': z, 'w': w, 'ammo': WEAP[w][3], 'fixed': True, 'away': 0}

def log_chat(line):
    try:
        with open(CHATLOG, 'a', encoding='utf-8') as f: f.write(time.strftime('%Y-%m-%d %H:%M:%S') + ' ' + line + '\n')
    except Exception: pass

class P:
    def __init__(s, w):
        pid_ctr[0] += 1; s.id = pid_ctr[0]; s.w = w; s.name = None; s.dev = ''; s.role = 'player'; s.look = {}; s.car = 'roadster'; s.paint = '#eeeeea'
        s.x = 0.0; s.y = 0.0; s.z = 170.0; s.yaw = 0.0; s.pitch = 0.0; s.roll = 0.0; s.mode = 'car'; s.anim = ''; s.hp = 100; s.ko = 0; s.god = False; s.muted = False
        s.weap = ['fist']; s.ammo = {}; s.cur = 'fist'; s.last = {}; s.chat_t = []; s.st_t = 0; s.vel = 0.0; s.lt = time.time(); s.kills = 0; s.alive = True; s.mg = ''; s.team = 0
    def pub(s):
        return {'id': s.id, 'n': s.name, 'r': s.role, 'x': round(s.x, 2), 'y': round(s.y, 2), 'z': round(s.z, 2), 'yaw': round(s.yaw, 3), 'p': round(s.pitch, 3), 'rl': round(s.roll, 3),
                'm': s.mode, 'a': s.anim, 'hp': s.hp, 'ko': s.ko > 0, 'w': s.cur, 'car': s.car, 'pc': s.paint, 'look': s.look, 'god': s.god}

class WS:
    def __init__(s, r, w): s.r = r; s.w = w; s.open = True
    async def recv(s):
        h = await s.r.readexactly(2); op = h[0] & 15; ln = h[1] & 127; masked = h[1] & 128
        if ln == 126: ln = struct.unpack('>H', await s.r.readexactly(2))[0]
        elif ln == 127: ln = struct.unpack('>Q', await s.r.readexactly(8))[0]
        if ln > 65536: raise ValueError('frame too big')
        mk = await s.r.readexactly(4) if masked else b'\0\0\0\0'
        d = bytearray(await s.r.readexactly(ln))
        for i in range(ln): d[i] ^= mk[i % 4]
        return op, bytes(d)
    def send(s, obj):
        if not s.open: return
        try:
            if s.w.transport.get_write_buffer_size() > 2000000: s.open = False; return
        except Exception: pass
        try:
            b = json.dumps(obj, separators=(',', ':'), ensure_ascii=False).encode()
            n = len(b); hdr = bytes([0x81, n]) if n < 126 else (bytes([0x81, 126]) + struct.pack('>H', n) if n < 65536 else bytes([0x81, 127]) + struct.pack('>Q', n))
            s.w.write(hdr + b)
        except Exception: s.open = False
    def close(s):
        s.open = False
        try: s.w.write(b'\x88\x00'); s.w.close()
        except Exception: pass

def bcast(obj, skip=None):
    for p in list(players.values()):
        if p is not skip and p.name: p.w.send(obj)
def sys_msg(p, t): p.w.send({'t': 'sys', 'm': t})
def find(name):
    n = (name or '').strip().lower()
    for p in players.values():
        if p.name and p.name.lower() == n: return p
    return None
def banned(name, dev):
    n = (name or '').lower()
    return any(b.get('name', '').lower() == n or (dev and b.get('dev') == dev) for b in BANS)
def in_safe(p): return any(math.hypot(p.x - x, p.z - z) < r for x, z, r in SAFE)

def damage(att, vic, dmg, how):
    if vic.ko > 0 or vic.god or not SET.get('ff', True) or in_safe(vic) or in_safe(att): return False
    if vic.mode == 'car' and how != 'ram': dmg = dmg * .5
    vic.hp = max(0, vic.hp - int(round(dmg)))
    att.w.send({'t': 'hit', 'id': vic.id, 'd': int(round(dmg))})
    if vic.hp <= 0:
        vic.ko = 4.0; att.kills += 1
        # drop current weapon as pickup
        if vic.cur != 'fist' and vic.ammo.get(vic.cur, 0) > 0: spawn_drop(vic, vic.cur)
        bcast({'t': 'feed', 'a': att.name, 'v': vic.name, 'w': how})
    return True

def spawn_drop(p, w):
    pk_ctr[0] += 1; k = pk_ctr[0]
    pickups[k] = {'id': k, 'x': round(p.x + random.uniform(-1, 1), 2), 'z': round(p.z + random.uniform(-1, 1), 2), 'w': w, 'ammo': p.ammo.get(w, 0), 'fixed': False, 'away': 0, 'exp': time.time() + 60}
    p.ammo[w] = 0
    if w in p.weap: p.weap.remove(w)
    p.cur = 'fist'; bcast({'t': 'pk', 'p': pickups[k]})

def rate(p, key, gap):
    now = time.time()
    if now - p.last.get(key, 0) < gap: return False
    p.last[key] = now; return True

def handle_cmd(p, c, tgt, arg):
    r = RANK[p.role]; t = find(tgt) if tgt else None
    def need(n):
        if r < n: sys_msg(p, 'No permission'); return False
        return True
    def outranks():
        if not t: sys_msg(p, 'Player not found'); return False
        if t is not p and RANK[t.role] >= r: sys_msg(p, 'Cannot target equal/higher role'); return False
        return True
    if c == 'kick' and need(2) and outranks():
        t.w.send({'t': 'kicked', 'm': 'Kicked by ' + p.name}); t.w.close(); bcast({'t': 'sys', 'm': t.name + ' was kicked'})
    elif c == 'ban' and need(2):
        name = t.name if t else (tgt or '').strip()
        if t and not outranks(): return
        if not name: return
        BANS.append({'name': name, 'dev': t.dev if t else '', 'by': p.name, 't': int(time.time())}); jsave('bans.json', BANS)
        if t: t.w.send({'t': 'kicked', 'm': 'Banned by ' + p.name}); t.w.close()
        bcast({'t': 'sys', 'm': name + ' was banned'})
    elif c == 'unban' and need(2):
        n = (tgt or '').strip().lower(); before = len(BANS)
        BANS[:] = [b for b in BANS if b.get('name', '').lower() != n]; jsave('bans.json', BANS); sys_msg(p, 'Unbanned ' + tgt if len(BANS) < before else 'Not banned: ' + tgt)
    elif c == 'inv_add' and need(2):
        name = (tgt or '').strip()[:16]
        if not NAME_RE.match(name): sys_msg(p, 'Invalid username'); return
        L = INV.setdefault('names', [])
        if name.lower() not in [x.lower() for x in L]: L.append(name); jsave('invites.json', INV)
        sys_msg(p, 'Invited ' + name); inv_push()
        if t and t is not p: t.w.send({'t': 'invite', 'from': p.name, 'id': p.id, 'x': p.x, 'y': p.y, 'z': p.z, 'mg': p.mg})
    elif c == 'inv_rm' and need(2):
        n = (tgt or '').strip().lower(); INV['names'] = [x for x in INV.get('names', []) if x.lower() != n]; jsave('invites.json', INV); sys_msg(p, 'Removed invite: ' + (tgt or '')); inv_push()
    elif c == 'inv_only' and need(3):
        INV['on'] = not INV.get('on'); jsave('invites.json', INV); inv_push(); bcast({'t': 'sys', 'm': 'Server is now ' + ('INVITE-ONLY' if INV['on'] else 'open to everyone')})
    elif c == 'inv_join':
        aid = int(arg) if str(arg or '').isdigit() else -1
        o = next((q for q in players.values() if q.name and q.id == aid), None)
        if not o or p.name.lower() not in [x.lower() for x in INV.get('names', [])]: return
        p.x, p.y, p.z = o.x + 4, o.y, o.z + 4
        p.w.send({'t': 'pos', 'x': p.x, 'y': p.y, 'z': p.z}); p.w.send({'t': 'invgo', 'mg': o.mg}); sys_msg(o, p.name + ' accepted your invite')
    elif c == 'bans' and need(2): sys_msg(p, 'Bans: ' + (', '.join(b['name'] for b in BANS) or 'none'))
    elif c in ('vip', 'admin', 'demote') and need(2):
        if c == 'admin' and r < 3: sys_msg(p, 'Only the owner can make admins'); return
        if not t: sys_msg(p, 'Player not found'); return
        if t.role == 'owner' or (RANK[t.role] >= r and t is not p): sys_msg(p, 'Cannot change that role'); return
        newr = 'player' if c == 'demote' else c
        if newr == 'player': ROLES.pop(t.name.lower(), None)
        else: ROLES[t.name.lower()] = newr
        jsave('roles.json', ROLES); t.role = newr; t.w.send({'t': 'role', 'r': newr}); bcast({'t': 'sys', 'm': t.name + ' is now ' + newr.upper()})
    elif c in ('mute', 'unmute') and need(2) and outranks():
        t.muted = c == 'mute'; bcast({'t': 'sys', 'm': t.name + (' was muted' if t.muted else ' was unmuted')})
    elif c == 'heal' and need(2):
        t = t or p; t.hp = 100; t.ko = 0; t.w.send({'t': 'hp', 'hp': 100}); sys_msg(p, 'Healed ' + t.name)
    elif c == 'god' and need(2):
        t = t or p; t.god = not t.god; sys_msg(p, t.name + ' god ' + ('ON' if t.god else 'OFF')); t.w.send({'t': 'sys', 'm': 'God mode ' + ('ON' if t.god else 'OFF')})
    elif c == 'give' and need(2):
        t = t or p; w = arg if arg in WEAP and arg != 'fist' else None
        if not w: sys_msg(p, 'Unknown weapon'); return
        if w not in t.weap: t.weap.append(w)
        t.ammo[w] = t.ammo.get(w, 0) + WEAP[w][3]; t.cur = w; t.w.send({'t': 'inv', 'weap': t.weap, 'ammo': t.ammo, 'cur': t.cur}); sys_msg(p, 'Gave ' + w + ' to ' + t.name)
    elif c in ('ff', 'weapons') and need(2):
        SET[c] = not SET.get(c, True); jsave('settings.json', SET); bcast({'t': 'set', 's': SET}); bcast({'t': 'sys', 'm': ('Friendly fire ' if c == 'ff' else 'Weapons ') + ('ON' if SET[c] else 'OFF')})
    elif c == 'list': sys_msg(p, 'Online: ' + ', '.join('%s(%s)' % (q.name, q.role) for q in players.values() if q.name))


MG_GAMES = ('soccer', 'race', 'koth', 'tag', 'drift', 'derby', 'stunt', 'parkour')
def mg_members(g): return sorted([q for q in players.values() if q.name and q.mg == g], key=lambda q: q.id)
def mg_roster(g):
    L = mg_members(g)
    if not L: return
    host = L[0].id
    for q in L: q.w.send({'t': 'mg', 'k': 'roster', 'g': g, 'host': host, 'list': [{'id': x.id, 'n': x.name, 'team': x.team, 'r': x.role} for x in L]})
def mg_leave(p):
    g = p.mg
    if g: p.mg = ''; mg_roster(g)
def mg_msg(p, m):
    k = str(m.get('k', ''))
    if k == 'join':
        g = str(m.get('g', ''))
        if g not in MG_GAMES: return
        if p.mg and p.mg != g: mg_leave(p)
        p.mg = g; L = mg_members(g)
        a = sum(1 for q in L if q.team == 0 and q is not p); b = sum(1 for q in L if q.team == 1 and q is not p)
        p.team = 0 if a <= b else 1
        mg_roster(g); return
    if k == 'leave': mg_leave(p); return
    if not p.mg or not rate(p, 'mg' + k, 0.03): return
    try: raw = json.dumps(m)
    except Exception: return
    if len(raw) > 900: return
    L = mg_members(p.mg)
    if k in ('ball', 'state', 'start', 'end', 'goal', 'it', 'score_all', 'kick_ack') and (not L or L[0] is not p): return  # host-only
    m['from'] = p.id; m['fn'] = p.name
    for q in L:
        if q is not p: q.w.send(m)

async def on_msg(p, m):
    t = m.get('t')
    if t == 'hello' and not p.name:
        name = str(m.get('name', '')).strip(); dev = str(m.get('dev', ''))[:64]
        if not NAME_RE.match(name) or is_bad(name): p.w.send({'t': 'deny', 'm': 'Name must be 3-16 letters/numbers and clean'}); return
        old = find(name)
        if old and (old.dev == dev or time.time() - old.lt > 6 or not old.w.open):
            # stale session (refresh / app switch / dropped tunnel): replace it instead of locking the name out
            players.pop(old.id, None); old.name = None; old.w.close()
            try: mg_leave(old)
            except Exception: pass
            bcast({'t': 'leave', 'id': old.id}); old = None
        if old: p.w.send({'t': 'deny', 'm': 'Name "' + name + '" is already online - pick another username'}); return
        if banned(name, dev): p.w.send({'t': 'deny', 'm': 'You are banned'}); return
        key = str(m.get('key', ''))
        role = 'owner' if key and secrets.compare_digest(key, OWNER_KEY) else ROLES.get(name.lower(), 'player')
        if INV.get('on') and RANK[role] < 2 and name.lower() not in [x.lower() for x in INV.get('names', [])]:
            p.w.send({'t': 'deny', 'm': 'This server is invite-only, ask the owner to invite you'}); return
        p.name = name; p.dev = dev
        p.role = role
        if p.role == 'owner': pass
        p.look = m.get('look') if isinstance(m.get('look'), dict) else {}
        p.car = str(m.get('car', 'roadster'))[:20]; sp = random.choice(SPAWNS[:3]); p.x, p.z = sp
        p.w.send({'t': 'welcome', 'id': p.id, 'role': p.role, 'set': SET, 'pk': [k for k in pickups.values() if not k['away']], 'players': [q.pub() for q in players.values() if q.name and q is not p], 'keyBad': bool(key) and p.role != 'owner'})
        if RANK[p.role] >= 2: p.w.send(inv_state())
        bcast({'t': 'join', 'p': p.pub()}, p); bcast({'t': 'sys', 'm': name + ' joined'}, p); log_chat('*** ' + name + ' joined (' + p.role + ')')
        return
    if not p.name: return
    if t == 'st':
        now = time.time()
        if now - p.st_t < 1 / 40: return
        dt = max(1e-3, now - p.st_t); p.st_t = now
        try:
            x, y, z = float(m['x']), float(m['y']), float(m['z'])
        except Exception: return
        if p.ko > 0: return
        d = math.hypot(x - p.x, z - p.z)
        if d > 200 * dt + 30 and m.get('tp') != 1: p.w.send({'t': 'pos', 'x': p.x, 'y': p.y, 'z': p.z}); return  # anti-teleport (allow quick-travel flag)
        p.vel = d / dt if dt < 1 else 0
        p.x, p.y, p.z = max(-1700, min(1350, x)), max(-50, min(600, y)), max(-900, min(1200, z))
        p.yaw = float(m.get('yaw', 0)); p.pitch = float(m.get('p', 0)); p.roll = float(m.get('rl', 0))
        p.mode = 'foot' if m.get('m') == 'foot' else 'car'; p.anim = str(m.get('a', ''))[:8]
        if m.get('car'): p.car = str(m['car'])[:20]
        if m.get('pc') and re.match(r'^#[0-9a-fA-F]{6}$', str(m['pc'])): p.paint = m['pc']
    elif t == 'mg':
        mg_msg(p, m)
    elif t == 'shop':
        w = str(m.get('w', ''))
        if w not in WEAP or w == 'fist' or p.ko > 0 or p.mode != 'foot': return
        if not SET.get('weapons', True): sys_msg(p, 'Weapons are disabled'); return
        if not any(math.hypot(p.x - x, p.z - z) < 9 for x, z in SHOPS): sys_msg(p, 'Walk into a weapon shop first'); return
        if not rate(p, 'shop', 1.5): return
        if w not in p.weap: p.weap.append(w)
        p.ammo[w] = min(999, p.ammo.get(w, 0) + WEAP[w][3]); p.cur = w
        p.w.send({'t': 'inv', 'weap': p.weap, 'ammo': p.ammo, 'cur': p.cur}); sys_msg(p, 'Got ' + w)
    elif t == 'look':
        if isinstance(m.get('look'), dict) and len(json.dumps(m['look'])) < 600: p.look = m['look']; bcast({'t': 'look', 'id': p.id, 'look': p.look}, p)
    elif t == 'chat':
        txt = str(m.get('m', '')).strip()[:160]
        if not txt: return
        if txt.startswith('/'):
            parts = txt[1:].split(); c = parts[0].lower() if parts else ''
            tgt = parts[1] if len(parts) > 1 else ''; arg = parts[2] if len(parts) > 2 else ''
            if c in ('give',) and len(parts) == 2: tgt, arg = '', parts[1]
            handle_cmd(p, c, tgt, arg); return
        if p.muted: sys_msg(p, 'You are muted'); return
        now = time.time(); p.chat_t = [x for x in p.chat_t if now - x < 10]
        if len(p.chat_t) >= 5 or (p.chat_t and now - p.chat_t[-1] < 1.0): sys_msg(p, 'Slow down (spam filter)'); return
        p.chat_t.append(now); clean = censor(txt)
        bcast({'t': 'chat', 'n': p.name, 'r': p.role, 'm': clean}); log_chat('<%s:%s> %s' % (p.name, p.role, clean))
    elif t == 'cmd':
        handle_cmd(p, str(m.get('c', '')), str(m.get('tgt', '')), str(m.get('arg', '')))
    elif t == 'atk':
        if p.ko > 0: return
        w = p.cur if p.mode == 'foot' else 'fist'
        if w != 'fist' and not SET.get('weapons', True): w = 'fist'
        dmg, rng, gap, _ = WEAP[w]
        if not rate(p, 'atk', gap * .9): return
        if w != 'fist':
            if p.ammo.get(w, 0) <= 0: p.w.send({'t': 'inv', 'weap': p.weap, 'ammo': p.ammo, 'cur': p.cur}); return
            p.ammo[w] -= 1
        yaw = float(m.get('yaw', p.yaw)); fx, fz = -math.sin(yaw), -math.cos(yaw)
        bcast({'t': 'fx', 'id': p.id, 'w': w, 'yaw': yaw}, p)
        best = None; bd = 1e9
        for q in players.values():
            if q is p or not q.name or q.ko > 0: continue
            dx, dz = q.x - p.x, q.z - p.z; d = math.hypot(dx, dz)
            if d > rng or d < .01 or abs(q.y - p.y) > 3.5: continue
            ang = math.acos(max(-1, min(1, (dx * fx + dz * fz) / d)))
            lim = .9 if w == 'fist' else (.28 if w == 'shotgun' else .16)
            if ang < lim and d < bd: best, bd = q, d
        if best:
            f = (1 - bd / rng * .5) if w == 'shotgun' else 1
            damage(p, best, dmg * f, w)
    elif t == 'ram':
        q = players.get(int(m.get('id', 0)))
        if not q or p.mode != 'car' or q.ko > 0 or not rate(p, 'ram', 1.0): return
        d = math.hypot(q.x - p.x, q.z - p.z)
        if d < 5 and p.vel > 8: damage(p, q, min(60, p.vel * 1.4), 'ram')
    elif t == 'pick':
        k = pickups.get(int(m.get('id', 0)))
        if not k or k['away'] or p.ko > 0 or p.mode != 'foot' or math.hypot(k['x'] - p.x, k['z'] - p.z) > 3.5: return
        if not SET.get('weapons', True): sys_msg(p, 'Weapons are disabled'); return
        w = k['w']
        if w not in p.weap: p.weap.append(w)
        p.ammo[w] = p.ammo.get(w, 0) + k['ammo']; p.cur = w
        if k['fixed']: k['away'] = time.time() + 25
        else: pickups.pop(k['id'], None)
        bcast({'t': 'pkx', 'id': k['id']}); p.w.send({'t': 'inv', 'weap': p.weap, 'ammo': p.ammo, 'cur': p.cur})
    elif t == 'sw':
        w = str(m.get('w', ''))
        if w in p.weap: p.cur = w
        p.w.send({'t': 'inv', 'weap': p.weap, 'ammo': p.ammo, 'cur': p.cur})
    elif t == 'drop':
        if p.cur != 'fist' and rate(p, 'drop', .5): spawn_drop(p, p.cur); p.w.send({'t': 'inv', 'weap': p.weap, 'ammo': p.ammo, 'cur': p.cur})

async def ticker():
    last = time.time()
    while True:
        await asyncio.sleep(.1); now = time.time(); dt = now - last; last = now
        for p in list(players.values()):
            if p.ko > 0:
                p.ko -= dt
                if p.ko <= 0:
                    p.ko = 0; p.hp = 100; sx, sz = random.choice(SPAWNS[:3]); p.x, p.z, p.y = sx, sz, 0
                    p.w.send({'t': 'respawn', 'x': sx, 'z': sz}); 
        for k in list(pickups.values()):
            if k['away'] and now > k['away']: k['away'] = 0; bcast({'t': 'pk', 'p': k})
            if not k['fixed'] and now > k.get('exp', 1e18): pickups.pop(k['id'], None); bcast({'t': 'pkx', 'id': k['id']})
        snap = [p.pub() for p in players.values() if p.name]
        if snap: bcast({'t': 'snap', 'p': snap, 'ts': now})

async def ws_session(r, w, req_headers):
    key = req_headers.get('sec-websocket-key', '')
    acc = base64.b64encode(hashlib.sha1((key + GUID).encode()).digest()).decode()
    w.write(('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: %s\r\n\r\n' % acc).encode())
    ws = WS(r, w); p = P(ws); players[p.id] = p; msgs = []
    try:
        while ws.open:
            op, data = await asyncio.wait_for(ws.recv(), timeout=60)
            if op == 8: break
            if op == 9: w.write(b'\x8a\x00'); continue
            if op != 1: continue
            now = time.time(); msgs = [x for x in msgs if now - x < 1]
            if len(msgs) > 80: continue  # flood guard
            msgs.append(now)
            try: m = json.loads(data.decode('utf-8', 'replace'))
            except Exception: continue
            p.lt = now
            if isinstance(m, dict): await on_msg(p, m)
            await w.drain()
    except Exception: pass
    finally:
        players.pop(p.id, None); ws.close()
        try: mg_leave(p)
        except Exception: pass
        if p.name: bcast({'t': 'leave', 'id': p.id}); bcast({'t': 'sys', 'm': p.name + ' left'}); log_chat('*** ' + p.name + ' left')

async def handle(r, w):
    try:
        line = await asyncio.wait_for(r.readline(), 20)
        if not line: w.close(); return
        parts = line.decode('latin1').split()
        if len(parts) < 2: w.close(); return
        meth, path = parts[0], parts[1]; hd = {}
        while True:
            l = await r.readline()
            if not l or l in (b'\r\n', b'\n'): break
            k, _, v = l.decode('latin1').partition(':'); hd[k.strip().lower()] = v.strip()
        if path.split('?')[0] == '/ws' and 'websocket' in hd.get('upgrade', '').lower():
            await ws_session(r, w, hd); return
        p = path.split('?')[0].split('#')[0]
        from urllib.parse import unquote
        p = unquote(p)
        if p.endswith('/'): p += 'index.html'
        fp = os.path.normpath(os.path.join(ROOT, p.lstrip('/')))
        deny = ('/mpdata', '/server.py', '/run_server.sh')
        if not fp.startswith(ROOT) or any(p.startswith(d) for d in deny) or not os.path.isfile(fp):
            body = b'Not found'; w.write(b'HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\nConnection: close\r\n\r\n' + (body if meth != 'HEAD' else b''))
        else:
            ct = mimetypes.guess_type(fp)[0] or 'application/octet-stream'
            with open(fp, 'rb') as f: body = f.read()
            cc = 'no-cache' if fp.endswith(('.html', '.js', '.glb', '.css', '.json')) else 'max-age=3600'
            w.write(('HTTP/1.1 200 OK\r\nContent-Type: %s\r\nContent-Length: %d\r\nCache-Control: %s\r\nConnection: close\r\n\r\n' % (ct, len(body), cc)).encode())
            if meth != 'HEAD': w.write(body)
        await w.drain(); w.close()
    except Exception:
        try: w.close()
        except Exception: pass

async def main():
    srv = await asyncio.start_server(handle, '0.0.0.0', PORT, reuse_address=True)
    asyncio.ensure_future(ticker())
    print('Roadster Dash UAE server on', PORT, flush=True)
    async with srv: await srv.serve_forever()
if __name__ == '__main__': asyncio.run(main())

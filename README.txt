Roadster Dash UAE v4 — local, offline copy (personal use; game by Taejoo Um).
Run:  cd roadsterdash_uae && python3 -m http.server 8765   then open http://localhost:8765/?v=4
Admin: click the "R" in ROADSTER on the menu -> Yes -> PIN (default 2026, change in Admin > Game > Security).
Rebuild game JS/HTML from originals: python3 patch.py   (admin/worlds/garage/market/troll UI lives in admin.js; network block in offline-shim.js)

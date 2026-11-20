/* Nest Defenders – an original tower-defence game.
 * Egg-thieves (beetles, lizards, snails, a giant boss beetle) march along the path to the nest.
 * Place dinosaur defenders next to the path: they scare the thieves away (puff of smoke, no harm)
 * and every scared thief drops ⭐ stars to buy and upgrade more defenders.
 * If the thieves take all the eggs it is NOT game over: the wave can simply be tried again.
 *
 * World: 1600 × 900 units = 16 × 9 tiles of 100. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
(function (D) {
  'use strict';
  var A = D.art;
  var WW = 1600, WH = 900, T = 100, COLS = 16, ROWS = 9;

  /* ---------- defenders ---------- */
  var TOWERS = {
    bronto: { cost: 50,  range: 230, dmg: 14, rate: 1.0,  kind: 'coconut' },
    ptero:  { cost: 70,  range: 330, dmg: 6,  rate: 0.36, kind: 'seed', air: true },
    trice:  { cost: 60,  range: 200, dmg: 4,  rate: 1.2,  kind: 'mud', splash: 75, slow: 0.45, slowT: 2.2 },
    ankylo: { cost: 90,  range: 150, dmg: 17, rate: 1.35, kind: 'thump' },
    trex:   { cost: 160, range: 270, dmg: 42, rate: 3.0,  kind: 'roar', slow: 0.6, slowT: 1.2, air: true }
  };
  var TOWER_ORDER = ['bronto', 'ptero', 'trice', 'ankylo', 'trex'];
  function stat(t, lvl, k) {
    var base = TOWERS[t][k];
    if (k === 'dmg') return base * Math.pow(1.5, lvl - 1);
    if (k === 'range') return base * (1 + 0.15 * (lvl - 1));
    if (k === 'rate') return base * Math.pow(0.88, lvl - 1);
    return base;
  }
  function upgradeCost(t, lvl) { return Math.round(TOWERS[t].cost * 0.75 * lvl); }

  /* ---------- thieves ---------- */
  var ENEMIES = {
    beetle: { hp: 30,  speed: 70,  reward: 5,  size: 34, eggs: 1 },
    lizard: { hp: 18,  speed: 135, reward: 4,  size: 34, eggs: 1 },
    snail:  { hp: 95,  speed: 40,  reward: 10, size: 38, eggs: 1, armor: 2 },
    boss:   { hp: 420, speed: 46,  reward: 60, size: 62, eggs: 3 },
    fly:    { hp: 24,  speed: 105, reward: 6,  size: 34, eggs: 1, flying: true } // only seeds and the roar reach them
  };

  /* ---------- maps (tile waypoints; the last one is the nest) ---------- */
  var MAPS = {
    easy:   [[-1, 1], [13, 1], [13, 4], [2, 4], [2, 7], [13, 7]],
    medium: [[-1, 4], [3, 4], [3, 1], [8, 1], [8, 7], [12, 7], [12, 2], [14, 2]],
    hard:   [[-1, 7], [2, 7], [2, 1], [6, 1], [6, 6], [10, 6], [10, 2], [13, 2], [13, 7], [14, 7]]
  };

  var TXT = {
    el: {
      names: { bronto: 'Καρύδες', ptero: 'Σποράκια', trice: 'Λάσπη', ankylo: 'Ουρά-ρόπαλο', trex: 'Βρυχηθμός' },
      inst: 'Προστάτεψε τη φωλιά! Βάλε δεινόσαυρους δίπλα στο μονοπάτι για να διώξουν τους κλέφτες αυγών!',
      flyers: 'Προσοχή! Λιβελούλες! Μόνο ο Πτερόδακτυλος και ο Τυραννόσαυρος τις φτάνουν!',
      wave: 'Κύμα', start: 'Ξεκίνα', next: 'Επόμενο κύμα', boss: 'Προσοχή! Έρχεται το μεγάλο σκαθάρι!',
      stolen: 'Ωχ! Πήραν ένα αυγό!', waveDone: 'Μπράβο! Το κύμα τελείωσε!', upgrade: 'Αναβάθμιση', sell: 'Πούλησε', max: 'Τέλειο!',
      lost: 'Ουπς! Οι κλέφτες πήραν όλα τα αυγά. Ξαναπροσπάθησε αυτό το κύμα!', retry: 'Ξανά',
      pick: 'Διάλεξε θέση στο γρασίδι!', poor: 'Χρειάζεσαι περισσότερα αστέρια!',
      result: 'Σώθηκαν {e} από {n} αυγά', rotate: 'Γύρισε το κινητό οριζόντια!'
    },
    en: {
      names: { bronto: 'Coconuts', ptero: 'Seeds', trice: 'Mud', ankylo: 'Tail club', trex: 'Mega roar' },
      inst: 'Protect the nest! Put dinosaurs next to the path to chase away the egg thieves!',
      flyers: 'Watch out! Dragonflies! Only the Pterodactyl and the T-Rex can reach them!',
      wave: 'Wave', start: 'Start', next: 'Next wave', boss: 'Watch out! The giant beetle is coming!',
      stolen: 'Oh no! They took an egg!', waveDone: 'Well done! Wave cleared!', upgrade: 'Upgrade', sell: 'Sell', max: 'Max!',
      lost: 'Oops! The thieves took all the eggs. Try this wave again!', retry: 'Retry',
      pick: 'Choose a spot on the grass!', poor: 'You need more stars!',
      result: '{e} of {n} eggs saved', rotate: 'Turn your phone sideways!'
    }
  };

  A.TILES.td = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">' +
    '<rect x="6" y="8" width="108" height="84" rx="12" fill="#86c95f" stroke="#fff" stroke-width="4"/>' +
    '<path d="M8 30 H80 V66 H112" fill="none" stroke="#b08a4f" stroke-width="16" stroke-linejoin="round"/>' +
    '<path d="M8 30 H80 V66 H112" fill="none" stroke="#e1c48a" stroke-width="11" stroke-linejoin="round"/>' +
    '<svg x="34" y="40" width="34" height="31" viewBox="0 0 200 180">' + A.dinoInner('trex') + '</svg>' +
    '<svg x="84" y="12" width="28" height="25" viewBox="0 0 200 180">' + A.dinoInner('ankylo') + '</svg>' +
    '<g><ellipse cx="28" cy="30" rx="7" ry="6" fill="#7e57c2" stroke="#311b92" stroke-width="1.5"/><circle cx="34" cy="28" r="3" fill="#311b92"/></g>' +
    '<path d="M50 42 L62 34" stroke="#fff" stroke-width="2" stroke-dasharray="3 2"/>' +
    '<svg x="96" y="62" width="18" height="14" viewBox="0 0 120 90">' + A.nest().replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg></svg>';

  D.games.td = {
    id: 'td', color: '#c62828', dark: '#8e0000',

    start: function (ctx) {
      var L = TXT[D.i18n.lang] || TXT.en;
      var CFG = {
        // hp: toughness, grow: extra toughness per wave, pay: stars per scared thief / wave bonus
        easy:   { waves: 8,  hp: 0.8, grow: 0.10, pay: 1.0,  eggs: 15, stars: 230, spd: 1.0, more: 1, fly: 99 },
        medium: { waves: 12, hp: 1.1, grow: 0.17, pay: 0.85, eggs: 10, stars: 190, spd: 1.05, more: 1.1, fly: 7 },
        hard:   { waves: 15, hp: 1.35, grow: 0.3, pay: 0.66, eggs: 10, stars: 160, spd: 1.15, more: 1.35, fly: 5 }
      }[ctx.level];
      var stage = ctx.stage;
      var map = MAPS[ctx.level];
      var pts = map.map(function (p) { return { x: p[0] * T + T / 2, y: p[1] * T + T / 2 }; });
      var segLen = [], pathLen = 0;
      for (var i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); segLen.push(l); pathLen += l; }

      // tiles: path, decorations, buildable
      var pathTiles = {}, deco = {};
      for (i = 1; i < map.length; i++) {
        var a = map[i - 1], b = map[i], sx = Math.sign(b[0] - a[0]), sy = Math.sign(b[1] - a[1]);
        for (var c = a[0], r = a[1]; ; c += sx, r += sy) { pathTiles[c + ',' + r] = 1; if (c === b[0] && r === b[1]) break; }
      }
      var nestTile = map[map.length - 1];
      (function () { // a few trees and rocks away from the path, the same every time for this map
        var seed = ctx.level.length * 7 + 3;
        function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
        for (var k = 0; k < 40 && Object.keys(deco).length < 7; k++) {
          var cc = Math.floor(rnd() * COLS), rr = Math.floor(rnd() * ROWS), near = false;
          for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) if (pathTiles[(cc + dx) + ',' + (rr + dy)]) near = true;
          if (!near) deco[cc + ',' + rr] = rnd() < 0.6 ? 'tree' : 'rock';
        }
      })();
      function buildable(cc, rr) {
        return cc >= 0 && rr >= 0 && cc < COLS && rr < ROWS && !pathTiles[cc + ',' + rr] && !deco[cc + ',' + rr] &&
          !towers.some(function (t) { return t.c === cc && t.r === rr; }) && !(cc === nestTile[0] && rr === nestTile[1]);
      }

      /* ---------- state ---------- */
      var towers = [], enemies = [], shots = [], fx = [], spawnQ = [];
      var stars = CFG.stars, eggs = CFG.eggs, wave = 0, inWave = false, waveT = 0, speed = 1, placing = null, selected = null;
      var snapshot = null, retries = 0, paused = false, gen = 0, last = null, hover = null, finished = false, sfxGap = 0;

      /* ---------- images ---------- */
      var IMG = {};
      TOWER_ORDER.forEach(function (t) { var im = new Image(); im.src = A.dataUri(A.dino(t)); IMG[t] = im; });
      var nestImg = new Image(); nestImg.src = A.dataUri(A.nest());

      /* ---------- DOM ---------- */
      var root = ctx.h('<div class="td-wrap"><div class="td-map"><canvas></canvas><div class="td-pop"></div><div class="td-msg"></div>' +
        '<div class="td-rotate">📱↻ ' + L.rotate + '</div></div>' +
        '<div class="td-side"><div class="td-stats"><span class="td-eggs"></span><span class="td-stars"></span><span class="td-wave"></span></div>' +
        '<div class="td-shop"></div>' +
        '<div class="td-ctrl"><button class="td-go"></button><button class="td-speed">⏩ 1×</button></div></div></div>');
      stage.appendChild(root);
      var mapEl = root.querySelector('.td-map'), canvas = root.querySelector('canvas'), g = canvas.getContext('2d');
      var pop = root.querySelector('.td-pop'), msg = root.querySelector('.td-msg'), goBtn = root.querySelector('.td-go'), spBtn = root.querySelector('.td-speed');
      var bgCanvas = document.createElement('canvas'), dpr = 1, scale = 1, offX = 0, offY = 0;

      TOWER_ORDER.forEach(function (t) {
        var b = ctx.h('<button class="td-buy" data-t="' + t + '"><span class="td-pic">' + A.dino(t) + '</span><span class="td-name">' + L.names[t] + '</span><span class="td-cost">⭐ ' + TOWERS[t].cost + '</span></button>');
        ctx.on(b, 'click', function () {
          closePop();
          if (stars < TOWERS[t].cost) { ctx.sfx.oops(); flash(L.poor); return; }
          placing = placing === t ? null : t;
          ctx.sfx.tap();
          if (placing) flash(L.pick);
          refresh();
        });
        root.querySelector('.td-shop').appendChild(b);
      });
      ctx.on(goBtn, 'click', startWave);
      ctx.on(spBtn, 'click', function () { speed = speed === 1 ? 2 : 1; spBtn.textContent = '⏩ ' + speed + '×'; spBtn.classList.toggle('on', speed === 2); ctx.sfx.tap(); });

      function refresh() {
        root.querySelector('.td-eggs').textContent = '🥚 ' + eggs;
        root.querySelector('.td-stars').textContent = '⭐ ' + stars;
        root.querySelector('.td-wave').textContent = '🐞 ' + Math.max(1, wave) + '/' + CFG.waves;
        root.querySelectorAll('.td-buy').forEach(function (b) {
          var t = b.getAttribute('data-t');
          b.classList.toggle('on', placing === t);
          b.classList.toggle('poor', stars < TOWERS[t].cost);
        });
        goBtn.disabled = inWave || finished;
        goBtn.innerHTML = '▶ ' + (wave === 0 ? L.start : L.next + ' ' + (wave + 1));
        goBtn.classList.toggle('pulse', !inWave && !finished);
        mapEl.classList.toggle('placing', !!placing);
      }
      var flashT = null;
      function flash(text, big) {
        msg.textContent = text; msg.className = 'td-msg show' + (big ? ' big' : '');
        clearTimeout(flashT); flashT = setTimeout(function () { msg.className = 'td-msg'; }, big ? 2200 : 1400);
      }

      /* ---------- layout & background ---------- */
      function layout() {
        var portrait = stage.clientHeight > stage.clientWidth * 1.05;
        root.classList.toggle('portrait', portrait);
        var w = mapEl.clientWidth, h = mapEl.clientHeight;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        scale = Math.min(w / WW, h / WH); offX = (w - WW * scale) / 2; offY = (h - WH * scale) / 2;
        root.querySelector('.td-rotate').style.display = portrait ? 'block' : 'none';
        drawBackground();
        closePop();
      }
      function drawBackground() {
        bgCanvas.width = canvas.width; bgCanvas.height = canvas.height;
        var b = bgCanvas.getContext('2d');
        b.fillStyle = '#5aa83f'; b.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        b.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);
        for (var cc = 0; cc < COLS; cc++) for (var rr = 0; rr < ROWS; rr++) {
          b.fillStyle = (cc + rr) % 2 ? '#86c95f' : '#7dc157';
          b.fillRect(cc * T, rr * T, T, T);
        }
        b.fillStyle = 'rgba(255,255,255,.18)';
        for (var k = 0; k < 120; k++) { b.beginPath(); b.arc((k * 397) % WW, (k * 211) % WH, 3, 0, 7); b.fill(); }
        // the path
        b.lineCap = 'round'; b.lineJoin = 'round';
        b.strokeStyle = '#a07c45'; b.lineWidth = 84; strokePath(b);
        b.strokeStyle = '#e1c48a'; b.lineWidth = 70; strokePath(b);
        b.fillStyle = '#cfae6d';
        for (var s = 0; s < pathLen; s += 37) { var p = posAt(s); b.beginPath(); b.arc(p.x + ((s * 13) % 40) - 20, p.y + ((s * 7) % 30) - 15, 4, 0, 7); b.fill(); }
        // decorations
        Object.keys(deco).forEach(function (k) {
          var q = k.split(','), x = +q[0] * T + T / 2, y = +q[1] * T + T / 2;
          if (deco[k] === 'tree') {
            b.fillStyle = 'rgba(0,0,0,.15)'; b.beginPath(); b.ellipse(x + 6, y + 30, 34, 12, 0, 0, 7); b.fill();
            b.fillStyle = '#2f7a22'; b.beginPath(); b.arc(x, y, 38, 0, 7); b.fill();
            b.fillStyle = '#4caf50'; b.beginPath(); b.arc(x - 8, y - 8, 26, 0, 7); b.fill();
            b.fillStyle = '#ef4444'; [[-14, -16], [10, 4], [-4, 12]].forEach(function (o) { b.beginPath(); b.arc(x + o[0], y + o[1], 4, 0, 7); b.fill(); });
          } else {
            b.fillStyle = '#a8a29e'; b.strokeStyle = '#57534e'; b.lineWidth = 4;
            b.beginPath(); b.ellipse(x, y + 10, 34, 24, 0, 0, 7); b.fill(); b.stroke();
          }
        });
        // the nest with eggs at the end of the path
        var n = pts[pts.length - 1];
        if (nestImg.complete) b.drawImage(nestImg, n.x - 60, n.y - 48, 120, 90);
        else nestImg.onload = drawBackground;
      }
      function strokePath(b) { b.beginPath(); b.moveTo(pts[0].x, pts[0].y); for (var i = 1; i < pts.length; i++) b.lineTo(pts[i].x, pts[i].y); b.stroke(); }
      function posAt(d) {
        for (var i = 0; i < segLen.length; i++) {
          if (d <= segLen[i]) { var k = d / segLen[i]; return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k, dx: Math.sign(pts[i + 1].x - pts[i].x) }; }
          d -= segLen[i];
        }
        var e = pts[pts.length - 1]; return { x: e.x, y: e.y, dx: 1 };
      }
      ctx.onResize(layout);

      /* ---------- waves ---------- */
      function waveList(n) {
        var list = [], t = 0;
        function add(type, count, gap) { count = Math.round(count * (type === 'boss' ? 1 : CFG.more)); for (var k = 0; k < count; k++) { list.push({ t: t, type: type }); t += gap; } t += 0.8; }
        add('beetle', 4 + n, Math.max(0.55, 1.0 - n * 0.03));
        if (n >= 3) add('lizard', 2 + Math.floor(n / 2), 0.55);
        if (n >= 4) add('snail', Math.floor(n / 3), 1.5);
        if (n >= 6) add('beetle', n, 0.5);
        if (n >= CFG.fly) add('fly', 2 + Math.floor(n / 2), 0.7);
        if (n % 5 === 0) add('boss', 1 + Math.floor(n / 10), 3);
        return list;
      }
      function startWave() {
        if (inWave || finished) return;
        snapshot = { stars: stars, eggs: eggs, towers: towers.map(function (t) { return { t: t.t, c: t.c, r: t.r, lvl: t.lvl, spent: t.spent }; }) };
        if (snapshot && snapshot.wave !== wave + 1) retries = 0;
        snapshot.wave = wave + 1;
        wave++; inWave = true; waveT = 0;
        spawnQ = waveList(wave);
        closePop(); placing = null;
        var boss = spawnQ.some(function (s) { return s.type === 'boss'; });
        var firstFly = wave === CFG.fly;
        flash(L.wave + ' ' + wave + '!', true);
        ctx.say(firstFly ? L.flyers : boss ? L.boss : L.wave + ' ' + wave + '!');
        if (firstFly) ctx.timeout(function () { flash(L.flyers); }, 2300);
        ctx.sfx.toot();
        refresh();
      }
      function waveCleared() {
        inWave = false;
        var bonus = Math.round((20 + wave * 3) * CFG.pay);
        stars += bonus;
        fx.push({ kind: 'text', x: 800, y: 420, text: '+' + bonus + ' ⭐', t: 0, life: 1.6, big: true });
        ctx.sfx.match();
        if (wave >= CFG.waves) { victory(); return; }
        flash(L.waveDone);
        if (Math.random() < 0.6) ctx.praise();
        refresh();
      }
      function victory() {
        finished = true; refresh();
        ctx.sfx.fanfare(); ctx.sfx.roar();
        fx.push({ kind: 'text', x: 800, y: 380, text: '🏆', t: 0, life: 3, big: true });
        ctx.timeout(function () { ctx.complete(L.result.replace('{e}', eggs).replace('{n}', CFG.eggs)); }, 1800);
      }
      function lostAll() {
        paused = true; inWave = false; enemies = []; shots = []; spawnQ = [];
        var ov = ctx.h('<div class="td-lost"><div class="td-lost-card"><div class="td-lost-dino">' + A.dino('trice') + '</div><p>' + L.lost + '</p>' +
          '<button class="text-btn primary td-retry">↻ ' + L.retry + '</button></div></div>');
        mapEl.appendChild(ov);
        ctx.say(L.lost);
        ctx.sfx.oops();
        ctx.on(ov.querySelector('.td-retry'), 'click', function () {
          ov.remove();
          // every retry is a bit easier: at least half the eggs back and a few extra stars, so nobody gets stuck
          retries++;
          stars = snapshot.stars + 30 * retries; eggs = Math.max(snapshot.eggs, Math.ceil(CFG.eggs / 2)); wave--;
          towers = snapshot.towers.map(function (s) { return makeTower(s.t, s.c, s.r, s.lvl, s.spent); });
          paused = false; ctx.sfx.tap(); refresh();
        });
      }

      /* ---------- towers ---------- */
      function makeTower(t, c, r, lvl, spent) { return { t: t, c: c, r: r, x: c * T + T / 2, y: r * T + T / 2, lvl: lvl || 1, cd: 0.2, spent: spent || TOWERS[t].cost, bounce: 0, face: 1 }; }
      function place(c, r) {
        var t = placing;
        if (!t || !buildable(c, r)) { ctx.sfx.oops(); return; }
        if (stars < TOWERS[t].cost) { flash(L.poor); placing = null; refresh(); return; }
        stars -= TOWERS[t].cost;
        var tw = makeTower(t, c, r);
        towers.push(tw);
        fx.push({ kind: 'ring', x: tw.x, y: tw.y, r: 10, maxR: 60, t: 0, life: 0.4, color: '255,255,255' });
        ctx.sfx.place(); ctx.sfx.voice(t);
        placing = null; // one shop tap = one defender (then tapping a defender opens its menu)
        refresh();
      }
      function openPop(tw) {
        selected = tw;
        var up = tw.lvl < 3 ? upgradeCost(tw.t, tw.lvl) : 0, refund = Math.round(tw.spent * 0.7);
        pop.innerHTML = '<div class="td-pop-title">' + L.names[tw.t] + ' ' + '★'.repeat(tw.lvl) + '</div>' +
          (tw.lvl < 3 ? '<button class="td-up' + (stars < up ? ' poor' : '') + '">⬆ ' + L.upgrade + ' ⭐' + up + '</button>' : '<div class="td-maxed">' + L.max + '</div>') +
          '<button class="td-sell">💰 ' + L.sell + ' +' + refund + '</button>';
        var sx = offX + tw.x * scale, sy = offY + tw.y * scale;
        pop.style.left = Math.max(70, Math.min(mapEl.clientWidth - 70, sx)) + 'px';
        pop.style.top = (sy < mapEl.clientHeight * 0.45 ? sy + T * scale * 0.55 : sy - T * scale * 0.55) + 'px';
        pop.classList.toggle('below', sy < mapEl.clientHeight * 0.45);
        pop.classList.add('show');
        var ub = pop.querySelector('.td-up');
        if (ub) ub.onclick = function (e) {
          e.stopPropagation();
          if (stars < up) { ctx.sfx.oops(); flash(L.poor); return; }
          stars -= up; tw.spent += up; tw.lvl++;
          fx.push({ kind: 'ring', x: tw.x, y: tw.y, r: 10, maxR: 80, t: 0, life: 0.5, color: '255,215,0' });
          ctx.sfx.sparkle(); refresh(); openPop(tw);
        };
        pop.querySelector('.td-sell').onclick = function (e) {
          e.stopPropagation();
          stars += refund; towers = towers.filter(function (x) { return x !== tw; });
          fx.push({ kind: 'text', x: tw.x, y: tw.y - 30, text: '+' + refund + ' ⭐', t: 0, life: 1 });
          ctx.sfx.whoosh(); closePop(); refresh();
        };
      }
      function closePop() { selected = null; pop.classList.remove('show'); }

      /* ---------- simulation ---------- */
      function spawn(type) {
        var E = ENEMIES[type];
        var hp = E.hp * CFG.hp * (1 + CFG.grow * (wave - 1));
        enemies.push({ type: type, d: -20, hp: hp, maxHp: hp, speed: E.speed * CFG.spd, slow: 1, slowT: 0, size: E.size, wob: Math.random() * 6, hit: 0 });
      }
      function step(dt) {
        if (paused || finished && !inWave) { tickFx(dt); return; }
        if (inWave) {
          waveT += dt;
          while (spawnQ.length && spawnQ[0].t <= waveT) spawn(spawnQ.shift().type);
        }
        // thieves walk
        enemies.forEach(function (e) {
          if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slow = 1; }
          e.d += e.speed * e.slow * dt; e.wob += dt * 10; e.hit = Math.max(0, e.hit - dt);
          var p = posAt(e.d); e.x = p.x; e.y = p.y; e.dx = p.dx;
        });
        // reached the nest: an egg is taken
        enemies = enemies.filter(function (e) {
          if (e.d < pathLen) return true;
          eggs = Math.max(0, eggs - ENEMIES[e.type].eggs);
          fx.push({ kind: 'text', x: e.x, y: e.y - 40, text: '−🥚', t: 0, life: 1 });
          ctx.sfx.bump();
          if (sfxGap <= 0) { ctx.say(L.stolen, { noCaption: true }); sfxGap = 3; }
          refresh();
          return false;
        });
        if (eggs <= 0 && !paused) { lostAll(); return; }
        // defenders act
        towers.forEach(function (tw) {
          tw.cd -= dt; tw.bounce = Math.max(0, tw.bounce - dt * 4);
          if (tw.cd > 0) return;
          var rng = stat(tw.t, tw.lvl, 'range'), dmg = stat(tw.t, tw.lvl, 'dmg'), K = TOWERS[tw.t];
          var inRange = enemies.filter(function (e) { return e.d > 0 && (K.air || !ENEMIES[e.type].flying) && Math.hypot(e.x - tw.x, e.y - tw.y) <= rng; });
          if (!inRange.length) return;
          tw.cd = stat(tw.t, tw.lvl, 'rate'); tw.bounce = 1;
          var target = inRange.reduce(function (m, e) { return e.d > m.d ? e : m; }); // the one closest to the nest
          tw.face = target.x < tw.x ? -1 : 1;
          if (K.kind === 'thump' || K.kind === 'roar') {
            inRange.forEach(function (e) { hurt(e, dmg); if (K.slow) { e.slow = K.slow; e.slowT = K.slowT; } });
            fx.push({ kind: 'ring', x: tw.x, y: tw.y, r: 20, maxR: rng, t: 0, life: K.kind === 'roar' ? 0.6 : 0.35, color: K.kind === 'roar' ? '255,112,67' : '255,255,255' });
            if (K.kind === 'roar') ctx.sfx.roar(); else if (sfxGap <= 0) { ctx.sfx.bump(); }
          } else {
            shots.push({ kind: K.kind, x: tw.x, y: tw.y - 20, sx: tw.x, sy: tw.y - 20, target: target, tx: target.x, ty: target.y, t: 0,
              dur: Math.hypot(target.x - tw.x, target.y - tw.y) / (K.kind === 'seed' ? 900 : 620), dmg: dmg, tower: tw.t });
            if (sfxGap <= 0 && K.kind !== 'seed') { ctx.sfx.pop(); sfxGap = 0.12; }
          }
        });
        // projectiles fly (homing; coconuts and mud fly in an arc)
        shots = shots.filter(function (s) {
          s.t += dt;
          if (s.target && enemies.indexOf(s.target) >= 0) { s.tx = s.target.x; s.ty = s.target.y; }
          var k = Math.min(1, s.t / s.dur);
          s.x = s.sx + (s.tx - s.sx) * k; s.y = s.sy + (s.ty - s.sy) * k - (s.kind === 'seed' ? 0 : Math.sin(k * Math.PI) * 60);
          if (k < 1) return true;
          if (s.kind === 'mud') {
            var K = TOWERS.trice;
            enemies.forEach(function (e) { if (!ENEMIES[e.type].flying && Math.hypot(e.x - s.tx, e.y - s.ty) <= K.splash) { hurt(e, s.dmg); e.slow = K.slow; e.slowT = K.slowT; } });
            fx.push({ kind: 'splat', x: s.tx, y: s.ty, t: 0, life: 0.6 });
          } else if (s.target && enemies.indexOf(s.target) >= 0) {
            hurt(s.target, s.dmg);
            if (s.kind === 'coconut') fx.push({ kind: 'ring', x: s.tx, y: s.ty, r: 6, maxR: 26, t: 0, life: 0.25, color: '139,90,43' });
          }
          return false;
        });
        tickFx(dt);
        sfxGap -= dt;
        if (inWave && !spawnQ.length && !enemies.length) waveCleared();
      }
      function hurt(e, dmg) {
        var armor = ENEMIES[e.type].armor || 0;
        e.hp -= Math.max(1, dmg - armor); e.hit = 0.12;
        if (e.hp <= 0 && enemies.indexOf(e) >= 0) {
          enemies.splice(enemies.indexOf(e), 1);
          var rw = Math.max(1, Math.round(ENEMIES[e.type].reward * CFG.pay));
          stars += rw;
          fx.push({ kind: 'puff', x: e.x, y: e.y, t: 0, life: 0.5, s: e.size });
          fx.push({ kind: 'text', x: e.x, y: e.y - 30, text: '+' + rw + '⭐', t: 0, life: 0.9 });
          if (e.type === 'boss') { ctx.sfx.fanfare(); ctx.burst(canvas); }
          else if (sfxGap <= 0) { ctx.sfx.crack(); sfxGap = 0.08; }
          refresh();
        }
      }
      function tickFx(dt) { fx.forEach(function (f) { f.t += dt; }); fx = fx.filter(function (f) { return f.t < f.life; }); }

      /* ---------- drawing ---------- */
      function draw() {
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.drawImage(bgCanvas, 0, 0);
        g.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);
        // placement helpers
        if (placing) {
          for (var cc = 0; cc < COLS; cc++) for (var rr = 0; rr < ROWS; rr++) if (buildable(cc, rr)) {
            g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.arc(cc * T + T / 2, rr * T + T / 2, 14, 0, 7); g.fill();
          }
          if (hover && buildable(hover.c, hover.r)) rangeCircle(hover.c * T + T / 2, hover.r * T + T / 2, stat(placing, 1, 'range'), true);
        }
        if (selected) rangeCircle(selected.x, selected.y, stat(selected.t, selected.lvl, 'range'), false);
        // thieves (back to front)
        enemies.slice().sort(function (a, b) { return a.y - b.y; }).forEach(drawEnemy);
        // defenders
        towers.forEach(drawTower);
        // shots
        shots.forEach(function (s) {
          if (s.kind === 'coconut') { g.fillStyle = '#6b3f1d'; g.beginPath(); g.arc(s.x, s.y, 10, 0, 7); g.fill(); g.fillStyle = '#2b1705'; g.beginPath(); g.arc(s.x - 3, s.y - 3, 2, 0, 7); g.fill(); }
          else if (s.kind === 'seed') { g.fillStyle = '#facc15'; g.beginPath(); g.ellipse(s.x, s.y, 7, 4, Math.atan2(s.ty - s.sy, s.tx - s.sx), 0, 7); g.fill(); }
          else { g.fillStyle = '#7b5230'; g.beginPath(); g.arc(s.x, s.y, 12, 0, 7); g.fill(); g.fillStyle = '#9c6b44'; g.beginPath(); g.arc(s.x - 3, s.y - 3, 5, 0, 7); g.fill(); }
        });
        // effects
        fx.forEach(function (f) {
          var k = f.t / f.life;
          if (f.kind === 'ring') { g.strokeStyle = 'rgba(' + f.color + ',' + (1 - k) + ')'; g.lineWidth = 8 * (1 - k) + 2; g.beginPath(); g.arc(f.x, f.y, f.r + (f.maxR - f.r) * k, 0, 7); g.stroke(); }
          else if (f.kind === 'puff') {
            g.fillStyle = 'rgba(255,255,255,' + (1 - k) + ')';
            for (var q = 0; q < 6; q++) { var an = q * 1.05; g.beginPath(); g.arc(f.x + Math.cos(an) * f.s * k, f.y + Math.sin(an) * f.s * k * 0.7, f.s * 0.45 * (1 - k * 0.5), 0, 7); g.fill(); }
          } else if (f.kind === 'splat') { g.fillStyle = 'rgba(123,82,48,' + 0.6 * (1 - k) + ')'; g.beginPath(); g.ellipse(f.x, f.y + 10, 70, 30, 0, 0, 7); g.fill(); }
          else if (f.kind === 'text') {
            g.globalAlpha = 1 - k * k; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 6;
            g.font = '800 ' + (f.big ? 64 : 30) + 'px ' + getComputedStyle(document.body).fontFamily; g.textAlign = 'center';
            var yy = f.y - k * 40; g.strokeText(f.text, f.x, yy); g.fillText(f.text, f.x, yy); g.globalAlpha = 1;
          }
        });
      }
      function rangeCircle(x, y, r, ok) {
        g.fillStyle = ok ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.12)'; g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3;
        g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.stroke();
      }
      function drawTower(tw) {
        g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(tw.x, tw.y + 32, 40, 13, 0, 0, 7); g.fill();
        g.fillStyle = ['#bcaaa4', '#90caf9', '#ffd54f'][tw.lvl - 1]; g.strokeStyle = '#5d4037'; g.lineWidth = 4;
        g.beginPath(); g.ellipse(tw.x, tw.y + 26, 40, 14, 0, 0, 7); g.fill(); g.stroke();
        var im = IMG[tw.t], hop = Math.sin(tw.bounce * Math.PI) * 10, s = 1 + (tw.lvl - 1) * 0.08;
        if (im.complete) {
          g.save(); g.translate(tw.x, tw.y + 30 - hop); g.scale(tw.face * s, s);
          g.drawImage(im, -46, -82, 92, 83); g.restore();
        }
        for (var k = 0; k < tw.lvl; k++) { g.fillStyle = '#ffd400'; star(tw.x - (tw.lvl - 1) * 9 + k * 18, tw.y + 44, 7); }
      }
      function star(x, y, r) { g.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.strokeStyle = '#a16207'; g.lineWidth = 1.5; g.stroke(); }
      function drawEnemy(e) {
        if (e.d < -10) return;
        var s = e.size, wob = Math.sin(e.wob) * 3;
        g.save(); g.translate(e.x, e.y + wob * 0.3); if (e.dx < 0) g.scale(-1, 1);
        if (e.slow < 1) { g.fillStyle = 'rgba(123,82,48,.35)'; g.beginPath(); g.ellipse(0, s * 0.45, s * 0.9, s * 0.3, 0, 0, 7); g.fill(); }
        if (e.type === 'beetle' || e.type === 'boss') {
          var body = e.type === 'boss' ? '#6a1b9a' : '#7e57c2';
          g.strokeStyle = '#311b92'; g.lineWidth = s * 0.08;
          for (var k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(k * s * 0.3, 0); g.lineTo(k * s * 0.4 + wob, s * 0.55); g.stroke(); }
          g.fillStyle = body; g.beginPath(); g.ellipse(0, 0, s * 0.62, s * 0.45, 0, 0, 7); g.fill(); g.stroke();
          g.beginPath(); g.moveTo(-s * 0.1, -s * 0.44); g.lineTo(-s * 0.1, s * 0.44); g.stroke();
          g.fillStyle = '#311b92'; g.beginPath(); g.arc(s * 0.6, -s * 0.05, s * 0.24, 0, 7); g.fill();
          g.fillStyle = '#fff'; g.beginPath(); g.arc(s * 0.68, -s * 0.12, s * 0.09, 0, 7); g.fill();
          g.fillStyle = '#000'; g.beginPath(); g.arc(s * 0.7, -s * 0.12, s * 0.045, 0, 7); g.fill();
          if (e.type === 'boss') { g.fillStyle = '#ffd400'; g.beginPath(); g.moveTo(-s * 0.3, -s * 0.42); g.lineTo(-s * 0.2, -s * 0.7); g.lineTo(-s * 0.05, -s * 0.5); g.lineTo(s * 0.1, -s * 0.72); g.lineTo(s * 0.2, -s * 0.42); g.fill(); }
        } else if (e.type === 'lizard') {
          g.fillStyle = '#26a69a'; g.strokeStyle = '#00695c'; g.lineWidth = 3;
          g.beginPath(); g.moveTo(-s * 0.4, 0); g.quadraticCurveTo(-s * 0.9, wob * 2, -s * 1.1, -s * 0.1); g.lineTo(-s * 0.4, s * 0.12); g.fill(); g.stroke();
          g.beginPath(); g.ellipse(0, 0, s * 0.5, s * 0.22, 0, 0, 7); g.fill(); g.stroke();
          g.beginPath(); g.ellipse(s * 0.55, -s * 0.05, s * 0.22, s * 0.16, 0, 0, 7); g.fill(); g.stroke();
          g.strokeStyle = '#00695c'; g.lineWidth = 4;
          [[-0.25, 1], [0.25, -1]].forEach(function (l) { g.beginPath(); g.moveTo(l[0] * s, 0); g.lineTo(l[0] * s + l[1] * wob, s * 0.35); g.stroke(); });
          g.fillStyle = '#000'; g.beginPath(); g.arc(s * 0.62, -s * 0.1, s * 0.05, 0, 7); g.fill();
        } else if (e.type === 'fly') {
          g.restore(); g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(e.x, e.y + 22, s * 0.5, s * 0.16, 0, 0, 7); g.fill();
          g.save(); g.translate(e.x, e.y - 26 + Math.sin(e.wob * 0.7) * 6); if (e.dx < 0) g.scale(-1, 1);
          var flap = Math.abs(Math.sin(e.wob * 3)) * 0.6 + 0.4;
          g.fillStyle = 'rgba(186,230,253,.85)'; g.strokeStyle = '#0277bd'; g.lineWidth = 2;
          [[-0.15, -1], [0.15, -1], [-0.15, 1], [0.15, 1]].forEach(function (w) { g.beginPath(); g.ellipse(w[0] * s, w[1] * s * 0.35 * flap, s * 0.45, s * 0.16 * flap, w[1] * 0.3, 0, 7); g.fill(); g.stroke(); });
          g.fillStyle = '#26c6da'; g.strokeStyle = '#006064'; g.lineWidth = 3;
          g.beginPath(); g.ellipse(-s * 0.25, 0, s * 0.55, s * 0.1, 0, 0, 7); g.fill(); g.stroke();
          g.beginPath(); g.arc(s * 0.38, 0, s * 0.17, 0, 7); g.fill(); g.stroke();
          g.fillStyle = '#000'; g.beginPath(); g.arc(s * 0.45, -s * 0.06, s * 0.05, 0, 7); g.fill();
        } else { // snail
          g.fillStyle = '#ffcc80'; g.strokeStyle = '#8d6e63'; g.lineWidth = 3;
          g.beginPath(); g.ellipse(s * 0.1, s * 0.25, s * 0.7, s * 0.18, 0, 0, 7); g.fill(); g.stroke();
          g.beginPath(); g.moveTo(s * 0.55, s * 0.15); g.lineTo(s * 0.7, -s * 0.35); g.moveTo(s * 0.62, s * 0.15); g.lineTo(s * 0.85, -s * 0.3); g.stroke();
          g.fillStyle = '#8d6e63'; g.beginPath(); g.arc(-s * 0.05, -s * 0.12, s * 0.42, 0, 7); g.fill(); g.stroke();
          g.strokeStyle = '#ffe0b2'; g.lineWidth = 4; g.beginPath();
          for (var a = 0; a < 9; a += 0.3) { var rr = s * 0.36 * (1 - a / 10); g.lineTo(-s * 0.05 + Math.cos(a) * rr, -s * 0.12 + Math.sin(a) * rr); } g.stroke();
        }
        if (e.hit > 0) { g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(0, 0, s * 0.6, 0, 7); g.fill(); }
        g.restore();
        // health bar
        if (e.hp < e.maxHp) {
          var w = s * 1.3, f = Math.max(0, e.hp / e.maxHp);
          g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(e.x - w / 2, e.y - s * 0.85, w, 7);
          g.fillStyle = f > 0.5 ? '#4caf50' : f > 0.25 ? '#ffb300' : '#e53935'; g.fillRect(e.x - w / 2, e.y - s * 0.85, w * f, 7);
        }
      }

      /* ---------- loop ---------- */
      function frame(t, g0) {
        if (g0 !== gen || !ctx.alive()) return;
        if (last === null) last = t;
        var dt = Math.min(0.05, (t - last) / 1000); last = t;
        for (var k = 0; k < speed; k++) { var n = Math.ceil(dt / 0.02); for (var q = 0; q < n; q++) step(dt / n); }
        draw();
        requestAnimationFrame(function (tt) { frame(tt, g0); });
      }

      /* ---------- input ---------- */
      function tileAt(e) {
        var rc = canvas.getBoundingClientRect();
        var x = (e.clientX - rc.left - offX) / scale, y = (e.clientY - rc.top - offY) / scale;
        return { c: Math.floor(x / T), r: Math.floor(y / T), x: x, y: y };
      }
      ctx.on(canvas, 'pointerdown', function (e) {
        e.preventDefault();
        var p = tileAt(e);
        if (placing) { place(p.c, p.r); return; }
        var tw = towers.filter(function (x) { return x.c === p.c && x.r === p.r; })[0];
        if (tw) { ctx.sfx.tap(); if (selected === tw) closePop(); else openPop(tw); }
        else closePop();
      });
      ctx.on(canvas, 'pointermove', function (e) { hover = tileAt(e); });
      ctx.on(canvas, 'pointerleave', function () { hover = null; });
      ctx.on(window, 'keydown', function (e) {
        if (e.key === 'Escape') { placing = null; closePop(); refresh(); }
        else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startWave(); }
        else if (/^[1-5]$/.test(e.key)) root.querySelectorAll('.td-buy')[+e.key - 1].click();
      });

      // read-only snapshot + geometry for the automated tests
      stage._debug = function () {
        return { wave: wave, waves: CFG.waves, eggs: eggs, stars: stars, inWave: inWave, enemies: enemies.length, towers: towers.map(function (t) { return [t.t, t.c, t.r, t.lvl]; }),
          finished: finished, paused: paused, scale: scale, offX: offX, offY: offY, path: Object.keys(pathTiles), deco: Object.keys(deco), nest: nestTile };
      };

      layout();
      refresh();
      ctx.instructText(L.inst);
      requestAnimationFrame(function (t) { frame(t, gen); });
    }
  };
})(window.Dino);

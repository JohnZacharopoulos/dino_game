/* Dino Scene Maker – free play, for big screens with a mouse.
 * Left: pick a landscape. Right: a palette of dinosaurs and things (volcano, rocks, trees…) with
 * size and flip controls. Drag items from the right into the scene; drag them again to move them,
 * drag them out of the scene (or press 🗑 / Delete) to remove them. The scene is saved
 * automatically in this browser, and 📷 downloads it as a picture. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
(function (D) {
  'use strict';
  var A = D.art;
  var XMLNS = 'http://www.w3.org/2000/svg';
  function svg(vb, body) { return '<svg xmlns="' + XMLNS + '" viewBox="' + vb + '">' + body + '</svg>'; }
  function strip(s) { return s.replace(/^<svg[^>]*>|<\/svg>$/g, ''); }

  /* ---------- backgrounds (1600 × 1000) ---------- */
  function bgSvg(defs, body) {
    return '<svg xmlns="' + XMLNS + '" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><defs>' + defs + '</defs>' + body + '</svg>';
  }
  function sky(id, a, b) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>'; }
  var BGS = {
    jungle: bgSvg(sky('s', '#7fd3ff', '#dff5ff'),
      '<rect width="1600" height="1000" fill="url(#s)"/><circle cx="1350" cy="150" r="80" fill="#ffe14d"/>' +
      '<path d="M0 560 Q200 420 420 520 T860 500 T1300 470 T1600 520 V1000 H0 Z" fill="#9bd87a"/>' +
      '<path d="M0 640 Q260 560 520 630 T1040 610 T1600 640 V1000 H0 Z" fill="#7cc65a"/>' +
      '<g fill="#5aa83f">' + [80, 300, 610, 980, 1250, 1500].map(function (x, i) { return '<circle cx="' + x + '" cy="' + (600 - (i % 2) * 30) + '" r="' + (70 + (i % 3) * 20) + '"/>'; }).join('') + '</g>' +
      '<rect y="720" width="1600" height="280" fill="#6dbb4a"/><path d="M0 720 Q400 690 800 720 T1600 715 V740 H0 Z" fill="#5fae3f"/>'),
    volcano: bgSvg(sky('s', '#ff9f6b', '#ffe0b8'),
      '<rect width="1600" height="1000" fill="url(#s)"/>' +
      '<path d="M0 620 L260 420 L420 540 L640 360 L880 560 L1100 400 L1360 580 L1600 450 V1000 H0 Z" fill="#8d6e63" opacity=".55"/>' +
      '<path d="M0 700 Q300 620 620 690 T1240 670 T1600 700 V1000 H0 Z" fill="#a1887f"/>' +
      '<rect y="760" width="1600" height="240" fill="#8d6e63"/><path d="M0 760 Q400 735 800 760 T1600 755 V780 H0 Z" fill="#795548"/>'),
    beach: bgSvg(sky('s', '#6fc6f2', '#d2f0ff'),
      '<rect width="1600" height="1000" fill="url(#s)"/><circle cx="260" cy="160" r="75" fill="#ffe14d"/>' +
      '<g fill="#fff" opacity=".9"><ellipse cx="900" cy="170" rx="120" ry="34"/><ellipse cx="960" cy="150" rx="70" ry="40"/><ellipse cx="1300" cy="250" rx="90" ry="26"/></g>' +
      '<rect y="560" width="1600" height="170" fill="#3fb6d9"/><path d="M0 600 Q100 585 200 600 T400 600 T600 600 T800 600 T1000 600 T1200 600 T1400 600 T1600 600" stroke="#bdeefb" stroke-width="6" fill="none"/>' +
      '<path d="M0 720 Q400 690 800 720 T1600 710 V1000 H0 Z" fill="#f3d98f"/>'),
    desert: bgSvg(sky('s', '#ffb37a', '#fff1c7'),
      '<rect width="1600" height="1000" fill="url(#s)"/><circle cx="800" cy="520" r="160" fill="#ffd54f" opacity=".85"/>' +
      '<path d="M0 640 Q300 540 600 620 T1200 600 T1600 620 V1000 H0 Z" fill="#e6b864"/>' +
      '<path d="M0 760 Q350 680 760 750 T1600 730 V1000 H0 Z" fill="#d9a54a"/>'),
    night: bgSvg(sky('s', '#1a237e', '#3949ab'),
      '<rect width="1600" height="1000" fill="url(#s)"/>' +
      '<g fill="#fff">' + (function () { var s = ''; for (var i = 0; i < 70; i++) s += '<circle cx="' + ((i * 397) % 1600) + '" cy="' + ((i * 173) % 520) + '" r="' + (1.5 + (i % 3)) + '" opacity=".' + (5 + i % 5) + '"/>'; return s; })() + '</g>' +
      '<circle cx="1300" cy="170" r="70" fill="#fff8d6"/><circle cx="1330" cy="150" r="66" fill="#283593"/>' +
      '<path d="M0 620 Q300 520 640 600 T1280 580 T1600 610 V1000 H0 Z" fill="#2e5d3a"/>' +
      '<rect y="740" width="1600" height="260" fill="#24502f"/>'),
    snow: bgSvg(sky('s', '#a9d8f5', '#eef8ff'),
      '<rect width="1600" height="1000" fill="url(#s)"/>' +
      '<path d="M0 600 L200 380 L360 520 L560 300 L780 540 L1000 360 L1220 560 L1420 400 L1600 520 V1000 H0 Z" fill="#dfeefa"/>' +
      '<path d="M500 360 L560 300 L620 360 Z M940 420 L1000 360 L1060 420 Z" fill="#fff"/>' +
      '<path d="M0 720 Q400 660 800 720 T1600 700 V1000 H0 Z" fill="#fff"/>' +
      '<g fill="#fff">' + (function () { var s = ''; for (var i = 0; i < 40; i++) s += '<circle cx="' + ((i * 271) % 1600) + '" cy="' + ((i * 137) % 600) + '" r="5"/>'; return s; })() + '</g>')
  };
  var BG_LIST = ['jungle', 'volcano', 'beach', 'desert', 'night', 'snow'];

  /* ---------- items ---------- */
  var ROCK = '<path d="M4 58 C2 30 22 8 48 6 C74 4 96 26 96 58 Z" fill="#a8a29e" stroke="#57534e" stroke-width="5" stroke-linejoin="round"/><path d="M22 30 C30 22 40 20 48 20" stroke="#e7e5e4" stroke-width="5" fill="none" stroke-linecap="round"/>';
  var ITEMS = [
    { id: 'trex', w: 0.2, art: A.dino('trex') },
    { id: 'bronto', w: 0.24, art: A.dino('bronto') },
    { id: 'trice', w: 0.2, art: A.dino('trice') },
    { id: 'stego', w: 0.2, art: A.dino('stego') },
    { id: 'ankylo', w: 0.18, art: A.dino('ankylo') },
    { id: 'ptero', w: 0.15, art: A.dino('ptero') },
    { id: 'volcano', w: 0.34, art: svg('0 0 160 120', '<g fill="#d8d0cc"><circle cx="80" cy="18" r="12"/><circle cx="94" cy="8" r="9"/><circle cx="68" cy="6" r="7"/></g>' +
      '<path d="M4 118 L60 32 L100 32 L156 118 Z" fill="#8d6e63" stroke="#5d4037" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M60 32 L100 32 L94 46 L86 40 L80 56 L74 42 L66 48 Z" fill="#ff7043" stroke="#bf360c" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M40 80 L52 66 M112 84 L102 70" stroke="#6d4c41" stroke-width="4" stroke-linecap="round"/>') },
    { id: 'cave', w: 0.26, art: svg('0 0 160 110', '<path d="M4 108 C2 50 40 6 84 6 C130 6 158 50 156 108 Z" fill="#a1887f" stroke="#5d4037" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M48 108 C48 66 62 46 80 46 C98 46 112 66 112 108 Z" fill="#3e2723"/><path d="M30 40 C40 28 52 22 64 20" stroke="#d7ccc8" stroke-width="5" fill="none" stroke-linecap="round"/>') },
    { id: 'palm', w: 0.13, art: svg('0 0 100 160', '<path d="M50 158 C56 120 44 80 54 44" fill="none" stroke="#8d5b34" stroke-width="10" stroke-linecap="round"/>' +
      '<g fill="#3fa34d" stroke="#25713a" stroke-width="3" stroke-linejoin="round"><path d="M54 44 C30 26 8 34 2 52 C22 42 38 44 54 44 Z"/><path d="M54 44 C78 26 96 34 98 54 C80 42 66 44 54 44 Z"/>' +
      '<path d="M54 44 C44 20 24 10 10 14 C30 20 44 30 54 44 Z"/><path d="M54 44 C66 20 86 12 96 18 C76 22 64 32 54 44 Z"/></g><circle cx="50" cy="48" r="5" fill="#6b3f1d"/><circle cx="58" cy="50" r="5" fill="#6b3f1d"/>') },
    { id: 'tree', w: 0.17, art: svg('0 0 100 130', '<rect x="42" y="70" width="16" height="58" rx="5" fill="#8d5b34" stroke="#5b3a1a" stroke-width="3"/>' +
      '<g fill="#4caf50" stroke="#2e7d32" stroke-width="4"><circle cx="50" cy="40" r="32"/><circle cx="26" cy="58" r="20"/><circle cx="74" cy="58" r="20"/></g><g fill="#ef4444"><circle cx="38" cy="34" r="4"/><circle cx="62" cy="48" r="4"/><circle cx="48" cy="60" r="4"/></g>') },
    { id: 'bush', w: 0.12, art: svg('0 0 100 64', '<path d="M6 62 C0 40 14 26 28 30 C30 10 56 4 66 22 C82 14 98 30 92 46 C100 52 98 62 94 62 Z" fill="#4ade80" stroke="#166534" stroke-width="5" stroke-linejoin="round"/><circle cx="34" cy="40" r="4" fill="#ef4444"/><circle cx="60" cy="30" r="4" fill="#ef4444"/><circle cx="74" cy="46" r="4" fill="#ef4444"/>') },
    { id: 'fern', w: 0.08, art: svg('0 0 80 90', '<g stroke="#2e7d32" stroke-width="4" fill="#66bb6a" stroke-linejoin="round">' +
      '<path d="M40 88 C38 60 30 30 10 10 C30 26 40 50 40 88 Z"/><path d="M40 88 C42 60 50 30 70 10 C50 26 40 50 40 88 Z"/><path d="M40 88 C40 56 40 30 40 2 C44 30 44 56 40 88 Z"/></g>') },
    { id: 'rock', w: 0.09, art: svg('0 0 100 60', ROCK) },
    { id: 'boulders', w: 0.17, art: svg('0 0 170 90', '<g transform="translate(0 30)">' + ROCK + '</g><g transform="translate(70 30)">' + ROCK + '</g><g transform="translate(36 0) scale(.95)">' + ROCK + '</g>') },
    { id: 'log', w: 0.12, art: svg('0 0 100 60', '<rect x="4" y="6" width="80" height="48" rx="10" fill="#a16207" stroke="#5b3a0b" stroke-width="5"/><path d="M14 22 H60 M22 38 H72" stroke="#5b3a0b" stroke-width="4" stroke-linecap="round"/><ellipse cx="84" cy="30" rx="13" ry="24" fill="#e7c08a" stroke="#5b3a0b" stroke-width="5"/>') },
    { id: 'pond', w: 0.26, art: svg('0 0 200 70', '<ellipse cx="100" cy="42" rx="96" ry="26" fill="#4fc3f7" stroke="#0277bd" stroke-width="5"/><ellipse cx="80" cy="38" rx="40" ry="7" fill="#b3e5fc"/>' +
      '<g stroke="#558b2f" stroke-width="4" stroke-linecap="round"><path d="M14 40 V6 M22 42 V14 M184 40 V10 M176 42 V18"/></g><g fill="#8d6e63"><ellipse cx="14" cy="8" rx="4" ry="9"/><ellipse cx="184" cy="12" rx="4" ry="9"/></g>') },
    { id: 'nest', w: 0.1, art: A.nest() },
    { id: 'egg', w: 0.045, art: A.egg(A.EGG_COLORS[1]) },
    { id: 'bone', w: 0.08, art: svg('0 0 100 50', '<g fill="#fff6e0" stroke="#8b7048" stroke-width="4"><circle cx="16" cy="16" r="12"/><circle cx="16" cy="34" r="12"/><circle cx="84" cy="16" r="12"/><circle cx="84" cy="34" r="12"/><rect x="16" y="17" width="68" height="16" rx="6"/></g><rect x="14" y="19" width="72" height="12" fill="#fff6e0"/>') },
    { id: 'flower', w: 0.04, art: svg('0 0 40 70', '<path d="M20 68 V30" stroke="#2e7d32" stroke-width="4"/><path d="M20 52 C10 48 6 40 8 36 C16 38 20 46 20 52 Z" fill="#66bb6a"/>' +
      (function () { var p = ''; for (var i = 0; i < 6; i++) p += '<ellipse cx="20" cy="10" rx="6" ry="10" fill="#f48fb1" stroke="#c2185b" stroke-width="2" transform="rotate(' + i * 60 + ' 20 20)"/>'; return p; })() + '<circle cx="20" cy="20" r="6" fill="#ffd54f" stroke="#f57f17" stroke-width="2"/>') },
    { id: 'mushroom', w: 0.05, art: svg('0 0 60 60', '<rect x="22" y="30" width="16" height="28" rx="6" fill="#fff3e0" stroke="#8d6e63" stroke-width="3"/><path d="M4 34 C4 10 56 10 56 34 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="3"/><g fill="#fff"><circle cx="20" cy="22" r="5"/><circle cx="38" cy="18" r="4"/><circle cx="44" cy="28" r="3"/></g>') },
    { id: 'cloud', w: 0.18, art: svg('0 0 140 60', '<g fill="#fff" stroke="#cfd8dc" stroke-width="3"><path d="M20 56 C2 56 2 30 22 30 C24 12 50 6 62 20 C72 4 104 6 108 28 C134 26 138 56 118 56 Z"/></g>') },
    { id: 'sun', w: 0.1, art: svg('0 0 100 100', '<g stroke="#f6b93b" stroke-width="6" stroke-linecap="round">' + (function () { var s = ''; for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; s += '<path d="M' + (50 + Math.cos(a) * 36) + ' ' + (50 + Math.sin(a) * 36) + ' L' + (50 + Math.cos(a) * 46) + ' ' + (50 + Math.sin(a) * 46) + '"/>'; } return s; })() + '</g><circle cx="50" cy="50" r="28" fill="#ffe14d" stroke="#f6b93b" stroke-width="4"/>') },
    { id: 'moon', w: 0.08, art: svg('0 0 80 80', '<path d="M52 6 C28 8 12 26 12 42 C12 60 28 76 50 74 C34 66 26 54 26 40 C26 24 36 12 52 6 Z" fill="#fff8d6" stroke="#e0c97a" stroke-width="3"/>') },
    { id: 'feet', w: 0.05, art: A.footprint('#8d6e63') }
  ];
  var BYID = {};
  ITEMS.forEach(function (it) { BYID[it.id] = it; });

  var NAMES = {
    el: { volcano: 'Ηφαίστειο', cave: 'Σπηλιά', palm: 'Φοίνικας', tree: 'Δέντρο', bush: 'Θάμνος', fern: 'Φτέρη', rock: 'Πέτρα', boulders: 'Βράχια', log: 'Κορμός',
          pond: 'Λιμνούλα', nest: 'Φωλιά', egg: 'Αυγό', bone: 'Κόκαλο', flower: 'Λουλούδι', mushroom: 'Μανιτάρι', cloud: 'Σύννεφο', sun: 'Ήλιος', moon: 'Φεγγάρι', feet: 'Πατημασιές',
          inst: 'Διάλεξε τοπίο αριστερά και σύρε δεινόσαυρους και άλλα πράγματα από δεξιά στη σκηνή σου!',
          size: 'Μέγεθος', flip: 'Γύρισμα', del: 'Σβήσιμο', clear: 'Καθάρισμα', save: 'Αποθήκευση', bgs: 'Τοπία', items: 'Πράγματα',
          editing: 'Αλλάζεις αυτό στη σκηνή', before: 'Πριν το σύρεις', clearAsk: 'Να σβηστούν όλα από τη σκηνή;', saved: 'Η εικόνα αποθηκεύτηκε!',
          dragOut: 'Σύρε έξω από τη σκηνή για να το σβήσεις', big: 'Αυτό το παιχνίδι είναι για υπολογιστή με μεγάλη οθόνη και ποντίκι.' },
    en: { volcano: 'Volcano', cave: 'Cave', palm: 'Palm tree', tree: 'Tree', bush: 'Bush', fern: 'Fern', rock: 'Rock', boulders: 'Boulders', log: 'Log',
          pond: 'Pond', nest: 'Nest', egg: 'Egg', bone: 'Bone', flower: 'Flower', mushroom: 'Mushroom', cloud: 'Cloud', sun: 'Sun', moon: 'Moon', feet: 'Footprints',
          inst: 'Pick a landscape on the left and drag dinosaurs and other things from the right into your scene!',
          size: 'Size', flip: 'Flip', del: 'Remove', clear: 'Clear', save: 'Save picture', bgs: 'Landscapes', items: 'Things',
          editing: 'Changing this one in the scene', before: 'Before you drag it', clearAsk: 'Remove everything from the scene?', saved: 'Picture saved!',
          dragOut: 'Drag it out of the scene to remove it', big: 'This game is made for a computer with a big screen and a mouse.' }
  };

  A.TILES.scene = '<svg xmlns="' + XMLNS + '" viewBox="0 0 120 100"><rect x="6" y="8" width="108" height="78" rx="10" fill="#c7ecff" stroke="#fff" stroke-width="4"/>' +
    '<rect x="8" y="62" width="104" height="22" fill="#7cc65a"/>' +
    '<svg x="62" y="18" width="46" height="35" viewBox="0 0 160 120">' + strip(BYID.volcano.art) + '</svg>' +
    '<svg x="14" y="40" width="40" height="36" viewBox="0 0 200 180">' + A.dinoInner('bronto') + '</svg>' +
    '<path d="M70 92 L96 70" stroke="#ffb300" stroke-width="5" stroke-linecap="round"/><path d="M92 66 L104 62 L100 74 Z" fill="#ffb300"/>' +
    '<rect x="96" y="56" width="18" height="18" rx="4" fill="#fff" stroke="#1565c0" stroke-width="2.5" stroke-dasharray="4 3"/></svg>';

  var SAVE_KEY = 'dinoScene.v1';

  D.games.scene = {
    id: 'scene', color: '#ffb300', dark: '#b36b00', free: true, desktopOnly: true,

    start: function (ctx) {
      var L = NAMES[D.i18n.lang] || NAMES.en;
      var stage = ctx.stage, A2 = ctx.art;
      var state = load();
      var palette = {}; // per palette item: { s: scale, flip }
      var current = 'trex', selected = null; // selected = a placed item (object in state.items)
      var nextId = state.items.reduce(function (m, it) { return Math.max(m, it.uid || 0); }, 0) + 1;

      if (!D.bigScreen()) {
        stage.innerHTML = '<div class="scene-small">' + A.dino('trex') + '<p>' + L.big + '</p></div>';
        ctx.instructText(L.big);
        return;
      }

      var root = ctx.h('<div class="scene-wrap">' +
        '<aside class="scene-bgs"><h3>' + L.bgs + '</h3><div class="bg-list"></div></aside>' +
        '<main class="scene-main"><div class="scene-board"><div class="scene-bg"></div><div class="scene-items"></div></div>' +
        '<div class="scene-hint">' + L.dragOut + '</div></main>' +
        '<aside class="scene-side">' +
        '<div class="scene-tools"><div class="tool-preview"><div class="tp-art"></div><div class="tp-label"></div></div>' +
        '<label class="tool-row"><span>' + L.size + '</span><button class="tbtn minus">−</button><input type="range" class="size-range" min="30" max="300" step="5"><button class="tbtn plus">+</button></label>' +
        '<div class="tool-row"><button class="tbtn wide flip-btn">⇆ ' + L.flip + '</button><button class="tbtn wide del-btn">🗑 ' + L.del + '</button></div>' +
        '<div class="tool-row"><button class="tbtn wide clear-btn">✖ ' + L.clear + '</button><button class="tbtn wide save-btn">📷 ' + L.save + '</button></div></div>' +
        '<h3>' + L.items + '</h3><div class="item-grid"></div></aside></div>');
      stage.appendChild(root);
      var board = root.querySelector('.scene-board'), bgEl = root.querySelector('.scene-bg'), layer = root.querySelector('.scene-items');
      var range = root.querySelector('.size-range'), tpArt = root.querySelector('.tp-art'), tpLabel = root.querySelector('.tp-label');

      /* ---- backgrounds ---- */
      BG_LIST.forEach(function (k) {
        var b = ctx.h('<button class="bg-thumb' + (k === state.bg ? ' on' : '') + '">' + BGS[k] + '</button>');
        ctx.on(b, 'click', function () {
          state.bg = k; save(); drawBg(); ctx.sfx.pop();
          root.querySelectorAll('.bg-thumb').forEach(function (x) { x.classList.toggle('on', x === b); });
        });
        root.querySelector('.bg-list').appendChild(b);
      });
      function drawBg() { bgEl.innerHTML = BGS[state.bg] || BGS.jungle; }

      /* ---- palette ---- */
      ITEMS.forEach(function (it) {
        palette[it.id] = { s: 1, flip: false };
        var b = ctx.h('<button class="item-tile' + (it.id === current ? ' on' : '') + '" data-id="' + it.id + '" title="' + nameOf(it.id) + '">' + it.art + '</button>');
        ctx.on(b, 'pointerdown', function (e) { startPaletteDrag(e, it.id, b); });
        root.querySelector('.item-grid').appendChild(b);
      });
      function nameOf(id) { return L[id] || D.i18n.dino(id) || id; }

      /* ---- the controls work on the selected placed item, or else on the palette item ---- */
      function target() { return selected || palette[current]; }
      function refreshTools() {
        var id = selected ? selected.id : current, t = target();
        tpArt.innerHTML = BYID[id].art;
        tpArt.style.transform = t.flip ? 'scaleX(-1)' : '';
        tpLabel.textContent = nameOf(id) + ' · ' + (selected ? L.editing : L.before);
        root.querySelector('.scene-tools').classList.toggle('editing', !!selected);
        range.value = Math.round(t.s * 100);
        root.querySelector('.del-btn').disabled = !selected;
        root.querySelectorAll('.item-tile').forEach(function (x) { x.classList.toggle('on', !selected && x.getAttribute('data-id') === current); });
      }
      function setScale(v) {
        var t = target();
        t.s = Math.max(0.3, Math.min(3, v));
        if (selected) { render(selected); save(); }
        refreshTools();
      }
      ctx.on(range, 'input', function () { setScale(range.value / 100); });
      ctx.on(root.querySelector('.minus'), 'click', function () { setScale(target().s - 0.15); ctx.sfx.tap(); });
      ctx.on(root.querySelector('.plus'), 'click', function () { setScale(target().s + 0.15); ctx.sfx.tap(); });
      ctx.on(root.querySelector('.flip-btn'), 'click', function () {
        var t = target(); t.flip = !t.flip; ctx.sfx.flip();
        if (selected) { render(selected); save(); }
        refreshTools();
      });
      ctx.on(root.querySelector('.del-btn'), 'click', function () { if (selected) remove(selected); });
      ctx.on(root.querySelector('.clear-btn'), 'click', function () {
        if (!state.items.length || !window.confirm(L.clearAsk)) return;
        state.items = []; selected = null; layer.innerHTML = ''; save(); refreshTools(); ctx.sfx.whoosh();
      });
      ctx.on(root.querySelector('.save-btn'), 'click', savePicture);
      ctx.on(window, 'keydown', function (e) {
        if (!selected) return;
        if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(selected); }
        else if (e.key === '+' || e.key === '=') setScale(selected.s + 0.1);
        else if (e.key === '-') setScale(selected.s - 0.1);
        else if (e.key === 'f' || e.key === 'F') root.querySelector('.flip-btn').click();
      });

      /* ---- placed items ---- */
      function render(it) {
        var el = it._el;
        if (!el) {
          el = it._el = ctx.h('<div class="placed">' + BYID[it.id].art + '</div>');
          el._item = it;
          layer.appendChild(el);
          ctx.on(el, 'pointerdown', function (e) { startMove(e, it); });
        }
        el.style.left = it.x * 100 + '%';
        el.style.top = it.y * 100 + '%';
        el.style.width = BYID[it.id].w * it.s * 100 + '%';
        el.style.zIndex = it.z;
        el.firstChild.style.transform = it.flip ? 'scaleX(-1)' : '';
        el.classList.toggle('sel', it === selected);
      }
      function select(it) {
        selected = it;
        state.items.forEach(function (x) { if (x._el) x._el.classList.toggle('sel', x === it); });
        refreshTools();
      }
      function bringFront(it) { it.z = 1 + state.items.reduce(function (m, x) { return Math.max(m, x.z || 0); }, 0); render(it); }
      function remove(it) {
        state.items = state.items.filter(function (x) { return x !== it; });
        if (it._el) it._el.remove();
        if (selected === it) selected = null;
        save(); refreshTools(); ctx.sfx.whoosh();
      }
      function boardPoint(e) {
        var r = board.getBoundingClientRect();
        return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom };
      }

      /* drag a new item from the palette (a plain click just selects it for size/flip) */
      function startPaletteDrag(e, id, tile) {
        e.preventDefault();
        var sx = e.clientX, sy = e.clientY, ghost = null, cfg;
        function move(ev) {
          if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
          if (!ghost) {
            if (current !== id) { current = id; }
            selected = null; select(null);
            cfg = palette[id];
            var w = board.getBoundingClientRect().width * BYID[id].w * cfg.s;
            ghost = ctx.h('<div class="scene-ghost">' + BYID[id].art + '</div>');
            ghost.style.width = w + 'px';
            ghost.firstChild.style.transform = cfg.flip ? 'scaleX(-1)' : '';
            document.body.appendChild(ghost);
            ctx.sfx.tap();
          }
          ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px';
          board.classList.toggle('drop-ok', boardPoint(ev).inside);
        }
        function up(ev) {
          window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
          board.classList.remove('drop-ok');
          if (!ghost) { // click: choose this item for the size / flip controls
            current = id; select(null); ctx.sfx.tap();
            ctx.say(nameOf(id), { noCaption: true });
            return;
          }
          ghost.remove();
          var p = boardPoint(ev);
          if (!p.inside) return;
          var it = { uid: nextId++, id: id, x: p.x, y: p.y, s: cfg.s, flip: cfg.flip, z: 0 };
          state.items.push(it);
          bringFront(it);
          select(it);
          it._el.classList.add('pop');
          ctx.sfx.place();
          if (/^(trex|bronto|trice|stego|ankylo|ptero)$/.test(id)) ctx.sfx.voice(id);
          save();
        }
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      }

      /* move a placed item; dropping it outside the scene removes it */
      function startMove(e, it) {
        e.preventDefault(); e.stopPropagation();
        select(it); bringFront(it);
        var p0 = boardPoint(e), ox = it.x - p0.x, oy = it.y - p0.y, moved = false;
        function move(ev) {
          var p = boardPoint(ev);
          it.x = p.x + ox; it.y = p.y + oy; moved = true;
          render(it);
          it._el.classList.toggle('leaving', !p.inside);
        }
        function up(ev) {
          window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
          if (moved && !boardPoint(ev).inside) { remove(it); return; }
          if (it._el) it._el.classList.remove('leaving');
          save();
        }
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      }
      ctx.on(board, 'pointerdown', function (e) { if (e.target === board || e.target.closest('.scene-bg')) select(null); });

      /* ---- save / load (this browser only) ---- */
      function load() {
        try {
          var d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
          if (d && d.items) return { bg: BGS[d.bg] ? d.bg : 'jungle', items: d.items.filter(function (x) { return BYID[x.id]; }) };
        } catch (e) { /* ignore */ }
        return { bg: 'jungle', items: [] };
      }
      var saveT = null;
      function save() {
        clearTimeout(saveT);
        saveT = setTimeout(function () {
          try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({ bg: state.bg, items: state.items.map(function (x) {
              return { uid: x.uid, id: x.id, x: +x.x.toFixed(4), y: +x.y.toFixed(4), s: +x.s.toFixed(3), flip: !!x.flip, z: x.z };
            }) }));
          } catch (e) { /* ignore */ }
        }, 200);
      }

      /* ---- 📷 download the scene as a PNG picture ---- */
      function savePicture() {
        var W = 1600, H = 1000, c = document.createElement('canvas');
        c.width = W; c.height = H;
        var g = c.getContext('2d');
        var r = board.getBoundingClientRect(), scale = W / r.width;
        function img(svgText) {
          return new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = A2.dataUri(svgText); });
        }
        var list = state.items.slice().sort(function (a, b) { return a.z - b.z; });
        Promise.all([img(BGS[state.bg])].concat(list.map(function (it) { return img(BYID[it.id].art); }))).then(function (imgs) {
          // background: "cover" like on screen
          var bg = imgs[0];
          if (bg) g.drawImage(bg, 0, 0, W, H);
          list.forEach(function (it, i) {
            var im = imgs[i + 1], el = it._el;
            if (!im || !el) return;
            var er = el.getBoundingClientRect();
            var w = er.width * scale, h = er.height * scale, cx = it.x * W, cy = it.y * H;
            g.save(); g.translate(cx, cy); if (it.flip) g.scale(-1, 1);
            g.drawImage(im, -w / 2, -h / 2, w, h); g.restore();
          });
          try {
            var a = document.createElement('a');
            a.download = 'dino-scene.png';
            a.href = c.toDataURL('image/png');
            document.body.appendChild(a); a.click(); a.remove();
            ctx.sfx.shutter(); ctx.say(L.saved);
          } catch (err) { console.warn(err); }
        });
      }

      drawBg();
      state.items.forEach(function (it) { if (!it.z) it.z = 1; render(it); });
      refreshTools();
      ctx.instructText(L.inst);
    }
  };
})(window.Dino);

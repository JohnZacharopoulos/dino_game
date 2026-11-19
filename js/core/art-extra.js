/* Dino Games – extra artwork for the newer games: foods, accessories, colours,
 * connect-the-dots outlines, the train and the home-screen tiles. */
window.Dino = window.Dino || {};
(function (D) {
  'use strict';
  var A = D.art;

  /* ---------- named colours (used by feeding, colouring, dress-up) ---------- */
  var COLORS = {
    red: '#ef4444', yellow: '#facc15', green: '#4ade80', blue: '#3b82f6',
    orange: '#fb923c', purple: '#a855f7', pink: '#f9a8d4', brown: '#a16207'
  };

  /* A full dino palette from one hue (for dress-up colours and "odd one out"). */
  function hue(h) {
    return {
      b: 'hsl(' + h + ',72%,62%)', d: 'hsl(' + h + ',60%,24%)', l: 'hsl(' + h + ',85%,86%)',
      a: 'hsl(' + ((h + 35) % 360) + ',75%,55%)'
    };
  }

  /* ---------- food (viewBox 0 0 100 100) ---------- */
  function svg(body, vb) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (vb || '0 0 100 100') + '">' + body + '</svg>'; }
  var FOODS = {
    red: svg('<path d="M50 30 C30 18 10 30 14 56 C18 80 36 94 50 86 C64 94 82 80 86 56 C90 30 70 18 50 30 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="4"/>' +
      '<path d="M50 30 C50 22 52 14 58 8" stroke="#6b3f1d" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M54 20 C64 8 80 12 82 16 C72 26 60 24 54 20 Z" fill="#4ade80" stroke="#166534" stroke-width="3"/>' +
      '<ellipse cx="32" cy="46" rx="6" ry="10" fill="#fff" opacity=".5"/>'),
    yellow: svg('<path d="M20 22 C10 50 24 84 64 88 C80 89 90 82 88 76 C60 78 36 60 32 24 C30 16 22 14 20 22 Z" fill="#facc15" stroke="#854d0e" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M22 20 L18 10" stroke="#6b3f1d" stroke-width="6" stroke-linecap="round"/>'),
    green: svg('<path d="M14 86 C10 46 40 12 88 12 C88 60 58 92 14 86 Z" fill="#4ade80" stroke="#166534" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M14 86 C34 64 54 44 80 20 M40 62 L36 44 M56 46 L70 46" stroke="#166534" stroke-width="3.5" fill="none" stroke-linecap="round"/>'),
    purple: svg('<path d="M50 18 L50 6" stroke="#6b3f1d" stroke-width="5" stroke-linecap="round"/>' +
      '<g fill="#a855f7" stroke="#581c87" stroke-width="3">' +
      '<circle cx="34" cy="28" r="12"/><circle cx="58" cy="28" r="12"/><circle cx="74" cy="34" r="10"/>' +
      '<circle cx="24" cy="46" r="11"/><circle cx="46" cy="48" r="12"/><circle cx="68" cy="52" r="11"/>' +
      '<circle cx="34" cy="66" r="11"/><circle cx="56" cy="70" r="11"/><circle cx="46" cy="86" r="10"/></g>'),
    orange: svg('<path d="M40 30 C30 10 26 8 22 10 M50 28 C50 8 54 4 58 6 M58 32 C70 14 76 14 80 18" stroke="#16a34a" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M32 30 C44 22 66 24 70 36 L44 94 C40 98 36 96 36 90 Z" fill="#fb923c" stroke="#9a3412" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M44 46 L56 48 M40 62 L50 64 M40 78 L46 79" stroke="#9a3412" stroke-width="3" stroke-linecap="round"/>'),
    blue: svg('<g stroke="#1e3a8a" stroke-width="4" fill="#3b82f6">' +
      '<circle cx="34" cy="62" r="20"/><circle cx="66" cy="62" r="20"/><circle cx="50" cy="34" r="20"/></g>' +
      '<g stroke="#1e3a8a" stroke-width="3" stroke-linecap="round"><path d="M45 30 L55 38 M55 30 L45 38"/><path d="M29 58 L39 66 M39 58 L29 66"/><path d="M61 58 L71 66 M71 58 L61 66"/></g>')
  };

  /* ---------- dress-up accessories (drawn on top of a dino, viewBox 0 0 200 180) ---------- */
  var ANCHOR = { // head top, eye (x, y, r), neck, scale
    bronto: { hx: 158, hy: 18, ex: 164, ey: 28, er: 7, nx: 146, ny: 68, s: 1 },
    trex:   { hx: 140, hy: 13, ex: 150, ey: 32, er: 8, nx: 116, ny: 74, s: 1.15 },
    trice:  { hx: 146, hy: 48, ex: 160, ey: 100, er: 7, nx: 128, ny: 120, s: 1 },
    stego:  { hx: 166, hy: 110, ex: 174, ey: 118, er: 6, nx: 150, ny: 122, s: 0.8 },
    ptero:  { hx: 104, hy: 40, ex: 108, ey: 56, er: 7, nx: 100, ny: 82, s: 0.95 },
    ankylo: { hx: 170, hy: 104, ex: 176, ey: 112, er: 6, nx: 152, ny: 118, s: 0.8 }
  };
  var ACC = {
    hat: function (a) {
      return '<g transform="translate(' + a.hx + ' ' + (a.hy + 3) + ') scale(' + a.s + ') rotate(12)">' +
        '<path d="M-15 0 L0 -40 L15 0 Z" fill="#ff6b9a" stroke="#333" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M-9 -16 L9 -16 M-12 -6 L12 -6" stroke="#ffe066" stroke-width="4"/>' +
        '<circle cy="-41" r="6" fill="#ffd93d" stroke="#333" stroke-width="2.5"/></g>';
    },
    crown: function (a) {
      return '<g transform="translate(' + a.hx + ' ' + (a.hy + 4) + ') scale(' + a.s + ') rotate(-6)">' +
        '<path d="M-18 0 L-18 -20 L-9 -10 L0 -26 L9 -10 L18 -20 L18 0 Z" fill="#ffd93d" stroke="#a16207" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="0" cy="-6" r="3.5" fill="#ef4444"/><circle cx="-10" cy="-5" r="2.5" fill="#3b82f6"/><circle cx="10" cy="-5" r="2.5" fill="#22c55e"/></g>';
    },
    glasses: function (a) {
      var r = a.er * 1.75;
      return '<g stroke="#111" stroke-width="3" stroke-linecap="round">' +
        '<path d="M' + (a.ex - r) + ' ' + a.ey + ' L' + (a.ex - r * 2.6) + ' ' + (a.ey - 3) + '" fill="none"/>' +
        '<rect x="' + (a.ex - r) + '" y="' + (a.ey - r * 0.8) + '" width="' + (r * 2) + '" height="' + (r * 1.6) + '" rx="' + (r * 0.6) + '" fill="#111" opacity=".9"/>' +
        '<path d="M' + (a.ex - r * 0.5) + ' ' + (a.ey - r * 0.35) + ' L' + (a.ex) + ' ' + (a.ey - r * 0.35) + '" stroke="#fff" stroke-width="2" opacity=".8"/></g>';
    },
    bow: function (a) {
      return '<g transform="translate(' + a.nx + ' ' + a.ny + ') scale(' + a.s + ')">' +
        '<path d="M0 0 L-16 -10 L-16 10 Z M0 0 L16 -10 L16 10 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle r="5" fill="#ef4444" stroke="#7f1d1d" stroke-width="3"/>' +
        '<circle cx="-9" cy="-1" r="2" fill="#fff"/><circle cx="9" cy="2" r="2" fill="#fff"/></g>';
    },
    flower: function (a) {
      var p = '';
      for (var i = 0; i < 6; i++) p += '<ellipse rx="5" ry="9" cy="-8" fill="#f9a8d4" stroke="#be185d" stroke-width="2" transform="rotate(' + (i * 60) + ')"/>';
      return '<g transform="translate(' + (a.hx - 14 * a.s) + ' ' + (a.hy + 2) + ') scale(' + a.s + ')">' + p + '<circle r="5" fill="#facc15" stroke="#a16207" stroke-width="2"/></g>';
    }
  };
  var ACC_LIST = ['hat', 'crown', 'glasses', 'bow', 'flower'];

  /* Full dino with recolour + accessories. */
  function dressed(type, colors, acc) {
    var a = ANCHOR[type], extra = '';
    (acc || []).forEach(function (k) { if (ACC[k]) extra += ACC[k](a); });
    return '<svg class="dino-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180" style="overflow:visible">' +
      A.dinoInner(type, colors) + extra + '</svg>';
  }
  /* Small picture of one accessory for its button. */
  function accIcon(k) {
    var a = { hx: 50, hy: 72, ex: 62, ey: 50, er: 12, nx: 50, ny: 50, s: 1.5 };
    if (k === 'glasses') a = { ex: 66, ey: 50, er: 10 };
    if (k === 'flower') a = { hx: 84, hy: 50, s: 2.4 };
    if (k === 'bow') a.s = 2.2;
    return svg(ACC[k](a));
  }

  /* ---------- connect the dots: 12 outline points per dino (clockwise) ---------- */
  var OUTLINE = {
    bronto: [[4, 146], [40, 108], [96, 76], [140, 34], [150, 16], [186, 30], [176, 50], [156, 100], [150, 170], [76, 172], [60, 140], [30, 138]],
    trex:   [[4, 162], [50, 108], [72, 70], [100, 28], [158, 12], [192, 40], [186, 68], [132, 74], [138, 108], [114, 166], [62, 168], [64, 138]],
    trice:  [[2, 134], [40, 90], [100, 78], [120, 50], [158, 44], [180, 52], [196, 108], [172, 128], [140, 170], [60, 170], [40, 150], [30, 130]],
    stego:  [[2, 78], [44, 96], [80, 46], [110, 40], [138, 54], [152, 104], [182, 108], [192, 128], [152, 170], [58, 170], [40, 128], [14, 112]],
    ptero:  [[4, 48], [56, 28], [92, 40], [116, 40], [166, 66], [196, 48], [170, 114], [118, 150], [100, 140], [82, 150], [30, 114], [20, 74]],
    ankylo: [[2, 113], [36, 100], [62, 72], [100, 64], [140, 72], [168, 102], [194, 118], [172, 134], [154, 162], [50, 160], [32, 132], [16, 126]]
  };
  function outline(type, n) {
    var pts = OUTLINE[type], out = [];
    for (var i = 0; i < n; i++) out.push(pts[Math.round(i * pts.length / n) % pts.length]);
    return out;
  }

  /* ---------- train for the pattern game ---------- */
  var ENGINE = svg('<rect x="10" y="40" width="80" height="44" rx="8" fill="#ef4444" stroke="#7f1d1d" stroke-width="4"/>' +
    '<rect x="44" y="12" width="40" height="36" rx="6" fill="#f87171" stroke="#7f1d1d" stroke-width="4"/>' +
    '<rect x="52" y="20" width="24" height="18" rx="4" fill="#bfe9ff" stroke="#7f1d1d" stroke-width="3"/>' +
    '<rect x="16" y="20" width="14" height="22" fill="#374151" stroke="#111" stroke-width="3"/>' +
    '<circle cx="23" cy="12" r="7" fill="#e5e7eb"/><circle cx="14" cy="4" r="5" fill="#e5e7eb"/>' +
    '<circle cx="30" cy="86" r="11" fill="#374151" stroke="#111" stroke-width="3"/><circle cx="70" cy="86" r="11" fill="#374151" stroke="#111" stroke-width="3"/>' +
    '<circle cx="30" cy="86" r="4" fill="#facc15"/><circle cx="70" cy="86" r="4" fill="#facc15"/>', '0 -4 100 104');

  /* ---------- home-screen tiles ---------- */
  function mini(type, x, y, w, mode) {
    return '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + (w * 0.9) + '" viewBox="0 0 200 180" style="overflow:visible">' + A.dinoInner(type, mode) + '</svg>';
  }
  function board(body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><rect x="4" y="6" width="112" height="88" rx="16" fill="#fff" opacity=".92"/>' + body + '</svg>';
  }
  var T = A.TILES;
  T.shadow = board(mini('trice', 6, 26, 56, 'shadow') + mini('trice', 60, 30, 52));
  T.odd = board(mini('trex', 4, 34, 36) + mini('trex', 42, 34, 36) + mini('stego', 80, 36, 36) +
    '<circle cx="98" cy="54" r="22" fill="none" stroke="#ef4444" stroke-width="4" stroke-dasharray="6 4"/>');
  T.size = board(mini('bronto', 4, 14, 74) + mini('bronto', 78, 54, 34));
  T.pattern = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">' +
    '<svg x="0" y="34" width="34" height="36" viewBox="0 -4 100 104">' + ENGINE.replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg>' +
    [0, 1, 2].map(function (i) {
      var x = 34 + i * 28;
      return '<rect x="' + x + '" y="44" width="25" height="22" rx="4" fill="#fff" stroke="#5e3fa3" stroke-width="3"/>' +
        '<circle cx="' + (x + 7) + '" cy="68" r="4" fill="#374151"/><circle cx="' + (x + 18) + '" cy="68" r="4" fill="#374151"/>' +
        (i < 2 ? '<circle cx="' + (x + 12.5) + '" cy="55" r="7" fill="' + (i ? '#3b82f6' : '#ef4444') + '"/>' :
          '<text x="' + (x + 12.5) + '" y="62" font-size="20" font-weight="bold" text-anchor="middle" fill="#5e3fa3" font-family="sans-serif">?</text>');
    }).join('') + '</svg>';
  T.feed = board(mini('trex', 4, 14, 76) + '<svg x="74" y="44" width="40" height="40" viewBox="0 0 100 100">' + FOODS.red.replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg>');
  T.dots = board('<path d="M22 70 L40 30 L70 22 L96 46 L84 78 Z" fill="none" stroke="#7b3289" stroke-width="3" stroke-dasharray="5 4"/>' +
    [[22, 70, 1], [40, 30, 2], [70, 22, 3], [96, 46, 4], [84, 78, 5]].map(function (p) {
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="#ba68c8" stroke="#fff" stroke-width="2"/><text x="' + p[0] + '" y="' + (p[1] + 4.5) + '" font-size="12" font-weight="bold" text-anchor="middle" fill="#fff" font-family="sans-serif">' + p[2] + '</text>';
    }).join(''));
  T.color = board(mini('stego', 4, 22, 70, 'paint') +
    '<g transform="translate(88 50) rotate(30)"><rect x="-5" y="-30" width="10" height="34" rx="3" fill="#a16207"/><rect x="-6" y="2" width="12" height="8" fill="#9ca3af"/><path d="M-6 10 Q0 30 6 10 Z" fill="#ef4444"/></g>' +
    '<circle cx="20" cy="82" r="6" fill="#facc15"/><circle cx="36" cy="84" r="6" fill="#3b82f6"/><circle cx="52" cy="84" r="6" fill="#4ade80"/>');
  T.build = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><svg x="10" y="18" width="100" height="90" viewBox="0 0 200 180" style="overflow:visible">' +
    dressed('trex', hue(200), ['hat', 'glasses']).replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg></svg>';
  T.sounds = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">' + mini('ptero', 14, 18, 84) +
    '<g fill="#fff" stroke="#a82a5a" stroke-width="2"><path d="M8 40 V18 L22 15 V36"/><circle cx="5" cy="40" r="4"/><circle cx="19" cy="36" r="4"/>' +
    '<path d="M104 30 V12"/><circle cx="101" cy="30" r="4"/><path d="M104 12 Q110 14 112 20" fill="none"/></g></svg>';

  A.COLORS = COLORS;
  A.hue = hue;
  A.FOODS = FOODS;
  A.ACC_LIST = ACC_LIST;
  A.dressed = dressed;
  A.accIcon = accIcon;
  A.outline = outline;
  A.ENGINE = ENGINE;
})(window.Dino);

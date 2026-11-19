/* Dino Games – all artwork as inline SVG (no image files needed). */
window.Dino = window.Dino || {};
(function (D) {
  'use strict';

  var COMMON = { w: '#ffffff', p: '#1f2421', k: '#ff9eb5' };

  var PAL = {
    bronto: { b: '#7ed957', d: '#2f6b1f', l: '#d4f5b0', a: '#58b336', h: '#fff6dc' },
    trex:   { b: '#ff9f43', d: '#94450c', l: '#ffe0b8', a: '#e07b22', h: '#ffffff' },
    trice:  { b: '#5dade2', d: '#1b4f72', l: '#c6e6fa', a: '#f8c471', h: '#fffaf0' },
    stego:  { b: '#f9d94a', d: '#86680a', l: '#fff3b8', a: '#ef6c3e', h: '#fffaf0' },
    ptero:  { b: '#b388eb', d: '#4a2a7a', l: '#e9dcfc', a: '#ff7aa8', h: '#ffc93c' },
    ankylo: { b: '#3fc8a8', d: '#0e5e4e', l: '#b8f0e2', a: '#23967b', h: '#fff6dc' }
  };

  var FOSSIL = { b: '#f3e9d0', d: '#8b7048', l: '#e7d8b4', a: '#dcc8a0', h: '#f7efdc',
                 w: '#e7d8b4', p: '#8b7048', k: 'none', fossil: true };

  function pal(type, mode) {
    if (mode === 'fossil') return FOSSIL;
    var c = {}, k;
    for (k in COMMON) c[k] = COMMON[k];
    for (k in PAL[type]) c[k] = PAL[type][k];
    return c;
  }

  function eye(c, x, y, r) {
    var s = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c.w + '" stroke-width="3"/>' +
      '<circle cx="' + (x + r * 0.25) + '" cy="' + (y + r * 0.1) + '" r="' + (r * 0.58) + '" fill="' + c.p + '" stroke="none"/>';
    if (!c.fossil) s += '<circle cx="' + (x + r * 0.45) + '" cy="' + (y - r * 0.22) + '" r="' + (r * 0.22) + '" fill="#fff" stroke="none"/>';
    return s;
  }
  function cheek(c, x, y) {
    if (c.k === 'none') return '';
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="6" ry="4" fill="' + c.k + '" stroke="none" opacity="0.85"/>';
  }
  function smile(d) { return '<path d="' + d + '" fill="none" stroke-width="3"/>'; }

  var BODY = {
    bronto: function (c) {
      return '' +
        '<rect x="60" y="126" width="20" height="44" rx="9" fill="' + c.a + '"/>' +
        '<rect x="118" y="126" width="20" height="44" rx="9" fill="' + c.a + '"/>' +
        '<path d="M50 108 C30 110 16 122 4 146 C26 138 44 136 64 132 Z" fill="' + c.b + '"/>' +
        '<path d="M120 96 C130 70 136 50 140 34 L166 38 C160 60 156 90 152 116 Z" fill="' + c.b + '"/>' +
        '<ellipse cx="96" cy="112" rx="56" ry="36" fill="' + c.b + '"/>' +
        '<ellipse cx="98" cy="130" rx="38" ry="12" fill="' + c.l + '" stroke="none"/>' +
        '<ellipse cx="160" cy="34" rx="27" ry="18" fill="' + c.b + '"/>' +
        '<rect x="76" y="132" width="20" height="40" rx="9" fill="' + c.b + '"/>' +
        '<rect x="132" y="130" width="20" height="42" rx="9" fill="' + c.b + '"/>' +
        '<circle cx="76" cy="96" r="7" fill="' + c.a + '" stroke="none"/>' +
        '<circle cx="98" cy="86" r="5" fill="' + c.a + '" stroke="none"/>' +
        '<circle cx="116" cy="100" r="6" fill="' + c.a + '" stroke="none"/>' +
        '<circle cx="60" cy="110" r="4" fill="' + c.a + '" stroke="none"/>' +
        eye(c, 164, 28, 7) + cheek(c, 154, 42) +
        smile('M170 42 Q177 46 184 39') +
        '<circle cx="183" cy="30" r="1.8" fill="' + c.d + '" stroke="none"/>';
    },
    trex: function (c) {
      return '' +
        '<path d="M66 98 C42 108 22 130 4 162 C36 150 62 138 86 128 Z" fill="' + c.b + '"/>' +
        '<path d="M66 126 L60 168 L84 168 L86 130 Z" fill="' + c.a + '"/>' +
        '<ellipse cx="92" cy="108" rx="38" ry="46" transform="rotate(-22 92 108)" fill="' + c.b + '"/>' +
        '<ellipse cx="106" cy="118" rx="17" ry="30" transform="rotate(-22 106 118)" fill="' + c.l + '" stroke="none"/>' +
        '<path d="M70 128 C70 110 104 108 108 130 L104 152 L114 166 L84 168 L86 150 C76 146 70 138 70 128 Z" fill="' + c.b + '"/>' +
        '<path d="M98 42 C98 18 128 10 158 12 C180 14 192 24 192 40 L192 58 C192 64 188 70 180 70 L128 70 C110 70 98 60 98 42 Z" fill="' + c.b + '"/>' +
        '<path d="M140 57 L190 57" fill="none" stroke-width="3"/>' +
        '<path d="M150 57 l4 7 l4 -7 Z M164 57 l4 7 l4 -7 Z M177 57 l4 6 l4 -6 Z" fill="' + c.h + '" stroke-width="2"/>' +
        '<path d="M118 94 C130 92 138 98 138 108 L131 109 C130 103 126 101 119 103 Z" fill="' + c.b + '" stroke-width="3"/>' +
        '<path d="M100 22 C112 14 124 12 134 14" fill="none" stroke="' + c.a + '" stroke-width="5"/>' +
        eye(c, 150, 32, 8) + cheek(c, 140, 48) +
        '<circle cx="184" cy="28" r="2" fill="' + c.d + '" stroke="none"/>';
    },
    trice: function (c) {
      return '' +
        '<path d="M34 108 C20 112 10 120 2 134 C18 134 30 132 46 128 Z" fill="' + c.b + '"/>' +
        '<rect x="46" y="124" width="20" height="44" rx="9" fill="' + c.a + '"/>' +
        '<rect x="102" y="124" width="20" height="44" rx="9" fill="' + c.a + '"/>' +
        '<ellipse cx="82" cy="112" rx="54" ry="36" fill="' + c.b + '"/>' +
        '<ellipse cx="84" cy="130" rx="34" ry="11" fill="' + c.l + '" stroke="none"/>' +
        '<path d="M116 104 C108 72 128 44 156 46 C178 48 186 70 178 96 Z" fill="' + c.a + '"/>' +
        '<circle cx="128" cy="62" r="4" fill="' + c.b + '" stroke="none"/>' +
        '<circle cx="144" cy="52" r="4" fill="' + c.b + '" stroke="none"/>' +
        '<circle cx="162" cy="54" r="4" fill="' + c.b + '" stroke="none"/>' +
        '<ellipse cx="156" cy="106" rx="30" ry="24" fill="' + c.b + '"/>' +
        '<path d="M180 96 C196 100 198 114 186 124 C182 118 180 112 178 108 Z" fill="' + c.b + '"/>' +
        '<path d="M144 86 L156 44 L160 88 Z" fill="' + c.h + '" stroke-width="3"/>' +
        '<path d="M162 88 L178 50 L176 92 Z" fill="' + c.h + '" stroke-width="3"/>' +
        '<path d="M180 94 L190 76 L188 98 Z" fill="' + c.h + '" stroke-width="3"/>' +
        '<rect x="60" y="130" width="22" height="40" rx="9" fill="' + c.b + '"/>' +
        '<rect x="118" y="128" width="22" height="42" rx="9" fill="' + c.b + '"/>' +
        eye(c, 160, 100, 7) + cheek(c, 150, 116) +
        smile('M166 118 Q173 122 180 116');
    },
    stego: function (c) {
      return '' +
        '<path d="M44 100 L52 66 L70 92 Z" fill="' + c.a + '"/>' +
        '<path d="M64 88 L80 46 L98 84 Z" fill="' + c.a + '"/>' +
        '<path d="M92 82 L110 40 L126 84 Z" fill="' + c.a + '"/>' +
        '<path d="M120 88 L138 54 L148 98 Z" fill="' + c.a + '"/>' +
        '<path d="M14 98 L2 78 L24 92 Z" fill="' + c.h + '" stroke-width="3"/>' +
        '<path d="M24 106 L16 84 L34 100 Z" fill="' + c.h + '" stroke-width="3"/>' +
        '<path d="M46 108 C28 106 16 98 6 88 C14 112 28 128 52 130 Z" fill="' + c.b + '"/>' +
        '<rect x="58" y="124" width="20" height="44" rx="9" fill="' + c.a + '"/>' +
        '<rect x="116" y="124" width="20" height="44" rx="9" fill="' + c.a + '"/>' +
        '<ellipse cx="96" cy="114" rx="58" ry="34" fill="' + c.b + '"/>' +
        '<ellipse cx="98" cy="132" rx="36" ry="10" fill="' + c.l + '" stroke="none"/>' +
        '<path d="M140 108 C152 104 160 108 166 112 L160 136 C152 134 146 130 140 126 Z" fill="' + c.b + '" stroke="none"/>' +
        '<ellipse cx="170" cy="124" rx="22" ry="16" fill="' + c.b + '"/>' +
        '<rect x="72" y="130" width="22" height="40" rx="9" fill="' + c.b + '"/>' +
        '<rect x="130" y="128" width="22" height="42" rx="9" fill="' + c.b + '"/>' +
        eye(c, 174, 118, 6) + cheek(c, 166, 132) +
        smile('M178 132 Q184 135 190 129');
    },
    ptero: function (c) {
      return '' +
        '<path d="M92 84 C70 58 36 44 4 48 C20 68 26 96 30 114 C50 104 74 104 94 114 Z" fill="' + c.l + '"/>' +
        '<path d="M108 84 C130 58 164 44 196 48 C180 68 174 96 170 114 C150 104 126 104 106 114 Z" fill="' + c.l + '"/>' +
        '<path d="M30 114 C40 90 60 76 92 84" fill="none" stroke-width="3"/>' +
        '<path d="M170 114 C160 90 140 76 108 84" fill="none" stroke-width="3"/>' +
        '<path d="M88 132 L82 150 M112 132 L118 150" fill="none" stroke-width="5"/>' +
        '<ellipse cx="100" cy="106" rx="20" ry="32" fill="' + c.b + '"/>' +
        '<ellipse cx="100" cy="114" rx="11" ry="20" fill="' + c.l + '" stroke="none"/>' +
        '<path d="M94 54 L56 28 L100 44 Z" fill="' + c.a + '"/>' +
        '<path d="M116 54 L166 66 L116 74 Z" fill="' + c.h + '"/>' +
        '<circle cx="104" cy="60" r="21" fill="' + c.b + '"/>' +
        eye(c, 108, 56, 7) + cheek(c, 100, 70);
    },
    ankylo: function (c) {
      return '' +
        '<path d="M46 116 C30 116 24 112 20 106 L18 120 C28 128 40 130 52 130 Z" fill="' + c.b + '"/>' +
        '<ellipse cx="16" cy="113" rx="14" ry="12" fill="' + c.a + '"/>' +
        '<rect x="50" y="122" width="20" height="38" rx="9" fill="' + c.a + '"/>' +
        '<rect x="118" y="122" width="20" height="38" rx="9" fill="' + c.a + '"/>' +
        '<path d="M32 132 C36 82 68 66 100 66 C134 66 164 84 170 132 Z" fill="' + c.b + '"/>' +
        '<circle cx="70" cy="92" r="7" fill="' + c.a + '"/>' +
        '<circle cx="96" cy="82" r="7" fill="' + c.a + '"/>' +
        '<circle cx="124" cy="86" r="7" fill="' + c.a + '"/>' +
        '<circle cx="146" cy="102" r="6" fill="' + c.a + '"/>' +
        '<circle cx="52" cy="110" r="6" fill="' + c.a + '"/>' +
        '<circle cx="84" cy="108" r="6" fill="' + c.a + '"/>' +
        '<circle cx="112" cy="106" r="6" fill="' + c.a + '"/>' +
        '<path d="M42 132 L36 142 L50 134 M80 132 L76 144 L88 133 M118 132 L116 144 L126 133" fill="' + c.h + '" stroke-width="3"/>' +
        '<ellipse cx="172" cy="118" rx="22" ry="16" fill="' + c.b + '"/>' +
        '<rect x="64" y="126" width="22" height="36" rx="9" fill="' + c.b + '"/>' +
        '<rect x="132" y="124" width="22" height="38" rx="9" fill="' + c.b + '"/>' +
        eye(c, 176, 112, 6) + cheek(c, 168, 126) +
        smile('M180 126 Q186 129 192 123');
    }
  };

  var DINOS = ['bronto', 'trex', 'trice', 'stego', 'ptero', 'ankylo'];

  function dinoInner(type, mode) {
    var c = pal(type, mode);
    return '<g stroke="' + c.d + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">' +
      BODY[type](c) + '</g>';
  }
  function dino(type, mode) {
    return '<svg class="dino-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180">' +
      dinoInner(type, mode) + '</svg>';
  }

  /* ---------- eggs ---------- */
  var EGG_PATH = 'M50 6 C80 6 94 56 94 76 C94 102 74 116 50 116 C26 116 6 102 6 76 C6 56 20 6 50 6 Z';
  var EGG_COLORS = [['#fff3c4', '#f4b942'], ['#d9f7d0', '#62c370'], ['#dbeafe', '#5b9bd5'],
                    ['#fde2f0', '#ec7fb3'], ['#ece1ff', '#9d7ae6'], ['#ffe2cc', '#f08a4b']];

  function egg(colors, crack) {
    var s = '<svg class="egg-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">' +
      '<path d="' + EGG_PATH + '" fill="' + colors[0] + '" stroke="#5d4a36" stroke-width="4"/>' +
      '<circle cx="34" cy="44" r="8" fill="' + colors[1] + '"/>' +
      '<circle cx="64" cy="66" r="10" fill="' + colors[1] + '"/>' +
      '<circle cx="36" cy="88" r="6" fill="' + colors[1] + '"/>' +
      '<circle cx="62" cy="30" r="5" fill="' + colors[1] + '"/>' +
      '<ellipse cx="30" cy="30" rx="6" ry="10" fill="#fff" opacity="0.6" transform="rotate(25 30 30)"/>';
    if (crack) s += '<path d="M20 62 L32 54 L42 64 L52 52 L62 64 L72 54 L82 62" fill="none" stroke="#5d4a36" stroke-width="3.5" stroke-linejoin="round"/>';
    return s + '</svg>';
  }
  function hatched(type, colors) {
    return '<svg class="egg-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">' +
      '<svg x="-6" y="6" width="112" height="100" viewBox="0 0 200 180">' + dinoInner(type) + '</svg>' +
      '<path d="M8 80 C8 104 28 116 50 116 C72 116 92 104 92 80 L80 70 L66 82 L50 68 L34 82 L20 70 Z" fill="' +
      colors[0] + '" stroke="#5d4a36" stroke-width="4" stroke-linejoin="round"/>' +
      '<circle cx="64" cy="98" r="7" fill="' + colors[1] + '"/><circle cx="32" cy="94" r="5" fill="' + colors[1] + '"/>' +
      '</svg>';
  }

  function nest() {
    return '<svg class="nest-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90">' +
      '<path d="' + EGG_PATH + '" transform="translate(22 4) scale(0.42)" fill="#fff3c4" stroke="#5d4a36" stroke-width="8"/>' +
      '<path d="' + EGG_PATH + '" transform="translate(56 0) scale(0.46)" fill="#dbeafe" stroke="#5d4a36" stroke-width="8"/>' +
      '<path d="' + EGG_PATH + '" transform="translate(40 12) scale(0.4)" fill="#fde2f0" stroke="#5d4a36" stroke-width="8"/>' +
      '<path d="M6 50 C10 84 110 84 114 50 C90 62 30 62 6 50 Z" fill="#b5835a" stroke="#6b4426" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M14 58 L40 66 M30 70 L60 62 M56 72 L90 64 M80 70 L106 58 M20 66 L50 74" stroke="#8a5a36" stroke-width="3" stroke-linecap="round"/>' +
      '</svg>';
  }

  function footprint(color) {
    return '<svg class="foot-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="' + (color || 'currentColor') + '">' +
      '<ellipse cx="50" cy="68" rx="20" ry="22"/>' +
      '<ellipse cx="50" cy="26" rx="9" ry="18"/>' +
      '<ellipse cx="24" cy="38" rx="8" ry="16" transform="rotate(-35 24 38)"/>' +
      '<ellipse cx="76" cy="38" rx="8" ry="16" transform="rotate(35 76 38)"/>' +
      '</g></svg>';
  }

  /* ---------- puzzle scenes (300 x 300) ---------- */
  var SCENES = [
    { sky: ['#7fd3ff', '#d8f3ff'], hill: '#8fd16a', ground: '#6dbb4a', volcano: true },
    { sky: ['#ffb37a', '#ffe7b8'], hill: '#d9b36c', ground: '#c4975a', volcano: false },
    { sky: ['#9fb8ff', '#e2e8ff'], hill: '#7cc9a0', ground: '#5aa97f', volcano: true },
    { sky: ['#ffd1e8', '#fff1f8'], hill: '#a6dd77', ground: '#84c656', volcano: false },
    { sky: ['#6fc6f2', '#c7ecff'], hill: '#9ad48a', ground: '#7bbf6a', volcano: false },
    { sky: ['#ffe082', '#fff6cf'], hill: '#9bcf6b', ground: '#7fb850', volcano: true }
  ];
  function palm(x) {
    return '<path d="M' + x + ' 236 C' + (x + 4) + ' 200 ' + (x - 6) + ' 160 ' + (x + 6) + ' 120" fill="none" stroke="#8d5b34" stroke-width="10" stroke-linecap="round"/>' +
      '<g fill="#3fa34d" stroke="#25713a" stroke-width="3" stroke-linejoin="round">' +
      '<path d="M' + (x + 6) + ' 120 C' + (x - 20) + ' 104 ' + (x - 44) + ' 112 ' + (x - 52) + ' 130 C' + (x - 30) + ' 118 ' + (x - 12) + ' 122 ' + (x + 6) + ' 120 Z"/>' +
      '<path d="M' + (x + 6) + ' 120 C' + (x + 30) + ' 102 ' + (x + 54) + ' 110 ' + (x + 62) + ' 128 C' + (x + 40) + ' 116 ' + (x + 22) + ' 120 ' + (x + 6) + ' 120 Z"/>' +
      '<path d="M' + (x + 6) + ' 120 C' + (x - 6) + ' 96 ' + (x - 30) + ' 88 ' + (x - 44) + ' 94 C' + (x - 22) + ' 98 ' + (x - 8) + ' 106 ' + (x + 6) + ' 120 Z"/>' +
      '<path d="M' + (x + 6) + ' 120 C' + (x + 18) + ' 94 ' + (x + 42) + ' 86 ' + (x + 56) + ' 92 C' + (x + 34) + ' 98 ' + (x + 20) + ' 106 ' + (x + 6) + ' 120 Z"/>' +
      '</g>';
  }
  function scene(i, type) {
    var s = SCENES[i % SCENES.length];
    var flying = type === 'ptero';
    var dx = flying ? 50 : 40, dy = flying ? 40 : 86, dw = flying ? 200 : 220;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">' +
      '<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + s.sky[0] + '"/><stop offset="1" stop-color="' + s.sky[1] + '"/></linearGradient></defs>' +
      '<rect width="300" height="300" fill="url(#sk)"/>' +
      '<circle cx="250" cy="52" r="26" fill="#ffe14d" stroke="#f6b93b" stroke-width="4"/>' +
      '<g fill="#fff" opacity="0.95"><ellipse cx="66" cy="56" rx="34" ry="13"/><ellipse cx="86" cy="47" rx="22" ry="14"/><ellipse cx="170" cy="34" rx="24" ry="9"/></g>' +
      (s.volcano ? '<path d="M170 200 L214 112 L236 112 L284 200 Z" fill="#9a7b6a" stroke="#6d5244" stroke-width="4" stroke-linejoin="round"/><path d="M214 112 L236 112 L230 128 L220 126 Z" fill="#ff7043"/><g fill="#d8d0cc"><circle cx="226" cy="96" r="9"/><circle cx="236" cy="80" r="12"/></g>' : '') +
      '<path d="M0 196 Q75 160 150 194 T300 188 L300 300 L0 300 Z" fill="' + s.hill + '"/>' +
      palm(i % 2 ? 250 : 40) +
      '<path d="M0 236 Q150 220 300 236 L300 300 L0 300 Z" fill="' + s.ground + '"/>' +
      '<g fill="#fff" stroke="#e58fb1" stroke-width="2"><circle cx="30" cy="270" r="5"/><circle cx="270" cy="262" r="5"/><circle cx="150" cy="284" r="4"/></g>' +
      '<svg x="' + dx + '" y="' + dy + '" width="' + dw + '" height="' + (dw * 0.9) + '" viewBox="0 0 200 180">' + dinoInner(type) + '</svg>' +
      '</svg>';
  }

  function dataUri(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }

  /* ---------- UI icons (64 x 64) ---------- */
  function ic(body) { return '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' + body + '</svg>'; }
  var ICONS = {
    home: ic('<path d="M6 30 L32 8 L58 30" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 28 V56 H27 V42 H37 V56 H50 V28" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/>'),
    replay: ic('<path d="M50 36 A19 19 0 1 1 40 15" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M34 4 L50 14 L34 26 Z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>'),
    next: ic('<path d="M12 32 H48 M32 14 L50 32 L32 50" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'),
    back: ic('<path d="M52 32 H16 M32 14 L14 32 L32 50" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'),
    speaker: ic('<path d="M8 24 H20 L34 12 V52 L20 40 H8 Z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M42 22 Q50 32 42 42 M48 14 Q62 32 48 50" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>'),
    gear: ic((function () {
      var t = '';
      for (var a = 0; a < 360; a += 45) t += '<rect x="27" y="4" width="10" height="14" rx="3" fill="currentColor" transform="rotate(' + a + ' 32 32)"/>';
      return t + '<circle cx="32" cy="32" r="17" fill="currentColor"/><circle cx="32" cy="32" r="7" fill="#fff"/>';
    })()),
    full: ic('<path d="M8 22 V8 H22 M42 8 H56 V22 M56 42 V56 H42 M22 56 H8 V42" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'),
    star: ic('<path d="M32 5 L40 23 L60 25 L45 38 L50 58 L32 47 L14 58 L19 38 L4 25 L24 23 Z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>'),
    up: ic('<path d="M32 12 L56 48 H8 Z" fill="currentColor" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/>'),
    down: ic('<path d="M32 52 L56 16 H8 Z" fill="currentColor" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/>'),
    left: ic('<path d="M12 32 L48 8 V56 Z" fill="currentColor" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/>'),
    right: ic('<path d="M52 32 L16 8 V56 Z" fill="currentColor" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/>')
  };

  /* ---------- game tile pictures ---------- */
  var TILES = {
    memory: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">' +
      '<g transform="rotate(-12 40 54)"><rect x="12" y="14" width="52" height="70" rx="10" fill="#2e8b57" stroke="#fff" stroke-width="5"/>' +
      '<g transform="translate(24 34) scale(0.28)" fill="#bff0c8">' + '<ellipse cx="50" cy="68" rx="20" ry="22"/><ellipse cx="50" cy="26" rx="9" ry="18"/><ellipse cx="24" cy="38" rx="8" ry="16" transform="rotate(-35 24 38)"/><ellipse cx="76" cy="38" rx="8" ry="16" transform="rotate(35 76 38)"/>' + '</g></g>' +
      '<g transform="rotate(10 82 52)"><rect x="56" y="14" width="52" height="70" rx="10" fill="#fff" stroke="#fff" stroke-width="5"/>' +
      '<svg x="58" y="32" width="48" height="43" viewBox="0 0 200 180">' + dinoInner('trex') + '</svg></g></svg>',
    maze: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="8" y="8" width="84" height="84" rx="12" fill="#fff7e0" stroke="#fff" stroke-width="5"/>' +
      '<path d="M22 22 H78 M22 22 V78 H58 M78 22 V78 M40 40 H60 V60 M40 40 V60" fill="none" stroke="#7a5230" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="31" cy="69" r="6" fill="#ff9f43"/><circle cx="69" cy="69" r="6" fill="#3fa34d"/></svg>',
    puzzle: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<path d="M14 30 H34 C30 18 50 12 50 26 C50 30 48 30 48 30 H70 V50 C82 46 88 66 74 66 H70 V86 H14 Z" fill="#ffd34e" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>' +
      '<svg x="16" y="40" width="54" height="48" viewBox="0 0 200 180">' + dinoInner('trice') + '</svg></svg>',
    fossil: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="70" rx="44" ry="20" fill="#e3b56b" stroke="#fff" stroke-width="5"/>' +
      '<g transform="rotate(-25 50 50)"><rect x="28" y="44" width="44" height="12" rx="6" fill="#fff6e0" stroke="#8b7048" stroke-width="4"/>' +
      '<circle cx="26" cy="44" r="8" fill="#fff6e0" stroke="#8b7048" stroke-width="4"/><circle cx="26" cy="56" r="8" fill="#fff6e0" stroke="#8b7048" stroke-width="4"/>' +
      '<circle cx="74" cy="44" r="8" fill="#fff6e0" stroke="#8b7048" stroke-width="4"/><circle cx="74" cy="56" r="8" fill="#fff6e0" stroke="#8b7048" stroke-width="4"/>' +
      '<rect x="24" y="46" width="52" height="8" fill="#fff6e0"/></g>' +
      '<g transform="rotate(30 80 24)"><rect x="76" y="6" width="8" height="26" rx="3" fill="#8d5b34"/><rect x="72" y="30" width="16" height="14" rx="3" fill="#ff7043"/></g></svg>',
    eggs: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">' +
      '<svg x="4" y="26" width="44" height="54" viewBox="0 0 100 120">' + egg(EGG_COLORS[0]).replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg>' +
      '<svg x="38" y="10" width="44" height="54" viewBox="0 0 100 120">' + egg(EGG_COLORS[2]).replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg>' +
      '<svg x="72" y="26" width="44" height="54" viewBox="0 0 100 120">' + egg(EGG_COLORS[3]).replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg>' +
      '<path d="M6 74 C14 98 106 98 114 74 C90 84 30 84 6 74 Z" fill="#b5835a" stroke="#fff" stroke-width="4"/></svg>'
  };

  /* ---------- flags for the language picker ---------- */
  var FLAGS = {
    el: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 18"><rect width="27" height="18" fill="#0d5eaf"/>' +
      (function () { var s = ''; for (var i = 1; i < 9; i += 2) s += '<rect y="' + (i * 2) + '" width="27" height="2" fill="#fff"/>'; return s; })() +
      '<rect width="10" height="10" fill="#0d5eaf"/><rect x="4" width="2" height="10" fill="#fff"/><rect y="4" width="10" height="2" fill="#fff"/></svg>',
    en: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 36"><rect width="60" height="36" fill="#012169"/>' +
      '<path d="M0 0 L60 36 M60 0 L0 36" stroke="#fff" stroke-width="7"/><path d="M0 0 L60 36 M60 0 L0 36" stroke="#c8102e" stroke-width="2.5"/>' +
      '<path d="M30 0 V36 M0 18 H60" stroke="#fff" stroke-width="11"/><path d="M30 0 V36 M0 18 H60" stroke="#c8102e" stroke-width="6"/></svg>'
  };

  D.art = {
    DINOS: DINOS, EGG_COLORS: EGG_COLORS, ICONS: ICONS, TILES: TILES, FLAGS: FLAGS,
    dino: dino, dinoInner: dinoInner, egg: egg, hatched: hatched, nest: nest,
    footprint: footprint, scene: scene, sceneCount: SCENES.length, dataUri: dataUri
  };
})(window.Dino);

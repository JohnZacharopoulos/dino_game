/* Dino Games – screens (splash, home, levels, game, parent settings) and the game host.
 *
 * A game registers itself as  Dino.games.<id> = { id, color, start(ctx) }  and gets a
 * `ctx` object with everything it needs (stage element, speech, sounds, timers that are
 * cleaned up automatically when the child leaves the game, progress, completion...). */
window.Dino = window.Dino || {};
(function (D) {
  'use strict';

  D.games = D.games || {};
  var GAME_ORDER = ['memory', 'maze', 'puzzle', 'fossil', 'eggs', 'shadow', 'odd', 'size',
                    'pattern', 'feed', 'dots', 'color', 'chomp', 'run', 'dodge', 'sling', 'td', 'space', 'coco', 'build', 'sounds',
                    'scene', 'math'];
  // Home-screen categories. A game says which one it belongs to with  cat: 'school'  (default 'play').
  var CATS = [{ id: 'play', icon: 'dino' }, { id: 'school', icon: 'book' }];
  var LEVELS = ['easy', 'medium', 'hard'];
  var app, current = null;
  var A = D.art, I = D.i18n, ICON = D.art.ICONS;

  /* ---------- small helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function h(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
  function t(k, v) { return I.t(k, v); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function rand(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  /* Tap handler that reacts on pointerup without the 300ms click delay, mouse & touch alike. */
  function onTap(el, fn) {
    el.addEventListener('click', function (e) { D.sfx.unlock(); fn(e); });
  }

  function confetti() {
    var colors = ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#c77dff', '#ff9f43'];
    var layer = document.createElement('div');
    layer.className = 'confetti';
    for (var i = 0; i < 70; i++) {
      var p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.8) + 's';
      p.style.animationDuration = (2 + Math.random() * 1.5) + 's';
      p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      if (i % 3 === 0) p.style.borderRadius = '50%';
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(function () { layer.remove(); }, 4000);
  }

  function burst(el) {
    if (!el || !el.getBoundingClientRect) return;
    var r = el.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (var i = 0; i < 8; i++) {
      var s = h('<div class="burst">' + ICON.star + '</div>');
      var ang = (i / 8) * Math.PI * 2, dist = 50 + Math.random() * 40;
      s.style.left = cx + 'px'; s.style.top = cy + 'px';
      s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      document.body.appendChild(s);
      (function (n) { setTimeout(function () { n.remove(); }, 800); })(s);
    }
  }

  function leaveGame() {
    if (!current) return;
    var c = current; current = null;
    c.ctx._cleanup();
    try { if (c.inst && c.inst.destroy) c.inst.destroy(); } catch (e) { console.error(e); }
    D.speech.stop();
  }

  function setScreen(node) {
    leaveGame();
    app.innerHTML = '';
    app.appendChild(node);
  }

  /* ---------- splash: language choice (also unlocks audio & speech) ---------- */
  function showSplash() {
    var s = D.store.settings();
    var node = h('<section class="screen splash">' +
      '<div class="splash-dino bob">' + A.dino('trex') + '</div>' +
      '<h1 class="logo">Δεινο-Παιχνίδια<br><small>Dino Games</small></h1>' +
      '<div class="lang-row">' +
      '<button class="lang-btn' + (s.lang === 'el' ? ' current' : '') + '" data-lang="el">' + A.FLAGS.el + '<span>Ελληνικά</span></button>' +
      '<button class="lang-btn' + (s.lang === 'en' ? ' current' : '') + '" data-lang="en">' + A.FLAGS.en + '<span>English</span></button>' +
      '</div></section>');
    node.querySelectorAll('.lang-btn').forEach(function (b) {
      onTap(b, function () {
        setLang(b.getAttribute('data-lang'));
        D.sfx.roar();
        showHome(true);
      });
    });
    setScreen(node);
  }

  function setLang(lang) {
    D.store.set('lang', lang);
    I.lang = lang;
    document.documentElement.lang = lang;
    document.title = I.raw('title');
  }

  /* ---------- home ---------- */
  function starsHtml(id) {
    return '<div class="stars">' + levelsOf(id).map(function (l) {
      return '<span class="star' + (D.store.hasStar(id, l) ? ' won' : '') + '">' + ICON.star + '</span>';
    }).join('') + '</div>';
  }

  function topRight() {
    var full = document.fullscreenEnabled || document.webkitFullscreenEnabled;
    return '<div class="tb-group">' +
      '<button class="pill lang-toggle" aria-label="language">' + (I.lang === 'el' ? 'EN' : 'ΕΛ') + '</button>' +
      (full ? '<button class="icon-btn small fs-btn" aria-label="fullscreen">' + ICON.full + '</button>' : '') +
      '<button class="icon-btn small gear-btn" aria-label="' + esc(I.raw('parents')) + '"><span class="hold-ring"></span>' + ICON.gear + '</button>' +
      '</div>';
  }

  function wireTopRight(node, rerender) {
    var lt = $('.lang-toggle', node);
    if (lt) onTap(lt, function () { setLang(I.lang === 'el' ? 'en' : 'el'); rerender(); });
    var fs = $('.fs-btn', node);
    if (fs) onTap(fs, toggleFullscreen);
    var g = $('.gear-btn', node);
    if (g) holdToOpen(g, function () { showSettings(rerender); });
  }

  function toggleFullscreen() {
    var d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) {
      (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    } else {
      var req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) try { var p = req.call(el); if (p && p.catch) p.catch(function () {}); } catch (e) { /* ignore */ }
    }
  }

  function showHome(greet) {
    var node = h('<section class="screen home">' +
      '<header class="topbar"><h1 class="logo small">' + esc(I.raw('title')) + '</h1>' + topRight() + '</header>' +
      '<nav class="cat-tabs"></nav><div class="tiles"></div></section>');
    var tiles = $('.tiles', node);
    var cat = D.store.settings().tab || 'play';
    var tabs = $('.cat-tabs', node);
    CATS.forEach(function (c) {
      var b = h('<button class="cat-tab' + (c.id === cat ? ' on' : '') + '">' +
        (c.icon === 'book' ? A.ICONS.book : '<span class="cat-dino">' + A.dino('trex') + '</span>') +
        '<span>' + esc(I.raw('cat_' + c.id)) + '</span></button>');
      onTap(b, function () {
        if (c.id === cat) return;
        D.sfx.tap();
        D.store.set('tab', c.id);
        showHome(false);
        D.speech.say(I.raw('cat_' + c.id));
      });
      tabs.appendChild(b);
    });
    GAME_ORDER.filter(function (id) {
      var gm = D.games[id];
      // desktopOnly games (e.g. the scene maker) only appear on big screens with a mouse
      return gm && (gm.cat || 'play') === cat && (!gm.desktopOnly || bigScreen());
    }).forEach(function (id, i) {
      var g = D.games[id];
      var tile = h('<button class="tile" style="--c:' + g.color + ';--d:' + g.dark + ';animation-delay:' + (i * 70) + 'ms">' +
        '<div class="tile-pic">' + A.TILES[id] + '</div>' +
        '<div class="tile-name">' + esc(I.raw('g_' + id)) + '</div>' + (g.free ? '<div class="stars free">' + ICON.music.replace('class="icon"', 'class="icon star"') + '</div>' : starsHtml(id)) + '</button>');
      onTap(tile, function () { D.sfx.tap(); if (g.free) startGame(id, 'free'); else showLevels(id); });
      tiles.appendChild(tile);
    });
    wireTopRight(node, function () { showHome(false); });
    setScreen(node);
    fitTiles(tiles);
    if (greet) D.speech.say(t('hello'));
  }

  /* Make all game tiles fit on screen (biggest size that fits; scroll only on tiny screens). */
  function fitTiles(box) {
    var n = box.children.length;
    if (!n) return;
    var W = box.clientWidth - 24, H = box.clientHeight - 24, gap = (W < 500 || H < 420) ? 10 : 18, best = 0;
    for (var cols = 1; cols <= n; cols++) {
      var rows = Math.ceil(n / cols);
      var w = Math.min((W - gap * (cols - 1)) / cols, ((H - gap * (rows - 1)) / rows) / 1.18);
      if (w > best) best = w;
    }
    best = Math.max(W < 500 ? 140 : H < 420 ? 90 : 118, Math.min(best, 210));
    box.style.setProperty('--tw', Math.floor(best) + 'px');
    box.style.gap = gap + 'px';
  }
  window.addEventListener('resize', function () { var b = document.querySelector('.home .tiles'); if (b) fitTiles(b); });

  /* A computer with a mouse/trackpad and a large window (not a phone or tablet). */
  function bigScreen() {
    var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    return !!fine && window.innerWidth >= 1000 && window.innerHeight >= 560;
  }
  D.bigScreen = bigScreen;

  /* A game may define its own list of levels (e.g. school grades); default: easy / medium / hard. */
  function levelsOf(id) { return (D.games[id] && D.games[id].levels) || LEVELS; }

  /* ---------- level choice ---------- */
  function showLevels(id) {
    var g = D.games[id];
    var node = h('<section class="screen levels" style="--c:' + g.color + ';--d:' + g.dark + '">' +
      '<header class="topbar"><button class="icon-btn home-btn" aria-label="home">' + ICON.home + '</button>' +
      '<h1 class="screen-title">' + esc(I.raw('g_' + id)) + '</h1><span class="tb-spacer"></span></header>' +
      '<div class="level-row"></div></section>');
    var row = $('.level-row', node);
    var lv = levelsOf(id);
    if (lv.length > 3) row.classList.add('many');
    lv.forEach(function (l, i) {
      var feet = '';
      if (g.levelBadges) feet = '<span class="lvl-badge">' + esc((g.levelBadges[I.lang] || g.levelBadges.en)[i]) + '</span>';
      else for (var k = 0; k <= i; k++) feet += A.footprint();
      var b = h('<button class="level-btn lvl-' + l + '" style="animation-delay:' + (i * 70) + 'ms">' +
        '<div class="lvl-feet">' + feet + '</div>' +
        '<div class="lvl-name">' + esc(I.raw(g.levelNames ? g.levelNames[i] : l)) + '</div>' +
        '<span class="star' + (D.store.hasStar(id, l) ? ' won' : '') + '">' + ICON.star + '</span></button>');
      onTap(b, function () { D.sfx.tap(); startGame(id, l); });
      row.appendChild(b);
    });
    onTap($('.home-btn', node), function () { D.sfx.tap(); showHome(false); });
    setScreen(node);
    D.speech.say(I.raw('g_' + id) + '. ' + t('chooseLevel'));
  }

  /* ---------- game host ---------- */
  function startGame(id, level) {
    var g = D.games[id];
    var node = h('<section class="screen game game-' + id + '" style="--c:' + g.color + ';--d:' + g.dark + '">' +
      '<header class="topbar">' +
      '<button class="icon-btn home-btn" aria-label="home">' + ICON.home + '</button>' +
      '<div class="progress' + (g.free ? ' hidden' : '') + '"></div>' +
      '<button class="icon-btn say-btn" aria-label="repeat">' + ICON.speaker + '</button>' +
      '</header><div class="stage"></div></section>');
    setScreen(node);

    var stage = $('.stage', node);
    var timers = [], listeners = [], resizers = [], instruction = '';
    var alive = true;

    var ctx = {
      level: level,
      stage: stage,
      art: A, shuffle: shuffle, rand: rand, h: h,
      alive: function () { return alive; },
      timeout: function (fn, ms) {
        var id = setTimeout(function () { if (alive) fn(); }, ms);
        timers.push(id); return id;
      },
      on: function (target, ev, fn, opts) {
        target.addEventListener(ev, fn, opts);
        listeners.push([target, ev, fn, opts]);
      },
      onResize: function (fn) { resizers.push(fn); },
      say: function (text, opts) { D.speech.say(text, opts); },
      t: t,
      instruct: function (key, vars) { instruction = t(key, vars); D.speech.say(instruction); },
      instructText: function (text) { instruction = text; D.speech.say(instruction); },
      praise: function (el) { D.speech.say(t('praise')); if (el) burst(el); },
      tryAgain: function () { D.speech.say(t('tryAgain')); },
      burst: burst,
      sfx: D.sfx,
      progress: function (done, total) {
        var p = $('.progress', node), html = '';
        for (var i = 0; i < total; i++) html += '<span class="pstep' + (i < done ? ' done' : '') + '">' + A.footprint() + '</span>';
        p.innerHTML = html;
      },
      complete: function (extra) { levelComplete(id, level, node, extra); },
      _cleanup: function () {
        alive = false;
        timers.forEach(clearTimeout);
        listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
        window.removeEventListener('resize', onResize);
      }
    };

    var rt = null;
    function onResize() {
      clearTimeout(rt);
      rt = setTimeout(function () { if (alive) resizers.forEach(function (f) { f(); }); }, 120);
    }
    window.addEventListener('resize', onResize);

    onTap($('.home-btn', node), function () { D.sfx.tap(); showHome(false); });
    onTap($('.say-btn', node), function () { if (instruction) D.speech.say(instruction); });

    current = { ctx: ctx, inst: null };
    // Let the stage get its size before the game measures it.
    requestAnimationFrame(function () {
      if (!alive) return;
      try { current.inst = g.start(ctx) || null; } catch (e) { console.error(e); }
    });
  }

  function levelComplete(id, level, node, extra) {
    D.store.addStar(id, level);
    D.sfx.fanfare();
    confetti();
    var dino = A.DINOS[rand(0, A.DINOS.length - 1)];
    var lvls = levelsOf(id), next = lvls[lvls.indexOf(level) + 1];
    var ov = h('<div class="overlay done-overlay"><div class="done-card">' +
      '<div class="big-star spin-in">' + ICON.star + '</div>' +
      '<div class="done-dino dance">' + A.dino(dino) + '</div>' +
      '<div class="done-text">' + esc(t('levelDone')) + '</div>' +
      (extra ? '<div class="done-extra">' + esc(extra) + '</div>' : '') +
      '<div class="done-actions">' +
      '<button class="icon-btn big home-btn" aria-label="home">' + ICON.home + '</button>' +
      '<button class="icon-btn big replay-btn" aria-label="replay">' + ICON.replay + '</button>' +
      (next ? '<button class="icon-btn big go next-btn" aria-label="next">' + ICON.next + '</button>' : '') +
      '</div></div></div>');
    node.appendChild(ov);
    D.speech.say($('.done-text', ov).textContent + (extra ? ' ' + extra : ''));
    onTap($('.home-btn', ov), function () { D.sfx.tap(); showHome(false); });
    onTap($('.replay-btn', ov), function () { D.sfx.tap(); startGame(id, level); });
    if (next) onTap($('.next-btn', ov), function () { D.sfx.tap(); startGame(id, next); });
  }

  /* ---------- parents: press-and-hold gate + settings ---------- */
  function holdToOpen(btn, fn) {
    var timer = null;
    function start(e) {
      e.preventDefault();
      btn.classList.add('holding');
      timer = setTimeout(function () { btn.classList.remove('holding'); D.sfx.unlock(); fn(); }, 1500);
    }
    function stop() { clearTimeout(timer); btn.classList.remove('holding'); }
    btn.addEventListener('pointerdown', start);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { btn.addEventListener(ev, stop); });
    btn.addEventListener('click', function () { D.speech.say(I.raw('holdHint'), { noCaption: false }); });
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  function showSettings(onClose) {
    var s = D.store.settings();
    function voiceLine() {
      var v = D.speech.voiceFor(I.lang);
      return v ? t('voiceFound', { v: v.name }) : I.raw('voiceMissing');
    }
    function toggle(key) {
      return '<div class="seg" data-key="' + key + '">' +
        '<button data-v="1" class="' + (s[key] ? 'on' : '') + '">' + esc(I.raw('on')) + '</button>' +
        '<button data-v="0" class="' + (!s[key] ? 'on' : '') + '">' + esc(I.raw('off')) + '</button></div>';
    }
    var ov = h('<div class="overlay settings-overlay"><div class="settings-card">' +
      '<h2>' + esc(I.raw('parents')) + '</h2>' +
      '<label class="field"><span>' + esc(I.raw('nameLabel')) + '</span>' +
      '<input type="text" class="name-input" maxlength="20" value="' + esc(s.name) + '" autocomplete="off"></label>' +
      '<div class="field"><span>' + esc(I.raw('language')) + '</span><div class="seg lang-seg">' +
      '<button data-l="el" class="' + (I.lang === 'el' ? 'on' : '') + '">Ελληνικά</button>' +
      '<button data-l="en" class="' + (I.lang === 'en' ? 'on' : '') + '">English</button></div></div>' +
      '<div class="field"><span>' + esc(I.raw('voice')) + '</span>' + toggle('voice') + '</div>' +
      '<p class="voice-info"></p>' +
      '<button class="text-btn test-btn">' + esc(I.raw('voiceTest')) + '</button>' +
      '<div class="field"><span>' + esc(I.raw('sounds')) + '</span>' + toggle('sound') + '</div>' +
      '<div class="settings-actions">' +
      '<button class="text-btn danger reset-btn">' + esc(I.raw('reset')) + '</button>' +
      '<button class="text-btn primary close-btn">' + esc(I.raw('close')) + '</button></div>' +
      '</div></div>');
    document.body.appendChild(ov);
    $('.voice-info', ov).textContent = voiceLine();

    var input = $('.name-input', ov);
    input.addEventListener('input', function () { D.store.set('name', input.value.trim()); });
    ov.querySelectorAll('.seg[data-key]').forEach(function (seg) {
      seg.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          D.store.set(seg.getAttribute('data-key'), b.getAttribute('data-v') === '1');
          seg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
        });
      });
    });
    $('.lang-seg', ov).querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        setLang(b.getAttribute('data-l'));
        ov.remove();
        showSettings(onClose);
      });
    });
    $('.test-btn', ov).addEventListener('click', function () { D.speech.say(t('hello')); });
    $('.reset-btn', ov).addEventListener('click', function () {
      if (window.confirm(I.raw('resetConfirm'))) { D.store.resetStars(); }
    });
    $('.close-btn', ov).addEventListener('click', function () { ov.remove(); if (onClose) onClose(); });
  }

  /* ---------- boot ---------- */
  function boot() {
    app = document.getElementById('app');
    setLang(D.store.settings().lang);
    // Block page zoom / long-press menus that confuse little fingers.
    document.addEventListener('contextmenu', function (e) { if (!e.target.closest('input')) e.preventDefault(); });
    document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
    document.addEventListener('dblclick', function (e) { e.preventDefault(); });
    showSplash();
  }

  D.util = { shuffle: shuffle, rand: rand, h: h };
  D.app = { boot: boot, showHome: showHome };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.Dino);

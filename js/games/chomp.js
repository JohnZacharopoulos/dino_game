/* Hungry Dino – an original maze-chase game: the little T-rex runs through a garden maze
 * eating all the leaves while beetles wander around. A golden egg puts the beetles to sleep.
 * Touching an awake beetle never ends the game: the dino simply goes back to the start.
 *
 * Controls: swipe on the board, tap on a side of the dino, big arrow buttons or keyboard arrows. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
(function (D) {
  'use strict';

  function bugSvg(color) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<g stroke="#3a2a1a" stroke-width="5" stroke-linecap="round" fill="none"><path d="M24 44 L8 36 M20 60 L5 62 M26 76 L12 88 M76 44 L92 36 M80 60 L95 62 M74 76 L88 88"/></g>' +
      '<circle cx="50" cy="24" r="17" fill="#3a2a1a"/>' +
      '<ellipse cx="50" cy="62" rx="32" ry="33" fill="' + color + '" stroke="#3a2a1a" stroke-width="4"/>' +
      '<path d="M50 30 L50 94" stroke="#3a2a1a" stroke-width="3"/>' +
      '<g fill="#3a2a1a"><circle cx="36" cy="54" r="6"/><circle cx="64" cy="54" r="6"/><circle cx="34" cy="76" r="5"/><circle cx="66" cy="76" r="5"/></g>' +
      '<circle cx="42" cy="20" r="7" fill="#fff"/><circle cx="58" cy="20" r="7" fill="#fff"/>' +
      '<circle cx="43" cy="21" r="3.5" fill="#111"/><circle cx="59" cy="21" r="3.5" fill="#111"/>' +
      '<path d="M44 32 Q50 36 56 32" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>';
  }

  // Home-screen tile: a little garden maze with leaves, a dino and a beetle.
  D.art.TILES.chomp = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">' +
    '<rect x="6" y="6" width="108" height="88" rx="14" fill="#bfe8a0" stroke="#fff" stroke-width="4"/>' +
    '<path d="M20 22 H100 M20 22 V78 H60 M100 22 V78 M40 42 H80 V58" fill="none" stroke="#2e7d32" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
    [[50, 32], [70, 32], [90, 32], [90, 50], [90, 68], [74, 68], [30, 52], [30, 66]].map(function (p) {
      return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="4" ry="2.6" fill="#4ade80" stroke="#166534" stroke-width="1.2" transform="rotate(-30 ' + p[0] + ' ' + p[1] + ')"/>';
    }).join('') +
    '<svg x="20" y="42" width="34" height="31" viewBox="0 0 200 180">' + D.art.dinoInner('trex') + '</svg>' +
    '<svg x="62" y="46" width="22" height="22" viewBox="0 0 100 100">' + bugSvg('#ff6b6b').replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg></svg>';

  D.games.chomp = {
    id: 'chomp', color: '#43a047', dark: '#1b5e20',

    start: function (ctx) {
      var CFG = {
        easy:   { w: 7,  h: 7, bugs: 0, eggs: 0, step: 300, bstep: 0,   chase: 0,   rounds: 2 },
        medium: { w: 9,  h: 9, bugs: 1, eggs: 1, step: 260, bstep: 620, chase: 0,   rounds: 2 },
        hard:   { w: 11, h: 9, bugs: 2, eggs: 2, step: 240, bstep: 460, chase: 0.5, rounds: 2 }
      }[ctx.level];
      var A = ctx.art, stage = ctx.stage;
      var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      var round = 0, gen = 0, ptok = 0;
      var W, H, cells, board, wrap, cell, leaves, left, player, bugs, golds, busy, invuln;

      // read-only snapshot used by the automated tests
      stage._debug = function () { return { W: W, H: H, cells: cells, player: player, leaves: Object.keys(leaves), bugs: bugs, busy: busy }; };

      ctx.progress(0, CFG.rounds);
      newRound();

      /* ---------- maze: one-path maze, then open up dead ends so there are always two ways out ---------- */
      function generate() {
        var g = [], x, y;
        for (y = 0; y < H; y++) { g[y] = []; for (x = 0; x < W; x++) g[y][x] = { n: 1, e: 1, s: 1, w: 1, v: 0 }; }
        var SIDES = [['n', 0, -1, 's'], ['e', 1, 0, 'w'], ['s', 0, 1, 'n'], ['w', -1, 0, 'e']];
        var stack = [[0, 0]];
        g[0][0].v = 1;
        while (stack.length) {
          var cur = stack[stack.length - 1];
          var opts = ctx.shuffle(SIDES).filter(function (d) {
            var nx = cur[0] + d[1], ny = cur[1] + d[2];
            return nx >= 0 && ny >= 0 && nx < W && ny < H && !g[ny][nx].v;
          });
          if (!opts.length) { stack.pop(); continue; }
          var d = opts[0], nx = cur[0] + d[1], ny = cur[1] + d[2];
          g[cur[1]][cur[0]][d[0]] = 0; g[ny][nx][d[3]] = 0; g[ny][nx].v = 1;
          stack.push([nx, ny]);
        }
        // remove every dead end (a cell with 3 walls) by opening one more wall
        for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
          var c = g[y][x];
          if (c.n + c.e + c.s + c.w < 3) continue;
          var cand = ctx.shuffle(SIDES).filter(function (d) {
            var nx = x + d[1], ny = y + d[2];
            return c[d[0]] && nx >= 0 && ny >= 0 && nx < W && ny < H;
          });
          // prefer knocking through into another dead end
          cand.sort(function (a, b) {
            var na = g[y + a[2]][x + a[1]], nb = g[y + b[2]][x + b[1]];
            return (nb.n + nb.e + nb.s + nb.w) - (na.n + na.e + na.s + na.w);
          });
          var k = cand[0];
          if (k) { c[k[0]] = 0; g[y + k[2]][x + k[1]][k[3]] = 0; }
        }
        return g;
      }
      function open(x, y, d) {
        var c = cells[y] && cells[y][x];
        if (!c) return false;
        return d[0] === 1 ? !c.e : d[0] === -1 ? !c.w : d[1] === 1 ? !c.s : !c.n;
      }

      /* ---------- building a round ---------- */
      function newRound() {
        gen++; ptok++;
        stage.innerHTML = '';
        busy = false; invuln = false;
        // turn the maze to match the screen
        var portrait = stage.clientHeight > stage.clientWidth;
        W = portrait ? Math.min(CFG.w, CFG.h) : Math.max(CFG.w, CFG.h);
        H = portrait ? Math.max(CFG.w, CFG.h) : Math.min(CFG.w, CFG.h);
        // On small screens use fewer, bigger squares (at least ~36px each) so little fingers can follow.
        while (Math.min(W, H) > 5 && cellFor(W, H) < 36) { W -= 2; H -= 2; }
        cells = generate();

        wrap = ctx.h('<div class="maze-wrap"></div>');
        board = ctx.h('<div class="maze-board chomp-board"></div>');
        var u = 10, s = '<svg viewBox="-1 -1 ' + (W * u + 2) + ' ' + (H * u + 2) + '" preserveAspectRatio="none">' +
          '<g stroke="#2e7d32" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M0 0 H' + W * u + ' M0 0 V' + H * u + ' ';
        for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
          var c = cells[y][x];
          if (c.e) s += 'M' + (x + 1) * u + ' ' + y * u + ' V' + (y + 1) * u + ' ';
          if (c.s) s += 'M' + x * u + ' ' + (y + 1) * u + ' H' + (x + 1) * u + ' ';
        }
        board.innerHTML = s + '"/></g></svg>';

        player = { x: 0, y: 0, home: [0, 0], dir: null, next: null, size: 0.86, step: CFG.step,
          el: ctx.h('<div class="ent player"><div class="flip">' + A.dino('trex') + '</div></div>') };
        var bugHomes = [[W - 1, H - 1], [Math.floor(W / 2), Math.floor(H / 2)]];
        var bugColors = ['#ff6b6b', '#a855f7'];
        bugs = [];
        for (var i = 0; i < CFG.bugs; i++) {
          var hm = bugHomes[i];
          bugs.push({ x: hm[0], y: hm[1], home: hm, dir: null, size: 0.74, step: CFG.bstep, asleep: false, chase: i === 0 ? CFG.chase : 0,
            el: ctx.h('<div class="ent bug">' + bugSvg(bugColors[i]) + '<span class="zzz">z z</span></div>') });
        }
        var eggSpots = [[W - 1, 0], [0, H - 1]];
        golds = {};
        for (i = 0; i < CFG.eggs; i++) {
          var e = eggSpots[i];
          golds[e[0] + ',' + e[1]] = { x: e[0], y: e[1], size: 0.62, el: ctx.h('<div class="ent gold">' + A.egg(['#ffe066', '#f5b700']) + '</div>') };
        }
        leaves = {}; left = 0;
        for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
          var key = x + ',' + y;
          if ((x === 0 && y === 0) || golds[key]) continue;
          var lf = { x: x, y: y, size: 0.38, el: ctx.h('<div class="leaf">' + A.FOODS.green + '</div>') };
          lf.el.firstChild.style.transform = 'rotate(' + ctx.rand(-40, 40) + 'deg)'; // rotate the picture, not the position
          leaves[key] = lf; left++;
          board.appendChild(lf.el);
        }
        for (var k in golds) board.appendChild(golds[k].el);
        bugs.forEach(function (b) { board.appendChild(b.el); });
        board.appendChild(player.el);

        var pad = ctx.h('<div class="pad">' +
          '<button class="pad-btn pad-up" data-d="0,-1">' + A.ICONS.up + '</button>' +
          '<button class="pad-btn pad-left" data-d="-1,0">' + A.ICONS.left + '</button>' +
          '<button class="pad-btn pad-right" data-d="1,0">' + A.ICONS.right + '</button>' +
          '<button class="pad-btn pad-down" data-d="0,1">' + A.ICONS.down + '</button></div>');
        pad.querySelectorAll('button').forEach(function (b) {
          ctx.on(b, 'pointerdown', function (ev) { ev.preventDefault(); var d = b.getAttribute('data-d').split(','); steer([+d[0], +d[1]]); });
        });
        wrap.appendChild(board);
        wrap.appendChild(pad);
        stage.appendChild(wrap);
        layout();
        ctx.instruct(CFG.bugs ? 'chomp_inst2' : 'chomp_inst');

        var g = gen;
        bugs.forEach(function (b, i) { ctx.timeout(function () { bugTick(b, g); }, 1500 + i * 700); });
      }

      /* ---------- drawing ---------- */
      function padButton() {
        var SW = stage.clientWidth, SH = stage.clientHeight;
        return Math.max(52, Math.min(92, (SW >= SH ? SH : SW) * 0.16));
      }
      function cellFor(w, h) {
        var SW = stage.clientWidth, SH = stage.clientHeight, landscape = SW >= SH;
        var padSize = padButton() * 3 + 12 + 18;
        var aw = landscape ? SW - padSize : SW, ah = landscape ? SH : SH - padSize;
        return Math.floor(Math.min((aw - 6) / w, (ah - 6) / h));
      }
      function layout() {
        if (!board) return;
        var landscape = stage.clientWidth >= stage.clientHeight, pad = wrap.querySelector('.pad');
        wrap.style.flexDirection = landscape ? 'row' : 'column';
        pad.style.setProperty('--pb', padButton() + 'px');
        cell = cellFor(W, H);
        board.style.width = cell * W + 'px'; board.style.height = cell * H + 'px';
        [player].concat(bugs).forEach(function (e) { sizeEnt(e); place(e, true); });
        for (var k in golds) { sizeEnt(golds[k]); place(golds[k], true); }
        for (k in leaves) { sizeEnt(leaves[k]); place(leaves[k], true); }
      }
      ctx.onResize(layout);

      function sizeEnt(e) {
        var s = cell * e.size;
        e.el.style.width = s + 'px'; e.el.style.height = s + 'px';
        if (e.el.classList.contains('bug')) e.el.style.fontSize = Math.max(12, cell * 0.3) + 'px';
      }
      function place(e, instant) {
        var s = cell * e.size;
        if (instant) e.el.classList.add('jumpto');
        else if (e.step) e.el.style.transitionDuration = e.step + 'ms';
        e.el.style.transform = 'translate(' + (e.x * cell + (cell - s) / 2) + 'px,' + (e.y * cell + (cell - s) / 2) + 'px)';
        if (instant) { void e.el.offsetWidth; e.el.classList.remove('jumpto'); }
      }

      /* ---------- player ---------- */
      function steer(d) {
        if (busy) return;
        player.next = d;
        if (!player.moving) { ptok++; playerTick(gen, ptok); }
      }
      function playerTick(g, tok) {
        if (g !== gen || tok !== ptok) return;
        player.moving = false;
        if (!busy) {
          if (player.next && open(player.x, player.y, player.next)) player.dir = player.next;
          if (player.dir && open(player.x, player.y, player.dir)) {
            move(player, player.dir);
            player.moving = true;
            if (player.dir[0]) player.el.classList.toggle('left', player.dir[0] < 0);
            arrive();
          }
        }
        if (player.moving) ctx.timeout(function () { playerTick(g, tok); }, CFG.step);
      }
      function move(e, d) {
        e.prev = [e.x, e.y];
        e.x += d[0]; e.y += d[1];
        place(e);
      }
      function arrive() {
        var key = player.x + ',' + player.y;
        var lf = leaves[key];
        if (lf) {
          delete leaves[key]; left--;
          ctx.timeout(function () { lf.el.classList.add('eaten'); ctx.sfx.chomp(); }, CFG.step * 0.6);
          ctx.timeout(function () { lf.el.remove(); }, CFG.step + 300);
        }
        var gd = golds[key];
        if (gd) {
          delete golds[key];
          ctx.timeout(function () { gd.el.remove(); }, CFG.step * 0.6);
          sleepBugs();
        }
        collide();
        if (left === 0 && !busy) win();
      }

      /* ---------- beetles ---------- */
      function bugTick(b, g) {
        if (g !== gen) return;
        if (!b.asleep && !busy) {
          var opts = DIRS.filter(function (d) { return open(b.x, b.y, d); });
          var fwd = opts.filter(function (d) { return !b.dir || d[0] !== -b.dir[0] || d[1] !== -b.dir[1]; });
          if (fwd.length) opts = fwd;
          var d;
          if (b.chase && Math.random() < b.chase) {
            opts.sort(function (p, q) {
              return (Math.abs(b.x + p[0] - player.x) + Math.abs(b.y + p[1] - player.y)) -
                     (Math.abs(b.x + q[0] - player.x) + Math.abs(b.y + q[1] - player.y));
            });
            d = opts[0];
          } else {
            d = opts[ctx.rand(0, opts.length - 1)];
          }
          if (d) { b.dir = d; move(b, d); collide(); }
        }
        ctx.timeout(function () { bugTick(b, g); }, CFG.bstep);
      }
      function sleepBugs() {
        ctx.sfx.sparkle();
        if (!bugs.length) return;
        ctx.say(ctx.t('chomp_egg'));
        bugs.forEach(function (b) { b.asleep = true; b.el.classList.add('asleep'); });
        var g = gen;
        clearTimeout(sleepBugs.t);
        sleepBugs.t = ctx.timeout(function () {
          if (g !== gen) return;
          bugs.forEach(function (b) { b.asleep = false; b.el.classList.remove('asleep'); });
        }, 7000);
      }

      function collide() {
        if (invuln || busy) return;
        bugs.forEach(function (b) {
          if (b.asleep || invuln) return;
          var same = b.x === player.x && b.y === player.y;
          var swapped = b.prev && player.prev && b.prev[0] === player.x && b.prev[1] === player.y &&
                        player.prev[0] === b.x && player.prev[1] === b.y;
          if (same || swapped) bonk(b);
        });
      }
      function bonk(b) {
        invuln = true; busy = true;
        ctx.sfx.bump();
        ctx.say(ctx.t('chomp_oops'));
        player.el.classList.remove('wobble'); void player.el.offsetWidth; player.el.classList.add('wobble');
        var g = gen;
        ctx.timeout(function () {
          if (g !== gen) return;
          player.x = player.home[0]; player.y = player.home[1]; player.dir = player.next = null; player.prev = null;
          place(player, true);
          b.x = b.home[0]; b.y = b.home[1]; b.dir = null; b.prev = null;
          place(b, true);
          busy = false;
          player.el.classList.add('blink');
        }, 700);
        ctx.timeout(function () { invuln = false; player.el.classList.remove('blink'); }, 2300);
      }

      function win() {
        busy = true;
        gen++; // stops the beetles
        ctx.timeout(function () {
          ctx.sfx.roar();
          player.el.querySelector('.flip').classList.add('dance');
          ctx.praise(player.el);
        }, CFG.step);
        round++;
        ctx.timeout(function () { ctx.progress(round, CFG.rounds); }, 900);
        ctx.timeout(function () { if (round >= CFG.rounds) ctx.complete(); else newRound(); }, 2800);
      }

      /* ---------- input: swipe / tap on the board, keyboard ---------- */
      var start = null, swiped = false;
      ctx.on(stage, 'pointerdown', function (e) {
        if (!board || !board.contains(e.target)) return;
        start = [e.clientX, e.clientY]; swiped = false;
        try { board.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      });
      ctx.on(stage, 'pointermove', function (e) {
        if (!start) return;
        var dx = e.clientX - start[0], dy = e.clientY - start[1];
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
        steer(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
        start = [e.clientX, e.clientY]; swiped = true; // allow a new swipe without lifting the finger
      });
      ctx.on(stage, 'pointerup', function (e) {
        if (!start) return;
        start = null;
        if (swiped) return;
        // a tap: go towards the side of the dino that was tapped
        var r = player.el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        if (Math.max(Math.abs(dx), Math.abs(dy)) < cell * 0.3) return;
        steer(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
      });
      ctx.on(stage, 'pointercancel', function () { start = null; });
      ctx.on(window, 'keydown', function (e) {
        var m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
        if (m) { e.preventDefault(); steer(m); }
      });
    }
  };
})(window.Dino);

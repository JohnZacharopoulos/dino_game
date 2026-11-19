/* Maze – guide the baby dino to its nest.
 * Controls: drag/trace with a finger, tap a square in a straight line, big arrow buttons
 * or the keyboard arrows. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.maze = {
  id: 'maze', color: '#ffa94d', dark: '#c46a12',

  start: function (ctx) {
    var CFG = {
      easy:   { size: 3, rounds: 3, trail: true,  hintAfter: 0 },
      medium: { size: 5, rounds: 3, trail: false, hintAfter: 3 },
      hard:   { size: 7, rounds: 3, trail: false, hintAfter: 5 }
    }[ctx.level];
    var A = ctx.art, stage = ctx.stage, N = CFG.size;
    var round = 0, cells, pos, goal, board, dinoEl, nestEl, cell, busy, bumps, marks, hintTimer;
    var player = 'trex';

    ctx.progress(0, CFG.rounds);
    ctx.instruct('maze_inst');
    newMaze();

    /* ---------- maze generation (recursive backtracker = exactly one path) ---------- */
    function generate() {
      var g = [], x, y;
      for (y = 0; y < N; y++) { g[y] = []; for (x = 0; x < N; x++) g[y][x] = { n: 1, e: 1, s: 1, w: 1, v: 0 }; }
      var stack = [[0, 0]];
      g[0][0].v = 1;
      var D = [['n', 0, -1, 's'], ['e', 1, 0, 'w'], ['s', 0, 1, 'n'], ['w', -1, 0, 'e']];
      while (stack.length) {
        var cur = stack[stack.length - 1];
        var opts = ctx.shuffle(D).filter(function (d) {
          var nx = cur[0] + d[1], ny = cur[1] + d[2];
          return nx >= 0 && ny >= 0 && nx < N && ny < N && !g[ny][nx].v;
        });
        if (!opts.length) { stack.pop(); continue; }
        var d = opts[0], nx = cur[0] + d[1], ny = cur[1] + d[2];
        g[cur[1]][cur[0]][d[0]] = 0;
        g[ny][nx][d[3]] = 0;
        g[ny][nx].v = 1;
        stack.push([nx, ny]);
      }
      return g;
    }

    function open(x, y, dx, dy) {
      var c = cells[y][x];
      if (dx === 1) return !c.e;
      if (dx === -1) return !c.w;
      if (dy === 1) return !c.s;
      if (dy === -1) return !c.n;
      return false;
    }

    function solve(from) {
      var prev = {}, q = [from], key = function (p) { return p[0] + ',' + p[1]; };
      prev[key(from)] = null;
      while (q.length) {
        var p = q.shift();
        if (p[0] === goal[0] && p[1] === goal[1]) break;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = p[0] + d[0], ny = p[1] + d[1];
          if (open(p[0], p[1], d[0], d[1]) && !(key([nx, ny]) in prev)) { prev[key([nx, ny])] = p; q.push([nx, ny]); }
        });
      }
      var path = [], cur = goal;
      while (cur) { path.unshift(cur); cur = prev[key(cur)]; }
      return path;
    }

    /* ---------- drawing ---------- */
    function newMaze() {
      stage.innerHTML = '';
      cells = generate();
      pos = [0, 0];
      goal = [N - 1, N - 1];
      busy = false; bumps = 0; marks = {};
      player = A.DINOS.filter(function (d) { return d !== 'ptero'; })[ctx.rand(0, 4)];

      var wrap = ctx.h('<div class="maze-wrap"></div>');
      board = ctx.h('<div class="maze-board"></div>');
      var u = 10, s = '<svg viewBox="-1 -1 ' + (N * u + 2) + ' ' + (N * u + 2) + '" preserveAspectRatio="none">';
      s += '<g stroke="#7a5230" stroke-width="1.6" stroke-linecap="round" fill="none"><path d="';
      s += 'M0 0 H' + N * u + ' M0 0 V' + N * u + ' ';
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var c = cells[y][x];
        if (c.e) s += 'M' + (x + 1) * u + ' ' + y * u + ' V' + (y + 1) * u + ' ';
        if (c.s) s += 'M' + x * u + ' ' + (y + 1) * u + ' H' + (x + 1) * u + ' ';
      }
      s += '"/></g></svg>';
      board.innerHTML = s;

      nestEl = ctx.h('<div class="maze-nest">' + A.nest() + '</div>');
      dinoEl = ctx.h('<div class="maze-dino"><div class="flip">' + A.dino(player) + '</div></div>');
      board.appendChild(nestEl);
      board.appendChild(dinoEl);

      var pad = ctx.h('<div class="pad">' +
        '<button class="pad-btn pad-up" data-d="0,-1">' + A.ICONS.up + '</button>' +
        '<button class="pad-btn pad-left" data-d="-1,0">' + A.ICONS.left + '</button>' +
        '<button class="pad-btn pad-right" data-d="1,0">' + A.ICONS.right + '</button>' +
        '<button class="pad-btn pad-down" data-d="0,1">' + A.ICONS.down + '</button></div>');
      pad.querySelectorAll('button').forEach(function (b) {
        ctx.on(b, 'click', function () { var d = b.getAttribute('data-d').split(','); tryMove(+d[0], +d[1]); });
      });

      wrap.appendChild(board);
      wrap.appendChild(pad);
      stage.appendChild(wrap);
      layout();
      if (CFG.trail) showHint(true);
      mark(pos);
    }

    function layout() {
      var W = stage.clientWidth, H = stage.clientHeight;
      var wrap = board.parentNode, pad = wrap.querySelector('.pad');
      var landscape = W >= H;
      wrap.style.flexDirection = landscape ? 'row' : 'column';
      // Arrow buttons take ~ a third of the short side, board gets the rest.
      var pb = Math.max(54, Math.min(96, (landscape ? H : W) * 0.17));
      pad.style.setProperty('--pb', pb + 'px');
      var padSize = pb * 3 + 12 + 18;
      var size = landscape ? Math.min(H, W - padSize) : Math.min(W, H - padSize);
      size = Math.max(160, Math.floor(size - 8));
      board.style.width = board.style.height = size + 'px';
      cell = size / N;
      var ds = cell * 0.82;
      dinoEl.style.width = ds + 'px'; dinoEl.style.height = ds * 0.9 + 'px';
      nestEl.style.width = cell * 0.86 + 'px'; nestEl.style.height = cell * 0.65 + 'px';
      place(nestEl, goal, cell * 0.86, cell * 0.65);
      place(dinoEl, pos, ds, ds * 0.9);
      for (var k in marks) {
        var p = k.split(',');
        sizeMark(marks[k], [+p[0], +p[1]]);
      }
    }
    ctx.onResize(function () { if (board) layout(); });

    function place(el, p, w, hgt) {
      el.style.transform = 'translate(' + (p[0] * cell + (cell - w) / 2) + 'px,' + (p[1] * cell + (cell - hgt) / 2) + 'px)';
    }
    function sizeMark(m, p) {
      var s = cell * 0.36;
      m.style.width = m.style.height = s + 'px';
      m.style.transform = 'translate(' + (p[0] * cell + (cell - s) / 2) + 'px,' + (p[1] * cell + (cell - s) / 2) + 'px) rotate(' + (m._rot || 0) + 'deg)';
    }
    function mark(p, isHint) {
      var k = p[0] + ',' + p[1];
      if (p[0] === goal[0] && p[1] === goal[1]) return;
      var m = marks[k];
      if (!m) {
        m = ctx.h('<div class="maze-mark">' + A.footprint() + '</div>');
        m._rot = 90;
        board.insertBefore(m, nestEl);
        marks[k] = m;
        sizeMark(m, p);
      }
      m.classList.toggle('hint', !!isHint);
    }

    function showHint(permanent) {
      var path = solve(pos);
      path.forEach(function (p, i) {
        if (i === 0) return;
        var m = mark(p, true);
        var next = path[i + 1] || goal, mk = marks[p[0] + ',' + p[1]];
        if (mk) {
          mk._rot = next[0] > p[0] ? 90 : next[0] < p[0] ? -90 : next[1] > p[1] ? 180 : 0;
          sizeMark(mk, p);
        }
      });
      if (!permanent) {
        clearTimeout(hintTimer);
        hintTimer = ctx.timeout(function () {
          for (var k in marks) marks[k].classList.remove('hint');
        }, 4000);
      }
    }

    /* ---------- moving ---------- */
    function tryMove(dx, dy) {
      if (busy) return false;
      if (!open(pos[0], pos[1], dx, dy)) {
        ctx.sfx.bump();
        dinoEl.classList.remove('wobble'); void dinoEl.offsetWidth; dinoEl.classList.add('wobble');
        bumps++;
        if (CFG.hintAfter && bumps >= CFG.hintAfter) { bumps = 0; showHint(false); }
        return false;
      }
      var from = pos;
      pos = [pos[0] + dx, pos[1] + dy];
      if (dx) dinoEl.classList.toggle('left', dx < 0);
      var mk = marks[from[0] + ',' + from[1]];
      if (mk && !mk.classList.contains('hint')) { mk._rot = dx > 0 ? 90 : dx < 0 ? -90 : dy > 0 ? 180 : 0; sizeMark(mk, from); }
      var ds = cell * 0.82;
      place(dinoEl, pos, ds, ds * 0.9);
      ctx.sfx.step();
      var here = marks[pos[0] + ',' + pos[1]];
      if (here) here.classList.remove('hint');
      if (!here) mark(pos);
      if (pos[0] === goal[0] && pos[1] === goal[1]) win();
      return true;
    }

    function win() {
      busy = true;
      ctx.sfx.match();
      ctx.timeout(function () {
        ctx.sfx.roar();
        dinoEl.firstChild.classList.add('jump');
        nestEl.classList.add('jump');
        ctx.praise(nestEl);
      }, 250);
      round++;
      ctx.progress(round, CFG.rounds);
      ctx.timeout(function () {
        if (round >= CFG.rounds) ctx.complete();
        else newMaze();
      }, 1900);
    }

    /* Pointer: drag along the path, or tap a square in a straight, open line. */
    var dragging = false;
    function cellAt(e) {
      var r = board.getBoundingClientRect();
      return [Math.floor((e.clientX - r.left) / cell), Math.floor((e.clientY - r.top) / cell)];
    }
    function toward(target) {
      var dx = target[0] - pos[0], dy = target[1] - pos[1];
      if (dx === 0 && dy === 0) return;
      if (target[0] < 0 || target[1] < 0 || target[0] >= N || target[1] >= N) return;
      if (dx !== 0 && dy !== 0) {
        // Diagonal: try the bigger direction first, then the other.
        var first = Math.abs(dx) >= Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
        var second = first[0] ? [0, Math.sign(dy)] : [Math.sign(dx), 0];
        if (open(pos[0], pos[1], first[0], first[1])) tryMove(first[0], first[1]);
        else if (open(pos[0], pos[1], second[0], second[1])) tryMove(second[0], second[1]);
        else if (!dragging) tryMove(first[0], first[1]);
        return;
      }
      var sx = Math.sign(dx), sy = Math.sign(dy), steps = Math.abs(dx || dy);
      // Walk step by step, stop at the first wall.
      for (var i = 0; i < steps; i++) {
        if (!open(pos[0], pos[1], sx, sy)) { if (!dragging || i === 0) tryMove(sx, sy); return; }
        if (!tryMove(sx, sy) || busy) return;
      }
    }
    ctx.on(stage, 'pointerdown', function (e) {
      if (!board || !board.contains(e.target)) return;
      dragging = false;
      var c = cellAt(e);
      board._down = c;
      if (c[0] === pos[0] && c[1] === pos[1]) dragging = true;
      else toward(c);
      try { board.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    ctx.on(stage, 'pointermove', function (e) {
      if (!board || !board._down) return;
      var c = cellAt(e);
      if (c[0] === pos[0] && c[1] === pos[1]) { dragging = true; return; }
      if (!dragging) return;
      if (Math.abs(c[0] - pos[0]) + Math.abs(c[1] - pos[1]) >= 1) toward(c);
    });
    function up() { if (board) board._down = null; dragging = false; }
    ctx.on(stage, 'pointerup', up);
    ctx.on(stage, 'pointercancel', up);

    ctx.on(window, 'keydown', function (e) {
      var m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
      if (m) { e.preventDefault(); tryMove(m[0], m[1]); }
    });
  }
};

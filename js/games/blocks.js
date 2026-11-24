/* Stone Drop – an original falling-blocks puzzle in a dino canyon.
 * Stone pieces fall; move and turn them so they fill whole rows. A full row crumbles into sparkles.
 * Clear enough rows to finish the level. No game over: if the stones reach the top,
 * Rex roars and the bottom rows shake loose so there is room again.
 *
 * Controls: ← → move, ↑ turn, ↓ faster, Space drop. Touch: tap = turn, swipe/drag sideways = move,
 * swipe down = drop, and the big buttons next to the canyon. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
(function (D) {
  'use strict';
  var A = D.art;

  // shapes (rotation 0) as cell lists; each has its own stone style
  var SHAPES = {
    O: { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], c: '#ffca28', d: '#b28704', pat: 'egg' },
    I: { cells: [[0, 1], [1, 1], [2, 1], [3, 1]], c: '#4fc3f7', d: '#01579b', pat: 'ice' },
    T: { cells: [[0, 1], [1, 1], [2, 1], [1, 0]], c: '#ba68c8', d: '#6a1b9a', pat: 'gem' },
    L: { cells: [[0, 1], [1, 1], [2, 1], [2, 0]], c: '#ff8a65', d: '#bf360c', pat: 'lava' },
    J: { cells: [[0, 0], [0, 1], [1, 1], [2, 1]], c: '#7986cb', d: '#283593', pat: 'gem' },
    S: { cells: [[1, 0], [2, 0], [0, 1], [1, 1]], c: '#81c784', d: '#2e7d32', pat: 'leaf' },
    Z: { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], c: '#e57373', d: '#b71c1c', pat: 'egg' }
  };
  function rotate(cells, size) { return cells.map(function (p) { return [size - 1 - p[1], p[0]]; }); }
  function sizeOf(k) { return k === 'I' ? 4 : k === 'O' ? 2 : 3; }

  var TXT = {
    el: { inst: 'Γέμισε ολόκληρες σειρές με πέτρες για να γκρεμιστούν!', lines: 'Σειρές', next: 'Επόμενη', roar: 'Ο Ρεξ βρυχήθηκε και έπεσαν οι πέτρες!',
          great: ['Μπράβο!', 'Τέλεια!', 'Γκρέμισε!'], four: 'ΤΕΣΣΕΡΙΣ ΣΕΙΡΕΣ!', tip: 'Πάτα για να γυρίσεις την πέτρα, σύρε για να την κουνήσεις', upright: 'Παίζεται καλύτερα με το κινητό όρθιο!' },
    en: { inst: 'Fill whole rows with stones to make them crumble!', lines: 'Rows', next: 'Next', roar: 'Rex roared and the stones fell down!',
          great: ['Great!', 'Super!', 'Crumble!'], four: 'FOUR ROWS!', tip: 'Tap to turn the stone, swipe to move it', upright: 'Best played with the phone upright!' }
  };

  A.TILES.blocks = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">' +
    '<rect x="30" y="6" width="60" height="88" rx="8" fill="#3e2f25" stroke="#fff" stroke-width="4"/>' +
    [[34, 78, '#ffca28'], [46, 78, '#ffca28'], [58, 78, '#81c784'], [70, 78, '#81c784'], [34, 66, '#ffca28'], [46, 66, '#ffca28'], [70, 66, '#81c784'], [82, 66, '#4fc3f7'],
     [82, 78, '#4fc3f7'], [58, 66, '#ba68c8'], [58, 54, '#ba68c8'], [46, 22, '#ff8a65'], [58, 22, '#ff8a65'], [70, 22, '#ff8a65'], [70, 10, '#ff8a65']].map(function (c) {
      return '<rect x="' + c[0] + '" y="' + c[1] + '" width="11" height="11" rx="3" fill="' + c[2] + '" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/>';
    }).join('') +
    '<svg x="88" y="56" width="30" height="27" viewBox="0 0 200 180">' + A.dinoInner('trex') + '</svg>' +
    '<path d="M64 36 V46 M60 42 L64 47 L68 42" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>';

  D.games.blocks = {
    id: 'blocks', color: '#8d6e63', dark: '#4e342e',

    start: function (ctx) {
      var L = TXT[D.i18n.lang] || TXT.en;
      var CFG = {
        easy:   { cols: 8,  rows: 16, kinds: 'OILT', fall: 0.95, faster: 0.06, goal: 8,  ghost: true },
        medium: { cols: 10, rows: 18, kinds: 'OITLJSZ', fall: 0.7, faster: 0.08, goal: 15, ghost: true },
        hard:   { cols: 10, rows: 20, kinds: 'OITLJSZ', fall: 0.5, faster: 0.1, goal: 25, ghost: false }
      }[ctx.level];
      var COLS = CFG.cols, ROWS = CFG.rows;
      var stage = ctx.stage;
      var grid, piece, nextKind, bag = [], fallT = 0, lockT = 0, lines = 0, score = 0, running = false, done = false;
      var clearing = null, parts = [], shake = 0, last = null, gen = 0, softDrop = false;

      var root = ctx.h('<div class="bk-wrap"><div class="bk-board"><canvas></canvas></div>' +
        '<div class="bk-side"><div class="bk-card bk-next"><small>' + L.next + '</small><canvas width="160" height="160"></canvas></div>' +
        '<div class="bk-card"><small>' + L.lines + '</small><div class="bk-lines"></div><div class="bk-bar"><i></i></div></div>' +
        '<div class="bk-rex">' + A.dino('trex') + '</div><div class="bk-card bk-tilt">📱 ' + L.upright + '</div>' +
        '<div class="bk-pad"><button class="bk-left" aria-label="left">◀</button><button class="bk-turn" aria-label="turn">⟳</button><button class="bk-right" aria-label="right">▶</button>' +
        '<button class="bk-drop" aria-label="drop">⬇</button></div></div></div>');
      stage.appendChild(root);
      var boardEl = root.querySelector('.bk-board'), canvas = boardEl.querySelector('canvas'), g = canvas.getContext('2d');
      var nextCv = root.querySelector('.bk-next canvas'), ng = nextCv.getContext('2d'), rexEl = root.querySelector('.bk-rex');
      var cell = 30, dpr = 1;

      function layout() {
        var SW = stage.clientWidth, SH = stage.clientHeight, portrait = SH > SW * 1.05;
        root.classList.toggle('portrait', portrait);
        var side = root.querySelector('.bk-side');
        var availW = portrait ? SW - 10 : SW - side.offsetWidth - 24, availH = portrait ? SH - side.offsetHeight - 24 : SH - 10;
        cell = Math.max(12, Math.floor(Math.min(availW / COLS, availH / ROWS)));
        boardEl.style.width = cell * COLS + 'px'; boardEl.style.height = cell * ROWS + 'px';
        dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = cell * COLS * dpr; canvas.height = cell * ROWS * dpr;
      }
      ctx.onResize(function () { layout(); });

      /* ---------- pieces ---------- */
      function takeKind() {
        if (!bag.length) bag = ctx.shuffle(CFG.kinds.split(''));
        return bag.pop();
      }
      function cellsOf(p) { return p.cells.map(function (c) { return [c[0] + p.x, c[1] + p.y]; }); }
      function fits(p) {
        return cellsOf(p).every(function (c) { return c[0] >= 0 && c[0] < COLS && c[1] < ROWS && (c[1] < 0 || !grid[c[1]][c[0]]); });
      }
      function spawn() {
        var k = nextKind || takeKind();
        nextKind = takeKind();
        piece = { k: k, cells: SHAPES[k].cells.map(function (c) { return c.slice(); }), x: Math.floor((COLS - sizeOf(k)) / 2), y: k === 'I' ? -1 : 0 };
        lockT = 0; fallT = 0;
        if (!fits(piece)) roarClear(); // the stones reached the top: Rex roars, no game over
        drawNext();
      }
      function move(dx) {
        if (!piece || clearing || !running) return false;
        piece.x += dx;
        if (!fits(piece)) { piece.x -= dx; return false; }
        lockT = 0; ctx.sfx.tap(); return true;
      }
      function turn() {
        if (!piece || clearing || !running || piece.k === 'O') return;
        var old = piece.cells, oldX = piece.x, oldY = piece.y;
        piece.cells = rotate(piece.cells, sizeOf(piece.k));
        var kicks = [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1]];
        for (var i = 0; i < kicks.length; i++) {
          piece.x = oldX + kicks[i][0]; piece.y = oldY + kicks[i][1];
          if (fits(piece)) { lockT = 0; ctx.sfx.flip(); return; }
        }
        piece.cells = old; piece.x = oldX; piece.y = oldY;
      }
      function ghostY() { var p = { cells: piece.cells, x: piece.x, y: piece.y }; while (fits(p)) p.y++; return p.y - 1; }
      function hardDrop() {
        if (!piece || clearing || !running) return;
        var gy = ghostY(); score += (gy - piece.y) * 2; piece.y = gy;
        ctx.sfx.place(); shake = 0.15; lock();
      }
      function lock() {
        cellsOf(piece).forEach(function (c) { if (c[1] >= 0) grid[c[1]][c[0]] = piece.k; });
        piece = null;
        var full = [];
        for (var r = 0; r < ROWS; r++) if (grid[r].every(function (v) { return v; })) full.push(r);
        if (full.length) {
          clearing = { rows: full, t: 0 };
          full.forEach(function (r) { for (var c = 0; c < COLS; c++) sparkle(c, r, SHAPES[grid[r][c]].c); });
          ctx.sfx.crack(); ctx.timeout(function () { ctx.sfx.match(); }, 120);
          rexEl.classList.remove('cheer'); void rexEl.offsetWidth; rexEl.classList.add('cheer');
          if (full.length >= 4) { ctx.say(L.four); ctx.sfx.fanfare(); } else if (Math.random() < 0.5) ctx.say(L.great[Math.floor(Math.random() * L.great.length)], { noCaption: true });
        } else { ctx.sfx.land(); spawn(); }
      }
      function finishClear() {
        var n = clearing.rows.length;
        clearing.rows.forEach(function (r) { grid.splice(r, 1); grid.unshift(new Array(COLS).fill(null)); });
        clearing = null;
        lines += n; score += [0, 100, 300, 500, 800][Math.min(4, n)];
        updateLines();
        if (lines >= CFG.goal) { win(); return; }
        spawn();
      }
      function roarClear() {
        // remove the bottom rows (everything drops down) so there is room again
        var k = Math.ceil(ROWS * 0.4);
        for (var i = 0; i < k; i++) { grid.pop(); grid.unshift(new Array(COLS).fill(null)); }
        shake = 0.6; ctx.sfx.roar(); ctx.say(L.roar);
        rexEl.classList.remove('cheer'); void rexEl.offsetWidth; rexEl.classList.add('cheer');
        if (!fits(piece)) piece.y = -1;
      }
      function win() {
        done = true; running = false;
        ctx.sfx.fanfare(); ctx.sfx.roar(); ctx.praise(boardEl);
        ctx.timeout(function () { ctx.complete((D.i18n.lang === 'el' ? 'Πόντοι: ' : 'Score: ') + score); }, 1500);
      }
      function updateLines() {
        root.querySelector('.bk-lines').textContent = Math.min(lines, CFG.goal) + ' / ' + CFG.goal;
        root.querySelector('.bk-bar i').style.width = Math.min(100, lines / CFG.goal * 100) + '%';
      }
      function sparkle(c, r, color) {
        for (var i = 0; i < 3; i++) parts.push({ x: (c + 0.5) * cell, y: (r + 0.5) * cell, vx: (Math.random() - 0.5) * 300, vy: -Math.random() * 300 - 60, life: 0.7, color: Math.random() < 0.4 ? '#fff59d' : color });
      }

      /* ---------- loop ---------- */
      function fallDelay() { return Math.max(0.08, CFG.fall * Math.pow(1 - CFG.faster, Math.floor(lines / 4))) * (softDrop ? 0.12 : 1); }
      function step(dt) {
        parts.forEach(function (p) { p.vy += 700 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
        parts = parts.filter(function (p) { return p.life > 0; });
        shake = Math.max(0, shake - dt);
        if (!running) return;
        if (clearing) { clearing.t += dt; if (clearing.t > 0.35) finishClear(); return; }
        if (!piece) return;
        fallT += dt;
        var resting = !fits({ cells: piece.cells, x: piece.x, y: piece.y + 1 });
        if (resting) { lockT += dt; if (lockT > 0.45) lock(); }
        else if (fallT >= fallDelay()) { fallT = 0; piece.y++; if (softDrop) score += 1; }
      }
      function frame(t, g0) {
        if (g0 !== gen || !ctx.alive()) return;
        if (last === null) last = t;
        var dt = Math.min(0.05, (t - last) / 1000); last = t;
        step(dt); draw();
        requestAnimationFrame(function (tt) { frame(tt, g0); });
      }

      /* ---------- drawing ---------- */
      function stone(gc, x, y, s, k, alpha) {
        var S = SHAPES[k], r = s * 0.22;
        gc.globalAlpha = alpha == null ? 1 : alpha;
        gc.fillStyle = S.c; gc.strokeStyle = S.d; gc.lineWidth = Math.max(1.5, s * 0.07);
        rr(gc, x + 1, y + 1, s - 2, s - 2, r); gc.fill(); gc.stroke();
        gc.fillStyle = 'rgba(255,255,255,.35)'; rr(gc, x + s * 0.16, y + s * 0.12, s * 0.5, s * 0.16, s * 0.08); gc.fill();
        gc.fillStyle = 'rgba(0,0,0,.18)';
        if (S.pat === 'egg') { gc.beginPath(); gc.arc(x + s * 0.32, y + s * 0.6, s * 0.09, 0, 7); gc.arc(x + s * 0.68, y + s * 0.45, s * 0.07, 0, 7); gc.arc(x + s * 0.62, y + s * 0.76, s * 0.06, 0, 7); gc.fill(); }
        else if (S.pat === 'leaf') { gc.strokeStyle = 'rgba(0,0,0,.2)'; gc.lineWidth = s * 0.06; gc.beginPath(); gc.moveTo(x + s * 0.25, y + s * 0.75); gc.quadraticCurveTo(x + s * 0.5, y + s * 0.4, x + s * 0.78, y + s * 0.35); gc.stroke(); }
        else if (S.pat === 'lava') { gc.fillStyle = 'rgba(255,235,59,.5)'; gc.beginPath(); gc.arc(x + s * 0.65, y + s * 0.62, s * 0.13, 0, 7); gc.fill(); }
        else if (S.pat === 'ice') { gc.strokeStyle = 'rgba(255,255,255,.55)'; gc.lineWidth = s * 0.06; gc.beginPath(); gc.moveTo(x + s * 0.3, y + s * 0.75); gc.lineTo(x + s * 0.7, y + s * 0.4); gc.stroke(); }
        else { gc.fillStyle = 'rgba(255,255,255,.4)'; gc.beginPath(); gc.moveTo(x + s * 0.5, y + s * 0.38); gc.lineTo(x + s * 0.68, y + s * 0.58); gc.lineTo(x + s * 0.5, y + s * 0.78); gc.lineTo(x + s * 0.32, y + s * 0.58); gc.fill(); }
        gc.globalAlpha = 1;
      }
      function rr(gc, x, y, w, h, r) { gc.beginPath(); gc.moveTo(x + r, y); gc.arcTo(x + w, y, x + w, y + h, r); gc.arcTo(x + w, y + h, x, y + h, r); gc.arcTo(x, y + h, x, y, r); gc.arcTo(x, y, x + w, y, r); gc.closePath(); }
      function draw() {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        var W = cell * COLS, H = cell * ROWS;
        var sx = shake > 0 ? (Math.random() - 0.5) * 10 * shake : 0;
        // canyon background
        var bgr = g.createLinearGradient(0, 0, 0, H); bgr.addColorStop(0, '#5d4037'); bgr.addColorStop(1, '#3e2723');
        g.fillStyle = bgr; g.fillRect(0, 0, W, H);
        g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 1;
        for (var c = 1; c < COLS; c++) { g.beginPath(); g.moveTo(c * cell, 0); g.lineTo(c * cell, H); g.stroke(); }
        for (var r = 1; r < ROWS; r++) { g.beginPath(); g.moveTo(0, r * cell); g.lineTo(W, r * cell); g.stroke(); }
        g.save(); g.translate(sx, 0);
        for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {
          if (!grid[r][c]) continue;
          var flashing = clearing && clearing.rows.indexOf(r) >= 0;
          if (flashing) { g.fillStyle = 'rgba(255,255,255,' + (1 - clearing.t / 0.35) + ')'; g.fillRect(c * cell, r * cell, cell, cell); }
          else stone(g, c * cell, r * cell, cell, grid[r][c]);
        }
        if (piece) {
          if (CFG.ghost) { var gy = ghostY(); piece.cells.forEach(function (p) { stone(g, (p[0] + piece.x) * cell, (p[1] + gy) * cell, cell, piece.k, 0.25); }); }
          cellsOf(piece).forEach(function (p) { if (p[1] >= 0) stone(g, p[0] * cell, p[1] * cell, cell, piece.k); });
        }
        parts.forEach(function (p) { g.globalAlpha = Math.min(1, p.life * 2); g.fillStyle = p.color; g.beginPath(); g.arc(p.x, p.y, cell * 0.14, 0, 7); g.fill(); });
        g.globalAlpha = 1; g.restore();
      }
      function drawNext() {
        var s = 34, k = nextKind, cs = SHAPES[k].cells;
        ng.clearRect(0, 0, 160, 160);
        var minX = Math.min.apply(null, cs.map(function (c) { return c[0]; })), maxX = Math.max.apply(null, cs.map(function (c) { return c[0]; }));
        var minY = Math.min.apply(null, cs.map(function (c) { return c[1]; })), maxY = Math.max.apply(null, cs.map(function (c) { return c[1]; }));
        var ox = (160 - (maxX - minX + 1) * s) / 2 - minX * s, oy = (160 - (maxY - minY + 1) * s) / 2 - minY * s;
        cs.forEach(function (c) { stone(ng, ox + c[0] * s, oy + c[1] * s, s, k); });
      }

      /* ---------- input ---------- */
      function hold(btn, fn) { // press-and-hold repeats
        var t1 = null, t2 = null;
        ctx.on(btn, 'pointerdown', function (e) { e.preventDefault(); fn(); t1 = setTimeout(function () { t2 = setInterval(fn, 70); }, 220); });
        function stop() { clearTimeout(t1); clearInterval(t2); }
        ctx.on(btn, 'pointerup', stop); ctx.on(btn, 'pointerleave', stop); ctx.on(btn, 'pointercancel', stop);
      }
      hold(root.querySelector('.bk-left'), function () { move(-1); });
      hold(root.querySelector('.bk-right'), function () { move(1); });
      ctx.on(root.querySelector('.bk-turn'), 'pointerdown', function (e) { e.preventDefault(); turn(); });
      ctx.on(root.querySelector('.bk-drop'), 'pointerdown', function (e) { e.preventDefault(); hardDrop(); });
      ctx.on(window, 'keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp' || e.key === 'x' || e.key === 'X') { e.preventDefault(); if (!e.repeat) turn(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); softDrop = true; }
        else if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); if (!e.repeat) hardDrop(); }
      });
      ctx.on(window, 'keyup', function (e) { if (e.key === 'ArrowDown') softDrop = false; });
      // gestures on the canyon: tap = turn, drag sideways = move column by column, quick swipe down = drop
      var gs = null;
      ctx.on(boardEl, 'pointerdown', function (e) { e.preventDefault(); gs = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, lastCol: e.clientX }; try { boardEl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } });
      ctx.on(boardEl, 'pointermove', function (e) {
        if (!gs) return;
        var dx = e.clientX - gs.lastCol;
        while (Math.abs(dx) >= cell * 0.9) { move(Math.sign(dx)); gs.lastCol += Math.sign(dx) * cell * 0.9; dx = e.clientX - gs.lastCol; gs.moved++; }
      });
      ctx.on(boardEl, 'pointerup', function (e) {
        if (!gs) return;
        var dy = e.clientY - gs.y, dt = performance.now() - gs.t;
        if (dy > cell * 2.5 && dt < 450 && Math.abs(e.clientX - gs.x) < dy) hardDrop();
        else if (!gs.moved && Math.hypot(e.clientX - gs.x, dy) < 12) turn();
        gs = null;
      });

      // read-only snapshot used by the automated tests
      stage._debug = function () { return { grid: grid, piece: piece, cols: COLS, rows: ROWS, lines: lines, goal: CFG.goal, running: running, clearing: !!clearing, done: done }; };

      /* ---------- start ---------- */
      grid = []; for (var r0 = 0; r0 < ROWS; r0++) grid.push(new Array(COLS).fill(null));
      layout(); updateLines(); spawn();
      ctx.instructText(L.inst);
      ctx.timeout(function () { running = true; if ('ontouchstart' in window) ctx.say(L.tip, { noCaption: false }); }, 1200);
      requestAnimationFrame(function (t) { frame(t, gen); });
    }
  };
})(window.Dino);

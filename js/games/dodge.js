/* Rex on the Trail – an original top-scrolling dodge game.
 * Rex runs up a jungle trail; the trail scrolls down towards him with rocks, logs, bushes and stumps.
 * Move him left/right to dodge them (← → keys, or hold a finger/mouse where he should go) and grab stars.
 * Bumping into something never ends the run: Rex stumbles, slows down a moment and keeps going.
 * Sizes use "u" = Rex's size, so it scales to any screen. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
(function (D) {
  'use strict';
  var A = D.art;
  function svg(vb, body) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" preserveAspectRatio="none">' + body + '</svg>'; }

  var OBST = {
    rock:  { w: 0.75, h: 0.48, art: svg('0 0 100 64', '<path d="M4 60 C2 30 22 6 48 4 C74 2 96 26 96 60 Z" fill="#a8a29e" stroke="#57534e" stroke-width="5" stroke-linejoin="round"/><path d="M22 30 C30 22 40 18 48 18" stroke="#e7e5e4" stroke-width="5" fill="none" stroke-linecap="round"/>') },
    log:   { w: 1.35, h: 0.5,  art: svg('0 0 120 50', '<rect x="4" y="5" width="100" height="40" rx="9" fill="#a16207" stroke="#5b3a0b" stroke-width="5"/><path d="M16 19 H70 M26 33 H86" stroke="#5b3a0b" stroke-width="4" stroke-linecap="round"/><ellipse cx="104" cy="25" rx="12" ry="20" fill="#e7c08a" stroke="#5b3a0b" stroke-width="5"/>') },
    bush:  { w: 0.9,  h: 0.6,  art: svg('0 0 100 64', '<path d="M6 62 C0 40 14 26 28 30 C30 10 56 4 66 22 C82 14 98 30 92 46 C100 52 98 62 94 62 Z" fill="#4ade80" stroke="#166534" stroke-width="5" stroke-linejoin="round"/><circle cx="34" cy="40" r="4" fill="#ef4444"/><circle cx="60" cy="30" r="4" fill="#ef4444"/><circle cx="74" cy="46" r="4" fill="#ef4444"/>') },
    stump: { w: 0.62, h: 0.6,  art: svg('0 0 70 70', '<path d="M8 66 L14 22 L56 22 L62 66 Z" fill="#8d5b34" stroke="#5b3a1a" stroke-width="5" stroke-linejoin="round"/><ellipse cx="35" cy="22" rx="22" ry="10" fill="#e7c08a" stroke="#5b3a1a" stroke-width="5"/><ellipse cx="35" cy="22" rx="10" ry="4" fill="none" stroke="#a16207" stroke-width="3"/>') }
  };
  var TREE = svg('0 0 40 40', '<circle cx="20" cy="20" r="18" fill="#3f8f2e"/><circle cx="15" cy="15" r="9" fill="#5cb144"/><circle cx="26" cy="24" r="5" fill="#2f7a22"/>');
  var FLOWERS = svg('0 0 40 30', '<g fill="#f9a8d4" stroke="#be185d" stroke-width="1.5"><circle cx="8" cy="10" r="5"/><circle cx="26" cy="8" r="5"/><circle cx="18" cy="22" r="5"/></g><g fill="#facc15"><circle cx="8" cy="10" r="2"/><circle cx="26" cy="8" r="2"/><circle cx="18" cy="22" r="2"/></g>');

  A.TILES.dodge = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">' +
    '<rect x="20" y="6" width="80" height="88" rx="12" fill="#6dbb4a" stroke="#fff" stroke-width="4"/>' +
    '<rect x="32" y="8" width="56" height="84" fill="#e8c98a"/>' +
    '<svg x="40" y="14" width="22" height="14" viewBox="0 0 100 64">' + OBST.rock.art.replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg>' +
    '<svg x="62" y="38" width="22" height="14" viewBox="0 0 100 64">' + OBST.bush.art.replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg>' +
    '<svg x="40" y="62" width="34" height="30" viewBox="0 0 200 180">' + A.dinoInner('trex') + '</svg>' +
    '<path d="M6 64 L18 56 L18 72 Z M114 64 L102 56 L102 72 Z" fill="#fff"/></svg>';

  D.games.dodge = {
    id: 'dodge', color: '#2e7d32', dark: '#1b5e20',

    start: function (ctx) {
      var CFG = {
        easy:   { speed: 2.4, rows: 8,  gap: [4.2, 5.6], lanes: 3, two: 0,    hints: 99, forgive: 0.3,  rounds: 2 },
        medium: { speed: 3.0, rows: 11, gap: [3.4, 4.6], lanes: 4, two: 0.3,  hints: 2,  forgive: 0.22, rounds: 2 },
        hard:   { speed: 3.6, rows: 14, gap: [2.8, 3.7], lanes: 5, two: 0.55, hints: 0,  forgive: 0.15, rounds: 2 }
      }[ctx.level];
      var KINDS = ['rock', 'log', 'bush', 'stump'];
      var stage = ctx.stage, round = 0, gen = 0;
      var world, path, edgeL, edgeR, rexEl, rexBody, hintEl, trackFill, trackMe, finishEl;
      var W, H, pathX, pathW, u, rexTop;
      var rows, stars, decos, finishD, dist, x, keys = {}, pointerX = null, speedMul, invuln, running, last, hinted;

      // read-only snapshot used by the automated tests
      stage._debug = function () { return { rows: rows, x: x, dist: dist, u: u, pathW: pathW, running: running, lanes: CFG.lanes }; };

      ctx.progress(0, CFG.rounds);
      newRun();

      function newRun() {
        gen++;
        stage.innerHTML = '';
        world = ctx.h('<div class="dodge-world"><div class="dodge-edge l"></div><div class="dodge-path"></div><div class="dodge-edge r"></div>' +
          '<div class="run-track"><div class="fill"></div><div class="goal">' + A.nest() + '</div><div class="me">' + A.dino('trex') + '</div></div>' +
          '<div class="dodge-hint"></div></div>');
        path = world.querySelector('.dodge-path'); edgeL = world.querySelector('.dodge-edge.l'); edgeR = world.querySelector('.dodge-edge.r');
        hintEl = world.querySelector('.dodge-hint');
        trackFill = world.querySelector('.run-track .fill'); trackMe = world.querySelector('.run-track .me');
        rexEl = ctx.h('<div class="dodge-ent dodge-rex"><div class="body"><div class="flip">' + A.dino('trex') + '</div></div></div>');
        rexBody = rexEl.firstChild;
        world.appendChild(rexEl);

        // the course: rows of obstacles, with at least one clear lane in every row
        rows = []; stars = []; decos = [];
        var d = 6;
        for (var i = 0; i < CFG.rows; i++) {
          var count = Math.random() < CFG.two ? 2 : 1;
          var lanes = ctx.shuffle(range(CFG.lanes)).slice(0, count), row = { d: d, obs: [] };
          lanes.forEach(function (ln) {
            var kind = KINDS[ctx.rand(0, KINDS.length - 1)];
            if (kind === 'log' && CFG.lanes > 3 && count > 1) kind = 'rock'; // keep a wide gap free
            var o = { kind: kind, lane: ln, w: OBST[kind].w, h: OBST[kind].h, el: ctx.h('<div class="dodge-ent dodge-obs">' + OBST[kind].art + '</div>') };
            world.appendChild(o.el);
            row.obs.push(o);
          });
          rows.push(row);
          if (i % 2 === 1) { // a star in a free lane, between two rows
            var free = range(CFG.lanes).filter(function (l) { return lanes.indexOf(l) < 0; });
            var s = { d: d + 1.6, lane: free[ctx.rand(0, free.length - 1)], el: ctx.h('<div class="dodge-ent dodge-star">' + A.ICONS.star + '</div>') };
            world.appendChild(s.el); stars.push(s);
          }
          d += CFG.gap[0] + Math.random() * (CFG.gap[1] - CFG.gap[0]);
        }
        finishD = d + 1;
        for (var k = 1; k < finishD + 8; k += 1.6) {
          var dc = { d: k + Math.random(), side: Math.random() < 0.5 ? 0 : 1, flowers: Math.random() < 0.35,
            el: ctx.h('<div class="dodge-ent dodge-deco"></div>') };
          dc.el.innerHTML = dc.flowers ? FLOWERS : TREE;
          world.appendChild(dc.el); decos.push(dc);
        }
        finishEl = ctx.h('<div class="dodge-ent dodge-finish">' + A.nest() + '</div>');
        world.appendChild(finishEl);

        stage.appendChild(world);
        dist = 0; x = 0.5; speedMul = 1; invuln = 0; running = true; hinted = 0; last = null;
        layout();
        ctx.instruct('dodge_inst');
        var g = gen;
        ctx.timeout(function () { requestAnimationFrame(function (t) { frame(t, g); }); }, 1300);
      }
      function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }
      function laneX(l) { return (l + 0.5) / CFG.lanes; }

      function layout() {
        if (!world) return;
        var SW = stage.clientWidth, SH = stage.clientHeight;
        // a tall trail: on wide screens the world is narrower than the stage
        W = Math.min(SW, SH * 0.95); H = SH;
        world.style.width = W + 'px';
        pathX = W * 0.09; pathW = W * 0.82;
        u = Math.min(pathW / Math.max(4.2, CFG.lanes * 1.05), H * (H < 450 ? 0.2 : 0.16));
        rexTop = H - u * 1.25;
        rexEl.style.width = u + 'px'; rexEl.style.height = u * 0.9 + 'px';
        rows.forEach(function (r) { r.obs.forEach(function (o) { o.el.style.width = o.w * u + 'px'; o.el.style.height = o.h * u + 'px'; }); });
        stars.forEach(function (s) { s.el.style.width = s.el.style.height = 0.5 * u + 'px'; });
        decos.forEach(function (dc) { var s = (dc.flowers ? 0.45 : 0.62) * u; dc.el.style.width = s + 'px'; dc.el.style.height = (dc.flowers ? s * 0.75 : s) + 'px'; });
        finishEl.style.width = 1.4 * u + 'px'; finishEl.style.height = 1.05 * u + 'px';
        render();
      }
      ctx.onResize(layout);

      function screenY(d) { return rexTop - (d - dist) * u; }
      function obsLeft(o) { // centred on its lane, but never sticking out of the trail
        return Math.max(pathX, Math.min(pathX + pathW - o.w * u, pathX + laneX(o.lane) * pathW - o.w * u / 2));
      }

      function render() {
        var rx = pathX + x * pathW - u / 2;
        var bob = running ? Math.abs(Math.sin(dist * 4)) * 0.05 * u : 0;
        rexEl.style.transform = 'translate(' + rx + 'px,' + (rexTop - bob) + 'px)';
        rows.forEach(function (r) {
          var y = screenY(r.d), vis = y > -u * 1.5 && y < H + u;
          r.obs.forEach(function (o) {
            o.el.style.display = vis ? '' : 'none';
            if (vis && !o.knocked) o.el.style.transform = 'translate(' + obsLeft(o) + 'px,' + y + 'px)';
          });
        });
        stars.forEach(function (s) {
          var y = screenY(s.d), vis = !s.got && y > -u && y < H + u;
          s.el.style.display = vis ? '' : 'none';
          if (vis) s.el.style.transform = 'translate(' + (pathX + laneX(s.lane) * pathW - 0.25 * u) + 'px,' + y + 'px)';
        });
        decos.forEach(function (dc) {
          var y = screenY(dc.d), vis = y > -u && y < H + u;
          dc.el.style.display = vis ? '' : 'none';
          if (vis) dc.el.style.transform = 'translate(' + (dc.side ? W - pathX * 0.5 - dc.el.offsetWidth / 2 : pathX * 0.5 - dc.el.offsetWidth / 2) + 'px,' + y + 'px)';
        });
        finishEl.style.transform = 'translate(' + (pathX + pathW / 2 - 0.7 * u) + 'px,' + (screenY(finishD) - 0.1 * u) + 'px)';
        var off = (dist * u) % 160;
        path.style.backgroundPosition = '0 ' + off + 'px';
        edgeL.style.backgroundPosition = edgeR.style.backgroundPosition = '0 ' + (dist * u) % 120 + 'px';
        var f = Math.min(1, dist / finishD);
        trackFill.style.width = f * 100 + '%'; trackMe.style.left = f * 100 + '%';
      }

      function frame(t, g) {
        if (g !== gen || !ctx.alive()) return;
        if (last === null) last = t;
        var dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        if (running) {
          speedMul = Math.min(1, speedMul + dt * 0.8);
          dist += CFG.speed * speedMul * dt;
          // sideways movement: keys, or follow the finger / mouse while it is held down
          var MOVE = 1.15, dir = 0;
          if (keys.left && !keys.right) dir = -1; else if (keys.right && !keys.left) dir = 1;
          else if (pointerX !== null && Math.abs(pointerX - x) > 0.015) dir = Math.sign(pointerX - x);
          if (dir) {
            var nx = x + dir * MOVE * dt;
            if (pointerX !== null && !keys.left && !keys.right && Math.sign(pointerX - nx) !== dir) nx = pointerX;
            x = Math.max(0.06, Math.min(0.94, nx));
            rexEl.classList.toggle('left', dir < 0);
          }
          invuln = Math.max(0, invuln - dt);
          check();
          hint();
          if (dist >= finishD) finish();
        }
        render();
        requestAnimationFrame(function (tt) { frame(tt, g); });
      }

      /* Rex vs obstacles (forgiving margins) and stars */
      function check() {
        var m = CFG.forgive, rcx = pathX + x * pathW, half = u * (0.5 - m * 0.6);
        var rTop = rexTop + 0.15 * u, rBot = rexTop + 0.85 * u;
        rows.forEach(function (r) {
          var y = screenY(r.d);
          if (y > rBot || y + 0.7 * u < rTop) return;
          r.obs.forEach(function (o) {
            if (o.knocked || invuln > 0) return;
            var l = obsLeft(o) + o.w * u * m * 0.5, rr = obsLeft(o) + o.w * u * (1 - m * 0.5);
            if (rcx + half > l && rcx - half < rr && y + o.h * u * (1 - m) > rTop && y < rBot) hit(o, y);
          });
        });
        stars.forEach(function (s) {
          if (s.got) return;
          var y = screenY(s.d), sx = pathX + laneX(s.lane) * pathW;
          if (Math.abs(sx - rcx) < 0.6 * u && y + 0.5 * u > rTop && y < rBot) {
            s.got = true; ctx.sfx.sparkle(); ctx.burst(s.el);
          }
        });
      }

      function hit(o, y) {
        invuln = 1.2; speedMul = 0.35; o.knocked = true;
        o.el.classList.add('knocked');
        var away = laneX(o.lane) < x ? -1 : 1;
        o.el.style.transform = 'translate(' + (obsLeft(o) + away * 1.5 * u) + 'px,' + (y + 0.6 * u) + 'px) rotate(' + away * 120 + 'deg)';
        ctx.sfx.bump();
        if (Math.random() < 0.6) ctx.say(ctx.t('run_oops'));
        rexEl.classList.remove('hit', 'blink'); void rexEl.offsetWidth; rexEl.classList.add('hit', 'blink');
      }

      /* easy (and the first rows on medium): an arrow + "Left!/Right!" when Rex is in the way */
      function hint() {
        var show = false, side = 0;
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i], tt = (r.d - dist) / CFG.speed;
          if (tt < 0.15) continue;
          if (tt > 1.2) break;
          var blocked = r.obs.some(function (o) { return !o.knocked && Math.abs(laneX(o.lane) - x) < (o.w * u / pathW) / 2 + 0.06; });
          if (!blocked || hinted >= CFG.hints && !r._hinted) break;
          // nearest free lane
          var free = range(CFG.lanes).filter(function (l) { return !r.obs.some(function (o) { return o.lane === l; }); });
          free.sort(function (a, b) { return Math.abs(laneX(a) - x) - Math.abs(laneX(b) - x); });
          side = laneX(free[0]) < x ? -1 : 1;
          show = true;
          if (!r._hinted) { r._hinted = true; hinted++; ctx.say(ctx.t(side < 0 ? 'dodge_left' : 'dodge_right'), { noCaption: true, rate: 1.1 }); }
          break;
        }
        hintEl.classList.toggle('show', show);
        if (show) {
          hintEl.innerHTML = side < 0 ? A.ICONS.left : A.ICONS.right;
          hintEl.style.setProperty('--hx', side * 10 + 'px');
          hintEl.style.left = (pathX + x * pathW + side * 0.85 * u - 27) + 'px';
          hintEl.style.top = (rexTop + 0.1 * u) + 'px';
        }
      }

      function finish() {
        running = false;
        hintEl.classList.remove('show');
        rexBody.classList.add('dance');
        ctx.sfx.roar();
        ctx.say(ctx.t('run_finish') + ' ' + ctx.t('praise'));
        ctx.burst(finishEl);
        round++;
        ctx.timeout(function () { ctx.progress(round, CFG.rounds); }, 800);
        ctx.timeout(function () { if (round >= CFG.rounds) ctx.complete(); else newRun(); }, 3000);
      }

      /* input */
      function toX(e) { var r = path.getBoundingClientRect(); return Math.max(0.06, Math.min(0.94, (e.clientX - r.left) / r.width)); }
      var pressing = false;
      ctx.on(stage, 'pointerdown', function (e) {
        if (!world || !world.contains(e.target)) return;
        e.preventDefault(); pressing = true; pointerX = toX(e);
        try { world.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      });
      ctx.on(stage, 'pointermove', function (e) { if (pressing) pointerX = toX(e); });
      function release() { pressing = false; pointerX = null; }
      ctx.on(stage, 'pointerup', release);
      ctx.on(stage, 'pointercancel', release);
      ctx.on(window, 'keydown', function (e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { keys.left = true; e.preventDefault(); }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keys.right = true; e.preventDefault(); }
      });
      ctx.on(window, 'keyup', function (e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
      });
    }
  };
})(window.Dino);

/* Jumpy Rex – an original side-scrolling runner. Rex runs on his own; tap anywhere (or the big
 * button, space bar, arrow-up) to jump over rocks, logs and bushes and grab the stars.
 * Bumping into something never ends the run: Rex stumbles, slows down a moment and keeps going.
 * Each run ends at the nest. All sizes are in "u" = Rex's width, so it scales to any screen. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
(function (D) {
  'use strict';
  var A = D.art;

  function svg(body, vb) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" preserveAspectRatio="none">' + body + '</svg>'; }
  var OBST = {
    rock: { w: 0.62, h: 0.42, art: svg('<path d="M4 58 C2 30 22 8 48 6 C74 4 96 26 96 58 Z" fill="#a8a29e" stroke="#57534e" stroke-width="5" stroke-linejoin="round"/><path d="M22 30 C30 22 40 20 48 20" stroke="#e7e5e4" stroke-width="5" fill="none" stroke-linecap="round"/>', '0 0 100 60') },
    log:  { w: 0.9,  h: 0.38, art: svg('<rect x="4" y="6" width="80" height="48" rx="10" fill="#a16207" stroke="#5b3a0b" stroke-width="5"/><path d="M14 22 H60 M22 38 H72" stroke="#5b3a0b" stroke-width="4" stroke-linecap="round"/><ellipse cx="84" cy="30" rx="13" ry="24" fill="#e7c08a" stroke="#5b3a0b" stroke-width="5"/><ellipse cx="84" cy="30" rx="5" ry="10" fill="none" stroke="#a16207" stroke-width="3"/>', '0 0 100 60') },
    bush: { w: 0.78, h: 0.5,  art: svg('<path d="M6 62 C0 40 14 26 28 30 C30 10 56 4 66 22 C82 14 98 30 92 46 C100 52 98 62 94 62 Z" fill="#4ade80" stroke="#166534" stroke-width="5" stroke-linejoin="round"/><circle cx="34" cy="40" r="4" fill="#ef4444"/><circle cx="60" cy="30" r="4" fill="#ef4444"/><circle cx="74" cy="46" r="4" fill="#ef4444"/>', '0 0 100 64') },
    tall: { w: 0.62, h: 0.78, art: svg('<path d="M10 100 C6 70 16 56 30 54 C26 30 40 6 56 8 C76 10 86 34 80 56 C94 60 96 84 92 100 Z" fill="#a8a29e" stroke="#57534e" stroke-width="5" stroke-linejoin="round"/><path d="M40 26 C46 20 54 18 60 20 M24 70 C30 64 38 62 44 64" stroke="#e7e5e4" stroke-width="5" fill="none" stroke-linecap="round"/>', '0 0 100 104') }
  };
  var HILLS = A.dataUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" preserveAspectRatio="none">' +
    '<path d="M0 100 L0 60 C50 20 90 20 140 55 C180 80 210 30 260 30 C310 30 350 70 400 60 L400 100 Z" fill="#a6dd77"/>' +
    '<path d="M0 100 L0 80 C60 55 120 60 170 78 C230 96 300 60 400 80 L400 100 Z" fill="#8fd16a"/></svg>');

  A.TILES.run = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">' +
    '<rect x="6" y="8" width="108" height="84" rx="14" fill="#d9f4ff" stroke="#fff" stroke-width="4"/>' +
    '<path d="M8 76 H112 V80 C112 86 108 90 102 90 H18 C12 90 8 86 8 80 Z" fill="#6dbb4a"/>' +
    '<svg x="62" y="58" width="30" height="20" viewBox="0 0 100 60">' + OBST.rock.art.replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg>' +
    '<path d="M18 52 Q40 18 66 30" stroke="#fff" stroke-width="3" stroke-dasharray="4 4" fill="none"/>' +
    '<svg x="20" y="16" width="46" height="41" viewBox="0 0 200 180" style="overflow:visible"><g transform="rotate(-10 100 90)">' + A.dinoInner('trex') + '</g></svg>' +
    '<path d="M86 20 L89 27 L96 27 L90 31 L92 38 L86 34 L80 38 L82 31 L76 27 L83 27 Z" fill="#ffc93c" stroke="#c58b00" stroke-width="1.5"/></svg>';

  D.games.run = {
    id: 'run', color: '#3949ab', dark: '#1a237e',

    start: function (ctx) {
      var CFG = {
        easy:   { speed: 3.0, count: 6,  gap: [7, 10], kinds: ['rock', 'bush'],              tall: 0,    pairs: 0,    hints: 99, rounds: 2, forgive: 0.3 },
        medium: { speed: 3.8, count: 9,  gap: [6, 9],  kinds: ['rock', 'bush', 'log'],       tall: 0,    pairs: 0,    hints: 2,  rounds: 2, forgive: 0.22 },
        hard:   { speed: 4.6, count: 12, gap: [5, 8],  kinds: ['rock', 'bush', 'log'],       tall: 0.3,  pairs: 0.2,  hints: 0,  rounds: 2, forgive: 0.15 }
      }[ctx.level];
      var GRAV = 15, JUMP_V = 6.1; // apex ≈ 1.24 u, air time ≈ 0.8 s
      var stage = ctx.stage, round = 0, gen = 0;
      var wrap, world, dinoEl, dinoBody, hills, ground, jumpBtn, trackFill, trackMe, finishEl;
      var u, Wd, dinoX, course, stars, finishD, dist, y, vy, onGround, buffered, speedMul, invuln, running, last, hinted;

      // read-only snapshot used by the automated tests
      stage._debug = function () { return { course: course, dist: dist, speed: CFG.speed * speedMul, onGround: onGround, running: running }; };

      ctx.progress(0, CFG.rounds);
      newRun();

      function newRun() {
        gen++;
        stage.innerHTML = '';
        world = ctx.h('<div class="run-world"><div class="run-sun"></div><div class="run-hills"></div><div class="run-ground"></div>' +
          '<div class="run-track"><div class="fill"></div><div class="goal">' + A.nest() + '</div><div class="me">' + A.dino('trex') + '</div></div></div>');
        // The jump button lives OUTSIDE the scene (below it in portrait, beside it in landscape),
        // so it never hides the obstacles that are coming.
        wrap = ctx.h('<div class="run-wrap"></div>');
        jumpBtn = ctx.h('<button class="run-jump" aria-label="jump">' + A.ICONS.up + '</button>');
        hills = world.querySelector('.run-hills');
        hills.style.backgroundImage = 'url("' + HILLS + '")';
        ground = world.querySelector('.run-ground');
        trackFill = world.querySelector('.run-track .fill');
        trackMe = world.querySelector('.run-track .me');
        for (var c = 0; c < 3; c++) {
          var cl = ctx.h('<div class="run-cloud"></div>');
          cl.style.width = (12 + c * 4) + '%'; cl.style.height = (4 + c) + '%';
          cl.style.top = (14 + c * 9) + '%'; cl.style.left = (10 + c * 30) + '%';
          cl._speed = 0.08 + c * 0.04; cl._x = 10 + c * 30;
          world.appendChild(cl);
        }
        dinoEl = ctx.h('<div class="run-ent run-dino"><div class="body">' + A.dino('trex') + '</div></div>');
        dinoBody = dinoEl.firstChild;
        world.appendChild(dinoEl);

        // build the course
        course = []; stars = [];
        var d = 9;
        for (var i = 0; i < CFG.count; i++) {
          var kind = Math.random() < CFG.tall ? 'tall' : CFG.kinds[ctx.rand(0, CFG.kinds.length - 1)];
          addObstacle(kind, d);
          if (kind !== 'tall' && Math.random() < CFG.pairs) addObstacle('rock', d + OBST[kind].w + 0.05);
          if (i % 2 === 1) addStar(d + 0.2, 1.45);
          d += CFG.gap[0] + Math.random() * (CFG.gap[1] - CFG.gap[0]);
        }
        finishD = d + 2;
        finishEl = ctx.h('<div class="run-ent run-finish">' + A.nest() + '</div>');
        world.appendChild(finishEl);

        wrap.appendChild(world);
        wrap.appendChild(jumpBtn);
        stage.appendChild(wrap);
        dist = 0; y = 0; vy = 0; onGround = true; buffered = 0; speedMul = 1; invuln = 0; running = true; hinted = 0;
        layout();
        ctx.instruct('run_inst');
        last = null;
        var g = gen;
        // a short "ready" pause before running
        ctx.timeout(function () { requestAnimationFrame(function (t) { frame(t, g); }); }, 1200);
      }

      function addObstacle(kind, d) {
        var o = { kind: kind, d: d, w: OBST[kind].w, h: OBST[kind].h, el: ctx.h('<div class="run-ent run-obs">' + OBST[kind].art + '</div>') };
        world.appendChild(o.el);
        course.push(o);
      }
      function addStar(d, h) {
        var s = { d: d, h: h, el: ctx.h('<div class="run-ent run-star">' + A.ICONS.star + '</div>') };
        world.appendChild(s.el);
        stars.push(s);
      }

      function layout() {
        if (!world) return;
        var SW = stage.clientWidth, SH = stage.clientHeight, portrait = SH > SW;
        var b = Math.round(Math.max(80, Math.min(124, Math.min(SW, SH) * 0.24)));
        jumpBtn.style.width = jumpBtn.style.height = b + 'px';
        jumpBtn.style.padding = Math.round(b * 0.24) + 'px';
        wrap.style.flexDirection = portrait ? 'column' : 'row';
        if (portrait) {
          // scene on top (not taller than it is wide, so Rex stays big), button underneath
          world.style.width = '100%';
          world.style.height = Math.min(SH - b - 24, SW * 0.95) + 'px';
          world.style.flex = 'none';
        } else {
          world.style.width = ''; world.style.height = '100%'; world.style.flex = '1';
        }
        Wd = world.clientWidth;
        var Hd = world.clientHeight;
        u = Math.min(Hd * 0.3, Wd * 0.2);
        dinoX = Math.max(14, Wd * 0.1);
        dinoEl.style.width = u + 'px'; dinoEl.style.height = u * 0.9 + 'px';
        course.forEach(function (o) { o.el.style.width = o.w * u + 'px'; o.el.style.height = o.h * u + 'px'; });
        stars.forEach(function (s) { s.el.style.width = s.el.style.height = 0.42 * u + 'px'; });
        finishEl.style.width = 1.3 * u + 'px'; finishEl.style.height = u + 'px';
        render();
      }
      ctx.onResize(layout);

      function groundY() { return world.clientHeight * 0.18 - 0.06 * u; } // a touch into the grass

      function render() {
        var gy = groundY();
        dinoEl.style.transform = 'translate(' + dinoX + 'px,' + -(gy + y * u) + 'px)';
        var bob = onGround && running ? Math.abs(Math.sin(dist * 3.2)) * 0.05 * u : 0;
        dinoBody.style.transform = 'translateY(' + -bob + 'px) rotate(' + (onGround ? 0 : vy > 0 ? -12 : 8) + 'deg)';
        course.forEach(function (o) {
          var x = dinoX + (o.d - dist) * u;
          var vis = x > -2 * u && x < Wd + u;
          o.el.style.display = vis ? '' : 'none';
          if (vis && !o.knocked) o.el.style.transform = 'translate(' + x + 'px,' + -gy + 'px)';
        });
        stars.forEach(function (s) {
          var x = dinoX + (s.d - dist) * u;
          var vis = x > -u && x < Wd + u && !s.got;
          s.el.style.display = vis ? '' : 'none';
          if (vis) s.el.style.transform = 'translate(' + x + 'px,' + -(gy + s.h * u) + 'px)';
        });
        var fx = dinoX + (finishD - dist) * u - 0.1 * u;
        finishEl.style.transform = 'translate(' + fx + 'px,' + -(gy - 0.1 * u) + 'px)';
        ground.style.backgroundPosition = -(dist * u) % 60 + 'px 0';
        hills.style.backgroundPosition = -(dist * u * 0.3) + 'px 100%';
        hills.style.backgroundSize = Math.max(Wd, 600) + 'px 100%';
        var f = Math.min(1, dist / finishD);
        trackFill.style.width = f * 100 + '%';
        trackMe.style.left = f * 100 + '%';
      }

      function frame(t, g) {
        if (g !== gen || !ctx.alive()) return;
        if (last === null) last = t;
        var dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        if (running) {
          speedMul = Math.min(1, speedMul + dt * 0.8);
          dist += CFG.speed * speedMul * dt;
          if (!onGround) {
            vy -= GRAV * dt; y += vy * dt;
            if (y <= 0) {
              y = 0; vy = 0; onGround = true; ctx.sfx.land();
              if (buffered > t - 180) doJump(t);
            }
          }
          invuln = Math.max(0, invuln - dt);
          check(t);
          hint();
          world.querySelectorAll('.run-cloud').forEach(function (cl) {
            cl._x -= cl._speed * CFG.speed * speedMul * dt * 3;
            if (cl._x < -25) cl._x = 105;
            cl.style.left = cl._x + '%';
          });
          if (dist >= finishD) finish();
        }
        render();
        requestAnimationFrame(function (tt) { frame(tt, g); });
      }

      /* collisions: Rex's body vs obstacles (with a forgiving margin), and stars */
      function check() {
        var m = CFG.forgive;
        course.forEach(function (o) {
          if (o.knocked) return;
          var left = o.d - dist;
          if (left < 1 - m && left + o.w > m && y < o.h * (1 - m * 0.6)) {
            if (invuln > 0) return;
            hit(o);
          }
        });
        stars.forEach(function (s) {
          if (s.got) return;
          var left = s.d - dist;
          if (left < 0.95 && left + 0.42 > 0.1 && y + 0.85 > s.h && y < s.h + 0.42) {
            s.got = true;
            ctx.sfx.sparkle();
            ctx.burst(s.el);
          }
        });
      }

      function hit(o) {
        invuln = 1.2;
        speedMul = 0.35;
        o.knocked = true;
        o.el.classList.add('knocked');
        var x = dinoX + (o.d - dist) * u;
        o.el.style.transform = 'translate(' + (x + 2 * u) + 'px,' + -(groundY() + 1.2 * u) + 'px) rotate(200deg)';
        ctx.sfx.bump();
        if (Math.random() < 0.6) ctx.say(ctx.t('run_oops'));
        dinoEl.classList.remove('hit', 'blink'); void dinoEl.offsetWidth; dinoEl.classList.add('hit', 'blink');
      }

      /* easy (and the first obstacles on medium): flash the button and say "Jump!" */
      function hint() {
        var next = null;
        for (var i = 0; i < course.length; i++) if (!course[i].knocked && course[i].d - dist > 0.4) { next = course[i]; break; }
        var show = next && hinted < CFG.hints && (next.d - dist) / CFG.speed < 0.75;
        jumpBtn.classList.toggle('hint', !!show && onGround);
        if (show && next._hinted !== true) {
          next._hinted = true; hinted++;
          ctx.say(ctx.t('run_jump'), { noCaption: true, rate: 1.1 });
        }
      }

      function doJump(t) {
        if (!running) return;
        if (!onGround) { buffered = t; return; } // pressed a bit early: jump right on landing
        onGround = false; vy = JUMP_V; y = 0.001;
        ctx.sfx.jump();
      }

      function finish() {
        running = false;
        jumpBtn.classList.remove('hint');
        dinoBody.classList.add('dance');
        ctx.sfx.roar();
        ctx.say(ctx.t('run_finish') + ' ' + ctx.t('praise'));
        ctx.burst(finishEl);
        round++;
        ctx.timeout(function () { ctx.progress(round, CFG.rounds); }, 800);
        ctx.timeout(function () { if (round >= CFG.rounds) ctx.complete(); else newRun(); }, 3000);
      }

      // input: tap anywhere on the world, the big button, space / arrow up
      ctx.on(stage, 'pointerdown', function (e) {
        if (!wrap || !wrap.contains(e.target)) return;
        e.preventDefault();
        doJump(performance.now());
      });
      ctx.on(window, 'keydown', function (e) {
        if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') { e.preventDefault(); doJump(performance.now()); }
      });
    }
  };
})(window.Dino);

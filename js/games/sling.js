/* Rex's Slingshot – an original slingshot physics game.
 * Pull back (anywhere on the screen) and let go: the coconut flies. Knock all the fruit off the
 * wooden/stone towers; every fruit that reaches the ground is eaten by Rex. Unlimited coconuts,
 * nothing can be lost, and ↻ rebuilds the towers.
 *
 * Small built-in physics (no libraries): boxes are axis-aligned and slide, stack, fall and get
 * knocked away; coconuts and fruit are circles that bounce and roll. World: 1600 × 900 units. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
(function (D) {
  'use strict';
  var A = D.art;
  var WW = 1600, WH = 900, G = 820;           // world size and ground level
  var GRAV = 1800, MAXPULL = 170, POWER = 9;  // units/s², max pull distance, speed per unit pulled
  var ANCHOR = { x: 300, y: 600 };

  A.TILES.sling = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">' +
    '<rect x="6" y="8" width="108" height="84" rx="12" fill="#c7ecff" stroke="#fff" stroke-width="4"/><rect x="8" y="76" width="104" height="14" fill="#7cc65a"/>' +
    '<path d="M30 78 V56 M30 58 L22 40 M30 58 L38 40" stroke="#8d5b34" stroke-width="5" stroke-linecap="round" fill="none"/>' +
    '<path d="M22 42 Q30 52 38 42" stroke="#2e9e4a" stroke-width="2.5" fill="none"/>' +
    '<circle cx="30" cy="47" r="5" fill="#6b3f1d"/><path d="M38 44 Q60 18 78 30" stroke="#6b3f1d" stroke-width="2" stroke-dasharray="3 3" fill="none"/>' +
    '<rect x="74" y="48" width="6" height="28" fill="#c68a4e" stroke="#7a4e22" stroke-width="1.5"/><rect x="96" y="48" width="6" height="28" fill="#c68a4e" stroke="#7a4e22" stroke-width="1.5"/>' +
    '<rect x="70" y="42" width="36" height="7" fill="#c68a4e" stroke="#7a4e22" stroke-width="1.5"/>' +
    '<circle cx="88" cy="34" r="8" fill="#43a047" stroke="#1b5e20" stroke-width="2"/><path d="M83 30 Q88 26 93 30" stroke="#a5d6a7" stroke-width="2" fill="none"/></svg>';

  D.games.sling = {
    id: 'sling', color: '#e65100', dark: '#9a3600',

    start: function (ctx) {
      var CFG = {
        easy:   { guide: 1.6, layouts: ['e1', 'e2'] },
        medium: { guide: 0.45, layouts: ['m1', 'm2'] },
        hard:   { guide: 0, layouts: ['h1', 'h2'] }
      }[ctx.level];
      var stage = ctx.stage, round = 0, gen = 0;
      var canvas, g, dpr, scale, offX, offY;
      var blocks, fruits, ball, pull, dragStart, shots, eaten, running, last, winTimer, flying = [];
      var rexImg = new Image(), rexReady = false, rexHappy = 0;
      rexImg.onload = function () { rexReady = true; };
      rexImg.src = A.dataUri(A.dino('trex'));

      /* ---------- levels: blocks are { cx, bottom, w, h, kind } ; fruits { x, bottom, r, kind } ---------- */
      function post(cx, bottom, h, kind) { return { cx: cx, bottom: bottom, w: 26, h: h, kind: kind || 'wood' }; }
      function plank(cx, bottom, w) { return { cx: cx, bottom: bottom, w: w, h: 24, kind: 'wood' }; }
      function box(cx, bottom, s, kind) { return { cx: cx, bottom: bottom, w: s, h: s, kind: kind || 'wood' }; }
      function layout(name) {
        var B = [], F = [], dx = ctx.rand(-40, 40);
        function fruit(x, bottom, kind) { F.push({ x: x + dx, bottom: bottom, kind: kind }); }
        function add(b) { b.cx += dx; B.push(b); }
        if (name === 'e1') {
          add(post(1150, G, 110)); add(post(1290, G, 110)); add(plank(1220, G - 110, 190));
          fruit(1220, G - 134, 'melon');
        } else if (name === 'e2') {
          add(box(1200, G, 72)); add(box(1200, G - 72, 72)); add(box(1200, G - 144, 72));
          fruit(1200, G - 216, 'apple');
          add(post(1360, G, 90)); add(post(1440, G, 90)); add(plank(1400, G - 90, 130));
          fruit(1400, G - 114, 'orange');
        } else if (name === 'm1') {
          add(post(1060, G, 120)); add(post(1180, G, 120)); add(plank(1120, G - 120, 170));
          fruit(1120, G - 144, 'melon');
          add(box(1360, G, 70)); add(box(1360, G - 70, 70)); add(box(1430, G, 70));
          fruit(1360, G - 140, 'apple'); fruit(1430, G - 70, 'orange');
        } else if (name === 'm2') {
          add(post(1150, G, 110)); add(post(1330, G, 110)); add(plank(1240, G - 110, 230));
          add(post(1180, G - 134, 90)); add(post(1300, G - 134, 90)); add(plank(1240, G - 224, 170));
          fruit(1240, G - 248, 'melon'); fruit(1240, G - 134, 'apple');
        } else if (name === 'h1') {
          add(box(1120, G, 64, 'stone')); add(box(1340, G, 64, 'stone')); add(plank(1230, G - 64, 290));
          add(post(1150, G - 88, 100)); add(post(1310, G - 88, 100)); add(plank(1230, G - 188, 210));
          fruit(1230, G - 212, 'melon'); fruit(1230, G - 88, 'orange');
          add(box(1500, G, 64)); add(box(1500, G - 64, 64)); fruit(1500, G - 128, 'apple');
        } else { // h2: a pyramid
          var s = 64, x0 = 1130;
          for (var row = 0; row < 3; row++) for (var i = 0; i < 4 - row; i++) add(box(x0 + row * s / 2 + i * s, G - row * s, s, row === 0 ? 'stone' : 'wood'));
          fruit(x0 + s * 1.5, G - 3 * s, 'melon'); fruit(x0 - 10, G - s, 'apple'); fruit(x0 + 3 * s + 10, G - s, 'orange');
          fruit(x0 + s / 2, G - 2 * s, 'apple');
        }
        return { blocks: B, fruits: F };
      }

      /* ---------- set up a round ---------- */
      function newRound() {
        gen++;
        stage.innerHTML = '';
        var wrap = ctx.h('<div class="sling-world"><canvas></canvas><button class="icon-btn small sling-reset" aria-label="reset">' + A.ICONS.replay + '</button>' +
          '<div class="sling-rotate">📱↻ ' + ctx.t('sling_rotate') + '</div></div>');
        canvas = wrap.querySelector('canvas');
        g = canvas.getContext('2d');
        stage.appendChild(wrap);
        ctx.on(wrap.querySelector('.sling-reset'), 'click', function (e) { e.stopPropagation(); ctx.sfx.whoosh(); build(); });
        layoutCanvas();
        build();
        shots = 0; eaten = 0; running = true;
        ctx.instruct('sling_inst');
        last = null;
        var g0 = gen;
        requestAnimationFrame(function (t) { frame(t, g0); });
      }
      function build() {
        var L = layout(CFG.layouts[round % CFG.layouts.length]);
        blocks = L.blocks.map(function (b) {
          var dens = b.kind === 'stone' ? 2.6 : 1;
          return { x: b.cx, y: b.bottom - b.h / 2, w: b.w, h: b.h, vx: 0, vy: 0, m: b.w * b.h * dens / 1000, kind: b.kind, ang: 0, av: 0, still: 0 };
        });
        fruits = L.fruits.map(function (f) {
          var r = f.kind === 'melon' ? 32 : 24;
          return { x: f.x, y: f.bottom - r, r: r, vx: 0, vy: 0, m: f.kind === 'melon' ? 2 : 1.2, kind: f.kind, rot: 0, gone: false };
        });
        ball = newBall(); pull = null; dragStart = null; flying = [];
      }
      function newBall() { return { x: ANCHOR.x, y: ANCHOR.y, r: 20, vx: 0, vy: 0, m: 4, rot: 0, ready: true, life: 0, slow: 0 }; }

      function layoutCanvas() {
        var w = stage.clientWidth, h = stage.clientHeight;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        scale = Math.min(w / WW, h / WH);
        offX = (w - WW * scale) / 2; offY = (h - WH * scale) / 2;
        // phone held upright: the wide beach is small, so suggest turning it sideways
        var rot = stage.querySelector('.sling-rotate');
        if (rot) rot.style.display = h > w * 1.1 ? 'block' : 'none';
      }
      ctx.onResize(function () { if (canvas) layoutCanvas(); });

      /* ---------- physics ---------- */
      function circleBox(c, b, e) {
        var px = Math.max(b.x - b.w / 2, Math.min(c.x, b.x + b.w / 2));
        var py = Math.max(b.y - b.h / 2, Math.min(c.y, b.y + b.h / 2));
        var dx = c.x - px, dy = c.y - py, d2 = dx * dx + dy * dy;
        if (d2 >= c.r * c.r) return 0;
        var d = Math.sqrt(d2), nx, ny;
        if (d < 0.001) { nx = 0; ny = -1; d = 0; } else { nx = dx / d; ny = dy / d; }
        var pen = c.r - d, imC = 1 / c.m, imB = 1 / b.m, tot = imC + imB;
        c.x += nx * pen * imC / tot; c.y += ny * pen * imC / tot;
        b.x -= nx * pen * imB / tot; b.y -= ny * pen * imB / tot;
        var vrel = (c.vx - b.vx) * nx + (c.vy - b.vy) * ny;
        if (vrel < 0) {
          var j = -(1 + e) * vrel / tot;
          c.vx += j * imC * nx; c.vy += j * imC * ny;
          b.vx -= j * imB * nx; b.vy -= j * imB * ny;
          if (j > 400) { b.av += (Math.random() - 0.5) * j / 300; b.still = 0; }
          return j;
        }
        return 0;
      }
      function circleCircle(a, b, e) {
        var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy), rr = a.r + b.r;
        if (d >= rr || d < 0.001) return;
        var nx = dx / d, ny = dy / d, pen = rr - d, ia = 1 / a.m, ib = 1 / b.m, tot = ia + ib;
        a.x -= nx * pen * ia / tot; a.y -= ny * pen * ia / tot; b.x += nx * pen * ib / tot; b.y += ny * pen * ib / tot;
        var vrel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vrel < 0) { var j = -(1 + e) * vrel / tot; a.vx -= j * ia * nx; a.vy -= j * ia * ny; b.vx += j * ib * nx; b.vy += j * ib * ny; }
      }
      function boxBox(a, b) {
        var dx = b.x - a.x, dy = b.y - a.y;
        var px = (a.w + b.w) / 2 - Math.abs(dx), py = (a.h + b.h) / 2 - Math.abs(dy);
        if (px <= 0 || py <= 0) return;
        var ia = 1 / a.m, ib = 1 / b.m, tot = ia + ib;
        if (px < py) {
          var sx = dx < 0 ? -1 : 1;
          a.x -= sx * px * ia / tot; b.x += sx * px * ib / tot;
          var rv = (b.vx - a.vx) * sx;
          if (rv < 0) { var j = -1.1 * rv / tot; a.vx -= j * ia * sx; b.vx += j * ib * sx; }
        } else {
          var sy = dy < 0 ? -1 : 1;
          a.y -= sy * py * ia / tot; b.y += sy * py * ib / tot;
          var rvy = (b.vy - a.vy) * sy, jy = 0;
          if (rvy < 0) { jy = -1.05 * rvy / tot; a.vy -= jy * ia * sy; b.vy += jy * ib * sy; }
          // Coulomb friction: never more than 0.6 × how hard they press together,
          // so a resting stack holds still but a coconut hit can still knock a post out
          var jt = -(b.vx - a.vx) / tot, lim = 0.6 * jy;
          jt = Math.max(-lim, Math.min(lim, jt));
          a.vx -= jt * ia; b.vx += jt * ib;
          if (sy > 0) a.resting = true; else b.resting = true; // the upper one rests on the lower one
        }
      }

      function step(dt) {
        var all = blocks;
        all.forEach(function (b) { b.onGround = false; b.resting = false; b.vy += GRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.ang += b.av * dt; });
        fruits.forEach(function (f) { if (f.gone) return; f.vy += GRAV * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vx * dt / f.r; });
        if (!ball.ready) { ball.vy += GRAV * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.rot += ball.vx * dt / ball.r; ball.life += dt; }

        for (var it = 0; it < 4; it++) {
          for (var i = 0; i < blocks.length; i++) for (var k = i + 1; k < blocks.length; k++) boxBox(blocks[i], blocks[k]);
          blocks.forEach(function (b) {
            if (b.y + b.h / 2 > G) { b.y = G - b.h / 2; if (b.vy > 0) b.vy = b.vy > 200 ? -b.vy * 0.2 : 0; b.onGround = true; }
          });
          fruits.forEach(function (f) {
            if (f.gone) return;
            blocks.forEach(function (b) { circleBox(f, b, 0.15); });
            fruits.forEach(function (o) { if (o !== f && !o.gone) circleCircle(f, o, 0.2); });
          });
          if (!ball.ready) {
            blocks.forEach(function (b) { var j = circleBox(ball, b, 0.25); if (j > 600 && it === 0) ctx.sfx.bump(); });
            fruits.forEach(function (f) { if (!f.gone) circleCircle(ball, f, 0.35); });
          }
        }
        // ground and friction
        blocks.forEach(function (b) {
          if (b.onGround) { // sliding on the grass slows down (Coulomb friction with the ground)
            var fr = 0.7 * GRAV * dt;
            b.vx = Math.abs(b.vx) <= fr ? 0 : b.vx - Math.sign(b.vx) * fr;
          }
          if (b.onGround || b.resting) { b.av *= Math.max(0, 1 - 10 * dt); b.ang *= Math.max(0, 1 - 6 * dt); }
          else { b.av *= 0.995; b.ang = Math.max(-0.5, Math.min(0.5, b.ang)); }
          if (Math.abs(b.vx) < 6 && Math.abs(b.vy) < 6) { b.still += dt; if (b.still > 0.3) { b.vx = 0; } } else b.still = 0;
        });
        [ball].concat(fruits).forEach(function (c) {
          if (c.gone || c.ready) return;
          if (c.y + c.r > G) { c.y = G - c.r; c.vy = c.vy > 120 ? -c.vy * 0.35 : 0; c.vx *= Math.max(0, 1 - 2.2 * dt); }
        });
        // fruit reached the ground (or left the world): Rex eats it!
        fruits.forEach(function (f) {
          if (f.gone) return;
          var onGround = f.y + f.r >= G - 1.5;
          if (onGround || f.x < -100 || f.x > WW + 100) eat(f);
        });
        // the coconut is finished: stopped, gone, or flying too long
        if (!ball.ready) {
          var sp = Math.abs(ball.vx) + Math.abs(ball.vy);
          ball.slow = sp < 40 ? ball.slow + dt : 0;
          if (ball.slow > 0.6 || ball.life > 6 || ball.x > WW + 200 || ball.x < -200) ball = newBall();
        }
        blocks = blocks.filter(function (b) { return b.x > -300 && b.x < WW + 300 && b.y < WH + 300; });
      }

      function eat(f) {
        f.gone = true; eaten++;
        flying.push({ f: f, t: 0, x0: f.x, y0: f.y });
        ctx.sfx.pop();
        ctx.timeout(function () { ctx.sfx.munch(); rexHappy = 1; }, 600);
        if (fruits.every(function (x) { return x.gone; })) win();
        else if (Math.random() < 0.6) ctx.say(ctx.t('sling_yum'), { noCaption: true });
      }

      function win() {
        if (!running) return;
        running = false;
        round++;
        ctx.timeout(function () { ctx.sfx.roar(); rexHappy = 3; ctx.praise(canvas); }, 800);
        ctx.timeout(function () { ctx.progress(round, 2); }, 1200);
        ctx.timeout(function () { if (round >= 2) ctx.complete(); else newRound(); }, 3200);
      }

      /* ---------- loop ---------- */
      function frame(t, g0) {
        if (g0 !== gen || !ctx.alive()) return;
        if (last === null) last = t;
        var dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        var n = Math.ceil(dt / (1 / 120));
        for (var i = 0; i < n; i++) step(dt / n);
        flying.forEach(function (fl) { fl.t += dt; });
        flying = flying.filter(function (fl) { return fl.t < 0.8; });
        rexHappy = Math.max(0, rexHappy - dt);
        draw();
        requestAnimationFrame(function (tt) { frame(tt, g0); });
      }

      /* ---------- drawing ---------- */
      function draw() {
        var w = canvas.width, h = canvas.height;
        g.setTransform(1, 0, 0, 1, 0, 0);
        var sky = g.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#8fd8ff'); sky.addColorStop(1, '#e3f7ff');
        g.fillStyle = sky; g.fillRect(0, 0, w, h);
        g.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);
        // scenery
        g.fillStyle = '#ffe14d'; g.beginPath(); g.arc(1450, 120, 55, 0, 7); g.fill();
        g.fillStyle = '#a6dd77'; g.beginPath(); g.moveTo(-400, G); g.quadraticCurveTo(300, 560, 800, 700); g.quadraticCurveTo(1300, 560, 2000, G); g.fill();
        g.fillStyle = '#6dbb4a'; g.fillRect(-2000, G, 5600, 600);
        g.fillStyle = '#5aa83f'; g.fillRect(-2000, G, 5600, 14);
        // Rex
        if (rexReady) {
          var bounce = rexHappy > 0 ? Math.abs(Math.sin(performance.now() / 120)) * 22 : 0;
          g.drawImage(rexImg, 40, G - 190 - bounce, 210, 190);
        }
        // slingshot (back arm, band, coconut, front arm)
        var tipL = { x: ANCHOR.x - 26, y: ANCHOR.y - 6 }, tipR = { x: ANCHOR.x + 26, y: ANCHOR.y - 6 };
        g.strokeStyle = '#8d5b34'; g.lineCap = 'round'; g.lineWidth = 22;
        g.beginPath(); g.moveTo(ANCHOR.x, G); g.lineTo(ANCHOR.x, ANCHOR.y + 70); g.stroke();
        g.lineWidth = 16;
        g.beginPath(); g.moveTo(ANCHOR.x, ANCHOR.y + 75); g.lineTo(tipR.x, tipR.y); g.stroke();
        var bx = ball.ready ? ANCHOR.x + (pull ? pull.x : 0) : ANCHOR.x, by = ball.ready ? ANCHOR.y + (pull ? pull.y : 0) : ANCHOR.y;
        g.strokeStyle = '#2e9e4a'; g.lineWidth = 7;
        g.beginPath(); g.moveTo(tipR.x, tipR.y); g.lineTo(bx, by); g.stroke();
        // trajectory guide
        if (ball.ready && pull && CFG.guide > 0) {
          var v = launchVelocity();
          g.fillStyle = 'rgba(255,255,255,.9)';
          for (var tt = 0.06; tt < CFG.guide; tt += 0.06) {
            var px = bx + v.x * tt, py = by + v.y * tt + GRAV * tt * tt / 2;
            if (py > G) break;
            g.beginPath(); g.arc(px, py, 7 - tt * 2.5, 0, 7); g.fill();
          }
        }
        blocks.forEach(drawBlock);
        fruits.forEach(function (f) { if (!f.gone) drawFruit(f.x, f.y, f.r, f.kind, f.rot); });
        flying.forEach(function (fl) { // eaten fruit flies to Rex's mouth
          var k = Math.min(1, fl.t / 0.6), x = fl.x0 + (210 - fl.x0) * k, y = fl.y0 + (G - 150 - fl.y0) * k - Math.sin(k * Math.PI) * 200;
          g.globalAlpha = 1 - Math.max(0, (fl.t - 0.6) / 0.2); drawFruit(x, y, fl.f.r * (1 - k * 0.5), fl.f.kind, fl.t * 8); g.globalAlpha = 1;
        });
        drawCoconut(ball.ready ? bx : ball.x, ball.ready ? by : ball.y, ball.r, ball.rot);
        g.strokeStyle = '#2e9e4a'; g.lineWidth = 7;
        if (ball.ready) { g.beginPath(); g.moveTo(tipL.x, tipL.y); g.lineTo(bx, by); g.stroke(); }
        g.strokeStyle = '#8d5b34'; g.lineWidth = 16;
        g.beginPath(); g.moveTo(ANCHOR.x, ANCHOR.y + 75); g.lineTo(tipL.x, tipL.y); g.stroke();
      }
      function drawBlock(b) {
        g.save(); g.translate(b.x, b.y); g.rotate(b.ang);
        if (b.kind === 'stone') {
          g.fillStyle = '#a8a29e'; g.strokeStyle = '#57534e';
          g.lineWidth = 4; g.beginPath(); g.rect(-b.w / 2, -b.h / 2, b.w, b.h); g.fill(); g.stroke();
          g.strokeStyle = '#78716c'; g.lineWidth = 3; g.beginPath(); g.moveTo(-b.w / 4, -b.h / 2); g.lineTo(-b.w / 8, 0); g.lineTo(b.w / 5, b.h / 4); g.stroke();
        } else {
          g.fillStyle = '#d19a5c'; g.strokeStyle = '#7a4e22'; g.lineWidth = 4;
          g.beginPath(); g.rect(-b.w / 2, -b.h / 2, b.w, b.h); g.fill(); g.stroke();
          g.strokeStyle = 'rgba(122,78,34,.45)'; g.lineWidth = 2; g.beginPath();
          if (b.w >= b.h) { g.moveTo(-b.w / 2 + 8, -b.h / 6); g.lineTo(b.w / 2 - 8, -b.h / 6); g.moveTo(-b.w / 3, b.h / 5); g.lineTo(b.w / 3, b.h / 5); }
          else { g.moveTo(-b.w / 6, -b.h / 2 + 8); g.lineTo(-b.w / 6, b.h / 2 - 8); g.moveTo(b.w / 5, -b.h / 3); g.lineTo(b.w / 5, b.h / 3); }
          g.stroke();
        }
        g.restore();
      }
      function drawFruit(x, y, r, kind, rot) {
        g.save(); g.translate(x, y); g.rotate(rot || 0);
        if (kind === 'melon') {
          g.fillStyle = '#43a047'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
          g.strokeStyle = '#1b5e20'; g.lineWidth = 4; g.stroke();
          g.strokeStyle = '#a5d6a7'; g.lineWidth = 3;
          [-0.5, 0, 0.5].forEach(function (o) { g.beginPath(); g.ellipse(o * r, 0, r * 0.18, r * 0.92, 0, 0, 7); g.stroke(); });
        } else if (kind === 'apple') {
          g.fillStyle = '#ef4444'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.strokeStyle = '#7f1d1d'; g.lineWidth = 3; g.stroke();
          g.strokeStyle = '#6b3f1d'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -r); g.lineTo(3, -r - 10); g.stroke();
          g.fillStyle = '#4ade80'; g.beginPath(); g.ellipse(9, -r - 6, 8, 4, -0.5, 0, 7); g.fill();
        } else {
          g.fillStyle = '#fb923c'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.strokeStyle = '#9a3412'; g.lineWidth = 3; g.stroke();
          g.fillStyle = '#16a34a'; g.beginPath(); g.ellipse(0, -r + 2, 7, 4, 0, 0, 7); g.fill();
        }
        g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-r * 0.35, -r * 0.4, r * 0.25, r * 0.13, -0.6, 0, 7); g.fill();
        g.restore();
      }
      function drawCoconut(x, y, r, rot) {
        g.save(); g.translate(x, y); g.rotate(rot);
        var grd = g.createRadialGradient(-r * 0.35, -r * 0.35, 2, 0, 0, r);
        grd.addColorStop(0, '#b0743f'); grd.addColorStop(1, '#5b3412');
        g.fillStyle = grd; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.strokeStyle = '#3b2208'; g.lineWidth = 2.5; g.stroke();
        g.fillStyle = '#2b1705';
        [[-0.25, -0.3], [0.25, -0.3], [0, 0.05]].forEach(function (p) { g.beginPath(); g.arc(p[0] * r, p[1] * r, r * 0.12, 0, 7); g.fill(); });
        g.restore();
      }

      /* ---------- input: pull back from anywhere, let go to launch ---------- */
      function toWorld(e) {
        var rc = canvas.getBoundingClientRect();
        return { x: (e.clientX - rc.left - offX) / scale, y: (e.clientY - rc.top - offY) / scale };
      }
      function launchVelocity() { return { x: -pull.x * POWER, y: -pull.y * POWER }; }
      ctx.on(stage, 'pointerdown', function (e) {
        if (!canvas || !running || !ball.ready || e.target.closest('.sling-reset') || !stage.contains(e.target)) return;
        e.preventDefault();
        dragStart = toWorld(e); pull = { x: 0, y: 0 };
        try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      });
      ctx.on(stage, 'pointermove', function (e) {
        if (!dragStart) return;
        var p = toWorld(e), dx = p.x - dragStart.x, dy = p.y - dragStart.y, len = Math.sqrt(dx * dx + dy * dy);
        if (len > MAXPULL) { dx *= MAXPULL / len; dy *= MAXPULL / len; }
        pull = { x: dx, y: dy };
      });
      function release() {
        if (!dragStart) return;
        dragStart = null;
        if (!pull || Math.sqrt(pull.x * pull.x + pull.y * pull.y) < 25) { pull = null; return; }
        var v = launchVelocity();
        ball.x = ANCHOR.x + pull.x; ball.y = ANCHOR.y + pull.y; ball.vx = v.x; ball.vy = v.y; ball.ready = false;
        pull = null; shots++;
        ctx.sfx.whoosh();
      }
      ctx.on(stage, 'pointerup', release);
      ctx.on(stage, 'pointercancel', function () { dragStart = null; pull = null; });

      // read-only snapshot used by the automated tests
      stage._debug = function () {
        return { ready: ball.ready, running: running, fruits: fruits.filter(function (f) { return !f.gone; }).map(function (f) { return { x: f.x, y: f.y }; }),
          blocks: blocks.map(function (b) { return { x: b.x, y: b.y, w: b.w, h: b.h }; }), scale: scale, offX: offX, offY: offY, eaten: eaten, shots: shots };
      };

      ctx.progress(0, 2);
      newRound();
    }
  };
})(window.Dino);

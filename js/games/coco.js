/* Coconut Pop – an original bouncing-ball splitting game on the beach.
 * Rex walks along the sand and shoots a vine straight up. A coconut hit by the vine cracks into
 * two smaller ones; the smallest ones pop open. Clear all the coconuts to win the round.
 * A coconut landing on Rex's head is just a funny "bonk" – there is no losing.
 *
 * Controls: tap/click somewhere – Rex walks there and shoots; drag to steer;
 * keyboard: ← → to walk, Space / ↑ to shoot.
 * Units: the screen height is 1, so everything scales with the screen. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
(function (D) {
  'use strict';
  var A = D.art;

  A.TILES.coco = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">' +
    '<defs><radialGradient id="cg" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#a86b3c"/><stop offset="1" stop-color="#5b3412"/></radialGradient></defs>' +
    '<rect x="6" y="6" width="108" height="88" rx="14" fill="#c7ecff" stroke="#fff" stroke-width="4"/>' +
    '<rect x="8" y="70" width="104" height="22" rx="4" fill="#f3d98f"/>' +
    '<circle cx="80" cy="30" r="15" fill="url(#cg)" stroke="#3b2208" stroke-width="2"/><circle cx="76" cy="26" r="2" fill="#2b1705"/><circle cx="84" cy="26" r="2" fill="#2b1705"/><circle cx="80" cy="32" r="2" fill="#2b1705"/>' +
    '<circle cx="100" cy="52" r="8" fill="url(#cg)" stroke="#3b2208" stroke-width="2"/>' +
    '<path d="M42 66 V20" stroke="#2e9e4a" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M42 50 q-8 -2 -10 -8 q8 0 10 8 M42 36 q8 -2 10 -8 q-8 0 -10 8" fill="#4ade80" stroke="#166534" stroke-width="1"/>' +
    '<svg x="22" y="50" width="40" height="36" viewBox="0 0 200 180">' + A.dinoInner('trex') + '</svg></svg>';

  D.games.coco = {
    id: 'coco', color: '#a1662f', dark: '#5b3412',

    start: function (ctx) {
      var CFG = {
        easy:   { start: [2],    grav: 1.1, vx: 0.15, rounds: 2 },
        medium: { start: [3],    grav: 1.35, vx: 0.19, rounds: 2 },
        hard:   { start: [3, 2], grav: 1.6, vx: 0.23, rounds: 2 }
      }[ctx.level];
      var R = [0.045, 0.065, 0.09, 0.12];      // coconut radius per size
      var BOUNCE = [0.3, 0.42, 0.56, 0.7];     // how high each size bounces above the sand
      var FLOOR = 0.9, DINO_H = 0.17, DINO_W = 0.19, WALK = 1.05, VINE_SPEED = 2.1;
      var stage = ctx.stage, round = 0, gen = 0;
      var world, canvas, g, dpr, Hpx, aspect;
      var dino, cocos, vine, bits, keys = {}, running, last, invuln, dinoImg, dinoReady = false;

      dinoImg = new Image();
      dinoImg.onload = function () { dinoReady = true; };
      dinoImg.src = A.dataUri(A.dino('trex'));

      // read-only snapshot used by the automated tests
      stage._debug = function () { return { cocos: cocos, dino: dino, vine: vine, aspect: aspect, running: running }; };

      ctx.progress(0, CFG.rounds);
      newRound();

      function newRound() {
        gen++;
        stage.innerHTML = '';
        world = ctx.h('<div class="coco-world"><canvas></canvas></div>');
        canvas = world.querySelector('canvas');
        g = canvas.getContext('2d');
        stage.appendChild(world);
        layout();
        dino = { x: aspect / 2, target: null, face: 1, shootOnArrive: false, bob: 0 };
        vine = null; bits = []; invuln = 0; running = false;
        cocos = CFG.start.map(function (size, i) {
          var dir = i % 2 ? -1 : 1;
          return { x: aspect * (i % 2 ? 0.75 : 0.25), y: 0.32, vx: CFG.vx * dir, vy: 0, size: size, spin: 0 };
        });
        ctx.instruct('coco_inst');
        last = null;
        var g0 = gen;
        ctx.timeout(function () { running = true; }, 1300);
        requestAnimationFrame(function (t) { frame(t, g0); });
      }

      function layout() {
        if (!canvas) return;
        // in portrait keep the beach about square (a tall narrow beach crowds the coconuts)
        var SW = stage.clientWidth, SH = stage.clientHeight;
        var off = SH > SW ? Math.max(0, (SH - SW * 1.05) / 2) : 0;
        world.style.top = world.style.bottom = off + 'px';
        var w = world.clientWidth, h = world.clientHeight;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        Hpx = h; aspect = w / h;
        if (dino) dino.x = Math.min(dino.x, aspect - DINO_W / 2);
        if (cocos) cocos.forEach(function (c) { c.x = Math.min(c.x, aspect - R[c.size]); });
      }
      ctx.onResize(layout);

      /* ---------- the game loop ---------- */
      function frame(t, g0) {
        if (g0 !== gen || !ctx.alive()) return;
        if (last === null) last = t;
        var dt = Math.min(0.04, (t - last) / 1000);
        last = t;
        if (running) step(dt);
        draw();
        requestAnimationFrame(function (tt) { frame(tt, g0); });
      }

      function step(dt) {
        // Rex walks toward the tapped spot (or with the arrow keys)
        var dir = 0;
        if (keys.left) dir = -1; else if (keys.right) dir = 1;
        else if (dino.target !== null) {
          var dx = dino.target - dino.x;
          if (Math.abs(dx) < 0.01) {
            dino.target = null;
            if (dino.shootOnArrive) { dino.shootOnArrive = false; shoot(); }
          } else dir = Math.sign(dx);
        }
        if (dir) {
          dino.x = Math.max(DINO_W / 2, Math.min(aspect - DINO_W / 2, dino.x + dir * WALK * dt));
          if (dino.target !== null && Math.sign(dino.target - dino.x) !== dir) dino.x = dino.target; // don't overshoot
          dino.face = dir;
          dino.bob += dt * 14;
        }
        invuln = Math.max(0, invuln - dt);

        // the vine grows up until it reaches the top
        if (vine) {
          vine.top -= VINE_SPEED * dt;
          if (vine.top <= 0) vine = null;
        }

        // coconuts bounce
        cocos.forEach(function (c) {
          var r = R[c.size];
          c.vy += CFG.grav * dt;
          c.x += c.vx * dt; c.y += c.vy * dt;
          c.spin += c.vx * dt * 6;
          if (c.x - r < 0) { c.x = r; c.vx = Math.abs(c.vx); }
          if (c.x + r > aspect) { c.x = aspect - r; c.vx = -Math.abs(c.vx); }
          if (c.y - r < 0) { c.y = r; c.vy = Math.abs(c.vy); }
          if (c.y + r > FLOOR) { c.y = FLOOR - r; c.vy = -Math.sqrt(2 * CFG.grav * BOUNCE[c.size]); ctx.sfx.land(); }
        });

        // vine hits a coconut?
        if (vine) {
          for (var i = 0; i < cocos.length; i++) {
            var c = cocos[i], r = R[c.size];
            if (Math.abs(c.x - vine.x) < r + 0.03 && c.y + r > vine.top && c.y - r < FLOOR) { // forgiving for little fingers
              split(i);
              vine = null;
              break;
            }
          }
        }

        // a coconut bonks Rex?
        if (!invuln) {
          var top = FLOOR - DINO_H * 0.85, left = dino.x - DINO_W * 0.3, right = dino.x + DINO_W * 0.3;
          cocos.forEach(function (c) {
            if (invuln) return;
            var r = R[c.size] * 0.85;
            var nx = Math.max(left, Math.min(c.x, right)), ny = Math.max(top, Math.min(c.y, FLOOR));
            if ((c.x - nx) * (c.x - nx) + (c.y - ny) * (c.y - ny) < r * r) {
              invuln = 2;
              c.vy = -Math.sqrt(2 * CFG.grav * BOUNCE[c.size]);
              c.vx = (c.x < dino.x ? -1 : 1) * Math.abs(c.vx);
              ctx.sfx.bump();
              ctx.say(ctx.t('coco_oops'));
            }
          });
        }

        // flying shell halves and sparkles
        bits.forEach(function (b) { b.vy += 2 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt; b.life -= dt; });
        bits = bits.filter(function (b) { return b.life > 0; });

        if (!cocos.length && running) win();
      }

      function shoot() {
        if (vine || !running) return;
        vine = { x: dino.x + dino.face * DINO_W * 0.18, top: FLOOR - DINO_H * 0.8 };
        ctx.sfx.whoosh();
      }

      function split(i) {
        var c = cocos[i];
        cocos.splice(i, 1);
        var r = R[c.size];
        if (c.size > 0) {
          ctx.sfx.crack();
          var hop = -Math.sqrt(2 * CFG.grav * 0.12);
          [-1, 1].forEach(function (d) {
            cocos.push({ x: c.x + d * r * 0.4, y: c.y, vx: d * Math.abs(CFG.vx) * 1.05, vy: hop, size: c.size - 1, spin: 0 });
          });
        } else {
          ctx.sfx.pop();
          ctx.sfx.sparkle();
          [-1, 1].forEach(function (d) { bits.push({ kind: 'half', x: c.x, y: c.y, vx: d * 0.25, vy: -0.6, rot: 0, vr: d * 6, r: r, life: 1.2 }); });
        }
        for (var k = 0; k < 8; k++) {
          var a = Math.random() * Math.PI * 2;
          bits.push({ kind: 'spark', x: c.x, y: c.y, vx: Math.cos(a) * 0.5, vy: Math.sin(a) * 0.5 - 0.3, rot: 0, vr: 0, r: 0.012, life: 0.6 });
        }
      }

      function win() {
        running = false; vine = null;
        ctx.timeout(function () { ctx.sfx.roar(); dino.dance = true; ctx.praise(world); }, 400);
        round++;
        ctx.timeout(function () { ctx.progress(round, CFG.rounds); }, 1000);
        ctx.timeout(function () { if (round >= CFG.rounds) ctx.complete(); else newRound(); }, 3000);
      }

      /* ---------- drawing ---------- */
      function draw() {
        var H = Hpx;
        g.setTransform(dpr * H, 0, 0, dpr * H, 0, 0); // draw in game units (height = 1)
        g.clearRect(0, 0, aspect, 1);
        palm(0.07, 1); palm(aspect - 0.07, -1);
        // vine
        if (vine) {
          g.strokeStyle = '#2e9e4a'; g.lineWidth = 0.014; g.lineCap = 'round';
          g.beginPath(); g.moveTo(vine.x, FLOOR - DINO_H * 0.8); g.lineTo(vine.x, vine.top); g.stroke();
          g.fillStyle = '#4ade80';
          for (var y = FLOOR - DINO_H * 0.8 - 0.04, s = 1; y > vine.top; y -= 0.05, s = -s) {
            g.beginPath(); g.ellipse(vine.x + s * 0.016, y, 0.016, 0.007, s * 0.6, 0, 7); g.fill();
          }
          g.fillStyle = '#ff7aa8'; g.beginPath(); g.arc(vine.x, vine.top, 0.012, 0, 7); g.fill(); // a flower bud on top
        }
        cocos.forEach(coconut);
        bits.forEach(function (b) {
          g.save(); g.translate(b.x, b.y); g.rotate(b.rot); g.globalAlpha = Math.min(1, b.life * 2);
          if (b.kind === 'half') {
            g.fillStyle = '#6b3f1d'; g.beginPath(); g.arc(0, 0, b.r, 0, Math.PI); g.fill();
            g.fillStyle = '#fffaf0'; g.beginPath(); g.ellipse(0, 0.001, b.r * 0.8, b.r * 0.25, 0, 0, 7); g.fill();
          } else {
            g.fillStyle = '#ffd93d'; g.beginPath(); g.arc(0, 0, b.r, 0, 7); g.fill();
          }
          g.restore();
        });
        // Rex
        if (dinoReady) {
          var blink = invuln > 0 && Math.floor(invuln * 8) % 2 === 0;
          if (!blink) {
            var bob = dino.dance ? Math.abs(Math.sin(performance.now() / 150)) * 0.04 : Math.abs(Math.sin(dino.bob)) * 0.01;
            g.save();
            g.translate(dino.x, FLOOR - bob);
            if (dino.face < 0) g.scale(-1, 1);
            g.drawImage(dinoImg, -DINO_W / 2, -DINO_H, DINO_W, DINO_H);
            g.restore();
          }
        }
      }

      function coconut(c) {
        var r = R[c.size];
        g.save(); g.translate(c.x, c.y); g.rotate(c.spin);
        var grd = g.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
        grd.addColorStop(0, '#b0743f'); grd.addColorStop(1, '#5b3412');
        g.fillStyle = grd; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
        g.strokeStyle = '#3b2208'; g.lineWidth = r * 0.08; g.stroke();
        // hairy fibres
        g.strokeStyle = 'rgba(60,32,10,.55)'; g.lineWidth = r * 0.05;
        for (var k = 0; k < 9; k++) {
          var a = k * 0.7;
          g.beginPath(); g.moveTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55); g.lineTo(Math.cos(a + 0.25) * r * 0.85, Math.sin(a + 0.25) * r * 0.85); g.stroke();
        }
        // the three little "eyes" of a coconut
        g.fillStyle = '#2b1705';
        [[-0.22, -0.3], [0.22, -0.3], [0, 0.02]].forEach(function (p) { g.beginPath(); g.ellipse(p[0] * r, p[1] * r, r * 0.11, r * 0.14, 0, 0, 7); g.fill(); });
        g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(-r * 0.4, -r * 0.45, r * 0.22, r * 0.12, -0.6, 0, 7); g.fill();
        g.restore();
      }

      function palm(x, side) {
        g.save(); g.translate(x, FLOOR);
        g.strokeStyle = '#8d5b34'; g.lineWidth = 0.025; g.lineCap = 'round';
        g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(side * 0.04, -0.25, side * 0.01, -0.45); g.stroke();
        g.fillStyle = '#3fa34d';
        for (var k = 0; k < 5; k++) {
          g.save(); g.translate(side * 0.01, -0.45); g.rotate(-2.6 + k * 0.85);
          g.beginPath(); g.ellipse(0.07, 0, 0.08, 0.02, 0, 0, 7); g.fill(); g.restore();
        }
        g.restore();
      }

      /* ---------- input ---------- */
      function toGame(e) {
        var r = canvas.getBoundingClientRect();
        return (e.clientX - r.left) / r.height;
      }
      var pressing = false;
      ctx.on(stage, 'pointerdown', function (e) {
        if (!world || !world.contains(e.target)) return;
        e.preventDefault();
        pressing = true;
        dino.target = Math.max(DINO_W / 2, Math.min(aspect - DINO_W / 2, toGame(e)));
        dino.shootOnArrive = true;
        try { world.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      });
      ctx.on(stage, 'pointermove', function (e) {
        if (!pressing) return;
        dino.target = Math.max(DINO_W / 2, Math.min(aspect - DINO_W / 2, toGame(e)));
      });
      ctx.on(stage, 'pointerup', function () { pressing = false; });
      ctx.on(stage, 'pointercancel', function () { pressing = false; });
      ctx.on(window, 'keydown', function (e) {
        if (e.key === 'ArrowLeft') { keys.left = true; dino.target = null; e.preventDefault(); }
        else if (e.key === 'ArrowRight') { keys.right = true; dino.target = null; e.preventDefault(); }
        else if ((e.key === ' ' || e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'Enter') && !e.repeat) { shoot(); e.preventDefault(); }
      });
      ctx.on(window, 'keyup', function (e) {
        if (e.key === 'ArrowLeft') keys.left = false;
        if (e.key === 'ArrowRight') keys.right = false;
      });
    }
  };
})(window.Dino);

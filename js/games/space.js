/* Space Rex – an original fixed-shooter in space.
 * Rex rides a hover-scooter and shoots soap bubbles at rows of cute space bugs that slide sideways
 * and creep down. Bugs drop slime blobs; leafy bushes give cover and get nibbled away.
 * A gift comet sometimes flies over: popping it gives triple bubbles for a while.
 * No game over: slime only makes Rex dizzy for a moment, and bugs that reach the ground fly back up.
 *
 * Controls: ← → move, Space / ↑ shoots (hold to keep shooting); touch/mouse: hold where Rex should go –
 * he moves there and shoots by himself. World: 1600 × 900 units. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
(function (D) {
  'use strict';
  var A = D.art;
  var WW = 1600, WH = 900, GROUND = 860, REX_Y = 800, REX_W = 120;

  var BUGS = [ // one colour per row type, with points
    { body: '#7cfc8a', dark: '#1b8a3a', pts: 10 },
    { body: '#c792ff', dark: '#5b2a9e', pts: 20 },
    { body: '#ffb74d', dark: '#b05a00', pts: 30 },
    { body: '#4fc3f7', dark: '#01579b', pts: 30 },
    { body: '#ff8a80', dark: '#b71c1c', pts: 40 }
  ];

  var TXT = {
    el: { inst: 'Σπάσε τα διαστημικά ζουζούνια με τις σαπουνόφουσκες! Κρύψου πίσω από τους θάμνους!',
          wave: 'Κύμα', gift: 'Τριπλές φούσκες!', dizzy: ['Ωχ, γλίτσα!', 'Μπλιαχ!', 'Ουπς!'], up: 'Πέταξαν πάλι ψηλά!', rotate: 'Γύρισε το κινητό οριζόντια!' },
    en: { inst: 'Pop the space bugs with your bubbles! Hide behind the bushes!',
          wave: 'Wave', gift: 'Triple bubbles!', dizzy: ['Eww, slime!', 'Yuck!', 'Oops!'], up: 'They flew back up!', rotate: 'Turn your phone sideways!' }
  };

  A.TILES.space = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">' +
    '<rect x="6" y="6" width="108" height="88" rx="14" fill="#141a52" stroke="#fff" stroke-width="4"/>' +
    '<g fill="#fff"><circle cx="20" cy="18" r="1.5"/><circle cx="60" cy="14" r="1.2"/><circle cx="98" cy="24" r="1.5"/><circle cx="40" cy="44" r="1"/></g>' +
    [[30, 30, '#7cfc8a'], [56, 30, '#c792ff'], [82, 30, '#ffb74d']].map(function (b) {
      return '<ellipse cx="' + b[0] + '" cy="' + b[1] + '" rx="9" ry="7" fill="' + b[2] + '"/><circle cx="' + (b[0] - 3) + '" cy="' + (b[1] - 1) + '" r="2" fill="#fff"/><circle cx="' + (b[0] + 3) + '" cy="' + (b[1] - 1) + '" r="2" fill="#fff"/>' +
        '<path d="M' + (b[0] - 4) + ' ' + (b[1] - 6) + ' l-3 -5 M' + (b[0] + 4) + ' ' + (b[1] - 6) + ' l3 -5" stroke="' + b[2] + '" stroke-width="2"/>';
    }).join('') +
    '<circle cx="56" cy="56" r="5" fill="rgba(186,230,253,.6)" stroke="#e0f7ff" stroke-width="1.5"/>' +
    '<svg x="40" y="62" width="34" height="28" viewBox="0 0 200 180">' + A.dinoInner('trex') + '</svg>' +
    '<rect x="36" y="86" width="42" height="5" rx="2.5" fill="#90a4ae"/></svg>';

  D.games.space = {
    id: 'space', color: '#3949ab', dark: '#1a237e',

    start: function (ctx) {
      var L = TXT[D.i18n.lang] || TXT.en;
      var CFG = {
        easy:   { rows: 3, cols: 6, speed: 34, step: 22, fire: 1.9, slime: 240, maxBubbles: 3, waves: 2 },
        medium: { rows: 4, cols: 8, speed: 42, step: 26, fire: 1.15, slime: 320, maxBubbles: 2, waves: 3 },
        hard:   { rows: 5, cols: 9, speed: 50, step: 30, fire: 0.7,  slime: 400, maxBubbles: 2, waves: 4 }
      }[ctx.level];
      var stage = ctx.stage, wave = 0, gen = 0;
      var canvas, g, dpr, scale, offX, offY;
      var bugs, dir, bubbles, slimes, shields, parts, comet, cometT, triple, rex, keys = {}, pointerX = null, firing = false;
      var fireCd = 0, enemyCd = 0, score = 0, running = false, last = null, sfxGap = 0, totalBugs = 1;
      var rexImg = new Image(), rexReady = false;
      rexImg.onload = function () { rexReady = true; };
      rexImg.src = A.dataUri(A.dino('trex'));
      var stars = []; for (var i = 0; i < 140; i++) stars.push({ x: Math.random() * WW, y: Math.random() * GROUND, r: Math.random() * 2 + 0.6, tw: Math.random() * 6 });

      var wrap = ctx.h('<div class="space-world"><canvas></canvas><div class="space-rotate">📱↻ ' + L.rotate + '</div></div>');
      stage.appendChild(wrap);
      canvas = wrap.querySelector('canvas'); g = canvas.getContext('2d');

      function layout() {
        var w = wrap.clientWidth, h = wrap.clientHeight;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        scale = Math.min(w / WW, h / WH); offX = (w - WW * scale) / 2; offY = (h - WH * scale) / 2;
        wrap.querySelector('.space-rotate').style.display = h > w * 1.05 ? 'block' : 'none';
      }
      ctx.onResize(layout);
      layout();

      /* ---------- a new wave ---------- */
      function newWave() {
        gen++;
        bugs = [];
        var cw = 120, ch = 86, x0 = WW / 2 - (CFG.cols - 1) * cw / 2;
        for (var r = 0; r < CFG.rows; r++) for (var c = 0; c < CFG.cols; c++) {
          var type = CFG.rows - 1 - r; // tougher-looking bugs at the top
          bugs.push({ x: x0 + c * cw, y: 130 + r * ch, type: Math.min(type, BUGS.length - 1), wob: Math.random() * 6, alive: true });
        }
        totalBugs = bugs.length;
        dir = 1; bubbles = []; slimes = []; parts = []; comet = null; cometT = 12 + Math.random() * 8; triple = 0;
        rex = { x: WW / 2, dizzy: 0, blink: 0, face: 1 };
        if (wave === 0 || !shields) makeShields();
        enemyCd = 2.5; running = false;
        say(L.wave + ' ' + (wave + 1) + '!');
        ctx.timeout(function () { running = true; }, 1300);
        var g0 = gen; last = null;
        requestAnimationFrame(function (t) { frame(t, g0); });
      }
      function makeShields() {
        shields = [];
        [WW * 0.22, WW * 0.5, WW * 0.78].forEach(function (cx) {
          for (var r = 0; r < 4; r++) for (var c = 0; c < 8; c++) {
            if (r === 3 && (c === 3 || c === 4)) continue; // a little arch
            if (r === 0 && (c === 0 || c === 7)) continue;  // rounded top
            shields.push({ x: cx - 72 + c * 18 + 9, y: 690 + r * 18 + 9, alive: true, shade: (c * 7 + r * 3) % 3 });
          }
        });
      }
      var bubbleText = null, bubbleT = 0;
      function say(text) { bubbleText = text; bubbleT = 2; }

      /* ---------- simulation ---------- */
      function step(dt) {
        sfxGap -= dt; bubbleT -= dt;
        stars.forEach(function (s) { s.tw += dt * 2; });
        parts.forEach(function (p) { p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
        parts = parts.filter(function (p) { return p.life > 0; });
        if (!running) return;

        // Rex moves
        rex.dizzy = Math.max(0, rex.dizzy - dt); rex.blink = Math.max(0, rex.blink - dt); triple = Math.max(0, triple - dt);
        var spd = rex.dizzy > 0 ? 0 : 620, mv = 0;
        if (keys.left && !keys.right) mv = -1; else if (keys.right && !keys.left) mv = 1;
        else if (pointerX !== null && Math.abs(pointerX - rex.x) > 8) mv = Math.sign(pointerX - rex.x);
        if (mv) {
          var nx = rex.x + mv * spd * dt;
          if (pointerX !== null && !keys.left && !keys.right && Math.sign(pointerX - nx) !== mv) nx = pointerX;
          rex.x = Math.max(70, Math.min(WW - 70, nx)); rex.face = mv;
        }
        // shooting
        fireCd -= dt;
        if ((firing || keys.fire) && fireCd <= 0 && rex.dizzy <= 0 && bubbles.length < CFG.maxBubbles * (triple > 0 ? 3 : 1)) {
          fireCd = 0.28;
          var angles = triple > 0 ? [-0.18, 0, 0.18] : [0];
          angles.forEach(function (a) { bubbles.push({ x: rex.x + rex.face * 18, y: REX_Y - 70, vx: Math.sin(a) * 900, vy: -Math.cos(a) * 900, r: 14 }); });
          if (sfxGap <= 0) { ctx.sfx.pop(); sfxGap = 0.1; }
        }
        bubbles.forEach(function (b) { b.x += b.vx * dt; b.y += b.vy * dt; });

        // the bug formation slides and steps down at the edges; it speeds up as bugs are popped
        var alive = bugs.filter(function (b) { return b.alive; });
        var hurry = 1 + (1 - alive.length / totalBugs) * 2.2;
        var minX = Math.min.apply(null, alive.map(function (b) { return b.x; })), maxX = Math.max.apply(null, alive.map(function (b) { return b.x; }));
        var move = dir * CFG.speed * hurry * dt;
        if ((dir > 0 && maxX + move > WW - 60) || (dir < 0 && minX + move < 60)) {
          dir = -dir; alive.forEach(function (b) { b.y += CFG.step; });
        } else alive.forEach(function (b) { b.x += move; });
        alive.forEach(function (b) { b.wob += dt * 6; });
        // bugs reached the bushes/ground: they get scared and fly back up (no game over)
        var lowest = Math.max.apply(null, alive.map(function (b) { return b.y; }));
        if (lowest > 660) {
          var shift = lowest - (130 + (CFG.rows - 1) * 86);
          alive.forEach(function (b) { b.y -= shift; });
          say(L.up); ctx.sfx.whoosh();
        }
        // bugs touching the bushes nibble them
        alive.forEach(function (b) { shields.forEach(function (s) { if (s.alive && Math.abs(s.x - b.x) < 40 && Math.abs(s.y - b.y) < 34) s.alive = false; }); });

        // bugs drop slime from the lowest bug of a random column
        enemyCd -= dt;
        if (enemyCd <= 0 && alive.length) {
          enemyCd = CFG.fire * (0.6 + Math.random() * 0.8) / Math.min(1.8, hurry);
          var cols = {}; alive.forEach(function (b) { var k = Math.round(b.x); if (!cols[k] || cols[k].y < b.y) cols[k] = b; });
          var shooters = Object.keys(cols).map(function (k) { return cols[k]; });
          // a bit more likely to drop near Rex
          shooters.sort(function (p, q) { return Math.abs(p.x - rex.x) - Math.abs(q.x - rex.x); });
          var sb = Math.random() < 0.5 ? shooters[0] : shooters[Math.floor(Math.random() * shooters.length)];
          slimes.push({ x: sb.x, y: sb.y + 30, vy: CFG.slime, wob: 0 });
        }
        slimes.forEach(function (s) { s.y += s.vy * dt; s.wob += dt * 10; });

        // the gift comet
        cometT -= dt;
        if (!comet && cometT <= 0) { var fromLeft = Math.random() < 0.5; comet = { x: fromLeft ? -80 : WW + 80, y: 62, vx: fromLeft ? 260 : -260 }; }
        if (comet) { comet.x += comet.vx * dt; if (comet.x < -120 || comet.x > WW + 120) { comet = null; cometT = 15 + Math.random() * 10; } }

        // collisions: bubbles
        bubbles = bubbles.filter(function (b) {
          if (b.y < -30 || b.x < -30 || b.x > WW + 30) return false;
          for (var i = 0; i < alive.length; i++) {
            var bug = alive[i];
            if (bug.alive && Math.abs(bug.x - b.x) < 42 && Math.abs(bug.y - b.y) < 36) { popBug(bug); return false; }
          }
          for (var k = 0; k < shields.length; k++) { var s = shields[k]; if (s.alive && Math.abs(s.x - b.x) < 14 && Math.abs(s.y - b.y) < 14) { s.alive = false; return false; } }
          for (var m = 0; m < slimes.length; m++) { if (Math.abs(slimes[m].x - b.x) < 22 && Math.abs(slimes[m].y - b.y) < 26) { burst(slimes[m].x, slimes[m].y, '#9be15d', 6); slimes.splice(m, 1); return false; } }
          if (comet && Math.abs(comet.x - b.x) < 50 && Math.abs(comet.y - b.y) < 36) {
            burst(comet.x, comet.y, '#ffd54f', 24); comet = null; cometT = 18 + Math.random() * 10;
            triple = 9; score += 100; ctx.sfx.sparkle(); ctx.sfx.fanfare(); say(L.gift);
            return false;
          }
          return true;
        });
        // collisions: slime
        slimes = slimes.filter(function (s) {
          if (s.y > GROUND) { burst(s.x, GROUND - 4, '#9be15d', 4); return false; }
          for (var k = 0; k < shields.length; k++) { var sh = shields[k]; if (sh.alive && Math.abs(sh.x - s.x) < 16 && Math.abs(sh.y - s.y) < 18) { sh.alive = false; burst(s.x, s.y, '#9be15d', 5); return false; } }
          if (rex.blink <= 0 && Math.abs(s.x - rex.x) < 46 && s.y > REX_Y - 90 && s.y < REX_Y + 10) {
            rex.dizzy = 0.9; rex.blink = 2.2; burst(s.x, s.y, '#9be15d', 12);
            ctx.sfx.bump(); var t = L.dizzy[Math.floor(Math.random() * L.dizzy.length)]; say(t); ctx.say(t, { noCaption: true });
            return false;
          }
          return true;
        });

        if (!bugs.some(function (b) { return b.alive; })) waveDone();
      }

      function popBug(bug) {
        bug.alive = false; score += BUGS[bug.type].pts;
        burst(bug.x, bug.y, BUGS[bug.type].body, 14);
        if (sfxGap <= 0) { ctx.sfx.crack(); sfxGap = 0.06; }
      }
      function burst(x, y, color, n) {
        for (var i = 0; i < n; i++) {
          var a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 260;
          parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: 0.5 + Math.random() * 0.5, color: Math.random() < 0.3 ? '#fff59d' : color, r: 3 + Math.random() * 5 });
        }
      }
      function waveDone() {
        running = false; wave++;
        ctx.progress(wave, CFG.waves);
        ctx.sfx.match(); ctx.timeout(function () { ctx.sfx.roar(); ctx.praise(canvas); }, 400);
        ctx.timeout(function () {
          if (wave >= CFG.waves) ctx.complete((D.i18n.lang === 'el' ? 'Πόντοι: ' : 'Score: ') + score);
          else newWave();
        }, 2600);
      }

      /* ---------- drawing ---------- */
      function draw() {
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.fillStyle = '#0d1340'; g.fillRect(0, 0, canvas.width, canvas.height);
        g.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);
        var sky = g.createLinearGradient(0, 0, 0, GROUND);
        sky.addColorStop(0, '#0d1340'); sky.addColorStop(1, '#3a2a7a');
        g.fillStyle = sky; g.fillRect(0, 0, WW, GROUND);
        stars.forEach(function (s) { g.globalAlpha = 0.5 + Math.sin(s.tw) * 0.4; g.fillStyle = '#fff'; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 7); g.fill(); });
        g.globalAlpha = 1;
        // planets
        g.fillStyle = '#ff8a65'; g.beginPath(); g.arc(1430, 150, 46, 0, 7); g.fill();
        g.strokeStyle = 'rgba(255,224,178,.8)'; g.lineWidth = 6; g.beginPath(); g.ellipse(1430, 150, 78, 16, -0.3, 0, 7); g.stroke();
        g.fillStyle = '#b39ddb'; g.beginPath(); g.arc(150, 250, 26, 0, 7); g.fill();
        // the moon ground
        g.fillStyle = '#9fa8da'; g.fillRect(0, GROUND, WW, WH - GROUND);
        g.fillStyle = '#7986cb'; [[200, 880, 30], [640, 875, 20], [1100, 885, 34], [1450, 878, 22]].forEach(function (c) { g.beginPath(); g.ellipse(c[0], c[1], c[2], c[2] * 0.35, 0, 0, 7); g.fill(); });
        // bushes (shields)
        shields.forEach(function (s) {
          if (!s.alive) return;
          g.fillStyle = ['#43a047', '#4caf50', '#388e3c'][s.shade];
          g.beginPath(); g.arc(s.x, s.y, 11, 0, 7); g.fill();
        });
        // bugs
        bugs.forEach(function (b) { if (b.alive) drawBug(b); });
        // comet
        if (comet) {
          var tail = comet.vx > 0 ? -1 : 1;
          var grd = g.createLinearGradient(comet.x, 0, comet.x + tail * 160, 0);
          grd.addColorStop(0, 'rgba(255,213,79,.9)'); grd.addColorStop(1, 'rgba(255,213,79,0)');
          g.fillStyle = grd; g.beginPath(); g.moveTo(comet.x, comet.y - 20); g.lineTo(comet.x + tail * 160, comet.y); g.lineTo(comet.x, comet.y + 20); g.fill();
          g.fillStyle = '#ffd54f'; g.beginPath(); g.arc(comet.x, comet.y, 24, 0, 7); g.fill();
          g.fillStyle = '#e91e63'; g.fillRect(comet.x - 12, comet.y - 12, 24, 24);
          g.fillStyle = '#fff'; g.fillRect(comet.x - 3, comet.y - 12, 6, 24); g.fillRect(comet.x - 12, comet.y - 3, 24, 6);
        }
        // slime blobs
        slimes.forEach(function (s) {
          g.fillStyle = '#9be15d'; g.strokeStyle = '#2e7d32'; g.lineWidth = 3;
          g.beginPath(); g.moveTo(s.x, s.y - 18); g.quadraticCurveTo(s.x + 14 + Math.sin(s.wob) * 2, s.y + 4, s.x, s.y + 12); g.quadraticCurveTo(s.x - 14 - Math.sin(s.wob) * 2, s.y + 4, s.x, s.y - 18); g.fill(); g.stroke();
        });
        // bubbles
        bubbles.forEach(function (b) {
          g.fillStyle = 'rgba(186,230,253,.35)'; g.strokeStyle = 'rgba(224,247,255,.95)'; g.lineWidth = 3;
          g.beginPath(); g.arc(b.x, b.y, b.r, 0, 7); g.fill(); g.stroke();
          g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(b.x - 4, b.y - 5, 3.5, 0, 7); g.fill();
        });
        // Rex on his hover-scooter
        var blink = rex.blink > 0 && Math.floor(rex.blink * 10) % 2 === 0;
        if (!blink) {
          var hover = Math.sin(performance.now() / 180) * 4;
          g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(rex.x, GROUND - 6, 70, 10, 0, 0, 7); g.fill();
          g.fillStyle = '#90a4ae'; g.strokeStyle = '#455a64'; g.lineWidth = 4;
          g.beginPath(); g.ellipse(rex.x, REX_Y + 12 + hover, 72, 16, 0, 0, 7); g.fill(); g.stroke();
          g.fillStyle = triple > 0 ? '#ffd54f' : '#4fc3f7';
          [-40, 0, 40].forEach(function (o) { g.beginPath(); g.arc(rex.x + o, REX_Y + 14 + hover, 5, 0, 7); g.fill(); });
          if (rexReady) {
            g.save(); g.translate(rex.x, REX_Y + 2 + hover);
            if (rex.dizzy > 0) g.rotate(Math.sin(performance.now() / 60) * 0.15);
            g.scale(rex.face, 1); g.drawImage(rexImg, -REX_W / 2, -REX_W * 0.9, REX_W, REX_W * 0.9); g.restore();
          }
          if (rex.dizzy > 0) { g.fillStyle = '#ffd54f'; for (var i = 0; i < 3; i++) { var a = performance.now() / 200 + i * 2.1; star(rex.x + Math.cos(a) * 34, REX_Y - 112 + Math.sin(a) * 10, 9); } }
        }
        // particles
        parts.forEach(function (p) { g.globalAlpha = Math.min(1, p.life * 2); g.fillStyle = p.color; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill(); });
        g.globalAlpha = 1;
        // HUD: score and power-up
        g.font = '800 34px ' + getComputedStyle(document.body).fontFamily; g.textAlign = 'left'; g.fillStyle = '#fff';
        g.fillText('⭐ ' + score, 24, 48);
        if (triple > 0) { g.textAlign = 'right'; g.fillStyle = '#ffd54f'; g.fillText('🫧×3  ' + Math.ceil(triple), WW - 24, 48); }
        if (bubbleT > 0 && bubbleText) {
          g.globalAlpha = Math.min(1, bubbleT * 2); g.textAlign = 'center'; g.font = '800 46px ' + getComputedStyle(document.body).fontFamily;
          g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 8; g.strokeText(bubbleText, WW / 2, 560); g.fillStyle = '#fff59d'; g.fillText(bubbleText, WW / 2, 560); g.globalAlpha = 1;
        }
      }
      function star(x, y, r) { g.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
      function drawBug(b) {
        var T = BUGS[b.type], s = 1, x = b.x, y = b.y + Math.sin(b.wob) * 3, flap = Math.sin(b.wob * 2);
        g.strokeStyle = T.dark; g.lineWidth = 4; g.lineCap = 'round';
        // antennae
        g.beginPath(); g.moveTo(x - 10, y - 22); g.lineTo(x - 18, y - 40 + flap * 3); g.moveTo(x + 10, y - 22); g.lineTo(x + 18, y - 40 - flap * 3); g.stroke();
        g.fillStyle = T.body; g.beginPath(); g.arc(x - 18, y - 41 + flap * 3, 5, 0, 7); g.arc(x + 18, y - 41 - flap * 3, 5, 0, 7); g.fill();
        // little legs / tentacles, different per row type
        for (var k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(x + k * 16, y + 18); g.lineTo(x + k * 22 + (k ? 0 : flap * 4), y + 32 + (k ? flap * 4 : 0)); g.stroke(); }
        // body
        g.fillStyle = T.body; g.beginPath();
        if (b.type % 2 === 0) g.ellipse(x, y, 34, 26, 0, 0, 7); else { g.moveTo(x - 32, y + 18); g.quadraticCurveTo(x - 34, y - 32, x, y - 30); g.quadraticCurveTo(x + 34, y - 32, x + 32, y + 18); g.closePath(); }
        g.fill(); g.stroke();
        // spots
        g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(x - 18, y - 8, 5, 0, 7); g.arc(x + 20, y + 6, 4, 0, 7); g.fill();
        // big eyes looking at Rex
        var look = Math.max(-3, Math.min(3, (rex.x - x) / 120));
        g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 11, y - 6, 10, 0, 7); g.arc(x + 11, y - 6, 10, 0, 7); g.fill();
        g.fillStyle = '#1a1a2e'; g.beginPath(); g.arc(x - 11 + look, y - 4, 5, 0, 7); g.arc(x + 11 + look, y - 4, 5, 0, 7); g.fill();
        // grumpy eyebrows and a little mouth
        g.strokeStyle = T.dark; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 20, y - 20); g.lineTo(x - 4, y - 15); g.moveTo(x + 20, y - 20); g.lineTo(x + 4, y - 15); g.stroke();
        g.beginPath(); g.arc(x, y + 14, 6, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      }

      /* ---------- loop ---------- */
      function frame(t, g0) {
        if (g0 !== gen || !ctx.alive()) return;
        if (last === null) last = t;
        var dt = Math.min(0.05, (t - last) / 1000); last = t;
        var n = Math.ceil(dt / 0.01); for (var i = 0; i < n; i++) step(dt / n);
        draw();
        requestAnimationFrame(function (tt) { frame(tt, g0); });
      }

      /* ---------- input ---------- */
      function toX(e) { var rc = canvas.getBoundingClientRect(); return (e.clientX - rc.left - offX) / scale; }
      var pressing = false;
      ctx.on(wrap, 'pointerdown', function (e) {
        e.preventDefault(); pressing = true; pointerX = toX(e); firing = true;
        try { wrap.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      });
      ctx.on(wrap, 'pointermove', function (e) { if (pressing) pointerX = toX(e); });
      function release() { pressing = false; pointerX = null; firing = false; }
      ctx.on(wrap, 'pointerup', release);
      ctx.on(wrap, 'pointercancel', release);
      ctx.on(window, 'keydown', function (e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { keys.left = true; e.preventDefault(); }
        else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keys.right = true; e.preventDefault(); }
        else if (e.key === ' ' || e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { keys.fire = true; e.preventDefault(); }
      });
      ctx.on(window, 'keyup', function (e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
        else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
        else if (e.key === ' ' || e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.fire = false;
      });

      // read-only snapshot used by the automated tests
      stage._debug = function () {
        return { wave: wave, running: running, rex: rex.x, dizzy: rex.dizzy, score: score, triple: triple,
          bugs: bugs.filter(function (b) { return b.alive; }).map(function (b) { return [b.x, b.y]; }), slimes: slimes.map(function (s) { return [s.x, s.y]; }),
          comet: comet ? [comet.x, comet.y] : null, shields: shields.filter(function (s) { return s.alive; }).length };
      };

      ctx.progress(0, CFG.waves);
      ctx.instructText(L.inst);
      newWave();
    }
  };
})(window.Dino);

/* Fossil dig – rub the sand away with a finger (or mouse) to uncover dinosaur fossils,
 * which then come alive. Only self-drawn canvas content is read, so it works from file://. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.fossil = {
  id: 'fossil', color: '#d9a066', dark: '#8d5b34',

  start: function (ctx) {
    var CFG = {
      easy:   { count: 1, size: 0.62, brush: 0.11, need: 0.45, rounds: 3, random: false },
      medium: { count: 1, size: 0.46, brush: 0.085, need: 0.55, rounds: 3, random: true },
      hard:   { count: 2, size: 0.36, brush: 0.07, need: 0.55, rounds: 3, random: true }
    }[ctx.level];
    var A = ctx.art, stage = ctx.stage;
    var round = 0, area, canvas, g, items, last, dirty, checkTimer, found, dpr;

    ctx.progress(0, CFG.rounds);
    ctx.instruct(CFG.count > 1 ? 'fossil_inst2' : 'fossil_inst');
    newDig();

    function newDig() {
      stage.innerHTML = '';
      found = 0; last = null; dirty = false;
      area = ctx.h('<div class="dig-area"></div>');
      var W = stage.clientWidth, H = stage.clientHeight;
      // Keep a pleasant 4:3-ish dig box that fills the stage.
      var w = Math.min(W - 16, (H - 16) * 1.5), h = Math.min(H - 16, w * 1.25);
      area.style.width = w + 'px'; area.style.height = h + 'px';
      stage.appendChild(area);

      // Place the fossils (positions in % so resizing keeps everything aligned).
      var types = ctx.shuffle(A.DINOS).slice(0, CFG.count);
      var fw = CFG.size * 100, fh = fw * 0.9 * (w / h);
      items = types.map(function (type, i) {
        var x, y;
        if (!CFG.random) { x = 50 - fw / 2; y = 50 - fh / 2; }
        else if (CFG.count === 1) { x = ctx.rand(5, Math.floor(95 - fw)); y = ctx.rand(5, Math.max(5, Math.floor(95 - fh))); }
        else {
          // one in the left half, one in the right half
          x = (i === 0 ? ctx.rand(4, Math.max(4, Math.floor(50 - fw))) : ctx.rand(52, Math.floor(96 - fw)));
          y = ctx.rand(5, Math.max(5, Math.floor(95 - fh)));
        }
        var el = ctx.h('<div class="fossil"><div class="bones">' + A.dino(type, 'fossil') + '</div><div class="alive">' + A.dino(type) + '</div></div>');
        el.style.left = x + '%'; el.style.top = y + '%'; el.style.width = fw + '%'; el.style.height = fh + '%';
        area.appendChild(el);
        return { type: type, el: el, x: x / 100, y: y / 100, w: fw / 100, h: fh / 100, done: false };
      });

      canvas = document.createElement('canvas');
      area.appendChild(canvas);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      g = canvas.getContext('2d');
      paintSand();
      bind();
    }

    function paintSand() {
      var W = canvas.width, H = canvas.height;
      var grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#f2cf8a'); grad.addColorStop(1, '#e2b56c');
      g.fillStyle = grad; g.fillRect(0, 0, W, H);
      var specks = ['#d9a85e', '#f7dca3', '#c99652', '#fbe6b8'];
      for (var i = 0; i < W * H / 260; i++) {
        g.fillStyle = specks[i % specks.length];
        g.globalAlpha = 0.5 + Math.random() * 0.5;
        g.beginPath(); g.arc(Math.random() * W, Math.random() * H, (1 + Math.random() * 2.5) * dpr, 0, 7); g.fill();
      }
      for (i = 0; i < 18; i++) {
        g.fillStyle = ['#b9a58b', '#a8916f', '#cbb79c'][i % 3];
        g.globalAlpha = 1;
        g.beginPath();
        g.ellipse(Math.random() * W, Math.random() * H, (5 + Math.random() * 9) * dpr, (4 + Math.random() * 6) * dpr, Math.random() * 3, 0, 7);
        g.fill();
      }
      g.globalAlpha = 1;
    }

    function scrape(x, y) {
      var r = CFG.brush * Math.min(canvas.width, canvas.height);
      g.globalCompositeOperation = 'destination-out';
      g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = r * 2;
      g.beginPath();
      if (last) g.moveTo(last[0], last[1]); else g.moveTo(x - 0.1, y);
      g.lineTo(x, y); g.stroke();
      g.globalCompositeOperation = 'source-over';
      last = [x, y];
      dirty = true;
      ctx.sfx.dig();
    }

    /* How much of each fossil's box is uncovered? (sampled, so it stays fast) */
    function check() {
      if (!dirty) return;
      dirty = false;
      items.forEach(function (it) {
        if (it.done) return;
        // Only the middle 70% of the box counts – the corners are empty sand anyway.
        var x0 = Math.floor((it.x + it.w * 0.15) * canvas.width), y0 = Math.floor((it.y + it.h * 0.15) * canvas.height);
        var w = Math.max(1, Math.floor(it.w * 0.7 * canvas.width)), h = Math.max(1, Math.floor(it.h * 0.7 * canvas.height));
        var data = g.getImageData(x0, y0, w, h).data, clear = 0, total = 0;
        for (var i = 3; i < data.length; i += 4 * 7) { total++; if (data[i] < 128) clear++; }
        if (total && clear / total >= CFG.need) reveal(it);
      });
    }

    function reveal(it) {
      it.done = true;
      found++;
      // Blow the remaining sand off the fossil.
      var cx = (it.x + it.w / 2) * canvas.width, cy = (it.y + it.h / 2) * canvas.height;
      var rx = it.w * canvas.width * 0.62, ry = it.h * canvas.height * 0.62, step = 0;
      (function blow() {
        if (!ctx.alive()) return;
        step++;
        g.globalCompositeOperation = 'destination-out';
        g.globalAlpha = 0.35;
        g.beginPath(); g.ellipse(cx, cy, rx * Math.min(1, step / 6), ry * Math.min(1, step / 6), 0, 0, 7); g.fill();
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        if (step < 12) requestAnimationFrame(blow);
      })();
      ctx.sfx.match();
      ctx.timeout(function () {
        it.el.classList.add('awake');
        ctx.sfx.roar();
        ctx.say(ctx.t('fossil_found', { dinoA: Dino.i18n.dinoA(it.type) }));
        ctx.burst(it.el);
      }, 700);
      if (found === items.length) {
        round++;
        ctx.timeout(function () { ctx.progress(round, CFG.rounds); ctx.praise(); }, 2300);
        ctx.timeout(function () {
          if (round >= CFG.rounds) ctx.complete();
          else newDig();
        }, 3600);
      }
    }

    function bind() {
      var down = false;
      function pt(e) {
        var r = canvas.getBoundingClientRect();
        return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height];
      }
      canvas.addEventListener('pointerdown', function (e) {
        e.preventDefault(); down = true; last = null;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        var p = pt(e); scrape(p[0], p[1]);
      });
      canvas.addEventListener('pointermove', function (e) {
        // Mouse users can just move over the sand without holding the button.
        if (!down && e.pointerType !== 'mouse') return;
        var p = pt(e); scrape(p[0], p[1]);
      });
      function up() { down = false; last = null; check(); }
      canvas.addEventListener('pointerup', up);
      canvas.addEventListener('pointercancel', up);
      canvas.addEventListener('pointerleave', function () { last = null; });
    }

    // On rotate/resize: scale the dig box but keep its shape (fossils & sand are in relative units).
    ctx.onResize(function () {
      if (!area) return;
      var ratio = canvas.width / canvas.height, W = stage.clientWidth - 16, H = stage.clientHeight - 16;
      var w = Math.min(W, H * ratio);
      area.style.width = w + 'px'; area.style.height = (w / ratio) + 'px';
    });

    // Check progress a few times per second while digging.
    (function loop() {
      checkTimer = ctx.timeout(function () { check(); loop(); }, 300);
    })();
  }
};

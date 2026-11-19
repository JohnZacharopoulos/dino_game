/* Puzzle – drag (or tap, then tap the spot) pieces into place.
 * Pictures: built-in dinosaur scenes + your own photos listed in photos/photos.js.
 * Pieces are made with CSS background-position, so photos work from the local file system. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.puzzle = {
  id: 'puzzle', color: '#ffcf33', dark: '#b88a00',

  start: function (ctx) {
    var CFG = {
      easy:   { cols: 2, rows: 2, ghost: 0.4,  rounds: 3 },
      medium: { cols: 3, rows: 2, ghost: 0.22, rounds: 3 },
      hard:   { cols: 3, rows: 3, ghost: 0,    rounds: 3 }
    }[ctx.level];
    var A = ctx.art, stage = ctx.stage;
    var round = 0, img, board, tray, wrap, slots, pieces, placed, selected, B, pw, ph, traySize, busy, peek, peekTimer;

    // Picture pool: every built-in scene + parent photos, shuffled.
    var pool = ctx.shuffle(A.DINOS.map(function (type, i) {
      return { src: A.dataUri(A.scene(i, type)), w: 300, h: 300, dino: type };
    }));
    var photos = (window.DINO_PHOTOS || []).filter(Boolean);
    if (photos.length) {
      ctx.shuffle(photos).slice(0, 2).forEach(function (p, i) {
        pool.splice(i * 2, 0, { src: 'photos/' + p, w: 0, h: 0 });
      });
    }

    ctx.progress(0, CFG.rounds);
    ctx.instruct('puzzle_inst');
    loadRound();

    function loadRound() {
      busy = true;
      img = pool[round % pool.length];
      if (img.w) return build();
      var im = new Image();
      im.onload = function () { img.w = im.naturalWidth; img.h = im.naturalHeight; if (ctx.alive()) build(); };
      im.onerror = function () { pool.splice(pool.indexOf(img), 1); if (ctx.alive()) loadRound(); };
      im.src = img.src;
    }

    function build() {
      stage.innerHTML = '';
      selected = null; placed = 0; busy = false;
      wrap = ctx.h('<div class="pz-wrap"></div>');
      board = ctx.h('<div class="pz-board"><div class="pz-ghost"></div></div>');
      tray = ctx.h('<div class="pz-tray"></div>');
      var ghost = board.firstChild;
      ghost.style.backgroundImage = 'url("' + img.src + '")';
      ghost.style.opacity = CFG.ghost;
      slots = []; pieces = [];
      for (var r = 0; r < CFG.rows; r++) for (var c = 0; c < CFG.cols; c++) {
        var s = ctx.h('<div class="pz-slot"></div>');
        s._c = c; s._r = r; s._i = slots.length;
        board.appendChild(s); slots.push(s);
        var p = ctx.h('<div class="pz-piece"></div>');
        p._c = c; p._r = r; p._i = pieces.length;
        p.style.backgroundImage = 'url("' + img.src + '")';
        pieces.push(p);
        bindPiece(p);
        bindSlot(s);
      }
      // Never start with the pieces already in order.
      var order;
      do { order = ctx.shuffle(pieces); } while (order.every(function (p, i) { return p._i === i; }));
      order.forEach(function (p) { tray.appendChild(p); });
      wrap.appendChild(board);
      wrap.appendChild(tray);
      peek = null;
      if (!CFG.ghost) {
        // Hard level: a small picture in the tray; tapping it shows the whole picture for a moment.
        peek = ctx.h('<button class="pz-peek" aria-label="peek">' + A.ICONS.eye + '</button>');
        peek.style.backgroundImage = 'url("' + img.src + '")';
        tray.insertBefore(peek, tray.firstChild);
        ctx.on(peek, 'click', function () {
          if (busy) return;
          ctx.sfx.tap();
          ghost.style.opacity = 1;
          clearTimeout(peekTimer);
          peekTimer = ctx.timeout(function () { ghost.style.opacity = 0; }, 1800);
        });
      }
      stage.appendChild(wrap);
      layout();
    }

    /* How much must tray pieces shrink so n of them (size pw x ph) fit in tw x th? */
    function fitK(pwc, phc, tw, th, n) {
      var tgap = 10;
      for (var k = 1; k > 0.2; k -= 0.03) {
        var perRow = Math.floor((tw + tgap) / (pwc * k + tgap));
        if (perRow >= 1 && Math.ceil(n / perRow) * (phc * k + tgap) <= th + tgap) return k;
      }
      return 0.2;
    }

    function layout() {
      var W = stage.clientWidth, H = stage.clientHeight, n = pieces.length + (peek ? 1 : 0);
      var landscape = W >= H;
      wrap.style.flexDirection = landscape ? 'row' : 'column';
      var gap = 14, best = null;
      // Try different board sizes; keep the one where both board and tray pieces stay large.
      for (var f = 0.36; f <= 0.8; f += 0.02) {
        var b = Math.floor(Math.min(landscape ? Math.min(H - 4, (W - gap) * f) : Math.min(W - 4, (H - gap) * f), 640));
        var tw = landscape ? W - b - gap - 4 : W - 4, th = landscape ? H - 4 : H - b - gap - 4;
        if (tw < 40 || th < 40) continue;
        var pwc = b / CFG.cols, phc = b / CFG.rows;
        var k = fitK(pwc, phc, tw, th, n);
        var score = Math.min(pwc, pwc * k / 0.8);
        if (!best || score > best.score + 0.5) best = { b: b, k: k, tw: tw, th: th, score: score };
      }
      B = best.b; traySize = best.k;
      pw = B / CFG.cols; ph = B / CFG.rows;
      board.style.width = board.style.height = B + 'px';
      slots.forEach(function (s) {
        s.style.left = s._c * pw + 'px'; s.style.top = s._r * ph + 'px';
        s.style.width = pw + 'px'; s.style.height = ph + 'px';
      });
      tray.style.width = best.tw + 'px'; tray.style.height = best.th + 'px';
      if (peek) { peek.style.width = pw * traySize + 'px'; peek.style.height = ph * traySize + 'px'; }
      pieces.forEach(function (p) {
        var isPlaced = p.classList.contains('placed');
        sizePiece(p, isPlaced ? 1 : traySize);
        if (isPlaced) placeAt(p);
      });
    }
    ctx.onResize(function () { if (board) layout(); });

    /* Background math: crop the picture to a centred square ("cover"), then cut it. */
    function sizePiece(p, k) {
      var s = Math.max(B / img.w, B / img.h);
      var bw = img.w * s, bh = img.h * s, ox = (bw - B) / 2, oy = (bh - B) / 2;
      p.style.width = pw * k + 'px'; p.style.height = ph * k + 'px';
      p.style.backgroundSize = bw * k + 'px ' + bh * k + 'px';
      p.style.backgroundPosition = -(ox + p._c * pw) * k + 'px ' + -(oy + p._r * ph) * k + 'px';
    }
    function placeAt(p) { p.style.left = p._c * pw + 'px'; p.style.top = p._r * ph + 'px'; }

    function snap(p) {
      p.classList.remove('selected', 'dragging');
      p.style.position = '';
      p.classList.add('placed');
      board.appendChild(p);
      sizePiece(p, 1); placeAt(p);
      ctx.sfx.place();
      ctx.burst(p);
      selected = null;
      placed++;
      if (placed === pieces.length) solved();
    }
    function reject(p) {
      ctx.sfx.oops();
      p.classList.remove('wobble'); void p.offsetWidth; p.classList.add('wobble');
    }

    function solved() {
      busy = true;
      board.classList.add('solved');
      board.firstChild.style.opacity = 0;
      ctx.timeout(function () {
        ctx.sfx.match();
        ctx.say((img.dino ? Dino.i18n.dino(img.dino) + '! ' : '') + ctx.t('praise'));
        ctx.burst(board);
      }, 300);
      round++;
      ctx.progress(round, CFG.rounds);
      ctx.timeout(function () {
        if (round >= CFG.rounds) ctx.complete();
        else loadRound();
      }, 2400);
    }

    /* ---------- interaction ---------- */
    function slotAt(x, y) {
      var r = board.getBoundingClientRect();
      if (x < r.left || y < r.top || x > r.right || y > r.bottom) return null;
      var c = Math.min(CFG.cols - 1, Math.floor((x - r.left) / pw)), rr = Math.min(CFG.rows - 1, Math.floor((y - r.top) / ph));
      return slots[rr * CFG.cols + c];
    }

    function bindSlot(s) {
      ctx.on(s, 'click', function () {
        if (!selected || busy) return;
        if (selected._i === s._i) snap(selected);
        else { reject(selected); }
      });
    }

    function bindPiece(p) {
      var start = null, moved = false, offX = 0, offY = 0, ghostPos = null;
      ctx.on(p, 'pointerdown', function (e) {
        if (busy || p.classList.contains('placed')) return;
        e.preventDefault();
        start = [e.clientX, e.clientY]; moved = false;
        try { p.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      });
      ctx.on(p, 'pointermove', function (e) {
        if (!start) return;
        if (!moved && Math.hypot(e.clientX - start[0], e.clientY - start[1]) < 10) return;
        if (!moved) {
          moved = true;
          var r = p.getBoundingClientRect();
          // Grow to full size around the finger while dragging.
          var fx = (start[0] - r.left) / r.width, fy = (start[1] - r.top) / r.height;
          ghostPos = ctx.h('<div class="pz-piece slot-hidden"></div>');
          ghostPos.style.width = r.width + 'px'; ghostPos.style.height = r.height + 'px';
          tray.insertBefore(ghostPos, p);
          p.classList.add('dragging');
          sizePiece(p, 1);
          offX = fx * pw; offY = fy * ph;
          // (The piece stays in the tray DOM-wise – moving it would drop the pointer capture.)
          if (selected && selected !== p) selected.classList.remove('selected');
          selected = null;
        }
        p.style.left = (e.clientX - offX) + 'px';
        p.style.top = (e.clientY - offY) + 'px';
        var s = slotAt(e.clientX, e.clientY);
        slots.forEach(function (x) { x.classList.toggle('glow', x === s); });
      });
      function end(e) {
        if (!start) return;
        start = null;
        slots.forEach(function (x) { x.classList.remove('glow'); });
        if (!moved) { // a tap: select / unselect
          ctx.sfx.tap();
          if (selected === p) { p.classList.remove('selected'); selected = null; return; }
          if (selected) selected.classList.remove('selected');
          selected = p; p.classList.add('selected');
          return;
        }
        // Use the centre of the piece – more forgiving than the fingertip.
        var r = p.getBoundingClientRect();
        var s = slotAt(r.left + r.width / 2, r.top + r.height / 2);
        if (s && s._i === p._i) {
          ghostPos.remove(); ghostPos = null;
          snap(p);
        } else {
          p.classList.remove('dragging');
          p.style.left = p.style.top = '';
          sizePiece(p, traySize);
          tray.insertBefore(p, ghostPos); ghostPos.remove(); ghostPos = null;
          if (s) reject(p);
        }
      }
      ctx.on(p, 'pointerup', end);
      ctx.on(p, 'pointercancel', end);
      ctx.on(p, 'lostpointercapture', end);
    }

  }
};

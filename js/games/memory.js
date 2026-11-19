/* Memory cards – flip two cards, find matching dinosaurs. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.memory = {
  id: 'memory', color: '#ff7eb3', dark: '#c2457c',

  start: function (ctx) {
    var CFG = {
      easy:   { pairs: 3, preview: 2500, rounds: 2 },
      medium: { pairs: 4, preview: 1500, rounds: 2 },
      hard:   { pairs: 6, preview: 0,    rounds: 2 }
    }[ctx.level];
    var A = ctx.art, stage = ctx.stage;
    var round = 0, grid, cards, first, lock, matched;

    ctx.progress(0, CFG.rounds);
    ctx.instruct('memory_inst');
    newBoard();

    function newBoard() {
      stage.innerHTML = '';
      var types = ctx.shuffle(A.DINOS).slice(0, CFG.pairs);
      var deck = ctx.shuffle(types.concat(types));
      grid = ctx.h('<div class="mem-grid"></div>');
      cards = deck.map(function (type) {
        var c = ctx.h('<div class="card"><div class="card-inner">' +
          '<div class="card-face card-back">' + A.footprint() + '</div>' +
          '<div class="card-face card-front">' + A.dino(type) + '</div></div></div>');
        c._type = type;
        ctx.on(c, 'click', function () { tap(c); });
        grid.appendChild(c);
        return c;
      });
      stage.appendChild(grid);
      layout();
      first = null; matched = 0; lock = true;

      if (CFG.preview) {
        // Show all cards for a moment so the little player can memorise them.
        ctx.timeout(function () { cards.forEach(function (c) { c.classList.add('up'); }); ctx.sfx.flip(); }, 400);
        ctx.timeout(function () { cards.forEach(function (c) { c.classList.remove('up'); }); ctx.sfx.flip(); }, 400 + CFG.preview);
        ctx.timeout(function () { lock = false; }, 900 + CFG.preview);
      } else {
        lock = false;
      }
    }

    /* Pick the column count that gives the biggest cards for this screen. */
    function layout() {
      var W = stage.clientWidth, H = stage.clientHeight, n = cards.length, gap = Math.max(8, Math.min(W, H) * 0.025);
      var ratio = 0.8, best = null;
      for (var cols = 1; cols <= n; cols++) {
        var rows = Math.ceil(n / cols);
        var cw = Math.min((W - gap * (cols - 1)) / cols, ((H - gap * (rows - 1)) / rows) * ratio);
        if (!best || cw > best.cw) best = { cols: cols, cw: cw };
      }
      var cw = Math.min(best.cw, 210), ch = cw / ratio;
      grid.style.gridTemplateColumns = 'repeat(' + best.cols + ', ' + cw + 'px)';
      grid.style.gridAutoRows = ch + 'px';
      grid.style.gap = gap + 'px';
    }
    ctx.onResize(function () { if (grid) layout(); });

    function tap(c) {
      if (lock || c.classList.contains('up')) return;
      c.classList.add('up');
      ctx.sfx.flip();
      ctx.say(Dino.i18n.dino(c._type), { noCaption: true });
      if (!first) { first = c; return; }
      var a = first, b = c;
      first = null;
      lock = true;
      if (a._type === b._type) {
        ctx.timeout(function () {
          ctx.sfx.match();
          ctx.praise(b);
          a.classList.add('matched'); b.classList.add('matched');
          matched++;
          lock = false;
          if (matched === CFG.pairs) {
            round++;
            ctx.progress(round, CFG.rounds);
            ctx.timeout(function () {
              if (round >= CFG.rounds) ctx.complete();
              else newBoard();
            }, 1400);
          }
        }, 450);
      } else {
        ctx.timeout(function () {
          ctx.sfx.oops();
          a.classList.remove('up'); b.classList.remove('up');
          lock = false;
        }, 1200);
      }
    }
  }
};

/* Big & small – tap the big / small one; on hard, tap them in order from smallest to biggest. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.size = {
  id: 'size', color: '#ff8a65', dark: '#c4502d',

  start: function (ctx) {
    var CFG = {
      easy:   { scales: [1, 0.5],              rounds: 5, ask: ['size_big', 'size_small'] },
      medium: { scales: [1, 0.68, 0.42],       rounds: 5, ask: ['size_biggest', 'size_smallest'] },
      hard:   { scales: [1, 0.76, 0.54, 0.34], rounds: 4, ask: ['size_order'] }
    }[ctx.level];
    var A = ctx.art, stage = ctx.stage;
    var round = 0, lock, items, row, question, nextIdx, type;

    ctx.progress(0, CFG.rounds);
    newRound();

    function newRound() {
      stage.innerHTML = '';
      lock = false; nextIdx = 0;
      type = A.DINOS[ctx.rand(0, A.DINOS.length - 1)];
      question = CFG.ask[ctx.rand(0, CFG.ask.length - 1)];
      row = ctx.h('<div class="size-row"></div>');
      // order of scales on screen is shuffled; rank 0 = smallest
      var sorted = CFG.scales.slice().sort(function (a, b) { return a - b; });
      items = ctx.shuffle(CFG.scales).map(function (s) {
        var b = ctx.h('<button class="size-item">' + A.dino(type) + '</button>');
        b._scale = s; b._rank = sorted.indexOf(s);
        ctx.on(b, 'click', function () { pick(b); });
        row.appendChild(b);
        return b;
      });
      stage.appendChild(row);
      layout();
      ctx.instruct(question);
    }

    function layout() {
      if (!row) return;
      var W = stage.clientWidth - 20, H = stage.clientHeight - 20, sum = 0;
      CFG.scales.forEach(function (s) { sum += s; });
      var gaps = 16 * (CFG.scales.length - 1);
      var base = Math.min((W - gaps) / sum, (H * 0.95) / 0.9, 420);
      items.forEach(function (b) { b.style.width = base * b._scale + 'px'; b.style.height = base * b._scale * 0.9 + 'px'; });
    }
    ctx.onResize(layout);

    function wrong(b) {
      ctx.sfx.oops();
      b.classList.remove('wobble'); void b.offsetWidth; b.classList.add('wobble');
      ctx.tryAgain();
    }

    function pick(b) {
      if (lock || b.classList.contains('done')) return;
      var last = CFG.scales.length - 1;
      if (question === 'size_order') {
        if (b._rank !== nextIdx) return wrong(b);
        nextIdx++;
        b.classList.add('done');
        b.appendChild(ctx.h('<span class="size-badge">' + nextIdx + '</span>'));
        ctx.sfx.pop();
        ctx.say(Dino.i18n.number(nextIdx), { noCaption: true });
        if (nextIdx <= last) return;
      } else {
        var want = (question === 'size_big' || question === 'size_biggest') ? last : 0;
        if (b._rank !== want) return wrong(b);
        b.classList.add('done');
      }
      lock = true;
      ctx.timeout(function () {
        ctx.sfx.match();
        ctx.sfx.voice(type);
        items.forEach(function (x) { x.classList.add('jump'); });
        ctx.praise(b);
      }, 350);
      round++;
      ctx.timeout(function () { ctx.progress(round, CFG.rounds); }, 800);
      ctx.timeout(function () { if (round >= CFG.rounds) ctx.complete(); else newRound(); }, 2200);
    }
  }
};

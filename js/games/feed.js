/* Feed the dino – the hungry dino asks for a colour (and on hard, how many). */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.feed = {
  id: 'feed', color: '#9ccc65', dark: '#5f8f2a',

  start: function (ctx) {
    var CFG = {
      easy:   { foods: 3, count: false, rounds: 5 },
      medium: { foods: 5, count: false, rounds: 5 },
      hard:   { foods: 7, count: true,  rounds: 4 }
    }[ctx.level];
    var A = ctx.art, stage = ctx.stage, I = Dino.i18n;
    var COLS = ['red', 'yellow', 'green', 'purple', 'orange', 'blue'];
    // where the mouth is, as a fraction of the dino picture
    var MOUTH = { bronto: [0.92, 0.22], trex: [0.88, 0.36], trice: [0.95, 0.64], stego: [0.95, 0.72], ptero: [0.7, 0.36], ankylo: [0.95, 0.68] };
    var round = 0, lock, want, need, given, dinoType, dinoEl, plate, prevWant;

    ctx.progress(0, CFG.rounds);
    newRound();

    function newRound() {
      stage.innerHTML = '';
      lock = false; given = 0;
      dinoType = A.DINOS[ctx.rand(0, A.DINOS.length - 1)];
      do { want = COLS[ctx.rand(0, COLS.length - 1)]; } while (want === prevWant);
      prevWant = want;
      var list;
      if (!CFG.count) {
        need = 1;
        list = ctx.shuffle(COLS.filter(function (c) { return c !== want; })).slice(0, CFG.foods - 1).concat([want]);
      } else {
        need = ctx.rand(2, 4);
        list = [];
        for (var i = 0; i < need; i++) list.push(want);
        var others = COLS.filter(function (c) { return c !== want; });
        while (list.length < CFG.foods) list.push(others[ctx.rand(0, others.length - 1)]);
      }
      list = ctx.shuffle(list);

      var wrap = ctx.h('<div class="feed-wrap"><div class="feed-top">' +
        '<div class="feed-dino">' + A.dino(dinoType) + '</div>' +
        '<div class="bubble"><span class="want-food">' + A.FOODS[want] + '</span>' + (CFG.count ? '<b>× ' + need + '</b>' : '') + '</div>' +
        '</div><div class="plate"></div></div>');
      dinoEl = wrap.querySelector('.feed-dino');
      plate = wrap.querySelector('.plate');
      list.forEach(function (c, i) {
        var f = ctx.h('<button class="food" style="animation-delay:' + (i * 60) + 'ms">' + A.FOODS[c] + '</button>');
        ctx.on(f, 'click', function () { pick(f, c); });
        plate.appendChild(f);
      });
      stage.appendChild(wrap);
      layout();
      var text = CFG.count ? ctx.t('feed_count', { n: I.number(need), colors: I.colors(want) })
                           : ctx.t('feed_want', { color: I.color(want) });
      ctx.instructText(text);
    }

    function layout() {
      if (!plate) return;
      var W = stage.clientWidth, H = stage.clientHeight;
      var landscape = W > H * 1.15;
      stage.firstChild.classList.toggle('side', landscape);
      var n = plate.children.length;
      var pw = landscape ? W * 0.52 : W, ph = landscape ? H : H * 0.45;
      var best = 0;
      for (var cols = 1; cols <= n; cols++) {
        var rows = Math.ceil(n / cols);
        var s = Math.min((pw - 14 * cols - 20) / cols, (ph - 14 * rows - 20) / rows);
        if (s > best) best = s;
      }
      plate.style.setProperty('--fs', Math.min(best, 130) + 'px');
    }
    ctx.onResize(layout);

    function fly(f) {
      var r = f.getBoundingClientRect(), d = dinoEl.getBoundingClientRect(), m = MOUTH[dinoType];
      var c = f.cloneNode(true);
      c.className = 'food flying';
      c.style.left = r.left + 'px'; c.style.top = r.top + 'px'; c.style.width = r.width + 'px'; c.style.height = r.height + 'px';
      document.body.appendChild(c);
      var tx = d.left + d.width * m[0] - r.left - r.width / 2, ty = d.top + d.height * m[1] - r.top - r.height / 2;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { c.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(.25)'; c.style.opacity = '0.3'; });
      });
      setTimeout(function () { c.remove(); }, 650);
      f.style.visibility = 'hidden';
      ctx.timeout(function () {
        ctx.sfx.munch();
        dinoEl.classList.remove('chew'); void dinoEl.offsetWidth; dinoEl.classList.add('chew');
      }, 550);
    }

    function pick(f, c) {
      if (lock || f.style.visibility === 'hidden') return;
      if (c !== want) {
        ctx.sfx.oops();
        f.classList.remove('wobble'); void f.offsetWidth; f.classList.add('wobble');
        ctx.say(ctx.t('feed_not', { color: I.color(want) }));
        return;
      }
      given++;
      fly(f);
      if (CFG.count) ctx.say(I.number(given), { noCaption: true });
      if (given < need) return;
      lock = true;
      ctx.timeout(function () {
        ctx.sfx.voice(dinoType);
        dinoEl.classList.add('jump');
        ctx.say(ctx.t('feed_yum') + ' ' + ctx.t('praise'));
        ctx.burst(dinoEl);
      }, 1000);
      round++;
      ctx.timeout(function () { ctx.progress(round, CFG.rounds); }, 1300);
      ctx.timeout(function () { if (round >= CFG.rounds) ctx.complete(); else newRound(); }, 3000);
    }
  }
};

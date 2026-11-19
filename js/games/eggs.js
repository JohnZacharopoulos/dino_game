/* Count the eggs – tap eggs to count them aloud, then pick the right number.
 * Right answer: the eggs hatch into baby dinos. Wrong answer: we count together. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.eggs = {
  id: 'eggs', color: '#6cc3f5', dark: '#2b7fb3',

  start: function (ctx) {
    var CFG = {
      easy:   { min: 1, max: 3,  rounds: 5, dots: true },
      medium: { min: 2, max: 5,  rounds: 5, dots: true },
      hard:   { min: 4, max: 10, rounds: 5, dots: false }
    }[ctx.level];
    var A = ctx.art, stage = ctx.stage, I = Dino.i18n;
    var round = 0, answer = 0, prev = 0, eggs, counted, lock, row, nums;

    ctx.progress(0, CFG.rounds);
    newRound(true);

    function newRound(first) {
      stage.innerHTML = '';
      do { answer = ctx.rand(CFG.min, CFG.max); } while (answer === prev && CFG.max > CFG.min);
      prev = answer;
      counted = 0; lock = false;

      var wrap = ctx.h('<div class="eggs-wrap"><div class="nest-area"><div class="nest-bed"></div><div class="egg-row"></div></div><div class="num-row"></div></div>');
      row = wrap.querySelector('.egg-row');
      nums = wrap.querySelector('.num-row');
      eggs = [];
      for (var i = 0; i < answer; i++) {
        var colors = A.EGG_COLORS[ctx.rand(0, A.EGG_COLORS.length - 1)];
        var e = ctx.h('<div class="egg">' + A.egg(colors) + '</div>');
        e._colors = colors;
        e.style.animation = 'popIn .4s ' + (i * 60) + 'ms cubic-bezier(.3,1.6,.6,1) both';
        (function (egg) { ctx.on(egg, 'click', function () { countEgg(egg); }); })(e);
        row.appendChild(e);
        eggs.push(e);
      }

      choices(answer).forEach(function (n) {
        var dots = '';
        if (CFG.dots) { dots = '<span class="dots">'; for (var k = 0; k < n; k++) dots += '<i></i>'; dots += '</span>'; }
        var b = ctx.h('<button class="num-btn">' + n + dots + '</button>');
        b._n = n;
        ctx.on(b, 'click', function () { choose(b); });
        nums.appendChild(b);
      });

      stage.appendChild(wrap);
      layout();
      ctx.instruct('eggs_inst');
    }

    function choices(n) {
      var set = [n], cand = [];
      for (var d = 1; d <= 3; d++) { cand.push(n - d, n + d); }
      cand = cand.filter(function (x) { return x >= 1 && x <= Math.max(CFG.max, 3); });
      // nearest numbers first (makes it a real counting question), a bit of randomness
      cand.sort(function (a, b) { return Math.abs(a - n) - Math.abs(b - n) || Math.random() - 0.5; });
      for (var i = 0; set.length < 3 && i < cand.length; i++) if (set.indexOf(cand[i]) < 0) set.push(cand[i]);
      return set.sort(function (a, b) { return a - b; });
    }

    function layout() {
      if (!row) return;
      var area = row.parentNode, gap = 10, pad = 20;
      var W = area.clientWidth - pad, H = area.clientHeight - pad, n = eggs.length;
      var best = 0, bestCols = 1;
      for (var cols = 1; cols <= n; cols++) {
        var rows = Math.ceil(n / cols);
        var w = Math.min((W - gap * (cols - 1)) / cols, ((H - gap * (rows - 1)) / rows) / 1.2);
        if (w > best) { best = w; bestCols = cols; }
      }
      best = Math.floor(Math.min(best, 150));
      eggs.forEach(function (e) { e.style.width = best + 'px'; e.style.height = best * 1.2 + 'px'; });
      row.style.maxWidth = (bestCols * best + (bestCols - 1) * gap + pad + 2) + 'px';
    }
    ctx.onResize(layout);

    function badge(egg, n) {
      var b = egg.querySelector('.badge');
      if (!b) { b = ctx.h('<span class="badge"></span>'); egg.appendChild(b); }
      b.textContent = n;
    }

    function countEgg(egg) {
      if (lock) return;
      egg.classList.remove('shake'); void egg.offsetWidth; egg.classList.add('shake');
      if (egg.classList.contains('counted')) { ctx.sfx.tap(); return; }
      counted++;
      egg.classList.add('counted');
      badge(egg, counted);
      ctx.sfx.pop();
      ctx.say(I.number(counted), { noCaption: true, rate: 1 });
    }

    function choose(btn) {
      if (lock) return;
      if (btn._n === answer) {
        lock = true;
        btn.classList.add('right');
        ctx.sfx.match();
        ctx.say(I.number(answer) + '! ' + ctx.t('praise'));
        ctx.burst(btn);
        hatchAll();
      } else {
        lock = true;
        ctx.sfx.oops();
        btn.classList.remove('wobble'); void btn.offsetWidth; btn.classList.add('wobble');
        ctx.timeout(countTogether, 700);
      }
    }

    /* Point at each egg in turn and say the number. */
    function countTogether() {
      ctx.say(ctx.t('eggs_together'));
      eggs.forEach(function (e) {
        e.classList.remove('counted');
        var b = e.querySelector('.badge'); if (b) b.remove();
      });
      counted = 0;
      var step = 1100;
      eggs.forEach(function (e, i) {
        ctx.timeout(function () {
          eggs.forEach(function (x) { x.classList.remove('focus'); });
          e.classList.add('focus', 'counted');
          badge(e, i + 1);
          ctx.sfx.pop();
          ctx.say(I.number(i + 1), { noCaption: true, rate: 1 });
        }, 1600 + i * step);
      });
      ctx.timeout(function () {
        eggs.forEach(function (x) { x.classList.remove('focus'); });
        counted = eggs.length;
        lock = false;
      }, 1600 + eggs.length * step + 200);
    }

    function hatchAll() {
      var gap = Math.max(160, 900 / eggs.length);
      eggs.forEach(function (e, i) {
        ctx.timeout(function () {
          e.innerHTML = A.egg(e._colors, true);
          e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake');
          ctx.sfx.crack();
        }, 700 + i * gap);
        ctx.timeout(function () {
          e.innerHTML = A.hatched(A.DINOS[ctx.rand(0, A.DINOS.length - 1)], e._colors);
          e.classList.add('jump');
          ctx.sfx.pop();
        }, 1100 + i * gap);
      });
      var end = 1100 + eggs.length * gap;
      ctx.timeout(function () { ctx.say(ctx.t('eggs_hatch')); }, end + 100);
      round++;
      ctx.timeout(function () { ctx.progress(round, CFG.rounds); }, end);
      ctx.timeout(function () {
        if (round >= CFG.rounds) ctx.complete();
        else newRound();
      }, end + 2200);
    }
  }
};

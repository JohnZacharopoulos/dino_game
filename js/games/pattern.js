/* Pattern train – the wagons carry dinos in a pattern; what comes next? */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.pattern = {
  id: 'pattern', color: '#9575cd', dark: '#5e3fa3',

  start: function (ctx) {
    var CFG = {
      easy:   { patterns: ['AB'],               shown: 4, choices: 2, rounds: 5 },
      medium: { patterns: ['AB', 'AAB', 'ABB'], shown: 5, choices: 3, rounds: 5 },
      hard:   { patterns: ['ABC', 'AABB', 'ABB', 'AAB'], shown: 6, choices: 3, rounds: 5 }
    }[ctx.level];
    var A = ctx.art, stage = ctx.stage;
    var round = 0, lock, answer, train, gap, wagons;

    ctx.progress(0, CFG.rounds);
    newRound();

    function newRound() {
      stage.innerHTML = '';
      lock = false;
      var pat = CFG.patterns[ctx.rand(0, CFG.patterns.length - 1)];
      var picks = ctx.shuffle(A.DINOS).slice(0, 3);
      var map = { A: picks[0], B: picks[1], C: picks[2] };
      var shown = CFG.shown + ctx.rand(0, 1); // so the answer isn't always the first dino
      var seq = [];
      for (var i = 0; i <= shown; i++) seq.push(map[pat[i % pat.length]]);
      answer = seq[shown];

      var wrap = ctx.h('<div class="q-wrap"><div class="q-main"><div class="train"></div></div><div class="q-choices"></div></div>');
      train = wrap.querySelector('.train');
      train.appendChild(ctx.h('<div class="engine">' + A.ENGINE + '</div>'));
      wagons = [];
      seq.forEach(function (t, i) {
        var w = ctx.h('<div class="wagon' + (i === shown ? ' empty' : '') + '"><div class="cargo">' +
          (i === shown ? '<span class="qmark">?</span>' : A.dino(t)) + '</div><i></i><i></i></div>');
        train.appendChild(w);
        wagons.push(w);
        if (i === shown) gap = w;
      });

      // choices: the pattern's own dinos (+ one more on medium/hard), in random order
      var opts = picks.slice(0, CFG.choices);
      var row = wrap.querySelector('.q-choices');
      ctx.shuffle(opts).forEach(function (t, i) {
        var b = ctx.h('<button class="choice" style="animation-delay:' + (i * 80) + 'ms">' + A.dino(t) + '</button>');
        ctx.on(b, 'click', function () { pick(b, t); });
        row.appendChild(b);
      });
      stage.appendChild(wrap);
      layout();
      ctx.instruct('pattern_inst');
    }

    function layout() {
      if (!train) return;
      var W = train.parentNode.clientWidth - 10, H = train.parentNode.clientHeight;
      var units = wagons.length + 1.1; // engine is a bit wider
      var w = Math.max(40, Math.min(130, W / units - 6, H * 0.9));
      train.style.setProperty('--w', w + 'px');
    }
    ctx.onResize(layout);

    function pick(btn, t) {
      if (lock) return;
      if (t !== answer) {
        ctx.sfx.oops();
        btn.classList.remove('wobble'); void btn.offsetWidth; btn.classList.add('wobble');
        ctx.tryAgain();
        return;
      }
      lock = true;
      btn.classList.add('right');
      gap.classList.remove('empty');
      gap.querySelector('.cargo').innerHTML = A.dino(t);
      gap.classList.add('jump');
      ctx.sfx.match();
      ctx.praise(gap);
      round++;
      ctx.timeout(function () {
        ctx.sfx.toot();
        train.classList.add('leave');
        ctx.progress(round, CFG.rounds);
      }, 900);
      ctx.timeout(function () { if (round >= CFG.rounds) ctx.complete(); else newRound(); }, 2600);
    }
  }
};

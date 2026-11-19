/* Shadow match – which dinosaur made this shadow? */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.shadow = {
  id: 'shadow', color: '#7986cb', dark: '#3f4c99',

  start: function (ctx) {
    var CFG = {
      easy:   { choices: 2, rounds: 5, flip: false },
      medium: { choices: 3, rounds: 5, flip: false },
      hard:   { choices: 4, rounds: 5, flip: true }  // the shadow may face the other way
    }[ctx.level];
    var A = ctx.art, stage = ctx.stage;
    var round = 0, answer, prev, lock, shadowEl;

    ctx.progress(0, CFG.rounds);
    newRound();

    function newRound() {
      stage.innerHTML = '';
      lock = false;
      var types = ctx.shuffle(A.DINOS.filter(function (d) { return d !== prev; })).slice(0, CFG.choices);
      answer = types[ctx.rand(0, types.length - 1)];
      prev = answer;
      var flip = CFG.flip && Math.random() < 0.5;
      var wrap = ctx.h('<div class="q-wrap"><div class="q-main"><div class="shadow-card' + (flip ? ' mirrored' : '') + '">' +
        '<div class="sh-dark">' + A.dino(answer, 'shadow') + '</div><div class="sh-color">' + A.dino(answer) + '</div></div></div>' +
        '<div class="q-choices"></div></div>');
      shadowEl = wrap.querySelector('.shadow-card');
      var row = wrap.querySelector('.q-choices');
      types.forEach(function (t, i) {
        var b = ctx.h('<button class="choice" style="animation-delay:' + (i * 80) + 'ms">' + A.dino(t) + '</button>');
        ctx.on(b, 'click', function () { pick(b, t); });
        row.appendChild(b);
      });
      stage.appendChild(wrap);
      layout();
      ctx.instruct('shadow_inst');
    }

    function layout() {
      if (!shadowEl) return;
      var m = shadowEl.parentNode, w = Math.min(m.clientWidth * 0.94, m.clientHeight * 0.96 * 10 / 9, 440);
      shadowEl.style.width = w + 'px'; shadowEl.style.height = w * 0.9 + 'px';
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
      shadowEl.classList.add('revealed');
      ctx.sfx.match();
      ctx.say(Dino.i18n.dino(answer) + '! ' + ctx.t('praise'));
      ctx.burst(shadowEl);
      round++;
      ctx.timeout(function () { ctx.progress(round, CFG.rounds); }, 600);
      ctx.timeout(function () { if (round >= CFG.rounds) ctx.complete(); else newRound(); }, 2200);
    }
  }
};

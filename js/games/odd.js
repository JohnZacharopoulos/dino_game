/* Odd one out – which one is different?
 * easy: a different dinosaur · medium: same dinosaur, different colour · hard: same, but facing the other way */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.odd = {
  id: 'odd', color: '#4db6ac', dark: '#1f7a70',

  start: function (ctx) {
    var CFG = {
      easy:   { n: 3, rounds: 5, kind: 'type' },
      medium: { n: 4, rounds: 5, kind: 'color' },
      hard:   { n: 5, rounds: 5, kind: 'mirror' }
    }[ctx.level];
    var A = ctx.art, stage = ctx.stage;
    var round = 0, lock;

    ctx.progress(0, CFG.rounds);
    newRound();

    function newRound() {
      stage.innerHTML = '';
      lock = false;
      var pair = ctx.shuffle(A.DINOS);
      var main = pair[0], other = pair[1];
      var oddIndex = ctx.rand(0, CFG.n - 1);
      // pick a colour clearly different from the dinosaur's own colour
      var own = { bronto: 100, trex: 30, trice: 205, stego: 50, ptero: 270, ankylo: 165 }[main];
      var otherHue = (own + ctx.rand(100, 260)) % 360;
      var wrap = ctx.h('<div class="odd-row"></div>');
      for (var i = 0; i < CFG.n; i++) {
        var isOdd = i === oddIndex, art;
        if (!isOdd) art = A.dino(main);
        else if (CFG.kind === 'type') art = A.dino(other);
        else if (CFG.kind === 'color') art = A.dino(main, A.hue(otherHue));
        else art = A.dino(main);
        var b = ctx.h('<button class="choice' + (isOdd && CFG.kind === 'mirror' ? ' mirrored' : '') + '" style="animation-delay:' + (i * 70) + 'ms">' + art + '</button>');
        (function (b, isOdd) { ctx.on(b, 'click', function () { pick(b, isOdd); }); })(b, isOdd);
        wrap.appendChild(b);
      }
      stage.appendChild(wrap);
      ctx.instruct('odd_inst');
    }

    function pick(btn, isOdd) {
      if (lock) return;
      if (!isOdd) {
        ctx.sfx.oops();
        btn.classList.remove('wobble'); void btn.offsetWidth; btn.classList.add('wobble');
        ctx.tryAgain();
        return;
      }
      lock = true;
      btn.classList.add('right', 'jump');
      ctx.sfx.match();
      ctx.praise(btn);
      round++;
      ctx.timeout(function () { ctx.progress(round, CFG.rounds); }, 600);
      ctx.timeout(function () { if (round >= CFG.rounds) ctx.complete(); else newRound(); }, 1900);
    }
  }
};

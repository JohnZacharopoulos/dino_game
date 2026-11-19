/* Dino sounds – free play: tap a dinosaur to hear its voice; the music button starts a dance party. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.sounds = {
  id: 'sounds', color: '#f06292', dark: '#a82a5a', free: true,

  start: function (ctx) {
    var A = ctx.art, stage = ctx.stage;
    var wrap = ctx.h('<div class="sounds-wrap"><div class="sound-grid"></div>' +
      '<button class="icon-btn big go party-btn" aria-label="music">' + A.ICONS.music + '</button></div>');
    var grid = wrap.querySelector('.sound-grid');
    var btns = A.DINOS.map(function (t, i) {
      var b = ctx.h('<button class="sound-dino" style="animation-delay:' + (i * 70) + 'ms">' + A.dino(t) + '</button>');
      ctx.on(b, 'click', function () {
        ctx.sfx.voice(t);
        ctx.say(Dino.i18n.dino(t));
        b.classList.remove('dance', 'jump'); void b.offsetWidth; b.classList.add('jump');
      });
      grid.appendChild(b);
      return b;
    });
    var partying = false;
    ctx.on(wrap.querySelector('.party-btn'), 'click', function () {
      if (partying) return;
      partying = true;
      var len = ctx.sfx.tune() || 3.6;
      btns.forEach(function (b, i) { b.style.animationDelay = (i * 0.1) + 's'; b.classList.add('dance'); });
      ctx.timeout(function () {
        btns.forEach(function (b) { b.classList.remove('dance'); b.style.animationDelay = ''; });
        partying = false;
      }, len * 1000 + 200);
    });
    stage.appendChild(wrap);

    function layout() {
      var W = grid.clientWidth || stage.clientWidth, H = (grid.clientHeight || stage.clientHeight * 0.75);
      var best = { cols: 3, s: 0 };
      for (var cols = 1; cols <= 6; cols++) {
        var rows = Math.ceil(6 / cols);
        var s = Math.min((W - 14 * (cols - 1)) / cols, (H - 14 * (rows - 1)) / rows / 0.9);
        if (s > best.s) best = { cols: cols, s: s };
      }
      grid.style.gridTemplateColumns = 'repeat(' + best.cols + ', ' + Math.min(best.s, 240) + 'px)';
    }
    layout();
    ctx.onResize(layout);
    ctx.instruct('sounds_inst');
  }
};

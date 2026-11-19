/* Dress the dino – free play: choose a dinosaur, its colour and accessories, then take a photo. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.build = {
  id: 'build', color: '#26c6da', dark: '#0e8796', free: true,

  start: function (ctx) {
    var A = ctx.art, stage = ctx.stage;
    var HUES = [null, 0, 30, 55, 120, 200, 270, 320]; // null = the dinosaur's own colours
    var state = { type: 'trex', hue: null, acc: [] };

    var wrap = ctx.h('<div class="build-wrap"><div class="build-stage"><div class="build-dino"></div></div>' +
      '<div class="build-panel"><div class="opt-row types"></div><div class="opt-row hues"></div><div class="opt-row accs"></div>' +
      '<button class="icon-btn big go photo-btn" aria-label="photo">' + A.ICONS.camera + '</button></div></div>');
    var dinoBox = wrap.querySelector('.build-dino');

    A.DINOS.forEach(function (t) {
      var b = ctx.h('<button class="opt">' + A.dino(t) + '</button>');
      b._t = t;
      ctx.on(b, 'click', function () {
        state.type = t; mark('.types', b); render(true);
        ctx.sfx.voice(t);
        ctx.say(Dino.i18n.dino(t), { noCaption: true });
      });
      wrap.querySelector('.types').appendChild(b);
    });
    HUES.forEach(function (h) {
      var bg = h === null ? 'conic-gradient(#7ed957, #ff9f43, #5dade2, #f9d94a, #b388eb, #3fc8a8, #7ed957)' : 'hsl(' + h + ',72%,62%)';
      var b = ctx.h('<button class="opt swatch-opt" style="background:' + bg + '"></button>');
      ctx.on(b, 'click', function () { state.hue = h; mark('.hues', b); render(true); ctx.sfx.paint(); });
      wrap.querySelector('.hues').appendChild(b);
    });
    A.ACC_LIST.forEach(function (k) {
      var b = ctx.h('<button class="opt acc-opt">' + A.accIcon(k) + '</button>');
      ctx.on(b, 'click', function () {
        var i = state.acc.indexOf(k);
        if (i >= 0) state.acc.splice(i, 1); else state.acc.push(k);
        b.classList.toggle('on', i < 0);
        ctx.sfx.pop();
        render(true);
      });
      wrap.querySelector('.accs').appendChild(b);
    });
    ctx.on(wrap.querySelector('.photo-btn'), 'click', photo);

    function mark(sel, b) {
      wrap.querySelectorAll(sel + ' .opt').forEach(function (x) { x.classList.toggle('on', x === b); });
    }
    function render(bounce) {
      dinoBox.innerHTML = A.dressed(state.type, state.hue === null ? undefined : A.hue(state.hue), state.acc);
      if (bounce) { dinoBox.classList.remove('jump'); void dinoBox.offsetWidth; dinoBox.classList.add('jump'); }
    }
    function photo() {
      ctx.sfx.shutter();
      var flash = ctx.h('<div class="flash"></div>');
      wrap.querySelector('.build-stage').appendChild(flash);
      ctx.timeout(function () { flash.remove(); }, 600);
      ctx.timeout(function () {
        ctx.sfx.voice(state.type);
        dinoBox.classList.add('dance');
        ctx.say(ctx.t('build_photo'));
        ctx.burst(dinoBox);
      }, 300);
      ctx.timeout(function () { dinoBox.classList.remove('dance'); }, 2600);
    }

    stage.appendChild(wrap);
    mark('.types', wrap.querySelector('.types .opt:nth-child(2)'));
    mark('.hues', wrap.querySelector('.hues .opt'));
    render(false);

    function layout() { wrap.classList.toggle('side', stage.clientWidth > stage.clientHeight * 1.1); }
    layout();
    ctx.onResize(layout);
    ctx.instruct('build_inst');
  }
};

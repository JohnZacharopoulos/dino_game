/* Colouring – pick a colour, tap a part of the dinosaur to paint it.
 * When all the big parts are painted, the picture comes alive. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.color = {
  id: 'color', color: '#ef5350', dark: '#a82522',

  start: function (ctx) {
    var CFG = {
      easy:   { colors: ['red', 'yellow', 'green', 'blue'], scene: false, rounds: 2 },
      medium: { colors: ['red', 'yellow', 'green', 'blue', 'orange', 'purple'], scene: false, rounds: 2 },
      hard:   { colors: ['red', 'yellow', 'green', 'blue', 'orange', 'purple', 'pink', 'brown'], scene: true, rounds: 2 }
    }[ctx.level];
    var A = ctx.art, stage = ctx.stage, I = Dino.i18n;
    var PLACEHOLDER = ['#fffff1', '#fffff2', '#fffff3', '#fffff4', '#fffff5'];
    var round = 0, current, parts, required, lock, pic, used = [];

    ctx.progress(0, CFG.rounds);
    newRound();

    function newRound() {
      stage.innerHTML = '';
      lock = false;
      var choices = A.DINOS.filter(function (d) { return used.indexOf(d) < 0; });
      var type = choices[ctx.rand(0, choices.length - 1)];
      used.push(type);
      var inner = A.dinoInner(type, 'paint'), art;
      if (CFG.scene) {
        art = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 250">' +
          '<rect width="300" height="250" fill="#f4fbff"/>' +
          '<g stroke="#3a3a3a" stroke-width="3" stroke-linejoin="round">' +
          '<circle cx="252" cy="44" r="26" fill="#fffff5"/>' +
          '<path d="M30 52 C30 38 52 34 58 44 C66 32 88 36 88 50 C98 52 98 66 86 66 L36 66 C24 66 22 54 30 52 Z" fill="#fffff5"/>' +
          '<path d="M0 170 Q80 120 160 160 T300 150 L300 250 L0 250 Z" fill="#fffff5"/>' +
          '<path d="M0 214 Q150 196 300 214 L300 250 L0 250 Z" fill="#fffff5"/></g>' +
          '<svg x="40" y="60" width="220" height="198" viewBox="0 0 200 180">' + inner + '</svg></svg>';
      } else {
        art = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 208 188">' + inner + '</svg>';
      }

      var wrap = ctx.h('<div class="paint-wrap"><div class="paint-pic">' + art + '</div><div class="palette"></div></div>');
      pic = wrap.querySelector('.paint-pic');
      var pal = wrap.querySelector('.palette');
      CFG.colors.forEach(function (c, i) {
        var b = ctx.h('<button class="swatch" style="--sw:' + A.COLORS[c] + '"><span></span></button>');
        b._c = c;
        ctx.on(b, 'click', function () { choose(b); });
        pal.appendChild(b);
        if (i === 0) { current = b; b.classList.add('on'); }
      });
      stage.appendChild(wrap);

      // Find the paintable parts (placeholder fills) and give the outline-less ones an outline.
      parts = [];
      pic.querySelectorAll('[fill]').forEach(function (e) {
        if (PLACEHOLDER.indexOf((e.getAttribute('fill') || '').toLowerCase()) < 0) return;
        e.setAttribute('fill', '#ffffff');
        if (e.getAttribute('stroke') === 'none') { e.setAttribute('stroke', '#3a3a3a'); e.setAttribute('stroke-width', '2'); }
        e.classList.add('paintable');
        ctx.on(e, 'pointerdown', function (ev) { ev.preventDefault(); paint(e); });
        parts.push(e);
      });
      // Only the bigger parts must be painted to finish (tiny spots and teeth are optional).
      required = parts.filter(function (e) {
        try { var b = e.getBBox(); return b.width * b.height > 420; } catch (err) { return true; }
      });
      layout();
      ctx.instruct('color_inst');
    }

    function layout() {
      var w = stage.firstChild;
      if (w) w.classList.toggle('side', stage.clientWidth > stage.clientHeight * 1.1);
    }
    ctx.onResize(layout);

    function choose(b) {
      if (current) current.classList.remove('on');
      current = b; b.classList.add('on');
      ctx.sfx.tap();
      ctx.say(I.color(b._c), { noCaption: true });
    }

    function paint(e) {
      if (lock || !current) return;
      e.setAttribute('fill', A.COLORS[current._c]);
      e._painted = true;
      ctx.sfx.paint();
      if (required.every(function (x) { return x._painted; })) {
        lock = true;
        round++;
        ctx.timeout(function () {
          pic.classList.add('jump');
          ctx.sfx.match();
          ctx.say(ctx.t('color_done'));
          ctx.burst(pic);
        }, 500);
        ctx.timeout(function () { ctx.progress(round, CFG.rounds); }, 1000);
        ctx.timeout(function () { if (round >= CFG.rounds) ctx.complete(); else newRound(); }, 3200);
      }
    }
  }
};

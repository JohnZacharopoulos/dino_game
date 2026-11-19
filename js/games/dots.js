/* Connect the dots – tap 1, 2, 3… in order; the lines make a dinosaur that then appears. */
window.Dino = window.Dino || {};
Dino.games = Dino.games || {};
Dino.games.dots = {
  id: 'dots', color: '#ba68c8', dark: '#7b3289',

  start: function (ctx) {
    var CFG = {
      easy:   { n: 5,  rounds: 3, hint: 0 },     // next dot always glows
      medium: { n: 8,  rounds: 3, hint: 5000 },  // glows after 5 s
      hard:   { n: 10, rounds: 3, hint: -1 }     // no hint
    }[ctx.level];
    var A = ctx.art, stage = ctx.stage, NS = 'http://www.w3.org/2000/svg';
    var round = 0, svg, pts, dots, lines, next, lock, type, hintTimer, prevType;

    ctx.progress(0, CFG.rounds);
    newRound();

    function el(name, attrs) {
      var e = document.createElementNS(NS, name);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }

    function newRound() {
      stage.innerHTML = '';
      lock = false; next = 0;
      do { type = A.DINOS[ctx.rand(0, A.DINOS.length - 1)]; } while (type === prevType);
      prevType = type;
      pts = A.outline(type, CFG.n);
      var wrap = ctx.h('<div class="dots-wrap"><svg class="dots-svg" viewBox="-14 -14 228 208" xmlns="' + NS + '">' +
        '<g class="dots-pic">' + A.dinoInner(type) + '</g><g class="dots-lines"></g><g class="dots-dots"></g></svg></div>');
      stage.appendChild(wrap);
      svg = wrap.querySelector('svg');
      lines = svg.querySelector('.dots-lines');
      var g = svg.querySelector('.dots-dots');
      dots = pts.map(function (p, i) {
        var d = el('g', { 'class': 'dot', transform: 'translate(' + p[0] + ' ' + p[1] + ')' });
        d.appendChild(el('circle', { r: 20, 'class': 'dot-hit' }));
        d.appendChild(el('circle', { r: 9, 'class': 'dot-c' }));
        var t = el('text', { y: 4, 'text-anchor': 'middle' });
        t.textContent = i + 1;
        d.appendChild(t);
        ctx.on(d, 'pointerdown', function (e) { e.preventDefault(); tap(i); });
        g.appendChild(d);
        return d;
      });
      layout();
      glow();
      ctx.instruct('dots_inst');
    }

    /* keep the dots a comfortable finger size whatever the screen size */
    function layout() {
      if (!svg) return;
      var r0 = svg.getBoundingClientRect();
      var scale = Math.min(r0.width / 228, r0.height / 208) || 1; // the picture fits inside the box
      var r = Math.max(9, Math.min(16, 15 / scale));
      dots.forEach(function (d) {
        d.querySelector('.dot-c').setAttribute('r', r);
        d.querySelector('.dot-hit').setAttribute('r', Math.max(r * 1.6, 24 / scale));
        d.querySelector('text').setAttribute('font-size', r * 1.15);
        d.querySelector('text').setAttribute('y', r * 0.4);
      });
    }
    ctx.onResize(layout);

    function glow() {
      dots.forEach(function (d) { d.classList.remove('hint'); });
      clearTimeout(hintTimer);
      if (next >= dots.length || CFG.hint < 0) return;
      if (CFG.hint === 0) dots[next].classList.add('hint');
      else hintTimer = ctx.timeout(function () { dots[next] && dots[next].classList.add('hint'); }, CFG.hint);
    }

    function line(a, b) {
      var l = el('line', { x1: a[0], y1: a[1], x2: a[0], y2: a[1] });
      lines.appendChild(l);
      // grow the line from a to b
      var t0 = null;
      (function grow(ts) {
        if (!ctx.alive()) return;
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / 220);
        l.setAttribute('x2', a[0] + (b[0] - a[0]) * k);
        l.setAttribute('y2', a[1] + (b[1] - a[1]) * k);
        if (k < 1) requestAnimationFrame(grow);
      })(performance.now());
    }

    function tap(i) {
      if (lock) return;
      if (i !== next) {
        if (i < next) return; // already connected
        ctx.sfx.oops();
        var d = dots[i];
        d.classList.remove('nope'); void d.getBBox(); d.classList.add('nope');
        dots[next].classList.add('hint');
        return;
      }
      dots[i].classList.add('done');
      ctx.sfx.pop();
      ctx.say(Dino.i18n.number(i + 1), { noCaption: true });
      if (i > 0) line(pts[i - 1], pts[i]);
      next++;
      if (next < dots.length) { glow(); return; }
      lock = true;
      ctx.timeout(function () { line(pts[pts.length - 1], pts[0]); }, 250);
      ctx.timeout(function () {
        svg.classList.add('complete');
        ctx.sfx.match();
        ctx.sfx.voice(type);
        ctx.say(Dino.i18n.dino(type) + '! ' + ctx.t('praise'));
        ctx.burst(svg);
      }, 700);
      round++;
      ctx.timeout(function () { ctx.progress(round, CFG.rounds); }, 1200);
      ctx.timeout(function () { if (round >= CFG.rounds) ctx.complete(); else newRound(); }, 3300);
    }
  }
};

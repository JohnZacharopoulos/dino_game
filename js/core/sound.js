/* Dino Games – sound effects generated in code with the Web Audio API
 * (no audio files, so nothing can fail to load from the local file system). */
window.Dino = window.Dino || {};
(function (D) {
  'use strict';
  var ctx = null;
  var noiseBuf = null;

  function on() { return ctx && D.store.settings().sound; }

  function tone(freq, dur, o) {
    if (!on()) return;
    o = o || {};
    var t = ctx.currentTime + (o.when || 0);
    var osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    var vol = o.vol == null ? 0.18 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  function noise(dur, o) {
    if (!on()) return;
    o = o || {};
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    var t = ctx.currentTime + (o.when || 0);
    var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf;
    f.type = o.filter || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 1200, t);
    if (o.slide) f.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    f.Q.value = o.q || 1;
    var vol = o.vol == null ? 0.2 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }

  var lastDig = 0;

  D.sfx = {
    /* Must be called from a tap/click (browsers only allow audio after a user gesture). */
    unlock: function () {
      try {
        if (!ctx) {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (AC) ctx = new AC();
        }
        if (ctx && ctx.state === 'suspended') ctx.resume();
      } catch (e) { ctx = null; }
    },
    tap: function () { tone(660, 0.08, { type: 'triangle', vol: 0.12 }); },
    flip: function () { tone(520, 0.09, { type: 'triangle', vol: 0.14, slide: 880 }); },
    pop: function () { tone(400, 0.12, { type: 'sine', vol: 0.2, slide: 900 }); },
    step: function () { tone(300 + Math.random() * 60, 0.07, { type: 'triangle', vol: 0.12 }); },
    bump: function () { tone(160, 0.18, { type: 'sine', vol: 0.22, slide: 90 }); },
    oops: function () {
      tone(330, 0.16, { type: 'triangle', vol: 0.14 });
      tone(247, 0.24, { type: 'triangle', vol: 0.14, when: 0.15 });
    },
    match: function () {
      [523, 659, 784].forEach(function (f, i) { tone(f, 0.18, { type: 'triangle', vol: 0.16, when: i * 0.08 }); });
    },
    place: function () {
      tone(220, 0.1, { type: 'sine', vol: 0.25, slide: 120 });
      tone(880, 0.12, { type: 'triangle', vol: 0.08, when: 0.04 });
    },
    crack: function () { noise(0.12, { freq: 2500, q: 3, vol: 0.3 }); tone(900, 0.05, { type: 'square', vol: 0.04 }); },
    dig: function () {
      var now = Date.now();
      if (now - lastDig < 110) return;
      lastDig = now;
      noise(0.09, { freq: 1800 + Math.random() * 1200, q: 0.8, vol: 0.07 });
    },
    roar: function () {
      noise(0.9, { filter: 'lowpass', freq: 900, slide: 200, q: 2, vol: 0.32 });
      tone(140, 0.8, { type: 'sawtooth', vol: 0.08, slide: 70 });
    },
    fanfare: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.22, { type: 'triangle', vol: 0.16, when: i * 0.12 }); });
      tone(1047, 0.6, { type: 'triangle', vol: 0.14, when: 0.5 });
      tone(784, 0.6, { type: 'sine', vol: 0.1, when: 0.5 });
    }
  };
})(window.Dino);

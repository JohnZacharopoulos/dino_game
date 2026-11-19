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
    munch: function () {
      for (var i = 0; i < 3; i++) noise(0.08, { freq: 900, q: 1.5, vol: 0.25, when: i * 0.16 });
    },
    toot: function () {
      tone(392, 0.25, { type: 'square', vol: 0.07 }); tone(494, 0.25, { type: 'square', vol: 0.07 });
      tone(392, 0.35, { type: 'square', vol: 0.07, when: 0.3 }); tone(494, 0.35, { type: 'square', vol: 0.07, when: 0.3 });
    },
    shutter: function () { noise(0.05, { freq: 3000, q: 0.7, vol: 0.3 }); noise(0.07, { freq: 2000, q: 0.7, vol: 0.25, when: 0.09 }); },
    whoosh: function () { noise(0.25, { freq: 600, slide: 3000, q: 1.2, vol: 0.12 }); },
    jump: function () { tone(300, 0.18, { type: 'triangle', vol: 0.16, slide: 760 }); },
    land: function () { tone(140, 0.06, { type: 'sine', vol: 0.12 }); },
    chomp: function () { tone(330, 0.06, { type: 'triangle', vol: 0.14, slide: 520 }); tone(520, 0.05, { type: 'triangle', vol: 0.1, when: 0.06, slide: 300 }); },
    sparkle: function () { [1047, 1319, 1568, 2093].forEach(function (f, i) { tone(f, 0.15, { type: 'sine', vol: 0.12, when: i * 0.07 }); }); },
    paint: function () { tone(500 + Math.random() * 300, 0.12, { type: 'sine', vol: 0.15, slide: 1200 }); },
    /* A different voice for each dinosaur. */
    voice: function (type) {
      switch (type) {
        case 'trex': this.roar(); break;
        case 'bronto':
          tone(130, 0.7, { type: 'sine', vol: 0.3, slide: 95 });
          tone(196, 0.6, { type: 'triangle', vol: 0.1, slide: 140, when: 0.05 });
          tone(110, 0.8, { type: 'sine', vol: 0.3, slide: 80, when: 0.75 });
          break;
        case 'trice':
          noise(0.18, { filter: 'lowpass', freq: 500, q: 4, vol: 0.4 });
          noise(0.25, { filter: 'lowpass', freq: 420, q: 4, vol: 0.4, when: 0.25 });
          tone(90, 0.4, { type: 'sawtooth', vol: 0.08, when: 0.25 });
          break;
        case 'stego':
          tone(233, 0.22, { type: 'square', vol: 0.09, slide: 207 });
          tone(233, 0.32, { type: 'square', vol: 0.09, slide: 196, when: 0.28 });
          break;
        case 'ptero':
          for (var i = 0; i < 3; i++) tone(900, 0.13, { type: 'sawtooth', vol: 0.07, slide: 1500, when: i * 0.17 });
          break;
        case 'ankylo':
          for (var j = 0; j < 3; j++) { tone(70, 0.22, { type: 'sine', vol: 0.45, slide: 40, when: j * 0.28 }); noise(0.1, { filter: 'lowpass', freq: 300, vol: 0.3, when: j * 0.28 }); }
          break;
      }
    },
    /* A short original tune for the dino dance party. */
    tune: function () {
      var notes = [523, 659, 784, 659, 587, 698, 880, 698, 659, 784, 988, 784, 1047, 784, 1047];
      var lens = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 3];
      var t = 0;
      notes.forEach(function (f, i) {
        tone(f, 0.2 * lens[i], { type: 'triangle', vol: 0.13, when: t });
        if (i % 2 === 0) tone(f / 4, 0.18, { type: 'sine', vol: 0.18, when: t });
        t += 0.2 * lens[i];
      });
      return t;
    },
    fanfare: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.22, { type: 'triangle', vol: 0.16, when: i * 0.12 }); });
      tone(1047, 0.6, { type: 'triangle', vol: 0.14, when: 0.5 });
      tone(784, 0.6, { type: 'sine', vol: 0.1, when: 0.5 });
    }
  };
})(window.Dino);

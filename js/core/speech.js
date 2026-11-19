/* Dino Games – spoken instructions with the browser's built-in text-to-speech.
 * Every spoken line is also shown as a caption bubble, so the game still works
 * on devices that have no voice installed for the chosen language. */
window.Dino = window.Dino || {};
(function (D) {
  'use strict';
  var synth = window.speechSynthesis;
  var voices = [];

  function loadVoices() { try { voices = synth.getVoices() || []; } catch (e) { voices = []; } }
  if (synth) {
    loadVoices();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', loadVoices);
    else synth.onvoiceschanged = loadVoices;
  }

  function score(v, lang) {
    var s = 0, n = (v.name || '').toLowerCase();
    if (/natural|neural|enhanced|premium|online/.test(n)) s += 4;
    if (/google/.test(n)) s += 2;
    if (lang === 'en' && /en[-_](gb|us)/i.test(v.lang)) s += 1;
    if (v.localService) s += 1;
    return s;
  }

  function voiceFor(lang) {
    var list = voices.filter(function (v) {
      return v.lang && v.lang.toLowerCase().replace('_', '-').indexOf(lang) === 0;
    });
    list.sort(function (a, b) { return score(b, lang) - score(a, lang); });
    return list[0] || null;
  }

  var captionTimer = null;
  function caption(text) {
    var el = document.getElementById('caption');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(captionTimer);
    captionTimer = setTimeout(function () { el.classList.remove('show'); }, 1500 + text.length * 60);
  }

  D.speech = {
    voiceFor: voiceFor,
    /* say(text) – speak now, cutting off anything still being said. */
    say: function (text, opts) {
      opts = opts || {};
      if (!text) return;
      if (!opts.noCaption) caption(text);
      if (!synth || !D.store.settings().voice) return;
      var v = voiceFor(D.i18n.lang);
      if (!v) return;
      try {
        if (opts.queue !== true) synth.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.voice = v;
        u.lang = v.lang;
        u.rate = opts.rate || 0.92;
        u.pitch = 1.1;
        synth.speak(u);
      } catch (e) { /* ignore */ }
    },
    stop: function () { try { if (synth) synth.cancel(); } catch (e) { /* ignore */ } },
    available: function () { return !!synth; }
  };
})(window.Dino);

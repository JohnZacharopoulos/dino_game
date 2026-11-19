/* Dino Games – saved settings & stars (browser localStorage; works without it too). */
window.Dino = window.Dino || {};
(function (D) {
  'use strict';
  var KEY = 'dinoGames.v1';

  function defaults() {
    var nav = (navigator.languages || [navigator.language || '']).join(',').toLowerCase();
    return {
      settings: { lang: nav.indexOf('el') === 0 || nav.indexOf(',el') >= 0 ? 'el' : 'en',
                  name: '', voice: true, sound: true },
      stars: {}
    };
  }

  var data = defaults();
  try {
    var saved = JSON.parse(window.localStorage.getItem(KEY) || 'null');
    if (saved && saved.settings) {
      for (var k in saved.settings) data.settings[k] = saved.settings[k];
      data.stars = saved.stars || {};
    }
  } catch (e) { /* storage blocked – keep defaults */ }

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  D.store = {
    settings: function () { return data.settings; },
    set: function (key, value) { data.settings[key] = value; save(); },
    hasStar: function (game, level) { return !!(data.stars[game] && data.stars[game][level]); },
    addStar: function (game, level) {
      data.stars[game] = data.stars[game] || {};
      data.stars[game][level] = true;
      save();
    },
    resetStars: function () { data.stars = {}; save(); }
  };
})(window.Dino);

/* Dino Games – texts in Greek and English.
 * Keys ending in "_n" are used instead of the plain key when the child's name is set
 * ({name} is replaced with it). Arrays mean "pick one at random". */
window.Dino = window.Dino || {};
(function (D) {
  'use strict';

  var S = {
    el: {
      title: 'Δεινο-Παιχνίδια',
      pickLang: 'Διάλεξε γλώσσα!',
      hello: 'Γεια σου! Τι θα παίξουμε;',
      hello_n: 'Γεια σου, {name}! Τι θα παίξουμε;',
      chooseLevel: 'Διάλεξε επίπεδο!',
      easy: 'Εύκολο', medium: 'Μέτριο', hard: 'Δύσκολο',
      g_memory: 'Κάρτες μνήμης', g_maze: 'Λαβύρινθος', g_puzzle: 'Παζλ',
      g_fossil: 'Ανασκαφή', g_eggs: 'Μέτρα τα αυγά',
      memory_inst: 'Βρες τα ίδια ζευγάρια!',
      maze_inst: 'Βοήθησε τον δεινόσαυρο να φτάσει στη φωλιά του!',
      puzzle_inst: 'Βάλε τα κομμάτια στη θέση τους!',
      fossil_inst: 'Τρίψε την άμμο και βρες τον δεινόσαυρο!',
      fossil_inst2: 'Δύο δεινόσαυροι κρύβονται στην άμμο. Βρες τους!',
      fossil_found: 'Είναι {dinoA}!',
      eggs_inst: 'Πόσα αυγά βλέπεις;',
      eggs_together: 'Ας μετρήσουμε μαζί!',
      eggs_hatch: 'Κοίτα! Μωρά δεινοσαυράκια!',
      praise: ['Μπράβο!', 'Τέλεια!', 'Πολύ ωραία!', 'Υπέροχα!', 'Ναι!', 'Εύγε!', 'Καταπληκτικά!'],
      praise_n: ['Μπράβο, {name}!', 'Τέλεια, {name}!', 'Υπέροχα, {name}!', 'Πολύ ωραία, {name}!'],
      tryAgain: ['Ξαναδοκίμασε!', 'Σχεδόν! Ξαναδοκίμασε!'],
      levelDone: 'Τα κατάφερες! Κέρδισες ένα αστέρι!',
      levelDone_n: 'Τα κατάφερες, {name}! Κέρδισες ένα αστέρι!',
      parents: 'Για τους γονείς',
      holdHint: 'Κράτα πατημένο για να ανοίξει',
      nameLabel: 'Όνομα παιδιού – γράψτε το όπως το φωνάζετε (π.χ. «Γιάννη»)',
      language: 'Γλώσσα',
      voice: 'Φωνή', sounds: 'Ήχοι', on: 'Ναι', off: 'Όχι',
      voiceTest: 'Δοκιμή φωνής',
      voiceFound: 'Φωνή συσκευής: {v}',
      voiceMissing: 'Δεν βρέθηκε ελληνική φωνή σε αυτή τη συσκευή – θα εμφανίζονται μόνο τα κείμενα. Δείτε το README για να προσθέσετε φωνή.',
      reset: 'Μηδενισμός αστεριών',
      resetConfirm: 'Να σβηστούν όλα τα αστέρια;',
      close: 'Κλείσιμο',
      numbers: ['μηδέν', 'ένα', 'δύο', 'τρία', 'τέσσερα', 'πέντε', 'έξι', 'εφτά', 'οχτώ', 'εννιά', 'δέκα'],
      dino: { bronto: 'Βροντόσαυρος', trex: 'Τυραννόσαυρος', trice: 'Τρικεράτωψ',
              stego: 'Στεγόσαυρος', ptero: 'Πτερόδακτυλος', ankylo: 'Αγκυλόσαυρος' },
      dinoA: { bronto: 'ένας Βροντόσαυρος', trex: 'ένας Τυραννόσαυρος', trice: 'ένας Τρικεράτωψ',
               stego: 'ένας Στεγόσαυρος', ptero: 'ένας Πτερόδακτυλος', ankylo: 'ένας Αγκυλόσαυρος' }
    },
    en: {
      title: 'Dino Games',
      pickLang: 'Choose a language!',
      hello: 'Hi there! What shall we play?',
      hello_n: 'Hi {name}! What shall we play?',
      chooseLevel: 'Choose a level!',
      easy: 'Easy', medium: 'Medium', hard: 'Hard',
      g_memory: 'Memory cards', g_maze: 'Maze', g_puzzle: 'Puzzle',
      g_fossil: 'Fossil dig', g_eggs: 'Count the eggs',
      memory_inst: 'Find the matching pairs!',
      maze_inst: 'Help the dinosaur get to its nest!',
      puzzle_inst: 'Put the pieces in their places!',
      fossil_inst: 'Rub away the sand to find the dinosaur!',
      fossil_inst2: 'Two dinosaurs are hiding in the sand. Find them!',
      fossil_found: "It's {dinoA}!",
      eggs_inst: 'How many eggs do you see?',
      eggs_together: "Let's count together!",
      eggs_hatch: 'Look! Baby dinosaurs!',
      praise: ['Great job!', 'Awesome!', 'Well done!', 'Super!', 'Yes!', 'Brilliant!', 'Fantastic!'],
      praise_n: ['Great job, {name}!', 'Awesome, {name}!', 'Well done, {name}!', 'Super, {name}!'],
      tryAgain: ['Try again!', 'Almost! Try again!'],
      levelDone: 'You did it! You won a star!',
      levelDone_n: 'You did it, {name}! You won a star!',
      parents: 'For parents',
      holdHint: 'Press and hold to open',
      nameLabel: "Child's name",
      language: 'Language',
      voice: 'Voice', sounds: 'Sounds', on: 'On', off: 'Off',
      voiceTest: 'Test voice',
      voiceFound: 'Device voice: {v}',
      voiceMissing: 'No English voice found on this device – only text captions will show.',
      reset: 'Reset stars',
      resetConfirm: 'Erase all stars?',
      close: 'Close',
      numbers: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
      dino: { bronto: 'Brontosaurus', trex: 'Tyrannosaurus Rex', trice: 'Triceratops',
              stego: 'Stegosaurus', ptero: 'Pterodactyl', ankylo: 'Ankylosaurus' },
      dinoA: { bronto: 'a Brontosaurus', trex: 'a Tyrannosaurus Rex', trice: 'a Triceratops',
               stego: 'a Stegosaurus', ptero: 'a Pterodactyl', ankylo: 'an Ankylosaurus' }
    }
  };

  function pick(v) { return Array.isArray(v) ? v[Math.floor(Math.random() * v.length)] : v; }

  D.i18n = {
    lang: 'el',
    raw: function (key) {
      var s = S[this.lang][key];
      return s === undefined ? S.en[key] : s;
    },
    /* t('praise') – uses the "_n" variant when a name is set (half the time for arrays,
       so the name isn't repeated on every single tap). */
    t: function (key, vars) {
      vars = vars || {};
      var name = D.store ? D.store.settings().name : '';
      var s;
      var withName = S[this.lang][key + '_n'];
      if (name && withName !== undefined && (!Array.isArray(withName) || Math.random() < 0.5)) {
        s = pick(withName);
        vars.name = name;
      } else {
        s = pick(this.raw(key));
      }
      if (typeof s !== 'string') return key;
      return s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : ''; });
    },
    number: function (n) { return this.raw('numbers')[n] || String(n); },
    dino: function (type) { return this.raw('dino')[type]; },
    dinoA: function (type) { return this.raw('dinoA')[type]; }
  };
})(window.Dino);
